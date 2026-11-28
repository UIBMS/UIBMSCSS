import {expressivePalettes} from './expressive-palettes.mjs';
export const configDetails={
 material:{description:'Choose an optional physical material independently of layout and effects.',values:[['default','Restore native/core surface styling.'],['liquid-silicone','Opt-in translucent silicone, elastic contour and optional custom pickers.']],note:'The optional Material Engine is required for deformation. Explicit default opts a subtree out. See the Liquid silicone and Form Engine reference for supported elements and limitations.'},
 theme:{description:'Control the light, dark or operating-system color scheme.',values:[['auto','Follow the browser/system color scheme.'],['light','Force the light scheme in this context.'],['dark','Force the dark scheme in this context.']],note:'Theme and palette are independent. Explicit nested themes establish their own color context.'},
 palette:{description:'Choose coordinated semantic colors, independently of the color scheme.',values:[['natural','Neutral default, included in standard.'],['default','Restore the natural palette.'],...['ocean','gold','forest','bordeaux','slate','royal','terracotta'].map(v=>[v,'Optional palette; included in full or load its extension.']),...expressivePalettes.map(p=>[p.id,p.description+'; experimental OKLCH palette.'])],note:'The standard distribution includes natural. The five expressive palettes are experimental documentation extensions, not yet part of the released bundles. Unknown or unloaded palettes inherit.'},
 density:{description:'Adjust contextual spacing without reducing native target sizes.',values:[['default','1rem spacing.'],['auto','1rem; 1.5rem for coarse pointers.'],['compact','0.75rem spacing.'],['spacious','1.5rem spacing.']],note:'The --target-size token does not shrink with density. Actual touch device behavior should be verified.'},
 shape:{description:'Control the shared geometry radius.',values:[['default','0.5rem'],['sharp','0px'],['soft','0.25rem'],['rounded','0.75rem'],['organic','1rem']],note:'Controls consume the base radius; cards/panels use twice the radius; dialogs/popovers use three times. Organic uses ordinary rounded corners, not physical squircles. Inset components derive related corner radii from the owner padding and border (GEO-002).'},
 border:{description:'Adjust decorative border intensity independently of theme and palette.',values:[['default','Soft separators and moderate structural boundaries.'],['subtle','Reduced decorative contrast.'],['strong','Original full-strength boundaries.']],note:'Form controls, focus and validation retain their required contrast. Increased-contrast preferences override decorative intensity.'},
 typography:{description:'Configure text, headings and reading width.',values:[['default','System sans-serif; 1rem, 1.6 line height.'],['editorial','Georgia/Times; 1.125rem, 1.75 line height.'],['technical','System monospace; 1rem, 1.55 line height.'],['expressive','System sans-serif; stronger and larger headings.']],note:'Profiles change inherited tokens, not the root rem scale. Native semantic headings remain headings.'},
 effects:{description:'Control the optional default signature interaction behavior.',values:[['default','180ms via the motion token; subtle lift/press.'],['none','Suppress optional default motion and smooth scrolling; explicit effects remain available.'],['minimal','100ms; no default lift; optional extension.'],['fluid','280ms; optional extension.'],['dynamic','220ms; optional extension.']],note:'Full loads all five values. Reduced-motion preferences remain effective. A contextual none does not prohibit explicit individual effects.'}
};
const profileDefinitions=[
  {
    "key": "theme",
    "label": "Theme",
    "default": "auto"
  },
  {
    "key": "palette",
    "label": "Palette",
    "default": "natural"
  },
  {
    "key": "density",
    "label": "Density",
    "default": "default"
  },
  {
    "key": "shape",
    "label": "Shape",
    "default": "default"
  },
  {
    "key": "border",
    "label": "Border intensity",
    "default": "default"
  },
  {
    "key": "typography",
    "label": "Typography",
    "default": "default"
  },
  {
    "key": "effects",
    "label": "Effects",
    "default": "default"
  },
  {
    "key": "material",
    "label": "Material (experimental)",
    "default": "default"
  }
];
export const profiles=profileDefinitions.map(p=>({...p,values:configDetails[p.key].values.map(([value])=>value)}));
export const basePath = (base='/') => '/' + base.split('/').filter(Boolean).join('/') + (base.split('/').filter(Boolean).length ? '/' : '');
export const href = (base,slug='') => basePath(base) + (slug ? slug.replace(/^\/+|\/+$/g,'')+'/' : '');
export const asset = (base,path) => basePath(base)+path.replace(/^\/+/, '');
export const esc = v => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export const initialAttributes = Object.fromEntries(profiles.map(p=>['data-'+p.key,p.default]));
export const titleCase = s => s.split('-').map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');
export const jsonScript = x => JSON.stringify(x).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026');
