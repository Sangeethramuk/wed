"use client"

import { useEffect } from "react"
import { useGradingStore } from "@/lib/store/grading-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
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

  const allDiscrepancies = [...scores]
    .filter(s => s.instructorLevel > 0 && s.delta >= 1)

  const isCalibrated = allDiscrepancies.length === 0

  const getPaper = (paperId: string) => papers.find(p => p.paperId === paperId)
  const getCriterion = (criterionId: string) => criteria.find(c => c.id === criterionId)

  // Group discrepancies by paper, sort criteria within each paper by delta desc
  const discrepanciesByPaper = papers
    .map((paper, idx) => ({
      paper,
      paperIdx: idx,
      items: allDiscrepancies
        .filter(s => s.paperId === paper.paperId)
        .sort((a, b) => b.delta - a.delta),
    }))
    .filter(g => g.items.length > 0)

  const getScore = (paperId: string, criterionId: string) =>
    scores.find(s => s.paperId === paperId && s.criterionId === criterionId)

  const cellStyle = (delta: number) => {
    if (delta === 0) return "bg-[color:var(--status-success-bg)] text-[color:var(--status-success)]"
    if (delta === 1) return "bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)]"
    return "bg-[color:var(--status-error-bg)] text-[color:var(--status-error)]"
  }

  const deltaIndicator = (delta: number) =>
    delta >= 3 ? "●" : delta >= 2 ? "◑" : "○"

  const deltaBadgeClass = (delta: number) =>
    delta >= 3
      ? "bg-[color:var(--status-error-bg)] text-[color:var(--status-error)] border-[color:var(--status-error)]/30"
      : "bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30"

  const deltaNumClass = (delta: number) =>
    delta >= 3
      ? "bg-[color:var(--status-error-bg)] text-[color:var(--status-error)] border-[color:var(--status-error)]/30"
      : "bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30"

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
      <div className="bg-background border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Review &amp; Align Your Scores</h2>

        {allDiscrepancies.length > 0 ? (
          <div className="flex items-start gap-3 bg-[color:var(--status-error-bg)] border border-[color:var(--status-error)]/30/70 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[color:var(--status-error)]">
                Your grading differs from AI on {allDiscrepancies.length} items
              </p>
              <p className="text-xs text-destructive/80">
                Start with the most impactful differences — sorted by score gap
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-[color:var(--status-success-bg)] border border-[color:var(--status-success)]/30/70 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-[color:var(--status-success)] shrink-0" />
            <p className="text-sm font-semibold text-[color:var(--status-success)]">
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

      {/* Discrepancy list grouped by paper */}
      {discrepanciesByPaper.length > 0 && (
        <div className="space-y-3">
          {discrepanciesByPaper.map(({ paper, paperIdx, items }) => (
            <div key={paper.paperId} className="bg-background border border-border/60 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Paper {paperIdx + 1}</span>
                <Badge className={`text-xs font-semibold border shadow-none ${deltaBadgeClass(Math.max(...items.map(i => i.delta)))}`}>
                  {items.length} gap{items.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="divide-y divide-border/30">
                {items.map(score => {
                  const criterion = getCriterion(score.criterionId)
                  return (
                    <div
                      key={`${score.paperId}-${score.criterionId}`}
                      role="button"
                      onClick={handleStart}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <div className={`w-[22px] h-[22px] rounded-full text-xs font-semibold flex items-center justify-center shrink-0 border ${deltaNumClass(score.delta)}`}>
                        {deltaIndicator(score.delta)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{criterion?.name}</p>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground/70 shrink-0">
                        {score.instructorLevel} vs {score.aiLevel}
                      </span>
                      <Badge className={`text-xs font-semibold border shadow-none shrink-0 ${deltaBadgeClass(score.delta)}`}>
                        +{score.delta}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score matrix */}
      <div className="bg-background border border-border/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
          <span className="eyebrow text-muted-foreground/60">Score matrix</span>
          <span className="text-xs font-mono text-muted-foreground/40">yours / AI</span>
        </div>
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-b border-border/30 bg-muted/20 hover:bg-muted/20">
              <TableHead className="eyebrow text-left px-4 py-2.5 text-muted-foreground/50 min-w-[120px] whitespace-normal">
                Criterion
              </TableHead>
              {papers.map((p, idx) => (
                <TableHead
                  key={p.paperId}
                  className="eyebrow px-3 py-2.5 text-muted-foreground/50 text-center min-w-[70px]"
                >
                  Paper {idx + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {criteria.map(criterion => (
              <TableRow key={criterion.id} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
                <TableCell className="px-4 py-2.5 text-xs font-medium text-muted-foreground/80 whitespace-normal">{criterion.name}</TableCell>
                {papers.map(p => {
                  const score = getScore(p.paperId, criterion.id)
                  const delta = score?.delta ?? 0
                  return (
                    <TableCell key={p.paperId} className="px-3 py-2.5 text-center">
                      <div className={`inline-flex flex-col items-center rounded-md px-2 py-1 ${cellStyle(delta)}`}>
                        <span className="text-xs font-semibold font-mono leading-tight">
                          {score?.instructorLevel || "—"}
                        </span>
                        <span className="text-xs font-mono opacity-60 leading-tight">
                          {score?.aiLevel ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex gap-4 px-4 py-2.5 border-t border-border/30 bg-muted/10">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <div className="w-2 h-2 rounded-full bg-[color:var(--status-success)]" />Match
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <div className="w-2 h-2 rounded-full bg-[color:var(--status-warning)]" />±1 gap
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <div className="w-2 h-2 rounded-full bg-destructive" />±2+ gap
          </div>
        </div>
      </div>
    </div>
  )
}
