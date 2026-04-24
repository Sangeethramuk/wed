"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useGradingStore } from "@/lib/store/grading-store"
import { ESCALATION_DISMISS_THRESHOLD } from "@/components/evaluation/progressive-nudges"
import {
  ChevronLeft,
  Users,
  BarChart3,
  Eye,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Zap,
  EyeOff,
  ArrowRight
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
  const {
    assignments,
    progressiveNudges,
    triggerSpotCheck,
    markSpotCheckAutoFired,
    calibration,
    initCalibration,
  } = useGradingStore()
  const assignment = assignments[id]
  const [activeTab, setActiveTab] = useState("submissions")
  const [gradedSubmissions, setGradedSubmissions] = useState<string[]>([])
  const [cohortPublished, setCohortPublished] = useState(false)

  /**
   * Cohort-level publish — the LEVEL-3 failsafe gate.
   *
   * Reads `progressiveNudges.ignoredCount` from the grading store (ticked by
   * each un-productive nudge dismissal on the per-student grading desk).
   * If the instructor is trying to finalize after ignoring ≥
   * ESCALATION_DISMISS_THRESHOLD nudges, the spot-check modal opens first.
   * Otherwise: toast success + lock the button.
   */
  const handlePublishCohort = () => {
    if (cohortPublished) return
    const { ignoredCount, spotCheckAutoFired } = progressiveNudges
    if (!spotCheckAutoFired && ignoredCount >= ESCALATION_DISMISS_THRESHOLD) {
      markSpotCheckAutoFired()
      triggerSpotCheck()
      return
    }
    setCohortPublished(true)
    toast.success("Cohort grades published", {
      description: `All 60 submissions for ${assignment?.title ?? "this assignment"} finalized.`,
      duration: 4000,
    })
  }

  const requiresBlindGrading = assignment?.students.some(s => s.isDoubleBlind)
  const calibrationComplete = calibration[id]?.phase === 'complete'
  const blindGateActive = requiresBlindGrading && !calibrationComplete

  // Pre-init so we know the paper count before the user clicks Begin
  useEffect(() => {
    if (requiresBlindGrading) initCalibration(id)
  }, [id, requiresBlindGrading, initCalibration])

  const cal = calibration[id]
  const blindTotalCount = cal?.papers.length ?? 0
  const blindGradedCount = cal?.papers.filter(p =>
    cal.scores.filter(s => s.paperId === p.paperId).every(s => s.instructorLevel > 0) && cal.criteria.length > 0
  ).length ?? 0
  const blindRemainingCount = blindTotalCount - blindGradedCount
  const blindHasStarted = blindGradedCount > 0

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
    <div
      className="space-y-8 pb-20 -m-6 p-6 min-h-[calc(100svh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/evaluation")}
        className="group inline-flex items-center gap-1 -ml-2 px-2 py-1 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Assignments
      </button>

      {/* Hero Card — per EDUCAITORS_DS_GUIDE.md: white surface, slate-200 border,
          inline subtle shadow, slate text ramp, navy CTA with hex hover. */}
      <div
        className="rounded-xl border border-slate-200 bg-white p-8 md:p-10"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-slate-400">
                Assignment Overview
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
                {assignment.title}
              </h1>
            </div>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed">
              {assignment.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                #{assignment.id.toUpperCase()}
              </span>
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#1F4E8C' }}
              >
                Target Fix: {assignment.targetFix.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {blindGateActive ? (
              <button
                onClick={() => router.push(`/dashboard/evaluation/${id}/calibrate`)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#1F4E8C' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E3A5F' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1F4E8C' }}
              >
                <EyeOff className="h-4 w-4" />
                Start Blind Grading
              </button>
            ) : (
              <button
                onClick={() => router.push(`/dashboard/evaluation/${id}/grading`)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#1F4E8C' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E3A5F' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1F4E8C' }}
              >
                Enter Grading Desk
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="submissions" className="space-y-8" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-0">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger
              value="submissions"
              className="px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none text-xs font-semibold tracking-wider text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 transition-colors"
              style={{
                borderBottomColor: activeTab === "submissions" ? '#1F4E8C' : 'transparent',
              }}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none text-xs font-semibold tracking-wider text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 transition-colors"
              style={{
                borderBottomColor: activeTab === "analytics" ? '#1F4E8C' : 'transparent',
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none text-xs font-semibold tracking-wider text-slate-500 hover:text-slate-700 data-[state=active]:text-slate-900 transition-colors"
              style={{
                borderBottomColor: activeTab === "preview" ? '#1F4E8C' : 'transparent',
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="submissions" className="space-y-8 outline-none mt-6">
          {blindGateActive ? (
            /* ── Blind grading gate ── */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl flex flex-col items-center justify-center min-h-[520px] p-12 text-center space-y-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <EyeOff className="h-7 w-7 text-primary/60" />
              </div>

              <div className="space-y-3 max-w-md">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {blindHasStarted ? `${blindRemainingCount} submission${blindRemainingCount !== 1 ? 's' : ''} to go` : 'Blind grading required'}
                </h2>
                {blindHasStarted ? (
                  <>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You've graded <span className="font-semibold text-foreground">{blindGradedCount} of {blindTotalCount}</span> benchmark submissions.
                      Setting this benchmark makes the remaining grading faster and more consistent.
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      We'll show the AI comparison and full submissions list once all {blindTotalCount} are done.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You'll manually grade <span className="font-semibold text-foreground">{blindTotalCount} submission{blindTotalCount !== 1 ? 's' : ''}</span> without seeing AI scores first.
                      Setting the benchmark makes the remaining grading faster and more consistent.
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      We'll show the AI comparison and full submissions list once you're done.
                    </p>
                  </>
                )}
              </div>

              <Button
                size="lg"
                className="rounded-full px-10 shadow-xl shadow-primary/20 hover:scale-105 transition-all gap-2"
                onClick={() => router.push(`/dashboard/evaluation/${id}/calibrate`)}
              >
                {blindHasStarted ? 'Continue' : 'Begin'}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-muted-foreground/40 italic">
                Submissions list is locked until blind grading is complete
              </p>
            </motion.div>
          ) : (
            <>
              {/* Cohort-level publish — final step after all per-student grades
                  are submitted. Spot-check gate fires here if the instructor
                  ignored nudges repeatedly during the session. */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="eyebrow text-primary">Ready to finalize</p>
                    <h3 className="text-lg font-semibold text-foreground">
                      {cohortPublished ? "Cohort grades published" : "Publish cohort grades"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {cohortPublished
                        ? "All submissions for this assignment have been released to students."
                        : "Review the cohort below, then publish to release grades to all students in this assignment."}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handlePublishCohort}
                    disabled={cohortPublished}
                    variant={cohortPublished ? "outline" : "default"}
                    className={cohortPublished
                      ? "gap-2 border-[color:var(--status-success)]/40 text-[color:var(--status-success)] bg-[color:var(--status-success-bg)]"
                      : "gap-2"}
                  >
                    {cohortPublished ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Published
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Publish cohort grades
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

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
            </>
          )}
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
