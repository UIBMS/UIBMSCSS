import {load, save, setupAppearance} from './appearance.js';

// Website behavior only. The CSS framework has no JavaScript runtime.
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const data=JSON.parse($('#site-data').textContent);
const root=document.documentElement;
const navKey='uibmscss:navigation:v1';
const scrollKey='uibmscss:navigation-scroll:v1';
function setupNavigation(){
  // Native details supplies disclosure; JavaScript only persists its state.
  // Both authored navigation trees use the same catalogue and group keys.
  const sidebar=$('#site-sidebar'), nav=$('#site-doc-nav'), mobile=$('#site-mobile-doc-nav');
  const groups=$$('[data-site-nav-group]',nav).concat($$('[data-site-nav-group]',mobile));
  const saved=load(navKey,{});
  for(const group of groups){
    const key=group.dataset.siteNavGroup;
    const active=!!$('a[aria-current="page"]',group);
    if(active)group.open=true;else if(typeof saved[key]==='boolean')group.open=saved[key];
    group.addEventListener('toggle',()=>{
      const states=load(navKey,{});states[key]=group.open;save(navKey,states);
      for(const peer of groups)if(peer!==group&&peer.dataset.siteNavGroup===key&&peer.open!==group.open)peer.open=group.open;
    });
  }
  // CSS controls all breakpoint visibility. Close an active native modal if
  // its invoker disappears after rotation/resizing, otherwise it stays modal.
  const drawers=$$('#site-main-menu-drawer,#site-doc-drawer,#site-toc-drawer');
  const invoker=dialog=>$('button[commandfor="'+dialog.id+'"]');
  const reconcile=()=>{for(const drawer of drawers)if(drawer.open&&!invoker(drawer)?.getClientRects().length)drawer.close();};
  window.addEventListener('resize',reconcile,{passive:true});
  for(const drawer of drawers){
    drawer.addEventListener('beforetoggle',event=>{if(event.newState==='open')$('#site-appearance').open=false;});
    drawer.addEventListener('click',event=>{
      const link=event.target.closest('a[href^="#"]');
      if(link&&drawer.contains(link)&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!event.shiftKey){
        drawer.close();
        const target=document.getElementById(link.getAttribute('href').slice(1));
        if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
      }
    });
  }
  let restoring=true;
  const visible=()=>!!sidebar.getClientRects().length;
  if(visible()){sidebar.scrollTop=Number(load(scrollKey,0))||0;const active=$('a[aria-current="page"]',nav);if(active){const a=active.getBoundingClientRect(),b=sidebar.getBoundingClientRect();if(a.bottom>b.bottom||a.top<b.top)sidebar.scrollTop+=a.top-b.top-60;}}
  requestAnimationFrame(()=>{restoring=false;});
  sidebar.addEventListener('scroll',()=>{if(!restoring&&visible())save(scrollKey,sidebar.scrollTop);},{passive:true});
}
function setupSearch(){
  const dialog=$('#site-search'), input=$('#site-search-input'), results=$('#site-search-results'), count=$('#site-search-count');
  let index;
  const searchIndex=()=>index??=data.index.map(p=>{
    const title=p.title.toLowerCase(),main=(p.title+' '+p.slug+' '+p.description+' '+p.group).toLowerCase();
    return {p,title,main,all:main+' '+p.terms.toLowerCase()};
  });
  const render=()=>{
    const q=input.value.toLowerCase().trim();const words=q.split(/\s+/).filter(Boolean);
    const hits=searchIndex().map(({p,title,main,all})=>({p,score:words.every(w=>all.includes(w))?words.reduce((s,w)=>s+(title.includes(w)?8:main.includes(w)?4:1),1):-1})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score);
    const shown=(q?hits:hits.filter(x=>x.p.slug.startsWith('docs/'))).slice(0,25);
    results.replaceChildren();
    for(const {p} of shown){const li=document.createElement('li'), a=document.createElement('a'), title=document.createElement('strong'), description=document.createElement('small');a.href=data.base+(p.slug?p.slug+'/':'');title.textContent=p.title;description.textContent=p.group+' · '+p.description;a.append(title,description);li.append(a);results.append(li);}
    count.textContent=q?(hits.length?`${hits.length} matching page${hits.length===1?'':'s'}${hits.length>25?' (first 25 shown)':''}.`:'No matches. Try another term.'): 'Popular reference pages. Type to search.';
  };
  const open=()=>{if(!dialog.open){$('#site-appearance').open=false;dialog.showModal();render();input.focus();}};
  $('#site-search-open').addEventListener('click',open);
  input.addEventListener('input',render);
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!document.querySelector('dialog:modal')){e.preventDefault();open();}});
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
  if(run?.startsWith('dialog:')){
    const [,id,button]=run.split(':'),dialog=wrapper.querySelector('#'+CSS.escape(id)),trigger=wrapper.querySelector('#'+CSS.escape(button));
    if(trigger&&dialog&&(!('commandForElement' in trigger)||!('command' in trigger)))
      trigger.addEventListener('click',()=>{if(!dialog.open)dialog.showModal();});
  }
  wrapper.addEventListener('submit',e=>{if(e.target.getAttribute('method')?.toLowerCase()==='dialog')return;e.preventDefault();$('[data-site-demo-status]',wrapper).textContent='Valid submission. This documentation demo does not transmit data.';});
  const status=$('[data-site-demo-status]',wrapper);
  wrapper.addEventListener('reset',()=>{status.textContent='Native form reset.';});
  wrapper.addEventListener('click',e=>{
    const button=e.target.closest('button[type=button],input[type=button]');
    if(['toast','stepper','pagination','chips','command','dashboard'].includes(run)||!button||button.disabled||button.matches('[popovertarget],[commandfor],[aria-pressed],[role=tab]')||button.closest('[data-uibms-form-popup],[data-uibms-form-control]'))return;
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
 if(!frames.length&&!swatches.length)return;
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
setupAppearance(data.profiles);setupNavigation();setupSearch();setupCopy();setupDemos();setupLiveContext();
const header=$('#site-header');
function resizeHeader(){const size=header.getBoundingClientRect().height+'px';if(root.style.getPropertyValue('--site-header-size')!==size)root.style.setProperty('--site-header-size',size);}
resizeHeader();if('ResizeObserver' in window)new ResizeObserver(resizeHeader).observe(header);else window.addEventListener('resize',resizeHeader);
root.setAttribute('data-site-ready','');
