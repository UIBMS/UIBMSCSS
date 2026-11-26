// Optional removal helper. Checkboxes and forms remain entirely native.
const instances=new WeakMap();
export function mountChips(container){
  if(instances.has(container))return instances.get(container);
  if(!container?.matches('.chips'))throw new TypeError('Expected a .chips container');
  const doc=container.ownerDocument;
  const previousTab=container.getAttribute('tabindex');if(previousTab===null)container.tabIndex=-1;
  const buttons=()=>[...container.querySelectorAll(':scope > .chip > button[name="remove-chip"]:not(:disabled,[aria-disabled="true"])')];
  function remove(button){
    if(!buttons().includes(button))return false;
    const chip=button.parentElement,detail={chip,value:button.value};
    if(!chip.dispatchEvent(new CustomEvent('beforechipremove',{bubbles:true,cancelable:true,detail})))return false;
    const all=buttons(),index=all.indexOf(button),focus=chip.contains(doc.activeElement);
    const target=all[index+1]||all[index-1]||container;
    chip.remove();
    if(focus&&doc.activeElement===doc.body)target.focus({preventScroll:true});
    container.dispatchEvent(new CustomEvent('chipremove',{bubbles:true,detail}));return true;
  }
  const click=e=>{const b=e.target.closest?.('button[name="remove-chip"]');if(b&&b.parentElement?.parentElement===container){e.preventDefault();remove(b);}};
  container.addEventListener('click',click);
  const api={remove,destroy(){container.removeEventListener('click',click);if(previousTab===null)container.removeAttribute('tabindex');else container.setAttribute('tabindex',previousTab);instances.delete(container);}};
  instances.set(container,api);return api;
}
