# Verification: interactive portfolio, 16 September 2026

## Implemented

Shared bilingual homepage, compact introduction, synthetic invoice and write-schedule
examples, native case-study disclosures, locally bundled GSAP/ScrollTrigger, native
cross-document transitions, visible static defaults, and corrected factual metadata
and privacy descriptions. The green/copper/sage palette and local fonts are retained.

## Evidence

- Baseline production-artifact tests failed for unsupported timeline shorthand,
  outdated privacy statements and completed-master's metadata; they pass after the changes.
- Five model tests verify price difference, split delivery, unit normalization,
  overwritten stale snapshots and serialized writes with independent historical snapshots.
- Production copyright-notice test failed before configuring legal comment preservation
  and passes afterward. All nine Node tests pass.
- Astro check: 25 files, zero errors, warnings or hints.
- In-app Chromium browser: German and English invoice cases, both write modes,
  rapid mode switching, replay, keyboard operation, details, anchor navigation.
- Responsive checks at 320, 390, 768 and 1280 CSS pixels. A 320px contact-link
  overflow was found and corrected. Final document scroll width equals client width.
- German CTA bottom at approximately 633px in the 1280x720 viewport and 581px
  in the 390x844 viewport.
- Reduced-motion control removes reveal transforms and completes the running
  write sequence. System preference is also respected by JS and CSS.
- Exact production build served with CSP script-src 'none': all content remains
  visible, native details open by keyboard, inert JS-only controls stay hidden.
- Browser console: no application warnings or errors in the interactive preview.
- All DOM-declared resource URLs are same-origin; source review found no external
  runtime services, analytics, storage or requests.
- Independent read-only review found three issues, all fixed and re-reviewed:
  viewport-relative navigation observer margins, ScrollTrigger refresh after
  details toggles, and accessible saved-entry identities.

## Deliberate choices

- GSAP Flip was not needed: the examples change data, not layout positions.
  Native disclosure avoids a second animation lifecycle and keeps no-JS behavior.
- No smooth-scroll replacement, infinite loops, scroll capture or pinned text.
- Browser calculations are simplified illustrations, not live Python execution.
- No new Lighthouse score is claimed. Earlier scores belong to older builds.
- Real Firefox/Safari and assistive-technology testing remain separate checks.
  This is not a claim of complete WCAG conformance.

## Delivery

Source commit b655c59 was deployed successfully by GitHub Actions run
35052472911. All eight content pages and four redirects returned HTTP 200.
The live invoice unit-conversion case and coordinated write example were
checked again; the browser console was free of application warnings/errors.
Recovery build 1910e43 contains the same build files, committed as a normal
successor to c728466 without rewriting history. Pages remains workflow-based.

The workflow reports a maintenance warning about older action runtime targets;
both build and deployment succeeded. Updating those action versions is separate
maintenance, not a reason to change the Pages delivery mode.
