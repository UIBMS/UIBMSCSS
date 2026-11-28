# UIBMS SVG CSS engine

Follow the root AGENTS.md and the CLS-004 and GEO-002 decisions in
docs/ARCHITECTURE.md. These instructions also cover the wordmark generator in
tools/icons and its examples in the SVG icons documentation.

- Keep the engine optional. HTML owns the control and the meaning of the content.
  Draw decorative wordmarks from a preset selected by `data-morph`. Keep real
  headings, labels, and status information in the HTML.
- Use existing native state or CSS timelines to drive motion. Wordmark generation
  runs at build time. Emit a CSS file and a sibling SVG frame atlas. Preserve
  plain HTML authoring, with no browser JavaScript, injected SVG, custom tags, or
  extra child classes for wordmarks.
- Generate committed examples with
  `node tools/icons/generate-wordmark.mjs UIBMS WORLD extensions/engines/icons/examples`.
  Change generator or glyph source before regenerating. The first release
  supports Latin A–Z, spaces, and hyphens. Reject unsupported input clearly.
- Preserve pen-stroke direction, stable geometry, and exact start and end poses.
  Pair corresponding strokes where possible. Introduce and withdraw unmatched
  strokes for words of different lengths rather than switching whole glyphs.
- Preserve the initial readable frame with reduced motion, effects set to none,
  or unavailable scroll timelines. Reuse the SVG icons catalogue and Showcase.
- Verify deterministic output, different-length words, invalid input, scroll
  reversal, reduced motion, and the built documentation before merging.
