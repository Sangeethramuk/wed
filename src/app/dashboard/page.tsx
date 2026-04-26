"use client"

import {
  FileText,
  CheckCircle2,
  Clock,
  BarChart3,
  PlusCircle,
  ClipboardCheck,
  ArrowRight,
  GraduationCap,
  LayoutGrid,
  MousePointer2,
} from "lucide-react"
import Link from "next/link"

// Migrated to the EducAItors DS guide. Uses the guide's hex palette
// (#F8F9FA page, #0F172A heading, slate-500 secondary), inline card shadows,
// slate borders, and brand #1F4E8C CTAs. Same conventions as
// /dashboard/evaluation.

const KPIS: { label: string; value: string; icon: typeof FileText; tint: string; iconColor: string }[] = [
  { label: "Total Papers",          value: "3,500",   icon: FileText,      tint: "#EFF6FF", iconColor: "#1F4E8C" },
  { label: "Evaluation Completed",  value: "2,250",   icon: CheckCircle2,  tint: "#ECFDF5", iconColor: "#10B981" },
  { label: "Evaluation To Be Done", value: "1,250",   icon: Clock,         tint: "#FFFBEB", iconColor: "#F59E0B" },
  { label: "Avg Evaluation Time",   value: "3.5 min", icon: MousePointer2, tint: "#F5F3FF", iconColor: "#6D28D9" },
  { label: "Completion Rate",       value: "96%",     icon: BarChart3,     tint: "#EFF6FF", iconColor: "#1F4E8C" },
]

export default function DashboardPage() {
  return (
    <div
      className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 -m-6 p-6 min-h-[calc(100svh-4rem)]"
      style={{ backgroundColor: "#F8F9FA" }}
    >
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Welcome, Professor
        </h1>
        <p className="text-sm text-slate-500">
          Your evaluation ecosystem is performing at{" "}
          <span className="font-semibold text-slate-900">96% efficiency</span> this semester.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white border border-slate-200 rounded-xl p-5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div
                className="p-2.5 w-fit rounded-lg mb-4"
                style={{ backgroundColor: kpi.tint }}
              >
                <Icon className="h-5 w-5" style={{ color: kpi.iconColor }} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-slate-400">
                  {kpi.label}
                </p>
                <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {kpi.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left Column: Active Evaluations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Current active evaluations
            </h2>
            <Link
              href="/dashboard/evaluation"
              className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
            >
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* SE - Phase 2 (In Progress) */}
            <div
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className="h-2 w-2 rounded-full animate-pulse shrink-0"
                      style={{ backgroundColor: "#1F4E8C" }}
                    />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Software Engineering — Phase 2
                    </h3>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border"
                      style={{ backgroundColor: "#EFF6FF", color: "#1F4E8C", borderColor: "#BFDBFE" }}
                    >
                      In Progress
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Authoring Identity Evaluation · Folder ID: #SE-2024-PH2
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold tracking-wider text-slate-400">
                    Grading Progress
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    53% · 24/45 Papers
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                  <div
                    className="h-full transition-all"
                    style={{ width: "53%", backgroundColor: "#1F4E8C" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Estimated time remaining: 45 min</span>
                </div>
                <Link
                  href="/dashboard/evaluation/SWE-PH2/grading"
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold tracking-wider transition-colors group/btn"
                  style={{ backgroundColor: "#1F4E8C", color: "#FFFFFF" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E3A5F" }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1F4E8C" }}
                >
                  Enter Desk
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* DB - Quiz 1 (Completed) */}
            <div
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: "#10B981" }}
                    />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Database Systems — Quiz 1
                    </h3>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border"
                      style={{ backgroundColor: "#ECFDF5", color: "#047857", borderColor: "#A7F3D0" }}
                    >
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Final Validation · Folder ID: #DB-2024-Q1
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold tracking-wider text-slate-400">
                    Grading Progress
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    100% · 42/42 Papers
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                  <div className="h-full transition-all" style={{ width: "100%", backgroundColor: "#10B981" }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#047857" }}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>All papers verified</span>
                </div>
                <Link
                  href="/dashboard/evaluation/results?id=DB-Q1"
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold tracking-wider transition-colors group/btn bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                >
                  View Insights
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Operations & Alerts */}
        <div className="space-y-8">
          {/* Operations */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400">
              Operations
            </h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/pre-evaluation"
                className="flex items-center justify-between gap-3 h-14 px-5 rounded-xl text-sm font-semibold transition-colors group/op"
                style={{ backgroundColor: "#1F4E8C", color: "#FFFFFF" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E3A5F" }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1F4E8C" }}
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-5 w-5 opacity-80" />
                  <span>Prepare Assignment</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover/op:opacity-100 group-hover/op:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/dashboard/evaluation"
                className="flex items-center justify-between gap-3 h-14 px-5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition-colors group/op"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-slate-400" />
                  <span>Assignments Hub</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover/op:opacity-100 group-hover/op:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* System Alerts */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400">
              System Alerts
            </h2>
            <div className="space-y-3">
              <div
                className="flex gap-3 p-4 rounded-xl border"
                style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
              >
                <div
                  className="p-2 h-fit rounded-lg shrink-0"
                  style={{ backgroundColor: "#FEF3C7", color: "#B45309" }}
                >
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    New Pattern Detected
                  </p>
                  <p className="text-xs text-slate-500 leading-normal">
                    60% of students in &quot;Software Engineering&quot; struggled with MVC Controller logic.
                  </p>
                </div>
              </div>

              <div
                className="flex gap-3 p-4 rounded-xl border"
                style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}
              >
                <div
                  className="p-2 h-fit rounded-lg shrink-0"
                  style={{ backgroundColor: "#DBEAFE", color: "#1F4E8C" }}
                >
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    Calibration Complete
                  </p>
                  <p className="text-xs text-slate-500 leading-normal">
                    Prompt strategy for &quot;Database Systems&quot; has been successfully refined based on your grading style.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
