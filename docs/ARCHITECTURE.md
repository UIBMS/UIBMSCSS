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

### LYR-005 — Hybrid preferences layer

Status: approved — Option C, 2026-11-24.

Provide a dedicated preferences cascade layer for shared user and environmental adaptations requiring higher cascade priority, while keeping feature-specific adaptations with their respective implementations.

- Give the preferences layer the highest normal cascade priority within the framework.
- Respect reduced motion, contrast and forced-color preferences, input and hover capabilities, print conditions and automatic color scheme selection where applicable.
- Use shared preference overrides where meaningful; do not centralize every media query or duplicate feature-specific adaptation rules unnecessarily.
- Preserve essential interaction feedback, native accessibility behavior and ordinary developer customization.
- Ensure locally configured or inherited tokens do not accidentally defeat framework accessibility adaptations in nested or scoped design environments.
- Integrate accessibility across all layers, rather than delegating all accessibility responsibilities to preferences.

The exact layer identifier, media queries, token contracts, scope boundaries and declarations remain open. Illustrative CSS is not an approved implementation.

### Consolidated cascade architecture

The approved responsibility-based layer order, from lowest to highest priority for normal framework declarations, is:

1. Reset (LYR-001): minimal browser normalization.
2. Defaults (LYR-002): default tokens, native HTML styling and original UIBMS visual experience.
3. Configuration (LYR-003): contextual themes, palettes, effects profiles and design settings.
4. Features (LYR-004): explicitly requested layout, styling and individual effects.
5. Preferences (LYR-005): shared user and environmental adaptations requiring priority.

Normal unlayered author CSS overrides normal layered framework declarations according to the native CSS cascade. Layer priorities do not supersede inheritance rules; important declarations have reversed layer precedence. Source organization and distribution packaging remain independent of cascade layers. Exact public layer identifiers, declaration order syntax and extension contracts are not yet approved.

### ARC-008 — Natural, unprefixed naming

Status: approved — Option A, 2026-11-24.

Use natural, concise and descriptive unprefixed names as the framework's naming strategy. Prioritize UIBMS CSS's own coherent conventions rather than designing its public interfaces around compatibility with competing CSS frameworks.

- Use meaningful, readable names for CSS classes, data attributes and design tokens without requiring a UIBMS brand prefix.
- Avoid duplicate prefixed and unprefixed interfaces.
- Prioritize consistency, discoverability and ease of use for humans and AI coding agents.
- Do not introduce naming complexity merely to avoid collisions with other CSS frameworks. Document potential conflicts rather than promising automatic compatibility with competing naming systems.
- Retain native web standards compatibility, approved scoped adoption, ordinary CSS overrides and developer freedom. Independence from competing frameworks does not change these requirements.

Exact identifiers, naming grammar and any technically necessary private implementation identifiers remain open. No particular class, attribute, token or cascade layer identifier is approved by the illustrative naming examples.

### ARC-009 — Natural, descriptive and native CSS-aligned naming

Status: approved — Option C, 2026-11-24.

Use natural, concise and descriptive identifiers that follow established native CSS terminology wherever appropriate.

- Use lowercase, hyphen-separated words for framework-defined classes, data attributes, custom properties and their named values.
- Avoid arbitrary abbreviations and redundant words; prefer familiar terminology over framework-specific vocabulary.
- Use meaningful, discoverable names for attribute values instead of opaque codes.
- Preserve the unprefixed naming strategy approved in ARC-008.
- Prioritize clarity and consistency for both humans and AI coding agents without introducing a separate styling language.

The examples used in the decision discussion illustrate the naming grammar only. Exact public class, attribute, token and layer identifiers and supported values remain open.

### TOK-001 — Organic, relationship-based token architecture

Status: approved — Option C, 2026-11-24.

Design a flexible network of meaningful design values and relationships rather than requiring a fixed primitive, semantic and component hierarchy.

- Create independent tokens where independent control provides value, and derived tokens where a meaningful relationship exists.
- Introduce component-specific tokens only when independent customization justifies them.
- Use native CSS custom properties, mathematics and interoperable color functions where appropriate.
- Avoid redundant aliases, unnecessary intermediate tokens and mechanical tokenization of CSS declarations.
- Support contextual overrides and preserve native CSS cascade and inheritance. Dependent values must resolve in the intended context; inherited custom properties do not automatically recompute their variable references in a descendant context.
- Evaluate derived colors and other configurable values against applicable AAA accessibility requirements for framework-provided defaults and supported presets.

The token inventory, exact identifiers, values, relationships, computation strategies, inheritance boundaries and registration rules remain open. Illustrative CSS is not an approved implementation.

### TOK-002 — Context-aware token resolution

Status: approved — Option C, 2026-11-24.

Provide global token defaults, contextual overrides, scoped adoption and nested design environments using native CSS cascade and inheritance.

- Inherit settings from the surrounding design context unless explicitly overridden.
- Preserve independent configuration dimensions so changing one setting does not unintentionally reset unrelated settings.
- Support local developer overrides and ensure dependent values resolve within the intended context.
- Account for the fact that inherited custom properties have already resolved their variable references at the element on which their computed values were established. Overriding a referenced token on a descendant does not automatically recompute an inherited dependent custom property.
- Choose appropriate native computation strategies per relationship, including calculations at the point of consumption or context-local derived declarations where justified.
- Avoid mechanically redeclaring every token in every design context. Preserve minimalism, predictable composition, accessibility preferences and ordinary CSS customization.

Exact token declarations, computation strategies, context boundaries, selectors and inheritance rules remain open. Illustrative markup, palettes and CSS are not approved implementation contracts.

### TOK-003 — Meaningful custom property registration

Status: approved — Option C, 2026-11-24.

Use ordinary native CSS custom properties by default and register selected properties with `@property` only when a genuine technical benefit justifies registration.

- Consider registration for typed values, interpolatable custom properties used by visual effects, explicit inheritance behavior and meaningful initial values.
- Avoid registering every design token mechanically or unnecessarily restricting valid developer customization.
- Account for document-wide registration behavior: an individual scoped adoption area does not isolate a custom property's registration.
- Preserve the context-aware token architecture approved in TOK-002, the native CSS compatibility baseline, accessibility preferences and minimalism.
- Evaluate each proposed registration against its actual purpose, supported syntax, initial value, inheritance behavior and potential interactions with other declarations.

Exact registered properties, syntax descriptors, initial values, inheritance settings and implementation remain open. Illustrative animation code is not an approved implementation.

### TOK-004 — Foundational tokens with organic expansion

Status: approved — Option C, 2026-11-24.

Establish a coherent collection of meaningful foundational design tokens, then expand it in response to genuine implementation and customization requirements.

- Consider color, typography, spacing, geometry, borders, depth, motion and effects as potential foundational domains rather than mandatory token collections.
- Reuse established foundational tokens and meaningful relationships wherever appropriate.
- Introduce additional or component-specific tokens only when independent control or another concrete requirement provides value.
- Where appropriate, use native custom property fallbacks to expose optional overrides without redundant default declarations. Document supported override contracts, including their expected values and contextual behavior.
- Avoid speculative token inventories, unnecessary aliases and unused declarations.
- Preserve the relationship-based architecture, contextual resolution, selective property registration, applicable AAA accessibility defaults and unrestricted developer customization established in earlier decisions.

The initial token domains, inventory, public identifiers, default values, derivation rules and optional override contracts remain open. Illustrative CSS is not an approved implementation.

### TOK-005 — Intelligent hybrid color system

Status: approved — Option C, 2026-11-24.

Use meaningful foundational color roles, native computational relationships where appropriate, and explicitly defined and verified colors where accessibility or visual identity requires them.

- Define coordinated color identities rather than requiring extensive predefined numerical color scales.
- Use modern interoperable native CSS color capabilities, including OKLCH, OKLAB, color-mix(), light-dark(), currentColor and system colors, where technically appropriate.
- Support contextual inheritance, themes, palettes and effects through the approved token architecture.
- Prioritize applicable WCAG 2.2 AAA accessibility requirements for framework-provided defaults and supported color combinations over automatic color generation. Mathematical derivation does not by itself establish accessible contrast.
- Verify actual foreground/background combinations and interaction states, including those affected by derived colors, translucency or effects.
- Preserve developer customization, meaningful tokenization and minimal duplication.

The exact color roles, token inventory, identifiers, values, palette definitions, computation strategies, theme composition rules and verification methods remain open. Illustrative palettes and CSS are not approved implementations.

### TOK-006 — Independent themes and coordinated palettes

Status: approved — Option C, 2026-11-24.

Keep color scheme selection and palette selection independent, with coordinated light and dark color values within each palette wherever required.

- Support light, dark and automatic color schemes; automatic selection follows the user's system preference.
- Palettes establish coordinated color identities rather than separate combined theme-palette names.
- Use native interoperable CSS mechanisms, including color-scheme and light-dark() where appropriate, to resolve the color scheme in the intended context.
- Permit nested light and dark environments to retain the inherited palette, and nested palette environments to retain their inherited color scheme unless explicitly overridden.
- Keep effects profiles independently configurable. Reuse shared element styling rather than duplicate implementations for each combination.
- Verify framework-provided palette and scheme combinations, including interaction states, against applicable AAA accessibility requirements. Do not rely on automatic color inversion or transformation alone.
- Preserve contextual token resolution, scoped adoption, low specificity and developer customization.

Exact attribute and token identifiers, default palette, color values, derivation methods and implementation remain open. The illustrative selectors, palettes and code are not approved implementation contracts.

### TOK-007 — Neutral foundation with configurable accent identity

Status: approved — Option C, 2026-11-24.

Establish a neutral foundational color identity with a distinctive, independently customizable accent.

- Provide coordinated neutral surfaces, backgrounds and foregrounds for light and dark environments.
- Give developers the ability to customize the accent identity independently or choose a complete palette that also changes coordinated surface and other color roles.
- Preserve the independence of color scheme, palette and effects configuration approved in TOK-006.
- Develop a recognizable UIBMS identity through typography, proportions, geometry, interaction behavior and signature effects rather than depending exclusively on a particular brand color.
- Preserve meaningful tokenization, contextual inheritance, native CSS customization and applicable AAA accessibility defaults; verify supported accent and palette combinations.

The default accent color, exact color values, public token identifiers, configuration mechanism and palette catalog remain open. Illustrative previews are not approved implementations.

Clarification — 2026-11-24: The default framework color identity must remain natural and brand-independent. Do not select Bordeaux or any other corporate branding color merely because it belongs to the UIBMS company identity. Company branding and the CSS framework's visual identity are independent. The exact default colors and accent values remain open. This clarification does not approve the proposed DAT-009 palette catalog or distribution strategy.

### TOK-008 — Intrinsic and computational typography

Status: approved — Option C, 2026-11-24.

Establish an adaptive, accessible typography system using meaningful foundational tokens, native CSS mathematics and context-aware relationships rather than a fixed or exclusively breakpoint-driven scale.

- Use native system fonts by default, without mandatory external font downloads. Preserve developer freedom to select other fonts and introduce optional typography profiles.
- Use relative units, fluid sizing, appropriate bounds and meaningful heading relationships where beneficial.
- Provide readable line heights, sensible long-form reading measures and modern interoperable text wrapping.
- Respect user font preferences, browser zoom, text resizing, reflow, writing direction and language-specific typography requirements.
- Verify typography against applicable WCAG 2.2 Level AAA criteria. Fluid sizing must not undermine text scaling or readability.
- Preserve contextual token resolution, predictable composition, minimal CSS and native developer overrides.

The exact font stacks, default sizes, scaling formulas, heading relationships, token identifiers, line heights, reading measures and optional profiles remain open. Illustrative code and previews are not approved implementation contracts.

### TOK-009 — Intrinsic and context-aware spacing

Status: approved — Option C, 2026-11-24.

Establish consistent spatial relationships through meaningful foundational spacing values, native CSS calculations, contextual density and intrinsic adaptation.

- Prefer meaningful configurable spacing tokens and derived relationships over an extensive predetermined numerical spacing scale.
- Support contextual interface density, allowing different design environments to adjust spacing without changing unrelated settings.
- Use relative units, native mathematical functions, intrinsic responsiveness and CSS logical properties where beneficial.
- Preserve readable spacing, content reflow and applicable AAA interaction target sizes. Compact density must not compromise accessibility defaults.
- Preserve context-aware token resolution, ordinary native CSS customization and developer freedom over dimensions.
- Introduce spacing utilities only where a concrete reuse requirement justifies them.

Exact spacing tokens, formulas, density values, attribute identifiers, interaction target implementations and default dimensions remain open. Illustrative CSS and previews are not approved implementation contracts.

### TOK-010 — Context-aware geometry with configurable identity

Status: approved — Option C, 2026-11-24.

Establish coordinated geometry through meaningful foundational tokens, native computational relationships and contextual geometry profiles.

- Support independent configuration of corner geometry, borders and proportions without unnecessarily changing color, typography, spacing or interaction behavior.
- Use intrinsic sizing, logical properties, native aspect ratios and other interoperable CSS capabilities where appropriate.
- Derive related geometry values where a meaningful relationship exists rather than establishing unnecessary fixed scales.
- Allow contextual geometry profiles and local developer overrides while preserving the approved token inheritance and resolution architecture.
- Maintain visible boundaries, focus indicators, readable content, accessible interaction targets and applicable AAA accessibility defaults.
- Evaluate emerging shape capabilities when they meet the approved cross-browser interoperability requirements.

The exact geometry tokens, profile names, attribute identifiers, default values, shape definitions and implementation remain open. Illustrative CSS and previews are not approved implementation contracts.

### TOK-011 — Context-aware surface and depth system

Status: approved — Option C, 2026-11-24.

Establish a coordinated surface and visual depth architecture using meaningful shared tokens and native CSS mechanisms rather than relying exclusively on fixed shadow scales.

- Express visual depth through appropriate combinations of shadows, inset shadows, borders, illumination, transparency, backdrop filters, gradients, color relationships and interaction-driven changes.
- Distinguish surface appearance, perceived elevation and interaction effects, and keep visual elevation independent of actual stacking order and z-index.
- Support light and dark environments and share meaningful surface and depth tokens across configurable effects profiles instead of duplicating implementations.
- Preserve predictable composition, contextual inheritance, ordinary developer overrides and the approved cascade architecture.
- Verify visible boundaries, foreground/background contrast and applicable AAA accessibility requirements, including translucency and changing interaction states.
- Evaluate rendering cost and avoid unnecessary filters, shadows or other effects; preserve useful fallbacks and environmental preferences.

Exact surface profiles, depth tokens, elevation calculations, configuration mechanisms, defaults and implementation remain open. Illustrative CSS and previews are not approved implementation contracts.

### TOK-012 — Context-aware motion language

Status: approved — Option C, 2026-11-24.

Establish a coordinated, recognizable motion language combining meaningful computational relationships, interaction-specific behavior, contextual effects profiles and environmental awareness.

- Use native CSS animations and transitions, with shared foundational values for duration, easing, distance, intensity, scale, delay and opacity where technically justified.
- Distinguish the purposes of feedback, navigation, entrance, exit, transformation, attention, progress, elevation and optional decorative motion. Different purposes may require different timing and easing.
- Reuse underlying motion implementations across effects profiles rather than duplicating styling for each profile.
- Keep motion independent of palette and geometry selection unless an explicitly documented interaction requires coordination.
- Prefer performant motion mechanisms, avoid unnecessary layout recalculation, continuous decorative animation and universal transition: all declarations, and preserve immediate interaction responsiveness.
- Respect reduced-motion preferences automatically and preserve essential visual feedback when non-essential motion is disabled.
- Maintain contextual token resolution, predictable composition, native developer customization and applicable AAA accessibility defaults.

The exact motion token inventory, values, timing curves, effects profiles, behavior contracts and implementation remain open. Illustrative CSS and previews are not approved implementation contracts.

### DAT-001 — Independent contextual and individual feature attributes

Status: approved — Option C, 2026-11-24.

Organize meaningful HTML data attributes into independent contextual configuration dimensions and individual feature requests, rather than combining unrelated settings into a single attribute.

- Contextual attributes establish design environments that apply to descendants through native CSS inheritance and contextual token resolution where appropriate.
- Individual feature attributes request specific functionality on the selected element without automatically activating the same feature on descendants.
- Keep configuration dimensions independent, composable, predictable and easy to discover for humans and coding agents.
- Preserve the strict responsibility separation between classes and data attributes established in ARC-003.
- All attributes are optional; native HTML receives the default UIBMS visual experience without additional configuration.
- Candidate contextual responsibilities include color scheme, palette, effects profile, density, geometry and typography. Individual visual effects are a candidate feature responsibility.

Exact attribute identifiers, supported values, inheritance and reset rules, feature composition, validation, extension contracts and implementation remain open. Illustrative attribute names and markup are not a finalized public API.

### DAT-002 — Selective inheritance with explicit restoration

Status: approved — Option C, 2026-11-24.

Contextual attributes override only their own design dimension. Other dimensions retain their surrounding configuration through the approved native CSS inheritance and token resolution architecture.

- Omitted contextual attributes retain the surrounding configuration, or framework defaults where no surrounding configuration applies.
- Recognized values configure the corresponding dimension without resetting unrelated settings.
- Provide an explicit means to restore the framework default for an individual dimension without resetting other dimensions.
- Support automatic environmental adaptation and explicit disabling where meaningful for the particular dimension or optional functionality.
- Unrecognized values should leave inherited or default configuration unaffected rather than produce unrelated changes.
- Preserve nested-context predictability, developer overrides, accessibility preferences and the distinction between contextual configurations and individual feature requests.

The proposed values default, auto and none are illustrative conventions; not every attribute requires every special value. Exact reserved values, selectors, reset mechanisms and implementation remain open.

### DAT-003 — Composable individual features and interaction contexts

Status: approved — Option C, 2026-11-24.

Support multiple space-separated feature values in meaningful individual feature attributes, with distinct interaction contexts where they provide genuine value.

- Allow compatible visual effects to compose on the same element through a declarative, human-readable and agent-friendly HTML interface.
- Distinguish general visual effects from context-specific requests, such as hover, activation, focus, entrance, exit and scroll-driven effects, wherever appropriate.
- Use native interoperable CSS mechanisms wherever technically possible; evaluate any features requiring additional runtime behavior separately rather than introducing a mandatory runtime.
- Establish predictable composition and documented conflict-resolution behavior for effects that manipulate overlapping CSS properties.
- Preserve native interaction semantics, keyboard focus, environmental preferences, applicable AAA accessibility defaults and developer customization.
- Preserve the distinction between contextual effects profiles and individual feature requests established in DAT-001. Individual requests do not automatically activate those features on descendants.

The attribute names, interaction contexts, supported effect values, composition and conflict-resolution rules, fallback behavior and implementation remain open. Illustrative CSS, markup and previews are not approved public API contracts.

### DAT-004 — Composable effect channels and predictable conflict resolution

Status: approved — Option C, 2026-11-24.

Compose individual effects through independent responsibilities and native CSS mechanisms rather than relying on accidental cascade conflicts or enumerating every possible effect combination.

- Allow compatible effects to contribute independently to shared visual results through native properties and meaningful custom properties where technically justified.
- Use independent native properties, such as translate, rotate and scale, where suitable; otherwise combine contributions through a shared implementation with explicitly defined composition behavior.
- Consider translation, rotation, scale, illumination, elevation, opacity, filters and surface appearance as potential effect channels, not a mandatory inventory.
- Establish documented precedence for incompatible effects and effects that target the same channel. Do not depend on the order of space-separated values in HTML attributes.
- Preserve the approved cascade architecture, contextual token resolution, scoped adoption, developer overrides, native interaction semantics and accessibility preferences.
- Avoid unnecessary combination-specific selectors, redundant properties and implementation complexity.

Exact effect channels, composition functions, precedence rules, supported combinations, internal and public identifiers, and implementation remain open. Illustrative CSS and previews are not approved implementation contracts.

### DAT-005 — Explicit control over default and individual effects

Status: approved — Option C, 2026-11-24.

Allow developers to retain, replace, extend, restore or disable optional default effects for each individual interaction context.

- Omitting an individual feature attribute retains the default behavior supplied by the applicable contextual effects profile.
- Explicit recognized effect requests replace the optional default effects for that interaction context unless the developer explicitly requests extension of the default behavior.
- Provide a means to retain or restore the applicable default effects, combine them with compatible explicit effects, or disable optional effects for the selected context.
- Keep other interaction contexts unaffected and preserve the independent contextual profile configuration and composition rules established in DAT-001 through DAT-004.
- Preserve essential focus indicators, accessibility feedback, native interaction semantics and environmental preferences even when optional effects are disabled.
- Maintain ordinary CSS developer customization and avoid requiring additional CSS merely to select the supported default, replacement, extension or disabling behaviors.

The illustrative individual attribute values default and none, and effect names such as glow, are not finalized public API identifiers. Exact syntax, handling of invalid or contradictory combinations, precedence and implementation remain open.

### DAT-006 — Purpose-driven foundational public attribute catalog

Status: approved — Option C, 2026-11-24.

Approve the following 13 public HTML data attribute names and responsibilities as the initial UIBMS CSS API design. The catalog is foundational and extensible, not an obligation to implement all features immediately.

| Contextual configuration attribute | Responsibility |
| --- | --- |
| `data-theme` | Color scheme |
| `data-palette` | Color identity |
| `data-effects` | Effects profile |
| `data-density` | Interface density |
| `data-shape` | Geometry profile |
| `data-typography` | Typography profile |

| Individual feature attribute | Responsibility |
| --- | --- |
| `data-effect` | General visual effects |
| `data-hover` | Hover effects |
| `data-active` | Activation effects |
| `data-focus` | Focus effects |
| `data-entrance` | Entrance animations |
| `data-exit` | Exit animations |
| `data-scroll` | Scroll-driven effects |

- Preserve independent contextual configuration, selective inheritance and explicit restoration under DAT-001 and DAT-002.
- Preserve individual feature composition, interaction-specific responsibilities and explicit control over default effects under DAT-003 through DAT-005.
- Expand the catalog only where a meaningful implementation requirement justifies an additional public attribute.
- Do not introduce attributes that merely reproduce native CSS declarations, such as arbitrary padding, margin, width or background assignments.
- All attributes remain optional, with native HTML defaults, applicable AAA accessibility requirements and ordinary developer customization preserved.

The 13 names and responsibilities are approved. Supported values, reserved keywords, validation and conflict handling, feature availability by distribution, implementation order and technical implementation remain open. Earlier illustrative attribute values and markup do not constitute additional approved API contracts.

### DAT-007 — Shared attribute vocabulary and context-specific applicability

Status: approved — Option C, 2026-11-24.

Establish consistent reserved keywords and value conventions for the public data attribute API, supporting each reserved keyword only where it has a meaningful responsibility.

| Reserved keyword or condition | Meaning |
| --- | --- |
| `default` | Restore applicable default behavior |
| `auto` | Follow environmental conditions |
| `none` | Disable optional functionality |
| Omitted attribute | Preserve inherited or default behavior |

- Contextual configuration attributes accept a single named value. Individual feature attributes accept space-separated feature values.
- Public values are lowercase, descriptive and hyphen-separated where necessary. Multiple feature values are independent of their order.
- Unrecognized contextual values leave inherited or default configuration unaffected.
- Ignore unrecognized individual feature values while applying recognized requests. If there are no recognized requests, preserve default behavior; an empty feature attribute also preserves default behavior.
- Repeated feature values apply only once. Where supported, the reserved value `none` takes precedence over other feature values and disables optional functionality in that interaction context.
- Preserve the explicit extension behavior established in DAT-005: combining `default` with recognized individual effects retains the applicable default effects and adds compatible requests.
- Do not introduce a proprietary expression language or require JavaScript validation for CSS functionality. Preserve native interaction semantics, essential accessibility feedback and user preferences.

The shared keywords and behavioral conventions above are approved. Individual attribute value catalogs, applicability of each reserved keyword, detailed effect precedence and technical implementation remain open. Example palette, profile and effect names are illustrative.

### DAT-008 — Environment-first color scheme configuration

Status: approved — Option C, 2026-11-24.

The public contextual attribute `data-theme` controls the color scheme independently of palette, typography, geometry, density and effects.

| Value or condition | Behavior |
| --- | --- |
| `light` | Select the light color scheme |
| `dark` | Select the dark color scheme |
| `auto` | Follow the user's system color preference |
| Omitted | Inherit the surrounding theme; use automatic behavior in the absence of a surrounding configuration |
| Unrecognized | Preserve inherited or default behavior |

- The initial supported named values are exactly `light`, `dark` and `auto`. A separate `default` value is unnecessary because `auto` explicitly restores the framework's environment-first behavior.
- Support nested color scheme selection and retain independent palette and other contextual settings under TOK-006 and DAT-002.
- Use native interoperable CSS color scheme mechanisms without requiring JavaScript. Respect applicable accessibility preferences, including forced colors, even when a developer explicitly selects light or dark.
- Preserve scoped adoption, low specificity and native developer customization.

The named values and behavioral contract are approved. Selectors, token resolution, scoped-adoption implementation and accessibility verification remain open. Illustrative CSS is not an approved implementation.

### DAT-009 — Natural default palette and optional palette extensions

Status: approved — revised Option C, 2026-11-24.

Provide a natural, neutral and brand-independent default palette in the standard UIBMS CSS distribution. The corporate UIBMS branding does not determine the CSS framework's visual identity.

- Provide additional color identities as independently loadable optional palette extensions, with all official palettes available in the comprehensive distribution.
- Support developer-defined palettes through documented native CSS color token contracts without requiring modifications to the framework.
- Preserve independent light, dark and automatic color schemes, contextual palette inheritance, explicit restoration and the applicable AAA accessibility defaults.
- Avoid duplicating native element styling across palettes. Do not require separate palette extensions for the natural default appearance.
- Treat the palette catalog as extensible, with additions driven by genuine design requirements.

The revised proposed collection consists of Natural (default), Ocean, Gold, Forest, Bordeaux, Slate, Royal and Terracotta. Bordeaux is an optional color identity only, not the framework default. The natural default makes a separate Neutral palette unnecessary. The user's latest approval establishes the natural default and optional/custom palette distribution strategy; exact palette identifiers, optional collection membership, color values, filenames, token contracts and accessibility verification remain open.

Illustrative previews are not approved implementation contracts.

### DAT-010 — Original UIBMS effects profile with optional alternatives

Status: approved — Option C, 2026-11-24.

The public contextual attribute `data-effects` selects a coordinated visual and interaction effects profile independently of the color scheme, palette, geometry, typography and density.

| Approved value | Responsibility |
| --- | --- |
| `default` | Original UIBMS signature effects |
| `minimal` | Restrained, subtle feedback |
| `fluid` | Smooth, expressive transitions |
| `dynamic` | More pronounced interaction effects |
| `none` | Disable optional effects |

- Include the original signature effects profile in the standard distribution. Provide alternative profiles as independently loadable extensions, available in the comprehensive distribution.
- Support contextual inheritance and selective overrides; omission retains the surrounding profile or the original UIBMS profile when no surrounding configuration applies.
- Reuse shared motion, surface, depth and effect-channel implementations instead of duplicating styling for each profile.
- Keep optional effect disabling available without compromising essential focus indicators, state feedback, native functionality or applicable AAA accessibility requirements. Respect environmental preferences, including reduced motion, in every profile.
- Preserve individual effect requests and their context-specific replacement and extension behavior under DAT-003 through DAT-005.

The five profile identifiers and their responsibilities are approved. Exact visual designs, effects, token values, distribution filenames, precedence details, and implementation and verification remain open. Illustrative previews are not approved implementation contracts.

### DAT-011 — Essential density, geometry and typography profiles

Status: approved — Option C, 2026-11-24.

Establish the following initial public profile identifiers and responsibilities, with organic expansion and support for developer-defined profiles.

| `data-density` value | Responsibility |
| --- | --- |
| `default` | Balanced spacing |
| `compact` | Space-efficient interfaces |
| `spacious` | Generous spacing |
| `auto` | Context-aware density |

| `data-shape` value | Responsibility |
| --- | --- |
| `default` | Original UIBMS geometry |
| `sharp` | Angular geometry |
| `soft` | Subtly rounded geometry |
| `rounded` | Pronounced rounded geometry |
| `organic` | Expressive geometry |

| `data-typography` value | Responsibility |
| --- | --- |
| `default` | Native system typography |
| `editorial` | Reading-oriented typography |
| `technical` | Technical content and interfaces |
| `expressive` | Stronger typographic hierarchy |

- Keep all three contextual dimensions independent, optional and inheritable, in accordance with DAT-001, DAT-002 and DAT-007.
- Include original defaults in the core distribution; introduce alternative profiles according to genuine implementation requirements without unnecessary CSS growth.
- Preserve intrinsic spacing, context-aware geometry and accessible computational typography under TOK-008 through TOK-010, including user font preferences, content reflow, visible boundaries and applicable AAA interaction target sizes.
- Support developer-defined profiles through documented native CSS token contracts.

The 13 profile identifiers and their responsibilities across the three attributes are approved. Exact styles, measurements, font stacks, automatic density behavior, distribution details and implementation remain open. Illustrative markup does not approve additional palette identifiers or other API values.

### DAT-012 — Shared effect library with context-specific applicability

Status: approved — Option C, 2026-11-24.

Maintain one shared effects library across the seven approved individual feature attributes, with each effect available only in interaction contexts where it is meaningful and technically appropriate.

- Reuse underlying effect definitions and shared composition mechanisms wherever possible instead of duplicating implementations for each interaction attribute.
- Document each effect's identity, supported contexts, configurable parameters, composition and conflict-resolution rules, accessibility behavior, and technical requirements.
- Preserve the independent contextual profiles, explicit effect requests and default/replacement/extension behavior established in DAT-001 through DAT-011.
- Preserve native interaction semantics, environmental preferences, applicable AAA accessibility defaults and developer customization.
- Evaluate effects requiring unsupported CSS capabilities or additional runtime behavior separately; no mandatory runtime or unsupported behavior is approved.
- Expand the effects library organically and avoid unnecessary CSS growth.

The example effects lift, glow, scale, press, reveal, fade, rotate, shine and parallax and their proposed context mappings are illustrative, not an approved effects inventory. Exact effect identifiers, context support, parameters, distribution and implementation remain open.

### CLS-001 — Intent-oriented reusable classes

Status: approved — Option C, 2026-11-24.

Use CSS classes for meaningful reusable layout and styling intentions that complement native HTML defaults, rather than adopting a utility-first or component-first framework architecture.

- Introduce classes only when they provide useful reusable functionality beyond the native element experience; avoid mechanically reproducing individual CSS declarations as a large utility catalog.
- Avoid requiring predefined component markup, structural wrappers or classes merely to receive default native element styling.
- Preserve the strict responsibility separation approved in ARC-003: HTML provides semantics and structure; classes provide reusable layout and styling; data attributes configure design contexts and effects; custom properties provide design values; native pseudo-classes express interaction states.
- Candidate class responsibilities include layout, structure, surfaces, alignment, typography, accessibility helpers and explicit element variants. These are illustrative categories, not a mandatory inventory.
- Preserve natural, descriptive, unprefixed naming, low specificity, scoped adoption, applicable AAA accessibility defaults and unrestricted native CSS customization.
- Expand the class catalog organically according to genuine reuse requirements and avoid unnecessary CSS growth.

Exact class names, supported variants, composition behavior, distribution and implementation remain open. Illustrative class names and markup are not approved public API contracts.

### CLS-002 — Intrinsic layout patterns

Status: approved — Option C, 2026-11-24.

Provide meaningful reusable layout patterns that adapt intrinsically to available space and content rather than requiring a predetermined column grid or a large collection of individual layout utilities.

- Use native CSS Grid and Flexbox, content-aware dimensions and logical properties wherever appropriate.
- Favor intrinsic responsiveness; use container queries or other interoperable native CSS mechanisms where they provide a concrete benefit.
- Support composition of adaptive grids, flexible arrangements, vertical flow, wrapping clusters, sidebar layouts, split content areas, centered content and content-width management.
- Avoid mandatory twelve-column systems, unnecessary breakpoint-specific classes and imposed structural wrappers.
- Preserve meaningful spacing relationships, contextual density, accessible reflow, native HTML semantics, low specificity and unrestricted developer customization.
- Keep layout classes independent of palette, geometry and effects configuration under the approved class and data attribute responsibility boundaries.

The proposed names grid, flex, stack, cluster, sidebar, split, center and container are illustrative candidates. Exact class identifiers, layout contracts, dimensions, responsive behavior and implementation remain open. Illustrative CSS is not an approved implementation.

### CLS-003 — Foundational public class catalog

Status: approved — Option C, 2026-11-24.

Establish the following 13 public class names and responsibilities as the initial UIBMS CSS class catalog.

| Layout class | Responsibility |
| --- | --- |
| `grid` | Adaptive grid arrangement |
| `flex` | Flexible content arrangement |
| `stack` | Vertical content flow |
| `cluster` | Wrapping content arrangement |
| `sidebar` | Adaptive sidebar layout |
| `split` | Coordinated content areas |
| `center` | Content centering |
| `container` | Content width management |

| Styling class | Responsibility |
| --- | --- |
| `card` | Self-contained content surface |
| `panel` | Structured interface surface |
| `lead` | Introductory text |
| `truncate` | Single-line text truncation |
| `visually-hidden` | Visually hidden but assistive-technology-accessible content |

- Preserve the intent-oriented, intrinsic layout architecture approved in CLS-001 and CLS-002, including optional classes, native HTML defaults, low specificity and unrestricted native CSS customization.
- Keep classes distinct from contextual configuration and individual effects attributes.
- Introduce additional classes only where genuine reusable functionality justifies them, without a speculative utility inventory or imposed component markup.
- Verify accessibility, including reflow, access to meaningful truncated content and appropriate treatment of focusable visually hidden elements.

The 13 identifiers and their responsibilities are approved. Exact class implementations, dimensions, token contracts, supported combinations, distribution and detailed composition behavior remain open. Illustrative markup is not an approved implementation.

### HTM-001 — Comprehensive, context-aware native HTML styling

Status: approved — Option C, 2026-11-24.

Establish comprehensive native HTML styling according to each element's semantic responsibility, without mandatory classes, data attributes, predefined layouts or structural wrappers. This decision elaborates ARC-001 and ARC-002.

- Cover relevant typography, links, forms, actions, lists, tables, native interactive elements, indicators, technical and editorial content, media and semantic structure.
- Preserve native element semantics, functionality and browser interaction behavior, including specialized input types, dialogs, popovers and disclosure controls.
- Apply meaningful foundational design tokens, inherited configuration, context-aware dimensions and appropriate interaction feedback.
- Do not automatically turn semantic structural elements such as header, footer, main, nav, article, section and aside into particular layouts or component surfaces.
- Preserve scoped adoption, low specificity, applicable AAA accessibility defaults, user preferences and unrestricted developer customization.

The coverage categories are approved. The exact element and state inventory, visual styles, selectors, browser-specific treatment and implementation remain open. Illustrative previews are not approved implementation contracts.

### HTM-002 — Semantic and context-aware interaction states

Status: approved — Option C, 2026-11-24.

Style interaction states according to the native element's semantic purpose, behavior and surrounding design context rather than applying a universal decorative effect to all controls.

- Use native pseudo-classes and semantic attributes where appropriate, including hover, active, focus-visible, focus-within, disabled, checked, indeterminate, read-only, user-valid, user-invalid, required, open, popover-open and target states. Apply selectors only to elements for which the state is meaningful.
- Avoid simulating native states through unnecessary classes or data attributes. Style legitimate semantic and accessibility attributes where applicable without implying that CSS alone implements their behavior.
- Avoid premature form error presentation before relevant user interaction; preserve native validation and appropriate accessible error communication.
- Preserve keyboard, pointer and touch interactions, browser functionality, visible focus and understandable state feedback without relying solely on color or animation.
- Integrate optional visual effects and contextual profiles without compromising essential feedback, environmental preferences or applicable AAA accessibility requirements.

The semantic state styling architecture is approved. Exact state inventory, selectors, browser compatibility, visual treatments and implementation remain open.

### HTM-003 — Progressive native form control customization

Status: approved — Option C, 2026-11-24.

Customize native form controls where meaningful while preserving their underlying browser functionality, semantic behavior and accessibility.

- Provide coordinated visual styling for text inputs, textareas, selects, checkboxes, radio buttons, range controls, date and time inputs, color pickers, file inputs, password fields, search fields and numerical inputs according to their respective native capabilities.
- Preserve native pickers, selection behavior, numerical controls, validation, autofill and password manager compatibility.
- Use accent-color and other interoperable native CSS styling mechanisms where appropriate. Use appearance: none selectively only when the resulting control retains its functionality and accessible state feedback.
- Preserve keyboard, pointer and touch interaction, visible focus, readable states, accessible target sizes and applicable AAA accessibility defaults.
- Do not require JavaScript or mandatory structural wrappers for native form control styling.
- Introduce advanced native control styling capabilities when they meet the approved interoperability requirements; retain functional native fallbacks where necessary.

The progressive customization approach is approved. Exact control designs, specialized selectors, supported enhancement capabilities, browser-specific treatment and implementation remain open.

### ARC-010 — Global by default with optional scoped distribution

Status: approved — Option C, 2026-11-24.

Provide global and explicitly scoped adoption modes generated from the same maintained native CSS source.

- The global distribution applies the default UIBMS CSS experience without requiring special HTML classes or data attributes.
- The optional scoped distribution applies framework styling within explicitly selected adoption areas, supporting embedded applications, plugins and gradual adoption without applying framework selector rules indiscriminately to the surrounding document.
- Cover reset, defaults, contextual configurations, reusable classes, effects and applicable preference adaptations within the scope.
- Evaluate native @scope and low-specificity scoped selectors against the approved cross-browser interoperability requirements; preserve natural inheritance, native cascade behavior and developer overrides.
- Account explicitly for document-wide definitions, including custom property registrations and animation identifiers, which are not isolated merely by scoping selectors. Scoped adoption is not equivalent to complete isolation from host styles.
- Preserve the single maintained native CSS source, automated packaging, optional extension architecture, applicable AAA accessibility defaults and native HTML functionality.

Exact distribution filenames, scope marker, selectors, treatment of document-wide definitions, integration behavior and verification remain open. Illustrative filenames and markup are not approved implementation contracts.

### ARC-011 — Responsibility-based modular source structure

Status: approved — Option C, 2026-11-24.

Organize maintained native CSS source files by functional responsibility, independently of cascade-layer priority and generated distribution boundaries.

| Approved directory | Responsibility |
| --- | --- |
| `src/reset/` | Native CSS reset |
| `src/tokens/` | Foundational design properties |
| `src/elements/` | Native HTML styling |
| `src/layouts/` | Reusable layout classes |
| `src/styles/` | Reusable styling classes |
| `src/palettes/` | Color identities |
| `src/profiles/` | Contextual design configurations |
| `src/effects/` | Shared visual effects library |
| `src/preferences/` | Environmental and accessibility adaptations |
| `dist/` | Generated distributions |
| `tests/` | Automated verification |
| `examples/` | Demonstrations |
| `docs/` | Architecture and developer documentation |
| `tools/` | Build and validation tooling |

- Maintain repository-level README.md and a LICENSE file; this directory decision does not select licensing terms.
- Preserve the five-layer cascade architecture approved in ARC-007 and LYR-001 through LYR-005; source directories do not establish cascade priority.
- Preserve a single maintained native CSS source with generated global, scoped and modular distributions under ARC-005, ARC-006 and ARC-010.
- Create directories, subdirectories and files only when required. Avoid empty scaffolding, redundant implementations and unnecessary organizational complexity.
- Preserve discoverability and clear responsibilities for human developers and coding agents.

The directory names and responsibilities are approved. Exact source filenames, internal organization, build tooling, distribution filenames and packaging contracts remain open. No source directories or production CSS are created by this documentation decision.

### ARC-012 — Standard and comprehensive distributions with optional extensions

Status: approved — Option C, 2026-11-24.

Generate ready-to-use standard and comprehensive CSS distributions for both global and scoped adoption from the same maintained native CSS source.

| Approved distribution filename | Responsibility |
| --- | --- |
| `dist/uibms.css` | Standard global framework |
| `dist/uibms.min.css` | Minified standard global framework |
| `dist/uibms.full.css` | Comprehensive global framework including official extensions |
| `dist/uibms.full.min.css` | Minified comprehensive global framework |
| `dist/uibms.scoped.css` | Standard scoped framework |
| `dist/uibms.scoped.min.css` | Minified standard scoped framework |
| `dist/uibms.scoped.full.css` | Comprehensive scoped framework including official extensions |
| `dist/uibms.scoped.full.min.css` | Minified comprehensive scoped framework |

Approved extension directories are `dist/extensions/palettes/`, `dist/extensions/profiles/` and `dist/extensions/effects/`.

- The standard distribution must provide a complete default experience through a single stylesheet without requiring a consumer build process, JavaScript or external dependencies.
- Additional official palettes, profiles and effects may be independently loaded as extensions; the comprehensive distribution incorporates all official extensions.
- Extensions must support the corresponding adoption mode, including scoped installations, without inadvertently styling the surrounding document.
- Minified distributions must preserve the behavior of their corresponding unminified distributions.
- Preserve the approved native source architecture, cascade-layer ordering, contextual configuration, applicable AAA accessibility defaults and automated generation.

The eight distribution filenames and extension directory structure are approved. Exact extension filenames, scope marker, generation tooling, dependency resolution, compatibility checks and implementation remain open. No production distribution files are created by this documentation decision.

## Open architectural decisions

1. Remaining framework responsibility boundaries and detailed styling rules, following approved ARC-001 (native HTML-first with optional scoped adoption), ARC-002 (comprehensive, context-aware native HTML styling) ARC-003 (strict separation of classes and data attributes with contextual configuration) CLS-001 (intent-oriented reusable classes) CLS-002 (intrinsic layout patterns) CLS-003 (foundational public class catalog) ARC-010 (global by default with optional scoped distribution) ARC-011 (responsibility-based modular source structure) and ARC-012 (standard and comprehensive distributions with optional extensions).
2. CSS architecture, layer structure, distribution packaging and extension mechanisms, following approved ARC-004 (native cascade layers and deliberately low specificity) ARC-005 (default distribution with modular extensions and a comprehensive distribution) ARC-006 (native CSS source with automated distribution generation, validation and minification) and ARC-007 (responsibility-based cascade layers) LYR-001 (minimal native reset layer) LYR-002 (unified defaults layer) LYR-003 (unified configuration layer) LYR-004 (unified features layer) and LYR-005 (hybrid preferences layer; five-layer responsibility and precedence architecture approved, exact identifiers and implementation open).
3. Detailed public identifiers and interface contracts, following approved ARC-008 (natural, unprefixed naming) and ARC-009 (natural, descriptive, native CSS-aligned naming grammar).
4. Detailed token inventory, relationships, context resolution and implementation, following approved TOK-001 (organic, relationship-based token architecture) TOK-002 (context-aware token resolution) TOK-003 (meaningful custom property registration) TOK-004 (foundational tokens with organic expansion) TOK-005 (intelligent hybrid color system) TOK-006 (independent themes and coordinated palettes) TOK-007 (neutral foundation with configurable accent identity) TOK-008 (intrinsic and computational typography) TOK-009 (intrinsic and context-aware spacing) TOK-010 (context-aware geometry with configurable identity) TOK-011 (context-aware surface and depth system) and TOK-012 (context-aware motion language).
5. Detailed native HTML styling and interaction states, following approved HTM-001 (comprehensive, context-aware native HTML styling) HTM-002 (semantic and context-aware interaction states) and HTM-003 (progressive native form control customization).
6. Detailed data attribute inventory, configuration, inheritance and composition, following approved DAT-001 (independent contextual and individual feature attributes) DAT-002 (selective inheritance with explicit restoration) DAT-003 (composable individual features and interaction contexts) DAT-004 (composable effect channels and predictable conflict resolution) DAT-005 (explicit control over default and individual effects) DAT-006 (purpose-driven foundational public attribute catalog) DAT-007 (shared attribute vocabulary and context-specific applicability) DAT-008 (environment-first color scheme configuration) DAT-009 (natural default palette and optional palette extensions) DAT-010 (original UIBMS effects profile with optional alternatives) DAT-011 (essential density, geometry and typography profiles) and DAT-012 (shared effect library with context-specific applicability).
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
