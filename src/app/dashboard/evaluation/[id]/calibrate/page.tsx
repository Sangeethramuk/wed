"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useGradingStore } from "@/lib/store/grading-store"
import { SampleReview } from "@/components/evaluation/calibration/sample-review"
import { BlindGradingPanel } from "@/components/evaluation/calibration/blind-grading-panel"
import { DeltaMatrix } from "@/components/evaluation/calibration/delta-matrix"
import { NegotiationDialogue } from "@/components/evaluation/calibration/negotiation-dialogue"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CloudCheck } from "lucide-react"

const PHASE_STEPS = [
  { id: "blind_grading", label: "Blind Grading", step: 1 },
  { id: "delta_review", label: "Scoring Summary", step: 2 },
  { id: "negotiation", label: "Review Differences", step: 3 },
  { id: "complete", label: "Complete", step: 4 },
]

export default function CalibratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { calibration, initCalibration, setCalibrationPhase } = useGradingStore()

  const cal = calibration[id]

  // The SampleReview intro card re-shows on every fresh load of /calibrate
  // — first-time visitors see the Begin state, returning visitors see the
  // Continue copy (computed inside SampleReview from cal.scores).
  // Clicking Begin/Continue flips this gate so the rest of the calibration
  // UI (BlindGradingPanel, DeltaMatrix, etc.) takes over for the session.
  const [hasBegun, setHasBegun] = useState(false)

  useEffect(() => {
    // Initialize calibration only once on mount
    initCalibration(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - run once on mount

  // Redirect when calibration completes
  useEffect(() => {
    if (cal?.phase === "complete") {
      router.replace(`/dashboard/evaluation/${id}`)
    }
  }, [cal?.phase, id, router])

  if (!cal || cal.phase === "not_started") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="eyebrow text-muted-foreground/40">Initializing Calibration Protocol…</p>
        </div>
      </div>
    )
  }

  if (cal.phase === "complete") return null

  // Intermediate landing: show the SampleReview intro card until the user
  // clicks Begin/Continue. First visits see "Before you see any AI scores";
  // returning visits (some papers already scored) see the Continue variant.
  if (!hasBegun) {
    return <SampleReview assignmentId={id} onBegin={() => setHasBegun(true)} />
  }

  const currentStep = PHASE_STEPS.find(s => s.id === cal.phase)
  const nextStep = PHASE_STEPS.find(s => s.step === (currentStep?.step ?? 0) + 1)
  const totalPapers = cal.papers.length
  const gradedCount = cal.papers.filter(p =>
    cal.scores.filter(s => s.paperId === p.paperId).every(s => s.instructorLevel > 0)
  ).length

  const progressPercent = ((currentStep?.step ?? 1) - 1) / (PHASE_STEPS.length - 1) * 100

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 pt-4 pb-4">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {cal.phase === "blind_grading" ? (
                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/evaluation/${id}`)}>
                  <ArrowLeft /> Back
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => {
                  const prevStep = PHASE_STEPS.find(s => s.step === (currentStep?.step ?? 1) - 1)
                  if (prevStep) setCalibrationPhase(id, prevStep.id as Parameters<typeof setCalibrationPhase>[1])
                }}>
                  <ArrowLeft /> Back
                </Button>
              )}
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-foreground">
                  Step {currentStep?.step ?? 1} of {PHASE_STEPS.length - 1}
                </span>
                <span className="text-muted-foreground">— {currentStep?.label}</span>
                {nextStep && nextStep.id !== "complete" && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-muted-foreground/70">Next: {nextStep.label}</span>
                  </>
                )}
              </div>
              <div className="flex gap-1.5 ml-1">
                {PHASE_STEPS.filter(s => s.id !== "complete").map(s => (
                  <div key={s.id} className={`size-2 rounded-full transition-colors ${
                    s.id === cal.phase ? "bg-primary" : "bg-border"
                  }`} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {cal.phase === "blind_grading" && (
                <Badge variant="outline">
                  {gradedCount}/{totalPapers} papers graded
                </Badge>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CloudCheck className="size-3.5 text-[color:var(--status-success)]" />
                Auto-saved
              </div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-1 transition-all duration-1000 ease-in-out" />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1">
        {cal.phase === "blind_grading" && <BlindGradingPanel assignmentId={id} />}
        {cal.phase === "delta_review" && <DeltaMatrix assignmentId={id} />}
        {cal.phase === "negotiation" && <NegotiationDialogue assignmentId={id} />}
      </div>


    </div>
  )
}
