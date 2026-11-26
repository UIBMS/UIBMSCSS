import {trackFloating} from './floating.mjs';
const instances=new WeakMap(),selector='.tooltip[role="tooltip"][popover="manual"]';
export function mountTooltips(root=document,{delay=300,leaveDelay=160}={}){
  if(instances.has(root))return instances.get(root);
  const states=new Map(),doc=root.ownerDocument||root,win=doc.defaultView;let active=null;
  function attach(trigger,tip){
    let pointer=false,tipPointer=false,focused=false,dismissed=false,showTimer=0,hideTimer=0,stop=null;
    const open=()=>tip.matches(':popover-open'),wants=()=>pointer||tipPointer||focused;
    const clear=()=>{win.clearTimeout(showTimer);win.clearTimeout(hideTimer);showTimer=hideTimer=0;};
    function hide(suppress=false){clear();stop?.();stop=null;if(open())tip.hidePopover();tipPointer=false;
      if(active===state)active=null;dismissed=suppress&&(pointer||focused);}
    function show(){showTimer=0;if(dismissed||!trigger.isConnected||!tip.isConnected||!wants())return;
      if(active&&active!==state)active.hide(true);
      if(!open()){try{tip.showPopover({source:trigger});}catch{tip.showPopover();}}
      if(open()){stop?.();stop=trackFloating(trigger,tip,{align:'center',prefer:'above',gap:5,inset:12});active=state;}
    }
    function sync(immediate=false){clear();if(!wants()){dismissed=false;hideTimer=win.setTimeout(()=>hide(),Math.max(0,leaveDelay));}
      else if(!dismissed&&!open()){if(immediate)show();else showTimer=win.setTimeout(show,Math.max(0,delay));}}
    const enter=e=>{if(e.pointerType==='touch')return;if(!pointer&&!focused)dismissed=false;pointer=true;sync();};
    const leave=e=>{if(e.pointerType==='touch')return;pointer=false;sync();};
    const enterTip=e=>{if(e.pointerType==='touch')return;tipPointer=true;sync();};
    const leaveTip=e=>{if(e.pointerType==='touch')return;tipPointer=false;sync();};
    const focus=()=>{if(!focused)dismissed=false;focused=true;sync(true);};
    const blur=()=>{focused=false;sync();};
    const toggle=e=>{if(e.target===tip&&!open()){stop?.();stop=null;tipPointer=false;if(active===state)active=null;}};
    const listeners=[[trigger,'pointerenter',enter],[trigger,'pointerleave',leave],[tip,'pointerenter',enterTip],[tip,'pointerleave',leaveTip],[trigger,'focus',focus],[trigger,'blur',blur],[tip,'toggle',toggle]];
    const state={trigger,tip,hide,destroy(){hide();for(const [el,event,fn] of listeners)el.removeEventListener(event,fn);}};
    for(const [el,event,fn] of listeners)el.addEventListener(event,fn);
    return state;
  }
  const escape=e=>{if(e.key==='Escape'&&active){e.preventDefault();e.stopPropagation();active.hide(true);}};
  root.addEventListener('keydown',escape,true);
  function refresh(){const keep=new Set(),tips=new Set();
    for(const trigger of root.querySelectorAll('[aria-describedby]')){
      const tip=trigger.getAttribute('aria-describedby').split(/\s+/).map(id=>doc.getElementById(id)).find(el=>el?.matches(selector)&&root.contains(el));
      if(!tip||tips.has(tip)||typeof tip.showPopover!=='function')continue;
      keep.add(trigger);tips.add(tip);
      if(states.get(trigger)?.tip!==tip){states.get(trigger)?.destroy();states.set(trigger,attach(trigger,tip));}
    }
    for(const [trigger,state] of states)if(!keep.has(trigger)){state.destroy();states.delete(trigger);}
  }
  const api={refresh,destroy(){root.removeEventListener('keydown',escape,true);for(const state of states.values())state.destroy();states.clear();instances.delete(root);}};
  instances.set(root,api);refresh();return api;
}
