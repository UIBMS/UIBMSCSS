import {mountMaterial} from '../engines/material.mjs';
import {mountForms} from '../engines/forms.mjs';
mountMaterial(document);
mountForms(document);
for(const demo of document.querySelectorAll('[data-site-demo-run="liquid-silicone"]')){
  demo.addEventListener('click',e=>{
    const button=e.target.closest('nav button[aria-pressed]');
    if(!button)return;
    for(const b of button.closest('nav').querySelectorAll('button[aria-pressed]'))b.setAttribute('aria-pressed',String(b===button));
  });
}
