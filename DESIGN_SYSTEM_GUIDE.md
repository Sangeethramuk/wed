# Design System Guide

This repo implements the **EducAItors Design System** (sourced from the Claude Design handoff bundle, `educaitors-design-system`). Every color, font, and repeating component goes through tokens defined in one place so the product can be re-skinned or re-branded without touching screens.

---

## Where everything lives

| Concern | File | Purpose |
|---|---|---|
| CSS variables (colors, spacing, radius, shadows, tracking) | `src/app/globals.css` | Theme blocks for `violet-light` (aka `brand-light`), `violet-dark`, `twitter-light`, `twitter-dark`. Also semantic `--status-*` and `--category-*` tokens shared across themes. |
| Editorial utility classes | `src/app/globals.css` (bottom) | `.eyebrow`, `.kicker`, `.ds-label`, `.tabular`, `.num-display` |
| TypeScript token accessors | `src/lib/design-tokens.ts` | Maps semantic keys (`'success'`, `'high'`, `'Computer Science'`, …) to Tailwind classes that reference CSS variables. |
| Theme definitions + default | `src/lib/themes.ts` | Theme list used by the switcher. Default is `violet-light` (Brand Light). |
| DS primitives (badges, dots, stat numbers) | `src/components/ui/` | `status-badge.tsx`, `category-badge.tsx`, `color-dot.tsx`, `confidence-badge.tsx`, `stat-number.tsx` |
| Lint enforcement | `eslint.config.mjs` | Flags hardcoded hex, named Tailwind hues, `uppercase`, `text-[Npx]`, inline color/font styles. |

---

## Themes

Four variants wired up, but **`violet-light` (Brand Light) is canonical**:

| Key | Label in UI | Primary | Font |
|---|---|---|---|
| `violet-light` | Brand Light | `#21508c` navy | Inter |
| `violet-dark` | Violet Bloom Dark | violet | Inter |
| `twitter-light` | Twitter Light | blue | Open Sans |
| `twitter-dark` | Twitter Dark | blue | Open Sans |

`<html data-theme="violet-light">` is set in `src/app/layout.tsx` so SSR renders brand colors from the first byte.

---

## Typography

- **Inter** is the single font family for all four themes' `--font-sans`, `--font-serif`, `--font-mono`.
- Loaded via `next/font/google` in `src/app/layout.tsx`. Weights 300–700.
- For numbers/IDs/counts, apply the `.tabular` class (`font-variant-numeric: tabular-nums`). Don't reach for a monospace font.
- For editorial eyebrows/kickers, use the `.eyebrow` or `.kicker` class — 12px, 600 weight, moderate tracking, sentence case. **No UPPERCASE anywhere in the product.**
- For big stat numbers, use `<StatNumber value={…} />` or the `.num-display` class.

---

## Color

### Semantic tokens (defined in `globals.css`, consumed via `design-tokens.ts`)

| Token | Usage |
|---|---|
| `--primary`, `--primary-foreground` | Primary CTAs, links, active states |
| `--background`, `--foreground` | Page surface + body text |
| `--card`, `--card-foreground` | Card surface + card text |
| `--muted`, `--muted-foreground` | Subtle fills + secondary text |
| `--accent`, `--accent-foreground` | Hover highlights |
| `--border`, `--input` | Hairlines and input borders |
| `--ring` | Focus rings |
| `--status-success` / `--status-success-bg` | Completion, positive state |
| `--status-warning` / `--status-warning-bg` | In-progress, attention |
| `--status-error` / `--status-error-bg` | Errors, overdue |
| `--status-info` / `--status-info-bg` | Informational |
| `--category-1` … `--category-6` (+ `-bg`) | Department/type hues. Never pick a raw Tailwind hue — use these slots. |

### How to pick a color (consumer side)

```tsx
import { statusStyles, categoryStyles, confidenceStyles } from "@/lib/design-tokens";

// Simple surface
<div className="bg-card text-foreground ring-1 ring-foreground/10 rounded-xl p-4">…</div>

// Status
<span className={cn("rounded-full px-2 py-0.5", statusStyles.success.bg, statusStyles.success.text)}>
  Complete
</span>

// Category
<span className={cn("rounded-full px-2 py-0.5", categoryStyles["Computer Science"].bg, categoryStyles["Computer Science"].text)}>
  CS
</span>

// Confidence
<span className={cn("rounded-full px-2 py-0.5", confidenceStyles.high.bg, confidenceStyles.high.text)}>
  High
</span>
```

**Or** use the DS primitives that wrap this:

```tsx
import { StatusBadge } from "@/components/ui/status-badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { ColorDot } from "@/components/ui/color-dot";
import { StatNumber } from "@/components/ui/stat-number";

<StatusBadge status="calibrated" />
<CategoryBadge category="Computer Science" />
<ConfidenceBadge level="high" />
<ColorDot color={{ kind: "workflow", value: "overdue" }} />
<StatNumber value={24} suffix="/ 45" />
```

---

## DO and DON'T

**DO**

- Use `bg-primary`, `text-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, `ring-ring`.
- Use `statusStyles` / `categoryStyles` / `confidenceStyles` from `src/lib/design-tokens.ts`.
- Use DS primitives (`StatusBadge`, `CategoryBadge`, `ColorDot`, `ConfidenceBadge`, `StatNumber`).
- Use `.eyebrow` / `.kicker` for small editorial labels (sentence case).
- Use `.tabular` for any number in a data row/cell.

**DON'T**

- No `text-[Npx]` — use `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`.
- No `uppercase` class — forbidden by the system.
- No `tracking-[0.Nem]` — use `tracking-tight`, `tracking-wider`, `tracking-widest`.
- No hex literals (`#21508c`) or named Tailwind hues (`bg-slate-500`, `text-red-600`) in app code.
- No `rgba(…)` or `rgb(…)` literals.
- No inline `style={{ color, background, fontFamily, fontSize }}` for design tokens.

ESLint will warn on all of the above (`eslint.config.mjs`).

---

## Adding a new status or category

1. Add the CSS variable pair in `src/app/globals.css` under the "SEMANTIC STATUS + CATEGORY TOKENS" block (light + dark override).
2. Add a key to `statusStyles` or `categoryStyles` in `src/lib/design-tokens.ts`.
3. Consumers read it by key — no other code changes.

---

## Migration status

See `HARDCODED_VALUES_AUDIT.md` for the list of legacy files still carrying hardcoded values. This PR lands the token foundation and lint enforcement; follow-up PRs migrate files one at a time.

---

## Accessibility

- Focus rings via `--ring` (3px, offset 2px) — do not override.
- Maintain 4.5:1 contrast. Semantic `--status-*-bg` tokens are intentionally tinted at 10% alpha so foreground hue is AA against any background.
- Sentence-case only. Screen readers handle casing deliberately; all-caps is read letter-by-letter.
