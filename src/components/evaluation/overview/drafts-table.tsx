"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, AlertCircle, FileText } from "lucide-react"
import { MOCK_ASSIGNMENTS } from "@/lib/mock/assignments"
import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"

const TYPE_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  Project:      { bg: "#EFF6FF", color: "#1F4E8C", border: "#BFDBFE" },
  MCQ:          { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" },
  Essay:        { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  "Lab Record": { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE" },
  "Case Study": { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  Viva:         { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" },
  Design:       { bg: "#FDF2F8", color: "#BE185D", border: "#FBCFE8" },
  Specialized:  { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" },
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function DraftsTable() {
  const router = useRouter()
  const { setCourse, updateAssignment, setStep } = usePreEvalStore()

  const drafts = MOCK_ASSIGNMENTS.filter((a) => a.status === "draft")

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-400">No draft assignments</p>
      </div>
    )
  }

  const handleContinue = (draft: typeof drafts[number]) => {
    setCourse(draft.course)
    updateAssignment({ title: draft.title, type: draft.type })
    setStep(1)
    router.push("/dashboard/pre-evaluation")
  }

  return (
    <div
      className="rounded-xl overflow-hidden bg-white border border-slate-200"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      {/* Group header */}
      <div className="w-full flex items-center gap-4 px-5 py-4 text-left">
        <div className="flex items-center gap-2 flex-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
          <span className="text-sm font-semibold text-slate-900">Drafts</span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border border-slate-200 bg-slate-50 text-slate-600">
            {drafts.length} assignment{drafts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-4 px-5 py-2 bg-slate-50 border-t border-slate-200 border-b border-slate-200">
        <div className="w-1.5 shrink-0" />
        <div className="flex-1 text-[10px] font-semibold tracking-wider text-slate-400">Assignment</div>
        <div className="w-32 text-[10px] font-semibold tracking-wider text-slate-400 shrink-0">Course</div>
        <div className="w-28 text-right text-[10px] font-semibold tracking-wider text-slate-400 shrink-0">Target Date</div>
        <div className="w-40 shrink-0" />
      </div>

      {/* Rows */}
      {drafts.map((draft) => (
        <div
          key={draft.id}
          onClick={() => handleContinue(draft)}
          className="group flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-200 last:border-0 cursor-pointer"
        >
          {/* Status dot */}
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#F59E0B" }} />

          {/* Assignment info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-900 truncate">{draft.title}</span>
              <TypeBadge type={draft.type} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold">{draft.code}</span>
              <span>·</span>
              <span>{draft.semester}</span>
            </div>
          </div>

          {/* Course */}
          <div className="w-32 shrink-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{draft.course}</p>
          </div>

          {/* Target Date */}
          <div className="w-28 shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums text-slate-900">{formatDate(draft.deadline)}</p>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider">Target</p>
          </div>

          {/* Action */}
          <div className="shrink-0 w-40">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleContinue(draft)
              }}
              className="inline-flex items-center justify-center gap-1.5 w-full h-9 px-4 rounded-lg text-xs font-semibold tracking-wider transition-colors group/btn"
              style={{ backgroundColor: "#1F4E8C", color: "#FFFFFF" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E3A5F" }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1F4E8C" }}
            >
              Continue
              <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
