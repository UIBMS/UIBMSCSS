import {staticSparkline} from '../lib/sparkline.mjs';
import {profiles,configDetails,titleCase} from '../lib/config.mjs';
import {framework} from '../lib/contract.mjs';
import {expressivePalettes,oklch,paletteRoles} from '../lib/expressive-palettes.mjs';
import {demos} from './demos.mjs';
// A single authoritative navigation/content catalog. Trusted authored HTML only.
const section=(title,body,examples=[],extra={})=>({title,body,examples,...extra});
const example=(label,html,extra={})=>({label,html,code:html,lang:'html',...extra});
const snippet=(label,code,lang='html')=>({label,code,lang});
// Shared consumer example: native dialog commands first, optional fallback only.
const drawerFallback=`const invoker = document.createElement('button');
if (!('commandForElement' in invoker && 'command' in invoker &&
      'closedBy' in document.createElement('dialog'))) {
  const {mountDrawers} = await import('./engines/components/drawer.mjs');
  mountDrawers(document);
}`;
const page=(slug,title,description,sections,extra={})=>({slug,title,description,sections:sections.map(section=>({
  ...section,examples:section.examples.map(item=>item.code===undefined?{...item,code:item.html}:item)
})),...extra});
const doc=(slug,title,description,sections,extra={})=>page('docs/'+slug,title,description,sections,extra);
const componentDoc=(slug,title,description,sections,stylesheet=slug)=>doc(slug,title,description,sections,{stylesheets:['components/'+stylesheet+'.css']});
const notice='This is a development release candidate. Browser support and full accessibility conformance have not been certified.';
const table=(heads,rows)=>`<div data-site-table-scroll data-site-reference-table role="region" tabindex="0" aria-label="${heads.join(' / ')}"><table><thead><tr>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${cell}</th>`:`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const mono=s=>`<code>${s}</code>`;
const docs=[];
const group=(title,pages)=>{docs.push({title,pages});return pages;};
group('Getting started',[
 doc('introduction','Introduction','A native CSS foundation for humans and AI coding agents.',[
  section('HTML first','<p>UIBMS CSS styles meaningful HTML without requiring a component library, a JavaScript runtime, mandatory wrappers or a utility vocabulary. Use classes for meaningful reusable layout and styling patterns, native elements for component content, and contextual CSS nesting for internal styling. Use data attributes for configuration and individual effects, not as replacements for styling classes. No custom HTML component tags are required.</p>',[example('A native interface',`<article class="card stack">\n  <h2>Project workspace</h2>\n  <p>Use semantic HTML and a few meaningful classes.</p>\n  <div class="cluster">\n    <button type="button">Continue</button>\n    <a href="#html-first">Learn more</a>\n  </div>\n</article>`)]),
  section('Design principles','<p>Minimal by default; native browser semantics; context-aware tokens; predictable cascade; progressively enhanced interactions; developer freedom. UIBMS CSS targets applicable WCAG 2.2 AAA requirements but is not a certification of a site.</p>'),
  section('Development status',`<p>${notice} The project is licensed under MIT. No official release version has been selected. The regenerated CSS candidate has recorded Chromium release and responsive-table verification. The documentation site has a separate deployment regression suite; Firefox/WebKit and comprehensive accessibility verification remain open.</p>`)
 ]),
 doc('installation','Installation','Choose a single distribution. No consumer-side compilation or JavaScript is required.',[
  section('Global adoption','<p>Copy the selected stylesheet from the repository distribution directory to your project. Include it once in the document head.</p>',[snippet('Standard global','<link rel="stylesheet" href="dist/uibms.min.css">'),snippet('All available palettes and motion profiles','<link rel="stylesheet" href="dist/uibms.full.min.css">')]),
  section('Scoped adoption','<p>Use a scoped distribution for an explicitly marked region within an existing website. Do not combine global and scoped bundles in the same adoption example. Native @scope support is required.</p>',[snippet('Scoped full','<link rel="stylesheet" href="dist/uibms.scoped.full.min.css">\n<section data-uibms>\n  <button>Continue</button>\n</section>')]),
  section('Optional extensions','<p>Load the standard distribution first and compatible extensions afterward. Scoped variants require matching scoped extensions.</p>',[snippet('Load Ocean and Fluid','<link rel="stylesheet" href="dist/uibms.min.css">\n<link rel="stylesheet" href="dist/extensions/palettes/ocean.min.css">\n<link rel="stylesheet" href="dist/extensions/profiles/effects-fluid.min.css">')])
 ]),
 doc('quick-start','Quick start','Build a semantic page, then add optional layout and configuration.',[
  section('Complete page','<p>Use a single global stylesheet and put sitewide configuration on the HTML root. The HTML below is a complete starting point.</p>',[snippet('Minimal document',`<!doctype html>\n<html lang="en" data-theme="auto" data-palette="natural">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My UIBMS page</title>\n  <link rel="stylesheet" href="dist/uibms.min.css">\n</head>\n<body>\n  <main class="container">\n    <h1>Welcome</h1>\n    <article class="card stack">\n      <h2>Ready to build</h2>\n      <p>Start with meaningful HTML.</p>\n      <button type="button">Continue</button>\n    </article>\n  </main>\n</body>\n</html>`)]),
  section('Rendered content','<p>The same interface inherits the appearance selected in this website header.</p>',[example('Workspace',`<section class="container">\n  <h2>Welcome</h2>\n  <article class="card stack">\n    <h3>Ready to build</h3>\n    <p>Start with meaningful HTML.</p>\n    <button type="button">Continue</button>\n  </article>\n</section>`)]),
  section('Next steps','<p>Explore native elements, choose configuration, and compose layouts. All examples use the actual framework distribution.</p>')
 ]),
 doc('distributions','Distributions',`${framework.mainStylesheets.length} main stylesheets and ${framework.extensionStylesheets.length} optional extension variants.`,[
  section('Choose a bundle',`<p>Standard includes the natural palette, native element styling, ${framework.classes.length} classes, essential contextual profiles and initial effects. Full adds optional palettes and motion profiles. Each is available in readable and minified global/scoped versions.</p>`,[],{manifest:'main'}),
  section('Extensions','<p>Optional extensions are independently loadable. Select one principal distribution and only the extensions needed; full already includes them.</p>',[],{manifest:'extensions'}),
  section('Integrity and support','<p>Sizes and SHA-256 digests are read directly from the generated manifest. The downloadable artifacts are the unchanged framework distributions. A scoped build is not a global fallback on unsupported browsers.</p>')
 ])
]);
group('Foundation',[
 doc('architecture','Architecture','Responsibility-based native CSS architecture.',[
  section('Separation of concerns',table(['Mechanism','Responsibility'],[['Semantic HTML','Content and native behavior'],['Classes','Reusable layout and styling'],['Contextual data attributes','Inherited configuration'],['Individual data attributes','Explicit visual effects'],['Custom properties','Meaningful design values'],['Pseudo-classes','Native interaction states']])),
  section('Contextual component markup','<p>First use the native element defaults. Add a meaningful component class only when a distinct reusable pattern is needed, and keep compatible surface or layout classes when they provide a real benefit. Use native direct children and contextual nesting instead of child-specific classes. Scope selectors narrowly and keep specificity low. The following project-summary class is application CSS, not a new UIBMS class.</p>',[
    snippet('Native component structure',`<article class="card project-summary">
  <header><h2>Projects</h2></header>
  <p>12 active projects</p>
  <footer><small>Updated today</small></footer>
</article>`),
    snippet('Contextual application CSS',`:where(.project-summary) {
  display: grid;
  gap: var(--space);

  & > :where(header) > :where(h2) {
    margin: 0;
  }
  & > :where(footer) {
    color: var(--color-text-muted);
  }
}`,'css')
  ]),
  section('Mathematically derived contextual geometry','<p>GEO-002 is an approved engineering principle. Derive related sizes from existing typography, density, shape, border and target-size tokens. Use native logical CSS, intrinsic layouts and bounded math instead of independent magic numbers. A shared inset corner has radius max(0, outer radius - padding - border); single-line optical spacing follows the actual font metrics. Keep native controls and accessible hit areas intact, respect explicit overrides, and use ordinary CSS fallbacks. This is not a new class system or geometry runtime.</p>',[
    example('Shared inset corner and line-based editing space',`<div class="grid" data-shape="organic">
  <details open data-density="compact">
    <summary>Compact inset corner</summary>
    <p>The summary radius follows its enclosing details.</p>
    <label>Notes <textarea>Four lines of editing space.</textarea></label>
  </details>
  <details open data-density="spacious">
    <summary>Spacious inset corner</summary>
    <p>More padding reduces the shared inner radius.</p>
    <label>Notes <textarea>The field follows its font and density.</textarea></label>
  </details>
</div>`),
    snippet('Concentric corner relationship',`:where(details) {
  --_uibms-disclosure-padding: calc(var(--space) * 0.75);
  --_uibms-disclosure-inner-radius: max(0px,
    calc(var(--radius) - var(--_uibms-disclosure-padding) - var(--border-width)));
  padding: var(--_uibms-disclosure-padding);
}
:where(details > summary) {
  border-radius: var(--_uibms-disclosure-inner-radius, var(--radius));
}`,'css')
  ]),
  section('Source structure','<p>The maintained source is in src/. The distribution packager assembles native imports, preserving the CSS cascade. Generated bundles are not edited manually.</p>',[snippet('Source entry excerpt','@layer reset, defaults, configuration, features, preferences;\n@layer defaults.contexts;\n@import url("reset/reset.css");\n@import url("tokens/colors.css");','css')]),
  section('Scoped adoption','<p>The optional scope marker is data-uibms (presence only). Scoping limits selector matching, not every possible interaction with the host cascade.</p>')
 ]),
 doc('cascade','Cascade layers','A predictable, low-specificity native cascade.',[
  section('Layer order',table(['Layer','Purpose'],[['reset','Minimal box sizing and form font reset'],['defaults','Design tokens, native element styling and optional default interaction feedback'],['configuration','Contextual profiles and palettes'],['features','Explicit class patterns and requested effects'],['preferences','User preference adjustments and accessibility-sensitive fallbacks']]),[snippet('Layer declaration','@layer reset, defaults, configuration, features, preferences;\n@layer defaults.contexts;','css')]),
  section('Ordinary CSS overrides','<p>Normal unlayered author rules can override layered UIBMS rules. Most framework selectors use :where() to deliberately reduce specificity. Avoid treating priority as a reason to add unnecessary !important declarations.</p>',[snippet('Application CSS','button { border-radius: 0; }','css')]),
  section('Contexts sublayer','<p>defaults.contexts establishes foreground/background and contextual typography below the rest of defaults, so semantic elements can retain their own native styling.</p>')
 ]),
 doc('tokens','Design tokens','The meaningful custom properties used by the framework.',[
  section('Color roles',`<p>The framework exposes ${framework.colorRoles.length} color roles. Light and dark values resolve in their consuming context. These swatches inherit the sitewide palette and scheme and report their resolved colors.</p>`,[],{swatches:framework.colorRoles}),
  section('Typography',table(['Token','Default'],[[mono('--font-family'),'system-ui, sans-serif'],[mono('--font-family-mono'),'ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace'],[mono('--font-size'),'1rem'],[mono('--line-height'),'1.6'],[mono('--heading-line-height'),'1.2'],[mono('--reading-width'),'65ch'],[mono('--heading-weight'),'650 (consumer fallback)'],[mono('--heading-scale'),'1 (consumer fallback)']])),
  section('Geometry and spacing',table(['Token','Default'],[[mono('--space'),'1rem'],[mono('--radius'),'0.5rem'],[mono('--border-width'),'1px'],[mono('--target-size'),'max(44px, 2.75rem)'],[mono('--shadow'),'0 0.25rem 1rem with scheme-aware opacity']])),
  section('Motion',table(['Token','Default'],[[mono('--motion-duration'),'180ms'],[mono('--motion-easing'),'cubic-bezier(.2, .7, .3, 1)'],[mono('--motion-distance'),'0.25rem']])),
  section('Customize a context','<p>Custom properties can be overridden with ordinary CSS. Avoid changing internal --_ channels; they are implementation details.</p>',[snippet('Local spacing and geometry','.workspace {\n  --space: 1.25rem;\n  --radius: 0.75rem;\n}','css')])
 ])
]);
group('Configuration',[
 doc('configuration','Configuration overview',`${profiles.length} independent, inheritable contextual properties, including optional material.`,[
  section('Sitewide and local settings','<p>Use one value per contextual attribute. Omission and unrecognized values preserve the inherited/default behavior; explicit default restores the applicable defaults where supported. The header Appearance menu is the only sitewide configuration control on this website.</p>',[example('Nested independent contexts',`<section class="card stack" data-theme="dark" data-palette="ocean">\n  <h3>Ocean / dark</h3>\n  <article class="card stack" data-theme="light" data-density="compact">\n    <p>Light, compact, still Ocean.</p>\n    <button type="button">Continue</button>\n  </article>\n</section>`)]),
  section('Contextual attributes',table(['Attribute','Role'],profiles.map(p=>[mono('data-'+p.key),configDetails[p.key].description])))
 ]),
 ...profiles.map(p=>{const d=configDetails[p.key];const values=d.values;return doc(p.key,p.label,d.description,[
  section('Supported values',table(['Value','Behavior'],values.map(([v,desc])=>[mono(v),desc]))),
  section('Live examples','<p>The first example inherits every sitewide setting. Each subsequent comparison overrides only the attribute being explained. Other settings still inherit from the page.</p>',[example('Current site appearance',`<section class="card stack">\n  <h3>Inherited appearance</h3>\n  <p>Changes with the website Appearance menu.</p>\n  <button type="button">Try button</button>\n</section>`),...values.map(([v])=>example(titleValue(v),`<section class="card stack" data-${p.key}="${v}">\n  <h3>${titleValue(v)} ${p.label.toLowerCase()}</h3>\n  <p>Context-aware native content.</p>\n  <button type="button">Continue</button>\n</section>`))]),
  ...(p.key==='palette'?[section('Expressive OKLCH collection','<p>Five new palette experiments: 60% dominant, 30% secondary and 10% loud accent. Select a palette in Appearance to explore it across the site. These local previews use the original proposed colour triplets in their intended scheme; the alternate theme exchanges the main and secondary roles. The examples retain a subtle tonal hover and use the loud accent on press. The optional stylesheet is separate from the released core and full bundles.</p>',expressivePalettes.map(p=>expressiveExample(p)))]:[]),
  section('Inheritance and limits',`<p>${d.note}</p>`)
 ]);})
]);
function expressiveExample(p){
  const colors=p.colors.map(oklch);
  return example(p.name+' / original '+p.scheme+' scheme',`<section class="stack" data-palette="${p.id}" data-theme="${p.scheme}" style="padding:var(--space);border-radius:var(--radius)">
  <h3>${p.name}</h3>
  <p>${p.description}</p>
  <div style="display:grid;grid-template-columns:6fr 3fr 1fr;min-block-size:3rem;border:var(--border-width) solid var(--color-border);border-radius:var(--radius);overflow:hidden">
    <div style="background:var(--color-main);color:var(--color-on-main);display:grid;place-items:center;font-size:.75em">60%</div>
    <div style="background:var(--color-secondary);color:var(--color-on-secondary);display:grid;place-items:center;font-size:.75em">30%</div>
    <div style="background:var(--color-loud);color:var(--color-on-loud);display:grid;place-items:center;font-size:.75em">10%</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,10rem),1fr));gap:calc(var(--space)*.75)">
    <div class="stack" style="background:var(--color-secondary);color:var(--color-on-secondary);padding:var(--space);border-radius:var(--radius)">
      <small>Workspace</small>
      <strong style="font-size:1.5em">84%</strong>
      <div style="background:var(--color-loud);color:var(--color-on-loud);padding:.4em;border-radius:var(--radius)">Performance</div>
    </div>
    <div class="panel stack">
      <strong>Make it happen.</strong>
      <p>Try the button: subtle hover, loud press.</p>
      <button type="button">Continue</button>
    </div>
  </div>
  <small>Dominant: ${colors[0]}</small>
  <small>Secondary: ${colors[1]}</small>
  <small>Loud: ${colors[2]}</small>
</section>`);
}
function titleValue(v){return titleCase(v);}
group('Native elements',[
 doc('elements','Native HTML overview','Use HTML semantics before choosing classes or effects.',[
  section('Native element groups','<p>The framework covers typography, actions, form controls, lists, tables, native interactive elements, indicators, technical content and media. Structural elements do not automatically become layout patterns or cards.</p>',[example('Semantic content',`<article>\n  <header><h3>Article heading</h3></header>\n  <p>Meaningful content and <a href="#native-element-groups">links</a>.</p>\n  <footer><small>Article footer</small></footer>\n</article>`)]),
  section('Interaction semantics','<p>Use real buttons, links, labels and native form controls. CSS does not implement behavior for an aria-disabled link, a custom role or a dialog-opening event. Keep necessary behavior in HTML or application JavaScript.</p>')
 ]),
 doc('headings','Headings & paragraphs','Responsive headings and readable body typography.',[
  section('Heading hierarchy','<p>Use heading levels to describe content structure, not to choose a font size. The first two heading sizes are fluid; all six consume the heading scale and weight.</p>',[example('Heading scale',`<h1>Heading 1</h1>\n<h2>Heading 2</h2>\n<h3>Heading 3</h3>\n<h4>Heading 4</h4>\n<h5>Heading 5</h5>\n<h6>Heading 6</h6>\n<p>A paragraph of readable native text.</p>\n<small>Supporting small text.</small>`)]),
  section('Text width and line height','<p>Body text inherits the typography profile. The lead class consumes the reading-width token. Ordinary paragraphs are not automatically constrained to that width.</p>')
 ]),
 doc('text-elements','Inline text & quotations','Native inline semantics, quotations and separators.',[
  section('Inline semantics','<p>Strong/bold and mark have explicit rules; other inline semantics retain native browser behavior and inherited typography.</p>',[example('Inline text',`<p><strong>Important</strong>, <em>emphasized</em>, <b>bold</b>, <i>alternate voice</i>, <mark>marked</mark>, <small>small</small>, <abbr title="Cascading Style Sheets">CSS</abbr>.</p>\n<p><del>Old text</del> <ins>New text</ins>, H<sub>2</sub>O and x<sup>2</sup>.</p>\n<p><q>Inline quote</q> from <cite>Example publication</cite>.</p>`)]),
  section('Block quotation and divider','<p>Blockquotes receive an inline-start border and spacing; hr receives a semantic border separator.</p>',[example('Quote',`<blockquote>\n  <p>Keep the platform native.</p>\n  <cite>UIBMS design principles</cite>\n</blockquote>\n<hr>\n<p>Next section.</p>`)]),
  section('Accessibility','<p>Do not use color alone to identify meaningful text; mark retains an underline. Use semantic markup appropriate to the meaning.</p>')
 ]),
 doc('links','Links','Underlined native navigation and interaction states.',[
  section('Basic links','<p>Links use the accent role, underline and visible focus. Hover strengthens the underline; active uses a double underline.</p>',[example('Navigation and target',`<p><a href="#link-destination">Jump to a section</a> · <a href="https://github.com/UIBMS/UIBMSCSS">Source repository</a></p>\n<p id="link-destination">A native fragment destination.</p>`)]),
  section('Disabled semantics','<p>aria-disabled is styled but does not disable navigation. An unavailable destination can be represented without href; application behavior must enforce any disabled state.</p>',[example('Unavailable link',`<a aria-disabled="true">Unavailable destination</a>`,{note:'Without href this is not an actionable link.'})])
 ]),
 doc('buttons','Buttons','Native button controls with theme-aware styling and interaction feedback.',[
  section('Basic usage','<p>No mandatory classes. Use button for an action; use an anchor for navigation. Default buttons use a lightly tinted surface and progressive hover and press states.</p>',[example('Button states',`<div class="cluster">\n  <button type="button">Continue</button>\n  <button type="button" disabled>Disabled</button>\n  <input type="button" value="Input button">\n</div>`)]),
  section('Optical button geometry','<p>Inspired by the optical-spacing demonstration: an unsized decorative SVG uses the button’s line height, and the gap accounts for the font cap height. Use one direct visible span for the label, before or after the SVG, without a child class. For an icon-only action, supply an accessible aria-label. The nominal inner radius and half-height are derived from the existing space, radius, border and target-size tokens. The area correction compensates for rounded ends; logical margins work in both writing directions. Ordinary text buttons and explicitly sized SVGs keep their existing behavior. Browsers without typed CSS arithmetic retain normal padding and icon alignment. The local pill example derives its radius from existing geometry; no new global shape profile is required. Multiline or externally resized controls retain normal wrapping, but the mathematical correction is an approximation of single-line geometry.</p>',[
    example('Optical spacing in the current shape',"<div class=\"cluster\">\n  <button type=\"button\">\n    <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m7 12 3 3 7-7\"/></svg>\n    <span>Approve</span>\n  </button>\n  <button type=\"button\">\n    <span>Approve</span>\n    <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m7 12 3 3 7-7\"/></svg>\n  </button>\n  <button type=\"button\" aria-label=\"Approve\">\n    <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m7 12 3 3 7-7\"/></svg>\n  </button>\n  <button type=\"button\"><span>Approve</span></button>\n</div>"),
    example('Pill buttons without extra classes',"<div class=\"cluster\" style=\"--radius: calc(var(--target-size) + 1lh + var(--space))\">\n  <button type=\"button\">\n    <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m7 12 3 3 7-7\"/></svg>\n    <span>Approve</span>\n  </button>\n  <button type=\"button\">\n    <span>Approve</span>\n    <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m7 12 3 3 7-7\"/></svg>\n  </button>\n  <button type=\"button\" aria-label=\"Approve\">\n    <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m7 12 3 3 7-7\"/></svg>\n  </button>\n  <button type=\"button\"><span>Approve</span></button>\n</div>")
  ]),
  section('Form action types','<p>Choose button, submit or reset deliberately. The native control determines behavior.</p>',[example('Reset a form',`<form class="stack">\n  <label for="button-reset">Name</label>\n  <input id="button-reset" value="Original value">\n  <div class="cluster">\n    <button type="reset">Reset</button>\n    <button type="button">Action</button>\n  </div>\n</form>`)]),
  section('Interaction and accessibility','<p>Hover, press and keyboard focus retain meaningful state feedback. Buttons have a minimum target size and disabled state. aria-disabled styling alone does not suppress application events. Use actual disabled when possible.</p>',[example('Optional explicit effects',`<button type="button" data-hover="lift glow" data-active="press" data-focus="glow">\n  Try hover, press and focus\n</button>`)]),
  section('Native input variants','<p>Input buttons and file selector buttons share the appropriate native button appearance. There are no invented primary/secondary button classes.</p>')
 ]),
 doc('text-inputs','Text inputs & textarea','Native editable text controls, labels and read-only states.',[
  section('Common controls','<p>Text-like inputs, select and textarea use the surface, border and radius tokens. Focus is drawn inside the field. Every control should have an accessible label.</p>',[example('Text fields',`<div class="stack">\n  <label for="input-name">Name</label>\n  <input id="input-name" type="text" autocomplete="name" placeholder="Full name">\n  <label for="input-email">Email</label>\n  <input id="input-email" type="email" autocomplete="email">\n  <label for="input-password">Password</label>\n  <input id="input-password" type="password" autocomplete="new-password">\n  <label for="input-search">Search</label>\n  <input id="input-search" type="search">\n  <label for="input-url">Website</label>\n  <input id="input-url" type="url" placeholder="https://example.com">\n  <label for="input-phone">Telephone</label>\n  <input id="input-phone" type="tel" autocomplete="tel">\n  <label for="input-note">Message</label>\n  <textarea id="input-note" rows="3">A native textarea.</textarea>\n</div>`)]),
  section('Read-only and disabled','<p>Read-only values remain selectable; disabled native controls do not accept input. Placeholder styling never replaces a label.</p>',[example('Read-only and disabled',`<div class="stack">\n  <label for="read-only-field">Read-only reference</label>\n  <input id="read-only-field" value="REF-001" readonly>\n  <label for="disabled-field">Disabled input</label>\n  <input id="disabled-field" disabled value="Unavailable">\n  <label for="read-only-area">Read-only notes</label>\n  <textarea id="read-only-area" readonly>Read-only text.</textarea>\n</div>`)]),
  section('Native behavior','<p>Autofill, password managers and browser input semantics remain native; UIBMS does not replace them with a JavaScript component.</p>')
 ]),
 doc('selection','Selection controls','Native select, checkbox, radio and range controls.',[
  section('Select','<p>Use native option and optgroup elements. Browsers that support customizable native selects display a themed picker with motion. Other browsers use their standard picker.</p>',[example('Selection',`<div class="stack">\n  <label for="select-project">Project</label>\n  <select id="select-project">\n    <optgroup label="Active">\n      <option>Website</option>\n      <option>Documentation</option>\n    </optgroup>\n    <optgroup label="Archived">\n      <option disabled>Legacy</option>\n    </optgroup>\n  </select>\n  <label for="select-multi">Choose multiple</label>\n  <select id="select-multi" multiple size="3">\n    <option>Design</option>\n    <option>Development</option>\n    <option>Testing</option>\n  </select>\n</div>`)]),
  section('Checkbox and radio','<p>Native check and radio controls use accent-color. Wrapping labels expand the usable target while keeping the native glyph compact.</p>',[example('Choice controls',`<fieldset>\n  <legend>Notifications</legend>\n  <label><input type="checkbox" checked> Email</label>\n  <label><input type="checkbox"> Updates</label>\n  <label><input type="checkbox" disabled> Unavailable</label>\n</fieldset>\n<fieldset>\n  <legend>Delivery</legend>\n  <label><input type="radio" name="delivery" checked> Standard</label>\n  <label><input type="radio" name="delivery"> Express</label>\n</fieldset>`),example('Indeterminate checkbox',`<label><input type="checkbox" id="mixed-choice"> Select all</label>`,{scripts:[{lang:'javascript',code:'document.getElementById("mixed-choice").indeterminate = true;'}],run:'indeterminate'})]),
  section('Range','<p>Use native ranges with accessible labels and meaningful min/max/step. No custom slider implementation is required.</p>',[example('Native range',`<label for="native-range">Volume</label>\n<input id="native-range" type="range" min="0" max="100" value="60">`)])
 ]),
 doc('special-inputs','Specialized inputs','Native numeric, date/time, file and color inputs.',[
  section('Numeric and date/time fields','<p>The browser controls native pickers and locale formatting. The framework preserves their semantics.</p>',[example('Specialized inputs',`<div class="stack">\n  <label for="input-qty">Quantity</label>\n  <input id="input-qty" type="number" min="1" max="10" value="2">\n  <label for="input-date">Date</label>\n  <input id="input-date" type="date">\n  <label for="input-time">Time</label>\n  <input id="input-time" type="time">\n  <label for="input-datetime">Local date and time</label>\n  <input id="input-datetime" type="datetime-local">\n  <label for="input-month">Month</label>\n  <input id="input-month" type="month">\n  <label for="input-week">Week</label>\n  <input id="input-week" type="week">\n</div>`)]),
  section('Files and color','<p>File selector buttons receive native button styling. Color picker dimensions follow the target-size token. Selecting a file here does not upload it.</p>',[example('Local file and color',`<div class="stack">\n  <label for="input-file">Choose a local file</label>\n  <input id="input-file" type="file">\n  <label for="input-color">Choose a color</label>\n  <input id="input-color" type="color" value="#347060">\n</div>`)]),
  section('Hidden and image inputs','<p>Hidden inputs remain hidden. Image input controls preserve their native image rendering and submit semantics; provide alt text and a deliberate form action.</p>',[example('Native input image',`<form>\n  <input type="hidden" name="source" value="demo">\n  <input type="image" src="{{base}}assets/material.svg" alt="Submit example" width="120" height="68">\n</form>`,{note:'The documentation demonstration prevents network submission.'})])
 ]),
 doc('form-validation','Forms & validation','Native constraint validation and accessible form grouping.',[
  section('Grouping','<p>Fieldset and legend provide semantic grouping. The focused control has its own inset indicator. Use required, type and other native constraints.</p>',[example('Validation demo',`<form class="stack">\n  <fieldset class="stack">\n    <legend>Contact information</legend>\n    <label for="validation-email">Email (required)</label>\n    <input id="validation-email" type="email" required>\n    <label for="validation-name">Name (required)</label>\n    <input id="validation-name" required minlength="2">\n  </fieldset>\n  <div class="cluster">\n    <button type="submit">Validate</button>\n    <button type="reset">Reset</button>\n  </div>\n</form>`,{note:'This demo prevents successful submission; native validation is real.'})]),
  section('Explicit error state','<p>The user-invalid state avoids styling an untouched empty field as an error. aria-invalid=true also activates the error border. Supply explanatory text and associate it using aria-describedby.</p>',[example('Accessible invalid input',`<div class="stack">\n  <label for="invalid-email">Email</label>\n  <input id="invalid-email" type="email" value="not-an-email" aria-invalid="true" aria-describedby="email-error">\n  <small id="email-error">Enter a valid email address.</small>\n</div>`)]),
  section('States','<p>user-valid uses the success border; invalid uses a dashed danger border. Native validation, checked/indeterminate state and focus are preserved. CSS does not perform business validation or submit data.</p>')
 ]),
 doc('lists','Lists','Native ordered, unordered and description lists.',[
  section('List structure','<p>Lists receive logical inline padding and contextual spacing; description terms receive stronger weight.</p>',[example('List types',`<ul>\n  <li>Semantic HTML</li>\n  <li>Native CSS\n    <ul><li>Design tokens</li><li>Contextual profiles</li></ul>\n  </li>\n</ul>\n<ol>\n  <li>Install a distribution.</li>\n  <li>Build an interface.</li>\n</ol>\n<dl>\n  <dt>Palette</dt><dd>Coordinated semantic colors.</dd>\n  <dt>Theme</dt><dd>Light or dark color scheme.</dd>\n</dl>`)]),
  section('Accessibility','<p>Keep list markup semantic. Application navigation may override native spacing without changing framework classes.</p>')
 ]),
 doc('tables','Tables','Semantic table structure and responsive behavior.',[
  section('Table anatomy','<p>Use caption, thead, tbody, tfoot where applicable, and scope attributes on headers. The framework uses full available width, collapsed borders and natural word wrapping. Standalone code identifiers remain intact.</p>',[example('Project table',`<table>\n  <caption>Project progress</caption>\n  <thead>\n    <tr><th scope="col">Project</th><th scope="col">Status</th><th scope="col">Tasks</th></tr>\n  </thead>\n  <tbody>\n    <tr><th scope="row">Documentation</th><td>Active</td><td>12</td></tr>\n    <tr><th scope="row">Framework</th><td>Testing</td><td>8</td></tr>\n  </tbody>\n  <tfoot><tr><th scope="row">Total</th><td></td><td>20</td></tr></tfoot>\n</table>`)]),
  section('Silicone tables','<p>When Liquid Silicone is active, the entire table is one passive magnetic surface. Mouse proximity and direct touch produce a shared optical response and soft outer glow on the table, not individual elastic cells. The row under the pointer receives gentle flat lighting, and its cell receives a slightly stronger light highlight without any spring, compression, border movement or scaling. Buttons and other actionable controls inside cells remain independently interactive. Native column sizing, collapsed borders, captions, header associations and scrolling are retained. Full deforming table borders are not implemented.</p>'),
  section('Wide data tables','<p>When content genuinely requires horizontal scrolling, provide an application-owned scroll region and label it. UIBMS preserves natural column minimum widths, so a genuinely wide table can exceed its available space. UIBMS does not force a wrapper on every table.</p>',[snippet('Optional application scroll region','<div style="overflow: auto;" tabindex="0" role="region" aria-label="Wide data table">\n  <table><!-- table content --></table>\n</div>')])
 ]),
 doc('disclosure','Details & summary','Native, accessible expandable content.',[
  section('Disclosure','<p>Details receives border, radius and spacing. Summary retains native keyboard and pointer activation. Where supported, content expands and collapses with CSS motion that respects reduced-motion preferences.</p>',[example('Expandable content',`<details>\n  <summary>How do I get started?</summary>\n  <p>Choose a distribution and include it in your document.</p>\n</details>\n<details open>\n  <summary>Initially open</summary>\n  <p>No JavaScript is needed for disclosure.</p>\n</details>`)]),
  section('Semantics','<p>Keep the summary as the first child and give it a meaningful label. Do not hide required instructions solely inside a collapsed section.</p>')
 ]),
 doc('dialogs','Dialogs','Native modal dialogs, focus and dismissal.',[
  section('Modal dialog','<p>UIBMS styles the native dialog and backdrop. A native commandfor/command invoker opens a real modal without JavaScript on supporting browsers; showModal() is the compatibility fallback. method=dialog closes it. The browser owns focus, modality and Escape behavior.</p>',[example('Open and close a modal',`<button type="button" id="open-native-dialog" commandfor="native-dialog" command="show-modal">Open dialog</button>\n<dialog id="native-dialog" aria-labelledby="native-dialog-title">\n  <h3 id="native-dialog-title">Confirm action</h3>\n  <p>This is a native modal dialog.</p>\n  <form method="dialog">\n    <button value="close">Close</button>\n  </form>\n</dialog>`,{scripts:[{lang:'javascript',code:'// Optional compatibility fallback for browsers without native commands.\nconst dialog = document.getElementById("native-dialog");\nconst trigger = document.getElementById("open-native-dialog");\nif (!("commandForElement" in trigger && "command" in trigger)) {\n  trigger.addEventListener("click", () => dialog.showModal());\n}'}],run:'dialog:native-dialog:open-native-dialog'})]),
  section('Geometry and effects','<p>Dialogs use three times the base radius and bounded viewport sizing. The optional engine stylesheet provides roomier content-sized overlays (28rem default minimum and 48rem maximum for dialogs; 22rem and 36rem for popovers), capped by the viewport. Scrolling is reserved for actual content overflow. Entrance and exit effects are optional; use the native overlay lifecycle rather than hiding an open dialog with CSS.</p>'),
  section('Silicone interaction','<p>With Liquid Silicone enabled, the open dialog is one passive magnetic surface. Hover or touch its ordinary content to see shared optical attraction and subtle flat lighting on the content itself. When content fits, a shared SVG silhouette stretches and skews toward contact, including its border, without transforming the content. When an overlay truly requires scrolling, or has complex custom paint, it retains the stable optical fallback. Buttons remain independently pressable; text inputs retain native editing. The backdrop does not receive a magnetic response. The native position, dimensions, layout, focus and dismissal are preserved. The rendered border returns to the original resolved radius, width and color at rest. Closing the dialog clears contact and reopening starts at rest.</p>')
 ]),
 doc('popovers','Popovers','Native HTML popover positioning and light dismissal.',[
  section('Native popover','<p>Use popovertarget and the popover attribute. Browser support is required; the framework supplies surface styling but not positioning logic.</p>',[example('Toggle a popover',`<button type="button" popovertarget="native-popover-demo">Show information</button>\n<div id="native-popover-demo" popover>\n  <h3>Information</h3>\n  <p>Native light dismissal works outside the surface.</p>\n  <button type="button" popovertarget="native-popover-demo" popovertargetaction="hide">Close</button>\n</div>`)]),
  section('Silicone interaction','<p>The open popover follows the same shared-surface model as a dialog. Its content receives flat lighting instead of independent magnetic springs, while actions retain their own response. A fitted popover silhouette bends and skews using the same contour as the dialog; long content retains native scrolling and optical feedback. Native light dismissal, Escape and positioning remain in charge. Closed popovers do not retain material state.</p>'),
  section('Accessibility','<p>Use a modal dialog for genuinely modal interactions. Popover does not automatically add menu semantics or implement arrow-key navigation.</p>')
 ]),
 doc('indicators','Progress & meter','Native progress and scalar measurements.',[
  section('Progress and meter','<p>Progress indicates task completion; meter represents a value within a known range. Both use the accent color where supported.</p>',[example('Indicators',`<div class="stack">\n  <label for="task-progress">Task completion: 65%</label>\n  <progress id="task-progress" value="65" max="100">65%</progress>\n  <label for="task-pending">Waiting for result</label>\n  <progress id="task-pending"></progress>\n  <label for="disk-meter">Storage: 72%</label>\n  <meter id="disk-meter" min="0" max="100" low="25" high="80" optimum="40" value="72">72%</meter>\n</div>`)]),
  section('Native rendering','<p>Browsers may render meter thresholds differently. Convey the actual value in text or an accessible label rather than relying on bar color alone.</p>')
 ]),
 doc('technical','Code & technical text','Native code, pre, kbd and samp styling.',[
  section('Inline and block code','<p>Technical elements consume the monospace token. Preformatted blocks preserve whitespace and scroll horizontally instead of forcing page overflow.</p>',[example('Technical text',`<p>Run <code>npm install</code>.</p>\n<p>Press <kbd>Ctrl</kbd> + <kbd>C</kbd>.</p>\n<p>Output: <samp>Build complete</samp></p>\n<pre><code>body {\n    color: var(--color-text);\n    background: var(--color-background);\n}</code></pre>`)]),
  section('Documentation highlighting','<p>Syntax highlighting, line numbers and copying in this website are website-specific features implemented with build-time Prism.js. The CSS framework itself does not depend on Prism or JavaScript.</p>')
 ]),
 doc('media','Images & media','Responsive media without replacing native playback or embedding.',[
  section('Image and figure','<p>Images and video have max-inline-size:100% and automatic block size. Figures and captions use contextual spacing.</p>',[example('Responsive image',`<figure>\n  <img src="{{base}}assets/material.svg" width="640" height="360" alt="Abstract green geometric landscape">\n  <figcaption>Original demonstration image.</figcaption>\n</figure>`)]),
  section('Video and audio','<p>Playback controls remain native. This example uses a tiny original silent video and generated test tone; it does not connect to external media.</p>',[example('Native video',`<video controls preload="metadata" width="320" height="180">\n  <source src="{{base}}assets/sample.mp4" type="video/mp4">\n  <track kind="descriptions" src="{{base}}assets/sample.vtt" srclang="en" label="Description">\n  Your browser does not support video.\n</video>\n<p>Silent video: abstract green rectangle on a dark background.</p>`),example('Native audio',`<audio controls preload="metadata">\n  <source src="{{base}}assets/tone.mp3" type="audio/mpeg">\n  Your browser does not support audio.\n</audio>\n<p>Short generated 440 Hz tone; no spoken content.</p>`)]),
  section('Liquid Silicone media','<p>Images and video without browser-owned controls are rendered as elastic textures, including their internal pixels and original borders, using native WebGL with a Canvas 2D mesh fallback. The optional renderer is loaded on first contact. Layout, responsive source selection and the underlying native element remain unchanged. At rest the original media is shown directly. Native video/audio controls and fullscreen media are not rasterized; those players retain native functionality and receive optical lighting only. The separately controlled silent video below demonstrates actual deformation while playing. Turn on Liquid Silicone in Appearance to compare.</p>',[example('Deformable video with HTML controls',`<figure class="stack">\n  <video muted loop playsinline preload="auto" width="320" height="180" aria-label="Silent animated geometric landscape">\n    <source src="{{base}}assets/sample.mp4" type="video/mp4">\n  </video>\n  <div class="cluster">\n    <button type="button">Play</button>\n    <label>Seek <input type="range" min="0" max="1" step="0.01" value="0"></label>\n    <output aria-label="Playback time">0.0 / 0.0 s</output>\n  </div>\n  <figcaption>Silent video. Play and seek use its native media API.</figcaption>\n</figure>`,{run:'media-deformation'})]),
  section('Other embedded elements','<p>Audio, iframe, embed, object, canvas and svg receive max-inline-size:100%. Provide appropriate accessible names and fallback content. The framework does not render into a canvas or sanitize third-party embeds.</p>',[example('Inline SVG',`<svg viewBox="0 0 160 60" width="160" role="img" aria-label="Three overlapping circles">\n  <circle cx="45" cy="30" r="24" fill="currentColor" opacity="0.35"/>\n  <circle cx="80" cy="30" r="24" fill="currentColor" opacity="0.55"/>\n  <circle cx="115" cy="30" r="24" fill="currentColor"/>\n</svg>`)])
 ]),
 doc('structure','Semantic structure','HTML document landmarks and content organization.',[
  section('Native landmarks','<p>Header, nav, main, section, article, aside and footer retain their semantics without imposed component layouts. Use classes explicitly when a layout or surface is desired.</p>',[example('Article structure',`<article class="card stack">\n  <header><h3>Product update</h3></header>\n  <section aria-label="Summary"><p>Native structure.</p></section>\n  <aside><p>Related information.</p></aside>\n  <footer><small>Published by your team.</small></footer>\n</article>`)]),
  section('Document landmarks','<p>Use one visible main landmark for the main content of an ordinary page. Provide a meaningful label for multiple navigation regions. Local examples use article and section rather than pretending to be the document landmark.</p>')
 ])
]);
const layoutData=[
 ['grid','Adaptive grid','Auto-fit columns with a minimum of min(100%,16rem). Items share available space; narrow screens collapse naturally.',`<div class="grid">\n  <article class="card">Project A</article>\n  <article class="card">Project B</article>\n  <article class="card">Project C</article>\n</div>`],
 ['flex','Flexible content','Wrapped flex children use flex:1 1 auto and consume available space.',`<div class="flex">\n  <article class="card">Short</article>\n  <article class="card">Longer content</article>\n  <article class="card">Medium</article>\n</div>`],
 ['stack','Vertical flow','Flex column with contextual gap and reset direct-child block margins.',`<article class="card stack">\n  <h3>Account details</h3>\n  <p>Consistent vertical flow.</p>\n  <button type="button">Continue</button>\n</article>`],
 ['cluster','Wrapping group','Wrapping horizontal flex with centered cross-axis alignment; children do not grow to fill remaining width.',`<div class="cluster">\n  <button type="button">Save</button>\n  <button type="button">Publish</button>\n  <a href="#basic-usage">Read more</a>\n</div>`],
 ['sidebar','Adaptive sidebar','Use two direct content regions. The first has a 14rem flex basis; subsequent content grows with a 50% basis and wraps when space is constrained.',`<div class="sidebar">\n  <aside class="panel">\n    <h3>Navigation</h3>\n    <p>First region</p>\n  </aside>\n  <section class="card">\n    <h3>Content</h3>\n    <p>Second region grows.</p>\n  </section>\n</div>`],
 ['split','Coordinated regions','Wrapped flex children use an 18rem basis and grow equally.',`<div class="split">\n  <article class="card"><h3>Plan</h3><p>First region.</p></article>\n  <article class="card"><h3>Build</h3><p>Second region.</p></article>\n</div>`],
 ['center','Centered content','Uses grid when standalone; can combine with an applicable primary layout and sets place-content and place-items.',`<div class="panel center" style="min-block-size: 10rem;">\n  <p>Centered content.</p>\n</div>`],
 ['container','Content width','100% inline size, max 72rem, auto inline margins and contextual horizontal padding.',`<div class="container">\n  <article class="card">A centered content region.</article>\n</div>`]
];
group('Layouts',[
 doc('layouts','Layout patterns','Eight intrinsic layout classes, with no imposed wrapper structure.',[
  section('Choose one primary layout','<p>Grid, flex, stack, cluster, sidebar and split are mutually exclusive on the same element. Multiple competing primary layouts suppress the conflicting primary rules. Center and container can be used where their responsibilities are compatible. Hidden elements, closed dialogs and closed popovers stay hidden.</p>',[example('Compose patterns',`<div class="grid">\n  <article class="card stack">\n    <h3>One</h3>\n    <p>Vertical flow within an adaptive grid.</p>\n  </article>\n  <article class="card stack">\n    <h3>Two</h3>\n    <p>Independent content.</p>\n  </article>\n</div>`)]),
  section('Catalog',table(['Class','Purpose'],layoutData.map(([v,t,d])=>[mono(v),d])))
 ]),
 ...layoutData.map(([v,t,d,html])=>doc(v,v,t,[section('Basic usage',`<p>${d} The gap follows the contextual --space token.</p>`,[example(t,html)]),section('Composition','<p>Use semantic elements as appropriate. Do not combine competing primary layouts on the same element. Nested layouts, surface classes and ordinary developer CSS are allowed. Native source order remains the reading and keyboard order.</p>')]))
]);
const styleData=[
 ['card','Self-contained surface','Surface color, text, border, contextual padding, twice the base radius and a shadow.',`<article class="card">\n  <h3>Project card</h3>\n  <p>A self-contained content surface.</p>\n  <button type="button">Open project</button>\n</article>`],
 ['panel','Structured surface','Subtle surface, text, border, contextual padding and twice the base radius; no card shadow.',`<section class="panel">\n  <h3>System information</h3>\n  <p>A restrained interface surface.</p>\n</section>`],
 ['lead','Introductory text','1.125em font size, contextual line height and reading-width constraint.',`<p class="lead">Build professional interfaces using native HTML and a minimal, predictable design system.</p>\n<p>Ordinary supporting text uses the normal body scale.</p>`],
 ['truncate','Single-line truncation','Ellipsis when the element is constrained and does not contain focus. Full text is restored while focused.',`<p class="truncate" tabindex="0" style="max-inline-size: 15rem;">A long project title that can be read in full when the element receives focus.</p>\n<details>\n  <summary>Read the complete title</summary>\n  <p>A long project title that can be read in full when the element receives focus.</p>\n</details>`],
 ['visually-hidden','Accessible hidden content','One-pixel clipped content stays in the accessibility tree; focus within reveals it.',`<button type="button">\n  + <span class="visually-hidden">Add project</span>\n</button>\n<p>Tab to the link to reveal it:</p>\n<a class="visually-hidden" href="#basic-usage">Skip to basic usage</a>`]
];
group('Styling',[
 doc('styling','Styling patterns','Five optional reusable styling classes.',[
  section('Purpose','<p>Styling classes express reusable intent, not arbitrary CSS declarations. Card and panel conflict on the same element and neither surface rule applies in that case. The text classes are independent where their responsibilities make sense.</p>',[example('Surface comparison',`<div class="split">\n  <article class="card">Card surface with shadow</article>\n  <section class="panel">Panel surface without shadow</section>\n</div>`)]),
  section('Catalog',table(['Class','Purpose'],styleData.map(([v,t,d])=>[mono(v),d])))
 ]),
 ...styleData.map(([v,t,d,html])=>doc(v,v,t,[section('Basic usage',`<p>${d}</p>`,[example(t,html)]),section('Usage notes',`<p>${v==='card'||v==='panel'?'Use card or panel, not both. Compose the surface with a compatible layout class. The element remains semantic HTML.':v==='truncate'?'Use only when content can be constrained. Important text needs an explicit accessible means to read the complete value; the visual ellipsis does not replace that requirement.':v==='visually-hidden'?'Do not use for hiding sensitive information or removing controls from the accessibility tree. Use the native hidden attribute for content that should be hidden from everyone.': 'Use for introductory prose; do not replace heading semantics or treat this as a general font-size utility.'}</p>`) ]))
]);
group('Effects & materials',[
 doc('individual-effects','Individual effects',`Explicit, independent visual behavior through ${framework.effectAttributes.length} feature attributes.`,[
  section('Composition rules','<p>Individual feature attributes accept space-separated words, not comma-separated values. Order does not determine precedence. Unknown words are ignored; empty/unknown-only requests preserve applicable defaults. Where supported, none suppresses the optional effect for that attribute. Default plus an explicit compatible request retains applicable default feedback.</p>',[example('Compose hover, press and focus',`<button type="button" data-hover="lift glow" data-active="press" data-focus="glow">\n  Continue\n</button>`),example('Disable optional hover only',`<button type="button" data-hover="none">\n  Native focus and activation remain\n</button>`)]),
  section('Accessibility preferences','<p>Preferences override optional motion and decorative effects. A reduced-motion preference suppresses framework translations, transitions and scroll animations. Explicit none in a contextual effects profile has different semantics from an individual none.</p>')
 ]),
 doc('materials','Materials','CSS-inspired material surfaces: glass, frosted, metallic and matte.',[
  section('Supported materials','<p>Materials currently apply to div, section, article, aside, header, footer, main, nav, figure and dialog. They are not a replacement for native button/input styling. Choose exactly one material; none or competing recognized materials leave the underlying surface intact. Existing solid surfaces need no effect.</p>', ['glass','frosted','metallic','matte'].map(v=>example(titleValue(v),`<article class="card stack" data-effect="${v}">\n  <h3>${titleValue(v)} surface</h3>\n  <p>Context-aware color, depth and geometry.</p>\n  <button type="button">Continue</button>\n</article>`))),
  section('Optical limits',table(['Material','Implementation'],[['glass','98% surface tint; 12px backdrop blur and 130% saturation when supported; inset highlights.'],['frosted','99% surface tint; 18px blur and 110% saturation when supported.'],['metallic','Directional inset highlights, not actual reflection.'],['matte','Subtle opaque background and no decorative shadow.']])),
  section('Preferences and fallback','<p>Without backdrop-filter, glass and frosted fall back to opaque surfaces. Forced colors, higher contrast and reduced-transparency preferences suppress blur and decorative depth. These are CSS appearances, not physically rendered glass, mirror or silicone. Elastic Mirror is experimental research only.</p>')
 ]),
 doc('hover','Hover effects','Fine-pointer hover lift and decorative glow.',[
  section('Hover values','<p>Lift uses negative --motion-distance; glow adds a halo to the local depth channel. Explicit lift/glow replace the optional native hover default unless default is included. Hover effects run only with hover and fine-pointer capability.</p>',[example('Hover options',`<div class="cluster">\n  <button type="button" data-hover="lift">Lift</button>\n  <button type="button" data-hover="glow">Glow</button>\n  <button type="button" data-hover="lift glow">Lift + glow</button>\n  <button type="button" data-hover="default glow">Default + glow</button>\n  <button type="button" data-hover="none">None</button>\n</div>`)]),
  section('Accessibility','<p>Do not reveal essential information only on hover. Touch users must retain native activation and keyboard users retain focus. Reduced motion disables framework translation.</p>')
 ]),
 doc('active','Activation effects','Explicit pressed feedback through data-active.',[
  section('Press','<p>Press translates downward by half the motion-distance token; it takes precedence over explicit hover translation while active. Native buttons otherwise use the profile press. Individual none suppresses optional press translation, not essential native state feedback.</p>',[example('Press the controls',`<div class="cluster">\n  <button type="button" data-active="press">Press</button>\n  <button type="button" data-active="none">None</button>\n  <button type="button" data-hover="lift" data-active="press">Lift then press</button>\n</div>`)]),
  section('Target geometry','<p>Translation rather than scale avoids reducing the actual control dimensions. Application pointer handling and accessible target placement still matter.</p>')
 ]),
 doc('focus','Focus effects','Optional decorative halo without replacing essential focus-visible outline.',[
  section('Glow','<p>Use Tab to reach the button and observe the native focus-visible outline plus decorative halo. None disables the optional feature only.</p>',[example('Keyboard focus',`<div class="cluster">\n  <button type="button" data-focus="glow">Tab to me</button>\n  <button type="button" data-focus="none">Outline only</button>\n</div>`)]),
  section('Accessibility','<p>Forced-color and higher-contrast preferences suppress the decorative halo. Never remove the required focus indication just because a glow is available.</p>')
 ]),
 doc('entrance','Entrance effects','Native dialog and popover opening effects.',[
  section('Fade and rise','<p>Fade animates decorative edge illumination, not content opacity. Rise moves the overlay by the motion-distance token. The opening transition uses @starting-style and native overlay state.</p>',[example('Open animated popover',`<button type="button" popovertarget="enter-pop">Open popover</button>\n<div id="enter-pop" popover data-entrance="fade rise">\n  <h3>Welcome</h3>\n  <p>Opening effects retain readable content.</p>\n  <button type="button" popovertarget="enter-pop" popovertargetaction="hide">Close</button>\n</div>`)]),
  section('Applicability','<p>Only native dialog and popover lifecycle is implemented. This is not a generic page-load animation system. Unsupported starting-style or reduced motion leaves normal opening behavior.</p>')
 ]),
 doc('exit','Exit effects','Native overlay closing with optional discrete transitions.',[
  section('Fade and rise','<p>Exit supports fade (edge light) and rise (movement). Animated closing requires overlay:auto and transition-behavior:allow-discrete support. Closing surfaces become pointer-inert during the transition.</p>',[example('Close an animated dialog',`<button type="button" id="open-exit-dialog" commandfor="exit-dialog" command="show-modal">Open dialog</button>\n<dialog id="exit-dialog" data-entrance="rise" data-exit="fade rise" aria-labelledby="exit-title">\n  <h3 id="exit-title">Close to see exit</h3>\n  <form method="dialog">\n    <button>Close</button>\n  </form>\n</dialog>`,{scripts:[{lang:'javascript',code:'// Optional compatibility fallback for browsers without native commands.\nconst dialog = document.getElementById("exit-dialog");\nconst trigger = document.getElementById("open-exit-dialog");\nif (!("commandForElement" in trigger && "command" in trigger)) {\n  trigger.addEventListener("click", () => dialog.showModal());\n}'}],run:'dialog:exit-dialog:open-exit-dialog'})]),
  section('Fallback','<p>Without discrete overlay support the overlay closes normally. Reduced motion disables the optional transition; essential dismissal remains native.</p>')
 ]),
 doc('scroll','Scroll effects','Feature-detected native view and document scroll timelines.',[
  section('Reveal, parallax and progress','<p>Reveal moves a small distance during entry. Parallax moves through a small range over the view timeline. Progress draws a decorative 2px document-scroll line; it is not an accessible task progressbar. Reveal wins over parallax when both are specified, while progress can coexist.</p>',[example('Scroll this page',`<article class="card" data-scroll="reveal progress">\n  <h3>Reveal and document progress</h3>\n  <p>Scroll down and up to see the subtle native effect.</p>\n</article>\n<section class="card" data-scroll="parallax">\n  <h3>Parallax</h3>\n  <p>Small, content-preserving movement.</p>\n</section>`)]),
  section('Constraints','<p>Eligible content containers are div, section, article, aside, header, footer, main, nav and figure, excluding hidden content, popovers and visually-hidden recipients. Focus within suppresses scroll motion; reduced motion disables scroll animations. The feature is guarded by @supports for animation timeline and range syntax.</p>'),
  section('Native scroll behavior','<p>Default smooth navigation uses native scroll-behavior; effects none and reduced motion restore auto. Scrollbars are styled through native scrollbar-color. There is no scroll hijacking, custom physics, or global snapping.</p>')
 ])
]);
group('Advanced',[
 doc('scoped','Scoped adoption','Limit framework selector matching to an explicit adoption region.',[
  section('Host comparison','<p>The iframe below loads only the scoped full distribution. The outer host is untouched by the framework and the marked region initializes the tokens. The marked region follows the website’s current core appearance profiles. The host remains independent; this CSS-only scoped example does not load optional JavaScript engines.</p>',[{label:'Isolated host comparison',frame:'scoped-demo',code:'<link rel="stylesheet" href="dist/uibms.scoped.full.min.css">\n<p>Unstyled host content</p>\n<button>Host button</button>\n<section data-uibms>\n  <article class="card stack">\n    <h2>Scoped region</h2>\n    <button type="button">UIBMS button</button>\n  </article>\n</section>',lang:'html'}]),
  section('Boundaries','<p>Outermost markers initialize the scoped framework. Nested data-uibms markers inherit; a nested explicit configuration still changes its own context. Native @scope support is required, and unsupported engines receive no scoped selector styling, never an automatic global fallback.</p>'),
  section('Host cascade','<p>Host inheritance, unlayered author rules and layer names can affect the scope. Scoped internal animation names differ from global ones, but keyframe definitions are document-wide. The scroll progress effect tracks the document, not a private scroller.</p>')
 ]),
 doc('customization','Customization','Override meaningful tokens or ordinary native CSS without extending the public API.',[
  section('Local tokens','<p>Use your own application selector for overrides. UIBMS does not require a new framework class for each combination. The inline example is intentionally application-owned CSS.</p>',[example('Application-owned tokens',`<section class="card stack" style="--radius: 0.125rem; --space: 1.5rem;">\n  <h3>Local design override</h3>\n  <p>The existing tokens are consumed locally.</p>\n  <button type="button">Continue</button>\n</section>`)]),
  section('Ordinary CSS','<p>Unlayered CSS can override normal framework declarations. Prefer narrowly scoped application selectors. Do not use private channels such as --_effect-depth as stable public APIs.</p>',[snippet('Application selector','.my-application button {\n  border-radius: 0;\n}','css')])
 ]),
 doc('extensions','Extensions','Independently load optional palettes and motion profiles.',[
  section('Loading extensions','<p>The ten optional modules are seven palettes and three effects profiles. For standard global use ordinary extension CSS; for scoped use the scoped variant. Full bundles already contain all optional modules.</p>',[snippet('Global extensions','<link rel="stylesheet" href="dist/uibms.min.css">\n<link rel="stylesheet" href="dist/extensions/palettes/forest.min.css">\n<link rel="stylesheet" href="dist/extensions/profiles/effects-dynamic.min.css">\n<section data-palette="forest" data-effects="dynamic">...</section>'),snippet('Scoped extensions','<link rel="stylesheet" href="dist/uibms.scoped.min.css">\n<link rel="stylesheet" href="dist/extensions/palettes/forest.scoped.min.css">\n<section data-uibms data-palette="forest">...</section>')]),
  section('Available files','<p>Names, sizes and exact download files are generated from the current distribution manifest.</p>',[],{manifest:'extensions'})
 ]),
 doc('accessibility','Accessibility','Semantic HTML, user preferences and verification boundaries.',[
  section('Defaults','<p>UIBMS CSS targets applicable WCAG 2.2 AAA requirements by default, not universal conformance. Native focus, meaningful state feedback, reflow, target sizes, text contrast and semantic interactions are designed into the foundation. Content authors remain responsible for the full interface.</p>',[example('Accessible form',`<form class="stack">\n  <label for="accessible-name">Your name</label>\n  <input id="accessible-name" autocomplete="name" required aria-describedby="name-help">\n  <small id="name-help">Enter your full name.</small>\n  <button type="submit">Validate</button>\n</form>`,{note:'This demonstration does not transmit data.'})]),
  section('Preference handling',table(['Preference','Framework behavior'],[['Reduced motion','Suppress optional translation, transitions, scroll animation and smooth navigation.'],['Forced colors','Use native system focus/border colors, opaque materials and native scrollbars.'],['More contrast / reduced transparency','Suppress material blur and decorative halo/depth.']])),
  section('Author responsibilities','<p>Provide accessible names, meaningful error text, alternative text and captions, keyboard navigation, predictable focus management, readable content and sufficient contrast after custom overrides. Test with assistive technologies and real devices. The release candidate has not achieved comprehensive AAA certification.</p>')
 ]),
 doc('compatibility','Browser compatibility','Modern CSS, progressive enhancement and open browser release gates.',[
  section('Required and optional capabilities',table(['Capability','Notes'],[['Cascade layers, :where(), custom properties, nesting and light-dark()','Core uses modern native CSS. Exact supported browser version policy is not finalized.'],['@scope','Required for scoped adoption; no global fallback.'],['backdrop-filter','Optional; opaque material fallback.'],['@starting-style / discrete display and overlay transitions','Native opening/closing fallback.'],['Scroll/view timelines and animation-range','Feature-detected; static fallback.'],['Native dialog / popover','Browser native behavior required.'],['Native dialog commands / closedby','Native invokers and backdrop dismissal where supported; optional compatibility adapter for drawers.']])),
  section('Verification status','<p>Chromium 144.0.7559.96 passed 704 core release assertions and 120 responsive-table cases on the regenerated contextual-refactoring candidate. The earlier 556-check record belongs to the initial distribution. The full generated-site integration suite remains a separate gate. Safari/WebKit and Firefox/Gecko runs, actual device and assistive technology testing, exact version policy and comprehensive accessibility remain pending. Do not infer production certification from a single-engine test.</p>')
 ])
]);
group('Development',[
 doc('source','Source architecture','A small responsibility-based source tree.',[
  section('Repository layout','<p>The framework source, distribution outputs, tests, examples and website are separate. The website consumes generated CSS, never its own fork.</p>',[snippet('Structure','src/\n  reset/\n  tokens/\n  elements/\n  layouts/\n  styles/\n  palettes/\n  profiles/\n  effects/\n  preferences/\ndist/\nexamples/\ndocs/\ntests/\ntools/\nwebsite/','text')]),
  section('Contribution principles','<p>Keep native CSS, meaningful tokens, minimal optional patterns and low specificity. Public class and data attribute expansion requires an approved implementation need; the website adds no framework classes, attributes, elements or changes to CSS source.</p>')
 ]),
 doc('building','Building distributions','Development-only Node tooling assembles the CSS.',[
  section('Build commands','<p>From the repository root, install the two pinned parser dependencies and run the native packager. The consumer does not need this toolchain. Clean dependency installation and lockfile generation were not verified in the offline release environment.</p>',[snippet('Terminal','npm --prefix tools install\nnpm --prefix tools run build','bash')]),
  section('Outputs','<p>The script assembles imports, scopes selectors and conservatively compacts formatting, without transpiling or rewriting CSS values. All 48 stylesheets have manifest integrity records.</p>')
 ]),
 doc('testing','Testing','Reproducible release-candidate checks and explicit release gates.',[
  section('Browser checks','<p>From the repository root, install Playwright and browser binaries. The existing harness tests actual generated CSS and selected native interaction, configuration, scoping, preference and reflow cases.</p>',[snippet('Terminal','python -m pip install playwright\npython -m playwright install chromium firefox webkit\npython tests/release.py --browser chromium\npython tests/release.py --browser firefox\npython tests/release.py --browser webkit','bash')]),
  section('Recorded verification','<p>The initial generated candidate passed 556 targeted Chromium checks. The regenerated contextual-refactoring candidate passed 704 core release assertions and 120 responsive-table cases. These checks do not replace the generated-site integration or cross-engine suites. Cross-engine, clean installation and full accessibility verification are still release gates.</p>')
 ]),
 doc('performance','Performance','Measured distribution sizes and limited benchmark evidence.',[
  section('File sizes','<p>Actual byte and gzip counts come from the unchanged release manifest. No runtime JS is required by the CSS framework. Website interactions and documentation tooling are separate.</p>',[],{manifest:'main'}),
  section('Synthetic benchmark','<p>The recorded local 500-card theme switch and forced-layout workload had median times of 12.90ms (standard minified), 13.05ms (full minified), 25.15ms (scoped minified), and 25.85ms (scoped full minified). This is one local Chromium workload, not a general device benchmark or guarantee.</p>'),
  section('Design priorities','<p>Keep source and distribution small without artificial size budgets. Avoid unnecessary rules, mandatory JavaScript or repeated selectors. Measure actual workloads before introducing advanced rendering.</p>')
 ])
]);
group('Optional engines',[
 doc('liquid-silicone','Liquid silicone','Experimental opt-in physical material with magnetic attraction, elastic contours and moving selection.',[
  section('Live material lab','<p>Only selected navigation items are highlighted. The card is passive; its button is independently pressable. Native controls retain their original semantics. This landscape is a registered image backdrop: the engine samples its pixels for optical distortion. Unregistered live HTML uses translucent backdrop filtering. The opacity slider adjusts the optical tint; ordinary sitewide surfaces preserve their resolved palette and use a readable default opacity.</p>',[example('Liquid silicone interface',"<section class=\"stack\" data-material=\"liquid-silicone\" style=\"padding:var(--space);border-radius:calc(var(--radius)*2)\">\n  <nav class=\"cluster\" aria-label=\"Material demo navigation\">\n    <button type=\"button\" aria-pressed=\"true\">Overview</button>\n    <button type=\"button\" aria-pressed=\"false\">Projects</button>\n    <button type=\"button\" aria-pressed=\"false\">Activity</button>\n  </nav>\n  <article class=\"card stack\">\n    <h3>Passive silicone card</h3>\n    <p>Hover or touch the card for magnetic attraction. Only the nested button compresses.</p>\n    <button type=\"button\">Continue</button>\n  </article>\n  <fieldset class=\"stack\">\n    <legend>Native controls</legend>\n    <label>Opacity <input type=\"range\" min=\"0\" max=\"100\" value=\"92\"></label>\n    <label><input type=\"checkbox\" checked> Reflections</label>\n    <div class=\"cluster\" role=\"radiogroup\" aria-label=\"Silicone colour\"><label><input type=\"radio\" name=\"silicone-colour\" checked> Clear</label><label><input type=\"radio\" name=\"silicone-colour\"> Tinted</label></div>\n    <label>Message <textarea>Natural HTML, optional material.</textarea></label>\n  </fieldset>\n</section>",{run:'liquid-silicone'})]),
  section('Installation','<p>Load the separate extension files after the core CSS. The engine is not bundled in the existing CSS distributions.</p>',[snippet('Optional engine',"<link rel=\"stylesheet\" href=\"uibms.min.css\">\n<link rel=\"stylesheet\" href=\"engines/liquid-silicone.css\">\n<script type=\"module\">\n  import { mountMaterial } from './engines/material.mjs';\n  mountMaterial(document);\n</script>")]),
  section('Responsibilities','<p>Use data-material for appearance and physical response, native HTML for functionality, and classes for layout. Omitted material inherits. Explicit default restores core styling. Text and activation hit areas stay stable; the visual contour deforms. Disabled and passive surfaces cannot compress. Material consumes the original computed surface, foreground, border, radius and shadow instead of defining a second theme. Flat layout containers stay flat. Sticky, scrollable, asymmetric and native surfaces use in-place lighting instead of injected geometry. Explicit legacy glass, frosted, metallic or matte effects take precedence on that element. Changes to every contextual profile re-resolve appearance.</p>'),
  section('Touch interaction','<p>Touch replaces unavailable hover: contact attracts the surface outward, an actionable control then compresses locally, and release allows elastic recovery. A quick tap still produces a short visual impulse without delaying the native action. Passive cards, tables, dialogs and popovers only attract. Table rows and cells and ordinary overlay content receive flat lighting without their own spring. Dragging to scroll, cancelling a pointer or losing window focus clears contact. Native text entry and keyboard focus remain available; reduced motion and the none/minimal effects profiles are respected.</p>'),
  section('Configuration and verification','<p>Options include attraction, range, pressure, stiffness, damping, amplitude, maximum displacement, touchAttractionTime, touchCompressionTime and touchSlop. Custom CSS variables optionally override tint, opacity, blur and border. The default tint and border derive from the consuming surface; 92% opacity preserves the original colour role. Minimal suppresses magnetic hover and softens compression; none stops physical motion. Fluid and dynamic use the inherited motion timing. Reduced motion, higher contrast, forced colors and reduced transparency have fallbacks. This is a development candidate; arbitrary DOM refraction, full native-control contour rendering, GPU acceleration and browser/accessibility review remain open. The optional registerBackdrop(element, imageURL) API enables pixel refraction against a declared, readable image.</p><p><a href="https://github.com/UIBMS/UIBMSCSS/tree/main/extensions/engines">Engine source and usage</a></p>')
 ]),
 doc('form-engine','Form Engine','Optional silicone pickers while preserving native forms and validation.',[
  section('Live form laboratory','<p>Use the integrated arrow to open a custom dropdown, date, time, ISO week, month or colour selector. The original native control remains editable in a single composite field. Stacked labels align above full-width fields, including on narrow screens. The colour field displays a rectangular theme-aware swatch and value: tap the swatch side for the native picker or the arrow for the enhanced picker. Form values and validation remain native. Nothing is transmitted.</p>',[example('Event form',"<form class=\"panel stack\" data-material=\"liquid-silicone\">\n  <label>Event name <input name=\"title\" required value=\"Product launch\"></label>\n  <label>Email <input type=\"email\" name=\"email\"></label>\n  <label>Participants <input type=\"number\" name=\"participants\" min=\"1\" value=\"12\"></label>\n  <label>Category <select name=\"category\"><option>Meeting</option><option>Workshop</option><option>Launch</option></select></label>\n  <label>Date <input type=\"date\" name=\"date\"></label>\n  <label>Date and time <input type=\"datetime-local\" name=\"datetime\"></label>\n  <label>Time <input type=\"time\" name=\"time\" value=\"10:30\"></label>\n  <label>Week <input type=\"week\" name=\"week\"></label>\n  <label>Month <input type=\"month\" name=\"month\"></label>\n  <label>Accent <input type=\"color\" name=\"color\" value=\"#80bceb\"></label>\n  <label>Attachment <input type=\"file\" name=\"attachment\"></label>\n  <label>Notes <textarea name=\"notes\"></textarea></label>\n  <div class=\"cluster\"><button type=\"submit\">Validate</button><button type=\"reset\">Reset</button></div>\n</form>",{run:'form-engine'})]),
  section('Installation','<p>Load Material Engine and Form Engine independently. The form adapter adds an optional picker without replacing the native source of truth.</p>',[snippet('Form enhancement',"<link rel=\"stylesheet\" href=\"engines/liquid-silicone.css\">\n<link rel=\"stylesheet\" href=\"engines/forms.css\">\n<script type=\"module\">\n  import { mountMaterial } from './engines/material.mjs';\n  import { mountForms } from './engines/forms.mjs';\n  mountMaterial(document);\n  mountForms(document);\n</script>")]),
  section('Picker semantics','<p>Single selects, date, datetime-local, time, week, month and color inputs receive enhanced pickers. The week indicator moves across an entire ISO week. Date and month grids use one elastic highlight; time has separate hour and minute indicators. Multiple selects and OS file dialogs remain native. Input/change events are dispatched; native range, step and constraint validation are retained where supported. The colour field stays synchronized after native changes, enhanced selection and form reset. Its value uses the native input format, rather than changing the framework palette format. Call refresh() after changing the native value silently from application code.</p>'),
  section('Development limits','<p>Full screen-reader, mobile and cross-browser verification is pending. The picker arrow is integrated into the field. Website Appearance settings retain native controls but inherit the same silicone material. Compatible controls in ordinary live examples also receive enhanced pickers when silicone is selected. Enhanced pickers use their source control’s current theme, palette, border, shape, density, typography and effects. Image-backed refraction is available on registered backgrounds; fully deformable native control internals remain experimental.</p>')
 ])
]);

group('Components',[
 doc('components','Components overview','Independently loadable HTML-first components.',[
  section('Optional architecture','<p>Components are separately loadable structural patterns, not new appearance settings. Prefer a meaningful root class and native internal elements; use contextual CSS rather than requiring dedicated classes on each child. Load only the stylesheets you need. These optional components are not part of the core bundles. Native HTML owns state wherever possible; optional controllers handle interaction and positioning where necessary. Existing legacy child hooks remain supported but are not the preferred markup.</p>',[snippet('Load individually','<link rel="stylesheet" href="engines/components/tabs.css">\n<link rel="stylesheet" href="engines/components/segmented.css">')]),
  section('Component catalogue',table(['Component','Implementation'],[['<a href="{{base}}docs/tabs/">Tabs</a>','Native buttons, ARIA panels, optional keyboard controller.'],['<a href="{{base}}docs/segmented/">Segmented controls</a>','Native radio inputs; CSS only.'],['<a href="{{base}}docs/dropdown/">Dropdown menus</a>','Native popover with optional keyboard and viewport positioning controller.'],['<a href="{{base}}docs/tooltip/">Tooltips</a>','Native described-by relationship, delayed pointer/focus feedback.'],['<a href="{{base}}docs/drawer/">Drawers</a>','Docked native modal dialog, optional invoker fallback.'],['<a href="{{base}}docs/toast/">Toast notifications</a>','Independent notification queue and live-region announcements.'],["<a href=\"{{base}}docs/stepper/\">Stepper</a>","Ordered process navigation and optional panel switching."],["<a href=\"{{base}}docs/pagination/\">Pagination</a>","Native page links and bounded client-side page controls."],["<a href=\"{{base}}docs/chips/\">Tags and chips</a>","Descriptive labels, native selectable filters and removable items."],["<a href=\"{{base}}docs/command-palette/\">Command palette</a>","Native modal search and keyboard-driven application actions."]])),
  section('Loading strategy','<p>All ten initial components are implemented as development candidates. Each has a separate stylesheet and only necessary optional scripts. Core distributions remain independent of this library.</p>')
 ]),
 componentDoc('tabs','Tabs','Accessible panel navigation built from native buttons.',[
  section('Loading and activation','<p>Load tabs.css after the framework. Import the optional tabs controller. No component is bundled in core. Each button names one panel; the panel points back to its tab. The controller uses the native hidden attribute. Arrow keys, Home and End move focus; Enter or Space activates. Disabled tabs are skipped. Without scripting the authored panels remain readable.</p>',[snippet('Optional stylesheet and controller',`<link rel="stylesheet" href="engines/components/tabs.css">\n<script type="module">\n  import {mountTabs} from './engines/components/tabs.mjs';\n  const tabs = mountTabs(document);\n</script>`)]),
  section('Horizontal tabs','<p>Click or use the keyboard. Selection is distinct from focus. The panel content stays in the original DOM, retaining form values.</p>',[example('Project workspace',`<section class="stack">\n  <div class="tabs" role="tablist" aria-label="Project workspace">\n    <button type="button" role="tab" id="workspace-overview" aria-controls="workspace-overview-panel" aria-selected="true">Overview</button>\n    <button type="button" role="tab" id="workspace-activity" aria-controls="workspace-activity-panel" aria-selected="false">Activity</button>\n    <button type="button" role="tab" id="workspace-settings" aria-controls="workspace-settings-panel" aria-selected="false">Settings</button>\n    <button type="button" role="tab" id="workspace-archive" aria-controls="workspace-archive-panel" aria-selected="false" disabled>Archive</button>\n  </div>\n  <section class="panel stack" role="tabpanel" id="workspace-overview-panel" aria-labelledby="workspace-overview" tabindex="0">\n    <h3>Overview</h3><p>Three projects are ready for review.</p>\n  </section>\n  <section class="panel stack" role="tabpanel" id="workspace-activity-panel" aria-labelledby="workspace-activity" tabindex="0">\n    <h3>Activity</h3><p>Your latest project updates.</p>\n  </section>\n  <section class="panel stack" role="tabpanel" id="workspace-settings-panel" aria-labelledby="workspace-settings" tabindex="0">\n    <h3>Settings</h3><label>Workspace name <input value="UIBMS"></label>\n  </section>\n  <section class="panel stack" role="tabpanel" id="workspace-archive-panel" aria-labelledby="workspace-archive" tabindex="0">\n    <h3>Archive</h3><p>Unavailable.</p>\n  </section>\n</section>`)]),
  section('Vertical tabs','<p>Set aria-orientation="vertical" to change the structural direction and use Up and Down. The surrounding layout remains an ordinary developer choice.</p>',[example('Vertical workspace',`<div class="split">\n  <div class="tabs" role="tablist" aria-orientation="vertical" aria-label="Workspace sections">\n    <button type="button" role="tab" id="vertical-summary" aria-controls="vertical-summary-panel" aria-selected="true">Summary</button>\n    <button type="button" role="tab" id="vertical-details" aria-controls="vertical-details-panel" aria-selected="false">Details</button>\n  </div>\n  <div class="stack">\n    <section class="panel" role="tabpanel" id="vertical-summary-panel" aria-labelledby="vertical-summary" tabindex="0">Summary content.</section>\n    <section class="panel" role="tabpanel" id="vertical-details-panel" aria-labelledby="vertical-details" tabindex="0">Detailed content.</section>\n  </div>\n</div>`)]),
  section('Configuration and lifecycle','<p>Both examples inherit the website appearance. With Liquid Silicone, one moving selection surface follows the active tab. Tabs do not change the sitewide configuration. Call refresh() after changing tab markup or availability; select(tab, {focus:true}) activates an enabled tab, and destroy() restores the authored state.</p>')
 ]),
 componentDoc('segmented','Segmented controls','Single-choice native radio groups styled as a compact control.',[
  section('Loading','<p>Load segmented.css after the framework. No JavaScript is needed. Each label contains a native radio input; all options in a group have the same name. Provide an accessible group name. Separate groups have distinct names.</p>',[snippet('Optional stylesheet','<link rel="stylesheet" href="engines/components/segmented.css">')]),
  section('Native selection','<p>Try choosing a period or using arrow keys. The browser owns checked state, keyboard navigation, form serialization and reset. The disabled option cannot be selected.</p>',[example('Reporting period',`<form class="stack">\n  <fieldset class="stack">\n    <legend>Report settings</legend>\n    <div class="segmented" role="radiogroup" aria-label="Reporting period">\n      <label><input type="radio" name="report-period" value="daily" checked> Daily</label>\n      <label><input type="radio" name="report-period" value="weekly"> Weekly</label>\n      <label><input type="radio" name="report-period" value="monthly"> Monthly</label>\n      <label><input type="radio" name="report-period" value="yearly" disabled> Yearly</label>\n    </div>\n  </fieldset>\n  <div class="cluster"><button type="reset">Reset</button></div>\n</form>`)]),
  section('Independent groups','<p>Options inherit all surrounding appearance settings. With Liquid Silicone, the selected radio is mapped to one elastic highlight covering the complete segment. Native controls and values are not replaced.</p>',[example('View mode',`<div class="segmented" role="radiogroup" aria-label="View mode">\n  <label><input type="radio" name="view-mode" value="grid" checked> Grid</label>\n  <label><input type="radio" name="view-mode" value="list"> List</label>\n  <label><input type="radio" name="view-mode" value="compact"> Compact</label>\n</div>`)])
 ]),
 componentDoc('dropdown','Dropdown menus','Compact native popover menus with keyboard navigation and viewport-aware positioning.',[
  section('Loading','<p>Load dropdown.css and import mountDropdowns. The browser owns native popover visibility and outside dismissal. CSS anchor positioning places the menu beside its trigger in supporting browsers. The controller adds keyboard navigation and supplies fallback positioning. Keep the shared floating.mjs dependency alongside the controller.</p>',[snippet('Optional stylesheet and controller',"<link rel=\"stylesheet\" href=\"engines/components/dropdown.css\">\n<script type=\"module\">\n  import {mountDropdowns} from './engines/components/dropdown.mjs';\n  mountDropdowns(document);\n</script>")]),
  section('Action menu','<p>Click the trigger or press Down or Up. The first or last enabled item receives focus. Arrow keys, Home, End and typing navigate. Enter or Space activates native buttons. Escape returns focus; Tab leaves the menu. Clicking an action dismisses the menu without replacing the application action.</p>',[example('Project actions',"<div class=\"cluster\">\n  <button id=\"project-actions-trigger\" type=\"button\" popovertarget=\"project-actions\" aria-haspopup=\"menu\" aria-expanded=\"false\">Project actions ▾</button>\n  <div class=\"dropdown\" id=\"project-actions\" popover=\"auto\" role=\"menu\" aria-labelledby=\"project-actions-trigger\" tabindex=\"-1\">\n    <button type=\"button\" role=\"menuitem\">Edit project</button>\n    <button type=\"button\" role=\"menuitem\">Duplicate project</button>\n    <hr role=\"separator\">\n    <button type=\"button\" role=\"menuitem\" disabled>Archive project</button>\n    <button type=\"button\" role=\"menuitem\">View details</button>\n  </div>\n</div>")]),
  section('Navigation menu','<p>Anchors retain ordinary link navigation. The menu inherits contextual tokens and flips above the trigger when space below is insufficient. It fades and slides with the selected motion profile. Long content scrolls. Liquid Silicone uses the existing compact overlay contour or optical fallback.</p>',[example('Quick navigation',"<div class=\"cluster\">\n  <button id=\"quick-navigation-trigger\" type=\"button\" popovertarget=\"quick-navigation\" aria-haspopup=\"menu\" aria-expanded=\"false\">Navigate ▾</button>\n  <div class=\"dropdown\" id=\"quick-navigation\" popover=\"auto\" role=\"menu\" aria-labelledby=\"quick-navigation-trigger\" tabindex=\"-1\">\n    <a href=\"{{base}}docs/components/\" role=\"menuitem\">Components overview</a>\n    <a href=\"{{base}}docs/tabs/\" role=\"menuitem\">Tabs</a>\n    <a href=\"{{base}}docs/segmented/\" role=\"menuitem\">Segmented controls</a>\n  </div>\n</div>")]),
  section('Scope and lifecycle','<p>Use a single button trigger per menu, unique IDs, and native button or link menu items. This candidate supports single-level menus; nested submenus and checkbox menu items are not included. Call refresh() after replacing markup and destroy() for cleanup. Requires native Popover API support.</p>')
 ]),
 componentDoc('tooltip','Tooltips','Supplementary text on pointer hover or keyboard focus.',[
  section('Loading','<p>Load tooltip.css and import mountTooltips. Use aria-describedby on a focusable trigger, referencing a short noninteractive element with role="tooltip" and popover="manual". The accessible description relationship is native. Keep floating.mjs alongside the controller.</p>',[snippet('Optional stylesheet and controller',"<link rel=\"stylesheet\" href=\"engines/components/tooltip.css\">\n<script type=\"module\">\n  import {mountTooltips} from './engines/components/tooltip.mjs';\n  mountTooltips(document);\n</script>")]),
  section('Hover and keyboard focus','<p>Hover for 300ms or focus the trigger. The tooltip prefers the space above, flips below when necessary, and stays open while the pointer is over it. Escape dismisses it without moving focus. It remains visible while focus or pointer remains unless dismissed.</p>',[example('Supplementary button hints',"<div class=\"cluster\">\n  <button type=\"button\" aria-describedby=\"save-hint\">Save draft</button>\n  <span class=\"tooltip\" id=\"save-hint\" role=\"tooltip\" popover=\"manual\">Save your changes without publishing.</span>\n  <button type=\"button\" aria-describedby=\"publish-hint\">Publish</button>\n  <span class=\"tooltip\" id=\"publish-hint\" role=\"tooltip\" popover=\"manual\">Make the current version available.</span>\n</div>")]),
  section('Accessible descriptions','<p>Never put essential instructions or controls solely inside a tooltip. Use visible text for essential information and a popover or dialog for interactive content. Touch does not synthesize hover; focus and native descriptions remain available. Tooltips inherit palette, shape, density and typography, but deliberately keep stable geometry under Liquid Silicone.</p>',[example('Keyboard accessible hint',"<div class=\"stack\">\n  <label>Project title <input type=\"text\" aria-describedby=\"project-title-hint\"></label>\n  <span class=\"tooltip\" id=\"project-title-hint\" role=\"tooltip\" popover=\"manual\">Use a short, recognizable title.</span>\n</div>")]),
  section('Lifecycle','<p>mountTooltips(root, {delay:300, leaveDelay:160}) configures pointer delays in milliseconds. Use one tooltip per trigger. Call refresh() after markup changes and destroy() to release timers and listeners. Requires native Popover API support.</p>')
 ]),
 componentDoc('drawer','Drawers','Responsive docked native dialogs and bottom sheets.',[
  section('Loading','<p>Load drawer.css. Native commandfor and command="show-modal" open the dialog in supporting browsers. The small optional mountDrawers controller supports older native dialog implementations lacking invoker commands or closedby support. Import it only when the necessary native capability is missing. Forms with method="dialog" close natively. No custom focus trap or overlay manager is required. Use closedby="any" to opt in to native backdrop dismissal; the optional adapter supplies compatibility where native support is missing.</p>',[snippet('Native stylesheet and optional fallback',`<link rel="stylesheet" href="engines/components/drawer.css">
<script type="module">
${drawerFallback.split('\n').map(line=>'  '+line).join('\n')}
</script>`)]),
  section('End drawer','<p>The structural drawer class docks a native modal dialog at the logical end of the viewport. Escape and the close button dismiss it; native modal focus handling prevents interaction with the background. Width defaults to 28rem and cannot exceed the viewport. The form values survive reopening. No demo data is transmitted.</p>',[example('Workspace settings drawer',"<div class=\"cluster\">\n  <button type=\"button\" commandfor=\"settings-drawer\" command=\"show-modal\" aria-haspopup=\"dialog\">Open settings</button>\n  <dialog class=\"drawer\" id=\"settings-drawer\" aria-labelledby=\"settings-drawer-title\">\n    <form method=\"dialog\" class=\"stack\">\n      <header class=\"cluster\">\n        <h3 id=\"settings-drawer-title\">Workspace settings</h3>\n        <button type=\"submit\" value=\"close\" autofocus aria-label=\"Close settings\">×</button>\n      </header>\n      <label>Workspace name <input name=\"name\" value=\"UIBMS\"></label>\n      <label><input type=\"checkbox\" name=\"updates\" checked> Receive updates</label>\n      <label>Notes <textarea name=\"notes\" rows=\"4\"></textarea></label>\n      <button type=\"submit\" value=\"save\">Done</button>\n    </form>\n  </dialog>\n</div>")]),
  section('Start drawer','<p>Add the drawer-start structural class for logical start placement. Logical sides follow the document direction.</p>',[example('Navigation drawer',"<div class=\"cluster\">\n  <button type=\"button\" commandfor=\"navigation-drawer\" command=\"show-modal\" aria-haspopup=\"dialog\">Open navigation</button>\n  <dialog class=\"drawer drawer-start\" id=\"navigation-drawer\" aria-labelledby=\"navigation-drawer-title\">\n    <div class=\"stack\">\n      <header class=\"cluster\">\n        <h3 id=\"navigation-drawer-title\">Navigation</h3>\n        <form method=\"dialog\"><button type=\"submit\" autofocus aria-label=\"Close navigation\">×</button></form>\n      </header>\n      <nav class=\"stack\" aria-label=\"Component navigation\">\n        <a href=\"{{base}}docs/components/\">Components overview</a>\n        <a href=\"{{base}}docs/tabs/\">Tabs</a>\n        <a href=\"{{base}}docs/dropdown/\">Dropdown menus</a>\n      </nav>\n    </div>\n  </dialog>\n</div>")]),
  section('Bottom sheet','<p>Add drawer-bottom for a content-sized bottom sheet. Long content scrolls within the native dialog. Customize --drawer-width or --drawer-bottom-max as needed.</p>',[example('Project filter sheet',"<div class=\"cluster\">\n  <button type=\"button\" commandfor=\"filter-drawer\" command=\"show-modal\" aria-haspopup=\"dialog\">Open filters</button>\n  <dialog class=\"drawer drawer-bottom\" id=\"filter-drawer\" aria-labelledby=\"filter-drawer-title\">\n    <form method=\"dialog\" class=\"stack\">\n      <header class=\"cluster\">\n        <h3 id=\"filter-drawer-title\">Filter projects</h3>\n        <button type=\"submit\" value=\"close\" autofocus aria-label=\"Close filters\">×</button>\n      </header>\n      <label>Search <input type=\"search\" name=\"search\" placeholder=\"Project name\"></label>\n      <label><input type=\"checkbox\" name=\"active\" checked> Active projects</label>\n      <button type=\"submit\" value=\"apply\">Apply filters</button>\n    </form>\n  </dialog>\n</div>")]),
  section('Motion and materials','<p>Transitions use the existing contextual motion tokens and honor reduced motion. A docked drawer keeps its viewport boundary stable under Liquid Silicone, using optical surface feedback while its controls retain their normal interactions. Escape, native form closure and focus return remain owned by the browser. The component does not force outside-click dismissal or a global body-scroll lock.</p>')
 ]),
 componentDoc('toast','Toast notifications','Non-blocking notification stacks with accessible announcements.',[
  section('Loading','<p>Load toast.css and import mountToasts. Pass a dedicated, initially empty .toasts region. The optional controller creates real text and dismiss buttons, plus polite and urgent live regions. It never injects HTML or moves focus when a notification appears.</p>',[snippet('Optional stylesheet','<link rel="stylesheet" href="engines/components/toast.css">')]),
  section('Notification laboratory','<p>Try success, information, warning and error notifications. Three are visible by default; additional notifications queue in order. Messages persist unless a duration is explicitly requested. Warnings and errors always remain until dismissed. Timed noncritical notifications pause while hovered, focused, the document is hidden or an unrelated native modal is open.</p>',[example('Notification actions',"<section class=\"stack\">\n  <div class=\"cluster\">\n    <button type=\"button\" id=\"toast-success\">Success</button>\n    <button type=\"button\" id=\"toast-info\">Timed information</button>\n    <button type=\"button\" id=\"toast-warning\">Warning</button>\n    <button type=\"button\" id=\"toast-danger\">Error</button>\n    <button type=\"button\" id=\"toast-clear\">Clear notifications</button>\n  </div>\n  <div class=\"toasts\" id=\"demo-notifications\" role=\"region\" aria-label=\"Notifications\"></div>\n</section>",{run:'toast',scripts:[{lang:'javascript',code:"import {mountToasts} from './engines/components/toast.mjs';\nconst notifications = mountToasts(document.querySelector('#demo-notifications'));\ndocument.querySelector('#toast-success').addEventListener('click', () => {\n  notifications.show({tone:'success', title:'Changes saved', message:'Your workspace is up to date.'});\n});\ndocument.querySelector('#toast-info').addEventListener('click', () => {\n  notifications.show({tone:'info', title:'Export ready', message:'This message expires after six seconds.', duration:6000});\n});\ndocument.querySelector('#toast-warning').addEventListener('click', () => {\n  notifications.show({tone:'warning', title:'Review required', message:'Two items need your attention.'});\n});\ndocument.querySelector('#toast-danger').addEventListener('click', () => {\n  notifications.show({tone:'danger', title:'Connection unavailable', message:'Your changes have not been submitted.'});\n});\ndocument.querySelector('#toast-clear').addEventListener('click', () => notifications.clear());"}]})]),
  section('Controller API','<p>mountToasts(container, {maxVisible:3, labels:{}}) creates an independent notification stack. show({title,message,tone,duration}) returns an ID and dismiss() handle; clear() dismisses visible and queued messages; destroy() releases listeners and generated live regions. Read visibleCount and pendingCount for queue state. Durations are milliseconds, with a five-second minimum; zero is persistent. Supported tones are info, success, warning and danger.</p>',[snippet('Programmatic notification',"const notice = notifications.show({title:'Saved', tone:'success', duration:6000});\n// Dismiss early when appropriate:\nnotice.dismiss();" ,'javascript')]),
  section('Placement and accessibility','<p>The stack sits at the logical bottom end of its containing viewport and adapts to narrow screens. Each tone uses the inherited semantic colour with a visible text label. Ordinary messages use polite announcements; errors use an assertive live region. The stack does not interrupt focus or block the application. Notifications are intentionally persistent by default; do not rely on them as the only record of critical information. The controller uses a native manual popover to place the stack in the browser top layer, above ordinary stacking contexts and newly opened overlays. The transparent stack never intercepts clicks outside its notifications. Native modal inertness remains in force: for dismissible notifications within a modal or drawer, mount a separate stack inside that dialog. Global notification countdowns pause while an unrelated modal is open. Older browsers without native Popover API support use the configurable --toast-z-index fixed-position fallback; place that fallback container at the document root to avoid ancestor stacking contexts. Liquid Silicone uses stable optical feedback on individual notification borders, not the transparent stack.</p>')
 ]),
 componentDoc("stepper","Stepper","Ordered process navigation and optional panel switching.",[
  section('Loading',"<p>Load the independent stylesheet after the framework. No component is bundled in core.</p>",[snippet('Optional stylesheet',"<link rel=\"stylesheet\" href=\"engines/components/stepper.css\">")]),
  section('Interactive example',"<p>Use an ordered list with native links, spans or buttons. Mark the active step with aria-current=\"step\". The optional controller maps native buttons to labelled panels, preserves DOM nodes and values, and leaves authored panels readable without scripting. The application owns validation, eligibility, completion and final submission.</p>",[example("Workspace setup","<section class=\"stack\" id=\"onboarding-wizard\">\n  <ol class=\"stepper\" id=\"onboarding-steps\" aria-label=\"Setup steps\">\n    <li><button type=\"button\" id=\"step-account\" aria-current=\"step\" aria-controls=\"step-account-panel\">Account</button></li>\n    <li><button type=\"button\" id=\"step-preferences\" aria-controls=\"step-preferences-panel\">Preferences</button></li>\n    <li><button type=\"button\" id=\"step-review\" aria-controls=\"step-review-panel\">Review</button></li>\n  </ol>\n  <section class=\"panel stack\" id=\"step-account-panel\" aria-labelledby=\"step-account\">\n    <h3>Account</h3>\n    <label>Workspace name <input type=\"text\" value=\"UIBMS\"></label>\n  </section>\n  <section class=\"panel stack\" id=\"step-preferences-panel\" aria-labelledby=\"step-preferences\">\n    <h3>Preferences</h3>\n    <label><input type=\"checkbox\" checked> Receive workspace updates</label>\n  </section>\n  <section class=\"panel stack\" id=\"step-review-panel\" aria-labelledby=\"step-review\">\n    <h3>Review</h3>\n    <p>Your preferences are ready for review.</p>\n  </section>\n  <div class=\"cluster\">\n    <button type=\"button\" id=\"stepper-back\">Back</button>\n    <button type=\"button\" id=\"stepper-next\">Next</button>\n    <output id=\"stepper-status\" aria-live=\"polite\">Step 1 of 3</output>\n  </div>\n</section>",{run:"stepper",scripts:[{lang:'javascript',code:"import {mountStepper} from './engines/components/stepper.mjs';\nconst list = document.querySelector('#onboarding-steps');\nconst wizard = mountStepper(list);\nconst back = document.querySelector('#stepper-back');\nconst next = document.querySelector('#stepper-next');\nconst status = document.querySelector('#stepper-status');\nfunction update() {\n  back.disabled = wizard.current <= 0;\n  next.disabled = wizard.current >= 2;\n  status.value = 'Step ' + (wizard.current + 1) + ' of 3';\n}\nlist.addEventListener('stepchange', update);\nback.addEventListener('click', () => wizard.previous({focus:true}));\nnext.addEventListener('click', () => wizard.next({focus:true}));\nupdate();"}]})]),
  section("Read-only vertical steps","<p>Add stepper-vertical for a vertical sequence. Use text to convey completion.</p>",[example("Read-only vertical steps example","<ol class=\"stepper stepper-vertical\" aria-label=\"Order progress\">\n  <li><span>Order received — completed</span></li>\n  <li><span aria-current=\"step\">Preparing shipment</span></li>\n  <li><span>Delivery — pending</span></li>\n</ol>")]),
  section('Controller API',"<p>mountStepper(list,{scope:list.parentElement}) provides current (zero-based), go(index,{focus:false}), next(), previous(), refresh() and destroy(). Each button has a unique ID and aria-controls pointing to a native section with aria-labelledby pointing back to its button. The legacy .stepper-panel class remains supported. Disabled steps cannot be selected. Cancel beforestepchange to enforce application rules; stepchange reports successful navigation. This is panel navigation, not automatic form validation.</p>")
 ]),
 componentDoc("pagination","Pagination","Native page links and bounded client-side page controls.",[
  section('Loading',"<p>Load the independent stylesheet after the framework. No component is bundled in core.</p>",[snippet('Optional stylesheet',"<link rel=\"stylesheet\" href=\"engines/components/pagination.css\">")]),
  section('Interactive example',"<p>Native links support server-side navigation without JavaScript. For local paging, the optional controller creates real buttons, a bounded page window and ellipses, updates aria-current, and preserves focus. Try navigating the 100 sample records. Applications supply their own data; the framework performs no network requests.</p>",[example("Paginated records","<section class=\"stack\">\n  <output id=\"pagination-summary\" aria-live=\"polite\">Showing records 41–50 of 100</output>\n  <div class=\"panel stack\" id=\"pagination-records\"></div>\n  <nav class=\"pagination\" id=\"records-pagination\" aria-label=\"Record pages\"></nav>\n</section>",{run:"pagination",scripts:[{lang:'javascript',code:"import {mountPagination} from './engines/components/pagination.mjs';\nconst summary = document.querySelector('#pagination-summary');\nconst records = document.querySelector('#pagination-records');\nfunction showPage(page) {\n  const first = (page - 1) * 10 + 1;\n  const last = page * 10;\n  summary.value = 'Showing records ' + first + '–' + last + ' of 100';\n  records.replaceChildren(...Array.from({length:10}, (_,i) => {\n    const row = document.createElement('p');\n    row.textContent = 'Record ' + (first + i);\n    return row;\n  }));\n}\nconst pagination = mountPagination(document.querySelector('#records-pagination'), {\n  current:5, total:10, onChange:showPage\n});\nshowPage(pagination.current);"}]})]),
  section("Native links","<p>Use an accessible labelled nav containing an unordered list. The example links lead to actual documentation pages.</p>",[example("Native links example","<nav class=\"pagination\" aria-label=\"Example pages\">\n  <ul>\n    <li><span aria-disabled=\"true\">Previous</span></li>\n    <li><a href=\"{{base}}docs/components/\" aria-label=\"Page 1\">1</a></li>\n    <li><span aria-current=\"page\">2</span></li>\n    <li><a href=\"{{base}}docs/tabs/\" aria-label=\"Page 3\">3</a></li>\n    <li><a href=\"{{base}}docs/tabs/\" rel=\"next\">Next</a></li>\n  </ul>\n</nav>")]),
  section('Controller API',"<p>mountPagination(nav,{current:1,total:1,siblings:1,onChange,labels}) expects an empty labelled nav. setPage(), setTotal(), current, total and destroy() control navigation. beforepagechange is cancelable; pagechange and onChange report selection. pageWindow(current,total,siblings) is a pure helper returning page numbers and ellipsis markers.</p>")
 ]),
 componentDoc("chips","Tags and chips","Descriptive labels, native selectable filters and removable items.",[
  section('Loading',"<p>Load the independent stylesheet after the framework. No component is bundled in core.</p>",[snippet('Optional stylesheet',"<link rel=\"stylesheet\" href=\"engines/components/chips.css\">")]),
  section('Interactive example',"<p>Tags are descriptive text. Selectable chips contain native checkboxes; removable chips use a separate native button. data-tone optionally supplies a semantic colour. The delegated removal helper reports the removed value, supports cancelation and transfers focus to a neighbouring remove button. Restore belongs to this demo, not the library.</p>",[example("Selected skills","<section class=\"stack\">\n  <ul class=\"chips\" id=\"demo-removable-skills\" role=\"list\" aria-label=\"Selected skills\">\n    <li>HTML <button type=\"button\" name=\"remove-chip\" value=\"html\" aria-label=\"Remove HTML\">×</button></li>\n    <li>CSS <button type=\"button\" name=\"remove-chip\" value=\"css\" aria-label=\"Remove CSS\">×</button></li>\n    <li>JavaScript <button type=\"button\" name=\"remove-chip\" value=\"javascript\" aria-label=\"Remove JavaScript\">×</button></li>\n  </ul>\n  <output id=\"chip-status\" aria-live=\"polite\">Three selected skills</output>\n  <div><button type=\"button\" id=\"chip-restore\">Restore example</button></div>\n</section>",{run:"chips",scripts:[{lang:'javascript',code:"import {mountChips} from './engines/components/chips.mjs';\nconst group = document.querySelector('#demo-removable-skills');\nconst status = document.querySelector('#chip-status');\nconst initial = Array.from(group.children, chip => chip.cloneNode(true));\nconst chips = mountChips(group);\ngroup.addEventListener('chipremove', event => {\n  status.value = 'Removed ' + event.detail.value + '. ' + group.children.length + ' remaining.';\n});\ndocument.querySelector('#chip-restore').addEventListener('click', () => {\n  group.replaceChildren(...initial.map(chip => chip.cloneNode(true)));\n  status.value = 'Three selected skills';\n});"}]})]),
  section("Static tags","<p>Labels remain readable with text and contextual colours; they are not buttons. Use a native list with the tags class and plain list items.</p>",[example("Static tags example","<ul class=\"tags\" role=\"list\">\n  <li>Design</li>\n  <li data-tone=\"info\">In review</li>\n  <li data-tone=\"success\">Approved</li>\n  <li data-tone=\"warning\">Attention needed</li>\n  <li data-tone=\"danger\">Blocked</li>\n</ul>")]),
  section("Selectable filter chips","<p>Native checkbox values, keyboard behaviour, disabled state and reset require no controller. The chips class scopes the direct labels, with no child classes needed.</p>",[example("Selectable filter chips example","<form class=\"stack\">\n  <fieldset class=\"stack\">\n    <legend>Filter projects</legend>\n    <div class=\"chips\">\n      <label><input type=\"checkbox\" name=\"filters\" value=\"design\" checked> Design</label>\n      <label><input type=\"checkbox\" name=\"filters\" value=\"development\"> Development</label>\n      <label><input type=\"checkbox\" name=\"filters\" value=\"review\"> In review</label>\n      <label><input type=\"checkbox\" name=\"filters\" value=\"archived\" disabled> Archived</label>\n    </div>\n  </fieldset>\n  <div class=\"cluster\"><button type=\"submit\">Apply</button><button type=\"reset\">Reset</button></div>\n</form>")]),
  section('Controller API',"<p>mountChips(container) expects .chips with direct list items containing a separate button named remove-chip. Legacy direct .chip children remain supported. remove(button) dispatches cancelable beforechipremove, removes the chip, then dispatches chipremove with detail.value and detail.chip. destroy() removes listeners and restores the original container tabindex. Removal changes the DOM and is not undone by form reset.</p>")
 ]),
 componentDoc("command-palette","Command palette","Native modal search and keyboard-driven application actions.",[
  section('Loading',"<p>Load the independent stylesheet after the framework. No component is bundled in core.</p>",[snippet('Optional stylesheet',"<link rel=\"stylesheet\" href=\"engines/components/command.css\">")]),
  section('Interactive example',"<p>Open the native modal and search its real buttons or links. Matching is case- and accent-insensitive; every word must match. Arrow keys move between the search field and enabled results, Home and End navigate results, and Enter activates a result. Escape and the close button use native dialog dismissal. The component inherits contextual styles and existing Liquid Silicone overlays.</p>",[example("Search and execute","<div class=\"stack\">\n  <div class=\"cluster\">\n    <button type=\"button\" commandfor=\"workspace-commands\" command=\"show-modal\" aria-haspopup=\"dialog\">Open command palette</button>\n    <output id=\"command-action-status\" aria-live=\"polite\">No action selected</output>\n  </div>\n  <dialog class=\"command-palette\" id=\"workspace-commands\" aria-labelledby=\"command-title\">\n    <div class=\"stack\">\n      <header class=\"cluster\">\n        <h3 id=\"command-title\">Workspace commands</h3>\n        <form method=\"dialog\"><button type=\"submit\" aria-label=\"Close commands\">×</button></form>\n      </header>\n      <label>Search commands <input type=\"search\" placeholder=\"Search actions…\" aria-controls=\"workspace-command-results\" autofocus></label>\n      <p role=\"status\" aria-live=\"polite\">Available commands</p>\n      <ul id=\"workspace-command-results\">\n        <li><button type=\"button\" value=\"create\">Create project</button></li>\n        <li><button type=\"button\" value=\"settings\">Open workspace settings</button></li>\n        <li><button type=\"button\" value=\"export\">Export report</button></li>\n        <li><a href=\"{{base}}docs/components/\">Open components documentation</a></li>\n        <li><button type=\"button\" value=\"archive\" disabled>Archive workspace</button></li>\n      </ul>\n    </div>\n  </dialog>\n</div>",{run:"command",scripts:[{lang:'javascript',code:"import {mountCommandPalette} from './engines/components/command.mjs';\nconst dialog = document.querySelector('#workspace-commands');\nconst commands = mountCommandPalette(dialog);\ndialog.addEventListener('commandselect', event => {\n  document.querySelector('#command-action-status').value =\n    'Selected: ' + event.detail.action.textContent.trim();\n});"}]})]),
  section('Controller API',"<p>Give the search input aria-controls pointing to the identified native results list. mountCommandPalette(dialog,{shortcut:true}) optionally enables Ctrl/Cmd+K outside editable fields and other modals. The docs demo keeps the existing site search shortcut, so use its open button. open(), close(), refresh() and destroy() manage lifecycle. commandselect is cancelable to keep the palette open without suppressing the actual application action. The application owns its command registry, routing and remote data.</p>")
 ],'command')
]);

group('Dashboard',[
 doc("dashboard","Dashboard overview","Start with semantic HTML and add responsive dashboard components as needed.",[
  section('Start with native HTML','<p>Use a header for the heading, a navigation landmark for workspace links, and a section for the dashboard content. The core styles these elements directly. This example is embedded in the documentation page. In a standalone dashboard, put its primary content in the page’s main element.</p>',[
    example('Native dashboard structure',`<header>
  <h4>Project workspace</h4>
  <nav aria-label="Workspace sections">
    <a href="#native-dashboard-overview">Overview</a>
    <a href="#native-dashboard-projects">Projects</a>
  </nav>
</header>
<section id="native-dashboard-overview">
  <h5>Overview</h5>
  <dl>
    <dt>Active projects</dt>
    <dd>12</dd>
  </dl>
</section>
<section id="native-dashboard-projects">
  <h5>Projects</h5>
  <ul>
    <li>Website refresh</li>
    <li>Documentation review</li>
  </ul>
</section>`)
  ]),
  {
    "title": "Add the responsive shell",
    "body": "<p><a data-site-primary href=\"{{base}}demos/admin/\">Launch the complete administration dashboard</a> · <a href=\"{{base}}demos/\">All standalone demos</a></p><p>Use the optional App Shell for a responsive sidebar and an independently scrolling workspace. Use one app-shell class around a native header, nav and main. This embedded example uses a labelled section as its workspace because the documentation page already has a main element. Load only the component styles your dashboard uses. The list below includes the dependencies of the complete interactive example.</p>",
    "examples": [
      {
        "label": "Load the dashboard styles",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/app-shell.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/sidebar.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/topbar.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/page-header.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/split-workspace.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/metrics.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/widget-grid.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/sparkline.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/progress-ring.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/quick-actions.css\">\n<link rel=\"stylesheet\" href=\"engines/components/dropdown.css\">\n<link rel=\"stylesheet\" href=\"engines/components/command.css\">\n<link rel=\"stylesheet\" href=\"engines/components/drawer.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Full interactive example",
    "body": "<p>Resize the viewport or collapse navigation. Desktop uses an icon rail; compact mode opens a native navigation drawer. The sidebar and workspace scroll independently. In Projects, a wide split workspace resizes by pointer or keyboard, then stacks on narrow screens. Change the site Appearance configuration to explore the inherited theme and material.</p>",
    "examples": [
      {
        "label": "Administration workspace with the optional shell",
        "html": "<div class=\"app-shell\" id=\"dashboard-demo-shell\" style=\"--dashboard-height:min(44rem,82dvh)\">\n  <header>\n    <div>\n      <button class=\"sidebar-toggle\" type=\"button\" aria-label=\"Toggle navigation\" aria-controls=\"dash-sidebar\" aria-expanded=\"true\">☰</button>\n      <button class=\"sidebar-drawer-toggle\" type=\"button\" aria-label=\"Open navigation drawer\" commandfor=\"dash-sidebar-drawer\" command=\"show-modal\" aria-haspopup=\"dialog\" aria-controls=\"dash-sidebar-drawer\">☰</button>\n      <strong>Studio / Admin</strong>\n    </div>\n    <div>\n      <button type=\"button\" commandfor=\"dash-commands\" command=\"show-modal\" aria-haspopup=\"dialog\">Search</button>\n      <button type=\"button\" id=\"dash-user\" popovertarget=\"dash-user-menu\" aria-haspopup=\"menu\" aria-expanded=\"false\">Account ▾</button>\n      <div class=\"dropdown\" id=\"dash-user-menu\" role=\"menu\" popover=\"auto\" aria-labelledby=\"dash-user\" tabindex=\"-1\">\n        <a role=\"menuitem\" href=\"#dash-settings\">Workspace settings</a>\n        <a role=\"menuitem\" href=\"{{base}}docs/components/\">Component library</a>\n      </div>\n    </div>\n  </header>\n  <dialog class=\"drawer drawer-start dashboard-nav-drawer\" id=\"dash-sidebar-drawer\" aria-labelledby=\"dash-sidebar-drawer-title\" closedby=\"any\">\n    <header class=\"cluster\"><h3 id=\"dash-sidebar-drawer-title\">Navigation</h3><form method=\"dialog\"><button type=\"submit\" autofocus aria-label=\"Close navigation\">×</button></form></header>\n  </dialog>\n  <nav id=\"dash-sidebar\" aria-label=\"Dashboard navigation\">\n      <ul>\n        <li><a href=\"#dash-overview\" aria-current=\"page\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10l9-7 9 7v10H3z M9 20v-6h6v6\"></path></svg><span>Overview</span></a></li>\n        <li><details open><summary><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z\"></path></svg><span>Management</span></summary><ul>\n          <li><a href=\"#dash-projects\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7h7l2 3h9v10H3z M3 7V4h7l2 3h9v3\"></path></svg><span>Projects</span></a></li>\n          <li><a href=\"#dash-reports\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 20V4 M4 20h16 M8 16v-4 M12 16V8 M16 16V5\"></path></svg><span>Reports</span></a></li>\n        </ul></details></li>\n        <li><a href=\"#dash-settings\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 7h16 M4 12h16 M4 17h16 M8 5v4 M16 10v4 M10 15v4\"></path></svg><span>Settings</span></a></li>\n      </ul>\n    </nav>\n  <section id=\"dash-workspace\" aria-label=\"Administration workspace\" tabindex=\"0\">\n    <section class=\"stack\" id=\"dash-overview\" tabindex=\"-1\">\n      <header class=\"dashboard-page-header\">\n        <div><nav aria-label=\"Location\"><ol><li><a href=\"#dash-overview\">Workspace</a></li><li aria-current=\"page\">Overview</li></ol></nav>\n          <h3>Overview</h3><p>Welcome to your workspace.</p>\n        </div>\n        <div><a href=\"#dash-projects\">View projects</a></div>\n      </header>\n      <div class=\"grid widget-grid\" style=\"--dashboard-widget-min:12rem\">\n  <dl class=\"card stack metric-card\">\n  <dt>Active projects</dt>\n  <dd><strong>24</strong>\n  <span data-tone=\"info\">6 awaiting review</span>\n  <figure class=\"sparkline\">\n"+staticSparkline("Project activity values", [12, 16, 14, 19, 20, 22, 24], "Seven observations of active projects.")+"</dd>\n</dl>\n  <dl class=\"card stack metric-card\">\n  <dt>Open tasks</dt>\n  <dd><strong>18</strong>\n  <span data-tone=\"warning\">4 due this week</span></dd>\n</dl>\n  <dl class=\"card stack metric-card\"><dt>Project completion</dt><dd><div class=\"progress-ring\">\n  <progress value=\"28\" max=\"36\" aria-label=\"Completed projects\">28 / 36</progress>\n</div><small>28 of 36 projects</small></dd></dl>\n  <article class=\"panel stack\"><h4>Quick actions</h4><nav class=\"cluster quick-actions\" aria-label=\"Workspace quick actions\">\n  <a href=\"#dash-projects\">Open projects</a>\n  <a href=\"#dash-reports\">Open reports</a>\n  <a href=\"#dash-settings\">Settings</a>\n</nav></article>\n</div>\n      <article class=\"panel stack\">\n        <h4>Recent activity</h4>\n        <p>Website redesign — review completed.</p><p>Quarterly report — draft available.</p>\n        <a href=\"#dash-reports\">Open reports</a>\n      </article>\n    </section>\n    <section class=\"stack\" id=\"dash-projects\" tabindex=\"-1\">\n      <header class=\"dashboard-page-header\"><div><nav aria-label=\"Location\"><ol><li><a href=\"#dash-overview\">Workspace</a></li><li aria-current=\"page\">Projects</li></ol></nav><h3>Projects</h3><p>Master-detail workspace</p></div></header>\n      <div class=\"split-workspace\" id=\"dash-project-split\">\n  <section class=\"panel stack\" id=\"dash-project-primary\" aria-label=\"Project list\">\n    <h4>Project list</h4>\n    <p>Website redesign</p><p>Customer portal</p><p>Quarterly review</p>\n  </section>\n  <div role=\"separator\" tabindex=\"-1\" aria-label=\"Resize project list\" aria-controls=\"dash-project-primary\" aria-orientation=\"vertical\"></div>\n  <section class=\"panel stack\" aria-label=\"Project detail\">\n    <h4>Website redesign</h4>\n    <p>Review the current milestone and prepare the next release.</p>\n    <label>Project notes <textarea rows=\"3\">Prepare design review.</textarea></label>\n    <progress value=\"65\" max=\"100\" aria-label=\"Project completion\">65%</progress>\n  </section>\n</div>\n    </section>\n    <section class=\"stack\" id=\"dash-reports\" tabindex=\"-1\">\n      <header class=\"dashboard-page-header\"><div><nav aria-label=\"Location\"><ol><li><a href=\"#dash-overview\">Workspace</a></li><li aria-current=\"page\">Reports</li></ol></nav><h3>Reports</h3><p>Sample reporting workspace</p></div></header>\n      <article class=\"panel stack\"><h4>Quarterly overview</h4><p>Revenue and project milestones.</p><progress value=\"75\" max=\"100\" aria-label=\"Report progress\">75%</progress></article>\n      <article class=\"panel stack\"><h4>Operations</h4><p>Monthly activity summary.</p></article>\n    </section>\n    <section class=\"stack\" id=\"dash-settings\" tabindex=\"-1\">\n      <header class=\"dashboard-page-header\"><div><nav aria-label=\"Location\"><ol><li><a href=\"#dash-overview\">Workspace</a></li><li aria-current=\"page\">Settings</li></ol></nav><h3>Settings</h3><p>Local example only</p></div></header>\n      <section class=\"panel stack\"><label>Workspace name <input value=\"Studio\"></label><label><input type=\"checkbox\" checked> Receive updates</label></section>\n    </section>\n  </section>\n  <dialog class=\"command-palette\" id=\"dash-commands\" aria-labelledby=\"dash-commands-title\">\n    <div class=\"stack\">\n      <header class=\"cluster\"><h3 id=\"dash-commands-title\">Workspace commands</h3><form method=\"dialog\"><button type=\"submit\" aria-label=\"Close commands\">×</button></form></header>\n      <label>Search commands <input type=\"search\" aria-controls=\"dash-command-results\" autofocus></label>\n      <p role=\"status\" aria-live=\"polite\">Available commands</p>\n      <ul id=\"dash-command-results\">\n        <li><a href=\"#dash-overview\">Open overview</a></li>\n        <li><a href=\"#dash-projects\">Open projects</a></li>\n        <li><a href=\"#dash-reports\">Open reports</a></li>\n        <li><a href=\"#dash-settings\">Open settings</a></li>\n      </ul>\n    </div>\n  </dialog>\n</div>",
        "lang": "html",
        "run": "dashboard",
        "scripts": [
          {
            "lang": "javascript",
            "code": drawerFallback + "\nimport {mountProgressRing} from './engines/dashboard/progress-ring.mjs';\nimport {mountAppShell} from './engines/dashboard/app-shell.mjs';\nimport {mountSplitWorkspace} from './engines/dashboard/split-workspace.mjs';\nimport {mountDropdowns} from './engines/components/dropdown.mjs';\nimport {mountCommandPalette} from './engines/components/command.mjs';\nmountDropdowns(document);\nconst shell = document.querySelector('#dashboard-demo-shell');\nconst layout = mountAppShell(shell);\nconst workspace = shell.querySelector('#dash-workspace');\nconst views = [...workspace.querySelectorAll(':scope > section[id]')];\nconst links = [...shell.querySelectorAll('#dash-sidebar a[href]')];\nfunction showView(id, focus = false) {\n  const view = views.find(v => v.id === id);\n  if (!view) return false;\n  for (const v of views) v.hidden = v !== view;\n  for (const link of links) {\n    if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'page');\n    else link.removeAttribute('aria-current');\n  }\n  if (layout.mode === 'compact') layout.setExpanded(false);\n  workspace.scrollTop = 0;\n  if (focus) view.focus({preventScroll:true});\n  return true;\n}\nshell.addEventListener('click', event => {\n  const link = event.target.closest('a[href^=\"#\"]');\n  if (!link || !shell.contains(link) || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;\n  const id = link.getAttribute('href').slice(1);\n  if (views.some(v => v.id === id)) {\n    event.preventDefault();\n    showView(id, true);\n  }\n});\nshowView('dash-overview');\nmountSplitWorkspace(shell.querySelector('.split-workspace'));\nmountCommandPalette(shell.querySelector('#dash-commands'));\nfor (const ring of shell.querySelectorAll('.progress-ring')) mountProgressRing(ring);"
          }
        ]
      }
    ]
  },
  {
    "title": "Component reference",
    "body": "<p>Individual references: <a href=\"{{base}}docs/app-shell/\">App Shell</a>, <a href=\"{{base}}docs/dashboard-sidebar/\">Sidebar</a>, <a href=\"{{base}}docs/topbar/\">Topbar</a>, <a href=\"{{base}}docs/page-header/\">Page Header</a> and <a href=\"{{base}}docs/split-workspace/\">Split Workspace</a>.</p><p>Widget references: <a href=\"{{base}}docs/kpi-cards/\">KPI cards</a>, <a href=\"{{base}}docs/statistic-cards/\">Statistic cards</a>, <a href=\"{{base}}docs/sparklines/\">Sparklines</a>, <a href=\"{{base}}docs/progress-rings/\">Progress rings</a>, <a href=\"{{base}}docs/widget-grid/\">Widget grid</a> and <a href=\"{{base}}docs/quick-actions/\">Quick actions</a>.</p>",
    "examples": []
  },
  {
    "title": "Loading and next steps",
    "body": "<p>Batches 1 and 2 provide administration layout and widgets. Advanced business interfaces, Data Grid, chart engines and a dashboard designer remain future work. The core CSS and ordinary components remain independently usable.</p>",
    "examples": []
  }
],{stylesheets:["dashboard/app-shell.css","dashboard/sidebar.css","dashboard/topbar.css","dashboard/page-header.css","dashboard/split-workspace.css","dashboard/metrics.css","dashboard/widget-grid.css","dashboard/sparkline.css","dashboard/progress-ring.css","dashboard/quick-actions.css","components/dropdown.css","components/command.css","components/drawer.css"]}),
 doc("app-shell","App Shell","Container-responsive administration shell with independent scrolling.",[
  {
    "title": "Loading",
    "body": "<p>Load app-shell.css, sidebar.css and topbar.css. For new shells, place header, nav and main directly under .app-shell. An embedded workspace can use a labelled section. The older grid wrapper and explicit region classes remain supported. Its own inline size determines the layout, independently of the viewport. The optional controller manages only collapse/expand.</p>",
    "examples": [
      {
        "label": "Shell styles",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/app-shell.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/sidebar.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/topbar.css\">\n<link rel=\"stylesheet\" href=\"engines/components/drawer.css\">",
        "lang": "html"
      },
      {
        "label": "Native shell structure",
        "code": "<div class=\"app-shell\">\n  <header><h2>Project workspace</h2></header>\n  <nav aria-label=\"Workspace\">\n    <ul><li><a href=\"#projects\">Projects</a></li></ul>\n  </nav>\n  <main id=\"projects\"><h1>Projects</h1></main>\n</div>",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Responsive shell",
    "body": "<p>Use the toggle to collapse the sidebar. At 42rem or more it becomes an icon rail; below that width the mobile button opens a native modal drawer. The same live sidebar is moved into the dialog and back, preserving nested groups and current links. Without the optional controller the navigation stays visible in-flow.</p>",
    "examples": [
      {
        "label": "Native responsive shell",
        "html": "<div class=\"app-shell\" style=\"--dashboard-height:24rem\">\n  <header><div>\n    <button class=\"sidebar-toggle\" type=\"button\" aria-label=\"Toggle navigation\" aria-controls=\"simple-shell-sidebar\" aria-expanded=\"true\">☰</button>\n      <button class=\"sidebar-drawer-toggle\" type=\"button\" aria-label=\"Open navigation drawer\" commandfor=\"simple-shell-sidebar-drawer\" command=\"show-modal\" aria-haspopup=\"dialog\" aria-controls=\"simple-shell-sidebar-drawer\">☰</button><strong>Workspace</strong>\n  </div><div><a href=\"{{base}}docs/dashboard/\">Full demo</a></div></header>\n  <dialog class=\"drawer drawer-start dashboard-nav-drawer\" id=\"simple-shell-sidebar-drawer\" aria-labelledby=\"simple-shell-sidebar-drawer-title\" closedby=\"any\">\n    <header class=\"cluster\"><h3 id=\"simple-shell-sidebar-drawer-title\">Navigation</h3><form method=\"dialog\"><button type=\"submit\" autofocus aria-label=\"Close navigation\">×</button></form></header>\n  </dialog>\n  <nav id=\"simple-shell-sidebar\" aria-label=\"Sample navigation\"><ul>\n      <li><a href=\"{{base}}docs/dashboard/\" aria-current=\"page\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10l9-7 9 7v10H3z M9 20v-6h6v6\"></path></svg><span>Dashboard</span></a></li>\n      <li><a href=\"{{base}}docs/components/\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z\"></path></svg><span>Components</span></a></li>\n      <li><a href=\"{{base}}docs/split-workspace/\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7h7l2 3h9v10H3z M3 7V4h7l2 3h9v3\"></path></svg><span>Workspace</span></a></li>\n    </ul></nav>\n  <section class=\"stack\" aria-label=\"Sample content\" tabindex=\"0\">\n    <h3>Workspace</h3><article class=\"panel\"><h4>Independent content</h4><p>The sidebar and main content scroll separately.</p></article>\n    <article class=\"panel\"><h4>Section 1</h4><p>Scrollable application content.</p></article>\n    <article class=\"panel\"><h4>Section 2</h4><p>Scrollable application content.</p></article>\n    <article class=\"panel\"><h4>Section 3</h4><p>Scrollable application content.</p></article>\n    <article class=\"panel\"><h4>Section 4</h4><p>Scrollable application content.</p></article>\n    <article class=\"panel\"><h4>Section 5</h4><p>Scrollable application content.</p></article>\n  </section>\n</div>",
        "lang": "html",
        "run": "dashboard",
        "scripts": [
          {
            "lang": "javascript",
            "code": drawerFallback + "\nimport {mountAppShell} from './engines/dashboard/app-shell.mjs';\nfor (const el of document.querySelectorAll('.app-shell')) mountAppShell(el);"
          }
        ]
      }
    ]
  },
  {
    "title": "Configuration and API",
    "body": "<p>mountAppShell(shell,{expanded:true,mobileExpanded:false}) exposes setExpanded(), refresh(), mode, expanded and destroy(). sidebarvisibilitychange reports state and mode. Provide a labelled toggle with aria-controls. The browser handles Escape and focus isolation for the mobile drawer. Resize to wide closes the active modal. Customize --dashboard-height, --dashboard-sidebar-width, --dashboard-rail-width, --dashboard-mobile-drawer-width and --dashboard-content-padding. Existing markup without an authored drawer keeps its legacy in-flow layout. A definite height enables separate scroll regions. No persistence or router is imposed.</p>",
    "examples": []
  }
],{stylesheets:["dashboard/app-shell.css","dashboard/sidebar.css","dashboard/topbar.css","components/drawer.css"]}),
 doc("dashboard-sidebar","Sidebar","Semantic, nested administration navigation.",[
  {
    "title": "Loading",
    "body": "<p>Load sidebar.css. Use nav.dashboard-sidebar standalone or a direct nav in .app-shell, with native lists, links and details/summary. aria-current marks the application-selected route. The optional App Shell can collapse text labels visually while retaining accessible names.</p>",
    "examples": [
      {
        "label": "Sidebar stylesheet",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/sidebar.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Nested navigation",
    "body": "<p>Expand or collapse the Management group using the native details element. Links lead to actual documentation pages. The current link is illustrative; applications supply their own route state. Optional sidebar background/foreground tokens customize the surface.</p>",
    "examples": [
      {
        "label": "Sidebar navigation",
        "html": "<nav class=\"dashboard-sidebar\" style=\"max-inline-size:18rem\" aria-label=\"Example sidebar\">\n  <ul>\n    <li><a href=\"{{base}}docs/dashboard/\" aria-current=\"page\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10l9-7 9 7v10H3z M9 20v-6h6v6\"></path></svg><span>Dashboard</span></a></li>\n    <li><details open><summary><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z\"></path></svg><span>Management</span></summary><ul>\n      <li><a href=\"{{base}}docs/components/\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7h7l2 3h9v10H3z M3 7V4h7l2 3h9v3\"></path></svg><span>Components</span></a></li>\n      <li><a href=\"{{base}}docs/split-workspace/\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 20V4 M4 20h16 M8 16v-4 M12 16V8 M16 16V5\"></path></svg><span>Workspace</span></a></li>\n    </ul></details></li>\n    <li><a href=\"{{base}}docs/page-header/\"><svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 7h16 M4 12h16 M4 17h16 M8 5v4 M16 10v4 M10 15v4\"></path></svg><span>Page settings</span></a></li>\n  </ul>\n</nav>",
        "lang": "html"
      }
    ]
  }
],{stylesheets:["dashboard/sidebar.css"]}),
 doc("topbar","Topbar","Responsive navigation, branding and application action groups.",[
  {
    "title": "Loading",
    "body": "<p>Load topbar.css. Use .dashboard-topbar on a header, with two direct div children for optional branding and action groups. Legacy explicit group classes remain supported. Groups wrap rather than overflowing. Add native controls or existing independently loadable components as necessary.</p>",
    "examples": [
      {
        "label": "Topbar stylesheet",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/topbar.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Flexible groups",
    "body": "<p>This example keeps search and navigation semantic. The input is a visual structure example, not a connected search service. For real command search, see the complete dashboard demo.</p>",
    "examples": [
      {
        "label": "Topbar actions",
        "html": "<header class=\"dashboard-topbar\">\n  <div><strong>Studio / Admin</strong></div>\n  <div><label>Search <input type=\"search\" placeholder=\"Find a record\"></label><a href=\"{{base}}docs/command-palette/\">Commands</a><a href=\"{{base}}docs/dashboard/\">Dashboard</a></div>\n</header>",
        "lang": "html"
      }
    ]
  }
],{stylesheets:["dashboard/topbar.css"]}),
 doc("page-header","Page header","Contextual headings, breadcrumbs and responsive page actions.",[
  {
    "title": "Loading",
    "body": "<p>Load page-header.css. Use a native header.dashboard-page-header with a direct div containing the heading and description, followed by an optional second div containing actions. Breadcrumbs use a labelled nav with an ordered list, ordinary links and aria-current. No route generation or mandatory icon set.</p>",
    "examples": [
      {
        "label": "Page header stylesheet",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/page-header.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Page identity",
    "body": "<p>Actions wrap when the available space is narrow. Headings and breadcrumb text retain the surrounding typography and palette.</p>",
    "examples": [
      {
        "label": "Page header with breadcrumbs",
        "html": "<header class=\"dashboard-page-header\">\n  <div>\n    <nav aria-label=\"Example location\"><ol><li><a href=\"{{base}}docs/dashboard/\">Workspace</a></li><li aria-current=\"page\">Projects</li></ol></nav>\n    <h3>Projects</h3><p>Manage your workspace records.</p>\n  </div>\n  <div><a href=\"{{base}}docs/chips/\">Filters</a><a href=\"{{base}}docs/split-workspace/\">Open workspace</a></div>\n</header>",
        "lang": "html"
      }
    ]
  }
],{stylesheets:["dashboard/page-header.css"]}),
 doc("split-workspace","Split workspace","Resizable two-pane layout with responsive stacking.",[
  {
    "title": "Loading",
    "body": "<p>Load split-workspace.css. Place two panes and a labelled role=separator handle directly inside .split-workspace; no additional grid wrapper is required. Import the optional controller to enable pointer capture, keyboard resize and ARIA values. Without JavaScript, the static layout remains readable and the handle is hidden.</p>",
    "examples": [
      {
        "label": "Split workspace stylesheet",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/split-workspace.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Resizable panes",
    "body": "<p>Drag the divider or focus it and use Left/Right, Home and End. The controller clamps the ratio to the actual available width and respects RTL. Below 36rem, panes stack and the separator is hidden. Form state is preserved because pane contents are not recreated.</p>",
    "examples": [
      {
        "label": "Project master-detail",
        "html": "<div class=\"split-workspace\" id=\"standalone-project-split\">\n    <section class=\"panel stack\" id=\"standalone-project-primary\" aria-label=\"Project list\">\n      <h4>Project list</h4>\n      <p>Website redesign</p><p>Customer portal</p><p>Quarterly review</p>\n    </section>\n    <div role=\"separator\" tabindex=\"-1\" aria-label=\"Resize project list\" aria-controls=\"standalone-project-primary\" aria-orientation=\"vertical\"></div>\n    <section class=\"panel stack\" aria-label=\"Project detail\">\n      <h4>Website redesign</h4>\n      <p>Review the current milestone and prepare the next release.</p>\n      <label>Project notes <textarea rows=\"3\">Prepare design review.</textarea></label>\n      <progress value=\"65\" max=\"100\" aria-label=\"Project completion\">65%</progress>\n    </section>\n</div>",
        "lang": "html",
        "run": "dashboard",
        "scripts": [
          {
            "lang": "javascript",
            "code": "import {mountSplitWorkspace} from './engines/dashboard/split-workspace.mjs';\nfor (const el of document.querySelectorAll('.split-workspace')) mountSplitWorkspace(el);"
          }
        ]
      }
    ]
  },
  {
    "title": "Configuration and API",
    "body": "<p>mountSplitWorkspace(root,{ratio:.42,minStart:160,minEnd:220,keyboardStep:.05}) exposes setRatio(), refresh(), ratio and destroy(). splitresize reports the applied ratio. --dashboard-split-ratio controls the initial proportion; --dashboard-split-gutter controls divider width. Minimum sizes are CSS pixels and adapt to the actual space. The component does not manage records or business state.</p>",
    "examples": []
  }
],{stylesheets:["dashboard/split-workspace.css"]}),
 doc("kpi-cards","KPI cards","Compose meaningful business metrics with existing surfaces and typography.",[
  {
    "title": "Loading",
    "body": "<p>The metric stylesheet adds metric-specific content styles, not a new card surface. Compose a native dl with the existing .card or .panel and .stack. The dt labels the metric and the dd holds its value and context. The application supplies and formats each value, comparison period and semantic direction. There is no KPI data store or hardcoded currency.</p>",
    "examples": [
      {
        "label": "Stylesheets",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/metrics.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/widget-grid.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Metric examples",
    "body": "<p>Values, periods and changes are authored content. Optional data-tone reuses semantic colour roles; include descriptive text rather than communicating success, warning or danger by colour alone.</p>",
    "examples": [
      {
        "label": "Business KPIs",
        "html": "<div class=\"grid widget-grid\">\n  <dl class=\"card stack metric-card\">\n  <dt>Revenue</dt>\n  <dd><strong>€48,250</strong>\n  <span data-tone=\"success\">+12.8% this month</span>\n  <small>Compared with the previous month</small></dd>\n</dl>\n  <dl class=\"card stack metric-card\">\n  <dt>Open tasks</dt>\n  <dd><strong>18</strong>\n  <span data-tone=\"warning\">4 due this week</span>\n  <small>All active projects</small></dd>\n</dl>\n  <dl class=\"card stack metric-card\">\n  <dt>Customers</dt>\n  <dd><strong>1,284</strong>\n  <span data-tone=\"info\">42 new this month</span></dd>\n</dl>\n</div>",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Configuration",
    "body": "<p>Use --dashboard-metric-size to override the headline scale. The surface, spacing, border, radius and typography are inherited from core CSS. Reuse the same metric classes for statistic cards.</p>",
    "examples": []
  }
],{stylesheets:["dashboard/metrics.css","dashboard/widget-grid.css"]}),
 doc("statistic-cards","Statistic cards","Native progress, measurements and comparisons in existing cards.",[
  {
    "title": "Loading",
    "body": "<p>Use the same metrics.css as KPI cards. Native progress, meter, data and description-list semantics express actual measurements. No chart runtime is necessary for ordinary comparisons.</p>",
    "examples": [
      {
        "label": "Stylesheets",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/metrics.css\">\n<link rel=\"stylesheet\" href=\"engines/dashboard/widget-grid.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Native measurements",
    "body": "<p>The values in this example are illustrative. Native progress and meter retain their labels and machine-readable values. A measurement is distinct from business interpretation; the application chooses its status and text.</p>",
    "examples": [
      {
        "label": "Operational statistics",
        "html": "<div class=\"grid widget-grid\">\n  <article class=\"panel stack metric-card\">\n    <small>Projects completed</small>\n    <strong>28 / 36</strong>\n    <progress value=\"28\" max=\"36\" aria-label=\"Projects completed\">28 of 36</progress>\n    <small>8 projects remaining</small>\n  </article>\n  <article class=\"panel stack metric-card\">\n    <small>Storage used</small>\n    <strong>81 GB</strong>\n    <meter min=\"0\" max=\"100\" value=\"81\" aria-label=\"Storage used in GB\">81 GB of 100 GB</meter>\n    <small>100 GB total capacity</small>\n  </article>\n  <article class=\"card stack metric-card\">\n    <small>Response time</small>\n    <strong>240 ms</strong>\n    <dl><dt>Previous period</dt><dd>310 ms</dd><dt>Target</dt><dd>300 ms</dd></dl>\n    <span data-tone=\"success\">70 ms faster</span>\n  </article>\n</div>",
        "lang": "html"
      }
    ]
  }
],{stylesheets:["dashboard/metrics.css","dashboard/widget-grid.css"]}),
 doc("sparklines","Sparklines","Small native SVG trends from application-supplied values.",[
  {
    "title": "Loading",
    "body": "<p>Load sparkline.css. Native SVG may be authored directly inside figure.sparkline without any child classes. For numeric data, the optional module reads a list of native data elements, derives SVG geometry and keeps the text description and expandable values accessible. It does not impose a chart library.</p>",
    "examples": [
      {
        "label": "Stylesheet and optional adapter",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/sparkline.css\">",
        "lang": "html"
      },
      {
        "label": "Mount the adapter",
        "code": "import {mountSparkline} from './engines/dashboard/sparkline.mjs';\nfor (const el of document.querySelectorAll('figure.sparkline:has(> svg:empty)')) mountSparkline(el);",
        "lang": "javascript"
      }
    ]
  },
  section('Static trend without JavaScript','<p>For a fixed series, author or generate SVG geometry before the page is delivered. Keep the actual data in native HTML and use a descriptive caption. Only dynamic, initially empty plots need the optional browser adapter.</p>',[
    example('Static trend (HTML and SVG only)',staticSparkline('Daily observations',[12,16,14,21,24],'Five observations, rising overall.'))
  ]),
  {
    "title": "Data-driven trend",
    "body": "<p>The geometry is computed from the finite numeric series; empty and constant series are supported. Negative and positive values use the same normalization. The mini-chart uses each series range, so slopes across differently scaled series are not directly comparable. The chart is decorative; the caption and actual observations convey the information.</p>",
    "examples": [
      {
        "label": "Trend examples",
        "html": "<div class=\"grid widget-grid\">\n  <article class=\"card stack metric-card\"><small>Weekly revenue</small>\n    <figure class=\"sparkline\" id=\"demo-revenue-trend\">\n  <svg aria-hidden=\"true\" viewBox=\"0 0 100 40\"></svg>\n  <figcaption>Seven daily observations, rising overall.</figcaption>\n  <details><summary>Daily revenue values</summary>\n    <ol>\n      <li><data value=\"18\">18</data></li>\n      <li><data value=\"24\">24</data></li>\n      <li><data value=\"20\">20</data></li>\n      <li><data value=\"31\">31</data></li>\n      <li><data value=\"28\">28</data></li>\n      <li><data value=\"36\">36</data></li>\n      <li><data value=\"42\">42</data></li>\n    </ol>\n  </details>\n</figure>\n  </article>\n  <article class=\"card stack metric-card\"><small>Stable service</small>\n    <figure class=\"sparkline\" id=\"demo-flat-trend\">\n  <svg aria-hidden=\"true\" viewBox=\"0 0 100 40\"></svg>\n  <figcaption>Five equal observations.</figcaption>\n  <details><summary>Latency values</summary>\n    <ol>\n      <li><data value=\"10\">10</data></li>\n      <li><data value=\"10\">10</data></li>\n      <li><data value=\"10\">10</data></li>\n      <li><data value=\"10\">10</data></li>\n      <li><data value=\"10\">10</data></li>\n    </ol>\n  </details>\n</figure>\n  </article>\n</div>",
        "lang": "html",
        "run": "dashboard",
        "scripts": [
          {
            "lang": "javascript",
            "code": "import {mountSparkline} from './engines/dashboard/sparkline.mjs';\nfor (const el of document.querySelectorAll('figure.sparkline:has(> svg:empty)')) mountSparkline(el);"
          }
        ]
      }
    ]
  },
  {
    "title": "Controller and tokens",
    "body": "<p>Fixed charts use a native SVG polyline with a caption and a list of values; they do not need the browser chart adapter. For values that change in the browser, mountSparkline(figure) expects an empty direct SVG and native data[value] elements in details > ol > li. refresh() recalculates geometry after changing the data; destroy() removes generated marks and restores SVG attributes. sparklinePoints(values,{width,height,padding}) is an independent pure helper. Override --dashboard-sparkline-height, --dashboard-sparkline-ink or --dashboard-chart-stroke as needed. No data is fetched.</p>",
    "examples": []
  }
],{stylesheets:["dashboard/metrics.css","dashboard/widget-grid.css","dashboard/sparkline.css"]}),
 doc("progress-rings","Progress rings","Decorative circular indicators driven by real native progress.",[
  {
    "title": "Loading",
    "body": "<p>Use a native progress element inside .progress-ring. Load progress-ring.css and optionally mountProgressRing. Without scripting the ordinary progress bar remains usable; indeterminate progress always retains its native presentation.</p>",
    "examples": [
      {
        "label": "Stylesheet",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/progress-ring.css\">",
        "lang": "html"
      },
      {
        "label": "Mount the adapter",
        "code": "import {mountProgressRing} from './engines/dashboard/progress-ring.mjs';\nfor (const el of document.querySelectorAll('.progress-ring')) mountProgressRing(el);",
        "lang": "javascript"
      }
    ]
  },
  {
    "title": "Native progress values",
    "body": "<p>Determinate native progress supplies the ring ratio and localized percentage. The SVG and value text are decorative, and native progress retains its accessible name and value. Changes to value or max update the ring automatically; no duplicate numeric configuration is needed.</p>",
    "examples": [
      {
        "label": "Progress and capacity",
        "html": "<div class=\"grid widget-grid\">\n  <article class=\"card stack metric-card\"><small>Project completion</small><div class=\"progress-ring\" id=\"demo-project-ring\">\n  <progress value=\"28\" max=\"36\" aria-label=\"Completed projects\">28 / 36</progress>\n</div><small>28 of 36 projects</small></article>\n  <article class=\"card stack metric-card\"><small>Storage allocation</small><div class=\"progress-ring\" id=\"demo-storage-ring\">\n  <progress value=\"81\" max=\"100\" aria-label=\"Storage allocation\">81 / 100</progress>\n</div><small>81 of 100 GB</small></article>\n  <article class=\"card stack metric-card\"><small>Waiting for response</small><div class=\"progress-ring\" id=\"demo-indeterminate-ring\"><progress aria-label=\"Waiting for response\"></progress></div><small>Indeterminate progress remains native</small></article>\n</div>",
        "lang": "html",
        "run": "dashboard",
        "scripts": [
          {
            "lang": "javascript",
            "code": "import {mountProgressRing} from './engines/dashboard/progress-ring.mjs';\nfor (const el of document.querySelectorAll('.progress-ring')) mountProgressRing(el);"
          }
        ]
      }
    ]
  },
  {
    "title": "Controller and tokens",
    "body": "<p>mountProgressRing(root,{format}) accepts an optional formatting function receiving the ratio. refresh() and destroy() manage lifecycle. Customize --dashboard-ring-size, --dashboard-ring-stroke, --dashboard-ring-ink and --dashboard-ring-value-size. The ring uses semantic roles and no animation library.</p>",
    "examples": []
  }
],{stylesheets:["dashboard/metrics.css","dashboard/widget-grid.css","dashboard/progress-ring.css"]}),
 doc("widget-grid","Widget grid","A configurable extension of the existing intrinsic grid.",[
  {
    "title": "Loading",
    "body": "<p>Keep the existing .grid class and add .widget-grid only to configure widget column sizing. The extension overrides column sizing and gap; it does not duplicate the core grid declaration or introduce a second layout engine.</p>",
    "examples": [
      {
        "label": "Stylesheet",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/widget-grid.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Adaptive dashboard grid",
    "body": "<p>Widgets wrap according to their available container width. Set --dashboard-widget-min and --dashboard-widget-gap when the intrinsic defaults are not suitable. The example chooses a 12rem minimum locally; this is not a framework requirement.</p>",
    "examples": [
      {
        "label": "Responsive widget collection",
        "html": "<div class=\"grid widget-grid\" style=\"--dashboard-widget-min:12rem\">\n  <article class=\"card stack metric-card\">\n  <small>Active projects</small>\n  <strong>24</strong>\n  <small>6 awaiting review</small>\n</article>\n  <article class=\"card stack metric-card\">\n  <small>Open tasks</small>\n  <strong>18</strong>\n  <small>4 due this week</small>\n</article>\n  <article class=\"card stack metric-card\">\n  <small>Storage</small>\n  <strong>81%</strong>\n  <progress value=\"81\" max=\"100\" aria-label=\"Storage used\">81%</progress>\n</article>\n  <article class=\"panel stack\"><h3>Quick actions</h3><nav class=\"cluster quick-actions\" aria-label=\"Widget actions\">\n  <a href=\"{{base}}docs/dashboard/\">Open dashboard</a>\n  <a href=\"{{base}}docs/components/\">Components</a>\n</nav></article>\n</div>",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Scope",
    "body": "<p>This batch provides responsive arrangement only. Dragging, saving and resizing individual widgets belong to the later optional dashboard designer. Ordinary .grid remains unchanged.</p>",
    "examples": []
  }
],{stylesheets:["dashboard/metrics.css","dashboard/widget-grid.css","dashboard/quick-actions.css"]}),
 doc("quick-actions","Quick actions","Native application links and buttons grouped using core layout.",[
  {
    "title": "Loading",
    "body": "<p>Use ordinary buttons or links inside the existing .cluster or .stack. The optional quick-actions class adds only wrapping and alignment for actions, preserving native control appearance and interaction behaviour. Supply application-owned links or button listeners.</p>",
    "examples": [
      {
        "label": "Stylesheet",
        "code": "<link rel=\"stylesheet\" href=\"engines/dashboard/quick-actions.css\">",
        "lang": "html"
      }
    ]
  },
  {
    "title": "Action group",
    "body": "<p>These are actual documentation links, not simulated buttons. Use a labelled nav for navigation, or a labelled group for independent application actions. Reuse the dropdown or command palette for larger collections.</p>",
    "examples": [
      {
        "label": "Workspace shortcuts",
        "html": "<article class=\"panel stack\">\n  <h3>Quick actions</h3>\n  <nav class=\"cluster quick-actions\" aria-label=\"Quick actions\">\n  <a href=\"{{base}}docs/dashboard/\">Open dashboard</a>\n  <a href=\"{{base}}docs/command-palette/\">Search commands</a>\n  <a href=\"{{base}}docs/split-workspace/\">Open workspace</a>\n</nav>\n</article>",
        "lang": "html"
      }
    ]
  }
],{stylesheets:["dashboard/quick-actions.css"]})
]);

const demoGallery=page('demos','Demos','Explore complete standalone applications built using UIBMSCSS.',[
 section('Available applications','<p>Open a complete working interface directly in your browser. These are independent full-page applications, not embedded previews or iframes. Each uses the same framework and appearance settings as the documentation.</p><div class="grid">'+demos.map(d=>'<article class="card stack"><small>Standalone application</small><h3>'+d.title+'</h3><p>'+d.description+'</p><ul>'+d.features.map(f=>'<li>'+f+'</li>').join('')+'</ul><div class="cluster"><a data-site-primary href="{{base}}'+d.slug+'/">Launch demo</a><a href="{{base}}'+d.documentation+'/">Implementation reference</a></div></article>').join('')+'</div>'),
 section('About the demos','<p>Demo data is illustrative and local. These interfaces demonstrate composition of the actual framework components and optional engines; they are not production services. Additional dashboard styles and full-page applications will be added to this catalogue as they are developed.</p>')
]);
const showcase=page('examples','Examples','Complete interface compositions built with the implemented UIBMS API.',[
 section('Dashboard','<p>A responsive workspace built entirely from native HTML and approved classes. It inherits your header appearance settings. For complete standalone applications, open the <a href="{{base}}demos/">Demos catalogue</a>.</p>',[example('Workspace dashboard',`<section class="stack">\n  <header class="cluster">\n    <h2>Workspace</h2>\n    <button type="button">New project</button>\n  </header>\n  <div class="grid">\n    <article class="card stack"><small>Active projects</small><h3>24</h3><progress value="24" max="40" aria-label="24 active of 40"></progress></article>\n    <article class="card stack"><small>Completed</small><h3>108</h3><meter min="0" max="120" value="108" aria-label="108 completed of 120"></meter></article>\n    <article class="card stack"><small>Next milestone</small><h3>Documentation</h3><button type="button">Review</button></article>\n  </div>\n</section>`)]),
 section('Account settings','<p>Native fields, checkbox, selection and browser validation, without component-specific classes.</p>',[example('Settings form',`<form class="card stack">\n  <h3>Profile</h3>\n  <label for="account-name">Name</label>\n  <input id="account-name" type="text" required autocomplete="name">\n  <label for="account-email">Email</label>\n  <input id="account-email" type="email" required autocomplete="email">\n  <label><input type="checkbox" checked> Receive updates</label>\n  <div class="cluster">\n    <button type="submit">Validate settings</button>\n    <button type="reset">Reset</button>\n  </div>\n</form>`,{note:'Local demonstration only; no data is sent.'})]),
 section('Product cards','<p>Use independent surface, layout and material choices. No card-specific markup contract is imposed.</p>',[example('Product surfaces',`<div class="grid">\n  <article class="card stack" data-effect="glass">\n    <h3>Standard</h3>\n    <p>Core interface capabilities.</p>\n    <button type="button">Explore</button>\n  </article>\n  <article class="card stack" data-effect="frosted">\n    <h3>Full</h3>\n    <p>All available palettes and profiles.</p>\n    <button type="button">Explore</button>\n  </article>\n</div>`)]),
 section('Editorial content','<p>Contextual typography and density are local and inherit independently.</p>',[example('Editorial article',`<article class="card" data-typography="editorial" data-density="spacious">\n  <h2>Design with purpose</h2>\n  <p class="lead">A framework should make native HTML easier to use.</p>\n  <p>Meaningful typography and generous whitespace can emerge from a small set of inherited tokens.</p>\n  <blockquote>Keep the platform native.</blockquote>\n</article>`)]),
 section('Interactive workspace','<p>The native details, select and range controls are interactive. Source is always read-only; there is no live code editor.</p>',[example('Control panel',`<section class="panel stack">\n  <h3>Playback controls</h3>\n  <label for="example-volume">Volume</label>\n  <input id="example-volume" type="range" min="0" max="100" value="60">\n  <label for="example-quality">Quality</label>\n  <select id="example-quality"><option>Standard</option><option>High</option></select>\n  <details><summary>Advanced options</summary><label><input type="checkbox"> Repeat</label></details>\n</section>`)])
]);
const laboratory=page('laboratory','Laboratory','Future research, clearly separated from implemented framework behavior.',[
 section('Elastic Mirror','<p>Experimental concept: transparent/reflective deformable surfaces with optional GPU rendering for selected controls, paired with CSS mirror-inspired cards and panels. A WebGL renderer, physical optics and an Elastic Mirror API are not implemented in this candidate.</p><p>Proposed investigation: shared rendering context, on-demand GPU updates, native HTML interaction semantics, CSS fallback and actual device measurement. WebGL cannot directly read arbitrary live HTML backdrop pixels through standard APIs.</p>'),
 section('Current CSS materials','<p>These existing CSS examples are implemented. They are deliberately modest, not physical refraction or mirror reflection.</p>',[example('Existing materials',`<div class="grid">\n  <article class="card" data-effect="metallic">Metallic</article>\n  <article class="card" data-effect="glass">Glass</article>\n  <article class="card" data-effect="frosted">Frosted</article>\n  <article class="card" data-effect="matte">Matte</article>\n</div>`)]),
 section('Research boundaries','<p>True continuous corners, liquid optics and custom scroll physics remain future work. The separate optional Liquid Silicone and Form Engine development candidates are documented in the Optional engines group; physical ray-tracing and GPU rendering remain research.</p>')
]);
const downloads=page('downloads','Downloads','Choose an unchanged framework distribution from the generated inventory.',[
 section('Principal stylesheets','<p>Use one standard or full, global or scoped stylesheet. Readable versions aid inspection; minified versions reduce transfer size. The files are development candidates, not an official versioned release.</p>',[],{manifest:'main'}),
 section('Optional extensions','<p>Load matching global/scoped variants after the standard bundle. All ten are included in full.</p>',[],{manifest:'extensions'}),
 section('Verification','<p>Manifest values are copied from the framework release candidate and checked before staging assets. No framework source or output is altered by the website.</p>')
]);
const home=page('','UIBMS CSS','Native CSS. Meaningful HTML. Living interfaces.',[
 section('Build with the platform','<p class="lead">A lightweight native CSS foundation for professional, responsive interfaces, built for humans and AI coding agents.</p><p>Start with semantic elements, then introduce only the patterns and contextual configuration you actually need. No mandatory runtime or component library.</p>',[example('Native by design',`<article class="card stack">\n  <h2>Everything starts with HTML.</h2>\n  <p>Choose your appearance from the header.\n     This example changes with the entire site.</p>\n  <div class="cluster">\n    <button type="button">Continue</button>\n    <a href="{{base}}docs/quick-start/">Quick start</a>\n  </div>\n</article>`)]),
 section('Explore the framework',`<p>The framework combines native elements, ${framework.classes.length} reusable classes, ${profiles.length} contextual configuration attributes, ${framework.effectAttributes.length} individual effects attributes, and ${framework.mainStylesheets.length} principal distributions. Open the documentation for the complete implemented reference.</p>`),
 section('A transparent development candidate',`<p>${notice} The regenerated distributions have recorded Chromium release and responsive-table verification. Current documentation checks run separately during deployment. The project is licensed under MIT. Formal versioning and cross-engine verification remain open.</p>`)
],{home:true});
export const groups=docs;
export const docPages=docs.flatMap(g=>g.pages.map(p=>({...p,group:g.title})));
// The showcase is a view of the existing reference content, not a second component registry.
// Only authored inline live examples are included; the scoped-adoption frame stays in its reference.
const showcaseSections=groups.map(group=>{
  const topics=group.pages.map(source=>({
    source,examples:source.sections.flatMap(section=>section.examples).filter(example=>example.html&&!example.frame)
  })).filter(topic=>topic.examples.length);
  return section(group.title,'',[],{topics});
}).filter(section=>section.topics.length);
export const componentShowcase=page('components','Components','Explore every live reference example on one page. Change the shared appearance, interact with native controls, and reveal the original source code.',showcaseSections,{
  componentShowcase:true,
  stylesheets:[...new Set(showcaseSections.flatMap(section=>section.topics.flatMap(({source})=>source.stylesheets||[])))]
});
export const pages=[home,...docPages,componentShowcase,showcase,demoGallery,laboratory,downloads];
export const allPages=[...pages,...demos];
export const topLinks=[['Documentation','docs/introduction'],['Components','components'],['Examples','examples'],['Demos','demos'],['Laboratory','laboratory'],['Downloads','downloads']];
