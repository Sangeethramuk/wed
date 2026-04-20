"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Download } from 'lucide-react'
import { STUDENTS, STUDENT_ORDER, ageStatusKind } from '@/lib/data/re-evaluation-data'
import { useReEvalStore } from '@/lib/store/re-evaluation-store'
import { BriefingModal } from '@/components/re-evaluation/briefing-modal'
import { statusStyles, type StatusKey } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

const TOTAL = 7
const INITIAL_RESOLVED = 12

const CONCERN_KINDS: Record<'red' | 'orange' | 'blue', StatusKey> = {
  red: 'error',
  orange: 'warning',
  blue: 'info',
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

  const GLOBAL_KPIS: Array<{ label: string; value: number; sub: string; tone: StatusKey }> = [
    { label: 'Pending', value: pending, sub: 'Awaiting your response', tone: 'error' },
    { label: 'Due Today', value: 2, sub: 'Over 48 hrs — respond', tone: 'warning' },
    { label: 'Awaiting HOD', value: hodCount, sub: 'Institutional review', tone: 'warning' },
    { label: 'Resolved', value: resolved, sub: 'This batch total', tone: 'success' },
  ]

  const orderedStudents = [
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'pending'),
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'hod'),
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'resolved'),
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative bg-muted/20">
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
                <span className="text-muted-foreground/20 text-xs">·</span>
                <span className="eyebrow text-primary/80">DSA · Batch 4</span>
                <span className="text-muted-foreground/20 text-xs">·</span>
                <span className="eyebrow text-muted-foreground/40">Re-Evaluation Desk</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight secondary-text">Review Requests</h1>
              <div className="flex items-center gap-2 pt-1">
                <p className="text-xs text-muted-foreground opacity-60 font-medium">
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
                  <span className={cn("text-xl font-semibold tracking-tight", statusStyles[kpi.tone].text)}>{kpi.value}</span>
                  <span className="text-xs font-bold text-muted-foreground/30">{kpi.sub}</span>
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
            className="eyebrow grid text-muted-foreground/40 bg-muted/40 border-b border-border/50"
            style={{
              gridTemplateColumns: '220px 180px 140px 1fr 110px 140px 160px',
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
          const concernKind = CONCERN_KINDS[st.concernVariant as keyof typeof CONCERN_KINDS] ?? 'neutral'
          const concern = statusStyles[concernKind]
          const avatarKind: StatusKey = st.isNew ? 'info' : st.ageStatus === 'overdue' ? 'error' : 'neutral'
          const avatar = statusStyles[avatarKind]

          return (
            <div key={id} className="relative group/row border-b border-border/50">
              <div
                className="grid hover:bg-muted/20 transition-colors"
                style={{
                  gridTemplateColumns: '220px 180px 140px 1fr 110px 140px 160px',
                  minHeight: 80,
                }}
              >
                {/* Student */}
                <div className="flex items-stretch p-0 border-r border-border/30">
                  <div className={cn("w-1 flex-shrink-0 self-stretch", statusStyles[ageStatusKind(st.ageStatus)].dot)} />
                  <div className="px-4 py-4 flex flex-col justify-center gap-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 border", avatar.bg, avatar.border, avatar.text)}>
                        {st.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div>
                          <div className="text-sm font-semibold tracking-tight flex items-center gap-1.5 text-foreground">
                            {st.name}
                            {st.isNew && <span className="w-1.5 h-1.5 rounded-full inline-block bg-primary" />}
                          </div>
                          <div className="eyebrow text-muted-foreground/40">{st.rollId}</div>
                        </div>
                        {st.isCluster && (
                          <span className={cn("eyebrow self-start px-2 py-0.5 rounded-md border w-fit", statusStyles.warning.bg, statusStyles.warning.border, statusStyles.warning.text)}>
                            C2 cluster
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment · Criterion */}
                <div className="px-4 py-4 flex flex-col justify-center gap-1.5 border-r border-border/30">
                  <div className="text-xs font-semibold tracking-tight text-foreground">{st.assign}</div>
                  <span className="eyebrow self-start px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">
                    {st.critShort} · {st.origScore}/{st.maxScore}
                  </span>
                </div>

                {/* Concern */}
                <div className="px-4 py-4 flex flex-col justify-center gap-1.5 border-r border-border/30">
                  <div className="text-xs font-bold text-muted-foreground">{st.concern}</div>
                  <span className={cn("eyebrow self-start whitespace-nowrap px-1.5 py-0.5 rounded-md border", concern.bg, concern.text, concern.border)}>
                    {st.concernType}
                  </span>
                </div>

                {/* Student reasoning */}
                <div className="px-4 py-4 flex items-center border-r border-border/30">
                  <div
                    className="text-xs font-medium leading-relaxed overflow-hidden text-muted-foreground italic"
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
                <div className="px-4 py-4 flex flex-col justify-center border-r border-border/30">
                  <div className={cn("text-xs font-semibold tracking-tight", statusStyles[st.ageStatus === 'overdue' ? 'error' : st.ageStatus === 'new' ? 'neutral' : 'warning'].text)}>
                    {st.ageLabel}
                  </div>
                  <div className="eyebrow text-muted-foreground/30">
                    {st.ageStatus === 'overdue' ? 'Overdue' : st.ageStatus === 'new' ? 'New' : 'Pending'}
                  </div>
                </div>

                {/* Status */}
                <div className="px-4 py-4 flex items-center border-r border-border/30">
                  <StatusPill status={status} ageStatus={st.ageStatus} />
                </div>

                {/* Action */}
                <div className="px-4 py-4 flex items-center justify-center">
                  {status === 'pending' && (
                    <button
                      onClick={() => setBriefingId(id)}
                      className="group/btn inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      Review now
                      <ChevronLeft className="size-3 rotate-180 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                  {status === 'hod' && (
                    <button
                      onClick={() => router.push(`/dashboard/re-evaluation/${id}`)}
                      className="inline-flex items-center whitespace-nowrap text-sm font-medium px-4 py-2 rounded-lg text-muted-foreground border border-border bg-card/50 hover:bg-card hover:border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      View →
                    </button>
                  )}
                </div>
              </div>

              {/* Resolved overlay */}
              {status === 'resolved' && (
                <div
                  className={cn("absolute inset-0 flex items-center px-4 gap-2.5 text-xs font-semibold pointer-events-none", statusStyles.success.bg, statusStyles.success.text)}
                  style={{ zIndex: 5 }}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={statusStyles.success.text}>
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Resolved · Student notified
                </div>
              )}

              {/* HOD overlay */}
              {status === 'hod' && (
                <div
                  className={cn("absolute inset-0 flex items-center px-4 gap-2 text-xs font-semibold pointer-events-none", statusStyles.warning.bg, statusStyles.warning.text)}
                  style={{ zIndex: 5 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={statusStyles.warning.text}>
                    <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  Awaiting HOD approval · Dr. R. Kumar · Student notified once HOD approves
                  <button
                    onClick={() => router.push(`/dashboard/re-evaluation/${id}`)}
                    className={cn("ml-auto pointer-events-auto px-3 py-1 rounded text-xs font-semibold cursor-pointer border", statusStyles.warning.bg, statusStyles.warning.border, statusStyles.warning.text)}
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
    const s = statusStyles.success
    return (
      <span className={cn("eyebrow px-2 py-0.5 rounded-md border", s.bg, s.text, s.border)}>Resolved</span>
    )
  }
  if (status === 'hod') {
    const s = statusStyles.warning
    return (
      <span className={cn("eyebrow px-2 py-0.5 rounded-md border", s.bg, s.text, s.border)}>Awaiting HOD</span>
    )
  }
  if (ageStatus === 'overdue') {
    return (
      <span className="eyebrow px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground">Overdue</span>
    )
  }
  if (ageStatus === 'new') {
    const s = statusStyles.info
    return (
      <span className={cn("eyebrow px-2 py-0.5 rounded-md border", s.bg, s.text, s.border)}>New</span>
    )
  }
  const s = statusStyles.neutral
  return (
    <span className={cn("eyebrow px-2 py-0.5 rounded-md border", s.bg, s.text, s.border)}>Pending</span>
  )
}
