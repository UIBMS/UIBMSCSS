const revision=new URL(import.meta.url).search;
const appearanceModule=import('./appearance-engines.js'+revision);
const query=selector=>document.querySelector(selector);
const when=(needed,load)=>needed?load():null;
const shells=[...document.querySelectorAll('.app-shell')],splits=[...document.querySelectorAll('.split-workspace')];
const dashboardShell=query('#dashboard-demo-shell'),workspaceCommands=query('#workspace-commands');
const dynamicSparklines=[...document.querySelectorAll('figure.sparkline')].filter(figure=>
  (figure.querySelector(':scope > svg.sparkline-plot')??figure.querySelector(':scope > svg'))?.matches(':empty'));
const rings=[...document.querySelectorAll('.progress-ring:has(> progress)')];

// Start independent requests together, and only for authored functionality.
// Segmented controls and static SVG graphs never need a component controller.
const [
  {loadAppearanceEngines},tabsModule,dropdownModule,tooltipModule,toastModule,stepperModule,paginationModule,
  chipsModule,commandModule,shellModule,splitModule,sparklineModule,ringModule
]=await Promise.all([
  appearanceModule,
  when(query('.tabs[role="tablist"]'),()=>import('../engines/components/tabs.mjs'+revision)),
  when(query('.dropdown[role="menu"][popover]'),()=>import('../engines/components/dropdown.mjs'+revision)),
  when(query('.tooltip[role="tooltip"][popover]'),()=>import('../engines/components/tooltip.mjs'+revision)),
  when(query('#demo-notifications'),()=>import('../engines/components/toast.mjs'+revision)),
  when(query('#onboarding-steps'),()=>import('../engines/components/stepper.mjs'+revision)),
  when(query('#records-pagination'),()=>import('../engines/components/pagination.mjs'+revision)),
  when(query('#demo-removable-skills'),()=>import('../engines/components/chips.mjs'+revision)),
  when(workspaceCommands||dashboardShell,()=>import('../engines/components/command.mjs'+revision)),
  when(shells.length,()=>import('../engines/dashboard/app-shell.mjs'+revision)),
  when(splits.length,()=>import('../engines/dashboard/split-workspace.mjs'+revision)),
  when(dynamicSparklines.length,()=>import('../engines/dashboard/sparkline.mjs'+revision)),
  when(rings.length,()=>import('../engines/dashboard/progress-ring.mjs'+revision)),
  appearanceModule.then(({loadDrawerFallback})=>loadDrawerFallback(()=>import('../engines/components/drawer.mjs'+revision)))
]);
tabsModule?.mountTabs(document);
dropdownModule?.mountDropdowns(document);
tooltipModule?.mountTooltips(document);
if(toastModule){
  const {mountToasts}=toastModule;
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
if(stepperModule){
  const {mountStepper}=stepperModule;
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
if(paginationModule){
  const {mountPagination}=paginationModule;
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
if(chipsModule){
  const {mountChips}=chipsModule;
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
if(workspaceCommands){
  const {mountCommandPalette}=commandModule;
  const dialog = workspaceCommands;
  const commands = mountCommandPalette(dialog);
  dialog.addEventListener('commandselect', event => {
    document.querySelector('#command-action-status').value =
      'Selected: ' + event.detail.action.textContent.trim();
  });
}
if(shells.length||splits.length){
  let dashboardLayout;
  for(const shell of shells){
    const layout=shellModule.mountAppShell(shell);
    if(shell===dashboardShell)dashboardLayout=layout;
  }
  for(const split of splits)splitModule.mountSplitWorkspace(split);
  if(dashboardShell){
    const shell=dashboardShell,layout=dashboardLayout;
    const {mountCommandPalette}=commandModule;
    const workspace = shell.querySelector('#dash-workspace');
    const views = [...workspace.querySelectorAll(':scope > :is(section[id],.dashboard-view)')];
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
    mountCommandPalette(shell.querySelector('#dash-commands'));
  }
}
// Native data/progress values remain the source of the optional decorations.
for(const figure of dynamicSparklines)sparklineModule.mountSparkline(figure);
for(const root of rings)ringModule.mountProgressRing(root);
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
