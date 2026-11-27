// Keep native HTML interactive while optional material code loads.
const optIn='[data-material="liquid-silicone"]';

export function loadAppearanceEngines({loadMaterial,loadForms,loadMedia,filter,onMaterial}){
  let loading;
  function start(){
    if(loading)return loading;
    if(!document.querySelector(optIn))return;
    loading=Promise.all([loadMaterial(),loadForms()]).then(([{mountMaterial},{mountForms}])=>{
      const material=mountMaterial(document,{mediaLoader:loadMedia});
      mountForms(document,{filter});
      observer.disconnect();
      onMaterial?.(material);
    },error=>{
      loading=undefined;
      throw error;
    });
    return loading;
  }
  const observer=new MutationObserver(records=>{
    if(records.some(record=>record.type==='attributes'||[...record.addedNodes].some(node=>
      node.nodeType===1&&(node.matches(optIn)||node.querySelector(optIn)))))
      start()?.catch(error=>console.error('Could not load optional appearance engines',error));
  });
  observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['data-material'],childList:true});
  return start();
}
