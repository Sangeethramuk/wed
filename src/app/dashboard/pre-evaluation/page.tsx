"use client"

import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { CourseSelection, MOCK_COURSES } from "@/components/pre-evaluation/course-selection"
import { CreationMode } from "@/components/pre-evaluation/creation-mode"
import { AssignmentSpecs } from "@/components/pre-evaluation/assignment-specs"
import { RubricTweak } from "@/components/pre-evaluation/rubric-tweak"
import { CalibrationCheck } from "@/components/pre-evaluation/calibration-check"
import { StudentPreview } from "@/components/pre-evaluation/student-preview"
import { Progress } from "@/components/ui/progress"
import { AuditSidebar } from "@/components/pre-evaluation/audit-sidebar"
import { CloudCheck } from "lucide-react"
import { useEffect, useState } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

export default function PreEvaluationPage() {
  const { currentStep, lastSaved, selectedCourse } = usePreEvalStore()
  const courseData = MOCK_COURSES.find(c => c.name === selectedCourse)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const progressPercent = (currentStep / 6) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CourseSelection />
      case 2:
        return <CreationMode />
      case 3:
        return <AssignmentSpecs />
      case 4:
        return <RubricTweak />
      case 5:
        return <CalibrationCheck />
      case 6:
        return <StudentPreview />
      default:
        return <CourseSelection />
    }
  }

  const steps = [
    { id: 1, label: "Choose course" },
    { id: 2, label: "Starting point" },
    { id: 3, label: "Assignment details" },
    { id: 4, label: "Grading rubric" },
    { id: 5, label: "Calibration" },
    { id: 6, label: "Preview & publish" },
  ]

  const currentStepData = steps.find(s => s.id === currentStep)

  return (
    <TooltipProvider delay={100}>
      <div className="flex flex-col min-h-[calc(100vh-8rem)] relative">
        <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-md pt-4 pb-8 mb-8 border-b border-border/10">
          <div className="max-w-6xl mx-auto w-full px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="eyebrow flex items-center gap-6 transition-all">
                <div className="flex items-center gap-3">
                    <span className="text-primary opacity-100 font-black">Step {currentStep} of 6 — {currentStepData?.label}</span>
                </div>
                <div className="flex gap-2 text-muted-foreground/10 px-4">
                    {steps.map(s => (
                      <div key={s.id} className={`size-1.5 rounded-full ${s.id === currentStep ? 'bg-primary' : 'bg-current'}`} />
                    ))}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="eyebrow flex items-center gap-2 text-muted-foreground/30">
                    <CloudCheck className="h-3.5 w-3.5 text-green-500/40" />
                    <span>Auto-saved at {lastSaved}</span>
                </div>
                <AuditSidebar />
              </div>
            </div>
            {selectedCourse && courseData && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="eyebrow text-muted-foreground/40">IIM Bangalore</span>
                <span className="text-muted-foreground/20 text-xs">·</span>
                <span className="eyebrow text-foreground/60">{courseData.name}</span>
                <span className="text-muted-foreground/20 text-xs">·</span>
                <span className="eyebrow text-muted-foreground/50">{courseData.semester}</span>
                <span className="text-muted-foreground/20 text-xs">·</span>
                <span className="eyebrow text-muted-foreground/40">{courseData.code}</span>
              </div>
            )}
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
