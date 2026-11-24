# UIBMS CSS — Architecture and decision register

Last updated: 2026-11-24

## Project status

Architecture and specification phase. No CSS implementation is authorized by this record. Read this document before continuing in a new development session. The approved decisions below are the current baseline; proposed and open items are not requirements.

## Established direction

- Native CSS and semantic HTML first. Enhance native capabilities rather than invent a parallel CSS language.
- Build our own minimal, non-destructive reset. Its exact rules remain open.
- Minimal by default; avoid unnecessary selectors, duplicated rules and unused features. No imposed numerical size budget or mandatory design conventions.
- No mandatory JavaScript for the CSS foundation, no required third-party framework, and no technical dependency on WordPress or other UIBMS products.
- RevaCSS may inform the design; its architecture and code are not automatically adopted.
- Design presets are optional. Developers retain normal native CSS customization freedom.
- The framework should support independent use as well as integration with UIBMS Theme, UIBMS Blocks, Gutenberg Animation Studio and UIBMS applications. Third-party CSS and WordPress global styles must be respected.

## Foundational review — proposed roadmap (2026-11-24)

The user requested a return to first principles before continuing detailed data-attribute decisions. Review the conceptual layers first, then philosophy and technical foundations. This is a change in discussion order, not a reversal of any approved decision. Existing approvals remain the baseline unless explicitly superseded. No implementation is authorized.

### Proposed identity

UIBMS CSS is a native-first, semantic, context-aware CSS framework providing an intelligent and adaptable design foundation without restricting developers' creative or technical freedom. This wording is a proposal.

### Layer review — current priority (proposed)

At the user's request, challenge each of the seven conceptual layers before finalizing PHI and TECH decisions. For each layer, assess necessity, exclusive responsibility, exclusions, reliance on native functionality, and complexity. Layers may be removed, merged, renamed or reordered; these are not approved modules, file boundaries, or CSS cascade layers.

| ID | Candidate layer | Status |
| --- | --- | --- |
| LYR-001 | Native HTML & CSS | Approved — Option B; external platform |
| LYR-002 | CSS reset | Current discussion |
| LYR-003 | Semantic foundation | Pending |
| LYR-004 | Design foundation | Pending |
| LYR-005 | Contextual design | Pending |
| LYR-006 | Presentation patterns | Pending |
| LYR-007 | Optional extensions | Pending |

**LYR-001 outcome:** Approved Option B. Native HTML and CSS are the external browser platform, not an internal distributed framework layer. See the approved decision below.

**LYR-002 — CSS reset (open):** Review whether the reset should be absent, minimal and non-destructive, or comprehensive and stripping browser defaults. Proposed direction: a standalone minimal reset/normalization responsibility, separate from semantic styling and visual design. Preserve useful native semantics, behavior and accessibility; avoid universal removal of margins, borders, outlines or control appearance. Evaluate each proposed declaration against a concrete problem and compatibility implications. Exact rules, scoping, distribution and cascade ordering remain open. No LYR-002 option is approved yet.

### Philosophical decisions (all pending review)

| ID | Topic | Proposed direction |
| --- | --- | --- |
| PHI-001 | Purpose and scope | Simplify web design rather than replace CSS; determine the boundary between foundation, design system and component library. |
| PHI-002 | Native first | Prefer native browser functionality over unnecessary abstractions. |
| PHI-003 | Semantic first | Respect HTML semantics and document structure. |
| PHI-004 | Developer freedom | No mandatory markup, classes or design conventions. |
| PHI-005 | Minimalism | Add functionality for demonstrated value rather than feature count. |
| PHI-006 | Intelligent defaults | Handle predictable styling needs automatically. |
| PHI-007 | Accessibility | Accessible defaults as a fundamental responsibility. |
| PHI-008 | Adaptability | Separate structure from visual identity. |
| PHI-009 | Predictability | Clear responsibilities and consistent behavior. |
| PHI-010 | Independence | No mandatory JavaScript, CMS or external framework dependency. |
| PHI-011 | Extensibility | Custom palettes, presets and styles. |
| PHI-012 | Non-interference | Respect existing styles and third-party environments. |
| PHI-013 | Performance | Avoid unnecessary CSS, processing and duplication by design, without imposed numerical size limits. |
| PHI-014 | Maintainability | Prefer understandable and maintainable architecture. |
| PHI-015 | Evolution | Modern CSS, progressive enhancement and an explicit compatibility policy. |

### Technical foundation decisions (proposed, not approved)

| ID | Topic |
| --- | --- |
| TECH-001 | Browser compatibility and progressive enhancement |
| TECH-002 | Reset and normalization |
| TECH-003 | Native semantic element defaults |
| TECH-004 | Cascade, selector specificity, scoping and ownership |
| TECH-005 | Custom properties and design-token architecture |
| TECH-006 | Color system, semantic roles, schemes and automatic foreground contrast |
| TECH-007 | Typography |
| TECH-008 | Native units, sizing and spacing |
| TECH-009 | Layout, responsiveness and containers |
| TECH-010 | Surfaces, borders, corners, decorations and elevation |
| TECH-011 | Design contexts, presets, inheritance and data attributes (resume DATA register) |
| TECH-012 | Interaction, state, forms and motion |
| TECH-013 | Accessibility and internationalization |
| TECH-014 | Modularity, interoperability, delivery and build tooling |
| TECH-015 | Testing, documentation, API stability and versioning |

The technical IDs are discussion groupings, not replacements for DATA IDs or the previously proposed CSS-001 color architecture choice. Resolve overlapping questions once and cross-reference their eventual approved decisions. Technical decisions may be reordered where prerequisites require it.

### PHI-001 — paused until layer review

Options to evaluate: A — reset and semantic CSS foundation only; B — adaptive semantic foundation and optional contextual design system with reusable presentation patterns; C — comprehensive UI component framework. B is the proposed direction, not approved. A small core should be distinguished from optional extensions, with no assumption that a full component catalogue is part of the initial framework.

## Approved decisions

### LYR-001 — Native platform and intelligent enhancement

**Status:** Approved (2026-11-24), Option B.

**Decision:** Native HTML, CSS and browser behavior constitute the external platform on which UIBMS CSS operates, not an internal framework layer. Prefer native functionality over custom implementations. Introduce framework abstractions only where they solve recurring problems or deliver meaningful reusable value. Developers retain unrestricted access to native CSS. Enhance browser capabilities rather than replace them.

**Rationale:** Preserve semantic structure, native behavior, accessibility, interoperability and minimalism. Avoid parallel styling languages, unnecessary wrappers, mandatory JavaScript for styling, and duplicating individual CSS properties without added value.

**Boundaries:** This approval establishes the platform boundary and native-first philosophy. It does not approve specific classes, selectors, reset rules, browser support targets, compatibility fallbacks, distribution boundaries or CSS cascade layers. The six remaining candidate framework responsibilities are subject to layer review; retain LYR identifiers for continuity.

### DATA-001 — Separate design context and reusable presentation

**Status:** Approved (2026-11-24).

**Decision:** HTML elements express meaning and structure. Native HTML attributes express native behavior and accessibility. Data attributes may establish a design context, whether document-wide or nested. Classes express reusable presentation and layout patterns. CSS custom properties carry configurable values. Native CSS remains available for direct customization.

**Rationale:** Context and presentation have different responsibilities, rather than merely different scope. A design context can change without rewriting the markup or presentation classes. A nested context may differ from its surrounding document. Avoid duplicating the same styling operation in both a class and a data attribute. Preserve native semantics and avoid custom attributes for individual CSS property values.

**Boundaries:** A global design context affects elements that are designed to consume it, not indiscriminately every element. No mandatory context attributes or classes. The exact attribute names, CSS variable contracts, context inheritance and precedence are not yet approved. Application-specific state and behavior attributes are not automatically part of the CSS framework.

### DATA-002 — Functional attribute prefix

**Status:** Approved (2026-11-24), Option E.

**Decision:** Public UIBMS CSS design-context attributes use the `data-ui-<dimension>` naming convention, for example `data-ui-theme` and `data-ui-palette`. The `ui-` prefix identifies the functional design-context namespace without embedding the UIBMS brand in HTML. Use one canonical convention; do not provide equivalent generic, `data-uibms-*`, or `data-*-ui` aliases.

**Rationale:** Concise, readable markup with related attributes grouped under a common prefix, easier discovery and editor tooling, and reduced collision risk compared with unprefixed generic names.

**Trade-offs:** `ui` is not an exclusive namespace; third-party attributes can still collide. Integration and isolation policies remain open. Namespacing of CSS custom properties and classes is a separate decision. The prefix is reserved by UIBMS CSS for meaningful design contexts, not individual CSS property utilities or arbitrary application state. Specific dimensions, supported values, inheritance and implementation remain subject to subsequent decisions.

## Open decision register — data attributes

Review one decision at a time. Record the selected option, rationale, implications and any superseded decision after explicit approval. Do not implement unapproved proposals. IDs below are a proposed working sequence, not design approvals.

| ID | Topic | Status |
| --- | --- | --- |
| DATA-002 | Attribute naming and namespace | Approved — Option E |
| DATA-003 | Design-context scope and inheritance | Open — paused for foundational review |
| DATA-004 | Palette selection and color scheme separation | Open |
| DATA-005 | Complete design presets versus independent dimensions | Open |
| DATA-006 | Corner geometry | Open |
| DATA-007 | Surface decoration and effects | Open |
| DATA-008 | Density and typography context | Open |
| DATA-009 | Motion preferences and accessibility | Open |
| DATA-010 | Cascade, variable ownership and override precedence | Open |
| DATA-011 | Defaults, unknown values and opt-in loading | Open |
| DATA-012 | Custom extensions, third-party interoperability and compatibility | Open |

Candidate dimensions (expressed using the approved prefix): `data-ui-palette`, `data-ui-theme`, `data-ui-style`, `data-ui-corners`, `data-ui-decoration`, `data-ui-density`, `data-ui-typography`, `data-ui-motion`. The prefix is approved; the individual attributes and supported values remain illustrative. In particular, the proposed `data-ui-palette` selects an entire coordinated palette, not an individual CSS color. Its inclusion in the public API remains open.

### DATA-003 / DATA-004 — Automatic foreground contrast (approved requirement; implementation open)

**Approved requirement (2026-11-24):** Automatic readable foreground adaptation is a default capability of UIBMS CSS for framework-managed backgrounds, including inherited light/dark design contexts and local surfaces that differ from their surrounding context. A local background change must not require switching the entire design context. Do not introduce `data-ui-contrast` or any equivalent opt-in data attribute for this capability. No mandatory class, configuration switch or JavaScript is required to activate it. Developers retain native CSS override freedom.

Candidate implementation: paired semantic foreground/background tokens for known surfaces and progressive enhancement with native `contrast-color()` for explicitly configured solid backgrounds, with readable fallbacks. CSS cannot automatically derive foregrounds from arbitrary rendered backgrounds, images, gradients or translucent compositions; these cases require appropriate authored foreground/background pairs or other explicit design treatment. Links, muted text, icons, focus states and other contrast-sensitive roles also require consideration. Evaluate browser compatibility and accessibility during the color-system decisions. The implementation, token names and inheritance option remain open.

## Remaining foundation topics

After the data-attribute decisions, review the reset, semantic element defaults, color architecture and accessible color roles, typography, measurement and spacing, layout and responsiveness, surfaces, interaction, motion, accessibility, internationalization, CSS organization, modularity and integrations. The earlier color architecture choice (CSS-001: predefined palette vs semantic roles vs hybrid vs completely native) has not yet been approved.

## Handover

- Repository: `UIBMS/UIBMSCSS`, default branch `main`.
- Current milestone: architecture discussion, not implementation.
- Latest approved decision: LYR-001 (Option B). Earlier DATA-001 and DATA-002 (Option E) remain approved.
- Approved cross-cutting requirement: automatic foreground contrast by default, without an opt-in data attribute (DATA-003 / DATA-004).
- Next discussion: LYR-002, CSS reset. Resume PHI-001 after the layer review; resume DATA-003 at the appropriate technical stage.
- Before changing any approved architectural direction, identify the existing decision and record an explicit superseding decision.
- Keep this register current with approvals; do not treat discussion examples as accepted API contracts.
