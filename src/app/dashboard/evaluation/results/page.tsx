"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useGradingStore } from "@/lib/store/grading-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft, Download, Users, TrendingUp, ShieldCheck, CheckCircle2,
  AlertTriangle, Sparkles, BarChart3, ArrowRight, FileText, Search, MoreVertical, Check
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Grade helpers ──────────────────────────────────────────────────────────────

function getGrade(pct: number): string {
  if (pct >= 90) return "A+"
  if (pct >= 80) return "A"
  if (pct >= 70) return "B+"
  if (pct >= 60) return "B"
  if (pct >= 50) return "C+"
  if (pct >= 40) return "C"
  return "F"
}

function gradeColorClass(grade: string): string {
  if (grade.startsWith("A")) return "bg-[color:var(--status-success-bg)] text-[color:var(--status-success)] border-[color:var(--status-success)]/30"
  if (grade.startsWith("B")) return "bg-[color:var(--status-info-bg)] text-[color:var(--status-info)] border-[color:var(--status-info)]/30"
  if (grade.startsWith("C")) return "bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30"
  return "bg-[color:var(--status-error-bg)] text-[color:var(--status-error)] border-[color:var(--status-error)]/30"
}

function barColor(pct: number): string {
  if (pct >= 80) return "bg-[#2563EB]"
  if (pct >= 60) return "bg-[#2563EB]/70"
  if (pct >= 40) return "bg-amber-500"
  return "bg-destructive"
}

// ── Grade distribution bands ──────────────────────────────────────────────────

const BANDS = [
  { label: "A+ / A", range: "80 – 100", min: 80, max: 101, color: "bg-[#2563EB]" },
  { label: "B+ / B", range: "60 – 79",  min: 60, max: 80,  color: "bg-[#2563EB]/80" },
  { label: "C+ / C", range: "40 – 59",  min: 40, max: 60,  color: "bg-amber-500" },
  { label: "D+ / D", range: "20 – 39",  min: 20, max: 40,  color: "bg-orange-500" },
  { label: "E / F",  range: "0 – 19",   min: 0,  max: 20,  color: "bg-destructive" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvaluationResultsPage() {
  return (
    <Suspense fallback={null}>
      <EvaluationResults />
    </Suspense>
  )
}

function EvaluationResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { assignments, currentAssignmentId, criterionFeedbacks, overallFeedback } = useGradingStore()
  const [sortBy, setSortBy] = useState<"score" | "name" | "grade">("score")

  const idFromQuery = searchParams.get("id")
  const assignmentId =
    (idFromQuery && assignments[idFromQuery] ? idFromQuery : null)
    ?? currentAssignmentId
    ?? Object.keys(assignments)[0]
    ?? null
  const assignment   = assignmentId ? assignments[assignmentId] : null
  const students     = assignment?.students ?? []

  const rows = useMemo(() => students.map(student => {
    const criteriaList = Object.values(student.criteria)
    const avgLevel  = criteriaList.length > 0
      ? criteriaList.reduce((s, c) => s + c.level, 0) / criteriaList.length
      : 0
    const scorePct  = Math.round((avgLevel / 5) * 100)
    const grade     = getGrade(scorePct)
    const submitted = overallFeedback[student.id]?.isSubmitted ?? false
    const flagged   = student.status !== "clean"
    const levelMap  = Object.fromEntries(criteriaList.map(c => [c.id, c.level]))
    return { student, avgLevel, scorePct, grade, submitted, flagged, levelMap, criteriaList }
  }), [students, overallFeedback])

  const sorted = useMemo(() => [...rows].sort((a, b) => {
    if (sortBy === "name")  return a.student.name.localeCompare(b.student.name)
    if (sortBy === "grade") return b.scorePct - a.scorePct
    return b.scorePct - a.scorePct
  }), [rows, sortBy])

  const classAvg       = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.scorePct, 0) / rows.length) : 0
  const submittedCount = rows.filter(r => r.submitted).length
  const flaggedCount   = rows.filter(r => r.flagged).length
  const completionPct  = rows.length > 0 ? Math.round((submittedCount / rows.length) * 100) : 0

  const distribution = BANDS.map(b => ({
    ...b,
    count: rows.filter(r => r.scorePct >= b.min && r.scorePct < b.max).length,
  }))
  const maxCount = Math.max(...distribution.map(d => d.count), 1)

  const criterionIds  = students.length > 0 ? Object.keys(students[0].criteria) : []
  const criterionStats = criterionIds.map(cid => {
    const levels = rows.map(r => r.levelMap[cid] ?? 0)
    const avg    = levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : 0
    const name   = students[0]?.criteria[cid]?.name ?? cid.toUpperCase()
    const tierCounts = { perfect: 0, minor: 0, gap: 0, major: 0 } as Record<string, number>
    rows.forEach(r => {
      const tier = criterionFeedbacks[r.student.id]?.[cid]?.tier
      if (tier) tierCounts[tier] = (tierCounts[tier] ?? 0) + 1
    })
    return { cid, name, avg, avgPct: Math.round((avg / 5) * 100), tierCounts }
  })

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
          <FileText className="w-7 h-7 text-muted-foreground/30" />
        </div>
        <div className="text-center space-y-2">
          <p className="eyebrow text-muted-foreground/40">No Evaluation Data</p>
          <p className="text-sm font-medium text-muted-foreground">Complete an evaluation first to see the class report.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/evaluation")} variant="outline">
          <ArrowLeft /> Back to Evaluation
        </Button>
      </div>
    )
  }

  const stats = [
    { label: "Class Average", value: `${classAvg}%`, sub: `${students.length} students`, icon: TrendingUp },
    { label: "Feedback Submitted", value: `${submittedCount} / ${students.length}`, sub: `${completionPct}% complete`, icon: CheckCircle2 },
    { label: "Integrity Flags", value: String(flaggedCount), sub: flaggedCount === 0 ? "Clean audit" : "Require review", icon: ShieldCheck },
    { label: "Criteria Assessed", value: String(criterionIds.length), sub: "per submission", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]/50 pb-20">
      {/* Top Breadcrumb/Nav */}
      <div className="max-w-7xl mx-auto px-8 pt-8 mb-6">
        <Link href="/dashboard/evaluation">
          <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground transition-colors group h-8 gap-2">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">Back to evaluation</span>
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-12">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Class Report</h1>
              <Badge variant="outline" className="bg-[#E2F5EE] text-[#10B981] border-none font-bold px-3 py-0.5 rounded-full text-xs">
                Evaluation Complete
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              {assignment.title} <span className="text-border">·</span> {students.length} Students <span className="text-border">·</span> {criterionIds.length} Criteria
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-6 border-border/60 bg-white hover:bg-muted/50 text-sm font-bold text-[#1E293B] shadow-sm rounded-xl gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              Export report
            </Button>
            <Link href={`/dashboard/evaluation/publish?id=${assignmentId}`}>
              <Button className="h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-bold shadow-lg shadow-blue-500/20 rounded-xl gap-2">
                <Sparkles className="h-4 w-4" />
                Publish outcomes
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-bold text-muted-foreground/60 tracking-wide uppercase">{stat.label}</p>
                  <stat.icon className={cn("h-4 w-4", stat.label === "Integrity Flags" && flaggedCount > 0 ? "text-amber-500" : "text-blue-500/40")} />
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-black tracking-tighter text-[#1E293B]">{stat.value}</p>
                  <p className="text-xs font-bold text-muted-foreground/40">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grade Distribution */}
          <Card className="lg:col-span-2 border border-border/40 shadow-sm rounded-3xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-[#1E293B] tracking-tight">Grade Distribution</CardTitle>
                  <p className="text-xs font-bold text-muted-foreground/40 tracking-wide uppercase mt-1">Cohort Performance Spread</p>
                </div>
                <Badge variant="outline" className="bg-muted/30 border-none font-bold text-[10px] px-3 h-6">
                  {students.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              {distribution.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1E293B]">{item.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground/40">{item.range}</span>
                      <span className="text-[#1E293B] tabular-nums">{item.count}</span>
                    </div>
                  </div>
                  <div className="h-6 w-full bg-muted/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / Math.max(students.length, 1)) * 100}%` }}
                      className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Criterion Averages */}
          <Card className="border border-border/40 shadow-sm rounded-3xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black text-[#1E293B] tracking-tight">Criterion Averages</CardTitle>
              <p className="text-xs font-bold text-muted-foreground/40 tracking-wide uppercase mt-1">Per Standard · Out of 5</p>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-10">
              {criterionStats.map((crit) => (
                <div key={crit.name} className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1E293B]">{crit.name}</span>
                    <span className="text-[#1E293B] tabular-nums">
                      {crit.avg.toFixed(1)}<span className="text-muted-foreground/30 ml-0.5">/5</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${crit.avgPct}%` }}
                        className={cn("h-full rounded-full transition-all duration-1000", barColor(crit.avgPct))} 
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(Object.entries(crit.tierCounts) as [string, number][])
                        .filter(([, n]) => n > 0)
                        .map(([tier, n]) => (
                          <span
                            key={tier}
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                              tier === "perfect" ? "bg-emerald-50 text-emerald-600" :
                              tier === "minor"   ? "bg-blue-50 text-blue-600" :
                              tier === "gap"     ? "bg-amber-50 text-amber-600" :
                                                  "bg-red-50 text-red-600"
                            )}
                          >
                            {n} {tier}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Full Cohort Roster */}
        <Card className="border border-border/40 shadow-sm rounded-3xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black text-[#1E293B] tracking-tight">Full Cohort Roster</CardTitle>
              <p className="text-xs font-bold text-muted-foreground/40 tracking-wide uppercase">{students.length} Students · {submittedCount} Submitted</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mr-2">Sort</span>
              {(["score", "name", "grade"] as const).map((sort) => (
                <Button
                  key={sort}
                  variant={sortBy === sort ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(sort)}
                  className={cn(
                    "h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    sortBy === sort ? "bg-[#2563EB] shadow-lg shadow-blue-500/20" : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  {sort}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/20 bg-muted/5">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 w-16">#</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Student</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Roll No.</th>
                    {criterionIds.map(cid => (
                      <th key={cid} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                        {cid.toUpperCase()}
                      </th>
                    ))}
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Score</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Grade</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {sorted.map(({ student, scorePct, grade, submitted, flagged, levelMap }, idx) => (
                    <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-muted-foreground/30 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-[10px] font-black text-[#1E293B] border border-border/10">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-[13px] font-bold text-[#1E293B]">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-[11px] font-bold text-muted-foreground/60 tracking-wider uppercase">{student.roll}</td>
                      {criterionIds.map(cid => (
                        <td key={cid} className="px-4 py-5 text-[11px] font-black text-[#1E293B] tabular-nums">
                          {levelMap[cid] ?? "—"}/5
                        </td>
                      ))}
                      <td className="px-4 py-5 text-[13px] font-black text-[#1E293B] tabular-nums">{scorePct}%</td>
                      <td className="px-4 py-5 text-center">
                        <Badge variant="outline" className={cn(
                          "h-6 w-8 rounded-md p-0 flex items-center justify-center font-bold text-[10px]",
                          gradeColorClass(grade)
                        )}>
                          {grade}
                        </Badge>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <Badge variant="secondary" className={cn(
                          "h-6 px-3 rounded-full font-bold text-[9px] uppercase tracking-widest",
                          submitted ? "bg-emerald-50 text-emerald-600 border border-emerald-500/10" : "bg-muted text-muted-foreground"
                        )}>
                          {submitted ? "Done" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center">
                          {!flagged ? (
                            <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-200 shadow-sm">
                              <Check className="h-3 w-3 stroke-[3px]" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-200 shadow-sm">
                              <ShieldCheck className="h-3 w-3 stroke-[3px]" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sorted.length === 0 && (
              <div className="py-20 text-center">
                <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="eyebrow text-muted-foreground/30">No student data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between pt-12">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
          EducAItors · Evaluation Complete · {assignment.title}
        </p>
        <Link
          href="/dashboard/post-evaluation"
          className="text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 h-9 px-4 text-muted-foreground hover:text-foreground transition-colors group"
        >
          Full Insights <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
