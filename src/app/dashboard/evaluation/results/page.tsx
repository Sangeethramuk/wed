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
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

function ClassReportContent() {
  const searchParams = useSearchParams()
  const assignmentId = searchParams.get("id") || "SWE-PH2"
  
  // Mock data matching the screenshot
  const assignmentTitle = assignmentId === "DB-Q1" ? "Database Queries - Quiz 1" : "Software Engineering - Phase 2"
  const stats = [
    { label: "Class Average", value: "87%", sub: "1 students", icon: TrendingUp },
    { label: "Feedback Submitted", value: "0 / 1", sub: "0% complete", icon: CheckCircle2 },
    { label: "Integrity Flags", value: "0", sub: "Clean audit", icon: ShieldCheck },
    { label: "Criteria Assessed", value: "3", sub: "per submission", icon: BarChart3 },
  ]

  const gradeDistribution = [
    { label: "A+ / A", range: "80 – 100", count: 1, color: "bg-[#2563EB]" },
    { label: "B+ / B", range: "60 – 79", count: 0, color: "bg-[#2563EB]" },
    { label: "C+ / C", range: "40 – 59", count: 0, color: "bg-[#2563EB]" },
    { label: "D+ / D", range: "20 – 39", count: 0, color: "bg-[#2563EB]" },
    { label: "E / F", range: "0 – 19", count: 0, color: "bg-[#2563EB]" },
  ]

  const criteriaAverages = [
    { name: "Normal Form Analysis", score: 5.0, total: 5 },
    { name: "ER Diagram Accuracy", score: 4.0, total: 5 },
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

      <div className="max-w-7xl mx-auto px-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Class Report</h1>
              <Badge variant="outline" className="bg-[#E2F5EE] text-[#10B981] border-none font-bold px-3 py-0.5 rounded-full text-xs">
                Evaluation Complete
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              {assignmentTitle} <span className="text-border">·</span> 1 Students <span className="text-border">·</span> 3 Criteria
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
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
                  1 Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              {gradeDistribution.map((item) => (
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
                      style={{ width: item.count > 0 ? '100%' : '0%' }}
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
              {criteriaAverages.map((crit) => (
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
                    <p className="text-[10px] font-bold text-muted-foreground/30 italic">No feedback yet</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
