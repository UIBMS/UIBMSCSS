# UIBMS CSS — Architecture and foundational principles

Status: foundational direction established; detailed architecture not yet approved.
Baseline date: 2026-11-24.

This document records the current, ground-up design direction. Earlier superseded CSS architecture discussions are not an active specification. Only the requirements in the Established principles section are adopted as foundational direction; proposals and open questions do not authorize implementation.

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

## Open architectural decisions

1. Framework responsibilities and default styling scope, including native HTML behavior and compatibility with existing projects.
2. CSS architecture, layering, delivery and extension mechanisms.
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
