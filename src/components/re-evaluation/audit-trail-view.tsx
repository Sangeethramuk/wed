"use client"

import { Clock, CheckCircle2, AlertTriangle, Layers, Send, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const AUDIT_LOGS = [
  {
    id: 1,
    time: '2 hours ago',
    event: 'Portfolio Audit: DSA Batch 4',
    user: 'Prof. Sangeeth Kumar',
    description: 'Bulk ratified 4 re-evaluation requests after verifying C1 rubric consistency.',
    type: 'success',
    icon: CheckCircle2
  },
  {
    id: 2,
    time: '5 hours ago',
    event: 'HOD Ratification: OS Lab 3',
    user: 'Dr. R. Kumar (HOD)',
    description: 'Approved score uptick (+2.0) for Student CS21B045 following faculty review.',
    type: 'hod',
    icon: Layers
  },
  {
    id: 3,
    time: 'Yesterday, 4:30 PM',
    event: 'SLA Warning: DBMS Project',
    user: 'System Bot',
    description: '2 requests in DBMS have exceeded the 48-hour response window.',
    type: 'warning',
    icon: AlertTriangle
  },
  {
    id: 4,
    time: 'Yesterday, 10:15 AM',
    event: 'Sent to Exam Department',
    user: 'Prof. Sangeeth Kumar',
    description: 'Finalized batch of 12 re-evaluations for digital notification.',
    type: 'send',
    icon: Send
  }
]

export function AuditTrailView() {
  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-700">
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {AUDIT_LOGS.map((log, i) => (
          <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            {/* Dot/Icon */}
            <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all group-hover:scale-110",
                log.type === 'success' ? "bg-emerald-500 text-white" :
                log.type === 'hod' ? "bg-amber-500 text-white" :
                log.type === 'warning' ? "bg-red-500 text-white" :
                "bg-[#1F4E8C] text-white"
            )}>
              <log.icon className="size-5" />
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#1F4E8C] transition-all">
              <div className="flex items-center justify-between mb-1">
                <time className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.time}</time>
                <div className="flex items-center gap-1 text-[9px] font-black text-[#1F4E8C] uppercase tracking-widest opacity-60">
                   <UserCheck className="size-3" />
                   {log.user.split(' ')[0]}
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{log.event}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{log.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
         <p className="text-xs text-slate-400 font-medium italic">End of Audit Trail · All records are cryptographically signed.</p>
      </div>
    </div>
  )
}
