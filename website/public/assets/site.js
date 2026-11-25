// Website behavior only. The CSS framework has no JavaScript runtime.
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const data=JSON.parse($('#site-data').textContent);
const root=document.documentElement;
const appearanceKey='uibmscss:appearance:v1';
const navKey='uibmscss:navigation:v1';
const scrollKey='uibmscss:navigation-scroll:v1';
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
function setupAppearance(){
  const details=$('#site-appearance'), form=$('#site-appearance-form'), status=$('#site-appearance-status');
  const current=()=>Object.fromEntries(data.profiles.map(p=>[p.key,root.getAttribute('data-'+p.key)]));
  const sync=()=>{for(const p of data.profiles){const select=form.elements.namedItem(p.key);select.value=p.values.includes(root.getAttribute('data-'+p.key))?root.getAttribute('data-'+p.key):p.default;}};
  sync();
  form.addEventListener('change',e=>{const p=data.profiles.find(p=>p.key===e.target.name);if(!p||!p.values.includes(e.target.value))return;root.setAttribute('data-'+p.key,e.target.value);status.textContent=save(appearanceKey,current())?'Appearance saved.':'Appearance applied for this page.';});
  form.addEventListener('submit',e=>e.preventDefault());
  $('#site-appearance-reset').addEventListener('click',()=>{for(const p of data.profiles)root.setAttribute('data-'+p.key,p.default);sync();status.textContent=save(appearanceKey,current())?'Defaults restored.':'Defaults restored for this page.';});
  document.addEventListener('pointerdown',e=>{if(details.open&&!details.contains(e.target))details.open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&details.open){details.open=false;details.querySelector('summary').focus();}});
  window.addEventListener('storage',e=>{if(e.key===appearanceKey){const next=load(appearanceKey,{});for(const p of data.profiles)root.setAttribute('data-'+p.key,p.values.includes(next[p.key])?next[p.key]:p.default);sync();}});
}
function setupNavigation(){
  const sidebar=$('#site-sidebar'), toggle=$('#site-nav-toggle'), nav=$('#site-doc-nav');
  const saved=load(navKey,{});
  for(const group of $$('[data-site-nav-group]',nav)){
    const active=!!$('a[aria-current="page"]',group);
    if(active)group.open=true;else if(typeof saved[group.dataset.siteNavGroup]==='boolean')group.open=saved[group.dataset.siteNavGroup];
    group.addEventListener('toggle',()=>{const states=load(navKey,{});states[group.dataset.siteNavGroup]=group.open;save(navKey,states);});
  }
  const narrow=matchMedia('(max-width:54rem)');
  function collapse(){sidebar.removeAttribute('data-site-mobile-open');toggle.setAttribute('aria-expanded','false');}
  toggle.addEventListener('click',()=>{const open=!sidebar.hasAttribute('data-site-mobile-open');sidebar.toggleAttribute('data-site-mobile-open',open);toggle.setAttribute('aria-expanded',String(open));});
  narrow.addEventListener?.('change',collapse);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&narrow.matches&&sidebar.hasAttribute('data-site-mobile-open')){collapse();toggle.focus();}});
  let restoring=true;
  if(!narrow.matches){sidebar.scrollTop=Number(load(scrollKey,0))||0;const active=$('a[aria-current="page"]',nav);if(active){const a=active.getBoundingClientRect(),b=sidebar.getBoundingClientRect();if(a.bottom>b.bottom||a.top<b.top)sidebar.scrollTop+=a.top-b.top-60;}}
  requestAnimationFrame(()=>{restoring=false;});
  sidebar.addEventListener('scroll',()=>{if(!restoring&&!narrow.matches)save(scrollKey,sidebar.scrollTop);},{passive:true});
}
function setupSearch(){
  const dialog=$('#site-search'), input=$('#site-search-input'), results=$('#site-search-results'), count=$('#site-search-count');
  const render=()=>{
    const q=input.value.toLowerCase().trim();const words=q.split(/\s+/).filter(Boolean);
    const hits=data.index.map(p=>{const title=p.title.toLowerCase(), main=(p.title+' '+p.slug+' '+p.description+' '+p.group).toLowerCase(), all=main+' '+p.terms.toLowerCase();return {p,score:words.every(w=>all.includes(w))?words.reduce((s,w)=>s+(title.includes(w)?8:main.includes(w)?4:1),1):-1};}).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score);
    const shown=(q?hits:hits.filter(x=>x.p.slug.startsWith('docs/'))).slice(0,25);
    results.replaceChildren();
    for(const {p} of shown){const li=document.createElement('li'), a=document.createElement('a'), title=document.createElement('strong'), description=document.createElement('small');a.href=data.base+(p.slug?p.slug+'/':'');title.textContent=p.title;description.textContent=p.group+' · '+p.description;a.append(title,description);li.append(a);results.append(li);}
    count.textContent=q?(hits.length?`${hits.length} matching page${hits.length===1?'':'s'}${hits.length>25?' (first 25 shown)':''}.`:'No matches. Try another term.'): 'Popular reference pages. Type to search.';
  };
  const open=()=>{if(!dialog.open){dialog.showModal();render();input.focus();}};
  $('#site-search-open').addEventListener('click',open);
  input.addEventListener('input',render);
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close();$('#site-search-open').focus();}});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();}});
}
function setupCopy(){
 document.addEventListener('click',async e=>{
  const button=e.target.closest('[data-site-copy]');if(!button)return;
  const block=button.closest('[data-site-code]'), code=$('code',block), status=$('output',block), text=code.textContent;
  try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);status.textContent='Copied!';}
  catch{const range=document.createRange();range.selectNodeContents(code);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);let copied=false;try{copied=document.execCommand('copy');}catch{}if(copied){selection.removeAllRanges();status.textContent='Copied!';}else{status.textContent='Code selected. Press Ctrl/Cmd+C.';}}
  clearTimeout(button.copyTimer);button.copyTimer=setTimeout(()=>{status.textContent='';},4000);
 });
}
function setupDemos(){
 for(const wrapper of $$('[data-site-preview]')){
  const run=wrapper.dataset.siteDemoRun;
  if(run==='indeterminate')$('#mixed-choice',wrapper).indeterminate=true;
  if(run?.startsWith('dialog:')){const [,id,button]=run.split(':');document.getElementById(button).addEventListener('click',()=>document.getElementById(id).showModal());}
  wrapper.addEventListener('submit',e=>{if(e.target.getAttribute('method')?.toLowerCase()==='dialog')return;e.preventDefault();$('[data-site-demo-status]',wrapper).textContent='Valid submission. This documentation demo does not transmit data.';});
  wrapper.addEventListener('reset',()=>{$('[data-site-demo-status]',wrapper).textContent='';});
 }
}
setupAppearance();setupNavigation();setupSearch();setupCopy();setupDemos();
const header=$('#site-header');
function resizeHeader(){root.style.setProperty('--site-header-size',header.getBoundingClientRect().height+'px');}
resizeHeader();if('ResizeObserver' in window)new ResizeObserver(resizeHeader).observe(header);else window.addEventListener('resize',resizeHeader);
root.setAttribute('data-site-ready','');
