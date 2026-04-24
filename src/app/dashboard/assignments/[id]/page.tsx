"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Clock,
  Scale,
  FileCheck2,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  MOCK_ASSIGNMENTS,
  LATE_POLICY_LABEL,
  type AssignmentStatus,
  type AssignmentType,
} from "@/lib/mock/assignments"

const TYPE_STYLES: Record<AssignmentType, string> = {
  Project:      "bg-primary/10 text-primary border-primary/20",
  MCQ:          "bg-[color:var(--status-info)]/10 text-[color:var(--status-info)] border-[color:var(--status-info)]/20",
  Essay:        "bg-[color:var(--status-warning)]/10 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/20",
  Design:       "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Lab Record": "bg-[color:var(--status-success)]/10 text-[color:var(--status-success)] border-[color:var(--status-success)]/20",
  Viva:         "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Case Study": "bg-[color:var(--status-info)]/10 text-[color:var(--status-info)] border-[color:var(--status-info)]/20",
  Specialized:  "bg-muted/30 text-muted-foreground/60 border-muted-foreground/20",
}

const STATUS_CONFIG: Record<AssignmentStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-[color:var(--status-success)]/10 text-[color:var(--status-success)] border-[color:var(--status-success)]/20",
  },
  completed: {
    label: "Completed",
    className: "bg-muted/30 text-muted-foreground/60 border-border/30",
  },
  draft: {
    label: "Draft",
    className: "bg-[color:var(--status-warning)]/10 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/20",
  },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === id)

  if (!assignment) notFound()

  const statusCfg = STATUS_CONFIG[assignment.status]

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-0 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      {/* Back nav */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="gap-2 px-3 text-muted-foreground hover:text-foreground group" render={<Link href="/dashboard/assignments" />} nativeButton={false}>
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="eyebrow">Back to assignments</span>
        </Button>
      </div>

      <div className="border border-border/20 rounded-xl overflow-hidden bg-card">
        {/* Header */}
        <div className="bg-muted/[0.03] border-b border-border/10 px-8 py-8 space-y-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-muted-foreground/40">{assignment.institution}</p>
            <Badge
              variant="outline"
              className={cn("eyebrow rounded-full px-2.5 py-0.5 font-bold text-[10px]", statusCfg.className)}
            >
              {statusCfg.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">
              {assignment.title}
            </h1>
            <Badge
              variant="outline"
              className={cn("eyebrow", TYPE_STYLES[assignment.type])}
            >
              {assignment.type}
            </Badge>
          </div>
          <p className="eyebrow text-muted-foreground/50">
            {assignment.course} · {assignment.code} · {assignment.semester}
          </p>
          {assignment.instructions && (
            <p className="text-sm text-foreground/70 leading-relaxed font-medium pt-1">
              {assignment.instructions}
            </p>
          )}
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Deadline & late policy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/5 border border-border/10">
              <Clock className="h-4 w-4 text-primary/50 mt-0.5 shrink-0" />
              <div>
                <p className="eyebrow text-muted-foreground/40 mb-1">Deadline</p>
                <p className="text-sm font-bold">{formatDate(assignment.deadline)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/5 border border-border/10">
              <Scale className="h-4 w-4 text-primary/50 mt-0.5 shrink-0" />
              <div>
                <p className="eyebrow text-muted-foreground/40 mb-1">Late Submissions</p>
                <p className="text-sm font-bold">{LATE_POLICY_LABEL[assignment.latePolicy] ?? "No policy set"}</p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          {assignment.tasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                <p className="eyebrow text-muted-foreground/50">What to do</p>
              </div>
              <div className="space-y-2">
                {assignment.tasks.map((task, idx) => (
                  <div key={task.id} className="flex items-start gap-4 px-4 py-3.5 rounded-xl border border-border/15 bg-muted/[0.02] hover:bg-muted/[0.04] transition-colors">
                    <span className="eyebrow text-primary/50 shrink-0 pt-0.5">Task {idx + 1}</span>
                    <p className="text-sm font-semibold text-foreground leading-relaxed">{task.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {assignment.deliverables.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground/40" />
                <p className="eyebrow text-muted-foreground/50">What to submit</p>
              </div>
              <div className="rounded-xl border border-border/15 overflow-hidden divide-y divide-border/10">
                {assignment.deliverables.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-muted/[0.02]">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">{idx + 1}</span>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rubric */}
          {assignment.rubric.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-muted-foreground/40" />
                <p className="eyebrow text-muted-foreground/50">How you will be graded</p>
              </div>
              <div className="rounded-xl border border-border/15 overflow-hidden divide-y divide-border/10">
                {assignment.rubric.map((crit) => (
                  <div key={crit.id} className="px-4 py-3.5 bg-muted/[0.02] space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{crit.name}</p>
                      <span className="eyebrow text-muted-foreground/40">{crit.weight}%</span>
                    </div>
                    {crit.exemplary && (
                      <p className="text-xs text-muted-foreground/70 font-medium leading-relaxed">
                        <span className="text-primary/60 font-semibold">→ </span>{crit.exemplary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {assignment.rubric.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground/40" />
                <p className="eyebrow text-muted-foreground/50">Skills you will develop</p>
              </div>
              <div className="rounded-xl border border-border/15 overflow-hidden divide-y divide-border/10">
                {assignment.rubric.map((crit, idx) => (
                  <div key={crit.id} className="flex items-start gap-3 px-4 py-3.5 bg-muted/[0.02]">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">{crit.name}</p>
                      {crit.exemplary && (
                        <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed">{crit.exemplary}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/10 bg-muted/[0.02] px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground/30">
            <CheckCircle2 className="h-3 w-3" />
            <span className="eyebrow">Verified</span>
          </div>
          <span className="eyebrow text-muted-foreground/20">{assignment.institution}</span>
        </div>
      </div>
    </div>
  )
}
