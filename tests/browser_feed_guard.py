"""Refresh must reject invalid publisher JSON without erasing existing patches."""
from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site
def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page,errors=page_with_site(browser,390)
        page.evaluate("location.hash='#/settings'")
        before=page.evaluate("window.MW4CamoFeed.current().patches.length")
        page.evaluate("""() => {
          const status={lastCheckedAt:new Date().toISOString(),lastSuccessfulAt:new Date().toISOString(),patchCount:1};
          window.fetch=async request=>{
            const url=String(request);
            let body=url.includes('update-status')?status:url.includes('patches.json')?[{id:'bad',game:'MW4',date:'2026-11-16',title:'Bad response',source:'https://www.callofduty.com/patchnotes',sections:[{title:'Invalid',points:[null]}]}]:{};
            return {ok:true,json:async()=>body};
          };
        }""")
        page.locator('#refreshNow').click()
        page.wait_for_function("document.querySelector('#refreshMessage').textContent.includes('Could not verify')")
        assert page.evaluate("window.MW4CamoFeed.current().patches.length")==before
        assert not errors,errors
        print("PASS malformed publisher response rejected without archive loss")
        browser.close()
if __name__=='__main__':run()
