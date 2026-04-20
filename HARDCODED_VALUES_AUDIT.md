# Hardcoded Values Audit

Snapshot of legacy hardcoded styles surviving in `src/`. This PR lands the design-system foundation (tokens, central map, DS primitives, lint rules). Each file below still carries violations that should be migrated in follow-up PRs — one file per PR so each diff can be visually reviewed.

**Totals at PR-time**: ~2,200+ violations across ~45 of 60 files.

## Legend

- 🔴 **High** — inline `style={{ color/bg/font }}`, hex literals, custom color constants.
- 🟠 **Medium** — named Tailwind hues (`bg-slate-500`), arbitrary `text-[Npx]`, `uppercase`.
- 🟡 **Low** — arbitrary `tracking-[Nem]`, arbitrary `w-[Npx]`/`h-[Npx]` for layout.

## Sequencing (recommended)

### 🔴 Critical — refactor first (highest density)

- [ ] `src/components/dashboard/spot-check-modal.tsx` — 28 inline styles, `PURPLE`/`CONF_STYLES` constants, 57 arbitrary sizes. Replace constants with `statusStyles`/`confidenceStyles`; migrate inline styles to classes.
- [ ] `src/app/dashboard/re-evaluation/triage/page.tsx` — 18 inline styles, rgba literals, `CONCERN_STYLES`/`STATUS_STYLES` constants at top of file.
- [ ] `src/app/dashboard/grading/workspace/page.tsx` — 11 inline styles, 71 arbitrary values.
- [ ] `src/components/re-evaluation/briefing-modal.tsx` — 9 inline styles, `FLAG_STYLES` constant, 45 arbitrary text sizes.

### 🔴 Custom color constants living inside component files

Move these into `src/lib/design-tokens.ts` (or delete in favor of existing keys):

- [ ] `src/components/evaluation/overview/assignment-table.tsx` — `DEPT_COLORS`, `DEPT_DOT` → use `CategoryBadge` / `categoryStyles`.
- [ ] `src/components/evaluation/artifact-sidebar.tsx` — `ARTIFACT_COLORS`, `ARTIFACT_BG` → use `artifactStyles`.
- [ ] `src/components/evaluation/manuscript-renderer.tsx` — criterion `c2`/`c3`/`c4` color map → expand `categoryStyles` or add a new `criterionStyles` export.
- [ ] `src/components/evaluation/feedback-summary-modal.tsx` — performance→color lookup → use `statusStyles`.
- [ ] `src/components/evaluation/feedback/internal-notes-panel.tsx` — `'Medical Leave'` hardcoded red → `statusStyles.error`.
- [ ] `src/components/evaluation/revision-history-sheet.tsx` — event-type color map → use `statusStyles` with `auditEventKind`-style helper.

### 🟠 High-volume but mechanical

Files with >50 arbitrary `text-[Npx]` or `uppercase` usages. Sort by file, run search-replace with visual QA:

- [ ] `src/app/dashboard/evaluation/[id]/page.tsx` (112 violations)
- [ ] `src/components/pre-evaluation/student-preview.tsx` (98)
- [ ] `src/app/dashboard/re-evaluation/[id]/page.tsx` (96 — data-color sites already migrated)
- [ ] `src/components/evaluation/calibration/negotiation-dialogue.tsx` (86)
- [ ] `src/components/pre-evaluation/assignment-specs.tsx` (55 arbitrary sizes + dept color logic)
- [ ] `src/components/evaluation/calibration/calibration-check.tsx` (42)

### 🟠 The rest

- [ ] `src/app/dashboard/post-evaluation/page.tsx`
- [ ] `src/app/dashboard/evaluation/[id]/feedback/page.tsx`
- [ ] `src/app/dashboard/evaluation/[id]/calibrate/page.tsx`
- [ ] `src/app/dashboard/evaluation/results/page.tsx`
- [ ] `src/components/evaluation/calibration/blind-grading-panel.tsx`
- [ ] `src/components/pre-evaluation/creation-mode.tsx`
- [ ] `src/app/dashboard/page.tsx` (minor)
- [ ] `src/components/evaluation/revision-history-sheet.tsx`
- [ ] `src/components/evaluation/feedback-summary-modal.tsx`

Other ~25 files with <10 violations each.

## Per-file migration checklist (template)

For each file, in one PR:

1. [ ] Remove `text-[Npx]` → `text-xs/sm/base/lg/xl`.
2. [ ] Remove `uppercase` class (replace with sentence case; if editorial styling needed, add `.eyebrow` or `.kicker`).
3. [ ] Replace `tracking-[Nem]` → `tracking-tight/wider/widest`.
4. [ ] Replace `bg-red-500`, `text-slate-600`, etc. → token classes or DS primitives.
5. [ ] Replace raw hex (`#...`) and `bg-[#...]` → `statusStyles`/`categoryStyles`/`confidenceStyles` or extend tokens.
6. [ ] Delete inline `style={{ color/bg/fontFamily/fontSize }}` — use classes.
7. [ ] Replace per-file color constants (`PURPLE = '#...'`, `DEPT_COLORS = {...}`) by importing from `src/lib/design-tokens.ts`.
8. [ ] Run `npm run lint` — expect zero DS warnings for the file.
9. [ ] Visual QA in browser.

## Not yet covered by the ESLint guard (add in Phase 3)

- Arbitrary `w-[Npx]`, `h-[Npx]`, `gap-[Npx]`, `rounded-[Npx]` — sometimes legitimate for layout math, warn-only after offenders are cleaned.
- `next/font` imports beyond Inter — currently only `layout.tsx`.
