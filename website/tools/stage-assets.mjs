import {cp, mkdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {expressiveStyles} from '../src/lib/expressive-palettes.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export async function stageAssets(){
  const source=path.resolve(root,'../dist');
  const manifest=JSON.parse(await readFile(path.join(source,'manifest.json'),'utf8'));
  const target=path.join(root,'public/framework');
  // Validate source before touching generated assets; never modify the framework.
  for(const [name,entry] of Object.entries(manifest.files)){
    if(path.isAbsolute(name)||name.split('/').includes('..')) throw new Error('Unsafe manifest path');
    const bytes=await readFile(path.join(source,name));
    if(bytes.length!==entry.bytes || createHash('sha256').update(bytes).digest('hex')!==entry.sha256) throw new Error(`Framework integrity mismatch: ${name}`);
  }
  await rm(target,{recursive:true,force:true}); await mkdir(target,{recursive:true});
  for(const name of ['manifest.json',...Object.keys(manifest.files)]){
    const dest=path.join(target,name); await mkdir(path.dirname(dest),{recursive:true}); await cp(path.join(source,name),dest);
  }
  await cp(path.resolve(root,'../LICENSE'),path.join(target,'LICENSE'));
  const engines=path.join(root,'public/engines');
  await rm(engines,{recursive:true,force:true});
  await cp(path.resolve(root,'../extensions/engines'),engines,{recursive:true});
  const siteAssets=path.join(root,'public/assets');
  await mkdir(siteAssets,{recursive:true});
  await writeFile(path.join(siteAssets,'expressive-palettes.css'),expressiveStyles());
  await writeFile(path.join(siteAssets,'expressive-palettes.scoped.css'),expressiveStyles(true));
  return manifest;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await stageAssets();
