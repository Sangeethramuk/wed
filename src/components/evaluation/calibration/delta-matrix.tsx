"use client"

import { useEffect } from "react"
import { useGradingStore } from "@/lib/store/grading-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react"

export function DeltaMatrix({ assignmentId }: { assignmentId: string }) {
  const { calibration, setCalibrationPhase, computeDelta, completeCalibration } = useGradingStore()
  const cal = calibration[assignmentId]

  useEffect(() => {
    if (cal) computeDelta(assignmentId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!cal) return null

  const { papers, criteria, scores } = cal

  const discrepancies = [...scores]
    .filter(s => s.instructorLevel > 0 && s.delta >= 1)
    .sort((a, b) => b.delta - a.delta)

  const isCalibrated = discrepancies.length === 0

  const getPaper = (paperId: string) => papers.find(p => p.paperId === paperId)
  const getCriterion = (criterionId: string) => criteria.find(c => c.id === criterionId)

  const getScore = (paperId: string, criterionId: string) =>
    scores.find(s => s.paperId === paperId && s.criterionId === criterionId)

  const cellStyle = (delta: number) => {
    if (delta === 0) return "bg-green-50 text-green-700"
    if (delta === 1) return "bg-amber-50 text-amber-700"
    return "bg-red-50 text-red-700"
  }

  const deltaIndicator = (delta: number) =>
    delta >= 3 ? "●" : delta >= 2 ? "◑" : "○"

  const deltaBadgeClass = (delta: number) =>
    delta >= 3
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200"

  const deltaNumClass = (delta: number) =>
    delta >= 3
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-amber-100 text-amber-700 border-amber-200"

  const handleStart = () => {
    if (isCalibrated) {
      completeCalibration(assignmentId)
    } else {
      setCalibrationPhase(assignmentId, "negotiation")
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-500">

      {/* Header card */}
      <div className="bg-white border border-border/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-[17px] font-bold tracking-tight">Review &amp; Align Your Scores</h2>

        {discrepancies.length > 0 ? (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200/70 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Your grading differs from AI on {discrepancies.length} items
              </p>
              <p className="text-xs text-red-500/80">
                Start with the most impactful differences — sorted by score gap
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200/70 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700">
              Your grading aligns with the AI baseline — ready to proceed
            </p>
          </div>
        )}

        <Button
          onClick={handleStart}
          className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm gap-2"
        >
          {isCalibrated ? (
            <><TrendingUp className="h-4 w-4" /> Proceed to Grading</>
          ) : (
            <><ArrowRight className="h-4 w-4" /> Start Reviewing Differences</>
          )}
        </Button>
      </div>

      {/* Discrepancy list sorted by gap */}
      {discrepancies.length > 0 && (
        <div className="bg-white border border-border/60 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 border-b border-border/40">
            <span className="eyebrow text-muted-foreground/60">
              Discrepancy items · sorted by gap
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {discrepancies.map(score => {
              const paper = getPaper(score.paperId)
              const criterion = getCriterion(score.criterionId)
              return (
                <div
                  key={`${score.paperId}-${score.criterionId}`}
                  role="button"
                  onClick={handleStart}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <div className={`w-[22px] h-[22px] rounded-full text-[10px] font-black flex items-center justify-center shrink-0 border ${deltaNumClass(score.delta)}`}>
                    {deltaIndicator(score.delta)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{criterion?.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground/60">{paper?.anonymizedLabel}</p>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground/70 shrink-0">
                    {score.instructorLevel} vs {score.aiLevel}
                  </span>
                  <Badge className={`text-[10px] font-black border shadow-none shrink-0 ${deltaBadgeClass(score.delta)}`}>
                    +{score.delta}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Score matrix */}
      <div className="bg-white border border-border/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
          <span className="eyebrow text-muted-foreground/60">Score matrix</span>
          <span className="text-[11px] font-mono text-muted-foreground/40">yours / AI</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="eyebrow text-left px-4 py-2.5 text-muted-foreground/50 min-w-[120px]">
                  Criterion
                </th>
                {papers.map(p => (
                  <th
                    key={p.paperId}
                    className="eyebrow px-3 py-2.5 text-muted-foreground/50 text-center min-w-[70px]"
                  >
                    {p.anonymizedLabel.replace('Paper #', 'P')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map(criterion => (
                <tr key={criterion.id} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground/80">{criterion.name}</td>
                  {papers.map(p => {
                    const score = getScore(p.paperId, criterion.id)
                    const delta = score?.delta ?? 0
                    return (
                      <td key={p.paperId} className="px-3 py-2.5 text-center">
                        <div className={`inline-flex flex-col items-center rounded-md px-2 py-1 ${cellStyle(delta)}`}>
                          <span className="text-xs font-black font-mono leading-tight">
                            {score?.instructorLevel || "—"}
                          </span>
                          <span className="text-[9px] font-mono opacity-60 leading-tight">
                            {score?.aiLevel ?? "—"}
                          </span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 px-4 py-2.5 border-t border-border/30 bg-muted/10">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <div className="w-2 h-2 rounded-full bg-green-500" />Match
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <div className="w-2 h-2 rounded-full bg-amber-500" />±1 gap
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <div className="w-2 h-2 rounded-full bg-red-500" />±2+ gap
          </div>
        </div>
      </div>
    </div>
  )
}
