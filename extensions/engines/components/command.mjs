// Search and execute real HTML actions within a native dialog.
const instances=new WeakMap();
export function commandMatches(text,query){
  const normalize=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase();
  const haystack=normalize(text);return normalize(query).trim().split(/\s+/).filter(Boolean).every(word=>haystack.includes(word));
}
export function mountCommandPalette(dialog,{shortcut=false,labels={}}={}){
  if(instances.has(dialog))return instances.get(dialog);
  if(!dialog?.matches('dialog.command-palette')||typeof dialog.showModal!=='function')throw new TypeError('Expected a native command palette dialog');
  const doc=dialog.ownerDocument,input=dialog.querySelector('input[type="search"]'),list=dialog.querySelector('.command-results'),status=dialog.querySelector('[role="status"]');
  if(!input||!list||!status)throw new TypeError('Command palette requires a search input, results and status');
  const originalHidden=new Map(),initialStatus=status.textContent,initialValue=input.value;
  const names={count:n=>n+' matching command'+(n===1?'':'s')+'.',empty:'No matching commands.',...labels};
  let dead=false;
  const all=()=>[...list.children].filter(li=>li.matches('li')).map(li=>({li,action:li.querySelector(':scope > button, :scope > a[href]')})).filter(p=>p.action);
  const enabled=()=>all().filter(({li,action})=>!li.hidden&&!action.disabled&&!action.matches('[aria-disabled="true"],[hidden]')).map(p=>p.action);
  function refresh(){
    const entries=all(),keep=new Set(entries.map(p=>p.li));
    for(const [li,hidden] of originalHidden)if(!keep.has(li)){li.hidden=hidden;originalHidden.delete(li);}
    for(const {li,action} of entries){if(!originalHidden.has(li))originalHidden.set(li,li.hidden);li.hidden=originalHidden.get(li)||!commandMatches(action.textContent+' '+(action.getAttribute('aria-label')||''),input.value);}
    const n=enabled().length;status.textContent=n?names.count(n):names.empty;
  }
  function open(){if(dead||dialog.open||doc.querySelector('dialog:modal'))return false;input.value='';refresh();dialog.showModal();input.focus();return true;}
  const close=()=>{if(dialog.open)dialog.close();};
  const keydown=e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;
    const items=enabled(),at=items.indexOf(doc.activeElement),search=doc.activeElement===input;
    if(search&&e.key==='Enter'){e.preventDefault();items[0]?.click();return;}
    if((search||at>=0)&&['ArrowDown','ArrowUp'].includes(e.key)){
      e.preventDefault();if(!items.length)return;
      if(search)(e.key==='ArrowDown'?items[0]:items[items.length-1]).focus();
      else if(e.key==='ArrowUp'&&at===0)input.focus();
      else if(e.key==='ArrowDown'&&at===items.length-1)input.focus();
      else items[at+(e.key==='ArrowDown'?1:-1)].focus();
    }else if(at>=0&&['Home','End'].includes(e.key)){e.preventDefault();(e.key==='Home'?items[0]:items[items.length-1])?.focus();}
  };
  const click=e=>{
    const action=e.target.closest?.('button,a[href]');if(!action||!all().some(p=>p.action===action))return;
    if(!enabled().includes(action)){e.preventDefault();return;}
    // Respect the application's native action; canceling this event keeps
    // the palette open without suppressing the action's own event handlers.
    if(dialog.dispatchEvent(new CustomEvent('commandselect',{bubbles:true,cancelable:true,detail:{action,value:action.value??action.getAttribute('href')}})))close();
  };
  const shortcutKey=e=>{
    if(e.defaultPrevented||e.repeat||e.altKey||e.shiftKey||!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='k'||e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
    if(open())e.preventDefault();
  };
  const triggerClick=e=>{const b=e.target.closest?.('button[commandfor][command="show-modal"]');if(b&&b.getAttribute('commandfor')===dialog.id&&!b.disabled&&!b.matches('[aria-disabled="true"]')){e.preventDefault();open();}};
  const submit=e=>{if(e.target.getAttribute('method')?.toLowerCase()!=='dialog'){e.preventDefault();enabled()[0]?.click();}};
  input.addEventListener('input',refresh);dialog.addEventListener('keydown',keydown);list.addEventListener('click',click);
  dialog.addEventListener('submit',submit);doc.addEventListener('click',triggerClick);if(shortcut)doc.addEventListener('keydown',shortcutKey);
  const api={open,close,refresh,destroy(){if(dead)return;dead=true;close();input.removeEventListener('input',refresh);dialog.removeEventListener('keydown',keydown);list.removeEventListener('click',click);dialog.removeEventListener('submit',submit);doc.removeEventListener('click',triggerClick);if(shortcut)doc.removeEventListener('keydown',shortcutKey);for(const [li,hidden] of originalHidden)li.hidden=hidden;status.textContent=initialStatus;input.value=initialValue;instances.delete(dialog);}};
  instances.set(dialog,api);refresh();return api;
}
