"""Browser and link checks for the review output. --inline is for network-blocked QA.
Normal operation tests the local HTTP website; inline mode embeds the identical assets,
uses a storage/clipboard fixture, and does not verify HTTP requests or true persistence.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import argparse, base64, json, re, os, subprocess, time, sys
from urllib.parse import urlsplit, unquote
HERE=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--inline',action='store_true');parser.add_argument('--base',default='/');parser.add_argument('--browser-executable',default=None);parser.add_argument('--report',default='review-results.json');parser.add_argument('--screenshots',default=None);parser.add_argument('--phase',choices=['all','static','reflow','interactions'],default='all');args=parser.parse_args()
root=HERE/'preview-output'; base='/'+args.base.strip('/')+'/' if args.base.strip('/') else '/'; site=root/base.strip('/'); report=[]; issues=[]
def check(name,condition,detail=''):
 report.append({'check':name,'passed':bool(condition),'detail':str(detail)})
 if not condition: issues.append((name,str(detail)));print('FAIL',name,detail,flush=True)
files=sorted(site.rglob('index.html'));check('HTML review pages exist',len(files)>0,len(files))
manifest=json.loads((site/'framework/manifest.json').read_text()); import hashlib
for name,v in manifest['files'].items():
 b=(site/'framework'/name).read_bytes(); check('framework integrity '+name,len(b)==v['bytes'] and hashlib.sha256(b).hexdigest()==v['sha256'])
# Verify all local links/resources and same-page anchors without network access.
for f in files:
 soup=BeautifulSoup(f.read_text(),'html.parser');ids=[x['id'] for x in soup.select('[id]')];check('unique ids '+str(f.relative_to(site)),len(ids)==len(set(ids)),[x for x in ids if ids.count(x)>1]);check('single main '+str(f.relative_to(site)),len(soup.select('main'))==1,len(soup.select('main')))
 for el in soup.find_all(['a','link','script','img','iframe','source','track','input']):
  value=el.get('href') or el.get('src');
  if not value:continue
  url=urlsplit(value)
  if url.scheme or url.netloc:continue
  if not url.path:
   if url.fragment:check('fragment '+str(f.relative_to(site))+'#'+url.fragment,url.fragment in ids)
   continue
  if url.path.startswith('/'):
   target=root/unquote(url.path.lstrip('/'))
  else:target=f.parent/unquote(url.path)
  if target.is_dir():target=target/'index.html'
  check('local asset '+str(f.relative_to(site))+' '+value,target.is_file())
  if url.fragment and target.is_file() and target.suffix=='.html':check('target fragment '+value,bool(BeautifulSoup(target.read_text(),'html.parser').find(id=url.fragment)))
 for block in soup.select('[data-site-code]'):
  code=block.select_one('code'); lines=block.select_one('[data-site-lines]'); check('readonly code and numbered lines '+str(f.relative_to(site)),bool(code and lines and block.select_one('button[data-site-copy]')) and len(lines.get_text().splitlines())==len(code.get_text().splitlines()) and not block.select('[contenteditable],textarea'))
def save_report():
 result={'mode':'inline assets and mocked browser storage/clipboard' if args.inline else 'local HTTP','phase':args.phase,'checks':len(report),'passed':sum(r['passed'] for r in report),'failed':len(issues),'failures':issues,'details':report};Path(args.report).write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k!='details'},indent=2),flush=True)
if args.phase=='static':
 save_report();sys.exit(bool(issues))
if args.phase in ('reflow','interactions'):
 report.clear();issues.clear()
# Browser fixture uses the actual generated CSS, JS, and HTML. Local storage and clipboard
# are mocked only in inline mode, because navigation is blocked in the execution environment.
css=(site/'framework/uibms.full.min.css').read_text();sitecss=(site/'assets/site.css').read_text();js=(site/'assets/site.js').read_text(); scoped=(site/'framework/uibms.scoped.full.min.css').read_text();storage={}
server=None
if not args.inline:
 server=subprocess.Popen([sys.executable,'-m','http.server','8765','--bind','127.0.0.1','--directory',str(root)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.4)
def make_inline(f,settings):
 soup=BeautifulSoup(f.read_text(),'html.parser');boot=soup.head.find('script');stub=soup.new_tag('script');stub.string='Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>window.__store[k]??null,setItem:(k,v)=>window.__store[k]=v}});window.__store='+json.dumps(settings)+';Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async t=>{window.__copied=t;}}});';boot.insert_before(stub)
 for link in soup.select('link[rel="stylesheet"]'):
  asset_path=urlsplit(link['href']).path
  style=soup.new_tag('style');style.string=(root/unquote(asset_path.lstrip('/'))).read_text();link.replace_with(style)
 for script in soup.select('script[src]'):
  asset_path=urlsplit(script['src']).path
  source=(root/unquote(asset_path.lstrip('/'))).read_text()
  if asset_path.endswith(('/assets/engines.js','/assets/admin-demo.js')):
   tabs=(site/'engines/components/tabs.mjs').read_text()
   floating=(site/'engines/components/floating.mjs').read_text()
   dropdown=(site/'engines/components/dropdown.mjs').read_text()
   tooltip=(site/'engines/components/tooltip.mjs').read_text()
   drawer=(site/'engines/components/drawer.mjs').read_text()
   toast=(site/'engines/components/toast.mjs').read_text()
   optional_components=[(name,(site/('engines/components/'+name+'.mjs')).read_text()) for name in ['stepper','pagination','chips','command']]
   for name in ['app-shell','split-workspace','sparkline','progress-ring']:
    component=(site/('engines/dashboard/'+name+'.mjs')).read_text()
    source=source.replace("import('../engines/dashboard/"+name+".mjs'+revision)",'import(URL.createObjectURL(new Blob(['+json.dumps(component)+'],{type:"text/javascript"})))')
   media=(site/'engines/media-deformation.mjs').read_text()
   material=(site/'engines/material.mjs').read_text()
   forms=(site/'engines/forms.mjs').read_text()
   source=source.replace("const revision=new URL(import.meta.url).search;",'')
   for name,component in [('material',material),('forms',forms)]:
    source=source.replace("import('../engines/"+name+".mjs'+revision)",'import(URL.createObjectURL(new Blob(['+json.dumps(component)+'],{type:"text/javascript"})))')
   source=source.replace("import('../engines/components/tabs.mjs'+revision)",'import(URL.createObjectURL(new Blob(['+json.dumps(tabs)+'],{type:"text/javascript"})))')
   for name,component in [('drawer',drawer),('toast',toast)]+optional_components:
    source=source.replace("import('../engines/components/"+name+".mjs'+revision)",'import(URL.createObjectURL(new Blob(['+json.dumps(component)+'],{type:"text/javascript"})))')
   for name,component in [('dropdown',dropdown),('tooltip',tooltip)]:
    source=source.replace("import('../engines/components/"+name+".mjs'+revision)",'import(URL.createObjectURL(new Blob(['+json.dumps(component)+'.replace("./floating.mjs",URL.createObjectURL(new Blob(['+json.dumps(floating)+'],{type:"text/javascript"})))],{type:"text/javascript"})))')
   source=source.replace("import('../engines/media-deformation.mjs'+revision)",'import(URL.createObjectURL(new Blob(['+json.dumps(media)+'],{type:"text/javascript"})))')
   image='data:image/svg+xml;base64,'+base64.b64encode((site/'engines/landscape.svg').read_bytes()).decode()
   source=source.replace("new URL('../engines/landscape.svg',import.meta.url).href",json.dumps(image))
  script.attrs.pop('src');script.string=source
 for tag in soup.select('img[src], input[src], source[src], track[src]'):
  src=tag['src'];path=root/src.lstrip('/');
  if path.exists():
   mime={'.svg':'image/svg+xml','.mp4':'video/mp4','.mp3':'audio/mpeg','.vtt':'text/vtt'}.get(path.suffix,'application/octet-stream');tag['src']='data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
 for iframe in soup.select('iframe[data-site-scope-frame]'):
  frame=(site/'assets/scoped-demo.html').read_text();frame=re.sub(r'<link rel="stylesheet"[^>]+>',lambda m:'<style>'+((site/'assets/expressive-palettes.scoped.css').read_text() if 'expressive-palettes.scoped.css' in m.group(0) else scoped)+'</style>',frame);iframe.attrs.pop('src');iframe['srcdoc']=frame
 return str(soup)
try:
 with sync_playwright() as p:
  executable=args.browser_executable or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None)
  browser=p.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox','--disable-dev-shm-usage']); context=browser.new_context(viewport={'width':1440,'height':900},color_scheme='light');
  if not args.inline:context.grant_permissions(['clipboard-read','clipboard-write'])
  page=context.new_page(); page.set_default_timeout(5000); errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  def open_page(slug='',settings=None):
   f=site/slug/'index.html';errors.clear();
   if args.inline:page.set_content(make_inline(f,settings or {}),wait_until='load',timeout=10000)
   else:page.goto('http://127.0.0.1:8765'+base+(slug+'/' if slug else ''),wait_until='load',timeout=10000)
   ready='html[data-demo-ready]' if slug.startswith('demos/') else 'html[data-site-ready][data-site-engines-ready]'
   page.wait_for_selector(ready,state='attached',timeout=10000)
   page.evaluate('window.scrollTo({top:0,left:0,behavior:"instant"})')
  def width_check():return page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
  # All pages across four widths. Check JS errors and responsive overflow.
  for f in (files if args.phase in ('all','reflow') else []):
   slug=str(f.parent.relative_to(site));slug='' if slug=='.' else slug
   try:
    page.set_viewport_size({'width':1440,'height':900});open_page(slug)
    check('script init '+slug,not errors,errors[:]);
    for width in [1440,768,375,320]:
     page.set_viewport_size({'width':width,'height':900});page.wait_for_timeout(25);sizes=width_check();check(f'reflow {slug} {width}',sizes['scroll']<=width+1,sizes)
     for region in page.locator('[data-site-reference-table]').all():
      result=region.evaluate("""e=>({
       region:e.getAttribute('role')==='region'&&e.tabIndex===0&&!!e.getAttribute('aria-label'),
       natural:[...e.querySelectorAll('th,td')].every(c=>getComputedStyle(c).overflowWrap==='normal'&&getComputedStyle(c).wordBreak==='normal'),
       identifiers:[...e.querySelectorAll('th code:only-child')].every(c=>getComputedStyle(c).whiteSpace==='nowrap'&&c.getClientRects().length===1),
       headerLines:[...e.querySelectorAll('thead th, tbody th')].every(c=>{const t=c.textContent.trim();if(/\\s/.test(t)||t.includes('-'))return true;const r=document.createRange();r.selectNodeContents(c);return new Set([...r.getClientRects()].map(x=>Math.round(x.top))).size<=1;}),
       scroll:getComputedStyle(e).overflowX==='auto'&&e.clientWidth<=innerWidth
      })""")
      check(f'reference table {slug} {width}',all(result.values()),result)
   except Exception as exc:check('page '+slug,False,repr(exc))
  print('reflow complete',len(report),len(issues),flush=True)
  if args.phase=='reflow':
   browser.close();sys.exit(bool(issues))
  page.set_viewport_size({'width':1440,'height':900});open_page('docs/buttons')
  if args.screenshots:
   shots=Path(args.screenshots);shots.mkdir(parents=True,exist_ok=True);page.screenshot(path=str(shots/'desktop.png'))
  check('one global appearance control',page.locator('#site-appearance').count()==1 and page.locator('#site-appearance select').count()==page.evaluate("JSON.parse(document.querySelector('#site-data').textContent).profiles.length"))
  page.locator('#site-appearance summary').click()
  for k,v in [('theme','dark'),('palette','bordeaux'),('density','compact'),('shape','sharp'),('border','subtle'),('typography','technical'),('effects','fluid'),('material','liquid-silicone')]:
   page.locator('#appearance-'+k).select_option(v);check('appearance '+k,page.locator('html').get_attribute('data-'+k)==v)
  # The site is really consuming UIBMS CSS, not just changing strings.
  check('sharp geometry consumed',page.locator('[data-site-demo-content] button').first.evaluate('(e)=>getComputedStyle(e).borderRadius')=='0px')
  check('dark scheme consumed',page.locator('html').evaluate('(e)=>getComputedStyle(e).colorScheme')=='dark')
  if args.screenshots:page.screenshot(path=str(shots/'appearance.png'))
  state=page.evaluate('window.__store') if args.inline else None
  print('appearance done',flush=True)
  open_page('docs/grid',state);check('settings reloaded on next page',page.locator('html').get_attribute('data-palette')=='bordeaux' and page.locator('html').get_attribute('data-effects')=='fluid')
  page.locator('#site-appearance summary').click();page.locator('#site-appearance-reset').click();check('restore defaults',page.locator('html').get_attribute('data-theme')=='auto' and page.locator('html').get_attribute('data-density')=='default');page.keyboard.press('Escape');check('escape appearance',not page.locator('#site-appearance').evaluate('(e)=>e.open'))
  print('next page/reset done',flush=True)
  # Search, copy exact text, active category, responsive menu.
  page.locator('#site-search-open').click();page.locator('#site-search-input').fill('materials');check('search results',page.locator('#site-search-results a').count()>0 and 'Materials' in page.locator('#site-search-results').inner_text());page.keyboard.press('Escape');page.wait_for_timeout(100);check('escape search',not page.locator('#site-search').evaluate('(e)=>e.open'))
  block=page.locator('[data-site-code]').first;source=block.locator('code').text_content();block.locator('[data-site-copy]').click();page.wait_for_timeout(150)
  copied=page.evaluate('window.__copied' if args.inline else 'navigator.clipboard.readText()');check('copy exact source without line numbers',source==copied);check('copy feedback','Copied!' in block.locator('output').inner_text())
  check('active navigation',page.locator('#site-doc-nav a[aria-current="page"]').inner_text()=='grid')
  page.set_viewport_size({'width':375,'height':812});page.wait_for_timeout(100);check('mobile navigation collapsed',not page.locator('#site-doc-nav').is_visible());page.locator('#site-nav-toggle').click();page.locator('#site-doc-drawer').wait_for(state='visible');check('mobile navigation opens natively',page.locator('#site-doc-drawer').evaluate('e=>e.matches(":modal")'));page.keyboard.press('Escape');page.locator('#site-doc-drawer').wait_for(state='hidden')
  top=page.locator('#site-top'); menu=page.locator('#site-menu-toggle'); header=page.locator('#site-header');drawer=page.locator('#site-main-menu-drawer')
  check('mobile header links collapsed',not top.is_visible() and menu.is_visible() and drawer.is_hidden())
  check('compact mobile header',header.bounding_box()['height']<=72,header.bounding_box())
  menu.click();drawer.wait_for(state='visible');check('mobile main menu opens',drawer.evaluate('e=>e.matches(":modal")'))
  check('mobile main menu includes GitHub',page.locator('#site-mobile-github').is_visible())
  check('mobile menu focus enters dialog',drawer.evaluate('e=>e.contains(document.activeElement)'))
  page.keyboard.press('Escape');drawer.wait_for(state='hidden');check('mobile main menu Escape returns focus',menu.evaluate('(e)=>e===document.activeElement'))
  menu.click();drawer.wait_for(state='visible');check('modal blocks background focus',page.locator('#site-brand').evaluate('e=>{e.focus();return document.activeElement!==e}'));page.keyboard.press('Escape');drawer.wait_for(state='hidden')
  for width in [320,375,768,1024]:
   page.set_viewport_size({'width':width,'height':812});page.wait_for_timeout(60)
   for density in ['default','spacious']:
    page.evaluate('(v)=>{document.documentElement.setAttribute("data-density",v);document.documentElement.setAttribute("data-typography","technical")}',density)
    page.wait_for_timeout(40);check(f'compact header {width} {density}',header.bounding_box()['height']<=72 and not top.is_visible() and page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),header.bounding_box())
  menu.click();page.set_viewport_size({'width':1440,'height':900});page.wait_for_timeout(60);check('desktop navigation restored',top.is_visible() and not menu.is_visible() and drawer.is_hidden())
  page.set_viewport_size({'width':375,'height':812});page.wait_for_timeout(60);check('mobile main menu closed after resize',not top.is_visible())
  page.evaluate('document.documentElement.setAttribute("data-density","default");document.documentElement.setAttribute("data-typography","default")')
  if args.screenshots:page.screenshot(path=str(shots/'mobile.png'))
  print('search/copy/mobile done',flush=True)
  page.set_viewport_size({'width':1440,'height':900});open_page('docs/dialogs');page.locator('#open-native-dialog').click();check('native dialog opens',page.locator('#native-dialog').evaluate('(e)=>e.open'));page.keyboard.press('Escape');page.wait_for_timeout(100);check('native dialog closes',not page.locator('#native-dialog').evaluate('(e)=>e.open'))
  open_page('docs/popovers');page.locator('button[popovertarget="native-popover-demo"]').first.click();check('popover opens',page.locator('#native-popover-demo').evaluate('(e)=>e.matches(":popover-open")'));page.keyboard.press('Escape');page.wait_for_timeout(100);check('popover closes',not page.locator('#native-popover-demo').evaluate('(e)=>e.matches(":popover-open")'))
  open_page('docs/form-validation');page.locator('[data-site-demo-content] button[type="submit"]').click();check('invalid form blocked',not page.locator('#validation-email').evaluate('(e)=>e.validity.valid'));page.locator('#validation-email').fill('example@example.com');page.locator('#validation-name').fill('Example');page.locator('[data-site-demo-content] button[type="submit"]').click();check('valid demo submission', 'Valid submission' in page.locator('[data-site-demo-status]').first.inner_text())
  open_page('docs/selection');check('indeterminate checkbox initialized',page.locator('#mixed-choice').evaluate('(e)=>e.indeterminate'))
  open_page('docs/scoped');frame=page.frame_locator('[data-site-scope-frame]');check('scoped native button styling',frame.locator('[data-uibms] button').evaluate('(e)=>getComputedStyle(e).minBlockSize')!='auto');check('host untouched',frame.locator('body > button').evaluate('(e)=>getComputedStyle(e).borderRadius')=='0px')
  open_page('');
  if args.screenshots:page.screenshot(path=str(shots/'home.png'))
  browser.close()
except Exception as exc:
 check('uncaught browser error',False,repr(exc))
finally:
 if server:server.terminate();server.wait()
 save_report()

sys.exit(bool(issues))
