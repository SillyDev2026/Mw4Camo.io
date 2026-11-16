"""Behavioral storage failure regression."""
import json
from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site
KEY="mw4camo-io-v1"
def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page,errors=page_with_site(browser,390)
        page.on("dialog",lambda dialog:dialog.accept())
        page.evaluate("location.hash='#/build/m4'")
        page.locator("#buildName").fill("Save-safe draft")
        page.evaluate("""(key)=>{window.__setItem=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===key)throw Error('Quota');return window.__setItem(k,v);}}""",KEY)
        page.locator('[data-action="save-build"]').click()
        assert page.locator("#buildName").input_value()=="Save-safe draft"
        assert page.locator("#storageWarning").is_visible()
        assert not page.evaluate("(key)=>!!localStorage.getItem(key)",KEY)
        page.evaluate("localStorage.setItem=window.__setItem")
        page.locator('[data-action="save-build"]').click()
        stored=json.loads(page.evaluate("(key)=>localStorage.getItem(key)",KEY))
        assert stored["builds"]["m4|Warzone|Balanced"]["name"]=="Save-safe draft"
        page.evaluate("""(key)=>{window.__setItem=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===key)throw Error('Quota');return window.__setItem(k,v);}}""",KEY)
        page.evaluate("location.hash='#/settings'")
        page.locator('[data-action="clear"]').click()
        assert "reset cancelled" in page.locator("#toast").inner_text().lower()
        assert page.evaluate("(key)=>JSON.parse(localStorage.getItem(key)).builds['m4|Warzone|Balanced'].name",KEY)=="Save-safe draft"
        new_state={**stored,"builds":{},"focusWeapon":None}
        page.locator("#importFile").set_input_files({"name":"safe.json","mimeType":"application/json","buffer":json.dumps(new_state).encode()})
        assert "import cancelled" in page.locator("#toast").inner_text().lower()
        page.evaluate("location.hash='#/my-builds'")
        assert page.locator('[data-blueprint-card]').count()==1
        page.evaluate("localStorage.setItem=window.__setItem")
        page.evaluate("location.hash='#/settings'")
        page.locator("#importFile").set_input_files({"name":"safe.json","mimeType":"application/json","buffer":json.dumps(new_state).encode()})
        assert page.evaluate("(key)=>Object.keys(JSON.parse(localStorage.getItem(key)).builds).length",KEY)==0
        assert not errors,errors
        print("PASS transactional blueprint save, reset, import, retry")
        browser.close()
if __name__=="__main__":run()
