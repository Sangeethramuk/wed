"use client"

import { useGradingStore } from "@/lib/store/grading-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, AlertCircle, ArrowRight, TrendingUp, Info } from "lucide-react"

function DeltaBadge({ delta }: { delta: number }) {
 if (delta === 0) return (
 <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">Δ 0</span>
 )
 const color = delta === 1
 ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
 : "text-red-600 dark:text-red-400 bg-red-500/10"
 return (
 <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${color}`}>Δ {delta}</span>
 )
}

function CellBg(delta: number) {
 if (delta === 0) return "bg-green-50/40 dark:bg-green-950/10"
 if (delta === 1) return "bg-amber-50/40 dark:bg-amber-950/10"
 return "bg-red-50/40 dark:bg-red-950/10"
}

export function DeltaMatrix({ assignmentId }: { assignmentId: string }) {
 const { calibration, setCalibrationPhase, completeCalibration } = useGradingStore()
 const cal = calibration[assignmentId]
 if (!cal) return null

 const { papers, criteria, scores, aggregateDelta, deltaThreshold } = cal
 const isCalibrated = aggregateDelta <= deltaThreshold

 const getScore = (paperId: string, criterionId: string) =>
 scores.find(s => s.paperId === paperId && s.criterionId === criterionId)

 const handleProceed = () => {
 if (isCalibrated) {
 completeCalibration(assignmentId)
 } else {
 setCalibrationPhase(assignmentId, "negotiation")
 }
 }

 return (
 <TooltipProvider delay={100}>
 <div className="max-w-5xl mx-auto px-4 space-y-8 animate-in fade-in duration-500 pb-12">

 {/* Header */}
 <div className="text-center space-y-3 pt-4">
 <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs font-medium tracking-[0.2em] bg-primary/10 text-primary border-primary/20">
 Delta Report
 </Badge>
 <h2 className="text-2xl font-medium tracking-tight">Calibration Comparison</h2>
 <p className="text-sm text-muted-foreground max-w-xl mx-auto">
 Your scores vs. the AI baseline across all {papers.length} calibration papers.
 Δ = absolute difference between your level and the AI's level (scale of 1–5).
 </p>
 </div>

 {/* Aggregate delta card */}
 <div className={`flex items-center justify-between p-6 rounded-2xl border-2 ${
 isCalibrated
 ? "border-green-500/30 bg-green-50/40 dark:bg-green-950/10"
 : "border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10"
 }`}>
 <div className="flex items-center gap-4">
 {isCalibrated
 ? <CheckCircle2 className="h-8 w-8 text-green-500" />
 : <AlertCircle className="h-8 w-8 text-amber-500" />
 }
 <div>
 <p className={`text-xs font-medium tracking-[0.2em] ${isCalibrated ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
 {isCalibrated ? "Calibrated — Proceed to Grading" : "Alignment Required — Review Discrepancies"}
 </p>
 <p className="text-sm text-muted-foreground mt-0.5">
 {isCalibrated
 ? `Your aggregate delta of ${aggregateDelta.toFixed(1)}% is within the ${deltaThreshold}% threshold.`
 : `Your aggregate delta of ${aggregateDelta.toFixed(1)}% exceeds the ${deltaThreshold}% threshold. Review the highlighted criteria.`
 }
 </p>
 </div>
 </div>
 <div className="text-right shrink-0">
 <p className={`text-4xl font-medium tracking-tighter tabular-nums ${isCalibrated ? "text-green-600" : "text-amber-600"}`}>
 {aggregateDelta.toFixed(1)}<span className="text-lg font-bold opacity-50">%</span>
 </p>
 <p className="text-xs font-medium tracking-widest text-muted-foreground/40 mt-1">
 Aggregate Delta · Threshold {deltaThreshold}%
 </p>
 </div>
 </div>

 {/* Matrix */}
 <Card className="border-border/40 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border/30 bg-muted/20">
 <th className="text-left px-4 py-3 text-xs font-medium tracking-[0.2em] text-muted-foreground/50 w-40">Criterion</th>
 {papers.map(p => (
 <th key={p.paperId} className="px-3 py-3 text-xs font-medium tracking-widest text-muted-foreground/50 text-center min-w-[110px]">
 {p.anonymizedLabel}
 <span className={`ml-1.5 text-xs px-1 py-0.5 rounded font-medium ${
 p.selectionReason === "high_confidence" ? "bg-green-500/10 text-green-600" :
 p.selectionReason === "ocr_issue" ? "bg-amber-500/10 text-amber-600" :
 "bg-red-500/10 text-red-600"
 }`}>
 {p.selectionReason === "high_confidence" ? "HC" : p.selectionReason === "ocr_issue" ? "OCR" : "CC"}
 </span>
 </th>
 ))}
 <th className="px-4 py-3 text-xs font-medium tracking-widest text-muted-foreground/50 text-right min-w-[80px]">
 <Tooltip>
 <TooltipTrigger>
 <span className="flex items-center justify-end gap-1 cursor-help">
 Avg Δ <Info className="h-3 w-3" />
 </span>
 </TooltipTrigger>
 <TooltipContent>Average delta for this criterion across all papers</TooltipContent>
 </Tooltip>
 </th>
 </tr>
 </thead>
 <tbody>
 {criteria.map((criterion, idx) => {
 const criterionScores = papers.map(p => getScore(p.paperId, criterion.id)).filter(Boolean)
 const avgDelta = criterionScores.length > 0
 ? criterionScores.reduce((s, sc) => s + (sc?.delta ?? 0), 0) / criterionScores.length
 : 0

 return (
 <tr key={criterion.id} className={`border-b border-border/20 ${idx % 2 === 0 ? "" : "bg-muted/5"}`}>
 <td className="px-4 py-3">
 <p className="text-xs font-medium tracking-widest text-muted-foreground/40">{criterion.id.toUpperCase()}</p>
 <p className="text-xs font-bold text-foreground">{criterion.name}</p>
 </td>
 {papers.map(p => {
 const score = getScore(p.paperId, criterion.id)
 return (
 <td key={p.paperId} className={`px-3 py-3 text-center ${CellBg(score?.delta ?? 0)}`}>
 <div className="space-y-1">
 <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
 <span className="text-foreground">{score?.instructorLevel ?? "—"}</span>
 <span className="text-muted-foreground/30">vs</span>
 <span className="text-muted-foreground/60">{score?.aiLevel ?? "—"}</span>
 </div>
 {score && <DeltaBadge delta={score.delta} />}
 </div>
 </td>
 )
 })}
 <td className="px-4 py-3 text-right">
 <div className="flex flex-col items-end gap-0.5">
 <span className={`text-sm font-medium tabular-nums ${
 avgDelta === 0 ? "text-green-600" :
 avgDelta <= 1 ? "text-amber-600" : "text-red-600"
 }`}>{avgDelta.toFixed(1)}</span>
 <DeltaBadge delta={Math.round(avgDelta)} />
 </div>
 </td>
 </tr>
 )
 })}
 </tbody>
 {/* Footer legend */}
 <tfoot>
 <tr className="border-t border-border/40 bg-muted/10">
 <td className="px-4 py-2 text-xs font-medium tracking-widest text-muted-foreground/30" colSpan={papers.length + 2}>
 You / AI — Your score vs AI baseline (1–5 scale). Δ 0 = match · Δ 1 = minor · Δ 2+ = divergent
 </td>
 </tr>
 </tfoot>
 </table>
 </div>
 </Card>

 {/* Summary stats */}
 <div className="grid grid-cols-3 gap-4">
 {[
 { label: "Perfect Match", value: scores.filter(s => s.delta === 0).length, color: "text-green-600", bg: "bg-green-500/5 border-green-200/30" },
 { label: "Minor Variance (Δ1)", value: scores.filter(s => s.delta === 1).length, color: "text-amber-600", bg: "bg-amber-500/5 border-amber-200/30" },
 { label: "Divergent (Δ2+)", value: scores.filter(s => s.delta >= 2).length, color: "text-red-600", bg: "bg-red-500/5 border-red-200/30" },
 ].map(stat => (
 <Card key={stat.label} className={`p-5 border ${stat.bg}`}>
 <p className={`text-3xl font-medium tracking-tighter ${stat.color}`}>{stat.value}</p>
 <p className="text-xs font-medium tracking-widest text-muted-foreground/50 mt-1">{stat.label}</p>
 </Card>
 ))}
 </div>

 {/* CTA */}
 <div className="flex flex-col items-center gap-3 pb-4">
 <Button
 onClick={handleProceed}
 className={`rounded-full h-14 px-12 text-sm font-medium tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-2xl ${
 isCalibrated
 ?"bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"
 :"bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
 }`}
 >
 {isCalibrated ? (
 <><TrendingUp className="mr-2 h-4 w-4" /> Proceed to Grading</>
 ) : (
 <><AlertCircle className="mr-2 h-4 w-4" /> Review Discrepancies</>
 )}
 <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
 </Button>
 <p className="text-xs font-medium tracking-widest text-muted-foreground/30">
 {isCalibrated ? "AI is calibrated to your grading style" : `${scores.filter(s => s.delta >= 2).length} scores need review`}
 </p>
 </div>
 </div>
 </TooltipProvider>
 )
}
