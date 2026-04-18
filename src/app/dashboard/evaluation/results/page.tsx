"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
 AlertCircle,
 CheckCircle2,
 FileText,
 Zap,
 RefreshCw,
 ChevronRight,
 Lock
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ResultInsights() {
 const [viewState, setViewState] = useState<"insights" | "release">("insights")
 const [isSyncing, setIsSyncing] = useState(false)
 const [releaseTiming, setReleaseTiming] = useState<"monday" | "immediate" | "custom">("monday")
 const [activeInterventions, setActiveInterventions] = useState<string[]>([])

 const distributionData = [
 { range: "90-100", count: 12, label: "Outstanding" },
 { range: "80-89", count: 18, label: "Commendable" },
 { range: "70-79", count: 8, label: "Satisfactory" },
 { range: "60-69", count: 5, label: "Marginal" },
 { range: "<60", count: 2, label: "Unsatisfactory" },
 ]

 const maxCount = Math.max(...distributionData.map(d => d.count))

 const totalStudents = 45
 const averageScore = 84.2

 const commonGaps = [
 { label: "Authorization Logic", gap: "34% of students missed state.auth validation", severity: "high" },
 { label: "MVC Dependency Injection", gap: "12 submissions had circular constructor refs", severity: "medium" },
 { label: "Documentation Standards", gap: "API contract missing in 15% of cohort", severity: "low" },
 ]

 const rosterData = [
 { name: "Rohan Verma", c1: "7", c2: "8", c3: "6", total: "21", grade: "B" },
 { name: "Arjun Mehta", c1: "9", c2: "9", c3: "8", total: "26", grade: "A+" },
 { name: "Priya Patel", c1: "7", c2: "8", c3: "7", total: "22", grade: "B+" },
 { name: "Sneha K.", c1: "8", c2: "7", c3: "8", total: "23", grade: "A" },
 { name: "Ananya S.", c1: "10", c2: "9", c3: "9", total: "28", grade: "A+" },
 { name: "Vikram R.", c1: "6", c2: "7", c3: "5", total: "18", grade: "C+" },
 ]

 if (viewState === "release") {
 return (
 <div className="max-w-4xl mx-auto py-12 px-6 space-y-10 animate-in slide-in-from-right-8 fade-in duration-500">
 <div className="space-y-4">
 <Button
 variant="ghost"
 size="sm"
 className="pl-0 text-muted-foreground hover:text-foreground transition-colors group"
 onClick={() => setViewState("insights")}
 >
 <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
 </Button>
 <div className="space-y-1">
 <h1 className="text-4xl md:text-5xl font-medium tracking-tighter secondary-text">Release Configuration</h1>
 <p className="text-muted-foreground text-base font-medium leading-relaxed">Schedule and publish evaluation outcomes for <span className="text-foreground font-bold">Software Engineering: Phase 2</span>.</p>
 </div>
 </div>

 <Card className="border border-border/40 rounded-xl overflow-hidden">
 <CardHeader className="p-6 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
 <CardTitle className="text-xs font-medium tracking-widest text-muted-foreground">Batch Progress</CardTitle>
 <span className="text-sm font-medium text-foreground tabular-nums">45/45 Evaluated</span>
 </CardHeader>
 <CardContent className="p-6 space-y-4">
 <Progress value={100} className="h-1.5 rounded-full bg-muted/30" />
 <div className="flex flex-wrap gap-2 pt-2">
 <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 px-2.5 py-0.5 text-xs font-medium tracking-widest rounded-full h-5"><AlertCircle className="mr-1 h-3 w-3" /> 2 High Risk</Badge>
 <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 text-xs font-medium tracking-widest rounded-full h-5"><Zap className="mr-1 h-3 w-3" /> 5 Elevated</Badge>
 <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 text-xs font-medium tracking-widest rounded-full h-5"><Users className="mr-1 h-3 w-3" /> 3 Manual Review</Badge>
 <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium tracking-widest rounded-full h-5"><CheckCircle2 className="mr-1 h-3 w-3" /> 35 High Confidence</Badge>
 </div>
 </CardContent>
 </Card>

 <div className="space-y-4">
 <p className="text-xs font-medium tracking-widest text-muted-foreground/50 ml-1">Release Timing</p>
 <div className="grid gap-3">
 {[
 { key: "monday" as const, title: "Monday 9:00 AM", desc: "Students have the full week to schedule office hours and review feedback.", badge: "Recommended" },
 { key: "immediate" as const, title: "Release Immediately", desc: "Not recommended on weekends or late hours.", badge: null },
 { key: "custom" as const, title: "Custom Date & Time", desc: "Set a specific release schedule.", badge: null },
 ].map((opt) => (
 <button
 key={opt.key}
 onClick={() => setReleaseTiming(opt.key)}
 className={cn(
 "flex items-start gap-4 p-6 rounded-xl border text-left transition-all",
 releaseTiming === opt.key
 ? "bg-primary/[0.03] border-primary/30"
 : "bg-card border-border/30 hover:border-border/60 hover:bg-muted/10 cursor-pointer"
 )}
 >
 <div className={cn(
 "mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 border transition-colors",
 releaseTiming === opt.key ? "bg-primary border-primary" : "border-muted-foreground/20"
 )}>
 {releaseTiming === opt.key && <div className="size-2 bg-primary-foreground rounded-full" />}
 </div>
 <div className="space-y-1">
 <div className="flex items-center gap-3">
 <span className={cn("font-medium tracking-tight", releaseTiming === opt.key ? "text-primary" : "text-foreground")}>{opt.title}</span>
 {opt.badge && <Badge variant="outline" className="px-2 py-0 text-xs font-medium tracking-widest bg-emerald-500/5 text-emerald-600 border-emerald-500/20 rounded-full h-4">{opt.badge}</Badge>}
 </div>
 <p className="text-xs font-medium text-muted-foreground leading-relaxed">{opt.desc}</p>
 </div>
 </button>
 ))}
 </div>
 </div>

 <div className="flex items-center justify-between pt-8 border-t border-border/10">
 <div className="space-y-1">
 <p className="text-xs font-medium tracking-widest text-muted-foreground/50">Impact Scope</p>
 <p className="text-sm font-bold text-foreground">45 grades queued for {releaseTiming === "immediate" ? "immediate release" : "scheduled publication"}.</p>
 </div>
 <Button
 disabled={isSyncing}
 onClick={() => {
 setIsSyncing(true)
 setTimeout(() => setIsSyncing(false), 2000)
 }}
 className="h-14 px-12 text-lg font-medium tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90"
 >
 {isSyncing ? (
 <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
 ) : (
 'Finalize Publication'
 )}
 </Button>
 </div>
 </div>
 )
 }

 return (
 <div className="max-w-6xl mx-auto py-10 px-6 space-y-8 animate-in fade-in duration-500">
 <div className="flex items-center justify-between border-b border-border/10 pb-6">
 <div className="space-y-1">
 <Link href="/dashboard/evaluation">
 <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground transition-colors group -ml-2">
 <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Triage Desk
 </Button>
 </Link>
 <div className="flex items-center gap-3">
 <h1 className="text-2xl font-medium tracking-tight secondary-text">Instructional Insights</h1>
 <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-medium tracking-widest px-2 h-5 rounded-full">Protocol P1</Badge>
 </div>
 <p className="text-muted-foreground text-sm font-medium">Comprehensive audit of <span className="text-foreground font-bold">Software Engineering: Phase 2</span></p>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="outline" className="h-9 border-border/40 bg-background hover:bg-muted/20 px-4 text-xs font-medium tracking-widest shadow-none rounded-lg">
 <FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Session Protocol
 </Button>
 <Button variant="outline" className="h-9 border-border/40 bg-background hover:bg-muted/20 px-4 text-xs font-medium tracking-widest shadow-none rounded-lg">
 <Download className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Export
 </Button>
 <Button onClick={() => setViewState("release")} className="h-9 px-4 text-xs font-medium tracking-widest shadow-none rounded-lg bg-primary hover:bg-primary/90">
 Publish Grades
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { label: "Cohort Average", value: averageScore, unit: "%", sub: "+4.2% vs Phase 1", icon: TrendingUp, highlight: false },
 { label: "Completion Rate", value: 100, unit: "%", sub: `${totalStudents} Submissions`, icon: Users, highlight: false },
 { label: "Authenticity Score", value: 98, unit: "%", sub: "Protocol P1 Valid", icon: ShieldCheck, highlight: false },
 { label: "Evaluation Flow", value: 2.4, unit: "m/avg", sub: "4.2x Faster", icon: Zap, highlight: false },
 ].map((stat) => (
 <Card key={stat.label} className={cn(
 "p-6 border transition-all",
 stat.highlight
 ? "bg-primary/[0.02] border-primary/20"
 : "bg-card border-border/30"
 )}>
 <div className="flex items-start justify-between">
 <div className="space-y-1">
 <p className="text-xs font-medium tracking-widest text-muted-foreground/50">{stat.label}</p>
 <p className={cn(
 "text-4xl font-medium tracking-tighter tabular-nums",
 stat.highlight ? "text-primary" : "text-foreground"
 )}>
 {stat.value}<span className="text-xs font-bold text-muted-foreground/40 ml-0.5">{stat.unit}</span>
 </p>
 </div>
 <stat.icon className={cn("h-4 w-4 mt-1 opacity-30", stat.highlight ? "text-primary" : "text-muted-foreground")} />
 </div>
 <div className={cn(
 "mt-3 flex items-center gap-1.5 text-xs font-medium tracking-widest",
 stat.highlight ? "text-primary" : "text-muted-foreground/50"
 )}>
 <stat.icon className="h-3 w-3" /> {stat.sub}
 </div>
 </Card>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <Card className="lg:col-span-2 border border-border/30 rounded-xl overflow-hidden">
 <CardHeader className="p-6 border-b border-border/10 bg-muted/5">
 <div className="flex items-center justify-between">
 <div className="space-y-0">
 <CardTitle className="text-base font-medium tracking-tight secondary-text">Grade Distribution</CardTitle>
 <CardDescription className="text-xs font-semibold text-muted-foreground/50 tracking-widest">Performance across cohort</CardDescription>
 </div>
 <Badge variant="outline" className="border-border/30 px-2 py-0 text-xs font-medium tracking-widest bg-background/50 h-5 rounded-full">P1 Calibrated</Badge>
 </div>
 </CardHeader>
 <CardContent className="p-6">
 <div className="flex items-end gap-4 h-64">
 {distributionData.map((data, i) => {
 const heightPct = (data.count / maxCount) * 100
 return (
 <div key={data.range} className="flex-1 flex flex-col items-center group relative h-full">
 <div className="relative w-full flex flex-col items-center justify-end flex-1">
 <div
 className={cn(
 "w-full max-w-[72px] rounded-t-xl transition-all duration-700 ease-out",
 i === 1 ? 'bg-primary' : 'bg-primary/15 group-hover:bg-primary/30'
 )}
 style={{ height: `${heightPct}%` }}
 />
 <div className="absolute -top-7 text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-all">
 {data.count}
 </div>
 </div>
 <div className="text-center space-y-0.5 pt-3 shrink-0">
 <p className="text-xs font-medium text-foreground tracking-tighter tabular-nums">{data.range}</p>
 <p className="text-xs font-medium text-muted-foreground/40 tracking-[0.2em]">{data.label}</p>
 </div>
 </div>
 )
 })}
 </div>
 </CardContent>
 </Card>

 <div className="space-y-6 flex flex-col">
 <Card className="border border-border/30 rounded-xl overflow-hidden flex-1 flex flex-col">
 <CardHeader className="p-6 border-b border-border/10 bg-muted/5">
 <div className="flex items-center gap-2 text-primary mb-1">
 <FileText className="h-3.5 w-3.5" />
 <span className="text-xs font-medium tracking-widest text-muted-foreground/50">Session Insights</span>
 </div>
 <CardTitle className="text-base font-medium tracking-tight secondary-text">Instructional Gaps</CardTitle>
 </CardHeader>
 <CardContent className="p-0 flex-1">
 <div className="divide-y divide-border/10">
 {commonGaps.map((gap) => (
 <div key={gap.label} className="px-6 py-5 space-y-2 hover:bg-muted/10 transition-colors group">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-foreground tracking-widest">{gap.label}</span>
 <AlertCircle className={cn("h-3.5 w-3.5", gap.severity === 'high' ? 'text-amber-500' : 'text-muted-foreground/20')} />
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed font-medium">{gap.gap}</p>
 <button
 disabled={activeInterventions.includes(gap.label)}
 onClick={() => setActiveInterventions(prev => [...prev, gap.label])}
 className={cn(
 "flex items-center gap-1 text-xs font-medium tracking-widest transition-all p-0",
 activeInterventions.includes(gap.label) ? "text-emerald-600" : "text-primary hover:gap-1.5"
 )}
 >
 {activeInterventions.includes(gap.label) ? (
 <>Initialized <CheckCircle2 className="h-3 w-3" /></>
 ) : (
 <>Initialize <ChevronRight className="h-3 w-3" /></>
 )}
 </button>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>

 <Card className="border border-border/30 rounded-xl overflow-hidden">
 <CardHeader className="p-6 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
 <div className="space-y-0">
 <CardTitle className="text-base font-medium tracking-tight secondary-text">Cohort Roster</CardTitle>
 <CardDescription className="text-xs font-semibold text-muted-foreground/50 tracking-widest">Individual breakdown across criteria</CardDescription>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-muted/5 border-b border-border/10">
 <tr>
 <th className="px-6 py-3 font-medium tracking-widest text-xs text-muted-foreground/40">Student</th>
 <th className="px-4 py-3 font-medium tracking-widest text-xs text-muted-foreground/40 text-center">C1</th>
 <th className="px-4 py-3 font-medium tracking-widest text-xs text-muted-foreground/40 text-center">C2</th>
 <th className="px-4 py-3 font-medium tracking-widest text-xs text-muted-foreground/40 text-center">C3</th>
 <th className="px-4 py-3 font-medium tracking-widest text-xs text-muted-foreground/40 text-center">Total</th>
 <th className="px-6 py-3 font-medium tracking-widest text-xs text-muted-foreground/40 text-right">Grade</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/10">
 {rosterData.map((student) => (
 <tr key={student.name} className="hover:bg-muted/5 transition-colors">
 <td className="px-6 py-3 font-bold text-foreground text-[12px]">{student.name}</td>
 <td className="px-4 py-3 font-medium text-muted-foreground text-center text-[12px]">{student.c1}</td>
 <td className="px-4 py-3 font-medium text-muted-foreground text-center text-[12px]">{student.c2}</td>
 <td className="px-4 py-3 font-medium text-muted-foreground text-center text-[12px]">{student.c3}</td>
 <td className="px-4 py-3 font-medium text-foreground text-center text-[12px]">{student.total}</td>
 <td className="px-6 py-3 text-right">
 <Badge variant="outline" className={cn(
 "font-medium text-xs tracking-wider rounded-full h-5 px-2",
 student.grade.includes('A') ? 'bg-primary/5 text-primary border-primary/20' :
 student.grade.includes('B') ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' :
 'bg-amber-500/5 text-amber-600 border-amber-500/20'
 )}>
 {student.grade}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 )
}
