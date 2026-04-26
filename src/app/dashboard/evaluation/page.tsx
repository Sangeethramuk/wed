"use client"

import { useState } from "react"
import { useEvaluationOverviewStore } from "@/lib/store/evaluation-overview-store"
import { StatsHeader } from "@/components/evaluation/overview/stats-header"
import { FilterBar } from "@/components/evaluation/overview/filter-bar"
import { AssignmentTable } from "@/components/evaluation/overview/assignment-table"
import { DraftsTable } from "@/components/evaluation/overview/drafts-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronRight } from "lucide-react"
import { StartAssignmentModal } from "@/components/pre-evaluation/start-assignment-modal"
import { MOCK_ASSIGNMENTS } from "@/lib/mock/assignments"

type Tab = "published" | "drafts"

// Page migrated to the EducAItors DS guide. Uses the guide's hex palette
// (#F8F9FA page, #0F172A heading, slate-500 secondary), inline card shadows,
// slate borders, and Inter (already the app font). Applied at page scope
// only — other screens still use the legacy DS tokens.
export default function EvaluationDashboard() {
  const { getStats } = useEvaluationOverviewStore()
  const stats = getStats()
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("published")

  const draftCount = MOCK_ASSIGNMENTS.filter((a) => a.status === "draft").length

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "published", label: "Published", count: stats.total },
    { id: "drafts", label: "Drafts", count: draftCount },
  ]

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

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {tabs.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px"
              style={{
                borderColor: active ? "#1F4E8C" : "transparent",
                color: active ? "#1F4E8C" : "#64748B",
              }}
            >
              {t.label}
              <span
                className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider"
                style={
                  active
                    ? { backgroundColor: "#EFF6FF", color: "#1F4E8C" }
                    : { backgroundColor: "#F1F5F9", color: "#94A3B8" }
                }
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {tab === "published" ? (
        <>
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
        </>
      ) : (
        <DraftsTable />
      )}
    </div>
    </>
  )
}
