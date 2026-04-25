"use client"

import { useRouter, usePathname } from "next/navigation"
import { useGradingStore } from "@/lib/store/grading-store"
import { DemoControlPanel } from "@/components/evaluation/progressive-nudges"
import { ESCALATION_DISMISS_THRESHOLD } from "@/components/evaluation/progressive-nudges"

// Default targets used when a demo trigger needs a concrete assignment id.
// AI-ETH-01 has calibration in progress; SWE-PH2 has grading in progress.
const DEMO_CALIBRATION_ID = "AI-ETH-01"
const DEMO_GRADING_ID = "SWE-PH2"

/**
 * Single floating demo button mounted at the dashboard layout. Routes the
 * user to the appropriate page (and pre-sets store state / query params)
 * so every flow is reachable in one click from anywhere in the app.
 */
export function GlobalDemoControl() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    triggerSpotCheck,
    seedCalibrationForDemo,
    setCalibrationPhase,
    initCalibration,
    resolveAllCalibrationScores,
    incrementIgnoredNudge,
    markSpotCheckAutoFired,
    resetProgressiveNudges,
  } = useGradingStore()

  // Don't render on non-dashboard routes (e.g., the public landing page).
  if (!pathname?.startsWith("/dashboard")) return null

  const goCalibrate = () =>
    router.push(`/dashboard/evaluation/${DEMO_CALIBRATION_ID}/calibrate`)

  const goGrading = (demo: string) =>
    router.push(`/dashboard/evaluation/${DEMO_GRADING_ID}/grading?demo=${demo}`)

  return (
    <DemoControlPanel
      // ── Calibration flow ───────────────────────────────────────────────
      onShowDeltaReview={() => {
        initCalibration(DEMO_CALIBRATION_ID)
        seedCalibrationForDemo(DEMO_CALIBRATION_ID)
        setCalibrationPhase(DEMO_CALIBRATION_ID, "delta_review")
        goCalibrate()
      }}
      onShowNegotiation={() => {
        initCalibration(DEMO_CALIBRATION_ID)
        seedCalibrationForDemo(DEMO_CALIBRATION_ID)
        setCalibrationPhase(DEMO_CALIBRATION_ID, "negotiation")
        goCalibrate()
      }}
      onShowCalibrationComplete={() => {
        initCalibration(DEMO_CALIBRATION_ID)
        seedCalibrationForDemo(DEMO_CALIBRATION_ID)
        setCalibrationPhase(DEMO_CALIBRATION_ID, "negotiation")
        goCalibrate()
        // Resolve everything after navigation so NegotiationDialogue's
        // useEffect picks it up and fires the loading modal.
        setTimeout(() => resolveAllCalibrationScores(DEMO_CALIBRATION_ID), 250)
      }}
      // ── Progressive nudges ─────────────────────────────────────────────
      // Routed through query params so the grading-page's local state can
      // pick them up via useEffect.
      onTriggerA={() => goGrading("nudgeA")}
      onTriggerB={() => goGrading("nudgeB")}
      onTriggerC={() => goGrading("nudgeC")}
      // ── Finalization gate / spot check ─────────────────────────────────
      onSimulateEscalation={() => {
        // Identical effect to the per-page demo: ignore N nudges then fire
        // the spot-check failsafe. Doesn't require the grading page.
        resetProgressiveNudges()
        for (let i = 0; i < ESCALATION_DISMISS_THRESHOLD; i++) incrementIgnoredNudge()
        markSpotCheckAutoFired()
        triggerSpotCheck()
      }}
      onOpenSpotCheck={() => triggerSpotCheck()}
      onResetTelemetry={() => {
        resetProgressiveNudges()
        // Local React state on the grading page will reset on its next
        // mount (or via the ?demo=reset query param if currently viewing).
        if (pathname?.includes("/grading")) {
          router.push(`${pathname}?demo=reset`)
        }
      }}
    />
  )
}
