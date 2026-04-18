# Design System Guide

## Overview
This project uses shadcn/ui components with a **Multi-Theme System** supporting 4 distinct theme variants:

1. ☀️ **Twitter Light** - Clean light theme with blue accents
2. 🌙 **Twitter Dark** - Dark theme with blue accents  
3. 💜 **Violet Bloom Light** - Warm light theme with violet accents
4. 🔮 **Violet Bloom Dark** - Rich dark theme with violet accents

All themes are accessible via the **Theme Switcher** (palette icon) in the dashboard header.

### Theme Files
- `src/lib/themes.ts` - Theme definitions and configurations
- `src/components/multi-theme-provider.tsx` - Theme context provider
- `src/components/theme-switcher.tsx` - Theme selector UI
- `src/app/globals.css` - All 4 theme CSS variable definitions

---

## Component Library

**Always use shadcn/ui components**. Never build custom components when shadcn equivalents exist.

### Available Components

**Layout Components:**
- Card
- Separator
- Sheet
- Sidebar
- Skeleton

**Interactive Components:**
- Button
- Avatar
- Dropdown Menu
- Tooltip
- Input

### Component Installation

```bash
# Add new shadcn components
npx shadcn@latest add <component-name>

# Example
npx shadcn@latest add badge
```

---

## Design Tokens

### Violet Bloom Colors (oklch format)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `oklch(0.9940 0 0)` | `oklch(0.2223 0.0060 271.1393)` | Page background |
| `--foreground` | `oklch(0 0 0)` | `oklch(0.9551 0 0)` | Primary text |
| `--primary` | `oklch(0.5393 0.2713 286.7462)` | `oklch(0.6132 0.2294 291.7437)` | Buttons, links, accent |
| `--primary-foreground` | `oklch(1.0000 0 0)` | `oklch(1.0000 0 0)` | Text on primary |
| `--secondary` | `oklch(0.9540 0.0063 255.4755)` | `oklch(0.2940 0.0130 272.9312)` | Secondary buttons |
| `--secondary-foreground` | `oklch(0.1344 0 0)` | `oklch(0.9551 0 0)` | Text on secondary |
| `--muted` | `oklch(0.9702 0 0)` | `oklch(0.2940 0.0130 272.9312)` | Background accents |
| `--muted-foreground` | `oklch(0.4386 0 0)` | `oklch(0.7058 0 0)` | Subtle text |
| `--accent` | `oklch(0.9393 0.0288 266.3680)` | `oklch(0.2795 0.0368 260.0310)` | Highlights, hover states |
| `--accent-foreground` | `oklch(0.5445 0.1903 259.4848)` | `oklch(0.7857 0.1153 246.6596)` | Text on accent |
| `--destructive` | `oklch(0.6290 0.1902 23.0704)` | `oklch(0.7106 0.1661 22.2162)` | Errors, alerts |
| `--destructive-foreground` | `oklch(1.0000 0 0)` | `oklch(1.0000 0 0)` | Text on destructive |
| `--border` | `oklch(0.9300 0.0094 286.2156)` | `oklch(0.3289 0.0092 268.3843)` | Borders, dividers |
| `--input` | `oklch(0.9401 0 0)` | `oklch(0.3289 0.0092 268.3843)` | Input borders |
| `--ring` | `oklch(0 0 0)` | `oklch(0.6132 0.2294 291.7437)` | Focus states |
| `--card` | `oklch(0.9940 0 0)` | `oklch(0.2568 0.0076 274.6528)` | Card backgrounds |
| `--card-foreground` | `oklch(0 0 0)` | `oklch(0.9551 0 0)` | Card text |
| `--popover` | `oklch(0.9911 0 0)` | `oklch(0.2568 0.0076 274.6528)` | Popover backgrounds |
| `--popover-foreground` | `oklch(0 0 0)` | `oklch(0.9551 0 0)` | Popover text |

### Chart Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--chart-1` | `oklch(0.7459 0.1483 156.4499)` | `oklch(0.8003 0.1821 151.7110)` | Chart primary |
| `--chart-2` | `oklch(0.5393 0.2713 286.7462)` | `oklch(0.6132 0.2294 291.7437)` | Chart secondary (violet) |
| `--chart-3` | `oklch(0.7336 0.1758 50.5517)` | `oklch(0.8077 0.1035 19.5706)` | Chart tertiary |
| `--chart-4` | `oklch(0.5828 0.1809 259.7276)` | `oklch(0.6691 0.1569 260.1063)` | Chart quaternary |
| `--chart-5` | `oklch(0.5590 0 0)` | `oklch(0.7058 0 0)` | Chart neutral |

### Sidebar Colors

| Token | Light | Dark |
|-------|-------|------|
| `--sidebar` | `oklch(0.9777 0.0051 247.8763)` | `oklch(0.2011 0.0039 286.0396)` |
| `--sidebar-foreground` | `oklch(0 0 0)` | `oklch(0.9551 0 0)` |
| `--sidebar-primary` | `oklch(0 0 0)` | `oklch(0.6132 0.2294 291.7437)` |
| `--sidebar-primary-foreground` | `oklch(1.0000 0 0)` | `oklch(1.0000 0 0)` |
| `--sidebar-accent` | `oklch(0.9401 0 0)` | `oklch(0.2940 0.0130 272.9312)` |
| `--sidebar-accent-foreground` | `oklch(0 0 0)` | `oklch(0.6132 0.2294 291.7437)` |
| `--sidebar-border` | `oklch(0.9401 0 0)` | `oklch(0.3289 0.0092 268.3843)` |
| `--sidebar-ring` | `oklch(0 0 0)` | `oklch(0.6132 0.2294 291.7437)` |

### Typography

```css
--font-sans: "Plus Jakarta Sans", sans-serif;
--font-mono: "IBM Plex Mono", monospace;
--font-serif: "Lora", serif;

/* Tracking - Negative letter-spacing for modern look */
--tracking-normal: -0.025em;
--tracking-tight: -0.05em;
--tracking-tighter: -0.075em;
--tracking-wide: 0em;
--tracking-wider: 0.025em;
--tracking-widest: 0.075em;
```

### Spacing

```css
/* Base spacing unit - Slightly larger than standard */
--spacing: 0.27rem; /* ~4.3px */
```

Use Tailwind spacing classes:
- `p-4` = ~17px
- `gap-4` = ~17px
- `space-y-4` = vertical ~17px gaps

### Border Radius

```css
--radius: 1.4rem; /* ~22px - More rounded aesthetic */
--radius-sm: calc(var(--radius) * 0.6);  /* ~13px */
--radius-md: calc(var(--radius) * 0.8);  /* ~18px */
--radius-lg: var(--radius);              /* ~22px */
--radius-xl: calc(var(--radius) * 1.4);  /* ~31px */
--radius-2xl: calc(var(--radius) * 1.8); /* ~40px */
```

### Shadows

```css
--shadow-color: hsl(0 0% 0%);
--shadow-opacity: 0.16;
--shadow-blur: 3px;
--shadow-offset-y: 2px;

--shadow-2xs: 0px 2px 3px 0px hsl(0 0% 0% / 0.08);
--shadow-xs: 0px 2px 3px 0px hsl(0 0% 0% / 0.08);
--shadow-sm: 0px 2px 3px 0px hsl(0 0% 0% / 0.16), 0px 1px 2px -1px hsl(0 0% 0% / 0.16);
--shadow: 0px 2px 3px 0px hsl(0 0% 0% / 0.16), 0px 1px 2px -1px hsl(0 0% 0% / 0.16);
--shadow-md: 0px 2px 3px 0px hsl(0 0% 0% / 0.16), 0px 2px 4px -1px hsl(0 0% 0% / 0.16);
--shadow-lg: 0px 2px 3px 0px hsl(0 0% 0% / 0.16), 0px 4px 6px -1px hsl(0 0% 0% / 0.16);
--shadow-xl: 0px 2px 3px 0px hsl(0 0% 0% / 0.16), 0px 8px 10px -1px hsl(0 0% 0% / 0.16);
--shadow-2xl: 0px 2px 3px 0px hsl(0 0% 0% / 0.40);
```

---

## Theme Support

### Modes
- **Light**: Near-white backgrounds (`oklch(0.9940 0 0)`), vibrant violet primary
- **Dark**: Deep slate backgrounds (`oklch(0.2223 0.0060 271.1393)`), soft violet primary
- **System**: Auto-detects based on OS preference

### Implementation

Always use CSS variables, never hardcoded colors:

```tsx
// ✅ CORRECT
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">

// ❌ WRONG
<div className="bg-white text-black">
  <Button className="bg-purple-600 text-white">
```

### Container Component Pattern

Wrap content in containers with semantic classes:

```tsx
<Card className="bg-card text-card-foreground shadow-lg">
  <CardContent>
    <p className="text-muted-foreground">Subtitle text</p>
  </CardContent>
</Card>
```

### Theme Toggle

Already implemented in `src/components/theme-toggle.tsx`. Use this component for theme switching.

---

## Best Practices

1. **Always use semantic tokens**
   - Use `bg-background`, not white/slate
   - Use `text-foreground`, not text-black/white

2. **Use shadcn components over custom HTML**
   - Use `<Button />`, not `<button />`
   - Use `<Card />`, not `<div className="border" />`

3. **Proper spacing**
   - Base unit is ~4.3px
   - Common patterns: `gap-4`, `p-6`, `space-y-4`

4. **Consistent radius**
   - Cards: `rounded-lg` or default Card radius (1.4rem)
   - Buttons: Component handles this automatically
   - Large surfaces: `rounded-xl`

5. **Respect dark mode**
   - Test both light and dark modes
   - Violet Bloom uses deep slate in dark mode, not pure black
   - Check muted text visibility in both modes

6. **Typography**
   - Use Plus Jakarta Sans for headings and body
   - Negative letter-spacing (-0.025em) for modern, tight typography
   - Body copy feels sophisticated and contemporary

7. **Component props**
   - Use built-in variant props for buttons: `variant="ghost"`, `size="sm"`
   - Don't override with arbitrary classes when variants exist

---

## Violet Bloom Characteristics

**Visual Identity:**
- Vibrant violet primary (#7C3AED equivalent in oklch)
- Warm undertones throughout
- Soft shadows with lower opacity for elegance
- Larger border radius (1.4rem) for friendlier, modern feel
- Tight letter-spacing (-0.025em) for sophistication

**Contrast Ratios:**
- High contrast in light mode (pure black text on off-white)
- Excellent readability in dark mode (high lightness on deep slate)
- Accessible color combinations built-in

---

## Accessibility

- Use semantic HTML elements within shadcn components
- Include proper aria-labels where needed
- Maintain focus indicators (ring tokens)
- Ensure sufficient color contrast in both themes
- WCAG AA compliance built into the theme

---

## Migration Notes

**From arbitrary values to tokens:**

```css
/* ❌ Before */
.text-gray-600
gap-[10px]
bg-purple-600

/* ✅ After */
.text-muted-foreground
gap-4 (~17px)
bg-primary
```

**Custom components:**

If you need custom UI, compose from shadcn primitives:

```tsx
import { Button } from "@/components/ui/button"

export function CustomAction() {
  return (
    <Button variant="outline" size="sm">
      Action
    </Button>
  )
}
```

---

## Theme Installation

```bash
# Install Violet Bloom theme
npx shadcn@latest add https://tweakcn.com/r/themes/violet-bloom.json

# The theme will update src/app/globals.css with all variables
# Update layout.tsx font import:
# import { Plus_Jakarta_Sans } from "next/font/google"
```
