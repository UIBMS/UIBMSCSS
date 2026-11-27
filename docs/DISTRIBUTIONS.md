# UIBMS CSS distributions

Development release candidate; the source and packages are under verification, not a public release or WCAG certification.

## Usage

Choose one principal stylesheet, not both global and scoped variants. No consumer build or JavaScript runtime is required.

```html
<link rel="stylesheet" href="dist/uibms.min.css">
```

The comprehensive equivalent is `dist/uibms.full.min.css`. Each has a readable `.css` version. Full adds palette and motion-profile extensions, not the separate optional component, dashboard or experimental material/form engines. The standard stylesheet includes the natural palette, native HTML styling, 13 classes, density/shape/typography configurations and initial signature effects. Seven alternative palettes and three alternative effects profiles are optional.

```html
<link rel="stylesheet" href="dist/uibms.min.css">
<link rel="stylesheet" href="dist/extensions/palettes/ocean.min.css">
<link rel="stylesheet" href="dist/extensions/profiles/effects-fluid.min.css">
<section data-palette="ocean" data-effects="fluid">...</section>
```

## Optional components and engines

Copy only the required files from `extensions/engines/`. For example, a native segmented radio group needs only `components/segmented.css` in addition to the chosen framework bundle; a drawer needs its stylesheet and a JavaScript compatibility adapter only when native invoker or backdrop behavior is unavailable. Use native semantic children within meaningful component classes and keep JavaScript for necessary behavior. The optional engine files are not among the generated global/scoped extension variants; review their selectors before using them on a host page with scoped core adoption. See [component usage](../extensions/engines/components/README.md) and [dashboard usage](../extensions/engines/dashboard/README.md).

## Scoped adoption

```html
<link rel="stylesheet" href="dist/uibms.scoped.min.css">
<link rel="stylesheet" href="dist/extensions/palettes/ocean.scoped.min.css">
<section data-uibms data-theme="dark" data-palette="ocean">
    <article class="card stack"><h2>Workspace</h2><button>Continue</button></article>
</section>
```

`uibms.scoped.full.min.css` includes all ten optional modules. Use matching `.scoped.css` or `.scoped.min.css` extension variants. Outermost markers initialize the framework; nested markers do not reinitialize the surrounding configuration. Recognized contexts on the adoption root work just as they do on descendants. The scoped build requires browser support for native `@scope`; without it the scoped selector rules do not apply. It does not automatically fall back to global styling.

Selector isolation is not Shadow DOM isolation. Inherited host styles, unlayered author declarations and document-wide layer naming can affect the scoped area. Use a dedicated region, not a marker on an individual native control. The global and scoped bundles intentionally share the five approved layer names. Scoped animation keyframes have separate `uibms-scoped-*` internal names but are still document-wide definitions. The explicit scroll progress effect tracks document scrolling; scoped adoption does not intercept host scrolling. Theme-aware scrollbar and smooth navigation rules do not target the host document root in scoped mode.

## Development packaging

The sole maintained source is `src/`. Install development-only tools and generate the distributions with Node.js:

```sh
npm --prefix tools install
npm --prefix tools run build
```

The two direct parser dependencies are pinned. The packager inlines the explicit local source imports, creates the standard/full and scoped variants, and conservatively compacts formatting without value rewriting or a CSS transpiler. There are eight principal files and 40 optional extension variants (global/scoped, readable/minified for each of ten extensions). `dist/manifest.json` reports exact byte counts, gzip sizes and SHA-256 digests. Generated CSS must not be edited by hand. During the contextual refactoring, checked-in distributions describe the previous candidate until a fresh build regenerates them and the manifest together. CSS comments in source are not emitted in bundles, other than a generated-file banner. Use the same tool versions to reproduce the output.

## Release verification

Install the optional local test dependency with `python -m pip install playwright`, install the required browser binaries with `python -m playwright install chromium firefox webkit`, and run:

```sh
python tests/release.py --browser chromium
python tests/release.py --browser firefox
python tests/release.py --browser webkit
```

The test embeds the actual generated stylesheets in declared order, so it does not depend on a dev server. It exercises principal bundles, extension isolation, selected native HTML and class regressions, profile inheritance, effects, user preferences and responsive reflow. Additional engine-specific support may require newer browser binaries than the Playwright defaults; use `--executable` with a suitable compatible executable. An unsupported required capability is a release blocker, not grounds to silently apply global styles. Real-device accessibility, all WCAG criteria, native Safari/Firefox versions, and browser performance need their own evidence. Current results are recorded in the architecture document; the local synthetic measurement is not a real-world benchmark.

The original scope and layer contracts remain unchanged. Physical optics, true continuous corners, custom scroll physics, and advanced liquid materials are not part of this initial candidate. License terms, release version and public publication are not selected by the packaging work.

## Border intensity

Use `data-border="default|subtle|strong"` on the adoption root or a nested region (choose one value). The standard and full distributions include this profile. Decorative borders follow the inherited setting; functional control boundaries retain `--color-border-strong`.
