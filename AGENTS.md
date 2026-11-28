# UIBMS CSS contributor instructions

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing any framework, engine, example or website code. The approved decisions are authoritative, especially CLS-004 and GEO-002.

## Required approach for every CSS change

- Native, semantic HTML first; reuse existing meaningful component classes and contextual nesting. Do not introduce custom HTML elements, redundant wrappers, child utility classes or geometry-specific data attributes.
- Use the existing design tokens and native CSS mathematics. Derive dependent dimensions from their shared geometric or typographic input instead of hardcoding several independent values. Compute at the owning component, prefer logical properties and intrinsic sizing, and use private local properties only for genuinely reused relationships.
- Keep mathematical geometry readable and bounded. Concentric radii apply only to shared inset corners; optical button correction is a single-line approximation. Preserve explicit developer overrides, accessible target sizes, focus, native control behavior, RTL, contextual profiles, responsive sizing and browser fallbacks. Keep independent design decisions independent. Do not add a new sizing or geometry runtime.
- Prefer CSS to JavaScript for appearance and layout. Optional JS may own dynamic data, accessibility behavior, interaction or genuinely necessary measured geometry.
- Change maintained source, not generated bundles by hand. Rebuild with the existing packager; keep the manifest synchronized. Reuse the documentation catalogue and Component Showcase instead of copying component implementations.
- Add meaningful regression tests for new relationships (including density, shape, typography, direction, scoped adoption and narrow containers). Run the repository validation workflow and inspect every job before merging. Distinguish confirmed checks from unverified devices or accessibility claims.

For detailed engineering contracts and rationale, see [GEO-002](docs/ARCHITECTURE.md#geo-002--mathematically-derived-contextual-geometry).
