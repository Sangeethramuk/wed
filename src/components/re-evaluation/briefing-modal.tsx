"use client"

import { useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STUDENTS, BRIEFINGS } from '@/lib/data/re-evaluation-data'

const FLAG_STYLES = {
  red:   { bg: 'rgba(239, 68, 68, 0.03)', border: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', dot: '#EF4444' },
  amber: { bg: 'rgba(245, 158, 11, 0.03)', border: 'rgba(245, 158, 11, 0.1)', text: '#B45309', dot: '#F59E0B' },
  blue:  { bg: 'rgba(59, 130, 246, 0.03)', border: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', dot: '#3B82F6' },
  green: { bg: 'rgba(16, 185, 129, 0.03)', border: 'rgba(16, 185, 129, 0.1)', text: '#059669', dot: '#10B981' },
}

type Props = {
  studentId: string | null
  onClose: () => void
  onStart: (() => void) | null
}

export function BriefingModal({ studentId, onClose, onStart }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [accOpen, setAccOpen] = useState<Record<string, boolean>>({
    timeline: false,
    evidence: false
  })

  useEffect(() => {
    setScrolled(false)
    setAccOpen({ timeline: false, evidence: false })
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [studentId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleScroll = () => {
    if (scrolled || !bodyRef.current) return
    const el = bodyRef.current
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) setScrolled(true)
  }

  const toggleAcc = (key: string) =>
    setAccOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  if (!studentId) return null
  const st = STUDENTS[studentId]
  const brf = BRIEFINGS[studentId]
  if (!st || !brf) return null

  const canStart = scrolled || onStart === null

  // Synthesize intelligence summaries based on data
  const isCredible = st.verdict.toLowerCase().includes('valid') || st.verdict.toLowerCase().includes('mismatch')
  const caseSummary = brf.aiSummaryParagraphs[0]
  const caseInsight = brf.aiSummaryParagraphs[1]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-hidden"
        style={{ background: 'rgba(15,17,27,.45)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          style={{ width: 720, maxWidth: '100%', maxHeight: '92vh', boxShadow: '0 32px 64px -12px rgba(0,0,0,0.3)' }}
          className="bg-card border border-border/10 rounded-3xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-4 flex-shrink-0 bg-background/20">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="size-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-primary">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/60">AI Case Briefing</span>
                </div>
                <h2 className="text-3xl font-black tracking-tighter secondary-text flex items-center gap-3">
                  {st.name}
                  {st.isNew && <span className="size-2 rounded-full bg-primary" />}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{st.rollId}</span>
                  <span className="text-muted-foreground/20 text-[9px]">·</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{st.assign}</span>
                  <span className="text-muted-foreground/20 text-[9px]">·</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">{st.crit}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="size-8 flex items-center justify-center rounded-xl bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div
            ref={bodyRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-8 py-4 space-y-8"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* 1. Executive Case Briefing */}
            <section>
              <div className="rounded-2xl p-6 bg-primary/[0.03] border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheckIcon className="size-20" />
                </div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="size-5 rounded-md flex items-center justify-center bg-primary/20">
                    <ZapIcon className="size-3 text-primary" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Intelligence Summary</span>
                </div>
                <div className="space-y-4 relative z-10">
                  <p className="text-[15px] font-bold leading-tight text-slate-800">
                    {isCredible ? "Credible dispute detected." : "Low-validity request."} {caseSummary}
                  </p>
                  <p className="text-[13px] leading-relaxed font-medium text-slate-600 italic">
                    "{caseInsight}"
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Reconstruction of Original Grading */}
            <section className="space-y-4">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Case Reconstruction</div>
               <div className="flex items-center justify-between gap-1.5 p-1.5 bg-muted/10 rounded-2xl border border-border/5">
                  {/* AI Evaluation */}
                  <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-white/50 border border-white min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1 whitespace-nowrap">AI Evaluation</span>
                    <div className="text-lg font-black tracking-tighter text-slate-400">
                      {Math.max(0, st.origScore - (st.hasOverride ? 1 : 0))}/10
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-muted-foreground/20 px-0.5">
                    <ArrowRightIcon className="size-3.5" />
                  </div>

                  {/* Manual Override */}
                  <div className={`flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border min-w-0 ${st.hasOverride ? 'bg-amber-50/50 border-amber-200/50' : 'bg-white/30 border-dashed opacity-50'}`}>
                    <span className={`text-[8px] font-black uppercase tracking-widest mb-1 whitespace-nowrap ${st.hasOverride ? 'text-amber-600' : 'text-muted-foreground/40'}`}>
                      {st.hasOverride ? 'Instructor Override' : 'No Override'}
                    </span>
                    <div className={`text-lg font-black tracking-tighter ${st.hasOverride ? 'text-amber-600' : 'text-slate-400'}`}>
                      {st.hasOverride ? `+1 pt` : '--'}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-muted-foreground/20 px-0.5">
                    <ArrowRightIcon className="size-3.5" />
                  </div>

                  {/* Final Score */}
                  <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-primary border border-primary shadow-lg shadow-primary/20 min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1 whitespace-nowrap">Released Score</span>
                    <div className="text-lg font-black tracking-tighter text-white">
                      {st.origScore}/10
                    </div>
                  </div>
               </div>
               {st.hasOverride && (
                 <div className="px-4 py-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 flex items-start gap-3">
                   <InfoIcon className="size-4 text-amber-500 mt-0.5" />
                   <p className="text-[11px] leading-relaxed text-amber-700 font-medium">
                     Instructor previously acknowledged additional evidence on {st.critShort} but stopped at {st.origScore}/10. The student argues the adjustment was insufficient.
                   </p>
                 </div>
               )}
            </section>

            {/* 3. The Dispute Context */}
            <div className="grid grid-cols-2 gap-6">
              <section className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Why student appealed</div>
                <div className="rounded-2xl p-5 bg-blue-500/[0.03] border border-blue-500/10 h-full">
                  <div className="text-[9px] font-black uppercase tracking-widest text-blue-600/60 mb-2.5">Student Reasoning</div>
                  <div className="text-[13px] font-medium leading-relaxed italic text-slate-700 mb-4">"{st.sv}"</div>
                  <div className="flex items-center gap-2 pt-3 border-t border-blue-500/10">
                    <div className="size-1.5 rounded-full" style={{ background: st.vcolor }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{st.verdict}</span>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Actionable focus</div>
                <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">What to check first</div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckIcon className="size-3.5 text-primary mt-0.5" />
                        <span className="text-[12px] font-bold text-white/90">Verify cited lines: {st.evidence}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckIcon className="size-3.5 text-primary mt-0.5" />
                        <span className="text-[12px] font-bold text-white/90">Reassess {st.critShort} rubric depth</span>
                      </li>
                      {st.isCluster && (
                        <li className="flex items-start gap-3">
                          <CheckIcon className="size-3.5 text-primary mt-0.5" />
                          <span className="text-[12px] font-bold text-white/90">Check for rubric ambiguity</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Target Decision</span>
                    <span className="text-[11px] font-black text-primary tracking-tighter">± {isCredible ? '1.5' : '0'} pts Est.</span>
                  </div>
                </div>
              </section>
            </div>

            {/* 4. Intelligence Signals */}
            <section className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Intelligence Signals</div>
              <div className="flex flex-col gap-2">
                {brf.flags.map((f, i) => {
                  const fc = FLAG_STYLES[f.type]
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors" style={{ background: fc.bg, borderColor: fc.border }}>
                      <div className="size-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: fc.dot }} />
                      <span className="text-[12px] font-bold leading-tight" style={{ color: fc.text }}>{f.text}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 5. Metrics & Patterns */}
            <section className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl p-4 bg-card/30 border border-border/10 flex flex-col justify-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">AI Confidence</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="size-2 rounded-full" style={{ background: st.confColor }} />
                    <span className="text-[13px] font-black tracking-tighter text-slate-800">{st.confScore}</span>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground/30 mt-0.5 uppercase tracking-widest">{st.confLabel} at grading</span>
                </div>
                
                <div className="rounded-2xl p-4 bg-card/30 border border-border/10 flex flex-col justify-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Student History</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[13px] font-black tracking-tighter text-slate-800">1st appeal</span>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground/30 mt-0.5 uppercase tracking-widest">This Semester</span>
                </div>

                <div className="rounded-2xl p-4 bg-card/30 border border-border/10 flex flex-col justify-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Batch Impact</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[13px] font-black tracking-tighter text-slate-800">{st.isCluster ? '4 cases' : 'Isolated'}</span>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground/30 mt-0.5 uppercase tracking-widest">Cluster size</span>
                </div>
            </section>

            {/* 6. Expandable Sections */}
            <section className="space-y-2">
              <Accordion
                id="timeline"
                open={!!accOpen['timeline']}
                onToggle={() => toggleAcc('timeline')}
                label="Full Case Timeline"
                icon={<ClockIcon className="size-4" />}
              >
                <div className="space-y-4 py-2">
                  {brf.auditTrail.map((entry, i) => (
                    <div key={i} className="flex gap-4 group/item">
                      <div className="flex flex-col items-center">
                        <div className="size-2 rounded-full ring-4 ring-muted/5 group-hover/item:ring-primary/10 transition-all" style={{ background: entry.color }} />
                        {i < brf.auditTrail.length - 1 && <div className="w-px flex-1 my-1 bg-border/20" />}
                      </div>
                      <div className="flex-1 -mt-1 pb-4 border-b border-border/5">
                        <div className="text-[12px] font-bold text-slate-700">{entry.event}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">{entry.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion>

              <Accordion
                id="evidence"
                open={!!accOpen['evidence']}
                onToggle={() => toggleAcc('evidence')}
                label="Evidence used in original grading"
                icon={<FileIcon className="size-4" />}
              >
                <div className="space-y-3 py-2">
                  {brf.gradingEvidenceLines.map((line, i) => (
                    <p key={i} className="text-[12px] leading-relaxed text-slate-600 border-l-2 border-primary/10 pl-4">{line}</p>
                  ))}
                </div>
              </Accordion>
            </section>

            <div className="h-24" />
          </div>

          {/* Footer */}
          <div className="px-8 py-5 flex items-center justify-between flex-shrink-0 bg-background/60 backdrop-blur-md border-t border-border/10">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="group flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/30 bg-card/50 hover:bg-card hover:border-border transition-all"
              >
                {onStart ? <ChevronLeftIcon className="size-3 group-hover:-translate-x-0.5 transition-transform" /> : <XIcon className="size-3 group-hover:scale-110 transition-transform" />}
                {onStart ? 'Back to list' : 'Close Briefing'}
              </button>
              {!scrolled && onStart && (
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/30 animate-pulse">
                  <ArrowDownIcon className="size-3" />
                  Scroll to briefing
                </div>
              )}
            </div>
            {onStart && (
              <button
                onClick={canStart ? onStart : undefined}
                disabled={!canStart}
                className={`group/btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  canStart 
                    ? 'bg-primary text-white shadow-[0_4px_12px_rgba(var(--primary),0.25)] hover:shadow-[0_6_20px_rgba(var(--primary),0.35)] translate-y-0 active:scale-[0.98]' 
                    : 'bg-muted/50 text-muted-foreground/50 border border-border/10 opacity-50 cursor-not-allowed'
                }`}
              >
                Start Re-Evaluation
                <ChevronLeftIcon className="size-3 rotate-180 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Accordion({
  id, open, onToggle, label, icon, children,
}: {
  id: string; open: boolean; onToggle: () => void; label: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-border/10 transition-all ${open ? 'bg-card/30' : 'bg-card/5 hover:bg-card/10'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`size-5 flex items-center justify-center ${open ? 'text-primary' : 'text-muted-foreground/30'}`}>
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{label}</span>
        </div>
        <ChevronDownIcon className={`size-4 transition-transform duration-300 text-muted-foreground/30 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="pt-4 border-t border-border/10">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// Minimal Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12l7 7-7 7" />
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

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="M9 12l2 2 4-4"></path>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )
}
