// Read the actual generated framework rather than maintaining a duplicate API inventory.
import {readFileSync} from 'node:fs';
export const inventory=function inventory(css,manifest){
  const text=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@layer\s+[\w.,\s-]+(?=[{;])/g,'');
  const unique=items=>[...new Set(items)];
  const classes=unique([...text.matchAll(/\.([a-z][a-z0-9-]*)\b/g)].map(m=>m[1]));
  const effectAttributes=unique([...text.matchAll(/\[(data-[a-z-]+)~=/g)].map(m=>m[1]));
  const colorRoles=unique([...text.matchAll(/--color-([a-z-]+)\s*:/g)].map(m=>m[1]));
  const stylesheets=Object.keys(manifest.files);
  return {classes,effectAttributes,colorRoles,stylesheets,mainStylesheets:stylesheets.filter(x=>!x.includes('/')),extensionStylesheets:stylesheets.filter(x=>x.includes('/')),optionalModules:manifest.optionalModules};
};
export const framework=inventory(readFileSync(new URL('../../../dist/uibms.full.css',import.meta.url),'utf8'),JSON.parse(readFileSync(new URL('../../../dist/manifest.json',import.meta.url),'utf8')));
