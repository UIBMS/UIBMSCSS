// UIBMS Material Engine - optional development candidate. MIT.
const engine = (function materialEngine() {
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const selector='div,section,header,footer,main,article,aside,nav,form,fieldset,dialog,[popover],details,summary,button,a[href],input:not([type=hidden]),select,textarea,figure,blockquote,pre,progress,meter,table,hr,.card,.panel,[data-material="liquid-silicone"]';
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
    const radius=clamp(r,0,Math.min(w,h)/2);
    if(force===0&&skew===0){
      const l=padding,t=padding,R=l+w,B=t+h,q=radius;
      if(!q)return 'M '+l+' '+t+' H '+R+' V '+B+' H '+l+' Z';
      return 'M '+(l+q)+' '+t+' H '+(R-q)+' A '+q+' '+q+' 0 0 1 '+R+' '+(t+q)+' V '+(B-q)+' A '+q+' '+q+' 0 0 1 '+(R-q)+' '+B+' H '+(l+q)+' A '+q+' '+q+' 0 0 1 '+l+' '+(B-q)+' V '+(t+q)+' A '+q+' '+q+' 0 0 1 '+(l+q)+' '+t+' Z';
    }
    const points=[],sigma=clamp(Math.min(w,h)*.68,19,78),amp=clamp(Math.min(w,h)*amplitude,2,maximum);
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
  const enabled=el=>el.closest('[data-material="default"],[data-material="liquid-silicone"]')?.getAttribute('data-material')==='liquid-silicone';
  const legacyMaterial=el=>(el.getAttribute('data-effect')||'').split(/\s+/).some(v=>['glass','frosted','metallic','matte'].includes(v));
  const profileKeys=['theme','palette','shape','border','density','typography','effects','material'];
  const paintFlags=['data-uibms-material-host','data-uibms-material-native','data-uibms-material-shadow','data-uibms-material-radius'];
  const sides=['Top','Right','Bottom','Left'];
  const corners=['TopLeft','TopRight','BottomRight','BottomLeft'];
  function visibleColor(c){
    return !!c&&c!=='transparent'&&!/\/\s*0(?:\.0+)?%?\s*\)$/.test(c)&&!/^rgba\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(c);
  }
  function shadowFilter(value){
    if(!value||value==='none')return '';
    const color=value.match(/(?:rgba?|hsla?|color|oklch|oklab|lab|lch)\([^)]*\)/)?.[0];
    if(!color||/\binset\b/.test(value))return null;
    const lengths=value.replace(color,'').trim().split(/\s+/).map(v=>/^-?\d*\.?\d+px$/.test(v)?parseFloat(v):NaN);
    if(lengths.length<2||lengths.length>4||lengths.some(v=>!Number.isFinite(v))||(lengths[3]||0)!==0)return null;
    return 'drop-shadow('+lengths[0]+'px '+lengths[1]+'px '+((lengths[2]||0)/2)+'px '+color+')';
  }
  function motionProfile(profile,time){
    if(profile==='none')return {hover:0,press:0,speed:1,instant:true};
    const n=parseFloat(time),ms=String(time).trim().endsWith('ms')?n:n*1000;
    return {hover:profile==='minimal'?0:1,press:profile==='minimal'?.35:1,speed:Number.isFinite(ms)&&ms>0?clamp(180/ms,.45,2.5):1,instant:false};
  }
  function motion(el){
    const profile=el.closest('[data-effects="default"],[data-effects="none"],[data-effects="minimal"],[data-effects="fluid"],[data-effects="dynamic"]')?.getAttribute('data-effects')||'default';
    const cs=getComputedStyle(el);
    return motionProfile(profile,cs.getPropertyValue('--signature-time').trim()||cs.getPropertyValue('--motion-duration').trim()||'180ms');
  }
  // Read the consuming stylesheet's resolved appearance without the renderer's paint.
  function design(el){
    const restore=paintFlags.filter(k=>el.hasAttribute(k));
    for(const k of restore)el.removeAttribute(k);
    const cs=getComputedStyle(el);
    const borders=sides.map(k=>({width:parseFloat(cs['border'+k+'Width'])||0,color:cs['border'+k+'Color'],style:cs['border'+k+'Style']}));
    const radii=corners.map(k=>cs['border'+k+'Radius']);
    const background=cs.backgroundColor,image=cs.backgroundImage,shadow=cs.boxShadow;
    const sameBorder=borders.every(b=>b.width===borders[0].width&&b.color===borders[0].color&&b.style===borders[0].style);
    const uniformRadius=radii.every(r=>r===radii[0])&&!radii[0].includes(' ');
    const surface=visibleColor(background)||image!=='none'||shadow!=='none'||borders.some(b=>b.width>0&&b.style!=='none'&&b.style!=='hidden'&&visibleColor(b.color));
    const complex=!CSS.supports('clip-path','path("M 0 0 H 1 V 1 Z")')||el.matches(replaced)||el.matches('pre,details,summary,dialog,[popover]')||['inline','contents','none','list-item'].includes(cs.display)||['sticky','fixed'].includes(cs.position)||cs.overflowX!=='visible'||cs.overflowY!=='visible'||!sameBorder||!uniformRadius||image!=='none'||!['solid','none','hidden','dashed','dotted'].includes(borders[0].style);
    const result={background,image,shadow,filter:shadowFilter(shadow),border:borders[0],radii,uniformRadius,surface,complex};
    for(const k of restore)el.setAttribute(k,'');
    return result;
  }
  const disabled=el=>el.matches(':disabled,[readonly]')||!!el.closest('[inert],[aria-disabled=true]');
  const interactive=el=>!disabled(el)&&el.matches(activeSelector);
  const visible=el=>el.isConnected&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
  const muted=(el,channel)=>el.closest('[data-effects="default"],[data-effects="none"],[data-effects="minimal"],[data-effects="fluid"],[data-effects="dynamic"]')?.getAttribute('data-effects')==='none'||el.getAttribute('data-'+channel)?.split(/\s+/).includes('none');
  function decoration(kind){
    const layer=document.createElement('span');layer.setAttribute('data-uibms-'+kind,'');layer.setAttribute('aria-hidden','true');
    const fill=document.createElement('span');fill.setAttribute('data-uibms-material-fill','');
    const svg=document.createElementNS(SVG,'svg');svg.setAttribute('aria-hidden','true');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('focusable','false');
    const path=document.createElementNS(SVG,'path');path.setAttribute('fill','none');svg.append(path);layer.append(fill,svg);
    return {layer,fill,svg,path};
  }
  function positionHost(el){
    if(getComputedStyle(el).position==='static')el.setAttribute('data-uibms-material-position','');
  }
  function createSurface(el,d){
    const native=d.complex||!d.surface;
    const s={el,native,f:0,v:0,target:0,x:0,y:0,tx:0,ty:0,w:0,h:0,rect:null,design:d,motion:motion(el)};
    if(native){el.setAttribute('data-uibms-material-native','');return s;}
    positionHost(el);Object.assign(s,decoration('material-layer'));el.append(s.layer);return s;
  }
  function removeSurface(s){
    s.layer?.remove();
    for(const k of [...paintFlags,'data-uibms-material-surface'])s.el.removeAttribute(k);
    if(!s.el.hasAttribute('data-uibms-selection-host'))s.el.removeAttribute('data-uibms-material-position');
    for(const k of ['--_uibms-material-force','--_uibms-material-x','--_uibms-material-y','--_uibms-material-radius','--_uibms-thumb-scale','--_uibms-range-progress','--_uibms-material-base-image','--_uibms-material-base-color'])s.el.style.removeProperty(k);
  }
  function radius(el,w,h,value){
    const raw=value||getComputedStyle(el).borderTopLeftRadius,parts=raw.split(/\s+/);
    const a=parts[0].endsWith('%')?parseFloat(parts[0])*Math.min(w,h)/100:parseFloat(parts[0]);
    return clamp(Number.isFinite(a)?a:0,0,Math.min(w,h)/2);
  }
  function measure(s){
    const rect=s.el.getBoundingClientRect();
    const cs=getComputedStyle(s.el),px=k=>parseFloat(cs[k])||0,bw=parseFloat(cs.width),bh=parseFloat(cs.height);
    const extraW=cs.boxSizing==='border-box'?0:px('paddingLeft')+px('paddingRight')+px('borderLeftWidth')+px('borderRightWidth');
    const extraH=cs.boxSizing==='border-box'?0:px('paddingTop')+px('paddingBottom')+px('borderTopWidth')+px('borderBottomWidth');
    const w=Number.isFinite(bw)&&bw>0?bw+extraW:s.el.offsetWidth||rect.width;
    const h=Number.isFinite(bh)&&bh>0?bh+extraH:s.el.offsetHeight||rect.height;
    if(!s.rect){s.x=s.tx=w/2;s.y=s.ty=h/2;}
    s.w=w;s.h=h;s.r=radius(s.el,w,h,s.design.radii[0]);s.rect=rect;return rect;
  }
  function setPoint(s,x,y){
    const r=measure(s);s.tx=clamp((x-r.left)*s.w/Math.max(1,r.width),-12,s.w+12);s.ty=clamp((y-r.top)*s.h/Math.max(1,r.height),-12,s.h+12);
  }

  // Optional real pixel refraction over a developer-supplied, CORS-readable image.
  // The browser's live DOM is not sampled. A shared cached image is the source.
  function imagePixels(backdrop){
    const r=backdrop.el.getBoundingClientRect();
    const w=backdrop.el.clientWidth,h=backdrop.el.clientHeight;
    if(!w||!h||!backdrop.image)return null;
    const ratio=Math.min(1,1000/Math.max(w,h)),cw=Math.max(2,Math.round(w*ratio)),ch=Math.max(2,Math.round(h*ratio));
    if(!backdrop.pixels||backdrop.w!==cw||backdrop.h!==ch){
      const c=backdrop.canvas;c.width=cw;c.height=ch;const ctx=c.getContext('2d',{willReadFrequently:true});
      const z=Math.max(cw/backdrop.image.naturalWidth,ch/backdrop.image.naturalHeight);
      try{ctx.drawImage(backdrop.image,(cw-backdrop.image.naturalWidth*z)/2,(ch-backdrop.image.naturalHeight*z)/2,backdrop.image.naturalWidth*z,backdrop.image.naturalHeight*z);
        backdrop.pixels=ctx.getImageData(0,0,cw,ch).data;backdrop.w=cw;backdrop.h=ch;backdrop.rev++;
      }catch{backdrop.failed=true;return null;}
    }
    return {pixels:backdrop.pixels,w:cw,h:ch,rect:r,rev:backdrop.rev};
  }
  function paintOptics(s,backdrop,rect,host){
    if(!backdrop||backdrop.failed||!s.fill){if(s.optical){s.optical.remove();s.optical=null;s.fill?.removeAttribute('data-uibms-optical');}return;}
    const source=imagePixels(backdrop);if(!source)return;
    const cs=getComputedStyle(host),a=cs.getPropertyValue('--uibms-material-opacity').trim();
    const alpha=clamp((parseFloat(a)||0)/(a.endsWith('%')?100:1),0,.95);
    const tint=getComputedStyle(s.fill).color;
    const key=[source.rev,rect.left-source.rect.left,rect.top-source.rect.top,s.w,s.h,s.f,s.x,s.y,s.skew,alpha,tint].map(x=>typeof x==='number'?Math.round(x*50):x).join('|');
    if(s.opticalKey===key&&s.optical)return;s.opticalKey=key;
    if(!s.optical){s.optical=document.createElement('canvas');s.optical.setAttribute('data-uibms-optical-canvas','');s.fill.append(s.optical);s.fill.setAttribute('data-uibms-optical','');}
    const w=s.w+72,h=s.h+72,ratio=Math.min(.72,Math.sqrt(120000/(w*h))),nw=Math.max(2,Math.ceil(w*ratio)),nh=Math.max(2,Math.ceil(h*ratio));
    const c=s.optical;if(c.width!==nw||c.height!==nh){c.width=nw;c.height=nh;}
    const ctx=c.getContext('2d'),im=ctx.createImageData(nw,nh),out=im.data;
    const colorCanvas=backdrop.colorCanvas||(backdrop.colorCanvas=document.createElement('canvas'));colorCanvas.width=colorCanvas.height=1;
    const colorCtx=colorCanvas.getContext('2d');colorCtx.fillStyle=tint;colorCtx.fillRect(0,0,1,1);const color=colorCtx.getImageData(0,0,1,1).data;
    const sig=clamp(Math.min(s.w,s.h)*.68,19,78),rad=clamp(s.r||0,0,Math.min(s.w,s.h)/2),rim=clamp(Math.min(s.w,s.h)*.16,4,19),f=s.f||0,skew=s.skew||0;
    const sxScale=source.w/Math.max(1,source.rect.width),syScale=source.h/Math.max(1,source.rect.height),raw=source.pixels,sw=source.w,sh=source.h;
    for(let yy=0,j=0;yy<nh;yy++){const y=yy*h/nh-36,dy=y-s.y,ry=y-s.h/2;
      for(let xx=0;xx<nw;xx++,j+=4){const x=xx*w/nw-36,dx=x-s.x,rx=x-s.w/2+skew*clamp(ry/Math.max(1,s.h/2),-1.5,1.5);
        const qx=Math.abs(rx)-(s.w/2-rad),qy=Math.abs(ry)-(s.h/2-rad),ax=Math.max(qx,0),ay=Math.max(qy,0),len=Math.hypot(ax,ay);
        const sd=len+Math.min(Math.max(qx,qy),0)-rad;let nx=0,ny=0;
        if(len>0){nx=ax/len*Math.sign(rx);ny=ay/len*Math.sign(ry);}else if(qx>qy)nx=Math.sign(rx);else ny=Math.sign(ry);
        const edge=Math.exp(-Math.pow((sd+2)/rim,2)),g=Math.exp(-(dx*dx+dy*dy)/(sig*sig));
        const ix=clamp((rect.left-source.rect.left+(x+nx*edge*rim+dx*g*f*.46)*rect.width/Math.max(1,s.w))*sxScale,0,sw-1.001);
        const iy=clamp((rect.top-source.rect.top+(y+ny*edge*rim+dy*g*f*.46)*rect.height/Math.max(1,s.h))*syScale,0,sh-1.001);
        const bx=Math.floor(ix),by=Math.floor(iy),fx=ix-bx,fy=iy-by,k=(by*sw+bx)*4,light=clamp(edge*(-ny*.16+.045)+f*g*(-dy/sig)*.18,-.35,.35);
        for(let q=0;q<3;q++){const a=raw[k+q]*(1-fx)+raw[k+4+q]*fx,b=raw[k+sw*4+q]*(1-fx)+raw[k+sw*4+4+q]*fx;
          const mix=alpha*color[3]/255;let v=(a*(1-fy)+b*fy)*(1-mix)+color[q]*mix;v=light>0?v+(255-v)*light:v*(1+light);out[j+q]=v;}
        out[j+3]=255;
      }
    }
    ctx.putImageData(im,0,0);
  }

  function paint(s,config,backdrop){
    if(!s.w||!s.h)return;
    const el=s.el,d=design(el);s.design=d;s.r=radius(el,s.w,s.h,d.radii[0]);
    if(s.native||d.complex||!d.surface){
      el.removeAttribute('data-uibms-material-host');el.removeAttribute('data-uibms-material-shadow');
      if(s.layer&&!s.layer.hidden)s.layer.hidden=true;
      el.setAttribute('data-uibms-material-native','');
      el.toggleAttribute('data-uibms-material-surface',d.surface);
      el.style.setProperty('--_uibms-material-base-image',d.image||'none');
      el.style.setProperty('--_uibms-material-base-color',d.background);
      el.style.setProperty('--_uibms-material-force',String(s.f));
      el.style.setProperty('--_uibms-material-x',clamp(s.x/s.w*100,0,100)+'%');
      el.style.setProperty('--_uibms-material-y',clamp(s.y/s.h*100,0,100)+'%');
      el.toggleAttribute('data-uibms-material-radius',d.uniformRadius&&Math.abs(s.f)>.001);
      if(d.uniformRadius&&Math.abs(s.f)>.001){
        const variation=s.f*clamp(Math.min(s.w,s.h)*.13,2,12);
        const corner=(x,y)=>Math.max(0,s.r+variation*Math.exp(-Math.hypot(x-s.x,y-s.y)/42)).toFixed(2)+'px';
        el.style.setProperty('--_uibms-material-radius',[corner(0,0),corner(s.w,0),corner(s.w,s.h),corner(0,s.h)].join(' '));
      }else el.style.removeProperty('--_uibms-material-radius');
      el.style.setProperty('--_uibms-thumb-scale',String(clamp(1+s.f*.18,.76,1.2)));
      if(el.matches('input[type=range]')){const min=Number(el.min||0),max=Number(el.max||100);el.style.setProperty('--_uibms-range-progress',clamp((Number(el.value)-min)/Math.max(.0001,max-min)*100,0,100)+'%');}
      return;
    }
    el.removeAttribute('data-uibms-material-native');el.removeAttribute('data-uibms-material-surface');el.removeAttribute('data-uibms-material-radius');
    if(s.layer.hidden)s.layer.hidden=false;
    const cs=getComputedStyle(el),left=parseFloat(cs.borderLeftWidth)||0,top=parseFloat(cs.borderTopWidth)||0;
    Object.assign(s.layer.style,{left:(-36-left+el.scrollLeft)+'px',top:(-36-top+el.scrollTop)+'px',right:'auto',bottom:'auto',width:(s.w+72)+'px',height:(s.h+72)+'px'});
    const path=contour(s.w,s.h,s.r,s.x,s.y,s.f,0,config.amplitude,config.maximum);
    s.fill.style.clipPath='path("'+path+'")';s.path.setAttribute('d',path);
    s.svg.setAttribute('viewBox','0 0 '+(s.w+72)+' '+(s.h+72));
    s.layer.style.setProperty('--_uibms-material-base-color',d.background);
    s.layer.style.setProperty('--_uibms-material-border-color',d.border.color);
    s.layer.style.setProperty('--_uibms-material-border-width',(d.border.style==='none'||d.border.style==='hidden'?0:d.border.width)+'px');
    s.layer.style.setProperty('--_uibms-material-force',String(s.f));
    s.path.style.strokeDasharray=d.border.style==='dashed'?(d.border.width*3)+' '+(d.border.width*2):d.border.style==='dotted'?d.border.width+' '+d.border.width:'none';
    s.layer.style.filter=d.filter||'none';
    el.toggleAttribute('data-uibms-material-shadow',!!d.filter);
    s.fill.style.setProperty('--_uibms-material-x',clamp((s.x+36)/(s.w+72)*100,0,100)+'%');
    s.fill.style.setProperty('--_uibms-material-y',clamp((s.y+36)/(s.h+72)*100,0,100)+'%');
    paintOptics(s,backdrop,s.rect,el);
    el.setAttribute('data-uibms-material-host','');
  }
  function selected(group){
    return [...group.querySelectorAll('a[href][aria-current]:not([aria-current=false]),[role=tab][aria-selected=true],button[aria-selected=true],button[aria-pressed=true],input[type=radio]:checked')].find(el=>el.closest(groups)===group&&enabled(el)&&!legacyMaterial(el)&&visible(el));
  }
  function selection(group,config=defaults,findBackdrop=()=>null){
    const s={group,...decoration('selection-layer'),edge:null,velocity:[0,0,0,0],skew:0,f:0,v:0,target:null,items:new Set()};
    positionHost(group);group.setAttribute('data-uibms-selection-host','');group.append(s.layer);
    s.layer.hidden=true;
    const set=(el,immediate=false)=>{
      const next=new Set(el?[...group.querySelectorAll('a[href],button,[role=tab],input[type=radio]')].filter(a=>a.closest(groups)===group&&enabled(a)&&!legacyMaterial(a)):[]);
      for(const a of s.items)if(!next.has(a))a.removeAttribute('data-uibms-selection-item');
      for(const a of next)if(!a.hasAttribute('data-uibms-selection-item'))a.setAttribute('data-uibms-selection-item','');
      s.items=next;
      if(!el||!group.contains(el)||!visible(el)){s.target=null;if(!s.layer.hidden)s.layer.hidden=true;return;}
      s.target=el;if(s.layer.hidden)s.layer.hidden=false;if(immediate)s.edge=null;
    };
    const targetRect=()=>{
      const a=s.target.getBoundingClientRect(),b=group.getBoundingClientRect(),sx=(group.offsetWidth||b.width)/Math.max(1,b.width),sy=(group.offsetHeight||b.height)/Math.max(1,b.height);
      const l=(a.left-b.left)*sx+group.scrollLeft-(parseFloat(getComputedStyle(group).borderLeftWidth)||0)+2,t=(a.top-b.top)*sy+group.scrollTop-(parseFloat(getComputedStyle(group).borderTopWidth)||0)+2;
      if(s.target.matches('input[type=radio]')){let ix=a.width*sx*.22,iy=a.height*sy*.22;return [l+ix,t+iy,l+Math.max(4,a.width*sx-4)-ix,t+Math.max(4,a.height*sy-4)-iy];}
      return [l,t,l+Math.max(4,a.width*sx-4),t+Math.max(4,a.height*sy-4)];
    };
    const tick=(dt,instant=false,press=null,point=null)=>{
      if(!s.target||!visible(s.target)){if(!s.layer.hidden)s.layer.hidden=true;return false;}
      const profile=motion(group);instant=instant||profile.instant;
      let dest=targetRect();if(!s.edge||instant){s.edge=dest.slice();s.velocity.fill(0);s.skew=0;}
      let moving=false,dx=(dest[0]+dest[2]-s.edge[0]-s.edge[2])/2,dy=(dest[1]+dest[3]-s.edge[1]-s.edge[3])/2;
      for(let i=0;i<4;i++){
        let leading=i===0?dx<0:i===2?dx>=0:i===1?dy<0:dy>=0;
        if(!instant)[s.edge[i],s.velocity[i]]=step(s.edge[i],s.velocity[i],dest[i],dt,(leading?19:13)*profile.speed,(leading?12:9)*profile.speed);
        if(s.edge[i]!==dest[i]||s.velocity[i]!==0)moving=true;
      }
      const targetSkew=instant?0:clamp((s.velocity[0]+s.velocity[2])*.018,-14,14);
      s.skew=instant?0:s.skew+(targetSkew-s.skew)*Math.min(1,dt*19);
      if(Math.abs(s.skew)<.02&&targetSkew===0)s.skew=0;else if(s.skew!==0)moving=true;
      const l=s.edge[0],t=s.edge[1],w=Math.max(4,s.edge[2]-l),h=Math.max(4,s.edge[3]-t);
      let f=press===s.target&&!muted(s.target,'active')?-config.pressure*profile.press:point&&point.el===s.target&&!muted(s.target,'hover')?config.attraction*.73*profile.hover:0;
      if(instant){s.f=s.v=0;}else{[s.f,s.v]=step(s.f,s.v,f,dt,config.stiffness*profile.speed,config.damping*profile.speed);if(s.f!==f||s.v!==0)moving=true;}
      const rect=s.target.getBoundingClientRect(),x=point?clamp(point.x-rect.left,0,w):w/2,y=point?clamp(point.y-rect.top,0,h):h/2;
      const rad=s.target.matches('input[type=radio]')?Math.min(w,h)/2:radius(s.target,w,h);
      const d=contour(w,h,rad,x,y,clamp(s.f,-1.1,1.1),s.skew,config.amplitude,config.maximum);
      s.layer.style.setProperty('--_uibms-material-base-color',s.target.matches('input[type=radio]')?'var(--color-accent)':'var(--color-surface-subtle)');
      s.layer.style.setProperty('--_uibms-material-border-color','var(--color-border-subtle)');
      s.layer.style.setProperty('--_uibms-material-border-width','var(--border-width)');
      s.layer.style.setProperty('--_uibms-material-force',String(s.f));
      Object.assign(s.layer.style,{left:(l-36)+'px',top:(t-36)+'px',width:(w+72)+'px',height:(h+72)+'px'});
      s.fill.style.clipPath='path("'+d+'")';s.path.setAttribute('d',d);s.svg.setAttribute('viewBox','0 0 '+(w+72)+' '+(h+72));
      const gr=group.getBoundingClientRect(),sx=gr.width/Math.max(1,group.offsetWidth),sy=gr.height/Math.max(1,group.offsetHeight);
      Object.assign(s,{w,h,r:rad,x,y});paintOptics(s,findBackdrop(group),{left:gr.left+(l-group.scrollLeft+group.clientLeft)*sx,top:gr.top+(t-group.scrollTop+group.clientTop)*sy,width:w*sx,height:h*sy},group);
      return moving;
    };
    return {set,tick,destroy(){for(const a of s.items)a.removeAttribute('data-uibms-selection-item');s.layer.remove();group.removeAttribute('data-uibms-selection-host');if(!group.hasAttribute('data-uibms-material-host')&&!group.querySelector(':scope > [data-uibms-material-layer]'))group.removeAttribute('data-uibms-material-position');},get target(){return s.target;}};
  }
  function mountMaterial(root=document,options={}){
    if(instances.has(root))return instances.get(root);
    const config={...defaults,...options},surfaces=new Map(),selections=new Map(),dirty=new Set(),animating=new Set(),backdrops=new Map();
    const findBackdrop=el=>{for(let p=el;p;p=p.parentElement){if(backdrops.has(p))return backdrops.get(p);}return null;};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active), (prefers-contrast: more), (prefers-reduced-transparency: reduce)'),scheme=matchMedia('(prefers-color-scheme: dark)');
    let frame=0,last=0,hover=null,pressed=null,pointer=null,pressTarget=null,keyPress=false,point=null,disposed=false,refreshPending=false;
    const cancel=()=>{pressed=null;pointer=null;pressTarget=null;keyPress=false;point=null;targetHover(null);request();};
    function request(){if(!frame&&!disposed)frame=requestAnimationFrame(tick);}
    function queueRefresh(){if(refreshPending||disposed)return;refreshPending=true;queueMicrotask(()=>{refreshPending=false;if(!disposed)refresh();});}
    const ro=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{for(const e of entries){let s=surfaces.get(e.target);if(s)dirty.add(s);}request();}):null;
    function wanted(el,groupTargets){
      if(forced.matches||!enabled(el)||legacyMaterial(el)||backdrops.has(el)||el.closest('[data-uibms-material-layer],[data-uibms-selection-layer],[data-uibms-form-trigger],.visually-hidden,[hidden]'))return false;
      if(el.matches('html,body,script,style,template,link,meta,head,br,wbr,option,optgroup,slot,input[type=hidden]'))return false;
      const group=el.closest(groups);
      if(group&&group!==el&&groupTargets.get(group)&&el.matches('a[href],button,[role=tab],input[type=radio]'))return false;
      if(el.matches('a[href]')&&!el.hasAttribute('data-material')&&getComputedStyle(el).display==='inline')return false;
      return true;
    }
    function refresh(){
      const groupTargets=new Map();
      if(!forced.matches&&CSS.supports('clip-path','path("M 0 0 H 1 V 1 Z")'))for(const el of root.querySelectorAll(groups))if(enabled(el)&&!legacyMaterial(el)){const a=selected(el);if(a)groupTargets.set(el,a);}
      for(const [el,s] of selections)if(!groupTargets.has(el)){s.destroy();selections.delete(el);}
      const candidates=[...(root.nodeType===1&&root.matches(selector)?[root]:[]),...root.querySelectorAll(selector)],keep=new Set();
      for(const el of candidates){
        if(!wanted(el,groupTargets))continue;
        const d=design(el);
        if(!d.surface&&!el.matches(activeSelector)&&!el.matches(replaced)&&el.getAttribute('data-material')!=='liquid-silicone')continue;
        if(!d.surface&&el.matches('table,hr,progress,meter,img,video,audio,iframe,canvas,svg'))continue;
        keep.add(el);
        let s=surfaces.get(el);const native=d.complex||!d.surface;
        if(s&&s.native!==native){ro?.unobserve(el);removeSurface(s);surfaces.delete(el);animating.delete(s);dirty.delete(s);if(hover===s)hover=null;if(pressed===s)pressed=null;s=null;}
        if(!s){s=createSurface(el,d);surfaces.set(el,s);ro?.observe(el);}
        s.design=d;s.motion=motion(el);dirty.add(s);
        if(s.f!==0||s===hover||s===pressed)animating.add(s);
      }
      for(const [el,s] of surfaces)if(!keep.has(el)){ro?.unobserve(el);removeSurface(s);surfaces.delete(el);animating.delete(s);dirty.delete(s);if(hover===s)hover=null;if(pressed===s)pressed=null;}
      for(const [el,a] of groupTargets){let s=selections.get(el);if(!s){s=selection(el,config,findBackdrop);selections.set(el,s);}s.set(a);}
      request();
    }
        function targetHover(s){if(hover&&hover!==s){hover.target=0;animating.add(hover);}hover=s;if(s)animating.add(s);}
    function locate(e){
      if(!e.isPrimary)return;
      const target=e.target instanceof Element?e.target:null,canHover=e.pointerType!=='touch';
      point=canHover?{x:e.clientX,y:e.clientY,el:target?.closest('a[href],button,input[type=radio],[role=tab],[aria-pressed]')}:null;
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
      pressTarget=el;keyPress=false;const s=surfaces.get(el);
      if(s&&interactive(el)&&!muted(el,'active')){pressed=s;setPoint(s,e.clientX,e.clientY);animating.add(s);}
      locate(e);
    }
    function up(e){if(pointer!==e.pointerId)return;if(pressed)animating.add(pressed);pressed=null;pointer=null;pressTarget=null;locate(e);}
    function keydown(e){if(![' ','Enter'].includes(e.key)||pointer!==null)return;const el=e.target;if(!interactive(el))return;keyPress=true;pressTarget=el;const s=surfaces.get(el);if(s&&!muted(s.el,'active')){pressed=s;measure(s);s.tx=s.w/2;s.ty=s.h/2;animating.add(s);}request();}
    function keyup(){if(!keyPress)return;keyPress=false;pressTarget=null;if(pressed)animating.add(pressed);pressed=null;request();}
    function tick(now){
      frame=0;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
      for(const s of dirty){if(visible(s.el)){measure(s);paint(s,config,forced.matches?null:findBackdrop(s.el));}}dirty.clear();
      const instant=reduced.matches||forced.matches;
      for(const s of [...animating]){
        if(!s.el.isConnected||!visible(s.el)){animating.delete(s);continue;}
        measure(s);
        const profile=s.motion||motion(s.el),stopped=instant||profile.instant;
        const desired=stopped?0:pressed===s&&interactive(s.el)&&!muted(s.el,'active')?-config.pressure*profile.press:hover===s&&!disabled(s.el)&&!muted(s.el,'hover')?s.target*profile.hover:0;
        if(stopped){s.f=s.v=0;s.x=s.tx;s.y=s.ty;}
        else{[s.f,s.v]=step(s.f,s.v,desired,dt,config.stiffness*profile.speed,config.damping*profile.speed);s.f=clamp(s.f,-1.2,1.2);s.x+=(s.tx-s.x)*Math.min(1,dt*22);s.y+=(s.ty-s.y)*Math.min(1,dt*22);}
        paint(s,config,forced.matches?null:findBackdrop(s.el));
        if(s.f===desired&&s.v===0&&Math.abs(s.x-s.tx)<.1&&Math.abs(s.y-s.ty)<.1)animating.delete(s);
      }
      let moving=false;
      for(const [el,s] of selections){
        let current=selected(el);if(current!==s.target)s.set(current);
        moving=s.tick(dt,instant,pressTarget,point)||moving;
      }
      if(animating.size||moving)request();else last=0;
    }
    const eventRoot=root.nodeType===9?root:root;
    const listeners=[[eventRoot,'pointerdown',down],[eventRoot,'keydown',keydown],[eventRoot,'keyup',keyup],[eventRoot,'focusout',keyup],[eventRoot,'change',queueRefresh],[eventRoot,'focusin',e=>{const s=surfaces.get(e.target);if(s){dirty.add(s);request();}}],[eventRoot,'focusout',e=>{const s=surfaces.get(e.target);if(s){dirty.add(s);request();}}],[eventRoot,'input',e=>{const s=surfaces.get(e.target);if(s){dirty.add(s);animating.add(s);request();}}],[window,'pointermove',locate],[window,'pointerup',up],[window,'pointercancel',cancel],[window,'blur',cancel],[window,'resize',()=>{for(const s of surfaces.values())dirty.add(s);request();}],[window,'scroll',request,true]];
    listeners.forEach(([o,k,f,c])=>o.addEventListener(k,f,c||false));
    const observer=new MutationObserver(records=>{
      if(records.some(r=>!r.target.closest?.('[data-uibms-material-layer],[data-uibms-selection-layer]')&&(r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.matches('[data-uibms-material-layer],[data-uibms-selection-layer]')))))queueRefresh();
    });
    observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:[...profileKeys.map(k=>'data-'+k),'data-effect','data-hover','data-active','data-focus','data-scroll','aria-current','aria-pressed','aria-selected','disabled','aria-disabled','readonly','hidden','open','inert','class']});
    const preference=()=>{refresh();for(const s of surfaces.values())animating.add(s);request();};
    reduced.addEventListener?.('change',preference);forced.addEventListener?.('change',preference);scheme.addEventListener?.('change',preference);
    function unregisterBackdrop(el){const b=backdrops.get(el);if(!b)return;b.cancelled=true;el.style.backgroundImage=b.oldImage;el.style.backgroundSize=b.oldSize;el.style.backgroundPosition=b.oldPosition;el.style.backgroundRepeat=b.oldRepeat;backdrops.delete(el);for(const s of surfaces.values())dirty.add(s);refresh();}
    async function registerBackdrop(el,src){
      if(!(el instanceof Element)||!root.contains(el))throw new TypeError('Backdrop must belong to the mounted root.');
      unregisterBackdrop(el);const url=new URL(src,document.baseURI);if(!['https:','http:','data:','blob:'].includes(url.protocol))throw new TypeError('Unsupported image URL.');
      const b={el,canvas:document.createElement('canvas'),rev:0,oldImage:el.style.backgroundImage,oldSize:el.style.backgroundSize,oldPosition:el.style.backgroundPosition,oldRepeat:el.style.backgroundRepeat};backdrops.set(el,b);
      const image=new Image();if(url.origin!==location.origin&&url.protocol.startsWith('http'))image.crossOrigin='anonymous';image.src=url.href;
      try{await image.decode();if(b.cancelled||disposed)return false;b.image=image;el.style.backgroundImage='url('+JSON.stringify(url.href)+')';el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.style.backgroundRepeat='no-repeat';if(!imagePixels(b))throw Error('Image pixels unavailable');for(const s of surfaces.values())dirty.add(s);refresh();return true;}catch{unregisterBackdrop(el);return false;}
    }
    const api={refresh,registerBackdrop,unregisterBackdrop,destroy(){disposed=true;for(const b of backdrops.values()){b.cancelled=true;b.el.style.backgroundImage=b.oldImage;b.el.style.backgroundSize=b.oldSize;b.el.style.backgroundPosition=b.oldPosition;b.el.style.backgroundRepeat=b.oldRepeat;}backdrops.clear();cancelAnimationFrame(frame);observer.disconnect();ro?.disconnect();listeners.forEach(([o,k,f,c])=>o.removeEventListener(k,f,c||false));reduced.removeEventListener?.('change',preference);forced.removeEventListener?.('change',preference);scheme.removeEventListener?.('change',preference);for(const s of selections.values())s.destroy();for(const s of surfaces.values())removeSurface(s);instances.delete(root);}};
    instances.set(root,api);refresh();return api;
  }
  return {mountMaterial,contour,step,defaults,motionProfile,shadowFilter};
})();
export const {mountMaterial,contour,step,defaults,motionProfile,shadowFilter}=engine;
