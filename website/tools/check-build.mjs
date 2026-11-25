import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {pages} from '../src/content/catalog.mjs';
import {basePath} from '../src/lib/config.mjs';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const base=basePath(process.env.SITE_BASE||'/');
const manifest=JSON.parse(await readFile(path.join(root,'framework/manifest.json'),'utf8'));
for(const [name,v] of Object.entries(manifest.files)){
 const b=await readFile(path.join(root,'framework',name));
 assert.equal(b.length,v.bytes,name);assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,name);
}
await stat(path.join(root,'framework/LICENSE'));
for(const p of pages){
 const html=await readFile(path.join(root,p.slug,'index.html'),'utf8');
 assert(html.includes('id="site-appearance"'),p.slug);
 assert(html.includes('id="site-doc-nav"'),p.slug);
 assert(html.includes(`${base}framework/uibms.full.min.css`),p.slug);
 assert(!html.includes('{{base}}'),p.slug);
 if(process.env.SITE_PUBLIC==='1')assert(!html.includes('noindex, nofollow'),p.slug);
 // Confirm linked local files/directories exist at the configured project base.
 for(const m of html.matchAll(/\b(?:href|src)="([^"]*)"/g)){
  const value=m[1];if(!value.startsWith(base)||value.startsWith('//'))continue;
  const relative=value.slice(base.length).split(/[?#]/,1)[0];
  const local=path.resolve(root,relative);assert(local===root||local.startsWith(root+path.sep),value);
  const info=await stat(local);if(info.isDirectory())await stat(path.join(local,'index.html'));
 }
}
assert((await readFile(path.join(root,'assets/scoped-demo.html'),'utf8')).includes(`${base}framework/uibms.scoped.full.min.css`));
console.log(`Verified ${pages.length} built pages and ${Object.keys(manifest.files).length} CSS assets.`);
