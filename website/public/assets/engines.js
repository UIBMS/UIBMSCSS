const revision=new URL(import.meta.url).search;
const [{mountMaterial},{mountForms}]=await Promise.all([import('../engines/material.mjs'+revision),import('../engines/forms.mjs'+revision)]);
if(document.querySelector('.tabs[role="tablist"]')){
  const {mountTabs}=await import('../engines/components/tabs.mjs'+revision);
  mountTabs(document);
}
const material=mountMaterial(document,{mediaLoader:()=>import('../engines/media-deformation.mjs'+revision)});
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

// The deformable video example has real HTML playback controls, not a
// rasterized imitation of browser controls. Ordinary native players are untouched.
for(const demo of document.querySelectorAll('[data-site-demo-run="media-deformation"]')){
  const video=demo.querySelector('video'),play=demo.querySelector('button'),seek=demo.querySelector('input[type=range]'),out=demo.querySelector('output');
  if(!video||!play||!seek||!out)continue;
  function update(){
    const duration=Number.isFinite(video.duration)?video.duration:0;
    play.textContent=video.paused?'Play':'Pause';
    seek.disabled=!duration;seek.max=String(duration||1);seek.value=String(video.currentTime||0);
    out.value=(video.currentTime||0).toFixed(1)+' / '+duration.toFixed(1)+' s';
  }
  play.addEventListener('click',async()=>{try{if(video.paused)await video.play();else video.pause();}catch{out.value='Playback unavailable';}});
  seek.addEventListener('input',()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value);});
  for(const type of ['loadedmetadata','timeupdate','play','pause','ended','seeked'])video.addEventListener(type,update);
  update();
}
document.documentElement.setAttribute('data-site-engines-ready','');
