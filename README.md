# UIBMS CSS

A modern native CSS framework for humans and AI coding agents, designed to make professional, accessible and responsive interfaces easier to build.

## Direction

- Modern CSS that is interoperable across Chromium (Blink), Safari (WebKit) and Firefox (Gecko).
- Minimalistic, optimized engineering without artificial limits.
- Semantic HTML-first components with minimal classes and contextual native CSS nesting; no custom HTML component tags.
- Meaningful tokenization, not tokenization of every declaration.
- Applicable WCAG 2.2 Level AAA accessibility requirements targeted by default, while preserving developer freedom.
- Intuitive, discoverable and predictable development for humans and AI coding agents.
- Meaningful HTML data attributes for coordinated design configuration.
- Living interfaces with useful default visual and interaction effects.
- An original UIBMS interaction identity, with configurable and platform-aware effect profiles.

The framework should be different because it makes development easier and produces better results, not simply for the sake of being different.

## Development status

The six initial implementation checkpoints have produced a development release candidate: foundational tokens, native HTML styling, 13 reusable classes, independent configuration profiles, signature effects and generated global/scoped distributions.

Use [dist/uibms.min.css](dist/uibms.min.css) for the standard global candidate or [dist/uibms.scoped.min.css](dist/uibms.scoped.min.css) for a marked adoption region. Full variants and 40 independently loadable extension variants are in [dist/](dist/). Exact distribution sizes and hashes are recorded in [the generated manifest](dist/manifest.json). See [distribution usage and build instructions](docs/DISTRIBUTIONS.md).

The regenerated semantic-first candidate passed 704 core release checks and 120 responsive-table cases in Chromium 144. The earlier 556-check record describes the initial candidate, not the current source. Safari/WebKit and Firefox/Gecko verification, comprehensive accessibility and device testing, clean dependency installation and version approval remain release gates. The repository is licensed under MIT. No public release or full WCAG certification is claimed.

The CLS-004 refactoring milestone regenerated all 48 stylesheet variants and their manifest using the pinned packager. The eight principal files changed; the 40 independent extension variants are identical to the previous candidate. See the [refactoring verification record](docs/VERIFICATION.md) for measurements and remaining integration gates.

Explore the [native HTML](examples/native-html.html), [reusable classes](examples/classes.html), [configuration](examples/profiles.html), [signature experience](examples/effects.html) and [scoped adoption](examples/scoped.html) showcases from a local checkout.

See [Architecture and foundational principles](docs/ARCHITECTURE.md).

## Optional physical interfaces

[Liquid Silicone Material Engine and Form Engine](extensions/engines/README.md) are opt-in, unbundled development candidates. These engines and the optional component/dashboard stylesheets are not bundled in the core distributions. Native controls stay authoritative; optional pickers and elastic contour rendering are separate. Full browser and accessibility verification is pending.

## Standalone demos

[Open the Demos catalogue](https://uibms.github.io/UIBMSCSS/demos/) for full-page applications. The first is the [Administration dashboard](https://uibms.github.io/UIBMSCSS/demos/admin/), a local sample project workspace. Demos share the framework and appearance profiles, not the documentation shell. New applications are registered in `website/src/content/demos.mjs`; the catalogue, static routes and build checks consume that registry. Sample application state is separate from the reusable engines. Preferred examples use native semantic children, meaningful component classes and contextual nesting; legacy child hooks are supported for existing integrations, not required for new ones.
