"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { STUDENTS, STUDENT_ORDER } from '@/lib/data/re-evaluation-data'
import { useReEvalStore } from '@/lib/store/re-evaluation-store'
import { BriefingModal } from '@/components/re-evaluation/briefing-modal'

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

  const orderedStudents = [
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'pending'),
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'hod'),
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'resolved'),
  ]

  return (
    <div className="space-y-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Re-evaluation Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            CS301 · DSA Batch 4 · Results released Mon 9:00 AM · Appeal window closes Sunday night
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {pending > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}>
              ⏱ 2 waiting over 48 hours
            </div>
          )}
          <button
            className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-accent"
            style={{ border: '1.5px solid #CBD5E1', background: 'transparent', color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Download full record
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <KpiCard label="Pending" value={pending} sub="Awaiting your response" accent="#EF4444" />
        <KpiCard label="Due today" value={2} sub="Over 48 hrs — respond now" accent="#F59E0B" />
        <KpiCard label="Awaiting HOD" value={hodCount} sub="Under institutional review" accent="#FBBF24" />
        <KpiCard label="Resolved" value={resolved} sub="This batch" accent="#10B981" />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-[12px] text-muted-foreground whitespace-nowrap">
          {pending} request{pending !== 1 ? 's' : ''} remaining
        </span>
        <div className="flex-1 h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: '#6B5FC4' }}
          />
        </div>
        <span className="text-[12px] font-semibold text-muted-foreground whitespace-nowrap">{done} / {TOTAL}</span>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
        {/* Header */}
        <div
          className="grid text-[10px] font-bold uppercase tracking-[0.07em]"
          style={{
            gridTemplateColumns: '200px 160px 110px 1fr 85px 125px 120px',
            background: '#F1F5F9',
            borderBottom: '1px solid #CBD5E1',
            color: '#94A3B8',
          }}
        >
          {['Student', 'Assignment · Criterion', 'Concern', 'Student reasoning', 'Submitted', 'Status', ''].map((h, i) => (
            <div key={i} className="px-3 py-2.5" style={{ borderRight: i < 6 ? '1px solid #E2E8F0' : 'none' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {orderedStudents.map((id) => {
          const st = STUDENTS[id]
          const status = getStatus(id)
          const cs = CONCERN_STYLES[st.concernVariant]

          return (
            <div key={id} className="relative" style={{ borderBottom: '1px solid #E2E8F0' }}>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '200px 160px 110px 1fr 85px 125px 120px',
                  minHeight: 70,
                  background: st.rowBg ?? '#fff',
                }}
              >
                {/* Student */}
                <div className="flex items-stretch p-0" style={{ borderRight: '1px solid #E2E8F0' }}>
                  <div className="w-0.5 flex-shrink-0 self-stretch" style={{ background: st.accentColor }} />
                  <div className="px-3 py-2.5 flex flex-col justify-center gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{
                          background: st.isNew ? '#EFF6FF' : st.ageStatus === 'overdue' ? '#FEF2F2' : '#F1F5F9',
                          border: `1px solid ${st.isNew ? '#BFDBFE' : st.ageStatus === 'overdue' ? '#FECACA' : '#E2E8F0'}`,
                          color: st.isNew ? '#3B82F6' : st.ageStatus === 'overdue' ? '#EF4444' : '#64748B',
                        }}
                      >
                        {st.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold flex items-center gap-1.5" style={{ color: '#1E293B' }}>
                          {st.name}
                          {st.isNew && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#3B7FE8' }} />}
                        </div>
                        <div className="text-[10px]" style={{ color: '#94A3B8', fontFamily: 'monospace' }}>{st.rollId}</div>
                      </div>
                    </div>
                    {st.isCluster && (
                      <span
                        className="self-start text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-[0.04em]"
                        style={{ background: '#FFF7ED', color: '#92400E', border: '1px solid #FED7AA' }}
                      >
                        C2 cluster
                      </span>
                    )}
                  </div>
                </div>

                {/* Assignment · Criterion */}
                <div className="px-3 py-2.5 flex flex-col justify-center gap-1" style={{ borderRight: '1px solid #E2E8F0' }}>
                  <div className="text-[12px] font-medium" style={{ color: '#1E293B' }}>{st.assign}</div>
                  <span
                    className="self-start text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#EDE9FB', color: '#6B5FC4', border: '1px solid #C4BDF0' }}
                  >
                    {st.critShort} · {st.origScore} / {st.maxScore}
                  </span>
                </div>

                {/* Concern */}
                <div className="px-3 py-2.5 flex flex-col justify-center gap-1" style={{ borderRight: '1px solid #E2E8F0' }}>
                  <div className="text-[12px]" style={{ color: '#475569' }}>{st.concern}</div>
                  <span
                    className="self-start text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-[0.04em]"
                    style={{ background: cs.bg, color: cs.text, border: `1px solid ${cs.border}` }}
                  >
                    {st.concernType}
                  </span>
                </div>

                {/* Student reasoning */}
                <div className="px-3 py-2.5 flex items-center" style={{ borderRight: '1px solid #E2E8F0' }}>
                  <div
                    className="text-[12px] leading-relaxed overflow-hidden"
                    style={{
                      color: '#475569',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}
                  >
                    {st.sv}
                  </div>
                </div>

                {/* Submitted */}
                <div className="px-3 py-2.5 flex flex-col justify-center" style={{ borderRight: '1px solid #E2E8F0' }}>
                  <div
                    className="text-[11px] font-bold"
                    style={{ color: st.ageStatus === 'overdue' ? '#EF4444' : st.ageStatus === 'new' ? '#475569' : '#92400E' }}
                  >
                    {st.ageLabel}
                  </div>
                  <div className="text-[10px] capitalize" style={{ color: '#94A3B8' }}>
                    {st.ageStatus === 'overdue' ? 'Overdue' : st.ageStatus === 'new' ? 'New' : 'Pending'}
                  </div>
                </div>

                {/* Status */}
                <div className="px-3 py-2.5 flex items-center" style={{ borderRight: '1px solid #E2E8F0' }}>
                  <StatusPill status={status} ageStatus={st.ageStatus} />
                </div>

                {/* Action */}
                <div className="px-3 py-2.5 flex items-center justify-center">
                  {status === 'pending' && (
                    <button
                      onClick={() => setBriefingId(id)}
                      className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-white transition-colors"
                      style={{ background: '#6B5FC4', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 6px rgba(107,95,196,.35)' }}
                    >
                      Review now →
                    </button>
                  )}
                  {status === 'hod' && (
                    <button
                      onClick={() => router.push(`/dashboard/re-evaluation/${id}`)}
                      className="px-4 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-slate-50"
                      style={{ border: '1.5px solid #CBD5E1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
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
            setBriefingId(null)
            router.push(`/dashboard/re-evaluation/${briefingId}`)
          }}
        />
      )}
    </div>
  )
}

function KpiCard({ label, value, sub, accent }: { label: string; value: number; sub: string; accent: string }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: '#fff', border: '1px solid #E2E8F0', borderLeft: `3px solid ${accent}`, boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1" style={{ color: '#94A3B8' }}>{label}</div>
      <div className="text-[24px] font-extrabold tracking-tight leading-tight" style={{ color: accent }}>{value}</div>
      <div className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>{sub}</div>
    </div>
  )
}

function StatusPill({ status, ageStatus }: { status: 'pending' | 'hod' | 'resolved'; ageStatus: string }) {
  if (status === 'resolved') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.04em]" style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
        Resolved
      </span>
    )
  }
  if (status === 'hod') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.04em]" style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>
        Awaiting HOD
      </span>
    )
  }
  if (ageStatus === 'overdue') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.04em] text-white" style={{ background: '#EF4444', border: '1px solid #EF4444' }}>
        Overdue
      </span>
    )
  }
  if (ageStatus === 'new') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.04em]" style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
        New
      </span>
    )
  }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.04em]" style={{ background: '#F1F5F9', color: '#94A3B8', border: '1px solid #CBD5E1' }}>
      Pending
    </span>
  )
}
