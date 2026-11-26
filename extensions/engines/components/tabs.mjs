// Optional semantic tab interaction. MIT. No dependencies.
const instances=new WeakMap();
const listSelector='.tabs[role="tablist"]';
const inactive=tab=>tab.disabled||tab.getAttribute('aria-disabled')==='true'||tab.hidden;
const set=(el,name,value)=>{if(el.getAttribute(name)!==value)el.setAttribute(name,value);};
export function tabDestination(index,count,key,vertical=false,rtl=false){
  if(count<1)return -1;
  if(key==='Home')return 0;
  if(key==='End')return count-1;
  const forward=vertical?'ArrowDown':rtl?'ArrowLeft':'ArrowRight';
  const backward=vertical?'ArrowUp':rtl?'ArrowRight':'ArrowLeft';
  if(key===forward)return (index+1+count)%count;
  if(key===backward)return (index-1+count)%count;
  return -1;
}
export function mountTabs(root=document){
  if(instances.has(root))return instances.get(root);
  const states=new Map();
  const groups=()=>[...(root.nodeType===1&&root.matches(listSelector)?[root]:[]),...root.querySelectorAll(listSelector)];
  const doc=root.ownerDocument||root;
  function read(list){
    const tabs=Array.from(list.children).filter(el=>el.matches('button[role="tab"][aria-controls][id]'));
    if(!tabs.length)return null;
    const pairs=tabs.map(tab=>({tab,panel:doc.getElementById(tab.getAttribute('aria-controls'))}));
    // Malformed or external targets are not hidden. A panel is owned by
    // exactly one tab, and cannot contain the tab list itself.
    if(pairs.some(({tab,panel})=>!panel||!root.contains(panel)||!panel.matches('[role="tabpanel"]')||panel.getAttribute('aria-labelledby')!==tab.id||panel.contains(list)||list.contains(panel))||
       new Set(pairs.map(p=>p.panel)).size!==pairs.length)return null;
    return pairs;
  }
  const remembered=new Map();
  function remember(el,keys){
    if(!remembered.has(el))remembered.set(el,Object.fromEntries(keys.map(k=>[k,el.getAttribute(k)])));
  }
  function restore(el){
    const attrs=remembered.get(el);if(!attrs)return;
    for(const [k,v] of Object.entries(attrs))if(v===null)el.removeAttribute(k);else set(el,k,v);
    remembered.delete(el);
  }
  function apply(list,tab,focus=false){
    const pairs=states.get(list);if(!pairs||!pairs.some(p=>p.tab===tab)||inactive(tab))return false;
    // Preserve the actual DOM content and form state of all panels.
    for(const pair of pairs){
      const selected=pair.tab===tab;
      set(pair.tab,'aria-selected',String(selected));set(pair.tab,'tabindex',selected?'0':'-1');
      if(pair.panel.hidden===selected)pair.panel.hidden=!selected;
    }
    if(focus)tab.focus();
    return true;
  }
  function refresh(){
    const keep=new Set(),all=new Set();
    for(const list of groups()){
      const pairs=read(list);if(!pairs)continue;
      if(pairs.some(({panel})=>all.has(panel)))continue;
      keep.add(list);states.set(list,pairs);
      for(const {tab,panel} of pairs){remember(tab,['aria-selected','tabindex']);remember(panel,['hidden']);all.add(tab);all.add(panel);}
      const active=pairs.find(p=>!inactive(p.tab)&&p.tab.getAttribute('aria-selected')==='true')||pairs.find(p=>!inactive(p.tab));
      if(active)apply(list,active.tab);
      else for(const {tab,panel} of pairs){set(tab,'aria-selected','false');set(tab,'tabindex','-1');if(panel.hidden)panel.hidden=false;}
    }
    for(const list of states.keys())if(!keep.has(list))states.delete(list);
    for(const el of remembered.keys())if(!all.has(el))restore(el);
  }
  function target(e){
    const tab=e.target.closest?.('button[role="tab"]'),list=tab?.parentElement;
    return tab&&states.get(list)?.some(p=>p.tab===tab)?{tab,list}:null;
  }
  function click(e){
    const t=target(e);if(!t)return;
    if(inactive(t.tab)){e.preventDefault();return;}
    apply(t.list,t.tab);
  }
  function keydown(e){
    const t=target(e);if(!t||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||inactive(t.tab))return;
    const tabs=states.get(t.list).map(p=>p.tab).filter(tab=>!inactive(tab));
    const index=tabs.indexOf(t.tab),vertical=t.list.getAttribute('aria-orientation')==='vertical';
    const next=tabDestination(index,tabs.length,e.key,vertical,getComputedStyle(t.list).direction==='rtl');
    if(next<0)return;
    e.preventDefault();for(const {tab} of states.get(t.list))set(tab,'tabindex',tab===tabs[next]?'0':'-1');
    // Manual activation: arrows move focus; native Enter/Space clicks select.
    tabs[next].focus();
  }
  function focusout(e){
    const t=target(e);if(!t||t.list.contains(e.relatedTarget))return;
    const selected=states.get(t.list).find(p=>p.tab.getAttribute('aria-selected')==='true'&&!inactive(p.tab));
    for(const {tab} of states.get(t.list))set(tab,'tabindex',tab===selected?.tab?'0':'-1');
  }
  root.addEventListener('click',click);root.addEventListener('keydown',keydown);root.addEventListener('focusout',focusout);
  const api={refresh,select(tab,{focus=false}={}){return !!tab&&apply(tab.parentElement,tab,focus);},destroy(){
    root.removeEventListener('click',click);root.removeEventListener('keydown',keydown);root.removeEventListener('focusout',focusout);
    for(const el of remembered.keys())restore(el);states.clear();instances.delete(root);
  }};
  instances.set(root,api);refresh();return api;
}
