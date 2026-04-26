"use client"

import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { AssignmentSpecs } from "@/components/pre-evaluation/assignment-specs"
import { CreationMode } from "@/components/pre-evaluation/creation-mode"
import { RubricTweak } from "@/components/pre-evaluation/rubric-tweak"
import { CalibrationCheck } from "@/components/pre-evaluation/calibration-check"
import { StudentPreview } from "@/components/pre-evaluation/student-preview"
import { Progress } from "@/components/ui/progress"
import { CloudCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { TooltipProvider } from "@/components/ui/tooltip"

export default function PreEvaluationPage() {
  const { currentStep, lastSaved, creationMode, selectedHistoryId } = usePreEvalStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const showPicker = creationMode === "history" && !selectedHistoryId

  const progressPercent = (currentStep / 4) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AssignmentSpecs />
      case 2:
        return <RubricTweak />
      case 3:
        return <CalibrationCheck />
      case 4:
        return <StudentPreview />
      default:
        return <AssignmentSpecs />
    }
  }

  const steps = [
    { id: 1, label: "Assignment details" },
    { id: 2, label: "Grading rubric" },
    { id: 3, label: "Calibration" },
    { id: 4, label: "Preview & publish" },
  ]

  const currentStepData = steps.find(s => s.id === currentStep)

  if (showPicker) {
    return (
      <TooltipProvider delay={100}>
        <div className="flex flex-col min-h-[calc(100vh-8rem)] relative">
          <div className="max-w-6xl mx-auto w-full flex-1 pb-20 px-4 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CreationMode onBack={() => router.push("/dashboard/evaluation")} />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delay={100}>
      <div className="flex flex-col min-h-[calc(100vh-8rem)] relative">
        <div className="pt-4 pb-8 mb-8 border-b border-border/10">
          <div className="max-w-6xl mx-auto w-full px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="eyebrow flex items-center gap-3 transition-all">
                <span className="text-primary opacity-100 font-semibold">Step {currentStep} of 4 — {currentStepData?.label}</span>
              </div>
              <div className="eyebrow flex items-center gap-2 text-muted-foreground/30">
                <CloudCheck className="h-3.5 w-3.5 text-[color:var(--status-success)]/40" />
                <span>Auto-saved at {lastSaved}</span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-0.5 transition-all duration-1000 ease-in-out bg-primary/10" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full flex-1 pb-20 px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderStep()}
        </div>
      </div>
    </TooltipProvider>
  )
}
