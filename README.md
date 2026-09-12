# fabiosteyer.github.io

Portfolio site of Fabio Steyer — German and English, six pages each.
Live at <https://fabiosteyer.github.io/>.

The site exists to link to things that can be checked: source code, a runnable
demo, tests and a measured result. It carries an evidence table that states, per
skill, how strong the evidence actually is — and says so plainly where the
evidence is only my own word.

## What the site is built from

| | |
|---|---|
| Framework | Astro 7, static output |
| Styling | Tailwind 4, design tokens in `src/styles/global.css` |
| Fonts | System fonts only — no `@font-face`, no font files, no external request |
| Client-side JavaScript | none — 0 `<script>` tags in the build |
| Third-party requests | none |
| Indexing | `noindex, nofollow` on every page, deliberately |

The evidence table and the German/English project copy share one source,
`src/data/projects.ts`, so the two language versions cannot drift apart.

## Measured, not claimed

Lighthouse 12.8.2, mobile, against the live URL:

```
Performance      100
Accessibility    100
Best Practices   100
SEO               60
```

SEO is capped by `is-crawlable` — the deliberate `noindex`. Without it the
score is 100. First Contentful Paint and Largest Contentful Paint 0.9 s, Total
Blocking Time 0 ms, Cumulative Layout Shift 0.

Two accessibility findings came out of that run and are fixed:

- `label-content-name-mismatch` — an `aria-label` added a day earlier to
  disambiguate repeated link texts did not contain the visible label as a
  substring. Speech-input users saying "click Repository ansehen" would not
  have hit the link. That is WCAG 2.5.3 *Label in Name*, level A. The fix was
  a label that starts with the visible text.
- `hreflang` — the alternate-language link was relative and had no
  self-reference. Now three absolute entries per page, including `x-default`.

A keyboard walkthrough before that removed `scroll-behavior: smooth`: the
viewport lagged roughly a second behind the focused element, measured with
`getBoundingClientRect` right after the key press and again 1.2 s later.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

Deployment does not run through the Actions workflow in `.github/workflows/`.
See `DEPLOY.md` for what is actually wired up and why.

## On AI assistance

This site was built with AI assistance. The requirements, the content, the
evidence levels and the checking of the result are mine. Where a measurement is
quoted here or on the site, it comes from an actual run, not from an estimate.

## Licence

No licence granted. The code is public so it can be read, not reused.
