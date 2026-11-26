const revision=new URL(import.meta.url).search;
const [{mountMaterial},{mountForms}]=await Promise.all([import('../engines/material.mjs'+revision),import('../engines/forms.mjs'+revision)]);
const material=mountMaterial(document);
// Enhance compatible live examples; keep global settings and native top-layer dialogs independent.
mountForms(document,{filter:el=>!!el.closest('[data-site-demo-content]')&&!el.closest('dialog,[popover]')});
for(const demo of document.querySelectorAll('[data-site-demo-run="liquid-silicone"]')){
  const scope=demo.querySelector('[data-material="liquid-silicone"]');
  if(scope){
    material.registerBackdrop(scope,new URL('../engines/landscape.svg',import.meta.url).href);
    const slider=scope.querySelector('input[type=range]');
    if(slider)slider.addEventListener('input',()=>{scope.style.setProperty('--uibms-material-opacity',slider.value+'%');material.refresh();});
  }
  demo.addEventListener('click',e=>{
    const button=e.target.closest('nav button[aria-pressed]');
    if(!button)return;
    for(const b of button.closest('nav').querySelectorAll('button[aria-pressed]'))b.setAttribute('aria-pressed',String(b===button));
  });
}

document.documentElement.setAttribute('data-site-engines-ready','');
