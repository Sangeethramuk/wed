"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useGradingStore } from "@/lib/store/grading-store"
import {
  ChevronLeft,
  Users,
  BarChart3,
  Eye,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TriageSidebar } from "@/components/evaluation/triage-sidebar"
import { motion } from "framer-motion"

export default function AssignmentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { assignments } = useGradingStore()
  const assignment = assignments[id]
  const [activeTab, setActiveTab] = useState("submissions")
  const [gradedSubmissions, setGradedSubmissions] = useState<string[]>([])

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-muted-foreground">Assignment not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/evaluation")}>
          Back to Assignments
        </Button>
      </div>
    )
  }

  const stats = [
    { label: "Total Papers", value: 60, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending", value: 60 - gradedSubmissions.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Critical", value: 8, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Focus", value: 12, icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Good to go", value: 40, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ]

  const handleStudentSelect = (studentId: string) => {
    router.push(`/dashboard/evaluation/${id}/grading?studentId=${studentId}`)
  }

  const handleBulkApprove = (ids: string[]) => {
    setGradedSubmissions(prev => [...new Set([...prev, ...ids])])
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="group -ml-2 text-muted-foreground hover:text-foreground transition-all"
        onClick={() => router.push("/dashboard/evaluation")}
      >
        <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Assignments
      </Button>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-[color:var(--status-info)]/5 blur-3xl" />

        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-1">
                <p className="eyebrow text-primary/60 font-bold tracking-[0.2em] uppercase text-[10px]">
                  Assignment Overview
                </p>
                <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight text-foreground leading-tight">
                  {assignment.title}
                </h1>
              </div>
              <p className="text-muted-foreground/70 leading-relaxed text-sm md:text-base font-medium italic">
                &quot;{assignment.description}&quot;
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-border/40 py-1.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  #{assignment.id.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 py-1.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Target Fix: {assignment.targetFix.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="rounded-full px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                onClick={() => router.push(`/dashboard/evaluation/${id}/grading`)}
              >
                Enter Grading Desk
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="submissions" className="space-y-8" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b border-border/50 pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger
              value="submissions"
              className="px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none eyebrow text-xs font-bold tracking-widest text-muted-foreground/60 data-[state=active]:text-foreground transition-all"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none eyebrow text-xs font-bold tracking-widest text-muted-foreground/60 data-[state=active]:text-foreground transition-all"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none eyebrow text-xs font-bold tracking-widest text-muted-foreground/60 data-[state=active]:text-foreground transition-all"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="submissions" className="space-y-8 outline-none mt-6">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border-border/40 shadow-sm bg-card/40 backdrop-blur-sm group hover:border-primary/30 transition-all hover:translate-y-[-2px]">
                  <CardContent className="p-4 space-y-3">
                    <div className={`p-2 rounded-xl w-fit ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground/50 tracking-wider uppercase">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Full Width Submissions Table */}
          <div className="rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-card/30 backdrop-blur-xl h-[800px]">
            <TriageSidebar
              selectedStudentId=""
              onStudentSelect={handleStudentSelect}
              gradedSubmissions={gradedSubmissions}
              onBulkApprove={handleBulkApprove}
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="outline-none">
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm p-20 text-center">
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="mx-auto w-16 h-16 rounded-full bg-[color:var(--status-info-bg)] flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-[color:var(--status-info)] opacity-50" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight italic">Analytics coming soon</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                Advanced performance tracking and cohort benchmarking metrics are being calibrated for this course.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="outline-none">
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm p-20 text-center">
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                <Eye className="h-8 w-8 text-primary opacity-50" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight italic">Assignment Preview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                Preview the assignment as it appears to students. Coming soon in the next update.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
