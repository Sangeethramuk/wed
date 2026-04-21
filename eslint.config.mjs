import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/components/ui/**",
      "src/lib/design-tokens.ts",
      "src/lib/data/re-evaluation-data.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/text-\\[\\d+px\\]/]",
          message:
            "[DS] Use Tailwind font-size tokens (text-xs, text-sm, text-base, text-lg, text-xl, ...) instead of arbitrary text-[Npx].",
        },
        {
          selector: "Literal[value=/\\buppercase\\b/]",
          message:
            "[DS] The design system forbids `uppercase`. Use sentence case. If you need an editorial label, use the `.eyebrow` class.",
        },
        {
          selector: "Literal[value=/tracking-\\[0?\\.[0-9]+em\\]/]",
          message:
            "[DS] Use Tailwind tracking tokens (tracking-tight, tracking-wider, tracking-widest) instead of arbitrary tracking-[Nem].",
        },
        {
          selector:
            "Literal[value=/(bg|text|border|ring|from|to|via|decoration|divide|outline)-\\[#[0-9a-fA-F]{3,8}\\]/]",
          message:
            "[DS] No hex literals in Tailwind arbitrary values. Use CSS-variable tokens (bg-primary, text-muted-foreground, or bg-[color:var(--status-error)] via src/lib/design-tokens.ts).",
        },
        {
          selector: "Literal[value=/rgba?\\s*\\(/]",
          message:
            "[DS] No rgba()/rgb() literals. Use CSS-variable tokens from src/app/globals.css with Tailwind opacity modifiers (bg-muted/40).",
        },
        {
          selector:
            "Literal[value=/\\bbg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+/]",
          message:
            "[DS] Use semantic tokens (bg-primary, bg-muted, bg-card) or design-system primitives (CategoryBadge, StatusBadge) instead of named Tailwind hues.",
        },
        {
          selector:
            "JSXAttribute[name.name='style'] ObjectExpression Property[key.name=/^(color|background|backgroundColor|fontFamily|fontSize|letterSpacing|textTransform)$/]",
          message:
            "[DS] Do not set color/background/font via inline style. Use Tailwind classes backed by CSS-variable tokens.",
        },
      ],
    },
  },
]);

export default eslintConfig;
