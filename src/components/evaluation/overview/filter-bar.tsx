"use client"

import { useEvaluationOverviewStore } from "@/lib/store/evaluation-overview-store"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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

export function FilterBar() {
  const { setFilter, selectedDepartment, selectedSemester, selectedGradingStatus, selectedCalibrationState } = useEvaluationOverviewStore()
  const [search, setSearch] = useState("")

  const activeValues: Record<string, string> = {
    selectedDepartment,
    selectedSemester,
    selectedGradingStatus,
    selectedCalibrationState,
  }

  const hasActiveFilters = Object.values(activeValues).some(v => v !== "all") || search.length > 0

  const clearAll = () => {
    setFilter("selectedDepartment", "all")
    setFilter("selectedSemester", "all")
    setFilter("selectedGradingStatus", "all")
    setFilter("selectedCalibrationState", "all")
    setSearch("")
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative w-56">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 h-8 text-xs bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
          placeholder="Search assignments..."
        />
      </div>

      <div className="w-px h-6 bg-border/50" />

      {/* Filter Groups */}
      {FILTER_GROUPS.map(group => (
        <div key={group.key} className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/30">
          <span className="eyebrow text-muted-foreground/40 px-1">{group.label}</span>
          {group.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(group.key, opt.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-black tracking-wider transition-all ${
                activeValues[group.key] === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ))}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="eyebrow h-8 px-3 text-muted-foreground/60 hover:text-destructive gap-1.5"
        >
          <X className="h-3 w-3" /> Clear
        </Button>
      )}
    </div>
  )
}
