# UIBMS CSS

A modern native CSS framework for humans and AI coding agents, designed to make professional, accessible and responsive interfaces easier to build.

## Direction

- Modern CSS that is interoperable across Chromium (Blink), Safari (WebKit) and Firefox (Gecko).
- Minimalistic, optimized engineering without artificial limits.
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

The release-candidate suite passed 556 targeted Chromium checks on the generated stylesheets. Safari/WebKit and Firefox/Gecko verification, comprehensive accessibility and device testing, clean dependency installation, licensing and version approval remain release gates. No public release or full WCAG certification is claimed.

Explore the [native HTML](examples/native-html.html), [reusable classes](examples/classes.html), [configuration](examples/profiles.html), [signature experience](examples/effects.html) and [scoped adoption](examples/scoped.html) showcases from a local checkout.

See [Architecture and foundational principles](docs/ARCHITECTURE.md).

## Optional physical interfaces

[Liquid Silicone Material Engine and Form Engine](extensions/engines/README.md) are opt-in, unbundled development candidates. The core CSS distributions remain unchanged. Native controls stay authoritative; optional pickers and elastic contour rendering are separate. Full browser and accessibility verification is pending.
