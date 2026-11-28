// Optional browser enhancements; native controls remain authoritative.
const optIn='[data-material="liquid-silicone"]';

// A supported browser needs neither a drawer controller nor its network request.
export function loadDrawerFallback(load,root=document){
  if(!root.querySelector('dialog.drawer'))return;
  const doc=root.ownerDocument||root,button=doc.createElement('button');
  if('commandForElement' in button&&'command' in button&&'closedBy' in doc.createElement('dialog'))return;
  return load().then(({mountDrawers})=>mountDrawers(root));
}

// All previews remain ordinary, rendered HTML. Only costly optical decoration
// is windowed on long aggregate pages; the native controls and form adapters
// remain available, including to keyboard and assistive-technology users.
function previewWindow(root,onChange){
  const previews=[...root.querySelectorAll('[data-site-preview]')],main=root.getElementById('site-main');
  const near=new Set(),previewFor=el=>el?.closest?.('[data-site-preview]');
  const openOverlay=el=>el.closest('dialog[open],[data-uibms-form-popup]')||
    (CSS.supports('selector(:popover-open)')&&el.closest(':popover-open'));
  let frame=0,focused=null;
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;onChange();});};
  // One viewport of overscan permits smooth scrolling, without decorating the
  // hundreds of offscreen surfaces or the collapsed source listings.
  if(typeof IntersectionObserver==='function'){
    const observer=new IntersectionObserver(entries=>{
      let changed=false;
      for(const entry of entries){
        const had=near.has(entry.target);
        if(had===entry.isIntersecting)continue;
        if(entry.isIntersecting)near.add(entry.target);else near.delete(entry.target);
        changed=true;
      }
      if(changed)schedule();
    },{rootMargin:'100% 0px'});
    previews.forEach(preview=>observer.observe(preview));
  }else{
    // Geometry fallback for older browsers: batch reads before refreshing.
    let pending=false;
    const measure=()=>{
      pending=false;
      const margin=innerHeight,next=new Set(previews.filter(preview=>{
        const rect=preview.getBoundingClientRect();
        return rect.bottom>=-margin&&rect.top<=innerHeight+margin;
      }));
      if(next.size!==near.size||[...next].some(preview=>!near.has(preview))){
        near.clear();for(const preview of next)near.add(preview);schedule();
      }
    };
    const request=()=>{if(!pending){pending=true;requestAnimationFrame(measure);}};
    addEventListener('scroll',request,{passive:true,capture:true});
    addEventListener('resize',request,{passive:true});request();
  }
  root.addEventListener('focusin',event=>{
    const next=previewFor(event.target);
    if(next===focused)return;
    const previous=focused;focused=next;
    if((previous&&!near.has(previous))||(next&&!near.has(next)))schedule();
  });
  root.addEventListener('focusout',()=>{
    queueMicrotask(()=>{
      const next=previewFor(root.activeElement);
      if(next===focused)return;
      const previous=focused;focused=next;
      if((previous&&!near.has(previous))||(next&&!near.has(next)))schedule();
    });
  });
  return el=>{
    // Open top-layer controls must not be excluded by their original location.
    if(openOverlay(el))return true;
    const preview=previewFor(el);
    if(preview)return near.has(preview)||preview===focused||preview.contains(root.activeElement);
    // Keep site chrome enhanced. Reference headings and source code stay CSS-only.
    return !main?.contains(el);
  };
}

export function loadAppearanceEngines({loadMaterial,loadForms,loadMedia,filter,onMaterial,deferPreviews=false}){
  let loading;
  const report=error=>console.error('Could not load optional appearance engines',error);
  function start(){
    if(loading||!document.querySelector(optIn))return loading;
    loading=Promise.resolve().then(()=>Promise.all([loadMaterial(),loadForms()])).then(([{mountMaterial},{mountForms}])=>{
      // Once imports succeed, the engines own their own lifecycle. Do not
      // retry a partially mounted engine or application callback.
      observer.disconnect();
      let material;
      if(deferPreviews){
        const visible=previewWindow(document,()=>material?.refresh());
        // Wrap eligible native inputs first; avoid measuring a second time as
        // their optical controls are inserted during initial material setup.
        mountForms(document,{filter});
        material=mountMaterial(document,{mediaLoader:loadMedia,filter:visible});
      }else{
        material=mountMaterial(document,{mediaLoader:loadMedia});
        mountForms(document,{filter});
      }
      onMaterial?.(material);
    },error=>{
      loading=undefined;
      throw error;
    });
    return loading;
  }
  const observer=new MutationObserver(records=>{
    if(loading)return;
    if(records.some(record=>record.type==='attributes'?record.target.matches(optIn):[...record.addedNodes].some(node=>
      node.nodeType===1&&(node.matches(optIn)||node.querySelector(optIn)))))
      start()?.catch(report);
  });
  observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['data-material'],childList:true});
  // Optional appearance failures must not block native/application controls.
  return start()?.catch(report);
}
