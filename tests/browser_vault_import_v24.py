"""Import exact save keys, preserve legacy builds, and share links only via website encoding."""
import json
from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site
KEY='mw4camo-io-v1'
def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page,errors=page_with_site(browser,390)
  page.on('dialog',lambda dialog:dialog.accept())
  page.evaluate("location.hash='#/build/m4'")
  page.locator('#buildName').fill('Verified local build')
  page.locator('[data-action="save-build"]').click()
  stored=json.loads(page.evaluate('(key)=>localStorage.getItem(key)',KEY))
  record=stored['builds']['m4|Warzone|Balanced']
  backup={**stored,'builds':{'m4|Warzone|Balanced':record,'m4|Warzone':record,'m4|Warzone|Ghost':record,'m4|Warzone|Balanced|extra':record,'m4|DMZ|Balanced':{'slots':[]}}}
  page.evaluate("location.hash='#/settings'")
  page.locator('#importFile').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
  page.wait_for_function("(key)=>Object.keys(JSON.parse(localStorage.getItem(key)).builds).length===2",arg=KEY)
  restored=json.loads(page.evaluate('(key)=>localStorage.getItem(key)',KEY))
  assert sorted(restored['builds'])==['m4|Warzone','m4|Warzone|Balanced']
  page.evaluate("location.hash='#/my-builds'")
  assert page.locator('[data-blueprint-card]').count()==2
  page.evaluate("""() => {window.__copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__copied=value;}}});}""")
  page.locator('[data-action="copy-saved-link"]').first.click()
  page.wait_for_function("window.__copied.includes('?share=')")
  assert 'MW4C2' in page.evaluate('window.__copied')
  assert not errors,errors
  print('PASS validated import, legacy preservation, and website share links')
  browser.close()
if __name__=='__main__':run()
