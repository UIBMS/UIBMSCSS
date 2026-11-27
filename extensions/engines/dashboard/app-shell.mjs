// Optional shell state; responsive CSS owns the breakpoint.
const instances=new WeakMap();
export function mountAppShell(shell,{expanded=true,mobileExpanded=false}={}){
  if(instances.has(shell))return instances.get(shell);
  const grid=shell?.querySelector(':scope > .app-shell-grid'),bar=grid?.querySelector(':scope > .dashboard-topbar');
  const sidebar=grid?.querySelector(':scope > .dashboard-sidebar'),toggle=bar?.querySelector('.sidebar-toggle');
  if(!shell?.matches('.app-shell')||!grid||!sidebar?.id||!toggle?.matches('button[aria-controls]')||toggle.getAttribute('aria-controls')!==sidebar.id)throw new TypeError('Expected a shell, sidebar and labelled native toggle');
  const win=shell.ownerDocument.defaultView,doc=shell.ownerDocument;
  const original={ready:shell.getAttribute('data-uibms-shell-ready'),expanded:toggle.getAttribute('aria-expanded')};
  const choices={wide:!!expanded,compact:!!mobileExpanded};let mode=null,dead=false;
  const getMode=()=>win.getComputedStyle(grid).getPropertyValue('--_uibms-shell-mode').trim()==='compact'?'compact':'wide';
  function render(){
    const moveFocus=mode==='compact'&&!choices.compact&&sidebar.contains(doc.activeElement);
    const next=String(choices[mode]);if(toggle.getAttribute('aria-expanded')!==next)toggle.setAttribute('aria-expanded',next);
    if(moveFocus)toggle.focus({preventScroll:true});
  }
  function refresh(){if(dead)return;mode=getMode();render();}
  function setExpanded(value){
    if(dead)return false;refresh();const next=!!value;if(choices[mode]===next)return false;
    choices[mode]=next;render();
    shell.dispatchEvent(new win.CustomEvent('sidebarvisibilitychange',{bubbles:true,detail:{expanded:next,mode}}));return true;
  }
  const click=()=>{refresh();setExpanded(!choices[mode]);};
  const keys=e=>{if(e.key==='Escape'&&!e.defaultPrevented&&mode==='compact'&&choices.compact&&(sidebar.contains(e.target)||e.target===toggle)){e.preventDefault();setExpanded(false);toggle.focus({preventScroll:true});}};
  shell.setAttribute('data-uibms-shell-ready','');toggle.addEventListener('click',click);shell.addEventListener('keydown',keys);
  const observer=win.ResizeObserver?new win.ResizeObserver(refresh):null;observer?.observe(shell);
  if(!observer)win.addEventListener('resize',refresh);
  const api={refresh,setExpanded,get expanded(){return choices[mode];},get mode(){return mode;},destroy(){
    if(dead)return;dead=true;observer?.disconnect();win.removeEventListener('resize',refresh);
    toggle.removeEventListener('click',click);shell.removeEventListener('keydown',keys);
    for(const [el,key,value] of [[shell,'data-uibms-shell-ready',original.ready],[toggle,'aria-expanded',original.expanded]])if(value===null)el.removeAttribute(key);else el.setAttribute(key,value);
    instances.delete(shell);
  }};
  instances.set(shell,api);refresh();return api;
}
