"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Download } from 'lucide-react'
import { STUDENTS, STUDENT_ORDER, ageStatusKind } from '@/lib/data/re-evaluation-data'
import { useReEvalStore } from '@/lib/store/re-evaluation-store'
import { BriefingModal } from '@/components/re-evaluation/briefing-modal'
import { statusStyles } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

const TOTAL = 7
const INITIAL_RESOLVED = 12

const CONCERN_STYLES = {
  red:    { bg: '#FEF2F2', border: '#FECACA', text: '#EF4444' },
  orange: { bg: '#FFF7ED', border: '#FED7AA', text: '#92400E' },
  blue:   { bg: '#EFF6FF', border: '#BFDBFE', text: '#3B82F6' },
}

const STATUS_STYLES = {
  overdue: { bg: '#EF4444', color: '#fff', label: 'Overdue' },
  pending: { bg: '#F1F5F9', color: '#94A3B8', label: 'Pending', border: '#CBD5E1' },
  new:     { bg: '#ECFDF5', color: '#065F46', label: 'New', border: '#A7F3D0' },
}

export default function ReEvaluationPage() {
  const router = useRouter()
  const { getStatus, hodPendingIds, resolvedIds } = useReEvalStore()
  const [briefingId, setBriefingId] = useState<string | null>(null)

  const pending = TOTAL - resolvedIds.length - hodPendingIds.length
  const resolved = INITIAL_RESOLVED + resolvedIds.length
  const hodCount = hodPendingIds.length
  const done = resolvedIds.length + hodPendingIds.length
  const progressPct = Math.round((done / TOTAL) * 100)

  const GLOBAL_KPIS = [
    { label: 'Pending', value: pending, sub: 'Awaiting your response', accent: '#EF4444' },
    { label: 'Due Today', value: 2, sub: 'Over 48 hrs — respond', accent: '#F59E0B' },
    { label: 'Awaiting HOD', value: hodCount, sub: 'Institutional review', accent: '#FBBF24' },
    { label: 'Resolved', value: resolved, sub: 'This batch total', accent: '#10B981' },
  ]

  const orderedStudents = [
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'pending'),
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'hod'),
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'resolved'),
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative bg-[#F8FAFC]/30">
      {/* Header Section — Sticky with blur matching Pre-evaluation */}
      <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-md pt-6 pb-6 border-b border-border/10">
        <div className="max-w-6xl mx-auto w-full px-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard/re-evaluation')}
              className="eyebrow group flex items-center gap-1.5 text-muted-foreground/40 hover:text-primary transition-all"
            >
              <ChevronLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
              Back to Assignments
            </button>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="eyebrow text-muted-foreground/40">IIM Bangalore</span>
                <span className="text-muted-foreground/20 text-[9px]">·</span>
                <span className="eyebrow text-primary/80">DSA · Batch 4</span>
                <span className="text-muted-foreground/20 text-[9px]">·</span>
                <span className="eyebrow text-muted-foreground/40">Re-Evaluation Desk</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter secondary-text">Review Requests</h1>
              <div className="flex items-center gap-2 pt-1">
                <p className="text-[11px] text-muted-foreground opacity-60 font-medium">
                  Results released Mon 9:00 AM · Appeal window closes Sunday night
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <button
                className="eyebrow flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/30 bg-card/50 text-muted-foreground hover:bg-card hover:border-border transition-all"
              >
                <Download className="size-3" />
                Download Record
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {GLOBAL_KPIS.map((kpi, i) => (
              <div key={i} className="group px-4 py-3 rounded-xl border border-border/30 bg-card/30 hover:bg-card/50 transition-all flex flex-col justify-center">
                <span className="eyebrow text-muted-foreground/50">{kpi.label}</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-black tracking-tighter" style={{ color: kpi.accent }}>{kpi.value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/30">{kpi.sub}</span>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-6xl mx-auto w-full pb-20 px-4 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Table Container */}
        <div className="rounded-2xl border border-border/10 bg-card/10 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div
            className="eyebrow grid text-muted-foreground/40"
            style={{
              gridTemplateColumns: '220px 180px 130px 1fr 100px 140px 140px',
              background: 'rgba(var(--muted), 0.05)',
              borderBottom: '1px solid rgba(var(--border), 0.1)',
            }}
          >
            {['Student', 'Assignment · Criterion', 'Concern', 'Student reasoning', 'Submitted', 'Status', 'Action'].map((h, i) => (
              <div key={i} className="px-4 py-4">{h}</div>
            ))}
          </div>

        {/* Rows */}
        {orderedStudents.map((id) => {
          const st = STUDENTS[id]
          const status = getStatus(id)
          const cs = CONCERN_STYLES[st.concernVariant]

          return (
            <div key={id} className="relative group/row" style={{ borderBottom: '1px solid rgba(var(--border), 0.1)' }}>
              <div
                className="grid hover:bg-muted/5 transition-colors"
                style={{
                  gridTemplateColumns: '220px 180px 130px 1fr 100px 140px 140px',
                  minHeight: 80,
                  background: st.rowBg ?? 'transparent',
                }}
              >
                {/* Student */}
                <div className="flex items-stretch p-0" style={{ borderRight: '1px solid rgba(var(--border), 0.05)' }}>
                  <div className={cn("w-1 flex-shrink-0 self-stretch", statusStyles[ageStatusKind(st.ageStatus)].dot)} />
                  <div className="px-4 py-4 flex flex-col justify-center gap-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                        style={{
                          background: st.isNew ? '#EFF6FF' : st.ageStatus === 'overdue' ? '#FEF2F2' : '#F8FAFC',
                          border: `1px solid ${st.isNew ? '#BFDBFE' : st.ageStatus === 'overdue' ? '#FECACA' : 'rgba(var(--border), 0.1)'}`,
                          color: st.isNew ? '#3B82F6' : st.ageStatus === 'overdue' ? '#EF4444' : '#64748B',
                        }}
                      >
                        {st.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div>
                          <div className="text-[13px] font-black tracking-tight flex items-center gap-1.5 text-[#1E293B]">
                            {st.name}
                            {st.isNew && <span className="w-1.5 h-1.5 rounded-full inline-block bg-primary" />}
                          </div>
                          <div className="eyebrow text-muted-foreground/40">{st.rollId}</div>
                        </div>
                        {st.isCluster && (
                          <span className="eyebrow self-start px-2 py-0.5 rounded-md bg-amber-500/5 text-amber-600 border border-amber-500/10 w-fit">
                            C2 cluster
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment · Criterion */}
                <div className="px-4 py-4 flex flex-col justify-center gap-1.5" style={{ borderRight: '1px solid rgba(var(--border), 0.05)' }}>
                  <div className="text-[12px] font-black tracking-tight text-[#1E293B]">{st.assign}</div>
                  <span className="eyebrow self-start px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
                    {st.critShort} · {st.origScore}/{st.maxScore}
                  </span>
                </div>

                {/* Concern */}
                <div className="px-4 py-4 flex flex-col justify-center gap-1.5" style={{ borderRight: '1px solid rgba(var(--border), 0.05)' }}>
                  <div className="text-[12px] font-bold text-slate-600">{st.concern}</div>
                  <span
                    className="eyebrow self-start px-1.5 py-0.5 rounded-md"
                    style={{ background: cs.bg, color: cs.text, border: `1px solid ${cs.border}` }}
                  >
                    {st.concernType}
                  </span>
                </div>

                {/* Student reasoning */}
                <div className="px-4 py-4 flex items-center" style={{ borderRight: '1px solid rgba(var(--border), 0.05)' }}>
                  <div
                    className="text-[11px] font-medium leading-relaxed overflow-hidden text-slate-500 italic"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}
                  >
                    "{st.sv}"
                  </div>
                </div>

                {/* Submitted */}
                <div className="px-4 py-4 flex flex-col justify-center" style={{ borderRight: '1px solid rgba(var(--border), 0.05)' }}>
                  <div
                    className="text-[10px] font-black tracking-tighter"
                    style={{ color: st.ageStatus === 'overdue' ? '#EF4444' : st.ageStatus === 'new' ? '#64748B' : '#92400E' }}
                  >
                    {st.ageLabel}
                  </div>
                  <div className="eyebrow text-muted-foreground/30">
                    {st.ageStatus === 'overdue' ? 'Overdue' : st.ageStatus === 'new' ? 'New' : 'Pending'}
                  </div>
                </div>

                {/* Status */}
                <div className="px-4 py-4 flex items-center" style={{ borderRight: '1px solid rgba(var(--border), 0.05)' }}>
                  <StatusPill status={status} ageStatus={st.ageStatus} />
                </div>

                {/* Action */}
                <div className="px-4 py-4 flex items-center justify-center">
                  {status === 'pending' && (
                    <button
                      onClick={() => setBriefingId(id)}
                      className="eyebrow group/btn flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white bg-primary hover:bg-primary/90 transition-all shadow-[0_2px_10px_rgba(var(--primary),0.2)]"
                    >
                      Review now
                      <ChevronLeft className="size-3 rotate-180 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                  {status === 'hod' && (
                    <button
                      onClick={() => router.push(`/dashboard/re-evaluation/${id}`)}
                      className="eyebrow px-4 py-1.5 rounded-lg text-muted-foreground border border-border/30 bg-card/50 hover:bg-card hover:border-border transition-all"
                    >
                      View →
                    </button>
                  )}
                </div>
              </div>

              {/* Resolved overlay */}
              {status === 'resolved' && (
                <div
                  className="absolute inset-0 flex items-center px-4 gap-2.5 text-[12px] font-semibold pointer-events-none"
                  style={{ background: 'rgba(240,253,244,.96)', color: '#065F46', zIndex: 5 }}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#10B981" strokeWidth="1.5" />
                    <path d="M6 10l3 3 5-5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Resolved · Student notified
                </div>
              )}

              {/* HOD overlay */}
              {status === 'hod' && (
                <div
                  className="absolute inset-0 flex items-center px-4 gap-2 text-[12px] font-semibold pointer-events-none"
                  style={{ background: 'rgba(255,251,235,.95)', color: '#92400E', zIndex: 5 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" stroke="#F59E0B" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  Awaiting HOD approval · Dr. R. Kumar · Student notified once HOD approves
                  <button
                    onClick={() => router.push(`/dashboard/re-evaluation/${id}`)}
                    className="ml-auto pointer-events-auto px-3 py-1 rounded text-[11px] font-semibold"
                    style={{ background: '#FEF3DC', border: '1px solid #FDE68A', color: '#92400E', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    View →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Briefing modal */}
      {briefingId && (
        <BriefingModal
          studentId={briefingId}
          onClose={() => setBriefingId(null)}
          onStart={() => {
            // Allow smooth navigation by keeping the modal open while routing
            router.push(`/dashboard/re-evaluation/${briefingId}`)
          }}
        />
      )}
      </div>
    </div>
  )
}


function StatusPill({ status, ageStatus }: { status: 'pending' | 'hod' | 'resolved'; ageStatus: string }) {
  if (status === 'resolved') {
    return (
      <span className="eyebrow px-2 py-0.5 rounded-md bg-emerald-500/5 text-emerald-600 border border-emerald-500/10">
        Resolved
      </span>
    )
  }
  if (status === 'hod') {
    return (
      <span className="eyebrow px-2 py-0.5 rounded-md bg-amber-500/5 text-amber-600 border border-amber-500/10">
        Awaiting HOD
      </span>
    )
  }
  if (ageStatus === 'overdue') {
    return (
      <span className="eyebrow px-2 py-0.5 rounded-md bg-red-500 text-white">
        Overdue
      </span>
    )
  }
  if (ageStatus === 'new') {
    return (
      <span className="eyebrow px-2 py-0.5 rounded-md bg-blue-500/5 text-blue-600 border border-blue-500/10">
        New
      </span>
    )
  }
  return (
    <span className="eyebrow px-2 py-0.5 rounded-md bg-slate-500/5 text-slate-500 border border-slate-500/10">
      Pending
    </span>
  )
}
