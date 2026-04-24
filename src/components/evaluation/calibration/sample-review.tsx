"use client"

import { useGradingStore } from "@/lib/store/grading-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export function SampleReview({
  assignmentId,
  onBegin,
}: {
  assignmentId: string
  onBegin?: () => void
}) {
  const { calibration, setCalibrationPhase, setActiveCalibrationPaper } = useGradingStore()
  const cal = calibration[assignmentId]
  if (!cal) return null

  const papers = cal.papers
  const scoredPaperIds = new Set(
    cal.scores.filter(s => s.instructorLevel > 0).map(s => s.paperId)
  )
  const reviewed = scoredPaperIds.size
  const remaining = Math.max(papers.length - reviewed, 0)
  const isReturning = reviewed > 0

  const handleBegin = () => {
    setCalibrationPhase(assignmentId, "blind_grading")
    const firstUnreviewed = papers.find(p => !scoredPaperIds.has(p.paperId))
    setActiveCalibrationPaper(
      assignmentId,
      (firstUnreviewed ?? papers[0])?.paperId ?? null
    )
    onBegin?.()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg space-y-8">

        <div className="space-y-4">
          <p className="eyebrow font-semibold text-muted-foreground/60">
            {isReturning ? "Resuming Independent Review" : "Independent Review"}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight leading-snug">
            {isReturning ? (
              <>Pick up<br />where you left off</>
            ) : (
              <>Before you see<br />any AI scores</>
            )}
          </h2>
        </div>

        <Card className="p-6 space-y-4">
          {isReturning ? (
            <>
              <p className="text-sm text-foreground/80 leading-relaxed">
                You&apos;ve reviewed {reviewed} of {papers.length} papers. The AI score stays hidden for the remaining {remaining}.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                After you submit both grades, we will show you where you and the AI agreed — and where you did not.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                This is standard academic practice. It keeps the grading honest.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground/80 leading-relaxed">
                For the next {papers.length} submissions, the AI score is hidden. Grade them based only on what you read.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                After you submit both grades, we will show you where you and the AI agreed — and where you did not.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                This is standard academic practice. It keeps the grading honest.
              </p>
            </>
          )}
        </Card>

        <Button
          size="lg"
          onClick={handleBegin}
          className="w-full"
        >
          {isReturning ? "Continue" : "Begin"} <ArrowRight />
        </Button>

      </div>
    </div>
  )
}
