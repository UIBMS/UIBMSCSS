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

The nearest recognized data-material controls inheritance. `default` opts a subtree out. Material controls visual geometry, optics and response; classes remain layout/structure; native HTML or the application owns activation. A passive surface cannot compress. Navigation/tab groups consume aria-current, aria-selected or aria-pressed supplied by the application; options are flat and one elastic indicator follows the current selection. An application must not use aria-current to fake an action.

Supported container surfaces include cards, panels, articles, navigation, fieldsets, details, dialogs and popovers; explicit material can be used on suitable ordinary containers. Native replaced controls remain native: the first candidate uses localized corner/lighting styling, native accent colors and thumb styling where available rather than replacing their geometry. Arbitrary DOM cannot be sampled for exact pixel refraction. Backdrop blur and translucent directional highlights are the default optical approximation. For a declared, readable image, use await material.registerBackdrop(element, imageURL) to enable pixel displacement and tint; unregisterBackdrop(element) restores the preceding background. A registered backdrop acts as the background rather than another material surface. Image sampling supports same-origin and CORS-enabled images; it is not a live DOM screenshot or physically accurate ray tracer. No JavaScript is required for the core CSS.

The Form Engine enhances enabled single selects, date, datetime-local, time, week, month and color controls with a picker arrow integrated into the same visual field. The original control remains visible, editable and authoritative for values, labels, constraints, validation and submission. Multiple selects and OS file pickers stay native. Picker choices dispatch input/change; form reset and external native changes stay synchronized while a picker is open. ISO weeks begin Monday; time is 24-hour. Date and datetime-local are timezone-free. Native min/max/step constraints are checked where the browser implements the control type. The optional picker is non-modal and supports Escape, Tab and arrow navigation; full screen-reader and cross-browser verification remains outstanding.

Both engines expose refresh() and destroy(). Mount once per root. Form Engine accepts an optional filter function, e.g. mountForms(document,{filter:el=>!!el.closest('#event-form')}); settings can therefore remain native. Material options: attraction, range (px), pressure, stiffness, damping, amplitude, maximum (px). CSS variables: --uibms-material-opacity, --uibms-material-tint, --uibms-material-blur and --uibms-material-border. CSS variables are inherited inside the material scope. data-effects="none" and individual data-hover/data-active="none" suppress the relevant optional motion. Reduced motion, increased contrast, forced colors and reduced transparency are respected by fallback styling.

This candidate includes an optional Canvas image-backed approximation and is not yet production-certified. Native replaced controls still use CSS approximations rather than the full deformable Canvas/SVG contour. Test native browser controls, accessibility, stacking/clipping, layout and performance in your target application. The source and distributable files are intentionally the same unbundled modules; the documentation stages a copy.

Decorative layers use the measured border box and override layout-child max sizes. Inline text links are not automatically material boxes. Application content regions can use overflow-x:clip to keep off-edge decorative overscan from creating horizontal page scrolling.

## Design profile integration

The material engine reads the existing computed surface before substituting any paint. It preserves foreground and typography, dimensions, border width/colour/style, corner radius and supported outer shadows. Only physical response and optical lighting are supplied by the extension. Ordinary surfaces use 92% opacity to preserve their original colour role; explicit opacity and tint overrides are available for image-backed optical experiments. Structural containers and plain inline links do not automatically acquire a new background or outline. Sticky, scrollable, asymmetric, native and other complex surfaces use in-place lighting to retain their original layout and paint. Uniform, unclipped surfaces use a deformable contour. Complex inset/spread shadows remain native. Navigation groups use one palette-derived selection highlight.

Every contextual profile triggers re-resolution, including system colour-scheme changes. The effects profile controls motion independently: none stops motion and snaps selection; minimal suppresses hover and reduces compression; configured timing scales spring response. Explicit glass, frosted, metallic or matte data-effect declarations take precedence on their element. The Form Engine popup mirrors the source's contextual profiles when opened and while settings change. No core CSS bundle or public layout class has changed.

Full browser testing, especially iOS/WebKit and physical touch devices, remains required. The in-place fallback does not offer full contour deformation.

## Direct touch and native tables

Touchscreens use the same spring/contour engine without emulating persistent mouse hover. Contact pulls outward, actionable controls switch to inward compression, and release returns to rest. Short taps receive a brief optical impulse independently of the native click. Passive cards and table cells do not compress. Set the optional mount options `touchAttractionTime` (milliseconds, default 80), `touchCompressionTime` (minimum compression phase, default 100) and `touchSlop` (CSS pixels of movement before a scroll gesture cancels contact, default 12). A range input may continue following its drag. Reduced motion and the effects profile are still authoritative. Pointer cancellation, scroll gestures, lost capture and window blur clear active contact. The private touch focus marker is cleared on keyboard use; it never blurs or removes keyboard focus. Native text-entry focus is preserved.

Native tables, sections, rows, headers, cells and captions receive localized optical attraction, not injected contour children. Their table layout, border-collapse, border geometry and semantics are unchanged. Buttons inside a table are independently pressable. For an outer elastic contour, place a table inside an ordinary material-enabled card or panel. Full deformation of collapsed table borders remains unsupported.
