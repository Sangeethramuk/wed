import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Home",
}
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
  GraduationCap
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const stats = [
    { label: "Total Papers", value: "3,500", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Evaluation Completed", value: "2,250", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Evaluation To Be Done", value: "1,250", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Avg Evaluation Time", value: "3.5 min", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Completion Rate", value: "96%", icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">Welcome, Professor</h1>
          <p className="text-muted-foreground text-sm font-medium italic">
            Your evaluation ecosystem is performing at <span className="text-primary font-bold">96% efficiency</span> this semester.
          </p>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative border-border/40 shadow-sm bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all hover:-translate-y-1 overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${stat.bg.replace('/10', '/30')}`} />
            <CardContent className="p-5 flex flex-col gap-3">
              <div className={`p-2 rounded-xl w-fit ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground/40 tracking-wider uppercase">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Active Evaluations Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Current active evaluations</h2>
              <p className="text-xs text-muted-foreground font-medium italic">Ongoing grading desks across your cohorts</p>
            </div>
            <Link href="/dashboard/evaluation">
              <Button variant="ghost" size="sm" className="eyebrow text-[10px] font-black group">
                See all <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/20 transition-all group overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <h3 className="font-bold text-foreground">Software Engineering - Phase 2</h3>
                    </div>
                    <p className="text-xs text-muted-foreground/60 font-medium">Authoring Identity Evaluation · Folder ID: #SE-2024-PH2</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black py-1 px-2 uppercase tracking-tighter">
                    IN PROGRESS
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                    <span>Grading Progress</span>
                    <span className="tabular-nums text-foreground">53% · 24/45 Papers</span>
                  </div>
                  <Progress value={53} className="h-1.5 bg-muted/40" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40">
                      <Clock className="h-3.5 w-3.5" />
                      ESTIMATED TIME REMAINING: 45 MIN
                    </div>
                    <Link href="/dashboard/evaluation/SWE-PH2/grading">
                      <Button size="sm" className="h-8 rounded-full px-5 text-[11px] font-black uppercase tracking-tight">
                        Enter Desk
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-emerald-500/20 transition-all group overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h3 className="font-bold text-foreground">Database Systems - Quiz 1</h3>
                    </div>
                    <p className="text-xs text-muted-foreground/60 font-medium">Final Validation · Folder ID: #DB-2024-Q1</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[10px] font-black py-1 px-2 uppercase tracking-tighter">
                    COMPLETED
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                    <span>Grading Progress</span>
                    <span className="tabular-nums text-emerald-500">100% · 42/42 Papers</span>
                  </div>
                  <Progress value={100} className="h-1.5 bg-emerald-500/10" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500/50">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ALL PAPERS VERIFIED
                    </div>
                    <Link href="/dashboard/evaluation">
                      <Button variant="outline" size="sm" className="h-8 rounded-full px-5 text-[11px] font-black uppercase tracking-tight border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5">
                        View Papers
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions & Notifications */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Operations</h4>
            <div className="grid gap-3">
              <Link href="/dashboard/pre-evaluation">
                <Button className="w-full justify-between h-14 rounded-2xl px-6 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3">
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-bold text-sm">Prepare Assignment</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-40" />
                </Button>
              </Link>
              <Link href="/dashboard/evaluation">
                <Button variant="outline" className="w-full justify-between h-14 rounded-2xl px-6 border-border/60 hover:bg-muted/50 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-5 w-5" />
                    <span className="font-bold text-sm text-foreground/80">Assignments Hub</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-40" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">System Alerts</h4>
            <div className="space-y-3">
              <div className="flex gap-4 p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm group hover:border-amber-500/30 transition-all">
                <div className="p-2.5 h-fit rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">New Pattern Detected</p>
                  <p className="text-xs text-muted-foreground">60% of students in "Software Engineering" struggled with MVC Controller logic.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
                <div className="p-2.5 h-fit rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Calibration Complete</p>
                  <p className="text-xs text-muted-foreground">Prompt strategy for "Database Systems" has been successfully refined based on your grading style.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
