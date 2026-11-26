// UIBMS Material Engine - optional development candidate. MIT.
const engine = (function materialEngine() {
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const selector='div,section,header,footer,main,article,aside,nav,form,fieldset,dialog,[popover],details,summary,button,a[href],input:not([type=hidden]),select,textarea,figure,blockquote,pre,progress,meter,table,img,video,audio,hr,.card,.panel,[data-uibms-form-control][data-uibms-form-kind="color"],[data-material="liquid-silicone"]';
  const replaced='input,select,textarea,progress,meter,img,video,audio,iframe,canvas,svg,hr,table,caption,thead,tbody,tfoot,tr,td,th,option,optgroup';
  const tableParts='caption,thead,tbody,tfoot,tr,th,td';
  const mediaElements='img,video,audio';
  const overlays='dialog,[popover],[data-uibms-form-popup]';
  const overlayContent='p,h1,h2,h3,h4,h5,h6,li,dt,dd,blockquote,pre,figure,section,article,div,header,footer,aside,fieldset,form';
  const overlayOwner=el=>el?.closest(overlays)||null;
  function overlayOpen(el){
    if(!el||!el.isConnected)return false;
    if(el.matches('dialog')&&!el.open)return false;
    if(el.hasAttribute('popover')){try{return el.matches(':popover-open');}catch{return false;}}
    return true;
  }
  function inOpenOverlays(el){
    for(let p=overlayOwner(el);p;p=overlayOwner(p.parentElement))if(!overlayOpen(p))return false;
    return true;
  }
  function outsideOverlay(target,x,y){
    const owner=overlayOwner(target);if(!owner)return false;
    const r=owner.getBoundingClientRect();return !overlayOpen(owner)||x<r.left||x>r.right||y<r.top||y>r.bottom;
  }
  const groups='nav,[role=tablist],[role=radiogroup],[data-uibms-form-options]';
  const activeSelector='button,a[href],summary,input:is([type=button],[type=submit],[type=reset],[type=image],[type=checkbox],[type=radio],[type=range],[type=color],[type=file]),select,[role=button],[role=tab],[role=switch]';
  const SVG='http://www.w3.org/2000/svg';
  const instances=new WeakMap();
  const defaults=Object.freeze({attraction:.85,range:32,pressure:1,stiffness:17,damping:8,amplitude:.18,maximum:24,touchAttractionTime:80,touchCompressionTime:100,touchSlop:12,overlayMaximum:14,overlaySkew:8,mediaMaximum:14,mediaSkew:6,mediaRadius:null,mediaRenderer:'auto'});
  // A quick tap has a short visual impulse even if the finger is lifted before the next frame.
  // This controls paint only; native click, focus, scroll and form events are not delayed.
  function touchPhase(age,releasedAt,pressable,attractionTime=defaults.touchAttractionTime,compressionTime=defaults.touchCompressionTime){
    const rise=Math.max(0,attractionTime),press=Math.max(0,compressionTime);
    const end=releasedAt===null?Infinity:Math.max(releasedAt,rise+(pressable?press:0));
    if(age>=end)return 'rest';
    return !pressable||age<rise?'attract':'press';
  }
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
  const paintFlags=['data-uibms-material-host','data-uibms-material-native','data-uibms-material-shadow','data-uibms-material-radius','data-uibms-material-table','data-uibms-material-overlay','data-uibms-material-contact','data-uibms-overlay-contour','data-uibms-material-media','data-uibms-media-frame'];
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
    const isOverlay=el.matches(overlays);
    // Measure native content, excluding purely decorative overscan.
    if(isOverlay)el.setAttribute('data-uibms-overlay-measure','');
    const cs=getComputedStyle(el);
    const borders=sides.map(k=>({width:parseFloat(cs['border'+k+'Width'])||0,color:cs['border'+k+'Color'],style:cs['border'+k+'Style']}));
    const radii=corners.map(k=>cs['border'+k+'Radius']);
    const background=cs.backgroundColor,image=cs.backgroundImage,shadow=cs.boxShadow;
    const sameBorder=borders.every(b=>b.width===borders[0].width&&b.color===borders[0].color&&b.style===borders[0].style);
    const uniformRadius=radii.every(r=>r===radii[0])&&!radii[0].includes(' ');
    const surface=visibleColor(background)||image!=='none'||shadow!=='none'||borders.some(b=>b.width>0&&b.style!=='none'&&b.style!=='hidden'&&visibleColor(b.color));
    const complex=!CSS.supports('clip-path','path("M 0 0 H 1 V 1 Z")')||el.matches(replaced)||el.matches('pre,details,summary,'+overlays)||['inline','contents','none','list-item'].includes(cs.display)||['sticky','fixed'].includes(cs.position)||cs.overflowX!=='visible'||cs.overflowY!=='visible'||!sameBorder||!uniformRadius||image!=='none'||!['solid','none','hidden','dashed','dotted'].includes(borders[0].style);
    const filter=shadowFilter(shadow);
    const fits=e=>e.scrollWidth<=e.clientWidth+1&&e.scrollHeight<=e.clientHeight+1;
    const inner=isOverlay?el.querySelector(':scope > [data-uibms-form-content]'):null;
    const overlayContour=isOverlay&&!el.matches('dialog.drawer')&&CSS.supports('overflow','clip')&&surface&&sameBorder&&uniformRadius&&image==='none'&&filter!==null&&['solid','none','hidden','dashed','dotted'].includes(borders[0].style)&&['visible','auto'].includes(cs.overflowX)&&['visible','auto'].includes(cs.overflowY)&&fits(el)&&(!inner||fits(inner));
    const result={background,image,shadow,filter,border:borders[0],radii,uniformRadius,surface,complex,table:el.matches('table'),overlay:isOverlay,overlayContour,media:el.matches(mediaElements),mediaContour:sameBorder&&uniformRadius&&cs.borderImageSource==='none'&&cs.clipPath==='none'&&['solid','none','hidden','dashed','dotted'].includes(borders[0].style)&&CSS.supports('border-image-slice','0 fill'),foreground:cs.color};
    if(isOverlay)el.removeAttribute('data-uibms-overlay-measure');
    for(const k of restore)el.setAttribute(k,'');
    return result;
  }
  const disabled=el=>el.matches(':disabled,[readonly]')||!!el.closest('[inert],[aria-disabled=true]');
  const interactive=el=>!disabled(el)&&!el.matches('table,'+tableParts+','+overlays+','+mediaElements)&&el.matches(activeSelector);
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
    s.releaseMedia?.();s.layer?.remove();s.overlayLayer?.layer.remove();
    for(const k of [...paintFlags,'data-uibms-material-surface'])s.el.removeAttribute(k);
    if(!s.el.hasAttribute('data-uibms-selection-host'))s.el.removeAttribute('data-uibms-material-position');
    for(const k of ['--_uibms-material-force','--_uibms-material-x','--_uibms-material-y','--_uibms-material-radius','--_uibms-thumb-scale','--_uibms-range-progress','--_uibms-material-base-image','--_uibms-material-base-color','--_uibms-material-outer-shadow','--_uibms-media-image','--_uibms-media-outset'])s.el.style.removeProperty(k);
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

  // SVG paints the shared outline without expanding the native scroll box.
  // Native contents and hit areas never transform.
  let overlayGradientId=0;
  function overlayDecoration(el){
    const d=decoration('material-layer');
    d.layer.setAttribute('data-uibms-overlay-layer','');
    d.fill.remove();
    const defs=document.createElementNS(SVG,'defs'),gradient=document.createElementNS(SVG,'radialGradient');
    const id='uibms-overlay-light-'+(++overlayGradientId);
    gradient.id=id;gradient.setAttribute('r','70%');
    const start=document.createElementNS(SVG,'stop'),end=document.createElementNS(SVG,'stop');
    start.setAttribute('offset','0%');start.setAttribute('stop-color','white');
    end.setAttribute('offset','100%');end.setAttribute('stop-color','white');end.setAttribute('stop-opacity','0');
    gradient.append(start,end);defs.append(gradient);d.svg.prepend(defs);
    const light=document.createElementNS(SVG,'path');light.setAttribute('data-uibms-overlay-reflection','');light.setAttribute('fill','url(#'+id+')');d.svg.append(light);
    d.path.setAttribute('data-uibms-overlay-outline','');
    positionHost(el);el.append(d.layer);
    return {...d,gradient,start,light};
  }
  function overlayPath(w,h,r,x,y,force,config=defaults){
    const f=clamp(force,0,1.2),direction=clamp((x/Math.max(1,w)-.5)*2,-1,1);
    const skew=f*direction*Math.max(0,config.overlaySkew);
    return contour(w,h,r,x,y,f,skew,config.amplitude,Math.max(2,config.overlayMaximum),0);
  }
  function paintOverlay(s,config,d){
    const el=s.el;
    if(!d.overlayContour){el.removeAttribute('data-uibms-overlay-contour');return;}
    if(!s.overlayLayer)s.overlayLayer=overlayDecoration(el);
    const layer=s.overlayLayer,cs=getComputedStyle(el),left=parseFloat(cs.borderLeftWidth)||0,top=parseFloat(cs.borderTopWidth)||0;
    Object.assign(layer.layer.style,{left:(-left)+'px',top:(-top)+'px',right:'auto',bottom:'auto',width:s.w+'px',height:s.h+'px'});
    const path=overlayPath(s.w,s.h,s.r,s.x,s.y,s.f,config);
    layer.svg.setAttribute('viewBox','0 0 '+s.w+' '+s.h);
    layer.path.setAttribute('d',path);layer.light.setAttribute('d',path);
    layer.layer.style.setProperty('--_uibms-material-base-color',d.background);
    layer.layer.style.setProperty('--_uibms-material-border-color',d.border.color);
    layer.layer.style.setProperty('--_uibms-material-border-width',(d.border.style==='none'||d.border.style==='hidden'?0:d.border.width)+'px');
    layer.path.style.strokeDasharray=d.border.style==='dashed'?(d.border.width*3)+' '+(d.border.width*2):d.border.style==='dotted'?d.border.width+' '+d.border.width:'none';
    layer.layer.style.filter=d.filter||'none';
    layer.gradient.setAttribute('cx',clamp(s.x/s.w*100,0,100)+'%');
    layer.gradient.setAttribute('cy',clamp(s.y/s.h*100,0,100)+'%');
    layer.start.setAttribute('stop-opacity',String(clamp(.04+s.f*.18,0,.3)));
    el.setAttribute('data-uibms-overlay-contour','');
  }
  // A media element is replaced content, so never append or wrap its playback
  // node. Paint an SVG ring as a CSS border image with visual-only outset.
  // This leaves image pixels, native controls, source nodes and hit areas intact.
  function mediaFrame(w,h,r,x,y,force,config=defaults){
    const f=clamp(force,0,1.2),size=Math.max(1,Math.min(w,h));
    const cap=clamp(Number(config.mediaMaximum)||0,0,size*.17);
    const skewLimit=clamp(Number(config.mediaSkew)||0,0,size*.08);
    const skew=f*clamp((x/Math.max(1,w)-.5)*2,-1,1)*skewLimit;
    // Keep the entire original media box inside the outward frame even when
    // the edge leans. Small media (including audio controls) get less motion.
    const margin=f*(Math.min(3,size*.04)+Math.min(3,h*.07)+Math.abs(skewLimit));
    const outset=Math.ceil(4+1.2*(cap+skewLimit+Math.min(3,size*.04)+Math.min(3,h*.07)+skewLimit));
    const inner=contour(w,h,r,x,y,0,0,0,0,outset);
    if(f===0)return {outer:inner,inner,outset,skew:0};
    const outer=contour(w+margin*2,h+margin*2,r+margin,x+margin,y+margin,f,skew,config.amplitude,Math.max(2,cap),outset-margin);
    return {outer,inner,outset,skew};
  }
  function fullscreenMedia(el){
    const active=el.ownerDocument.fullscreenElement||el.ownerDocument.webkitFullscreenElement;
    return !!(active&&(active===el||active.contains(el)))||el.webkitDisplayingFullscreen===true;
  }
  function paintMedia(s,config,d){
    const el=s.el,active=s.f>.001&&!fullscreenMedia(el);
    el.setAttribute('data-uibms-material-media','');s.mediaRunning=false;
    el.toggleAttribute('data-uibms-material-contact',active);
    el.style.setProperty('--_uibms-material-outer-shadow',d.shadow==='none'?'0 0 0 0 transparent':d.shadow);
    // Native audio and video with browser-owned controls remain fully native.
    // Do not show an empty frame as if it were true media deformation.
    if(active&&el.matches('img,video:not([controls])')&&d.mediaContour&&s.w>1&&s.h>1){
      config.loadMedia();
      if(config.mediaDeformer?.paint(s,d)){
        s.releaseMedia=()=>config.mediaDeformer?.release(el);
        s.mediaRunning=el.matches('video')&&!el.paused&&!el.ended;
        return;
      }
    }
    s.releaseMedia?.();s.releaseMedia=null;
  }
  function paint(s,config,backdrop){
    if(!s.w||!s.h)return;
    const el=s.el,d=design(el);s.design=d;s.r=radius(el,s.w,s.h,d.radii[0]);
    if(s.native||d.complex||!d.surface){
      el.removeAttribute('data-uibms-material-host');el.removeAttribute('data-uibms-material-shadow');
      if(s.layer&&!s.layer.hidden)s.layer.hidden=true;
      el.setAttribute('data-uibms-material-native','');
      el.toggleAttribute('data-uibms-material-surface',d.surface);
      // Shared passive surfaces preserve native geometry and use one optical spring.
      el.toggleAttribute('data-uibms-material-table',d.table);
      el.toggleAttribute('data-uibms-material-overlay',d.overlay);
      el.toggleAttribute('data-uibms-material-contact',(d.table||d.overlay)&&s.f>.001);
      if(d.table||d.overlay)el.style.setProperty('--_uibms-material-outer-shadow',d.shadow==='none'?'0 0 0 0 transparent':d.shadow);
      el.style.setProperty('--_uibms-material-base-image',d.image||'none');
      el.style.setProperty('--_uibms-material-base-color',d.background);
      el.style.setProperty('--_uibms-material-force',String(s.f));
      el.style.setProperty('--_uibms-material-x',clamp(s.x/s.w*100,0,100)+'%');
      el.style.setProperty('--_uibms-material-y',clamp(s.y/s.h*100,0,100)+'%');
      el.toggleAttribute('data-uibms-material-radius',!d.table&&!d.overlay&&d.uniformRadius&&Math.abs(s.f)>.001);
      if(!d.table&&!d.overlay&&d.uniformRadius&&Math.abs(s.f)>.001){
        const variation=s.f*clamp(Math.min(s.w,s.h)*.13,2,12);
        const corner=(x,y)=>Math.max(0,s.r+variation*Math.exp(-Math.hypot(x-s.x,y-s.y)/42)).toFixed(2)+'px';
        el.style.setProperty('--_uibms-material-radius',[corner(0,0),corner(s.w,0),corner(s.w,s.h),corner(0,s.h)].join(' '));
      }else el.style.removeProperty('--_uibms-material-radius');
      el.style.setProperty('--_uibms-thumb-scale',String(clamp(1+s.f*.18,.76,1.2)));
      if(el.matches('input[type=range]')){const min=Number(el.min||0),max=Number(el.max||100);el.style.setProperty('--_uibms-range-progress',clamp((Number(el.value)-min)/Math.max(.0001,max-min)*100,0,100)+'%');}
      if(d.overlay)paintOverlay(s,config,d);
      if(d.media)paintMedia(s,config,d);
      return;
    }
    el.removeAttribute('data-uibms-material-native');el.removeAttribute('data-uibms-material-surface');el.removeAttribute('data-uibms-material-radius');el.removeAttribute('data-uibms-material-table');el.removeAttribute('data-uibms-material-overlay');el.removeAttribute('data-uibms-overlay-contour');el.removeAttribute('data-uibms-material-contact');
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
      if(s.target.matches('input[type=radio]')&&!group.matches('.segmented[role=radiogroup]')){let ix=a.width*sx*.22,iy=a.height*sy*.22;return [l+ix,t+iy,l+Math.max(4,a.width*sx-4)-ix,t+Math.max(4,a.height*sy-4)-iy];}
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
      const over=point?.el===s.target&&!disabled(s.target),canPull=over&&!muted(s.target,'hover'),canPress=interactive(s.target)&&!muted(s.target,'active');
      let f=point?.touchPhase?(point.touchPhase==='press'&&over&&canPress?-config.pressure*profile.press:point.touchPhase==='attract'&&canPull?config.attraction*.73*profile.hover:0):press===s.target&&canPress?-config.pressure*profile.press:canPull?config.attraction*.73*profile.hover:0;
      if(instant){s.f=s.v=0;}else{[s.f,s.v]=step(s.f,s.v,f,dt,config.stiffness*profile.speed,config.damping*profile.speed);if(s.f!==f||s.v!==0)moving=true;}
      const rect=s.target.getBoundingClientRect(),local=point?.el===s.target;
      const x=local?clamp(point.x-rect.left,0,w):s.f!==0&&Number.isFinite(s.x)?clamp(s.x,0,w):w/2,y=local?clamp(point.y-rect.top,0,h):s.f!==0&&Number.isFinite(s.y)?clamp(s.y,0,h):h/2;
      const segment=s.target.matches('input[type=radio]')&&group.matches('.segmented[role=radiogroup]');
      const rad=segment?radius(s.target.closest('label')||s.target,w,h):s.target.matches('input[type=radio]')?Math.min(w,h)/2:radius(s.target,w,h);
      const d=contour(w,h,rad,x,y,clamp(s.f,-1.1,1.1),s.skew,config.amplitude,config.maximum);
      s.layer.style.setProperty('--_uibms-material-base-color',s.target.matches('input[type=radio]')&&!segment?'var(--color-accent)':'var(--color-surface-subtle)');
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
    let mediaPromise=null;
    config.loadMedia=()=>{
      if(mediaPromise||config.mediaDeformer)return;
      const loader=typeof options.mediaLoader==='function'?options.mediaLoader:()=>import('./media-deformation.mjs');
      mediaPromise=Promise.resolve().then(loader).then(({createMediaDeformer})=>{
        if(disposed)return;
        config.mediaDeformer=createMediaDeformer(config);
        for(const s of surfaces.values())if(s.design.media&&s.f>.001){dirty.add(s);animating.add(s);}
        request();
      }).catch(()=>{/* Native media and the optical fallback remain usable. */});
    };
    const findBackdrop=el=>{for(let p=el;p;p=p.parentElement){if(backdrops.has(p))return backdrops.get(p);}return null;};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active), (prefers-contrast: more), (prefers-reduced-transparency: reduce)'),scheme=matchMedia('(prefers-color-scheme: dark)');
    let frame=0,last=0,hover=null,pressed=null,pointer=null,pressTarget=null,keyPress=false,point=null,touch=null,touchFocus=null,disposed=false,refreshPending=false;
    // Delegated, non-physical lighting. Only the table row/cell or a passive
    // content block in an overlay is lit; neither receives a separate spring.
    let lightTarget=null;const flatLights=new Map();
    function clearFlatLights(){
      for(const el of flatLights.keys()){el.removeAttribute('data-uibms-table-light');el.removeAttribute('data-uibms-overlay-light');el.style.removeProperty('--_uibms-flat-light-image');}
      flatLights.clear();lightTarget=null;
    }
    function setFlatLights(target,refreshing=false){
      const owner=target?.closest('table,'+overlays);
      const canLight=el=>el&&el.isConnected&&enabled(el)&&!legacyMaterial(el)&&!disabled(el)&&!muted(el,'hover');
      const next=new Map();
      if(!forced.matches&&owner&&root.contains(owner)&&surfaces.has(owner)&&canLight(owner)&&inOpenOverlays(owner)){
        if(owner.matches('table')){
          const cell=target.closest('th,td'),row=cell?.closest('tr');
          if(row&&row.closest('table')===owner&&canLight(row))next.set(row,'row');
          if(cell&&cell.closest('table')===owner&&canLight(cell))next.set(cell,'cell');
        }else if(!target.closest(activeSelector+',input,textarea,select,progress,meter,output')&&hitSurface(target)?.el===owner){
          const block=target.closest(overlayContent);
          if(block&&block!==owner&&owner.contains(block)&&canLight(block))next.set(block,'overlay');
        }
      }
      for(const el of flatLights.keys())if(!next.has(el)||refreshing){
        el.removeAttribute('data-uibms-table-light');el.removeAttribute('data-uibms-overlay-light');el.style.removeProperty('--_uibms-flat-light-image');flatLights.delete(el);
      }
      for(const [el,kind] of next)if(!flatLights.has(el)){
        el.style.setProperty('--_uibms-flat-light-image',getComputedStyle(el).backgroundImage||'none');
        if(kind==='overlay')el.setAttribute('data-uibms-overlay-light','');else el.setAttribute('data-uibms-table-light',kind);
        flatLights.set(el,kind);
      }
      lightTarget=next.size?target:null;
    }
    const clearTouchFocus=()=>{if(touchFocus){touchFocus.removeAttribute('data-uibms-touch-focus');touchFocus=null;}};
    const setTouchFocus=el=>{
      clearTouchFocus();
      // Text entry retains its native focus indicator. Keyboard and AT navigation retain focus.
      if(!forced.matches&&el&&enabled(el)&&interactive(el)&&el.matches('button,a[href],summary,input:is([type=button],[type=submit],[type=reset],[type=image],[type=checkbox],[type=radio]),[role=button],[role=tab],[role=switch]')){
        touchFocus=el;el.setAttribute('data-uibms-touch-focus','');
      }
    };
    function releaseTouch(){
      if(touch?.surface)animating.add(touch.surface);
      if(touch)clearFlatLights();
      touch=null;
    }
    const cancel=()=>{
      if(pressed)animating.add(pressed);
      releaseTouch();pressed=null;pointer=null;pressTarget=null;keyPress=false;point=null;
      targetHover(null);clearFlatLights();clearTouchFocus();request();
    };
    function request(){if(!frame&&!disposed)frame=requestAnimationFrame(tick);}
    function queueRefresh(){if(refreshPending||disposed)return;refreshPending=true;queueMicrotask(()=>{refreshPending=false;if(!disposed)refresh();});}
    const ro=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{for(const e of entries){let s=surfaces.get(e.target);if(s)dirty.add(s);}request();}):null;
    function wanted(el,groupTargets){
      // Internal table structure remains flat, even if material is explicitly specified on a cell.
      if(el.matches(tableParts+',picture,source,track,.tooltip[role=tooltip],.toasts,input[type=color][data-uibms-form-source]')||!inOpenOverlays(el)||el.matches(mediaElements)&&fullscreenMedia(el))return false;
      const overlay=overlayOwner(el);
      // Ordinary nested content is flat by default. Actual controls, nested
      // overlays/tables and an explicit local material opt-in remain independent.
      if(overlay&&overlay!==el&&!el.matches(activeSelector+',input,select,textarea,table,progress,meter,.toast,'+mediaElements)&&el.getAttribute('data-material')!=='liquid-silicone')return false;
      if(forced.matches||!enabled(el)||legacyMaterial(el)||backdrops.has(el)||el.closest('[data-uibms-material-layer],[data-uibms-selection-layer],[data-uibms-media-raster],[data-uibms-form-trigger],.visually-hidden,[hidden]'))return false;
      if(el.matches('html,body,script,style,template,link,meta,head,br,wbr,option,optgroup,slot,input[type=hidden]'))return false;
      const group=el.closest(groups);
      if(group&&group!==el&&groupTargets.get(group)&&el.matches('a[href],button,[role=tab],input[type=radio]'))return false;
      if(el.matches('a[href]')&&!el.hasAttribute('data-material')&&getComputedStyle(el).display==='inline')return false;
      return true;
    }
    function refresh(){
      const groupTargets=new Map();
      if(!forced.matches&&CSS.supports('clip-path','path("M 0 0 H 1 V 1 Z")'))for(const el of root.querySelectorAll(groups))if(enabled(el)&&!legacyMaterial(el)&&inOpenOverlays(el)){const a=selected(el);if(a)groupTargets.set(el,a);}
      for(const [el,s] of selections)if(!groupTargets.has(el)){s.destroy();selections.delete(el);}
      const candidates=[...(root.nodeType===1&&root.matches(selector)?[root]:[]),...root.querySelectorAll(selector)],keep=new Set();
      for(const el of candidates){
        if(!wanted(el,groupTargets))continue;
        const d=design(el);
        if(!d.surface&&!el.matches(activeSelector)&&!el.matches(replaced)&&el.getAttribute('data-material')!=='liquid-silicone')continue;
        if(!d.surface&&el.matches('hr,progress,meter,iframe,canvas,svg'))continue;
        keep.add(el);
        let s=surfaces.get(el);const native=d.complex||!d.surface;
        if(s&&s.native!==native){ro?.unobserve(el);removeSurface(s);surfaces.delete(el);animating.delete(s);dirty.delete(s);if(hover===s)hover=null;if(pressed===s)pressed=null;s=null;}
        if(!s){s=createSurface(el,d);surfaces.set(el,s);ro?.observe(el);}
        s.design=d;s.motion=motion(el);dirty.add(s);
        if(s.f!==0||s===hover||s===pressed)animating.add(s);
      }
      for(const [el,s] of surfaces)if(!keep.has(el)){
        if(touch?.surface===s||pressTarget===el||pressed===s)cancel();
        if(touchFocus===el)clearTouchFocus();
        ro?.unobserve(el);removeSurface(s);surfaces.delete(el);animating.delete(s);dirty.delete(s);if(hover===s)hover=null;if(pressed===s)pressed=null;
      }
      for(const [el,a] of groupTargets){let s=selections.get(el);if(!s){s=selection(el,config,findBackdrop);selections.set(el,s);}s.set(a);}
      if(lightTarget)setFlatLights(lightTarget,true);
      request();
    }
    function targetHover(s){
      if(hover&&hover!==s){hover.target=0;animating.add(hover);}
      hover=s;if(s)animating.add(s);
    }
    function hitSurface(target){
      for(let el=target;el;el=el.parentElement){if(surfaces.has(el))return surfaces.get(el);if(el.matches(overlays))break;}
      return null;
    }
    function hitControl(target){
      const direct=target?.closest(activeSelector);
      if(direct)return direct;
      const label=target?.closest('label');
      return label?.control?.matches(activeSelector)?label.control:null;
    }
    function locate(e){
      if(!e.isPrimary)return;
      if(e.pointerType==='touch'){
        // Do not synthesize hover after a finger has left the screen.
        if(!touch||pointer!==e.pointerId||touch.released!==null)return;
        if(!touch.el?.matches('input[type=range]')&&Math.hypot(e.clientX-touch.originX,e.clientY-touch.originY)>config.touchSlop){cancel();return;}
        touch.x=e.clientX;touch.y=e.clientY;
        if(touch.surface){setPoint(touch.surface,e.clientX,e.clientY);animating.add(touch.surface);}
        request();return;
      }
      if(touch)return;
      const target=e.target instanceof Element?e.target:null;
      // Modal backdrop events can be retargeted to the dialog itself. They
      // must not pull on the dialog or surfaces behind the modal.
      if(target&&outsideOverlay(target,e.clientX,e.clientY)){clearFlatLights();targetHover(null);point=null;request();return;}
      setFlatLights(target);
      point={x:e.clientX,y:e.clientY,el:hitControl(target)};
      if(pressed){setPoint(pressed,e.clientX,e.clientY);animating.add(pressed);}
      let best=null,bestDistance=config.range;
      if(target&&root.contains(target)){
        best=hitSurface(target);if(best)bestDistance=0;
        if(!best&&!overlayOwner(target))for(const s of surfaces.values()){
          if(!visible(s.el))continue;
          const r=s.el.getBoundingClientRect(),d=Math.hypot(Math.max(r.left-e.clientX,0,e.clientX-r.right),Math.max(r.top-e.clientY,0,e.clientY-r.bottom));
          if(d<bestDistance){best=s;bestDistance=d;}
        }
      }
      targetHover(best);
      if(best){best.target=disabled(best.el)||muted(best.el,'hover')?0:config.attraction*clamp(1-bestDistance/config.range,0,1);setPoint(best,e.clientX,e.clientY);}
      request();
    }
    function down(e){
      if(e.pointerType==='touch'&&!e.isPrimary){cancel();return;}
      if(!e.isPrimary||e.button!==0)return;
      if(pointer!==null||touch)cancel();
      pointer=e.pointerId;keyPress=false;
      const target=e.target instanceof Element?e.target:null,el=hitControl(target);
      if(target&&outsideOverlay(target,e.clientX,e.clientY)){cancel();return;}
      if(e.pointerType==='touch'){
        targetHover(null);point=null;setTouchFocus(el);setFlatLights(target);
        const group=el?.closest(groups);
        // Navigation/choice groups own a single shared selection surface.
        const surface=surfaces.get(el)||(!(group&&selections.has(group))?hitSurface(target):null);
        const own=!!el&&(surface?.el===el||!!(group&&selections.has(group)));
        if(!surface&&!own){pointer=null;clearFlatLights();return;}
        const canPress=own&&interactive(el)&&!muted(el,'active');
        // Advance the visual impulse on rendered frames. A delayed first frame must
        // not skip the attraction phase of a short, otherwise ordinary native tap.
        touch={el,surface,x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,age:0,released:null,canPress};
        if(surface){measure(surface);setPoint(surface,e.clientX,e.clientY);surface.x=surface.tx;surface.y=surface.ty;animating.add(surface);}
        request();return;
      }
      clearTouchFocus();pressTarget=el;const s=surfaces.get(el);
      if(s&&interactive(el)&&!muted(el,'active')){pressed=s;setPoint(s,e.clientX,e.clientY);animating.add(s);}
      locate(e);
    }
    function up(e){
      if(pointer!==e.pointerId)return;
      if(e.pointerType==='touch'){
        if(touch){touch.released=touch.age;if(touch.surface)animating.add(touch.surface);}
        pointer=null;pressTarget=null;pressed=null;request();return;
      }
      if(pressed)animating.add(pressed);pressed=null;pointer=null;pressTarget=null;locate(e);
    }
    function pointerCancel(e){if(pointer===e.pointerId)cancel();}
    function keydown(e){
      // Keyboard use immediately restores ordinary focus styling, even after a touch.
      clearTouchFocus();
      if(touch)cancel();
      if(![' ','Enter'].includes(e.key)||pointer!==null||e.repeat)return;
      const el=e.target;if(!interactive(el))return;
      keyPress=true;pressTarget=el;const s=surfaces.get(el);
      if(s&&!muted(s.el,'active')){pressed=s;measure(s);s.tx=s.w/2;s.ty=s.h/2;animating.add(s);}request();
    }
    function keyup(){if(!keyPress)return;keyPress=false;pressTarget=null;if(pressed)animating.add(pressed);pressed=null;request();}
    function scroll(){if(touch&&pointer!==null&&!touch.el?.matches('input[type=range]'))cancel();else request();}
    function focusout(e){if(e.target===touchFocus)clearTouchFocus();keyup();const s=surfaces.get(e.target);if(s){dirty.add(s);request();}}
    function leave(e){if(e.pointerType!=='touch'&&!e.relatedTarget)cancel();}
    function visibility(){if(document.hidden)cancel();}
    function overlayChanged(e){
      const el=e.target;if(!(el instanceof Element)||!el.matches(overlays))return;
      // A close or light-dismiss must not retain a pointer, focus marker or
      // impulse from the previous opening. Let the browser own the lifecycle.
      if(!overlayOpen(el)){
        if([hover?.el,pressed?.el,pressTarget,touch?.surface?.el,touch?.el,touchFocus,lightTarget,point?.el].some(n=>n&&el.contains(n)))cancel();
        for(const s of surfaces.values())if(el.contains(s.el)){s.f=s.v=s.target=0;animating.delete(s);dirty.add(s);}
      }
      queueRefresh();
    }
    function tick(now){
      frame=0;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
      for(const s of dirty){if(visible(s.el)){measure(s);paint(s,config,forced.matches?null:findBackdrop(s.el));}}dirty.clear();
      const instant=reduced.matches||forced.matches;
      let phase='rest',touchPoint=null;
      if(touch){
        const profile=motion(touch.el||touch.surface?.el||document.documentElement);
        const rise=profile.hover===0||muted(touch.el||touch.surface?.el||document.documentElement,'hover')?0:config.touchAttractionTime;
        phase=instant||profile.instant||(!touch.canPress&&rise===0)?'rest':touchPhase(touch.age,touch.released,touch.canPress,rise,config.touchCompressionTime);
        if(phase==='rest')releaseTouch();
        else {touch.age+=dt*1000;touchPoint={x:touch.x,y:touch.y,el:touch.el,touchPhase:phase};if(touch.surface)animating.add(touch.surface);}
      }
      for(const s of [...animating]){
        if(!s.el.isConnected||!visible(s.el)){s.releaseMedia?.();s.releaseMedia=null;s.mediaRunning=false;s.f=s.v=s.target=0;animating.delete(s);if(touch?.surface===s)releaseTouch();continue;}
        measure(s);
        const profile=s.motion||motion(s.el),stopped=instant||profile.instant;
        const touching=touch?.surface===s;
        const pull=!disabled(s.el)&&!muted(s.el,'hover'),push=interactive(s.el)&&!muted(s.el,'active');
        const desired=stopped?0:touching?(phase==='press'&&push&&touch.canPress?-config.pressure*profile.press:phase==='attract'&&pull?config.attraction*profile.hover:0):pressed===s&&push?-config.pressure*profile.press:hover===s&&pull?s.target*profile.hover:0;
        if(stopped){s.f=s.v=0;s.x=s.tx;s.y=s.ty;}
        else{[s.f,s.v]=step(s.f,s.v,desired,dt,config.stiffness*profile.speed,config.damping*profile.speed);s.f=clamp(s.f,-1.2,1.2);if((s.design.table||s.design.overlay||s.design.media)&&desired===0&&s.f<0){s.f=s.v=0;}s.x+=(s.tx-s.x)*Math.min(1,dt*22);s.y+=(s.ty-s.y)*Math.min(1,dt*22);}
        paint(s,config,forced.matches?null:findBackdrop(s.el));
        if(!s.mediaRunning&&s.f===desired&&s.v===0&&Math.abs(s.x-s.tx)<.1&&Math.abs(s.y-s.ty)<.1)animating.delete(s);
      }
      let moving=false;
      for(const [el,s] of selections){
        let current=selected(el);if(current!==s.target)s.set(current);
        moving=s.tick(dt,instant,pressTarget,touchPoint||point)||moving;
      }
      if(animating.size||moving||touch)request();else last=0;
    }
    function mediaChanged(e){const s=surfaces.get(e.target);if(s&&s.design.media&&s.f>.001){dirty.add(s);animating.add(s);request();}}
    const eventRoot=root.nodeType===9?root:root;
    const listeners=[[eventRoot,'pointerdown',down],[eventRoot,'keydown',keydown,true],[eventRoot,'keyup',keyup],[eventRoot,'focusout',focusout],[eventRoot,'toggle',overlayChanged,true],[eventRoot,'close',overlayChanged,true],[eventRoot,'load',e=>{if(e.target instanceof Element&&(overlayOwner(e.target)||e.target.matches(mediaElements)))queueRefresh();},true],[eventRoot,'loadedmetadata',queueRefresh,true],[eventRoot,'loadeddata',mediaChanged,true],[eventRoot,'play',mediaChanged,true],[eventRoot,'pause',mediaChanged,true],[eventRoot,'seeked',mediaChanged,true],[eventRoot,'ended',mediaChanged,true],[eventRoot,'fullscreenchange',queueRefresh,true],[eventRoot,'webkitfullscreenchange',queueRefresh,true],[eventRoot,'webkitbeginfullscreen',queueRefresh,true],[eventRoot,'webkitendfullscreen',queueRefresh,true],[eventRoot,'change',queueRefresh],[eventRoot,'focusin',e=>{const s=surfaces.get(e.target);if(s){dirty.add(s);request();}}],[eventRoot,'input',e=>{const s=surfaces.get(e.target);if(s){dirty.add(s);animating.add(s);request();}}],[window,'pointermove',locate],[window,'pointerup',up],[window,'pointercancel',pointerCancel],[eventRoot,'lostpointercapture',pointerCancel],[window,'pointerout',leave],[window,'blur',cancel],[document,'visibilitychange',visibility],[window,'resize',()=>{for(const s of surfaces.values())dirty.add(s);request();}],[window,'scroll',scroll,true]];
    listeners.forEach(([o,k,f,c])=>o.addEventListener(k,f,c||false));
    const observer=new MutationObserver(records=>{
      if(records.some(r=>!r.target.closest?.('[data-uibms-material-layer],[data-uibms-selection-layer],[data-uibms-media-raster]')&&(r.type==='attributes'||(r.type==='characterData'&&!!overlayOwner(r.target.parentElement))||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.matches('[data-uibms-material-layer],[data-uibms-selection-layer],[data-uibms-media-raster]')||n.nodeType===3&&!!overlayOwner(r.target)))))queueRefresh();
    });
    observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:[...profileKeys.map(k=>'data-'+k),'data-effect','data-hover','data-active','data-focus','data-scroll','aria-current','aria-pressed','aria-selected','disabled','aria-disabled','readonly','hidden','open','popover','inert','class','controls','src','srcset','sizes']});
    const preference=()=>{if(reduced.matches||forced.matches)cancel();refresh();for(const s of surfaces.values())animating.add(s);request();};
    reduced.addEventListener?.('change',preference);forced.addEventListener?.('change',preference);scheme.addEventListener?.('change',preference);
    function unregisterBackdrop(el){const b=backdrops.get(el);if(!b)return;b.cancelled=true;el.style.backgroundImage=b.oldImage;el.style.backgroundSize=b.oldSize;el.style.backgroundPosition=b.oldPosition;el.style.backgroundRepeat=b.oldRepeat;backdrops.delete(el);for(const s of surfaces.values())dirty.add(s);refresh();}
    async function registerBackdrop(el,src){
      if(!(el instanceof Element)||!root.contains(el))throw new TypeError('Backdrop must belong to the mounted root.');
      unregisterBackdrop(el);const url=new URL(src,document.baseURI);if(!['https:','http:','data:','blob:'].includes(url.protocol))throw new TypeError('Unsupported image URL.');
      const b={el,canvas:document.createElement('canvas'),rev:0,oldImage:el.style.backgroundImage,oldSize:el.style.backgroundSize,oldPosition:el.style.backgroundPosition,oldRepeat:el.style.backgroundRepeat};backdrops.set(el,b);
      const image=new Image();if(url.origin!==location.origin&&url.protocol.startsWith('http'))image.crossOrigin='anonymous';image.src=url.href;
      try{await image.decode();if(b.cancelled||disposed)return false;b.image=image;el.style.backgroundImage='url('+JSON.stringify(url.href)+')';el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.style.backgroundRepeat='no-repeat';if(!imagePixels(b))throw Error('Image pixels unavailable');for(const s of surfaces.values())dirty.add(s);refresh();return true;}catch{unregisterBackdrop(el);return false;}
    }
    const api={refresh,registerBackdrop,unregisterBackdrop,destroy(){disposed=true;clearTouchFocus();releaseTouch();clearFlatLights();for(const b of backdrops.values()){b.cancelled=true;b.el.style.backgroundImage=b.oldImage;b.el.style.backgroundSize=b.oldSize;b.el.style.backgroundPosition=b.oldPosition;b.el.style.backgroundRepeat=b.oldRepeat;}backdrops.clear();cancelAnimationFrame(frame);observer.disconnect();ro?.disconnect();listeners.forEach(([o,k,f,c])=>o.removeEventListener(k,f,c||false));reduced.removeEventListener?.('change',preference);forced.removeEventListener?.('change',preference);scheme.removeEventListener?.('change',preference);for(const s of selections.values())s.destroy();for(const s of surfaces.values())removeSurface(s);config.mediaDeformer?.destroy();instances.delete(root);}};
    instances.set(root,api);refresh();return api;
  }
  return {mountMaterial,contour,step,defaults,motionProfile,shadowFilter,touchPhase,overlayPath,mediaFrame};
})();
export const {mountMaterial,contour,step,defaults,motionProfile,shadowFilter,touchPhase,overlayPath,mediaFrame}=engine;
