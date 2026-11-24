# UIBMS CSS — Architecture and foundational principles

Status: foundational direction established; architectural decisions in progress.
Baseline date: 2026-11-24.

This document records the current, ground-up design direction. Earlier superseded CSS architecture discussions are not an active specification. The Established principles and Approved architectural decisions sections record adopted direction; proposals and open questions do not authorize implementation.

## Product purpose

UIBMS CSS exists to deliver a genuinely easier, more approachable way to build professional web interfaces, especially for agentic coding. Its distinction must come from useful improvements, not novelty alone. Native CSS knowledge remains applicable, and developers retain freedom over their applications.

## Established principles

### P-001 — Modern interoperable CSS

Use modern native CSS features already reliably adopted across Chromium/Blink, Apple Safari/WebKit and Mozilla Firefox/Gecko. Prefer modern native solutions over outdated workarounds. Evaluate new CSS features as they achieve cross-engine interoperability. Minimum supported versions, feature acceptance criteria and the test matrix remain open; experimental or incomplete implementations are not part of the initial required baseline.

### P-002 — Minimalism and optimization

Aim for minimal necessary CSS, strong loading and rendering performance, maintainability, and continuous improvement as CSS evolves. Do not impose arbitrary size budgets, artificial restrictions or unnecessary design limitations. Avoid redundant functionality without sacrificing useful capabilities or clarity. Evaluate optimization through evidence rather than assumptions.

### P-003 — Meaningful tokenization

Tokenize where a value or relationship represents meaningful design intent, reuse, configuration or adaptation. Use native CSS custom properties where appropriate. Do not mechanically replace every declaration with a token. Avoid unnecessary indirection. The token hierarchy, categories and names remain undecided.

### P-004 — AAA accessibility by default

Framework-provided default styles and supported configurations must target applicable WCAG 2.2 Level AAA criteria, including applicable lower-level criteria. Accessible defaults must not depend on developer opt-in. Respect user accessibility preferences and preserve essential interaction feedback. Developers remain free to override defaults; the framework cannot certify full website conformance because HTML semantics, content and application behavior also matter. Verify applicable requirements through testing. The detailed accessibility test plan remains open.

### P-005 — Human-first and agent-oriented development

Make functionality approachable, discoverable, predictable and easy to use for humans and AI coding agents. Reduce unnecessary framework-specific knowledge and avoid requiring developers or agents to repeatedly solve the same styling problems. Aim for genuine ease of correct implementation, not a new proprietary styling language. Documentation and discoverability mechanisms remain open.

### P-014 — Meaningful data attributes

Provide useful, high-level HTML data attributes for design configuration. The user explicitly identified light/dark/automatic color schemes and named palettes such as Gold and Ocean. Other attributes should be justified by meaningful ease of work rather than mirroring individual CSS properties. Names, supported values, scope, inheritance, composition and customization are open for design. The exact spelling of illustrative attributes such as data-theme and data-palette is not yet a public contract.

### P-015 — Living interfaces

Provide useful CSS interaction and visual effects by default so screen interfaces feel responsive and alive rather than resemble flat print views. Effects must remain consistent with accessibility, performance and minimalism. Preserve essential feedback when decorative motion is reduced. Exact effect behaviors, strengths, timing and default element coverage are undecided.

### P-016 — Original and configurable visual effects identity

Treat effects as a major data-attribute-controlled design dimension. Develop a distinctive UIBMS visual and interaction identity by default, provide a useful catalog of general-purpose effects without unnecessary bloat, and allow developers to select alternative effect styles or platform-aware behavior. Maintain high engineering and accessibility standards. The exact default profile, alternative profiles, attribute syntax, individual effects, composition and delivery mechanism are open. Platform awareness must distinguish actual detectable browser capabilities and preferences from unsupported assumptions about operating systems.

## Proposals to evaluate, not approved requirements

The following ideas were raised during discussion and have not been individually selected:

- P-006: self-describing architecture.
- P-007: intent-oriented development.
- P-008: intrinsic adaptability.
- P-009: predictable composition.
- P-010: developer sovereignty / avoiding unnecessary lock-in.
- P-011: evidence-driven quality and comparative agentic coding benchmarks.
- P-012: a single authoritative source of truth for implementation, documentation and machine-readable interfaces.
- P-013: continuous native modernization (specific governance and migration policy remain open).

Additional architectural topics to resolve include semantic HTML-first defaults, responsibility boundaries between classes and data attributes, non-invasive adoption, modular extensibility, intelligent defaults and quality verification.

## Approved architectural decisions

### ARC-001 — Default HTML styling

Status: approved — Option C, 2026-11-24.

UIBMS CSS follows a native HTML-first approach with optional scoped adoption.

- Including the framework normally provides modern, accessible and interactive default styling for standard HTML elements without requiring framework-specific classes or attributes.
- Classes and data attributes enhance or customize the default experience rather than being prerequisites for basic styling.
- Existing applications must also be able to adopt UIBMS CSS within selected areas without applying framework styling to the entire document.
- Preserve ordinary CSS customization and avoid unnecessary duplication between global and scoped adoption.

The exact default element coverage, scoping interface, selector architecture, inheritance boundaries, reset behavior and delivery mechanism remain open. Scoped adoption must be tested for leakage and interaction with existing styles. This approval establishes the architectural direction, not a particular implementation.

### ARC-002 — Scope of default HTML styling

Status: approved — Option C, 2026-11-24.

UIBMS CSS provides comprehensive, context-aware default styling for relevant visual native HTML elements, preserving native semantics and functionality.

- Cover typography, links, buttons, form controls, tables, lists, basic document structure, dialogs, popovers, details and summaries, progress bars and meters, figures and captions, code blocks and quotations, fieldsets and legends, and media elements.
- Adapt elements meaningfully to their surrounding design context, interaction states, inherited settings and available space. Examples include buttons adapting to theme, density and effects; tables adapting to available space; dialogs adapting dimensions and effects; images respecting available content dimensions; and preformatted content handling overflow appropriately.
- Preserve predictable, minimal and overridable behavior. Do not automatically assign application-specific layout roles to structural or semantic elements (for example, do not turn every section into a card or every aside into a sidebar).
- Apply the same principles in global and scoped adoption, as established in ARC-001.

Exact element coverage, contextual adaptation rules, tokens, selectors and implementation details remain open. Illustrative behaviors are design targets rather than approved implementation contracts.

### ARC-003 — Separation of CSS classes and data attributes

Status: approved — Option C, 2026-11-24.

Maintain strict separation of responsibilities with contextual configuration.

- Native HTML provides document structure and semantics.
- CSS classes provide reusable styling and layout functionality.
- HTML data attributes express meaningful configuration, appearance and effects, including design contexts that apply to descendant elements where appropriate.
- Design tokens expose meaningful customizable design values.
- Native pseudo-classes express interaction states; native CSS mechanisms handle environmental conditions.
- Custom CSS remains unrestricted for individual developer requirements.
- Avoid offering the same framework functionality through interchangeable classes and data attributes. Keep their public responsibilities clear and predictable.
- Support nested design contexts and localized overrides through native cascade and inheritance where appropriate, without requiring repeated attributes on every descendant.

The precise class and attribute names, accepted values, responsibility boundaries, inheritance rules, precedence and scoping implementation remain open. Illustrative markup is not a finalized API.

### ARC-004 — CSS cascade, specificity and developer freedom

Status: approved — Option C, 2026-11-24.

Use native CSS cascade layers together with deliberately low-specificity framework defaults.

- Organize framework styling using native cascade layers (`@layer`), with explicit and predictable styling priorities.
- Prefer low-specificity selectors where appropriate, including `:where()`, to avoid specificity escalation.
- Avoid unnecessary `!important` declarations and preserve native CSS cascade and inheritance.
- Developers must be able to override framework visual decisions using ordinary CSS without requiring a special overriding mechanism. Normal unlayered author declarations take precedence over normal layered author declarations, subject to the native cascade.
- Apply these principles consistently to global and scoped adoption and contextual configuration.

The number, names, order, responsibilities and organization of layers, and exact selector conventions, remain open. This decision does not prescribe a particular layer structure or prohibit developers from using any valid CSS.

### ARC-005 — Modularity and CSS distribution

Status: approved — Option C, 2026-11-24.

Provide a ready-to-use, lightweight default distribution, independently available extensions, and an optional comprehensive distribution, all derived from the same source architecture.

- The default distribution must deliver the original UIBMS experience, including native HTML styling, meaningful tokens, applicable AAA accessibility defaults and fundamental interaction effects.
- Additional palettes, specialized effects and other optional capabilities may be distributed as independently loadable extensions.
- A comprehensive distribution may combine the default distribution and all standard extensions for developers who prefer complete functionality.
- Developers must not need build tools or mandatory configuration to consume the published CSS distributions.
- Avoid maintaining duplicate implementations of shared functionality. Keep the default distribution free of unnecessary optional CSS while retaining a complete default experience.
- Preserve the approved native cascade, contextual configuration and scoped adoption principles across distributions.

Exact source structure, distribution names, extension boundaries, dependency contracts, layer ordering and build tooling are open. Examples of how distributions could be consumed are illustrative, not an approved public API.

### ARC-006 — Source CSS language and build tooling

Status: approved — Option C, 2026-11-24.

Maintain exclusively native CSS source and use automated tooling to generate, validate and minify distributions.

- Author framework styles in native, interoperable CSS, not Sass, Less or a proprietary styling language.
- Automate distribution assembly, dependency resolution, validation and minification while preserving native CSS semantics and the approved cascade architecture.
- Build tooling serves maintainers and must not be required by consumers of published CSS distributions.
- Do not require experimental syntax transformations or browser runtime polyfills for the established native CSS baseline.
- Generate default, extension and comprehensive distributions from the same maintained source according to ARC-005.

The tooling, package manager, source directory structure, validation rules, build pipeline and output filenames remain undecided. This decision approves the approach, not a specific toolchain.

### ARC-007 — Cascade layer architecture

Status: approved — Option C, 2026-11-24.

Use a responsibility-based native CSS cascade layer architecture.

- Introduce a cascade layer only when it serves a meaningful styling-priority or precedence purpose, not merely because a source directory, feature or CSS category exists.
- Keep source organization independent from cascade layer organization.
- Use nested layers where they solve a genuine architectural problem, while avoiding unnecessary hierarchy and complexity.
- Maintain predictable framework priorities, low-specificity defaults and ordinary developer overrides, as established in ARC-004.
- Preserve consistency across default, extended, complete and scoped distributions.
- Accessibility must be integrated throughout the framework; it is not solely the responsibility of any dedicated preferences or accessibility layer.

The illustrated reset, defaults, configuration, features and preferences layers are candidates, not approved layer names, boundaries or ordering. Evaluate each proposed layer individually before establishing the actual architecture.

### LYR-001 — Minimal native reset layer

Status: approved — Option B, 2026-11-24.

Provide a dedicated, minimal UIBMS CSS reset layer using modern native CSS.

- Normalize meaningful browser inconsistencies and establish consistent box-sizing behavior.
- Include only declarations with a justified technical purpose. Avoid obsolete browser workarounds and unnecessary blanket resets.
- Preserve useful browser defaults, native HTML functionality and accessibility features.
- Support both global and scoped adoption without unintended changes outside the chosen scope.
- Keep visual identity, typography design, palettes, element appearance, layout features and effects outside the reset's responsibilities.
- Place reset declarations at a lower cascade priority than the framework's subsequent visual styling.

The exact layer identifier, selectors, declarations and scoped implementation remain open. Illustrative reset code is not an approved implementation.

### LYR-002 — Unified defaults layer

Status: approved — Option B, 2026-11-24.

Use a unified cascade layer for default design tokens and native HTML styling, with separate source files where useful. Do not introduce separate token, element or interaction sublayers without a demonstrated precedence requirement.

- Provide default design tokens, native element appearance, typography, colors, native interaction states and the original UIBMS visual identity.
- Give defaults higher cascade priority than the minimal reset approved in LYR-001.
- Keep browser normalization outside the defaults layer.
- Keep alternative palettes and profiles, and explicitly requested layout functionality, outside the defaults layer's responsibility; their precise cascade placement remains open.
- Preserve low specificity, native CSS customization, contextual behavior, scoped adoption, meaningful tokenization and applicable AAA accessibility defaults.
- Introduce nested layers only if a genuine cascade-priority problem subsequently justifies them.

The exact layer identifier, source file organization, token names, selectors and declarations remain open. Illustrative CSS is not an approved implementation.

### LYR-003 — Unified configuration layer

Status: approved — Option B, 2026-11-24.

Use a dedicated, unified configuration cascade layer with higher priority than the defaults layer approved in LYR-002.

- Handle color schemes, palettes, effects profiles, alternative design presets and other meaningful contextual design settings.
- Prefer overriding relevant design tokens and settings over duplicating native HTML styling or effect implementations.
- Allow independently distributed palettes, profiles and other configuration extensions to contribute to the same layer.
- Keep default token values, native HTML styling, individual effect implementations and layout functionality outside this layer's responsibility.
- Keep independent configuration dimensions composable and avoid unnecessary sublayers. Introduce nested priorities only when an actual precedence requirement justifies them.
- Preserve contextual inheritance, nested design environments, low specificity, scoped adoption, applicable AAA defaults and ordinary developer overrides. Cascade layer priority does not replace normal CSS inheritance rules.

The exact layer identifier, token and attribute names, supported values, inheritance boundaries, configuration precedence rules and implementation remain open. Illustrative CSS is not an approved implementation.

### LYR-004 — Unified features layer

Status: approved — Option B, 2026-11-24.

Use a dedicated, unified features cascade layer with higher priority than the configuration layer approved in LYR-003.

- Handle explicitly requested reusable layout and styling functionality through CSS classes, and individual visual effects through meaningful data attributes, preserving the responsibility separation approved in ARC-003.
- Keep default element styling and default interaction effects in the defaults layer, contextual design settings in the configuration layer, and browser normalization in the reset layer.
- Allow both default and optional distributions to contribute to the features layer. Distribution packaging and cascade priority remain independent architectural concepts.
- Introduce nested feature layers only where a demonstrated precedence problem justifies them.
- Preserve low specificity, contextual configuration, scoped adoption, native CSS customization, minimalism and applicable AAA accessibility defaults.

The exact layer identifier, feature catalog, class and attribute names, selectors, declarations, composition rules and packaging remain open. This approval does not authorize a particular component library or utility catalog; illustrative code is not an approved implementation.

## Open architectural decisions

1. Remaining framework responsibility boundaries and detailed styling rules, following approved ARC-001 (native HTML-first with optional scoped adoption), ARC-002 (comprehensive, context-aware native HTML styling) and ARC-003 (strict separation of classes and data attributes with contextual configuration).
2. CSS architecture, layer structure, distribution packaging and extension mechanisms, following approved ARC-004 (native cascade layers and deliberately low specificity) ARC-005 (default distribution with modular extensions and a comprehensive distribution) ARC-006 (native CSS source with automated distribution generation, validation and minification) and ARC-007 (responsibility-based cascade layers) LYR-001 (minimal native reset layer) LYR-002 (unified defaults layer) LYR-003 (unified configuration layer) and LYR-004 (unified features layer; remaining layers open).
3. Public naming and interface conventions.
4. Meaningful token architecture.
5. Default native HTML styling and interaction states.
6. Data attribute responsibilities, configuration, inheritance and composition.
7. Original visual effects identity, reusable effects, alternate profiles and environmental adaptation.
8. Testing, accessibility verification, compatibility policy and performance measurement.

The ordering is a proposed discussion sequence, not an approved implementation plan. Decide architectural questions individually before implementing the corresponding production CSS. Record subsequent approvals explicitly and distinguish them from illustrative examples.

## Reference authorities

- W3C CSS specifications: https://drafts.csswg.org/
- Web Platform Baseline: https://web.dev/baseline
- Web Platform Status: https://webstatus.dev/
- Web Platform Tests: https://wpt.fyi/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

No CSS selector API, token schema, module structure, browser version policy or implementation is approved by this foundational document alone.
