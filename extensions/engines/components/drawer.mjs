// Optional fallback for native dialog command invokers. No modal emulation.
const instances=new WeakMap();
export function mountDrawers(root=document){
  if(instances.has(root))return instances.get(root);
  const doc=root.ownerDocument||root;
  const sample=doc.createElement('button'),nativeCommands='commandForElement' in sample&&'command' in sample;
  function click(event){
    const button=event.target.closest?.('button[commandfor][command="show-modal"]');
    if(!button||button.disabled||button.matches('[aria-disabled="true"]')||event.defaultPrevented)return;
    // Let browsers that implement this exact native command do the work.
    if(nativeCommands)return;
    const drawer=doc.getElementById(button.getAttribute('commandfor'));
    if(!drawer?.matches('dialog.drawer')||!root.contains(drawer)||typeof drawer.showModal!=='function')return;
    event.preventDefault();
    if(!drawer.open)drawer.showModal();
  }
  // Older native dialogs may not implement closedby=any. Honor the
  // explicit opt-in only, and require both pointer events on the backdrop.
  const nativeLightDismiss='closedBy' in doc.createElement('dialog');
  let pressed=null;
  const backdrop=e=>{const d=e.target;if(!d?.matches?.('dialog.drawer[open][closedby="any"]'))return null;const r=d.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom?d:null;};
  const down=e=>{pressed=backdrop(e);};
  const up=e=>{const target=backdrop(e);if(target&&pressed===target)target.close();pressed=null;};
  if(!nativeCommands)root.addEventListener('click',click);
  if(!nativeLightDismiss){root.addEventListener('pointerdown',down);root.addEventListener('pointerup',up);}
  const api={destroy(){if(!nativeCommands)root.removeEventListener('click',click);if(!nativeLightDismiss){root.removeEventListener('pointerdown',down);root.removeEventListener('pointerup',up);}instances.delete(root);}};
  instances.set(root,api);return api;
}
