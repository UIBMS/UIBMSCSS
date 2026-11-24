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

The native global development source implements IMP-001 (foundational tokens), IMP-002 (native HTML styling) and IMP-003 (all 13 approved reusable classes) through [src/uibms.css](src/uibms.css). Open the [native HTML showcase](examples/native-html.html) and [reusable classes showcase](examples/classes.html) from a local checkout to evaluate the current appearance and interactions.

Chromium testing passed 59 class/showcase checks and all 46 earlier native HTML regression checks using verified source CSS. Cross-engine compatibility, full accessibility verification, scoped and production distributions, alternative configuration profiles and signature effects remain under development.

Next checkpoint: IMP-004 — configuration profiles.

See [Architecture and foundational principles](docs/ARCHITECTURE.md).
