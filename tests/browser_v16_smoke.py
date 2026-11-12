from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_v15_smoke import page_with_site


def go(page,route):
    page.evaluate('(p)=>location.hash="#/"+p',route)
    page.wait_for_timeout(90)
    assert page.locator('#app h1').count(),route
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 2'),route


def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        for width in [320,390,768,1440]:
            page,errors=page_with_site(browser,width)
            for route in ['dashboard','hub','class-builder','compare','assistant','doctor','loadouts','my-builds','weapon/rezi-12','build/han-86','patches','settings']:
                go(page,route)
                assert not errors,(width,route,errors)
            print('LAYOUT',width,'12 routes verified',flush=True)
            if width!=390:
                page.close();continue
            go(page,'hub')
            assert page.locator('.v16-hub-card').count()==4
            assert page.locator('.v16-hub-card[href="#/doctor"]').count()==1
            page.locator('#menuToggle').click()
            assert page.locator('#sidebar').evaluate('(x)=>x.classList.contains("open")')
            page.locator('[data-route="class-builder"]').click()
            assert page.locator('#sidebar').evaluate('(x)=>!x.classList.contains("open")')
            # Save first named Warzone class.
            page.locator('#className').fill('Close Quarters')
            page.locator('#classPrimary').select_option('han-86')
            page.locator('#classSecondary').select_option('sang-9mm')
            page.locator('[data-action="class-preset"][data-preset="Stealth"]').click()
            page.locator('#classNotes').fill('Hold left side; prioritize cover')
            page.locator('[data-action="save-class"]').click()
            assert page.locator('#classSelect option').count()==2
            assert page.locator('#className').input_value()=='Close Quarters'
            # Create second class while preserving first.
            page.locator('[data-action="class-new"]').click()
            assert page.locator('#classPrimary').input_value()==''
            page.locator('#className').fill('Long Range')
            page.locator('#classPrimary').select_option('han-86')
            page.locator('[data-action="save-class"]').click()
            assert page.locator('#classSelect option').count()==3
            page.locator('#classSelect').select_option(label='Close Quarters · han-86')
            assert page.locator('#classNotes').input_value().startswith('Hold left')
            # Duplicate selected class (new ID) and remove it, retaining originals.
            page.locator('[data-action="class-duplicate"]').click()
            assert page.locator('#classSelect option').count()==4
            page.once('dialog',lambda d:d.accept())
            page.locator('[data-action="class-delete"]').click()
            assert page.locator('#classSelect option').count()==3
            # Unsaved edits survive mode changes without overwriting saved class.
            page.locator('#classSelect').select_option(label='Close Quarters · han-86')
            page.locator('#className').fill('Unsaved Session')
            page.locator('[data-action="mode"][data-mode="MW4"]').click()
            page.locator('[data-action="mode"][data-mode="Warzone"]').click()
            assert page.locator('#className').input_value()=='Unsaved Session'
            page.locator('#classSelect').select_option(label='Close Quarters · han-86')
            assert page.locator('#className').input_value()=='Close Quarters'
            # Smart camo assistant: focus, direct targets, +1, undo, decrement.
            go(page,'assistant')
            page.locator('#assistantWeapon').select_option('rezi-12')
            first=page.locator('.v16-task').first
            first.locator('[data-task-counter="target"]').fill('15')
            first.locator('[data-task-counter="target"]').dispatch_event('change')
            assert page.locator('.v16-task').first.locator('[data-task-counter="target"]').input_value()=='15'
            page.locator('.v16-task').first.locator('[data-action="quick-count"]').click()
            assert page.locator('.v16-task').first.locator('[data-task-counter="value"]').input_value()=='1'
            page.locator('.toast-undo').click()
            assert page.locator('.v16-task').first.locator('[data-task-counter="value"]').input_value()=='0'
            # Personal stats: two measurements and difference label, swap unchanged.
            go(page,'compare')
            page.locator('[data-measure="ttkMs"][data-weapon="han-86"]').fill('280')
            page.locator('[data-measure="ttkMs"][data-weapon="rezi-12"]').fill('310')
            page.locator('[data-action="save-measures"]').click()
            assert page.locator('.v16-delta-row').first.inner_text().find('HAN 86')>=0 or 'HAN 86' in page.locator('.v16-delta-row').first.inner_text().upper()
            page.locator('[data-action="swap-compare"]').click()
            assert page.locator('#compareA').input_value()=='rezi-12'
            # Doctor mode filters, patch acknowledgement, and undo.
            go(page,'build/rezi-12')
            page.locator('[data-action="save-build"]').click()
            go(page,'doctor')
            assert page.locator('.v15-doctor-card').count()>=1
            page.locator('[data-action="doctor-mode"][data-mode="MW4"]').click()
            assert page.locator('.v15-doctor-card').count()==0
            page.locator('[data-action="doctor-mode"][data-mode="Warzone"]').click()
            assert page.locator('.v15-doctor-card').count()>=1
            if page.locator('[data-action="review-patch"]').count():
                initial=page.locator('[data-action="review-patch"]').count()
                page.locator('[data-action="review-patch"]').first.click()
                assert page.locator('[data-action="review-patch"]').count()==initial-1
                page.locator('.toast-undo').click()
                assert page.locator('[data-action="review-patch"]').count()==initial
            assert not errors,errors
            print('INTERACTION HUB CLASS LIBRARY ASSISTANT COMPARE DOCTOR OK',flush=True)
            page.close()
        browser.close()

if __name__=='__main__':main()
