"""HTTP regression suite for material integration with the built Astro website.
Run after npm run build. This uses the real CSS/JS assets, not a simulated DOM.
Chromium is the required deployment gate; --browser webkit can also be used.
"""
import argparse
import functools
import json
import os
import re
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("--browser", choices=["chromium", "webkit"], default="chromium")
args = parser.parse_args()
dist = Path(__file__).resolve().parent.parent / "dist"
base = "/" + os.environ.get("SITE_BASE", "/UIBMSCSS/").strip("/") + "/"
if base == "//":
    base = "/"

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        if base != "/" and path.startswith(base):
            path = "/" + path[len(base):]
        return super().translate_path(path)
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(dist)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{server.server_port}{base}"
checks = 0

def check(condition, name, details=""):
    global checks
    if not condition:
        raise AssertionError(f"{name}: {details}")
    checks += 1

def frame(page):
    page.evaluate("() => new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))")

def set_profile(page, **attrs):
    page.evaluate("(attrs)=>{for(const [k,v] of Object.entries(attrs))document.documentElement.setAttribute('data-'+k,v)}", attrs)
    frame(page)

def surface(page, selector):
    return page.locator(selector).first.evaluate("""el=>{
      const c=getComputedStyle(el),r=el.getBoundingClientRect();
      const layer=el.querySelector(':scope > [data-uibms-material-layer]');
      const fill=layer?.querySelector('[data-uibms-material-fill]');
      const path=layer?.querySelector('path');
      return {color:c.color,background:c.backgroundColor,border:c.borderTopColor,
        borderWidth:c.borderTopWidth,radius:c.borderTopLeftRadius,shadow:c.boxShadow,
        font:c.fontFamily,fontSize:c.fontSize,width:r.width,height:r.height,
        tint:fill?getComputedStyle(fill).color:null,
        stroke:path?getComputedStyle(path).stroke:null,
        strokeWidth:path?getComputedStyle(path).strokeWidth:null,
        path:path?.getAttribute('d')||null,filter:layer?.style.filter||null};
    }""")

def wait_surface(page, selector, color):
    page.wait_for_function("""([sel,color])=>{
      const el=document.querySelector(sel),fill=el?.querySelector(':scope > [data-uibms-material-layer] [data-uibms-material-fill]');
      return el?.hasAttribute('data-uibms-material-host')&&fill&&getComputedStyle(fill).color===color;
    }""",arg=[selector,color])

def check_width(page, label):
    sizes=page.evaluate("()=>({scroll:document.documentElement.scrollWidth,width:innerWidth})")
    check(sizes["scroll"]<=sizes["width"]+1,"no horizontal overflow "+label,sizes)

try:
    with sync_playwright() as p:
        browser=getattr(p,args.browser).launch(headless=True)
        context=browser.new_context(viewport={"width":1280,"height":900},color_scheme="light",reduced_motion="reduce")
        page=context.new_page()
        page.set_default_timeout(10000)
        errors=[]
        page.on("pageerror",lambda error:errors.append(str(error)))
        page.goto(url,wait_until="load")
        page.wait_for_selector("html[data-site-ready]",state="attached")
        primary="#site-hero [data-site-primary]"
        card="#site-stats > .panel"
        # Every palette in both explicit schemes; the background role and foreground
        # of a primary button must remain different from the passive surface.
        for theme in ["light","dark"]:
            for palette in ["natural","ocean","gold","forest","bordeaux","slate","royal","terracotta"]:
                set_profile(page,material="default",theme=theme,palette=palette,shape="default",border="subtle",effects="none")
                page.wait_for_function("sel=>!document.querySelector(sel).hasAttribute('data-uibms-material-host')",arg=primary)
                before={s:surface(page,s) for s in [primary,card]}
                set_profile(page,material="liquid-silicone")
                for s in [primary,card]:
                    a=before[s]
                    wait_surface(page,s,a["background"])
                    b=surface(page,s)
                    check(b["color"]==a["color"],f"foreground {theme}/{palette} {s}",[a,b])
                    check(b["tint"]==a["background"],f"surface role {theme}/{palette} {s}",[a,b])
                    check(b["font"]==a["font"] and b["fontSize"]==a["fontSize"],f"typography {theme}/{palette} {s}")
                    check(abs(a["width"]-b["width"])<=1 and abs(a["height"]-b["height"])<=1,f"dimensions {theme}/{palette} {s}",[a,b])
                    check(b["stroke"]==a["border"] and b["strokeWidth"]==a["borderWidth"],f"border {theme}/{palette} {s}",[a,b])
                check_width(page,theme+"/"+palette)
        # Live profile changes with material still enabled.
        set_profile(page,shape="sharp",border="strong",density="compact",typography="technical",theme="light",palette="bordeaux")
        page.wait_for_function("sel=>{const p=document.querySelector(sel+' > [data-uibms-material-layer] path');return p&&p.getAttribute('d')&&!p.getAttribute('d').includes(' A ')}",arg=card)
        strong=surface(page,card)
        set_profile(page,border="subtle")
        page.wait_for_function("([sel,stroke])=>getComputedStyle(document.querySelector(sel+' > [data-uibms-material-layer] path')).stroke!==stroke",arg=[card,strong["stroke"]])
        check(surface(page,card)["radius"]=="0px","sharp shape preserved")
        check(page.locator("#site-header").get_attribute("data-material") is None,"header not excluded")
        check(page.locator("#site-header[data-uibms-material-native]").count()==1,"header receives in-place material")
        # Check desktop and phone widths and the actual Appearance dropdown layout.
        for width in [320,375,390,430,768,1280]:
            page.set_viewport_size({"width":width,"height":812})
            frame(page)
            check_width(page,str(width))
            if not page.locator("#site-appearance").evaluate("(e)=>e.open"):
                page.locator("#site-appearance summary").click()
            frame(page)
            check(page.locator("#site-appearance-panel [data-uibms-form-trigger]").count()==0,"single native settings control "+str(width))
            check(page.locator("#site-appearance-panel select").count()==page.evaluate("JSON.parse(document.querySelector('#site-data').textContent).profiles.length"),"all appearance settings "+str(width))
            check_width(page,"appearance "+str(width))
            page.keyboard.press("Escape")
        page.locator("#site-search-open").click()
        page.wait_for_selector("#site-search[open]")
        check(page.locator("#site-search[data-uibms-material-native]").count()==1,"search inherits material")
        page.keyboard.press("Escape")
        # The data-effect demonstrations remain their own explicit legacy materials.
        page.goto(url+"docs/materials/",wait_until="load")
        set_profile(page,material="liquid-silicone")
        for el in page.locator('[data-effect~="glass"],[data-effect~="frosted"],[data-effect~="metallic"],[data-effect~="matte"]').all():
            check(el.get_attribute("data-uibms-material-host") is None and el.get_attribute("data-uibms-material-native") is None,"legacy material is not painted twice")
        # The material lab must contain one moving selection, not per-link surfaces.
        page.goto(url+"docs/liquid-silicone/",wait_until="load")
        set_profile(page,theme="light",palette="ocean",effects="none")
        nav=page.locator('[data-site-demo-run="liquid-silicone"] nav').first
        nav.locator('[data-uibms-selection-layer]').wait_for(state="attached")
        check(nav.locator(':scope > [data-uibms-selection-layer]').count()==1,"single navigation indicator")
        nav.get_by_role("button",name="Projects").click()
        check(nav.get_by_role("button",name="Projects").get_attribute("aria-pressed")=="true","navigation selection changes")
        check(nav.locator(':scope > [data-uibms-selection-layer]').count()==1,"same selection layer reused")
        check(nav.locator('button[data-uibms-material-host]').count()==0,"navigation options remain flat")
        # Enhanced pickers inherit current context and continue using native form values.
        page.goto(url+"docs/form-engine/",wait_until="load")
        set_profile(page,theme="dark",palette="bordeaux",shape="sharp",border="subtle",density="compact",typography="technical",effects="none")
        arrow=page.locator('[data-site-demo-run="form-engine"] [data-uibms-form-kind="date"] [data-uibms-form-trigger]').first
        arrow.click()
        pop=page.locator("[data-uibms-form-popup]")
        pop.wait_for()
        for k,v in {"theme":"dark","palette":"bordeaux","shape":"sharp","border":"subtle","density":"compact","typography":"technical","effects":"none"}.items():
            check(pop.get_attribute("data-"+k)==v,"picker inherits "+k)
        set_profile(page,palette="forest",shape="organic")
        page.wait_for_function("()=>document.querySelector('[data-uibms-form-popup]')?.getAttribute('data-palette')==='forest'")
        check(pop.get_attribute("data-shape")=="organic","open picker refreshes")
        source=page.locator('[data-site-demo-run="form-engine"] input[name="date"]').first
        old=source.input_value()
        pop.locator('button[data-uibms-form-choice][aria-pressed="false"]:not(:disabled)').first.click()
        check(source.input_value()!=old,"native date updated")
        page.keyboard.press("Escape")
        check(pop.count()==0,"picker closes with Escape")
        # Validate ordinary native examples and live token/iframe synchronization.
        page.goto(url+"docs/selection/",wait_until="load")
        page.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(page,material="liquid-silicone",effects="none")
        arrow=page.locator('[data-site-demo-content] [data-uibms-form-kind="select"] [data-uibms-form-trigger]').first
        arrow.click()
        page.locator("[data-uibms-form-popup]").wait_for()
        page.locator("[data-uibms-form-popup] button[data-uibms-form-choice][aria-pressed=false]:not(:disabled)").first.click()
        check(page.locator("#select-project").input_value()=="Documentation","ordinary selection uses enhanced picker")
        page.keyboard.press("Escape")
        set_profile(page,material="default")
        page.wait_for_function("()=>!document.querySelector('#select-project').hasAttribute('data-uibms-form-source')")
        check(page.locator("#select-project").input_value()=="Documentation","native selection survives material change")
        page.goto(url+"docs/tokens/",wait_until="load")
        set_profile(page,theme="light",palette="natural")
        swatch=page.locator("[data-site-swatch]").first
        value=swatch.locator("..").locator("[data-site-swatch-value]")
        check(value.inner_text()==swatch.evaluate("e=>getComputedStyle(e).backgroundColor"),"token readout uses actual computed color")
        set_profile(page,theme="dark")
        check(value.inner_text()==swatch.evaluate("e=>getComputedStyle(e).backgroundColor"),"token readout updates with theme")
        page.goto(url+"docs/scoped/",wait_until="load")
        set_profile(page,theme="dark",palette="bordeaux",shape="sharp")
        iframe=page.frame_locator("[data-site-scope-frame]")
        iframe.locator('[data-uibms][data-palette="bordeaux"][data-theme="dark"][data-shape="sharp"]').wait_for()
        check(iframe.locator("body > button").evaluate("e=>getComputedStyle(e).borderRadius")=="0px","scoped host remains unstyled")
        # Discover every page from the generated navigation/search catalog rather
        # than a fixed count. Exercise the real HTTP site with both material modes.
        page.goto(url,wait_until="load")
        index=page.evaluate("JSON.parse(document.querySelector('#site-data').textContent).index.map(p=>p.slug)")
        profiles=page.evaluate("JSON.parse(document.querySelector('#site-data').textContent).profiles")
        check(bool(index),"generated catalog has pages")
        saved={p["key"]:p["default"] for p in profiles}
        saved.update({"theme":"dark","palette":"bordeaux","density":"compact","shape":"soft","effects":"none","material":"liquid-silicone"})
        page.evaluate("(saved)=>localStorage.setItem('uibmscss:appearance:v1',JSON.stringify(saved))",saved)
        for slug in index:
            page.set_viewport_size({"width":390,"height":812})
            page.goto(url+(slug+"/" if slug else ""),wait_until="load")
            page.wait_for_selector("html[data-site-ready][data-site-engines-ready]",state="attached")
            frame(page)
            check(page.locator("html").get_attribute("data-material")=="liquid-silicone","sitewide material "+slug)
            check(page.locator("#site-appearance-form select").count()==len(profiles),"configuration coverage "+slug)
            check_width(page,"mobile "+slug)
            check(page.locator("[data-site-preview]").count()==page.locator("[data-site-preview-context]").count(),"preview inheritance labels "+slug)
            page.set_viewport_size({"width":1280,"height":900})
            set_profile(page,material="default")
            check_width(page,"desktop "+slug)
        check(not errors,"no browser runtime errors",errors)
        browser.close()
    print(json.dumps({"browser":args.browser,"checks":checks,"passed":True},indent=2))
finally:
    server.shutdown()
