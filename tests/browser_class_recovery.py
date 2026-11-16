"""Browser regression for failed class writes and stale saved-blueprint drafts."""
import json
from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site
KEY="mw4camo-io-v1"
def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page,errors=page_with_site(browser,390)
        page.on("dialog",lambda dialog:dialog.accept())
        page.evaluate("location.hash='#/class-builder'")
        page.locator('#classPrimary').select_option('han-86')
        page.locator('#className').fill('Save-safe class')
        page.evaluate("""(key)=>{window.__oldSet=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===key)throw Error('Quota');return window.__oldSet(k,v);}}""",KEY)
        page.locator('[data-action="save-class"]').click()
        assert page.locator('#className').input_value()=='Save-safe class'
        assert "not saved" in page.locator('#toast').inner_text().lower()
        page.evaluate("localStorage.setItem=window.__oldSet")
        page.locator('[data-action="save-class"]').click()
        assert len(json.loads(page.evaluate("(key)=>localStorage.getItem(key)",KEY))["classLibrary"]["Warzone"])==1
        page.evaluate("""(key)=>{window.__oldSet=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===key)throw Error('Quota');return window.__oldSet(k,v);}}""",KEY)
        page.locator('[data-action="class-duplicate"]').click()
        assert "not saved" in page.locator('#toast').inner_text().lower()
        page.locator('[data-action="class-delete"]').click()
        assert "not saved" in page.locator('#toast').inner_text().lower()
        page.evaluate("localStorage.setItem=window.__oldSet")
        page.locator('[data-action="class-duplicate"]').click()
        assert len(json.loads(page.evaluate("(key)=>localStorage.getItem(key)",KEY))["classLibrary"]["Warzone"])==2
        page.evaluate("location.hash='#/build/m4'")
        page.locator('#buildName').fill('Saved vault name')
        page.locator('[data-action="save-build"]').click()
        page.locator('#buildName').fill('Unsaved local edit')
        page.evaluate("location.hash='#/my-builds'")
        page.locator('[data-action="open-saved"]').click()
        assert page.locator('#buildName').input_value()=='Saved vault name'
        page.evaluate("location.hash='#/my-builds'")
        page.evaluate("""(key)=>{window.__oldSet=localStorage.setItem;localStorage.setItem=(k,v)=>{if(k===key)throw Error('Quota');return window.__oldSet(k,v);}}""",KEY)
        page.locator('[data-action="delete-build"]').click()
        assert page.locator('[data-blueprint-card]').count()==1
        assert "not saved" in page.locator('#toast').inner_text().lower()
        page.evaluate("localStorage.setItem=window.__oldSet")
        page.locator('[data-action="delete-build"]').click()
        assert page.locator('[data-blueprint-card]').count()==0
        assert not errors,errors
        print("PASS class write failures, duplication, deletion and saved blueprint draft collisions")
        browser.close()
if __name__=='__main__':run()
