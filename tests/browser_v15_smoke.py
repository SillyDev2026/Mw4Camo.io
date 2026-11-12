from pathlib import Path
import re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SCRIPTS=['data/weapons.js','data/patches.js','data/attachments.js','data/update-status.js','data/intel-v15.js','app.js','ui-experience.js']
CSS=['styles.css','ui-v2.css','ui-v3.css','ui-v4.css','ui-v5.css','ui-v6.css','ui-v7.css','ui-v8.css']
def page_with_site(browser,width=390):
    page=browser.new_page(viewport={'width':width,'height':820},device_scale_factor=1)
    page.set_default_timeout(2500)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(re.sub(r'<(?:script|link)\b[^>]*>(?:</script>)?', '', (ROOT/'index.html').read_text()),wait_until='domcontentloaded',timeout=5000)
    page.evaluate('''() => {const saved={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(saved,k)?saved[k]:null,setItem:(k,v)=>saved[k]=String(v),removeItem:k=>delete saved[k]}});}''')
    for css in CSS:page.evaluate('(s)=>{const n=document.createElement("style");n.textContent=s;document.head.append(n)}',(ROOT/css).read_text())
    for js in SCRIPTS:page.evaluate('(s)=>{const n=document.createElement("script");n.textContent=s;document.head.append(n)}',(ROOT/js).read_text())
    return page,errors

def main():
  with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in [320,390,768,1440]:
      page,errors=page_with_site(browser,width)
      for route in ['dashboard','hub','weapons','planner','mastery','loadouts','my-builds','patches','class-builder','compare','assistant','doctor','settings','build/han-86','weapon/rezi-12']:
        page.evaluate('r=>{location.hash="#/"+r}',route);page.wait_for_timeout(70)
        heading=page.locator('#app h1').first
        if not heading.count():raise AssertionError(f'{width} {route} blank {errors}')
        over=page.evaluate('()=>document.documentElement.scrollWidth>innerWidth+2')
        if over:raise AssertionError(f'{width} {route} horizontal overflow scroll={page.evaluate("()=>document.documentElement.scrollWidth")}')
        if errors:raise AssertionError(f'{width} {route} js errors {errors}')
      print('WIDTH',width,'ROUTES OK')
      if width==390:
        page.evaluate('()=>location.hash="#/class-builder"');page.wait_for_timeout(70)
        print('STEP primary',flush=True);page.locator('#classPrimary').select_option('han-86')
        print('STEP secondary',flush=True);page.locator('#classSecondary').select_option('sang-9mm')
        print('STEP preset',flush=True);page.locator('[data-action="class-preset"][data-preset="Stealth"]').click()
        assert page.locator('#classPerk1').input_value()=='Incognito'
        assert page.locator('#classPerk2').input_value()=='Mountaineer'
        print('STEP save-class',flush=True);page.locator('[data-action="save-class"]').click()
        assert 'saved' in page.locator('#toast').inner_text().lower()
        page.evaluate('()=>location.hash="#/doctor"');page.wait_for_timeout(70)
        page.evaluate('()=>location.hash="#/compare"');page.wait_for_timeout(70)
        page.locator('[data-measure="ttkMs"][data-weapon="han-86"]').fill('305')
        print('STEP save measures',flush=True);page.locator('[data-action="save-measures"]').click()
        assert page.locator('[data-measure="ttkMs"][data-weapon="han-86"]').input_value()=='305'
        page.evaluate('()=>location.hash="#/assistant"');page.wait_for_timeout(70)
        print('STEP quick count',flush=True);page.locator('[data-action="quick-count"]').first.click()
        assert 'progress' in page.locator('#toast').inner_text().lower()
        print('STEP undo',flush=True);page.locator('.toast-undo').click()
        page.evaluate('()=>location.hash="#/build/han-86"');page.wait_for_timeout(70)
        print('STEP save-build',flush=True);page.locator('[data-action="save-build"]').click()
        page.evaluate('()=>location.hash="#/doctor"');page.wait_for_timeout(70)
        assert page.locator('.v15-doctor-card').count()==1
        n=page.locator('[data-action="review-patch"]').count()
        if n:
          page.locator('[data-action="review-patch"]').first.click()
          assert page.locator('[data-action="review-patch"]').count()==n-1
        page.evaluate('()=>location.hash="#/class-builder"');page.wait_for_timeout(70)
        assert page.locator('#classPrimary').input_value()=='han-86'
        assert page.locator('#classPerk1').input_value()=='Incognito'
        page.locator('[data-action="mode"][data-mode="MW4"]').click()
        assert page.locator('#classPrimary').input_value()==''
        page.locator('[data-action="mode"][data-mode="Warzone"]').click()
        assert page.locator('#classPrimary').input_value()=='han-86'
        print('INTERACTION CHECKS OK')
      page.close()
    browser.close()

if __name__=='__main__':main()
