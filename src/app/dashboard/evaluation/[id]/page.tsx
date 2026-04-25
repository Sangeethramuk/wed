"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useGradingStore } from "@/lib/store/grading-store"
import { useEvaluationOverviewStore } from "@/lib/store/evaluation-overview-store"
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
import { AssignmentSubmissionsTable } from "@/components/evaluation/assignment-submissions-table"
import { AssignmentPreviewBody } from "@/components/pre-evaluation/student-preview"
import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { motion } from "framer-motion"
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

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
  const previewAssignment = usePreEvalStore(s => s.assignment)
  const previewRubric = usePreEvalStore(s => s.rubric)
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

  // The Triage overview store is the source of truth for whether a row's
  // calibration is complete — the grading store's per-assignment calibration
  // phase may lag behind (e.g., the row is marked complete in the mock data
  // but no one actually ran the flow in this session). Treat either signal
  // as sufficient so "Enter Desk" rows don't incorrectly show the blind gate.
  const overviewAssignment = useEvaluationOverviewStore(s =>
    s.assignments.find(a => a.id === id)
  )
  const requiresBlindGrading = assignment?.students.some(s => s.isDoubleBlind)
  const calibrationComplete =
    calibration[id]?.phase === 'complete' ||
    overviewAssignment?.calibrationState === 'complete'
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
  // The Triage overview is the canonical source of "is this calibration in
  // progress?" — its calibrationStatus is 0 / 0-99 / 100. The grading-store
  // numbers above are accurate per-paper but only for a session that has
  // actually run; treat the overview as authoritative for the start vs
  // continue copy variant on the gate card.
  const overviewCalProgress = overviewAssignment?.calibrationStatus ?? 0
  const blindHasStarted = blindGradedCount > 0 || overviewCalProgress > 0
  const blindRemainingCount = Math.max(blindTotalCount - blindGradedCount, 0)
  // Publish CTA in the metadata bar only appears once cohort grading reads
  // complete on the Triage overview store. The standalone "Ready to finalize"
  // card has been removed in favor of this metadata-bar CTA.
  const gradingComplete = overviewAssignment?.gradingStatus === 'complete'

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

  // Stats per EDUCAITORS_DS_GUIDE.md: hex accents, number takes the accent,
  // icon sits in a soft-tinted square of the same hue, slate-400 label.
  const stats: { label: string; value: string; subtext?: string; icon: typeof Users; accent: string }[] = [
    { label: "Submissions", value: "42 / 50 Submitted", icon: Users, accent: "#1F4E8C" },
    { label: "To Grade", value: "14 Remaining", icon: Clock, accent: "#F59E0B" },
  ]

  const handleStudentSelect = (studentId: string) => {
    router.push(`/dashboard/evaluation/${id}/grading?studentId=${studentId}`)
  }

  const handleBulkApprove = (ids: string[]) => {
    setGradedSubmissions(prev => [...new Set([...prev, ...ids])])
  }

  // Check if all submissions are ready (for publish button enablement)
  // Since we are using mock data in the table, we'll assume there are 14 more to grade
  const allSubmissionsReady = false 
  const remainingToGrade = 14

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

      {/* Metadata panel — flat (no card chrome). Eyebrow + title +
          description + badges live on the left, the Publish cohort grades
          CTA is the only action and only appears when the cohort grading
          status reads complete (and after publish locks in 'Published'
          confirmation). Per-assignment workflow entry happens via the
          submissions cohort table rows below — no hero CTA here. */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold tracking-wider text-slate-400">
            Computer Science • Class 10A
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            {assignment.title}
          </h1>
          <p className="text-sm md:text-base text-slate-500 leading-relaxed">
            {assignment.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Deadline: <span className="text-slate-900">Oct 24, 2024</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Total Students: <span className="text-slate-900">50</span>
            </div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
              #{assignment.id.toUpperCase()}
            </span>
          </div>
        </div>
        {/* Publish Grades Button — disabled until all ready.
            Added tooltip on hover if disabled. */}
        <div className="group relative">
          <button
            onClick={handlePublishCohort}
            disabled={!allSubmissionsReady || cohortPublished}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed shrink-0"
            style={
              cohortPublished
                ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, color: '#047857' }
                : !allSubmissionsReady 
                  ? { backgroundColor: '#F1F5F9', color: '#94A3B8', border: '1px solid #E2E8F0' }
                  : { backgroundColor: '#1F4E8C', color: '#FFFFFF' }
            }
            onMouseEnter={(e) => {
              if (allSubmissionsReady && !cohortPublished) e.currentTarget.style.backgroundColor = '#1E3A5F'
            }}
            onMouseLeave={(e) => {
              if (allSubmissionsReady && !cohortPublished) e.currentTarget.style.backgroundColor = '#1F4E8C'
            }}
          >
            {cohortPublished ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Published
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Publish grades
              </>
            )}
          </button>
          {!allSubmissionsReady && !cohortPublished && (
            <div className="absolute top-full right-0 mt-2 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              You still need to grade {remainingToGrade} submissions
            </div>
          )}
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
            /* ── Blind grading gate — white card, slate palette, navy CTA ── */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center min-h-[520px] p-12 text-center space-y-8"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
              >
                <EyeOff className="h-7 w-7" style={{ color: '#1F4E8C' }} />
              </div>

              <div className="space-y-3 max-w-md">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {blindHasStarted ? 'Continue blind grading' : 'Blind grading required'}
                </h2>
                {blindHasStarted ? (
                  <>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {blindGradedCount > 0 ? (
                        <>You&apos;ve graded <span className="font-semibold text-slate-900">{blindGradedCount} of {blindTotalCount}</span> benchmark submissions.</>
                      ) : (
                        <>You&apos;re <span className="font-semibold text-slate-900">{overviewCalProgress}%</span> through this calibration. Pick up where you left off.</>
                      )}
                      {' '}Setting this benchmark makes the remaining grading faster and more consistent.
                    </p>
                    <p className="text-xs text-slate-400">
                      We&apos;ll show the AI comparison and full submissions list once calibration is complete.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      You&apos;ll manually grade <span className="font-semibold text-slate-900">{blindTotalCount} submission{blindTotalCount !== 1 ? 's' : ''}</span> without seeing AI scores first.
                      Setting the benchmark makes the remaining grading faster and more consistent.
                    </p>
                    <p className="text-xs text-slate-400">
                      We&apos;ll show the AI comparison and full submissions list once you&apos;re done.
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={() => router.push(`/dashboard/evaluation/${id}/calibrate`)}
                className="inline-flex items-center gap-2 h-11 px-8 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#1F4E8C' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E3A5F' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1F4E8C' }}
              >
                {blindHasStarted ? 'Continue' : 'Begin'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-xs text-slate-400">
                Submissions list is locked until blind grading is complete
              </p>
            </motion.div>
          ) : (
            <>
              {/* Stats Cards Row — white cards, inline shadow, hex accents */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div
                      className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 h-full"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                      <div className="flex flex-col h-full justify-between gap-3">
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{stat.label}</p>
                          <div 
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: `${stat.accent}10` }}
                          >
                            <stat.icon className="h-4 w-4" style={{ color: stat.accent }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p
                            className="text-lg font-bold tracking-tight text-slate-900"
                          >
                            {stat.value}
                          </p>
                          <p className="text-xs text-slate-500 font-medium whitespace-pre-line">
                            {stat.subtext}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Full Width Submissions Table */}
              <AssignmentSubmissionsTable onRowClick={handleStudentSelect} />
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="outline-none pt-6">
          <Empty className="bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] py-24">
            <EmptyContent>
              <EmptyMedia variant="icon" className="bg-blue-50 text-[#1F4E8C] size-12">
                <BarChart3 className="size-6" />
              </EmptyMedia>
              <EmptyTitle className="text-lg font-semibold text-slate-900">No data available yet</EmptyTitle>
              <EmptyDescription className="text-slate-500">
                Advanced performance tracking and cohort benchmarking metrics are being calibrated for this course.
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        </TabsContent>

        <TabsContent value="preview" className="outline-none pt-6">
          <AssignmentPreviewBody
            assignment={{
              ...previewAssignment,
              title: assignment?.title ?? previewAssignment.title,
              brief: assignment?.description ?? previewAssignment.brief,
            }}
            rubric={previewRubric}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
