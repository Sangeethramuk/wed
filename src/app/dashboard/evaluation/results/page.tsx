"use client"

import { Suspense, useMemo, useState, useRef, useEffect } from "react"
import { useGradingStore } from "@/lib/store/grading-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  ShieldAlert, TrendingDown, Users, BarChart3, Lock,
  ArrowRight, BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Course selector dropdown ───────────────────────────────────────────────────

function CourseDropdown({
  courses,
  selected,
  onChange,
}: {
  courses: { id: string; label: string }[]
  selected: string | null
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const label = selected ? courses.find(c => c.id === selected)?.label : "Select a course"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors min-w-[180px] justify-between"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1F4E8C] shrink-0" />
          {label}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg z-50 py-1" style={{ boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
          {courses.map((c, i) => {
            const colors = ["#1F4E8C", "#10B981", "#6D28D9", "#64748B", "#F59E0B", "#EF4444"]
            return (
              <button
                key={c.id}
                onClick={() => { onChange(c.id); setOpen(false) }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                {c.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <BarChart3 className="w-6 h-6 text-slate-400" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-slate-900">Select a course to see insights</p>
        <p className="text-sm text-slate-400 max-w-xs">
          Choose a course from the dropdown above to see how your class is doing, which students need attention, and how your grading is going.
        </p>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ResultInsightsPage() {
  return (
    <Suspense fallback={null}>
      <ResultInsights />
    </Suspense>
  )
}

function ResultInsights() {
  const { assignments, criterionFeedbacks, overallFeedback } = useGradingStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"courses" | "grading">("courses")

  const courses = useMemo(
    () => Object.values(assignments).map(a => ({ id: a.id, label: a.title })),
    [assignments]
  )

  const assignment = selectedId ? assignments[selectedId] : null
  const students = assignment?.students ?? []

  // ── Derived insights ─────────────────────────────────────────────────────────

  const insights = useMemo(() => {
    if (!assignment || students.length === 0) return null

    // Per-student avg score
    const studentRows = students.map(s => {
      const criteria = Object.values(s.criteria)
      const avgLevel = criteria.length > 0 ? criteria.reduce((sum, c) => sum + c.level, 0) / criteria.length : 0
      const scorePct = Math.round((avgLevel / 5) * 100)
      return { student: s, scorePct, criteria }
    })

    const classAvg = Math.round(studentRows.reduce((sum, r) => sum + r.scorePct, 0) / studentRows.length)

    // Criterion struggle analysis
    const criterionIds = students.length > 0 ? Object.keys(students[0].criteria) : []
    const criterionData = criterionIds.map(cid => {
      const name = students[0].criteria[cid]?.name ?? cid
      const levels = students.map(s => s.criteria[cid]?.level ?? 0)
      const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length
      const below50Count = levels.filter(l => (l / 5) * 100 < 50).length
      const below60Count = levels.filter(l => (l / 5) * 100 < 60).length

      // AI changes: instructor_edited authorship
      const editedCount = students.filter(s => {
        const fb = criterionFeedbacks[s.id]?.[cid]
        return fb?.authorship === "instructor_edited"
      }).length

      const agreedCount = students.filter(s => {
        const fb = criterionFeedbacks[s.id]?.[cid]
        return fb?.authorship === "ai_generated" && fb?.isConfirmed
      }).length
      const confirmedCount = students.filter(s => criterionFeedbacks[s.id]?.[cid]?.isConfirmed).length
      const agreementPct = confirmedCount > 0 ? Math.round((agreedCount / confirmedCount) * 100) : 0

      return { cid, name, avgLevel, below50Count, below60Count, editedCount, agreementPct, confirmedCount }
    })

    // Top struggling criteria (sorted by below-50 count)
    const strugglingCriteria = [...criterionData]
      .filter(c => c.below50Count > 0 || c.below60Count > 0)
      .sort((a, b) => b.below50Count - a.below50Count)
      .slice(0, 3)

    // Students needing attention: score < 50% or flagged
    const atRiskStudents = studentRows
      .filter(r => r.scorePct < 50 || r.student.status !== "clean")
      .sort((a, b) => a.scorePct - b.scorePct)
      .slice(0, 4)

    // AI grading stats
    const totalEdited = criterionData.reduce((sum, c) => sum + c.editedCount, 0)
    const mostEditedCriterion = [...criterionData].sort((a, b) => b.editedCount - a.editedCount)[0]
    const mostAgreedCriterion = [...criterionData].sort((a, b) => b.agreementPct - a.agreementPct)[0]

    const submittedCount = students.filter(s => overallFeedback[s.id]?.isSubmitted).length
    const totalAIChanges = totalEdited

    // Section anomaly: compare first half vs second half avg
    const half = Math.floor(studentRows.length / 2)
    const sectionAAvg = half > 0 ? Math.round(studentRows.slice(0, half).reduce((s, r) => s + r.scorePct, 0) / half) : 0
    const sectionBAvg = half > 0 ? Math.round(studentRows.slice(half).reduce((s, r) => s + r.scorePct, 0) / (studentRows.length - half)) : 0
    const sectionGap = Math.abs(sectionAAvg - sectionBAvg)

    return {
      classAvg,
      studentCount: students.length,
      submittedCount,
      strugglingCriteria,
      atRiskStudents,
      totalAIChanges,
      mostEditedCriterion,
      mostAgreedCriterion,
      sectionAAvg,
      sectionBAvg,
      sectionGap,
    }
  }, [assignment, students, criterionFeedbacks, overallFeedback])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Privacy banner */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-500" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <span>🔒 Only you see this · Your insights are always private · HOD is notified only if something looks very unusual</span>
          <button className="text-[#1F4E8C] font-medium hover:underline">Privacy settings →</button>
        </div>
      </div>

      {/* Controls bar */}
      <div className="px-6 pt-4 flex items-center gap-3 flex-wrap">
        {/* Tab toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-0.5">
          <button
            onClick={() => setActiveTab("courses")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === "courses" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" /> Courses
          </button>
          <button
            onClick={() => setActiveTab("grading")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === "grading" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" /> My Grading
          </button>
        </div>

        {/* Course selector */}
        <CourseDropdown courses={courses} selected={selectedId} onChange={setSelectedId} />

        {/* Semester filter */}
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
          This Semester <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {!selectedId || !insights ? (
          <EmptyState />
        ) : (
          <>
            {/* Course header card */}
            <Card className="bg-white border border-slate-200 rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F4E8C]" />
                    <h2 className="text-base font-semibold text-slate-900">{assignment!.title}</h2>
                  </div>
                  <p className="text-xs text-slate-400 ml-4.5">
                    {insights.studentCount} students
                  </p>
                </div>
                <button className="text-xs font-medium text-[#1F4E8C] flex items-center gap-1 hover:underline">
                  📝 See Insights <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${insights.classAvg}%`, backgroundColor: insights.classAvg >= 70 ? "#10B981" : insights.classAvg >= 50 ? "#F59E0B" : "#EF4444" }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700 shrink-0">{insights.classAvg}% avg</span>
              </div>
            </Card>

            {/* Where students struggled most */}
            {insights.strugglingCriteria.length > 0 && (
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-400 mb-2 px-1">WHERE STUDENTS STRUGGLED MOST</p>
                <div className="space-y-2">
                  {insights.strugglingCriteria.map((c, i) => {
                    const isCritical = c.below50Count > insights.studentCount * 0.4
                    return (
                      <Card
                        key={c.cid}
                        className="bg-white border rounded-xl p-4"
                        style={{
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          borderColor: isCritical ? "#FECACA" : "#FDE68A",
                          backgroundColor: isCritical ? "#FFF5F5" : "#FFFBEB",
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full shrink-0", isCritical ? "bg-red-500" : "bg-amber-400")} />
                              <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                            </div>
                            <p className="text-xs text-slate-500 ml-4">
                              {isCritical
                                ? `${c.below50Count} of ${insights.studentCount} students scored below 50%`
                                : `${c.below60Count} of ${insights.studentCount} students scored below 60%`}
                            </p>
                            <p className="text-xs text-slate-400 italic ml-4">
                              {isCritical
                                ? `"This topic may need more time in class next semester"`
                                : `"Students are getting there — worth more practice examples"`}
                            </p>
                          </div>
                          <button className="text-xs font-medium text-[#1F4E8C] hover:underline whitespace-nowrap flex items-center gap-1 shrink-0 ml-4">
                            Review criterion <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Students who need attention */}
            {insights.atRiskStudents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-semibold tracking-wider text-slate-400">STUDENTS WHO NEED ATTENTION</p>
                  <p className="text-xs text-slate-400">{insights.atRiskStudents.length} student{insights.atRiskStudents.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="space-y-2">
                  {insights.atRiskStudents.map(r => {
                    const initials = r.student.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                    const isFlagged = r.student.status !== "clean"
                    const avatarColors = ["#1F4E8C", "#10B981", "#F59E0B", "#6D28D9"]
                    const colorIdx = r.student.id.charCodeAt(0) % avatarColors.length

                    return (
                      <Card key={r.student.id} className="bg-white border border-slate-200 rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ backgroundColor: avatarColors[colorIdx] }}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{r.student.name}</p>
                              <p className="text-xs text-slate-400">
                                {r.scorePct < 50 ? `Below 50% overall (${r.scorePct}%)` : "Integrity flag detected"}
                              </p>
                              {isFlagged && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                  <ShieldAlert className="h-2.5 w-2.5" /> Flagged
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="text-xs font-medium text-[#1F4E8C] hover:underline flex items-center gap-1 shrink-0">
                            See submission <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
                <button className="w-full mt-2 text-sm font-medium text-[#1F4E8C] hover:underline py-2 text-center">
                  See all {insights.studentCount} students →
                </button>
              </div>
            )}

            {/* How you graded this course — private */}
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 mb-1 px-1">HOW YOU GRADED THIS COURSE</p>
              <p className="text-xs text-slate-400 px-1 mb-2 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Only you see this section
              </p>

              <div className="space-y-2">
                {/* AI Score Changes */}
                <Card className="bg-white border border-slate-200 rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p className="text-xs font-semibold tracking-wider text-slate-400 mb-3">AI SCORE CHANGES · THIS COURSE</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-semibold text-slate-900 tabular-nums">{insights.totalAIChanges}</span>
                    <span className="text-sm text-slate-500">scores changed from AI suggestions</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (insights.totalAIChanges / Math.max(insights.studentCount * 3, 1)) * 100)}%`,
                        backgroundColor: "#1F4E8C"
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Healthy range
                    </span>
                    {insights.mostEditedCriterion && (
                      <span className="text-xs text-slate-400">
                        Most changes on {insights.mostEditedCriterion.name}
                      </span>
                    )}
                  </div>
                </Card>

                {/* Where you changed AI most */}
                {insights.mostEditedCriterion && insights.mostEditedCriterion.editedCount > 0 && (
                  <Card className="bg-white border border-slate-200 rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <p className="text-xs font-semibold tracking-wider text-slate-400 mb-3">WHERE YOU CHANGED AI MOST</p>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{insights.mostEditedCriterion.name}</p>
                          <span className="text-xs text-slate-400">Changed {insights.mostEditedCriterion.editedCount} time{insights.mostEditedCriterion.editedCount !== 1 ? "s" : ""}</span>
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm">
                          The description for this criterion may need to be clearer — when you change the AI often on one topic, it usually means the grading guide needs more specific language.
                        </p>
                      </div>
                      <button className="text-xs font-medium text-[#1F4E8C] hover:underline flex items-center gap-1 shrink-0 ml-4 whitespace-nowrap">
                        Improve this criterion <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </Card>
                )}

                {/* Where you and AI agreed most */}
                {insights.mostAgreedCriterion && insights.mostAgreedCriterion.agreementPct > 0 && (
                  <Card className="bg-white border border-slate-200 rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <p className="text-xs font-semibold tracking-wider text-slate-400 mb-3">WHERE YOU AND AI AGREED MOST</p>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{insights.mostAgreedCriterion.name}</p>
                      <span className="text-xs font-semibold text-emerald-600">{insights.mostAgreedCriterion.agreementPct}% agreement</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Your grading guide for this criterion is very clear. This is what good looks like.
                    </p>
                  </Card>
                )}

                {/* Section anomaly */}
                {insights.sectionGap >= 8 && (
                  <Card className="bg-amber-50 border border-amber-200 rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-amber-700">One thing worth checking</p>
                    </div>
                    <p className="text-xs text-amber-600 mb-3 ml-6">
                      Section A scored {insights.sectionGap}% {insights.sectionAAvg < insights.sectionBAvg ? "lower" : "higher"} than Section B on the same assignment. This could be a genuine performance difference — or worth a quick look before releasing grades.
                    </p>
                    <button className="ml-6 text-xs font-medium text-[#1F4E8C] hover:underline flex items-center gap-1">
                      Compare sections <ArrowRight className="h-3 w-3" />
                    </button>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
