// Bounded page-window generation; no dependencies or network requests.
const instances=new WeakMap();
const integer=(n,fallback,min,max)=>Number.isFinite(n)?Math.min(max,Math.max(min,Math.floor(n))):fallback;
export function pageWindow(current,total,siblings=1){
  total=integer(total,1,1,Number.MAX_SAFE_INTEGER);current=integer(current,1,1,total);siblings=integer(siblings,1,0,10);
  const start=Math.max(1,Math.min(current-siblings,total-2*siblings));
  const end=Math.min(total,Math.max(current+siblings,1+2*siblings));
  const numbers=new Set([1,total]);for(let n=start;n<=end;n++){numbers.add(n);if(n===end)break;}
  const sorted=[...numbers].sort((a,b)=>a-b),out=[];
  for(const n of sorted){const last=out[out.length-1];if(typeof last==='number'&&n-last===2)out.push(last+1);else if(typeof last==='number'&&n-last>2)out.push('ellipsis');out.push(n);}
  return out;
}
export function mountPagination(nav,{current=1,total=1,siblings=1,onChange=null,labels={}}={}){
  if(instances.has(nav))return instances.get(nav);
  if(!nav?.matches('nav.pagination')||nav.children.length)throw new TypeError('Expected an empty pagination nav');
  const doc=nav.ownerDocument,names={previous:'Previous',next:'Next',page:n=>'Page '+n,ellipsis:'More pages',...labels};
  total=integer(total,1,1,Number.MAX_SAFE_INTEGER);current=integer(current,1,1,total);
  const ul=doc.createElement('ul');nav.append(ul);let dead=false,controls=new Map();
  function render(){
    const active=doc.activeElement;
    const oldKey=[...controls].find(([,el])=>el===active)?.[0];
    controls=new Map();const fragment=doc.createDocumentFragment();
    function add(label,key,value,disabled=false,selected=false,ariaLabel=label){
      const li=doc.createElement('li'),b=doc.createElement('button');b.type='button';b.textContent=label;b.value=String(value);
      b.disabled=disabled;b.setAttribute('aria-label',ariaLabel);if(selected)b.setAttribute('aria-current','page');
      controls.set(key,b);li.append(b);fragment.append(li);
    }
    add(names.previous,'previous',current-1,current===1);
    for(const n of pageWindow(current,total,siblings)){
      if(n==='ellipsis'){const li=doc.createElement('li'),span=doc.createElement('span');span.textContent='…';span.setAttribute('aria-label',names.ellipsis);li.append(span);fragment.append(li);}
      else add(String(n),'page-'+n,n,false,n===current,names.page(n));
    }
    add(names.next,'next',current+1,current===total);ul.replaceChildren(fragment);
    if(oldKey){const next=controls.get(oldKey);(next&&!next.disabled?next:controls.get('page-'+current))?.focus({preventScroll:true});}
  }
  function setPage(value,{notify=true}={}){
    if(dead||!Number.isFinite(value))return false;
    const page=integer(value,current,1,total);if(page===current)return false;
    const detail={previous:current,page,total};
    if(notify&&!nav.dispatchEvent(new CustomEvent('beforepagechange',{bubbles:true,cancelable:true,detail})))return false;
    current=page;render();
    if(notify){nav.dispatchEvent(new CustomEvent('pagechange',{bubbles:true,detail}));if(typeof onChange==='function')onChange(page,detail);}
    return true;
  }
  const click=e=>{const b=e.target.closest?.('button');if(b&&ul.contains(b)&&!b.disabled)setPage(Number(b.value));};
  ul.addEventListener('click',click);
  const api={setPage,setTotal(n){if(dead)return;total=integer(n,total,1,Number.MAX_SAFE_INTEGER);current=Math.min(current,total);render();},
    get current(){return current;},get total(){return total;},destroy(){if(dead)return;dead=true;ul.removeEventListener('click',click);ul.remove();controls.clear();instances.delete(nav);}};
  instances.set(nav,api);render();return api;
}
