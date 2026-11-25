import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pages,docPages,groups} from '../src/content/catalog.mjs';
import {profiles,basePath} from '../src/lib/config.mjs';
import {renderHtml,slugify} from '../src/lib/render.mjs';
import {codeBlock} from '../src/lib/code.mjs';
const allowedClasses=new Set(['grid','flex','stack','cluster','sidebar','split','center','container','card','panel','lead','truncate','visually-hidden']);
const attrs=new Set([...profiles.map(p=>'data-'+p.key),'data-uibms','data-effect','data-hover','data-active','data-focus','data-entrance','data-exit','data-scroll']);
const slugs=new Set(pages.map(p=>p.slug));assert.equal(slugs.size,pages.length);
for(const cls of allowedClasses)assert(slugs.has('docs/'+cls),`Missing class ${cls}`);
for(const p of profiles)assert(slugs.has('docs/'+p.key),`Missing profile ${p.key}`);
for(const slug of ['materials','hover','active','focus','entrance','exit','scroll'])assert(slugs.has('docs/'+slug));
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
  for(const base of ['/','/UIBMSCSS/']){const html=renderHtml(p,base);assert(html.includes(`href="${basePath(base)}framework/uibms.full.min.css?v=`));assert(html.includes('id="site-doc-nav"'));assert(html.includes('id="site-appearance"'));assert(html.includes('id="appearance-border"'));assert(!html.includes('{{base}}'));checks+=5;}
}
assert(codeBlock('<button>Copy</button>').includes('token tag'));
console.log(JSON.stringify({pages:pages.length,documentationPages:docPages.length,groups:groups.length,codeExamples,liveExamples,checks},null,2));
