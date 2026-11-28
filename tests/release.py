"""Release smoke and regression tests. Requires Python Playwright and a browser.
Run: python tests/release.py --browser chromium [--executable /usr/bin/chromium]
The test embeds the exact generated distribution files in stylesheet order.
"""
from pathlib import Path
from statistics import median
import argparse, json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
parser = argparse.ArgumentParser()
parser.add_argument('--browser', choices=['chromium', 'firefox', 'webkit'], default='chromium')
parser.add_argument('--executable')
parser.add_argument('--report', type=Path)
args = parser.parse_args()
checks = []
perf = {}

def check(name, value, expected=True):
    ok = value == expected
    checks.append(dict(name=name, passed=ok, actual=value, expected=expected))
    if not ok: print('FAIL', name, repr(value), 'expected', repr(expected), flush=True)

FIXTURE = '''<section id="app" {marker} data-theme="dark" data-palette="ocean" data-density="compact" data-shape="organic" data-typography="editorial" data-effects="dynamic">
  <h1 id="heading">Workspace</h1><p class="lead" id="lead">A readable introduction.</p>
  <div class="grid" id="grid"><article class="card stack" id="card"><h2>Projects</h2><button id="button">Continue</button></article><article class="panel stack" id="panel"><h2>Settings</h2><label for="field">Name</label><input id="field" required><button id="lift" data-hover="lift glow">Lift</button></article><article class="card" data-effect="glass" id="glass"><h2>Glass</h2><button id="glass-button">Inside</button></article></div>
  <div id="nested" {marker}><button id="nested-button">Nested</button><p data-theme="light" id="light"><button id="light-button">Light</button></p></div>
  <div id="reset" data-palette="default" data-density="default" data-shape="default" data-typography="default" data-effects="default"><button id="restore">Reset</button></div>
  <div data-palette="unloaded" id="unknown"><button id="unknown-button">Unknown</button></div>
  <div class="flex" id="flex"><button id="flex-a">A</button><button>B</button></div><div class="cluster" id="cluster"><button id="cluster-a">A</button><button>B</button></div>
  <div class="sidebar" id="sidebar"><aside>Sidebar</aside><article>Main content</article></div><div class="split" id="split"><article>First</article><article>Second</article></div>
  <div class="grid flex" id="conflict">Conflicting layout</div><div class="card panel" id="surface-conflict">Conflicting surface</div>
  <div class="container center" id="center">Center</div><p class="truncate" style="inline-size: 10rem" id="truncate" tabindex="0">This long text can be restored by focus.</p>
  <button id="named"><span aria-hidden="true">+</span><span class="visually-hidden">Add item</span></button><a id="skip" class="visually-hidden" href="#heading">Skip to heading</a>
  <form id="form"><label for="email">Email</label><input id="email" type="email" required><button type="submit" id="submit">Save</button></form>
  <label id="check-label"><input type="checkbox" id="check"> Checkbox</label><input id="disabled" disabled><input id="readonly" readonly value="read only"><input id="hidden" hidden>
  <input id="aria-invalid" aria-invalid="true" value="Invalid"><input id="aria-disabled" aria-disabled="true"><label>File <input type="file" id="file-input"></label><label>Category <select id="native-select"><option value="a">Alpha</option><option value="b">Beta</option></select></label><a id="disabled-link" href="#heading" aria-disabled="true">Unavailable</a>
  <details id="details"><summary>More information</summary><p>Content</p></details>
  <button id="open-dialog" onclick="document.getElementById('dialog').showModal()">Dialog</button><dialog id="dialog" class="stack" data-entrance="fade rise" data-exit="fade rise" aria-label="Dialog"><p>Dialog content</p><form method="dialog"><button>Close</button></form></dialog>
  <button id="open-popover" popovertarget="popover">Popover</button><div id="popover" popover class="stack" data-entrance="fade rise" data-exit="fade rise">Popover content<button popovertarget="popover" popovertargetaction="hide">Close</button></div>
  <div data-effects="none"><button id="none-default">No default effects</button><button id="none-explicit" data-hover="lift">Explicit</button></div>
  <button id="none-hover" data-hover="none lift">No lift</button><article class="card" data-effect="glass matte" id="material-conflict">Conflict</article><article class="card" data-effect="glass none" id="material-none">None wins</article><article class="card" data-effect="glass unknown" id="material-unknown">Known effect</article>
  <div data-typography="expressive"><section id="technical-profile" data-typography="technical"><p id="unknown-typography" data-typography="unknown">Inherited</p><p id="default-typography" data-typography="default">Reset</p></section></div>
  <article class="card" data-scroll="reveal progress" id="scroll" style="margin-block-start: 120vh">Scroll linked <a href="#heading">Top</a></article>
</section>'''

def html(files, scoped):
    links = ''.join(f'<link rel="stylesheet" href="/dist/{name}">' for name in files)
    # Host properties are deliberately unlayered. They apply only outside the adoption root.
    outside = '<div id="host" style="background:pink;color:purple;font-family:serif"><div class="card grid" id="outside" data-theme="dark" data-palette="ocean"><button id="host-button" data-hover="lift">Host</button></div></div>' if scoped else ''
    return '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1">'+links+'<style>#app{padding:12px;max-inline-size:100%}#app>#grid{margin-block:1rem}</style></head><body>'+outside+FIXTURE.format(marker='data-uibms' if scoped else '')+'</body></html>'

with sync_playwright() as p:
    launch = {'headless': True}
    if args.executable: launch['executable_path'] = args.executable
    if args.browser == 'chromium': launch['args'] = ['--no-sandbox','--disable-dev-shm-usage']
    browser = getattr(p, args.browser).launch(**launch)
    print('Browser', args.browser, browser.version, flush=True)
    page = browser.new_page(viewport={'width':1280,'height':900}, color_scheme='light', reduced_motion='no-preference')
    def load(files, scoped, body=None):
        markup = body if body is not None else html(files, scoped)
        # This also works in locked-down runners that disallow page navigation.
        for name in files:
            link = f'<link rel="stylesheet" href="/dist/{name}">'
            markup = markup.replace(link, '<style>'+ (DIST / name).read_text() +'</style>')
        page.set_content(markup, wait_until='load')
    def css(selector, prop): return page.locator(selector).first.evaluate('(e,p)=>getComputedStyle(e).getPropertyValue(p)', prop).strip()
    def resolved_color(selector, expression):
        # Resolve light-dark() and color-mix() in the same inherited context as the control.
        return page.locator(selector).first.evaluate('''(e,value)=>{
            const probe=document.createElement('span');
            probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none';
            probe.style.backgroundColor=value;
            e.parentElement.append(probe);
            try{return getComputedStyle(probe).backgroundColor}finally{probe.remove()}
        }''', expression)
    def accent_color(selector): return resolved_color(selector, 'var(--color-accent)')
    def resting_button_color(selector):
        return resolved_color(selector, 'color-mix(in oklab, var(--color-surface), var(--color-accent) 9%)')
    def set_attr(selector,key,val): page.locator(selector).first.evaluate('(e,p)=>e.setAttribute(p[0],p[1])',[key,val])
    def hover(selector, expected_translate):
        page.locator(selector).hover()
        page.wait_for_function('([sel,expected])=>getComputedStyle(document.querySelector(sel)).translate===expected', arg=[selector,expected_translate],timeout=3000)

    def rect(selector): return page.locator(selector).bounding_box()
    for scoped in (False, True):
        for full in (False,True):
            for minified in (False,True):
                name='uibms'+('.scoped' if scoped else '')+('.full' if full else '')+('.min' if minified else '')+'.css'
                pre=name+' / '
                page.set_viewport_size({'width':1280,'height':900});page.mouse.move(1279,899);page.emulate_media(reduced_motion='no-preference',forced_colors='none');load([name],scoped)
                check(pre+'actual stylesheet loaded',page.evaluate('document.styleSheets[0].cssRules.length > 20'))
                check(pre+'dark foreground',css('#app','color'),'rgb(244, 245, 242)')
                check(pre+'dark palette accent',accent_color('#button'),'rgb(172, 221, 245)' if full else 'rgb(216, 223, 214)')
                check(pre+'dark palette button surface',css('#button','background-color'),resting_button_color('#button'))
                check(pre+'nested marker inherits',css('#nested-button','background-color'),css('#button','background-color'))
                check(pre+'nested light accent independently',accent_color('#light-button'),'rgb(23, 78, 105)' if full else 'rgb(49, 95, 157)')
                check(pre+'nested light button surface',css('#light-button','background-color'),resting_button_color('#light-button'))
                check(pre+'unknown palette inherits',css('#unknown-button','background-color'),css('#button','background-color'))
                check(pre+'palette accent restore',accent_color('#restore'),'rgb(216, 223, 214)')
                check(pre+'palette restored button surface',css('#restore','background-color'),resting_button_color('#restore'))
                check(pre+'compact token',css('#app','--space'),'0.75rem')
                check(pre+'restore density',css('#restore','--space'),'1rem')
                check(pre+'shape radius',css('#button','border-radius'),'16px')
                check(pre+'card twice radius',css('#card','border-radius'),'32px')
                check(pre+'restore radius',css('#restore','border-radius'),'8px')
                check(pre+'editorial typography','Georgia' in css('#app','font-family'))
                check(pre+'root rem unchanged',css('html','font-size'),'16px')
                check(pre+'restore typography','system-ui' in css('#restore','font-family'))
                check(pre+'native target',rect('#button')['height']>=44)
                check(pre+'native required validation',page.locator('#email').evaluate('e=>e.validity.valueMissing'))
                check(pre+'native hidden',css('#hidden','display'),'none')
                check(pre+'native disabled',page.locator('#disabled').is_disabled())
                check(pre+'native readonly',page.locator('#readonly').evaluate('e=>e.readOnly'))
                check(pre+'ARIA invalid retains non-colour signal',css('#aria-invalid','border-top-style'),'dashed')
                check(pre+'ARIA disabled appearance',css('#aria-disabled','cursor'),'not-allowed')
                check(pre+'ARIA disabled link',css('#disabled-link','text-decoration-style'),'dashed')
                if page.evaluate('CSS.supports("selector(::file-selector-button)")'):
                    check(pre+'native file button retains target',page.locator('#file-input').evaluate('e=>parseFloat(getComputedStyle(e,"::file-selector-button").minBlockSize)>=44'))
                page.locator('#native-select').select_option('b')
                check(pre+'native select value',page.locator('#native-select').input_value(),'b')
                check(pre+'closed dialog',css('#dialog','display'),'none')
                check(pre+'closed popover',css('#popover','display'),'none')
                check(pre+'layout conflict',css('#conflict','display'),'block')
                check(pre+'surface conflict',css('#surface-conflict','background-color'),'rgba(0, 0, 0, 0)')
                check(pre+'grid display',css('#grid','display'),'grid')
                check(pre+'flex growth',css('#flex-a','flex-grow'),'1')
                check(pre+'cluster natural width',css('#cluster-a','flex-grow'),'0')
                check(pre+'center layout',css('#center','display'),'grid')
                check(pre+'card depth',css('#card','box-shadow')!='none')
                check(pre+'panel flat',css('#panel','box-shadow'),'none')
                check(pre+'ellipsis',css('#truncate','text-overflow'),'ellipsis')
                page.locator('#truncate').focus();check(pre+'focus restores text',css('#truncate','white-space'),'normal')
                page.locator('#skip').focus();check(pre+'focus reveals skip link',rect('#skip')['height']>1)
                check(pre+'accessible name',page.get_by_role('button',name='Add item').count(),1)
                page.locator('#check-label').click();check(pre+'native label activation',page.locator('#check').is_checked())
                page.locator('#details summary').click();check(pre+'native disclosure',page.locator('#details').evaluate('e=>e.open'))
                page.locator('#open-dialog').click();check(pre+'modal opens',page.locator('#dialog').evaluate('e=>e.open'));page.keyboard.press('Escape');page.wait_for_timeout(330);check(pre+'modal closes',css('#dialog','display'),'none')
                page.locator('#open-popover').click();check(pre+'popover opens',page.locator('#popover').evaluate('e=>e.matches(":popover-open")'));page.keyboard.press('Escape');page.wait_for_timeout(330);check(pre+'popover closes',css('#popover','display'),'none')
                if page.evaluate('CSS.supports("backdrop-filter", "blur(12px)")'):
                    check(pre+'glass filter',css('#glass','backdrop-filter')!='none')
                check(pre+'conflicting materials',css('#material-conflict','backdrop-filter'),'none')
                check(pre+'none wins over material',css('#material-none','backdrop-filter'),'none')
                check(pre+'unknown material token does not cancel known effect',css('#material-unknown','backdrop-filter'),css('#glass','backdrop-filter'))
                check(pre+'nested technical resets scale',css('#technical-profile','--heading-scale'),'1')
                check(pre+'nested technical sets reading width',css('#technical-profile','--reading-width'),'72ch')
                check(pre+'unknown typography inherits width',css('#unknown-typography','--reading-width'),'72ch')
                check(pre+'default typography restores width',css('#default-typography','--reading-width'),'65ch')
                check(pre+'profile duration',css('#button','transition-duration'),'0.22s' if full else '0.18s')
                hover('#lift','0px -4px');check(pre+'explicit lift',css('#lift','translate'),'0px -4px')
                # Hit-test the translated button after the hover transition, not its old coordinates.
                hit=rect('#lift');page.mouse.move(hit['x']+hit['width']/2,hit['y']+hit['height']/2)
                page.mouse.down()
                try:
                    check(pre+'press reaches intended button',page.locator('#lift').evaluate('e=>e.matches(":active")'))
                    page.wait_for_function('expected=>getComputedStyle(document.querySelector("#lift")).translate===expected',arg='0px 2px' if full else '0px 1px',timeout=3000)
                    check(pre+'independent default press',css('#lift','translate'),'0px 2px' if full else '0px 1px')
                finally:page.mouse.up()
                hover('#none-hover','none');check(pre+'individual none wins',css('#none-hover','translate'),'none')
                hover('#none-default','none');check(pre+'context none',css('#none-default','translate'),'none')
                hover('#none-explicit','0px -4px');check(pre+'explicit inside none',css('#none-explicit','translate'),'0px -4px')
                if page.evaluate('CSS.supports("animation-timeline", "view(block)") && CSS.supports("animation-timeline", "scroll(root block)") && CSS.supports("animation-range", "entry 0% cover 35%")'):
                    check(pre+'scroll animation',css('#scroll','animation-name'),('uibms-scoped-' if scoped else 'uibms-')+'scroll-reveal, '+('uibms-scoped-' if scoped else 'uibms-')+'scroll-progress')
                page.emulate_media(reduced_motion='reduce');hover('#lift','none');check(pre+'reduced movement',css('#lift','translate'),'none');check(pre+'reduced transition',css('#lift','transition-duration'),'0s');check(pre+'reduced scroll',css('#scroll','animation-name'),'none')
                if args.browser=='chromium':
                    page.emulate_media(forced_colors='active');check(pre+'forced-color material fallback',css('#glass','backdrop-filter'),'none')
                page.emulate_media(reduced_motion='no-preference',forced_colors='none')
                if scoped:
                    check(pre+'host unaffected layout',css('#outside','display'),'block')
                    check(pre+'host unaffected foreground',css('#outside','color'),'rgb(128, 0, 128)')
                    check(pre+'host unaffected token',css('#outside','--space'),'')
                    check(pre+'host unaffected reset',css('#host','box-sizing'),'content-box')
                    check(pre+'host unaffected scrolling',css('html','scroll-behavior'),'auto')
                    check(pre+'root reset applies',css('#app','box-sizing'),'border-box')
                page.add_style_tag(content='#button {border-radius: 2px}');check(pre+'ordinary override',css('#button','border-radius'),'2px')
                for width in (320,375,768,1280):
                    page.set_viewport_size({'width':width,'height':850});page.wait_for_timeout(40);check(pre+'reflow '+str(width),page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
                set_attr('html','dir','rtl');page.set_viewport_size({'width':320,'height':850});page.wait_for_timeout(40);check(pre+'RTL reflow',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
                page.set_viewport_size({'width':1280,'height':900});print('Checked',name,flush=True)
    # All 40 independent extensions in their actual global/scoped and readable/minified files.
    accent={'ocean':'rgb(23, 78, 105)','gold':'rgb(105, 71, 0)','forest':'rgb(33, 83, 55)','bordeaux':'rgb(112, 36, 62)','slate':'rgb(60, 75, 95)','royal':'rgb(77, 52, 123)','terracotta':'rgb(121, 64, 44)'}
    for scoped in (False,True):
        for mini in (False,True):
            mode=('.scoped' if scoped else '')+('.min' if mini else '')+'.css'
            core='uibms'+mode
            marker='data-uibms' if scoped else ''
            for name,color in accent.items():
                ext='extensions/palettes/'+name+mode
                markup='<!doctype html><link rel="stylesheet" href="/dist/'+core+'"><link rel="stylesheet" href="/dist/'+ext+'"><div '+marker+' data-theme="light" data-palette="'+name+'"><button id="ext">Inside</button></div><div data-palette="'+name+'" id="host">Outside</div>'
                load([core,ext],scoped,markup)
                check(ext+' separate palette accent',accent_color('#ext'),color)
                page.mouse.move(1279,899);page.wait_for_timeout(320)
                check(ext+' separate palette button surface',css('#ext','background-color'),resting_button_color('#ext'))
                if scoped: check(ext+' host unaffected',css('#host','--color-accent'),'')
            for name,t in [('minimal','0.1s'),('fluid','0.28s'),('dynamic','0.22s')]:
                ext='extensions/profiles/effects-'+name+mode
                markup='<!doctype html><link rel="stylesheet" href="/dist/'+ext+'"><link rel="stylesheet" href="/dist/'+core+'"><div '+marker+' data-effects="'+name+'"><button id="ext">Inside</button></div><div data-effects="'+name+'" id="host">Outside</div>'
                load([ext,core],scoped,markup);check(ext+' separate motion, extension first',css('#ext','transition-duration'),t)
                if scoped:check(ext+' host unaffected',css('#host','--signature-time'),'')
    # Optical geometry is calculated from inherited tokens, not fixed pixels.
    # Check every principal distribution in a single document per variant.
    icon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>'
    for scoped in (False,True):
        for full in (False,True):
            for mini in (False,True):
                file='uibms'+('.scoped' if scoped else '')+('.full' if full else '')+('.min' if mini else '')+'.css'
                marker='data-uibms' if scoped else ''
                groups=[]
                sized_icon=icon.replace('viewBox=', 'width="20" height="20" viewBox=')
                for density in ('compact','default','spacious'):
                    for direction in ('ltr','rtl'):
                        for size in (12,24):
                            for shape in ('sharp','default','pill'):
                                style=f'font-size:{size}px;line-height:1.6'
                                if shape=='pill':style+=';--radius:calc(var(--target-size) + 1lh + var(--space))'
                                groups.append(f'<section data-density="{density}" dir="{direction}" data-shape="{shape if shape!="pill" else "default"}" data-test-shape="{shape}" style="{style}"><button data-test="leading">{icon}<span>Approve</span></button><button data-test="trailing"><span>Approve</span>{icon}</button><button data-test="only" aria-label="Approve">{icon}</button><button data-test="label"><span>Approve</span></button><button data-test="plain">Approve</button><button data-test="sized">{sized_icon}<span>Approve</span></button></section>')
                load([file],scoped,'<!doctype html><link rel="stylesheet" href="/dist/'+file+'"><main '+marker+'>'+''.join(groups)+'</main>')
                result=page.evaluate('''()=>{
                    const exact=CSS.supports('margin-inline','calc(1cap + 1px * (1px / 1px) * (1 - pi / 4))');
                    const metric=CSS.supports('inline-size','1lh'),near=(a,b)=>Math.abs(a-b)<.8,failures=[];
                    for(const group of document.querySelectorAll('[data-test-shape]')){
                      const get=key=>group.querySelector('[data-test="'+key+'"]'),s=e=>getComputedStyle(e),box=e=>e.getBoundingClientRect();
                      const a=get('leading'),b=get('trailing'),o=get('only'),l=get('label'),p=get('plain'),x=get('sized');
                      const sa=s(a),ia=a.querySelector('svg'),ib=b.querySelector('svg'),label=a.querySelector('span'),border=parseFloat(sa.borderTopWidth),lh=parseFloat(sa.lineHeight);
                      const pad=parseFloat(s(p).paddingInlineStart),half=(box(a).height-2*border)/2,r=Math.min(Math.max(0,parseFloat(sa.borderTopLeftRadius)-border),half);
                      const edge=exact?r*(1-Math.PI/4)*r/half:0,inset=exact?(half-lh/2-pad)*r/half:0;
                      const rtl=sa.direction==='rtl',start=(e,i)=>rtl?box(e).right-box(i).right:box(i).left-box(e).left,end=(e,i)=>rtl?box(i).left-box(e).left:box(e).right-box(i).right;
                      const actual=[near(box(ia).width,metric?lh:parseFloat(sa.fontSize)),near(box(ia).height,box(ia).width),near(box(ib).width,box(ia).width),near(box(o).width,box(o).height),
                        box(a).height>=43.5,near(parseFloat(s(label).marginInlineEnd),edge),near(parseFloat(s(ia).marginInlineStart),inset),
                        near(parseFloat(s(ib).marginInlineEnd),inset),near(parseFloat(s(l.querySelector('span')).marginInlineStart),edge),
                        near(parseFloat(s(x.querySelector('span')).marginInlineStart),0),near(box(x.querySelector('svg')).width,20)];
                      if(exact&&group.dataset.testShape==='pill')actual.push(near(start(a,ia),box(ia).top-box(a).top),near(end(b,ib),box(ib).top-box(b).top));
                      if(actual.some(x=>!x))failures.push({shape:group.dataset.testShape,density:group.dataset.density,dir:group.dir,size:sa.fontSize,failed:actual.map((ok,i)=>ok?null:i).filter(i=>i!==null)});
                      // The optional material engine appends an aria-hidden span.
                      const original=s(ia).marginInlineStart,decoration=document.createElement('span');decoration.setAttribute('aria-hidden','true');decoration.style.position='absolute';a.append(decoration);
                      if(s(ia).marginInlineStart!==original)failures.push({decoration:'changed icon geometry'});
                    }
                    return failures;
                }''')
                check(file+' optical button geometry, density, typography, direction, explicit size and decorative layer',result,[])
    # A bounded local workload for comparison, not a real-device performance claim.
    for file in ('uibms.min.css','uibms.full.min.css','uibms.scoped.min.css','uibms.scoped.full.min.css'):
        scoped='scoped' in file; marker='data-uibms' if scoped else ''
        markup='<!doctype html><link rel="stylesheet" href="/dist/'+file+'"><main '+marker+' data-theme="light" id="app"><div class="grid">'+('<article class="card stack"><h2>Workspace</h2><p>Sample content</p><button>Continue</button></article>'*500)+'</div></main>'
        load([file],scoped,markup)
        values=page.evaluate('''()=>{let a=[];let el=document.getElementById('app');for(let i=0;i<12;i++){let t=performance.now();el.dataset.theme=i%2?'light':'dark';document.body.getBoundingClientRect();getComputedStyle(el.lastElementChild.lastElementChild).backgroundColor;a.push(performance.now()-t)}return a.slice(2)}''')
        perf[file]=round(median(values),2)
    browser_version=browser.version;browser.close()
summary={'engine':args.browser,'version':browser_version,'passed':sum(x['passed'] for x in checks),'total':len(checks),'checks':checks,'synthetic_500_cards_median_ms':perf}
print('RESULT',summary['passed'],'/',summary['total'],'synthetic ms',perf,flush=True)
if args.report: args.report.write_text(json.dumps(summary,indent=2)+'\n')
if summary['passed']!=summary['total']: raise SystemExit(1)
