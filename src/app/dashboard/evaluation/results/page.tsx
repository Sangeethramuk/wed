"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useGradingStore } from "@/lib/store/grading-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ArrowLeft, Download, Users, TrendingUp, ShieldCheck, CheckCircle2,
  AlertTriangle, Sparkles, BarChart3, ArrowRight, FileText,
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
  if (grade.startsWith("A")) return "bg-green-50 text-green-700 border-green-200"
  if (grade.startsWith("B")) return "bg-blue-50 text-blue-700 border-blue-200"
  if (grade.startsWith("C")) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-red-50 text-red-700 border-red-200"
}

function barColor(pct: number): string {
  if (pct >= 80) return "bg-primary"
  if (pct >= 60) return "bg-primary/70"
  if (pct >= 40) return "bg-amber-400"
  return "bg-red-400"
}

// ── Grade distribution bands ──────────────────────────────────────────────────

const BANDS = [
  { label: "A+ / A", range: "80 – 100", min: 80, max: 101, color: "bg-primary" },
  { label: "B+ / B", range: "60 – 79",  min: 60, max: 80,  color: "bg-primary/70" },
  { label: "C+ / C", range: "40 – 59",  min: 40, max: 60,  color: "bg-amber-400" },
  { label: "F",      range: "< 40",     min: 0,  max: 40,  color: "bg-red-400" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvaluationResults() {
  const router = useRouter()
  const { assignments, currentAssignmentId, criterionFeedbacks, overallFeedback } = useGradingStore()
  const [sortBy, setSortBy] = useState<"score" | "name" | "grade">("score")

  // Resolve assignment — fall back to first available if navigate directly
  const assignmentId = currentAssignmentId ?? Object.keys(assignments)[0] ?? null
  const assignment   = assignmentId ? assignments[assignmentId] : null
  const students     = assignment?.students ?? []

  // ── Per-student computed row ─────────────────────────────────────────────────
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

  // ── Sorted roster ────────────────────────────────────────────────────────────
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    if (sortBy === "name")  return a.student.name.localeCompare(b.student.name)
    if (sortBy === "grade") return b.scorePct - a.scorePct
    return b.scorePct - a.scorePct
  }), [rows, sortBy])

  // ── Class aggregates ─────────────────────────────────────────────────────────
  const classAvg       = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.scorePct, 0) / rows.length) : 0
  const submittedCount = rows.filter(r => r.submitted).length
  const flaggedCount   = rows.filter(r => r.flagged).length
  const completionPct  = rows.length > 0 ? Math.round((submittedCount / rows.length) * 100) : 0

  // ── Grade distribution ───────────────────────────────────────────────────────
  const distribution = BANDS.map(b => ({
    ...b,
    count: rows.filter(r => r.scorePct >= b.min && r.scorePct < b.max).length,
  }))
  const maxCount = Math.max(...distribution.map(d => d.count), 1)

  // ── Per-criterion stats ──────────────────────────────────────────────────────
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

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-3xl bg-muted/30 flex items-center justify-center">
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

  return (
    <div className="max-w-7xl mx-auto py-10 px-8 space-y-10 font-sans select-none animate-in fade-in duration-500">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/40">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/evaluation")}
          >
            <ArrowLeft />
            Back to evaluation
          </Button>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black tracking-tight text-foreground">Class Report</h1>
              <Badge variant="outline" className="eyebrow h-5 px-2 bg-green-50 text-green-700 border-green-200 rounded-full">
                Evaluation Complete
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {assignment.title} · {students.length} Students · {criterionIds.length} Criteria
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download /> Export report
          </Button>
          <Link href="/dashboard/post-evaluation">
            <Button>
              <Sparkles className="h-4 w-4" /> Publish outcomes
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {([
          {
            label: "Class Average",
            value: `${classAvg}%`,
            sub: `${students.length} students`,
            icon: TrendingUp,
            highlight: false,
          },
          {
            label: "Feedback Submitted",
            value: `${submittedCount} / ${students.length}`,
            sub: `${completionPct}% complete`,
            icon: CheckCircle2,
            highlight: false,
          },
          {
            label: "Integrity Flags",
            value: String(flaggedCount),
            sub: flaggedCount === 0 ? "Clean audit" : "Require review",
            icon: ShieldCheck,
            highlight: flaggedCount > 0,
          },
          {
            label: "Criteria Assessed",
            value: String(criterionIds.length),
            sub: "per submission",
            icon: BarChart3,
            highlight: false,
          },
        ] as const).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="p-6 bg-background border border-border/40 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.02)]"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="eyebrow text-muted-foreground/40">{stat.label}</span>
              <stat.icon className={cn("h-4 w-4 opacity-60", stat.highlight ? "text-amber-500" : "text-primary")} />
            </div>
            <div className="text-3xl font-black tracking-tighter tabular-nums text-foreground">{stat.value}</div>
            <div className={cn("eyebrow mt-1", stat.highlight ? "text-amber-600" : "text-muted-foreground/50")}>
              {stat.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Grade distribution — horizontal bars */}
        <Card className="lg:col-span-2 border-border/40 rounded-[28px] overflow-hidden bg-background shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
          <CardHeader className="p-6 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-extrabold tracking-tight">Grade Distribution</CardTitle>
              <CardDescription className="eyebrow text-muted-foreground/40 mt-1">
                Cohort Performance Spread
              </CardDescription>
            </div>
            <Badge variant="outline" className="eyebrow border-border/30 rounded-full">
              {students.length} Total
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {distribution.map((band, i) => (
              <div key={band.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground tracking-tight">{band.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground/40">{band.range}</span>
                    <span className="text-xs font-black text-foreground tabular-nums w-5 text-right">{band.count}</span>
                  </div>
                </div>
                <div className="h-9 bg-muted/20 rounded-xl overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: band.count > 0 ? `${(band.count / maxCount) * 100}%` : "4px" }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("h-full rounded-xl", band.color)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Per-criterion averages */}
        <Card className="border-border/40 rounded-[28px] overflow-hidden bg-background shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
          <CardHeader className="p-6 border-b border-border/10 bg-muted/5">
            <CardTitle className="text-lg font-extrabold tracking-tight">Criterion Averages</CardTitle>
            <CardDescription className="eyebrow text-muted-foreground/40 mt-1">
              Per Standard · Out of 5
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {criterionStats.length > 0 ? criterionStats.map((cs, i) => (
              <div key={cs.cid} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-foreground leading-snug">{cs.name}</span>
                  <span className="text-xs font-black tabular-nums text-foreground shrink-0">
                    {cs.avg.toFixed(1)}<span className="text-muted-foreground/30 text-xs">/5</span>
                  </span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cs.avgPct}%` }}
                    transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
                    className={cn("h-full rounded-full", barColor(cs.avgPct))}
                  />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {(Object.entries(cs.tierCounts) as [string, number][])
                    .filter(([, n]) => n > 0)
                    .map(([tier, n]) => (
                      <span
                        key={tier}
                        className={cn(
                          "eyebrow px-1.5 py-0.5 rounded-sm",
                          tier === "perfect" ? "bg-green-50 text-green-700" :
                          tier === "minor"   ? "bg-blue-50 text-blue-700" :
                          tier === "gap"     ? "bg-amber-50 text-amber-700" :
                                              "bg-red-50 text-red-700"
                        )}
                      >
                        {n} {tier}
                      </span>
                    ))}
                  {Object.values(cs.tierCounts).every(v => v === 0) && (
                    <span className="text-xs font-bold text-muted-foreground/40">No feedback yet</span>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground/40 text-center py-6">No criteria data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Full cohort roster ───────────────────────────────────────────────── */}
      <Card className="border-border/40 rounded-[28px] overflow-hidden bg-background shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
        <CardHeader className="p-6 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-lg font-extrabold tracking-tight">Full Cohort Roster</CardTitle>
            <CardDescription className="eyebrow text-muted-foreground/40 mt-1">
              {students.length} Students · {submittedCount} Submitted
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="eyebrow text-muted-foreground/40 mr-1">Sort</span>
            {(["score", "name", "grade"] as const).map(s => (
              <Button
                key={s}
                size="sm"
                variant={sortBy === s ? "default" : "ghost"}
                onClick={() => setSortBy(s)}
                className={cn(
                  "eyebrow h-7 px-3 rounded-lg",
                  sortBy !== s && "border border-border/40"
                )}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/20 border-b border-border/10">
                <tr>
                  <th className="eyebrow px-6 py-4 text-muted-foreground/50">#</th>
                  <th className="eyebrow px-6 py-4 text-muted-foreground/50">Student</th>
                  <th className="eyebrow px-6 py-4 text-muted-foreground/50">Roll No.</th>
                  {criterionIds.map(cid => (
                    <th key={cid} className="eyebrow px-4 py-4 text-muted-foreground/50 text-center">
                      {cid.toUpperCase()}
                    </th>
                  ))}
                  <th className="eyebrow px-6 py-4 text-muted-foreground/50 text-center">Score</th>
                  <th className="eyebrow px-6 py-4 text-muted-foreground/50 text-center">Grade</th>
                  <th className="eyebrow px-6 py-4 text-muted-foreground/50 text-center">Status</th>
                  <th className="eyebrow px-6 py-4 text-muted-foreground/50 text-center">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {sorted.map(({ student, scorePct, grade, submitted, flagged, levelMap }, idx) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.025, 0.5) }}
                    className="hover:bg-muted/5 transition-colors group"
                  >
                    {/* # */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-muted-foreground/25 tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {/* Student name + avatar */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-muted group-hover:bg-primary/5 transition-colors flex items-center justify-center text-xs font-black text-muted-foreground group-hover:text-primary shrink-0">
                          {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-xs font-extrabold text-foreground tracking-tight whitespace-nowrap">{student.name}</span>
                      </div>
                    </td>

                    {/* Roll */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono font-bold text-muted-foreground/50">{student.roll}</span>
                    </td>

                    {/* Criterion levels */}
                    {criterionIds.map(cid => (
                      <td key={cid} className="px-4 py-5 text-center">
                        <span className="text-xs font-bold tabular-nums text-foreground/70">
                          {levelMap[cid] ?? "—"}
                        </span>
                        {levelMap[cid] !== undefined && (
                          <span className="text-xs text-muted-foreground/30">/5</span>
                        )}
                      </td>
                    ))}

                    {/* Score % */}
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-black tabular-nums text-foreground">{scorePct}%</span>
                    </td>

                    {/* Grade badge */}
                    <td className="px-6 py-5 text-center">
                      <Badge
                        variant="outline"
                        className={cn("eyebrow h-5 px-2 rounded-full", gradeColorClass(grade))}
                      >
                        {grade}
                      </Badge>
                    </td>

                    {/* Submission status */}
                    <td className="px-6 py-5 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "eyebrow h-5 px-2 rounded-full",
                          submitted
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-muted/40 text-muted-foreground border-border/40"
                        )}
                      >
                        {submitted ? "Done" : "Pending"}
                      </Badge>
                    </td>

                    {/* Integrity */}
                    <td className="px-6 py-5 text-center">
                      {flagged ? (
                        <div className="flex items-center justify-center gap-1 text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="eyebrow">{student.status}</span>
                        </div>
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mx-auto" />
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {sorted.length === 0 && (
              <div className="py-20 text-center">
                <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="eyebrow text-muted-foreground/30">No student data</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-12">
        <p className="eyebrow text-muted-foreground/30">
          EducAItors · Evaluation Complete · {assignment.title}
        </p>
        <Link
          href="/dashboard/post-evaluation"
          className="eyebrow inline-flex items-center gap-2 h-9 px-3 text-muted-foreground hover:text-foreground rounded-xl transition-colors"
        >
          Full Insights <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  )
}
