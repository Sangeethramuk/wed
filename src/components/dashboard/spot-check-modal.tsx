"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGradingStore } from "@/lib/store/grading-store"
import { X, ChevronRight, ChevronLeft, Check, AlertTriangle, CheckSquare, Info, FileText, CheckCircle2 } from "lucide-react"

const PURPLE = '#5B50D6'
const PURPLE_BG = '#EEEDFB'
const PURPLE_BORDER = '#C4C0F0'

const CONF_STYLES = {
  high: { color: '#2D7D52', bg: '#E8F5EE' },
  med:  { color: '#8A5A00', bg: '#FEF3DC' },
  low:  { color: '#B93030', bg: '#FBE9E9' },
}

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
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(26,25,23,.52)', backdropFilter: 'blur(5px)' }}
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
            className="bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ width: 560, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 60px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="px-5 pt-4 border-b border-border flex-shrink-0" style={{ paddingBottom: scStep >= 0 && scStep < 5 ? 0 : 16 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}` }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.5" stroke={PURPLE} strokeWidth="1.3" />
                      <path d="M8 5.5v3.5M8 10.5v.5" stroke={PURPLE} strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold tracking-tight">Mandatory Spot Check</div>
                    <div className="text-[12px] text-muted-foreground">
                      {scStep === -1 ? 'Accuracy verification · 5 questions' : scStep === 5 ? 'All done' : `Question ${scStep + 1} of 5`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={dismissSpotCheck}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {scStep >= 0 && scStep < 5 && (
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(answeredCount / 5) * 100}%`, background: PURPLE }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground/70 flex-shrink-0">{answeredCount} / 5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {SC_QUESTIONS.map((_, i) => {
                      const res = scResults.find(r => r.idx === i)
                      const isCurrent = i === scStep
                      const isDone = !!res
                      const isOverride = res?.status === 'override'
                      return (
                        <div key={i} className="flex items-center" style={{ flex: i < 4 ? '1 1 auto' : 'none' }}>
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 transition-all"
                            style={{
                              background: isOverride ? '#FEF3DC' : isDone ? PURPLE : isCurrent ? PURPLE_BG : '#F2F1EE',
                              border: `1.5px solid ${isOverride ? '#F0C97A' : isDone ? PURPLE : isCurrent ? PURPLE : '#D0CEC7'}`,
                              color: isOverride ? '#8A5A00' : isDone ? '#fff' : isCurrent ? PURPLE : '#9B9890',
                            }}
                          >
                            {isOverride ? '!' : isDone ? '✓' : i + 1}
                          </div>
                          {i < 4 && <div className="flex-1 h-px mx-1" style={{ background: '#E2E0DA' }} />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* BODY */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5">

              {/* INTRO */}
              {scStep === -1 && (
                <div className="space-y-5">
                  {/* Alert Box */}
                  <div className="p-4 rounded-lg bg-[#FFF9EB] border border-[#FBEAC3] flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#B47818] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[13px] font-semibold text-[#8A5A00] mb-1">Why this appeared</div>
                      <p className="text-[12px] text-[#8A5A00] leading-relaxed">
                        The system noticed that grading pace in this batch was significantly faster in the second half — a common sign of fatigue. This check runs automatically to protect accuracy before grades are locked.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-muted-foreground/60 tracking-wider mb-2">WHAT IS A MANDATORY SPOT CHECK?</div>
                    <p className="text-[14px] text-foreground leading-relaxed">
                      Think of it as your session's <span className="font-bold">final quality gate</span> — a 2-minute safety net that catches accidental "speed-grading" before any grade reaches a student.
                    </p>
                  </div>

                  {/* Feature Cards */}
                  <div className="space-y-2.5">
                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-muted/20">
                      <div className="w-10 h-10 rounded-lg bg-[#EEEDFB] border border-[#C4C0F0] flex items-center justify-center flex-shrink-0">
                        <CheckSquare className="w-5 h-5 text-[#5B50D6]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold mb-0.5">5 questions, ~2 minutes</div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          The system picks 5 items you already graded and shows them one at a time for a quick re-confirm.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-muted/20">
                      <div className="w-10 h-10 rounded-lg bg-[#E8F5EE] border border-[#86C9A4] flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-[#2D7D52]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold mb-0.5">Fix mistakes in real time</div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          Spot an error? Change the score right here — it's logged as a correction and helps the AI learn.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-muted/20">
                      <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] border border-[#90CAF9] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[#1976D2]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold mb-0.5">Creates an audit trail</div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          A Spot Check Record is saved as proof that a human expert — not just AI — verified the final grades.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clarification Footer Card */}
                  <div className="flex gap-3 p-4 rounded-xl border border-border bg-[#F5F5F5]">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      This isn't a sign of distrust — it's a standard professional check-in. Every session with engagement flags goes through this before grades are locked.
                    </p>
                  </div>
                </div>
              )}

              {/* QUESTION */}
              {scStep >= 0 && scStep < 5 && (() => {
                const q = SC_QUESTIONS[scStep]
                const conf = CONF_STYLES[q.conf]
                return (
                  <div>
                    {/* Student strip */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg mb-3.5 border" style={{ background: '#F2F1EE', borderColor: '#E2E0DA' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, color: PURPLE }}>
                        {q.initials}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold leading-tight">{q.student}</div>
                        <div className="text-[11px] font-mono text-muted-foreground/70">{q.roll} · Criterion {q.critNum}</div>
                      </div>
                    </div>

                    {/* Criterion */}
                    <div className="text-[11px] font-semibold tracking-wider text-muted-foreground/60 mb-0.5">Criterion {q.critNum} of 5</div>
                    <div className="text-[15px] font-semibold mb-0.5">{q.criterion}</div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mb-3.5">{q.desc}</p>

                    {/* Score strip */}
                    <div className="flex items-center gap-3.5 p-3 rounded-lg mb-3.5 border" style={{ background: '#F2F1EE', borderColor: '#E2E0DA' }}>
                      <div>
                        <span className="text-[28px] font-semibold leading-none font-mono" style={{ color: PURPLE }}>{q.score}</span>
                        <span className="text-[13px] text-muted-foreground/70 ml-0.5"> / {q.maxScore}</span>
                      </div>
                      <div className="w-px h-7 bg-border" />
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: conf.bg, color: conf.color }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: conf.color }} />
                          {q.confLabel}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60">{q.criterion}</span>
                      </div>
                    </div>

                    {/* Evidence */}
                    <div className="text-[11px] font-semibold tracking-wider text-muted-foreground/60 mb-1.5">Evidence extracted by AI</div>
                    <div className="text-[12px] text-muted-foreground leading-relaxed italic border-l-[3px] rounded-r-md px-3 py-2.5 mb-1" style={{ background: '#F2F1EE', borderColor: PURPLE }}>
                      {q.evidence}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground/60 mb-3.5">{q.evLoc}</div>

                    {/* Confirm question */}
                    <div className="text-[14px] font-medium text-foreground mb-3">Does this score reflect the evidence?</div>

                    {/* Override toggle button */}
                    <button
                      onClick={toggleOverride}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
                      style={{
                        background: overridePanelOpen ? '#F2F1EE' : '#FEF3DC',
                        border: `1px solid ${overridePanelOpen ? '#D0CEC7' : '#F0C97A'}`,
                        color: overridePanelOpen ? '#5C5A55' : '#8A5A00',
                      }}
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
                      <div className="mt-3 rounded-lg p-3.5" style={{ background: '#FFFAED', border: '1px solid #F0C97A' }}>
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold mb-3" style={{ color: '#8A5A00' }}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v5M6.5 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" /></svg>
                          Override — change the score
                        </div>

                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[12px] text-muted-foreground w-14 flex-shrink-0">AI score</span>
                          <span className="text-[13px] font-semibold font-mono text-muted-foreground/70">{q.score} / {q.maxScore}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[12px] text-muted-foreground w-14 flex-shrink-0">Your score</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(v => (
                              <button
                                key={v}
                                onClick={() => setPickedScore(v)}
                                className="w-8 h-8 rounded-md text-[12px] font-medium transition-all"
                                style={{
                                  background: pickedScore === v ? '#8A5A00' : '#fff',
                                  border: `1px solid ${pickedScore === v ? '#c07700' : '#D0CEC7'}`,
                                  color: pickedScore === v ? '#fff' : '#5C5A55',
                                }}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="text-[11px] font-semibold tracking-wider mb-1.5" style={{ color: '#8A5A00' }}>Reason for override</div>
                        <div className="flex flex-col gap-1 mb-3">
                          {OVERRIDE_REASONS.map(r => (
                            <button
                              key={r}
                              onClick={() => setPickedReason(r)}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] text-left transition-all"
                              style={{
                                background: pickedReason === r ? '#FEF3DC' : '#fff',
                                border: `1px solid ${pickedReason === r ? '#F0C97A' : '#E2E0DA'}`,
                                color: pickedReason === r ? '#8A5A00' : '#5C5A55',
                                fontWeight: pickedReason === r ? 500 : 400,
                              }}
                            >
                              <div
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  border: `1.5px solid ${pickedReason === r ? '#8A5A00' : '#D0CEC7'}`,
                                  background: pickedReason === r ? '#8A5A00' : 'transparent',
                                }}
                              >
                                {pickedReason === r && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              {r}
                            </button>
                          ))}
                        </div>

                        <textarea
                          className="w-full text-[12px] px-2.5 py-2 rounded-md resize-none border focus:outline-none"
                          style={{ background: '#fff', borderColor: '#D0CEC7', color: '#1A1917', minHeight: 50 }}
                          placeholder="Optional: add a brief note to help the AI improve…"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* COMPLETE */}
              {scStep === 5 && (() => {
                const overrideCount = scResults.filter(r => r.status === 'override').length
                const confirmedCount = scResults.filter(r => r.status === 'confirmed').length
                return (
                  <div>
                    <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center mb-4" style={{ background: '#E8F5EE', border: '1.5px solid #86C9A4' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L19 7" stroke="#2D7D52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-[18px] font-semibold tracking-tight mb-1.5">
                      {overrideCount === 0
                        ? 'Spot check complete'
                        : `Spot check complete — ${overrideCount} override${overrideCount > 1 ? 's' : ''} logged`}
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-[1.75] mb-4">
                      {overrideCount === 0
                        ? '5 of 5 scores confirmed. All evidence matches — the session is accurate and ready to close.'
                        : `${confirmedCount} confirmed, ${overrideCount} overridden. Your corrections have been saved and sent as learning signals.`}
                    </p>

                    <div className="flex flex-col gap-1.5 mb-4">
                      {scResults.map((r, i) => {
                        const q = SC_QUESTIONS[r.idx]
                        const isOverride = r.status === 'override'
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] border"
                            style={{
                              background: isOverride ? '#FEF3DC' : '#E8F5EE',
                              borderColor: isOverride ? '#F0C97A' : '#86C9A4',
                            }}
                          >
                            <span className="text-[14px] flex-shrink-0">{isOverride ? '⚠' : '✓'}</span>
                            <span className="flex-1 font-medium">{q.student}</span>
                            <span className="text-[11px] font-mono text-muted-foreground/70">{q.criterion}</span>
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: isOverride ? '#FEF3DC' : '#E8F5EE',
                                border: `1px solid ${isOverride ? '#F0C97A' : '#86C9A4'}`,
                                color: isOverride ? '#8A5A00' : '#2D7D52',
                              }}
                            >
                              {isOverride ? `Override → ${(r as Extract<SCResult, { status: 'override' }>).newScore}/5` : 'Confirmed'}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between items-center px-3 py-3 rounded-lg text-[13px] border bg-muted/30">
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
                    className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                  >
                    {scStep === -1 ? 'Skip spot check' : 'Save & exit'}
                  </button>
                )}
              </div>
              <div className="flex gap-1.5">
                {scStep > 0 && scStep < 5 && (
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium border transition-colors hover:bg-muted/50"
                    style={{ borderColor: '#D0CEC7', color: '#5C5A55' }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
                <button
                  onClick={goNext}
                  disabled={isNextDisabled}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: scStep === 5 ? '#2D7D52' : PURPLE }}
                >
                  {scStep === -1 && <><span>Begin spot check</span><ChevronRight className="w-3.5 h-3.5" /></>}
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
