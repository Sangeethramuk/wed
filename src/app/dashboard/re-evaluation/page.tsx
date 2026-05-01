"use client"

import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  BookOpen,
  Users
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PORTFOLIO = [
  { 
    id: 'dsa', 
    name: 'Data Structures & Algorithms', 
    batch: 'Batch 4', 
    pending: 7, 
    dueSoon: 2, 
    sla: '42h remaining', 
    tone: 'error',
    friction: 'High (32%)',
    trend: 'up'
  },
  { 
    id: 'os', 
    name: 'Operating Systems', 
    batch: 'Batch 2', 
    pending: 3, 
    dueSoon: 0, 
    sla: '68h remaining', 
    tone: 'warning',
    friction: 'Low (4%)',
    trend: 'down'
  },
  { 
    id: 'dbms', 
    name: 'Database Management', 
    batch: 'Batch 1', 
    pending: 0, 
    dueSoon: 0, 
    sla: 'Complete', 
    tone: 'success',
    friction: 'Med (12%)',
    trend: 'stable'
  }
]

export default function ReEvalPortfolioPage() {
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Academic Portfolio</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            Re-Evaluation Command Center
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            You are overseeing 3 active courses. Review disputes across your portfolio and monitor rubric consistency to ensure institutional grading integrity.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Portfolio Load</p>
              <p className="text-sm font-bold text-slate-900">10 Pending</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Avg. SLA</p>
              <p className="text-sm font-bold text-emerald-600">54h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-900">Portfolio Alert: DSA Dispute Spike</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Data Structures (Batch 4) has a dispute rate 3x higher than your average. This suggests a potential misalignment in the 'Problem Analysis' rubric.
          </p>
          <Button variant="link" className="p-0 h-auto text-xs text-amber-800 font-bold underline decoration-amber-300">
            Audit DSA Rubric →
          </Button>
        </div>
      </div>

      {/* Course Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PORTFOLIO.map((course) => (
          <Card 
            key={course.id} 
            className="group border-slate-200 hover:border-[#1F4E8C] transition-all cursor-pointer overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            onClick={() => router.push('/dashboard/re-evaluation/triage')}
          >
            <CardContent className="p-0">
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <div className="size-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <BookOpen className="size-4 text-slate-400" />
                       </div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.batch}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#1F4E8C] transition-colors mt-2">
                      {course.name}
                    </h3>
                  </div>
                  {course.pending > 0 && (
                    <div className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider border border-red-100">
                      {course.pending} Pending
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA Status</p>
                      <div className="flex items-center gap-1.5">
                        <Clock className={cn("size-3.5", course.tone === 'error' ? "text-red-500" : course.tone === 'warning' ? "text-amber-500" : "text-emerald-500")} />
                        <span className="text-sm font-semibold text-slate-700">{course.sla}</span>
                      </div>
                   </div>
                   <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dispute Friction</p>
                      <p className={cn("text-sm font-bold", course.tone === 'error' ? "text-red-600" : "text-slate-900")}>{course.friction}</p>
                   </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-[#1F4E8C]/5 transition-colors">
                <div className="flex items-center gap-2">
                   <Users className="size-3.5 text-slate-400" />
                   <span className="text-xs font-medium text-slate-500">Overseeing 4 Instructors</span>
                </div>
                <ArrowRight className="size-4 text-slate-300 group-hover:text-[#1F4E8C] transition-all transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Portfolio Analytics Snippet */}
      <Card className="border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Portfolio-wide Resolution Trend</h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-[#1F4E8C]">Full Portfolio Report →</Button>
           </div>
           <div className="h-48 w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 opacity-40">
                 <BarChart3 className="size-8 text-slate-400" />
                 <p className="text-xs font-medium">Cross-course comparison chart rendering...</p>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
