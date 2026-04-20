/**
 * Central design-system tokens.
 *
 * All color/status/category decisions in the product flow through this file.
 * No hex, rgb, or oklch literals here — every value references a CSS variable
 * defined in src/app/globals.css so themes can be swapped at runtime.
 *
 * Add a new status / category / confidence level here, then call it by key
 * from components via the DS primitives in src/components/ui/.
 */

type StylePair = {
  /** Tailwind class for the tinted background. */
  bg: string;
  /** Tailwind class for the foreground / text color. */
  text: string;
  /** Tailwind class for a solid dot / fill. */
  dot: string;
  /** Tailwind class for a border at the same hue. */
  border: string;
};

const token = (hueVar: string, bgVar: string): StylePair => ({
  bg: `bg-[color:var(${bgVar})]`,
  text: `text-[color:var(${hueVar})]`,
  dot: `bg-[color:var(${hueVar})]`,
  border: `border-[color:var(${hueVar})]`,
});

export const statusStyles = {
  success: token("--status-success", "--status-success-bg"),
  warning: token("--status-warning", "--status-warning-bg"),
  error: token("--status-error", "--status-error-bg"),
  info: token("--status-info", "--status-info-bg"),
  neutral: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    border: "border-border",
  },
} as const satisfies Record<string, StylePair>;

export type StatusKey = keyof typeof statusStyles;

export const workflowStatusStyles: Record<
  "calibrated" | "in-progress" | "not-started" | "overdue" | "complete",
  StylePair
> = {
  calibrated: statusStyles.success,
  complete: statusStyles.success,
  "in-progress": statusStyles.warning,
  "not-started": statusStyles.neutral,
  overdue: statusStyles.error,
};

export type WorkflowStatusKey = keyof typeof workflowStatusStyles;

export const categoryStyles = {
  "Computer Science": token("--category-1", "--category-1-bg"),
  "Information Technology": token("--category-2", "--category-2-bg"),
  Electronics: token("--category-3", "--category-3-bg"),
  Mathematics: token("--category-4", "--category-4-bg"),
  Physics: token("--category-5", "--category-5-bg"),
  Chemistry: token("--category-6", "--category-6-bg"),
} as const satisfies Record<string, StylePair>;

export type CategoryKey = keyof typeof categoryStyles;

export const confidenceStyles = {
  high: statusStyles.success,
  med: statusStyles.warning,
  low: statusStyles.error,
} as const satisfies Record<string, StylePair>;

export type ConfidenceKey = keyof typeof confidenceStyles;

/**
 * Rubric criterion colors. Mirror the 6 category slots 1:1 so criteria
 * share the same palette as departments — no extra CSS vars needed.
 */
export const criterionStyles = {
  c1: token("--category-1", "--category-1-bg"),
  c2: token("--category-2", "--category-2-bg"),
  c3: token("--category-3", "--category-3-bg"),
  c4: token("--category-4", "--category-4-bg"),
  c5: token("--category-5", "--category-5-bg"),
  c6: token("--category-6", "--category-6-bg"),
} as const satisfies Record<string, StylePair>;

export type CriterionKey = keyof typeof criterionStyles;

export const artifactStyles = {
  pdf: statusStyles.error,
  docx: statusStyles.info,
  video: token("--category-2", "--category-2-bg"),
  code: statusStyles.success,
  image: token("--category-5", "--category-5-bg"),
  other: statusStyles.neutral,
} as const satisfies Record<string, StylePair>;

export type ArtifactKey = keyof typeof artifactStyles;

/**
 * Fallback resolver so untracked category strings do not break the UI.
 * Rotates through the 6 category slots based on hash of the name.
 */
export function resolveCategory(name: string): StylePair {
  if (name in categoryStyles) {
    return categoryStyles[name as CategoryKey];
  }
  const slots = [
    categoryStyles["Computer Science"],
    categoryStyles["Information Technology"],
    categoryStyles.Electronics,
    categoryStyles.Mathematics,
    categoryStyles.Physics,
    categoryStyles.Chemistry,
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return slots[hash % slots.length];
}
