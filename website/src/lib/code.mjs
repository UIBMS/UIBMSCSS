import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import { esc } from './config.mjs';
loadLanguages(['typescript','json','bash']);
const languages={html:'HTML',css:'CSS',javascript:'JavaScript',typescript:'TypeScript',json:'JSON',bash:'Bash',text:'Text'};
export function codeBlock(source,language='html'){
  const code=String(source).replace(/\r\n/g,'\n').trim();
  const grammar=Prism.languages[language];
  const highlighted=grammar?Prism.highlight(code,grammar,language):esc(code);
  const lines=code.split('\n').map((_,i)=>String(i+1)).join('\n');
  return `<figure data-site-code><figcaption><span>${languages[language]||esc(language)}</span><span><output role="status" aria-live="polite"></output> <button type="button" data-site-copy>Copy code</button></span></figcaption><div data-site-code-body><pre aria-hidden="true" data-site-lines>${lines}</pre><pre tabindex="0" aria-label="${languages[language]||'Source'} source code"><code class="language-${esc(language)}">${highlighted}</code></pre></div></figure>`;
}
