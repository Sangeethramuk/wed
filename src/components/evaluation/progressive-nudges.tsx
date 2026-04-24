"use client"

/**
 * Progressive engagement nudges + passive verification tags for the grading desk.
 *
 * This module implements Phase 1 of the "continuous assurance" model that replaces
 * the old end-of-session spot check as a hard gate. Instead of one big verification
 * flow at the end, we:
 *
 *   1. Track lightweight per-criterion telemetry (open time, confirm time, evidence
 *      opens, override flag) driven by existing user actions — no new event sources.
 *   2. Render a passive state tag next to each criterion ("Pending", "Verified",
 *      "Quick review", "Not verified") so the instructor can see engagement signal
 *      at a glance.
 *   3. Surface 3 contextual nudges:
 *         A) Didn't scroll to the end of the paper
 *         B) Confirmed a criterion in < 8s without opening evidence
 *         C) Agreed with AI 6+ times in a row with no overrides
 *      Each nudge is an inline Alert with a concrete action — dismissable,
 *      non-blocking, and self-clearing when the underlying behavior corrects.
 *   4. A DemoControlPanel floating button for presenting the flows without
 *      having to grade through a whole session.
 */

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  EyeOff,
  Play,
  RotateCcw,
  ScanSearch,
  Sparkles,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

// ---------- Telemetry types ----------

export type CriterionTelemetry = {
  /** When the criterion card was first expanded / made active. */
  openedAt?: number
  /** When Confirm / override was submitted. */
  confirmedAt?: number
  /** Click count on evidence chips / evidence scroll targets for this criterion. */
  evidenceOpens: number
  /** Whether the instructor submitted a different score than the AI proposal. */
  wasOverridden: boolean
  /** Whether the instructor typed any reasoning for an override. */
  hasReasoning: boolean
}

export type SessionTelemetry = {
  sessionStartAt: number
  /** keyed as `${studentId}:${criterionId}` */
  byCriterion: Record<string, CriterionTelemetry>
  /** Consecutive Confirm actions (no override) in this session. Resets on any override. */
  consecutiveAgreements: number
  /** 0–1, max manuscript scroll percentage reached this session (per student). */
  maxScrollByStudent: Record<string, number>
}

export const EMPTY_CRITERION_TELEMETRY: CriterionTelemetry = {
  evidenceOpens: 0,
  wasOverridden: false,
  hasReasoning: false,
}

export function emptySessionTelemetry(): SessionTelemetry {
  return {
    sessionStartAt: Date.now(),
    byCriterion: {},
    consecutiveAgreements: 0,
    maxScrollByStudent: {},
  }
}

export function telemetryKey(studentId: string, criterionId: string) {
  return `${studentId}:${criterionId}`
}

// ---------- Tag derivation ----------

export type TagKey = "pending" | "verified" | "quick-review" | "not-verified"

/** Threshold below which a Confirm counts as "quick" and may warrant a nudge. */
export const FAST_CONFIRM_MS = 8_000

export function deriveTag(t: CriterionTelemetry | undefined): TagKey {
  if (!t?.confirmedAt) return "pending"
  const duration = t.openedAt ? t.confirmedAt - t.openedAt : Infinity
  const engaged = t.wasOverridden || t.hasReasoning || t.evidenceOpens > 0
  if (engaged) return "verified"
  if (duration < FAST_CONFIRM_MS) return "quick-review"
  return "not-verified"
}

// ---------- CriterionStatusTag ----------

const TAG_META: Record<TagKey, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "border-border bg-muted/40 text-muted-foreground",
  },
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    className:
      "border-[color:var(--status-success)]/30 bg-[color:var(--status-success-bg)] text-[color:var(--status-success)]",
  },
  "quick-review": {
    label: "Quick review",
    icon: Clock,
    className:
      "border-[color:var(--status-warning)]/30 bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)]",
  },
  "not-verified": {
    label: "Not verified",
    icon: EyeOff,
    className:
      "border-[color:var(--status-error)]/30 bg-[color:var(--status-error-bg)] text-[color:var(--status-error)]",
  },
}

export function CriterionStatusTag({ tag }: { tag: TagKey }) {
  const meta = TAG_META[tag]
  const Icon = meta.icon
  return (
    <Badge
      variant="outline"
      className={`rounded-full h-5 px-2 gap-1 text-[10px] font-semibold ${meta.className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  )
}

// ---------- Nudge logic (derived from telemetry) ----------

export type NudgeVisibility = { A: boolean; B: string | null; C: boolean }

/**
 * Pure derivation of natural nudge triggers from telemetry.
 * A and C are booleans; B carries the criterion id that just fast-confirmed (or null).
 *
 * Callers may OR these with demo-panel force flags so a nudge can be shown
 * without the underlying behavior occurring.
 */
export function deriveNudges(
  telemetry: SessionTelemetry,
  studentId: string,
  rubricCriterionIds: string[],
  lastConfirmedCriterion: { id: string; at: number } | null
): NudgeVisibility {
  // Nudge A — instructor confirmed 2+ criteria but manuscript scroll < 75%
  const confirmedCount = rubricCriterionIds.filter(
    (cid) => telemetry.byCriterion[telemetryKey(studentId, cid)]?.confirmedAt
  ).length
  const maxScroll = telemetry.maxScrollByStudent[studentId] ?? 0
  const nudgeA = confirmedCount >= 2 && maxScroll < 0.75

  // Nudge B — the most-recent Confirm happened in < FAST_CONFIRM_MS and had no evidence + no override
  let nudgeB: string | null = null
  if (lastConfirmedCriterion) {
    const t = telemetry.byCriterion[telemetryKey(studentId, lastConfirmedCriterion.id)]
    if (t && !t.wasOverridden && !t.hasReasoning && t.evidenceOpens === 0) {
      const duration = t.openedAt ? t.confirmedAt! - t.openedAt : Infinity
      if (duration < FAST_CONFIRM_MS) nudgeB = lastConfirmedCriterion.id
    }
  }

  // Nudge C — 6+ consecutive agreements
  const nudgeC = telemetry.consecutiveAgreements >= 6

  return { A: nudgeA, B: nudgeB, C: nudgeC }
}

// ---------- Nudge banner components ----------

type NudgeProps = {
  onDismiss: () => void
}

export function IncompleteScrollNudge({ onDismiss }: NudgeProps) {
  return (
    <Alert variant="info">
      <Sparkles className="h-4 w-4" />
      <AlertTitle className="text-sm font-semibold">
        Quick check — the last section might still have evidence
      </AlertTitle>
      <AlertDescription className="text-xs">
        Scrolling through the rest of the paper makes sure your grades cover
        everything — and keeps this session from needing a final review.
      </AlertDescription>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-1.5 right-1.5 h-6 w-6 p-0"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </Button>
    </Alert>
  )
}

export function FastConfirmNudge({
  criterionLabel,
  onReopen,
  onDismiss,
}: {
  criterionLabel: string
  onReopen: () => void
  onDismiss: () => void
}) {
  return (
    <Alert variant="warning">
      <Clock className="h-4 w-4" />
      <AlertTitle className="text-sm font-semibold">
        You confirmed {criterionLabel} in a few seconds
      </AlertTitle>
      <AlertDescription className="text-xs">
        A quick evidence scroll makes this grade stick — evidence-backed
        scores don&apos;t get pulled into a final review.
      </AlertDescription>
      <div className="flex items-center gap-2 mt-2">
        <Button size="sm" variant="default" onClick={onReopen}>
          Reopen evidence
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Skip
        </Button>
      </div>
    </Alert>
  )
}

export function AgreementStreakNudge({ onDismiss }: NudgeProps) {
  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm font-semibold">
        You&apos;ve agreed with the AI 6 times in a row
      </AlertTitle>
      <AlertDescription className="text-xs">
        Taking a harder look at this next one — even a single override —
        keeps your session sharp and the final grades easier to defend.
      </AlertDescription>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-1.5 right-1.5 h-6 w-6 p-0"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </Button>
    </Alert>
  )
}

// ---------- Demo control panel ----------

export type DemoControls = {
  onTriggerA: () => void
  onTriggerB: () => void
  onTriggerC: () => void
  onOpenSpotCheck: () => void
  onResetTelemetry: () => void
}

/**
 * Floating panel (bottom-right of the grading workspace) that exposes
 * every nudge flow and the existing spot-check modal without requiring
 * the instructor to grade through a real session. Prototype-only — add
 * a feature flag in production.
 */
export function DemoControlPanel(ctrl: DemoControls) {
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <Popover>
        <PopoverTrigger
          className="inline-flex items-center gap-1.5 rounded-full shadow-lg bg-background border border-primary/40 text-primary hover:bg-primary/5 h-9 px-4 text-sm font-medium"
        >
          <Sparkles className="h-4 w-4" />
          Demo
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-64 p-2">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-foreground">Demo controls</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Trigger every flow without grading a full session.
            </p>
          </div>
          <Separator className="my-1" />
          <p className="eyebrow text-muted-foreground px-2 py-1">Progressive nudges</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 font-normal"
            onClick={ctrl.onTriggerA}
          >
            <Play className="h-3.5 w-3.5 text-[color:var(--status-info)]" />
            Nudge A — incomplete scroll
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 font-normal"
            onClick={ctrl.onTriggerB}
          >
            <Play className="h-3.5 w-3.5 text-[color:var(--status-warning)]" />
            Nudge B — fast confirm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 font-normal"
            onClick={ctrl.onTriggerC}
          >
            <Play className="h-3.5 w-3.5 text-[color:var(--status-warning)]" />
            Nudge C — agreement streak
          </Button>
          <Separator className="my-1" />
          <p className="eyebrow text-muted-foreground px-2 py-1">Spot check</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 font-normal"
            onClick={ctrl.onOpenSpotCheck}
          >
            <ScanSearch className="h-3.5 w-3.5 text-primary" />
            Open spot-check modal
          </Button>
          <Separator className="my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 font-normal text-muted-foreground"
            onClick={ctrl.onResetTelemetry}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset session telemetry
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ---------- FloatingNudgeStack ----------

/**
 * Fixed-position slide-in container that renders the three progressive nudges
 * in the top-right corner of the viewport. Replaces the inline rubric-sidebar
 * banners — nudges no longer steal vertical space from the rubric panel.
 *
 * Each nudge animates in from the right on mount and out on unmount via
 * framer-motion. Stacking order is B (most contextual) → A → C from top.
 */
export function FloatingNudgeStack({
  showA,
  showBCriterionLabel,
  showC,
  onDismissA,
  onDismissB,
  onDismissC,
  onReopenEvidence,
}: {
  showA: boolean
  /** Criterion label to show in Nudge B, or null if Nudge B is not active. */
  showBCriterionLabel: string | null
  showC: boolean
  onDismissA: () => void
  onDismissB: () => void
  onDismissC: () => void
  onReopenEvidence: () => void
}) {
  return (
    <div className="fixed top-20 right-6 z-40 flex flex-col gap-3 w-[22rem] max-w-[calc(100vw-3rem)] pointer-events-none">
      <AnimatePresence initial={false}>
        {showBCriterionLabel && (
          <motion.div
            key="nudge-B"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="pointer-events-auto"
          >
            <FastConfirmNudge
              criterionLabel={showBCriterionLabel}
              onReopen={onReopenEvidence}
              onDismiss={onDismissB}
            />
          </motion.div>
        )}
        {showA && (
          <motion.div
            key="nudge-A"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="pointer-events-auto"
          >
            <IncompleteScrollNudge onDismiss={onDismissA} />
          </motion.div>
        )}
        {showC && (
          <motion.div
            key="nudge-C"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="pointer-events-auto"
          >
            <AgreementStreakNudge onDismiss={onDismissC} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

