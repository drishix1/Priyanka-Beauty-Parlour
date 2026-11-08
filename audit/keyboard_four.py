"""Chrome-level keyboard input checks, using the local dedicated CDP browser."""
from slow_network import CDP, OUT
import json
import time
import urllib.request

with urllib.request.urlopen('http://127.0.0.1:9223/json') as response:
    c = CDP(next(t for t in json.load(response) if t['type']=='page')['webSocketDebuggerUrl'])
c.call('Page.enable')
c.call('Runtime.enable')
c.call('Emulation.setEmulatedMedia', features=[{'name':'prefers-reduced-motion','value':'reduce'}])
def key(value, shift=False):
    codes={'Tab':9,'Enter':13,'Escape':27,'ArrowRight':39,'ArrowLeft':37}
    for kind in ['keyDown','keyUp']:
        c.call('Input.dispatchKeyEvent',type=kind,key=value,code=value,windowsVirtualKeyCode=codes[value],modifiers=8 if shift else 0, text='\r' if value=='Enter' and kind=='keyDown' else '')
def focus(selector):
    c.evaluate(f'document.querySelector({json.dumps(selector)}).focus()')
results=[]
for width in [360,390,768,1440]:
    c.call('Emulation.setDeviceMetricsOverride',width=width,height=900,deviceScaleFactor=1,mobile=False)
    for page in ['index','about','services','bridal','courses','gallery','contact','404']:
        c.call('Page.navigate',url=f'http://127.0.0.1:8766/{page}.html')
        for _ in range(100):
            if c.evaluate("document.readyState==='complete'"):
                break
            time.sleep(.1)
        r={'page':page,'width':width}
        if width in [360,390]:
            focus('#hamburgerBtn');key('Enter')
            r['navEnter']=c.evaluate("document.getElementById('hamburgerBtn').getAttribute('aria-expanded')==='true'")
            focus('#navCloseBtn');key('Tab',True)
            r['navShiftTab']=c.evaluate("document.activeElement.matches('.nav-mobile-book')")
            key('Tab');r['navTab']=c.evaluate("document.activeElement.id==='navCloseBtn'")
            key('Escape');r['navEscape']=c.evaluate("document.activeElement.id==='hamburgerBtn'&&document.getElementById('hamburgerBtn').getAttribute('aria-expanded')==='false'")
        if c.evaluate("!!document.querySelector('[data-photo]')"):
            focus('[data-photo]');key('Enter');r['lightboxEnter']=c.evaluate("document.getElementById('lightboxModal').open")
            key('Tab');r['lightboxTab']=c.evaluate("document.getElementById('lightboxModal').contains(document.activeElement)")
            key('Escape');r['lightboxEscape']=c.evaluate("!document.getElementById('lightboxModal').open&&document.activeElement.matches('[data-photo]')")
        if c.evaluate("!!document.querySelector('summary')"):
            focus('summary');key('Enter');r['faqEnter']=c.evaluate("document.querySelector('details').open")
            key('Enter');r['faqClose']=c.evaluate("!document.querySelector('details').open")
        if page=='gallery':
            focus('[data-gallery-filter]:not([data-gallery-filter="all"])');key('Enter')
            r['filterEnter']=c.evaluate("document.activeElement.getAttribute('aria-pressed')==='true'")
        if page=='index':
            focus('[data-hero-dot]');key('ArrowLeft')
            r['sliderReverse']=c.evaluate("document.querySelectorAll('[data-hero-slide]')[3].classList.contains('is-active')")
            key('ArrowRight');r['sliderWrap']=c.evaluate("document.querySelectorAll('[data-hero-slide]')[0].classList.contains('is-active')")
            key('Tab');key('Enter');r['sliderDotEnter']=c.evaluate("document.querySelectorAll('[data-hero-slide]')[1].classList.contains('is-active')")
            r['focusOutline']=c.evaluate("getComputedStyle(document.activeElement).outlineStyle!=='none'")
        r['errors']=c.evaluate('window.auditErrors||[]')
        results.append(r)
(OUT/'keyboard-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
c.call('Browser.close')
