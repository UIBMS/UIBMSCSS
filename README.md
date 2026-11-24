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

The native global development source implements IMP-001 (foundational tokens), IMP-002 (native HTML styling), IMP-003 (13 reusable classes) and IMP-004 (independent configuration profiles) through [src/uibms.css](src/uibms.css). Seven optional palettes are available as separate source stylesheets in [src/palettes/](src/palettes/).

Open the [native HTML showcase](examples/native-html.html), [reusable classes showcase](examples/classes.html) or [configuration showcase](examples/profiles.html) from a local checkout.

Chromium testing passed 88 configuration checks and all 105 earlier native HTML and class regression checks using the assembled development source. Cross-engine compatibility, full accessibility verification, signature effects and scoped and production distributions remain under development.

Next checkpoint: IMP-005 — signature visual experience.

See [Architecture and foundational principles](docs/ARCHITECTURE.md).
