"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  PlusCircle,
  ClipboardCheck,
  ArrowRight,
  GraduationCap,
  TrendingUp,
  Users,
  Search,
  Bell,
  PanelLeft,
  LayoutGrid,
  MousePointer2
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const kpis = [
    { label: "Total Papers", value: "3,500", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Evaluation Completed", value: "2,250", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Evaluation To Be Done", value: "1,250", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Avg Evaluation Time", value: "3.5 min", icon: MousePointer2, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Completion Rate", value: "96%", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
  ]

  return (
    <div className="space-y-10 p-2 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Welcome, Professor</h1>
        <p className="text-muted-foreground font-medium">Your evaluation ecosystem is performing at <span className="text-blue-600 font-bold">96% efficiency</span> this semester.</p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className={cn("p-2.5 w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform", kpi.bg)}>
                <kpi.icon className={cn("h-5 w-5", kpi.color)} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p>
                <p className="text-2xl font-black tracking-tighter text-[#1E293B]">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* Left Column: Active Evaluations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold tracking-tight text-[#1E293B]">Current active evaluations</h2>
            <Link href="/dashboard/evaluation">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground hover:text-primary gap-1">
                See all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* SE - Phase 2 (In Progress) */}
            <Card className="border-border/40 shadow-sm rounded-2xl bg-white/80 overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                      <h3 className="text-lg font-bold text-[#1E293B]">Software Engineering - Phase 2</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] px-2 uppercase">In Progress</Badge>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Authoring Identity Evaluation · Folder ID: #SE-2024-PH2</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Grading Progress</span>
                    <span className="text-[#1E293B]">53% · 24/45 Papers</span>
                  </div>
                  <Progress value={53} className="h-2.5 bg-muted/30" indicatorClassName="bg-blue-500" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Estimated time remaining: 45 min</span>
                  </div>
                  <Link href="/dashboard/evaluation/SWE-PH2/grading">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-blue-500/20">
                      Enter Desk
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* DB - Quiz 1 (Completed) */}
            <Card className="border-border/40 shadow-sm rounded-2xl bg-white/80 overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <h3 className="text-lg font-bold text-[#1E293B]">Database Systems - Quiz 1</h3>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 uppercase">Completed</Badge>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Final Validation · Folder ID: #DB-2024-Q1</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Grading Progress</span>
                    <span className="text-[#1E293B]">100% · 42/42 Papers</span>
                  </div>
                  <Progress value={100} className="h-2.5 bg-muted/30" indicatorClassName="bg-emerald-500" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>All papers verified</span>
                  </div>
                  <Link href="/dashboard/evaluation/results?id=DB-Q1">
                    <Button variant="outline" size="sm" className="font-bold px-8 rounded-xl border-border/60 hover:bg-muted/50">
                      View Insights
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Operations & Alerts */}
        <div className="space-y-10">
          {/* Operations */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">Operations</h2>
            <div className="space-y-3">
              <Link href="/dashboard/pre-evaluation" className="block">
                <Button className="w-full h-16 justify-between bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl px-6 group shadow-lg shadow-blue-500/10">
                  <div className="flex items-center gap-4">
                    <PlusCircle className="h-5 w-5 opacity-80" />
                    <span>Prepare Assignment</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
              </Link>
              <Link href="/dashboard/evaluation" className="block">
                <Button variant="outline" className="w-full h-16 justify-between border-border/40 hover:bg-muted/50 font-bold rounded-2xl px-6 group">
                  <div className="flex items-center gap-4 text-[#1E293B]">
                    <LayoutGrid className="h-5 w-5 opacity-40" />
                    <span>Assignments Hub</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
              </Link>
            </div>
          </div>

          {/* System Alerts */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">System Alerts</h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-5 rounded-2xl bg-[#FFF8EE] border border-[#FFE7C8]/50 shadow-sm">
                <div className="p-2.5 h-fit rounded-xl bg-amber-100 text-amber-700 shadow-sm shrink-0">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-amber-900 leading-tight">New Pattern Detected</p>
                  <p className="text-xs text-amber-800/70 font-medium leading-normal">60% of students in "Software Engineering" struggled with MVC Controller logic.</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-2xl bg-[#F0F7FF] border border-[#D1E9FF]/50 shadow-sm">
                <div className="p-2.5 h-fit rounded-xl bg-blue-100 text-blue-700 shadow-sm shrink-0">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-blue-900 leading-tight">Calibration Complete</p>
                  <p className="text-xs text-blue-800/70 font-medium leading-normal">Prompt strategy for "Database Systems" has been successfully refined based on your grading style.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
