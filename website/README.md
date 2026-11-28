# UIBMS CSS documentation website

Development documentation and standalone application demos. WEB-001 through WEB-004 record the initial implementation and local review, 25 November 2026.

The website is a separate Astro static project inside the UIBMSCSS repository, beside `src/`, `dist/`, `docs/`, and `tools/`. The website consumes the generated distributions and optional engines; its build does not rewrite the maintained framework source or distributions. The root GitHub Actions workflow builds and deploys the static documentation after GitHub Pages is configured to use GitHub Actions. Public documentation describes the development candidate; publishing it is not an official framework release.

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

- `src/content/catalog.mjs`: single structured content/navigation catalogue; reference routes, group counts, examples, navigation and demo links are derived from this data rather than maintained as fixed numbers. Each section provides trusted authored descriptions and code; rendered HTML examples are derived from the same source string.
- The `/components/` route is generated from every inline live documentation example, grouped by the existing reference catalogue. It uses the same preview/source renderer and controllers, deduplicates declared stylesheet dependencies, and links back to full references. The scoped-adoption comparison remains on its own reference page. On this long page, optional physical material rendering is limited to previews near the viewport, focused previews and open overlays; native HTML, CSS profiles and form state remain available throughout. The site uses the existing material engine filter and releases offscreen decorations. Catalogue checks reject cross-example ID and radio-group conflicts; no new framework classes or copied component definitions are needed.
- `src/content/demos.mjs`: registry and native markup for independent full-page application demos. Each declares its optional stylesheets and its own entry point; no documentation shell or iframe is used.
- `src/lib/config.mjs`: shared profile definitions (seven core contextual profiles plus experimental material), their values and defaults. The documentation header and standalone app appearance controls share this configuration and saved appearance preferences. The `default` palette alias is documented; the menu presents Natural as its equivalent canonical choice.
- `src/lib/code.mjs`: a single read-only code renderer with genuine Prism.js 1.30.0 build-time highlighting, line numbers, exact-source copying, and no editor or client-side highlighting runtime. The Prism token classes belong to the website, not UIBMS CSS.
- `src/lib/render.mjs`: shared page-shell and documentation rendering functions used by Astro and the offline review helper. The generated route and layout under `src/pages/` and `src/layouts/` are the Astro entry points. This uses a structured JS catalog instead of MDX and native browser JavaScript instead of TypeScript to avoid extra tooling and keep static review reproducible. No additional frontend/UI framework is used.
- `public/assets/site.css`: website-only chrome, documentation layout, and Prism token styling. Uses the existing CSS tokens, website IDs and `data-site-*` hooks; it does not extend the public framework. The provisional Bordeaux wordmark and demonstration media are website assets, not an approved new brand identity.
- `public/assets/site.js`: documentation behavior only: appearance persistence, navigation, search, copy, and local demo wiring. Code is always read-only.
- `public/assets/engines.js` and `appearance-engines.js`: load optional browser adapters only for relevant markup, missing native capabilities or explicit material opt-in. The core framework needs no JavaScript.
- `public/assets/admin-demo.css` and `admin-demo.js`: application-specific presentation and behavior for the full-page admin demo, using framework tokens, native control state and reusable optional components.
- `tools/stage-assets.mjs`: checks every CSS file against the repository distribution manifest before copying it into generated `public/framework/`. The source of truth is `../dist/`. The staging script never writes to the framework. Generated copies are ignored by Git.
- `tools/preview.mjs`: optional offline review generator using the exact same catalog, shared render functions, Prism library and distribution assets. It is not an Astro build and is not a release mechanism. Run `npm run preview:offline`, then `python -m http.server 8080 --bind 127.0.0.1 --directory preview-output`.
- `tests/content.mjs` and `tests/semantic.mjs`: content, preferred native markup, optional asset coverage, local control relationships and displayed-source consistency assertions. `tools/check-build.mjs` also validates actual generated routes. `tests/review.py`: local HTTP browser/link tests, with an explicitly marked inline fixture mode for restricted environments. `review/`: verification records and limitations.

The core API inventory is read from the generated stylesheets and manifest. Optional component classes and the experimental material setting remain separate from the core. Prefer native elements, meaningful component/layout classes, contextual low-specificity CSS nesting and independent appearance attributes. Legacy child classes remain compatible but should not be required by new examples. Website-only styling stays inside the documentation or the independent app. Native examples use the actual full bundle. The only iframe is the isolated scoped-adoption comparison, not a standalone application. Explicit local configuration examples do not change the sitewide appearance.

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

During the initial offline review, the environment could not resolve npm or GitHub through shell networking, and Chromium policy blocked localhost HTTP navigation. The site was generated with installed genuine Prism.js 1.30.0 and Node.js, not Astro itself. Astro installation, lockfile generation, production build and real-origin browser persistence/clipboard/asset serving remain unverified. Review browser checks used actual generated HTML/CSS/JS embedded into Chromium, with mocked storage/clipboard. Firefox/Safari, assistive technology, and full accessibility testing remain pending. See `review/SUMMARY.md`. The repository owner has authorized public documentation deployment. No official versioned framework release or comprehensive browser/accessibility certification is implied. The contextual-refactoring distributions have been regenerated and the core Chromium release and responsive-table suites rerun. The full Astro build, generated-site material/application integration and cross-browser suites remain independent pre-merge gates. See [the refactoring verification record](../docs/VERIFICATION.md); previous website review results are historical evidence, not certification of the new source.

## GitHub Pages

In repository Settings > Pages select GitHub Actions. Run the **Deploy UIBMS CSS Website** workflow from the default branch. The workflow validates the content, installs dependencies, builds with Astro, checks static output, then uploads and deploys the Pages artifact. The website uses `/UIBMSCSS/` as its base. Initial dependency installation uses npm install when no lockfile exists; commit a verified lockfile for subsequent reproducible installs.
