// Optional data-to-SVG adapter. No theme, currency or business assumptions.
const NS='http://www.w3.org/2000/svg',instances=new WeakMap();
export function sparklinePoints(values,{width=100,height=40,padding=4}={}){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new RangeError('Invalid chart dimensions');
  if(!Number.isFinite(padding)||padding<0||padding*2>=Math.min(width,height))throw new RangeError('Invalid chart padding');
  const series=Array.from(values);
  if(series.some(v=>typeof v!=='number'||!Number.isFinite(v)))throw new TypeError('Expected finite numeric values');
  if(!series.length)return [];
  // Normalize before subtraction so even opposite large finite values cannot overflow.
  const scale=series.reduce((m,v)=>Math.max(m,Math.abs(v)),0)||1;
  const normalized=series.map(v=>v/scale);
  let lo=Infinity,hi=-Infinity;for(const v of normalized){lo=Math.min(lo,v);hi=Math.max(hi,v);}
  return normalized.map((v,i)=>[
    series.length===1?width/2:padding+i*(width-2*padding)/(series.length-1),
    hi===lo?height/2:height-padding-(v-lo)/(hi-lo)*(height-2*padding)
  ]);
}
export function mountSparkline(figure){
  if(instances.has(figure))return instances.get(figure);
  const plot=figure?.querySelector(':scope > svg.sparkline-plot')??figure?.querySelector(':scope > svg');
  if(!figure?.matches('figure.sparkline')||!plot||plot.children.length)throw new TypeError('Expected a sparkline figure with an empty SVG');
  const doc=figure.ownerDocument;
  const viewBox=plot.getAttribute('viewBox'),original=plot.getAttribute('aria-hidden');
  let dead=false;
  function draw(values){
    if(dead)return;
    const points=sparklinePoints(values);
    const nodes=[];
    if(points.length===1){
      const dot=doc.createElementNS(NS,'circle');dot.setAttribute('cx',points[0][0]);dot.setAttribute('cy',points[0][1]);dot.setAttribute('r','2');nodes.push(dot);
    }else if(points.length>1){
      const line=doc.createElementNS(NS,'polyline');line.setAttribute('points',points.map(p=>p.map(v=>Number(v.toFixed(4))).join(',')).join(' '));nodes.push(line);
    }
    plot.setAttribute('viewBox','0 0 100 40');plot.setAttribute('preserveAspectRatio','none');plot.replaceChildren(...nodes);
  }
  function refresh(){
    const legacy=[...figure.querySelectorAll('.sparkline-values data[value]')].filter(el=>el.closest('figure.sparkline')===figure);
    const data=legacy.length?legacy:[...figure.querySelectorAll(':scope > details > ol > li > data[value]')];
    draw(data.map(el=>{const v=el.getAttribute('value').trim();return v?Number(v):NaN;}));
  }
  plot.setAttribute('aria-hidden','true');
  const aspect=plot.getAttribute('preserveAspectRatio');
  const api={refresh,destroy(){
    if(dead)return;dead=true;plot.replaceChildren();
    for(const [k,v] of [['viewBox',viewBox],['aria-hidden',original],['preserveAspectRatio',aspect]])if(v===null)plot.removeAttribute(k);else plot.setAttribute(k,v);
    instances.delete(figure);
  }};
  try{refresh();}catch(e){api.destroy();throw e;}
  instances.set(figure,api);return api;
}
