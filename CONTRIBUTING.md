# Contributing — The DS Contract

Read this **before** writing any UI code. It is strict. It is non-negotiable.

This document is the single source of truth for "how do I add or change UI in this repo?" If you disagree with a rule, raise it — don't route around it.

---

## First principles (non-negotiable)

1. **Every UI surface is composed from primitives in `src/components/ui/`.** If a primitive exists, you use it. Period.
2. **Every color, spacing unit, radius, and shadow is a DS token.** No hex literals. No named Tailwind hues (`bg-slate-500`, `text-red-600`). No arbitrary values (`p-[17px]`, `text-[13px]`). No inline `style={{ color, background, font, padding }}`.
3. **If a primitive you need does not exist, STOP.** Do not build bespoke. Flag the gap, describe it, wait for direction. Violations are rejected in review.

---

## Before you write any UI code — mandatory checklist

1. Read [`DESIGN_SYSTEM_GUIDE.md`](./DESIGN_SYSTEM_GUIDE.md). It covers themes, tokens, editorial utilities, dos-and-don'ts.
2. Scan the **Component inventory** below. Find the primitive that fits your need.
3. **Match found** → use that primitive. Cite the file path in your PR description (e.g., "Uses `src/components/ui/table.tsx` for the submissions list").
4. **No match** → follow the [**Escalation protocol**](#when-a-primitive-is-missing--escalation-protocol). Do NOT start implementing the missing primitive inline in a page.

---

## Component inventory

Every file under `src/components/ui/` is an approved primitive. Use it. Don't re-implement it. Don't replace it with a native HTML element.

### Surfaces

| Primitive | Use for | Never use instead |
|---|---|---|
| `card.tsx` | Any bordered content container. Cards inside cards are fine. | Raw `<div className="border rounded-xl">` |
| `dialog.tsx` | Modal for a focused action (form, confirm with context, picker). | Native `<dialog>`, hand-rolled fixed-position overlay |
| `alert-dialog.tsx` | **Destructive** confirm only ("Delete X?"). | Plain Dialog for destructive flows |
| `sheet.tsx` | Large side panel with scrollable content. | Dialog for wide content; drawer for secondary panels |
| `drawer.tsx` | Secondary panel that slides from an edge (usually for filters / details). | Custom slide-in with manual animation |
| `popover.tsx` | Click-triggered floating UI tied to a trigger element (menus, selectors). | Absolutely-positioned hand-rolled card |
| `hover-card.tsx` | Rich hover preview (user card, manuscript evidence). | `title="…"` on custom UI (use Tooltip for short hints) |

### Feedback

| Primitive | Use for | Never use instead |
|---|---|---|
| `alert.tsx` | **Banner / callout** — severity-tinted strip above a section. Supports `default` / `destructive` / `warning` / `info` / `success` / `danger` variants (after #44 merges). | Colored `<div>` with an icon and text |
| `sonner.tsx` | Toast notifications (non-blocking, transient). | Custom fixed-position toast queue |
| `progress.tsx` | Progress bars — assignment completion, step progress. | `<div>` with a styled inner `<div>` and percentage width |
| `spinner.tsx` | Loading spinner. | Inline SVG, CSS keyframe animation |
| `skeleton.tsx` | Loading skeletons (data-row placeholders). | Gray `<div>` with `animate-pulse` |
| `empty.tsx` | Empty state with icon + message + optional CTA. | Hand-rolled centered `<div>` with "no data" text |

### Inputs

| Primitive | Use for | Never use instead |
|---|---|---|
| `input.tsx` | Single-line text, number, email, password input. | Native `<input>` in screen files |
| `textarea.tsx` | Multi-line text input. | Native `<textarea>` in screen files |
| `select.tsx` | Styled dropdown (Radix-driven, a11y-correct). | Native `<select>` for styled dropdowns |
| `native-select.tsx` | Plain native `<select>` when the Radix one is overkill (long lists, mobile). | Raw `<select>` without DS wrapper |
| `combobox.tsx` | Searchable select (with filtering). | Manual Input + filtered list |
| `checkbox.tsx` | Binary toggle in a list / form. | Native `<input type="checkbox">` |
| `radio-group.tsx` | Single-choice from a small set (≤ 6 options). | Stacked `<input type="radio">` |
| `switch.tsx` | On/off for instant actions (not forms). | Styled checkbox |
| `slider.tsx` | Continuous value selection (range, volume). | `<input type="range">` |
| `datetime-picker.tsx` / `calendar.tsx` | Date / time pickers. | Native `<input type="date">` for product UI |
| `input-otp.tsx` | One-time passcode entry. | Grid of single-char inputs |
| `label.tsx` | Form field label. | Raw `<label>` |
| `field.tsx` | Wraps a label + input + helper text + error. **Preferred form composition unit.** | Stacked Label + Input without Field |
| `input-group.tsx` | Input with adornments (icon prefix, button suffix). | Flex wrapper with manual absolute positioning |

### Actions

| Primitive | Use for | Never use instead |
|---|---|---|
| `button.tsx` | Every clickable action — primary / secondary / destructive / ghost / link / icon. | Native `<button>` in screen files |
| `button-group.tsx` | Segmented / connected button set. | Flex row with manual border fusing |
| `toggle.tsx` | Press-on / press-off toggle (e.g., bold in a toolbar). | Button with `aria-pressed` and manual styling |
| `toggle-group.tsx` | Mutually exclusive or multi-toggle set. | ButtonGroup mimicking toggle semantics |
| `dropdown-menu.tsx` | Click-to-open menu of actions (3-dot menus, user menus). | Popover with custom list |
| `context-menu.tsx` | Right-click menu. | Manual contextmenu event handler |
| `kbd.tsx` | Rendering keyboard keys (`Ctrl + K`). | `<code>` |

### Display

| Primitive | Use for | Never use instead |
|---|---|---|
| `badge.tsx` | Generic small pill (tags, counts). | Hand-rolled `<span className="rounded-full …">` |
| `status-badge.tsx` | **Status pill with DS token colors** (success / warning / error / info). | Colored `<span>`, hardcoded amber/red |
| `category-badge.tsx` | Department / subject category pill. | Manual color mapping per category |
| `confidence-badge.tsx` | Low / medium / high confidence pill. | Custom gradient span |
| `color-dot.tsx` | Leading status dot (workflow / severity). | `<div className="w-2 h-2 rounded-full bg-red-500">` |
| `stat-number.tsx` | Large numeric display (KPIs, totals). | `<span className="text-3xl">42</span>` |
| `avatar.tsx` | User avatar with image fallback. | `<img>` with manual fallback logic |
| `separator.tsx` | Horizontal / vertical divider. | `<div className="h-px bg-border">` |
| `aspect-ratio.tsx` | Constrain child to a ratio (video embed, image). | Tailwind `aspect-video` on a wrapping div (use this instead) |
| `table.tsx` | **Every tabular data display.** Use the full suite: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`. | Native `<table>`, CSS grid emulating a table, a stack of `<div>` rows |
| `carousel.tsx` | Paged / swipeable content (horizontal gallery). | Manual scroll-snap |
| `chart.tsx` | Charts (wraps Recharts with DS theming). | Direct Recharts import in a page |

### Navigation

| Primitive | Use for | Never use instead |
|---|---|---|
| `breadcrumb.tsx` | Page-level navigation trail. | Slash-separated spans |
| `navigation-menu.tsx` | Top-level horizontal nav with sub-menus. | Inline `<nav>` with manual dropdown logic |
| `menubar.tsx` | App-level menubar (rare). | Top nav duplicating OS patterns |
| `pagination.tsx` | Paged list controls. | Manual prev/next buttons |
| `sidebar.tsx` | App shell sidebar (already wired in `src/components/dashboard/app-sidebar.tsx`). | Custom side nav |
| `tabs.tsx` | **Tab strips — horizontal or vertical.** Radix-backed, a11y-correct. | `<Button aria-current="page">` pretending to be a tab |
| `command.tsx` | Command palette / search-driven action list. | Inline fuzzy-filtered list |

### Structure

| Primitive | Use for | Never use instead |
|---|---|---|
| `accordion.tsx` | Multi-section expandable content. | Native `<details>`/`<summary>` in screens |
| `collapsible.tsx` | Single expand/collapse toggle. | Stateful `<div>` with `display: none` |
| `resizable.tsx` | Split panes with user-drag resize (workspace layouts). | `flex-basis` + manual drag handler |
| `scroll-area.tsx` | Custom-styled scrollable container. | Raw `overflow-auto` for long UI chrome |
| `tooltip.tsx` | Short hover hint (≤ 1 sentence). | `title="…"` on custom interactive elements |
| `item.tsx` | Reusable list-row primitive (used in dropdowns, lists). | Manual `<li>` styling per list |

---

## Pattern catalog (common compositions)

These are the non-negotiable "how we do X" patterns. Every team member implements them the same way.

### Status pills
```tsx
import { StatusBadge } from "@/components/ui/status-badge"
<StatusBadge status="calibrated" />
```
**Never** hand-roll a colored `<span>` for a status. If the status doesn't fit the existing set, extend `statusStyles` in `src/lib/design-tokens.ts`.

### Data tables
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Student</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(r => (
      <TableRow key={r.id}>
        <TableCell>{r.name}</TableCell>
        <TableCell><StatusBadge status={r.status} /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```
**Never** use a native `<table>`. Never emulate a table with CSS grid.

### Forms
```tsx
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

<Field>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" />
  <FieldDescription>We'll send receipts here.</FieldDescription>
  <FieldError>{errors.email}</FieldError>
</Field>
```
**Never** a naked `<label>` + `<input>` in a screen.

### Banners / callouts (severity messages at the top of a section)
```tsx
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

<Alert variant="warning">
  <AlertTriangle />
  <AlertDescription>Scores are unusually high — please review.</AlertDescription>
</Alert>
```
Variants: `default | destructive | warning | info | success | danger` (last four after PR #44 merges). **Never** a colored `<div>` with an icon and text.

### Dialogs vs. Drawers vs. Sheets vs. AlertDialogs
- **Dialog** — modal for a focused action, content fits within one viewport (form, picker, confirm-with-context).
- **AlertDialog** — destructive confirm ONLY ("Delete X? This cannot be undone."). Never use for non-destructive confirms.
- **Drawer** — secondary panel that slides in from an edge. Filters, details pane.
- **Sheet** — large side panel with scrollable content. Use when content is too tall for a Dialog.

### Tooltips vs. HoverCards
- **Tooltip** — short explanation on hover (≤ 1 sentence). E.g., "AI confidence is low — please review."
- **HoverCard** — richer preview on hover (user card, manuscript evidence detail, criterion breakdown).

**Never** `title="…"` for custom UI except on native HTML inputs where the browser handles it natively.

### Empty states
```tsx
import { Empty } from "@/components/ui/empty"
<Empty icon={<Inbox />} title="No submissions yet" description="Students will appear here as they submit." />
```
**Never** a centered `<div>` with "No data" text.

### Numbers / counts
```tsx
import { StatNumber } from "@/components/ui/stat-number"
<StatNumber value={24} suffix="/ 45" />
```
Or, for inline numbers in a data row, add the `.tabular` class. **Never** a raw `<span>{count}</span>` for data numbers.

---

## Tokens — short reference

For the full token inventory, read [`DESIGN_SYSTEM_GUIDE.md`](./DESIGN_SYSTEM_GUIDE.md). The short version:

| Concern | Tokens |
|---|---|
| Base color | `--background`, `--foreground` |
| Surface | `--card`, `--muted`, `--popover`, `--accent` |
| Action | `--primary`, `--primary-foreground` |
| Danger (Button variant, destructive-only semantics) | `--destructive` |
| Status (banners / badges / pills) | `--status-success/warning/error/info` + `-bg` counterparts |
| Category (departments / subject hues) | `--category-1` … `--category-6` + `-bg` |
| Border / input / ring | `--border`, `--input`, `--ring` |
| Sidebar | `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` |
| Typography | `--font-sans` (Inter for all themes) |
| Radius / shadows / letter-spacing | `--radius`, `--shadow-*`, `--tracking-*` |

**One rule**: every color, spacing, radius, and shadow resolves to one of these or a Tailwind scale token. No exceptions.

---

## When a primitive is missing — escalation protocol

If your UI need doesn't map to any primitive in the inventory, **STOP**. Do not build a bespoke component inline. Follow this exactly:

### Step 1 — Describe the gap (3 sentences max)
- **What** the user is trying to do.
- **Why** the existing primitives don't fit (be specific — cite the primitives you considered).
- **Shape** you think the new primitive should have (API signature, variants).

Example:
> "Users need a split-view 'diff' component that shows the AI's grade side-by-side with the instructor's override. Tried: `<Card>` pairs (no visual connection), `<Tabs>` (wrong mental model — they want both visible). I think we need a `<ScoreDiff before={…} after={…} delta={…} />` primitive with `ai` / `instructor` slots."

### Step 2 — Raise it
- Human contributor: open a design issue / ping the DS owner.
- AI agent: surface the question to the user via `AskUserQuestion` (or equivalent). Do not proceed with a bespoke implementation while waiting.

### Step 3 — Wait for one of three answers
- **"Compose from X + Y"** → use that composition inline. You may extract a helper component inside the feature directory but it must not duplicate DS primitive responsibilities.
- **"Add it to `src/components/ui/<name>.tsx`"** → create a new DS primitive following the existing shadcn-style patterns:
  - CVA (`class-variance-authority`) for variants
  - Composable slots via `data-slot="…"` attributes
  - `cn()` from `@/lib/utils` for class merging
  - JSDoc on the exported component
  - Consume only DS tokens (no hex, no named hues)
- **"Skip this — not needed right now"** → drop the feature.

**Never** proceed without one of these three answers.

---

## Forbidden practices

These are **rejected in review**, no exceptions:

- Hex literals in screen code (`#21508c`, `#F9F8F4`). Use tokens.
- Named Tailwind hues (`bg-slate-500`, `text-red-600`, `border-amber-400`). Use `bg-muted`, `text-destructive`, `border-border`, status tokens, etc.
- Arbitrary values for design properties:
  - `text-[13px]` → use `text-sm` / `text-base` / `text-lg`
  - `p-[17px]` → use `p-3` / `p-4` / `p-5`
  - `rounded-[11px]` → use `rounded-md` / `rounded-lg` / `rounded-xl`
- `rgba(…)` / `rgb(…)` literals in JS/TS.
- `UPPERCASE` class on text. Use the `.eyebrow` / `.kicker` editorial utilities (sentence case).
- Native HTML elements when a DS primitive exists:
  - `<button>` → `<Button>`
  - `<input>` → `<Input>` inside `<Field>`
  - `<select>` → `<Select>` or `<NativeSelect>`
  - `<table>` → `<Table>` + `<TableRow>` + `<TableCell>`
  - `<dialog>` → `<Dialog>`
  - `<details>/<summary>` → `<Accordion>` or `<Collapsible>`
- Inline `style={{ color, background, font, padding, margin, borderRadius, boxShadow }}`.
- Re-implementing an existing primitive because "the default styling doesn't fit". Instead: add a variant via CVA, or escalate per the protocol above.

---

## Pre-PR checklist

Copy this into your PR description and check every box:

- [ ] Every primitive in my diff comes from `src/components/ui/` (no native HTML elements for equivalent UI).
- [ ] Every color is a DS token (`--status-*`, `--category-*`, `--primary`, `--muted`, `--border`, …).
- [ ] Every spacing value is a Tailwind scale token (`p-4`, `gap-3`, `mt-2`) — no arbitrary `p-[17px]`.
- [ ] Every radius is `rounded-sm/md/lg/xl/2xl` — no `rounded-[Npx]`.
- [ ] No `UPPERCASE`, no `text-[Npx]`, no hex, no `rgba()`, no `bg-slate-*`.
- [ ] If I added a new primitive, it lives in `src/components/ui/`, uses CVA variants, consumes only DS tokens, and the DS owner approved it.
- [ ] `npm run build` passes clean.
- [ ] `npm run lint` passes with zero *new* warnings (existing migration backlog is not my problem to fix, but I must not add to it).
- [ ] Screenshots attached for every UI change (light + dark mode where relevant).

---

## For AI agents (Claude Code, Cursor, others)

This section is binding for LLM-based contributors.

1. **Read this file and `DESIGN_SYSTEM_GUIDE.md` at the start of every UI task.** They are the contract.
2. **Treat "missing primitive" as a HARD STOP.** Use the `AskUserQuestion` tool (or equivalent) to surface options. Do not generate a bespoke component inline.
3. **Never invent a component name not in the inventory.** If you're tempted to write `<Banner>`, check — it's probably `<Alert>`. If you're tempted to write a `<SuspiciousHighlight>`, compose it from DS primitives OR escalate.
4. **Never output a native HTML element when a DS primitive exists.** `<button>` must become `<Button>`. `<select>` must become `<Select>`. Every time.
5. **When touching a file that still has legacy hardcoded values** (see `HARDCODED_VALUES_AUDIT.md`), migrate the touched areas as you go. Don't silently expand bespoke patterns.
6. **Cite the primitive file paths you used** in your final summary. E.g., "Used `src/components/ui/table.tsx` for the list, `src/components/ui/alert.tsx` for the banner, `src/components/ui/field.tsx` for the form composition."

---

## References

- [`DESIGN_SYSTEM_GUIDE.md`](./DESIGN_SYSTEM_GUIDE.md) — tokens, themes, editorial utilities, do/don't
- [`HARDCODED_VALUES_AUDIT.md`](./HARDCODED_VALUES_AUDIT.md) — migration backlog (informational)
- [`src/components/ui/`](./src/components/ui/) — the primitive inventory (source of truth)
- [`src/lib/design-tokens.ts`](./src/lib/design-tokens.ts) — `statusStyles` / `categoryStyles` / `confidenceStyles` accessors
- [`src/app/globals.css`](./src/app/globals.css) — CSS variables (themes + semantic tokens + editorial utilities)
- [`eslint.config.mjs`](./eslint.config.mjs) — lint rules enforcing many of the "forbidden practices" above

If any rule here conflicts with code you see on a branch, **the rule wins**. Fix the code.
