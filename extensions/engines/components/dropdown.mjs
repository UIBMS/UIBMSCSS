import {canAnchor,trackFloating} from './floating.mjs';
const instances=new WeakMap(),selector='.dropdown[role="menu"][popover]',itemSelector=':is(button,a[href])[role="menuitem"]';
const unavailable=el=>el.disabled||el.matches('[aria-disabled="true"],[hidden]')||!!el.closest('[hidden],[inert]');
export function menuDestination(index,count,key){
  if(!count)return -1;if(key==='Home')return 0;if(key==='End')return count-1;
  if(key==='ArrowDown')return (index+1+count)%count;
  if(key==='ArrowUp')return index<0?count-1:(index-1+count)%count;
  return -1;
}
export function mountDropdowns(root=document){
  if(instances.has(root))return instances.get(root);
  const doc=root.ownerDocument||root,states=new Map();
  const remember=(el,name)=>[el,name,el.getAttribute(name)];
  const restore=([el,name,value])=>value===null?el.removeAttribute(name):el.setAttribute(name,value);
  function attach(menu,trigger){
    const original=remember(trigger,'aria-expanded'),saved=new Map();
    let stop=null,last=false,prefix='',lastKey=0,implicitAnchor=true;
    const all=()=>[...menu.querySelectorAll(itemSelector)].filter(e=>e.closest(selector)===menu);
    const items=()=>all().filter(e=>!unavailable(e));
    const syncItems=()=>{const current=new Set(all());for(const [el,value] of saved)if(!current.has(el)){restore(value);saved.delete(el);}for(const el of current){if(!saved.has(el))saved.set(el,remember(el,'tabindex'));el.tabIndex=-1;}};
    const open=()=>menu.matches(':popover-open');
    const focusItem=(end=false)=>{const enabled=items();(enabled[end?enabled.length-1:0]||menu).focus();};
    const close=(returnFocus=false)=>{if(open())menu.hidePopover();if(returnFocus&&trigger.isConnected&&!unavailable(trigger))trigger.focus({preventScroll:true});};
    const before=e=>{if(e.target!==menu)return;trigger.setAttribute('aria-expanded',String(e.newState==='open'));menu.toggleAttribute('data-uibms-menu-positioning',e.newState==='open');};
    const toggle=e=>{if(e.target!==menu)return;stop?.();stop=null;trigger.setAttribute('aria-expanded',String(open()));
      if(open()){syncItems();if(!implicitAnchor||!canAnchor(menu))stop=trackFloating(trigger,menu,{gap:8,inset:14});menu.removeAttribute('data-uibms-menu-positioning');focusItem(last);}
      else {implicitAnchor=true;menu.removeAttribute('data-uibms-menu-positioning');}
      last=false;prefix='';
    };
    const triggerKeys=e=>{if(!['ArrowDown','ArrowUp'].includes(e.key)||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||unavailable(trigger))return;
      e.preventDefault();last=e.key==='ArrowUp';if(open())focusItem(last);else{implicitAnchor=false;try{menu.showPopover({get source(){implicitAnchor=true;return trigger;}});}catch{implicitAnchor=false;menu.showPopover();}}};
    const keys=e=>{if(!open()||e.altKey||e.ctrlKey||e.metaKey)return;
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return;}
      if(e.key==='Tab'){close(true);return;}
      const enabled=items(),index=enabled.indexOf(doc.activeElement),next=menuDestination(index,enabled.length,e.key);
      if(next>=0){e.preventDefault();enabled[next].focus();return;}
      if(e.key.length===1&&e.key!==' '&&!e.shiftKey){
        const now=performance.now();prefix=(now-lastKey>650?'':prefix)+e.key.toLocaleLowerCase();lastKey=now;
        const ordered=[...enabled.slice(index+1),...enabled.slice(0,index+1)];
        const search=()=>ordered.find(el=>(el.getAttribute('aria-label')||el.textContent).trim().toLocaleLowerCase().startsWith(prefix));
        let match=search();if(!match&&prefix.length>1){prefix=e.key.toLocaleLowerCase();match=search();}
        if(match){e.preventDefault();match.focus();}
      }
    };
    const click=e=>{const item=e.target.closest?.(itemSelector);if(!item||item.closest(selector)!==menu)return;
      if(unavailable(item)){e.preventDefault();return;}
      const previous=doc.activeElement;
      queueMicrotask(()=>{if(open())close(previous===doc.activeElement&&menu.contains(previous)&&item.matches('button'));});
    };
    const focusout=e=>{if(open()&&e.relatedTarget&&!menu.contains(e.relatedTarget)&&e.relatedTarget!==trigger)close(false);};
    const listeners=[[menu,'beforetoggle',before],[menu,'toggle',toggle],[trigger,'keydown',triggerKeys],[menu,'keydown',keys],[menu,'click',click],[menu,'focusout',focusout]];
    syncItems();trigger.setAttribute('aria-expanded',String(open()));for(const [el,event,fn] of listeners)el.addEventListener(event,fn);
    if(open()&&!canAnchor(menu))stop=trackFloating(trigger,menu,{gap:8,inset:14});
    return {trigger,syncItems,destroy(){stop?.();menu.removeAttribute('data-uibms-menu-positioning');for(const [el,event,fn] of listeners)el.removeEventListener(event,fn);if(open())menu.hidePopover();for(const value of saved.values())restore(value);restore(original);}};
  }
  function refresh(){
    const keep=new Set(),triggers=[...root.querySelectorAll('button[popovertarget][aria-haspopup="menu"]')];
    for(const menu of root.querySelectorAll(selector)){
      if(!menu.id||typeof menu.showPopover!=='function'||menu.getAttribute('popover')!=='auto'&&menu.getAttribute('popover')!=='')continue;
      const found=triggers.filter(el=>el.getAttribute('popovertarget')===menu.id);if(found.length!==1)continue;
      const trigger=found[0];keep.add(menu);
      if(states.get(menu)?.trigger!==trigger){states.get(menu)?.destroy();states.set(menu,attach(menu,trigger));}else states.get(menu).syncItems();
    }
    for(const [menu,state] of states)if(!keep.has(menu)){state.destroy();states.delete(menu);}
  }
  // Native light dismissal is primary. A click outside also closes a managed
  // auto popover if the browser has not already dismissed it.
  const outside=e=>{const path=e.composedPath();for(const [menu,state] of states)if(menu.matches(':popover-open')&&!path.includes(menu)&&!path.includes(state.trigger))menu.hidePopover();};
  doc.addEventListener('click',outside,true);
  const api={refresh,destroy(){doc.removeEventListener('click',outside,true);for(const state of states.values())state.destroy();states.clear();instances.delete(root);}};
  instances.set(root,api);refresh();return api;
}
