// Offline review helper: exact same content, Prism and rendering functions as the Astro route.
// Not a deployment or substitute for `astro build` verification.
import {mkdir,cp,writeFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {stageAssets} from './stage-assets.mjs';
import {allPages as pages} from '../src/content/catalog.mjs';
import {wordpressPatterns,wordpressPatternFile} from '../src/content/wordpress.mjs';
import {renderHtml,renderScopedFrame} from '../src/lib/render.mjs';
import {basePath} from '../src/lib/config.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const base=basePath(process.env.SITE_BASE||'/');
const output=path.join(root,'preview-output');
await stageAssets();
await rm(output,{recursive:true,force:true});
const target=path.join(output,base.slice(1));
await mkdir(target,{recursive:true});
await cp(path.join(root,'public'),target,{recursive:true});
for(const page of pages){const dest=path.join(target,page.slug);await mkdir(dest,{recursive:true});await writeFile(path.join(dest,'index.html'),renderHtml(page,base));}
await writeFile(path.join(target,'assets/scoped-demo.html'),renderScopedFrame(base));
const patterns=path.join(target,'wordpress/patterns');
await mkdir(patterns,{recursive:true});
for(const pattern of wordpressPatterns)
  await writeFile(path.join(patterns,pattern.slug+'.php'),wordpressPatternFile(pattern));
console.log(`Generated ${pages.length} review pages in ${target}`);
