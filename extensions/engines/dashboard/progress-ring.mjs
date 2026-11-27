// Optional decorative ring driven by the native progress element.
const NS='http://www.w3.org/2000/svg',instances=new WeakMap();
export function progressRatio(value,max){
  if(!Number.isFinite(value)||!Number.isFinite(max)||max<=0)return null;
  return Math.max(0,Math.min(1,value/max));
}
export function mountProgressRing(root,{format}={}){
  if(instances.has(root))return instances.get(root);
  const progress=root?.querySelector(':scope > progress');
  if(!root?.matches('.progress-ring')||!progress)throw new TypeError('Expected a .progress-ring with native progress');
  const doc=root.ownerDocument,win=doc.defaultView;
  const formatter=format||new Intl.NumberFormat(doc.documentElement.lang||undefined,{style:'percent',maximumFractionDigits:0}).format;
  const originallyHidden=progress.classList.contains('visually-hidden');
  const node=(name,attrs={})=>{const el=doc.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
  const face=doc.createElement('span');face.className='progress-ring-face';face.setAttribute('aria-hidden','true');face.hidden=true;
  const svg=node('svg',{viewBox:'0 0 100 100',focusable:'false'});
  const circle=(cls)=>node('circle',{class:cls,cx:50,cy:50,r:42,pathLength:100});
  const track=circle('progress-ring-track'),fill=circle('progress-ring-fill');
  fill.setAttribute('transform','rotate(-90 50 50)');
  const label=doc.createElement('span');label.className='progress-ring-value';
  svg.append(track,fill);face.append(svg,label);progress.after(face);
  let dead=false;
  function refresh(){
    if(dead)return;
    const ratio=progress.position<0?null:progressRatio(progress.value,progress.max);
    if(ratio===null){face.hidden=true;if(!originallyHidden)progress.classList.remove('visually-hidden');return;}
    fill.setAttribute('stroke-dasharray',String(ratio*100)+' 100');
    fill.setAttribute('visibility',ratio===0?'hidden':'visible');
    label.textContent=String(formatter(ratio));progress.classList.add('visually-hidden');face.hidden=false;
  }
  const observer=new win.MutationObserver(refresh);observer.observe(progress,{attributes:true,attributeFilter:['value','max']});
  const api={refresh,destroy(){
    if(dead)return;dead=true;observer.disconnect();face.remove();
    if(!originallyHidden)progress.classList.remove('visually-hidden');instances.delete(root);
  }};
  try{refresh();}catch(e){api.destroy();throw e;}
  instances.set(root,api);return api;
}
