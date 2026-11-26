// Experimental documentation palettes. OKLCH is the authored source of truth.
// The approved 60/30/10 triplet is retained in its intended scheme.
// The alternate scheme exchanges the main and secondary roles, not the hue.
export const expressivePalettes=[
  {id:'cobalt-archive',name:'Cobalt Archive',description:'Ultramarine / Ivory / Tangerine',scheme:'dark',colors:[[43,.19,265],[94,.025,89],[76,.16,57]]},
  {id:'glacier-ember',name:'Glacier Ember',description:'Glacial Blue / Oxblood / Electric Lemon',scheme:'light',colors:[[91,.045,210],[33,.092,18],[90,.17,105]]},
  {id:'peach-reactor',name:'Peach Reactor',description:'Apricot / Violet Ink / Neon Emerald',scheme:'light',colors:[[85,.08,54],[30,.09,291],[85,.19,155]]},
  {id:'midnight-marigold',name:'Midnight Marigold',description:'Black Orchid / Powder Blue / Marigold',scheme:'dark',colors:[[24,.07,335],[80,.07,240],[84,.159,81]]},
  {id:'graphite-punch',name:'Graphite Punch',description:'Warm Graphite / Bubblegum / Electric Mint',scheme:'dark',colors:[[24,.018,55],[76,.13,350],[86,.16,175]]}
];
export const oklch=([l,c,h])=>'oklch('+l+'% '+c+' '+h+')';
export const paletteRoles=(p,scheme)=>p.scheme===scheme?p.colors:[p.colors[1],p.colors[0],p.colors[2]];
const lightInk='oklch(14% .006 270)',darkInk='oklch(99% 0 0)';
const pair=(a,b)=>'light-dark('+a+', '+b+')';
const original=['default','natural','ocean','gold','forest','bordeaux','slate','royal','terracotta'];
export function expressiveStyles(scoped=false){
  const guard=scoped?':where(:scope, :scope *)':'';
  const sel=ids=>guard+':where('+ids.map(id=>'[data-palette="'+id+'"]').join(', ')+')';
  const rules=(selector,vars)=>selector+' {\n'+Object.entries(vars).map(([key,value])=>'    '+key+': '+value+';').join('\n')+'\n}';
  const role=(p,i)=>pair(oklch(paletteRoles(p,'light')[i]),oklch(paletteRoles(p,'dark')[i]));
  const scopes=body=>scoped?'@scope (:where([data-uibms]:not([data-uibms] [data-uibms]))) {\n'+body+'\n}':body;
  const layers=[];
  // Explicit legacy contexts restore the original button behaviour; unknown
  // palette names and nested theme overrides continue to inherit.
  const config=[rules(sel(original),Object.fromEntries(['--color-main','--color-secondary','--color-loud','--color-on-main','--color-on-secondary','--color-on-loud','--_expressive-hover','--_expressive-hover-text','--_expressive-press','--_expressive-press-text','--_expressive-hover-border'].map(k=>[k,'initial'])))];
  for(const p of expressivePalettes){
    const vars={
      '--color-main':role(p,0),
      '--color-secondary':role(p,1),
      '--color-loud':role(p,2),
      '--color-on-main':pair(lightInk,darkInk),
      '--color-on-secondary':pair(darkInk,lightInk),
      '--color-on-loud':lightInk,
      '--color-background':'var(--color-main)',
      '--color-surface':'color-mix(in oklab, var(--color-main) 96%, var(--color-secondary))',
      '--color-surface-subtle':'color-mix(in oklab, var(--color-main) 89%, var(--color-secondary))',
      '--color-accent':'var(--color-secondary)',
      '--color-on-accent':'var(--color-on-secondary)',
      '--color-text':'var(--color-on-main)',
      '--color-text-muted':'color-mix(in oklab, var(--color-on-main) 82%, var(--color-main))',
      '--color-border-strong':'color-mix(in oklab, var(--color-on-main) 62%, var(--color-main))',
      '--color-focus':'var(--color-secondary)',
      '--color-success':pair('oklch(33% .075 150)','oklch(91% .065 150)'),
      '--color-warning':pair('oklch(33% .07 76)','oklch(93% .075 85)'),
      '--color-danger':pair('oklch(36% .13 25)','oklch(91% .045 22)'),
      '--color-info':pair('oklch(33% .075 245)','oklch(92% .045 235)'),
      '--_expressive-hover':pair('oklch(from var(--color-secondary) calc(l + .04) c h)','oklch(from var(--color-secondary) calc(l - .04) c h)'),
      '--_expressive-hover-text':'var(--color-on-secondary)',
      '--_expressive-hover-border':'transparent',
      '--_expressive-press':'var(--color-loud)',
      '--_expressive-press-text':'var(--color-on-loud)'
    };
    config.push(rules(sel([p.id]),vars));
  }
  layers.push('@layer configuration {\n'+scopes(config.join('\n'))+'\n}');
  layers.push('@layer defaults.contexts {\n'+scopes(rules(sel(expressivePalettes.map(p=>p.id)),{color:'var(--color-text)','background-color':'var(--color-background)'}))+'\n}');
  // Same specificity and layer as the original core states. In a legacy
  // context the fallbacks are exactly the core values. Explicit features
  // and site-specific unlayered overrides continue to take precedence.
  const actions=guard+':where(button:not(:disabled, [aria-disabled="true"]), input:is([type="button"], [type="submit"], [type="reset"]):not(:disabled, [aria-disabled="true"]))';
  const hover=actions+':where(:hover),\n'+guard+':where(input[type="file"]:not(:disabled):hover)::file-selector-button';
  const defaults='@media (hover: hover) {\n'+rules(hover,{
    'background-color':'var(--_expressive-hover, var(--color-surface-subtle))',
    color:'var(--_expressive-hover-text, var(--color-text))',
    'border-color':'var(--_expressive-hover-border, var(--color-border-strong))'
  })+'\n}\n'+rules(actions+':where(:active)',{
    'background-color':'var(--_expressive-press, var(--color-surface-subtle))',
    color:'var(--_expressive-press-text, var(--color-text))'
  });
  layers.push('@layer defaults {\n'+scopes(defaults)+'\n}');
  return '/* UIBMS CSS | experimental OKLCH palettes for the documentation site */\n'+layers.join('\n')+'\n';
}
