const $=(selector,root=document)=>root.querySelector(selector);
const appearanceKey='uibmscss:appearance:v1';
export function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
export function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function setupAppearance(profiles){
  const root=document.documentElement;
  const details=$('#site-appearance'), form=$('#site-appearance-form'), status=$('#site-appearance-status');
  const current=()=>Object.fromEntries(profiles.map(p=>[p.key,root.getAttribute('data-'+p.key)]));
  const sync=()=>{for(const p of profiles){const select=form.elements.namedItem(p.key);select.value=p.values.includes(root.getAttribute('data-'+p.key))?root.getAttribute('data-'+p.key):p.default;}};
  sync();
  details.hidden=false;
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:profiles.map(p=>'data-'+p.key)});
  form.addEventListener('change',e=>{const p=profiles.find(p=>p.key===e.target.name);if(!p||!p.values.includes(e.target.value))return;root.setAttribute('data-'+p.key,e.target.value);status.textContent=save(appearanceKey,current())?'Appearance saved.':'Appearance applied for this page.';});
  form.addEventListener('submit',e=>e.preventDefault());
  $('#site-appearance-reset').addEventListener('click',()=>{for(const p of profiles)root.setAttribute('data-'+p.key,p.default);sync();status.textContent=save(appearanceKey,current())?'Defaults restored.':'Defaults restored for this page.';});
  document.addEventListener('pointerdown',e=>{if(details.open&&!details.contains(e.target))details.open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&details.open){details.open=false;details.querySelector('summary').focus();}});
  window.addEventListener('storage',e=>{if(e.key===appearanceKey||e.key===null){const next=load(appearanceKey,{})||{};for(const p of profiles)root.setAttribute('data-'+p.key,p.values.includes(next[p.key])?next[p.key]:p.default);sync();}});
}
