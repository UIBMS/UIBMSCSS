// UIBMS Form Engine - optional development candidate. MIT.
const engine = (function formEngine(){
  const pad=n=>String(n).padStart(2,'0');
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const types=new Set(['date','datetime-local','time','week','month','color']);
  const mounted=new WeakMap();
  function day(y,m,d){const t=new Date(0);t.setUTCHours(0,0,0,0);t.setUTCFullYear(y,m,d);return t;}
  function formatDate(d){return String(d.getUTCFullYear()).padStart(4,'0')+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());}
  function parseDate(s){let m=/^(\d{4,})-(\d\d)-(\d\d)/.exec(s||'');if(!m)return null;let d=day(+m[1],+m[2]-1,+m[3]);return Number.isFinite(+d)&&formatDate(d)===m[0]?d:null;}
  function isoWeek(d){let q=new Date(+d);q.setUTCDate(q.getUTCDate()+4-(q.getUTCDay()||7));return String(q.getUTCFullYear()).padStart(4,'0')+'-W'+pad(Math.ceil(((q-day(q.getUTCFullYear(),0,1))/86400000+1)/7));}
  function weekStart(v){let m=/^(\d{4,})-W(\d\d)$/.exec(v||'');if(!m)return null;let d=day(+m[1],0,4);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()||7)+1+(+m[2]-1)*7);return isoWeek(d)===v?d:null;}
  function calendarDays(y,m){let d=day(y,m,1);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()||7)+1);return Array.from({length:42},(_,i)=>day(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+i));}
  function node(tag,attrs={},content=''){const el=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(v!==undefined)el.setAttribute(k,String(v));}el.textContent=content;return el;}
  const eligible=el=>el.matches('select:not([multiple])')&&el.size<=1||el.tagName==='INPUT'&&types.has(el.getAttribute('type')?.toLowerCase());
  const enabled=el=>el.closest('[data-material]')?.getAttribute('data-material')==='liquid-silicone'&&!el.matches(':disabled,[readonly]')&&!el.closest('[inert],[aria-disabled=true]');
  const valueType=el=>el.tagName==='SELECT'?'select':el.getAttribute('type').toLowerCase();
  function mountForms(root=document,options={}){
    if(mounted.has(root))return mounted.get(root);
    const adapters=new Map(),filter=typeof options.filter==='function'?options.filter:()=>true;let current=null,disposed=false,pending=false,uid=0;
    const doc=root.ownerDocument||root;
    const requestRefresh=()=>{if(pending||disposed)return;pending=true;queueMicrotask(()=>{pending=false;if(!disposed)refresh();});};
    function label(el){return Array.from(el.labels||[]).map(l=>l.textContent.trim()).filter(Boolean).join(' ')||el.getAttribute('aria-label')||el.name||valueType(el);}
    function removeAdapter(el,a){
      const wrapper=a.parentElement;
      if(wrapper?.hasAttribute('data-uibms-form-control')){
        if(el.parentElement===wrapper&&wrapper.parentNode)wrapper.before(el);
        wrapper.remove();
      }else a.remove();
      el.removeAttribute('data-uibms-form-source');
    }
    function refresh(){
      for(const [el,a] of adapters){
        if(!el.isConnected||!eligible(el)||!enabled(el)||!filter(el)){
          if(current?.el===el)close(false);removeAdapter(el,a);adapters.delete(el);
        }
      }
      for(const el of root.querySelectorAll('select,input')){
        if(!eligible(el)||!enabled(el)||!filter(el)||adapters.has(el)||el.closest('[data-uibms-form-popup]'))continue;
        const labelText=label(el),implicit=!!el.closest('label');
        // Preserve the native source in the original layout slot, with an integrated arrow.
        const wrapper=node('span',{'data-uibms-form-control':'','data-uibms-form-kind':valueType(el)});
        const a=node(implicit?'span':'button',{'data-uibms-form-trigger':'','data-material':'default',type:implicit?undefined:'button',role:implicit?'button':undefined,tabindex:implicit?'0':undefined,'aria-haspopup':'dialog','aria-expanded':'false','aria-label':'Open '+labelText+' enhanced picker',title:'Open enhanced picker'});
        a.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(el,a);});
        if(implicit)a.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();e.stopPropagation();open(el,a);}});
        el.setAttribute('data-uibms-form-source','');
        el.before(wrapper);wrapper.append(el,a);adapters.set(el,a);
      }
    }
    function close(focus=true){
      if(!current)return;
      const c=current;current=null;c.trigger.setAttribute('aria-expanded','false');c.trigger.removeAttribute('aria-controls');
      c.popup.remove();if(focus&&c.trigger.isConnected)c.trigger.focus({preventScroll:true});
    }
    function position(){
      if(!current)return;
      const {popup,trigger}=current,r=trigger.getBoundingClientRect(),width=Math.min(344,window.innerWidth-20);
      popup.style.width=width+'px';const height=popup.offsetHeight;
      popup.style.left=Math.max(10,Math.min(r.right-width,window.innerWidth-width-10))+'px';
      popup.style.top=Math.max(10,Math.min(r.bottom+8,window.innerHeight-height-10))+'px';
    }
    function open(el,trigger){
      if(!eligible(el)||!enabled(el)||!filter(el))return;
      if(current?.el===el){close();return;}close(false);
      const type=valueType(el),now=new Date(),today=day(now.getFullYear(),now.getMonth(),now.getDate());
      let date=type==='week'?weekStart(el.value):type==='month'?parseDate(el.value+'-01'):parseDate(el.value);
      date=date||today;
      const popup=node('div',{id:'uibms-form-picker-'+(++uid),'data-uibms-form-popup':'','data-material':'liquid-silicone',role:'dialog','aria-label':label(el)+' picker',tabindex:'-1'});
      // Attach to body for viewport positioning; copy the local contextual profiles.
      for(const k of ['theme','palette','shape','border','density','typography','effects']){const v=el.closest('[data-'+k+']')?.getAttribute('data-'+k);if(v)popup.setAttribute('data-'+k,v);}
      doc.body.append(popup);
      trigger.setAttribute('aria-controls',popup.id);trigger.setAttribute('aria-expanded','true');
      current={el,trigger,popup,type,y:date.getUTCFullYear(),m:date.getUTCMonth(),tab:'date',value:el.value,today};
      render();position();
      (popup.querySelector('[aria-pressed=true]')||popup.querySelector('button')||popup).focus({preventScroll:true});
    }
    function validValue(c,value){
      if(c.type==='select'){
        let i=Number(value),o=c.el.options[i];return !!o&&!o.disabled&&!o.closest('optgroup[disabled]');
      }
      const probe=c.el.cloneNode(false);probe.removeAttribute('id');probe.value=value;
      // A browser that falls back to text still receives canonical ISO values.
      return probe.value===value&&!probe.validity.rangeUnderflow&&!probe.validity.rangeOverflow&&!probe.validity.stepMismatch;
    }
    function commit(c,value){
      if(!validValue(c,value))return false;
      if(c.type==='select')c.el.selectedIndex=Number(value);else c.el.value=value;
      c.value=c.el.value;
      c.el.dispatchEvent(new Event('input',{bubbles:true}));c.el.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    }
    function group(cols,label){
      let el=node('div',{'data-uibms-form-options':'',role:'group','aria-label':label});
      el.style.setProperty('--_uibms-picker-columns',String(cols));return el;
    }
    function choice(parent,value,text,active,callback,enabled=true,ariaLabel){
      const b=node('button',{type:'button','data-uibms-form-choice':'','aria-pressed':String(active),'aria-label':ariaLabel},text);
      b.disabled=!enabled;
      b.addEventListener('click',()=>callback(b,value));parent.append(b);return b;
    }
    function mark(parent,b){for(const q of parent.querySelectorAll('button[aria-pressed]'))q.setAttribute('aria-pressed',String(q===b));}
    function toolbar(parent,title,previous,next){
      const row=node('div',{'data-uibms-form-toolbar':''});
      const a=node('button',{type:'button','aria-label':'Previous'},'‹'),b=node('button',{type:'button','aria-label':'Next'},'›');
      a.addEventListener('click',previous);b.addEventListener('click',next);row.append(a,node('strong',{},title),b);parent.append(row);
    }
    function render(){
      if(!current)return;
      const c=current,el=c.el,p=node('div',{'data-uibms-form-content':''});c.popup.replaceChildren(p);
      const title=node('div',{'data-uibms-form-toolbar':''});title.append(node('strong',{},label(el)));
      const done=node('button',{type:'button','aria-label':'Close picker'},'Done');done.addEventListener('click',()=>close());title.append(done);p.append(title);
      function choose(parent,b,value){if(commit(c,value)){mark(parent,b);updateReadout();}}
      function updateReadout(){readout.textContent=c.type==='select'?el.selectedOptions[0]?.textContent||'No selection':el.value||'No selection';}
      const readout=node('output',{'data-uibms-form-readout':'','aria-live':'polite'});
      function shift(n,year=false){if(year)c.y=Math.max(1,c.y+n);else{let d=day(c.y,c.m+n,1);c.y=Math.max(1,d.getUTCFullYear());c.m=d.getUTCMonth();}render();position();}
      if(c.type==='select'){
        const g=group(1,'Options');p.append(g);
        [...el.options].forEach((o,i)=>choice(g,String(i),o.label||o.textContent,i===el.selectedIndex,(b,v)=>choose(g,b,v),validValue(c,String(i))));
      }else if(c.type==='color'){
        const g=group(3,'Colour options');p.append(g);
        for(const v of ['#80bceb','#a58ce7','#8e234a','#77d3af','#e9bc76','#f3f1ed','#192d49','#ffffff','#000000']){
          const b=choice(g,v,v.toUpperCase(),el.value.toLowerCase()===v,(b,v)=>choose(g,b,v));const s=node('span',{'data-uibms-form-swatch':''});s.style.backgroundColor=v;b.prepend(s);
        }
        const hex=node('input',{type:'text','aria-label':'Custom hexadecimal colour',maxlength:7,value:el.value||'#000000'});hex.addEventListener('change',()=>{if(/^#[0-9a-f]{6}$/i.test(hex.value)&&commit(c,hex.value.toLowerCase())){for(const b of g.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.textContent.toLowerCase()===hex.value.toLowerCase()));updateReadout();}});p.append(hex);
      }else{
        if(c.type==='datetime-local'){
          const tabs=group(2,'Date or time');p.append(tabs);
          for(const t of ['date','time'])choice(tabs,t,t==='date'?'Date':'Time',c.tab===t,(b,v)=>{c.tab=v;render();position();p.querySelector('[aria-pressed=true]')?.focus({preventScroll:true});});
        }
        if(c.type==='month'){
          toolbar(p,String(c.y),()=>shift(-1,true),()=>shift(1,true));
          const g=group(3,'Months');p.append(g);
          months.forEach((m,i)=>{let v=String(c.y).padStart(4,'0')+'-'+pad(i+1);choice(g,v,m.slice(0,3),el.value===v,(b,v)=>choose(g,b,v),validValue(c,v));});
        }else if(c.type==='date'||c.type==='week'||c.type==='datetime-local'&&c.tab==='date'){
          toolbar(p,months[c.m]+' '+c.y,()=>shift(-1),()=>shift(1));
          const days=node('div',{'data-uibms-form-weekdays':''});for(const d of ['Mo','Tu','We','Th','Fr','Sa','Su'])days.append(node('span',{},d));p.append(days);
          const isWeek=c.type==='week',g=group(isWeek?1:7,isWeek?'Weeks':'Days');p.append(g);
          const ds=calendarDays(c.y,c.m);
          if(isWeek){for(let i=0;i<6;i++){let row=ds.slice(i*7,i*7+7),v=isoWeek(row[0]);const b=choice(g,v,'',el.value===v,(b,v)=>choose(g,b,v),validValue(c,v),v);b.setAttribute('data-uibms-form-week','');for(const d of row)b.append(node('span',{},String(d.getUTCDate())));}}
          else for(const d of ds){let date=formatDate(d),v=c.type==='datetime-local'?date+'T'+(el.value.split('T')[1]||'12:00'):date;
            const b=choice(g,v,String(d.getUTCDate()),el.value.slice(0,10)===date,(b,v)=>choose(g,b,v),validValue(c,v),date);if(d.getUTCMonth()!==c.m)b.setAttribute('data-uibms-form-adjacent','');}
        }else{
          const getTime=()=>c.type==='datetime-local'?(el.value.split('T')[1]||'12:00'):(el.value||'12:00');
          const build=(h,m)=>{const old=getTime(),time=pad(h)+':'+pad(m)+(old.length>5?old.slice(5):'');return c.type==='datetime-local'?(el.value.split('T')[0]||formatDate(c.today))+'T'+time:time;};
          const [hour,minute]=getTime().split(':').map(Number);
          p.append(node('strong',{},'Hour · 24h'));
          const hg=group(6,'Hours');p.append(hg);
          p.append(node('strong',{},'Minute'));
          const mg=group(6,'Minutes');p.append(mg);
          const exact=node('input',{type:'number',min:0,max:59,step:1,'aria-label':'Exact minute',value:minute});p.append(exact);
          function updateTimes(){const [h,m]=getTime().split(':').map(Number);for(const b of hg.children){b.setAttribute('aria-pressed',String(+b.textContent===h));b.disabled=!validValue(c,build(+b.textContent,m));}for(const b of mg.children){b.setAttribute('aria-pressed',String(+b.textContent===m));b.disabled=!validValue(c,build(h,+b.textContent));}exact.value=m;updateReadout();}
          for(let i=0;i<24;i++)choice(hg,String(i),pad(i),i===hour,(b,v)=>{if(commit(c,build(+v,+getTime().slice(3,5))))updateTimes();},validValue(c,build(i,minute)));
          for(let i=0;i<60;i+=5)choice(mg,String(i),pad(i),i===minute,(b,v)=>{if(commit(c,build(+getTime().slice(0,2),+v)))updateTimes();},validValue(c,build(hour,i)));
          exact.addEventListener('change',()=>{if(exact.value!==''&&exact.checkValidity()&&commit(c,build(+getTime().slice(0,2),+exact.value)))updateTimes();});
        }
      }
      p.append(readout);updateReadout();
    }
    function outside(e){if(current&&!current.popup.contains(e.target)&&!current.trigger.contains(e.target))close(false);}
    function keys(e){
      if(!current)return;
      if(e.key==='Escape'){e.preventDefault();close();return;}
      const group=e.target.closest('[data-uibms-form-options]');if(!group)return;
      const items=[...group.querySelectorAll('button')],i=items.indexOf(e.target),cols=Number(group.style.getPropertyValue('--_uibms-picker-columns'))||1;
      const offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.key];
      if(offset===undefined&&e.key!=='Home'&&e.key!=='End')return;
      e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?items.length-1:Math.max(0,Math.min(items.length-1,i+offset));
      const direction=(e.key==='End'||offset<0)?-1:1;while(items[n]?.disabled&&n>=0&&n<items.length)n+=direction;items[n]?.focus();
    }
    const change=e=>{if(current&&e.target===current.el&&current.value!==current.el.value){current.value=current.el.value;render();position();}};
    const reset=()=>queueMicrotask(()=>{if(current){current.value=current.el.value;render();position();}});
    doc.addEventListener('pointerdown',outside);doc.addEventListener('keydown',keys);doc.addEventListener('change',change);doc.addEventListener('reset',reset);
    window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
    const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&n.matches('input,select,option,fieldset,form,[data-material]'))))requestRefresh();});
    observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['data-material','disabled','aria-disabled','readonly','multiple','size','inert','type']});
    const api={refresh,open(el){const a=adapters.get(el);if(a)open(el,a);},close,destroy(){disposed=true;close(false);observer.disconnect();for(const [el,a] of adapters)removeAdapter(el,a);adapters.clear();doc.removeEventListener('pointerdown',outside);doc.removeEventListener('keydown',keys);doc.removeEventListener('change',change);doc.removeEventListener('reset',reset);window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);mounted.delete(root);}};
    mounted.set(root,api);refresh();return api;
  }
  return {mountForms,isoWeek,weekStart,calendarDays,formatDate,parseDate};
})();
export const {mountForms,isoWeek,weekStart,calendarDays,formatDate,parseDate}=engine;
