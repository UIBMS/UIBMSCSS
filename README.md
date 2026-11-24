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

The native global development source implements the first five checkpoints: foundational tokens (IMP-001), native HTML styling (IMP-002), 13 reusable classes (IMP-003), independent configuration profiles (IMP-004), and signature materials, interactions and scroll effects (IMP-005), through [src/uibms.css](src/uibms.css). Seven alternative palettes and three alternative motion profiles remain independently loadable source stylesheets.

Open the [native HTML showcase](examples/native-html.html), [reusable classes showcase](examples/classes.html), [configuration showcase](examples/profiles.html), or [signature experience showcase](examples/effects.html) from a local checkout.

IMP-005 passed 64 targeted Chromium checks against the embedded development source. Earlier checkpoints have their own documented verification results; their full regression suite was not rerun during this checkpoint. Materials are CSS optical approximations, not physical refraction; advanced optical rendering, true squircles and custom scrolling physics remain future research or compatibility work.

Next checkpoint: IMP-006 — production distributions and quality verification. Cross-engine, complete accessibility, regression, scoped adoption and release testing remain outstanding.

See [Architecture and foundational principles](docs/ARCHITECTURE.md).
