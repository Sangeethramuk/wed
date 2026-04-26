"use client"

import { useEvaluationOverviewStore } from "@/lib/store/evaluation-overview-store"
import { Search, ChevronDown, Check, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"

type FilterKey =
  | "selectedDepartment"
  | "selectedSemester"
  | "selectedGradingStatus"
  | "selectedCalibrationState"

const FILTER_GROUPS: {
  key: FilterKey
  label: string
  defaultLabel: string
  options: { value: string; label: string }[]
}[] = [
  {
    key: "selectedDepartment",
    label: "Department",
    defaultLabel: "All Depts",
    options: [
      { value: "all", label: "All Depts" },
      { value: "Computer Science", label: "CS" },
      { value: "Information Technology", label: "IT" },
      { value: "Electronics", label: "EC" },
    ],
  },
  {
    key: "selectedSemester",
    label: "Semester",
    defaultLabel: "All Sems",
    options: [
      { value: "all", label: "All Sems" },
      { value: "SEM V", label: "SEM V" },
      { value: "SEM VI", label: "SEM VI" },
    ],
  },
  {
    key: "selectedGradingStatus",
    label: "Grading",
    defaultLabel: "All",
    options: [
      { value: "all", label: "All" },
      { value: "pending_calibration", label: "Pending Cal." },
      { value: "in_grading", label: "In Grading" },
      { value: "complete", label: "Complete" },
      { value: "released", label: "Released" },
    ],
  },
  {
    key: "selectedCalibrationState",
    label: "Calibration",
    defaultLabel: "All",
    options: [
      { value: "all", label: "All" },
      { value: "not_started", label: "Not Started" },
      { value: "in_progress", label: "In Progress" },
      { value: "complete", label: "Calibrated" },
    ],
  },
]

interface FilterDropdownProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentLabel = options.find((o) => o.value === value)?.label ?? options[0].label

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-slate-300 transition-colors"
      >
        <span className="text-slate-400 font-semibold tracking-wider text-xs">{label}:</span>
        <span className="font-semibold text-slate-900">{currentLabel}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg z-50 py-1"
          style={{ boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
        >
          {options.map((opt) => {
            const active = value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              >
                <span className={active ? "font-semibold text-slate-900" : ""}>{opt.label}</span>
                {active && <Check className="h-4 w-4" style={{ color: "#1F4E8C" }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Compact dropdown-based filter bar. Each filter renders as `Label: Value ▾`
// and applied non-default values surface below as removable chips with a
// global Clear all action.
export function FilterBar() {
  const {
    setFilter,
    selectedDepartment,
    selectedSemester,
    selectedGradingStatus,
    selectedCalibrationState,
  } = useEvaluationOverviewStore()
  const [search, setSearch] = useState("")

  const activeValues: Record<FilterKey, string> = {
    selectedDepartment,
    selectedSemester,
    selectedGradingStatus,
    selectedCalibrationState,
  }

  const appliedChips = FILTER_GROUPS.flatMap((group) => {
    const v = activeValues[group.key]
    if (v === "all") return []
    const opt = group.options.find((o) => o.value === v)
    if (!opt) return []
    return [{ key: group.key, label: opt.label }]
  })

  const hasActiveFilters = appliedChips.length > 0 || search.length > 0

  const clearAll = () => {
    setFilter("selectedDepartment", "all")
    setFilter("selectedSemester", "all")
    setFilter("selectedGradingStatus", "all")
    setFilter("selectedCalibrationState", "all")
    setSearch("")
  }

  return (
    <div className="space-y-3">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search field */}
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

        {FILTER_GROUPS.map((group) => (
          <FilterDropdown
            key={group.key}
            label={group.label}
            value={activeValues[group.key]}
            options={group.options}
            onChange={(value) => setFilter(group.key, value)}
          />
        ))}
      </div>

      {/* Applied filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400">Active:</span>
          {appliedChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key, "all")}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-semibold border transition-colors"
              style={{ backgroundColor: "#EFF6FF", color: "#1F4E8C", borderColor: "#BFDBFE" }}
            >
              {chip.label}
              <X className="h-3 w-3 opacity-60 hover:opacity-100" />
            </button>
          ))}
          {search.length > 0 && (
            <button
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 transition-colors"
            >
              &quot;{search}&quot;
              <X className="h-3 w-3 opacity-60 hover:opacity-100" />
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
