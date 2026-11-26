// UIBMS optional elastic media renderer. MIT.
// Native WebGL first; Canvas 2D uses exactly the same mesh. No external libraries.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function meshPoint(u,v,w,h,x,y,f,amount,radius,skew=6){
  const px=u*w,py=v*h,rx=(x-px)/radius,ry=(y-py)/radius;
  const g=Math.exp(-.5*(rx*rx+ry*ry)),a=clamp(f,0,1.2)*amount;
  return [px+a*((u*2-1)*(.08+.92*g)+.18*g*rx)-clamp(f,0,1.2)*skew*g*clamp(x/w*2-1,-1,1)*(v*2-1),
          py+a*((v*2-1)*(.08+.92*g)+.18*g*ry)];
}
function grid(nx,ny){
  const vertices=[],indices=[];
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)vertices.push(i/nx,j/ny);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,b,c,b,d,c);}
  return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices),nx,ny};
}
function geometry(w,h,x,y,f,options){
  const small=Math.min(w,h),amount=clamp(Number(options.mediaMaximum)||0,0,small*.17),skew=clamp(Number(options.mediaSkew)||0,0,small*.08);
  const radius=clamp(Number(options.mediaRadius)||small*.55,18,120);
  const pad=Math.ceil(1.2*(amount*1.22+skew)+2);
  return {w,h,x:clamp(x,-12,w+12),y:clamp(y,-12,h+12),f:clamp(f,0,1.2),amount,radius,skew,pad};
}
export function objectRectangle(w,h,sw,sh,fit,position){
  if(!(w>0&&h>0&&sw>0&&sh>0))return null;
  let dw=w,dh=h;
  if(fit!=='fill'){
    let z=fit==='cover'?Math.max(w/sw,h/sh):fit==='none'?1:Math.min(w/sw,h/sh);
    if(fit==='scale-down')z=Math.min(1,z);
    dw=sw*z;dh=sh*z;
  }
  const parts=String(position||'50% 50%').trim().split(/\s+/);
  const offset=(part,space)=>{
    if(part==='left'||part==='top')return 0;
    if(part==='right'||part==='bottom')return space;
    if(part==='center')return space/2;
    if(/^-?[\d.]+%$/.test(part))return parseFloat(part)*space/100;
    if(/^-?[\d.]+px$/.test(part))return parseFloat(part);
    return NaN;
  };
  if(parts.length!==2)return null;
  const dx=offset(parts[0],w-dw),dy=offset(parts[1],h-dh);
  return Number.isFinite(dx)&&Number.isFinite(dy)?{x:dx,y:dy,w:dw,h:dh}:null;
}
const vertexSource='attribute vec2 uv;uniform vec2 size,point,view,offset;uniform vec4 physics;varying vec2 tex;void main(){vec2 p=uv*size,q=(point-p)/physics.z;float g=exp(-.5*dot(q,q));vec2 e=uv*2.0-1.0;vec2 d=physics.x*physics.y*(e*(.08+.92*g)+.18*g*q);d.x-=physics.x*physics.w*g*clamp(point.x/size.x*2.0-1.0,-1.0,1.0)*e.y;vec2 s=(p+d+offset)/view;gl_Position=vec4(s.x*2.0-1.0,1.0-s.y*2.0,0,1);tex=uv;}';
const fragmentSource='precision mediump float;varying vec2 tex;uniform sampler2D image;void main(){gl_FragColor=texture2D(image,tex);}';
function gpuRenderer(doc){
  const canvas=doc.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});
  if(!gl)throw Error('WebGL unavailable');
  function shader(type,source){
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(error);}
    return s;
  }
  const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertexSource),fs=shader(gl.FRAGMENT_SHADER,fragmentSource);
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer=gl.createBuffer(),indices=gl.createBuffer(),texture=gl.createTexture();
  const uv=gl.getAttribLocation(program,'uv'),u=Object.fromEntries(['size','point','view','offset','physics'].map(k=>[k,gl.getUniformLocation(program,k)]));
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  gl.uniform1i(gl.getUniformLocation(program,'image'),0);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  let lastGrid=null,lastTexture=null,lastRevision=-1;
  return {
    draw(rec,g,mesh,view){
      if(gl.isContextLost())throw Error('WebGL context lost');
      if(canvas.width!==rec.canvas.width||canvas.height!==rec.canvas.height){canvas.width=rec.canvas.width;canvas.height=rec.canvas.height;}
      gl.viewport(0,0,canvas.width,canvas.height);
      if(lastGrid!==mesh){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);lastGrid=mesh;}
      if(lastTexture!==rec.texture||lastRevision!==rec.revision){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,rec.texture);if(gl.getError()!==gl.NO_ERROR)throw Error('Texture upload failed');lastTexture=rec.texture;lastRevision=rec.revision;}
      gl.uniform2f(u.size,g.w,g.h);gl.uniform2f(u.point,g.x,g.y);gl.uniform2f(u.view,view.w,view.h);gl.uniform2f(u.offset,view.l,view.t);
      gl.uniform4f(u.physics,g.f,g.amount,g.radius,g.skew);
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawElements(gl.TRIANGLES,mesh.indices.length,gl.UNSIGNED_SHORT,0);
      if(gl.getError()!==gl.NO_ERROR||gl.isContextLost())throw Error('WebGL draw failed');
      // Copy the composited GPU surface to the per-element canvas synchronously.
      // One GPU context is shared across the active media within a mounted root.
      rec.ctx.setTransform(1,0,0,1,0,0);rec.ctx.clearRect(0,0,rec.canvas.width,rec.canvas.height);rec.ctx.drawImage(canvas,0,0);
    },
    destroy(){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteBuffer(indices);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
  };
}
function cpuRenderer(rec,g,mesh,view){
  const c=rec.ctx,sx=rec.canvas.width/view.w,sy=rec.canvas.height/view.h,v=mesh.vertices,idx=mesh.indices,p=[];
  for(let i=0;i<v.length;i+=2){const xy=meshPoint(v[i],v[i+1],g.w,g.h,g.x,g.y,g.f,g.amount,g.radius,g.skew);p.push([xy[0]+view.l,xy[1]+view.t]);}
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,rec.canvas.width,rec.canvas.height);
  // Clip the outside silhouette once, then overlap interior triangle clips
  // slightly to eliminate the antialiasing seams of independent triangles.
  const edge=[];for(let i=0;i<=mesh.nx;i++)edge.push(i);
  for(let j=1;j<=mesh.ny;j++)edge.push(j*(mesh.nx+1)+mesh.nx);
  for(let i=mesh.nx-1;i>=0;i--)edge.push(mesh.ny*(mesh.nx+1)+i);
  for(let j=mesh.ny-1;j>0;j--)edge.push(j*(mesh.nx+1));
  c.save();c.setTransform(sx,0,0,sy,0,0);c.beginPath();
  for(const [i,k] of edge.entries()){const q=p[k];i?c.lineTo(...q):c.moveTo(...q);}c.closePath();c.clip();
  for(let i=0;i<idx.length;i+=3){
    const ai=idx[i],bi=idx[i+1],ci=idx[i+2],a=p[ai],b=p[bi],d=p[ci];
    const ax=v[ai*2]*g.w,ay=v[ai*2+1]*g.h,bx=v[bi*2]*g.w,by=v[bi*2+1]*g.h,cx=v[ci*2]*g.w,cy=v[ci*2+1]*g.h;
    const ux=bx-ax,uy=by-ay,vx=cx-ax,vy=cy-ay,det=ux*vy-uy*vx;
    const dx=b[0]-a[0],dy=b[1]-a[1],ex=d[0]-a[0],ey=d[1]-a[1];
    const A=(dx*vy-ex*uy)/det,B=(dy*vy-ey*uy)/det,C=(ex*ux-dx*vx)/det,D=(ey*ux-dy*vx)/det;
    const mx=(a[0]+b[0]+d[0])/3,my=(a[1]+b[1]+d[1])/3;
    c.save();c.beginPath();for(const [j,q] of [a,b,d].entries()){const len=Math.hypot(q[0]-mx,q[1]-my)||1,overlap=.6/Math.min(sx,sy),x=q[0]+overlap*(q[0]-mx)/len,y=q[1]+overlap*(q[1]-my)/len;j?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.clip();
    // Copy prevents transparent pixels being composited twice at a seam.
    c.globalCompositeOperation='copy';c.transform(A,B,C,D,a[0]-A*ax-C*ay,a[1]-B*ax-D*ay);c.drawImage(rec.texture,0,0,g.w,g.h);c.restore();
  }
  c.restore();
}
function round(c,x,y,w,h,r){
  c.beginPath();c.roundRect(x,y,Math.max(0,w),Math.max(0,h),clamp(r,0,Math.max(0,Math.min(w,h)/2)));
}
function texture(rec,s,d,cs){
  const el=s.el,w=s.w,h=s.h,sw=el.naturalWidth||el.videoWidth,sh=el.naturalHeight||el.videoHeight;
  if(!sw||!sh||el.matches('video')&&el.readyState<2)return false;
  const b=d.border.style==='none'||d.border.style==='hidden'?0:d.border.width;
  const px=k=>parseFloat(cs[k])||0,pl=px('paddingLeft'),pr=px('paddingRight'),pt=px('paddingTop'),pb=px('paddingBottom');
  const fit=objectRectangle(w-b*2-pl-pr,h-b*2-pt-pb,sw,sh,cs.objectFit,cs.objectPosition);
  if(!fit)return false;
  const scale=Math.min(2,el.ownerDocument.defaultView.devicePixelRatio||1,1440/Math.max(w,h));
  const tw=Math.max(1,Math.round(w*scale)),th=Math.max(1,Math.round(h*scale));
  const key=JSON.stringify([el.currentSrc||el.src,el.matches('video')?el.currentTime:0,w,h,tw,th,s.r,b,d.border.color,d.background,fit,pl,pr,pt,pb]);
  if(rec.textureKey===key)return true;
  // Reset an origin-tainted texture when the source changes.
  if(rec.texture.width!==tw||rec.texture.height!==th||rec.source!==el.currentSrc){rec.texture.width=tw;rec.texture.height=th;rec.source=el.currentSrc;}
  const c=rec.texture.getContext('2d');if(!c)return false;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,tw,th);c.setTransform(tw/w,0,0,th/h,0,0);
  c.save();round(c,0,0,w,h,s.r);c.clip();
  c.fillStyle=d.background;c.fillRect(0,0,w,h);
  c.save();c.beginPath();c.rect(b+pl,b+pt,w-b*2-pl-pr,h-b*2-pt-pb);c.clip();
  c.drawImage(el,b+pl+fit.x,b+pt+fit.y,fit.w,fit.h);c.restore();
  if(b>0){round(c,b/2,b/2,w-b,h-b,Math.max(0,s.r-b/2));c.strokeStyle=d.border.color;c.lineWidth=b;c.stroke();}
  c.restore();rec.textureKey=key;rec.revision++;
  return true;
}
function eligible(el,s,d,cs,alreadyRendered){
  // Never conceal browser-owned video controls. The application can use an
  // ordinary video without controls plus separately accessible HTML controls.
  if(!el.matches('img,video:not([controls])')||!d.mediaContour||s.w<2||s.h<2||d.image!=='none'||!['solid','none','hidden'].includes(d.border.style))return false;
  if(el.matches('video')&&el.textTracks&&Array.from(el.textTracks).some(t=>t.mode==='showing'))return false;
  if(cs.visibility!=='visible'||cs.filter!=='none'||cs.transform!=='none'||(!alreadyRendered&&cs.opacity!=='1')||cs.writingMode!=='horizontal-tb'||cs.maskImage&&cs.maskImage!=='none')return false;
  if(el.closest('a[href]')?.matches(':focus-visible'))return false;
  // A non-translational ancestor transform can change the canvas coordinate
  // system. Preserve native rendering rather than guessing that mapping.
  for(let p=el.parentElement;p;p=p.parentElement){const z=getComputedStyle(p);if(z.transform!=='none'||z.perspective!=='none'||z.clipPath!=='none')return false;}
  return true;
}
export function createMediaDeformer(options={}){
  const records=new Map(),meshes=new Map();let gpu=null,gpuUnavailable=false;
  function release(el){
    const r=records.get(el);if(!r)return;
    el.removeAttribute('data-uibms-media-rendered');r.canvas.remove();r.texture.width=r.texture.height=1;
    records.delete(el);
  }
  function paint(s,d){
    const el=s.el,doc=el.ownerDocument,cs=getComputedStyle(el);
    // Source opacity is suppressed by the private marker only while a successful
    // raster is visible. Do not toggle it during each rendered frame.
    const was=el.getAttribute('data-uibms-media-rendered');
    if(!eligible(el,s,d,cs,!!was)){release(el);return false;}
    const rect=el.getBoundingClientRect(),vw=doc.documentElement.clientWidth;
    if(Math.abs(rect.width-s.w)>1||Math.abs(rect.height-s.h)>1||rect.left<-.5||rect.right>vw+.5){release(el);return false;}
    const g=geometry(s.w,s.h,s.x,s.y,s.f,options);
    if(g.amount===0){release(el);return false;}
    let rec=records.get(el);
    try{
      const anchor=el.parentElement?.matches('picture')?el.parentElement:el;
      if(!anchor.parentElement)throw Error('No media host');
      if(!rec){
        const canvas=doc.createElement('canvas');canvas.setAttribute('data-uibms-media-raster','');canvas.setAttribute('aria-hidden','true');
        const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
        rec={canvas,ctx,texture:doc.createElement('canvas'),revision:0};records.set(el,rec);anchor.after(canvas);
      }else if(rec.canvas.parentElement!==anchor.parentElement)anchor.after(rec.canvas);
      const l=Math.min(g.pad,Math.max(0,rect.left)),right=Math.min(g.pad,Math.max(0,vw-rect.right));
      const t=Math.min(g.pad,Math.max(0,rect.top+doc.defaultView.scrollY));
      const bottom=Math.min(g.pad,Math.max(0,doc.documentElement.scrollHeight-(rect.bottom+doc.defaultView.scrollY)));
      const view={l,t,w:s.w+l+right,h:s.h+t+bottom};
      const style=rec.canvas.style;
      for(const [k,v] of Object.entries({width:view.w+'px',height:view.h+'px','inline-size':view.w+'px','block-size':view.h+'px',filter:d.filter||'none'}))if(style.getPropertyValue(k)!==v)style.setProperty(k,v,'important');
      if(!style.left){style.setProperty('left','0px','important');style.setProperty('top','0px','important');}
      const origin=rec.canvas.getBoundingClientRect();
      if(Math.abs(origin.width-view.w)>1||Math.abs(origin.height-view.h)>1)throw Error('Unexpected canvas geometry');
      const dx=rect.left-view.l-origin.left,dy=rect.top-view.t-origin.top;
      if(Math.abs(dx)>.1)style.setProperty('left',(parseFloat(style.left)+dx)+'px','important');
      if(Math.abs(dy)>.1)style.setProperty('top',(parseFloat(style.top)+dy)+'px','important');
      const actual=rec.canvas.getBoundingClientRect();
      if(Math.abs(actual.left-(rect.left-view.l))>1||Math.abs(actual.top-(rect.top-view.t))>1)throw Error('Unexpected canvas placement');
      const scale=Math.min(2,doc.defaultView.devicePixelRatio||1,1440/Math.max(view.w,view.h));
      const cw=Math.max(1,Math.round(view.w*scale)),ch=Math.max(1,Math.round(view.h*scale));
      if(rec.canvas.width!==cw||rec.canvas.height!==ch){rec.canvas.width=cw;rec.canvas.height=ch;}
      if(!texture(rec,s,d,cs))throw Error('Media frame unavailable');
      const nx=clamp(Math.ceil(s.w/24),8,32),ny=clamp(Math.ceil(s.h/24),6,24),key=nx+'x'+ny;
      if(!meshes.has(key))meshes.set(key,grid(nx,ny));
      const mesh=meshes.get(key);let name='canvas2d';
      if(options.mediaRenderer!=='canvas2d'&&!gpuUnavailable&&rec.gpuBlocked!==rec.source){
        if(!gpu){try{gpu=gpuRenderer(doc);}catch{gpuUnavailable=true;}}
        if(gpu){try{gpu.draw(rec,g,mesh,view);name='webgl';}catch{rec.gpuBlocked=rec.source;}}
      }
      if(name==='canvas2d')cpuRenderer(rec,g,mesh,view);
      if(was!==name)el.setAttribute('data-uibms-media-rendered',name);return true;
    }catch{release(el);return false;}
  }
  return {paint,release,destroy(){for(const el of records.keys())release(el);gpu?.destroy();gpu=null;meshes.clear();}};
}
