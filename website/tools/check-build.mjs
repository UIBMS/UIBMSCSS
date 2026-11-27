import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {pages} from '../src/content/catalog.mjs';
import {basePath} from '../src/lib/config.mjs';
import {expressiveStyles} from '../src/lib/expressive-palettes.mjs';
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
for(const p of pages){
 const html=await readFile(path.join(root,p.slug,'index.html'),'utf8');
 assert(html.includes('id="site-appearance"'),p.slug);
 assert(html.includes('id="site-doc-nav"'),p.slug);
 assert(html.includes(`${base}framework/uibms.full.min.css`),p.slug);
 assert(!html.includes('{{base}}'),p.slug);
 if(process.env.SITE_PUBLIC==='1')assert(!html.includes('noindex, nofollow'),p.slug);
 const ids=[...html.matchAll(/<[^>]+\sid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,`Duplicate id ${p.slug}`);
 for(const m of html.matchAll(/<[^>]+\shref="#([^"#]+)"/g))assert(ids.includes(m[1]),`Missing fragment ${p.slug}#${m[1]}`);
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
