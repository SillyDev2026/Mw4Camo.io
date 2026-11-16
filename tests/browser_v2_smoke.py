"""Chromium end-to-end smoke checks for the Blueprint Vault and primary routes."""
from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site

def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True, args=['--no-sandbox','--disable-dev-shm-usage'])
        for width in (320,390,768,1440):
            page,errors=page_with_site(browser,width)
            page.evaluate("location.hash='#/build/m4'")
            page.locator('#buildName').fill('Vault regression rifle')
            page.locator('[data-action="save-build"]').click()
            page.evaluate("location.hash='#/my-builds'")
            assert page.locator('[data-blueprint-card]').count()==1,(width,errors)
            assert page.locator('#blueprintResults').inner_text()=='1 of 1 shown'
            page.locator('#blueprintSearch').fill('this does not exist')
            assert page.locator('#blueprintResults').inner_text()=='0 of 1 shown'
            assert page.locator('#blueprintEmpty').is_visible()
            page.locator('#blueprintSearch').fill('regression rifle')
            assert page.locator('#blueprintResults').inner_text()=='1 of 1 shown'
            page.locator('#blueprintMode').select_option('DMZ')
            assert page.locator('#blueprintResults').inner_text()=='0 of 1 shown'
            page.locator('#blueprintMode').select_option('Warzone')
            assert page.locator('#blueprintResults').inner_text()=='1 of 1 shown'
            page.locator('#blueprintSort').select_option('weapon')
            assert page.locator('#blueprintSort').input_value()=='weapon'
            page.evaluate("""() => {Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedCode=text;}}});}""")
            page.locator('[data-action="copy-saved-code"]').click()
            page.wait_for_function("typeof window.__copiedCode==='string'")
            assert page.evaluate("window.__copiedCode.startsWith('MW4C2-')")
            assert page.locator('[data-route="my-builds"]').get_attribute('aria-current')=='page'
            routes=('dashboard','weapons','planner','mastery','loadouts','hub','class-builder','compare','assistant','doctor','my-builds','patches','settings','build/m4','weapon/m4')
            for route in routes:
                page.evaluate("(route)=>location.hash='#/'+route",route)
                page.wait_for_timeout(45)
                assert page.locator('#app h1').count(),(width,route,'blank heading')
                assert page.locator('[aria-current="page"]').count(),(width,route,'active navigation missing')
                assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+2'),(width,route,'horizontal overflow')
                assert not errors,(width,route,errors)
            if width<=900:
                page.locator('#menuToggle').click()
                assert 'open' in page.locator('#sidebar').get_attribute('class')
                page.locator('#menuClose').click()
                assert 'open' not in page.locator('#sidebar').get_attribute('class')
            print('PASS',width,'vault workflows and 15 full application routes',flush=True)
            page.close()
        browser.close()

if __name__=='__main__':
    run()
