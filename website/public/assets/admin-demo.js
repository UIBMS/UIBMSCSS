// Standalone application behavior only. CSS owns all presentation and layout.
const revision=new URL(import.meta.url).search;
const [
  {mountAppShell},{mountDrawers},{mountDropdowns},{mountTooltips},{mountTabs},{mountStepper},{mountPagination},{mountChips},{mountCommandPalette},{mountToasts},{mountSplitWorkspace},{mountSparkline},{mountProgressRing},{mountMaterial},{mountForms}
]=await Promise.all([
  import('../engines/dashboard/app-shell.mjs'+revision),
  import('../engines/components/drawer.mjs'+revision),
  import('../engines/components/dropdown.mjs'+revision),
  import('../engines/components/tooltip.mjs'+revision),
  import('../engines/components/tabs.mjs'+revision),
  import('../engines/components/stepper.mjs'+revision),
  import('../engines/components/pagination.mjs'+revision),
  import('../engines/components/chips.mjs'+revision),
  import('../engines/components/command.mjs'+revision),
  import('../engines/components/toast.mjs'+revision),
  import('../engines/dashboard/split-workspace.mjs'+revision),
  import('../engines/dashboard/sparkline.mjs'+revision),
  import('../engines/dashboard/progress-ring.mjs'+revision),
  import('../engines/material.mjs'+revision),
  import('../engines/forms.mjs'+revision)
]);
const $=(id)=>document.getElementById(id);
const {profiles,projects}=JSON.parse($('admin-demo-data').textContent);
const shell=$('admin-shell'),workspace=$('admin-main');
const layout=mountAppShell(shell);
mountDrawers(document);mountDropdowns(document);mountTooltips(document);mountTabs(document);
const notifications=mountToasts($('admin-notifications'));
const split=mountSplitWorkspace($('admin-project-split'));
for(const figure of document.querySelectorAll('figure.sparkline'))mountSparkline(figure);
for(const ring of document.querySelectorAll('.progress-ring'))mountProgressRing(ring);
mountCommandPalette($('admin-commands'),{shortcut:true});
const wizard=mountStepper($('admin-create-steps'));
const notify=(title,message='',tone='success')=>notifications.show({title,message,tone});
const root=document.documentElement;
const profileForm=$('admin-appearance-form'),appearanceKey='uibmscss:appearance:v1';
function syncAppearance(){
  for(const p of profiles){const value=root.getAttribute('data-'+p.key);profileForm.elements.namedItem(p.key).value=p.values.includes(value)?value:p.default;}
}
function saveAppearance(){
  const values=Object.fromEntries(profiles.map(p=>[p.key,root.getAttribute('data-'+p.key)]));
  try{localStorage.setItem(appearanceKey,JSON.stringify(values));$('admin-appearance-status').textContent='Appearance saved for this browser.';}
  catch{$('admin-appearance-status').textContent='Appearance applied for this page.';}
}
syncAppearance();
profileForm.addEventListener('change',e=>{const p=profiles.find(p=>p.key===e.target.name);if(p&&p.values.includes(e.target.value)){root.setAttribute('data-'+p.key,e.target.value);saveAppearance();}});
profileForm.addEventListener('submit',e=>e.preventDefault());
$('admin-appearance-reset').addEventListener('click',()=>{for(const p of profiles)root.setAttribute('data-'+p.key,p.default);syncAppearance();saveAppearance();});
window.addEventListener('storage',e=>{
  if(e.key!==appearanceKey&&e.key!==null)return;
  let saved={};try{saved=JSON.parse(localStorage.getItem(appearanceKey)||'{}')||{};}catch{}
  for(const p of profiles)root.setAttribute('data-'+p.key,p.values.includes(saved[p.key])?saved[p.key]:p.default);
  syncAppearance();
});

// Native links supply real fragment destinations. Only application view
// selection, history and focus require the controller.
const views=[...workspace.querySelectorAll(':scope > .dashboard-view')];
const links=[...shell.querySelectorAll('.sidebar-nav a[href^="#"]')];
const viewFor=id=>views.find(v=>v.id===id);
function showView(id,{focus=false,history=false}={}){
  const view=viewFor(id);if(!view)return false;
  if(layout.mode==='compact')layout.setExpanded(false);
  for(const v of views)v.hidden=v!==view;
  for(const link of links){if(link.getAttribute('href')==='#'+id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
  if(history&&location.hash!=='#'+id)window.history.pushState(null,'','#'+id);
  workspace.scrollTop=0;
  if(focus)view.focus({preventScroll:true});
  if(id==='admin-projects')split.refresh();
  if(id==='admin-create')updateWizard();
  return true;
}
shell.addEventListener('click',e=>{
  const link=e.target.closest?.('a[href^="#"]');
  if(!link||!shell.contains(link)||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  const id=link.getAttribute('href').slice(1);
  if(!viewFor(id))return;
  e.preventDefault();
  showView(id,{focus:true,history:true});
});
const routeFromLocation=()=>showView(viewFor(location.hash.slice(1))?location.hash.slice(1):'admin-overview',{focus:false});
window.addEventListener('popstate',routeFromLocation);
window.addEventListener('hashchange',routeFromLocation);

// Records, filters, and pagination all use one local in-memory dataset.
const search=$('admin-project-search'),priority=$('admin-priority-filter'),rows=$('admin-project-rows');
const rowTemplate=$('admin-row-template'),pageSize=5;
const projectButton='button[name="project"]';
const rowsById=new Map([...rows.children].map(row=>[Number(row.querySelector(projectButton).value),row]));
const statusFilter=()=>document.querySelector('input[name="admin-status"]:checked').value;
const filtered=()=>projects.filter(p=>{
  const words=search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return (statusFilter()==='All'||p.status===statusFilter())&&(!priority.checked||p.priority)&&words.every(word=>(p.name+' '+p.team+' '+p.owner).toLocaleLowerCase().includes(word));
});
const tone=s=>s==='Completed'?'success':s==='Active'?'info':'warning';
let selected=projects[0]?.id;
const project=()=>projects.find(p=>p.id===selected);
const pagination=mountPagination($('admin-pagination'),{total:Math.ceil(projects.length/pageSize),onChange:renderRows});
function updateRow(p){
  let r=rowsById.get(p.id);
  if(!r){r=rowTemplate.content.firstElementChild.cloneNode(true);rows.prepend(r);rowsById.set(p.id,r);}
  const b=r.querySelector(projectButton),tag=r.querySelector('.tag');
  b.value=String(p.id);if(b.textContent!==p.name)b.textContent=p.name;const pressed=String(p.id===selected);if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);if(r.cells[1].textContent!==p.owner)r.cells[1].textContent=p.owner;if(tag.textContent!==p.status)tag.textContent=p.status;if(tag.dataset.tone!==tone(p.status))tag.dataset.tone=tone(p.status);
}
function renderRows(){
  const list=filtered(),start=(pagination.current-1)*pageSize,visible=new Set(list.slice(start,start+pageSize).map(p=>p.id));
  for(const p of projects){updateRow(p);rowsById.get(p.id).hidden=!visible.has(p.id);}
  $('admin-record-count').value=list.length?'Showing '+(start+1)+'–'+Math.min(start+pageSize,list.length)+' of '+list.length+' projects':'0 projects';
  $('admin-empty').hidden=!!list.length;
}
function applyFilters({first=true}={}){
  const list=filtered();
  pagination.setTotal(Math.max(1,Math.ceil(list.length/pageSize)));
  if(first)pagination.setPage(1,{notify:false});renderRows();
}
search.addEventListener('input',()=>applyFilters());priority.addEventListener('change',()=>applyFilters());
for(const radio of document.querySelectorAll('input[name="admin-status"]'))radio.addEventListener('change',()=>applyFilters());
function clearFilters(){search.value='';priority.checked=false;document.querySelector('input[name="admin-status"][value="All"]').checked=true;}
$('admin-clear-filters').addEventListener('click',()=>{clearFilters();applyFilters();});
function text(id,value){const el=$(id),next=String(value);if(el.textContent!==next)el.textContent=next;}
function updateMetrics(){
  const done=projects.filter(p=>p.status==='Completed').length;
  const active=projects.filter(p=>p.status==='Active').length,planned=projects.length-done-active;
  const rate=Math.round(done/projects.length*100);
  text('admin-total',projects.length);text('admin-active',active);text('admin-completed',done);text('admin-priority',projects.filter(p=>p.priority).length);
  text('admin-progress-summary',done+' of '+projects.length+' projects delivered');
  text('admin-report-rate',rate+'%');text('admin-average',Math.round(projects.reduce((sum,p)=>sum+p.progress,0)/projects.length)+'%');text('admin-planned',planned);
  for(const el of [$('admin-overview-ring').querySelector('progress'),$('admin-report-ring').querySelector('progress'),$('admin-report-bar')]){el.max=projects.length;el.value=done;el.textContent=done+' / '+projects.length;}
  const values={Active:active,Completed:done,Planned:planned};
  for(const term of $('admin-status-summary').querySelectorAll('dt'))term.nextElementSibling.textContent=String(values[term.textContent]);
}
const tags=$('admin-project-tags');
mountChips(tags);
function renderTags(){
  const p=project();if(!p)return;
  tags.replaceChildren(...p.tags.map(label=>{
    const chip=document.createElement('span'),remove=document.createElement('button');chip.className='chip';chip.append(document.createTextNode(label+' '));
    remove.type='button';remove.name='remove-chip';remove.value=label;remove.setAttribute('aria-label','Remove '+label);remove.textContent='×';chip.append(remove);return chip;
  }));
}
function renderDetail(){
  const p=project();if(!p)return;
  text('admin-detail-name',p.name);text('admin-detail-status',p.status);$('admin-detail-status').dataset.tone=tone(p.status);
  text('admin-detail-owner',p.owner);text('admin-detail-team',p.team);text('admin-detail-priority',p.priority?'High':'Normal');
  text('admin-detail-due',p.due||'Not scheduled');text('admin-detail-time',p.time||'Not scheduled');text('admin-detail-color',p.color?.toUpperCase()||'Not assigned');
  const progress=$('admin-detail-ring').querySelector('progress');progress.value=p.progress;progress.textContent=p.progress+'%';
  $('admin-project-notes').value=p.notes||'';$('admin-complete-project').disabled=p.status==='Completed';
  renderTags();
}
function selectRecord(id){if(!projects.some(p=>p.id===id))return;selected=id;renderDetail();renderRows();}
rows.addEventListener('click',e=>{const button=e.target.closest?.(projectButton);if(button)selectRecord(Number(button.value));});
tags.addEventListener('chipremove',e=>{const p=project();if(p)p.tags=p.tags.filter(label=>label!==e.detail.value);notify('Label removed',e.detail.value);});
$('admin-tag-form').addEventListener('submit',e=>{
  e.preventDefault();const p=project(),field=e.target.elements.namedItem('label'),label=field.value.trim();
  if(!p||!label)return;
  if(p.tags.includes(label)){notify('Label already exists',label,'warning');return;}
  p.tags.push(label);renderTags();field.value='';notify('Label added',label);
});
function activity(message){const item=document.createElement('li');item.textContent=message;const list=$('admin-activity');list.prepend(item);while(list.children.length>8)list.lastElementChild.remove();}
$('admin-save-notes').addEventListener('click',()=>{const p=project();if(!p)return;p.notes=$('admin-project-notes').value;notify('Notes saved',p.name);});
$('admin-complete-project').addEventListener('click',()=>{
  const p=project();if(!p||p.status==='Completed')return;p.status='Completed';p.progress=100;
  renderDetail();applyFilters({first:false});updateMetrics();activity(p.name+' was completed.');notify('Project completed',p.name);
});

// Native form values are the source of truth for the three-step workflow.
const create=$('admin-create-form'),steps=$('admin-create-steps'),nameField=create.elements.namedItem('name');
function validName(){nameField.setCustomValidity(nameField.value.trim()?'':'Enter a project name.');return nameField.reportValidity();}
nameField.addEventListener('input',()=>nameField.setCustomValidity(''));
function updateWizard(){
  const i=wizard.current;
  $('admin-create-back').disabled=i<=0;$('admin-create-next').hidden=i>=2;$('admin-create-next').disabled=i<0;
  $('admin-create-submit').hidden=i!==2;$('admin-create-submit').disabled=i!==2;
  $('admin-step-status').value='Step '+(i+1)+' of 3';
  const values=new FormData(create);
  text('admin-create-summary',[values.get('name')||'Untitled project',values.get('team'),values.get('owner'),values.get('due')?'Due '+values.get('due'):'No due date',values.get('priority')?'High priority':'Normal priority'].join(' · '));
}
steps.addEventListener('beforestepchange',e=>{
  if(e.detail.previous===0&&e.detail.index>0&&!validName())e.preventDefault();
});
steps.addEventListener('stepchange',updateWizard);create.addEventListener('input',updateWizard);
$('admin-create-back').addEventListener('click',()=>wizard.previous({focus:true}));$('admin-create-next').addEventListener('click',()=>wizard.next({focus:true}));
create.addEventListener('submit',e=>{
  e.preventDefault();if(wizard.current!==2)return;
  if(!nameField.value.trim()){wizard.go(0,{focus:true});validName();return;}
  const v=new FormData(create),p={id:Math.max(0,...projects.map(p=>p.id))+1,name:String(v.get('name')).trim(),team:String(v.get('team')),owner:String(v.get('owner')),status:'Planned',progress:0,priority:v.has('priority'),tags:[String(v.get('team'))],due:String(v.get('due')||''),time:String(v.get('time')||''),color:String(v.get('color')||''),notes:String(v.get('notes')||'')};
  projects.unshift(p);selected=p.id;
  create.reset();nameField.setCustomValidity('');wizard.go(0);updateWizard();
  clearFilters();applyFilters();renderDetail();updateMetrics();activity(p.name+' was created.');
  showView('admin-projects',{focus:true,history:true});notify('Project created',p.name);
});
function csvCell(value){let s=String(value??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
function exportRecords(){
  const records=filtered(),columns=['id','name','team','owner','status','progress','priority','due','time'];
  const csv=[columns.map(csvCell).join(','),...records.map(p=>columns.map(c=>csvCell(p[c])).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='uibms-demo-projects.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Export ready',records.length+' project records exported.','info');
}
$('admin-export').addEventListener('click',exportRecords);$('admin-report-export').addEventListener('click',exportRecords);
const settings=$('admin-settings-form');
settings.addEventListener('submit',e=>{e.preventDefault();text('admin-workspace-brand',settings.elements.namedItem('workspace').value.trim()||'Workspace');notify('Workspace preferences saved','Changes apply to this demonstration session.');});
$('admin-reset-session').addEventListener('click',()=>{if(window.confirm('Reset local demonstration data? Appearance preferences will remain.'))location.reload();});

renderDetail();applyFilters();updateMetrics();updateWizard();routeFromLocation();
// Optional visual adapters consume native controls and authored tokens;
// they do not own any application data or responsive geometry.
mountMaterial(document,{mediaLoader:()=>import('../engines/media-deformation.mjs'+revision)});
mountForms(document,{filter:el=>!!el.closest('#admin-create-form,#admin-settings-form')});
settings.querySelector('button[type="submit"]').disabled=false;
