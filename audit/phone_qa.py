from slow_network import CDP, OUT
import json,time,urllib.request,base64
with urllib.request.urlopen('http://127.0.0.1:9223/json') as r:
 c=CDP(next(t for t in json.load(r) if t['type']=='page')['webSocketDebuggerUrl'])
c.call('Page.enable');c.call('Runtime.enable')
c.call('Emulation.setTouchEmulationEnabled',enabled=True,maxTouchPoints=2)
c.call('Emulation.setEmulatedMedia',features=[{'name':'prefers-reduced-motion','value':'reduce'}])
rows=[]
for width in [360,390,430,768,1440]:
 for page in (['index','about','services','bridal','courses','gallery','contact','404'] if width<768 else ['index']):
  c.call('Emulation.setDeviceMetricsOverride',width=width,height=844,deviceScaleFactor=1,mobile=width<768)
  c.call('Page.navigate',url='http://127.0.0.1:8766/'+page+'.html')
  time.sleep(.4)
  for _ in range(80):
   if c.evaluate("document.readyState==='complete'&&document.fonts.status==='loaded'"):break
   time.sleep(.1)
  time.sleep(.3)
  r=c.evaluate("""(()=>{const box=s=>document.querySelector(s)?.getBoundingClientRect();return {height:document.documentElement.scrollHeight,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,header:box('header')?.height,hero:box('[data-hero-slider]')?.height,servicesTop:box('#services')?.top,footer:box('footer')?.height,links:[...document.querySelectorAll('.nav-menu .nav-link')].filter(e=>e.getClientRects().length&&!e.closest('[inert]')).length,hamburger:getComputedStyle(document.querySelector('.hamburger-btn')).display,floating:getComputedStyle(document.querySelector('.floating-buttons')).flexDirection,background:getComputedStyle(document.querySelector('.floating-buttons')).backgroundColor,errors:window.auditErrors||[]}})()""")
  r['page']=page;rows.append(r)
  if page=='index':
   (OUT/f'phone-final-{width}.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',format='png')['data']))
   if width==390:
    c.evaluate("document.querySelector('footer').scrollIntoView()")
    (OUT/'phone-final-footer.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',format='png')['data']))
    c.evaluate('scrollTo(0,0)')
(OUT/'phone-final.json').write_text(json.dumps(rows,indent=2))
# Native browser touch dispatch: swipe and two-finger pinch on the photo viewer.
c.call('Emulation.setDeviceMetricsOverride',width=390,height=844,deviceScaleFactor=1,mobile=True)
c.call('Page.navigate',url='http://127.0.0.1:8766/index.html');time.sleep(2)
c.evaluate("document.querySelector('#services [data-photo]').click()")
time.sleep(1)
before=c.evaluate("document.querySelector('#lightboxCounter').textContent")
def touch(kind,points):c.call('Input.dispatchTouchEvent',type=kind,touchPoints=[dict(x=x,y=y,id=i) for i,x,y in points])
touch('touchStart',[(1,280,350)]);touch('touchMove',[(1,130,350)]);touch('touchEnd',[])
after=c.evaluate("document.querySelector('#lightboxCounter').textContent")
time.sleep(.5)
w1=c.evaluate("document.querySelector('#lightboxImg').getBoundingClientRect().width")
touch('touchStart',[(1,140,350),(2,240,350)]);touch('touchMove',[(1,80,350),(2,300,350)]);touch('touchEnd',[])
w2=c.evaluate("document.querySelector('#lightboxImg').getBoundingClientRect().width")
locked=c.evaluate("document.body.style.overflow==='hidden'")
c.evaluate("document.querySelector('#lightboxClose').click()")
closed=c.evaluate("!document.querySelector('dialog').open&&document.body.style.overflow!=='hidden'")
results={'swipe':[before,after],'pinchWidths':[w1,w2],'scrollLocked':locked,'closedAndUnlocked':closed}
(OUT/'phone-interactions.json').write_text(json.dumps(results,indent=2))
print(json.dumps(rows));print(json.dumps(results))
