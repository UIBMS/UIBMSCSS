// Optional pointer/keyboard splitter. No layout or data ownership.
const instances=new WeakMap();
const finite=(v,fallback)=>typeof v==='number'&&Number.isFinite(v)?v:fallback;
export function splitBounds(available,minStart=160,minEnd=220){
  available=Math.max(0,finite(available,0));minStart=Math.max(0,finite(minStart,160));minEnd=Math.max(0,finite(minEnd,220));
  if(!available||minStart+minEnd>available){const ratio=minStart+minEnd?minStart/(minStart+minEnd):.5;return [ratio,ratio];}
  return [minStart/available,1-minEnd/available];
}
export function clampSplit(ratio,available,minStart=160,minEnd=220){
  const [a,b]=splitBounds(available,minStart,minEnd);return Math.max(a,Math.min(b,finite(ratio,.42)));
}
export function mountSplitWorkspace(root,{ratio,minStart=160,minEnd=220,keyboardStep=.05}={}){
  if(instances.has(root))return instances.get(root);
  const grid=root?.querySelector(':scope > .split-workspace-grid')??root;
  const start=grid?.firstElementChild,end=grid?.lastElementChild;
  const legacy=grid?.querySelector(':scope > .split-handle[role=separator]');
  const handle=legacy??start?.nextElementSibling;
  const valid=legacy
    ?start?.matches('.split-pane')&&end?.matches('.split-pane')&&start!==end
    :handle?.matches('[role=separator][aria-controls]')&&handle.nextElementSibling===end&&start.id===handle.getAttribute('aria-controls');
  if(!root?.matches('.split-workspace')||!valid)throw new TypeError('Expected two panes with a labelled separator between them');
  const win=root.ownerDocument.defaultView;
  const key='--_uibms-split-ratio',originalStyle=root.style.getPropertyValue(key),priority=root.style.getPropertyPriority(key);
  const originalReady=root.getAttribute('data-uibms-split-ready'),attrs=['tabindex','aria-valuemin','aria-valuemax','aria-valuenow','aria-orientation'];
  const original=attrs.map(k=>[k,handle.getAttribute(k)]);
  const cssRatio=parseFloat(win.getComputedStyle(root).getPropertyValue('--dashboard-split-ratio'));
  let preferred=Math.max(0,Math.min(1,finite(ratio,finite(cssRatio,.42)))),actual=preferred,drag=null,dead=false;
  const step=Math.max(.01,Math.min(.5,finite(keyboardStep,.05)));
  const stacked=()=>win.getComputedStyle(handle).getPropertyValue('--_uibms-split-mode').trim()==='stacked';
  const available=()=>Math.max(0,grid.clientWidth-handle.getBoundingClientRect().width);
  function refresh(){
    if(dead)return;
    if(stacked()){handle.tabIndex=-1;return;}
    const w=available(),[min,max]=splitBounds(w,minStart,minEnd);
    actual=clampSplit(preferred,w,minStart,minEnd);
    const value=String(actual);if(root.style.getPropertyValue(key)!==value)root.style.setProperty(key,value);
    handle.tabIndex=0;handle.setAttribute('aria-orientation','vertical');
    handle.setAttribute('aria-valuemin',String(Math.round(min*100)));handle.setAttribute('aria-valuemax',String(Math.round(max*100)));handle.setAttribute('aria-valuenow',String(Math.round(actual*100)));
  }
  function setRatio(value){
    if(dead||!Number.isFinite(value))return false;
    const before=actual;preferred=stacked()?Math.max(0,Math.min(1,value)):clampSplit(value,available(),minStart,minEnd);
    refresh();if(stacked()||Math.abs(before-actual)<1e-6)return false;
    root.dispatchEvent(new win.CustomEvent('splitresize',{bubbles:true,detail:{ratio:actual}}));return true;
  }
  const rtl=()=>win.getComputedStyle(grid).direction==='rtl';
  const pointerdown=e=>{
    if(stacked()||!e.isPrimary||e.button!==0||drag)return;
    e.preventDefault();handle.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,ratio:actual};
    try{handle.setPointerCapture(e.pointerId);}catch{drag=null;}
  };
  const pointermove=e=>{if(!drag||drag.id!==e.pointerId||stacked())return;const w=available();if(w)setRatio(drag.ratio+(e.clientX-drag.x)*(rtl()?-1:1)/w);};
  const release=e=>{if(drag?.id!==e.pointerId)return;const id=drag.id;drag=null;if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);};
  const keys=e=>{
    if(stacked()||e.altKey||e.metaKey||e.ctrlKey||e.shiftKey)return;
    let value;if(e.key==='Home')value=0;else if(e.key==='End')value=1;
    else if(e.key==='ArrowRight')value=actual+(rtl()?-step:step);else if(e.key==='ArrowLeft')value=actual+(rtl()?step:-step);else return;
    e.preventDefault();setRatio(value);
  };
  const listeners=[['pointerdown',pointerdown],['pointermove',pointermove],['pointerup',release],['pointercancel',release],['lostpointercapture',release],['keydown',keys]];
  root.setAttribute('data-uibms-split-ready','');for(const [event,fn] of listeners)handle.addEventListener(event,fn);
  const observer=win.ResizeObserver?new win.ResizeObserver(refresh):null;observer?.observe(root);if(!observer)win.addEventListener('resize',refresh);
  const api={setRatio,refresh,get ratio(){return actual;},destroy(){
    if(dead)return;dead=true;observer?.disconnect();win.removeEventListener('resize',refresh);
    if(drag){const id=drag.id;drag=null;if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);}
    for(const [event,fn] of listeners)handle.removeEventListener(event,fn);
    for(const [k,v] of original)if(v===null)handle.removeAttribute(k);else handle.setAttribute(k,v);
    if(originalReady===null)root.removeAttribute('data-uibms-split-ready');else root.setAttribute('data-uibms-split-ready',originalReady);
    if(originalStyle)root.style.setProperty(key,originalStyle,priority);else root.style.removeProperty(key);
    instances.delete(root);
  }};
  instances.set(root,api);refresh();return api;
}
