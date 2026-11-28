import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {generateWordmark} from '../tools/icons/generate-wordmark.mjs';

const example = generateWordmark('UIBMS', 'WORLD');
assert.equal(example.name, 'uibms-to-world');
for (const extension of ['css','svg']) {
  const committed = await readFile(new URL('../extensions/engines/icons/examples/'+example.name+'.'+extension,import.meta.url),'utf8');
  assert.equal(example[extension],committed,'regenerate the checked-in '+extension);
}

const frames = svg => [...svg.matchAll(/<g transform="translate\([^"]+\)">(.*?)<\/g>/g)].map(match => match[1]);
const exampleFrames = frames(example.svg);
assert.equal(exampleFrames.length,64);
assert.equal(new Set(exampleFrames).size > 32,true);
assert.equal((example.css.match(/mask-position:/g) ?? []).length,exampleFrames.length);
assert.match(example.css, /view-timeline: --uibms-morph-uibms-to-world block/);
assert.match(example.css, /prefers-reduced-motion: no-preference/);
assert.match(example.css, /mask: url\("\.\/uibms-to-world\.svg"\)/);
assert.doesNotMatch(example.svg, /<script|NaN|Infinity|<text/i);

const unequal = generateWordmark('go','open world','my-wordmark');
const unequalFrames = frames(unequal.svg);
assert.equal((unequalFrames[0].match(/<path/g) ?? []).length,2);
assert.equal((unequalFrames.at(-1).match(/<path/g) ?? []).length,10);
assert(unequalFrames.slice(1,-1).some(frame=>frame.includes('opacity=')));
assert.deepEqual(generateWordmark(' open   world ','GO'),generateWordmark('OPEN WORLD','GO'));
assert.doesNotMatch(unequal.svg, /NaN|Infinity/);
assert.throws(()=>generateWordmark('','WORLD'),/Latin letters/);
assert.throws(()=>generateWordmark('<svg>','WORLD'),/Latin letters/);
assert.throws(()=>generateWordmark('UIBMS','WORLD','../other'),/preset name/);
console.log('Wordmark assets, unequal lengths, and validation checks passed.');
