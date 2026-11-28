import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {icons, iconGroups} from '../tools/icons/icon-catalogue.mjs';
import {iconStylesheet, iconSvg} from '../tools/icons/generate-icons.mjs';

const root = new URL('../extensions/engines/icons/', import.meta.url);
const svgFolder = new URL('svg/', root);
const names = icons.map(([name]) => name);
assert.equal(new Set(names).size, 64);
assert.equal(Object.keys(iconGroups).length, 8);
assert.deepEqual((await readdir(svgFolder)).sort(),names.map(name => name+'.svg').sort());
const sheet = iconStylesheet();
assert.equal(await readFile(new URL('icons.css',root),'utf8'),sheet);
assert.equal(new Set(icons.map(([, , geometry]) => geometry)).size, 64);

for (const [name,label,geometry] of icons) {
  assert.match(name,/^[a-z]+(?:-[a-z]+)*$/);
  assert(label.length > 0);
  const svg = await readFile(new URL(name+'.svg',svgFolder),'utf8');
  assert.equal(svg,iconSvg(geometry),'Regenerate '+name);
  assert.match(svg, /viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"/);
  assert.doesNotMatch(svg, /<script|<image|<foreignObject|\bhref=|\bon\w+=/i);
  assert(sheet.includes('[data-icon="'+name+'"]'));
}
console.log('Verified 64 unique SVGs and the optional icon stylesheet against their source.');
