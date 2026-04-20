"use client"

import { useGradingStore, CalibrationScore } from "@/lib/store/grading-store"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Loader2, ArrowLeft, User, Sparkles,
} from "lucide-react"

const MOCK_SECTIONS: { id: string; label: string; content: string }[] = [
  { id: "c1", label: "Architecture & Design", content: "The system architecture follows a strict MVC separation of concerns. The presentation layer delegates all business processing to the service tier, which in turn communicates with the repository layer through well-defined interfaces. Dependency injection is applied at the controller level, ensuring testability across all layers." },
  { id: "c2", label: "Code Quality", content: "The authentication controller validates incoming JWT tokens by delegating to the TokenValidationService. Upon successful validation, the UserContext is populated and propagated through the request lifecycle via a thread-local pattern. Edge cases handled include: expired tokens, malformed payloads, and missing Authorization headers." },
  { id: "c3", label: "Documentation", content: "API endpoints are documented using OpenAPI 3.0 annotations. Each endpoint specifies request/response schemas, authentication requirements, and error codes. Versioning follows the URI path convention (/api/v1, /api/v2). Deprecated endpoints include sunset headers per RFC 8594." },
  { id: "c4", label: "Testing", content: "Unit tests cover 87% of business logic branches using JUnit 5 and Mockito. Integration tests use an embedded H2 database. Load tests were conducted using Locust, simulating 500 concurrent users. P95 response time remained under 200ms across all critical endpoints." },
]

const COMPLETION_STEPS = [
  "Syncing resolved scores",
  "Recalculating rubric weights",
  "Updating AI grading model",
  "Finalising calibration profile",
]

function scoreKey(s: CalibrationScore) {
  return `${s.paperId}-${s.criterionId}`
}

function deltaColors(delta: number) {
  if (delta >= 3) return { badge: "bg-red-50 text-red-700 border border-red-200", num: "bg-red-50 text-red-700 border-red-200", text: "text-red-700" }
  if (delta >= 2) return { badge: "bg-amber-50 text-amber-700 border border-amber-200", num: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700" }
  return { badge: "bg-green-50 text-green-700 border border-green-200", num: "bg-green-50 text-green-700 border-green-200", text: "text-green-700" }
}

export function NegotiationDialogue({ assignmentId }: { assignmentId: string }) {
  const {
    calibration,
    setCalibrationPhase,
    resolveScore,
    addEvidenceExchange,
    completeCalibration,
    setInstructorLevel,
  } = useGradingStore()
  const cal = calibration[assignmentId]

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeIdx, setActiveIdx] = useState(0)
  const [activePaperIdx, setActivePaperIdx] = useState(0)
  const [aiOpen, setAiOpen] = useState<Record<string, boolean>>({})
  const [compareOn, setCompareOn] = useState<Record<string, boolean>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [adjustMode, setAdjustMode] = useState<Record<string, boolean>>({})
  const [adjustLevel, setAdjustLevel] = useState<Record<string, number>>({})
  const [showModal, setShowModal] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [allDone, setAllDone] = useState(false)

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const modalFired = useRef(false)
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  if (!cal) return null
  const { papers, criteria, scores } = cal

  // ── Derived ───────────────────────────────────────────────────────────────
  const discrepancies: CalibrationScore[] = [...scores]
    .filter(s => s.instructorLevel > 0 && s.delta >= 1)
    .sort((a, b) => b.delta - a.delta)

  const resolvedCount = discrepancies.filter(
    s => s.status === "accepted" || s.status === "resolved"
  ).length
  const totalCount = discrepancies.length
  const progressPct = totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0
  const activeCriterionId = discrepancies[activeIdx]?.criterionId ?? null

  // ── Modal trigger ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (modalFired.current) return
    if (resolvedCount > 0 && resolvedCount >= totalCount) {
      modalFired.current = true
      setShowModal(true)
      timerRefs.current.forEach(clearTimeout)
      timerRefs.current = []
      const perStep = 900
      COMPLETION_STEPS.forEach((_, i) => {
        timerRefs.current.push(
          setTimeout(() => setActiveStep(i), 400 + i * perStep),
          setTimeout(() => {
            setCompletedSteps(prev => [...prev, i])
            setActiveStep(i + 1 < COMPLETION_STEPS.length ? i + 1 : null)
          }, 400 + i * perStep + 650)
        )
      })
      timerRefs.current.push(
        setTimeout(() => setAllDone(true), 400 + COMPLETION_STEPS.length * perStep)
      )
    }
  }, [resolvedCount, totalCount])

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigateTo = (idx: number) => {
    setActiveIdx(idx)
    setTimeout(() => {
      cardRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 60)
  }

  // ── Resolve ───────────────────────────────────────────────────────────────
  const handleResolve = (
    discIdx: number,
    type: "accept" | "keep" | "adjust",
    newLevel?: number
  ) => {
    const disc = discrepancies[discIdx]
    if (!disc) return
    const key = scoreKey(disc)

    if (type === "accept") {
      addEvidenceExchange(assignmentId, disc.paperId, disc.criterionId, { type: "accept_ai" })
      resolveScore(assignmentId, disc.paperId, disc.criterionId, "accepted")
    } else if (type === "keep") {
      addEvidenceExchange(assignmentId, disc.paperId, disc.criterionId, {
        type: "add_instructor",
        note: feedbacks[key] || "Instructor maintained their assessment.",
      })
      resolveScore(assignmentId, disc.paperId, disc.criterionId, "resolved")
    } else if (type === "adjust" && newLevel) {
      setInstructorLevel(assignmentId, disc.paperId, disc.criterionId, newLevel)
      addEvidenceExchange(assignmentId, disc.paperId, disc.criterionId, {
        type: "revise_self",
        note: `Revised from ${disc.instructorLevel} to ${newLevel}.`,
      })
      resolveScore(
        assignmentId, disc.paperId, disc.criterionId,
        newLevel === disc.aiLevel ? "accepted" : "resolved"
      )
    }

    setAdjustMode(prev => ({ ...prev, [key]: false }))
    setAdjustLevel(prev => ({ ...prev, [key]: 0 }))

    // Auto-advance to next unresolved
    const nextIdx = discrepancies.findIndex(
      (d, i) => i > discIdx && d.status !== "accepted" && d.status !== "resolved"
    )
    if (nextIdx !== -1) {
      setTimeout(() => navigateTo(nextIdx), 500)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">

      {/* ── Slim review bar ── */}
      <div className="shrink-0 bg-foreground text-background px-5 flex items-center gap-3" style={{ height: 42 }}>
        <button
          onClick={() => setCalibrationPhase(assignmentId, "delta_review")}
          className="flex items-center gap-1.5 text-xs font-medium text-background/75 hover:text-background transition-colors shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Exit review
        </button>
        <span className="text-xs font-medium text-background/90">Reviewing differences</span>
        <span className="text-xs font-mono bg-white/15 rounded-full px-2.5 py-[2px] shrink-0">
          {activeIdx + 1} of {totalCount}
        </span>
        <div className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-mono text-background/75 shrink-0">
          {resolvedCount} resolved
        </span>
      </div>

      {/* ── Main body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: manuscript ── */}
        <div className="w-[60%] border-r border-border/40 bg-white flex flex-col overflow-hidden">

          {/* Paper selector header */}
          <div className="shrink-0 px-5 py-2.5 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold font-mono bg-muted/50 border border-border/50 rounded px-2 py-0.5 text-muted-foreground">
                {papers[activePaperIdx]?.anonymizedLabel ?? "Paper 1"}
              </span>
              <span className="text-xs text-muted-foreground/70">
                {papers.length} papers
              </span>
            </div>
            <div className="flex gap-1.5">
              {papers.map((p, i) => (
                <button
                  key={p.paperId}
                  onClick={() => setActivePaperIdx(i)}
                  className={`w-7 h-7 rounded-lg border text-xs font-semibold font-mono transition-colors ${
                    activePaperIdx === i
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/20 border-border/50 text-muted-foreground hover:border-border"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Essay content — native scroll for reliable height */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-12 py-9 pb-16">
              <h1 className="text-xl font-bold tracking-tight leading-snug mb-1.5">
                Student Submission
              </h1>
              <p className="text-xs font-mono text-muted-foreground/60 mb-7 pb-5 border-b border-border/30">
                {papers[activePaperIdx]?.anonymizedLabel} · Submitted for review
              </p>
              {MOCK_SECTIONS.map(sec => {
                const isActive = sec.id === activeCriterionId
                return (
                  <div key={sec.id} className="mb-7">
                    <h2 className={`text-sm font-semibold mb-2 ${isActive ? "text-foreground" : "text-foreground/70"}`}>
                      {sec.label}
                    </h2>
                    <p
                      className={`text-sm leading-[1.85] rounded px-1.5 py-0.5 transition-colors ${
                        isActive
                          ? "text-foreground bg-amber-50/70 border-b-2 border-amber-400/60"
                          : "text-muted-foreground/75"
                      }`}
                    >
                      {sec.content}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right: discrepancy cards — native scroll ── */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-muted/20">
            <div className="px-3.5 py-4 pb-20 flex flex-col gap-3">
              {discrepancies.map((disc, idx) => {
                const key = scoreKey(disc)
                const isActive = idx === activeIdx
                const isResolved = disc.status === "accepted" || disc.status === "resolved"
                const criterion = criteria.find(c => c.id === disc.criterionId)
                const paper = papers.find(p => p.paperId === disc.paperId)
                const dc = deltaColors(disc.delta)
                const isAiOpen = aiOpen[key] ?? false
                const isCompare = compareOn[key] ?? false
                const isAdj = adjustMode[key] ?? false
                const adjLvl = adjustLevel[key] ?? 0
                const fb = feedbacks[key] ?? ""

                return (
                  <div
                    key={key}
                    ref={el => { cardRefs.current[idx] = el }}
                    className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-opacity ${
                      isResolved ? "opacity-65" : "opacity-100"
                    } ${isActive ? "border-border/60" : "border-border/40"}`}
                  >
                    {/* Card header — always visible */}
                    <div
                      onClick={() => navigateTo(idx)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 cursor-pointer transition-colors border-b ${
                        isResolved
                          ? "bg-green-50 border-transparent"
                          : isActive
                          ? "bg-white border-border/30"
                          : "hover:bg-muted/20 border-transparent"
                      }`}
                    >
                      {/* Number badge */}
                      <div className={`w-[26px] h-[26px] rounded-full border text-xs font-bold font-mono flex items-center justify-center shrink-0 ${dc.num}`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate leading-tight">
                          {criterion?.name}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground/70 leading-tight">
                          {paper?.anonymizedLabel}
                        </p>
                      </div>

                      <span className={`text-xs font-bold font-mono px-2.5 py-[3px] rounded-full shrink-0 ${dc.badge}`}>
                        +{disc.delta} gap
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform ${isActive ? "rotate-180" : ""}`}
                      />
                    </div>

                    {/* Card body — only when active */}
                    {isActive && (
                      <div className="p-3.5 flex flex-col gap-3">

                        {/* ── Score row ── */}
                        <div>
                          <div className="flex items-stretch gap-2.5">
                            {/* Your score */}
                            <div className="flex-1 bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5">
                              <p className="eyebrow font-semibold text-muted-foreground/70 mb-1">
                                Your score
                              </p>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-2xl font-bold font-mono leading-none">
                                  {disc.instructorLevel}
                                </span>
                                <span className="text-sm font-normal text-muted-foreground/55">/5</span>
                              </div>
                            </div>

                            <div className="flex items-center text-xs font-semibold text-muted-foreground/60 px-1 shrink-0">
                              vs
                            </div>

                            {/* AI score */}
                            <div className="flex-1 bg-muted/10 border border-border/40 rounded-lg px-3 py-2.5">
                              <p className="eyebrow font-semibold text-muted-foreground/70 mb-1">
                                AI score
                              </p>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-2xl font-bold font-mono leading-none text-amber-600">
                                  {disc.aiLevel}
                                </span>
                                <span className="text-sm font-normal text-muted-foreground/55">/5</span>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-1.5 flex-wrap mt-2.5">
                            {isResolved ? (
                              <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 border border-green-200 text-green-700">
                                ✓ Resolved — {disc.status === "accepted" ? "Accepted AI" : "Kept yours"}
                              </span>
                            ) : !isAdj ? (
                              <>
                                <button
                                  onClick={() => handleResolve(idx, "accept")}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
                                >
                                  Accept AI
                                </button>
                                <button
                                  onClick={() => handleResolve(idx, "keep")}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                  Keep Mine
                                </button>
                                <button
                                  onClick={() => setAdjustMode(prev => ({ ...prev, [key]: true }))}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-border/60 text-muted-foreground hover:bg-muted/20 transition-colors"
                                >
                                  Adjust score
                                </button>
                              </>
                            ) : null}
                          </div>

                          {/* Inline score adjuster */}
                          {isAdj && !isResolved && (
                            <div className="mt-2.5 space-y-2">
                              <p className="eyebrow text-muted-foreground/70">
                                Select adjusted score
                              </p>
                              <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(l => (
                                  <button
                                    key={l}
                                    onClick={() => setAdjustLevel(prev => ({ ...prev, [key]: l }))}
                                    className={`flex-1 h-9 rounded-lg text-sm font-bold border transition-colors ${
                                      adjLvl === l
                                        ? "bg-foreground text-background border-foreground"
                                        : "border-border/50 text-muted-foreground hover:border-foreground/30"
                                    }`}
                                  >
                                    {l}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => {
                                    setAdjustMode(prev => ({ ...prev, [key]: false }))
                                    setAdjustLevel(prev => ({ ...prev, [key]: 0 }))
                                  }}
                                  className="text-xs text-muted-foreground/65 hover:text-foreground px-2 py-1 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => adjLvl > 0 && handleResolve(idx, "adjust", adjLvl)}
                                  disabled={adjLvl === 0}
                                  className="flex-1 py-1.5 text-xs font-semibold bg-foreground text-background rounded-lg disabled:opacity-40 hover:bg-foreground/90 transition-colors"
                                >
                                  Confirm adjustment
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Compare toggle */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => setCompareOn(prev => ({ ...prev, [key]: !isCompare }))}
                            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-md transition-colors ${
                              isCompare
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-white border-border/50 text-muted-foreground hover:bg-muted/10"
                            }`}
                          >
                            Compare Views
                          </button>
                        </div>

                        {/* ── Evaluation panels ── */}
                        {!isCompare ? (
                          <>
                            {/* Your evaluation */}
                            <div className="bg-blue-50/50 border border-blue-200/70 rounded-lg p-3">
                              <p className="eyebrow text-blue-700 mb-2 flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                Your evaluation
                              </p>
                              {/* Evidence chips from evidenceExchanges */}
                              {disc.evidenceExchanges.filter(e => e.type === "add_instructor" && e.note).map((e, i) => (
                                <div key={e.id} className="flex items-start gap-2 bg-white border border-border/40 rounded-md px-2.5 py-1.5 mb-2">
                                  <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                  </div>
                                  <p className="text-xs leading-relaxed text-muted-foreground italic">
                                    {e.note}
                                  </p>
                                </div>
                              ))}
                              {disc.evidenceExchanges.filter(e => e.type === "add_instructor").length === 0 && (
                                <p className="text-xs text-muted-foreground/60 mb-2">No evidence linked</p>
                              )}
                              <Textarea
                                value={fb}
                                onChange={e => setFeedbacks(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder="Your reasoning for this score…"
                                className="text-xs resize-none h-[72px] bg-white border-border/40 focus-visible:ring-blue-200/50 mt-1"
                                disabled={isResolved}
                              />
                            </div>

                            {/* AI perspective accordion */}
                            <div className="border border-border/40 rounded-lg overflow-hidden">
                              <button
                                onClick={() => setAiOpen(prev => ({ ...prev, [key]: !isAiOpen }))}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors ${
                                  isAiOpen
                                    ? "bg-amber-50 border-b border-amber-200"
                                    : "bg-muted/10 hover:bg-muted/20"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground/70" />
                                  <span className="text-foreground/80">View AI Perspective</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                    disc.delta >= 3 ? "bg-red-50 text-red-700 border-red-200"
                                    : disc.delta >= 2 ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                  }`}>
                                    {disc.delta >= 3 ? "Low confidence" : disc.delta >= 2 ? "Med confidence" : "High confidence"}
                                  </span>
                                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground/60 transition-transform ${isAiOpen ? "rotate-180" : ""}`} />
                                </div>
                              </button>
                              {isAiOpen && (
                                <div className="p-3 space-y-2.5 bg-white">
                                  {/* AI evidence chips */}
                                  {disc.aiEvidence.length > 0 ? disc.aiEvidence.map((ev, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-muted/20 border border-border/40 rounded-md px-2.5 py-1.5">
                                      <div className="w-4 h-4 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                      </div>
                                      <p className="text-xs leading-relaxed text-muted-foreground italic">{ev}</p>
                                    </div>
                                  )) : (
                                    <p className="text-xs text-muted-foreground/65">No AI evidence provided</p>
                                  )}
                                  {/* AI reasoning */}
                                  <p className="text-xs leading-relaxed text-muted-foreground">
                                    {disc.aiReasoning}
                                  </p>
                                  {/* Signal tags */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {disc.instructorLevel < disc.aiLevel ? (
                                      <>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">✓ Strong AI evidence</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">✗ You scored below AI</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">✓ You scored higher</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">✗ AI may have underweighted</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          /* Compare split */
                          <div className="flex gap-2.5">
                            <div className="flex-1 space-y-1.5">
                              <span className="text-xs font-bold tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block">
                                Your evaluation
                              </span>
                              <Textarea
                                value={fb}
                                onChange={e => setFeedbacks(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder="Your reasoning…"
                                className="text-xs resize-none h-[96px] bg-white border-border/40 focus-visible:ring-blue-200/50"
                                disabled={isResolved}
                              />
                            </div>
                            <div className="w-px bg-border/40 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <span className="text-xs font-bold tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded inline-block">
                                AI evaluation
                              </span>
                              {disc.aiEvidence.map((ev, i) => (
                                <div key={i} className="flex items-start gap-1.5 mb-1.5">
                                  <div className="w-4 h-4 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                  </div>
                                  <p className="text-xs leading-relaxed text-muted-foreground italic">{ev}</p>
                                </div>
                              ))}
                              <p className="text-xs leading-relaxed text-muted-foreground">{disc.aiReasoning}</p>
                            </div>
                          </div>
                        )}

                        {/* ── Card footer nav ── */}
                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/20">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => idx > 0 && navigateTo(idx - 1)}
                              disabled={idx === 0}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-border/50 rounded-md bg-white text-muted-foreground hover:bg-muted/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" /> Previous
                            </button>
                            <span className="text-xs font-mono text-muted-foreground/65">
                              {idx + 1} of {totalCount}
                            </span>
                            <button
                              onClick={() => idx < totalCount - 1 && navigateTo(idx + 1)}
                              disabled={idx >= totalCount - 1}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-border/50 rounded-md bg-white text-muted-foreground hover:bg-muted/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                            >
                              Next <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground/65">
                            {resolvedCount}/{totalCount} resolved
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
        </div>
      </div>

      {/* ── Completion modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(20,18,16,.55)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ scale: 0.97, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 16 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="bg-white border border-border/40 rounded-[20px] shadow-2xl px-10 py-9 w-[400px] flex flex-col items-center gap-5"
            >
              {/* Icon */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {allDone ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div key="spin" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Loader2 className="h-10 w-10 text-foreground/25 animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Title */}
              <div className="text-center">
                <h3 className="text-lg font-bold tracking-tight">Updating Calibration</h3>
                <p className="text-sm text-muted-foreground mt-1 min-h-[20px] transition-all">
                  {allDone
                    ? "Calibration complete — ready to grade"
                    : "Applying your resolved scores across all papers…"}
                </p>
              </div>

              {/* Steps */}
              <div className="w-full flex flex-col gap-2">
                {COMPLETION_STEPS.map((step, i) => {
                  const done = completedSteps.includes(i)
                  const active = activeStep === i && !done
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] border text-sm transition-all duration-300 ${
                        done
                          ? "bg-green-50 border-green-200 text-foreground/70"
                          : active
                          ? "bg-blue-50 border-blue-200 text-foreground/70"
                          : "bg-muted/20 border-border/40 text-muted-foreground/65"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${
                          done ? "bg-green-500"
                          : active ? "bg-blue-500 animate-pulse"
                          : "bg-border"
                        }`}
                      />
                      <span className="flex-1">{step}</span>
                      {done && <span className="text-xs font-semibold text-green-600 ml-auto">✓</span>}
                    </div>
                  )
                })}
              </div>

              {/* CTA */}
              <Button
                onClick={() => completeCalibration(assignmentId)}
                disabled={!allDone}
                className="w-full h-[46px] rounded-[10px] bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm disabled:opacity-35 gap-2 transition-all"
              >
                Proceed to Grade
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
