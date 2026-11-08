"""Dependency-free CDP Slow 3G observation against the local audit server.

Start a dedicated Chrome with --remote-debugging-port=9223 first.
This measures one cold mobile navigation, not Lighthouse or a field benchmark.
"""
import base64
import json
import os
from pathlib import Path
import socket
import struct
import time
import urllib.request
from urllib.parse import urlsplit

OUT = Path(__file__).resolve().parent

class CDP:
    def __init__(self, url):
        u = urlsplit(url)
        self.sock = socket.create_connection((u.hostname, u.port), timeout=30)
        key = base64.b64encode(os.urandom(16)).decode()
        self.sock.sendall((f'GET {u.path} HTTP/1.1\r\nHost: {u.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
        header = b''
        while not header.endswith(b'\r\n\r\n'):
            header += self.sock.recv(1)
        if not header.startswith(b'HTTP/1.1 101 '):
            raise RuntimeError(header.decode())
        self.serial, self.events = 0, []

    def read(self, count):
        data = b''
        while len(data) < count:
            chunk = self.sock.recv(count-len(data))
            if not chunk:
                raise EOFError('Chrome closed the socket')
            data += chunk
        return data

    def message(self):
        first, second = self.read(2)
        size = second & 127
        if size == 126:
            size = struct.unpack('!H', self.read(2))[0]
        elif size == 127:
            size = struct.unpack('!Q', self.read(8))[0]
        mask = self.read(4) if second & 128 else None
        data = self.read(size)
        if mask:
            data = bytes(v ^ mask[i % 4] for i, v in enumerate(data))
        if first & 15 == 8:
            raise EOFError('WebSocket closed')
        return json.loads(data)

    def call(self, method, **params):
        self.serial += 1
        data = json.dumps({'id':self.serial, 'method':method, 'params':params}).encode()
        mask = os.urandom(4)
        size = len(data)
        header = bytes([129, 128 | size]) if size < 126 else bytes([129, 254])+struct.pack('!H',size)
        self.sock.sendall(header+mask+bytes(v ^ mask[i % 4] for i,v in enumerate(data)))
        while True:
            item = self.message()
            if item.get('id') == self.serial:
                if 'error' in item:
                    raise RuntimeError(item['error'])
                return item.get('result', {})
            self.events.append(item)

    def evaluate(self, expression):
        return self.call('Runtime.evaluate', expression=expression, returnByValue=True)['result'].get('value')

if __name__ == "__main__":
    with urllib.request.urlopen('http://127.0.0.1:9223/json') as response:
        target = next(t for t in json.load(response) if t['type']=='page')
    c = CDP(target['webSocketDebuggerUrl'])
    for domain in ['Page','Network','Runtime','Log']:
        c.call(domain+'.enable')
    c.call('Network.setCacheDisabled', cacheDisabled=True)
    c.call('Network.clearBrowserCache')
    c.call('Emulation.setDeviceMetricsOverride', width=390, height=844, deviceScaleFactor=1, mobile=True)
    c.call('Network.emulateNetworkConditions', offline=False, latency=400, downloadThroughput=62500, uploadThroughput=62500, connectionType='cellular3g')
    c.call('Page.addScriptToEvaluateOnNewDocument', source="window.auditLCP=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>auditLCP.push({time:e.startTime,size:e.size,url:e.url,tag:e.element?.tagName}))).observe({type:'largest-contentful-paint',buffered:true});")
    c.call('Page.navigate', url='http://127.0.0.1:8766/index.html')
    start = time.monotonic()
    observations = []
    for checkpoint in [2, 5, 10, 20, 30]:
        time.sleep(max(0, checkpoint-(time.monotonic()-start)))
        observations.append(c.evaluate("({elapsed:performance.now(),ready:document.readyState,fonts:document.fonts.status,heading:!!document.querySelector('h1'),paint:performance.getEntriesByType('paint').map(p=>({name:p.name,time:p.startTime})),images:[...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0&&!i.closest('[inert]')).map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),lcp:window.auditLCP||[]})"))
        shot=c.call('Page.captureScreenshot', format='png')['data']
        (OUT/f'slow-3g-{checkpoint}s.png').write_bytes(base64.b64decode(shot))
    resources=c.evaluate("performance.getEntriesByType('resource').map(r=>({url:r.name,type:r.initiatorType,start:r.startTime,duration:r.duration,transfer:r.transferSize,body:r.encodedBodySize}))")
    issues=[e for e in c.events if e.get('method') in ['Network.loadingFailed','Runtime.exceptionThrown'] or (e.get('method')=='Log.entryAdded' and e['params']['entry']['level']=='error')]
    result={'settings':{'width':390,'height':844,'dpr':1,'latencyMs':400,'downloadBytesPerSecond':62500,'uploadBytesPerSecond':62500,'cacheDisabled':True,'cpuThrottle':False},'observations':observations,'resources':resources,'errors':issues}
    (OUT/'slow-3g-results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result,indent=2))
    c.call('Browser.close')
