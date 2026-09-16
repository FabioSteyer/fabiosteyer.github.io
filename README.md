# fabiosteyer.github.io

Fabio Steyer's bilingual portfolio. Live at https://fabiosteyer.github.io/.

The site links claims to source code, measured results and explicit limitations.
The two browser examples use synthetic data. They illustrate project logic;
they do not run the Python repositories or process uploaded documents.

## Architecture

- Astro 7 static output, Tailwind 4 on the profile/legal pages.
- One shared homepage component with German and English content.
- Local Newsreader, Karla and JetBrains Mono font files.
- Small local interaction module, optional GSAP/ScrollTrigger animation bundle.
- No backend, tracking, cookies, remote fonts or third-party runtime requests.
- Intentional `noindex, nofollow` on every page.
- Eight content pages and four redirects preserving the old project/contact URLs.
- Ordinary scrolling, keyboard controls, native details, reduced-motion support.
- If JavaScript is blocked, content and illustrative results remain readable.

## Development and verification

Node.js >=22.12.0.

```powershell
npm ci
npm run check       # Astro and TypeScript diagnostics
npm test            # production build + 9 Node tests
npm run dev -- --background
npm run preview     # production build at localhost:4321
npm run preview:no-js # same build, scripts blocked by CSP, localhost:4322
```

The no-JavaScript preview binds to localhost only. Stop it with Ctrl+C.
See `docs/verification-2026-09-16.md` for the actual review evidence.
Historical Lighthouse scores describe earlier builds, not the current one.

Deployment uses the manually triggered GitHub Actions workflow.
A push alone does not publish. See `DEPLOY.md`.

## Content and evidence

`src/data/portfolio.ts` holds homepage copy. `src/data/projects.ts` holds
case studies, measured results and limits. The browser illustrations use
`src/lib/demo-model.mjs`, tested independently of animation.

The 38 tests stated on the website belong to the two Python repositories.
They do not include this website's own tests. The simplified four-write
illustration is explicitly distinct from the documented 20-write comparison.

## AI assistance and licensing

This site was built with AI assistance. Requirements, content, evidence levels
and review remain my responsibility.

No licence is granted for the site's original code or content. The code is
public for inspection. Third-party dependencies and fonts retain their own
licences. GSAP's copyright and licence notices are preserved in the production
bundle, with a regression test guarding against removal by the minifier.
