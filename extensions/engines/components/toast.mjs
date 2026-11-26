// Optional notifications. No global singleton, HTML injection or dependencies.
const instances=new WeakMap();
export const toastTones=Object.freeze(['info','success','warning','danger']);
export function toastDuration(value,tone){
  // Critical messages remain until dismissed. Timed informational feedback
  // is deliberately opt-in and gets at least five seconds.
  return ['warning','danger'].includes(tone)||!Number.isFinite(value)||value<=0?0:Math.min(2147483647,Math.max(5000,value));
}
export function mountToasts(container,{maxVisible=3,labels={}}={}){
  if(instances.has(container))return instances.get(container);
  if(!container?.matches('.toasts'))throw new TypeError('Expected a .toasts container');
  const doc=container.ownerDocument,win=doc.defaultView;
  const limit=Math.max(1,Math.min(20,Number.isFinite(maxVisible)?Math.floor(maxVisible):3));
  const names={info:'Information',success:'Success',warning:'Warning',danger:'Error',dismiss:'Dismiss notification',...labels};
  const queue=[],visible=new Set();
  let serial=0,dead=false,clearing=false;
  const previousTab=container.getAttribute('tabindex'),previousPopover=container.getAttribute('popover');
  const topLayer=typeof container.showPopover==='function'&&typeof container.hidePopover==='function';
  if(topLayer)container.setAttribute('popover','manual');
  if(previousTab===null)container.tabIndex=-1;
  const open=()=>topLayer&&container.matches(':popover-open');
  // A notification is non-modal: it must never escape a dialog's native
  // inertness rules. A stack mounted inside that dialog remains interactive.
  const blockedByModal=()=>topLayer&&[...doc.querySelectorAll('dialog:modal')].some(d=>!d.contains(container));
  function syncLayer(raise=false){
    if(!topLayer)return;
    if(!visible.size){if(open())container.hidePopover();return;}
    if(!container.isConnected)return;
    const focused=container.contains(doc.activeElement)?doc.activeElement:null;
    if(raise&&open())container.hidePopover();
    if(!open())container.showPopover();
    if(focused?.isConnected&&!blockedByModal())focused.focus({preventScroll:true});
  }
  function node(tag,attrs={},text){
    const el=doc.createElement(tag);
    for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);
    if(text!==undefined)el.textContent=text;
    return el;
  }
  // Live regions are present before notifications are inserted. The visible
  // notification has no redundant live role and remains readable on demand.
  const polite=node('div',{class:'visually-hidden',role:'status','aria-live':'polite','aria-atomic':'true'});
  const urgent=node('div',{class:'visually-hidden',role:'alert','aria-live':'assertive','aria-atomic':'true'});
  container.after(polite,urgent);
  const announce=r=>{const region=r.tone==='danger'?urgent:polite;region.textContent=[names[r.tone],r.title,r.message].filter(Boolean).join('. ');};
  const stop=r=>{if(r.timer!==null){win.clearTimeout(r.timer);r.timer=null;r.remaining=Math.max(0,r.remaining-(win.performance.now()-r.started));}};
  function schedule(r){
    stop(r);
    if(!r.duration||r.hover||r.focus||doc.hidden||blockedByModal()||!visible.has(r))return;
    r.started=win.performance.now();r.timer=win.setTimeout(()=>{r.timer=null;dismiss(r);},r.remaining);
  }
  function dismiss(r){
    if(r.done)return false;r.done=true;stop(r);
    const queued=queue.indexOf(r);if(queued>=0)queue.splice(queued,1);
    if(visible.delete(r)){
      const focused=r.el.contains(doc.activeElement);
      r.el.remove();
      if(focused){
        const origin=r.origin;
        if(origin?.isConnected&&typeof origin.focus==='function'&&!origin.matches(':disabled,[aria-disabled=true]')&&!origin.closest('[hidden],[inert]')&&origin.getClientRects().length)origin.focus({preventScroll:true});
        if(doc.activeElement===doc.body){const next=[...visible][0]?.button||container;next.focus({preventScroll:true});}
      }
    }
    if(!clearing)fill();
    return true;
  }
  function fill(){
    if(dead||clearing)return;
    while(visible.size<limit&&queue.length){
      const r=queue.shift();visible.add(r);
      const el=r.el=node('article',{class:'toast','data-tone':r.tone});
      const text=node('div');text.append(node('small',{},names[r.tone]));
      if(r.title)text.append(node('strong',{},r.title));
      if(r.message)text.append(node('p',{},r.message));
      const button=r.button=node('button',{type:'button','aria-label':names.dismiss},'×');
      el.append(text,button);
      button.addEventListener('click',()=>dismiss(r));
      el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){r.hover=true;schedule(r);}});
      el.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'){r.hover=false;schedule(r);}});
      el.addEventListener('focusin',()=>{r.focus=true;schedule(r);});
      el.addEventListener('focusout',e=>{if(!el.contains(e.relatedTarget)){r.focus=false;schedule(r);}});
      container.append(el);syncLayer();announce(r);schedule(r);
    }
    syncLayer();
  }
  function show({title='',message='',tone='info',duration=0}={}){
    if(dead)throw new Error('Notification stack was destroyed');
    if(!toastTones.includes(tone))tone='info';
    title=String(title);message=String(message);
    if(!title.trim()&&!message.trim())throw new TypeError('A notification needs text');
    duration=toastDuration(duration,tone);
    const r={id:++serial,title,message,tone,duration,remaining:duration,timer:null,started:0,hover:false,focus:false,done:false,origin:doc.activeElement};
    queue.push(r);fill();return {id:r.id,dismiss:()=>dismiss(r)};
  }
  function clear(){
    clearing=true;for(const r of [...visible,...queue])dismiss(r);
    syncLayer();polite.textContent=urgent.textContent='';clearing=false;
  }
  const visibility=()=>{for(const r of visible)schedule(r);};
  // Native top-layer order follows opening order, not z-index. Raise the
  // existing stack after a new menu, popover or modal opens. Never react to
  // our own (or another toast stack's) toggle, avoiding a promotion loop.
  const overlayChanged=e=>{
    const el=e.target;
    if(!topLayer||dead||!el?.matches||el.matches('.toasts')||!el.matches('dialog,[popover]'))return;
    if(e.newState==='open'&&el.matches('dialog:modal,[popover]:popover-open')&&visible.size)syncLayer(true);
    if(el.matches('dialog'))visibility();
  };
  doc.addEventListener('visibilitychange',visibility);
  if(topLayer){doc.addEventListener('toggle',overlayChanged,true);doc.addEventListener('close',overlayChanged,true);}
  const api={show,clear,get visibleCount(){return visible.size;},get pendingCount(){return queue.length;},
    destroy(){if(dead)return;dead=true;clear();doc.removeEventListener('visibilitychange',visibility);
      if(topLayer){doc.removeEventListener('toggle',overlayChanged,true);doc.removeEventListener('close',overlayChanged,true);
        if(previousPopover===null)container.removeAttribute('popover');else container.setAttribute('popover',previousPopover);}
      polite.remove();urgent.remove();
      if(previousTab===null)container.removeAttribute('tabindex');else container.setAttribute('tabindex',previousTab);
      instances.delete(container);}};
  instances.set(container,api);return api;
}
