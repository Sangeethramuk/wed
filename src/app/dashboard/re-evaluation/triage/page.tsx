"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Download, 
  ChevronRight, 
  Search, 
  Filter, 
  ChevronDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  BarChart3,
  BookOpen
} from 'lucide-react'
import { STUDENTS, STUDENT_ORDER, ageStatusKind } from '@/lib/data/re-evaluation-data'
import { useReEvalStore } from '@/lib/store/re-evaluation-store'
import { BriefingModal } from '@/components/re-evaluation/briefing-modal'
import { ReEvalAnalytics } from '@/components/re-evaluation/analytics-view'
import { AuditTrailView } from '@/components/re-evaluation/audit-trail-view'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { statusStyles, type StatusKey } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const TOTAL = 7
const INITIAL_RESOLVED = 12

const CONCERN_KINDS: Record<'red' | 'orange' | 'blue', StatusKey> = {
  red: 'error',
  orange: 'warning',
  blue: 'info',
}

export default function ReEvaluationPage() {
  const router = useRouter()
  const { resolvedIds, hodPendingIds, getStatus } = useReEvalStore()
  const [tab, setTab] = useState<'submissions' | 'analytics'>('submissions')
  const [briefingId, setBriefingId] = useState<string | null>(null)

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [submissionFilter, setSubmissionFilter] = useState("All Concerns")
  const [courseFilter, setCourseFilter] = useState("All Courses")

  const pendingCount = TOTAL - resolvedIds.length - hodPendingIds.length
  const resolvedCount = INITIAL_RESOLVED + resolvedIds.length
  const hodCount = hodPendingIds.length

  const GLOBAL_KPIS = [
    { label: 'Academic Load', value: `${pendingCount + 10} Items`, subtext: 'Total across portfolio', icon: Clock, accent: '#1F4E8C' },
    { label: 'Integrity Risk', value: `2 Critical`, subtext: 'Border-fail cases', icon: AlertTriangle, accent: '#EF4444' },
  ]

  const orderedStudents = [
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'pending'),
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'hod'),
    ...STUDENT_ORDER.filter((id) => getStatus(id) === 'resolved'),
  ]

  const filteredStudents = useMemo(() => {
    return orderedStudents.filter(id => {
      const st = STUDENTS[id]
      const status = getStatus(id)
      
      // Search
      const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            st.rollId.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      // Status Filter
      if (statusFilter !== "All Status") {
        if (statusFilter === "Pending" && status !== 'pending') return false
        if (statusFilter === "Awaiting HOD" && status !== 'hod') return false
        if (statusFilter === "Resolved" && status !== 'resolved') return false
      }

      // Course Filter
      if (courseFilter !== "All Courses") {
        if (st.assign.split(' ')[0] !== courseFilter) return false
      }

      // Concern Filter
      if (submissionFilter !== "All Concerns") {
        if (st.concernType !== submissionFilter) return false
      }

      return true
    })
  }, [searchQuery, statusFilter, submissionFilter, courseFilter, hodPendingIds, resolvedIds])

  return (
    <div className="space-y-8 pb-20 -m-6 p-6 min-h-[calc(100svh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ backgroundColor: '#F8F9FA' }}>
      
      {/* Metadata Panel */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Institutional Oversight • Quality Assurance
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            Departmental Review Queue
          </h1>
          <p className="text-sm md:text-base text-slate-500 leading-relaxed italic">
            Standardizing evaluation integrity across <b>DSA</b>, <b>OS</b>, and <b>DBMS</b>. Use departmental filters to isolate pedagogical friction points.
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <BookOpen className="h-3.5 w-3.5" />
              Active Portfolio: <span className="text-slate-900 font-bold">3 Courses</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Quality Compliance: <span className="text-emerald-600 font-bold">92% SLA</span>
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="h-11 border-slate-200 bg-white shadow-sm text-slate-600 gap-2 font-semibold">
          <Download className="size-4" />
          Export Audit Trail
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {[
          { id: 'submissions', label: 'Review Queue' },
          { id: 'analytics', label: 'Academic Insights' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "px-0 py-3 border-b-2 text-xs font-semibold tracking-wider transition-colors -mb-px",
              tab === t.id 
                ? "border-[#1F4E8C] text-slate-900" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        {tab === 'submissions' && (
          <>
            {/* KPI Row: High Fidelity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {GLOBAL_KPIS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-col h-full justify-between gap-3">
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{stat.label}</p>
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${stat.accent}10` }}>
                        <stat.icon className="h-4 w-4" style={{ color: stat.accent }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold tracking-tight text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500 font-medium">{stat.subtext}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters + Table Container */}
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by student, roll no, or course..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 bg-white border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="outline" className="h-10 border-slate-200 bg-white text-slate-600 gap-2 rounded-lg text-sm font-medium">
                          Course: {courseFilter.replace("All ", "")}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      {["All Courses", "DSA", "OS", "DBMS"].map((s) => (
                        <DropdownMenuItem key={s} onClick={() => setCourseFilter(s)}>{s}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="outline" className="h-10 border-slate-200 bg-white text-slate-600 gap-2 rounded-lg text-sm font-medium">
                          <Filter className="h-4 w-4 text-slate-400" />
                          Status: {statusFilter.replace("All ", "")}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      {["All Status", "Pending", "Awaiting HOD", "Resolved"].map((s) => (
                        <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>{s}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</TableHead>
                      <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Course · Criterion</TableHead>
                      <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Submitted</TableHead>
                      <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</TableHead>
                      <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Concern</TableHead>
                      <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-20 text-center text-slate-400 text-sm font-medium">
                          No students match your portfolio filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((id) => {
                        const st = STUDENTS[id]
                        const status = getStatus(id)
                        const concernKind = CONCERN_KINDS[st.concernVariant as keyof typeof CONCERN_KINDS] ?? 'neutral'
                        
                        if (status === 'resolved') {
                          return (
                            <TableRow key={id} className="bg-emerald-50/20">
                              <TableCell colSpan={6} className="py-4 px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-700">
                                        <div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                            <CheckCircle2 className="size-3" />
                                        </div>
                                        {st.name} ({st.rollId}) · Resolved · {st.assign}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score: {st.origScore}/{st.maxScore}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        }

                        if (status === 'hod') {
                          return (
                            <TableRow key={id} className="bg-amber-50/20">
                              <TableCell colSpan={6} className="py-4 px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-amber-700">
                                        <div className="size-5 rounded-full bg-amber-500 flex items-center justify-center text-white">
                                            <Layers className="size-3" />
                                        </div>
                                        {st.name} ({st.rollId}) · Awaiting HOD Approval · {st.assign}
                                    </div>
                                    <button
                                        onClick={() => router.push(`/dashboard/re-evaluation/${id}`)}
                                        className="px-3 py-1 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-amber-600 transition-colors"
                                    >
                                        View →
                                    </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        }

                        return (
                          <TableRow 
                            key={id} 
                            className="group hover:bg-slate-50/50 border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                            onClick={() => setBriefingId(id)}
                          >
                            <TableCell className="py-4 px-6">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#1F4E8C] transition-colors">{st.name}</span>
                                    {(st.origScore === 4 || st.origScore === 3 || st.origScore === 9) && (
                                        <TooltipProvider>
                                            <Tooltip>
                                        <TooltipTrigger
                                          render={
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 border border-red-100 text-[9px] font-black uppercase tracking-widest text-red-600">
                                                High Stakes
                                            </div>
                                          }
                                        />
                                                <TooltipContent className="bg-slate-900 text-white border-none p-2 rounded-lg shadow-xl">
                                                    <p className="text-[10px] font-medium leading-relaxed">
                                                        Border Case: Score change here may affect <br /> 
                                                        Pass/Fail status or Grade Boundary.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-tighter">{st.rollId}</span>
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-6">
                               <div className="flex flex-col gap-1">
                                  <span className="text-xs font-bold text-slate-900">{st.assign.split(' ').slice(0, 2).join(' ')}</span>
                                  <span className="eyebrow text-[9px] font-black text-[#1F4E8C] uppercase tracking-widest">{st.critShort}</span>
                               </div>
                            </TableCell>
                            
                            <TableCell className="py-4 px-6">
                              <div className="flex flex-col items-center gap-0.5">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <div className={cn("text-xs font-semibold", st.ageStatus === 'overdue' ? "text-amber-600" : "text-slate-600")}>
                                          {st.ageLabel}
                                        </div>
                                      }
                                    />
                                    <TooltipContent>
                                      {st.ageStatus === 'overdue' ? 'Action required immediately' : 'Within normal timeframe'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                    {st.ageStatus === 'overdue' ? 'Overdue' : 'Pending'}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-6">
                              <div className="flex justify-center">
                                <StatusPill status={status} ageStatus={st.ageStatus} />
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-6">
                              <div className="flex justify-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full border cursor-help transition-all",
                                            st.concernVariant === 'red' ? "bg-red-50 text-red-700 border-red-100" :
                                            st.concernVariant === 'orange' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                            "bg-blue-50 text-blue-700 border-blue-100"
                                        )}>
                                          <AlertTriangle className="h-3 w-3" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">{st.concernType}</span>
                                        </div>
                                      }
                                    />
                                    <TooltipContent side="right" className="p-3 bg-white border border-slate-200 shadow-xl rounded-lg max-w-xs">
                                      <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Reasoning</p>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">"{st.sv}"</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>

                            <TableCell className="py-4 px-6 text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="text-sm font-bold text-slate-900">{st.origScore}<span className="text-slate-300 font-medium">/{st.maxScore}</span></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {tab === 'analytics' && <ReEvalAnalytics />}
      </div>

      {/* Briefing modal */}
      {briefingId && (
        <BriefingModal
          studentId={briefingId}
          onClose={() => setBriefingId(null)}
          onStart={() => {
            router.push(`/dashboard/re-evaluation/${briefingId}`)
          }}
        />
      )}
    </div>
  )
}

function StatusPill({ status, ageStatus }: { status: 'pending' | 'hod' | 'resolved'; ageStatus: string }) {
  const base = "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-none"
  if (ageStatus === 'overdue') {
    return <Badge className={cn(base, "bg-amber-50 text-amber-700 border-amber-100")}>In Progress</Badge>
  }
  return <Badge variant="secondary" className={cn(base, "bg-slate-50 text-slate-500 border-slate-100")}>In Queue</Badge>
}
