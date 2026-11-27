// Optional panel navigation. The application owns validation and completion.
const instances=new WeakMap();
const disabled=el=>el.disabled||el.matches('[aria-disabled="true"],[hidden]')||!!el.closest('[inert],[hidden]');
export function mountStepper(list,{scope=list.parentElement}={}){
  if(instances.has(list))return instances.get(list);
  if(!list?.matches('ol.stepper')||!scope?.contains(list))throw new TypeError('Expected an ordered stepper inside its scope');
  const doc=list.ownerDocument,remembered=new Map();
  let pairs=[],current=-1,dead=false;
  const remember=(el,name)=>{if(!remembered.has(el))remembered.set(el,[name,el.getAttribute(name)]);};
  const restore=el=>{const [name,value]=remembered.get(el);if(value===null)el.removeAttribute(name);else el.setAttribute(name,value);remembered.delete(el);};
  function read(){
    const buttons=[...list.children].filter(li=>li.matches('li')).map(li=>li.querySelector(':scope > button[aria-controls][id]'));
    if(!buttons.length||buttons.some(b=>!b))return [];
    const mapped=buttons.map(button=>({button,panel:doc.getElementById(button.getAttribute('aria-controls'))}));
    if(mapped.some(({button,panel})=>!panel||!scope.contains(panel)||!panel.matches('.stepper-panel,section[aria-labelledby]')||panel.contains(list)||list.contains(panel)||panel.getAttribute('aria-labelledby')!==button.id)||new Set(mapped.map(p=>p.panel)).size!==mapped.length)return [];
    return mapped;
  }
  function apply(index,focus=false){
    current=index;
    for(const [i,{button,panel}] of pairs.entries()){
      if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
      panel.hidden=i!==index;
    }
    if(focus)pairs[index]?.button.focus({preventScroll:true});
  }
  function go(index,{focus=false}={}){
    if(dead||!Number.isInteger(index)||!pairs[index]||disabled(pairs[index].button))return false;
    if(index===current){if(focus)pairs[index].button.focus({preventScroll:true});return true;}
    const detail={previous:current,index,button:pairs[index].button,panel:pairs[index].panel};
    if(!list.dispatchEvent(new CustomEvent('beforestepchange',{bubbles:true,cancelable:true,detail})))return false;
    apply(index,focus);list.dispatchEvent(new CustomEvent('stepchange',{bubbles:true,detail}));return true;
  }
  function refresh(){
    if(dead)return;
    const next=read(),keep=new Set(next.flatMap(p=>[p.button,p.panel]));
    for(const el of remembered.keys())if(!keep.has(el))restore(el);
    pairs=next;
    for(const {button,panel} of pairs){remember(button,'aria-current');remember(panel,'hidden');}
    let index=pairs.findIndex(p=>!disabled(p.button)&&p.button.getAttribute('aria-current')==='step');
    if(index<0)index=pairs.findIndex(p=>!disabled(p.button));
    if(index>=0)apply(index);
    else{current=-1;for(const {button,panel} of pairs){button.removeAttribute('aria-current');panel.hidden=false;}}
  }
  const click=e=>{const button=e.target.closest?.('button'),index=pairs.findIndex(p=>p.button===button);if(index>=0){e.preventDefault();go(index);}};
  list.addEventListener('click',click);
  const api={refresh,go,next:options=>go(current+1,options),previous:options=>go(current-1,options),get current(){return current;},
    destroy(){if(dead)return;dead=true;list.removeEventListener('click',click);for(const el of remembered.keys())restore(el);pairs=[];instances.delete(list);}};
  instances.set(list,api);refresh();return api;
}
