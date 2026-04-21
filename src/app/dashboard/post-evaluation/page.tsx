"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import {
  BarChart3,
  Users,
  ShieldCheck,
  ArrowLeft,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Zap,
  RefreshCw,
  ChevronRight,
  Lock,
  Clock,
  Settings2,
  Calendar,
  Sparkles,
  Command,
  ArrowRight,
  ArrowUpRight,
  Activity
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ResultInsights() {
  const [viewState, setViewState] = useState<"insights" | "release">("insights")
  const [isSyncing, setIsSyncing] = useState(false)
  const [releaseTiming, setReleaseTiming] = useState<"monday" | "immediate" | "custom">("monday")
  const [activeInterventions, setActiveInterventions] = useState<string[]>([])

  const distributionData = [
    { range: "90-100", count: 12, label: "Outstanding", color: "bg-primary" },
    { range: "80-89", count: 18, label: "Commendable", color: "bg-primary/80" },
    { range: "70-79", count: 8, label: "Satisfactory", color: "bg-primary/60" },
    { range: "60-69", count: 5, label: "Marginal", color: "bg-primary/40" },
    { range: "<60", count: 2, label: "Unsatisfactory", color: "bg-primary/20" },
  ]

  const maxCount = Math.max(...distributionData.map(d => d.count))

  const rosterData = [
    { name: "Rohan Verma", c1: "7", c2: "8", c3: "6", total: "21", grade: "B", status: 'Published' },
    { name: "Arjun Mehta", c1: "9", c2: "9", c3: "8", total: "26", grade: "A+", status: 'Ready' },
    { name: "Priya Patel", c1: "7", c2: "8", c3: "7", total: "22", grade: "B+", status: 'Published' },
    { name: "Sneha K.", c1: "8", c2: "7", c3: "8", total: "23", grade: "A", status: 'Published' },
    { name: "Ananya S.", c1: "10", c2: "9", c3: "9", total: "28", grade: "A+", status: 'Ready' },
    { name: "Vikram R.", c1: "6", c2: "7", c3: "5", total: "18", grade: "C+", status: 'Revision' },
  ]

  const commonGaps = [
    { label: "Authorization Logic", gap: "34% of students missed state.auth validation", severity: "high", impact: "Security Vulnerability" },
    { label: "MVC Dependency Injection", gap: "12 submissions had circular constructor refs", severity: "medium", impact: "Runtime Stability" },
    { label: "Documentation Standards", gap: "API contract missing in 15% of cohort", severity: "low", impact: "Code Maintainability" },
  ]

  // Shared Header Component
  const PageHeader = ({ title, subtitle, showBack = true, children }: any) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/40">
      <div className="space-y-4">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewState("insights")}
          >
            <ArrowLeft />
            Back to insights
          </Button>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <Badge variant="outline" className="eyebrow h-5 px-2 bg-primary/5 text-primary border-primary/20 rounded-full">
              PROTOCOL P1
            </Badge>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  )

  if (viewState === "release") {
    return (
      <div className="max-w-5xl mx-auto py-12 px-8 space-y-10 font-sans select-none animate-in slide-in-from-right-4 fade-in duration-500">
        <PageHeader 
          title="Release Configuration" 
          subtitle="Schedule and publish evaluation outcomes for Software Engineering: Phase 2."
        >
          <Button variant="ghost" size="sm">
            <Settings2 /> Policy audit
          </Button>
        </PageHeader>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {/* Batch Status Card */}
            <Card className="border-border/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] rounded-[24px] overflow-hidden bg-background">
              <CardHeader className="p-6 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="eyebrow text-foreground flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" /> Batch Readiness
                  </CardTitle>
                  <CardDescription className="text-xs font-bold text-muted-foreground/50 mt-1">Cohort SE-PH2 Evaluation</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-foreground tabular-nums tracking-tight">45<span className="text-muted-foreground/30 text-sm">/45</span></div>
                  <div className="eyebrow text-[color:var(--status-success)]">100% Processed</div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="relative pt-2">
                  <Progress value={100} className="h-3 rounded-full bg-muted/30" />
                  <div className="absolute top-0 left-0 w-full h-3 bg-primary/10 blur-md rounded-full -z-10" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'High Confidence', count: 35, color: 'text-[color:var(--status-success)]', bg: 'bg-[color:var(--status-success)]/10' },
                    { label: 'Manual Review', count: 3, color: 'text-[color:var(--status-warning)]', bg: 'bg-[color:var(--status-warning)]/10' },
                    { label: 'Elevated Cases', count: 5, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Integrity Alert', count: 2, color: 'text-[color:var(--status-error)]', bg: 'bg-destructive/10' },
                  ].map((stat) => (
                    <div key={stat.label} className={cn("p-4 rounded-2xl border border-border/40 flex items-center justify-between", stat.bg)}>
                      <span className="text-xs font-bold text-muted-foreground/80 tracking-tight">{stat.label}</span>
                      <span className={cn("text-lg font-semibold", stat.color)}>{stat.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timing Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <Clock className="w-4 h-4 text-primary" />
                 <span className="eyebrow text-foreground">Launch Scheduling</span>
              </div>
              <div className="grid gap-4">
                {[
                  { key: "monday" as const, title: "Standard Protocol", time: "Monday, 9:00 AM", desc: "Allows maximum window for office hours and follow-up support.", icon: Calendar, badge: "Recommended" },
                  { key: "immediate" as const, title: "Immediate Release", time: "Effective Instantly", desc: "Bypasses scheduling queue. Students will be notified immediately.", icon: Zap, badge: null },
                  { key: "custom" as const, title: "Custom Window", time: "Configure Date/Time", desc: "Select a specific future timestamp for cohort-wide publication.", icon: Command, badge: null },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setReleaseTiming(opt.key)}
                    className={cn(
                      "flex items-start gap-5 p-7 rounded-[24px] border transition-all text-left group",
                      releaseTiming === opt.key
                        ? "bg-primary/[0.03] border-primary/40 shadow-sm"
                        : "bg-background border-border/30 hover:border-border/60 hover:bg-muted/10"
                    )}
                  >
                    <div className={cn(
                      "mt-1 size-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                      releaseTiming === opt.key ? "bg-primary border-primary scale-110" : "border-muted-foreground/20 group-hover:border-muted-foreground/40"
                    )}>
                      {releaseTiming === opt.key && <div className="size-2 bg-primary-foreground rounded-full" />}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className={cn("text-sm font-semibold tracking-tight", releaseTiming === opt.key ? "text-primary" : "text-foreground")}>{opt.title}</span>
                            {opt.badge && <Badge variant="outline" className="eyebrow h-4 px-1.5 bg-[color:var(--status-success)]/10 text-[color:var(--status-success)] border-[color:var(--status-success)]/30 rounded-sm">{opt.badge}</Badge>}
                         </div>
                         <opt.icon className={cn("w-4 h-4 opacity-20", releaseTiming === opt.key ? "text-primary opacity-60" : "text-muted-foreground")} />
                      </div>
                      <p className="text-sm font-bold text-foreground/80">{opt.time}</p>
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Impact & Actions Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-8">
              <Card className="border-primary/20 shadow-[0_20px_50px_rgba(59,130,246,0.08)] rounded-[24px] overflow-hidden bg-primary/5">
                <CardHeader className="p-6 border-b border-primary/10">
                   <CardTitle className="eyebrow text-primary">Finalize Batch</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-primary" /></div>
                       <div>
                          <p className="eyebrow text-muted-foreground/60 mb-1">Target Cohort</p>
                          <p className="text-sm font-bold text-foreground">45 Evaluated Students</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5 text-primary" /></div>
                       <div>
                          <p className="eyebrow text-muted-foreground/60 mb-1">Audit Status</p>
                          <p className="text-sm font-bold text-foreground">Verified & Immutable</p>
                       </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-background border border-primary/20 border-dashed">
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                        "Publishing will notify all students in the cohort and unlock their solution direction roadmaps."
                      </p>
                  </div>

                  <Button
                    size="lg"
                    disabled={isSyncing}
                    onClick={() => {
                      setIsSyncing(true)
                      setTimeout(() => setIsSyncing(false), 2000)
                    }}
                    className="w-full"
                  >
                    {isSyncing ? (
                      <><RefreshCw className="mr-3 h-5 w-5 animate-spin" /> Publishing...</>
                    ) : (
                      'Finalize launch'
                    )}
                  </Button>
                  <p className="eyebrow text-center text-muted-foreground/40">Protocol Version v.2.4.1</p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </main>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-8 space-y-12 font-sans select-none animate-in fade-in duration-700">
      {/* Dashboard Top Header */}
      <PageHeader 
        title="Instructional Insights" 
        subtitle="Comprehensive audit and cohort analytics for Software Engineering: Phase 2."
        showBack={false}
      >
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download /> Export data
          </Button>
          <Button onClick={() => setViewState("release")}>
            <Sparkles /> Publish outcomes
          </Button>
        </div>
      </PageHeader>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Cohort Average", value: 84.2, unit: "%", sub: "+4.2% vs Phase 1", icon: TrendingUp, trend: 'up' },
          { label: "Completion Rate", value: 100, unit: "%", sub: `45 Submissions`, icon: Users, trend: 'neutral' },
          { label: "Integrity Score", value: 98, unit: "%", sub: "Clean Audit Log", icon: ShieldCheck, trend: 'up' },
          { label: "Evaluation Lift", value: 68, unit: "%", sub: "AI Efficiency Gain", icon: Zap, trend: 'up' },
        ].map((stat) => (
          <motion.div whileHover={{ y: -4 }} key={stat.label} className="p-7 bg-background border border-border/40 rounded-[28px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] transition-all">
            <div className="flex items-start justify-between mb-4">
              <span className="eyebrow text-muted-foreground/40">{stat.label}</span>
              <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                 <stat.icon className="h-5 w-5 text-primary opacity-60" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
                {stat.value}<span className="text-sm font-bold text-muted-foreground/40 ml-1.5">{stat.unit}</span>
              </div>
              <div className={cn(
                "eyebrow flex items-center gap-1.5",
                stat.trend === 'up' ? 'text-[color:var(--status-success)]' : 'text-muted-foreground/60'
              )}>
                {stat.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />} {stat.sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grade Distribution Chart Card */}
        <Card className="lg:col-span-2 border-border/40 rounded-[32px] overflow-hidden bg-background shadow-[0_8px_40px_rgb(0,0,0,0.03)]">
          <CardHeader className="p-10 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">Performance Distribution</CardTitle>
              <CardDescription className="eyebrow text-muted-foreground/40 mt-1">Cohort Frequency Mapping</CardDescription>
            </div>
            <Badge variant="outline" className="eyebrow border-border/30 px-3 h-6 bg-background shadow-sm rounded-full">P1 Calibrated</Badge>
          </CardHeader>
          <CardContent className="p-10">
            <div className="flex items-end gap-5 h-72">
              {distributionData.map((data, i) => {
                const heightPct = (data.count / maxCount) * 100
                return (
                  <div key={data.range} className="flex-1 flex flex-col items-center group relative h-full">
                    <div className="relative w-full flex flex-col items-center justify-end flex-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "w-full max-w-[80px] rounded-t-2xl transition-all relative overflow-hidden",
                          data.color,
                          "hover:brightness-110 shadow-lg shadow-primary/5"
                        )}
                      >
                         <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                      <div className="absolute -top-10 text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 px-2 py-1 bg-background border border-border/40 rounded-lg shadow-xl tabular-nums">
                        {data.count} <span className="text-xs text-muted-foreground">SUBMISSIONS</span>
                      </div>
                    </div>
                    <div className="text-center space-y-1 pt-5 shrink-0">
                      <p className="text-xs font-semibold text-foreground tracking-tight tabular-nums">{data.range}</p>
                      <p className="eyebrow text-muted-foreground/30">{data.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Instructional Interventions Card */}
        <Card className="border-border/40 rounded-[32px] overflow-hidden bg-background shadow-[0_8px_40px_rgb(0,0,0,0.03)] flex flex-col">
          <CardHeader className="p-10 border-b border-border/10 bg-muted/5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="eyebrow text-muted-foreground/50">Smart Interventions</span>
            </div>
            <CardTitle className="text-xl font-extrabold tracking-tight text-foreground leading-tight">Identified Logic Gaps</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
               <div className="divide-y divide-border/10">
                 {commonGaps.map((gap) => (
                   <div key={gap.label} className="p-8 space-y-3 hover:bg-muted/10 transition-colors group">
                     <div className="flex items-center justify-between">
                       <span className="eyebrow text-foreground">{gap.label}</span>
                       <Badge variant="outline" className={cn(
                         "eyebrow h-5 rounded-sm",
                         gap.severity === 'high' ? 'bg-[color:var(--status-warning)]/10 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30' : 'bg-muted/50 text-muted-foreground border-border/40'
                       )}>
                         {gap.severity} RISK
                       </Badge>
                     </div>
                     <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{gap.gap}</p>
                     <div className="pt-2">
                       <Button
                         variant="link"
                         size="sm"
                         disabled={activeInterventions.includes(gap.label)}
                         onClick={() => setActiveInterventions(prev => [...prev, gap.label])}
                       >
                         {activeInterventions.includes(gap.label) ? (
                           <>Intervention deployed <CheckCircle2 /></>
                         ) : (
                           <>Initiate intervention <ArrowRight /></>
                         )}
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Roster Card */}
      <Card className="border-border/40 rounded-[32px] overflow-hidden bg-background shadow-[0_8px_40px_rgb(0,0,0,0.03)]">
        <CardHeader className="p-10 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">Cohort Roster</CardTitle>
            <CardDescription className="eyebrow text-muted-foreground/40">Breakdown by Assessment Standard</CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm">Filter range</Button>
             <Button variant="ghost" size="icon"><Settings2 /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="text-left">
            <TableHeader className="bg-muted/20 border-b border-border/10">
              <TableRow>
                <TableHead className="eyebrow px-10 py-5 text-muted-foreground/50">Student Identity</TableHead>
                <TableHead className="eyebrow px-6 py-5 text-muted-foreground/50 text-center">Score Matrix</TableHead>
                <TableHead className="eyebrow px-6 py-5 text-muted-foreground/50 text-center">Protocol Status</TableHead>
                <TableHead className="eyebrow px-10 py-5 text-muted-foreground/50 text-right">Evaluation Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/10">
              {rosterData.map((student) => (
                <TableRow key={student.name} className="hover:bg-muted/5 group">
                  <TableCell className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-muted group-hover:bg-primary/5 transition-colors flex items-center justify-center text-xs font-semibold text-muted-foreground group-hover:text-primary">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-extrabold text-foreground text-sm tracking-tight">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 font-mono text-muted-foreground text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xs font-bold">{student.c1}</span>
                      <span className="text-muted-foreground/20 text-xs">|</span>
                      <span className="text-xs font-bold">{student.c2}</span>
                      <span className="text-muted-foreground/20 text-xs">|</span>
                      <span className="text-xs font-bold">{student.c3}</span>
                      <span className="text-muted-foreground/20 text-xs">|</span>
                      <span className="text-xs font-semibold text-foreground">{student.total}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-center">
                    <Badge variant="outline" className={cn(
                      "eyebrow h-5 px-2 rounded-full",
                      student.status === 'Published' ? 'bg-[color:var(--status-success)]/5 text-[color:var(--status-success)] border-[color:var(--status-success)]/30' :
                      student.status === 'Ready' ? 'bg-primary/5 text-primary border-primary/20' :
                      'bg-[color:var(--status-warning)]/5 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30'
                    )}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">{student.grade}</span>
                      <div className={cn(
                        "w-1.5 h-6 rounded-full",
                        student.grade.includes('A') ? 'bg-primary' :
                        student.grade.includes('B') ? 'bg-[color:var(--status-success)]' :
                        'bg-[color:var(--status-warning)]'
                      )} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Footer Audit Message */}
      <div className="text-center pb-12">
         <p className="eyebrow text-muted-foreground/30">End of Transcript · EducAItors AI Protocol Verified</p>
      </div>
    </div>
  )
}
