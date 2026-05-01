"use client"

import { useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STUDENTS, BRIEFINGS, verdictKind, confidenceKind, auditEventKind } from '@/lib/data/re-evaluation-data'
import { statusStyles, confidenceStyles, type StatusKey } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

const FLAG_KINDS: Record<'red' | 'amber' | 'blue' | 'green', StatusKey> = {
  red: 'error',
  amber: 'warning',
  blue: 'info',
  green: 'success',
}

type Props = {
  studentId: string | null
  onClose: () => void
  onStart: (() => void) | null
}

export function BriefingModal({ studentId, onClose, onStart }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
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
    if (bodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = bodyRef.current
      if (scrollTop + clientHeight >= scrollHeight - 20) setScrolled(true)
    }
  }

  const handleStart = () => {
    if (!onStart || isNavigating) return
    setIsNavigating(true)
    onStart()
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
        className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-hidden bg-foreground/40 backdrop-blur-md"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          style={{ width: 720, maxWidth: '100%', maxHeight: '92vh' }}
          className="bg-card border border-border/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl"
        >
          {/* Header */}
          <div className="px-10 pt-10 pb-4 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Oversight Briefing</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {st.name}
                </h2>
                <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{st.rollId}</span>
                  <span className="text-slate-200">/</span>
                  <span>{st.assign}</span>
                  <span className="text-slate-200">/</span>
                  <span className="text-[#1F4E8C]">{st.critShort}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="size-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            {/* Integrity Status Row - Blended into Header */}
            <div className="flex flex-wrap gap-2 mt-6">
                <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <div className="size-1 rounded-full bg-amber-500" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      {st.isCluster ? 'Multi-Student Cluster' : 'Isolated Case'}
                    </span>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <div className="size-1 rounded-full bg-blue-500" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">First Appeal</span>
                </div>
                {st.hasOverride && (
                  <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <div className="size-1 rounded-full bg-emerald-500" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Manual Override</span>
                  </div>
                )}
                <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <div className="size-1 rounded-full bg-slate-400" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Confidence: {st.confScore}</span>
                </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 mx-10" />

          {/* Scrollable body */}
          <div
            ref={bodyRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-10 py-8 space-y-12"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* 1. The Mission (Slim & Blended) */}
            <section>
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                      <Target className="size-5 text-white" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Mission</span>
                      <h4 className="text-base font-bold text-slate-900 tracking-tight">
                        Locate {st.evidence} for {st.critShort} Alignment
                      </h4>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">Audit Required</span>
                  </div>
                </div>
            </section>

            {/* 2. The Dispute Content */}
            <section className="relative">
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Candidate's Rationale</span>
                  <p className="text-base font-bold leading-relaxed text-slate-900">
                    "{st.sv}"
                  </p>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#1F4E8C]/[0.03] border border-[#1F4E8C]/10">
                  <div className="size-8 rounded-lg bg-white border border-[#1F4E8C]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <ZapIcon className="size-4 text-[#1F4E8C]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#1F4E8C] uppercase tracking-widest">Structural Observation</span>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      {isCredible ? "Evidence discrepancy detected." : "Standard verification required."} {caseSummary}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Deep Context (The Accordions) */}
            <section className="space-y-3">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4">Historical Evidence</span>
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
                        <div className={cn("size-2 rounded-full ring-4 ring-muted/5 group-hover/item:ring-primary/10 transition-all", statusStyles[auditEventKind(entry.color)].dot)} />
                        {i < brf.auditTrail.length - 1 && <div className="w-px flex-1 my-1 bg-border/20" />}
                      </div>
                      <div className="flex-1 -mt-1 pb-4 border-b border-border/5">
                        <div className="text-xs font-bold text-foreground">{entry.event}</div>
                        <div className="eyebrow text-muted-foreground/30 mt-1">{entry.time}</div>
                      </div>
                    </div>
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
                className="eyebrow group flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-muted-foreground border border-border/30 bg-card/50 hover:bg-card hover:border-border transition-all"
              >
                {onStart ? <ChevronLeftIcon className="size-3 group-hover:-translate-x-0.5 transition-transform" /> : <XIcon className="size-3 group-hover:scale-110 transition-transform" />}
                {onStart ? 'Back to list' : 'Close Briefing'}
              </button>
            </div>
            {onStart && (
              <button
                onClick={!isNavigating ? handleStart : undefined}
                disabled={isNavigating}
                className={`eyebrow group/btn flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all min-w-[180px] ${
                  !isNavigating
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 translate-y-0 active:scale-[0.98]'
                    : 'bg-primary/80 text-primary-foreground cursor-wait shadow-lg shadow-primary/15'
                }`}
              >
                {isNavigating ? (
                  <>
                    <div className="size-3 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Opening Workspace...
                  </>
                ) : (
                  <>
                    Start Re-Evaluation
                    <ChevronLeftIcon className="size-3 rotate-180 group-hover/btn:translate-x-0.5 transition-transform" />
                  </>
                )}
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
    <div className={`rounded-xl border border-slate-200 transition-all ${open ? 'bg-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`size-8 rounded-lg flex items-center justify-center transition-colors ${open ? 'bg-primary text-primary-foreground' : 'bg-white border border-slate-200 text-slate-400'}`}>
            {icon}
          </div>
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
        </div>
        <div className={`size-6 flex items-center justify-center rounded-full transition-all ${open ? 'bg-slate-900 text-white rotate-180' : 'bg-slate-200 text-slate-500'}`}>
           <ChevronDownIcon className="size-3" />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="pt-4 border-t border-slate-100">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// Minimal Icons
function Target({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

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
