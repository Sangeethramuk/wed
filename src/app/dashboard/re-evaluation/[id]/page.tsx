"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { STUDENTS, AI_REVALS, ageStatusKind, confidenceKind } from '@/lib/data/re-evaluation-data'
import { useReEvalStore } from '@/lib/store/re-evaluation-store'
import { BriefingModal } from '@/components/re-evaluation/briefing-modal'
import { statusStyles, confidenceStyles } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
      <div className="flex items-center justify-center min-h-[400px]">
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

  const handlePickScore = (s: number) => setPickedScore(s)
  const handlePickAcct = (key: string) => setAcctReason(key)

  const handleSubmit = () => {
    if (!isSubmitEnabled) return
    if (rpScrollRef.current) rpScrollRef.current.scrollTop = 0

    if (decision === 'uphold') {
      setWsState('compare')
      setComparing(false)
    } else {
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

  const handleBack = () => router.push('/dashboard/re-evaluation/triage')

  const instScore = pickedScore ?? st.origScore
  const aiScore = aiReval.score
  const agree = Math.abs(instScore - aiScore) <= 1

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-muted/40/50 rounded-xl border border-border/10 overflow-hidden shadow-sm">
      {/* Institutional Topbar */}
      <div className="h-16 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border flex-shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="group"
          >
            <ChevronLeftIcon className="size-3 group-hover:-translate-x-0.5 transition-transform" />
            Re-evaluation requests
          </Button>
          
          <div className="w-px h-6 bg-border/10" />
          
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              {st.name}
              <span className="eyebrow text-muted-foreground/40 px-2 py-0.5 bg-muted/50 rounded-md">
                {st.rollId}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="eyebrow flex items-center gap-2 text-muted-foreground/40 pr-4 border-r border-border/10">
            <span>{st.assign}</span>
            <span className="text-muted-foreground/20">·</span>
            <span className="text-primary/60">{st.crit}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBriefingOpen(true)}
          >
            <BriefcaseIcon className="size-3.5" />
            AI case briefing
          </Button>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Panel: Submission Viewer */}
        <div className="flex-1 flex flex-col bg-muted/40/80 overflow-hidden relative">
          <div className="h-14 px-6 flex items-center justify-between border-b border-border bg-background shadow-sm z-10 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="eyebrow text-muted-foreground/40">Submission Viewer</span>
              {/* Scanned / OCR Original view toggle — uses the DS Tabs primitive
                  per CONTRIBUTING.md (never <Button aria-current="page"> pretending
                  to be a tab). Keeps the existing `view` / `setView` state intact. */}
              <Tabs value={view} onValueChange={(v) => setView(v as 'scan' | 'ocr')}>
                <TabsList>
                  <TabsTrigger value="scan">Scanned</TabsTrigger>
                  <TabsTrigger value="ocr">OCR Original</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon-sm">
                   <ChevronLeftIcon className="size-3.5" />
                 </Button>
                 <Button variant="ghost" size="icon-sm">
                   <ChevronLeftIcon className="size-3.5 rotate-180" />
                 </Button>
               </div>
               <span className="eyebrow text-muted-foreground/40">Page 2 of 3</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'thin' }}>
            {view === 'scan' ? (
              <div className="max-w-2xl mx-auto rounded-xl bg-background border border-border shadow-xl shadow-slate-200/50 p-10 font-serif text-sm leading-[1.8] text-foreground relative ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/5">
                  <div className="eyebrow text-muted-foreground/40 font-sans">
                    {st.rollId} · {st.name} · {st.assign}
                  </div>
                  <div className="eyebrow text-muted-foreground/20 font-sans">
                    Submitted 1 April 2026
                  </div>
                </div>
                
                <div className="eyebrow text-muted-foreground/30 mb-6 font-sans">
                  Algorithm Design — Continued from page 1
                </div>

                <div className="space-y-1">
                  {[
                    [10, 'The primary sort uses merge sort with O(n log n) complexity.'],
                    [11, 'Before entering the main sort routine, the input array is'],
                    [12, 'validated. This covers three separate conditions that'],
                    [13, 'represent common real-world failure modes in production'],
                    [14, 'systems handling unsorted data streams.'],
                  ].map(([n, t]) => (
                    <div key={n as number} className="flex gap-6 group">
                      <span className="w-6 text-right text-xs font-mono text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors pt-1">{n}</span>
                      <p className="flex-1">{t}</p>
                    </div>
                  ))}

                  {/* Highlighted Student Evidence */}
                  <div className="relative my-4 -mx-10 px-10 py-6 bg-[color:var(--status-warning-bg)] border-l-4 border-[color:var(--status-warning)]">
                    <div className="eyebrow absolute -top-3 left-10 px-3 py-1 rounded-full bg-[color:var(--status-warning)] text-primary-foreground font-sans shadow-lg shadow-amber-500/20">
                      Student Cited · {st.evidence}
                    </div>
                    <div className="space-y-1">
                      {[
                        [15, <><strong>Case 1 — Empty array:</strong> If input length is zero,</>],
                        [16, 'the function returns −1 immediately before any sort.'],
                        [17, <><strong>Case 2 — Single element:</strong> Array of length 1</>],
                        [18, 'is already sorted; returned as-is.'],
                        [19, <><strong>Case 3 — Negative values:</strong> Absolute value</>],
                        [20, 'comparison used before sort to maintain ordering.'],
                      ].map(([n, t]) => (
                        <div key={n as number} className="flex gap-6">
                          <span className="w-6 text-right text-xs font-mono text-[color:var(--status-warning)]/30 pt-1">{n}</span>
                          <p className="flex-1">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {[
                    [21, 'All three guards execute in O(1) before the sort begins.'],
                    [22, 'This ensures no unnecessary computation on trivially'],
                    [23, 'solvable inputs. Follows defensive programming principles'],
                    [24, 'from Week 4 lecture notes.'],
                    [25, 'Full implementation is in the code block on page 3.'],
                  ].map(([n, t]) => (
                    <div key={n as number} className="flex gap-6 group">
                      <span className="w-6 text-right text-xs font-mono text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors pt-1">{n}</span>
                      <p className="flex-1">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto rounded-xl bg-foreground border border-border p-8 font-mono text-sm leading-relaxed text-muted-foreground/70">
                <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-[color:var(--status-warning)]/10 border border-[color:var(--status-warning)]/20 text-[color:var(--status-warning)] font-sans">
                  <InfoIcon className="size-4" />
                  <span className="text-xs font-bold">This is the extracted machine text. Red sections indicate lower confidence.</span>
                </div>
                <div className="space-y-1">
                  <div>15 &nbsp;<strong className="text-primary-foreground">Case 1 — Empty array: returns −1 before sort.</strong></div>
                  <div>17 &nbsp;<strong className="text-primary-foreground">Case 2 — Single element: returned as-is.</strong></div>
                  <div className="flex items-center gap-2">
                    <span>19 &nbsp;All</span>
                    <span className="bg-destructive/20 text-destructive px-1 rounded line-through decoration-red-400/50">three guards</span>
                    <span className="text-destructive opacity-80">[thr33 gu?rds]</span>
                    <span>in O(1).</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Decision Area */}
        <div className="w-[480px] flex-shrink-0 flex flex-col bg-muted/40 overflow-hidden border-l border-border relative z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.05)]">
          {/* Intelligence Header: KPI Strip */}
          <div className="flex border-b border-border bg-background shadow-sm flex-shrink-0 relative z-20">
            <KPIBlock label="Original Score" className="flex-[0.9] border-r border-border/60">
              <div className={cn("text-lg font-semibold tracking-tight", statusStyles[ageStatusKind(st.ageStatus)].text)}>{st.origScore}<span className="text-muted-foreground/30 font-bold ml-1">/ {st.maxScore}</span></div>
              <div className="eyebrow text-muted-foreground/40 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{st.critShort}</div>
            </KPIBlock>
            <KPIBlock label="Evidence Used" className="flex-[1.4] border-r border-border/60">
              <div className="text-xs font-bold text-muted-foreground leading-tight line-clamp-2">"{st.gradingEvidence}"</div>
              <div className="eyebrow text-muted-foreground/40 mt-1">At Grading</div>
            </KPIBlock>
            <KPIBlock label="Confidence" className="flex-[0.9]">
              <div className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-full", confidenceStyles[confidenceKind(st.confLabel)].dot)} />
                <span className="text-sm font-semibold tracking-tight text-foreground">{st.confScore}</span>
              </div>
              <div className="eyebrow text-muted-foreground/40 mt-1 whitespace-nowrap">{st.hasOverride ? 'Prior Override' : 'System Default'}</div>
            </KPIBlock>
          </div>

          <div ref={rpScrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>
            {wsState === 'active' && (
              <>
                {/* Section: Student Dispute */}
                <section className="space-y-3">
                  <div className="eyebrow text-muted-foreground/40">Intelligence Layer</div>
                  <div className="rounded-xl bg-background border border-border shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/50 bg-muted/40/50">
                      <div className="flex items-center justify-between">
                         <span className="eyebrow text-muted-foreground/50">Disputed Reasoning</span>
                         <span className="eyebrow px-2 py-0.5 rounded bg-primary/5 text-primary">
                           {st.evidence}
                         </span>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="relative rounded-xl p-4 bg-primary/[0.03] border border-primary/10">
                        <div className="eyebrow absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                          Student Perspective
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">
                          "{st.sv}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--status-success)] px-3 py-2 rounded-xl bg-[color:var(--status-success)]/5 border border-[color:var(--status-success)]/10">
                        <div className="size-1.5 rounded-full bg-[color:var(--status-success)]" />
                        {st.verdict}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section: Your Decision */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="eyebrow text-muted-foreground/40">Action Hub</div>
                    <span className="eyebrow text-muted-foreground/30">Decision Workspace</span>
                  </div>

                  <div className="rounded-xl bg-background border border-border shadow-sm p-2 space-y-2">
                    <DecisionOption
                      active={decision === 'uphold'}
                      variant="uphold"
                      label="Grade upheld after review"
                      desc="Original score correctly reflects work"
                      onClick={() => handlePickDecision('uphold')}
                    >
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        The original grade correctly reflects the work. Your written reason below will be sent to the student explaining why the grade stands.
                      </p>
                    </DecisionOption>

                    <DecisionOption
                      active={decision === 'adjust'}
                      variant="adjust"
                      label="Score adjusted"
                      desc="Requires HOD review & approval"
                      onClick={() => handlePickDecision('adjust')}
                    >
                      <div className="space-y-5 py-2">
                        {/* Score Picker UI */}
                        <div className="flex flex-col mb-1 mt-1">
                           <p className="text-xs font-medium text-muted-foreground px-2">
                             The original score is <strong className="text-foreground">{st.origScore}</strong>. Select your proposed score below:
                           </p>
                        </div>
                        <div className="flex flex-col items-center p-4 rounded-xl bg-muted/40 border border-border overflow-hidden relative shadow-inner mx-1">
                           <span className="eyebrow text-primary/60 mb-3">Proposed New Score</span>
                           
                           <div className="w-full flex justify-center gap-1.5">
                             {Array.from({ length: st.maxScore + 1 }, (_, i) => i).map((s) => {
                               const isOrig = s === st.origScore
                               const isPicked = s === pickedScore
                               return (
                                 <Button
                                   key={s}
                                   data-orig={isOrig}
                                   variant={isPicked ? "default" : "outline"}
                                   size="sm"
                                   onClick={isOrig ? undefined : () => handlePickScore(s)}
                                   disabled={isOrig}
                                   className="flex-col"
                                 >
                                   <span>{s}</span>
                                   {isOrig && <span className="eyebrow text-xs text-muted-foreground mt-0.5">Orig</span>}
                                 </Button>
                               )
                             })}
                           </div>
                        </div>

                        {/* Rationale Logic */}
                        {pickedScore !== null && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="eyebrow text-primary/60 flex items-center gap-2">
                              <ZapIcon className="size-3" />
                              Why is this score changing?
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {ACCT_REASONS.map((r) => {
                                const selected = acctReason === r.key
                                return (
                                  <Button
                                    key={r.key}
                                    variant={selected ? "default" : "outline"}
                                    onClick={() => handlePickAcct(r.key)}
                                    className="w-full justify-between"
                                  >
                                    <span className="text-xs font-bold">{r.label}</span>
                                    <div className={`size-3.5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary-foreground' : 'border-border/10'}`}>
                                      {selected && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                                    </div>
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </DecisionOption>
                  </div>
                </section>

                {/* Section: Rationale */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="eyebrow text-muted-foreground/40">Official Record</div>
                  </div>
                  <div className="rounded-xl bg-background border-2 border-primary/20 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="eyebrow flex items-center gap-2 text-foreground">
                        <EditIcon className="size-3.5" />
                        Decision Rationale
                        <span className="px-1.5 py-0.5 rounded bg-destructive text-primary-foreground text-xs font-semibold tracking-widest">REQUIRED</span>
                      </div>
                      <span className="text-xs font-semibold tracking-widest text-muted-foreground/30">{reasonLen} / 500</span>
                    </div>
                    <textarea
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      placeholder={`e.g. I reviewed Page 2 - Lines 15-20. Your edge case analysis is clearly demonstrated…`}
                      className="w-full h-32 bg-muted/40/50 border border-border/10 rounded-xl p-4 text-sm font-medium text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                    />
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${reasonLen >= REASON_MIN ? 'bg-[color:var(--status-success)]' : 'bg-primary'}`}
                          style={{ width: `${reasonPct}%` }}
                        />
                      </div>
                      <span className={`eyebrow whitespace-nowrap ${reasonLen >= REASON_MIN ? 'text-[color:var(--status-success)]' : 'text-muted-foreground/40'}`}>
                        {reasonLen < REASON_MIN ? `${REASON_MIN - reasonLen} more needed` : 'Ready to submit'}
                      </span>
                    </div>
                  </div>
                </section>
                <div className="h-20" />
              </>
            )}

            {wsState === 'compare' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-xl p-6 bg-background border border-border/10 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    {comparing ? (
                      <div className="size-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <div className="size-5 rounded-full bg-[color:var(--status-success)] flex items-center justify-center">
                        <CheckIcon className="size-3 text-primary-foreground" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold tracking-tight">
                      {comparing ? 'Synthesizing Parallel Review...' : 'AI Re-evaluation Completed'}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {comparing 
                      ? "System is independently assessing the cited evidence based on updated rubric context to provide a neutral comparison point for the HOD."
                      : agree 
                        ? "Both assessments are aligned. Your decision is backed by the system's re-evaluation logic."
                        : "The two assessments show a divergence. This case will be flagged for active HOD arbitration."}
                  </p>
                </div>

                {!comparing && decision === 'adjust' && (
                  <div className="grid grid-cols-2 gap-4">
                    <CompareCard label="Your Decision" score={instScore} reason={REASON_LABELS[acctReason ?? ''] ?? 'Rationale provided'} />
                    <CompareCard label="AI System" score={aiScore} reason={aiReval.reason} variant="primary" />
                  </div>
                )}

                {!comparing && (
                  <div className="rounded-xl border border-border/10 bg-background overflow-hidden shadow-sm">
                    <div className="px-5 py-4 bg-muted/40/50 border-b border-border/5">
                      <span className="eyebrow text-muted-foreground/40">Next Actions & Routing</span>
                    </div>
                    <div className="p-5 space-y-4">
                       {[
                         { n: 1, label: 'Submitted to', val: 'Dr. R. Kumar · Head of Department' },
                         { n: 2, label: 'Routing Logic', val: agree ? 'Auto-approval queue (High confidence)' : 'Manual Arbitration (Divergence detected)' },
                         { n: 3, label: 'Student Update', val: 'Notified only after HOD final signature' },
                       ].map(item => (
                         <div key={item.n} className="flex gap-4 group">
                           <div className="size-6 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">{item.n}</div>
                           <div className="flex-1 -mt-0.5">
                             <div className="eyebrow text-muted-foreground/30 mb-0.5">{item.label}</div>
                             <div className="text-xs font-bold text-muted-foreground">{item.val}</div>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                <div className="h-20" />
              </div>
            )}

            {wsState === 'submitted' && (
               <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="size-20 rounded-full bg-[color:var(--status-success)] flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                    <CheckIcon className="size-10 text-primary-foreground" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-semibold tracking-tight">Review Submitted</h2>
                    <p className="text-sm text-muted-foreground font-medium">Successfully routed to HOD dashboard for final approval.</p>
                  </div>
                  <div className="w-full max-w-sm p-6 rounded-xl bg-background border border-border/10 shadow-sm space-y-4">
                     <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-muted-foreground/40">Student</span>
                       <span className="text-foreground">{st.name}</span>
                     </div>
                     <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-muted-foreground/40">Decision</span>
                       <span className="text-[color:var(--status-success)]">{decision === 'uphold' ? 'Grade Upheld' : `Adjusted to ${pickedScore}/10`}</span>
                     </div>
                     <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-muted-foreground/40">Routing</span>
                       <span className="text-primary">Standard HOD Approval</span>
                     </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleBack}
                  >
                    Return to triage desk
                    <ArrowRightIcon className="size-4" />
                  </Button>
               </div>
            )}
          </div>

          {/* Sticky Actions Bar */}
          {wsState !== 'submitted' && (
            <div className="h-20 px-8 flex items-center justify-between bg-background/60 backdrop-blur-md border-t border-border/10 flex-shrink-0 relative z-10">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleBack}
               >
                 <XIcon className="size-3.5" />
                 Cancel review
               </Button>
               <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    Save as draft
                  </Button>
                  <Button
                    onClick={wsState === 'active' ? handleSubmit : handleConfirmCompare}
                    disabled={(wsState === 'active' && !isSubmitEnabled) || (wsState === 'compare' && comparing)}
                  >
                    {wsState === 'active' ? 'Finalize decision' : 'Confirm & route'}
                  </Button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Case Briefing Modal */}
      {briefingOpen && (
        <BriefingModal
          studentId={studentId}
          onClose={() => setBriefingOpen(false)}
          onStart={null}
        />
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// Visual Sub-components

function KPIBlock({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 p-4 bg-background ${className || ''}`}>
      <span className="eyebrow text-muted-foreground/30">{label}</span>
      {children}
    </div>
  )
}

function DecisionOption({ active, variant, label, desc, onClick, children }: { active: boolean; variant: 'uphold' | 'adjust'; label: string; desc: string; onClick: () => void; children: React.ReactNode }) {
  const isUphold = variant === 'uphold'
  return (
    <div 
      onClick={onClick}
      className={`rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
        active 
          ? isUphold ? 'border-[color:var(--status-success)] bg-[color:var(--status-success)]/5' : 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
          : 'border-border bg-background hover:border-border hover:shadow-sm'
      }`}
    >
      <div className={`px-5 py-4 flex items-center justify-between ${active ? isUphold ? 'bg-[color:var(--status-success)] text-primary-foreground' : 'bg-primary text-primary-foreground' : ''}`}>
         <div className="flex items-center gap-3">
            <div className={`size-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-white' : 'border-border'}`}>
               {active && <div className="size-2 rounded-full bg-background" />}
            </div>
            <div className="flex flex-col">
               <span className="eyebrow text-xs">{label}</span>
               <span className={`text-xs font-medium opacity-70 ${active ? '' : 'text-muted-foreground'}`}>{desc}</span>
            </div>
         </div>
         {active && <CheckIcon className="size-4" />}
      </div>
      {active && (
        <div className="p-5 bg-background animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}

function CompareCard({ label, score, reason, variant }: { label: string; score: number; reason: string; variant?: 'primary' }) {
  const isPrimary = variant === 'primary'
  return (
    <div className={`rounded-xl p-5 border ${isPrimary ? 'bg-primary/5 border-primary/20' : 'bg-muted/40 border-border/10'}`}>
       <span className={`eyebrow ${isPrimary ? 'text-primary' : 'text-muted-foreground/40'}`}>{label}</span>
       <div className={`text-2xl font-semibold tracking-tight my-1 ${isPrimary ? 'text-primary' : 'text-foreground'}`}>{score}<span className="text-muted-foreground/30 font-bold ml-1 text-base">/ 10</span></div>
       <p className="text-xs font-medium text-muted-foreground leading-snug line-clamp-2">{reason}</p>
    </div>
  )
}

// Icons
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="6"></line>
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  )
}
