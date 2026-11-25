"""Border profile regression for all principal CSS bundles and optional palettes."""
from pathlib import Path
import argparse
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--browser',choices=['chromium','firefox','webkit'],default='chromium')
args=parser.parse_args()
dist=Path(__file__).resolve().parents[1]/'dist'
palettes=['natural','ocean','gold','forest','bordeaux','slate','royal','terracotta']
schemes=['light','dark']
modes=['subtle','default','strong']
fixture='''<div id="app" {marker}><div id="context" data-theme="light" data-palette="natural">
<article class="card" id="card">Card</article><fieldset id="structure"><legend>Group</legend><label>Field <input id="input"></label></fieldset>
<table><tbody><tr><th id="cell">Row</th><td>Content</td></tr></tbody></table>
<hr id="divider"><pre id="pre">Code</pre><div id="material" data-effect="matte">Material</div>
<div id="nested" data-palette="ocean"><article class="card" id="nested-card">Nested palette</article></div>
<div id="unknown" data-border="unknown"><article class="card" id="unknown-card">Inherits</article></div>
<div id="local" data-border="default"><article class="card" id="local-card">Default reset</article></div>
<span id="subtle" style="color:var(--color-border-subtle)"></span><span id="strong" style="color:var(--color-border-strong)"></span>
<span id="bg" style="color:var(--color-background)"></span><span id="surface" style="color:var(--color-surface)"></span><span id="panel" style="color:var(--color-surface-subtle)"></span>
</div></div>'''
measure="""() => {
 const ctx=document.createElement('canvas').getContext('2d');
 const rgb=(v)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle='#ff00ff';ctx.fillStyle=v;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3);};
 const get=(id,prop='borderTopColor')=>rgb(getComputedStyle(document.getElementById(id))[prop]);
 const obj={card:get('card'),structure:get('structure'),input:get('input'),cell:get('cell','borderBottomColor'),divider:get('divider'),pre:get('pre'),material:get('material'),nested:get('nested-card'),unknown:get('unknown-card'),local:get('local-card')};
 for(const k of ['subtle','strong','bg','surface','panel'])obj[k]=get(k,'color');
 return obj;
}"""
def lum(rgb):
    channels=[v/255 for v in rgb]
    r,g,b=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in channels]
    return .2126*r+.7152*g+.0722*b
def ratio(a,b):
    x,y=sorted([lum(a),lum(b)])
    return (y+.05)/(x+.05)
def near(a,b):
    return max(abs(x-y) for x,y in zip(a,b))<=1
def blend(a,b,t):
    return [round(x*(1-t)+y*t) for x,y in zip(a,b)]

with sync_playwright() as p:
    browser=getattr(p,args.browser).launch(headless=True)
    page=browser.new_page()
    count=0; min_contrast=100
    for bundle in sorted(dist.glob('uibms*.css')):
        scoped='.scoped' in bundle.name
        css=bundle.read_text()
        if '.full' not in bundle.name:
            suffix=('.scoped' if scoped else '')+('.min' if '.min' in bundle.name else '')+'.css'
            css+='\n'+'\n'.join((dist/'extensions/palettes'/(n+suffix)).read_text() for n in palettes[1:])
        page.set_content('<!doctype html><style>'+css+'</style>'+fixture.format(marker='data-uibms' if scoped else ''))
        page.emulate_media(contrast='no-preference')
        for palette in palettes:
            for scheme in schemes:
                for mode in modes:
                    page.locator('#context').evaluate("(e,a)=>{e.setAttribute('data-palette',a[0]);e.setAttribute('data-theme',a[1]);e.setAttribute('data-border',a[2]);}",[palette,scheme,mode])
                    v=page.evaluate(measure)
                    expect_strong=[118,120,113] if scheme=='light' else [147,154,144]
                    assert near(v['strong'],expect_strong),(bundle.name,palette,scheme,mode,'strong token',v)
                    assert near(v['input'],v['strong']),(bundle.name,palette,scheme,mode,'functional boundary',v)
                    min_contrast=min(min_contrast,*(ratio(v['input'],v[k]) for k in ['bg','surface','panel']))
                    assert min_contrast>=3,(bundle.name,palette,scheme,mode,'contrast',min_contrast)
                    structural={'subtle':0,'default':.4,'strong':1}[mode]
                    decorative={'subtle':0,'default':.15,'strong':1}[mode]
                    expect=blend(v['subtle'],v['strong'],decorative)
                    assert all(near(v[k],expect) for k in ['card','cell','divider','pre','material','unknown']),(bundle.name,palette,scheme,mode,'decorative',v,expect)
                    assert near(v['structure'],blend(v['subtle'],v['strong'],structural)),(bundle.name,palette,scheme,mode,'structural',v)
                    assert near(v['local'],blend(v['subtle'],v['strong'],.15)),(bundle.name,palette,scheme,mode,'local reset',v)
                    # A palette change without an explicit border profile retains the parent's strength.
                    ocean_subtle=[216,224,227] if scheme=='light' else [49,59,65]
                    assert near(v['nested'],blend(ocean_subtle,v['strong'],decorative)),(bundle.name,palette,scheme,mode,'nested palette',v)
                    count+=1
        page.emulate_media(contrast='more')
        page.locator('#context').evaluate("(e)=>e.setAttribute('data-border','subtle')")
        v=page.evaluate(measure)
        assert all(near(v[k],v['strong']) for k in ['card','structure','cell','divider','nested','local']),(bundle.name,'prefers-contrast',v)
        count+=1
    browser.close()
    print(f'{args.browser}: {count} border-profile cases passed; minimum functional contrast {min_contrast:.2f}:1')
