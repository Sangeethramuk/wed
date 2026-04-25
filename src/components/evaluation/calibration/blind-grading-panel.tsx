"use client"

import { useGradingStore } from "@/lib/store/grading-store"
import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  CheckCircle2,
  ChevronLeft,
  Lock,
  Unlock,
  Timer,
  ArrowRight,
  ShieldAlert,
  Wifi,
  AlertTriangle,
  X,
} from "lucide-react"

type MappedEvidence = {
  id: string
  text: string
  paperId: string
  criterionId: string
}

type TextSelectionMode = {
  active: boolean
  criterionId: string | null
}

const newEvidenceId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const MOCK_MANUSCRIPT_CONTENT: Record<string, string[]> = {
  c1: [
    "The system architecture follows a strict MVC separation of concerns. The presentation layer delegates all business processing to the service tier, which in turn communicates with the repository layer through well-defined interfaces.",
    "Dependency injection is applied at the controller level, ensuring that service classes remain unit-testable in isolation. The configuration layer is externalized via environment-specific property files.",
  ],
  c2: [
    "The authentication controller validates incoming JWT tokens by delegating to the TokenValidationService. Upon successful validation, the UserContext is populated and propagated through the request lifecycle via a thread-local pattern.",
    "Edge cases handled include: expired tokens, malformed payloads, and missing Authorization headers. Each case returns a standardized error envelope conforming to RFC 7807.",
  ],
  c3: [
    "API endpoints are documented using OpenAPI 3.0 annotations. Each endpoint specifies request/response schemas, authentication requirements, and error codes. The Swagger UI is exposed at /api-docs for interactive testing.",
    "Versioning follows the URI path convention (/api/v1, /api/v2). Deprecated endpoints include sunset headers per RFC 8594.",
  ],
  c4: [
    "Unit tests cover 87% of business logic branches using JUnit 5 and Mockito. Integration tests use an embedded H2 database to validate repository interactions. A GitHub Actions pipeline runs the full test suite on every pull request.",
    "Load tests were conducted using Locust, simulating 500 concurrent users. P95 response time remained under 200ms across all critical endpoints.",
  ],
}

const CATEGORY_CONFIG = {
  high_confidence: { dot: "bg-[color:var(--status-success)]", badge: "bg-[color:var(--status-success-bg)] text-[color:var(--status-success)] border-[color:var(--status-success)]/20", icon: ShieldAlert },
  ocr_issue:       { dot: "bg-[color:var(--status-warning)]", badge: "bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] border-[color:var(--status-warning)]/20", icon: Wifi },
  complex_case:    { dot: "bg-[color:var(--status-error)]",   badge: "bg-[color:var(--status-error-bg)] text-[color:var(--status-error)] border-[color:var(--status-error)]/20",     icon: AlertTriangle },
}

export function BlindGradingPanel({ assignmentId }: { assignmentId: string }) {
  const { calibration, setInstructorLevel, setCalibrationPhase, setActiveCalibrationPaper, computeDelta } = useGradingStore()
  const cal = calibration[assignmentId]

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [inspectionTime, setInspectionTime] = useState(0)
  const [activeCriterionIdx, setActiveCriterionIdx] = useState(0)
  const [scoreLevelExpanded, setScoreLevelExpanded] = useState<Record<string, boolean>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [textSelectionMode, setTextSelectionMode] = useState<TextSelectionMode>({ active: false, criterionId: null })
  const [mappedEvidence, setMappedEvidence] = useState<MappedEvidence[]>([])
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null)
  const [showScrollMsg, setShowScrollMsg] = useState(false)
  const manuscriptRef = useRef<HTMLDivElement>(null)

  const papers    = cal?.papers ?? []
  const criteria  = cal?.criteria ?? []
  const scores    = cal?.scores ?? []
  const activePaperId = cal?.activeCalibrationPaperId ?? papers[0]?.paperId

  const currentPaperIndex = papers.findIndex(p => p.paperId === activePaperId)
  const currentPaper      = papers[currentPaperIndex]

  const paperScores    = scores.filter(s => s.paperId === activePaperId)
  const gradedCriteria = paperScores.filter(s => s.instructorLevel > 0)
  const isAllGraded    = gradedCriteria.length === criteria.length && criteria.length > 0

  const isGateUnlocked = isAllGraded && hasScrolledToBottom && inspectionTime >= 3

  const totalGradedPapers = papers.filter(p =>
    scores.filter(s => s.paperId === p.paperId).every(s => s.instructorLevel > 0)
  ).length

  const activeCriterion = criteria[activeCriterionIdx]
  const isLastCriterion = activeCriterionIdx === criteria.length - 1
  const activeScore = paperScores.find(s => s.criterionId === activeCriterion?.id)?.instructorLevel ?? 0

  // Reset gates + ephemeral UI when switching papers.
  // mappedEvidence is NOT reset — keyed by paperId+criterionId and filtered at render.
  useEffect(() => {
    setInspectionTime(0)
    setHasScrolledToBottom(false)
    setActiveCriterionIdx(0)
    setTextSelectionMode({ active: false, criterionId: null })
    setSelection(null)
    if (manuscriptRef.current) manuscriptRef.current.scrollTop = 0
    const interval = setInterval(() => setInspectionTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [activePaperId])

  const handleManuscriptMouseUp = () => {
    if (!activePaperId) return
    const sel = window.getSelection()
    if (!sel) return
    const raw = sel.toString()
    const text = raw.trim().replace(/\s+/g, " ")
    if (!text) { setSelection(null); return }

    // Pre-scoped shortcut: if the user clicked "+ Add evidence" first,
    // auto-link to that criterion instead of opening the criteria picker.
    if (textSelectionMode.active && textSelectionMode.criterionId) {
      setMappedEvidence(prev => [
        ...prev,
        { id: newEvidenceId(), text, paperId: activePaperId, criterionId: textSelectionMode.criterionId! },
      ])
      sel.removeAllRanges()
      setTextSelectionMode({ active: false, criterionId: null })
      setSelection(null)
      return
    }

    // Default flow: open the floating popover with the full criteria picker.
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top })
  }

  const linkEvidenceToCriterion = (criterionId: string) => {
    if (!selection || !activePaperId) return
    setMappedEvidence(prev => [...prev, { id: newEvidenceId(), text: selection.text, paperId: activePaperId, criterionId }])
    window.getSelection()?.removeAllRanges()
    setSelection(null)
    setTextSelectionMode({ active: false, criterionId: null })
  }

  const dismissSelection = () => {
    window.getSelection()?.removeAllRanges()
    setSelection(null)
  }

  const enterSelectionMode = (criterionId: string) => {
    setTextSelectionMode({ active: true, criterionId })
  }

  const cancelSelectionMode = () => setTextSelectionMode({ active: false, criterionId: null })

  const removeEvidence = (id: string) => setMappedEvidence(prev => prev.filter(e => e.id !== id))

  const criterionLabel = (criterionId: string | null) => {
    if (!criterionId) return ""
    const c = criteria.find(x => x.id === criterionId)
    return c ? `${c.id.toUpperCase()} · ${c.name}` : criterionId.toUpperCase()
  }

  const handleScroll = () => {
    const el = manuscriptRef.current
    if (!el) return
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    if (isBottom) setHasScrolledToBottom(true)
  }

  const handleLevelSelect = (criterionId: string, level: number) => {
    setInstructorLevel(assignmentId, activePaperId, criterionId, level)
  }

  const handleNext = () => {
    const nextIndex = currentPaperIndex + 1
    if (nextIndex < papers.length) {
      setActiveCalibrationPaper(assignmentId, papers[nextIndex].paperId)
    } else {
      computeDelta(assignmentId)
      setCalibrationPhase(assignmentId, "delta_review")
    }
  }

  const isLastPaper = currentPaperIndex === papers.length - 1

  if (!cal || !currentPaper) return null

  return (
    <TooltipProvider delay={0}>
      <div className="h-[calc(100vh-10rem)] overflow-hidden border border-border/40 rounded-xl bg-background mx-4 shadow-sm">
        <ResizablePanelGroup orientation="horizontal">

          {/* ── Center Panel: Manuscript Viewer ── */}
          <ResizablePanel defaultSize={60} minSize={35}>
            <div className="h-full flex flex-col bg-muted/10">
              {/* Header */}
              <header className="p-4 border-b border-border bg-background flex flex-col gap-4 z-10 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Select
                      value={activePaperId}
                      onValueChange={(val) => setActiveCalibrationPaper(assignmentId, val)}
                    >
                      <SelectTrigger className="h-8 w-44 text-sm font-semibold">
                        Paper {currentPaperIndex + 1}
                      </SelectTrigger>
                      <SelectContent>
                        {papers.map((paper, idx) => {
                          const isGraded = scores.filter(s => s.paperId === paper.paperId).every(s => s.instructorLevel > 0) && criteria.length > 0
                          return (
                            <SelectItem key={paper.paperId} value={paper.paperId}>
                              <span className="flex items-center gap-2">
                                Paper {idx + 1}
                                {isGraded && <CheckCircle2 className="h-3 w-3 text-[color:var(--status-success)]" />}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="rounded-full text-xs tabular-nums bg-background">
                      {totalGradedPapers}/{papers.length}
                    </Badge>
                  </div>

                  {/* Scored status only (removed Read/Timer per user request) */}
                  <div className="flex items-center gap-4">
                    <Tooltip>
                      <TooltipTrigger render={<div className={`eyebrow flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${isAllGraded ? "bg-[color:var(--status-success-bg)] border-[color:var(--status-success)]/30 text-[color:var(--status-success)]" : "bg-accent/40 border-border/50 text-muted-foreground/60"}`} />}>
                        {isAllGraded ? <CheckCircle2 className="h-3 w-3" /> : <div className="size-2 rounded-full border border-current" />}
                        {isAllGraded ? "All Criteria Scored" : `${gradedCriteria.length}/${criteria.length} scored`}
                      </TooltipTrigger>
                      <TooltipContent>
                        {isAllGraded ? "Evaluation protocol complete" : `Grade all ${criteria.length} criteria to proceed`}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </header>

              {/* Selection-mode banner — appears above the manuscript when the
                  user clicked "+ Add evidence" and is about to highlight. */}
              {textSelectionMode.active && textSelectionMode.criterionId && (
                <div className="flex items-center justify-between gap-2 px-6 py-3 bg-primary text-primary-foreground shrink-0 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M5 7l-2 2a2.8 2.8 0 0 0 4 4l2-2M9 7l2-2a2.8 2.8 0 0 0-4-4L5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Select text to link as evidence for{" "}
                    <span className="font-bold">{criterionLabel(textSelectionMode.criterionId)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={cancelSelectionMode}
                    className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    aria-label="Cancel evidence selection"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Manuscript Viewer */}
              <div
                ref={manuscriptRef}
                onScroll={handleScroll}
                onMouseUp={handleManuscriptMouseUp}
                className={`flex-1 overflow-y-auto bg-muted/30 scroll-smooth p-10 lg:p-24 ${textSelectionMode.active ? "cursor-crosshair" : ""}`}
              >
                <div
                  className={`bg-background shadow-sm mx-auto transition-all duration-300 relative group/page cursor-text flex flex-col ${
                    textSelectionMode.active ? "ring-2 ring-primary/40 border border-primary/40" : "border border-border/50"
                  }`}
                  style={{ width: "100%", maxWidth: "800px", minHeight: "100%" }}
                >
                  <div className="absolute top-8 left-8 flex flex-col items-start gap-1">
                    <span className="eyebrow text-primary/40 group-hover/page:text-primary transition-colors">Blind Calibration</span>
                    <span className="eyebrow text-muted-foreground/30 group-hover/page:text-muted-foreground/60 transition-colors">Digital Manuscript</span>
                  </div>

                  <div className="p-16 lg:p-24 h-full font-serif overflow-hidden flex-1">
                    <div className="max-w-3xl mx-auto space-y-10">
                      <div className="space-y-6 border-b border-border/80 pb-8">
                        <div className="flex items-center justify-between mt-8">
                          <h1 className="text-4xl font-serif text-foreground leading-tight italic tracking-tight underline decoration-primary/20">Software Engineering — Phase 2</h1>
                        </div>
                        <p className="text-xs text-muted-foreground/70 italic">Identity anonymized for calibration protocol</p>
                      </div>

                      <div className="space-y-12">
                        {criteria.map((criterion, idx) => (
                          <div key={criterion.id} className="space-y-6">
                            <h2 className="text-xl font-bold italic border-l-2 border-[color:var(--status-warning)] pl-4 tracking-tight text-foreground flex items-center gap-3">
                              <span className="eyebrow text-[color:var(--status-warning)]/80 not-italic shrink-0">
                                {criterion.id.toUpperCase()}
                              </span>
                              {criterion.name}
                            </h2>
                            <div className="space-y-6 text-lg leading-[1.8] text-foreground/90 pl-5">
                              {(MOCK_MANUSCRIPT_CONTENT[criterion.id] ?? [
                                "The student's response for this criterion demonstrates awareness of core concepts with moderate elaboration. Evidence of applied understanding is present though further depth would strengthen the argument.",
                                "Supporting examples are provided with references to course material. The logical flow is maintained throughout this section with minor inconsistencies in the latter portion.",
                              ]).map((para, i) => (
                                <p key={i} className="font-serif italic font-medium text-muted-foreground">{para}</p>
                              ))}
                            </div>
                            {idx < criteria.length - 1 && <Separator className="mt-8 opacity-20 border-border/50" />}
                          </div>
                        ))}
                      </div>

                      {hasScrolledToBottom && (
                        <div className="pt-20 pb-8 shrink-0 w-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                            <div className="flex flex-col items-center gap-4">
                              <CheckCircle2 className="h-10 w-10 text-primary" />
                              <span className="eyebrow text-muted-foreground">End of Submission</span>
                            </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border" />

          {/* ── Right Panel: Rubric Evaluation (double-blind stepper) ── */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col border-l border-border bg-background overflow-hidden">

              {/* Sticky header — matches grading sidebar */}
              <div className="p-4 border-b border-border bg-background shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">Rubric evaluation</h2>
                  <Badge variant="outline" className="rounded-full text-xs font-semibold px-2 h-5 bg-background">
                    {gradedCriteria.length} of {criteria.length} scored
                  </Badge>
                </div>
                <Progress value={(gradedCriteria.length / Math.max(criteria.length, 1)) * 100} className="h-1" />
                {/* Stepper — C1/C2/C3 dots-with-label, matches grading */}
                <div className="flex gap-1">
                  {criteria.map((c, i) => {
                    const sc = paperScores.find(s => s.criterionId === c.id)
                    const isDone = (sc?.instructorLevel ?? 0) > 0
                    const isActive = i === activeCriterionIdx
                    return (
                      <Button
                        key={c.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveCriterionIdx(i)}
                        className="flex-1 h-auto flex-col gap-1 py-1"
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                          isDone ? 'bg-[color:var(--status-success)] border-[color:var(--status-success)]' :
                          isActive ? 'border-primary bg-background' :
                          'border-border bg-background'
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="h-2.5 w-2.5 text-white stroke-[3px]" />
                          ) : isActive ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          ) : null}
                        </div>
                        <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                          {c.id.toUpperCase()}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Scrollable body */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4">
                  {activeCriterion && (() => {
                    const pointEvidence = mappedEvidence.filter(e => e.paperId === activePaperId && e.criterionId === activeCriterion.id)
                    const isModeActiveHere = textSelectionMode.active && textSelectionMode.criterionId === activeCriterion.id
                    return (
                      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">

                        {/* Criterion name */}
                        <div className="px-4 pt-4 pb-3">
                          <h3 className="text-sm font-semibold text-foreground leading-tight">{activeCriterion.name}</h3>
                        </div>

                        {/* Score */}
                        <div className="px-4 py-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="eyebrow text-muted-foreground/60">Score</span>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-2xl font-semibold text-foreground tabular-nums">
                                {activeScore > 0 ? activeScore : '--'}
                              </span>
                              <span className="text-sm text-muted-foreground/60">/5</span>
                            </div>
                            <span className="text-xs text-muted-foreground/50 ml-auto">Adjust:</span>
                          </div>

                          {/* Compact buttons + expand toggle */}
                          {!scoreLevelExpanded[activeCriterion.id] && (
                            <div className="flex gap-1 items-center">
                              {[1, 2, 3, 4, 5].map(v => (
                                <button
                                  key={v}
                                  onClick={() => handleLevelSelect(activeCriterion.id, v)}
                                  className={`flex-1 text-xs font-semibold py-1.5 rounded-md border transition-all ${
                                    activeScore === v
                                      ? 'bg-foreground text-background border-foreground'
                                      : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
                                  }`}
                                >
                                  {v}
                                </button>
                              ))}
                              <button
                                onClick={() => setScoreLevelExpanded(s => ({ ...s, [activeCriterion.id]: true }))}
                                className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground/50 hover:border-foreground/40 hover:text-foreground transition-all shrink-0"
                                title="Show level descriptors"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4h8M2 8h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                              </button>
                            </div>
                          )}

                          {/* Expanded vertical list with descriptors */}
                          {scoreLevelExpanded[activeCriterion.id] && (
                            <div className="space-y-1">
                              {[1, 2, 3, 4, 5].map((v, i) => {
                                const selected = activeScore === v
                                return (
                                  <button
                                    key={v}
                                    onClick={() => handleLevelSelect(activeCriterion.id, v)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                                      selected
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'bg-background border-border hover:border-foreground/40'
                                    }`}
                                  >
                                    <span className={`text-sm font-bold tabular-nums shrink-0 ${selected ? 'text-background' : 'text-foreground'}`}>{v}</span>
                                    <span className={`text-xs leading-snug ${selected ? 'text-background/80' : 'text-muted-foreground'}`}>
                                      {activeCriterion.levelLabels[i] ?? `Level ${v}`}
                                    </span>
                                  </button>
                                )
                              })}
                              <button
                                onClick={() => setScoreLevelExpanded(s => ({ ...s, [activeCriterion.id]: false }))}
                                className="w-full text-xs text-muted-foreground/50 hover:text-foreground py-1 text-center transition-colors"
                              >
                                Collapse ↑
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Reason */}
                        <div className="px-4 py-4 space-y-2">
                          <span className="eyebrow text-muted-foreground">Reason for this score</span>
                          <Textarea
                            value={reasons[activeCriterion.id] ?? ''}
                            onChange={e => setReasons(r => ({ ...r, [activeCriterion.id]: e.target.value }))}
                            rows={3}
                            placeholder="Explain your reasoning for this score…"
                          />
                        </div>

                        {/* Evidence */}
                        <div className="px-4 py-4 space-y-3">
                          <span className="eyebrow text-muted-foreground">Evidence ({pointEvidence.length} linked)</span>
                          {pointEvidence.length === 0 ? (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              No evidence linked. Scores with evidence attached see 40% fewer re-evaluation requests.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {pointEvidence.map((ev, i) => (
                                <div
                                  key={ev.id}
                                  className="group/ev inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border border-border bg-muted/30 text-xs"
                                  title={ev.text}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                                  <span className="font-medium text-foreground">Evidence #{i + 1}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => removeEvidence(ev.id)}
                                    className="opacity-60 hover:opacity-100"
                                    aria-label={`Remove evidence ${i + 1}`}
                                  >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          {isModeActiveHere ? (
                            <Button variant="default" size="sm" onClick={cancelSelectionMode} className="w-full">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                                <path d="M4.5 5.5l-2 2a2.4 2.4 0 0 0 3.4 3.4l2-2M7.5 5.5l2-2a2.4 2.4 0 0 0-3.4-3.4l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                              </svg>
                              Selecting evidence…
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => enterSelectionMode(activeCriterion.id)} className="w-full border-dashed">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                                <path d="M4.5 5.5l-2 2a2.4 2.4 0 0 0 3.4 3.4l2-2M7.5 5.5l2-2a2.4 2.4 0 0 0-3.4-3.4l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                              </svg>
                              + Add evidence
                            </Button>
                          )}
                        </div>

                        {/* Feedback */}
                        <div className="px-4 py-4 space-y-2">
                          <span className="eyebrow text-muted-foreground">Feedback</span>
                          <Textarea
                            value={feedbacks[activeCriterion.id] ?? ''}
                            onChange={e => setFeedbacks(f => ({ ...f, [activeCriterion.id]: e.target.value }))}
                            rows={4}
                            placeholder="Write feedback for this criterion…"
                          />
                        </div>


                      </div>
                    )
                  })()}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="px-4 pt-3 pb-4 border-t border-border bg-background shrink-0 space-y-3">
                {/* Total score */}
                <div>
                  <span className="eyebrow text-muted-foreground/60">Total</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-bold tabular-nums text-foreground">
                      {paperScores.reduce((s, sc) => s + sc.instructorLevel, 0)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {criteria.length * 5}
                    </span>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveCriterionIdx(i => Math.max(0, i - 1))}
                    disabled={activeCriterionIdx === 0}
                    className="shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <Button variant="outline" size="sm" className="shrink-0">
                    Save
                  </Button>

                  {!isLastCriterion ? (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setActiveCriterionIdx(i => i + 1)}
                    >
                      Next criterion <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger render={<span className="inline-flex flex-1" />}>
                        <Button
                          size="sm"
                          className="w-full relative overflow-hidden group"
                          disabled={!isAllGraded}
                          onClick={() => {
                            if (!hasScrolledToBottom) {
                              // Trigger visual shake or show message
                              setShowScrollMsg(true)
                              setTimeout(() => setShowScrollMsg(false), 3000)
                              return
                            }
                            if (isGateUnlocked) handleNext()
                          }}
                        >
                          {isGateUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          {isLastPaper ? 'View delta' : 'Next paper'}
                          <ArrowRight className="h-4 w-4" />
                          
                          {showScrollMsg && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              className="absolute inset-0 bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-bold px-2 text-center leading-tight"
                            >
                              YOU NEED TO SCROLL ALL AND YOU HAVE TO SCROLL TO THE BOTTOM
                            </motion.div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3 space-y-1 mb-2">
                        <p className="text-xs font-semibold text-foreground">Protocol gate locked</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {!isAllGraded 
                            ? `Grade all ${criteria.length} criteria to unlock.` 
                            : "Scroll to the bottom of the manuscript to unlock."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      {/* Floating evidence-link popover — appears next to highlighted text when
          the user selects text WITHOUT first clicking "+ Add evidence".
          (The pre-scoped button-first flow auto-links on mouseup and never
          reaches this branch.) Full criteria picker so the instructor picks. */}
      {selection && (
        <div
          className="fixed z-[100] bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-xl p-3 flex flex-col gap-2 w-72 backdrop-blur-md"
          style={{ left: selection.x, top: selection.y, transform: "translate(-50%, -110%)" }}
          onMouseDown={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-border/60 mb-1">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-primary">
                  <path d="M5 7l-2 2a2.8 2.8 0 0 0 4 4l2-2M9 7l2-2a2.8 2.8 0 0 0-4-4L5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="eyebrow text-muted-foreground">Link evidence</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground tabular-nums">Paper {currentPaperIndex + 1}</span>
            </div>
            <div className="px-2 pb-1">
              <p className="text-xs font-serif italic text-foreground/70 leading-relaxed line-clamp-2">
                &ldquo;{selection.text.length > 100 ? selection.text.slice(0, 100) + "…" : selection.text}&rdquo;
              </p>
            </div>
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
              {criteria.map(c => (
                <div
                  key={c.id}
                  role="button"
                  onClick={() => linkEvidenceToCriterion(c.id)}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-primary/5 transition-all flex flex-col gap-0.5 group/btn cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-tight text-foreground group-hover/btn:text-primary transition-colors">{c.name}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-all text-primary" />
                  </div>
                  <span className="eyebrow text-muted-foreground/60">Criterion {c.id.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <Separator className="bg-border/50 my-1" />
            <Button variant="ghost" size="sm" onClick={dismissSelection} className="w-full">Dismiss</Button>
        </div>
      )}
    </TooltipProvider>
  )
}
