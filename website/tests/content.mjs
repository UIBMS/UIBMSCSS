import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pages,docPages,groups,allPages,topLinks} from '../src/content/catalog.mjs';
import {demos} from '../src/content/demos.mjs';
import {profiles,basePath,configDetails} from '../src/lib/config.mjs';
import {framework} from '../src/lib/contract.mjs';
import {expressivePalettes,expressiveStyles,paletteRoles,oklch} from '../src/lib/expressive-palettes.mjs';
import {renderHtml,slugify} from '../src/lib/render.mjs';
import {codeBlock} from '../src/lib/code.mjs';
const allowedClasses=new Set(framework.classes);
const componentClasses=new Set(["tabs","segmented","dropdown","tooltip","drawer","drawer-start","drawer-bottom","toasts","toast","stepper","stepper-vertical","stepper-panel","pagination","tags","tag","chips","chip","command-palette","command-results"]);
const dashboardClasses=new Set(["app-shell","app-shell-grid","dashboard-topbar","dashboard-sidebar","dashboard-workspace","sidebar-toggle","sidebar-drawer-toggle","dashboard-nav-drawer","sidebar-nav","sidebar-icon","sidebar-label","topbar-brand","topbar-actions","dashboard-page-header","page-heading","page-actions","dashboard-breadcrumb","split-workspace","split-workspace-grid","split-pane","split-handle","dashboard-view","metric-card","metric-label","metric-value","metric-change","metric-context","widget-grid","sparkline","sparkline-plot","sparkline-values","progress-ring","quick-actions"]);
const attrs=new Set([...profiles.map(p=>'data-'+p.key),'data-uibms',...framework.effectAttributes]);
const css=await readFile(new URL('../../dist/uibms.full.css',import.meta.url),'utf8')+'\n'+expressiveStyles();
assert.equal(expressivePalettes.length,5);
for(const p of expressivePalettes){assert.deepEqual(paletteRoles(p,p.scheme),p.colors);assert.deepEqual(paletteRoles(p,p.scheme==='light'?'dark':'light'),[p.colors[1],p.colors[0],p.colors[2]]);for(const color of p.colors)assert(expressiveStyles().includes(oklch(color)));assert(expressiveStyles(true).includes('[data-palette="'+p.id+'"]'));}
for(const p of profiles){assert(p.values.includes(p.default),p.key);assert.deepEqual(p.values,configDetails[p.key].values.map(([v])=>v));if(p.key!=='material')for(const v of p.values)assert(css.includes('[data-'+p.key+'="'+v+'"]'),`Missing supported profile ${p.key}/${v}`);}
// Dashboard stylesheet dependencies are authored once in the catalogue.
const dashboardPages=docPages.filter(p=>p.group==='Dashboard');
for(const p of dashboardPages){
  assert(Array.isArray(p.stylesheets)&&p.stylesheets.length>0,p.slug+' missing stylesheet metadata');
  assert.equal(new Set(p.stylesheets).size,p.stylesheets.length,p.slug+' duplicate stylesheet');
  for(const file of p.stylesheets){
    assert(/^(dashboard|components)\/[a-z-]+\.css$/.test(file),file);
    await readFile(new URL('../../extensions/engines/'+file,import.meta.url),'utf8');
  }
}
// Preferred widget examples must not require legacy descendant classes.
for(const slug of ['dashboard','kpi-cards','statistic-cards','sparklines','progress-rings','widget-grid']){
  const page=dashboardPages.find(p=>p.slug==='docs/'+slug);
  assert(page,slug);
  for(const example of page.sections.flatMap(s=>s.examples).filter(e=>e.html)){
    for(const match of example.html.matchAll(/\bclass="([^"]+)"/g)){
      assert(!match[1].split(/\s+/).some(cls=>['metric-label','metric-value','metric-context','metric-change','sparkline-plot','sparkline-values'].includes(cls)),slug+' contains a redundant widget child class');
    }
  }
}
// Widgets must not introduce a private fixed palette or duplicate card surfaces.
for(const file of ['metrics','widget-grid','quick-actions','sparkline','progress-ring']){
  const source=await readFile(new URL('../../extensions/engines/dashboard/'+file+'.css',import.meta.url),'utf8');
  assert(!/#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/i.test(source),'Fixed widget colour '+file);
}
const slugs=new Set(pages.map(p=>p.slug));assert.equal(slugs.size,pages.length,'Duplicate page slug: '+pages.map(p=>p.slug).filter((slug,i,all)=>all.indexOf(slug)!==i).join(', '));
for(const cls of allowedClasses)assert(slugs.has('docs/'+cls),`Missing class ${cls}`);
for(const cls of ['tabs','segmented','dropdown','tooltip','drawer','toast','stepper','pagination','chips','command-palette'])assert(slugs.has('docs/'+cls),`Missing optional component ${cls}`);
for(const slug of ['dashboard','app-shell','dashboard-sidebar','topbar','page-header','split-workspace','kpi-cards','statistic-cards','sparklines','progress-rings','widget-grid','quick-actions'])assert(slugs.has('docs/'+slug),'Missing dashboard '+slug);
for(const p of profiles)assert(slugs.has('docs/'+p.key),`Missing profile ${p.key}`);
for(const attr of framework.effectAttributes)assert(slugs.has('docs/'+(attr==='data-effect'?'materials':attr.slice(5))),attr);
for(const p of profiles){const examples=docPages.find(d=>d.slug==='docs/'+p.key).sections.flatMap(s=>s.examples).filter(e=>e.html);assert(examples.some(e=>!e.html.includes('data-'+p.key+'=')),`Missing inherited example for ${p.key}`);}
let checks=0,codeExamples=0,liveExamples=0;
for(const p of pages){
  const ids=new Set();
  for(const s of p.sections){assert(!ids.has(slugify(s.title)),`Duplicate section ${p.slug}/${s.title}`);ids.add(slugify(s.title));
    for(const ex of s.examples){codeExamples++;assert(ex.code&&ex.lang,`Missing code ${p.slug}`);
      if(ex.html){liveExamples++;assert.equal(ex.html,ex.code,`Source differs from rendered markup ${p.slug}`);
        for(const match of ex.html.matchAll(/\bclass="([^"]+)"/g))for(const cls of match[1].split(/\s+/)){assert(allowedClasses.has(cls)||(p.group==='Components'&&componentClasses.has(cls))||(p.group==='Dashboard'&&(dashboardClasses.has(cls)||componentClasses.has(cls))),`Unknown demo class ${cls}`);checks++;}
        for(const match of ex.html.matchAll(/\b(data-[\w-]+)(?:=|[\s>])/g)){assert(attrs.has(match[1])||((p.slug==='docs/chips'||p.group==='Dashboard')&&match[1]==='data-tone'),`Unknown demo attribute ${match[1]}`);checks++;}
        assert(!/\bcontenteditable\b|<script\b/i.test(ex.html));
      }
    }
  }
  for(const base of ['/','/UIBMSCSS/']){const html=renderHtml(p,base);assert(html.includes(`href="${basePath(base)}framework/uibms.full.min.css?v=`));assert(html.includes('id="site-doc-nav"'));for(const id of ['site-main-menu-drawer','site-doc-drawer','site-toc-drawer']){assert(html.includes('id="'+id+'" class="drawer'));assert(html.includes('commandfor="'+id+'" command="show-modal"'));}assert(!html.includes('data-site-menu-open')&&!html.includes('data-site-mobile-open'));assert(html.includes('id="site-appearance"'));assert(!html.includes('{{base}}'));const ids=[...html.matchAll(/<[^>]+\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate IDs ${p.slug}`);for(const a of html.matchAll(/<[^>]+\shref="#([^"#]+)"/g))assert(ids.includes(a[1]),`Missing anchor ${p.slug}#${a[1]}`);checks+=6;}
}
for(const p of pages){
  const html=renderHtml(p,'/UIBMSCSS/');
  const actual=[...html.matchAll(/href="[^"]*\/engines\/(dashboard\/[a-z-]+\.css)\?v=/g)].map(m=>m[1]).sort();
  assert.deepEqual(actual,(p.stylesheets||[]).filter(s=>s.startsWith('dashboard/')).sort(),p.slug+' dashboard asset scope');
}
// Standalone applications have independent layouts and a shared registry.
assert.equal(new Set(allPages.map(p=>p.slug)).size,allPages.length);
assert(topLinks.some(([name,slug])=>name==='Demos'&&slug==='demos'));
const gallery=pages.find(p=>p.slug==='demos');assert(gallery);
for(const demo of demos){
 assert(demo.standalone&&demo.slug.startsWith('demos/')&&demo.features.length);
 assert(pages.some(p=>p.slug===demo.documentation));
 assert(gallery.sections.some(s=>s.body.includes('{{base}}'+demo.slug+'/')));
 for(const name of demo.stylesheets)await readFile(new URL('../../extensions/engines/'+name,import.meta.url),'utf8');
 for(const ext of ['css','js'])await readFile(new URL('../public/assets/'+demo.entry+'.'+ext,import.meta.url),'utf8');
 for(const base of ['/','/UIBMSCSS/']){
  const html=renderHtml(demo,base),ids=[...html.matchAll(/<[^>]+\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'Duplicate demo ID '+demo.slug);
  assert(!/<iframe\b/i.test(html)&&!html.includes('id="site-doc-nav"')&&!html.includes('id="site-header"')&&!html.includes('assets/site.js?v='));
  assert.equal((html.match(/<main\b/g)||[]).length,1);
  assert(html.includes('href="'+basePath(base)+'demos/"'));
  for(const a of html.matchAll(/<[^>]+\shref="#([^"#]+)"/g))assert(ids.includes(a[1]),'Missing demo anchor '+a[1]);
  for(const a of html.matchAll(/\b(?:commandfor|popovertarget|aria-controls)="([^"]+)"/g))assert(ids.includes(a[1]),'Missing demo control target '+a[1]);
  for(const stylesheet of demo.stylesheets)assert(html.includes('engines/'+stylesheet+'?v='));
 }
}
assert(codeBlock('<button>Copy</button>').includes('token tag'));
console.log(JSON.stringify({pages:pages.length,documentationPages:docPages.length,groups:groups.length,codeExamples,liveExamples,checks},null,2));
