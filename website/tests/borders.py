"""Exercise the actual generated website menu, framework styling and persistence."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]/'preview-output'
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}'
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        page=browser.new_page(viewport={'width':390,'height':844},color_scheme='light')
        page.goto(url+'/docs/border/')
        page.wait_for_selector('html[data-site-ready]',state='attached')
        assert page.locator('#appearance-border option').evaluate_all('(a)=>a.map(o=>o.value)')==['subtle','default','strong']
        page.locator('#site-appearance summary').click()
        results={}
        for mode in ['subtle','default','strong']:
            page.locator('#appearance-border').select_option(mode)
            assert page.locator('html').get_attribute('data-border')==mode
            results[mode]=page.locator('#site-header').evaluate('(e)=>getComputedStyle(e).borderBottomColor')
        assert len(set(results.values()))==3,results
        page.locator('#appearance-border').select_option('subtle')
        page.goto(url+'/docs/materials/')
        page.wait_for_selector('html[data-site-ready]',state='attached')
        assert page.locator('html').get_attribute('data-border')=='subtle'
        assert page.locator('#appearance-border').input_value()=='subtle'
        page.locator('#site-appearance summary').click()
        page.locator('#site-appearance-reset').click()
        assert page.locator('html').get_attribute('data-border')=='default'
        assert page.locator('#appearance-border').input_value()=='default'
        browser.close()
        print('Website border menu: options, live styling, mobile viewport, persistence and reset passed.')
finally:
    server.shutdown()
