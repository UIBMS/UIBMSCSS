import {staticSparkline} from '../lib/sparkline.mjs';
// Standalone applications are separate from the documentation catalogue.
import {profiles,esc,href,asset,titleCase,jsonScript} from '../lib/config.mjs';

const components=['tabs','segmented','dropdown','tooltip','drawer','toast','stepper','pagination','chips','command'];
const dashboard=['app-shell','sidebar','topbar','page-header','split-workspace','metrics','widget-grid','quick-actions','sparkline','progress-ring'];
export const demos=[
  {slug:'demos/admin',title:'Administration dashboard',description:'A complete project operations workspace with records, reports, creation workflow and configurable appearance.',kind:'application',standalone:true,sections:[],documentation:'docs/dashboard',entry:'admin-demo',stylesheets:[...components.map(n=>'components/'+n+'.css'),...dashboard.map(n=>'dashboard/'+n+'.css')],features:['Responsive app shell and navigation','Project records and local search','KPI widgets and reporting','Forms, workflow and notifications','All appearance profiles']}
];

const routes=[
  ['admin-overview','Overview','home'],
  ['admin-projects','Projects','folder'],
  ['admin-reports','Reports','chart'],
  ['admin-create','New project','plus'],
  ['admin-settings','Settings','settings']
];
const paths={
  home:'M3 10l9-7 9 7v10H3z M9 20v-6h6v6',folder:'M3 7h7l2 3h9v10H3z M3 7V4h7l2 3h9v3',
  chart:'M4 20V4 M4 20h16 M8 16v-4 M12 16V8 M16 16V5',plus:'M12 5v14 M5 12h14',
  settings:'M4 7h16 M4 12h16 M4 17h16 M8 5v4 M16 10v4 M10 15v4',
  menu:'M4 6h16M4 12h16M4 18h16',search:'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  check:'m5 12 4 4L19 6',flag:'M5 21V4m0 1h13l-3 4 3 4H5',
  help:'M12 17v.1 M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'
};
const icon=name=>'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[name]+'"/></svg>';
const navLink=([id,label,symbol],current=false)=>'<a href="#'+id+'"'+(current?' aria-current="page"':'')+'>'+icon(symbol)+'<span>'+esc(label)+'</span></a>';
const action=(label,target)=>'<a href="#'+target+'">'+esc(label)+'</a>';
const close=label=>'<form method="dialog"><button type="submit" aria-label="'+esc(label)+'">×</button></form>';
const open=(target,label,body=label,extra='')=>'<button type="button" commandfor="'+target+'" command="show-modal" aria-haspopup="dialog" '+extra+'>'+body+'</button>';
const projects=[
 ['Website refresh','Design','Maya Chen','Active',72,true,['Design','Web']],
 ['Client portal','Engineering','Sam Patel','Active',48,true,['Development','Portal']],
 ['Quarterly review','Operations','Alex Morgan','Completed',100,false,['Reporting']],
 ['Brand guidelines','Design','Maya Chen','Completed',100,false,['Design']],
 ['Billing integration','Engineering','Sam Patel','Active',60,true,['Development','Finance']],
 ['Knowledge base','Operations','Jordan Lee','Planned',15,false,['Documentation']],
 ['Mobile onboarding','Design','Maya Chen','Active',85,false,['Design','Mobile']],
 ['Partner directory','Operations','Alex Morgan','Planned',10,false,['Operations']],
 ['Accessibility audit','Engineering','Jordan Lee','Completed',100,true,['Accessibility']],
 ['Customer research','Design','Alex Morgan','Active',35,false,['Research']],
 ['Data migration','Engineering','Sam Patel','Active',58,true,['Development']],
 ['Release notes','Operations','Jordan Lee','Completed',100,false,['Documentation']]
].map(([name,team,owner,status,progress,priority,tags],i)=>({id:i+1,name,team,owner,status,progress,priority,tags}));
const tone=s=>s==='Completed'?'success':s==='Active'?'info':'warning';
const row=p=>'<tr><th scope="row"><button type="button" name="project" value="'+p.id+'" aria-pressed="false">'+esc(p.name)+'</button></th><td>'+esc(p.owner)+'</td><td><span class="tag" data-tone="'+tone(p.status)+'">'+esc(p.status)+'</span></td></tr>';
const stat=(label,id,value,note,symbol)=>'<dl class="card stack metric-card"><dt class="cluster">'+icon(symbol)+'<span>'+esc(label)+'</span></dt><dd><strong id="'+id+'">'+esc(value)+'</strong><small>'+esc(note)+'</small></dd></dl>';
const capacity=(label,value)=>'<label class="stack"><span>'+esc(label)+' <strong>'+value+'%</strong></span><meter min="0" max="100" value="'+value+'" aria-label="'+esc(label)+' capacity">'+value+'%</meter></label>';
const ring=(id,label,value,max)=>'<div class="progress-ring" id="'+id+'"><progress value="'+value+'" max="'+max+'" aria-label="'+esc(label)+'">'+value+' of '+max+'</progress></div>';
const title=(name,description,actions='')=>'<header class="dashboard-page-header"><div class="stack"><nav aria-label="Location"><ol><li><a href="#admin-overview">Workspace</a></li><li aria-current="page">'+esc(name)+'</li></ol></nav><h1 tabindex="-1">'+esc(name)+'</h1><p>'+esc(description)+'</p></div>'+(actions?'<div>'+actions+'</div>':'')+'</header>';
const view=(id,content)=>'<section id="'+id+'" class="stack" aria-label="'+esc(routes.find(r=>r[0]===id)[1])+'">'+content+'</section>';
const quick=()=>'<nav class="cluster quick-actions" aria-label="Quick actions">'+action('Create project','admin-create')+action('Browse projects','admin-projects')+action('View reports','admin-reports')+'</nav>';
const opts=(values,selected)=>values.map(v=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(v)+'</option>').join('');
const complete=projects.filter(p=>p.status==='Completed').length;
const active=projects.filter(p=>p.status==='Active').length;
const overview=()=>view('admin-overview',title('Overview','Active work, delivery progress and team capacity.',action('New project','admin-create'))+
  '<div class="grid widget-grid" style="--dashboard-widget-min:10rem">'+
  stat('Total projects','admin-total',projects.length,'Across all teams','folder')+
  stat('In progress','admin-active',active,'Active workstreams','chart')+
  stat('Completed','admin-completed',complete,'Delivered projects','check')+
  stat('High priority','admin-priority',projects.filter(p=>p.priority).length,'Requires attention','flag')+
  '</div><div class="grid widget-grid" style="--dashboard-widget-min:19rem">'+
  '<article class="card stack"><header class="cluster"><h2>Delivery progress</h2><button type="button" aria-describedby="admin-progress-tip" aria-label="About delivery progress">'+icon('help')+'</button><span id="admin-progress-tip" class="tooltip" role="tooltip" popover="manual">Completed projects divided by all projects.</span></header>'+ring('admin-overview-ring','Completed projects',complete,projects.length)+'<p id="admin-progress-summary">'+complete+' of '+projects.length+' projects delivered</p></article>'+
  '<article class="card stack"><h2>Project activity</h2>'+staticSparkline('Weekly observations',[4,6,5,8,7,10,12],'Seven illustrative weekly project counts.')+'</article>'+
  '<article class="card stack"><h2>Capacity</h2>'+capacity('Design',72)+capacity('Engineering',84)+capacity('Operations',46)+'</article></div>'+
  '<div class="split"><article class="card stack"><h2>Quick actions</h2>'+quick()+'</article>'+
  '<article class="card stack"><h2>Recent activity</h2><ul id="admin-activity"><li>Accessibility audit was completed.</li><li>Website refresh is ready for review.</li><li>Knowledge base was added to the plan.</li></ul></article></div>');
const projectsView=()=>view('admin-projects',title('Projects','Search, filter and inspect the local project register.',action('New project','admin-create')+'<button type="button" id="admin-export">Export CSV</button>')+
  '<section class="card stack"><label>Search projects <input id="admin-project-search" type="search" placeholder="Name, team or owner"></label><div class="cluster"><div class="segmented" role="radiogroup" aria-label="Project status">'+['All','Active','Completed','Planned'].map((s,i)=>'<label><input type="radio" name="admin-status" value="'+s+'"'+(!i?' checked':'')+'>'+s+'</label>').join('')+'</div><label class="chip"><input type="checkbox" id="admin-priority-filter"> High priority</label><button type="button" id="admin-clear-filters">Clear filters</button></div><output id="admin-record-count" aria-live="polite">'+projects.length+' projects</output></section>'+
  '<div class="split-workspace" id="admin-project-split" style="--dashboard-split-ratio:.57">'+
  '<section class="card stack" id="admin-record-list" aria-label="Project records"><h2>Records</h2><div role="region" aria-label="Scrollable project table" tabindex="0"><table><thead><tr><th scope="col">Project</th><th scope="col">Owner</th><th scope="col">Status</th></tr></thead><tbody id="admin-project-rows">'+projects.map(row).join('')+'</tbody></table></div><p id="admin-empty" hidden>No matching projects.</p><nav class="pagination" id="admin-pagination" aria-label="Project pages"></nav></section>'+
  '<div role="separator" aria-controls="admin-record-list" aria-label="Resize project list" aria-orientation="vertical" tabindex="-1"></div>'+
  '<section class="card stack" aria-label="Project detail"><div class="cluster"><h2 id="admin-detail-name">'+esc(projects[0].name)+'</h2><span id="admin-detail-status" class="tag" data-tone="info">Active</span></div>'+
  '<div class="tabs" role="tablist" aria-label="Project details"><button type="button" role="tab" id="admin-detail-tab" aria-controls="admin-detail-panel" aria-selected="true">Details</button><button type="button" role="tab" id="admin-notes-tab" aria-controls="admin-notes-panel" aria-selected="false">Notes</button></div>'+
  '<section class="stack" id="admin-detail-panel" role="tabpanel" aria-labelledby="admin-detail-tab"><dl><div><dt>Owner</dt><dd id="admin-detail-owner">'+esc(projects[0].owner)+'</dd></div><div><dt>Team</dt><dd id="admin-detail-team">'+esc(projects[0].team)+'</dd></div><div><dt>Priority</dt><dd id="admin-detail-priority">High</dd></div><div><dt>Due date</dt><dd id="admin-detail-due">Not scheduled</dd></div><div><dt>Review time</dt><dd id="admin-detail-time">Not scheduled</dd></div><div><dt>Project colour</dt><dd id="admin-detail-color">Not assigned</dd></div></dl>'+ring('admin-detail-ring','Selected project progress',projects[0].progress,100)+'<h3>Labels</h3><ul class="chips" id="admin-project-tags" role="list" aria-label="Project labels"></ul><form id="admin-tag-form" class="cluster"><label>Add label <input name="label" maxlength="24" required></label><button type="submit">Add</button></form><div class="cluster"><button type="button" id="admin-complete-project">Mark complete</button></div></section>'+
  '<section id="admin-notes-panel" role="tabpanel" aria-labelledby="admin-notes-tab" class="stack"><label>Project notes <textarea id="admin-project-notes" rows="5"></textarea></label><div class="cluster"><button type="button" id="admin-save-notes">Save notes</button></div></section></section></div>');
const reports=()=>view('admin-reports',title('Reports','Track project delivery and completion across your workspace.', '<button type="button" id="admin-report-export">Export CSV</button>')+
  '<div class="grid widget-grid">'+stat('Delivery rate','admin-report-rate',Math.round(complete/projects.length*100)+'%','Share of projects delivered','check')+
  stat('Average completion','admin-average',Math.round(projects.reduce((s,p)=>s+p.progress,0)/projects.length)+'%','Across all project records','chart')+
  stat('Planned projects','admin-planned',projects.filter(p=>p.status==='Planned').length,'Upcoming work','flag')+'</div>'+
  '<div class="grid widget-grid" style="--dashboard-widget-min:18rem"><article class="card stack"><h2>Weekly deliveries</h2>'+staticSparkline('Delivery observations',[1,2,2,3,2,4,4],'Illustrative historical deliveries, not live analytics.')+'</article>'+
  '<article class="card stack"><h2>Completion</h2>'+ring('admin-report-ring','Delivery rate',complete,projects.length)+'<label>Project completion <progress id="admin-report-bar" value="'+complete+'" max="'+projects.length+'">'+complete+' / '+projects.length+'</progress></label></article></div>'+
  '<article class="card stack"><h2>Project status summary</h2><dl id="admin-status-summary">'+['Active','Completed','Planned'].map(s=>'<div><dt>'+s+'</dt><dd>'+projects.filter(p=>p.status===s).length+'</dd></div>').join('')+'</dl></article>');
const create=()=>view('admin-create',title('New project','Add the details and schedule for a new project.',action('Back to projects','admin-projects'))+
  '<form class="card stack" id="admin-create-form"><ol class="stepper" id="admin-create-steps" aria-label="Project creation steps"><li><button type="button" id="admin-create-basics" aria-current="step" aria-controls="admin-create-basics-panel">Basics</button></li><li><button type="button" id="admin-create-schedule" aria-controls="admin-create-schedule-panel">Schedule</button></li><li><button type="button" id="admin-create-review" aria-controls="admin-create-review-panel">Review</button></li></ol>'+
  '<section class="stack" id="admin-create-basics-panel" aria-labelledby="admin-create-basics"><h2>Project details</h2><label>Project name <input name="name" required maxlength="80" placeholder="e.g. Customer research"></label><label>Team <select name="team">'+opts(['Design','Engineering','Operations'],'Design')+'</select></label><label>Owner <select name="owner">'+opts(['Maya Chen','Sam Patel','Alex Morgan','Jordan Lee'],'Maya Chen')+'</select></label><label><input type="checkbox" name="priority"> High priority</label></section>'+
  '<section class="stack" id="admin-create-schedule-panel" aria-labelledby="admin-create-schedule"><h2>Schedule and appearance</h2><label>Due date <input type="date" name="due"></label><label>Review time <input type="time" name="time"></label><label>Project colour <input type="color" name="color" value="#80bceb"></label><label>Initial notes <textarea name="notes" rows="4"></textarea></label></section>'+
  '<section class="stack" id="admin-create-review-panel" aria-labelledby="admin-create-review"><h2>Review your project</h2><p id="admin-create-summary">Complete the previous steps to review.</p><p><small>Creates a record in this browser session only.</small></p></section>'+
  '<div class="cluster"><button type="button" id="admin-create-back">Back</button><button type="button" id="admin-create-next">Next</button><button type="submit" id="admin-create-submit" disabled>Create project</button><output id="admin-step-status" aria-live="polite"></output></div></form>');
const settings=()=>view('admin-settings',title('Settings','Workspace preferences and the shared UIBMSCSS configuration.',open('admin-appearance','Appearance settings'))+
  '<div class="split"><form class="card stack" id="admin-settings-form"><h2>Workspace profile</h2><label>Workspace name <input name="workspace" value="Studio Operations" required></label><label>Contact email <input name="email" type="email" value="admin@example.test" required></label><label>Preferred report frequency <select name="frequency">'+opts(['Weekly','Monthly','Quarterly'],'Weekly')+'</select></label><label><input name="notifications" type="checkbox" checked> Project notifications</label><button type="submit" disabled>Save settings</button></form>'+
  '<article class="panel stack"><h2>Appearance system</h2><p>Change all contextual profiles using the shared settings drawer. The selected values also apply to the documentation website.</p>'+open('admin-appearance','Configure appearance')+'<div class="grid"><article class="card" data-effect="glass">Glass</article><article class="card" data-effect="frosted">Frosted</article><article class="card" data-effect="metallic">Metallic</article><article class="card" data-effect="matte">Matte</article></div></article></div>'+
  '<article class="panel stack"><h2>Demo session</h2><p>Project changes, labels and notes are in memory. Only appearance preferences are stored locally.</p><button id="admin-reset-session" type="button">Reset demo data</button></article>');
const appearance=()=>'<dialog class="drawer" id="admin-appearance" aria-labelledby="admin-appearance-title" closedby="any"><div class="stack"><header class="cluster"><h2 id="admin-appearance-title">Appearance</h2>'+close('Close appearance')+'</header><p>Shared UIBMSCSS profiles</p><form class="stack" id="admin-appearance-form">'+profiles.map(p=>'<label>'+esc(p.label)+'<select name="'+p.key+'">'+p.values.map(v=>'<option value="'+v+'"'+(v===p.default?' selected':'')+'>'+esc(titleCase(v))+'</option>').join('')+'</select></label>').join('')+'<button type="button" id="admin-appearance-reset">Restore defaults</button><output id="admin-appearance-status" aria-live="polite"></output></form></div></dialog>';
export function renderAdminDemo(base){
  return '<a class="visually-hidden" href="#admin-main">Skip to workspace</a><div class="app-shell" id="admin-shell"><header><div><button type="button" class="sidebar-toggle" aria-label="Toggle navigation" aria-controls="admin-sidebar" aria-expanded="true">'+icon('menu')+'</button>'+open('admin-navigation','Open navigation drawer',icon('menu'),'class="sidebar-drawer-toggle" aria-label="Open navigation drawer" aria-controls="admin-navigation"')+'<a class="demo-brand" href="'+href(base,'demos')+'"><img src="'+asset(base,'assets/brand.svg')+'" width="30" height="30" alt=""> <strong id="admin-workspace-brand">Studio Operations</strong><small>UIBMSCSS demo</small></a></div>'+
  '<div>'+open('admin-commands','Search',icon('search')+'<span>Search</span>','aria-label="Search commands"')+open('admin-appearance','Appearance',icon('settings')+'<span>Appearance</span>','aria-label="Appearance"')+'<button type="button" id="admin-account" popovertarget="admin-account-menu" aria-haspopup="menu" aria-expanded="false">Account ▾</button><div class="dropdown" id="admin-account-menu" role="menu" popover="auto" aria-labelledby="admin-account" tabindex="-1"><a role="menuitem" href="#admin-settings">Workspace settings</a><a role="menuitem" href="'+href(base,'demos')+'">All demos</a><a role="menuitem" href="'+href(base,'docs/dashboard')+'">Documentation</a></div></div></header>'+
  '<dialog class="drawer drawer-start dashboard-nav-drawer" id="admin-navigation" aria-labelledby="admin-nav-title" closedby="any"><header class="cluster"><h2 id="admin-nav-title">Navigation</h2>'+close('Close navigation')+'</header></dialog>'+
  '<nav id="admin-sidebar" aria-label="Workspace navigation"><ul><li>'+navLink(routes[0],true)+'</li><li><details open><summary>'+icon('folder')+'<span>Management</span></summary><ul>'+routes.slice(1,4).map(r=>'<li>'+navLink(r)+'</li>').join('')+'</ul></details></li><li>'+navLink(routes[4])+'</li><li><a href="'+href(base,'demos')+'">'+icon('home')+'<span>All demos</span></a></li></ul></nav>'+
  '<main id="admin-main" tabindex="-1">'+overview()+projectsView()+reports()+create()+settings()+'<footer><small>UIBMSCSS · Standalone demonstration · Sample data, no backend</small></footer></main>'+
  '<dialog class="command-palette" id="admin-commands" aria-labelledby="admin-command-title"><div class="stack"><header class="cluster"><h2 id="admin-command-title">Workspace commands</h2>'+close('Close commands')+'</header><label>Search commands <input type="search" placeholder="Search pages and actions" aria-controls="admin-command-results" autofocus></label><p role="status" aria-live="polite">Available commands</p><ul id="admin-command-results">'+routes.map(([id,label])=>'<li><a href="#'+id+'">Open '+esc(label)+'</a></li>').join('')+'</ul></div></dialog>'+appearance()+
  '</div><div class="toasts" id="admin-notifications" role="region" aria-label="Notifications"></div><template id="admin-row-template">'+row({id:0,name:"",owner:"",status:"Planned",priority:false})+'</template><script type="application/json" id="admin-demo-data">'+jsonScript({profiles,projects})+'</script>';
}
