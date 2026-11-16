"""Cross-tab draft survival and keyboard + mobile access."""
from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site
KEY='mw4camo-io-v1'
def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for width in [320,390]:
   page,errors=page_with_site(browser,width)
   page.evaluate("location.hash='#/build/m4'")
   page.locator('#buildName').fill('Unsaved cross-tab edit')
   page.evaluate("""(key)=>{
     const state={version:1,mode:'Warzone',completed:{},accounts:{},levels:{},favorites:[],builds:{},activeGoals:{},counters:{}};
     localStorage.setItem(key,JSON.stringify(state));
     window.dispatchEvent(new StorageEvent('storage',{key}));
   }""",KEY)
   assert page.locator('#buildName').input_value()=='Unsaved cross-tab edit'
   page.locator('[data-action="save-build"]').click()
   assert page.evaluate("(key)=>JSON.parse(localStorage.getItem(key)).builds['m4|Warzone|Balanced'].name",KEY)=='Unsaved cross-tab edit'
   page.evaluate("location.hash='#/my-builds'")
   actions=page.locator('[data-blueprint-card] .build-actions .btn')
   assert actions.count()==4
   assert all(box and box['height']>=43 for box in [btn.bounding_box() for btn in actions.all()])
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2')
   page.locator('#quickOpen').click()
   assert page.locator('#quickSearch').get_attribute('role')=='combobox'
   assert page.locator('#quickSearch').get_attribute('aria-expanded')=='true'
   page.locator('#quickSearch').fill('weapons')
   page.locator('#quickSearch').press('ArrowDown')
   option=page.locator('#quickSearch').get_attribute('aria-activedescendant')
   assert option and page.locator('#'+option).count()==1
   page.locator('#quickSearch').press('Escape')
   assert page.locator('#quickOverlay').is_hidden()
   assert page.locator('#quickSearch').get_attribute('aria-expanded')=='false'
   assert not errors,errors
   print('PASS mobile width',width,'cross-tab drafts, large touch targets, and jump accessibility')
   page.close()
  browser.close()
if __name__=='__main__':run()
