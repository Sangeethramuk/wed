"use client"

import { useGradingStore } from "@/lib/store/grading-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export function SampleReview({ assignmentId }: { assignmentId: string }) {
 const { calibration, setCalibrationPhase, setActiveCalibrationPaper } = useGradingStore()
 const cal = calibration[assignmentId]
 if (!cal) return null

 const papers = cal.papers

 const handleBegin = () => {
 setCalibrationPhase(assignmentId, "blind_grading")
 setActiveCalibrationPaper(assignmentId, papers[0]?.paperId ?? null)
 }

 return (
 <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
 <div className="w-full max-w-lg space-y-8">

 <div className="space-y-4">
 <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground/60">
 Independent Review
 </p>
 <h2 className="text-3xl font-semibold tracking-tight leading-snug">
 Before you see<br />any AI scores
 </h2>
 </div>

 <Card className="p-6 space-y-4 border border-border/40 bg-background shadow-sm">
 <p className="text-sm text-foreground/80 leading-relaxed">
 For the next {papers.length} submissions, the AI score is hidden. Grade them based only on what you read.
 </p>
 <p className="text-sm text-foreground/80 leading-relaxed">
 After you submit both grades, we will show you where you and the AI agreed — and where you did not.
 </p>
 <p className="text-sm text-foreground/80 leading-relaxed">
 This is standard academic practice. It keeps the grading honest.
 </p>
 </Card>

 <Button
 onClick={handleBegin}
 className="w-full h-12 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90"
 >
 Begin <ArrowRight className="ml-1.5 h-4 w-4" />
 </Button>

 </div>
 </div>
 )
}
