import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {allPages as pages} from '../src/content/catalog.mjs';
import {wordpressPatterns} from '../src/content/wordpress.mjs';
import {basePath} from '../src/lib/config.mjs';
import {expressiveStyles} from '../src/lib/expressive-palettes.mjs';
import {assertDocumentReferences,assertPreferredMarkup,requiredStyles} from '../tests/semantic.mjs';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const base=basePath(process.env.SITE_BASE||'/');
const manifest=JSON.parse(await readFile(path.join(root,'framework/manifest.json'),'utf8'));
for(const [name,v] of Object.entries(manifest.files)){
 const b=await readFile(path.join(root,'framework',name));
 assert.equal(b.length,v.bytes,name);assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,name);
}
await stat(path.join(root,'framework/LICENSE'));
assert.equal(await readFile(path.join(root,'assets/expressive-palettes.css'),'utf8'),expressiveStyles());
assert.equal(await readFile(path.join(root,'assets/expressive-palettes.scoped.css'),'utf8'),expressiveStyles(true));
for(const file of ['material.mjs','media-deformation.mjs','forms.mjs','liquid-silicone.css','forms.css','landscape.svg'])await stat(path.join(root,'engines',file));
for(const file of ['tabs.css','tabs.mjs','segmented.css','floating.mjs','dropdown.css','dropdown.mjs','tooltip.css','tooltip.mjs','drawer.css','drawer.mjs','toast.css','toast.mjs','stepper.css','stepper.mjs','pagination.css','pagination.mjs','chips.css','chips.mjs','command.css','command.mjs','README.md'])await stat(path.join(root,'engines/components',file));
for(const file of ['app-shell.css','app-shell.mjs','sidebar.css','topbar.css','page-header.css','split-workspace.css','split-workspace.mjs','metrics.css','widget-grid.css','quick-actions.css','sparkline.css','sparkline.mjs','progress-ring.css','progress-ring.mjs','README.md'])await stat(path.join(root,'engines/dashboard',file));
for(const file of ['spacing-preview.css','spacing-preview.mjs'])await stat(path.join(root,'engines/wordpress',file));
for(const pattern of wordpressPatterns){
 const file=await readFile(path.join(root,'wordpress/patterns',pattern.slug+'.php'),'utf8');
 assert(file.includes(' * Slug: uibms/'+pattern.slug+'\n'),pattern.slug);
 assert.equal(file.split('?>\n')[1],pattern.markup+'\n',pattern.slug+' downloadable block markup');
}
for(const p of pages){
 const html=await readFile(path.join(root,p.slug,'index.html'),'utf8');
 assertDocumentReferences(html,p.slug);
 if(p.componentShowcase){
  const examples=p.sections.flatMap(s=>s.topics.flatMap(t=>t.examples));
  assert.equal((html.match(/<section data-site-example>/g)||[]).length,examples.length,p.slug+' live examples');
  assert(!/<iframe\b/i.test(html),p.slug+' must not embed iframes');
  for(const name of requiredStyles(html))assert(html.includes('/engines/'+name+'?v='),p.slug+' missing '+name);
 }
 if(p.standalone){
  assertPreferredMarkup(html,p.slug);
  for(const stylesheet of requiredStyles(html))assert(html.includes('/engines/'+stylesheet+'?v='),p.slug+' missing component stylesheet '+stylesheet);
  assert(!/<iframe\b/i.test(html),p.slug+' must not embed an iframe');
  assert(!html.includes('id="site-doc-nav"')&&!html.includes('id="site-header"'),p.slug+' must not include the documentation shell');
  assert(html.includes('/assets/'+p.entry+'.js?v=')&&html.includes('/assets/'+p.entry+'.css?v='),p.slug+' missing application assets');
 }else{
  assert(html.includes('id="site-appearance"'),p.slug);
  assert(html.includes('id="site-doc-nav"'),p.slug);
 }
 assert(html.includes(`${base}framework/uibms.full.min.css`),p.slug);
 assert(!html.includes('{{base}}'),p.slug);
 if(process.env.SITE_PUBLIC==='1')assert(!html.includes('noindex, nofollow'),p.slug);
 // Confirm linked local files/directories exist at the configured project base.
 for(const m of html.matchAll(/\b(?:href|src)="([^"]*)"/g)){
  const value=m[1];if(!value.startsWith(base)||value.startsWith('//'))continue;
  const relative=value.slice(base.length).split(/[?#]/,1)[0];
  const local=path.resolve(root,relative);assert(local===root||local.startsWith(root+path.sep),value);
  const info=await stat(local),target=info.isDirectory()?path.join(local,'index.html'):local;
  if(info.isDirectory())await stat(target);
  const fragment=value.includes('#')?decodeURIComponent(value.split('#')[1]):'';
  if(fragment&&target.endsWith('.html')){const targetHtml=await readFile(target,'utf8');const targetIds=[...targetHtml.matchAll(/<[^>]+\sid="([^"]+)"/g)].map(m=>m[1]);assert(targetIds.includes(fragment),`Missing target fragment ${value}`);}
 }
}
assert((await readFile(path.join(root,'assets/scoped-demo.html'),'utf8')).includes(`${base}framework/uibms.scoped.full.min.css`));
console.log(`Verified ${pages.length} built pages and ${Object.keys(manifest.files).length} CSS assets.`);
