from slow_network import CDP, OUT
import json,time,urllib.request,sys,base64
label=sys.argv[1] if len(sys.argv)>1 else 'after'
with urllib.request.urlopen('http://127.0.0.1:9223/json') as response:
 c=CDP(next(t for t in json.load(response) if t['type']=='page')['webSocketDebuggerUrl'])
c.call('Page.enable');c.call('Runtime.enable')
c.call('Emulation.setEmulatedMedia',features=[{'name':'prefers-reduced-motion','value':'reduce'}])
rows=[]
for width in [360,390,430,768,1440]:
 c.call('Emulation.setDeviceMetricsOverride',width=width,height=844,deviceScaleFactor=1,mobile=False)
 c.call('Page.navigate',url='http://127.0.0.1:8766/index.html')
 for _ in range(100):
  if c.evaluate("document.readyState==='complete'&&document.fonts.status==='loaded'"):break
  time.sleep(.1)
 c.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
 time.sleep(2)
 r=c.evaluate("({height:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth,innerWidth,header:document.querySelector('header').getBoundingClientRect().height,hero:document.querySelector('[data-hero-slider]').getBoundingClientRect().height,servicesTop:document.querySelector('#services').getBoundingClientRect().top,footer:document.querySelector('footer').getBoundingClientRect().height,sections:[...document.querySelectorAll('main>section')].map(e=>({id:e.id,height:e.getBoundingClientRect().height})),errors:window.auditErrors||[]})")
 r['width']=width;rows.append(r)
 (OUT/f'phone-{label}-{width}.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',format='png')['data']))
(OUT/f'phone-{label}.json').write_text(json.dumps(rows,indent=2));print(json.dumps(rows,indent=2));c.call('Browser.close')
