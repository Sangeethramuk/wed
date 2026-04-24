# EducAItors Design System Guide

> **How we matched the visual design of https://educ-a-itors-bice.vercel.app/**
>
> This document captures our journey, learnings, and exact implementation steps so the team can replicate this approach.

**This guide is authoritative for all visual / styling decisions in this repo. If it conflicts with any older doc (e.g., `CONTRIBUTING.md`, `DESIGN_SYSTEM_GUIDE.md`), this one wins.**

---

## Table of Contents

1. [Our Journey](#our-journey)
2. [The Discovery Process](#the-discovery-process)
3. [Design Tokens Extracted](#design-tokens-extracted)
4. [Implementation Guide](#implementation-guide)
5. [Component Patterns](#component-patterns)
6. [Common Pitfalls](#common-pitfalls)
7. [Quick Reference](#quick-reference)

---

## Our Journey

### The Challenge

We needed to build a **teacher module** for EducAItors (AI-assisted grading platform) that looks **visually identical** to the already-deployed **student module** at https://educ-a-itors-bice.vercel.app/ — but serves completely different content.

### Initial Mistakes

1. **Assumed standard Tailwind slate palette** — We initially used `#F1F5F9` for page background, but their actual background is `#F8F9FA`
2. **Relied on HeroUI defaults** — HeroUI's default styling conflicts with custom Tailwind utilities
3. **Used standard shadows** — Their shadows are extremely subtle (`0 1px 3px rgba(0,0,0,0.04)`), not Tailwind's defaults

### The Breakthrough

We stopped guessing and **extracted their actual production CSS**. This revealed:
- They use **HeroUI v3** with **Tailwind CSS v4**
- They use **React 19** + **Vite** (we use Next.js 16 — compatible)
- Their color system is precise and intentional

---

## The Discovery Process

### Step 1: Extract Production CSS

```bash
# Method 1: Direct curl
curl https://educ-a-itors-bice.vercel.app/assets/index-CAayEfEL.css -o their-styles.css

# Method 2: Browser DevTools
# 1. Open the deployed URL
# 2. DevTools → Network tab
# 3. Filter by "CSS"
# 4. Look for index-*.css file
# 5. Preview → Copy all content
```

### Step 2: Analyze Key Patterns

From their CSS, we identified:

```css
/* They use BEM-style naming */
.radio-group--secondary {}
.search-field__group {}

/* They use data attributes for states */
[data-hovered="true"] {}
[data-selected="true"] {}

/* They use oklch() color format */
color: oklch(0.546 0.245 262.881);

/* Their shadows are barely visible */
box-shadow: 0 1px 3px rgba(0,0,0,0.04);
```

### Step 3: Map to Hex Values

We converted their oklch() colors to hex for easier Tailwind usage:

| oklch Value | Hex Equivalent |
|-------------|----------------|
| Page background | `#F8F9FA` |
| Card background | `#FFFFFF` |
| Primary brand | `#1F4E8C` |
| Text primary | `#0F172A` |
| Text secondary | `#64748B` |

---

## Design Tokens Extracted

### Color Palette

```
┌─────────────────────────────────────────────────────────────┐
│  PAGE BACKGROUND     │  #F8F9FA                            │
│  Card Background     │  #FFFFFF                            │
│  Borders             │  #E2E8F0                            │
├─────────────────────────────────────────────────────────────┤
│  Text Primary        │  #0F172A   (slate-900)              │
│  Text Secondary      │  #64748B   (slate-500)              │
│  Text Muted          │  #94A3B8   (slate-400)              │
├─────────────────────────────────────────────────────────────┤
│  Brand Primary       │  #1F4E8C                            │
│  Brand Hover         │  #1E3A5F                            │
│  Accent Blue         │  #3B82F6                            │
├─────────────────────────────────────────────────────────────┤
│  Success             │  #10B981   (emerald-500)            │
│  Warning             │  #F59E0B   (amber-500)              │
│  Danger              │  #EF4444   (red-500)                │
├─────────────────────────────────────────────────────────────┤
│  Sidebar Active BG   │  #EFF6FF   (blue-50)                │
│  Sidebar Active Text │  #1F4E8C   (brand)                  │
└─────────────────────────────────────────────────────────────┘
```

### Shadow System

```css
/* Cards */
box-shadow: 0 1px 3px rgba(0,0,0,0.04);

/* Dropdowns/Menus */
box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);

/* Modals (if needed) */
box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
```

### Spacing System

| Element | Value |
|---------|-------|
| Page padding | `px-6` (24px) |
| Card padding | `p-5` (20px) |
| Section gap | `gap-4` (16px) |
| Sidebar width | `w-60` (240px) |
| Content margin | `ml-60` (240px) |
| Border radius (cards) | `rounded-xl` (12px) |
| Border radius (buttons) | `rounded-lg` (8px) |

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Sizes**:
  - Page titles: `text-2xl font-semibold`
  - Card titles: `text-lg font-semibold`
  - Body: `text-sm`
  - Metadata: `text-xs text-slate-400`

---

## Implementation Guide

### 1. globals.css Setup

```css
@import "tailwindcss";
@import "@heroui/styles";

@theme {
  /* Core color overrides */
  --color-background: #F8F9FA;
  --color-foreground: #0F172A;
  --color-default: #F1F5F9;
  --color-primary: #1F4E8C;
  --color-secondary: #64748B;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;

  /* Border radius */
  --radius-small: 6px;
  --radius-medium: 8px;
  --radius-large: 12px;
}

/* CRITICAL: Force page background */
html,
body {
  background-color: #F8F9FA;
}

/* Font family */
:root {
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 2. Root Layout

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 3. Page Structure Template

```tsx
// Every screen should follow this structure
export default function SomePage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <Sidebar />
      <main className="flex-1 ml-60">
        <Header title="Page Title" />
        <div className="px-6 py-6 w-full">
          {/* Content here */}
        </div>
      </main>
    </div>
  );
}
```

---

## Component Patterns

### Cards

```tsx
import { Card } from '@heroui/react';

// Standard card
<Card
  className="bg-white border border-slate-200 rounded-xl"
  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
>
  <Card.Content className="p-5">
    {/* Content */}
  </Card.Content>
</Card>

// Course card (expandable)
<Card
  className="bg-white border border-slate-200 rounded-xl overflow-hidden"
  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
>
  {/* Header button */}
  {/* Expanded content */}
</Card>
```

### Buttons

```tsx
import { Button } from '@heroui/react';

// Primary CTA (Start Grading, Continue, Create)
<Button className="bg-[#1F4E8C] text-white hover:bg-[#1E3A5F] rounded-lg">
  Start Grading →
</Button>

// Secondary outline
<Button
  variant="outline"
  className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
>
  Sort ▾
</Button>

// Ghost/View (for released items)
<Button
  variant="ghost"
  className="text-slate-600 hover:bg-slate-100 rounded-lg"
>
  View
</Button>
```

### Sidebar Navigation

```tsx
// Active state = light blue bg + brand text
const navItems = [
  { name: 'My Classes', href: '/', icon: Home },
  { name: 'Re-evaluation', href: '/reevaluation', icon: ClipboardCheck, badge: 2 },
  // ...
];

// Active item styling
className={cn(
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
  isActive
    ? 'bg-blue-50 text-[#1F4E8C]'    // Light blue bg, brand text
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
)}
```

### Header

```tsx
// White background with subtle border
<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
  <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
  <div className="flex items-center gap-3">
    <Button variant="outline" className="border-slate-200">
      <HelpCircle className="h-4 w-4 mr-2" />
      Walkthrough
    </Button>
    <button className="relative p-2 hover:bg-slate-100 rounded-lg">
      <Bell className="h-5 w-5 text-slate-600" />
    </button>
  </div>
</header>
```

### Search Field

```tsx
<div className="relative flex-1 max-w-md">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg
               text-sm text-slate-700 placeholder:text-slate-400
               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
  />
</div>
```

### Custom Dropdown

```tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

function Dropdown({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200
                   rounded-lg text-sm text-slate-700 hover:border-slate-300"
      >
        {value}
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200
                        rounded-lg shadow-lg z-50 py-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700
                         hover:bg-slate-50 flex items-center justify-between"
            >
              {option}
              {value === option && <Check className="h-4 w-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Progress Blocks (10-block style)

```tsx
function ProgressBlocks({ graded, total, status }) {
  const filled = Math.round((graded / total) * 10);

  // Color based on status
  const color = status === 'released'
    ? 'bg-emerald-400'
    : graded === 0
      ? 'bg-slate-200'
      : 'bg-amber-400';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${i < filled ? color : 'bg-slate-100 border border-slate-200'}`}
        />
      ))}
    </div>
  );
}
```

### View Toggle (Segmented Control)

```tsx
function ViewToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-slate-200/50 rounded-xl p-1.5">
      <button
        onClick={() => onChange('course')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          value === 'course'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Building2 className="h-4 w-4" />
        Course View
      </button>
      <button
        onClick={() => onChange('assignment')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          value === 'assignment'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <FileText className="h-4 w-4" />
        Assignment View
      </button>
    </div>
  );
}
```

---

## Common Pitfalls

### ❌ Problem 1: HeroUI Overrides Custom Tailwind

**Issue:** HeroUI applies its own styles that override Tailwind utilities.

**Example:**
```tsx
// HeroUI ignores your bg-white
<Card className="bg-white shadow-sm">...</Card>
```

**Solutions:**
1. Use inline styles for critical properties:
   ```tsx
   style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
   ```
2. Override CSS variables in globals.css
3. Use `!important` sparingly as last resort

### ❌ Problem 2: Nested Buttons Hydration Error

**Issue:** Next.js throws "hydration mismatch" when `<button>` contains another `<button>`.

**Example:**
```tsx
// ❌ WRONG - causes error
<Link href="/assignment/1">
  <Button>Start Grading</Button>
</Link>
```

**Solution:**
```tsx
// ✅ CORRECT - Link styled as button
<Link
  href="/assignment/1"
  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F4E8C]
             text-white rounded-lg hover:bg-[#1E3A5F]"
>
  Start Grading
</Link>

// OR for HeroUI Button specifically
<Button
  as={Link}
  href="/assignment/1"
  className="bg-[#1F4E8C] text-white"
>
  Start Grading
</Button>
```

### ❌ Problem 3: Max-Width Creates Excessive Padding

**Issue:** Using `max-w-7xl mx-auto` leaves too much empty space on large screens.

**Example:**
```tsx
// ❌ Creates unwanted margins
<div className="max-w-7xl mx-auto px-6 py-6">
```

**Solution:**
```tsx
// ✅ Uses full available width
<div className="w-full px-6 py-6">
```

### ❌ Problem 4: Wrong Page Background

**Issue:** HeroUI or browser defaults override your intended background.

**Solution:** Set it in three places for certainty:
```css
/* globals.css */
html, body { background-color: #F8F9FA; }
```
```tsx
/* layout.tsx */
<div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
```

### ❌ Problem 5: Sidebar/Content Misalignment

**Issue:** Content overlaps sidebar or has wrong margin.

**Solution:** Strict sizing
```tsx
<aside className="fixed left-0 top-0 w-60 ..."> {/* 240px */}
<main className="ml-60 ..."> {/* Must match exactly */}
```

### ❌ Problem 6: Wrong Active State Color

**Issue:** Making active nav items dark blue fills instead of light blue.

**Wrong:**
```tsx
isActive ? 'bg-[#1F4E8C] text-white' : '...'
```

**Correct:**
```tsx
isActive ? 'bg-blue-50 text-[#1F4E8C]' : '...'
```

---

## Quick Reference

### Color Cheatsheet

```tsx
// Backgrounds
bg-[#F8F9FA]    // Page
bg-white        // Cards
bg-slate-50     // Subtle fills, hover states
bg-blue-50      // Active nav items

// Text
text-slate-900  // Headings, primary
text-slate-700  // Body text
text-slate-500  // Secondary, metadata
text-slate-400  // Muted, placeholders
text-[#1F4E8C]  // Brand, links

// Borders
border-slate-200  // Card borders, dividers
border-slate-300  // Hover states

// Semantic
text-red-600      // Past due, errors
text-amber-600    // Flags, warnings
text-emerald-600  // Success, released
```

### Shadow Cheatsheet

```tsx
// Inline only - no Tailwind equivalent
style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}  // Cards
style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}  // Dropdowns
```

### Spacing Cheatsheet

```tsx
// Padding
p-5               // Card content (20px)
px-6 py-6         // Page padding (24px)
px-5 py-4         // Course headers (20px x 16px)
py-2.5            // Form elements (~10px)

// Gaps
gap-4             // Standard spacing (16px)
gap-3             // Tight spacing (12px)
gap-2             // Minimal spacing (8px)
```

### File Structure

```
src/
├── app/
│   ├── globals.css          # Theme overrides
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # My Classes (Screen 1)
│   ├── assignment/
│   │   └── [id]/
│   │       └── page.tsx     # Assignment Overview (Screen 2)
│   ├── grading/
│   │   └── [id]/
│   │       └── page.tsx     # Grading (Screen 3)
│   └── ...
├── components/
│   ├── sidebar.tsx          # Navigation
│   ├── header.tsx           # Page header
│   └── ui/                  # Reusable components
│       ├── dropdown.tsx
│       ├── progress-blocks.tsx
│       └── segmented-tabs.tsx
```

---

## Development Workflow

### Starting a New Screen

1. **Copy the page template** from above
2. **Add route** to sidebar navigation
3. **Match the data structure** from the spec document
4. **Use exact colors** from this guide
5. **Test against deployed app** side-by-side

### Verification Checklist

Before marking a screen complete:

- [ ] Background is `#F8F9FA`
- [ ] Cards have correct shadow (inline style)
- [ ] Typography hierarchy matches
- [ ] Buttons use correct colors
- [ ] One CTA per card rule followed
- [ ] Deadlines are plain text (no colored labels)
- [ ] Sidebar active state is light blue
- [ ] Responsive works at 1280px+
- [ ] No console errors (especially hydration)

### Side-by-Side Comparison

Keep the deployed app open while developing:

```bash
# Terminal 1: Local dev
npm run dev

# Browser setup:
# Left half: http://localhost:3000
# Right half: https://educ-a-itors-bice.vercel.app/
```

---

## Resources

### Deployed Reference
- **URL**: https://educ-a-itors-bice.vercel.app/
- **CSS**: `https://educ-a-itors-bice.vercel.app/assets/index-CAayEfEL.css`

### Documentation
- **HeroUI v3**: https://v3.heroui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Lucide Icons**: https://lucide.dev/icons/

### Design Spec
- **Full UX Document**: `/Users/sangeeth.kumar/Desktop/newedu.md`
- **9 Screens Detailed**: User goals, business goals, wireframes

---

## Team Notes

### What We've Built So Far

- ✅ **Screen 1 — My Classes**: Complete
  - Two-view toggle (Course/Assignment)
  - Dynamic stat cards
  - Expandable course cards
  - Progress blocks
  - Search + filters

- 🔄 **Screens 2-9**: In progress
  - Following same patterns established in Screen 1

### Decisions Made

1. **Custom dropdowns over HeroUI** — Better control, fewer bugs
2. **Inline shadows over Tailwind** — Exact match required
3. **Progress blocks over bars** — Matches deployed app exactly
4. **Single CTA per card** — UX decision from spec
5. **Plain deadline text** — No colored status labels (deadlines speak for themselves)

### Questions?

Refer to:
1. This document (DESIGN_SYSTEM.md)
2. The deployed app (visual reference)
3. The UX spec (behavioral reference)
4. Screen 1 implementation (code reference)

---

*Document version: 1.0*
*Created: April 2026*
*Project: EducAItors Teacher Module*
