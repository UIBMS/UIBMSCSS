# Optional UIBMS Material and Form Engines

Experimental development candidate. Copy this directory to your project; no dependency or build step is required. The existing CSS distributions do not import these files.

```html
<link rel="stylesheet" href="uibms.full.min.css">
<link rel="stylesheet" href="engines/liquid-silicone.css">
<link rel="stylesheet" href="engines/forms.css">
<script type="module">
  import { mountMaterial } from './engines/material.mjs';
  import { mountForms } from './engines/forms.mjs';
  const material = mountMaterial(document);
  const forms = mountForms(document);
</script>
<section class="panel stack" data-material="liquid-silicone">
  <article class="card"><h2>Passive surface</h2><button type="button">Action</button></article>
  <label>Choose a date <input type="date" name="date"></label>
</section>
```

The nearest data-material controls inheritance. `default` opts a subtree out. Material controls visual geometry, optics and response; classes remain layout/structure; native HTML or the application owns activation. A passive surface cannot compress. Navigation/tab groups consume aria-current, aria-selected or aria-pressed supplied by the application; options are flat and one elastic indicator follows the current selection. An application must not use aria-current to fake an action.

Supported container surfaces include cards, panels, articles, navigation, fieldsets, details, dialogs and popovers; explicit material can be used on suitable ordinary containers. Native replaced controls remain native: the first candidate uses localized corner/lighting styling, native accent colors and thumb styling where available rather than replacing their geometry. Arbitrary DOM cannot be sampled for exact pixel refraction. Backdrop blur and translucent directional highlights are the default optical approximation. For a declared, readable image, use await material.registerBackdrop(element, imageURL) to enable pixel displacement and tint; unregisterBackdrop(element) restores the preceding background. A registered backdrop acts as the background rather than another material surface. Image sampling supports same-origin and CORS-enabled images; it is not a live DOM screenshot or physically accurate ray tracer. No JavaScript is required for the core CSS.

The Form Engine enhances enabled single selects, date, datetime-local, time, week, month and color controls with an adjacent picker button. The original control remains visible, editable and authoritative for values, labels, constraints, validation and submission. Multiple selects and OS file pickers stay native. Picker choices dispatch input/change; form reset and external native changes stay synchronized while a picker is open. ISO weeks begin Monday; time is 24-hour. Date and datetime-local are timezone-free. Native min/max/step constraints are checked where the browser implements the control type. The optional picker is non-modal and supports Escape, Tab and arrow navigation; full screen-reader and cross-browser verification remains outstanding.

Both engines expose refresh() and destroy(). Mount once per root. Material options: attraction, range (px), pressure, stiffness, damping, amplitude, maximum (px). CSS variables: --uibms-material-opacity, --uibms-material-tint, --uibms-material-blur and --uibms-material-border. CSS variables are inherited inside the material scope. data-effects="none" and individual data-hover/data-active="none" suppress the relevant optional motion. Reduced motion, increased contrast, forced colors and reduced transparency are respected by fallback styling.

This candidate includes an optional Canvas image-backed approximation and is not yet production-certified. Native replaced controls still use CSS approximations rather than the full deformable Canvas/SVG contour. Test native browser controls, accessibility, stacking/clipping, layout and performance in your target application. The source and distributable files are intentionally the same unbundled modules; the documentation stages a copy.
