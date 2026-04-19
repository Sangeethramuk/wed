"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { STUDENTS, AI_REVALS } from '@/lib/data/re-evaluation-data'
import { useReEvalStore } from '@/lib/store/re-evaluation-store'
import { BriefingModal } from '@/components/re-evaluation/briefing-modal'

type Decision = 'uphold' | 'adjust'
type WorkspaceState = 'active' | 'compare' | 'submitted'
type SubmittedVariant = 'agree' | 'disagree' | 'uphold'

const ACCT_REASONS = [
  { key: 'evidence', label: 'Evidence was not considered in the original grading' },
  { key: 'scan',     label: 'Scan or OCR missed content on this page' },
  { key: 'rubric',   label: 'Rubric was misapplied to this response' },
  { key: 'calc',     label: 'Calculation or totalling error' },
  { key: 'other',    label: 'Other — explained in written reason below' },
]

const REASON_LABELS: Record<string, string> = {
  evidence: 'Evidence not considered in grading',
  scan:     'Scan or OCR missed content',
  rubric:   'Rubric misapplied',
  calc:     'Calculation error',
  other:    'See written reason',
}

export default function ReEvalWorkspacePage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const { addHodPending, addResolved } = useReEvalStore()

  const st = STUDENTS[studentId]
  const aiReval = AI_REVALS[studentId]

  const [wsState, setWsState] = useState<WorkspaceState>('active')
  const [submittedVariant, setSubmittedVariant] = useState<SubmittedVariant | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [pickedScore, setPickedScore] = useState<number | null>(null)
  const [acctReason, setAcctReason] = useState<string | null>(null)
  const [reasonText, setReasonText] = useState('')
  const [view, setView] = useState<'scan' | 'ocr'>('scan')
  const [comparing, setComparing] = useState(true)
  const [briefingOpen, setBriefingOpen] = useState(false)

  const rpScrollRef = useRef<HTMLDivElement>(null)

  // Reset when student changes
  useEffect(() => {
    setWsState('active')
    setSubmittedVariant(null)
    setDecision(null)
    setPickedScore(null)
    setAcctReason(null)
    setReasonText('')
    setView('scan')
    setComparing(true)
    if (rpScrollRef.current) rpScrollRef.current.scrollTop = 0
  }, [studentId])

  if (!st || !aiReval) {
    return (
      <div className="-m-4 flex items-center justify-center" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <p className="text-muted-foreground">Student not found.</p>
      </div>
    )
  }

  const REASON_MIN = decision === 'adjust' ? 50 : 30
  const reasonLen = reasonText.trim().length
  const reasonPct = Math.min(100, (reasonLen / REASON_MIN) * 100)

  const isSubmitEnabled =
    decision !== null &&
    (decision === 'uphold' || (pickedScore !== null && acctReason !== null)) &&
    reasonLen >= REASON_MIN

  const handlePickDecision = (d: Decision) => {
    setDecision(d)
    if (d === 'uphold') { setPickedScore(null); setAcctReason(null) }
  }

  const handlePickScore = (s: number) => {
    setPickedScore(s)
  }

  const handlePickAcct = (key: string) => setAcctReason(key)

  const handleSubmit = () => {
    if (!isSubmitEnabled) return
    if (rpScrollRef.current) rpScrollRef.current.scrollTop = 0

    if (decision === 'uphold') {
      // Uphold: show lightweight confirm state
      setWsState('compare')
      setComparing(false)
    } else {
      // Adjust: run AI re-eval
      setWsState('compare')
      setComparing(true)
      setTimeout(() => setComparing(false), 2200)
    }
  }

  const handleConfirmCompare = () => {
    if (rpScrollRef.current) rpScrollRef.current.scrollTop = 0
    if (decision === 'uphold') {
      setSubmittedVariant('uphold')
      setWsState('submitted')
      addResolved(studentId)
    } else {
      const agree = Math.abs((pickedScore ?? 0) - aiReval.score) <= 1
      setSubmittedVariant(agree ? 'agree' : 'disagree')
      setWsState('submitted')
      addHodPending(studentId)
    }
  }

  const handleBack = () => router.push('/dashboard/re-evaluation')

  const instScore = pickedScore ?? st.origScore
  const aiScore = aiReval.score
  const agree = Math.abs(instScore - aiScore) <= 1

  return (
    <div
      className="-m-4 flex flex-col bg-background"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      {/* Topbar */}
      <div
        className="flex items-center px-5 gap-0 flex-shrink-0"
        style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', height: 52, boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-50 flex-shrink-0"
          style={{ border: '1.5px solid #CBD5E1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Re-evaluation Requests
        </button>
        <span className="mx-2 text-[#CBD5E1]">·</span>
        <span className="text-[14px] font-bold whitespace-nowrap" style={{ color: '#1E293B' }}>{st.name}</span>
        <span className="mx-2 text-[#CBD5E1]">·</span>
        <span className="text-[12px] whitespace-nowrap" style={{ color: '#94A3B8' }}>{st.rollId} · {st.assign}</span>
        <span
          className="ml-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
          style={{ background: '#EDE9FB', color: '#6B5FC4', border: '1px solid #C4BDF0' }}
        >
          {st.crit}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setBriefingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:border-purple-400 hover:text-purple-600"
            style={{ border: '1.5px solid #CBD5E1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Case Briefing
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel: submission viewer */}
        <div className="flex flex-col overflow-hidden" style={{ width: '58%', borderRight: '1px solid #E2E8F0' }}>
          {/* Left header */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 flex-shrink-0"
            style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: '#94A3B8' }}>Original Submission</span>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #CBD5E1', background: '#F1F5F9' }}>
              {(['scan', 'ocr'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-1.5 text-[11px] font-medium transition-all"
                  style={{
                    background: view === v ? '#fff' : 'transparent',
                    color: view === v ? '#6B5FC4' : '#94A3B8',
                    fontWeight: view === v ? 600 : 400,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.07)' : 'none',
                  }}
                >
                  {v === 'scan' ? 'Original scan' : 'Extracted text'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              {['‹', '›'].map((ch, i) => (
                <div key={i} className="w-6 h-6 rounded flex items-center justify-center cursor-pointer hover:bg-slate-100 text-[13px]" style={{ border: '1px solid #E2E8F0', background: '#fff', color: '#475569' }}>{ch}</div>
              ))}
              <span className="text-[12px]" style={{ color: '#94A3B8' }}>Page 2 of 3</span>
            </div>
          </div>

          {/* Paper content */}
          <div className="flex-1 overflow-y-auto p-5" style={{ background: '#F1F5F9' }}>
            {view === 'scan' ? (
              <div className="rounded-lg p-7" style={{ background: '#fff', border: '1px solid #E2E8F0', fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.9, color: '#2C2C2C', boxShadow: '0 4px 16px rgba(0,0,0,.09)' }}>
                <div className="font-bold mb-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#1E293B' }}>{st.rollId} · {st.name} · {st.assign}</div>
                <div className="mb-3.5 pb-2.5 text-[11px]" style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8', borderBottom: '1px solid #E2E8F0' }}>Submitted 1 April 2026 · Page 2 of 3 · Graded 3 April 2026</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>Algorithm Design — continued from page 1</div>
                {[
                  [10, 'The primary sort uses merge sort with O(n log n) complexity.'],
                  [11, 'Before entering the main sort routine, the input array is'],
                  [12, 'validated. This covers three separate conditions that'],
                  [13, 'represent common real-world failure modes in production'],
                  [14, 'systems handling unsorted data streams.'],
                ].map(([n, t]) => (
                  <div key={n} className="relative pl-7 mb-0.5">
                    <span className="absolute left-0 top-0.5 text-[10px] w-5 text-right" style={{ color: '#CBD5E1', fontFamily: 'monospace' }}>{n}</span>
                    {t}
                  </div>
                ))}
                {/* Highlighted section */}
                <div className="my-2 -mx-7 px-7 py-2 relative" style={{ background: '#FEF3C7', borderLeft: '3px solid #F59E0B' }}>
                  <div className="absolute -top-2 left-7 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.05em]" style={{ background: '#F59E0B', fontFamily: 'Inter, sans-serif' }}>
                    Student cited · {st.evidence}
                  </div>
                  {[
                    [15, <><strong>Case 1 — Empty array:</strong> If input length is zero,</>],
                    [16, 'the function returns −1 immediately before any sort.'],
                    [17, <><strong>Case 2 — Single element:</strong> Array of length 1</>],
                    [18, 'is already sorted; returned as-is.'],
                    [19, <><strong>Case 3 — Negative values:</strong> Absolute value</>],
                    [20, 'comparison used before sort to maintain ordering.'],
                  ].map(([n, t]) => (
                    <div key={n as number} className="relative pl-7 mb-0.5">
                      <span className="absolute left-0 top-0.5 text-[10px] w-5 text-right" style={{ color: '#CBD5E1', fontFamily: 'monospace' }}>{n}</span>
                      {t}
                    </div>
                  ))}
                </div>
                {[
                  [21, 'All three guards execute in O(1) before the sort begins.'],
                  [22, 'This ensures no unnecessary computation on trivially'],
                  [23, 'solvable inputs. Follows defensive programming principles'],
                  [24, 'from Week 4 lecture notes.'],
                  [25, 'Full implementation is in the code block on page 3.'],
                ].map(([n, t]) => (
                  <div key={n} className="relative pl-7 mb-0.5">
                    <span className="absolute left-0 top-0.5 text-[10px] w-5 text-right" style={{ color: '#CBD5E1', fontFamily: 'monospace' }}>{n}</span>
                    {t}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg p-5" style={{ background: '#fff', border: '1px solid #E2E8F0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.9, color: '#475569' }}>
                <div className="rounded-lg px-3 py-2 mb-3.5 text-[11px]" style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
                  ⚠ This is what the system read. Red sections were misread.
                </div>
                <div>15 &nbsp;<strong style={{ color: '#1E293B' }}>Case 1 — Empty array: returns −1 before sort.</strong></div>
                <div>17 &nbsp;<strong style={{ color: '#1E293B' }}>Case 2 — Single element: returned as-is.</strong></div>
                <div>19 &nbsp;All <span style={{ background: '#FEF2F2', color: '#EF4444', padding: '0 3px', textDecoration: 'line-through' }}>three guards</span><span style={{ color: '#EF4444' }}> [thr33 gu?rds]</span> in O(1).</div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel: decision area */}
        <div className="flex flex-col overflow-hidden" style={{ width: '42%', background: '#F8FAFC' }}>
          {/* Context strip */}
          <div
            className="flex items-stretch flex-shrink-0"
            style={{ background: '#fff', borderBottom: '1.5px solid #CBD5E1', padding: '11px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}
          >
            <ContextBlock label="Original score">
              <div className="text-[18px] font-extrabold tracking-tight" style={{ color: '#6B5FC4' }}>{st.origScore} / {st.maxScore}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{st.crit}</div>
            </ContextBlock>
            <ContextBlock label="Evidence used at grading">
              <div className="text-[11px] leading-snug font-medium" style={{ color: '#1E293B' }}>{st.gradingEvidence}</div>
            </ContextBlock>
            <ContextBlock label="Confidence · Prior action" noBorder>
              <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: '#1E293B' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.confColor }} />
                {st.confLabel} · {st.confScore}
              </div>
              <div className="text-[10px] mt-0.5 leading-snug" style={{ color: '#94A3B8' }}>
                {st.hasOverride ? 'You overrode the original evaluation on this submission' : 'No prior override on this submission'}
              </div>
            </ContextBlock>
          </div>

          {/* Scrollable right content */}
          <div ref={rpScrollRef} className="flex-1 overflow-y-auto px-3.5 pb-4" style={{ scrollbarWidth: 'thin' }}>

            {/* STATE: active */}
            {wsState === 'active' && (
              <div>
                {/* Student request zone */}
                <Zone label="What the student is asking" className="mt-3.5">
                  <div className="grid grid-cols-2 rounded-lg overflow-hidden mb-2.5" style={{ border: '1px solid #E2E8F0', background: '#fff' }}>
                    <DataCell label="Criterion">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EDE9FB', color: '#6B5FC4', border: '1px solid #C4BDF0' }}>
                        {st.critShort} · {st.origScore} / {st.maxScore}
                      </span>
                    </DataCell>
                    <DataCell label="Evidence location" noBorder>
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontFamily: 'monospace' }}>
                        📄 {st.evidence}
                      </span>
                    </DataCell>
                  </div>
                  <div className="relative rounded-lg p-3 mb-2.5 text-[12px] leading-relaxed" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#475569' }}>
                    <span className="absolute -top-2 left-3 text-[9px] font-bold uppercase tracking-[0.06em] text-white px-1.5 py-0.5 rounded-full" style={{ background: '#3B82F6' }}>Student says</span>
                    {st.sv}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full w-fit" style={{ background: '#fff', border: '1px solid #E2E8F0', color: '#475569' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.vcolor }} />
                    {st.verdict}
                  </div>
                </Zone>

                {/* Decision zone */}
                <div className="rounded-xl mb-2.5 overflow-hidden" style={{ background: '#fff', border: '1.5px solid #CBD5E1', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
                  <div className="px-3.5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-0.5 h-3 rounded" style={{ background: '#6B5FC4' }} />
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: '#94A3B8' }}>Your decision</span>
                    </div>
                    <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                      {decision === 'uphold' ? `Your written reason explains the grade to ${st.first} directly` : decision === 'adjust' ? 'Select a score and confirm why it is changing' : 'Choose one option below'}
                    </span>
                  </div>
                  <div className="p-2 space-y-1.5">
                    {/* Option A: Uphold */}
                    <DecisionOption
                      active={decision === 'uphold'}
                      variant="uphold"
                      label="Grade upheld after review"
                      desc="Original score stands"
                      onClick={() => handlePickDecision('uphold')}
                    >
                      <p className="text-[12px] leading-relaxed" style={{ color: '#065F46' }}>
                        The original grade correctly reflects the work. Your written reason below will be sent to the student explaining why the grade stands.
                      </p>
                    </DecisionOption>

                    {/* Option B: Adjust */}
                    <DecisionOption
                      active={decision === 'adjust'}
                      variant="adjust"
                      label="Score adjusted"
                      desc="Requires HOD approval"
                      onClick={() => handlePickDecision('adjust')}
                    >
                      {/* Score change row */}
                      <div className="flex items-center gap-2.5 mb-3 p-2.5 rounded-lg" style={{ background: 'rgba(107,95,196,.08)' }}>
                        <div className="flex flex-col items-center">
                          <div className="text-[9px] font-semibold uppercase tracking-[0.06em] mb-0.5" style={{ color: '#94A3B8' }}>Current score</div>
                          <div className="text-[26px] font-extrabold leading-tight" style={{ color: '#475569' }}>{st.origScore}</div>
                          <div className="text-[11px]" style={{ color: '#94A3B8' }}>/ {st.maxScore}</div>
                        </div>
                        <div className="text-[18px]" style={{ color: '#CBD5E1' }}>→</div>
                        <div className="flex flex-col items-center">
                          <div className="text-[9px] font-semibold uppercase tracking-[0.06em] mb-0.5" style={{ color: '#6B5FC4' }}>Proposed score</div>
                          {pickedScore ? (
                            <>
                              <div className="text-[26px] font-extrabold leading-tight" style={{ color: '#6B5FC4' }}>{pickedScore}</div>
                              <div className="text-[11px]" style={{ color: '#C4BDF0' }}>/ {st.maxScore}</div>
                            </>
                          ) : (
                            <div className="text-[13px] italic" style={{ color: '#CBD5E1' }}>Select below</div>
                          )}
                        </div>
                      </div>

                      {/* Score buttons */}
                      <div className="mb-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1.5" style={{ color: '#94A3B8' }}>Select a new score</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {Array.from({ length: st.maxScore }, (_, i) => i + 1).map((s) => {
                            const isOrig = s === st.origScore
                            const isPicked = s === pickedScore
                            return (
                              <button
                                key={s}
                                onClick={isOrig ? undefined : () => handlePickScore(s)}
                                disabled={isOrig}
                                className="w-8 h-8 rounded-lg text-[13px] font-semibold flex items-center justify-center transition-all"
                                style={{
                                  border: isPicked ? 'none' : isOrig ? '1.5px dashed #CBD5E1' : '1.5px solid #CBD5E1',
                                  background: isPicked ? '#6B5FC4' : isOrig ? '#F1F5F9' : '#fff',
                                  color: isPicked ? '#fff' : isOrig ? '#94A3B8' : '#475569',
                                  cursor: isOrig ? 'not-allowed' : 'pointer',
                                  boxShadow: isPicked ? '0 2px 8px rgba(107,95,196,.4)' : 'none',
                                  fontFamily: 'inherit',
                                }}
                              >
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Accountability reasons */}
                      {pickedScore !== null && (
                        <div style={{ borderTop: '1px solid #C4BDF0', paddingTop: 12 }}>
                          <div className="text-[11px] font-bold mb-2" style={{ color: '#6B5FC4' }}>
                            ✦ Why is this score changing? <span className="font-normal opacity-80 text-[10px]">(required)</span>
                          </div>
                          <div className="space-y-1.5">
                            {ACCT_REASONS.map((r) => {
                              const picked = acctReason === r.key
                              return (
                                <div
                                  key={r.key}
                                  onClick={() => handlePickAcct(r.key)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-[12px]"
                                  style={{
                                    border: picked ? '1.5px solid #6B5FC4' : '1.5px solid #E2E8F0',
                                    background: picked ? '#6B5FC4' : '#fff',
                                    color: picked ? '#fff' : '#475569',
                                  }}
                                >
                                  <div
                                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ border: `2px solid ${picked ? 'rgba(255,255,255,.7)' : '#CBD5E1'}`, background: picked ? 'rgba(255,255,255,.3)' : '#fff' }}
                                  >
                                    {picked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  {r.label}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </DecisionOption>
                  </div>
                </div>

                {/* Reason zone */}
                <div className="rounded-xl p-3.5 mb-2.5" style={{ background: '#fff', border: '2px solid #C4BDF0', boxShadow: '0 0 0 4px #EDE9FB' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: '#1E293B' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 12.5V14h1.5l8.87-8.87-1.5-1.5L2 12.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M12.87 2.13a1 1 0 010 1.41l-1 1-1.41-1.41 1-1a1 1 0 011.41 0z" stroke="currentColor" strokeWidth="1.4" /></svg>
                      Your written reason
                      <span className="text-white text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#EF4444', letterSpacing: '.05em' }}>REQUIRED</span>
                    </div>
                    <span className="text-[11px]" style={{ color: '#94A3B8' }}>{reasonText.length} / 500</span>
                  </div>
                  <div className="text-[11px] mb-2 leading-snug" style={{ color: '#94A3B8' }}>
                    {decision === 'adjust'
                      ? 'This reason will be reviewed by HOD before the student is notified. Write it as a formal explanation.'
                      : `This will be shared with ${st.first} and kept on record.`}
                  </div>
                  <textarea
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder={`e.g. I reviewed ${st.evidence}. Your edge case analysis is clearly demonstrated…`}
                    className="w-full rounded-lg px-3 py-2.5 text-[12px] leading-relaxed resize-y outline-none transition-all"
                    style={{
                      border: '1.5px solid #CBD5E1',
                      fontFamily: 'Inter, sans-serif',
                      color: '#1E293B',
                      background: '#fff',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#6B5FC4'; e.target.style.boxShadow = '0 0 0 3px rgba(107,95,196,.12)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none' }}
                  />
                  <div className="h-1 rounded-full my-2 overflow-hidden" style={{ background: '#E2E8F0' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${reasonPct}%`,
                        background: reasonLen === 0 ? '#CBD5E1' : reasonLen < REASON_MIN ? '#F59E0B' : '#10B981',
                      }}
                    />
                  </div>
                  <div className="text-[11px]" style={{ color: reasonLen < REASON_MIN ? '#94A3B8' : '#065F46' }}>
                    {reasonLen === 0
                      ? 'Select a decision above to begin.'
                      : reasonLen < REASON_MIN
                      ? `${REASON_MIN - reasonLen} more character${REASON_MIN - reasonLen === 1 ? '' : 's'} needed.`
                      : 'Reason complete — ready to submit.'}
                  </div>
                </div>

                <div style={{ height: 80 }} />
              </div>
            )}

            {/* STATE: compare */}
            {wsState === 'compare' && (
              <div className="mt-3.5">
                <div className="rounded-xl p-3.5 mb-2.5" style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {comparing && (
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ border: '2px solid #E2E8F0', borderTopColor: '#6B5FC4', animation: 'spin .7s linear infinite' }} />
                    )}
                    <div className="text-[14px] font-bold" style={{ color: '#1E293B' }}>
                      {decision === 'uphold'
                        ? 'Grade upheld — confirming routing'
                        : comparing
                        ? 'Running independent AI re-evaluation…'
                        : agree ? 'Assessment complete — both agree' : 'Assessment complete — assessments diverge'}
                    </div>
                  </div>
                  <div className="text-[12px]" style={{ color: '#94A3B8' }}>
                    {decision === 'uphold'
                      ? `No score change. Your written reason will be sent to ${st.first} directly. HOD will receive a copy for records.`
                      : comparing
                      ? 'Reviewing the cited evidence independently before routing to HOD.'
                      : agree
                      ? 'Both reach the same conclusion. HOD will receive this for acknowledgement.'
                      : `The two assessments differ by ${Math.abs(instScore - aiScore)} point${Math.abs(instScore - aiScore) === 1 ? '' : 's'}. HOD will review both.`}
                  </div>
                </div>

                {!comparing && decision === 'adjust' && (
                  <>
                    {/* Comparison cards */}
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                      {[
                        { label: 'Your decision', score: instScore, reason: REASON_LABELS[acctReason ?? ''] ?? acctReason ?? '', agree },
                        { label: 'AI re-evaluation', score: aiScore, reason: aiReval.reason, agree },
                      ].map((c, i) => (
                        <div
                          key={i}
                          className="rounded-xl p-3"
                          style={{
                            background: agree ? '#ECFDF5' : '#FEF2F2',
                            border: `1.5px solid ${agree ? '#A7F3D0' : '#FECACA'}`,
                          }}
                        >
                          <div className="text-[10px] font-bold uppercase tracking-[0.07em] mb-1.5" style={{ color: agree ? '#065F46' : '#B91C1C' }}>{c.label}</div>
                          <div className="text-[22px] font-extrabold tracking-tight mb-1" style={{ color: agree ? '#065F46' : '#B91C1C' }}>{c.score} / {st.maxScore}</div>
                          <div className="text-[11px] leading-snug" style={{ color: agree ? '#065F46' : '#B91C1C', opacity: 0.85 }}>{c.reason}</div>
                        </div>
                      ))}
                    </div>

                    {/* Verdict banner */}
                    <div
                      className="rounded-xl p-3 flex items-start gap-2.5 mb-2.5"
                      style={{ background: agree ? '#ECFDF5' : '#FEF2F2', border: `1.5px solid ${agree ? '#A7F3D0' : '#FECACA'}` }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: agree ? '#10B981' : '#EF4444' }}>
                        {agree
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 16v.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
                        }
                      </div>
                      <div>
                        <div className="text-[13px] font-bold mb-0.5" style={{ color: agree ? '#065F46' : '#B91C1C' }}>
                          {agree ? `Both agree — ${instScore}/${st.maxScore}` : `Assessments diverge — ${instScore} vs ${aiScore}/${st.maxScore}`}
                        </div>
                        <div className="text-[12px] leading-snug" style={{ color: agree ? '#065F46' : '#B91C1C', opacity: 0.85 }}>
                          {agree ? 'HOD will receive this for standard acknowledgement.' : `A ${Math.abs(instScore - aiScore)}-point difference. HOD must actively review both before deciding.`}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* HOD routing */}
                {!comparing && (
                  <div className="rounded-xl p-3 mb-2.5" style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
                    <div className="flex items-center gap-1.5 mb-2 text-[12px] font-bold" style={{ color: '#1E293B' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                      What happens next
                    </div>
                    {[
                      { n: 1, label: 'Submitted to', val: 'Dr. R. Kumar · Head of Department · CS301' },
                      {
                        n: 2, label: 'HOD receives',
                        val: decision === 'uphold'
                          ? 'A copy of your decision and written reason, for records only. No action required from HOD.'
                          : agree ? 'Both agreeing scores, your reason, and full audit trail.' : 'Both diverging scores, your reason, and full audit trail. HOD must actively review.',
                      },
                      {
                        n: 3, label: 'Student',
                        val: decision === 'uphold'
                          ? `${st.first} will be notified directly now with your written reason.`
                          : agree ? 'Not notified until HOD approves.' : 'Not notified until HOD makes a final decision.',
                      },
                      { n: 4, label: 'You', val: 'Can move to the next case now.' },
                    ].map((row) => (
                      <div key={row.n} className="flex items-start gap-2 py-1.5 text-[12px]" style={{ borderBottom: row.n < 4 ? '1px solid #E2E8F0' : 'none', color: '#475569' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: '#EDE9FB', color: '#6B5FC4' }}>{row.n}</div>
                        <div><span className="font-semibold" style={{ color: '#1E293B', minWidth: 80, display: 'inline-block' }}>{row.label}</span> {row.val}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ height: 80 }} />
              </div>
            )}

            {/* STATE: submitted */}
            {wsState === 'submitted' && (
              <div className="mt-3.5">
                {submittedVariant === 'agree' && (
                  <SubmittedCard isCheckIcon title="Submitted to HOD for approval" color="#065F46" bg="#ECFDF5" border="#A7F3D0" iconBg="#10B981">
                    <p className="text-[12px] leading-relaxed mb-2" style={{ color: '#065F46', opacity: 0.85 }}>Both assessments agree. <strong>{st.first}</strong> will be notified once HOD approves.</p>
                    <TLRow dot="#10B981">Your decision: <strong>{st.origScore} → {pickedScore}/{st.maxScore}</strong></TLRow>
                    <TLRow dot="#10B981">AI re-evaluation: <strong>{aiScore}/{st.maxScore}</strong> · agrees</TLRow>
                    <TLRow dot="#10B981">Submitted to Dr. R. Kumar · HOD</TLRow>
                    <TLRow dot="#CBD5E1" light>Awaiting HOD approval</TLRow>
                    <button onClick={handleBack} className="w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors mt-2" style={{ background: '#10B981', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Review next case →
                    </button>
                  </SubmittedCard>
                )}
                {submittedVariant === 'disagree' && (
                  <SubmittedCard isCheckIcon={false} title="Submitted — assessments diverge" color="#92400E" bg="#FFFBEB" border="#FDE68A" iconBg="#F59E0B">
                    <p className="text-[12px] leading-relaxed mb-2" style={{ color: '#92400E', opacity: 0.9 }}>HOD will review both. <strong>{st.first}</strong> not notified until HOD decides.</p>
                    <TLRow dot="#F59E0B">Your score: <strong>{pickedScore}/{st.maxScore}</strong></TLRow>
                    <TLRow dot="#F59E0B">AI re-evaluation: <strong>{aiScore}/{st.maxScore}</strong> · diverges</TLRow>
                    <TLRow dot="#F59E0B">HOD must review both and decide</TLRow>
                    <button onClick={handleBack} className="w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors mt-2" style={{ background: '#F59E0B', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Review next case →
                    </button>
                  </SubmittedCard>
                )}
                {submittedVariant === 'uphold' && (
                  <SubmittedCard isCheckIcon title="Decision confirmed — grade upheld" color="#065F46" bg="#ECFDF5" border="#A7F3D0" iconBg="#10B981">
                    <p className="text-[12px] leading-relaxed mb-2" style={{ color: '#065F46', opacity: 0.85 }}><strong>{st.first}</strong> is being notified now. HOD has received a copy for records.</p>
                    <TLRow dot="#10B981">Grade upheld · original score stands</TLRow>
                    <TLRow dot="#10B981">HOD notified for records — no action required</TLRow>
                    <TLRow dot="#10B981">Student notification: sending now</TLRow>
                    <button onClick={handleBack} className="w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors mt-2" style={{ background: '#10B981', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Review next case →
                    </button>
                  </SubmittedCard>
                )}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          {wsState !== 'submitted' && (
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 flex-shrink-0"
              style={{ background: '#fff', borderTop: '1.5px solid #CBD5E1', boxShadow: '0 -2px 8px rgba(0,0,0,.05)' }}
            >
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-slate-50"
                style={{ border: '1.5px solid #CBD5E1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Save as draft
              </button>
              <div className="flex flex-col items-end gap-1">
                {wsState === 'active' ? (
                  <>
                    <button
                      onClick={handleSubmit}
                      disabled={!isSubmitEnabled}
                      className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all"
                      style={{
                        border: 'none',
                        background: isSubmitEnabled ? '#6B5FC4' : '#E2E8F0',
                        color: isSubmitEnabled ? '#fff' : '#94A3B8',
                        cursor: isSubmitEnabled ? 'pointer' : 'not-allowed',
                        boxShadow: isSubmitEnabled ? '0 2px 8px rgba(107,95,196,.35)' : 'none',
                        fontFamily: 'inherit',
                      }}
                    >
                      Submit decision →
                    </button>
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                      {!decision ? 'Select a decision above to continue' : decision === 'adjust' && !pickedScore ? 'Select a proposed new score' : decision === 'adjust' && !acctReason ? 'Select why the score is changing' : reasonLen < REASON_MIN ? `${REASON_MIN - reasonLen} more character${REASON_MIN - reasonLen === 1 ? '' : 's'} needed` : decision === 'adjust' ? 'HOD will review before student is notified' : 'Student will be notified directly'}
                    </span>
                  </>
                ) : (
                  <>
                    <button
                      onClick={comparing ? undefined : handleConfirmCompare}
                      disabled={comparing}
                      className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all"
                      style={{
                        border: 'none',
                        background: comparing ? '#E2E8F0' : '#6B5FC4',
                        color: comparing ? '#94A3B8' : '#fff',
                        cursor: comparing ? 'not-allowed' : 'pointer',
                        boxShadow: comparing ? 'none' : '0 2px 8px rgba(107,95,196,.35)',
                        fontFamily: 'inherit',
                      }}
                    >
                      Confirm submission →
                    </button>
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                      {comparing ? 'Waiting for AI re-evaluation…' : agree || decision === 'uphold' ? 'HOD can approve with one action' : 'HOD must review both assessments'}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Briefing modal (workspace mode — no start button) */}
      {briefingOpen && (
        <BriefingModal
          studentId={studentId}
          onClose={() => setBriefingOpen(false)}
          onStart={null}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// Sub-components

function ContextBlock({ label, children, noBorder }: { label: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 flex-1 px-3" style={{ borderRight: noBorder ? 'none' : '1px solid #E2E8F0' }}>
      <div className="text-[9px] font-bold uppercase tracking-[0.07em]" style={{ color: '#94A3B8' }}>{label}</div>
      {children}
    </div>
  )
}

function Zone({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-3.5 mb-2.5 ${className}`} style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="w-0.5 h-3 rounded" style={{ background: '#6B5FC4' }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: '#94A3B8' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function DataCell({ label, children, noBorder }: { label: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className="p-2" style={{ borderRight: noBorder ? 'none' : '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1" style={{ color: '#94A3B8' }}>{label}</div>
      <div className="flex items-center gap-1 flex-wrap">{children}</div>
    </div>
  )
}

function DecisionOption({
  active, variant, label, desc, onClick, children,
}: {
  active: boolean; variant: 'uphold' | 'adjust'; label: string; desc: string; onClick: () => void; children: React.ReactNode
}) {
  const COLORS = {
    uphold: { bg: '#10B981', activeBg: '#ECFDF5', activeBorder: '#10B981', activeHead: '#10B981' },
    adjust: { bg: '#6B5FC4', activeBg: '#EDE9FB', activeBorder: '#6B5FC4', activeHead: '#6B5FC4' },
  }
  const c = COLORS[variant]
  return (
    <div
      onClick={onClick}
      className="rounded-lg overflow-hidden cursor-pointer transition-all"
      style={{ border: `2px solid ${active ? c.activeBorder : '#E2E8F0'}`, background: active ? c.activeBg : '#F8FAFC' }}
    >
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 transition-colors"
        style={{ background: active ? c.activeHead : '#F1F5F9' }}
      >
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{ border: `2px solid ${active ? 'rgba(255,255,255,.7)' : '#CBD5E1'}`, background: active ? 'rgba(255,255,255,.3)' : '#fff' }}
        >
          {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <div className="text-[13px] font-semibold flex-1" style={{ color: active ? '#fff' : '#1E293B' }}>{label}</div>
        <div className="text-[11px]" style={{ color: active ? 'rgba(255,255,255,.8)' : '#94A3B8' }}>{desc}</div>
      </div>
      {active && (
        <div className="px-3.5 py-3" style={{ background: '#fff' }}>{children}</div>
      )}
    </div>
  )
}

function SubmittedCard({
  isCheckIcon, title, color, bg, border, iconBg, children,
}: {
  isCheckIcon: boolean; title: string; color: string; bg: string; border: string; iconBg: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl p-5 text-center" style={{ background: bg, border: `1.5px solid ${border}` }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3.5" style={{ background: iconBg }}>
        {isCheckIcon
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 16v.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
        }
      </div>
      <div className="text-[16px] font-bold mb-3" style={{ color }}>{title}</div>
      <div className="rounded-lg px-3 py-2 mb-3 text-left" style={{ background: 'rgba(255,255,255,.65)' }}>
        {children}
      </div>
    </div>
  )
}

function TLRow({ dot, children, light }: { dot: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-[12px]" style={{ borderBottom: '1px solid rgba(0,0,0,.06)' }}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: dot }} />
      <div style={{ color: light ? '#94A3B8' : 'inherit' }}>{children}</div>
    </div>
  )
}
