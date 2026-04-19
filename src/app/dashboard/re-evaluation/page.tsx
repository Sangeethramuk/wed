"use client"

import { useRouter } from 'next/navigation'
import { useReEvalStore } from '@/lib/store/re-evaluation-store'
import { 
  RefreshCcw, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Users, 
  Sparkles,
  PlayCircle,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const GLOBAL_KPIS = [
  { label: 'Awaiting Response', value: 13, sub: 'Across 5 assignments', accent: '#EF4444' },
  { label: 'SLA Breached', value: 3, sub: 'Respond now', accent: '#F59E0B' },
  { label: 'Institutional Review', value: 1, sub: 'Awaiting HOD', accent: '#FBBF24' },
  { label: 'Resolved This Batch', value: 12, sub: 'Closed window', accent: '#10B981' },
]

type WorkflowState = 'IN_PROGRESS' | 'READY' | 'WINDOW_OPEN' | 'COMPLETED'

const ASSIGNMENTS = [
  {
    id: 'dsa-a1',
    code: 'CS301',
    subject: 'DSA',
    batch: 'Batch 4',
    title: 'DSA Assignment 1',
    workflowState: 'IN_PROGRESS' as WorkflowState,
    pendingCount: 7,
    overdueCount: 2,
    firstRequest: '4 days ago',
    latestRequest: '51 hrs ago',
    appealWindow: 'Window closed',
    resolvedCount: 5,
    totalCount: 12,
    url: '/dashboard/re-evaluation/triage'
  },
  {
    id: 'os-l3',
    code: 'CS205',
    subject: 'OS',
    batch: 'Batch 2',
    title: 'OS Lab 3',
    workflowState: 'IN_PROGRESS' as WorkflowState,
    pendingCount: 2,
    overdueCount: 1,
    firstRequest: '3 days ago',
    latestRequest: '2 days ago',
    appealWindow: 'Window closed',
    resolvedCount: 2,
    totalCount: 4,
    url: '#'
  },
  {
    id: 'dsa-mid',
    code: 'CS301',
    subject: 'DSA',
    batch: 'Batch 3',
    title: 'DSA Mid-Term Exam',
    workflowState: 'READY' as WorkflowState,
    pendingCount: 3,
    overdueCount: 0,
    firstRequest: '6 days ago',
    latestRequest: '3 days ago',
    appealWindow: 'Closed recently',
    resolvedCount: 9,
    totalCount: 12,
    url: '#'
  },
  {
    id: 'networks-q1',
    code: 'CS410',
    subject: 'Networks',
    batch: 'Batch 1',
    title: 'Networks Quiz 1',
    workflowState: 'WINDOW_OPEN' as WorkflowState,
    pendingCount: 1,
    overdueCount: 0,
    firstRequest: '18 hrs ago',
    latestRequest: '18 hrs ago',
    appealWindow: 'Closes in 2 days',
    resolvedCount: 0,
    totalCount: 1,
    url: '#'
  },
  {
    id: 'math-end',
    code: 'MA204',
    subject: 'Engineering Maths',
    batch: 'Multiple batches',
    title: 'Engineering Mathematics',
    workflowState: 'WINDOW_OPEN' as WorkflowState,
    pendingCount: 4,
    overdueCount: 0,
    firstRequest: '2 days ago',
    latestRequest: '5 hrs ago',
    appealWindow: 'Closes in 5 days',
    resolvedCount: 0,
    totalCount: 4,
    shared: '3 faculty',
    url: '#'
  },
  {
    id: 'db-sys',
    code: 'CS305',
    subject: 'DBMS',
    batch: 'Batch 1',
    title: 'Database Systems Final',
    workflowState: 'COMPLETED' as WorkflowState,
    pendingCount: 0,
    overdueCount: 0,
    firstRequest: '12 days ago',
    latestRequest: '8 days ago',
    appealWindow: 'Closed',
    resolvedCount: 15,
    totalCount: 15,
    url: '#'
  }
]

export default function ReEvaluationDashboard() {
  const router = useRouter()
  const { hodPendingIds, resolvedIds } = useReEvalStore()

  // Dynamic stats for the main assignment
  const dsaPending = 7 - resolvedIds.length - hodPendingIds.length
  const dsaResolved = 5 + resolvedIds.length

  const groupedAssignments = {
    IN_PROGRESS: ASSIGNMENTS.filter(a => a.workflowState === 'IN_PROGRESS'),
    READY: ASSIGNMENTS.filter(a => a.workflowState === 'READY'),
    WINDOW_OPEN: ASSIGNMENTS.filter(a => a.workflowState === 'WINDOW_OPEN'),
    COMPLETED: ASSIGNMENTS.filter(a => a.workflowState === 'COMPLETED'),
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative bg-[#F8FAFC]/30">
      {/* Header Section — Sticky with blur matching Pre-evaluation */}
      <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-md pt-6 pb-8 border-b border-border/10">
        <div className="max-w-6xl mx-auto w-full px-4">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">IIM Bangalore</span>
                <span className="text-muted-foreground/20 text-[9px]">·</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Re-Evaluation Module</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter secondary-text">Manage your workload</h1>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-3 w-3 opacity-50" />
                Last updated 2 mins ago
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {GLOBAL_KPIS.map((kpi, i) => (
              <div key={i} className="group px-4 py-3 rounded-xl border border-border/30 bg-card/30 hover:bg-card/50 transition-all flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">{kpi.label}</span>
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
      <div className="max-w-6xl mx-auto w-full pb-20 px-4 pt-6 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* 1. IN PROGRESS */}
        <Section 
          title="In Progress" 
          subtitle="Continue review sessions for active re-evaluation queues"
          icon={<PlayCircle className="h-3.5 w-3.5" />}
          count={groupedAssignments.IN_PROGRESS.length}
          accent="primary"
        >
          <div className="grid grid-cols-3 gap-4">
            {groupedAssignments.IN_PROGRESS.map(assignment => {
              const isDsa = assignment.id === 'dsa-a1'
              return (
                <AssignmentCard 
                  key={assignment.id} 
                  {...assignment} 
                  pendingCount={isDsa ? dsaPending : assignment.pendingCount}
                  resolvedCount={isDsa ? dsaResolved : assignment.resolvedCount}
                  cta="Continue Review"
                  onClick={() => assignment.url !== '#' && router.push(assignment.url)}
                />
              )
            })}
          </div>
        </Section>

        {/* 2. READY FOR REVIEW */}
        <Section 
          title="Ready for Review" 
          subtitle="Appeal window closed. Final queues ready for your attention."
          icon={<Layers className="h-3.5 w-3.5" />}
          count={groupedAssignments.READY.length}
          accent="amber"
        >
          <div className="grid grid-cols-3 gap-4">
            {groupedAssignments.READY.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                {...assignment} 
                resolvedCount={0}
                cta="Start Review"
                onClick={() => assignment.url !== '#' && router.push(assignment.url)}
              />
            ))}
          </div>
        </Section>

        {/* 3. WINDOW OPEN */}
        <Section 
          title="Request Window Open" 
          subtitle="Upcoming workload. Students currently submitting appeals."
          icon={<Calendar className="h-3.5 w-3.5" />}
          count={groupedAssignments.WINDOW_OPEN.length}
          accent="slate"
        >
          <div className="grid grid-cols-3 gap-4">
            {groupedAssignments.WINDOW_OPEN.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                {...assignment} 
                variant="outline"
              />
            ))}
          </div>
        </Section>

        {/* 4. COMPLETED */}
        <Section 
          title="Completed" 
          subtitle="All requests resolved for this window."
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          count={groupedAssignments.COMPLETED.length}
          accent="emerald"
        >
          <div className="grid grid-cols-3 gap-4 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all">
            {groupedAssignments.COMPLETED.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                {...assignment} 
                cta="View History"
                variant="ghost"
              />
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, subtitle, icon, count, accent, children }: any) {
  const accentColors: any = {
    primary: 'text-primary bg-primary/5 border-primary/10',
    amber: 'text-amber-600 bg-amber-500/5 border-amber-500/10',
    slate: 'text-slate-600 bg-slate-500/5 border-slate-500/10',
    emerald: 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10',
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-lg border ${accentColors[accent]}`}>
              {icon}
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{title} ({count})</h2>
          </div>
          <p className="text-[11px] font-bold text-muted-foreground/30 pl-8">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function AssignmentCard({
  code, subject, batch, title, pendingCount, overdueCount, appealWindow, resolvedCount, totalCount, shared, cta, variant = "default", onClick
}: any) {
  const progressPct = Math.round((resolvedCount / totalCount) * 100)
  
  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer hover:border-primary/20 transition-all border-border/20 bg-card/20 backdrop-blur-sm rounded-2xl p-4 flex flex-col shadow-none min-h-[220px]"
      onClick={onClick}
    >
      <div className="absolute top-4 right-4 z-10">
        {overdueCount > 0 ? (
          <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-red-500/20 text-red-600/70 bg-red-500/[0.04] rounded-md px-1.5 py-0">
            {overdueCount} Overdue
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-border/30 text-muted-foreground/60 rounded-md px-1.5 py-0">
             {appealWindow}
          </Badge>
        )}
      </div>

      <div className="space-y-3 flex-1 flex flex-col">
        <div>
          <div className="p-1.5 w-fit rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 border border-primary/10 mb-3">
            <BookOpen className="h-4 w-4" />
          </div>
          <h3 className="text-[14px] font-black tracking-tight line-clamp-1 text-[#1E293B]">{title}</h3>
          <div className="flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-muted-foreground/50 mt-0.5">
            {code} <span className="opacity-40">•</span> {subject} <span className="opacity-40">•</span> {batch}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between pt-3 border-t border-border/10">
            <div className="space-y-0.5">
              <span className="text-[6px] uppercase font-black tracking-widest text-muted-foreground/30">Workload</span>
              <div className="text-[10px] font-black text-foreground/80">{pendingCount} Pending</div>
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-[6px] uppercase font-black tracking-widest text-muted-foreground/30">Progress</span>
              <div className="text-[10px] font-black text-muted-foreground">{resolvedCount}/{totalCount}</div>
            </div>
          </div>

          <div className="space-y-1">
            <Progress value={progressPct} className="h-0.5 bg-primary/5" />
            <div className="flex items-center justify-between text-[6px] font-black uppercase tracking-widest text-muted-foreground/40">
              <span>{progressPct}% Resolved</span>
              <div className="flex items-center gap-1">
                 {shared && <Users className="h-2 w-2" />}
                 <span>{shared || ''}</span>
              </div>
            </div>
          </div>

          {cta && (
            <div className="flex items-center justify-end pt-1">
              <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-primary/70 group-hover:text-primary transition-colors">
                {cta}
                <ArrowRight className="h-2 w-2 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${overdueCount > 0 ? 'bg-red-500' : 'bg-primary'}`} />
    </Card>
  )
}
