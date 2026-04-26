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
  RotateCcw,
  ScanSearch,
  Sparkles,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

/**
 * How many times the instructor can dismiss a nudge without taking the
 * productive action before the session escalates to Level 3 (failsafe
 * spot check). Each un-productive dismiss ticks the counter:
 *   - Nudge A — X dismiss (not paired with scrolling past 75%)
 *   - Nudge B — Skip (not Reopen evidence)
 *   - Nudge C — X dismiss (not paired with an override)
 * Reaching the threshold auto-triggers the existing spot-check modal once.
 */
export const ESCALATION_DISMISS_THRESHOLD = 3

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

type NudgeSeverity = "info" | "warning"

/**
 * Shared layout for the 3 floating nudge cards. Previously wrapped the
 * shadcn Alert primitive, but Alert's internal 2-column grid (icon + content)
 * cramped titles on narrow viewports. This custom card gives:
 *
 *   - Solid bg-background (toast-opaque — no bleed-through from rubric content)
 *   - shadow-xl for floating depth
 *   - 4px severity-colored left accent (preserves info/warning signal)
 *   - Header row: icon + title + close button on one line; title wraps freely
 *   - Description: full width under the header, comfortable line-length
 *   - Actions: stacked at bottom, left-aligned
 */
function NudgeCard({
  severity,
  icon: Icon,
  title,
  description,
  actions,
  onDismiss,
}: {
  severity: NudgeSeverity
  icon: typeof Clock
  title: React.ReactNode
  description: React.ReactNode
  actions?: React.ReactNode
  onDismiss?: () => void
}) {
  const accent =
    severity === "info"
      ? "border-l-[color:var(--status-info)]"
      : "border-l-[color:var(--status-warning)]"
  const iconColor =
    severity === "info"
      ? "text-[color:var(--status-info)]"
      : "text-[color:var(--status-warning)]"
  return (
    <div
      role="status"
      className={`relative w-full rounded-lg border border-border ${accent} border-l-4 bg-background shadow-xl p-4`}
    >
      <div className="flex items-start gap-3 pr-6">
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
        <p className="text-sm font-semibold text-foreground leading-snug flex-1">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 pl-7 pr-1">
        {description}
      </p>
      {actions && <div className="flex items-center gap-2 mt-3 pl-7">{actions}</div>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function IncompleteScrollNudge({ onDismiss }: NudgeProps) {
  return (
    <NudgeCard
      severity="info"
      icon={Sparkles}
      title="Quick check — the last section might still have evidence"
      description="Scrolling through the rest of the paper makes sure your grades cover everything — and keeps this session from needing a final review."
      onDismiss={onDismiss}
    />
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
    <NudgeCard
      severity="warning"
      icon={Clock}
      title={<>You confirmed <span className="text-foreground">{criterionLabel}</span> in a few seconds</>}
      description="A quick evidence scroll makes this grade stick — evidence-backed scores don't get pulled into a final review."
      actions={
        <>
          <Button size="sm" variant="default" onClick={onReopen}>
            Reopen evidence
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            Skip
          </Button>
        </>
      }
    />
  )
}

export function AgreementStreakNudge({ onDismiss }: NudgeProps) {
  return (
    <NudgeCard
      severity="warning"
      icon={AlertTriangle}
      title="You've agreed with the AI 6 times in a row"
      description="Taking a harder look at this next one — even a single override — keeps your session sharp and the final grades easier to defend."
      onDismiss={onDismiss}
    />
  )
}

// ---------- Demo control panel ----------

export type DemoControls = {
  onTriggerA?: () => void
  onTriggerB?: () => void
  onTriggerC?: () => void
  /** Simulate 3 ignored nudges — auto-fires the spot-check failsafe. */
  onSimulateEscalation?: () => void
  onOpenSpotCheck?: () => void
  onResetTelemetry?: () => void
  // ── Calibration flow demo (mounted on /calibrate) ──────────────────────
  /** Jump to the delta-review state with seeded discrepancies. */
  onShowDeltaReview?: () => void
  /** Jump to the negotiation state with seeded discrepancies. */
  onShowNegotiation?: () => void
  /** Trigger the final \"Updating Calibration\" loading modal. */
  onShowCalibrationComplete?: () => void
  // ── Publish flow demo ─────────────────────────────────────────────────
  /** Mark every submission ready so the cohort Publish grades CTA
   *  activates on the assignment detail page. */
  onMarkAllReadyToPublish?: () => void
}

/**
 * Floating panel (bottom-right of the grading workspace) that exposes
 * every nudge flow and the existing spot-check modal without requiring
 * the instructor to grade through a real session. Prototype-only — add
 * a feature flag in production.
 */
export function DemoControlPanel(ctrl: DemoControls) {
  const hasNudges = ctrl.onTriggerA || ctrl.onTriggerB || ctrl.onTriggerC
  const hasCalibration =
    ctrl.onShowDeltaReview || ctrl.onShowNegotiation || ctrl.onShowCalibrationComplete
  const hasPublish = !!ctrl.onMarkAllReadyToPublish
  const hasFinalization = !!ctrl.onSimulateEscalation
  const hasSpotCheck = !!ctrl.onOpenSpotCheck
  const hasReset = !!ctrl.onResetTelemetry

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <Popover>
        <PopoverTrigger
          className="inline-flex items-center gap-1.5 rounded-full shadow-lg bg-background border border-primary/40 text-primary hover:bg-primary/5 h-9 px-4 text-sm font-medium"
        >
          <Sparkles className="h-4 w-4" />
          Demo
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-[340px] p-0 overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/40">
            <p className="text-xs font-semibold text-foreground">Demo controls</p>
            <p className="text-[10px] text-muted-foreground/80 mt-0.5">
              Shortcuts to every flow — no full session needed.
            </p>
          </div>

          {/* Scrollable body — sections in a 2-col grid */}
          <div className="max-h-[70vh] overflow-y-auto p-2 space-y-2">
            {hasCalibration && (
              <DemoSection title="Calibration flow">
                {ctrl.onShowDeltaReview && (
                  <DemoBtn
                    label="Delta review"
                    onClick={ctrl.onShowDeltaReview}
                    color="var(--status-info)"
                  />
                )}
                {ctrl.onShowNegotiation && (
                  <DemoBtn
                    label="Resolve diffs"
                    onClick={ctrl.onShowNegotiation}
                    color="var(--status-warning)"
                  />
                )}
                {ctrl.onShowCalibrationComplete && (
                  <DemoBtn
                    label="Completion"
                    onClick={ctrl.onShowCalibrationComplete}
                    color="var(--status-success)"
                  />
                )}
              </DemoSection>
            )}

            {hasNudges && (
              <DemoSection title="Progressive nudges">
                {ctrl.onTriggerA && (
                  <DemoBtn
                    label="Nudge A"
                    sub="scroll"
                    onClick={ctrl.onTriggerA}
                    color="var(--status-info)"
                  />
                )}
                {ctrl.onTriggerB && (
                  <DemoBtn
                    label="Nudge B"
                    sub="fast confirm"
                    onClick={ctrl.onTriggerB}
                    color="var(--status-warning)"
                  />
                )}
                {ctrl.onTriggerC && (
                  <DemoBtn
                    label="Nudge C"
                    sub="streak"
                    onClick={ctrl.onTriggerC}
                    color="var(--status-warning)"
                  />
                )}
              </DemoSection>
            )}

            {hasPublish && (
              <DemoSection title="Publish">
                {ctrl.onMarkAllReadyToPublish && (
                  <DemoBtn
                    label="Mark all submissions ready"
                    onClick={ctrl.onMarkAllReadyToPublish}
                    color="var(--status-success)"
                    full
                  />
                )}
              </DemoSection>
            )}

            {(hasFinalization || hasSpotCheck) && (
              <DemoSection title="Gates">
                {hasFinalization && (
                  <DemoBtn
                    icon={<AlertTriangle className="h-3 w-3 text-[color:var(--status-error)]" />}
                    label="Low-engagement"
                    onClick={ctrl.onSimulateEscalation!}
                    color="var(--status-error)"
                  />
                )}
                {hasSpotCheck && (
                  <DemoBtn
                    icon={<ScanSearch className="h-3 w-3 text-primary" />}
                    label="Spot-check"
                    onClick={ctrl.onOpenSpotCheck!}
                    color="var(--primary)"
                  />
                )}
              </DemoSection>
            )}

            {hasReset && (
              <div className="pt-1 border-t border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 font-normal text-muted-foreground h-7 text-xs"
                  onClick={ctrl.onResetTelemetry}
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset session telemetry
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Compact section + button primitives for the demo popover.

function DemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="eyebrow text-muted-foreground/70 px-1 text-[9px]">{title}</p>
      <div className="grid grid-cols-2 gap-1">{children}</div>
    </div>
  )
}

function DemoBtn({
  label, onClick, color, sub, full, icon,
}: {
  label: string
  onClick: () => void
  color: string
  sub?: string
  full?: boolean
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1.5 h-8 px-2 rounded-md border border-border/40 hover:border-foreground/20 hover:bg-muted/40 transition-colors text-left ${
        full ? "col-span-2" : ""
      }`}
    >
      {icon ?? (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 80%, transparent)` }}
        />
      )}
      <span className="flex-1 min-w-0 text-[11px] font-medium text-foreground truncate">
        {label}
      </span>
      {sub && (
        <span className="text-[9px] text-muted-foreground/70 shrink-0">{sub}</span>
      )}
    </button>
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

