"use client"

import { useGradingStore } from "@/lib/store/grading-store"
import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Timer,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Wifi,
  AlertTriangle,
} from "lucide-react"

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
  high_confidence: { dot: "bg-green-500", badge: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20", icon: ShieldAlert },
  ocr_issue:       { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20", icon: Wifi },
  complex_case:    { dot: "bg-red-500",   badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",     icon: AlertTriangle },
}

export function BlindGradingPanel({ assignmentId }: { assignmentId: string }) {
  const { calibration, setInstructorLevel, setCalibrationPhase, setActiveCalibrationPaper, computeDelta } = useGradingStore()
  const cal = calibration[assignmentId]

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [inspectionTime, setInspectionTime] = useState(0)
  const [activeCriterionIdx, setActiveCriterionIdx] = useState(0)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({})
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
  const toggleAccordion = (key: string) => setAccordionOpen(prev => ({ ...prev, [key]: !prev[key] }))

  // Reset gates when switching papers
  useEffect(() => {
    setInspectionTime(0)
    setHasScrolledToBottom(false)
    setActiveCriterionIdx(0)
    if (manuscriptRef.current) manuscriptRef.current.scrollTop = 0
    const interval = setInterval(() => setInspectionTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [activePaperId])

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

          {/* ── Left Panel: Paper Navigator ── */}
          <ResizablePanel defaultSize={20} minSize={15} className="bg-muted/5">
            <div className="flex flex-col h-full border-r border-border">
              <div className="p-4 border-b border-border space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="eyebrow text-muted-foreground/80">
                    Blind Queue
                  </h2>
                  <Badge variant="outline" className="rounded-full bg-background border-border text-xs">
                    {totalGradedPapers}/{papers.length}
                  </Badge>
                </div>
                <Progress
                  value={(totalGradedPapers / Math.max(papers.length, 1)) * 100}
                  className="h-1 bg-muted/40"
                />
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {papers.map((paper, idx) => {
                    const isActive   = paper.paperId === activePaperId
                    const isGraded   = scores.filter(s => s.paperId === paper.paperId).every(s => s.instructorLevel > 0) && criteria.length > 0
                    const catConfig  = CATEGORY_CONFIG[paper.selectionReason] ?? CATEGORY_CONFIG.high_confidence

                    return (
                      <div
                        key={paper.paperId}
                        role="button"
                        onClick={() => setActiveCalibrationPaper(assignmentId, paper.paperId)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left text-sm ${
                          isActive
                            ? "bg-white text-foreground shadow-xl border border-border ring-1 ring-primary/20 z-10"
                            : "hover:bg-accent/40 text-muted-foreground border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${catConfig.dot} ${isActive ? 'shadow-[0_0_8px_rgba(var(--primary),0.4)]' : ''}`} />
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className={`eyebrow tracking-tight truncate ${isActive ? "text-primary" : "text-foreground/70"}`}>
                              {paper.anonymizedLabel}
                            </span>
                            <span className="eyebrow text-muted-foreground/40 tabular-nums">
                              Paper {idx + 1}
                            </span>
                          </div>
                          {isActive && <Sparkles className="h-2.5 w-2.5 text-primary shrink-0 ml-1" />}
                        </div>
                        {isGraded && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border" />

          {/* ── Center Panel: Manuscript Viewer ── */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-muted/10">
              {/* Header */}
              <header className="p-4 border-b border-border bg-background flex flex-col gap-4 z-10 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="eyebrow text-primary/60 mb-0.5">
                        Blind Manuscript
                      </span>
                      <h2 className="text-sm font-black tracking-tight text-foreground">
                        {currentPaper.anonymizedLabel}
                      </h2>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-border mx-2" />
                    <span className="eyebrow text-muted-foreground/40">
                      Paper {currentPaperIndex + 1} of {papers.length}
                    </span>
                  </div>

                  {/* Engagement gates strip */}
                  <div className="flex items-center gap-4">
                    <div className="eyebrow flex items-center gap-3 px-5 py-2 bg-accent/40 rounded-full border border-border/50 text-muted-foreground/60 transition-all cursor-default">
                      <Tooltip>
                        <TooltipTrigger render={<span className={`flex items-center gap-1.5 transition-colors ${hasScrolledToBottom ? "text-green-500" : ""}`} />}>
                          {hasScrolledToBottom ? <CheckCircle2 className="h-3 w-3" /> : "○"} Read
                        </TooltipTrigger>
                        <TooltipContent>Scroll to the bottom of the manuscript to unlock</TooltipContent>
                      </Tooltip>
                      <Separator orientation="vertical" className="h-3 bg-border" />
                      <Tooltip>
                        <TooltipTrigger render={<span className={`flex items-center gap-1.5 transition-colors ${inspectionTime >= 3 ? "text-green-500" : ""}`} />}>
                          <Timer className="h-3 w-3" /> {Math.min(inspectionTime, 3)}s/3s
                        </TooltipTrigger>
                        <TooltipContent>Spend at least 3 seconds reviewing the paper</TooltipContent>
                      </Tooltip>
                      <Separator orientation="vertical" className="h-3 bg-border" />
                      <Tooltip>
                        <TooltipTrigger render={<span className={`flex items-center gap-1.5 transition-colors ${isAllGraded ? "text-green-500" : ""}`} />}>
                          {isAllGraded ? <CheckCircle2 className="h-3 w-3" /> : "○"} Scored
                        </TooltipTrigger>
                        <TooltipContent>Grade all {criteria.length} criteria to unlock</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </header>

              {/* Manuscript Viewer */}
              <div
                ref={manuscriptRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto bg-[#F9F8F4] scroll-smooth p-10 lg:p-24"
              >
                <div 
                  className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-[#E6E1D6]/50 mx-auto transition-all duration-300 relative group/page cursor-text flex flex-col"
                  style={{ width: "100%", maxWidth: "800px", minHeight: "100%" }}
                >
                  <div className="absolute top-8 left-8 flex flex-col items-start gap-1">
                    <span className="eyebrow text-primary/40 group-hover/page:text-primary transition-colors">Blind Calibration</span>
                    <span className="eyebrow text-[#E6E1D6] group-hover/page:text-slate-400 transition-colors">Digital Manuscript</span>
                  </div>

                  <div className="p-16 lg:p-24 h-full font-serif overflow-hidden flex-1">
                    <div className="max-w-3xl mx-auto space-y-10">
                      <div className="space-y-6 border-b border-border/80 pb-8">
                        <div className="flex items-center justify-between mt-8">
                          <h1 className="text-4xl font-serif text-foreground leading-tight italic tracking-tight underline decoration-primary/20">Software Engineering — Phase 2</h1>
                        </div>
                        <p className="text-xs text-slate-400 italic">Identity anonymized for calibration protocol</p>
                      </div>

                      <div className="space-y-12">
                        {criteria.map((criterion, idx) => (
                          <div key={criterion.id} className="space-y-6">
                            <h2 className="text-xl font-bold italic border-l-2 border-amber-500 pl-4 tracking-tight text-slate-800 flex items-center gap-3">
                              <span className="eyebrow text-amber-500/80 not-italic shrink-0">
                                {criterion.id.toUpperCase()}
                              </span>
                              {criterion.name}
                            </h2>
                            <div className="space-y-6 text-lg leading-[1.8] text-foreground/90 pl-5">
                              {(MOCK_MANUSCRIPT_CONTENT[criterion.id] ?? [
                                "The student's response for this criterion demonstrates awareness of core concepts with moderate elaboration. Evidence of applied understanding is present though further depth would strengthen the argument.",
                                "Supporting examples are provided with references to course material. The logical flow is maintained throughout this section with minor inconsistencies in the latter portion.",
                              ]).map((para, i) => (
                                <p key={i} className="font-serif italic font-medium text-slate-700">{para}</p>
                              ))}
                            </div>
                            {idx < criteria.length - 1 && <Separator className="mt-8 opacity-20 border-[#E6E1D6]" />}
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
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone ? 'bg-foreground border-foreground' :
                          isActive ? 'border-primary bg-background' :
                          'border-border bg-background'
                        }`}>
                          {isActive && !isDone && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
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
                <div className="p-4 space-y-3">
                  {activeCriterion && (
                    <>
                      {/* Main criterion card — matches grading card treatment */}
                      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        <div className="p-4 space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground leading-tight">{activeCriterion.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {activeCriterion.levelLabels.join(' → ')}
                            </p>
                          </div>

                          {/* Score row — single-line layout matching grading pattern */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="eyebrow text-muted-foreground">Your score</span>
                              {activeScore > 0 && (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-bold text-foreground tabular-nums">{activeScore}</span>
                                  <span className="text-sm text-muted-foreground">/5</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map(v => (
                                <Button
                                  key={v}
                                  variant={activeScore === v ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleLevelSelect(activeCriterion.id, v)}
                                  className="flex-1"
                                >
                                  {v}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Reason (shown once score is selected) */}
                          {activeScore > 0 && (
                            <div className="space-y-1.5">
                              <span className="eyebrow text-muted-foreground">Reason for this score</span>
                              <textarea
                                value={reasons[activeCriterion.id] ?? ''}
                                onChange={e => setReasons(r => ({ ...r, [activeCriterion.id]: e.target.value }))}
                                rows={3}
                                placeholder="Explain your reasoning for this score…"
                                className="w-full text-sm leading-relaxed text-foreground bg-background border border-border rounded-md p-2.5 resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary font-sans min-h-[72px] transition-colors"
                              />
                            </div>
                          )}

                          {/* Feedback */}
                          <div className="space-y-1.5">
                            <span className="eyebrow text-muted-foreground">Feedback</span>
                            <textarea
                              value={feedbacks[activeCriterion.id] ?? ''}
                              onChange={e => setFeedbacks(f => ({ ...f, [activeCriterion.id]: e.target.value }))}
                              rows={4}
                              placeholder="Write feedback for this criterion…"
                              className="w-full text-sm leading-relaxed text-foreground bg-background border border-border rounded-md p-2.5 resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary font-sans min-h-[90px] transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Evidence accordion — same card treatment */}
                      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        <Button
                          variant="ghost"
                          onClick={() => toggleAccordion('evidence')}
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M2 6h5M2 9h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            </div>
                            Evidence (0 linked)
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground/40 transition-transform shrink-0 ${accordionOpen.evidence ? 'rotate-90' : ''}`} />
                        </Button>
                        {accordionOpen.evidence && (
                          <div className="border-t border-border p-4 space-y-2">
                            <div className="text-xs text-primary bg-primary/5 border border-dashed border-primary/30 rounded-md p-2.5">
                              No evidence linked yet — select text in the left panel to add evidence
                            </div>
                            <Button variant="outline" size="sm" className="w-full border-dashed">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                              Add evidence — select text in left panel
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-background shrink-0 space-y-2">
                {isLastCriterion && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                    <span>Paper {currentPaperIndex + 1} of {papers.length}</span>
                    <span>{totalGradedPapers} complete</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveCriterionIdx(i => Math.max(0, i - 1))}
                    disabled={activeCriterionIdx === 0}
                  >
                    <ChevronLeft /> Previous
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm">
                      Save
                    </Button>

                    {!isLastCriterion ? (
                      <Button
                        size="sm"
                        onClick={() => setActiveCriterionIdx(i => i + 1)}
                      >
                        Next criterion <ArrowRight />
                      </Button>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger render={<span className="inline-flex" />}>
                          <Button
                            size="sm"
                            disabled={!isGateUnlocked}
                            onClick={isGateUnlocked ? handleNext : undefined}
                          >
                            {isGateUnlocked ? <Unlock /> : <Lock />}
                            {isLastPaper ? 'View delta' : 'Next paper'}
                            <ArrowRight />
                          </Button>
                        </TooltipTrigger>
                        {!isGateUnlocked && (
                          <TooltipContent className="max-w-xs p-3 space-y-1 mb-2">
                            <p className="text-xs font-semibold text-foreground">Protocol gate locked</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Scroll the manuscript, spend 3s reviewing, and score all {criteria.length} criteria.
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  )
}
