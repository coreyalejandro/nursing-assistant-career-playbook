# Performance Audit

Addresses DeepSeek recommendation **#3 (P1): measure Core Web Vitals + optimize LCP/CLS**.

## Measured (Lighthouse, simulated mobile / slow-4G throttling)

Run via `lighthouserc.json` against the built static app, both locally
(Lighthouse 1x, Chromium) and in CI on every push.

| Metric | Baseline | After optimization | Target |
|---|---|---|---|
| Performance score | 68 | **85** | ≥ 80 (warn) |
| Accessibility score | — | **90** | ≥ 90 (error) |
| Best-practices score | — | **93** | ≥ 90 (warn) |
| Largest Contentful Paint | 3084 ms | **2589 ms** | < 2500 ms |
| Cumulative Layout Shift | 0.476 | **0.225** | < 0.1 |
| Total Blocking Time | — | **66 ms** | < 300 ms |

Initial JS entry chunk (build output): **286 kB → 28 kB** (69 kB → 10 kB gzip).

## Optimizations applied

- **Route-based code splitting** (`src/App.tsx`): the heavy secondary views
  (Playbook ~37 kB gz, Résumé ~10 kB gz, Audit ~8 kB gz) and the on-demand chat
  + feedback widgets load as their own chunks. The **landing view is eager** so
  first paint is stable (no fallback→content shift).
- **Fonts**: moved from a render-blocking CSS `@import` to `<link rel="preconnect">`
  + stylesheet in `index.html` (faster LCP).
- **Boot skeleton** aligned to the real nav height (64 px) and the app
  background (`#efedea`) to minimize mount-time shift.
- **Chunk budget** lowered from 1000 kB → 600 kB so regressions warn early.
- **Lighthouse CI** (`lighthouserc.json` + `.github/workflows/ci.yml`) asserts
  LCP/CLS/accessibility budgets on every push.

## Honest status & next step

Performance (85), accessibility (90), best-practices (93), TBT (66 ms) meet
their budgets, and **LCP (2.59 s) is essentially at the 2.5 s target**.

**CLS is 0.225 — improved 53% from 0.476, but still above the 0.1 target.** The
residual shift is intrinsic to the client-side render of the data-rich Home
dashboard (content that sizes after first paint), not fonts (the `font-display`
audit passes) and not the boot skeleton (minimizing it did not move the number).
Closing CLS to < 0.1 requires **prerendering / static generation (SSG) of the
landing view** so its first paint is final — tracked as the next performance
task. We report the real measured number rather than assert a target we have
not yet hit.
