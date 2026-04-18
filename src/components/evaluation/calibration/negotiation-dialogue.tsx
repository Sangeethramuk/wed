"use client"

import { useGradingStore, CalibrationScore } from "@/lib/store/grading-store"
import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2, AlertCircle, ArrowRight, BookOpen, Sparkles,
  Trash2, RotateCcw, TrendingUp, ChevronDown, FileText,
  Zap, Shield, PenLine,
} from "lucide-react"

// ── Mock manuscript content (same as blind grading) ──────────────────────────
const MOCK_MANUSCRIPT: Record<string, string> = {
  c1: "The system architecture follows a strict MVC separation of concerns. The presentation layer delegates all business processing to the service tier, which in turn communicates with the repository layer through well-defined interfaces. Dependency injection is applied at the controller level.",
  c2: "The authentication controller validates incoming JWT tokens by delegating to the TokenValidationService. Upon successful validation, the UserContext is populated and propagated through the request lifecycle via a thread-local pattern. Edge cases handled include: expired tokens, malformed payloads, and missing Authorization headers.",
  c3: "API endpoints are documented using OpenAPI 3.0 annotations. Each endpoint specifies request/response schemas, authentication requirements, and error codes. Versioning follows the URI path convention (/api/v1, /api/v2). Deprecated endpoints include sunset headers per RFC 8594.",
  c4: "Unit tests cover 87% of business logic branches using JUnit 5 and Mockito. Integration tests use an embedded H2 database. Load tests were conducted using Locust, simulating 500 concurrent users. P95 response time remained under 200ms across all critical endpoints.",
}

// ── AI pre-draft evidence generator ──────────────────────────────────────────
function generateAIDraft(criterionName: string, instructorLevel: number, aiLevel: number, excerpt: string): string {
  const higher = instructorLevel > aiLevel
  if (higher) {
    return `The student's submission demonstrates ${criterionName.toLowerCase()} beyond what the AI baseline captured. Specifically, the passage "${excerpt.slice(0, 80)}..." shows depth of understanding that aligns with Level ${instructorLevel} criteria. The AI's assessment at Level ${aiLevel} underweights the practical application demonstrated.`
  }
  return `On review, the submission for ${criterionName.toLowerCase()} lacks the specificity required for Level ${instructorLevel}. The passage "${excerpt.slice(0, 80)}..." addresses the concept but does not meet the completeness expected at that level. Level ${aiLevel} more accurately reflects the evidence presented.`
}

// ── Score list item ───────────────────────────────────────────────────────────
function ScoreListItem({
  score, paperLabel, criterionName, aiSuggestion, isSelected, isResolved, onSelect,
}: {
  score: CalibrationScore
  paperLabel: string
  criterionName: string
  aiSuggestion: "accept" | "confirm" | "review"
  isSelected: boolean
  isResolved: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : isResolved
          ? "border-green-200/30 bg-green-50/20 dark:bg-green-950/5 opacity-50"
          : "border-border/40 hover:border-border/70 hover:bg-muted/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 truncate">{paperLabel}</p>
          <p className="text-xs font-bold text-foreground truncate mt-0.5">{criterionName}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[9px] font-black text-foreground tabular-nums">
            {score.instructorLevel}<span className="text-muted-foreground/30 mx-0.5">vs</span>{score.aiLevel}
          </span>
          <div className="flex items-center gap-1">
            {isResolved ? (
              <Badge variant="outline" className="text-[7px] font-black px-1.5 py-0 h-4 border-green-200/40 text-green-600 bg-green-500/5">✓ done</Badge>
            ) : (
              <>
                <Badge variant="outline" className={`text-[7px] font-black px-1.5 py-0 h-4 ${
                  score.delta >= 2 ? "border-red-200/40 text-red-600 bg-red-500/5" : "border-amber-200/40 text-amber-600 bg-amber-500/5"
                }`}>Δ{score.delta}</Badge>
                <Badge variant="outline" className={`text-[7px] font-black px-1.5 py-0 h-4 ${
                  aiSuggestion === "accept" ? "border-green-200/40 text-green-600 bg-green-500/5" :
                  aiSuggestion === "confirm" ? "border-blue-200/40 text-blue-600 bg-blue-500/5" :
                  "border-amber-200/40 text-amber-600 bg-amber-500/5"
                }`}>
                  {aiSuggestion === "accept" ? "AI right" : aiSuggestion === "confirm" ? "You right" : "Review"}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function NegotiationDialogue({ assignmentId }: { assignmentId: string }) {
  const { calibration, addEvidenceExchange, resolveScore, computeDelta, completeCalibration } = useGradingStore()
  const cal = calibration[assignmentId]

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<"evidence" | "dispute" | "revise" | null>(null)
  const [instructorNote, setInstructorNote] = useState("")
  const [useAIDraft, setUseAIDraft] = useState(true)
  const [revisedLevel, setRevisedLevel] = useState(0)
  const [batchDone, setBatchDone] = useState<"low_risk" | "high_conf" | null>(null)

  if (!cal) return null

  const { papers, criteria, scores, aggregateDelta, deltaThreshold } = cal

  const divergentScores  = scores.filter(s => s.delta >= 1 && s.status !== "accepted" && s.status !== "resolved")
  const resolvedCount    = scores.filter(s => s.status === "accepted" || s.status === "resolved").length
  const totalDivergent   = scores.filter(s => s.delta >= 1).length

  // ── AI batch groups ───────────────────────────────────────────────────────
  const lowRiskItems  = divergentScores.filter(s => s.delta === 1)            // AI and instructor are close — accept AI
  const highConfItems = divergentScores.filter(s => s.delta >= 2 && s.instructorLevel > s.aiLevel) // you scored higher confidently
  const reviewItems   = divergentScores.filter(s => s.delta >= 2 && s.instructorLevel <= s.aiLevel) // AI scored higher — needs review

  const aiSuggestionFor = (s: CalibrationScore): "accept" | "confirm" | "review" =>
    s.delta === 1 ? "accept" : s.instructorLevel > s.aiLevel ? "confirm" : "review"

  const selectedScore     = selectedKey ? scores.find(s => `${s.paperId}-${s.criterionId}` === selectedKey) ?? null : null
  const selectedPaper     = selectedScore ? papers.find(p => p.paperId === selectedScore.paperId) : null
  const selectedCriterion = selectedScore ? criteria.find(c => c.id === selectedScore.criterionId) : null
  const manuscriptExcerpt = selectedScore ? (MOCK_MANUSCRIPT[selectedScore.criterionId] ?? "Submission content for this criterion is not available.") : ""

  const aiDraft = useMemo(() =>
    selectedScore && selectedCriterion
      ? generateAIDraft(selectedCriterion.name, selectedScore.instructorLevel, selectedScore.aiLevel, manuscriptExcerpt)
      : "",
  [selectedScore, selectedCriterion, manuscriptExcerpt])

  // ── Batch handlers ────────────────────────────────────────────────────────
  const handleBulkAcceptLowRisk = () => {
    lowRiskItems.forEach(s => {
      addEvidenceExchange(assignmentId, s.paperId, s.criterionId, { type: "accept_ai" })
      resolveScore(assignmentId, s.paperId, s.criterionId, "accepted")
    })
    setBatchDone("low_risk")
    setSelectedKey(null)
  }

  const handleBulkConfirmHighConf = () => {
    highConfItems.forEach(s => {
      addEvidenceExchange(assignmentId, s.paperId, s.criterionId, {
        type: "add_instructor",
        note: "Instructor maintained higher score — evidence confirms greater depth of understanding.",
      })
      resolveScore(assignmentId, s.paperId, s.criterionId, "resolved")
    })
    setBatchDone("high_conf")
    setSelectedKey(null)
  }

  // ── Single item handlers ──────────────────────────────────────────────────
  const handleAcceptAI = () => {
    if (!selectedScore) return
    addEvidenceExchange(assignmentId, selectedScore.paperId, selectedScore.criterionId, { type: "accept_ai" })
    resolveScore(assignmentId, selectedScore.paperId, selectedScore.criterionId, "accepted")
    advanceToNext()
  }

  const handleSubmitEvidence = () => {
    if (!selectedScore) return
    addEvidenceExchange(assignmentId, selectedScore.paperId, selectedScore.criterionId, {
      type: "add_instructor",
      note: useAIDraft ? aiDraft : (instructorNote || aiDraft),
    })
    resolveScore(assignmentId, selectedScore.paperId, selectedScore.criterionId, "resolved")
    setInstructorNote("")
    setUseAIDraft(true)
    advanceToNext()
  }

  const handleDispute = () => {
    if (!selectedScore) return
    addEvidenceExchange(assignmentId, selectedScore.paperId, selectedScore.criterionId, { type: "remove_ai_evidence" })
    resolveScore(assignmentId, selectedScore.paperId, selectedScore.criterionId, "resolved")
    advanceToNext()
  }

  const handleRevise = () => {
    if (!selectedScore || revisedLevel === 0) return
    addEvidenceExchange(assignmentId, selectedScore.paperId, selectedScore.criterionId, {
      type: "revise_self",
      note: `Instructor revised score from ${selectedScore.instructorLevel} to ${revisedLevel}.`,
    })
    const newDelta = Math.abs(revisedLevel - selectedScore.aiLevel)
    resolveScore(assignmentId, selectedScore.paperId, selectedScore.criterionId, newDelta === 0 ? "accepted" : "resolved")
    setRevisedLevel(0)
    advanceToNext()
  }

  const advanceToNext = () => {
    // Auto-select next unresolved item
    const currentIdx = divergentScores.findIndex(s => `${s.paperId}-${s.criterionId}` === selectedKey)
    const next = divergentScores.slice(currentIdx + 1).find(s => s.status !== "accepted" && s.status !== "resolved")
    setSelectedKey(next ? `${next.paperId}-${next.criterionId}` : null)
    setActiveAction(null)
    setInstructorNote("")
    setUseAIDraft(true)
    setRevisedLevel(0)
  }

  const isNowCalibrated = aggregateDelta <= deltaThreshold

  const handleFinish = () => completeCalibration(assignmentId)
  const handleAcceptPatternShift = () => {
    divergentScores.forEach(s => resolveScore(assignmentId, s.paperId, s.criterionId, "resolved"))
    computeDelta(assignmentId)
    completeCalibration(assignmentId)
  }

  return (
    <TooltipProvider delay={100}>
      <div className="max-w-6xl mx-auto px-4 space-y-5 animate-in fade-in duration-500 pb-12">

        {/* ── Header ── */}
        <div className="flex items-start justify-between pt-4">
          <div className="space-y-1">
            <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-[9px] font-black tracking-[0.2em] uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/40">
              Alignment Review
            </Badge>
            <h2 className="text-xl font-bold tracking-tight">Evidence Negotiation</h2>
            <p className="text-sm text-muted-foreground">Resolve each divergent score by exchanging evidence with the AI before proceeding.</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-3xl font-black tracking-tighter tabular-nums ${isNowCalibrated ? "text-green-600" : "text-amber-600"}`}>
              {aggregateDelta.toFixed(1)}<span className="text-sm font-bold opacity-50">%</span>
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Current Delta</p>
            <Progress value={100 - Math.min(aggregateDelta, 100)} className="mt-2 h-1 w-32 bg-amber-100/50" />
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">
              Threshold: {deltaThreshold}%
            </p>
          </div>
        </div>

        {/* ── AI Batch Action Strip ── */}
        {(lowRiskItems.length > 0 || highConfItems.length > 0) && (
          <Card className="border-primary/10 bg-primary/5 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Batch Analysis</p>
                  <p className="text-[9px] text-muted-foreground/60">Reviewed all {totalDivergent} divergences — most can be resolved in bulk</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lowRiskItems.length > 0 && (
                  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    batchDone === "low_risk" ? "border-green-200/40 bg-green-50/30 opacity-60" : "border-green-200/40 bg-green-50/30 hover:bg-green-50/50"
                  }`}>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-700 dark:text-green-400 flex items-center gap-1.5">
                        <Shield className="h-3 w-3" />
                        {lowRiskItems.length} Low-Risk (Δ1)
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">Minor variance — AI and you are within 1 point</p>
                    </div>
                    {batchDone === "low_risk" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleBulkAcceptLowRisk}
                        className="shrink-0 h-8 px-4 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-sm"
                      >
                        Accept All
                      </Button>
                    )}
                  </div>
                )}
                {highConfItems.length > 0 && (
                  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    batchDone === "high_conf" ? "border-blue-200/40 bg-blue-50/30 opacity-60" : "border-blue-200/40 bg-blue-50/30 hover:bg-blue-50/50"
                  }`}>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <Zap className="h-3 w-3" />
                        {highConfItems.length} Your Call (Δ2+, you scored higher)
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">You consistently graded higher — confirm your assessment</p>
                    </div>
                    {batchDone === "high_conf" ? (
                      <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleBulkConfirmHighConf}
                        className="shrink-0 h-8 px-4 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        Confirm All
                      </Button>
                    )}
                  </div>
                )}
                {reviewItems.length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-200/40 bg-amber-50/20">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <p className="text-[9px] text-muted-foreground/70">
                      <span className="font-black text-amber-700">{reviewItems.length} need individual review</span> — AI scored higher on these, review below
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-5 gap-5">

          {/* ── Left: Score list ── */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Divergent Scores</p>
              <span className="text-[9px] font-black text-muted-foreground/40">{resolvedCount}/{totalDivergent} resolved</span>
            </div>
            <ScrollArea className="h-[calc(100vh-28rem)]">
              <div className="space-y-1.5 pr-1">
                {scores.filter(s => s.delta >= 1).map(score => {
                  const paper     = papers.find(p => p.paperId === score.paperId)
                  const criterion = criteria.find(c => c.id === score.criterionId)
                  const key       = `${score.paperId}-${score.criterionId}`
                  const isResolved = score.status === "accepted" || score.status === "resolved"
                  return (
                    <ScoreListItem
                      key={key}
                      score={score}
                      paperLabel={paper?.anonymizedLabel ?? score.paperId}
                      criterionName={criterion?.name ?? score.criterionId}
                      aiSuggestion={aiSuggestionFor(score)}
                      isSelected={selectedKey === key}
                      isResolved={isResolved}
                      onSelect={() => {
                        setSelectedKey(key)
                        setActiveAction(null)
                        setInstructorNote("")
                        setUseAIDraft(true)
                        setRevisedLevel(0)
                      }}
                    />
                  )
                })}
                {divergentScores.length === 0 && (
                  <div className="flex flex-col items-center py-10 gap-2 text-center">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">All scores resolved</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* ── Right: Detail + action panel ── */}
          <div className="col-span-3 space-y-4">
            {!selectedScore ? (
              <Card className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3 border-border/30 bg-muted/5">
                <div className="p-4 rounded-2xl bg-muted/20">
                  <FileText className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/30">Select a score to review</p>
                <p className="text-[9px] text-muted-foreground/20 uppercase tracking-widest">or use AI batch actions above</p>
              </Card>
            ) : (
              <div className="space-y-3">

                {/* Score overview */}
                <Card className="p-5 border-border/40">
                  <div className="flex items-center justify-between gap-6">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 truncate">
                        {selectedPaper?.anonymizedLabel} · {selectedCriterion?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-center">
                        <p className="text-2xl font-black text-foreground tabular-nums">{selectedScore.instructorLevel}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Your Score</p>
                      </div>
                      <span className="text-muted-foreground/20 text-lg">vs</span>
                      <div className="text-center">
                        <p className="text-2xl font-black text-muted-foreground/50 tabular-nums">{selectedScore.aiLevel}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">AI Score</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-black tabular-nums ${selectedScore.delta >= 2 ? "text-red-600" : "text-amber-600"}`}>
                          Δ{selectedScore.delta}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Delta</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Manuscript excerpt for this criterion */}
                <Card className="p-4 border-amber-200/30 bg-amber-50/20 dark:bg-amber-950/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-amber-600/60" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-700/70 dark:text-amber-400/70">
                      Student's Submission — {selectedCriterion?.name}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed font-serif italic border-l-2 border-amber-400/30 pl-3">
                    "{manuscriptExcerpt}"
                  </p>
                </Card>

                {/* AI reasoning */}
                <Card className="p-4 border-border/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary/60" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">AI Reasoning</p>
                  </div>
                  <p className="text-xs italic text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-3">
                    "{selectedScore.aiReasoning}"
                  </p>
                  <div className="space-y-1 pt-1">
                    {selectedScore.aiEvidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                        <span className="text-primary/40 font-black shrink-0 mt-0.5">·</span>
                        <span className="leading-relaxed">{ev}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* ── Action panel ── */}
                {activeAction === null && (
                  <div className="space-y-2">
                    {/* Primary: AI suggestion */}
                    <button
                      onClick={handleAcceptAI}
                      className="w-full p-4 rounded-xl border-2 border-green-200/50 bg-green-50/40 dark:bg-green-950/10 hover:border-green-400/40 hover:bg-green-50/60 text-left transition-all hover:-translate-y-0.5 hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Accept AI Score</p>
                            <p className="text-[9px] text-muted-foreground/60 mt-0.5">Defer to baseline · your score adjusts to {selectedScore.aiLevel}</p>
                          </div>
                        </div>
                        {selectedScore.delta === 1 && (
                          <Badge variant="outline" className="text-[8px] font-black text-green-600 border-green-200/40 bg-green-500/5">
                            AI recommended
                          </Badge>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveAction("evidence")}
                      className="w-full p-4 rounded-xl border-2 border-blue-200/50 bg-blue-50/40 dark:bg-blue-950/10 hover:border-blue-400/40 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PenLine className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Add My Evidence</p>
                            <p className="text-[9px] text-muted-foreground/60 mt-0.5">AI drafts it for you · edit and confirm to keep your score at {selectedScore.instructorLevel}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/30" />
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleDispute}
                        className="p-3 rounded-xl border-2 border-amber-200/50 bg-amber-50/40 dark:bg-amber-950/10 hover:border-amber-400/40 text-left transition-all hover:shadow-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-amber-600 mb-1.5" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground">Dispute AI</p>
                        <p className="text-[8px] text-muted-foreground/50 mt-0.5 leading-relaxed">Flag AI evidence as insufficient · AI score drops by 1</p>
                      </button>
                      <button
                        onClick={() => setActiveAction("revise")}
                        className="p-3 rounded-xl border-2 border-purple-200/50 bg-purple-50/40 dark:bg-purple-950/10 hover:border-purple-400/40 text-left transition-all hover:shadow-sm"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-purple-600 mb-1.5" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground">Revise My Score</p>
                        <p className="text-[8px] text-muted-foreground/50 mt-0.5 leading-relaxed">Your initial score was inaccurate · re-evaluate</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Add evidence — expanded panel with AI draft */}
                {activeAction === "evidence" && (
                  <Card className="border-blue-200/40 bg-blue-50/20 dark:bg-blue-950/10 space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">Your Supporting Evidence</p>
                      <button onClick={() => { setActiveAction(null); setUseAIDraft(true) }} className="text-[9px] text-muted-foreground/40 hover:text-foreground transition-colors">✕ cancel</button>
                    </div>

                    {/* AI Draft toggle */}
                    <div className={`rounded-xl border-2 p-3 space-y-2 transition-all ${useAIDraft ? "border-primary/20 bg-primary/5" : "border-border/30"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary">AI Draft</p>
                        </div>
                        <button
                          onClick={() => setUseAIDraft(u => !u)}
                          className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all ${
                            useAIDraft
                              ? "border-primary/30 text-primary bg-primary/10"
                              : "border-border text-muted-foreground/40 hover:border-primary/30"
                          }`}
                        >
                          {useAIDraft ? "Using draft" : "Use draft"}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 leading-relaxed italic">{aiDraft}</p>
                    </div>

                    {/* Custom note */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                        {useAIDraft ? "Or write your own (overrides draft)" : "Your note"}
                      </p>
                      <Textarea
                        value={instructorNote}
                        onChange={e => { setInstructorNote(e.target.value); if (e.target.value) setUseAIDraft(false) }}
                        placeholder="Type your evidence here to override the AI draft..."
                        className="text-xs resize-none h-16 bg-background border-border/40 focus-visible:ring-primary/30"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitEvidence}
                      className="w-full rounded-full h-10 text-[9px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-sm group"
                    >
                      Submit Evidence — Keep My Score at {selectedScore.instructorLevel}
                      <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Card>
                )}

                {/* Revise score panel */}
                {activeAction === "revise" && (
                  <Card className="border-purple-200/40 bg-purple-50/20 dark:bg-purple-950/10 space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-widest text-purple-700 dark:text-purple-400">Select Your Revised Score</p>
                      <button onClick={() => { setActiveAction(null); setRevisedLevel(0) }} className="text-[9px] text-muted-foreground/40 hover:text-foreground transition-colors">✕ cancel</button>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(l => (
                        <button
                          key={l}
                          onClick={() => setRevisedLevel(l)}
                          className={`flex-1 aspect-square rounded-lg text-sm font-black border transition-all ${
                            revisedLevel === l
                              ? "bg-purple-600 border-purple-600 text-white scale-[1.08] shadow-md"
                              : "bg-background border-border/50 text-muted-foreground/60 hover:border-purple-300"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    {revisedLevel > 0 && (
                      <>
                        <p className="text-[9px] font-black text-purple-600/70 uppercase tracking-widest text-center">
                          {selectedCriterion?.levelLabels[revisedLevel - 1]} · New delta: Δ{Math.abs(revisedLevel - selectedScore.aiLevel)}
                        </p>
                        <Button
                          onClick={handleRevise}
                          className="w-full rounded-full h-10 text-[9px] font-black uppercase tracking-widest bg-purple-600 hover:bg-purple-700 text-white shadow-sm group"
                        >
                          Confirm Revision to {revisedLevel}
                          <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* ── Recompute & proceed ── */}
            {divergentScores.length === 0 && (
              <div className="space-y-3 pt-2">
                <Separator />
                <Button
                  onClick={() => computeDelta(assignmentId)}
                  variant="outline"
                  className="w-full rounded-full h-10 text-[9px] font-black uppercase tracking-widest"
                >
                  Recompute Delta
                </Button>
                {isNowCalibrated ? (
                  <Button
                    onClick={handleFinish}
                    className="w-full rounded-full h-12 text-[10px] font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 group"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Calibrated — Proceed to Grading
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[9px] text-center font-black uppercase tracking-widest text-muted-foreground/40">
                      Delta still {aggregateDelta.toFixed(1)}% — above {deltaThreshold}% threshold
                    </p>
                    <Button
                      onClick={handleAcceptPatternShift}
                      variant="outline"
                      className="w-full rounded-full h-12 text-[10px] font-black uppercase tracking-widest border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 group"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Accept Pattern Shift — AI Recalibrates to My Style
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
