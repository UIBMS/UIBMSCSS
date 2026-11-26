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
            for palette in ["natural","ocean","gold","forest","bordeaux","slate","royal","terracotta","cobalt-archive","glacier-ember","peach-reactor","midnight-marigold","graphite-punch"]:
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
        page.wait_for_selector("#site-search[data-uibms-material-overlay]",state="attached")
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
        # Experimental palette CSS is also available in the isolated scoped example.
        set_profile(page,palette="cobalt-archive",theme="dark",material="default")
        iframe.locator('[data-uibms][data-palette="cobalt-archive"]').wait_for()
        check(iframe.locator('[data-uibms]').evaluate("e=>getComputedStyle(e).getPropertyValue('--color-main').includes('oklch')"),"expressive scoped palette resolved")
        check(iframe.locator("body > button").evaluate("e=>getComputedStyle(e).borderRadius")=="0px","expressive scope does not affect host")
        page.goto(url+"docs/palette/",wait_until="load")
        page.wait_for_selector("html[data-site-ready]",state="attached")
        set_profile(page,material="default",effects="none",theme="light")
        for palette in ["cobalt-archive","glacier-ember","peach-reactor","midnight-marigold","graphite-punch"]:
            check(page.locator("#appearance-palette option[value="+palette+"]").count()==1,"appearance option "+palette)
            set_profile(page,palette=palette)
            sample=page.locator('[data-site-demo-content] > section[data-palette="'+palette+'"][data-theme]').first
            button=sample.locator("button").first
            button.scroll_into_view_if_needed()
            page.mouse.move(0,0)
            rest=button.evaluate("e=>getComputedStyle(e).backgroundColor")
            button.hover()
            hover=button.evaluate("e=>getComputedStyle(e).backgroundColor")
            check(rest!=hover,"subtle hover "+palette,[rest,hover])
            page.mouse.down()
            active=button.evaluate("e=>getComputedStyle(e).backgroundColor")
            check(active!=hover and active!=rest,"loud pressed colour "+palette,[rest,hover,active])
            page.mouse.up()
            check_width(page,"expressive "+palette)
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
        # Use an actual touch-capable, mobile context, with motion permitted.
        mobile=browser.new_context(viewport={"width":390,"height":844},has_touch=True,is_mobile=True,device_scale_factor=2,color_scheme="light",reduced_motion="no-preference")
        phone=mobile.new_page()
        phone.set_default_timeout(12000)
        touch_errors=[]
        phone.on("pageerror",lambda error:touch_errors.append(str(error)))
        phone.goto(url+"docs/buttons/",wait_until="load")
        phone.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(phone,material="liquid-silicone",effects="default")
        button=phone.locator("[data-site-demo-content] button[type=button]:not(:disabled)").first
        button.wait_for()
        phone.wait_for_function("()=>document.querySelector('[data-site-demo-content] button[type=button]')?.matches('[data-uibms-material-host],[data-uibms-material-native]')")
        def monitor(locator):
            locator.evaluate("""el=>{
                window.__touchSample={min:0,max:0,last:0,frames:0,restFrames:0};
                const sample=window.__touchSample;
                const loop=()=>{
                    if(window.__touchSample!==sample)return;
                    const layer=el.querySelector(':scope > [data-uibms-material-layer]');
                    const f=Number((layer?.style.getPropertyValue('--_uibms-material-force')||el.style.getPropertyValue('--_uibms-material-force')||'0').trim());
                    sample.min=Math.min(sample.min,f);sample.max=Math.max(sample.max,f);
                    sample.last=f;sample.frames++;
                    // An underdamped spring crosses zero before settling.
                    // Require sustained exact rest and cleared live DOM contact state.
                    sample.restFrames=f===0&&!el.hasAttribute('data-uibms-material-contact')?sample.restFrames+1:0;
                    requestAnimationFrame(loop);
                };
                requestAnimationFrame(loop);
            }""")
        monitor(button)
        button.tap()
        phone.wait_for_function("()=>window.__touchSample.max>.04&&window.__touchSample.min<-.04")
        phone.wait_for_function("()=>window.__touchSample.restFrames>=8")
        check(True,"real mobile tap attracts, compresses and releases")
        check(button.evaluate("e=>getComputedStyle(e).outlineStyle==='none'||!e.matches(':focus')"),"touch leaves no focused ghost outline")
        # Test repeated activation and keyboard focus without removing the native focus.
        monitor(button)
        button.tap()
        button.tap()
        phone.wait_for_function("()=>window.__touchSample.min<-.04")
        phone.wait_for_function("()=>window.__touchSample.restFrames>=8")
        phone.keyboard.press("Tab")
        check(button.get_attribute("data-uibms-touch-focus") is None,"keyboard clears touch-only focus marker")
        check(phone.evaluate("()=>document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle!=='none'"),"keyboard focus indicator retained")
        phone.goto(url+"docs/tables/",wait_until="load")
        phone.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(phone,material="liquid-silicone",effects="default")
        table=phone.locator("[data-site-demo-content] table").first
        cell=table.locator("tbody td").first
        phone.wait_for_function("()=>document.querySelector('[data-site-demo-content] table')?.hasAttribute('data-uibms-material-table')")
        check(table.locator('th[data-uibms-material-native],td[data-uibms-material-native],tr[data-uibms-material-native],thead[data-uibms-material-native],tbody[data-uibms-material-native],tfoot[data-uibms-material-native],caption[data-uibms-material-native]').count()==0,"only the table has physical material")
        before=cell.evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,display:getComputedStyle(e).display,border:getComputedStyle(e).borderBottomWidth,collapse:getComputedStyle(e.closest('table')).borderCollapse})")
        monitor(table)
        cell.tap()
        phone.wait_for_function("()=>window.__touchSample.max>.04")
        check(cell.evaluate("e=>!e.style.getPropertyValue('--_uibms-material-force')&&!e.hasAttribute('data-uibms-material-contact')"),"cell has no independent spring")
        phone.wait_for_function("()=>window.__touchSample.restFrames>=8")
        check(table.evaluate("e=>!e.hasAttribute('data-uibms-material-contact')"),"table contact clears")
        check(table.locator('[data-uibms-table-light]').count()==0,"touch lighting clears")
        after=cell.evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,display:getComputedStyle(e).display,border:getComputedStyle(e).borderBottomWidth,collapse:getComputedStyle(e.closest('table')).borderCollapse})")
        check(before==after,"native table layout and borders preserved",[before,after])
        check(table.locator("[data-uibms-material-layer]").count()==0,"native table has no injected contour markup")
        # Hold an actual touch to verify a single table spring, flat row/cell lighting and cancellation.
        if args.browser=="chromium":
            cell.scroll_into_view_if_needed()
            box=cell.bounding_box()
            x,y=box["x"]+box["width"]/2,box["y"]+box["height"]/2
            session=mobile.new_cdp_session(phone)
            monitor(table)
            session.send("Input.dispatchTouchEvent",{"type":"touchStart","touchPoints":[{"x":x,"y":y}]})
            phone.wait_for_function("()=>window.__touchSample.max>.04")
            check(cell.get_attribute("data-uibms-table-light")=="cell","contact illuminates cell without deformation")
            check(cell.locator("..").get_attribute("data-uibms-table-light")=="row","contact illuminates row")
            check(cell.evaluate("e=>!e.style.getPropertyValue('--_uibms-material-force')"),"held cell does not compress")
            session.send("Input.dispatchTouchEvent",{"type":"touchCancel","touchPoints":[]})
            phone.wait_for_function("()=>window.__touchSample.restFrames>=8")
            check(table.locator('[data-uibms-table-light]').count()==0,"pointer cancellation clears lighting")
        set_profile(phone,material="default")
        phone.wait_for_function("()=>!document.querySelector('[data-site-demo-content] table').hasAttribute('data-uibms-material-table')")
        check(table.locator('[data-uibms-table-light]').count()==0,"material opt-out clears table lighting")
        # Desktop pointer feedback: one table attraction, one row light and one cell light.
        desktop=browser.new_context(viewport={"width":1280,"height":900},reduced_motion="no-preference")
        desktop_page=desktop.new_page()
        desktop_page.on("pageerror",lambda error:touch_errors.append(str(error)))
        desktop_page.goto(url+"docs/tables/",wait_until="load")
        desktop_page.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(desktop_page,material="liquid-silicone",effects="default")
        dtable=desktop_page.locator("[data-site-demo-content] table").first
        dcell=dtable.locator("tbody td").first
        desktop_page.wait_for_function("()=>document.querySelector('[data-site-demo-content] table')?.hasAttribute('data-uibms-material-table')")
        dcell.hover()
        desktop_page.wait_for_function("()=>Number(document.querySelector('[data-site-demo-content] table').style.getPropertyValue('--_uibms-material-force'))>.04")
        check(dcell.get_attribute("data-uibms-table-light")=="cell","desktop cell light")
        check(dtable.locator('[data-uibms-table-light="row"]').count()==1,"one highlighted row")
        check(dtable.locator('[data-uibms-table-light="cell"]').count()==1,"one highlighted cell")
        check(dcell.evaluate("e=>!e.style.getPropertyValue('--_uibms-material-force')"),"desktop cell never has spring")
        dtable.locator("tbody td").nth(1).hover()
        check(dcell.get_attribute("data-uibms-table-light") is None,"previous cell light clears")
        desktop_page.mouse.move(0,0)
        desktop_page.wait_for_function("()=>!document.querySelector('[data-site-demo-content] table').hasAttribute('data-uibms-material-contact')")
        check(dtable.locator('[data-uibms-table-light]').count()==0,"mouse leave clears flat lighting")
        desktop.close()
        # Both native overlays share a passive spring and preserve their browser lifecycle.
        for slug,trigger,selector in [
            ("dialogs","#open-native-dialog","#native-dialog"),
            ("popovers",'button[popovertarget="native-popover-demo"]:not([popovertargetaction])',"#native-popover-demo")
        ]:
            phone.goto(url+"docs/"+slug+"/",wait_until="load")
            phone.wait_for_selector("html[data-site-engines-ready]",state="attached")
            set_profile(phone,material="liquid-silicone",effects="default")
            overlay=phone.locator(selector)
            check(overlay.get_attribute("data-uibms-material-overlay") is None,slug+" closed overlay is not a physical surface")
            phone.locator(trigger).tap()
            overlay.wait_for(state="visible")
            phone.wait_for_function("sel=>document.querySelector(sel)?.hasAttribute('data-uibms-material-overlay')",arg=selector)
            phone.wait_for_function("sel=>document.querySelector(sel)?.hasAttribute('data-uibms-overlay-contour')",arg=selector)
            check(overlay.evaluate("e=>getComputedStyle(e).overflow==='visible'"),slug+" fitted overlay has no side scrollbars")
            check(overlay.evaluate("e=>e.offsetWidth<=innerWidth-20"),slug+" fits mobile viewport")
            check(overlay.evaluate("e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'"),slug+" original rectangular fill is not painted behind contour")
            # A styled passive child must remain flat, while a real control stays pressable.
            overlay.evaluate("""el=>{
              const panel=document.createElement('div');panel.className='panel';
              panel.textContent='Passive content';panel.setAttribute('data-test-overlay-panel','');
              const action=document.createElement('button');action.type='button';action.textContent='Test action';action.setAttribute('data-test-overlay-action','');
              el.append(panel,action);
            }""")
            passive=overlay.locator("[data-test-overlay-panel]")
            action=overlay.locator("[data-test-overlay-action]")
            phone.wait_for_function("sel=>document.querySelector(sel+' [data-test-overlay-action]')?.hasAttribute('data-uibms-material-host')||document.querySelector(sel+' [data-test-overlay-action]')?.hasAttribute('data-uibms-material-native')",arg=selector)
            check(passive.get_attribute("data-uibms-material-host") is None and passive.get_attribute("data-uibms-material-native") is None,slug+" passive panel has no spring")
            before=overlay.evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,radius:getComputedStyle(e).borderRadius,overflow:getComputedStyle(e).overflow})")
            outline=overlay.locator(":scope > [data-uibms-overlay-layer] [data-uibms-overlay-outline]")
            resting=outline.get_attribute("d")
            monitor(overlay)
            passive.tap()
            phone.wait_for_function("()=>window.__touchSample.max>.04")
            phone.wait_for_function("([sel,d])=>document.querySelector(sel+' > [data-uibms-overlay-layer] [data-uibms-overlay-outline]')?.getAttribute('d')!==d",arg=[selector,resting])
            phone.wait_for_function("()=>window.__touchSample.restFrames>=8")
            check(phone.evaluate("()=>window.__touchSample.min>=0"),slug+" passive surface never compresses")
            check(passive.get_attribute("data-uibms-overlay-light") is None,slug+" contact light clears")
            after=overlay.evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,radius:getComputedStyle(e).borderRadius,overflow:getComputedStyle(e).overflow})")
            check(before==after,slug+" native overlay geometry preserved")
            check(outline.get_attribute("d")==resting,slug+" silhouette recovers exactly")
            monitor(action)
            action.tap()
            phone.wait_for_function("()=>window.__touchSample.max>.04&&window.__touchSample.min<-.04")
            phone.wait_for_function("()=>window.__touchSample.restFrames>=8")
            check(True,slug+" nested button independently attracts and compresses")
            # Genuine content overflow must remain reachable.
            overlay.evaluate("""el=>{
                const extra=document.createElement('div');extra.setAttribute('data-test-long-overlay','');
                for(let i=0;i<45;i++){const p=document.createElement('p');p.textContent='Additional content '+i;extra.append(p);}el.append(extra);
            }""")
            phone.wait_for_function("sel=>!document.querySelector(sel)?.hasAttribute('data-uibms-overlay-contour')",arg=selector)
            check(overlay.evaluate("e=>getComputedStyle(e).overflowY==='auto'&&e.scrollHeight>e.clientHeight"),slug+" long content keeps native scrolling")
            overlay.evaluate("e=>{e.scrollTop=e.scrollHeight}")
            check(overlay.evaluate("e=>e.scrollTop>0"),slug+" long content can scroll")
            overlay.locator("[data-test-long-overlay]").evaluate("e=>e.remove()")
            phone.wait_for_function("sel=>document.querySelector(sel)?.hasAttribute('data-uibms-overlay-contour')",arg=selector)
            # Desktop-style keyboard dismissal still works in a touch-capable context.
            phone.keyboard.press("Escape")
            overlay.wait_for(state="hidden")
            phone.wait_for_function("sel=>!document.querySelector(sel)?.hasAttribute('data-uibms-material-overlay')",arg=selector)
            check(overlay.locator("[data-uibms-overlay-light],[data-uibms-material-contact]").count()==0,slug+" closed overlay clears state")
            phone.locator(trigger).tap()
            overlay.wait_for(state="visible")
            phone.wait_for_function("sel=>document.querySelector(sel)?.hasAttribute('data-uibms-material-overlay')",arg=selector)
            check(overlay.evaluate("e=>Number(e.style.getPropertyValue('--_uibms-material-force')||0)===0"),slug+" reopens at rest")
            if slug=="popovers":
                # Native light dismissal, not a synthetic close handler.
                phone.touchscreen.tap(2,2)
                overlay.wait_for(state="hidden")
            else:
                overlay.get_by_role("button",name="Close",exact=True).tap()
                overlay.wait_for(state="hidden")
            phone.wait_for_function("sel=>!document.querySelector(sel)?.hasAttribute('data-uibms-material-overlay')",arg=selector)
        # Images and the control-free video use true texture deformation;
        # browser-native controls remain native. Force GPU failure in a second context.
        phone.goto(url+"docs/media/",wait_until="load")
        phone.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(phone,material="liquid-silicone",effects="default")
        image=phone.locator("[data-site-demo-content] img").first
        phone.wait_for_function("()=>document.querySelector('[data-site-demo-content] img')?.hasAttribute('data-uibms-material-media')")
        before=image.evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,src:e.currentSrc,alt:e.alt,tag:e.parentElement.tagName})")
        monitor(image)
        image.tap()
        phone.wait_for_function("()=>window.__touchSample.max>.04")
        phone.wait_for_function("()=>window.__touchSample.restFrames>=8")
        check(phone.evaluate("()=>window.__touchSample.min>=0"),"image is passive on touch")
        check(image.get_attribute("data-uibms-media-rendered") is None,"image native at rest")
        check(before==image.evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,src:e.currentSrc,alt:e.alt,tag:e.parentElement.tagName})"),"image dimensions, source and parent unchanged")
        check_width(phone,"media mobile")
        for fallback in [False,True]:
            media_page=browser.new_context(viewport={"width":1280,"height":900},reduced_motion="no-preference")
            if fallback:
                media_page.add_init_script("""(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2')return null;return orig.call(this,type,...args);};})()""")
            mp=media_page.new_page()
            mp.on("pageerror",lambda error:touch_errors.append(str(error)))
            mp.goto(url+"docs/media/",wait_until="load")
            mp.wait_for_selector("html[data-site-engines-ready]",state="attached")
            set_profile(mp,material="liquid-silicone",effects="default")
            item=mp.locator("[data-site-demo-content] img").first
            item.scroll_into_view_if_needed()
            state=item.evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,parent:e.parentElement.tagName,source:e.currentSrc})")
            box=item.bounding_box()
            item.hover(position={"x":box["width"]-4,"y":box["height"]//2})
            mp.wait_for_function("()=>!!document.querySelector('[data-site-demo-content] img')?.getAttribute('data-uibms-media-rendered')")
            renderer=item.get_attribute("data-uibms-media-rendered")
            check(renderer in ["webgl","canvas2d"],"actual texture renderer",renderer)
            if fallback:
                check(renderer=="canvas2d","Canvas fallback selected when WebGL unavailable")
            elif mp.evaluate("()=>!!document.createElement('canvas').getContext('webgl')"):
                check(renderer=="webgl","WebGL selected when available")
            raster=item.locator("xpath=following-sibling::canvas[@data-uibms-media-raster][1]")
            raster.wait_for()
            check(item.evaluate("e=>getComputedStyle(e).opacity==='0'"),"original rigid pixels hidden only while raster is visible")
            # Pixel alpha beyond the original right edge proves the image itself
            # expands, rather than merely drawing a border around it.
            mp.wait_for_function("""()=>{
              const e=document.querySelector('[data-site-demo-content] img'),c=e.nextElementSibling;
              if(!c?.matches('[data-uibms-media-raster]'))return false;
              const r=e.getBoundingClientRect(),q=c.getBoundingClientRect(),x=Math.floor((r.right-q.left+3)*c.width/q.width),y=Math.floor((r.top+r.height/2-q.top)*c.height/q.height);
              return x>=0&&x<c.width&&y>=0&&y<c.height&&c.getContext('2d').getImageData(x,y,1,1).data[3]>200;
            }""")
            check(state==item.evaluate("e=>({width:e.offsetWidth,height:e.offsetHeight,parent:e.parentElement.tagName,source:e.currentSrc})"),"raster preserves native layout")
            check_width(mp,"deformed media")
            mp.mouse.move(0,0)
            mp.wait_for_function("()=>!document.querySelector('[data-site-demo-content] img').hasAttribute('data-uibms-media-rendered')")
            check(item.evaluate("e=>getComputedStyle(e).opacity==='1'"),"native image restored")
            check(mp.locator("[data-uibms-media-raster]").count()==0,"raster released at rest")
            for tag in ["video","audio"]:
                player=mp.locator("[data-site-demo-content] "+tag+"[controls]").first
                player.hover()
                frame(mp)
                check(player.evaluate("e=>e.controls&&getComputedStyle(e).opacity==='1'"),tag+" native controls remain visible")
                check(player.get_attribute("data-uibms-media-rendered") is None,tag+" native player is not rasterized")
            demo=mp.locator('[data-site-demo-run="media-deformation"]')
            video=demo.locator("video")
            demo.get_by_role("button",name="Play",exact=True).click()
            mp.wait_for_function("()=>{const v=document.querySelector('[data-site-demo-run=media-deformation] video');return v&&!v.paused&&v.readyState>=2}")
            video.hover()
            mp.wait_for_function("()=>!!document.querySelector('[data-site-demo-run=media-deformation] video')?.getAttribute('data-uibms-media-rendered')")
            check(video.evaluate("v=>!v.paused&&v.readyState>=2"),"deformable video still playing")
            demo.get_by_role("button",name="Pause",exact=True).click()
            check(video.evaluate("v=>v.paused"),"HTML controls pause the original video")
            set_profile(mp,material="default")
            mp.wait_for_function("()=>!document.querySelector('[data-site-demo-content] img').hasAttribute('data-uibms-material-media')")
            check(mp.locator("[data-uibms-media-raster]").count()==0,"material opt-out removes raster")
            media_page.close()
        check(not touch_errors,"no mobile runtime errors",touch_errors)
        mobile.close()
        browser.close()
    print(json.dumps({"browser":args.browser,"checks":checks,"passed":True},indent=2))
finally:
    server.shutdown()
