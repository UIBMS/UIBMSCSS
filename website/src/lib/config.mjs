export const profiles = [
  { key:'theme', label:'Theme', default:'auto', values:['auto','light','dark'] },
  { key:'palette', label:'Palette', default:'natural', values:['natural','ocean','gold','forest','bordeaux','slate','royal','terracotta'] },
  { key:'density', label:'Density', default:'default', values:['default','auto','compact','spacious'] },
  { key:'shape', label:'Shape', default:'default', values:['default','sharp','soft','rounded','organic'] },
  { key:'typography', label:'Typography', default:'default', values:['default','editorial','technical','expressive'] },
  { key:'effects', label:'Effects', default:'default', values:['default','none','minimal','fluid','dynamic'] }
];
export const basePath = (base='/') => '/' + base.split('/').filter(Boolean).join('/') + (base.split('/').filter(Boolean).length ? '/' : '');
export const href = (base,slug='') => basePath(base) + (slug ? slug.replace(/^\/+|\/+$/g,'')+'/' : '');
export const asset = (base,path) => basePath(base)+path.replace(/^\/+/, '');
export const esc = v => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export const initialAttributes = Object.fromEntries(profiles.map(p=>['data-'+p.key,p.default]));
export const titleCase = s => s.charAt(0).toUpperCase()+s.slice(1);
export const jsonScript = x => JSON.stringify(x).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026');
