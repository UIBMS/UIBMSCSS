// Optional fallback for native dialog command invokers. No modal emulation.
const instances=new WeakMap();
export function mountDrawers(root=document){
  if(instances.has(root))return instances.get(root);
  const doc=root.ownerDocument||root;
  function click(event){
    const button=event.target.closest?.('button[commandfor][command="show-modal"]');
    if(!button||button.disabled||button.matches('[aria-disabled="true"]')||event.defaultPrevented)return;
    // Let browsers that implement this exact native command do the work.
    if('commandForElement' in button&&'command' in button)return;
    const drawer=doc.getElementById(button.getAttribute('commandfor'));
    if(!drawer?.matches('dialog.drawer')||!root.contains(drawer)||typeof drawer.showModal!=='function')return;
    event.preventDefault();
    if(!drawer.open)drawer.showModal();
  }
  root.addEventListener('click',click);
  const api={destroy(){root.removeEventListener('click',click);instances.delete(root);}};
  instances.set(root,api);return api;
}
