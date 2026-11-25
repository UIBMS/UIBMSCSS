# UIBMS CSS documentation website

WEB-001 through WEB-004 — implementation and local review, 25 November 2026.

The website is a separate Astro static project. Add this `website/` directory to the existing UIBMSCSS checkout beside `src/`, `dist/`, `docs/`, and `tools/`. Do not replace those directories. No files outside `website/` are modified by this package. The root GitHub Actions workflow builds and deploys the static documentation after GitHub Pages is configured to use GitHub Actions. Public documentation describes the development candidate; publishing it is not an official framework release.

## Run locally

Requires Node.js 22.12+ and npm access. From the repository root:

```bash
cd website
npm install
npm run dev
```

Open the local URL printed by Astro. To build and preview:

```bash
npm run build
npm run preview
```

To test project-page paths without deployment (PowerShell):

```powershell
$env:SITE_BASE = '/UIBMSCSS/'
npm run build
npm run preview
```

On Bash, use `SITE_BASE=/UIBMSCSS/ npm run build`. The base defaults to `/`. The site includes a `noindex, nofollow` meta tag during local review. Set `SITE_PUBLIC=1` for the public build. A production build is not itself deployment.

## Structure and consistency

- `src/content/catalog.mjs`: single structured content/navigation catalog, 9 documentation groups and 68 routes (64 reference pages, homepage, examples, laboratory, downloads). Each section provides trusted authored descriptions and code; rendered HTML examples are derived from the same source string.
- `src/lib/config.mjs`: six contextual profiles and their values; the header is the only sitewide settings UI. The `default` palette alias is documented; the menu presents Natural as its equivalent canonical choice.
- `src/lib/code.mjs`: a single read-only code renderer with genuine Prism.js 1.30.0 build-time highlighting, line numbers, exact-source copying, and no editor or client-side highlighting runtime. The Prism token classes belong to the website, not UIBMS CSS.
- `src/lib/render.mjs`: shared page-shell and documentation rendering functions used by Astro and the offline review helper. The generated route and layout under `src/pages/` and `src/layouts/` are the Astro entry points. This uses a structured JS catalog instead of MDX and native browser JavaScript instead of TypeScript to avoid extra tooling and keep static review reproducible. No additional frontend/UI framework is used.
- `public/assets/site.css`: website-only chrome, documentation layout, and Prism token styling. Uses the existing CSS tokens, website IDs and `data-site-*` hooks; it does not extend the public framework. The provisional Bordeaux wordmark and demonstration media are website assets, not an approved new brand identity.
- `public/assets/site.js`: centralized appearance persistence, collapsible/active navigation, search, copy, and demonstration event wiring. The only editable controls are functional native UI demos and the appearance settings; code is always read-only.
- `tools/stage-assets.mjs`: checks every CSS file against the repository distribution manifest before copying it into generated `public/framework/`. The source of truth is `../dist/`. The staging script never writes to the framework. Generated copies are ignored by Git.
- `tools/preview.mjs`: optional offline review generator using the exact same catalog, shared render functions, Prism library and distribution assets. It is not an Astro build and is not a release mechanism. Run `npm run preview:offline`, then `python -m http.server 8080 --bind 127.0.0.1 --directory preview-output`.
- `tests/content.mjs`: content and API consistency assertions. `tests/review.py`: local HTTP browser/link tests, with an explicitly marked inline fixture mode for restricted environments. `review/`: verification records and limitations.

The public API remains exactly the existing 13 framework classes, six configuration and seven individual-effect attributes, plus the scoped adoption marker. Website-only styling is narrowly scoped to the documentation interface. Native examples use the actual full bundle, and scoped adoption is demonstrated in a separate iframe. Explicit local configuration examples do not change the sitewide appearance.

## Verification commands

```bash
npm run check:content
npm run preview:offline
python -m pip install beautifulsoup4 playwright
python -m playwright install chromium
python tests/review.py --phase static
python tests/review.py --phase reflow
python tests/review.py --phase interactions
```

For GitHub project path testing, generate with `SITE_BASE=/UIBMSCSS/` and pass `--base /UIBMSCSS/` to the review script. HTTP mode tests the review output on localhost. To test the actual Astro output, build first, serve `dist/` with Astro preview and perform the corresponding smoke checks; the supplied automated review script targets the review output, not `astro build`.

## Release gate

The offline environment could not resolve npm or GitHub through shell networking, and Chromium policy blocked localhost HTTP navigation. The site was generated with installed genuine Prism.js 1.30.0 and Node.js, not Astro itself. Astro installation, lockfile generation, production build and real-origin browser persistence/clipboard/asset serving remain unverified. Review browser checks used actual generated HTML/CSS/JS embedded into Chromium, with mocked storage/clipboard. Firefox/Safari, assistive technology, and full accessibility testing remain pending. See `review/SUMMARY.md`. The repository owner has authorized public documentation deployment. No official versioned framework release or comprehensive browser/accessibility certification is implied.

## GitHub Pages

In repository Settings > Pages select GitHub Actions. Run the **Deploy UIBMS CSS Website** workflow from the default branch. The workflow validates the content, installs dependencies, builds with Astro, checks static output, then uploads and deploys the Pages artifact. The website uses `/UIBMSCSS/` as its base. Initial dependency installation uses npm install when no lockfile exists; commit a verified lockfile for subsequent reproducible installs.
