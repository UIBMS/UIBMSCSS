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
    if sizes["scroll"] > sizes["width"] + 1:
        # Report real geometry without masking any overflow or relaxing the gate.
        sizes["offenders"] = page.evaluate("""()=>{
          const root=document.documentElement;
          return [...document.querySelectorAll('body *')].flatMap(e=>{
            const r=e.getBoundingClientRect(),cs=getComputedStyle(e);
            if(!e.getClientRects().length||r.right+scrollX<=innerWidth+1&&e.scrollWidth<=e.clientWidth+1)return [];
            const ancestry=[];for(let p=e;p&&p!==root;p=p.parentElement){
              const s=getComputedStyle(p),b=p.getBoundingClientRect();
              ancestry.push({tag:p.tagName,id:p.id,cls:p.getAttribute('class'),left:Math.round(b.left),right:Math.round(b.right),overflow:s.overflowX,position:s.position,clip:s.clipPath});
              if(ancestry.length>=7)break;
            }
            return [{tag:e.tagName,id:e.id,cls:e.getAttribute('class'),right:Math.round(r.right+scrollX),width:Math.round(r.width),scroll:e.scrollWidth,client:e.clientWidth,position:cs.position,offset:e.offsetParent?.id||e.offsetParent?.className||null,ancestry}];
          }).sort((a,b)=>Math.max(b.right,b.scroll)-Math.max(a.right,a.scroll)).slice(0,12);
        }""")
    check(sizes["scroll"]<=sizes["width"]+1,"no horizontal overflow "+label,sizes)

try:
    with sync_playwright() as p:
        browser=getattr(p,args.browser).launch(headless=True)
        context=browser.new_context(viewport={"width":1280,"height":900},color_scheme="light",reduced_motion="reduce")
        page=context.new_page()
        page.set_default_timeout(10000)
        errors=[]
        page.on("pageerror",lambda error:(errors.append(str(error)),print("Browser page error:",error,flush=True)))
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
            print("Checking reference route:",slug or "home",flush=True)
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
        # Optional components are loaded only on their reference pages.
        component_context=browser.new_context(viewport={"width":1280,"height":900},reduced_motion="reduce")
        cp=component_context.new_page()
        cp.set_default_timeout(10000)
        cp.on("pageerror",lambda error:errors.append(str(error)))
        requests=[]
        capture=lambda request:requests.append(request.url)
        cp.on("request",capture)
        cp.goto(url+"docs/buttons/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        optional_engines=lambda:[request for request in requests if re.search(r"/engines/(material|forms)\.mjs",request)]
        check(not optional_engines(),"default documentation skips optional appearance scripts")
        native_drawers=cp.evaluate("()=>{const b=document.createElement('button');return 'commandForElement' in b&&'command' in b&&'closedBy' in document.createElement('dialog')}")
        drawer_requests=[request for request in requests if re.search(r"/engines/components/drawer\.mjs",request)]
        check(len(drawer_requests)==(0 if native_drawers else 1),"drawer adapter is requested only for missing native capabilities")
        other_controllers=[request for request in requests if re.search(r"/engines/(components|dashboard)/[^?]+\.mjs(?:\?|$)",request) and request not in drawer_requests]
        check(not other_controllers,"plain native controls do not request unrelated component adapters")
        set_profile(cp,material="liquid-silicone")
        cp.locator("[data-site-demo-content] button[data-uibms-material-host]").first.wait_for(state="attached")
        check(len(optional_engines())==2,"selecting Silicone loads both appearance engines once")
        set_profile(cp,material="default")
        set_profile(cp,material="liquid-silicone")
        cp.locator("[data-site-demo-content] button[data-uibms-material-host]").first.wait_for(state="attached")
        check(len(optional_engines())==2,"re-enabling appearance does not request duplicate engines")
        cp.remove_listener("request",capture)
        cp.goto(url+"docs/dialogs/",wait_until="load")
        example=cp.locator("[data-site-example]").first
        disclosure=example.locator("[data-site-preview] + details")
        source=disclosure.locator("[data-site-code]")
        check(example.locator("[data-site-demo-content]").is_visible() and
              source.count()==2 and source.first.is_hidden(),"documentation shows the demo before its source")
        disclosure.locator("summary").focus()
        cp.keyboard.press("Enter")
        check(disclosure.get_by_text("Hide code",exact=True).is_visible() and
              source.nth(0).locator("code").is_visible() and source.nth(1).locator("code").is_visible(),
              "one native disclosure reveals example markup and script")
        check(cp.locator("[data-site-preview] + details[open]").count()==1,
              "code disclosures open independently")
        cp.keyboard.press("Space")
        check(disclosure.get_by_text("Show code",exact=True).is_visible() and source.first.is_hidden(),
              "code can be collapsed with the keyboard")
        cp.goto(url+"docs/installation/",wait_until="load")
        check(cp.locator("[data-site-example] > [data-site-code]").first.is_visible(),
              "installation snippets are directly readable")
        cp.goto(url+"docs/tabs/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        tabs=cp.locator(".tabs[role=tablist]").first
        overview=tabs.get_by_role("tab",name="Overview")
        activity=tabs.get_by_role("tab",name="Activity")
        settings=tabs.get_by_role("tab",name="Settings")
        check(overview.get_attribute("aria-selected")=="true" and cp.locator("#workspace-activity-panel").is_hidden(),"tabs initialize with one visible panel")
        overview.focus()
        cp.keyboard.press("ArrowRight")
        check(activity.evaluate("e=>document.activeElement===e") and overview.get_attribute("aria-selected")=="true","tabs arrow focus is separate from selection")
        cp.keyboard.press("Enter")
        check(activity.get_attribute("aria-selected")=="true" and cp.locator("#workspace-activity-panel").is_visible() and cp.locator("#workspace-overview-panel").is_hidden(),"keyboard tab activation")
        cp.keyboard.press("End")
        check(settings.evaluate("e=>document.activeElement===e"),"End skips disabled tab")
        cp.keyboard.press("Space")
        cp.locator("#workspace-settings-panel input").fill("Custom workspace")
        overview.click()
        settings.click()
        check(cp.locator("#workspace-settings-panel input").input_value()=="Custom workspace","tab panels preserve form state")
        vertical=cp.locator('.tabs[aria-orientation=vertical]')
        vertical.get_by_role("tab",name="Summary").focus()
        cp.keyboard.press("ArrowDown")
        cp.keyboard.press("Enter")
        check(vertical.get_by_role("tab",name="Details").get_attribute("aria-selected")=="true","vertical navigation")
        set_profile(cp,material="liquid-silicone")
        cp.wait_for_function("()=>document.querySelector('.tabs').hasAttribute('data-uibms-selection-host')")
        overview.click()
        check(tabs.locator(":scope > [data-uibms-selection-layer]").count()==1,"tabs share one material selection")
        cp.set_viewport_size({"width":390,"height":812})
        check_width(cp,"tabs mobile")
        cp.goto(url+"docs/segmented/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default")
        group=cp.locator(".segmented[role=radiogroup]").first
        form=group.locator("xpath=ancestor::form")
        daily=group.get_by_role("radio",name="Daily")
        weekly=group.get_by_role("radio",name="Weekly")
        check(daily.is_checked(),"initial native radio selection")
        weekly.check()
        check(form.evaluate("e=>new FormData(e).get('report-period')")=="weekly","native radio form serialization")
        weekly.focus()
        cp.keyboard.press("ArrowRight")
        check(group.get_by_role("radio",name="Monthly").is_checked(),"native radio keyboard selection")
        form.get_by_role("button",name="Reset").click()
        check(daily.is_checked(),"native radio form reset")
        set_profile(cp,material="liquid-silicone")
        cp.wait_for_function("()=>document.querySelector('.segmented').hasAttribute('data-uibms-selection-host')")
        weekly.check()
        cp.wait_for_function("()=>document.querySelector('.segmented input[value=weekly]').checked")
        check(group.locator(":scope > [data-uibms-selection-layer]").count()==1,"segmented radios share one material selection")
        check(group.locator("input:checked").evaluate("e=>e.getBoundingClientRect().width>40"),"native radio covers full segment")
        check_width(cp,"segmented mobile")
        cp.set_viewport_size({"width":1280,"height":900})
        cp.goto(url+"docs/dropdown/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",theme="light",palette="natural")
        trigger=cp.locator("#project-actions-trigger")
        menu=cp.locator("#project-actions")
        trigger.click()
        cp.wait_for_function("()=>document.activeElement.textContent.trim()==='Edit project'")
        check(menu.is_visible() and trigger.get_attribute("aria-expanded")=="true","native dropdown opens and focuses first item")
        cp.keyboard.press("ArrowDown")
        check(menu.get_by_role("menuitem",name="Duplicate project").evaluate("e=>document.activeElement===e"),"menu arrow navigation")
        cp.keyboard.press("ArrowDown")
        check(menu.get_by_role("menuitem",name="View details").evaluate("e=>document.activeElement===e"),"menu skips disabled items")
        cp.keyboard.press("Home")
        cp.keyboard.press("v")
        check(menu.get_by_role("menuitem",name="View details").evaluate("e=>document.activeElement===e"),"menu typeahead")
        cp.keyboard.press("Escape")
        check(menu.is_hidden() and trigger.evaluate("e=>document.activeElement===e"),"Escape restores trigger focus")
        cp.keyboard.press("ArrowUp")
        cp.wait_for_function("()=>document.activeElement.textContent.trim()==='View details'")
        cp.keyboard.press("Enter")
        menu.wait_for(state="hidden")
        trigger.click()
        menu.wait_for(state="visible")
        cp.wait_for_function("()=>document.activeElement.textContent.trim()==='Edit project'&&!document.querySelector('#project-actions').hasAttribute('data-uibms-menu-positioning')")
        check(menu.evaluate("e=>{const r=e.getBoundingClientRect();return r.left>4||r.top>4}"),"dropdown positioned before accepting outside clicks")
        cp.mouse.click(4,4)
        menu.wait_for(state="hidden")
        cp.set_viewport_size({"width":390,"height":812})
        set_profile(cp,material="liquid-silicone",palette="graphite-punch",theme="dark")
        trigger.click()
        cp.wait_for_function("()=>document.querySelector('#project-actions').hasAttribute('data-uibms-material-overlay')")
        frame(cp)
        check(menu.evaluate("e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1}"),"compact material dropdown fits mobile viewport")
        cp.keyboard.press("Escape")
        check_width(cp,"dropdown mobile")
        cp.goto(url+"docs/tooltip/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default")
        hint=cp.locator("#save-hint")
        save=cp.get_by_role("button",name="Save draft",exact=True)
        save.hover()
        hint.wait_for(state="visible")
        check(save.get_attribute("aria-describedby")=="save-hint","tooltip native description")
        hint.hover()
        cp.wait_for_timeout(220)
        check(hint.is_visible(),"tooltip remains visible on pointer entry")
        cp.keyboard.press("Escape")
        hint.wait_for(state="hidden")
        cp.mouse.move(0,0)
        save.focus()
        hint.wait_for(state="visible")
        check(save.evaluate("e=>document.activeElement===e"),"tooltip focus stays on trigger")
        cp.keyboard.press("Escape")
        check(hint.is_hidden() and save.evaluate("e=>document.activeElement===e"),"tooltip Escape preserves focus")
        publish=cp.get_by_role("button",name="Publish",exact=True)
        publish.focus()
        cp.locator("#publish-hint").wait_for(state="visible")
        check(hint.is_hidden(),"only one tooltip visible")
        check_width(cp,"tooltip mobile")
        cp.goto(url+"docs/drawer/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",theme="light",palette="natural",effects="none")
        cp.set_viewport_size({"width":1280,"height":900})
        drawer=cp.locator("#settings-drawer")
        opener=cp.get_by_role("button",name="Open settings",exact=True)
        opener.click()
        drawer.wait_for(state="visible")
        check(drawer.evaluate("e=>e.matches(':modal')"),"drawer is a native modal")
        check(drawer.evaluate("e=>{const r=e.getBoundingClientRect();return Math.abs(r.right-innerWidth)<2&&Math.abs(r.height-innerHeight)<2}"),"end drawer docked to viewport")
        drawer.get_by_role("textbox",name="Workspace name").fill("Test workspace")
        cp.keyboard.press("Escape")
        drawer.wait_for(state="hidden")
        check(opener.evaluate("e=>document.activeElement===e"),"drawer restores native focus")
        opener.click()
        check(drawer.get_by_role("textbox",name="Workspace name").input_value()=="Test workspace","drawer preserves native form values")
        drawer.get_by_role("button",name="Done").click()
        drawer.wait_for(state="hidden")
        cp.get_by_role("button",name="Open navigation",exact=True).click()
        start=cp.locator("#navigation-drawer")
        start.wait_for(state="visible")
        check(start.evaluate("e=>Math.abs(e.getBoundingClientRect().left)<2"),"start drawer docked to opposite side")
        cp.keyboard.press("Escape")
        start.wait_for(state="hidden")
        cp.set_viewport_size({"width":390,"height":812})
        set_profile(cp,material="liquid-silicone",theme="dark",palette="graphite-punch")
        cp.get_by_role("button",name="Open filters",exact=True).click()
        sheet=cp.locator("#filter-drawer")
        cp.wait_for_function("()=>document.querySelector('#filter-drawer').hasAttribute('data-uibms-material-overlay')")
        check(sheet.evaluate("e=>{const r=e.getBoundingClientRect();return Math.abs(r.bottom-innerHeight)<2&&r.left>=-1&&r.right<=innerWidth+1}"),"material bottom sheet stays within mobile viewport")
        check(sheet.get_attribute("data-uibms-overlay-contour") is None,"docked material surface remains stable")
        sheet.get_by_role("button",name="Apply filters").click()
        sheet.wait_for(state="hidden")
        check_width(cp,"drawer mobile")
        cp.set_viewport_size({"width":1280,"height":900})
        cp.goto(url+"docs/toast/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",effects="none")
        stack=cp.locator("#demo-notifications")
        success=cp.locator("#toast-success")
        success.click()
        check(stack.locator(".toast").count()==1 and stack.inner_text().find("Changes saved")>=0,"toast appears")
        check(success.evaluate("e=>document.activeElement===e"),"toast does not steal focus")
        check(stack.evaluate("e=>e.matches(':popover-open')"),"notifications use native top layer")
        # Deliberately place a maximum ordinary z-index layer above a transformed,
        # clipped notification ancestor. The native stack must escape both.
        cp.evaluate("""()=>{
          const stack=document.querySelector('#demo-notifications');
          const parent=stack.parentElement;
          parent.style.transform='translateZ(0)';parent.style.isolation='isolate';parent.style.overflow='hidden';
          const cover=document.createElement('div');cover.id='toast-stacking-probe';
          cover.style.cssText='position:fixed;inset:0;background:transparent;z-index:2147483647';
          document.body.append(cover);
        }""")
        check(stack.get_by_role("button",name="Dismiss notification").evaluate("""e=>{
          const r=e.getBoundingClientRect();
          return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
        }"""),"toast escapes transformed clipped ancestor and higher ordinary z-index")
        cp.evaluate("()=>document.querySelector('#toast-stacking-probe').remove()")
        # A popover opened after the notification must not cover the stack.
        cp.evaluate("""()=>{
          const p=document.createElement('div');p.id='toast-popover-probe';p.setAttribute('popover','manual');
          p.style.cssText='position:fixed;inset:0;margin:0;max-width:none;max-height:none;width:100vw;height:100dvh;background:transparent;border:0';
          document.body.append(p);p.showPopover();
        }""")
        cp.wait_for_function("""()=>{
          const b=document.querySelector('#demo-notifications .toast button'),r=b.getBoundingClientRect();
          return b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
        }""")
        check(stack.evaluate("e=>e.matches(':popover-open')"),"toast stays above a subsequently opened popover")
        cp.evaluate("""()=>{
          const p=document.querySelector('#toast-popover-probe');p.hidePopover();p.remove();
          const parent=document.querySelector('#demo-notifications').parentElement;
          for(const key of ['transform','isolation','overflow'])parent.style.removeProperty(key);
        }""")
        cp.locator("#toast-warning").click()
        cp.locator("#toast-danger").click()
        success.click()
        check(stack.locator(".toast").count()==3,"toast visible limit and queued notification")
        check(cp.locator("#demo-notifications + [role=status]").inner_text().find("Review required")>=0,"polite announcement")
        check(cp.locator("#demo-notifications + [role=status] + [role=alert]").inner_text().find("Connection unavailable")>=0,"urgent error announcement")
        stack.locator(".toast").first.get_by_role("button",name="Dismiss notification").click()
        check(stack.locator(".toast").count()==3 and stack.locator(".toast").last.inner_text().find("Changes saved")>=0,"toast queue drains on dismissal")
        cp.locator("#toast-clear").click()
        check(stack.locator(".toast").count()==0,"clear removes visible and queued notifications")
        check(stack.evaluate("e=>!e.matches(':popover-open')"),"empty notification stack leaves top layer")
        # A modal-local stack may overlap the modal and remains dismissible
        # without overriding the browser's native focus isolation.
        cp.evaluate("""async()=>{
          const {mountToasts}=await import(new URL('engines/components/toast.mjs',new URL('../../',location.href)).href);
          const dialog=document.createElement('dialog');dialog.id='toast-modal-probe';
          const close=document.createElement('button');close.textContent='Close modal';close.type='button';
          const region=document.createElement('div');region.className='toasts';region.id='modal-toast-probe';
          dialog.append(close,region);document.body.append(dialog);
          const notifications=mountToasts(region);close.addEventListener('click',()=>{notifications.destroy();dialog.close();dialog.remove();});
          dialog.showModal();notifications.show({title:'Modal notification',tone:'success'});
        }""")
        modal_stack=cp.locator("#modal-toast-probe")
        check(modal_stack.evaluate("e=>e.matches(':popover-open')"),"modal-local toast uses top layer")
        modal_stack.get_by_role("button",name="Dismiss notification").click()
        check(modal_stack.locator(".toast").count()==0,"modal-local notification dismissible")
        cp.get_by_role("button",name="Close modal",exact=True).click()
        check(cp.locator("#toast-modal-probe").count()==0,"modal-local stack cleanup")
        cp.set_viewport_size({"width":390,"height":812})
        set_profile(cp,material="liquid-silicone")
        success.click()
        frame(cp)
        check(stack.locator(".toast").first.evaluate("e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1}"),"material toast fits mobile viewport")
        stack.get_by_role("button",name="Dismiss notification").click()
        check(stack.locator(".toast").count()==0,"dismiss works under material")
        cp.locator("#toast-info").click()
        timed=stack.locator(".toast")
        timed.wait_for(state="visible")
        cp.mouse.move(0,0)
        timed.wait_for(state="detached",timeout=8500)
        check_width(cp,"toast mobile")
        # Test real native interaction for the final four optional components.
        cp.set_viewport_size({"width":1280,"height":900})
        cp.goto(url+"docs/stepper/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",theme="light",palette="natural",effects="none")
        step=cp.locator("#onboarding-steps")
        account=cp.locator("#step-account-panel")
        preferences=cp.locator("#step-preferences-panel")
        review=cp.locator("#step-review-panel")
        check(account.is_visible() and preferences.is_hidden() and review.is_hidden(),"stepper starts at current step")
        check(not account.evaluate("e=>e.classList.contains('stepper-panel')"),"native stepper panels need no panel class")
        check(cp.locator("#stepper-back").is_disabled(),"stepper first boundary")
        account.get_by_role("textbox",name="Workspace name").fill("Custom setup")
        cp.locator("#stepper-next").click()
        check(preferences.is_visible() and account.is_hidden(),"next reveals actual panel")
        check(cp.locator("#step-preferences").get_attribute("aria-current")=="step","native current step")
        cp.evaluate("""()=>document.querySelector('#onboarding-steps').addEventListener('beforestepchange',e=>e.preventDefault(),{once:true})""")
        cp.locator("#stepper-next").click()
        check(preferences.is_visible() and review.is_hidden(),"step change cancelable")
        cp.locator("#stepper-next").click()
        check(review.is_visible() and cp.locator("#stepper-next").is_disabled(),"stepper final boundary")
        step.locator("#step-account").click()
        check(account.get_by_role("textbox",name="Workspace name").input_value()=="Custom setup","stepper preserves values")
        cp.set_viewport_size({"width":390,"height":812})
        set_profile(cp,material="liquid-silicone",palette="graphite-punch",theme="dark")
        cp.locator("#stepper-next").click()
        check(preferences.is_visible(),"stepper works with material")
        check_width(cp,"stepper mobile")

        cp.goto(url+"docs/pagination/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",effects="none")
        pagination=cp.locator("#records-pagination")
        summary=cp.locator("#pagination-summary")
        check(pagination.locator('[aria-current=page]').inner_text()=="5","requested initial page")
        check(summary.inner_text()=="Showing records 41–50 of 100","initial records")
        pagination.get_by_role("button",name="Next",exact=True).click()
        check(pagination.locator('[aria-current=page]').inner_text()=="6" and summary.inner_text()=="Showing records 51–60 of 100","pagination updates actual content")
        check(pagination.get_by_role("button",name="Next",exact=True).evaluate("e=>document.activeElement===e"),"paging preserves focus")
        check(cp.evaluate("""async()=>{
          const entry=[...document.scripts].find(s=>s.src.includes('/assets/engines.js'));
          const moduleUrl=new URL('../engines/components/pagination.mjs'+new URL(entry.src).search,entry.src);
          const {mountPagination}=await import(moduleUrl.href);
          const nav=document.querySelector('#records-pagination'),api=mountPagination(nav);
          const next=nav.querySelector('[aria-label="Next"]');
          let mutations=0;const observer=new MutationObserver(records=>mutations+=records.length);
          observer.observe(nav,{childList:true,subtree:true,attributes:true});
          api.setTotal(api.total);await Promise.resolve();observer.disconnect();
          return mutations===0&&next===nav.querySelector('[aria-label="Next"]')&&document.activeElement===next;
        }"""),"unchanged total preserves pager DOM and focus")
        pagination.get_by_role("button",name="Page 10",exact=True).click()
        check(pagination.get_by_role("button",name="Next",exact=True).is_disabled(),"last page disables next")
        pagination.get_by_role("button",name="Page 1",exact=True).click()
        check(pagination.get_by_role("button",name="Previous",exact=True).is_disabled(),"first page disables previous")
        cp.evaluate("""()=>document.querySelector('#records-pagination').addEventListener('beforepagechange',e=>e.preventDefault(),{once:true})""")
        pagination.get_by_role("button",name="Next",exact=True).click()
        check(pagination.locator('[aria-current=page]').inner_text()=="1","page change cancelable")
        set_profile(cp,material="liquid-silicone")
        pagination.get_by_role("button",name="Next",exact=True).click()
        check(pagination.locator('[aria-current=page]').inner_text()=="2","pagination works with material")
        check_width(cp,"pagination mobile")

        cp.goto(url+"docs/chips/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default")
        filters=cp.locator('form').filter(has=cp.locator('input[name=filters]')).first
        check(filters.get_by_role("checkbox",name="Design",exact=True).is_checked(),"initial selected chip")
        filters.get_by_role("checkbox",name="Development",exact=True).check()
        check(filters.evaluate("e=>new FormData(e).getAll('filters')")==["design","development"],"native chip form serialization")
        filters.get_by_role("button",name="Reset",exact=True).click()
        check(not filters.get_by_role("checkbox",name="Development",exact=True).is_checked(),"native chip reset")
        check(filters.get_by_role("checkbox",name="Archived",exact=True).is_disabled(),"disabled chip")
        chips=cp.locator("#demo-removable-skills")
        check(chips.locator(":scope > li").evaluate_all("els=>els.length===3&&els.every(e=>!e.hasAttribute('class')&&getComputedStyle(e).display==='flex')"),"native removable chips inherit contextual styles")
        cp.evaluate("""()=>document.querySelector('#demo-removable-skills').addEventListener('beforechipremove',e=>e.preventDefault(),{once:true})""")
        chips.get_by_role("button",name="Remove CSS",exact=True).click()
        check(chips.locator(':scope > li').count()==3,"chip removal cancelable")
        chips.get_by_role("button",name="Remove CSS",exact=True).click()
        check(chips.locator(':scope > li').count()==2,"native chip remove action")
        check(chips.get_by_role("button",name="Remove JavaScript",exact=True).evaluate("e=>document.activeElement===e"),"removal preserves logical focus")
        cp.locator("#chip-restore").click()
        check(chips.locator(':scope > li').count()==3,"restore uses delegated removal")
        set_profile(cp,material="liquid-silicone")
        chips.get_by_role("button",name="Remove HTML",exact=True).click()
        check(chips.locator(':scope > li').count()==2,"chip removal with material")
        check_width(cp,"chips mobile")

        cp.goto(url+"docs/command-palette/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",effects="none")
        trigger=cp.get_by_role("button",name="Open command palette",exact=True)
        command=cp.locator("#workspace-commands")
        trigger.click()
        command.wait_for(state="visible")
        search=command.get_by_role("searchbox")
        check(command.evaluate("e=>e.matches(':modal')") and search.evaluate("e=>document.activeElement===e"),"native modal with initial search focus")
        check(command.locator("#workspace-command-results").evaluate("e=>!e.hasAttribute('class')&&getComputedStyle(e).display==='grid'"),"native command results need no class")
        search.fill("workspace settings")
        check(command.locator("#workspace-command-results > li:not([hidden])").count()==1,"all query words match")
        cp.keyboard.press("Enter")
        command.wait_for(state="hidden")
        check(cp.locator("#command-action-status").inner_text()=="Selected: Open workspace settings","Enter activates matching command")
        check(trigger.evaluate("e=>document.activeElement===e"),"command restores opener focus")
        trigger.click()
        search.fill("no such action")
        check(command.locator("[role=status]").inner_text()=="No matching commands.","no results state")
        search.fill("")
        cp.keyboard.press("ArrowDown")
        check(command.get_by_role("button",name="Create project",exact=True).evaluate("e=>document.activeElement===e"),"arrow moves to first result")
        cp.keyboard.press("End")
        check(command.get_by_role("link",name="Open components documentation",exact=True).evaluate("e=>document.activeElement===e"),"End skips disabled command")
        cp.keyboard.press("Escape")
        command.wait_for(state="hidden")
        set_profile(cp,material="liquid-silicone",palette="graphite-punch",theme="dark")
        trigger.click()
        command.wait_for(state="visible")
        cp.wait_for_function("()=>document.querySelector('#workspace-commands').hasAttribute('data-uibms-material-overlay')")
        check(command.evaluate("e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1}"),"material command palette fits mobile viewport")
        search.fill("export")
        cp.keyboard.press("ArrowDown")
        cp.keyboard.press("Enter")
        command.wait_for(state="hidden")
        check(cp.locator("#command-action-status").inner_text()=="Selected: Export report","command activation with material")
        check_width(cp,"command palette mobile")
        # The documentation's three responsive menus use native modal drawers.
        cp.goto(url+"docs/grid/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        cp.set_viewport_size({"width":390,"height":844})
        set_profile(cp,material="default",effects="none",density="default",typography="default")
        for trigger_id,drawer_id,nav_id in [
            ("#site-menu-toggle","#site-main-menu-drawer","#site-mobile-top"),
            ("#site-nav-toggle","#site-doc-drawer","#site-mobile-doc-nav"),
            ("#site-toc-toggle","#site-toc-drawer","#site-mobile-toc-nav")
        ]:
            trigger=cp.locator(trigger_id)
            drawer=cp.locator(drawer_id)
            check(trigger.is_visible() and drawer.is_hidden(),"mobile drawer starts closed "+drawer_id)
            trigger.click()
            drawer.wait_for(state="visible")
            check(drawer.evaluate("e=>e.matches(':modal')") and drawer.locator(nav_id).is_visible(),"native modal navigation "+drawer_id)
            check(drawer.evaluate("e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1}"),"drawer within viewport "+drawer_id)
            check(cp.locator("#site-brand").evaluate("e=>{e.focus();return document.activeElement!==e}"),"native modal blocks background focus "+drawer_id)
            cp.keyboard.press("Escape")
            drawer.wait_for(state="hidden")
            check(trigger.evaluate("e=>e===document.activeElement"),"native focus return "+drawer_id)
        cp.locator("#site-menu-toggle").click()
        main_drawer=cp.locator("#site-main-menu-drawer")
        main_drawer.wait_for(state="visible")
        # A viewport wider than the configured drawer leaves a tappable backdrop.
        cp.set_viewport_size({"width":768,"height":844})
        frame(cp)
        cp.mouse.click(4,120)
        main_drawer.wait_for(state="hidden")
        check(main_drawer.is_hidden(),"native backdrop dismisses menu")
        cp.set_viewport_size({"width":390,"height":844})
        cp.locator("#site-toc-toggle").click()
        toc_drawer=cp.locator("#site-toc-drawer")
        toc_drawer.wait_for(state="visible")
        toc_drawer.locator("nav a").first.click()
        toc_drawer.wait_for(state="hidden")
        check(toc_drawer.is_hidden(),"in-page link closes TOC drawer")
        cp.locator("#site-nav-toggle").click()
        cp.locator("#site-doc-drawer").wait_for(state="visible")
        cp.set_viewport_size({"width":1440,"height":900})
        cp.locator("#site-doc-drawer").wait_for(state="hidden")
        check(cp.locator("#site-doc-nav").is_visible(),"desktop documentation navigation restored")
        check_width(cp,"desktop navigation restored")
        # No site application scripts: a supporting Chromium browser can open
        # and close the authored drawer directly via HTML dialog commands.
        if args.browser=="chromium":
            native_context=browser.new_context(viewport={"width":390,"height":844})
            native_page=native_context.new_page()
            native_page.route("**/assets/site.js*",lambda route:route.abort())
            native_page.route("**/assets/engines.js*",lambda route:route.abort())
            native_page.goto(url+"docs/grid/",wait_until="load")
            check(native_page.locator("html").get_attribute("data-site-ready") is None,"site script absent")
            native_page.locator("#site-menu-toggle").click()
            native_page.locator("#site-main-menu-drawer").wait_for(state="visible")
            check(native_page.locator("#site-main-menu-drawer").evaluate("e=>e.matches(':modal')"),"native command drawer works without site JS")
            native_page.get_by_role("button",name="Close main menu",exact=True).click()
            native_page.locator("#site-main-menu-drawer").wait_for(state="hidden")
            for slug,opener,dialog_id in [("dialogs","open-native-dialog","native-dialog"),("exit","open-exit-dialog","exit-dialog")]:
                native_page.goto(url+"docs/"+slug+"/",wait_until="load")
                native_page.locator("#"+opener).click()
                dialog=native_page.locator("#"+dialog_id)
                dialog.wait_for(state="visible")
                check(dialog.evaluate("e=>e.matches(':modal')"),"native example opens without site JavaScript "+slug)
                dialog.get_by_role("button",name="Close",exact=True).click()
                dialog.wait_for(state="hidden")
                check(not dialog.evaluate("e=>e.open"),"native example closes without site JavaScript "+slug)
            native_context.close()
        noscript_context=browser.new_context(java_script_enabled=False,viewport={"width":390,"height":844})
        noscript_page=noscript_context.new_page()
        noscript_page.goto(url+"docs/grid/",wait_until="load")
        check(noscript_page.locator("#site-top").is_visible() and noscript_page.locator("#site-doc-nav").is_visible(),"script-disabled navigation links remain available")
        noscript_context.close()

        # Administration structures use container width and preserve native controls.
        cp.set_viewport_size({"width":1800,"height":1000})
        cp.goto(url+"docs/dashboard/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,theme="light",palette="natural",material="default",effects="none",density="default")
        shell=cp.locator("#dashboard-demo-shell")
        side=shell.locator("#dash-sidebar")
        workspace=shell.locator("#dash-workspace")
        toggle=shell.get_by_role("button",name="Toggle navigation",exact=True)
        cp.wait_for_function("()=>getComputedStyle(document.querySelector('#dash-workspace')).getPropertyValue('--_uibms-shell-mode').trim()==='wide'")
        full=side.evaluate("e=>e.getBoundingClientRect().width")
        check(toggle.get_attribute("aria-expanded")=="true" and side.is_visible(),"wide shell opens with expanded navigation")
        toggle.click()
        frame(cp)
        rail=side.evaluate("e=>e.getBoundingClientRect().width")
        check(toggle.get_attribute("aria-expanded")=="false" and 0<rail<full,"desktop collapses to icon rail",[full,rail])
        check(side.get_by_role("link",name="Overview",exact=True).count()==1,"collapsed rail retains accessible link name")
        side.get_by_role("link",name="Projects",exact=True).click()
        check(shell.locator("#dash-projects").is_visible() and shell.locator("#dash-overview").is_hidden(),"sidebar changes only the local workspace")
        check(side.locator('[aria-current=page]').get_attribute("href")=="#dash-projects","current route updates")
        toggle.click()
        side.locator("summary").click()
        check(not side.locator("details").evaluate("e=>e.open"),"nested navigation uses native disclosure")
        side.locator("summary").click()
        check(side.locator("details").evaluate("e=>e.open"),"nested navigation reopens")
        cp.set_viewport_size({"width":390,"height":844})
        side.wait_for(state="hidden")
        mobile_toggle=shell.get_by_role("button",name="Open navigation drawer",exact=True)
        mobile_drawer=shell.locator("#dash-sidebar-drawer")
        check(mobile_toggle.is_visible() and toggle.is_hidden(),"CSS chooses mobile drawer invoker")
        check(side.evaluate("e=>e.parentElement.matches('dialog.dashboard-nav-drawer')"),"single live navigation moves into native drawer")
        mobile_toggle.click()
        mobile_drawer.wait_for(state="visible")
        check(mobile_drawer.evaluate("e=>e.matches(':modal')"),"compact navigation is a native modal")
        check(side.locator("details").evaluate("e=>e.open"),"nested disclosure state survives responsive move")
        side.get_by_role("link",name="Settings",exact=True).click()
        mobile_drawer.wait_for(state="hidden")
        check(shell.locator("#dash-settings").is_visible(),"mobile navigation selects view and closes")
        mobile_toggle.click()
        mobile_drawer.wait_for(state="visible")
        side.get_by_role("link",name="Overview",exact=True).focus()
        cp.keyboard.press("Escape")
        mobile_drawer.wait_for(state="hidden")
        check(mobile_toggle.evaluate("e=>document.activeElement===e"),"native Escape restores mobile invoker focus")
        shell.get_by_role("button",name="Search",exact=True).click()
        commands=shell.locator("#dash-commands")
        commands.wait_for(state="visible")
        commands.get_by_role("searchbox").fill("reports")
        cp.keyboard.press("Enter")
        commands.wait_for(state="hidden")
        check(shell.locator("#dash-reports").is_visible(),"existing command palette navigates dashboard views")
        shell.get_by_role("button",name="Account ▾",exact=True).click()
        account_menu=shell.locator("#dash-user-menu")
        account_menu.wait_for(state="visible")
        account_menu.get_by_role("menuitem",name="Workspace settings",exact=True).click()
        account_menu.wait_for(state="hidden")
        check(shell.locator("#dash-settings").is_visible(),"existing account dropdown navigates dashboard views")
        for width in [320,390,430]:
            cp.set_viewport_size({"width":width,"height":844})
            set_profile(cp,material="liquid-silicone",theme="dark",palette="graphite-punch")
            check_width(cp,"dashboard "+str(width))
            check(shell.evaluate("""e=>{const r=e.getBoundingClientRect(),s=e.querySelector('#dash-workspace');return r.width>0&&r.right<=innerWidth+1&&s.clientWidth>0&&s.clientHeight>0}"""),"dashboard shell and workspace fit "+str(width))
        mobile_toggle.click()
        mobile_drawer.wait_for(state="visible")
        cp.set_viewport_size({"width":1800,"height":1000})
        cp.wait_for_function("()=>document.querySelector('#dashboard-demo-shell .sidebar-toggle').getAttribute('aria-expanded')==='true'&&!document.querySelector('#dash-sidebar-drawer').open")
        check(side.is_visible() and side.evaluate("e=>e.parentElement.matches('.app-shell')"),"desktop preference and original sidebar restored after mobile modal")
        check(not shell.evaluate("e=>e.hasAttribute('data-uibms-material-host')"),"material does not deform layout boundary")
        # The composed dashboard uses the same widgets as the individual pages.
        if not shell.locator("#dash-overview").is_visible():
            if toggle.get_attribute("aria-expanded")=="false" and not side.is_visible():
                toggle.click()
            side.get_by_role("link",name="Overview",exact=True).click()
        check(shell.locator("#dash-overview .metric-card").count()==3,"dashboard uses shared metric cards")
        check(shell.locator("#dash-overview .sparkline > svg polyline").count()==1,"dashboard renders native SVG trend")
        check(shell.locator("#dash-projects [role=separator]:not(.split-handle)").count()==1,
              "composed split uses its native separator role")
        check(shell.locator("#dash-overview .progress-ring-value").inner_text()=="78%","dashboard uses actual native completion ratio")
        check(shell.locator("#dash-overview .quick-actions").get_by_role("link",name="Open projects").count()==1,"dashboard reuses native quick actions")

        cp.goto(url+"docs/app-shell/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",effects="none")
        mini=cp.locator(".app-shell").first
        mini_workspace=mini.locator(":scope > section")
        mini_side=mini.locator(":scope > nav")
        check(mini.locator(":scope > .app-shell-grid").count()==0 and mini_side.count()==1,"native responsive shell uses direct regions")
        check(mini_workspace.evaluate("e=>e.scrollHeight>e.clientHeight"),"shell content has independent scroll range")
        mini_workspace.evaluate("e=>{e.scrollTop=120}")
        check(mini_workspace.evaluate("e=>e.scrollTop")>0 and mini_side.evaluate("e=>e.scrollTop")==0,"workspace scrolling does not scroll navigation")

        cp.goto(url+"docs/split-workspace/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",theme="light",palette="natural",effects="none")
        split=cp.locator("#standalone-project-split")
        handle=split.get_by_role("separator")
        check(split.locator(":scope > section").count()==2 and split.locator(":scope > .split-workspace-grid").count()==0,"split layout needs no grid wrapper")
        handle.wait_for(state="visible")
        handle.scroll_into_view_if_needed()
        before=float(handle.get_attribute("aria-valuenow"))
        handle.focus()
        cp.keyboard.press("ArrowRight")
        after=float(handle.get_attribute("aria-valuenow"))
        check(after>before,"keyboard expands primary pane",[before,after])
        cp.keyboard.press("Home")
        check(handle.get_attribute("aria-valuenow")==handle.get_attribute("aria-valuemin"),"split minimum keyboard bound")
        cp.keyboard.press("End")
        check(handle.get_attribute("aria-valuenow")==handle.get_attribute("aria-valuemax"),"split maximum keyboard bound")
        rect=handle.bounding_box()
        cp.mouse.move(rect["x"]+rect["width"]/2,rect["y"]+rect["height"]/2)
        cp.mouse.down()
        cp.mouse.move(rect["x"]+rect["width"]/2-75,rect["y"]+rect["height"]/2,steps=5)
        cp.mouse.up()
        dragged=float(handle.get_attribute("aria-valuenow"))
        check(dragged<float(handle.get_attribute("aria-valuemax")),"pointer drag changes real divider")
        notes=split.get_by_role("textbox",name="Project notes")
        notes.fill("Preserve my notes")
        cp.set_viewport_size({"width":390,"height":844})
        handle.wait_for(state="hidden")
        check(split.evaluate("""e=>{const p=[...e.querySelectorAll(':scope > section')].map(x=>x.getBoundingClientRect());return Math.abs(p[0].left-p[1].left)<2&&p[1].top>=p[0].bottom}"""),"narrow split workspace stacks")
        check(notes.input_value()=="Preserve my notes","responsive split retains native field value")
        check_width(cp,"split workspace mobile")
        cp.set_viewport_size({"width":1800,"height":1000})
        handle.wait_for(state="visible")
        cp.wait_for_function("(value)=>Number(document.querySelector('#standalone-project-split [role=separator]').getAttribute('aria-valuenow'))===value",arg=dragged)
        check(notes.input_value()=="Preserve my notes","wide split restores ratio and values")
        set_profile(cp,material="liquid-silicone",theme="dark",palette="graphite-punch")
        check(split.evaluate("e=>!e.hasAttribute('data-uibms-material-host')"),"split geometry remains stable under material")
        # Dashboard widgets reuse native HTML, core surfaces and theme roles.
        cp.set_viewport_size({"width":1800,"height":1000})
        cp.goto(url+"docs/kpi-cards/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,theme="light",palette="natural",material="default",effects="none",density="default")
        metrics=cp.locator("[data-site-demo-content] .metric-card")
        check(metrics.count()==3 and metrics.first.evaluate("e=>e.classList.contains('card')&&e.classList.contains('stack')"),"KPI reuses core card and stack")
        check(metrics.first.locator("dd > strong").inner_text()=="€48,250","KPI preserves application-formatted value")
        check(metrics.first.locator("dd > strong").evaluate("e=>!e.hasAttribute('class')&&parseFloat(getComputedStyle(e).fontSize)>parseFloat(getComputedStyle(e.parentElement).fontSize)"),"native metric value is emphasized without child classes")
        change=metrics.first.locator("dd > span[data-tone]")
        check(change.evaluate("""e=>{
          const probe=document.createElement('span');probe.style.color='var(--color-success)';e.append(probe);
          const ok=getComputedStyle(e).color===getComputedStyle(probe).color;probe.remove();return ok;
        }"""),"metric change uses existing semantic success role")
        cp.goto(url+"docs/statistic-cards/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        check(cp.locator("[data-site-demo-content] progress").evaluate("e=>e.value===28&&e.max===36"),"statistics retain native progress")
        check(cp.locator("[data-site-demo-content] meter").evaluate("e=>e.value===81&&e.max===100"),"statistics retain native meter")

        cp.goto(url+"docs/sparklines/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,theme="light",palette="natural",material="default",effects="none")
        spark=cp.locator("#demo-revenue-trend")
        line=spark.locator("polyline")
        check(line.count()==1 and line.evaluate("e=>e.points.numberOfItems===7"),"sparkline draws one vertex per native data value")
        flat=cp.locator("#demo-flat-trend polyline")
        check(flat.evaluate("e=>Array.from(e.points).every(p=>p.y===20)"),"constant series produces a flat line")
        check(spark.locator("svg").get_attribute("aria-hidden")=="true" and spark.locator("data").count()==7,"decorative graph preserves accessible source values")
        check(spark.locator("svg, details > ol").evaluate_all("els=>els.length===2&&els.every(e=>!e.hasAttribute('class'))"),"dynamic chart needs no plot or values classes")
        points=line.get_attribute("points")
        cp.evaluate("""async()=>{
          const revision=new URL(document.querySelector('script[src*="/assets/engines.js"]').src).search;
          const {mountSparkline}=await import(new URL('../../engines/dashboard/sparkline.mjs'+revision,location.href).href);
          const figure=document.querySelector('#demo-revenue-trend');
          const datum=figure.querySelector('details > ol > li > data');datum.value='55';datum.textContent='55';
          mountSparkline(figure).refresh();
        }""")
        check(line.get_attribute("points")!=points,"sparkline refresh derives geometry from changed data")
        old_ink=line.evaluate("e=>getComputedStyle(e).stroke")
        set_profile(cp,theme="dark",palette="graphite-punch")
        check(line.evaluate("e=>getComputedStyle(e).stroke")!=old_ink,"sparkline inherits theme and palette ink")
        cp.set_viewport_size({"width":320,"height":844})
        set_profile(cp,material="liquid-silicone")
        check_width(cp,"sparkline mobile")
        check(spark.locator("svg").evaluate("e=>e.getBoundingClientRect().width<=e.parentElement.getBoundingClientRect().width+1"),"sparkline stays within card")

        cp.goto(url+"docs/progress-rings/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default")
        ring=cp.locator("#demo-project-ring")
        native=ring.locator("progress")
        readout=ring.locator(".progress-ring-value")
        check(readout.inner_text()=="78%" and native.evaluate("e=>e.value===28&&e.max===36"),"ring derives localized percentage from native progress")
        check(ring.get_by_role("progressbar",name="Completed projects").count()==1 and ring.locator(".progress-ring-face").get_attribute("aria-hidden")=="true","ring retains a single accessible progress indicator")
        native.evaluate("e=>{e.max=200;e.value=100}")
        cp.wait_for_function("()=>document.querySelector('#demo-project-ring .progress-ring-value').textContent==='50%'")
        check(ring.locator(".progress-ring-fill").get_attribute("stroke-dasharray")=="50 100","ring geometry follows value and max")
        native.evaluate("e=>e.value=0")
        cp.wait_for_function("()=>document.querySelector('#demo-project-ring .progress-ring-fill').getAttribute('visibility')==='hidden'")
        check(readout.inner_text()=="0%","zero progress has no false filled arc")
        native.evaluate("e=>e.removeAttribute('value')")
        ring.locator(".progress-ring-face").wait_for(state="hidden")
        check(not native.evaluate("e=>e.classList.contains('visually-hidden')"),"indeterminate progress uses native fallback")
        native.evaluate("e=>e.value=150")
        ring.locator(".progress-ring-face").wait_for(state="visible")
        check(readout.inner_text()=="75%","determinate progress enhancement resumes")
        check(cp.locator("#demo-indeterminate-ring .progress-ring-face").is_hidden(),"authored indeterminate progress remains native")
        set_profile(cp,theme="dark",palette="graphite-punch",material="liquid-silicone")
        check_width(cp,"progress rings mobile")

        cp.set_viewport_size({"width":1800,"height":1000})
        cp.goto(url+"docs/widget-grid/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(cp,material="default",density="default")
        grid=cp.locator("[data-site-demo-content] .widget-grid")
        check(grid.evaluate("e=>e.classList.contains('grid')&&getComputedStyle(e).display==='grid'"),"widget grid extends core grid")
        wide=grid.evaluate("e=>getComputedStyle(e).gridTemplateColumns.split(' ').length")
        check(wide>1,"widget grid has multiple desktop columns",wide)
        for width in [320,390,430]:
            cp.set_viewport_size({"width":width,"height":844})
            frame(cp)
            check_width(cp,"widget grid "+str(width))
            check(grid.evaluate("""e=>{
              const box=e.getBoundingClientRect();
              return [...e.children].every(c=>{const r=c.getBoundingClientRect();return r.left>=box.left-1&&r.right<=box.right+1});
            }"""),"widget children fit "+str(width))
        cp.goto(url+"docs/quick-actions/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        actions=cp.locator("[data-site-demo-content] .quick-actions")
        check(actions.get_by_role("link").count()==3 and actions.evaluate("e=>e.classList.contains('cluster')"),"quick actions preserve native links and core cluster")
        check_width(cp,"quick actions mobile")
        # A standalone application must not depend on documentation markup or
        # simulate its interaction inside an iframe.
        cp.set_viewport_size({"width":1440,"height":960})
        cp.goto(url+"demos/",wait_until="load")
        cp.wait_for_selector("html[data-site-engines-ready]",state="attached")
        cp.get_by_role("link",name="Launch demo",exact=True).click()
        cp.wait_for_selector("#admin-settings-form button[type=submit]:enabled",state="attached")
        set_profile(cp,material="default",theme="light",palette="natural",effects="none",density="default")
        admin=cp.locator("#admin-shell")

        def check_admin_icons(label):
            icons=admin.locator(":scope > header button, #admin-overview button[aria-describedby]").locator('svg[stroke="currentColor"]:visible')
            sizes=icons.evaluate_all(
                "icons => icons.map(icon => { const {width,height}=icon.getBoundingClientRect(); return [width,height]; })"
            )
            check(len(sizes)==4 and all(0<w<=24 and 0<h<=24 for w,h in sizes),"standalone control icons fit "+label,sizes)

        check_admin_icons("desktop")
        check(cp.locator("iframe,#site-header,#site-doc-nav").count()==0,"standalone admin has no embedded documentation")
        check(admin.evaluate("e=>{const r=e.getBoundingClientRect();return Math.abs(r.width-innerWidth)<2&&Math.abs(r.height-innerHeight)<2}"),"standalone fills browser viewport")
        check(cp.locator("#admin-total").inner_text()=="12","overview metric derives from dataset")
        check(cp.locator("#admin-overview-ring progress").evaluate("e=>e.value===4&&e.max===12"),"overview ring uses native project count")
        check(cp.locator("#admin-overview .sparkline > svg polyline").count()==1,"existing sparkline renders in standalone app")
        cp.locator("#admin-sidebar").get_by_role("link",name="Projects",exact=True).click()
        check(cp.locator("#admin-projects").is_visible() and cp.locator("#admin-overview").is_hidden(),"real workspace navigation")
        check(cp.locator("#admin-project-rows tr:not([hidden])").count()==5,"actual paginated record set")
        cp.locator("#admin-pagination").get_by_role("button",name="Next",exact=True).click()
        check(cp.locator("#admin-record-count").inner_text()=="Showing 6–10 of 12 projects","pagination updates record page")
        cp.locator("#admin-project-search").fill("portal")
        check(cp.locator("#admin-project-rows tr:not([hidden])").count()==1,"live project search")
        cp.locator("#admin-project-rows").get_by_role("button",name="Client portal",exact=True).click()
        check(cp.locator("#admin-detail-name").inner_text()=="Client portal","master detail uses selected record")
        cp.locator("#admin-project-tags").get_by_role("button",name="Remove Portal",exact=True).click()
        check(cp.locator("#admin-project-tags").get_by_role("button",name="Remove Portal",exact=True).count()==0,"chips change actual selected project labels")
        cp.get_by_role("tab",name="Notes",exact=True).click()
        cp.locator("#admin-project-notes").fill("Reviewed in the standalone demo.")
        cp.locator("#admin-save-notes").click()
        check(cp.locator("#admin-notifications").get_by_text("Notes saved",exact=True).count()==1,"toast reports real record change")
        # Clear persistent notifications before operating controls near the viewport edge.
        while cp.locator("#admin-notifications button").count():
            cp.locator("#admin-notifications button").first.click()
        cp.get_by_role("tab",name="Details",exact=True).click()
        cp.locator("#admin-complete-project").click()
        check(cp.locator("#admin-detail-status").inner_text()=="Completed","record completion updates state")
        cp.locator("#admin-sidebar").get_by_role("link",name="New project",exact=True).click()
        cp.locator("#admin-create-next").click()
        check(cp.locator("#admin-create-basics").get_attribute("aria-current")=="step","stepper enforces required name")
        cp.locator("#admin-create-form input[name=name]").fill("Demo launch")
        cp.locator("#admin-create-next").click()
        check(cp.locator("#admin-create-schedule").get_attribute("aria-current")=="step","stepper moves to schedule")
        color_adapter=cp.locator("#admin-create-form [data-uibms-form-kind=color]")
        check(color_adapter.count()==0,"default material keeps the native color control")
        set_profile(cp,material="liquid-silicone")
        check(color_adapter.count()==1,"Liquid Silicone activates the existing Form Engine color adapter")
        set_profile(cp,material="default")
        cp.locator("#admin-create-next").click()
        check(cp.locator("#admin-create-review").get_attribute("aria-current")=="step","stepper reviews actual project values")
        cp.locator("#admin-create-submit").click()
        check(cp.locator("#admin-projects").is_visible() and cp.locator("#admin-detail-name").inner_text()=="Demo launch","creation adds a real local project")
        check(cp.locator("#admin-total").text_content()=="13","creation updates overview count")
        while cp.locator("#admin-notifications button").count():
            cp.locator("#admin-notifications button").first.click()
        cp.locator("#admin-shell").get_by_role("button",name="Search commands",exact=True).click()
        cp.locator("#admin-commands input[type=search]").fill("reports")
        cp.keyboard.press("Enter")
        cp.locator("#admin-commands").wait_for(state="hidden")
        check(cp.locator("#admin-reports").is_visible(),"command palette navigates real application views")
        check(cp.locator("#admin-report-ring progress").evaluate("e=>e.value===5&&e.max===13"),"report metrics reflect project changes")
        cp.locator("#admin-shell > header > div:last-child").get_by_role("button",name="Appearance",exact=True).click()
        appearance=cp.locator("#admin-appearance")
        appearance.wait_for(state="visible")
        check(appearance.locator("select").count()==len(profiles),"standalone uses all shared appearance profiles")
        appearance.locator("select[name=theme]").select_option("dark")
        appearance.locator("select[name=palette]").select_option("graphite-punch")
        appearance.locator("select[name=material]").select_option("liquid-silicone")
        check(cp.locator("html").get_attribute("data-material")=="liquid-silicone","appearance changes actual framework profile")
        appearance.get_by_role("button",name="Close appearance",exact=True).click()
        appearance.wait_for(state="hidden")
        for width in [320,390,430,768]:
            cp.set_viewport_size({"width":width,"height":844})
            frame(cp)
            check_width(cp,"standalone demo "+str(width))
            check(admin.evaluate("e=>{const r=e.getBoundingClientRect();return r.width<=innerWidth+1&&r.height<=innerHeight+1}"),"standalone shell fits "+str(width))
        cp.set_viewport_size({"width":390,"height":844})
        cp.locator("#admin-shell").get_by_role("button",name="Open navigation drawer",exact=True).click()
        nav=cp.locator("#admin-navigation")
        nav.wait_for(state="visible")
        check(nav.evaluate("e=>e.matches(':modal')"),"standalone mobile drawer native modality")
        nav.get_by_role("link",name="Overview",exact=True).click()
        nav.wait_for(state="hidden")
        check(cp.locator("#admin-overview").is_visible() and cp.locator("#admin-total").inner_text()=="13","mobile navigation retains application data")
        check_width(cp,"standalone overview mobile material")
        check_admin_icons("mobile with Liquid Silicone")

        cp.set_viewport_size({"width":1440,"height":960})
        cp.emulate_media(reduced_motion="no-preference")
        set_profile(cp,material="default",theme="light",palette="natural",effects="default")
        cp.evaluate("document.documentElement.style.setProperty('--motion-duration','450ms')")
        account=cp.locator("#admin-account")
        button_color="""e=>{
          const ctx=document.createElement('canvas').getContext('2d');
          ctx.fillStyle=getComputedStyle(e).backgroundColor;ctx.fillRect(0,0,1,1);
          return [...ctx.getImageData(0,0,1,1).data].slice(0,3);
        }"""
        rest=account.evaluate(button_color)
        account.hover()
        hover=account.evaluate(button_color)
        check(min(rest)>200 and max(abs(a-b) for a,b in zip(rest,hover)) in range(1,25),
              "light buttons use close surface tints",[rest,hover])

        account.click()
        menu=cp.locator("#admin-account-menu")
        menu.wait_for(state="visible")
        check(menu.evaluate("e=>e.getAnimations().some(a=>a.transitionProperty==='opacity')"),
              "account popover animates in")
        cp.keyboard.press("Escape")
        menu.wait_for(state="hidden")

        summary=cp.locator("#admin-overview .sparkline summary")
        if cp.evaluate("CSS.supports('selector(::details-content)') && CSS.supports('interpolate-size: allow-keywords')"):
            summary.click()
            cp.wait_for_function("""()=>{
              const detail=document.querySelector('#admin-overview .sparkline details');
              const height=parseFloat(getComputedStyle(detail,'::details-content').blockSize);
              const full=detail.querySelector('ol').getBoundingClientRect().height;
              return detail.open && height>0 && height<full;
            }""")
            summary.click()
            cp.wait_for_function("""()=>{
              const detail=document.querySelector('#admin-overview .sparkline details');
              return !detail.open && getComputedStyle(detail,'::details-content').blockSize==='0px';
            }""")
            check(True,"native disclosure animates open and settles closed")

        cp.locator("#admin-sidebar a[href='#admin-create']").click()
        project_name=cp.locator("#admin-create-form input[name=name]")
        project_name.focus()
        check(project_name.evaluate("""e=>{
          const s=getComputedStyle(e);
          return s.outlineStyle==='solid' && parseFloat(s.outlineOffset)<0 && s.boxShadow.includes('inset');
        }"""),"editable fields retain a visible inset focus indicator")
        if cp.evaluate("CSS.supports('appearance: base-select') && CSS.supports('selector(::picker(select))')"):
            owner=cp.locator("#admin-create-form select[name=owner]")
            check(owner.evaluate("e=>getComputedStyle(e).appearance==='base-select'"),
                  "default form uses the browser's customizable select")
            owner.click()
            cp.wait_for_function("""()=>{
              const select=document.querySelector('#admin-create-form select[name=owner]');
              const opacity=Number(getComputedStyle(select,'::picker(select)').opacity);
              return select.matches(':open') && opacity>0 && opacity<1;
            }""")
            cp.get_by_role("option",name="Jordan Lee",exact=True).click()
            check(owner.input_value()=="Jordan Lee","animated picker updates the native value")
            cp.emulate_media(reduced_motion="reduce")
            check(owner.evaluate("e=>getComputedStyle(e,'::picker(select)').transitionDuration==='0s'"),
                  "native picker honors reduced motion")
        component_context.close()

        # All authored inline reference examples coexist on the generated showcase.
        showcase_context=browser.new_context(viewport={"width":1440,"height":900},reduced_motion="reduce")
        showcase=showcase_context.new_page()
        showcase.set_default_timeout(15000)
        showcase_errors=[]
        showcase.on("pageerror",lambda error:(showcase_errors.append(str(error)),print("Showcase page error:",error,flush=True)))
        showcase.goto(url+"components/",wait_until="load")
        showcase.wait_for_selector("html[data-site-ready][data-site-engines-ready]",state="attached")
        expected=sum(
            html.count("<div data-site-demo-content")-html.count("data-site-scope-frame></iframe>")
            for html in (file.read_text(encoding="utf-8") for file in (dist/"docs").rglob("index.html"))
        )
        check(showcase.locator("[data-site-demo-content]").count()==expected,"all inline reference examples on one page")
        check(showcase.locator("iframe").count()==0,"no showcase iframes")
        check(showcase.locator("#site-top a[aria-current=page]").inner_text()=="Components","showcase navigation")
        check_width(showcase,"component showcase desktop")
        showcase.locator("#workspace-activity").click()
        check(showcase.locator("#workspace-activity-panel").is_visible(),"showcase tabs activate")
        showcase.locator("#stepper-next").click()
        check(showcase.locator("#step-preferences-panel").is_visible(),"showcase stepper advances")
        pager=showcase.locator("#records-pagination")
        pager.get_by_role("button",name="Next",exact=True).click()
        check(pager.locator('[aria-current=page]').inner_text()=="6","showcase pagination works")
        showcase.locator("#open-native-dialog").click()
        showcase.locator("#native-dialog").wait_for(state="visible")
        showcase.locator("#native-dialog").get_by_role("button",name="Close",exact=True).click()
        showcase.locator("#native-dialog").wait_for(state="hidden")
        check(not showcase.locator("#native-dialog").evaluate("e=>e.open"),"showcase native dialog closes")
        set_profile(showcase,theme="dark",palette="ocean")
        check(showcase.locator("#workspace-activity").evaluate("e=>getComputedStyle(e).colorScheme")== "dark","showcase inherits global appearance")
        showcase.set_viewport_size({"width":390,"height":844})
        frame(showcase)
        check_width(showcase,"component showcase mobile")
        # Optical rendering is viewport-windowed, but the complete DOM and
        # native controls remain available. Verify enhancement and release
        # without replacing controls or forcing every surface to be painted.
        showcase.evaluate("()=>{document.activeElement?.blur();window.scrollTo(0,0)}")
        set_profile(showcase,material="liquid-silicone")
        painted="e=>e.hasAttribute('data-uibms-material-host')||e.hasAttribute('data-uibms-material-native')"
        first=showcase.locator("#open-native-dialog")
        second=showcase.locator("#stepper-next")
        showcase.wait_for_function("()=>document.querySelector('#site-header').hasAttribute('data-uibms-material-native')")
        check(not first.evaluate(painted) and not second.evaluate(painted),"far showcase previews remain native before scrolling")
        first.scroll_into_view_if_needed()
        showcase.wait_for_function("sel=>{const e=document.querySelector(sel);return e.hasAttribute('data-uibms-material-host')||e.hasAttribute('data-uibms-material-native')}",arg="#open-native-dialog")
        check(first.evaluate(painted),"near showcase preview receives material")
        first.click()
        showcase.locator("#native-dialog").wait_for(state="visible")
        showcase.locator("#native-dialog").get_by_role("button",name="Close",exact=True).click()
        showcase.locator("#native-dialog").wait_for(state="hidden")
        showcase.evaluate("()=>document.activeElement?.blur()")
        second.scroll_into_view_if_needed()
        showcase.wait_for_function("()=>{const e=document.querySelector('#stepper-next');return e.hasAttribute('data-uibms-material-host')||e.hasAttribute('data-uibms-material-native')}")
        showcase.wait_for_function("()=>!document.querySelector('#open-native-dialog').matches('[data-uibms-material-host],[data-uibms-material-native]')")
        check(second.evaluate(painted) and not first.evaluate(painted),"viewport material follows scrolling and releases distant surfaces")
        check(showcase.locator("[data-site-demo-content]").count()==expected,"windowing preserves every authored example")
        set_profile(showcase,material="default")
        showcase.wait_for_function("()=>!document.querySelector('#stepper-next').matches('[data-uibms-material-host],[data-uibms-material-native]')")
        check(not second.evaluate(painted),"global material reset releases decoration")
        check(not showcase_errors,"no showcase runtime errors",showcase_errors)
        showcase_context.close()
        check(not errors,"no component runtime errors",errors)
        # Use an actual touch-capable, mobile context, with motion permitted.
        mobile=browser.new_context(viewport={"width":390,"height":844},has_touch=True,is_mobile=True,device_scale_factor=2,color_scheme="light",reduced_motion="no-preference")
        phone=mobile.new_page()
        phone.set_default_timeout(12000)
        touch_errors=[]
        phone.on("pageerror",lambda error:touch_errors.append(str(error)))
        # Mobile form geometry: intrinsic native widths and platform-specific
        # color artwork must not disturb a stacked form or its label alignment.
        phone.goto(url+"docs/form-engine/",wait_until="load")
        phone.wait_for_selector("html[data-site-engines-ready]",state="attached")
        set_profile(phone,theme="dark",palette="royal",shape="soft",density="default",material="liquid-silicone",effects="none")
        form=phone.locator('[data-site-demo-run="form-engine"] form')
        color=form.locator('input[name=color]')
        face=form.locator('[data-uibms-form-color-face]')
        value=form.locator('[data-uibms-form-color-text]')
        swatch=form.locator('[data-uibms-form-color-chip]')
        picker_arrow=form.locator('[data-uibms-form-kind=color] [data-uibms-form-trigger]')
        face.wait_for()
        for width in [320,390,430]:
            phone.set_viewport_size({"width":width,"height":844})
            frame(phone)
            check(form.evaluate("""f=>[...f.querySelectorAll(':scope > label')].every(label=>{
              const field=label.querySelector(':scope > [data-uibms-form-control],:scope > input,:scope > textarea,:scope > select');
              if(!field)return false;
              const l=label.getBoundingClientRect(),r=field.getBoundingClientRect();
              return Math.abs(l.left-r.left)<2&&Math.abs(l.width-r.width)<2&&r.top>=l.top+parseFloat(getComputedStyle(label).fontSize)*.9;
            })"""),"stacked labels and full-width native/composite fields "+str(width))
            check(face.evaluate("""e=>{
              const r=e.getBoundingClientRect(),s=e.querySelector('[data-uibms-form-color-chip]').getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();
              return s.width<r.width&&s.width>=16&&s.height>=10&&r.left>=p.left&&r.right<=p.right&&getComputedStyle(e).pointerEvents==='none';
            }"""),"compact rectangular swatch in responsive colour field "+str(width))
            check_width(phone,"form-engine mobile "+str(width))
        color.scroll_into_view_if_needed()
        check(color.evaluate("""e=>{
          const r=e.getBoundingClientRect();
          return Number(getComputedStyle(e).opacity)===0&&e.tabIndex===0&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e;
        }"""),"native colour input remains focusable and directly tappable")
        check(value.inner_text()=="#80BCEB","initial native colour face")
        color.evaluate("""e=>{e.value='#123456';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));}""")
        check(value.inner_text()=="#123456" and swatch.evaluate("e=>getComputedStyle(e).backgroundColor")=="rgb(18, 52, 86)","native change updates visible swatch")
        picker_arrow.tap()
        popup=phone.locator('[data-uibms-form-popup]')
        popup.wait_for(state="visible")
        check(popup.get_attribute("aria-label")=="Accent picker","generated value does not pollute field label")
        check(popup.evaluate("""e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1}"""),"colour picker fits mobile viewport")
        popup.get_by_role("button",name="#A58CE7",exact=True).tap()
        check(color.input_value().lower()=="#a58ce7" and value.inner_text()=="#A58CE7","enhanced choice updates native input and visible swatch")
        check(popup.get_by_role("textbox",name="Custom hexadecimal colour").input_value().lower()=="#a58ce7","hex field stays synchronized")
        check(form.evaluate("e=>new FormData(e).get('color')").lower()=="#a58ce7","native colour form serialization")
        popup.get_by_role("button",name="Close picker",exact=True).tap()
        popup.wait_for(state="detached")
        form.get_by_role("button",name="Reset",exact=True).tap()
        phone.wait_for_function("()=>document.querySelector('[data-site-demo-run=form-engine] [data-uibms-form-color-text]').textContent==='#80BCEB'")
        check(color.input_value().lower()=="#80bceb","native reset restores colour and swatch")
        # A canceled reset must preserve the selected native value and face.
        color.evaluate("""e=>{e.value='#654321';e.dispatchEvent(new Event('input',{bubbles:true}));e.form.addEventListener('reset',event=>event.preventDefault(),{once:true});}""")
        form.get_by_role("button",name="Reset",exact=True).tap()
        frame(phone)
        check(color.input_value().lower()=="#654321" and value.inner_text()=="#654321","canceled native reset preserves colour")
        form.get_by_role("button",name="Reset",exact=True).tap()
        phone.wait_for_function("()=>document.querySelector('[data-site-demo-run=form-engine] [data-uibms-form-color-text]').textContent==='#80BCEB'")
        phone.set_viewport_size({"width":390,"height":844})
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
