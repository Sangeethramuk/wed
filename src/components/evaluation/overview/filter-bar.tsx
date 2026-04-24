"use client"

import { useEvaluationOverviewStore } from "@/lib/store/evaluation-overview-store"
import { Search, X } from "lucide-react"
import { useState } from "react"

const FILTER_GROUPS = [
  {
    key: "selectedDepartment" as const,
    label: "Department",
    options: [
      { value: "all", label: "All Depts" },
      { value: "Computer Science", label: "CS" },
      { value: "Information Technology", label: "IT" },
      { value: "Electronics", label: "EC" },
    ],
  },
  {
    key: "selectedSemester" as const,
    label: "Semester",
    options: [
      { value: "all", label: "All Sems" },
      { value: "SEM V", label: "SEM V" },
      { value: "SEM VI", label: "SEM VI" },
    ],
  },
  {
    key: "selectedGradingStatus" as const,
    label: "Grading",
    options: [
      { value: "all", label: "All" },
      { value: "pending_calibration", label: "Pending Cal." },
      { value: "in_grading", label: "In Grading" },
      { value: "complete", label: "Complete" },
    ],
  },
  {
    key: "selectedCalibrationState" as const,
    label: "Calibration",
    options: [
      { value: "all", label: "All" },
      { value: "not_started", label: "Not Started" },
      { value: "in_progress", label: "In Progress" },
      { value: "complete", label: "Calibrated" },
    ],
  },
]

// Filter bar migrated to the EducAItors DS guide. White rounded-lg search
// field matching the guide's Search Field pattern, and filter chips that
// flip between a muted slate rest state and a brand-navy active state on a
// white capsule — mirrors the deployed app's segmented control look.
export function FilterBar() {
  const {
    setFilter,
    selectedDepartment,
    selectedSemester,
    selectedGradingStatus,
    selectedCalibrationState,
  } = useEvaluationOverviewStore()
  const [search, setSearch] = useState("")

  const activeValues: Record<string, string> = {
    selectedDepartment,
    selectedSemester,
    selectedGradingStatus,
    selectedCalibrationState,
  }

  const hasActiveFilters =
    Object.values(activeValues).some((v) => v !== "all") || search.length > 0

  const clearAll = () => {
    setFilter("selectedDepartment", "all")
    setFilter("selectedSemester", "all")
    setFilter("selectedGradingStatus", "all")
    setFilter("selectedCalibrationState", "all")
    setSearch("")
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search field — guide's Search Field pattern */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assignments..."
          className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Filter groups */}
      {FILTER_GROUPS.map((group) => (
        <div
          key={group.key}
          className="flex items-center gap-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg"
        >
          <span className="text-xs font-semibold tracking-wider text-slate-400 px-1">
            {group.label}
          </span>
          {group.options.map((opt) => {
            const active = activeValues[group.key] === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(group.key, opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  active
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                style={active ? { backgroundColor: "#1F4E8C" } : undefined}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      ))}

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      )}
    </div>
  )
}
