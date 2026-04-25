"use client"

import { useState, use, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  Users,
  ShieldCheck,
  ArrowLeft,
  Download,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Search,
  MoreVertical,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

function ClassReportContent() {
  const searchParams = useSearchParams()
  const assignmentId = searchParams.get("id") || "SWE-PH2"
  const [sortBy, setSortBy] = useState<"score" | "name" | "grade">("score")
  
  // Dynamic mock data based on assignmentId
  const getMockData = (id: string) => {
    if (id === "DB-Q1") {
      return {
        title: "Database Queries - Quiz 1",
        students: 42,
        criteriaCount: 2,
        stats: [
          { label: "Class Average", value: "92%", sub: "42 students", icon: TrendingUp },
          { label: "Feedback Submitted", value: "42 / 42", sub: "100% complete", icon: CheckCircle2 },
          { label: "Integrity Flags", value: "1", sub: "1 flag flagged", icon: ShieldCheck },
          { label: "Criteria Assessed", value: "2", sub: "per submission", icon: BarChart3 },
        ],
        gradeDistribution: [
          { label: "A+ / A", range: "80 – 100", count: 28, color: "bg-[#2563EB]" },
          { label: "B+ / B", range: "60 – 79", count: 10, color: "bg-[#2563EB]" },
          { label: "C+ / C", range: "40 – 59", count: 3, color: "bg-[#2563EB]" },
          { label: "D+ / D", range: "20 – 39", count: 1, color: "bg-[#2563EB]" },
          { label: "E / F", range: "0 – 19", count: 0, color: "bg-[#2563EB]" },
        ],
        criteria: [
          { name: "SQL Syntax Accuracy", score: 4.8, total: 5 },
          { name: "Query Optimization", score: 4.2, total: 5 },
        ],
        roster: [
          { name: "Ananya Gupta", roll: "DB24-001", scores: ["5/5", "4/5", "4/5"], totalScore: "87%", grade: "A", status: "Pending", integrity: "pass" },
          { name: "Rahul Sharma", roll: "DB24-002", scores: ["4/5", "5/5", "4/5"], totalScore: "82%", grade: "A-", status: "Published", integrity: "pass" },
          { name: "Ishani Singh", roll: "DB24-003", scores: ["5/5", "5/5", "5/5"], totalScore: "96%", grade: "A+", status: "Published", integrity: "pass" },
          { name: "Aditya Verma", roll: "DB24-004", scores: ["3/5", "4/5", "3/5"], totalScore: "68%", grade: "B", status: "Pending", integrity: "flag" },
        ]
      }
    }
    
    // Default: Software Engineering - Phase 2
    return {
      title: "Software Engineering - Phase 2",
      students: 45,
      criteriaCount: 3,
      stats: [
        { label: "Class Average", value: "87%", sub: "45 students", icon: TrendingUp },
        { label: "Feedback Submitted", value: "45 / 45", sub: "100% complete", icon: CheckCircle2 },
        { label: "Integrity Flags", value: "0", sub: "Clean audit", icon: ShieldCheck },
        { label: "Criteria Assessed", value: "3", sub: "per submission", icon: BarChart3 },
      ],
      gradeDistribution: [
        { label: "A+ / A", range: "80 – 100", count: 18, color: "bg-[#2563EB]" },
        { label: "B+ / B", range: "60 – 79", count: 22, color: "bg-[#2563EB]" },
        { label: "C+ / C", range: "40 – 59", count: 4, color: "bg-[#2563EB]" },
        { label: "D+ / D", range: "20 – 39", count: 1, color: "bg-[#2563EB]" },
        { label: "E / F", range: "0 – 19", count: 0, color: "bg-[#2563EB]" },
      ],
      criteria: [
        { name: "Architecture Design", score: 4.5, total: 5 },
        { name: "Code Quality", score: 4.2, total: 5 },
        { name: "Documentation", score: 4.8, total: 5 },
      ],
      roster: [
        { name: "Siddharth Malhotra", roll: "SE24-012", scores: ["4/5", "5/5", "4/5"], totalScore: "88%", grade: "A", status: "Published", integrity: "pass" },
        { name: "Kiara Advani", roll: "SE24-015", scores: ["5/5", "4/5", "5/5"], totalScore: "92%", grade: "A+", status: "Pending", integrity: "pass" },
        { name: "Varun Dhawan", roll: "SE24-018", scores: ["3/5", "4/5", "4/5"], totalScore: "75%", grade: "B+", status: "Published", integrity: "pass" },
        { name: "Alia Bhatt", roll: "SE24-021", scores: ["5/5", "5/5", "4/5"], totalScore: "94%", grade: "A+", status: "Pending", integrity: "pass" },
      ]
    }
  }

  const data = getMockData(assignmentId)

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
              {data.title} <span className="text-border">·</span> {data.students} Students <span className="text-border">·</span> {data.criteriaCount} Criteria
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
          {data.stats.map((stat) => (
            <Card key={stat.label} className="border border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-bold text-muted-foreground/60 tracking-wide uppercase">{stat.label}</p>
                  <stat.icon className="h-4 w-4 text-blue-500/40" />
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
                  {data.students} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              {data.gradeDistribution.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1E293B]">{item.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground/40">{item.range}</span>
                      <span className="text-[#1E293B] tabular-nums">{item.count}</span>
                    </div>
                  </div>
                  <div className="h-6 w-full bg-muted/20 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                      style={{ width: `${(item.count / data.students) * 100}%` }}
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
              {data.criteria.map((crit) => (
                <div key={crit.name} className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1E293B]">{crit.name}</span>
                    <span className="text-[#1E293B] tabular-nums">
                      {crit.score.toFixed(1)}<span className="text-muted-foreground/30 ml-0.5">/5</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1E3A8A] rounded-full transition-all duration-1000" 
                        style={{ width: `${(crit.score / crit.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/30 italic">Target: 4.0+</p>
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
              <p className="text-xs font-bold text-muted-foreground/40 tracking-wide uppercase">{data.students} Students · {data.students} Submitted</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mr-2">Sort</span>
              {["score", "name", "grade"].map((sort) => (
                <Button
                  key={sort}
                  variant={sortBy === sort ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(sort as any)}
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
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">C1</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">C2</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">C3</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Score</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Grade</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {data.roster.map((student, idx) => (
                    <tr key={student.roll} className="hover:bg-muted/10 transition-colors">
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
                      <td className="px-4 py-5 text-[11px] font-black text-[#1E293B] tabular-nums">{student.scores[0]}</td>
                      <td className="px-4 py-5 text-[11px] font-black text-[#1E293B] tabular-nums">{student.scores[1]}</td>
                      <td className="px-4 py-5 text-[11px] font-black text-[#1E293B] tabular-nums">{student.scores[2] || "—"}</td>
                      <td className="px-4 py-5 text-[13px] font-black text-[#1E293B] tabular-nums">{student.totalScore}</td>
                      <td className="px-4 py-5 text-center">
                        <Badge variant="outline" className="h-6 w-6 rounded-md p-0 flex items-center justify-center bg-emerald-50 text-emerald-600 border-emerald-200 font-bold text-[10px]">
                          {student.grade}
                        </Badge>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <Badge variant="secondary" className={cn(
                          "h-6 px-3 rounded-full font-bold text-[9px] uppercase tracking-widest",
                          student.status === "Published" ? "bg-emerald-500/5 text-emerald-600 border border-emerald-500/10" : "bg-muted text-muted-foreground"
                        )}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center">
                          {student.integrity === "pass" ? (
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ClassReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Report...</div>}>
      <ClassReportContent />
    </Suspense>
  )
}
