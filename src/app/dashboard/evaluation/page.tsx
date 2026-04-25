"use client"

import { useState } from "react"
import { useEvaluationOverviewStore } from "@/lib/store/evaluation-overview-store"
import { StatsHeader } from "@/components/evaluation/overview/stats-header"
import { FilterBar } from "@/components/evaluation/overview/filter-bar"
import { AssignmentTable } from "@/components/evaluation/overview/assignment-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronRight } from "lucide-react"
import { StartAssignmentModal } from "@/components/pre-evaluation/start-assignment-modal"

// Page migrated to the EducAItors DS guide. Uses the guide's hex palette
// (#F8F9FA page, #0F172A heading, slate-500 secondary), inline card shadows,
// slate borders, and Inter (already the app font). Applied at page scope
// only — other screens still use the legacy DS tokens.
export default function EvaluationDashboard() {
  const { getStats } = useEvaluationOverviewStore()
  const stats = getStats()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
    <StartAssignmentModal open={modalOpen} onOpenChange={setModalOpen} />
    <div
      className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 -m-6 p-6 min-h-[calc(100svh-4rem)]"
      style={{ backgroundColor: "#F8F9FA" }}
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-slate-400">
            Academic Evaluation Suite
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Assignments
          </h1>
          <p className="text-sm text-slate-500">
            All assignments across your courses — calibrate AI alignment before entering the grading desk.
          </p>
        </div>
        <Button size="lg" onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Start Preparing Assignment
          <ChevronRight className="h-4 w-4 opacity-60" />
        </Button>
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
    </>
  )
}
