"use client"

import { useEvaluationOverviewStore, EvaluationAssignment } from "@/lib/store/evaluation-overview-store"
import { useGradingStore } from "@/lib/store/grading-store"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CategoryBadge } from "@/components/ui/category-badge"
import { ColorDot } from "@/components/ui/color-dot"
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
  BarChart3,
} from "lucide-react"

const TYPE_BADGE: Record<string, string> = {
  Project: "bg-primary/10 text-primary border-primary/20",
  MCQ: "bg-muted text-muted-foreground border-border",
  Essay: "bg-[color:var(--status-warning)]/10 text-[color:var(--status-warning)] dark:text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30/40",
  "Lab Record": "bg-[color:var(--status-info)]/10 text-[color:var(--status-info)] dark:text-[color:var(--status-info)] border-[color:var(--status-info)]/30/40",
  "Case Study": "bg-[color:var(--category-2)]/10 text-[color:var(--category-2)] dark:text-[color:var(--category-2)] border-[color:var(--category-2)]/30/40",
  Viva: "bg-[color:var(--category-2)]/10 text-[color:var(--category-2)] dark:text-[color:var(--category-2)] border-[color:var(--category-2)]/30/40",
}

function CalibrationBadge({ state }: { state: EvaluationAssignment["calibrationState"] }) {
  if (state === "complete") return (
    <span className="eyebrow flex items-center gap-1 text-[color:var(--status-success)] dark:text-[color:var(--status-success)]">
      <CheckCircle2 className="h-3 w-3" /> Calibrated
    </span>
  )
  if (state === "in_progress") return (
    <span className="eyebrow flex items-center gap-1 text-[color:var(--status-warning)] dark:text-[color:var(--status-warning)] animate-pulse">
      <Zap className="h-3 w-3" /> In Progress
    </span>
  )
  return (
    <span className="eyebrow flex items-center gap-1 text-muted-foreground/50">
      <Clock className="h-3 w-3" /> Not Started
    </span>
  )
}

function AssignmentRow({ assignment }: { assignment: EvaluationAssignment }) {
  const router = useRouter()
  const { calibration } = useGradingStore()

  const calData = calibration[assignment.id]
  const isCalibrated = calData?.phase === "complete" || assignment.calibrationState === "complete"

  const handleAction = () => {
    router.push(`/dashboard/evaluation/${assignment.id}`)
  }

  const actionLabel = () => {
    if (assignment.gradingStatus === "complete") return "View Results"
    if (!isCalibrated && (!calData || calData.phase === "not_started")) return "Begin Calibration"
    if (!isCalibrated && calData?.phase && calData.phase !== "complete") return "Continue Calibration"
    return "Enter Desk"
  }

  const actionVariant = () => {
    if (assignment.gradingStatus === "complete") return "outline" as const
    if (!isCalibrated) return "default" as const
    return "default" as const
  }

  const gradingProgress = assignment.totalSubmissions > 0
    ? Math.round((assignment.gradedSubmissions / assignment.totalSubmissions) * 100)
    : 0

  return (
    <div 
      onClick={handleAction}
      className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-all border-b border-border/30 last:border-0 cursor-pointer"
    >
      {/* Status dot */}
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
        assignment.gradingStatus === "complete" ? "bg-[color:var(--status-success)]" :
        assignment.gradingStatus === "in_grading" ? "bg-primary animate-pulse" :
        "bg-[color:var(--status-warning)]"
      }`} />

      {/* Assignment info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-foreground truncate">{assignment.title}</span>
          <Badge variant="outline" className={`text-xs font-semibold tracking-wider shrink-0 ${TYPE_BADGE[assignment.assignmentType] ?? ""}`}>
            {assignment.assignmentType}
          </Badge>
        </div>
        <div className="eyebrow flex items-center gap-3 text-muted-foreground/50">
          <span>{assignment.courseCode}</span>
          <span>·</span>
          <span>{assignment.semester}</span>
          <span>·</span>
          <span>Due {assignment.dueDate}</span>
        </div>
      </div>

      {/* Papers count */}
      <div className="w-16 text-right shrink-0">
        <p className="text-sm font-semibold tabular-nums text-foreground">{assignment.totalSubmissions}</p>
        <p className="text-xs font-bold text-muted-foreground/40 tracking-wider">Papers</p>
      </div>

      {/* Flags */}
      <div className="w-14 shrink-0 flex justify-center">
        {assignment.integrityFlags > 0 ? (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="gap-1 px-2 py-0.5 text-xs font-semibold animate-pulse cursor-help">
                <ShieldAlert className="h-2.5 w-2.5" /> {assignment.integrityFlags}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{assignment.integrityFlags} integrity flag{assignment.integrityFlags > 1 ? "s" : ""} detected</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs font-semibold text-muted-foreground/20">—</span>
        )}
      </div>

      {/* Grading progress */}
      <div className="w-24 shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums">
          <span className="text-foreground">{assignment.gradedSubmissions}</span>
          <span className="text-muted-foreground/30 mx-0.5 text-xs">/</span>
          <span className="text-muted-foreground/50 text-xs">{assignment.totalSubmissions}</span>
        </p>
        <Progress value={gradingProgress} className="h-0.5 mt-1 bg-muted/30" />
      </div>

      {/* Action */}
      <div className="shrink-0 w-36">
        <Button
          size="sm"
          variant={actionVariant()}
          onClick={handleAction}
          className={`eyebrow w-full rounded-full h-8 transition-all group/btn ${
            !isCalibrated && assignment.gradingStatus !== "complete"
              ? "bg-[color:var(--status-warning)] hover:bg-[color:var(--status-warning)] text-primary-foreground border-[color:var(--status-warning)] shadow-lg shadow-amber-500/20"
              : ""
          }`}
        >
          {actionLabel()}
          <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </div>
  )
}

function DeptGroup({ department, assignments }: { department: string; assignments: EvaluationAssignment[] }) {
  const [open, setOpen] = useState(true)
  const avgCal = Math.round(assignments.reduce((s, a) => s + a.calibrationStatus, 0) / assignments.length)
  const totalFlags = assignments.reduce((s, a) => s + a.integrityFlags, 0)

  return (
    <div className="border border-border/40 rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm">
      {/* Group Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-3.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 flex-1">
          <ColorDot color={{ kind: "category", value: department }} size="md" />
          <span className="eyebrow text-foreground/80">{department}</span>
          <CategoryBadge category={department} showDot={false} className="text-xs font-semibold tracking-wider">
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
          </CategoryBadge>
        </div>
        <div className="eyebrow flex items-center gap-5 text-muted-foreground/40">
          <Tooltip>
            <TooltipTrigger render={<span className="flex items-center gap-1.5 cursor-help" />}>
              <BarChart3 className="h-3 w-3" /> Avg Cal: {avgCal}%
            </TooltipTrigger>
            <TooltipContent>Average calibration confidence across this department</TooltipContent>
          </Tooltip>
          {totalFlags > 0 && (
            <span className="flex items-center gap-1.5 text-[color:var(--status-warning)] dark:text-[color:var(--status-warning)]">
              <AlertCircle className="h-3 w-3" /> {totalFlags} flag{totalFlags !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
      </button>

      {/* Column Headers */}
      {open && (
        <div className="flex items-center gap-4 px-5 py-2 bg-muted/5 border-t border-border/20 border-b border-border/20">
          <div className="w-1.5 shrink-0" />
          <div className="eyebrow flex-1 text-muted-foreground/30">Assignment</div>
          <div className="eyebrow w-16 text-right text-muted-foreground/30 shrink-0">Papers</div>
          <div className="eyebrow w-14 text-center text-muted-foreground/30 shrink-0">Flags</div>
          <div className="eyebrow w-24 text-right text-muted-foreground/30 shrink-0">Progress</div>
          <div className="w-36 shrink-0" />
        </div>
      )}

      {/* Rows */}
      {open && assignments.map(a => <AssignmentRow key={a.id} assignment={a} />)}
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
        <AlertCircle className="h-8 w-8 text-muted-foreground/20" />
        <p className="eyebrow text-sm text-muted-foreground/40">No assignments match current filters</p>
      </div>
    )
  }

  return (
    <TooltipProvider delay={100}>
      <div className="space-y-4">
        {departments.map(dept => {
          const deptAssignments = filtered.filter(a => a.department === dept)
          if (deptAssignments.length === 0) return null
          return <DeptGroup key={dept} department={dept} assignments={deptAssignments} />
        })}
      </div>
    </TooltipProvider>
  )
}
