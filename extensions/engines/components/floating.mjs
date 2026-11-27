// Shared optional floating geometry; no runtime dependency.
const clamp=(x,a,b)=>Math.max(a,Math.min(Math.max(a,b),x));
export function floatingPosition(anchor,popup,viewport,{gap=6,inset=10,rtl=false,align='start',prefer='below'}={}){
  const left=viewport.left+inset,right=viewport.left+viewport.width-inset;
  const top=viewport.top+inset,bottom=viewport.top+viewport.height-inset;
  const below=Math.max(0,bottom-anchor.bottom-gap),above=Math.max(0,anchor.top-gap-top);
  const side=prefer==='above'?(popup.height<=above||above>=below?'above':'below'):(popup.height<=below||below>=above?'below':'above');
  const maxHeight=side==='above'?above:below,width=Math.min(popup.width,Math.max(0,right-left)),height=Math.min(popup.height,maxHeight);
  const x=align==='center'?(anchor.left+anchor.right-width)/2:((align==='start')!==rtl?anchor.left:anchor.right-width);
  return {left:clamp(x,left,right-width),top:clamp(side==='above'?anchor.top-gap-height:anchor.bottom+gap,top,bottom-height),maxHeight,maxWidth:Math.max(0,right-left),side};
}
export function placeFloating(trigger,popup,options={}){
  const win=trigger.ownerDocument.defaultView,vv=win.visualViewport;
  const viewport={left:vv?.offsetLeft||0,top:vv?.offsetTop||0,width:vv?.width||win.innerWidth,height:vv?.height||win.innerHeight};
  const a=trigger.getBoundingClientRect(),inset=options.inset??10;
  const set=(name,value)=>{if(popup.style.getPropertyValue(name)!==value)popup.style.setProperty(name,value);};
  set('--_uibms-floating-max-width',Math.max(0,viewport.width-inset*2)+'px');
  const p=popup.getBoundingClientRect(),height=Math.max(p.height,popup.scrollHeight+popup.offsetHeight-popup.clientHeight);
  const opts={rtl:win.getComputedStyle(trigger).direction==='rtl',...options};
  const f=floatingPosition(a,{width:p.width,height},viewport,opts);
  set('--_uibms-floating-max-height',f.maxHeight+'px');
  const placed=floatingPosition(a,popup.getBoundingClientRect(),viewport,{...opts,prefer:f.side});
  set('--_uibms-floating-left',placed.left+'px');set('--_uibms-floating-top',placed.top+'px');
  return f;
}
export function canAnchor(popup){
  const win=popup.ownerDocument.defaultView;
  return win.CSS?.supports('position-area: block-end span-inline-end')&&
    win.CSS.supports('position-try-fallbacks: flip-block')&&
    win.getComputedStyle(popup).positionArea!=='none';
}
export function trackFloating(trigger,popup,options={}){
  const win=trigger.ownerDocument.defaultView;let pending=0,stopped=false;
  const names=['left','top','max-width','max-height','area','gap'].map(k=>'--_uibms-floating-'+k);
  const original=names.map(k=>[k,popup.style.getPropertyValue(k),popup.style.getPropertyPriority(k)]);
  popup.style.setProperty('--_uibms-floating-area','none');
  popup.style.setProperty('--_uibms-floating-gap','0px');
  const update=()=>{pending=0;if(!stopped&&trigger.isConnected&&popup.isConnected&&popup.matches(':popover-open'))placeFloating(trigger,popup,options);};
  const schedule=()=>{if(!stopped&&!pending)pending=win.requestAnimationFrame(update);};
  win.addEventListener('resize',schedule);win.addEventListener('scroll',schedule,true);
  win.visualViewport?.addEventListener('resize',schedule);win.visualViewport?.addEventListener('scroll',schedule);
  const observer=win.ResizeObserver?new win.ResizeObserver(schedule):null;
  observer?.observe(trigger);observer?.observe(popup);update();
  return ()=>{stopped=true;if(pending)win.cancelAnimationFrame(pending);observer?.disconnect();
    win.removeEventListener('resize',schedule);win.removeEventListener('scroll',schedule,true);
    win.visualViewport?.removeEventListener('resize',schedule);win.visualViewport?.removeEventListener('scroll',schedule);
    for(const [name,value,priority] of original)if(value)popup.style.setProperty(name,value,priority);else popup.style.removeProperty(name);
  };
}
