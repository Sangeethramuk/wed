"use client"

import { use, useEffect } from "react"
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
import Link from "next/link"

const PHASE_STEPS = [
  { id: "sample_review", label: "Sample Review", step: 1 },
  { id: "blind_grading", label: "Blind Grading", step: 2 },
  { id: "delta_review", label: "Delta Report", step: 3 },
  { id: "negotiation", label: "Negotiation", step: 4 },
  { id: "complete", label: "Complete", step: 5 },
]

export default function CalibratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { calibration, initCalibration } = useGradingStore()

  const cal = calibration[id]

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
              <Link href="/dashboard/evaluation">
                <Button variant="ghost" size="sm">
                  <ArrowLeft /> Triage desk
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-foreground">
                  Step {currentStep?.step ?? 1} of {PHASE_STEPS.length - 1}
                </span>
                <span className="text-muted-foreground">— {currentStep?.label}</span>
                {nextStep && cal.phase !== "negotiation" && (
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
        {cal.phase === "sample_review" && <SampleReview assignmentId={id} />}
        {cal.phase === "blind_grading" && <BlindGradingPanel assignmentId={id} />}
        {cal.phase === "delta_review" && <DeltaMatrix assignmentId={id} />}
        {cal.phase === "negotiation" && <NegotiationDialogue assignmentId={id} />}
      </div>


    </div>
  )
}
