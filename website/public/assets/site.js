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
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:data.profiles.map(p=>'data-'+p.key)});
  form.addEventListener('change',e=>{const p=data.profiles.find(p=>p.key===e.target.name);if(!p||!p.values.includes(e.target.value))return;root.setAttribute('data-'+p.key,e.target.value);status.textContent=save(appearanceKey,current())?'Appearance saved.':'Appearance applied for this page.';});
  form.addEventListener('submit',e=>e.preventDefault());
  $('#site-appearance-reset').addEventListener('click',()=>{for(const p of data.profiles)root.setAttribute('data-'+p.key,p.default);sync();status.textContent=save(appearanceKey,current())?'Defaults restored.':'Defaults restored for this page.';});
  document.addEventListener('pointerdown',e=>{if(details.open&&!details.contains(e.target))details.open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&details.open){details.open=false;details.querySelector('summary').focus();}});
  window.addEventListener('storage',e=>{if(e.key===appearanceKey||e.key===null){const next=load(appearanceKey,{})||{};for(const p of data.profiles)root.setAttribute('data-'+p.key,p.values.includes(next[p.key])?next[p.key]:p.default);sync();}});
}
function setupTopNavigation(){
  const header=$('#site-header'), nav=$('#site-top'), toggle=$('#site-menu-toggle');
  const narrow=matchMedia('(max-width:64rem)');
  const isOpen=()=>header.hasAttribute('data-site-menu-open');
  function close(restoreFocus=false){
    header.removeAttribute('data-site-menu-open');toggle.setAttribute('aria-expanded','false');
    if(restoreFocus&&narrow.matches)toggle.focus();
  }
  toggle.addEventListener('click',()=>{
    if(isOpen()){close(true);return;}
    if(!narrow.matches)return;
    $('#site-appearance').open=false;
    header.setAttribute('data-site-menu-open','');toggle.setAttribute('aria-expanded','true');
    $('a',nav)?.focus();
  });
  function dismissOutside(e){if(isOpen()&&!nav.contains(e.target)&&!toggle.contains(e.target))close();}
  document.addEventListener('pointerdown',dismissOutside);
  document.addEventListener('focusin',dismissOutside);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()){e.preventDefault();close(true);}});
  nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
  narrow.addEventListener?.('change',()=>close());
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
  const open=()=>{if(!dialog.open){$('#site-appearance').open=false;dialog.showModal();render();input.focus();}};
  dialog.addEventListener('close',()=>$('#site-search-open').focus());
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
  if(run==='indeterminate'){const input=$('input[type=checkbox]',wrapper);if(input)input.indeterminate=true;}
  if(run?.startsWith('dialog:')){const [,id,button]=run.split(':');const dialog=wrapper.querySelector('#'+CSS.escape(id)),trigger=wrapper.querySelector('#'+CSS.escape(button));if(trigger&&dialog)trigger.addEventListener('click',()=>{if(!dialog.open)dialog.showModal();});}
  wrapper.addEventListener('submit',e=>{if(e.target.getAttribute('method')?.toLowerCase()==='dialog')return;e.preventDefault();$('[data-site-demo-status]',wrapper).textContent='Valid submission. This documentation demo does not transmit data.';});
  const status=$('[data-site-demo-status]',wrapper);
  wrapper.addEventListener('reset',()=>{status.textContent='Native form reset.';});
  wrapper.addEventListener('click',e=>{
    const button=e.target.closest('button[type=button],input[type=button]');
    if(!button||button.disabled||button.matches('[popovertarget],[commandfor],[aria-pressed],[role=tab]')||button.closest('[data-uibms-form-popup],[data-uibms-form-control]'))return;
    if(run?.startsWith('dialog:')&&button.id===run.split(':')[2])return;
    status.textContent='Button activated. This is a local styling demonstration; no application action is connected.';
  });
  wrapper.addEventListener('input',e=>{
    const input=e.target;
    if(input.matches('input[type=range]'))status.textContent=(input.labels?.[0]?.textContent.trim()||'Range')+': '+input.value;
    else if(input.matches('input[type=checkbox],input[type=radio]'))status.textContent=(input.labels?.[0]?.textContent.trim()||'Choice')+': '+(input.checked?'selected':'not selected');
    else if(input.matches('select'))status.textContent='Selected: '+[...input.selectedOptions].map(o=>o.label).join(', ');
  });
 }
}
function setupLiveContext(){
 const frames=$$('[data-site-scope-frame]'),swatches=$$('[data-site-swatch]');
 function syncFrame(frame){
   try{const region=frame.contentDocument?.querySelector('[data-uibms]');if(!region)return;for(const p of data.profiles){if(p.key!=='material')region.setAttribute('data-'+p.key,root.getAttribute('data-'+p.key)||p.default);}}catch{/* Cross-origin frames cannot be synchronized. */}
 }
 function update(){
   for(const frame of frames)syncFrame(frame);
   for(const swatch of swatches){const output=swatch.parentElement.querySelector('[data-site-swatch-value]');if(output)output.textContent=getComputedStyle(swatch).backgroundColor;}
 }
 for(const frame of frames)frame.addEventListener('load',()=>syncFrame(frame));
 new MutationObserver(update).observe(root,{attributes:true,attributeFilter:data.profiles.map(p=>'data-'+p.key)});
 matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',update);update();
}
setupAppearance();setupTopNavigation();setupNavigation();setupSearch();setupCopy();setupDemos();setupLiveContext();
const header=$('#site-header');
function resizeHeader(){root.style.setProperty('--site-header-size',header.getBoundingClientRect().height+'px');}
resizeHeader();if('ResizeObserver' in window)new ResizeObserver(resizeHeader).observe(header);else window.addEventListener('resize',resizeHeader);
root.setAttribute('data-site-ready','');
