"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGradingStore } from "@/lib/store/grading-store"
import { X, ChevronRight, ChevronLeft, Check, AlertTriangle, CheckSquare, Info, FileText, CheckCircle2 } from "lucide-react"

import { confidenceStyles, statusStyles } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

// Category-2 (violet) slot is used as the spot-check accent so re-skins
// flow through design tokens automatically.
const ACCENT_BG = "bg-[color:var(--category-2-bg)]"
const ACCENT_BORDER = "border-[color:var(--category-2)]/40"
const ACCENT_TEXT = "text-[color:var(--category-2)]"
const ACCENT_SOLID = "bg-[color:var(--category-2)]"

const OVERRIDE_REASONS = [
  'AI missed contextual evidence',
  'Incorrect evidence interpretation',
  'Rubric misapplication',
  'OCR / extraction error',
  'Other',
]

const SC_QUESTIONS = [
  {
    student: 'Sneha Pillai', initials: 'SP', roll: '21BCE0887',
    criterion: 'Use of Evidence', critNum: 2,
    desc: 'Evaluates how effectively the student integrates textual, empirical, or scholarly evidence to support claims.',
    score: 4, maxScore: 5, conf: 'high' as const, confLabel: 'High confidence',
    evidence: '"indexing creates a data structure that improves data retrieval speed. Without an index, a full table scan. With an index, B-tree or hash."',
    evLoc: 'Technical depth · para 2',
  },
  {
    student: 'Aditya Sharma', initials: 'AS', roll: '21BCE0789',
    criterion: 'Argumentation', critNum: 3,
    desc: 'Assesses the strength, coherence, and logical structure of the argument presented throughout the essay.',
    score: 4, maxScore: 5, conf: 'high' as const, confLabel: 'High confidence',
    evidence: '"The trade-off between read performance and write overhead is explicitly acknowledged, with a concrete example referencing B-tree index maintenance costs on high-write tables."',
    evLoc: 'Analysis section · para 1',
  },
  {
    student: 'Vikram Patel', initials: 'VP', roll: '21BCE0356',
    criterion: 'Thesis Clarity', critNum: 1,
    desc: 'Evaluates whether the central argument is clearly stated, specific, and consistently maintained.',
    score: 3, maxScore: 5, conf: 'med' as const, confLabel: 'Medium confidence',
    evidence: '"Normalisation reduces redundancy and improves data integrity, though at the cost of query complexity when joins are required across many tables."',
    evLoc: 'Introduction · para 1',
  },
  {
    student: 'Ananya Krishnan', initials: 'AK', roll: '21BCE0923',
    criterion: 'Style & Voice', critNum: 4,
    desc: 'Assesses clarity of expression, appropriate academic register, and consistency of authorial voice.',
    score: 4, maxScore: 5, conf: 'high' as const, confLabel: 'High confidence',
    evidence: '"The author maintains a consistent analytical register throughout, shifting appropriately between descriptive and evaluative modes without losing coherence."',
    evLoc: 'Conclusion · para 1',
  },
  {
    student: 'Rahul Gupta', initials: 'RG', roll: '21BCE0112',
    criterion: 'Structure', critNum: 5,
    desc: 'Evaluates the organisation, flow, and logical sequencing of ideas across the essay.',
    score: 3, maxScore: 5, conf: 'med' as const, confLabel: 'Medium confidence',
    evidence: '"The essay moves from definition to application to evaluation, but the transition between the application and evaluation sections lacks a clear signpost sentence."',
    evLoc: 'Structure review · para 3',
  },
]

type SCResult =
  | { idx: number; status: 'confirmed'; score: number }
  | { idx: number; status: 'override'; origScore: number; newScore: number; reason: string }

export function SpotCheckModal() {
  const { spotCheckActive, dismissSpotCheck } = useGradingStore()

  const [scStep, setScStep] = useState(-1)
  const [scResults, setScResults] = useState<SCResult[]>([])
  const [overridePanelOpen, setOverridePanelOpen] = useState(false)
  const [pickedScore, setPickedScore] = useState<number | null>(null)
  const [pickedReason, setPickedReason] = useState<string | null>(null)

  useEffect(() => {
    if (spotCheckActive) {
      setScStep(-1)
      setScResults([])
      setOverridePanelOpen(false)
      setPickedScore(null)
      setPickedReason(null)
    }
  }, [spotCheckActive])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && spotCheckActive) dismissSpotCheck()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [spotCheckActive, dismissSpotCheck])

  const goNext = useCallback(() => {
    if (scStep === -1) { setScStep(0); return }
    if (scStep >= 0 && scStep < 5) {
      const q = SC_QUESTIONS[scStep]
      const result: SCResult = (overridePanelOpen && pickedScore && pickedReason)
        ? { idx: scStep, status: 'override', origScore: q.score, newScore: pickedScore, reason: pickedReason }
        : { idx: scStep, status: 'confirmed', score: q.score }
      setScResults(prev => [...prev, result])
      setOverridePanelOpen(false)
      setPickedScore(null)
      setPickedReason(null)
      setScStep(prev => prev + 1)
      return
    }
    if (scStep === 5) dismissSpotCheck()
  }, [scStep, overridePanelOpen, pickedScore, pickedReason, dismissSpotCheck])

  const goBack = useCallback(() => {
    if (scStep <= 0) return
    setScResults(prev => prev.slice(0, -1))
    setOverridePanelOpen(false)
    setPickedScore(null)
    setPickedReason(null)
    setScStep(prev => prev - 1)
  }, [scStep])

  const toggleOverride = useCallback(() => {
    setOverridePanelOpen(prev => {
      if (prev) { setPickedScore(null); setPickedReason(null) }
      return !prev
    })
  }, [])

  const answeredCount = scResults.length
  const isNextDisabled = overridePanelOpen && !(pickedScore && pickedReason)

  return (
    <AnimatePresence>
      {spotCheckActive && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) dismissSpotCheck() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden"
            style={{
              width: scStep >= 0 && scStep < 5 ? 920 : 560,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 60px)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="px-5 pt-4 border-b border-slate-200 flex-shrink-0" style={{ paddingBottom: scStep >= 0 && scStep < 5 ? 0 : 16 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                    style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#1F4E8C' }}>
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M8 5.5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-slate-900">Let&apos;s double-check a few</div>
                    <div className="text-xs text-slate-500">
                      {scStep === -1 ? '5 items · ~2 min' : scStep === 5 ? 'All done' : `Question ${scStep + 1} of 5`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={dismissSpotCheck}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors border border-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {scStep >= 0 && scStep < 5 && (
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1 rounded-full overflow-hidden bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(answeredCount / 5) * 100}%`, backgroundColor: '#1F4E8C' }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-500 flex-shrink-0 tabular-nums">{answeredCount} / 5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {SC_QUESTIONS.map((_, i) => {
                      const res = scResults.find(r => r.idx === i)
                      const isCurrent = i === scStep
                      const isDone = !!res
                      const isOverride = res?.status === 'override'
                      // Per the guide: solid navy for done, light-blue bg +
                      // navy border for current, amber for overrides, slate
                      // for pending. Connectors slate-200.
                      const dotStyle: React.CSSProperties = isOverride
                        ? { backgroundColor: '#FFFBEB', borderColor: '#F59E0B', color: '#B45309' }
                        : isDone
                          ? { backgroundColor: '#1F4E8C', borderColor: '#1F4E8C', color: '#FFFFFF' }
                          : isCurrent
                            ? { backgroundColor: '#EFF6FF', borderColor: '#1F4E8C', color: '#1F4E8C' }
                            : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#94A3B8' }
                      return (
                        <div key={i} className="flex items-center" style={{ flex: i < 4 ? '1 1 auto' : 'none' }}>
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors border-[1.5px]"
                            style={dotStyle}
                          >
                            {isOverride ? '!' : isDone ? '✓' : i + 1}
                          </div>
                          {i < 4 && <div className="flex-1 h-px mx-1 bg-slate-200" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* BODY */}
            <div className={cn(
              "flex-1 min-h-0 overflow-hidden",
              scStep >= 0 && scStep < 5 ? "grid grid-cols-[360px_1fr]" : "overflow-y-auto p-5"
            )}>

              {/* INTRO */}
              {scStep === -1 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Grading pace picked up toward the end of this batch — sometimes that&apos;s when small errors slip in. A quick re-check catches them before grades reach students.
                  </p>
                  <p className="text-xs text-slate-500">
                    Any changes save to the session.
                  </p>
                </div>
              )}

              {/* QUESTION */}
              {scStep >= 0 && scStep < 5 && (() => {
                const q = SC_QUESTIONS[scStep]
                const conf = confidenceStyles[q.conf]
                return (
                  <>
                    {/* LEFT — Preview pane: paper-style card with the
                        evidence passage shown in context. Surrounding text
                        is synthetic filler so the instructor can see WHERE
                        in the paper the AI pulled this sentence from. */}
                    <aside
                      className="border-r border-slate-200 overflow-y-auto p-5"
                      style={{ backgroundColor: '#F8F9FA' }}
                    >
                      <div className="text-xs font-semibold tracking-wider text-slate-400 mb-2">Student submission</div>
                      <div
                        className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      >
                        {/* Paper metadata */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <div className="text-sm font-semibold text-slate-900 leading-tight">{q.student}</div>
                            <div className="text-xs text-slate-500 font-mono">{q.roll}</div>
                          </div>
                          <span className="text-xs font-semibold tracking-wider text-slate-400">
                            {q.evLoc}
                          </span>
                        </div>

                        {/* Synthetic lead-in paragraph */}
                        <p className="text-xs text-slate-400 leading-relaxed">
                          The section opens with a brief motivation, describing the performance challenges that emerge as datasets scale beyond a few million rows. The author then transitions into the mechanics of the solution.
                        </p>

                        {/* The evidence — highlighted */}
                        <p className="text-sm text-slate-900 leading-relaxed">
                          <span
                            className="rounded-sm px-1 py-0.5 box-decoration-clone"
                            style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)' }}
                          >
                            {q.evidence}
                          </span>
                        </p>

                        {/* Synthetic lead-out */}
                        <p className="text-xs text-slate-400 leading-relaxed">
                          The discussion continues with a concrete example comparing query latency with and without the index, followed by a note on write-time overhead.
                        </p>

                        {/* Excerpt attribution */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M2 6h8M2 9h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          <span>Excerpt from the student&apos;s submission</span>
                        </div>
                      </div>
                    </aside>

                    {/* RIGHT — Questions pane */}
                    <div className="overflow-y-auto p-5">
                    {/* Student strip */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg mb-3.5 border border-slate-200 bg-slate-50">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 border"
                        style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#1F4E8C' }}
                      >
                        {q.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold leading-tight text-slate-900">{q.student}</div>
                        <div className="text-xs font-mono text-slate-500">{q.roll} · Criterion {q.critNum}</div>
                      </div>
                    </div>

                    {/* Criterion */}
                    <div className="text-xs font-semibold tracking-wider text-slate-400 mb-0.5">Criterion {q.critNum} of 5</div>
                    <div className="text-base font-semibold text-slate-900 mb-0.5">{q.criterion}</div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3.5">{q.desc}</p>

                    {/* Score strip */}
                    <div className="flex items-center gap-3.5 p-3 rounded-lg mb-3.5 border border-slate-200 bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div>
                        <span className="text-3xl font-semibold leading-none tabular-nums" style={{ color: '#1F4E8C' }}>{q.score}</span>
                        <span className="text-sm text-slate-400 ml-0.5"> / {q.maxScore}</span>
                      </div>
                      <div className="w-px h-7 bg-slate-200" />
                      <div className="flex flex-col gap-1">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit"
                          style={
                            q.conf === 'high'
                              ? { backgroundColor: '#ECFDF5', color: '#047857' }
                              : q.conf === 'med'
                                ? { backgroundColor: '#FFFBEB', color: '#B45309' }
                                : { backgroundColor: '#FEF2F2', color: '#B91C1C' }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                q.conf === 'high' ? '#10B981' :
                                q.conf === 'med' ? '#F59E0B' :
                                '#EF4444'
                            }}
                          />
                          {q.confLabel}
                        </span>
                        <span className="text-xs text-slate-500">{q.criterion}</span>
                      </div>
                    </div>

                    {/* Evidence (right pane summary, complementing the preview) */}
                    <div className="text-xs font-semibold tracking-wider text-slate-400 mb-1.5">Evidence extracted by AI</div>
                    <div
                      className="text-xs text-slate-600 leading-relaxed italic border-l-[3px] rounded-r-md px-3 py-2.5 mb-1 bg-slate-50"
                      style={{ borderLeftColor: '#1F4E8C' }}
                    >
                      {q.evidence}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mb-3.5">{q.evLoc}</div>

                    {/* Confirm question */}
                    <div className="text-sm font-semibold text-slate-900 mb-3">Does this score reflect the evidence?</div>

                    {/* Override toggle button */}
                    <button
                      onClick={toggleOverride}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border"
                      style={
                        overridePanelOpen
                          ? { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#64748B' }
                          : { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', color: '#B45309' }
                      }
                    >
                      {overridePanelOpen
                        ? <><X className="w-3 h-3" /> Cancel override</>
                        : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9l3-3m0 0l5-5M5 6l1.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Override this score
                          </>
                        )
                      }
                    </button>

                    {/* Override panel */}
                    {overridePanelOpen && (
                      <div className={cn("mt-3 rounded-lg p-3.5 border", statusStyles.warning.bg, statusStyles.warning.border)}>
                        <div className={cn("flex items-center gap-1.5 text-xs font-semibold mb-3", statusStyles.warning.text)}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v5M6.5 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" /></svg>
                          Override — change the score
                        </div>

                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-xs text-muted-foreground w-14 flex-shrink-0">AI score</span>
                          <span className="text-sm font-semibold font-mono text-muted-foreground/70">{q.score} / {q.maxScore}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-muted-foreground w-14 flex-shrink-0">Your score</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(v => (
                              <button
                                key={v}
                                onClick={() => setPickedScore(v)}
                                className={cn(
                                  "w-8 h-8 rounded-md text-xs font-medium transition-all border",
                                  pickedScore === v
                                    ? cn("bg-[color:var(--status-warning)] border-[color:var(--status-warning)] text-primary-foreground")
                                    : "bg-background border-border text-muted-foreground",
                                )}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={cn("text-xs font-semibold tracking-wider mb-1.5", statusStyles.warning.text)}>Reason for override</div>
                        <div className="flex flex-col gap-1 mb-3">
                          {OVERRIDE_REASONS.map(r => (
                            <button
                              key={r}
                              onClick={() => setPickedReason(r)}
                              className={cn(
                                "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-left transition-all border",
                                pickedReason === r
                                  ? cn(statusStyles.warning.bg, statusStyles.warning.border, statusStyles.warning.text, "font-medium")
                                  : "bg-background border-border text-muted-foreground",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 border-[1.5px]",
                                  pickedReason === r
                                    ? "border-[color:var(--status-warning)] bg-[color:var(--status-warning)]"
                                    : "border-border bg-transparent",
                                )}
                              >
                                {pickedReason === r && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                              </div>
                              {r}
                            </button>
                          ))}
                        </div>

                        <textarea
                          className="w-full text-xs px-2.5 py-2 rounded-md resize-none border border-border bg-background text-foreground focus:outline-none"
                          style={{ minHeight: 50 }}
                          placeholder="Optional: add a brief note to help the AI improve…"
                          rows={2}
                        />
                      </div>
                    )}
                    </div>
                  </>
                )
              })()}

              {/* COMPLETE */}
              {scStep === 5 && (() => {
                const overrideCount = scResults.filter(r => r.status === 'override').length
                const confirmedCount = scResults.filter(r => r.status === 'confirmed').length
                return (
                  <div>
                    <div className={cn("w-[50px] h-[50px] rounded-full flex items-center justify-center mb-4 border-[1.5px]", statusStyles.success.bg, statusStyles.success.border)}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={statusStyles.success.text}>
                        <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-lg font-semibold tracking-tight mb-1.5">
                      {overrideCount === 0
                        ? 'Spot check complete'
                        : `Spot check complete — ${overrideCount} override${overrideCount > 1 ? 's' : ''} logged`}
                    </div>
                    <p className="text-sm text-muted-foreground leading-[1.75] mb-4">
                      {overrideCount === 0
                        ? '5 of 5 scores confirmed. All evidence matches — the session is accurate and ready to close.'
                        : `${confirmedCount} confirmed, ${overrideCount} overridden. Your corrections have been saved and sent as learning signals.`}
                    </p>

                    <div className="flex flex-col gap-1.5 mb-4">
                      {scResults.map((r, i) => {
                        const q = SC_QUESTIONS[r.idx]
                        const isOverride = r.status === 'override'
                        const tone = isOverride ? statusStyles.warning : statusStyles.success
                        return (
                          <div
                            key={i}
                            className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm border", tone.bg, tone.border)}
                          >
                            <span className="text-sm flex-shrink-0">{isOverride ? '⚠' : '✓'}</span>
                            <span className="flex-1 font-medium">{q.student}</span>
                            <span className="text-xs font-mono text-muted-foreground/70">{q.criterion}</span>
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", tone.bg, tone.border, tone.text)}>
                              {isOverride ? `Override → ${(r as Extract<SCResult, { status: 'override' }>).newScore}/5` : 'Confirmed'}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between items-center px-3 py-3 rounded-lg text-sm border bg-muted/30">
                      <span className="text-muted-foreground">Overrides logged</span>
                      <span className="font-semibold font-mono">{overrideCount}</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* FOOTER */}
            <div className="px-5 py-3 border-t bg-muted/30 flex items-center justify-between gap-2.5 flex-shrink-0">
              <div>
                {scStep < 5 && (
                  <button
                    onClick={dismissSpotCheck}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                  >
                    {scStep === -1 ? 'Skip' : 'Save & exit'}
                  </button>
                )}
              </div>
              <div className="flex gap-1.5">
                {scStep > 0 && scStep < 5 && (
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border border-border text-muted-foreground transition-colors hover:bg-muted/50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
                <button
                  onClick={goNext}
                  disabled={isNextDisabled}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    scStep === 5 ? "bg-[color:var(--status-success)]" : "bg-primary",
                  )}
                >
                  {scStep === -1 && <><span>Start re-check</span><ChevronRight className="w-3.5 h-3.5" /></>}
                  {scStep >= 0 && scStep < 5 && overridePanelOpen && <><span>Save override & continue</span><ChevronRight className="w-3.5 h-3.5" /></>}
                  {scStep >= 0 && scStep < 5 && !overridePanelOpen && <><span>Score looks correct</span><Check className="w-3.5 h-3.5" /></>}
                  {scStep === 5 && <><span>Close session</span><ChevronRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
