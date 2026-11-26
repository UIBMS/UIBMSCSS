import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pages,docPages,groups} from '../src/content/catalog.mjs';
import {profiles,basePath,configDetails} from '../src/lib/config.mjs';
import {framework} from '../src/lib/contract.mjs';
import {expressivePalettes,expressiveStyles,paletteRoles,oklch} from '../src/lib/expressive-palettes.mjs';
import {renderHtml,slugify} from '../src/lib/render.mjs';
import {codeBlock} from '../src/lib/code.mjs';
const allowedClasses=new Set(framework.classes);
const attrs=new Set([...profiles.map(p=>'data-'+p.key),'data-uibms',...framework.effectAttributes]);
const css=await readFile(new URL('../../dist/uibms.full.css',import.meta.url),'utf8')+'\n'+expressiveStyles();
assert.equal(expressivePalettes.length,5);
for(const p of expressivePalettes){assert.deepEqual(paletteRoles(p,p.scheme),p.colors);assert.deepEqual(paletteRoles(p,p.scheme==='light'?'dark':'light'),[p.colors[1],p.colors[0],p.colors[2]]);for(const color of p.colors)assert(expressiveStyles().includes(oklch(color)));assert(expressiveStyles(true).includes('[data-palette="'+p.id+'"]'));}
for(const p of profiles){assert(p.values.includes(p.default),p.key);assert.deepEqual(p.values,configDetails[p.key].values.map(([v])=>v));if(p.key!=='material')for(const v of p.values)assert(css.includes('[data-'+p.key+'="'+v+'"]'),`Missing supported profile ${p.key}/${v}`);}
const slugs=new Set(pages.map(p=>p.slug));assert.equal(slugs.size,pages.length);
for(const cls of allowedClasses)assert(slugs.has('docs/'+cls),`Missing class ${cls}`);
for(const p of profiles)assert(slugs.has('docs/'+p.key),`Missing profile ${p.key}`);
for(const attr of framework.effectAttributes)assert(slugs.has('docs/'+(attr==='data-effect'?'materials':attr.slice(5))),attr);
for(const p of profiles){const examples=docPages.find(d=>d.slug==='docs/'+p.key).sections.flatMap(s=>s.examples).filter(e=>e.html);assert(examples.some(e=>!e.html.includes('data-'+p.key+'=')),`Missing inherited example for ${p.key}`);}
let checks=0,codeExamples=0,liveExamples=0;
for(const p of pages){
  const ids=new Set();
  for(const s of p.sections){assert(!ids.has(slugify(s.title)),`Duplicate section ${p.slug}/${s.title}`);ids.add(slugify(s.title));
    for(const ex of s.examples){codeExamples++;assert(ex.code&&ex.lang,`Missing code ${p.slug}`);
      if(ex.html){liveExamples++;assert.equal(ex.html,ex.code,`Source differs from rendered markup ${p.slug}`);
        for(const match of ex.html.matchAll(/\bclass="([^"]+)"/g))for(const cls of match[1].split(/\s+/)){assert(allowedClasses.has(cls),`Unknown demo class ${cls}`);checks++;}
        for(const match of ex.html.matchAll(/\b(data-[\w-]+)(?:=|[\s>])/g)){assert(attrs.has(match[1]),`Unknown demo attribute ${match[1]}`);checks++;}
        assert(!/\bcontenteditable\b|<script\b/i.test(ex.html));
      }
    }
  }
  for(const base of ['/','/UIBMSCSS/']){const html=renderHtml(p,base);assert(html.includes(`href="${basePath(base)}framework/uibms.full.min.css?v=`));assert(html.includes('id="site-doc-nav"'));assert(html.includes('id="site-appearance"'));assert(!html.includes('{{base}}'));const ids=[...html.matchAll(/<[^>]+\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate IDs ${p.slug}`);for(const a of html.matchAll(/<[^>]+\shref="#([^"#]+)"/g))assert(ids.includes(a[1]),`Missing anchor ${p.slug}#${a[1]}`);checks+=6;}
}
assert(codeBlock('<button>Copy</button>').includes('token tag'));
console.log(JSON.stringify({pages:pages.length,documentationPages:docPages.length,groups:groups.length,codeExamples,liveExamples,checks},null,2));
