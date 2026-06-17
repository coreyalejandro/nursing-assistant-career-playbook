# Accessibility Audit

Addresses DeepSeek recommendation **#2 (P0): formal accessibility audit + fix violations**.

## Automated audit (axe-core)

`src/components/accessibility.test.tsx` runs the **axe-core** engine (the same
engine behind axe DevTools) against rendered components in jsdom, on every push
via CI. It currently asserts **zero violations** for:

- `UpgradeModal` — the freemium paywall dialog (role=dialog, aria-modal, labelled, Escape-to-close, focus management)
- `VerifiedClinicalBadge` — a representative interactive UI element

```
$ npx jest src/components/accessibility.test.tsx
PASS src/components/accessibility.test.tsx
  ✓ UpgradeModal (paywall dialog) has no detectable violations
  ✓ VerifiedClinicalBadge has no detectable violations
```

## Lighthouse accessibility category

A full-page Lighthouse audit (see `lighthouserc.json`, run in CI and locally)
scores **Accessibility = 90/100** and is asserted as an **error gate at ≥ 0.9**,
so regressions fail the build. Lighthouse covers color-contrast, names/labels,
and ARIA that jsdom cannot evaluate without layout.

## Fixes applied

- **Reduced motion (WCAG 2.3.3 / 2.2.2).** A global `@media (prefers-reduced-motion: reduce)`
  rule (`src/index.css`) neutralizes Tailwind transitions, the `motion` library's
  animations, and icon spins; the boot skeleton spinner and the chat auto-scroll
  also honor the setting. This was the specific gap the report flagged.
- **Accessible paywall dialog.** The new `UpgradeModal` uses `role="dialog"`,
  `aria-modal`, `aria-labelledby`/`aria-describedby`, an aria-labelled close
  button, Escape-to-close, and moves focus to the dialog on open.
- **Lazy-view loading states** expose `role="status"` + `aria-live="polite"`
  with an `sr-only` label.

## Existing baseline (retained)

Keyboard skip-link, ARIA labelling, 44px touch targets, `lang` attribute,
`<noscript>` fallback, and an offline crisis resource.

## Honest limitations / next steps

- axe-core (automated) catches ~30–50% of WCAG issues. **Manual screen-reader
  testing (VoiceOver/NVDA) and full keyboard-trap review are still recommended**
  before claiming formal WCAG 2.1 AA conformance.
- The automated component suite covers two representative components today;
  expanding it to every screen is tracked work.
