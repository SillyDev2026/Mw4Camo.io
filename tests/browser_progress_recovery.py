from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site
KEY='mw4camo-io-v1'
def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page,errors=page_with_site(browser,390)
  page.evaluate("location.hash='#/weapon/han-86'")
  page.evaluate("""(key)=>{window.__originalSet=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===key)throw Error('Quota exceeded');return window.__originalSet(k,v);};}""",KEY)
  page.locator('[data-action="camo"]').first.click()
  assert 'Storage' in page.locator('#toast').inner_text()
  assert not page.evaluate("(key)=>!!localStorage.getItem(key)",KEY)
  page.evaluate("localStorage.setItem=window.__originalSet")
  page.locator('[data-action="camo"]').first.click()
  assert page.evaluate("(key)=>Object.values(JSON.parse(localStorage.getItem(key)).completed).some(Boolean)",KEY)
  page.locator('.toast-undo').click()
  assert not page.evaluate("(key)=>Object.values(JSON.parse(localStorage.getItem(key)).completed).some(Boolean)",KEY)
  page.evaluate("location.hash='#/weapons'")
  page.evaluate("""(key)=>{window.__originalSet=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===key)throw Error('Quota exceeded');return window.__originalSet(k,v);};}""",KEY)
  page.locator('[data-action="favorite"]').first.click()
  assert not page.evaluate("(key)=>JSON.parse(localStorage.getItem(key)).favorites.length",KEY)
  page.evaluate("localStorage.setItem=window.__originalSet")
  page.locator('[data-action="favorite"]').first.click()
  assert page.evaluate("(key)=>JSON.parse(localStorage.getItem(key)).favorites.length",KEY)==1
  assert not errors,errors
  print('PASS progress rollback, retry, undo and favorites')
  browser.close()
if __name__=='__main__':run()
