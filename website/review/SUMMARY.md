# Private review verification

- 68 generated routes; 64 documentation pages in 9 navigation groups.
- 102 rendered live examples (including the scoped iframe); 121 read-only Prism code blocks.
- The archive framework manifest is identical to the manifest on main at repository commit e3aa44f1060e436eaa767348e8d3deeb4565e735 (Git blob 9d7cf09284c9833f3b14fe60254c50cd3a84060f). All 48 files match the manifest SHA-256 and byte lengths.
- Node content/API checks: 782 assertions counted by the test, all passed.
- Static root checks: 6307/6307 passed (local routes/assets, fragment targets, IDs, code gutters, manifest integrity).
- Static project-base `/UIBMSCSS/` checks: 6307/6307 passed (same categories, separate path configuration).
- Chromium initialization and reflow: 340/340 passed (68 pages x initialization plus 4 widths: 320, 375, 768, 1440).
- Chromium targeted interaction checks: 29/29 passed (six settings, restore, mocked persistence and clipboard, search, keyboard dismissal, mobile navigation, native dialog/popover/validation/checkbox, scoped host comparison).

Browser tests use the inline fixture mode because local HTTP is blocked by administrator policy. Storage and clipboard are explicitly mocked; real-origin navigation, persistence, clipboard permissions, asset requests and Astro output are not verified. Static link checks verify files and routes, not a live HTTP server. Prism 1.30.0 is genuinely installed locally; Astro and lockfile could not be installed/generated due DNS/network restrictions. No final release, licensing decision, or comprehensive WCAG claim.

The test audit fixed a duplicate popover ID and a search Escape-key handling conflict. Screenshots were visually reviewed at desktop and mobile sizes. Website-only helpers do not change the framework API.
