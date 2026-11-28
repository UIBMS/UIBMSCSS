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

Optional `mountMaterial(root, {filter})` limits decorative surface and selection candidates using an element predicate. Change its external eligibility state and call `material.refresh()` to update the visible decoration; native HTML, control state and contextual CSS remain unchanged. With a filter, mutation-triggered refreshes are coalesced to animation frames. Omitting it preserves the original whole-root behavior.

The nearest recognized data-material controls inheritance. `default` opts a subtree out. Material controls visual geometry, optics and response; classes remain layout/structure; native HTML or the application owns activation. A passive surface cannot compress. Navigation/tab groups consume aria-current, aria-selected or aria-pressed supplied by the application; options are flat and one elastic indicator follows the current selection. An application must not use aria-current to fake an action.

Supported container surfaces include cards, panels, articles, navigation, fieldsets, details, dialogs and popovers; explicit material can be used on suitable ordinary containers. Native replaced controls remain native: the first candidate uses localized corner/lighting styling, native accent colors and thumb styling where available rather than replacing their geometry. Arbitrary DOM cannot be sampled for exact pixel refraction. Backdrop blur and translucent directional highlights are the default optical approximation. For a declared, readable image, use await material.registerBackdrop(element, imageURL) to enable pixel displacement and tint; unregisterBackdrop(element) restores the preceding background. A registered backdrop acts as the background rather than another material surface. Image sampling supports same-origin and CORS-enabled images; it is not a live DOM screenshot or physically accurate ray tracer. No JavaScript is required for the core CSS.

The Form Engine enhances enabled single selects, date, datetime-local, time, week, month and color controls with a picker arrow integrated into the same visual field. The original native control remains editable and authoritative for values, labels, constraints, validation and submission. Within a .stack, directly labelled fields use consistent vertical labels and full-width controls; checkbox/radio labels retain their native inline layout. The enhanced colour input uses one theme-aware rectangular swatch/value field rather than stretching browser-native colour artwork. Its real native input remains focusable, directly tappable on the swatch side and form-associated; the separate arrow opens the enhanced picker. The visual swatch is aria-hidden and reflects native input/change events, enhanced choices and form reset. Call refresh() after silent programmatic value assignments. The value follows the browser's native color input format (usually hexadecimal), independently of OKLCH palette tokens. Multiple selects and OS file pickers stay native. Picker choices dispatch input/change; form reset and external native changes stay synchronized while a picker is open. ISO weeks begin Monday; time is 24-hour. Date and datetime-local are timezone-free. Native min/max/step constraints are checked where the browser implements the control type. The optional picker is non-modal and supports Escape, Tab and arrow navigation; full screen-reader and cross-browser verification remains outstanding.

Both engines expose refresh() and destroy(). Mount once per root. Form Engine accepts an optional filter function, e.g. mountForms(document,{filter:el=>!!el.closest('#event-form')}); settings can therefore remain native. Material options: attraction, range (px), pressure, stiffness, damping, amplitude, maximum (px). CSS variables: --uibms-material-opacity, --uibms-material-tint, --uibms-material-blur and --uibms-material-border. CSS variables are inherited inside the material scope. data-effects="none" and individual data-hover/data-active="none" suppress the relevant optional motion. Reduced motion, increased contrast, forced colors and reduced transparency are respected by fallback styling.

This candidate includes an optional Canvas image-backed approximation and is not yet production-certified. Native replaced controls still use CSS approximations rather than the full deformable Canvas/SVG contour. Test native browser controls, accessibility, stacking/clipping, layout and performance in your target application. The source and distributable files are intentionally the same unbundled modules; the documentation stages a copy.

Decorative layers use the measured border box and override layout-child max sizes. Inline text links are not automatically material boxes. Application content regions can use overflow-x:clip to keep off-edge decorative overscan from creating horizontal page scrolling.

## Design profile integration

The material engine reads the existing computed surface before substituting any paint. It preserves foreground and typography, dimensions, border width/colour/style, corner radius and supported outer shadows. Only physical response and optical lighting are supplied by the extension. Ordinary surfaces use 92% opacity to preserve their original colour role; explicit opacity and tint overrides are available for image-backed optical experiments. Structural containers and plain inline links do not automatically acquire a new background or outline. Sticky, scrollable, asymmetric, native and other complex surfaces use in-place lighting to retain their original layout and paint. Uniform, unclipped surfaces use a deformable contour. Complex inset/spread shadows remain native. Navigation groups use one palette-derived selection highlight.

Every contextual profile triggers re-resolution, including system colour-scheme changes. The effects profile controls motion independently: none stops motion and snaps selection; minimal suppresses hover and reduces compression; configured timing scales spring response. Explicit glass, frosted, metallic or matte data-effect declarations take precedence on their element. The Form Engine popup mirrors the source's contextual profiles when opened and while settings change. No core CSS bundle or public layout class has changed.

Full browser testing, especially iOS/WebKit and physical touch devices, remains required. The in-place fallback does not offer full contour deformation.

## Direct touch and native tables

Touchscreens use the same spring/contour engine without emulating persistent mouse hover. Contact pulls outward, actionable controls switch to inward compression, and release returns to rest. Short taps receive a brief optical impulse independently of the native click. Passive cards and tables do not compress. Set the optional mount options `touchAttractionTime` (milliseconds, default 80), `touchCompressionTime` (minimum compression phase, default 100) and `touchSlop` (CSS pixels of movement before a scroll gesture cancels contact, default 12). A range input may continue following its drag. Reduced motion and the effects profile are still authoritative. Pointer cancellation, scroll gestures, lost capture and window blur clear active contact. The private touch focus marker is cleared on keyboard use; it never blurs or removes keyboard focus. Native text-entry focus is preserved.

Each native table is a single passive magnetic surface with shared optical attraction and an outer glow. Rows, sections, headers, cells and captions are not registered as physical surfaces, even if explicitly assigned liquid silicone. The row and cell under the pointer receive simple palette-aware lighting, without a spring, compression, scaling or border movement. Touch lighting is cleared with contact recovery or cancellation, and hover lighting clears when the pointer leaves. Native table layout, collapsed borders and semantics are unchanged. Buttons inside a table remain independently pressable. For a fully deformable outer contour, place a table inside an ordinary material-enabled card or panel. Full deformation of collapsed table borders remains unsupported.

## Native overlays

An open native dialog or popover is a single passive magnetic surface, as is the Form Engine's picker popup. It uses the shared optical spring and outer glow without changing top-layer positioning, overflow, focus or dismissal. Ordinary content receives a simple palette-aware light on hover/contact and is not registered as a separate physical surface. Native controls, nested tables/overlays, shared selection groups and explicitly opted-in local material surfaces retain their own behaviour. A native modal's backdrop is not a material surface. Closing, light dismissal, Escape, pointer cancellation, scrolling and removing a popup clear stale contact state as appropriate; reopening starts at rest. Native dialog and popover state is observed rather than overridden. When content fits and the original paint is supported, a shared SVG silhouette replaces only the visual border, background and simple outer shadow. It stretches and skews at the contact point while content and hit areas stay fixed. Truly overflowing or complex custom surfaces retain the optical fallback, with native scrolling available. The optional engine stylesheet supplies responsive overlay size defaults via `--uibms-dialog-min-inline-size` (28rem), `--uibms-dialog-max-inline-size` (48rem), `--uibms-popover-min-inline-size` (22rem), `--uibms-popover-max-inline-size` (36rem), `--uibms-picker-inline-size` (26rem) and `--uibms-overlay-gap` (1.25rem). Configure `overlayMaximum` (14px default) and `overlaySkew` (8px default) in mountMaterial to adjust contour response. Core distributions are unchanged.

## Native media deformation

The optional media-deformation.mjs module is loaded only on first interaction with an eligible image or control-free video. It maps the original pixels, rounded corners and solid border onto one elastic mesh. Native WebGL is the preferred renderer. A shared WebGL context renders each active texture into a visual canvas; Canvas 2D uses the same mesh and affine triangle rasterization when GPU creation, texture upload or drawing fails. No third-party graphics library is required.

The native source stays in the original layout and accessibility tree. An absolutely positioned, pointer-transparent decorative canvas is displayed only while rasterization succeeds; at rest the original element is revealed and the canvas is removed. Responsive picture/source selection, common object-fit and object-position values, and playback on a control-free video remain native. The application should supply separately accessible HTML playback controls for a video that is to deform. Native video with controls, native audio, visible text tracks, fullscreen, unsupported custom media paint and unavailable textures retain the original media; native players receive optical lighting only. The optional module never reads back protected or cross-origin pixels. Canvas 2D may still draw a cross-origin texture when WebGL upload is prohibited; it does not export that canvas.

Mount options: mediaRenderer (auto by default, canvas2d to force the fallback), mediaMaximum (14 CSS px), mediaSkew (6 CSS px), mediaRadius (automatic by default), and optional mediaLoader for a versioned module URL. Rendering resolution is bounded, smaller media receive smaller deformation, and only active/recovering media allocate raster layers. Reduced motion, forced colors and local material opt-outs restore native paint. Core CSS is unchanged. Browser-native controls are not replaced automatically; a full custom audio/video player is a separate future enhancement.

## Optional components

The independent components/ directory contains individually loadable tabs.css, tabs.mjs and segmented.css. See components/README.md for native HTML contracts, keyboard behaviour, and optional material selection. Neither core CSS nor the Material Engine requires the components library.

The complete initial component collection now includes tabs, segmented controls, dropdowns, tooltips, drawers, toasts, stepper, pagination, tags/chips and command palette. See components/README.md for individual loading and lifecycle contracts.

## Optional dashboard layouts

The dashboard/ directory provides independently loadable App Shell, Sidebar, Topbar, Page Header and Split Workspace styles, plus small optional shell and splitter controllers. See dashboard/README.md for the structural contracts. Layout boundaries stay stable under material feedback; nested native controls remain interactive. Neither the core CSS nor the general component library requires these modules.

Dashboard widgets are optional additions in dashboard/: shared KPI/statistic metrics, intrinsic widget grid, quick actions, native SVG sparklines and native-progress-driven rings. See dashboard/README.md for the loading contract and engineering conventions. The core distributions remain unchanged.

## CSS-first behavior audit

Core CSS has no runtime. Responsive navigation uses media/container queries, native details/summary and shared native dialog drawers. The documentation site no longer has a custom mobile menu open/close controller. The remaining site scripts handle search, saved profiles/navigation, clipboard, local demo actions, actual sticky-header measurement, and responsive modal lifecycle. App Shell JavaScript manages desktop rail state and moves one live sidebar into the authored compact modal, while CSS owns dimensions, placement and responsive visibility. Existing optional engines for floating positioning, form enhancement, material/media physics, application selection/state, splitter resizing, queues, dynamic pagination and SVG data geometry remain optional; they are not required for ordinary CSS layout or styling. Prefer native controls and browser capabilities first; only retain JS for an actual functional or compatibility requirement. Native buttons/links remain the source of truth. These decisions are also recorded in docs/ARCHITECTURE.md.

## Mathematical geometry (GEO-002)

The optional form wrapper computes the trigger clearance from its target, density-dependent inset and border; date/select text padding and the color input's native hit area consume that same relationship. Picker grids share one gap and popup content height accounts for its padding and borders. The Liquid Silicone range track and thumb share local size inputs; the WebKit thumb offset is their half-difference. Native values and browser events remain authoritative. Bottom drawers and toast stacks preserve their ordinary spacing in addition to the device safe-area inset. Floating-menu viewport collision margins and material-renderer sampling/lighting limits remain intentional independent constraints rather than inheriting unrelated control proportions. See [GEO-002](../../docs/ARCHITECTURE.md#geo-002--mathematically-derived-contextual-geometry).
