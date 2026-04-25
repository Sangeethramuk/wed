"use client"

import { useEvaluationOverviewStore, EvaluationAssignment } from "@/lib/store/evaluation-overview-store"
import { useGradingStore } from "@/lib/store/grading-store"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Zap,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react"

// Migrated to the EducAItors DS guide: white group cards with an inline
// 0 1px 3px rgba(0,0,0,0.04) shadow, slate border + hover, Inter text ramp,
// and brand #1F4E8C CTAs. Type + calibration signals are delivered with
// hex-based accent chips so they pop against the white surfaces.

const TYPE_BADGE: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  Project:      { bg: "#EFF6FF", color: "#1F4E8C", border: "#BFDBFE" }, // blue-50 / brand / blue-200
  MCQ:          { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" }, // slate
  Essay:        { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" }, // amber-50 / -700 / -200
  "Lab Record": { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE" }, // blue-50 / -800 / -200
  "Case Study": { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" }, // violet
  Viva:         { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" }, // emerald
}

function TypeBadge({ type }: { type: string }) {
  const palette = TYPE_BADGE[type] ?? TYPE_BADGE.MCQ
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border"
      style={{ backgroundColor: palette.bg, color: palette.color, borderColor: palette.border }}
    >
      {type}
    </span>
  )
}

function CalibrationBadge({ state }: { state: EvaluationAssignment["calibrationState"] }) {
  if (state === "complete") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#10B981" }}>
        <CheckCircle2 className="h-3 w-3" /> Calibrated
      </span>
    )
  }
  if (state === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold animate-pulse" style={{ color: "#F59E0B" }}>
        <Zap className="h-3 w-3" /> In Progress
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
      <Clock className="h-3 w-3" /> Not Started
    </span>
  )
}

function AssignmentRow({ assignment }: { assignment: EvaluationAssignment }) {
  const router = useRouter()
  const { calibration, initCalibration } = useGradingStore()

  const calData = calibration[assignment.id]
  const isCalibrated = calData?.phase === "complete" || assignment.calibrationState === "complete"

  const handleAction = () => {
    if (assignment.gradingStatus === "complete") {
      router.push(`/dashboard/evaluation/results?id=${assignment.id}`)
      return
    }
    
    if (!isCalibrated) {
      if (!calData) initCalibration(assignment.id)
      router.push(`/dashboard/evaluation/${assignment.id}/calibrate`)
      return
    }
    
    router.push(`/dashboard/evaluation/${assignment.id}`)
  }

  const actionLabel = () => {
    if (assignment.gradingStatus === "complete") return "View Insights"
    if (!isCalibrated && (!calData || calData.phase === "not_started")) return "Begin Calibration"
    if (!isCalibrated && calData?.phase && calData.phase !== "complete") return "Continue Calibration"
    return "Enter Desk"
  }

  const isWarningAction = !isCalibrated && assignment.gradingStatus !== "complete"
  const isCompleteAction = assignment.gradingStatus === "complete"

  const gradingProgress =
    assignment.totalSubmissions > 0
      ? Math.round((assignment.gradedSubmissions / assignment.totalSubmissions) * 100)
      : 0

  const statusDotColor =
    assignment.gradingStatus === "complete"
      ? "#10B981"
      : assignment.gradingStatus === "in_grading"
        ? "#1F4E8C"
        : "#F59E0B"

  const progressBarColor =
    assignment.gradingStatus === "complete"
      ? "#10B981"
      : "#1F4E8C"

  return (
    <div
      onClick={handleAction}
      className="group flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-200 last:border-0 cursor-pointer"
    >
      {/* Status dot */}
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${assignment.gradingStatus === "in_grading" ? "animate-pulse" : ""}`}
        style={{ backgroundColor: statusDotColor }}
      />

      {/* Assignment info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-slate-900 truncate">{assignment.title}</span>
          <TypeBadge type={assignment.assignmentType} />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold">{assignment.courseCode}</span>
          <span>·</span>
          <span>{assignment.semester}</span>
          <span>·</span>
          <span>Due {assignment.dueDate}</span>
        </div>
      </div>

      {/* Papers count */}
      <div className="w-16 text-right shrink-0">
        <p className="text-sm font-semibold tabular-nums text-slate-900">{assignment.totalSubmissions}</p>
        <p className="text-[10px] font-semibold text-slate-400 tracking-wider">Papers</p>
      </div>

      {/* Flags */}
      <div className="w-14 shrink-0 flex justify-center">
        {assignment.integrityFlags > 0 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border animate-pulse cursor-help" style={{ backgroundColor: "#FEF2F2", color: "#EF4444", borderColor: "#FECACA" }} />}>
                <ShieldAlert className="h-2.5 w-2.5" /> {assignment.integrityFlags}
              </TooltipTrigger>
              <TooltipContent>
                {assignment.integrityFlags} integrity flag{assignment.integrityFlags > 1 ? "s" : ""} detected
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </div>

      {/* Grading progress */}
      <div className="w-24 shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums">
          <span className="text-slate-900">{assignment.gradedSubmissions}</span>
          <span className="text-slate-300 mx-0.5 text-xs">/</span>
          <span className="text-slate-400 text-xs">{assignment.totalSubmissions}</span>
        </p>
        <div className="h-1 w-full mt-1 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${gradingProgress}%`, backgroundColor: progressBarColor }}
          />
        </div>
      </div>

      {/* Action */}
      <div className="shrink-0 w-40">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleAction()
          }}
          className="inline-flex items-center justify-center gap-1.5 w-full h-9 px-4 rounded-lg text-xs font-semibold tracking-wider transition-colors group/btn"
          style={
            isCompleteAction
              ? { backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0" }
              : isWarningAction
                ? { backgroundColor: "#F59E0B", color: "#FFFFFF" }
                : { backgroundColor: "#1F4E8C", color: "#FFFFFF" }
          }
          onMouseEnter={(e) => {
            if (isCompleteAction) e.currentTarget.style.backgroundColor = "#F8FAFC"
            else if (isWarningAction) e.currentTarget.style.backgroundColor = "#D97706"
            else e.currentTarget.style.backgroundColor = "#1E3A5F"
          }}
          onMouseLeave={(e) => {
            if (isCompleteAction) e.currentTarget.style.backgroundColor = "#FFFFFF"
            else if (isWarningAction) e.currentTarget.style.backgroundColor = "#F59E0B"
            else e.currentTarget.style.backgroundColor = "#1F4E8C"
          }}
        >
          {actionLabel()}
          <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}

function DeptGroup({ department, assignments }: { department: string; assignments: EvaluationAssignment[] }) {
  const [open, setOpen] = useState(true)
  const totalFlags = assignments.reduce((s, a) => s + a.integrityFlags, 0)

  return (
    <div
      className="rounded-xl overflow-hidden bg-white border border-slate-200"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      {/* Group header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#1F4E8C" }} />
          <span className="text-sm font-semibold text-slate-900">{department}</span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border border-slate-200 bg-slate-50 text-slate-600">
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-slate-500">
          {totalFlags > 0 && (
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: "#F59E0B" }}>
              <AlertCircle className="h-3 w-3" /> {totalFlags} flag{totalFlags !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </div>

      {/* Column headers */}
      {open && (
        <div className="flex items-center gap-4 px-5 py-2 bg-slate-50 border-t border-slate-200 border-b border-slate-200">
          <div className="w-1.5 shrink-0" />
          <div className="flex-1 text-[10px] font-semibold tracking-wider text-slate-400">Assignment</div>
          <div className="w-16 text-right text-[10px] font-semibold tracking-wider text-slate-400 shrink-0">Papers</div>
          <div className="w-14 text-center text-[10px] font-semibold tracking-wider text-slate-400 shrink-0">Flags</div>
          <div className="w-24 text-right text-[10px] font-semibold tracking-wider text-slate-400 shrink-0">Progress</div>
          <div className="w-40 shrink-0" />
        </div>
      )}

      {/* Rows */}
      {open && assignments.map((a) => <AssignmentRow key={a.id} assignment={a} />)}
    </div>
  )
}

export function AssignmentTable() {
  const { getFilteredAssignments, getDepartments } = useEvaluationOverviewStore()
  const filtered = getFilteredAssignments()
  const departments = getDepartments()

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-400">No assignments match current filters</p>
      </div>
    )
  }

  return (
    <TooltipProvider delay={100}>
      <div className="space-y-4">
        {departments.map((dept) => {
          const deptAssignments = filtered.filter((a) => a.department === dept)
          if (deptAssignments.length === 0) return null
          return <DeptGroup key={dept} department={dept} assignments={deptAssignments} />
        })}
      </div>
    </TooltipProvider>
  )
}

// Re-export so existing imports of CalibrationBadge don't break.
export { CalibrationBadge }
