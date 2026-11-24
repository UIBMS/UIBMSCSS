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

## Approved decisions

### DATA-001 — Separate design context and reusable presentation

**Status:** Approved (2026-11-24).

**Decision:** HTML elements express meaning and structure. Native HTML attributes express native behavior and accessibility. Data attributes may establish a design context, whether document-wide or nested. Classes express reusable presentation and layout patterns. CSS custom properties carry configurable values. Native CSS remains available for direct customization.

**Rationale:** Context and presentation have different responsibilities, rather than merely different scope. A design context can change without rewriting the markup or presentation classes. A nested context may differ from its surrounding document. Avoid duplicating the same styling operation in both a class and a data attribute. Preserve native semantics and avoid custom attributes for individual CSS property values.

**Boundaries:** A global design context affects elements that are designed to consume it, not indiscriminately every element. No mandatory context attributes or classes. The exact attribute names, CSS variable contracts, context inheritance and precedence are not yet approved. Application-specific state and behavior attributes are not automatically part of the CSS framework.

## Open decision register — data attributes

Review one decision at a time. Record the selected option, rationale, implications and any superseded decision after explicit approval. Do not implement unapproved proposals. IDs below are a proposed working sequence, not design approvals.

| ID | Topic | Status |
| --- | --- | --- |
| DATA-002 | Attribute naming and namespace | Next decision |
| DATA-003 | Design-context scope and inheritance | Open |
| DATA-004 | Palette selection and color scheme separation | Open |
| DATA-005 | Complete design presets versus independent dimensions | Open |
| DATA-006 | Corner geometry | Open |
| DATA-007 | Surface decoration and effects | Open |
| DATA-008 | Density and typography context | Open |
| DATA-009 | Motion preferences and accessibility | Open |
| DATA-010 | Cascade, variable ownership and override precedence | Open |
| DATA-011 | Defaults, unknown values and opt-in loading | Open |
| DATA-012 | Custom extensions, third-party interoperability and compatibility | Open |

Candidate attributes discussed: `data-palette`, `data-theme`, `data-style`, `data-corners`, `data-decoration`, `data-density`, `data-typography`, `data-motion`. These spellings and supported values are illustrative only. In particular, `data-palette` refers to selecting an entire coordinated palette, not specifying an individual CSS color. Whether it belongs in the public API and how it is named remain open.

## Remaining foundation topics

After the data-attribute decisions, review the reset, semantic element defaults, color architecture and accessible color roles, typography, measurement and spacing, layout and responsiveness, surfaces, interaction, motion, accessibility, internationalization, CSS organization, modularity and integrations. The earlier color architecture choice (CSS-001: predefined palette vs semantic roles vs hybrid vs completely native) has not yet been approved.

## Handover

- Repository: `UIBMS/UIBMSCSS`, default branch `main`.
- Current milestone: architecture discussion, not implementation.
- Latest approved decision: DATA-001.
- Next discussion: DATA-002, attribute naming and namespace.
- Before changing any approved architectural direction, identify the existing decision and record an explicit superseding decision.
- Keep this register current with approvals; do not treat discussion examples as accepted API contracts.
