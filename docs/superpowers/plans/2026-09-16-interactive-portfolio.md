# Interactive Portfolio Implementation Plan

> For agentic workers: use superpowers:executing-plans for the coupled page,
> motion and content changes; independent review follows implementation.

**Goal:** Make the existing portfolio memorable and explorable while preserving its visual identity.
**Architecture:** One shared Astro page, bilingual data, native HTML controls and locally bundled GSAP enhancement.
**Tech Stack:** Astro 7, TypeScript, CSS, GSAP, Node test runner.
**Spec:** ../specs/2026-09-16-interactive-portfolio.md

## Global constraints

Existing colors, fonts, URLs, noindex, factual limits and privacy boundaries remain.
Use synthetic examples only. No third-party requests. No infinite decorative motion.
Keep readable content when JavaScript fails; honor reduced motion and keyboard use.

## Task 1: Reproducible regression and page foundation

- [x] Add tests/site-build.test.mjs. Check the delivered CSS for unsupported
  combined animation/timeline shorthand; assert privacy text matches the new behavior.
- [x] Run node --test tests/site-build.test.mjs against the baseline build and record failures.
- [x] Move the shared page to src/components/Portfolio.astro and bilingual copy to
  src/data/portfolio.ts. Both index routes pass only lang to that component.
- [x] Replace onepager.css with responsive layout and visible default states.
  Integrate src/scripts/portfolio.ts for optional ScrollTrigger entrance/connector motion.

## Task 2: Interactive evidence

- [x] Add tests/demo-model.test.mjs for price mismatch, harmless split delivery
  and unit conversion; test both process schedules with concrete final entries.
- [x] Implement src/lib/demo-model.mjs exports invoiceCases, reconcile and
  writeTrace. reconcile returns expectedCents, actualCents, differenceCents.
  writeTrace returns ordered events plus final entries for an explicit schedule.
- [x] Implement InvoiceDemo.astro and ConcurrencyDemo.astro with real buttons,
  static final examples, localized labels and local result calculation.
- [x] Add ProjectCard.astro with native details. No Flip dependency is needed for this layout.
- [x] Run node --test tests/*.test.mjs after npm run build.

## Task 3: Content, motion and delivery verification

- [x] Update DE/EN descriptions, availability, case study decisions and technical
  privacy facts. Share measured project facts through src/data/projects.ts.
- [x] Add native cross-document transitions with reduced-motion fallback.
- [x] Run npm run build and tests. Review the complete diff independently.
- [x] Inspect production preview in the browser: language parity, all controls,
  responsive widths, keyboard focus, reduced motion, zero unexpected requests.
- [ ] Commit reviewed source, integrate only if main is clean and unchanged,
  publish through the existing manual workflow and verify the delivered result.
- [ ] Refresh the gh-pages recovery branch with a normal history-preserving commit and push.
- [ ] Record final changes and verification in the coordinated Vault project note.

## Progress

Baseline build passed on 16 September 2026. Original source is preserved at 389beb9.
Isolated worktree and branch: codex/interactive-portfolio.

Implementation and independent review are complete. Verification is recorded in
../../verification-2026-09-16.md. Delivery and the coordinated project-note update
follow after the final source commit. The existing recovery script force-pushes;
use a regular fast-forward build commit for this release instead.
