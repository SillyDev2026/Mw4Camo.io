"""Real-user regression scenarios for MW4Camo.io v1.6.1."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site


def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
        page,errors=page_with_site(browser,390)
        page.evaluate("location.hash='#/compare'")
        page.locator('[data-measure="ttkMs"][data-weapon="han-86"]').fill('275')
        page.locator('[data-action="save-measures"]').click()
        first=page.locator('.v15-stat-card').first.inner_text()
        assert '275 ms' in first and '0 ms' not in first
        assert 'YOUR RECOIL SCORE\n—' in first,first
        assert 'YOUR EFFECTIVE RANGE\n—' in first,first
        print('PASS - missing stats remain unknown, not 0')

        page.evaluate("location.hash='#/build/han-86'")
        page.locator('#buildName').fill('Unfinished test blueprint')
        page.evaluate("location.hash='#/weapons'")
        page.evaluate("location.hash='#/build/han-86'")
        assert page.locator('#buildName').input_value()=='Unfinished test blueprint'
        print('PASS - unsaved blueprint survives route navigation')

        page.evaluate("location.hash='#/class-builder'")
        classes=[{'id':'class-'+str(i),'primary':'han-86','name':'Class '+str(i),'savedAt':'2026-11-11T00:00:00Z'} for i in range(40)]
        page.evaluate('''(items)=>{let s={version:1,mode:'Warzone',completed:{},accounts:{},levels:{},favorites:[],builds:{},activeGoals:{},counters:{},classLibrary:{Warzone:items},activeClassIds:{Warzone:items[0].id}};localStorage.setItem('mw4camo-io-v1',JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:'mw4camo-io-v1'}))}''',classes)
        assert page.locator('#classSelect option').count()==41
        page.locator('[data-action="class-duplicate"]').click()
        assert page.locator('#classSelect option').count()==41
        assert '40' in page.locator('#toast').inner_text()
        assert page.locator('#classSelect').input_value()=='class-0'
        print('PASS - 40-class limit does not create a ghost selection')

        page.evaluate('''()=>{let s={version:1,mode:'Bad mode',completed:[],accounts:'invalid',levels:null,favorites:[null,'han-86'],builds:{'han-86|Warzone':null,'han-86|MW4':{slots:{}}},counters:[],classLibrary:{Warzone:[null,{},'bad']},reviewedPatches:null,weaponMeasurements:{}};localStorage.setItem('mw4camo-io-v1',JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:'mw4camo-io-v1'}))}''')
        for route in ['dashboard','my-builds','doctor','class-builder','compare','assistant','weapon/han-86']:
            page.evaluate('(r)=>location.hash="#/"+r',route)
            assert page.locator('#app h1').count(),route
        assert not errors,errors
        print('PASS - malformed partial local saves do not crash routes')

        page.evaluate("location.hash='#/assistant'")
        page.locator('#assistantWeapon').select_option('han-86')
        first=page.locator('.v16-task').first
        first.locator('[data-action="quick-count"]').click()
        assert page.locator('.v16-task').first.locator('[data-task-counter="value"]').input_value()=='1'
        page.locator('.toast-undo').click()
        assert page.locator('.v16-task').first.locator('[data-task-counter="value"]').input_value()=='0'
        print('PASS - assistant counters and Undo')

        # Browser storage errors must stay visible until a later save succeeds.
        page.evaluate("location.hash='#/weapon/han-86'")
        page.evaluate("() => {window.__oldSet=localStorage.setItem;localStorage.setItem=()=>{throw new Error('Quota exceeded')}}")
        page.locator('[data-action="camo"]').first.click()
        assert page.locator('#storageWarning').is_visible()
        assert page.locator('#storageWarning a[href="#/settings"]').count()==1
        page.evaluate("() => {localStorage.setItem=window.__oldSet}")
        page.locator('[data-action="camo"]').first.click()
        assert page.locator('#storageWarning').is_hidden()
        print('PASS - storage errors remain visible until storage recovers')

        for width in [320,360,390,768,1024,1440]:
            page.set_viewport_size({'width':width,'height':810})
            for route in ['dashboard','hub','weapons','planner','mastery','loadouts','my-builds','patches','class-builder','compare','assistant','doctor','settings','build/han-86','weapon/rezi-12']:
                page.evaluate('(r)=>location.hash="#/"+r',route)
                assert page.locator('#app h1').count(),(width,route)
                assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 2'),(width,route)
            assert not errors,errors
        print('PASS - 90 responsive routes with no JS errors or horizontal overflow')
        browser.close()

if __name__=='__main__': run()
