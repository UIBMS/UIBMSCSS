// CSS determines presentation; this optional controller manages real state
// and moves one existing navigation tree into an authored native modal.
const instances=new WeakMap();
export function mountAppShell(shell,{expanded=true,mobileExpanded=false}={}){
  if(instances.has(shell))return instances.get(shell);
  const grid=shell?.querySelector(':scope > .app-shell-grid')??shell;
  const bar=grid?.querySelector(':scope > :is(header,.dashboard-topbar)');
  const sidebar=grid?.querySelector(':scope > :is(nav,.dashboard-sidebar)');
  const viewport=grid===shell?grid?.querySelector(':scope > :is(main,section)'):grid;
  const toggle=bar?.querySelector('.sidebar-toggle');
  if(!shell?.matches('.app-shell')||!viewport||!sidebar?.id||!toggle?.matches('button[aria-controls]')||toggle.getAttribute('aria-controls')!==sidebar.id)throw new TypeError('Expected a shell, workspace, navigation and labelled native toggle');
  const win=shell.ownerDocument.defaultView,doc=shell.ownerDocument;
  const drawer=grid.querySelector(':scope > dialog.dashboard-nav-drawer.drawer'),mobileToggle=bar.querySelector('.sidebar-drawer-toggle');
  const modal=drawer&&mobileToggle?.matches('button[commandfor]')&&drawer.id&&mobileToggle.getAttribute('commandfor')===drawer.id&&typeof drawer.showModal==='function'?drawer:null;
  const original={ready:shell.getAttribute('data-uibms-shell-ready'),drawer:shell.getAttribute('data-uibms-shell-drawer'),expanded:toggle.getAttribute('aria-expanded')};
  const choices={wide:!!expanded,compact:!!mobileExpanded};let mode=null,dead=false;
  // The placeholder preserves the author's exact DOM order on restoration.
  const marker=doc.createComment('sidebar position');sidebar.before(marker);
  const getMode=()=>win.getComputedStyle(viewport).getPropertyValue('--_uibms-shell-mode').trim()==='compact'?'compact':'wide';
  const compactModal=()=>modal&&mode==='compact';
  function render(){
    const moveFocus=mode==='compact'&&!choices.compact&&sidebar.contains(doc.activeElement);
    const next=String(choices[mode]);if(toggle.getAttribute('aria-expanded')!==next)toggle.setAttribute('aria-expanded',next);
    if(moveFocus&&!compactModal())toggle.focus({preventScroll:true});
  }
  function refresh(){
    if(dead)return;
    const next=getMode();
    if(next!==mode){
      const focused=sidebar.contains(doc.activeElement)||modal?.contains(doc.activeElement);
      if(modal){
        if(next==='compact')modal.append(sidebar);
        else{if(modal.open)modal.close();marker.after(sidebar);}
      }
      mode=next;
      render();
      if(focused&&modal){(mode==='compact'?mobileToggle:toggle).focus({preventScroll:true});}
    }else render();
  }
  function notify(value){shell.dispatchEvent(new win.CustomEvent('sidebarvisibilitychange',{bubbles:true,detail:{expanded:value,mode}}));}
  function setExpanded(value){
    if(dead)return false;refresh();const next=!!value;
    if(compactModal()){
      if(modal.open===next)return false;
      if(next)modal.showModal();else modal.close();return true;
    }
    if(choices[mode]===next)return false;choices[mode]=next;render();notify(next);return true;
  }
  const click=()=>{refresh();setExpanded(!choices[mode]);};
  const keys=e=>{if(!modal&&e.key==='Escape'&&!e.defaultPrevented&&mode==='compact'&&choices.compact&&(sidebar.contains(e.target)||e.target===toggle)){e.preventDefault();setExpanded(false);toggle.focus({preventScroll:true});}};
  // In supporting browsers the native command handles opening. The shared
  // mountDrawers compatibility adapter fills missing invoker support.
  let lastModalState=false;
  const modalChanged=()=>{const open=!!modal.open;if(open===lastModalState)return;lastModalState=open;if(mode==='compact')notify(open);};
  const modalLink=e=>{
    const link=e.target.closest?.('a[href]');if(!link||!sidebar.contains(link)||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey||e.button!==0)return;
    // Route handlers still receive the original link event. Close the modal
    // before they focus a selected view, so the workspace is no longer inert.
    if(modal.open)modal.close();
  };
  shell.setAttribute('data-uibms-shell-ready','');
  if(modal){shell.setAttribute('data-uibms-shell-drawer','');modal.addEventListener('toggle',modalChanged);modal.addEventListener('close',modalChanged);modal.addEventListener('click',modalLink);}
  toggle.addEventListener('click',click);shell.addEventListener('keydown',keys);
  const observer=win.ResizeObserver?new win.ResizeObserver(refresh):null;observer?.observe(shell);
  if(!observer)win.addEventListener('resize',refresh);
  const api={refresh,setExpanded,get expanded(){return compactModal()?modal.open:choices[mode];},get mode(){return mode;},destroy(){
    if(dead)return;dead=true;observer?.disconnect();win.removeEventListener('resize',refresh);
    toggle.removeEventListener('click',click);shell.removeEventListener('keydown',keys);
    if(modal){modal.removeEventListener('toggle',modalChanged);modal.removeEventListener('close',modalChanged);modal.removeEventListener('click',modalLink);if(modal.open)modal.close();marker.after(sidebar);}
    marker.remove();
    for(const [el,key,value] of [[shell,'data-uibms-shell-ready',original.ready],[shell,'data-uibms-shell-drawer',original.drawer],[toggle,'aria-expanded',original.expanded]])if(value===null)el.removeAttribute(key);else el.setAttribute(key,value);
    instances.delete(shell);
  }};
  instances.set(shell,api);refresh();
  if(compactModal()&&mobileExpanded)setExpanded(true);
  return api;
}
