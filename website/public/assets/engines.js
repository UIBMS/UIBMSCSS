const revision=new URL(import.meta.url).search;
const {loadAppearanceEngines}=await import('./appearance-engines.js'+revision);
if(document.querySelector('.tabs[role="tablist"]')){
  const {mountTabs}=await import('../engines/components/tabs.mjs'+revision);
  mountTabs(document);
}
if(document.querySelector('.dropdown[role="menu"][popover]')){
  const {mountDropdowns}=await import('../engines/components/dropdown.mjs'+revision);
  mountDropdowns(document);
}
if(document.querySelector('.tooltip[role="tooltip"][popover]')){
  const {mountTooltips}=await import('../engines/components/tooltip.mjs'+revision);
  mountTooltips(document);
}
if(document.querySelector('dialog.drawer')){
  const {mountDrawers}=await import('../engines/components/drawer.mjs'+revision);
  mountDrawers(document);
}
if(document.querySelector('#demo-notifications')){
  const {mountToasts}=await import('../engines/components/toast.mjs'+revision);
  const notifications = mountToasts(document.querySelector('#demo-notifications'));
  document.querySelector('#toast-success').addEventListener('click', () => {
    notifications.show({tone:'success', title:'Changes saved', message:'Your workspace is up to date.'});
  });
  document.querySelector('#toast-info').addEventListener('click', () => {
    notifications.show({tone:'info', title:'Export ready', message:'This message expires after six seconds.', duration:6000});
  });
  document.querySelector('#toast-warning').addEventListener('click', () => {
    notifications.show({tone:'warning', title:'Review required', message:'Two items need your attention.'});
  });
  document.querySelector('#toast-danger').addEventListener('click', () => {
    notifications.show({tone:'danger', title:'Connection unavailable', message:'Your changes have not been submitted.'});
  });
  document.querySelector('#toast-clear').addEventListener('click', () => notifications.clear());
}
if(document.querySelector('#onboarding-steps')){
  const {mountStepper}=await import('../engines/components/stepper.mjs'+revision);
  const list = document.querySelector('#onboarding-steps');
  const wizard = mountStepper(list);
  const back = document.querySelector('#stepper-back');
  const next = document.querySelector('#stepper-next');
  const status = document.querySelector('#stepper-status');
  function update() {
    back.disabled = wizard.current <= 0;
    next.disabled = wizard.current >= 2;
    status.value = 'Step ' + (wizard.current + 1) + ' of 3';
  }
  list.addEventListener('stepchange', update);
  back.addEventListener('click', () => wizard.previous({focus:true}));
  next.addEventListener('click', () => wizard.next({focus:true}));
  update();
}
if(document.querySelector('#records-pagination')){
  const {mountPagination}=await import('../engines/components/pagination.mjs'+revision);
  const summary = document.querySelector('#pagination-summary');
  const records = document.querySelector('#pagination-records');
  function showPage(page) {
    const first = (page - 1) * 10 + 1;
    const last = page * 10;
    summary.value = 'Showing records ' + first + '–' + last + ' of 100';
    records.replaceChildren(...Array.from({length:10}, (_,i) => {
      const row = document.createElement('p');
      row.textContent = 'Record ' + (first + i);
      return row;
    }));
  }
  const pagination = mountPagination(document.querySelector('#records-pagination'), {
    current:5, total:10, onChange:showPage
  });
  showPage(pagination.current);
}
if(document.querySelector('#demo-removable-skills')){
  const {mountChips}=await import('../engines/components/chips.mjs'+revision);
  const group = document.querySelector('#demo-removable-skills');
  const status = document.querySelector('#chip-status');
  const initial = Array.from(group.children, chip => chip.cloneNode(true));
  const chips = mountChips(group);
  group.addEventListener('chipremove', event => {
    status.value = 'Removed ' + event.detail.value + '. ' + group.children.length + ' remaining.';
  });
  document.querySelector('#chip-restore').addEventListener('click', () => {
    group.replaceChildren(...initial.map(chip => chip.cloneNode(true)));
    status.value = 'Three selected skills';
  });
}
if(document.querySelector('#workspace-commands')){
  const {mountCommandPalette}=await import('../engines/components/command.mjs'+revision);
  const dialog = document.querySelector('#workspace-commands');
  const commands = mountCommandPalette(dialog);
  dialog.addEventListener('commandselect', event => {
    document.querySelector('#command-action-status').value =
      'Selected: ' + event.detail.action.textContent.trim();
  });
}
if(document.querySelector('.app-shell,.split-workspace')){
  const shellModule=document.querySelector('.app-shell')?await import('../engines/dashboard/app-shell.mjs'+revision):null;
  const splitModule=document.querySelector('.split-workspace')?await import('../engines/dashboard/split-workspace.mjs'+revision):null;
  for(const shell of document.querySelectorAll('.app-shell'))shellModule.mountAppShell(shell);
  for(const split of document.querySelectorAll('.split-workspace'))splitModule.mountSplitWorkspace(split);
  if(document.querySelector('#dashboard-demo-shell')){
    const {mountAppShell}=shellModule,{mountSplitWorkspace}=splitModule;
    const {mountCommandPalette}=await import('../engines/components/command.mjs'+revision);
    const shell = document.querySelector('#dashboard-demo-shell');
    const layout = mountAppShell(shell);
    const workspace = shell.querySelector('#dash-workspace');
    const views = [...workspace.querySelectorAll(':scope > .dashboard-view')];
    const links = [...shell.querySelectorAll('#dash-sidebar a[href]')];
    function showView(id, focus = false) {
      const view = views.find(v => v.id === id);
      if (!view) return false;
      for (const v of views) v.hidden = v !== view;
      for (const link of links) {
        if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
      if (layout.mode === 'compact') layout.setExpanded(false);
      workspace.scrollTop = 0;
      if (focus) view.focus({preventScroll:true});
      return true;
    }
    shell.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || !shell.contains(link)) return;
      const id = link.getAttribute('href').slice(1);
      if (views.some(v => v.id === id)) {
        event.preventDefault();
        showView(id, true);
      }
    });
    showView('dash-overview');
    mountSplitWorkspace(shell.querySelector('.split-workspace'));
    mountCommandPalette(shell.querySelector('#dash-commands'));
  }
}
// The widget adapters are generic: the native data/progress values are the source.
if(document.querySelector('figure.sparkline > svg.sparkline-plot:empty')){
  const {mountSparkline}=await import('../engines/dashboard/sparkline.mjs'+revision);
  for(const figure of document.querySelectorAll('figure.sparkline:has(> svg.sparkline-plot:empty)'))mountSparkline(figure);
}
if(document.querySelector('.progress-ring > progress')){
  const {mountProgressRing}=await import('../engines/dashboard/progress-ring.mjs'+revision);
  for(const root of document.querySelectorAll('.progress-ring:has(> progress)'))mountProgressRing(root);
}
const siliconeExamples=[...document.querySelectorAll('[data-site-demo-run="liquid-silicone"]')];
await loadAppearanceEngines({
  loadMaterial:()=>import('../engines/material.mjs'+revision),
  loadForms:()=>import('../engines/forms.mjs'+revision),
  loadMedia:()=>import('../engines/media-deformation.mjs'+revision),
  filter:el=>!!el.closest('[data-site-demo-content]')&&!el.closest('dialog,[popover]'),
  onMaterial(material){
    for(const demo of siliconeExamples){
      const scope=demo.querySelector('[data-material="liquid-silicone"]');
      if(!scope)continue;
      material.registerBackdrop(scope,new URL('../engines/landscape.svg',import.meta.url).href);
      const slider=scope.querySelector('input[type=range]');
      if(slider)slider.addEventListener('input',()=>{scope.style.setProperty('--uibms-material-opacity',slider.value+'%');material.refresh();});
    }
  }
});
for(const demo of siliconeExamples){
  demo.addEventListener('click',e=>{
    const button=e.target.closest('nav button[aria-pressed]');if(!button)return;
    for(const b of button.closest('nav').querySelectorAll('button[aria-pressed]'))b.setAttribute('aria-pressed',String(b===button));
  });
}

// The deformable video example has real HTML playback controls, not a
// rasterized imitation of browser controls. Ordinary native players are untouched.
for(const demo of document.querySelectorAll('[data-site-demo-run="media-deformation"]')){
  const video=demo.querySelector('video'),play=demo.querySelector('button'),seek=demo.querySelector('input[type=range]'),out=demo.querySelector('output');
  if(!video||!play||!seek||!out)continue;
  function update(){
    const duration=Number.isFinite(video.duration)?video.duration:0;
    play.textContent=video.paused?'Play':'Pause';
    seek.disabled=!duration;seek.max=String(duration||1);seek.value=String(video.currentTime||0);
    out.value=(video.currentTime||0).toFixed(1)+' / '+duration.toFixed(1)+' s';
  }
  play.addEventListener('click',async()=>{try{if(video.paused)await video.play();else video.pause();}catch{out.value='Playback unavailable';}});
  seek.addEventListener('input',()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value);});
  for(const type of ['loadedmetadata','timeupdate','play','pause','ended','seeked'])video.addEventListener(type,update);
  update();
}
document.documentElement.setAttribute('data-site-engines-ready','');
