// Optional browser enhancements; native controls remain authoritative.
const optIn='[data-material="liquid-silicone"]';

// A supported browser needs neither a drawer controller nor its network request.
export function loadDrawerFallback(load,root=document){
  if(!root.querySelector('dialog.drawer'))return;
  const doc=root.ownerDocument||root,button=doc.createElement('button');
  if('commandForElement' in button&&'command' in button&&'closedBy' in doc.createElement('dialog'))return;
  return load().then(({mountDrawers})=>mountDrawers(root));
}

export function loadAppearanceEngines({loadMaterial,loadForms,loadMedia,filter,onMaterial}){
  let loading;
  const report=error=>console.error('Could not load optional appearance engines',error);
  function start(){
    if(loading||!document.querySelector(optIn))return loading;
    loading=Promise.resolve().then(()=>Promise.all([loadMaterial(),loadForms()])).then(([{mountMaterial},{mountForms}])=>{
      // Once imports succeed, the engines own their own lifecycle. Do not
      // retry a partially mounted engine or application callback.
      observer.disconnect();
      const material=mountMaterial(document,{mediaLoader:loadMedia});
      mountForms(document,{filter});
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
