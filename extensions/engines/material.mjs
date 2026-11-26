// UIBMS Material Engine - optional development candidate. MIT.
const engine = (function materialEngine() {
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const selector='article,aside,nav,fieldset,dialog,[popover],details,summary,button,a[href],input:not([type=hidden]),select,textarea,figure,blockquote,pre,progress,meter,.card,.panel,[data-material="liquid-silicone"]';
  const replaced='input,select,textarea,progress,meter,img,video,audio,iframe,canvas,svg,hr,table,thead,tbody,tfoot,tr,td,th,option,optgroup';
  const groups='nav,[role=tablist],[role=radiogroup],[data-uibms-form-options]';
  const activeSelector='button,a[href],summary,input:is([type=button],[type=submit],[type=reset],[type=image],[type=checkbox],[type=radio],[type=range],[type=color],[type=file]),select,[role=button],[role=tab],[role=switch]';
  const SVG='http://www.w3.org/2000/svg';
  const instances=new WeakMap();
  const defaults=Object.freeze({attraction:.85,range:32,pressure:1,stiffness:17,damping:8,amplitude:.18,maximum:24});
  function step(value,velocity,target,dt,stiffness=17,damping=8){
    // Analytic stability is not required; cap and substep integration at 120 Hz.
    let remaining=Math.min(.05,Math.max(0,dt));
    while(remaining>0){const h=Math.min(remaining,1/120);velocity+=(stiffness*stiffness*(target-value)-damping*2*velocity)*h;value+=velocity*h;remaining-=h;}
    if(Math.abs(value-target)<.001&&Math.abs(velocity)<.01)return [target,0];
    return [value,velocity];
  }
  function contour(w,h,r,x,y,force,skew=0,amplitude=.18,maximum=24,padding=36){
    const points=[],radius=clamp(r,0,Math.min(w,h)/2),sigma=clamp(Math.min(w,h)*.68,19,78),amp=clamp(Math.min(w,h)*amplitude,2,maximum);
    const line=(ax,ay,bx,by,nx,ny)=>{let n=Math.max(2,Math.ceil(Math.hypot(bx-ax,by-ay)/7));for(let i=0;i<n;i++){let t=i/n;points.push([ax+(bx-ax)*t,ay+(by-ay)*t,nx,ny]);}};
    const arc=(cx,cy,a,b)=>{for(let i=0;i<12;i++){let t=a+(b-a)*i/12;points.push([cx+radius*Math.cos(t),cy+radius*Math.sin(t),Math.cos(t),Math.sin(t)]);}};
    line(radius,0,w-radius,0,0,-1);arc(w-radius,radius,-Math.PI/2,0);
    line(w,radius,w,h-radius,1,0);arc(w-radius,h-radius,0,Math.PI/2);
    line(w-radius,h,radius,h,0,1);arc(radius,h-radius,Math.PI/2,Math.PI);
    line(0,h-radius,0,radius,-1,0);arc(radius,radius,Math.PI,Math.PI*1.5);
    const q=points.map(([a,b,nx,ny])=>{const d=Math.hypot(a-x,b-y);
      const offset=force>=0?force*(.5+amp*Math.exp(-d*d/(sigma*sigma))):-force*(.5+amp*.45*Math.exp(-Math.pow((d-sigma)/(.6*sigma),2))-amp*1.25*Math.exp(-Math.pow(d/(.65*sigma),2)));
      return [padding+a+nx*offset-skew*(b-h/2)/Math.max(1,h/2),padding+b+ny*offset-force*Math.min(3,h*.07)];});
    const n=q.length,fmt=p=>p.map(v=>v.toFixed(2)).join(' ');let d='M '+fmt([(q[n-1][0]+q[0][0])/2,(q[n-1][1]+q[0][1])/2]);
    for(let i=0;i<n;i++){let a=q[i],b=q[(i+1)%n];d+=' Q '+fmt(a)+' '+fmt([(a[0]+b[0])/2,(a[1]+b[1])/2]);}
    return d+' Z';
  }
  const enabled=el=>el.closest('[data-material]')?.getAttribute('data-material')==='liquid-silicone';
  const disabled=el=>el.matches(':disabled,[readonly]')||!!el.closest('[inert],[aria-disabled=true]');
  const interactive=el=>!disabled(el)&&el.matches(activeSelector);
  const visible=el=>el.isConnected&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
  const muted=(el,channel)=>el.closest('[data-effects]')?.getAttribute('data-effects')==='none'||el.closest('[data-'+channel+']')?.getAttribute('data-'+channel)?.split(/\s+/).includes('none');
  function decoration(kind){
    const layer=document.createElement('span');layer.setAttribute('data-uibms-'+kind,'');layer.setAttribute('aria-hidden','true');
    const fill=document.createElement('span');fill.setAttribute('data-uibms-material-fill','');
    const svg=document.createElementNS(SVG,'svg');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS(SVG,'path');path.setAttribute('fill','none');svg.append(path);layer.append(fill,svg);
    return {layer,fill,svg,path};
  }
  function positionHost(el){
    if(getComputedStyle(el).position==='static')el.setAttribute('data-uibms-material-position','');
  }
  function createSurface(el){
    const native=el.matches(replaced),s={el,native,f:0,v:0,target:0,x:0,y:0,tx:0,ty:0,w:0,h:0,rect:null};
    if(native){el.setAttribute('data-uibms-material-native','');return s;}
    if(el.matches('html,body,template,script,style,link,meta,head,slot,br,wbr'))return null;
    positionHost(el);el.setAttribute('data-uibms-material-host','');
    Object.assign(s,decoration('material-layer'));el.prepend(s.layer);return s;
  }
  function removeSurface(s){
    s.layer?.remove();
    for(const k of ['data-uibms-material-host','data-uibms-material-native','data-uibms-material-position'])s.el.removeAttribute(k);
    for(const k of ['--_uibms-material-force','--_uibms-material-x','--_uibms-material-y','--_uibms-material-radius','--_uibms-thumb-scale'])s.el.style.removeProperty(k);
  }
  function radius(el,w,h){
    const cs=getComputedStyle(el),parts=cs.borderTopLeftRadius.split(/\s+/);
    const a=parts[0].endsWith('%')?parseFloat(parts[0])*Math.min(w,h)/100:parseFloat(parts[0]);
    return clamp(Number.isFinite(a)?a:12,0,Math.min(w,h)/2);
  }
  function measure(s){
    const rect=s.el.getBoundingClientRect();
    const w=s.el.offsetWidth||rect.width,h=s.el.offsetHeight||rect.height;
    if(w!==s.w||h!==s.h){s.w=w;s.h=h;if(!s.rect){s.x=s.tx=w/2;s.y=s.ty=h/2;}s.r=radius(s.el,w,h);}
    s.rect=rect;return rect;
  }
  function setPoint(s,x,y){
    const r=measure(s);s.tx=clamp((x-r.left)*s.w/Math.max(1,r.width),-12,s.w+12);s.ty=clamp((y-r.top)*s.h/Math.max(1,r.height),-12,s.h+12);
  }
  function paint(s,config){
    if(!s.w||!s.h)return;
    const el=s.el;
    if(s.native){
      el.style.setProperty('--_uibms-material-force',String(s.f));
      el.style.setProperty('--_uibms-material-x',clamp(s.x/s.w*100,0,100)+'%');
      el.style.setProperty('--_uibms-material-y',clamp(s.y/s.h*100,0,100)+'%');
      const r=s.r??radius(el,s.w,s.h),variation=s.f*clamp(Math.min(s.w,s.h)*.13,2,12);
      const corner=(x,y)=>Math.max(0,r+variation*Math.exp(-Math.hypot(x-s.x,y-s.y)/42)).toFixed(2)+'px';
      el.style.setProperty('--_uibms-material-radius',[corner(0,0),corner(s.w,0),corner(s.w,s.h),corner(0,s.h)].join(' '));
      el.style.setProperty('--_uibms-thumb-scale',String(clamp(1+s.f*.18,.76,1.2)));
      return;
    }
    const d=contour(s.w,s.h,s.r,s.x,s.y,s.f,0,config.amplitude,config.maximum);
    s.fill.style.clipPath='path("'+d+'")';s.path.setAttribute('d',d);
    s.svg.setAttribute('viewBox','0 0 '+(s.w+72)+' '+(s.h+72));
    s.layer.style.setProperty('--_uibms-material-force',String(s.f));
    s.fill.style.setProperty('--_uibms-material-x',clamp((s.x+36)/(s.w+72)*100,0,100)+'%');
    s.fill.style.setProperty('--_uibms-material-y',clamp((s.y+36)/(s.h+72)*100,0,100)+'%');
  }
  function selected(group){
    return [...group.querySelectorAll('[aria-current]:not([aria-current=false]),[aria-selected=true],[aria-pressed=true]')].find(el=>el.closest(groups)===group&&visible(el));
  }
  function selection(group,config=defaults){
    const s={group,...decoration('selection-layer'),edge:null,velocity:[0,0,0,0],skew:0,f:0,v:0,target:null};
    positionHost(group);group.setAttribute('data-uibms-selection-host','');group.prepend(s.layer);
    s.layer.hidden=true;
    const set=(el,immediate=false)=>{
      if(!el||!group.contains(el)||!visible(el)){s.target=null;s.layer.hidden=true;return;}
      s.target=el;s.layer.hidden=false;if(immediate)s.edge=null;
    };
    const targetRect=()=>{
      const a=s.target.getBoundingClientRect(),b=group.getBoundingClientRect(),sx=(group.offsetWidth||b.width)/Math.max(1,b.width),sy=(group.offsetHeight||b.height)/Math.max(1,b.height);
      const l=(a.left-b.left)*sx+group.scrollLeft-group.clientLeft+2,t=(a.top-b.top)*sy+group.scrollTop-group.clientTop+2;
      return [l,t,l+Math.max(4,a.width*sx-4),t+Math.max(4,a.height*sy-4)];
    };
    const tick=(dt,instant=false,press=null,point=null)=>{
      if(!s.target||!visible(s.target)){s.layer.hidden=true;return false;}
      let dest=targetRect();if(!s.edge||instant){s.edge=dest.slice();s.velocity.fill(0);s.skew=0;}
      let moving=false,dx=(dest[0]+dest[2]-s.edge[0]-s.edge[2])/2,dy=(dest[1]+dest[3]-s.edge[1]-s.edge[3])/2;
      for(let i=0;i<4;i++){
        let leading=i===0?dx<0:i===2?dx>=0:i===1?dy<0:dy>=0;
        if(!instant)[s.edge[i],s.velocity[i]]=step(s.edge[i],s.velocity[i],dest[i],dt,leading?19:13,leading?12:9);
        if(s.edge[i]!==dest[i]||s.velocity[i]!==0)moving=true;
      }
      const targetSkew=instant?0:clamp((s.velocity[0]+s.velocity[2])*.018,-14,14);
      s.skew=instant?0:s.skew+(targetSkew-s.skew)*Math.min(1,dt*19);
      if(Math.abs(s.skew)<.02&&targetSkew===0)s.skew=0;else if(s.skew!==0)moving=true;
      const l=s.edge[0],t=s.edge[1],w=Math.max(4,s.edge[2]-l),h=Math.max(4,s.edge[3]-t);
      let f=press===s.target&&!muted(s.target,'active')?-1:point&&point.el===s.target&&!muted(s.target,'hover')?.62:0;
      if(instant){s.f=s.v=0;}else{[s.f,s.v]=step(s.f,s.v,f,dt,config.stiffness,config.damping);if(s.f!==f||s.v!==0)moving=true;}
      const rect=s.target.getBoundingClientRect(),x=point?clamp(point.x-rect.left,0,w):w/2,y=point?clamp(point.y-rect.top,0,h):h/2;
      const d=contour(w,h,Math.min(18,h/2),x,y,clamp(s.f,-1.1,1.1),s.skew,config.amplitude,config.maximum);
      Object.assign(s.layer.style,{left:(l-36)+'px',top:(t-36)+'px',width:(w+72)+'px',height:(h+72)+'px'});
      s.fill.style.clipPath='path("'+d+'")';s.path.setAttribute('d',d);s.svg.setAttribute('viewBox','0 0 '+(w+72)+' '+(h+72));
      return moving;
    };
    return {set,tick,destroy(){s.layer.remove();group.removeAttribute('data-uibms-selection-host');if(!group.hasAttribute('data-uibms-material-host'))group.removeAttribute('data-uibms-material-position');},get target(){return s.target;}};
  }
  function mountMaterial(root=document,options={}){
    if(instances.has(root))return instances.get(root);
    const config={...defaults,...options},surfaces=new Map(),selections=new Map(),dirty=new Set(),animating=new Set();
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active), (prefers-contrast: more), (prefers-reduced-transparency: reduce)');
    let frame=0,last=0,hover=null,pressed=null,pointer=null,point=null,disposed=false,refreshPending=false;
    const cancel=()=>{pressed=null;pointer=null;point=null;targetHover(null);request();};
    function request(){if(!frame&&!disposed)frame=requestAnimationFrame(tick);}
    function queueRefresh(){if(refreshPending||disposed)return;refreshPending=true;queueMicrotask(()=>{refreshPending=false;if(!disposed)refresh();});}
    const ro=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{for(const e of entries){let s=surfaces.get(e.target);if(s)dirty.add(s);}request();}):null;
    function wanted(el){
      if(!enabled(el)||el.closest('[data-uibms-material-layer],[data-uibms-selection-layer]'))return false;
      if(el.matches('html,body,script,style,template,link,meta,head,br,wbr,option,optgroup,slot'))return false;
      if(el.matches('a[href],button,[role=tab]')&&el.closest(groups)&&el.closest(groups)!==el&&!el.matches('[data-material]'))return false;
      return true;
    }
    function refresh(){
      for(const [el,s] of surfaces){if(!el.isConnected||!wanted(el)){ro?.unobserve(el);removeSurface(s);surfaces.delete(el);animating.delete(s);dirty.delete(s);if(hover===s)hover=null;if(pressed===s)pressed=null;}}
      const candidates=[...(root.nodeType===1&&root.matches(selector)?[root]:[]),...root.querySelectorAll(selector)];
      for(const el of candidates)if(wanted(el)&&!surfaces.has(el)){let s=createSurface(el);if(s){surfaces.set(el,s);ro?.observe(el);dirty.add(s);}}
      for(const [el,s] of selections){if(!el.isConnected||!enabled(el)){s.destroy();selections.delete(el);}}
      for(const el of root.querySelectorAll(groups))if(enabled(el)){
        let a=selected(el),s=selections.get(el);
        if(!s&&a){s=selection(el,config);selections.set(el,s);}
        if(s)s.set(a);
      }
      request();
    }
    function targetHover(s){if(hover&&hover!==s){hover.target=0;animating.add(hover);}hover=s;if(s)animating.add(s);}
    function locate(e){
      if(!e.isPrimary)return;
      const target=e.target instanceof Element?e.target:null,canHover=e.pointerType!=='touch';
      point=canHover?{x:e.clientX,y:e.clientY,el:target?.closest('a[href],button,[role=tab],[aria-pressed]')}:null;
      if(pressed){setPoint(pressed,e.clientX,e.clientY);animating.add(pressed);}
      let best=null,bestDistance=config.range;
      if(canHover&&target&&root.contains(target)){
        for(let el=target;el;el=el.parentElement){if(surfaces.has(el)){best=surfaces.get(el);bestDistance=0;break;}}
        if(!best){for(const s of surfaces.values()){
          if(!visible(s.el))continue;const r=s.el.getBoundingClientRect();
          let d=Math.hypot(Math.max(r.left-e.clientX,0,e.clientX-r.right),Math.max(r.top-e.clientY,0,e.clientY-r.bottom));
          if(d<bestDistance){best=s;bestDistance=d;}
        }}
      }
      targetHover(best);
      if(best){best.target=disabled(best.el)||muted(best.el,'hover')?0:config.attraction*clamp(1-bestDistance/config.range,0,1);setPoint(best,e.clientX,e.clientY);}
      request();
    }
    function down(e){
      if(!e.isPrimary||e.button!==0)return;pointer=e.pointerId;
      const el=e.target instanceof Element?e.target.closest(activeSelector):null;
      const s=surfaces.get(el);
      if(s&&interactive(el)&&!muted(el,'active')){pressed=s;setPoint(s,e.clientX,e.clientY);animating.add(s);}
      locate(e);
    }
    function up(e){if(pointer!==e.pointerId)return;if(pressed)animating.add(pressed);pressed=null;pointer=null;locate(e);}
    function keydown(e){if(![' ','Enter'].includes(e.key))return;const s=surfaces.get(e.target);if(s&&interactive(s.el)&&!muted(s.el,'active')){pressed=s;measure(s);s.tx=s.w/2;s.ty=s.h/2;animating.add(s);request();}}
    function keyup(){if(pressed){animating.add(pressed);pressed=null;request();}}
    function tick(now){
      frame=0;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
      for(const s of dirty){if(visible(s.el)){measure(s);paint(s,config);}}dirty.clear();
      const instant=reduced.matches||forced.matches;
      for(const s of [...animating]){
        if(!s.el.isConnected||!visible(s.el)){animating.delete(s);continue;}
        measure(s);
        const desired=instant?0:pressed===s&&interactive(s.el)?-config.pressure:hover===s?s.target:0;
        if(instant){s.f=s.v=0;s.x=s.tx;s.y=s.ty;}
        else{[s.f,s.v]=step(s.f,s.v,desired,dt,config.stiffness,config.damping);s.f=clamp(s.f,-1.2,1.2);s.x+=(s.tx-s.x)*Math.min(1,dt*22);s.y+=(s.ty-s.y)*Math.min(1,dt*22);}
        paint(s,config);
        if(s.f===desired&&s.v===0&&Math.abs(s.x-s.tx)<.1&&Math.abs(s.y-s.ty)<.1)animating.delete(s);
      }
      let moving=false;
      for(const [el,s] of selections){
        let current=selected(el);if(current!==s.target)s.set(current);
        moving=s.tick(dt,instant||muted(el,'hover'),pressed?.el||((pointer!==null)?point?.el:null),point)||moving;
      }
      if(animating.size||moving)request();else last=0;
    }
    const eventRoot=root.nodeType===9?root:root;
    const listeners=[[eventRoot,'pointerdown',down],[eventRoot,'keydown',keydown],[eventRoot,'keyup',keyup],[eventRoot,'focusout',keyup],[window,'pointermove',locate],[window,'pointerup',up],[window,'pointercancel',cancel],[window,'blur',cancel],[window,'resize',()=>{for(const s of surfaces.values())dirty.add(s);request();}],[window,'scroll',request,true]];
    listeners.forEach(([o,k,f,c])=>o.addEventListener(k,f,c||false));
    const observer=new MutationObserver(records=>{
      if(records.some(r=>r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.matches('[data-uibms-material-layer],[data-uibms-selection-layer]'))))queueRefresh();
    });
    observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['data-material','data-effects','data-hover','data-active','aria-current','aria-pressed','aria-selected','disabled','aria-disabled','hidden','open','inert']});
    const preference=()=>{for(const s of surfaces.values())animating.add(s);request();};
    reduced.addEventListener?.('change',preference);forced.addEventListener?.('change',preference);
    const api={refresh,destroy(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();ro?.disconnect();listeners.forEach(([o,k,f,c])=>o.removeEventListener(k,f,c||false));reduced.removeEventListener?.('change',preference);forced.removeEventListener?.('change',preference);for(const s of selections.values())s.destroy();for(const s of surfaces.values())removeSurface(s);instances.delete(root);}};
    instances.set(root,api);refresh();return api;
  }
  return {mountMaterial,contour,step,defaults};
})();
export const {mountMaterial,contour,step,defaults}=engine;
