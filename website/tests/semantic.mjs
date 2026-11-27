// Guard the authored examples, not the compatibility API. These checks are
// intentionally for controlled project markup, not a general HTML validator.
import assert from 'node:assert/strict';

export const legacyChildClasses=new Set([
  'app-shell-grid','dashboard-workspace','sidebar-nav','sidebar-icon','sidebar-label',
  'topbar-brand','topbar-actions','page-heading','page-actions','dashboard-breadcrumb',
  'split-workspace-grid','dashboard-view','split-pane','split-handle','metric-label',
  'metric-value','metric-context','metric-change','sparkline-plot','sparkline-values',
  'stepper-panel','command-results'
]);
const optionalStyles={
  'components/tabs.css':['tabs'],
  'components/segmented.css':['segmented'],
  'components/dropdown.css':['dropdown'],
  'components/tooltip.css':['tooltip'],
  'components/drawer.css':['drawer','drawer-start','drawer-bottom'],
  'components/toast.css':['toast','toasts'],
  'components/stepper.css':['stepper','stepper-vertical'],
  'components/pagination.css':['pagination'],
  'components/chips.css':['chips','chip','tags','tag'],
  'components/command.css':['command-palette'],
  'dashboard/app-shell.css':['app-shell','sidebar-toggle','sidebar-drawer-toggle','dashboard-nav-drawer'],
  'dashboard/sidebar.css':['dashboard-sidebar'],
  'dashboard/topbar.css':['dashboard-topbar'],
  'dashboard/page-header.css':['dashboard-page-header'],
  'dashboard/split-workspace.css':['split-workspace'],
  'dashboard/metrics.css':['metric-card'],
  'dashboard/widget-grid.css':['widget-grid'],
  'dashboard/quick-actions.css':['quick-actions'],
  'dashboard/sparkline.css':['sparkline'],
  'dashboard/progress-ring.css':['progress-ring']
};
const styleByClass=new Map(Object.entries(optionalStyles).flatMap(([file,classes])=>classes.map(cls=>[cls,file])));

export function tags(html){
  const source=html.replace(/<!--[\s\S]*?-->/g,'').replace(/(<(?:script|style)\b[^>]*>)[\s\S]*?(<\/(?:script|style)>)/gi,'$1$2');
  return [...source.matchAll(/<([a-z][\w-]*)(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)].map(match=>{
    const attributes=new Map();
    for(const a of match[0].slice(match[1].length+1,-1).matchAll(/\s([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))
      attributes.set(a[1].toLowerCase(),a[2]??a[3]??a[4]??'');
    return {name:match[1].toLowerCase(),attributes};
  });
}
const classesOf=tag=>(tag.attributes.get('class')||'').trim().split(/\s+/).filter(Boolean);
export function assertPreferredMarkup(html,label){
  for(const tag of tags(html)){
    // The project's preferred components use native HTML, not custom tags.
    assert(!tag.name.includes('-'),label+' custom element '+tag.name);
    const classes=classesOf(tag);
    assert.equal(new Set(classes).size,classes.length,label+' duplicate class token');
    for(const cls of classes)assert(!legacyChildClasses.has(cls),label+' obsolete child class '+cls);
  }
}
export function assertPreferredScript(source,label){
  for(const cls of legacyChildClasses)
    assert(!new RegExp('\\.'+cls+'(?![\\w-])').test(source),label+' obsolete class selector '+cls);
}
export function requiredStyles(html){
  return new Set(tags(html).flatMap(tag=>classesOf(tag).map(cls=>styleByClass.get(cls)).filter(Boolean)));
}
export function assertDocumentReferences(html,label){
  const elements=tags(html),ids=new Map();
  for(const tag of elements){
    const id=tag.attributes.get('id');if(!id)continue;
    assert(!ids.has(id),label+' duplicate id '+id);ids.set(id,tag);
  }
  for(const {name,attributes:a} of elements){
    for(const key of ['aria-controls','aria-labelledby','aria-describedby','commandfor','popovertarget','for']){
      if(key==='for'&&!['label','output'].includes(name))continue;
      for(const id of (a.get(key)||'').trim().split(/\s+/).filter(Boolean)){
        const target=ids.get(id);
        assert(target,label+' unresolved '+key+'='+id);
        if(key==='popovertarget')assert(target.attributes.has('popover'),label+' target is not a popover '+id);
        if(key==='commandfor'&&a.get('command')==='show-modal')assert.equal(target.name,'dialog',label+' modal target '+id);
      }
    }
    const href=a.get('href');
    if(href?.startsWith('#')&&href.length>1)assert(ids.has(decodeURIComponent(href.slice(1))),label+' unresolved fragment '+href);
  }
}
