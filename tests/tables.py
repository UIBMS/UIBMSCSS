"""Responsive native table regression for every principal generated CSS bundle."""
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--browser', choices=['chromium','firefox','webkit'], default='chromium')
parser.add_argument('--executable')
args = parser.parse_args()
dist = Path(__file__).resolve().parents[1] / 'dist'
fixture = '''<div id="app" {marker} {profile} style="padding: 16px; max-inline-size:100%">
<div id="region" role="region" tabindex="0" aria-label="Reference tables" style="overflow:auto; max-inline-size:100%">
<table id="reference"><thead><tr><th scope="col">Material</th><th scope="col">Implementation</th></tr></thead><tbody>
<tr><th scope="row">glass</th><td>98% surface tint; 12px backdrop blur and 130% saturation when supported; inset highlights.</td></tr>
<tr><th scope="row">frosted</th><td>99% surface tint; 18px blur and 110% saturation when supported.</td></tr>
<tr><th scope="row"><code>visually-hidden</code></th><td>One-pixel clipped content stays in the accessibility tree; focus within reveals it.</td></tr>
<tr><th scope="row"><code>--font-family-mono</code></th><td>ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace</td></tr>
</tbody></table></div>
<div id="wide-region" role="region" tabindex="0" aria-label="Wide data" style="overflow:auto;max-inline-size:100%">
<table id="wide"><thead><tr><th scope="col">ColumnAlpha</th><th scope="col">ColumnBravo</th><th scope="col">ColumnCharlie</th><th scope="col">ColumnDelta</th><th scope="col">ColumnEcho</th></tr></thead><tbody><tr><th scope="row">Alpha</th><td>Bravo</td><td>Charlie</td><td>Delta</td><td>Echo</td></tr></tbody></table></div>
</div>'''
profiles = ['', 'data-density="spacious" data-typography="technical"', 'data-theme="dark" data-density="compact"']
with sync_playwright() as p:
    options = {'headless': True}
    if args.executable: options['executable_path'] = args.executable
    if args.browser == 'chromium': options['args'] = ['--no-sandbox','--disable-dev-shm-usage']
    browser = getattr(p,args.browser).launch(**options)
    page = browser.new_page()
    count = 0
    for css in sorted(dist.glob('uibms*.css')):
        for profile in profiles:
            markup = fixture.format(marker='data-uibms' if '.scoped' in css.name else '', profile=profile)
            page.set_content('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css.read_text()+'</style>'+markup)
            for width in (320,375,390,768,1440):
                page.set_viewport_size({'width':width,'height':900})
                result = page.evaluate("""() => {
                  const lineCount = e => {const r=document.createRange();r.selectNodeContents(e.querySelector('code:only-child')||e);return new Set([...r.getClientRects()].filter(x=>x.width>0).map(x=>Math.round(x.top))).size;};
                  const region = document.querySelector('#wide-region');
                  return {
                    semantics:[...document.querySelectorAll('table')].every(e=>getComputedStyle(e).display==='table'),
                    normal:[...document.querySelectorAll('th,td')].every(e=>getComputedStyle(e).overflowWrap==='normal'&&getComputedStyle(e).wordBreak==='normal'),
                    headings:[...document.querySelectorAll('th')].every(e=>lineCount(e)===1),
                    code:[...document.querySelectorAll('th code')].every(e=>getComputedStyle(e).whiteSpace==='nowrap'&&e.getClientRects().length===1),
                    prose:innerWidth>390||lineCount(document.querySelector('#reference td'))>1,
                    noPageOverflow:document.documentElement.scrollWidth<=innerWidth+1,
                    wideScroll:innerWidth>390||region.scrollWidth>region.clientWidth
                  };
                }""")
                assert all(result.values()), (css.name,profile,width,result)
                count += 1
    browser.close()
    print(f'{args.browser}: {count} responsive table cases passed')
