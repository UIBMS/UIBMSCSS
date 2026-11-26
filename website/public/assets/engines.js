import {mountMaterial} from '../engines/material.mjs';
import {mountForms} from '../engines/forms.mjs';
const material=mountMaterial(document);
mountForms(document);
for(const demo of document.querySelectorAll('[data-site-demo-run="liquid-silicone"]')){
  const scope=demo.querySelector('[data-material="liquid-silicone"]');
  if(scope){scope.style.setProperty('--uibms-material-tint','#dceaff');scope.style.setProperty('--uibms-material-opacity','18%');scope.style.setProperty('--uibms-material-border','rgba(255,255,255,.65)');material.registerBackdrop(scope,new URL('../engines/landscape.svg',import.meta.url).href);}
  demo.addEventListener('click',e=>{
    const button=e.target.closest('nav button[aria-pressed]');
    if(!button)return;
    for(const b of button.closest('nav').querySelectorAll('button[aria-pressed]'))b.setAttribute('aria-pressed',String(b===button));
  });
}
