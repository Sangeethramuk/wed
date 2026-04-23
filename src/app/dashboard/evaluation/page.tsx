"use client"

import { useEvaluationOverviewStore } from "@/lib/store/evaluation-overview-store"
import { StatsHeader } from "@/components/evaluation/overview/stats-header"
import { FilterBar } from "@/components/evaluation/overview/filter-bar"
import { AssignmentTable } from "@/components/evaluation/overview/assignment-table"

export default function EvaluationDashboard() {
  const { getStats } = useEvaluationOverviewStore()
  const stats = getStats()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground text-sm">
            All assignments across your courses — review submissions and monitor grading progress.
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsHeader
        total={stats.total}
        pendingCalibration={stats.pendingCalibration}
        inGrading={stats.inGrading}
        complete={stats.complete}
      />

      {/* Filters */}
      <FilterBar />

      {/* Grouped Assignment Table */}
      <AssignmentTable />
    </div>
  )
}
