"""Verify GEO-002 relationships against the generated bundles and optional CSS.
Run: python tests/geometry.py --browser chromium [--executable /usr/bin/chromium]
Native elements remain authoritative; no material or component JS is required
for the CSS fixture. Real-origin controller interactions are tested separately.
"""
from pathlib import Path
import argparse
from itertools import product
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--browser", choices=("chromium","firefox","webkit"), default="chromium")
parser.add_argument("--executable")
args = parser.parse_args()
OPTIONAL = [
    "components/chips.css", "components/segmented.css", "components/dropdown.css",
    "components/stepper.css", "components/pagination.css", "components/command.css",
    "dashboard/app-shell.css", "dashboard/sidebar.css", "dashboard/topbar.css",
    "dashboard/split-workspace.css", "dashboard/progress-ring.css",
    "dashboard/sparkline.css", "dashboard/metrics.css", "forms.css",
    "liquid-silicone.css",
]
ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>'
# Test all three density profiles, zero and nonzero radii, local type,
# physical/logical direction, plus explicit border and target overrides.
def cases():
    return product(("compact","default","spacious"), ("sharp","default","organic"), ("ltr","rtl"), (12,24))

def case_markup(i, case, optional):
    density, shape, direction, size = case
    style = f"font-size:{size}px;line-height:1.6;--border-width:{1+i%3}px"
    core = '''<details open><summary>Details</summary><p>Content</p></details>
      <article class="card"><img alt="" width="90" height="40" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='40'/%3E"></article>
      <textarea rows="2" aria-label="Notes"></textarea>
      <label><input type="checkbox"> Label</label>
      <select aria-label="Picker"><option>First</option><option>Middle</option><option>Last</option></select>
      <h2>Title</h2><p><kbd>Enter</kbd></p>'''
    extra = f'''<div class="segmented" role="radiogroup" aria-label="Period">
      <label><input type="radio" name="period-{i}" checked> Daily</label><label><input type="radio" name="period-{i}"> Weekly</label></div>
      <div class="dropdown" role="menu" popover="manual" aria-label="Menu"><button role="menuitem">First</button><button role="menuitem">Middle</button><button role="menuitem">Last</button></div>
      <ul class="chips"><li>Removable <button type="button" name="remove-chip" aria-label="Remove">×</button></li></ul>
      <ol class="stepper"><li><button type="button">Step</button></li></ol>
      <nav class="pagination" aria-label="Pages"><ul><li><a href="#top" aria-label="Previous">{ICON}</a></li></ul></nav>
      <div class="app-shell" data-uibms-shell-ready style="width:720px;max-width:100%;--dashboard-height:150px"><header><button class="sidebar-toggle" aria-expanded="false">Menu</button></header><nav><ul><li><a href="#top">{ICON}<span>Overview</span></a></li></ul></nav><main>Content</main></div>
      <div class="split-workspace" data-uibms-split-ready style="width:720px;max-width:100%"><section>One</section><div role="separator" aria-controls="pane-{i}" aria-label="Resize"></div><section id="pane-{i}">Two</section></div>
      <div data-uibms-form-control><input type="text" data-uibms-form-source aria-label="Field" style="width:100%"><button data-uibms-form-trigger type="button" aria-label="Pick"></button></div>
      <div data-uibms-form-control data-uibms-form-kind="color"><input data-uibms-form-source type="color" aria-label="Color"><span data-uibms-form-color-face><span data-uibms-form-color-chip></span><span data-uibms-form-color-text>#123456</span></span><button data-uibms-form-trigger type="button" aria-label="Pick color"></button></div>
      <input type="range" data-uibms-material-native aria-label="Range">
      <figure class="sparkline"><svg viewBox="0 0 100 40"><polyline points="0,40 100,0"/></svg></figure>'''
    return f'<section data-case="{i}" data-density="{density}" data-shape="{shape}" dir="{direction}" style="{style}">{core}{extra if optional else ""}</section>'

# Use actual computed dimensions, including UA border rounding, rather than
# merely comparing token strings or testing one fixed pixel result.
CORE_CHECKS = r"""()=>{
    const failures=[];let checks=0;
    const px=(s,k)=>parseFloat(s[k]),s=e=>getComputedStyle(e),box=e=>e.getBoundingClientRect();
    const equal=(caseId,name,actual,expected,tol=.85)=>{
      checks++;if(!Number.isFinite(actual)||Math.abs(actual-expected)>tol)failures.push({caseId,name,actual,expected});
    };
    for(const g of document.querySelectorAll('[data-case]')){
      const id=g.dataset.case,q=sel=>g.querySelector(sel);
      const d=s(q('details')),summary=s(q('summary')),radius=px(d,'borderTopLeftRadius'),pad=px(d,'paddingTop'),bw=px(d,'borderTopWidth');
      const space=pad/.75;
      equal(id,'inset summary radius',px(summary,'borderTopLeftRadius'),Math.max(0,radius-pad-bw));
      const card=s(q('article.card')),img=s(q('article img'));
      equal(id,'inset media radius',px(img,'borderTopLeftRadius'),Math.max(0,px(card,'borderTopLeftRadius')-px(card,'paddingTop')-px(card,'borderTopWidth')));
      const t=s(q('textarea')),lh=px(t,'lineHeight'),height=4*lh+px(t,'paddingTop')+px(t,'paddingBottom')+px(t,'borderTopWidth')+px(t,'borderBottomWidth');
      equal(id,'four-line editing space',px(t,'minBlockSize'),Math.max(44,height));
      const cb=s(q('label > input[type=checkbox]'));
      equal(id,'checkbox follows line height',px(cb,'inlineSize'),Math.min(44,px(cb,'lineHeight')));
      equal(id,'checkbox square',px(cb,'blockSize'),px(cb,'inlineSize'));
      equal(id,'checkbox label retains target',Math.max(44,box(q('label')).height),box(q('label')).height);
      const heading=s(q('h2'));
      equal(id,'heading start rhythm',px(heading,'marginBlockStart'),Math.max(space*1.5,px(heading,'lineHeight')*.5));
      equal(id,'heading end rhythm',px(heading,'marginBlockEnd'),Math.max(space*.5,px(heading,'lineHeight')*.25));
      const kbd=s(q('kbd'));
      equal(id,'inline code radius bound',px(kbd,'borderTopLeftRadius'),Math.min(radius*.5,px(kbd,'lineHeight')*.5));
      if(CSS.supports('appearance','base-select')&&CSS.supports('selector(::picker(select))')){
        const select=q('select'),picker=getComputedStyle(select,'::picker(select)'),
          inset=Math.max(0,px(picker,'borderTopLeftRadius')-px(picker,'paddingTop')-px(picker,'borderTopWidth'));
        equal(id,'picker edge radius',px(s(q('option:first-child')),'borderStartStartRadius'),inset);
        equal(id,'picker middle radius stays independent',px(s(q('option:nth-child(2)')),'borderStartStartRadius'),radius);
        equal(id,'picker last radius',px(s(q('option:last-child')),'borderEndEndRadius'),inset);
      }
    }
    return {checks,failures};
}"""
OPTIONAL_CHECKS = r"""()=>{
    const failures=[];let checks=0;
    const px=(s,k)=>parseFloat(s[k]),s=e=>getComputedStyle(e),box=e=>e.getBoundingClientRect();
    const equal=(caseId,name,actual,expected,tol=.85)=>{
      checks++;if(!Number.isFinite(actual)||Math.abs(actual-expected)>tol)failures.push({caseId,name,actual,expected});
    };
    for(const g of document.querySelectorAll('[data-case]')){
      const id=g.dataset.case,q=sel=>g.querySelector(sel),base=s(q('details')),space=px(base,'paddingTop')/.75,radius=px(base,'borderTopLeftRadius'),border=px(base,'borderTopWidth');
      const seg=s(q('.segmented')),label=s(q('.segmented > label'));
      equal(id,'concentric segment',px(label,'borderTopLeftRadius'),Math.max(0,px(seg,'borderTopLeftRadius')-px(seg,'paddingTop')-px(seg,'borderTopWidth')));
      equal(id,'segment target',Math.max(44,box(q('.segmented > label')).height),box(q('.segmented > label')).height);
      const menu=s(q('.dropdown')),inner=Math.max(0,px(menu,'borderTopLeftRadius')-px(menu,'paddingTop')-px(menu,'borderTopWidth'));
      equal(id,'menu first corner',px(s(q('.dropdown > :first-child')),'borderStartStartRadius'),inner);
      equal(id,'menu middle radius independent',px(s(q('.dropdown > :nth-child(2)')),'borderStartStartRadius'),radius);
      equal(id,'menu last corner',px(s(q('.dropdown > :last-child')),'borderEndEndRadius'),inner);
      const chip=s(q('.chips > li')),remove=q('.chips button'),rs=s(remove);
      equal(id,'logical remove edge',px(rs,'marginInlineEnd'),space*.2-px(chip,'paddingInlineEnd'));
      equal(id,'logical remove start',px(rs,'marginInlineStart'),0);
      equal(id,'remove block margin',px(rs,'marginBlockStart'),-px(chip,'paddingBlockStart'));
      equal(id,'remove target width',Math.max(44,box(remove).width),box(remove).width);
      equal(id,'remove target height',Math.max(44,box(remove).height),box(remove).height);
      const step=q('.stepper button'),pseudo=getComputedStyle(step,'::before');
      equal(id,'step counter height',px(pseudo,'blockSize'),Math.max(px(s(step),'lineHeight'),px(pseudo,'minInlineSize')));
      equal(id,'step counter square',px(pseudo,'inlineSize'),px(pseudo,'blockSize'));
      const pi=q('.pagination svg');
      equal(id,'pagination icon follows type',box(pi).width,px(s(pi),'lineHeight'));
      equal(id,'pagination icon square',box(pi).width,box(pi).height);
      const side=q('.app-shell > nav'),ss=s(side),a=q('.app-shell nav a'),target=44;
      const rail=Math.max(64,target+px(ss,'paddingInlineStart')+px(ss,'paddingInlineEnd')+px(ss,'borderInlineEndWidth'));
      equal(id,'density-aware rail width',box(side).width,rail);
      equal(id,'rail preserves control target',Math.max(44,box(a).width),box(a).width);
      const icon=a.querySelector('svg');
      equal(id,'sidebar icon follows type',box(icon).width,Math.min(44,px(s(icon),'lineHeight')));
      const split=q('.split-workspace'),handle=q('[role=separator]');
      equal(id,'density-aware split gutter',box(handle).width,Math.max(20,space*1.25));
      equal(id,'split grip width',px(getComputedStyle(handle,'::after'),'inlineSize'),Math.max(2,border*3));
      const field=q('[data-uibms-form-control]'),input=field.querySelector('input'),trigger=field.querySelector('button');
      equal(id,'picker reserves actual trigger',px(s(input),'paddingInlineEnd'),box(trigger).width+px(s(trigger),'insetInlineEnd')+border);
      const color=q('[data-uibms-form-kind=color]'),ci=color.querySelector('input'),ct=color.querySelector('button');
      equal(id,'color target stays clear of trigger',g.dir==='rtl'?Math.max(0,box(ct).right-box(ci).left):Math.max(0,box(ci).right-box(ct).left),0);
      const swatch=color.querySelector('[data-uibms-form-color-chip]');
      equal(id,'swatch follows font metrics',box(swatch).height,px(s(swatch),'lineHeight'));
      const plot=q('.sparkline > svg');
      equal(id,'sparkline height follows type',box(plot).height,Math.max(56,2*px(s(plot),'lineHeight')));
      const range=q('input[type=range]');
      const probe=document.createElement('span');probe.style.cssText='position:absolute;visibility:hidden;inline-size:var(--_uibms-range-track-size);block-size:var(--_uibms-range-thumb-size)';
      // Custom properties are local to the replaced input. Copy their computed
      // token expressions to the probe; don't claim browser pseudo paint bounds.
      for(const key of ['--_uibms-range-track-size','--_uibms-range-thumb-size'])probe.style.setProperty(key,s(range).getPropertyValue(key));
      g.append(probe);
      equal(id,'range track derives from target',box(probe).width,44*.18);
      equal(id,'range thumb derives from target',box(probe).height,44*.62);probe.remove();
    }
    return {checks,failures};
}"""
RING_CHECKS = r"""()=>{
    let checks=0;const failures=[],modern=CSS.supports('r','calc(46px - 8px / 2)')&&CSS.supports('width','calc(1px * (1px / 1px))');
    for(const e of document.querySelectorAll('[data-ring]')){
      const stroke=+e.dataset.ring,c=e.querySelector('circle'),r=c.getBBox().width/2,expected=modern?46-Math.min(90,Math.max(0,stroke))/2:42;
      checks++;if(Math.abs(r-expected)>.01)failures.push({stroke,r,expected});
    }
    return {checks,failures};
}"""

def run_result(page, script, label):
    result = page.evaluate(script)
    if result["failures"]:
        raise AssertionError(f"{label}: {result['failures'][:20]}")
    return result["checks"]

with sync_playwright() as p:
    opts={"headless":True}
    if args.executable: opts["executable_path"]=args.executable
    if args.browser=="chromium": opts["args"]=["--no-sandbox","--disable-dev-shm-usage"]
    browser=getattr(p,args.browser).launch(**opts)
    page=browser.new_page(viewport={"width":1280,"height":900},reduced_motion="reduce")
    total=0
    for scoped,full,mini in product((False,True),repeat=3):
        file="uibms"+(".scoped" if scoped else "")+(".full" if full else "")+(".min" if mini else "")+".css"
        style=(ROOT/"dist"/file).read_text()
        marker="data-uibms" if scoped else ""
        html="".join(case_markup(i,c,False) for i,c in enumerate(cases()))
        page.set_content(f'<!doctype html><style>{style}</style><main {marker} id="top">{html}</main>')
        count=run_result(page,CORE_CHECKS,file);total+=count
        print(file,"core geometry:",count,flush=True)
    opt_css="\n".join((ROOT/"extensions/engines"/name).read_text() for name in OPTIONAL)
    for scoped in (False,True):
        file="uibms"+(".scoped" if scoped else "")+".full.min.css"
        style=(ROOT/"dist"/file).read_text()+"\n"+opt_css
        marker="data-uibms" if scoped else ""
        # One representative matrix in each adoption mode. Keep the viewport
        # wide enough to exercise the actual desktop rail and splitter.
        html="".join(case_markup(i,c,True) for i,c in enumerate(cases()))
        ring="".join(f'<div class="progress-ring" data-ring="{v}" style="--dashboard-ring-stroke:{token}"><span class="progress-ring-face"><svg viewBox="0 0 100 100"><circle class="progress-ring-track" cx="50" cy="50" r="42"/></svg></span></div>' for v,token in [(2,"2"),(8,"8"),(24,"24px"),(24,"24%"),(90,"96")])
        page.set_content(f'<!doctype html><style>{style}</style><main {marker} id="top">{html}{ring}</main>')
        count=run_result(page,OPTIONAL_CHECKS,file+" optional")
        count+=run_result(page,RING_CHECKS,file+" ring")
        total+=count
        print(file,"optional geometry:",count,flush=True)
    print(f"{args.browser}: {total} GEO-002 relationship checks passed",flush=True)
    browser.close()
