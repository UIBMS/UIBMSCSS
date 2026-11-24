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

The native development source is now in implementation. IMP-001 (foundational design tokens) and IMP-002 (native HTML styling) are implemented in the global development entry point, [src/uibms.css](src/uibms.css). Open the [native HTML showcase](examples/native-html.html) from a local checkout to evaluate the current appearance and interactions.

Initial Chromium testing passed 46 targeted checks using a representative fixture with the verified source CSS. Cross-engine compatibility, complete accessibility verification, scoped and production distributions, optional profiles, reusable classes and signature effects remain under development.

Next checkpoint: IMP-003 — reusable layout and styling classes.

See [Architecture and foundational principles](docs/ARCHITECTURE.md).
