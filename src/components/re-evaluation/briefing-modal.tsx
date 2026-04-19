"use client"

import { useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STUDENTS, BRIEFINGS } from '@/lib/data/re-evaluation-data'

const FLAG_STYLES = {
  red:   { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', dot: '#EF4444' },
  amber: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' },
  blue:  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', dot: '#3B7FE8' },
  green: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', dot: '#22C55E' },
}

type Props = {
  studentId: string | null
  onClose: () => void
  onStart: (() => void) | null
}

export function BriefingModal({ studentId, onClose, onStart }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [accOpen, setAccOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setScrolled(false)
    setAccOpen({})
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center"
        style={{ background: 'rgba(15,17,27,.55)', backdropFilter: 'blur(3px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ width: 680, maxWidth: 'calc(100vw - 32px)', maxHeight: '88vh', boxShadow: '0 24px 64px rgba(0,0,0,.22), 0 4px 16px rgba(0,0,0,.1)' }}
          className="bg-white rounded-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-0 flex-shrink-0">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1A1D27' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: '#6B7280' }}>AI Case Briefing</span>
                </div>
                <div className="text-[18px] font-bold tracking-tight" style={{ color: '#111827' }}>{st.name}</div>
                <div className="text-[12px] mt-0.5" style={{ color: '#9CA3AF' }}>{st.rollId} · {st.assign} · {st.crit}</div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors hover:bg-gray-200"
                style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div
            ref={bodyRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 pt-4 pb-0"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* AI Summary */}
            <div className="rounded-xl p-4 mb-3.5" style={{ background: '#F8FAFC', border: '1.5px solid #E5E7EB' }}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#111827' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold tracking-[0.07em] uppercase" style={{ color: '#374151' }}>What you need to know</span>
              </div>
              <div className="space-y-2.5">
                {brf.aiSummaryParagraphs.map((p, i) => (
                  <p key={i} className="text-[13px] leading-relaxed" style={{ color: '#1F2937' }}>{p}</p>
                ))}
              </div>
            </div>

            {/* Flags */}
            {brf.flags.length > 0 && (
              <div className="mb-3.5">
                <div className="text-[11px] font-bold tracking-[0.07em] uppercase mb-2" style={{ color: '#9CA3AF' }}>Signals to check</div>
                <div className="flex flex-col gap-1.5">
                  {brf.flags.map((f, i) => {
                    const fc = FLAG_STYLES[f.type]
                    return (
                      <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg" style={{ background: fc.bg, border: `1px solid ${fc.border}` }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: fc.dot }} />
                        <span className="text-[12px] leading-snug" style={{ color: fc.text }}>{f.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Key facts grid */}
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <div className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1" style={{ color: '#9CA3AF' }}>Original score</div>
                <div className="text-[20px] font-extrabold tracking-tight leading-tight" style={{ color: '#111827' }}>{st.origScore} / {st.maxScore}</div>
                <div className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>{st.crit}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1" style={{ color: '#9CA3AF' }}>AI confidence</div>
                <div className="text-[14px] font-bold flex items-center gap-1.5 mb-0.5" style={{ color: '#111827' }}>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: st.confColor }} />
                  {st.confLabel} · {st.confScore}
                </div>
                <div className="text-[11px]" style={{ color: '#9CA3AF' }}>{st.hasOverride ? 'Override on record' : 'No prior override'}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1" style={{ color: '#9CA3AF' }}>Waiting</div>
                <div className="text-[14px] font-bold" style={{ color: '#111827' }}>{st.wait}</div>
                <div className="text-[11px]" style={{ color: '#9CA3AF' }}>{brf.requestType}</div>
              </div>
            </div>

            {/* Student's argument */}
            <div className="rounded-xl p-3.5 mb-3.5" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div className="text-[10px] font-bold tracking-[0.07em] uppercase mb-1.5" style={{ color: '#1D4ED8' }}>Student's argument</div>
              <div className="text-[13px] leading-relaxed italic" style={{ color: '#1E3A5F' }}>{st.sv}</div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.vcolor }} />
                <span className="text-[11px]" style={{ color: '#374151' }}>{st.verdict}</span>
              </div>
            </div>

            {/* Collapsible: Grading evidence */}
            <Accordion
              id="evidence"
              open={!!accOpen['evidence']}
              onToggle={() => toggleAcc('evidence')}
              label="Evidence used in original grading"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" /></svg>}
            >
              <div className="space-y-2">
                {brf.gradingEvidenceLines.map((line, i) => (
                  <p key={i} className="text-[13px] leading-relaxed" style={{ color: '#374151' }}>{line}</p>
                ))}
              </div>
            </Accordion>

            {/* Collapsible: Audit trail */}
            <Accordion
              id="audit"
              open={!!accOpen['audit']}
              onToggle={() => toggleAcc('audit')}
              label="Grading audit trail"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#374151" strokeWidth="1.6" /><path d="M12 7v5l3 3" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" /></svg>}
            >
              <div>
                {brf.auditTrail.map((entry, i) => (
                  <div key={i} className="flex gap-2.5 py-2" style={{ borderBottom: i < brf.auditTrail.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div className="flex flex-col items-center gap-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: entry.color }} />
                      {i < brf.auditTrail.length - 1 && <div className="w-px flex-1 my-1" style={{ background: '#E5E7EB' }} />}
                    </div>
                    <div className="flex-1">
                      <div className="text-[12px] leading-snug" style={{ color: '#374151' }}>{entry.event}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>{entry.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>

            {/* Collapsible: Cluster context */}
            {brf.hasCluster && (
              <div className="rounded-xl overflow-hidden mb-2" style={{ border: '1px solid #FDE68A' }}>
                <button
                  onClick={() => toggleAcc('cluster')}
                  className="w-full flex items-center justify-between px-3.5 py-3 cursor-pointer"
                  style={{ background: '#FFFBEB', border: 'none' }}
                >
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="text-[13px] font-semibold" style={{ color: '#92400E' }}>Pattern — multiple students raised this</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: accOpen['cluster'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', color: '#92400E' }}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {accOpen['cluster'] && (
                  <div className="px-3.5 pb-3.5 pt-3" style={{ background: '#FFFBEB', borderTop: '1px solid #FDE68A' }}>
                    <p className="text-[13px] leading-relaxed" style={{ color: '#78350F' }}>{brf.clusterText}</p>
                  </div>
                )}
              </div>
            )}

            <div className="h-24" />
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 flex items-center justify-between flex-shrink-0" style={{ borderTop: '1px solid #E5E7EB', background: '#fff' }}>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-50"
                style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Back to list
              </button>
              {!scrolled && onStart && (
                <div className="flex items-center gap-1 text-[11px]" style={{ color: '#9CA3AF' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Scroll to read full briefing
                </div>
              )}
            </div>
            {onStart && (
              <button
                onClick={canStart ? onStart : undefined}
                disabled={!canStart}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all"
                style={{
                  border: 'none',
                  background: canStart ? '#111827' : '#E5E7EB',
                  color: canStart ? '#fff' : '#9CA3AF',
                  cursor: canStart ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                Start Re-Evaluation
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
    <div className="rounded-xl overflow-hidden mb-2" style={{ border: '1px solid #E5E7EB' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3.5 py-3 cursor-pointer transition-colors hover:bg-gray-50"
        style={{ background: '#fff', border: 'none' }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[13px] font-semibold" style={{ color: '#111827' }}>{label}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', color: '#9CA3AF' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-3" style={{ background: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
          {children}
        </div>
      )}
    </div>
  )
}
