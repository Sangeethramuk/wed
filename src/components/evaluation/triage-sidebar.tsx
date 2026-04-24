"use client"

import { useState } from "react"
import { Search, CheckCircle2, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TriageSidebarProps {
  selectedStudentId: string
  onStudentSelect: (id: string) => void
  gradedSubmissions: string[]
  onBulkApprove?: (ids: string[]) => void
}

export function TriageSidebar({
  selectedStudentId,
  onStudentSelect,
  gradedSubmissions,
  onBulkApprove
}: TriageSidebarProps) {
  const [triageFilter, setTriageFilter] = useState<"all" | "critical" | "focus" | "verified">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const firstNames = [
    "Arjun", "Priya", "Rahul", "Ananya", "Vikram",
    "Neha", "Aditya", "Meera", "Rohan", "Kavita",
    "Krishna", "Divya", "Sanjay", "Pooja", "Rajesh",
    "Sunita", "Vivek", "Anjali", "Amit", "Deepa",
    "Suresh", "Lakshmi", "Nikhil", "Radha", "Manoj",
    "Geeta", "Prakash", "Sneha", "Ashok", "Nisha"
  ]
  const lastNames = [
    "Sharma", "Patel", "Gupta", "Singh", "Reddy",
    "Iyer", "Nair", "Desai", "Joshi", "Mehta",
    "Agarwal", "Malhotra", "Khanna", "Banerjee", "Chatterjee",
    "Menon", "Pillai", "Rao", "Verma", "Tiwari",
    "Kapoor", "Chopra", "Sethi", "Bhatia", "Grover",
    "Bajaj", "Chawla", "Dutta", "Ghosh", "Mukherjee"
  ]

  const allSubmissions = Array.from({ length: 60 }, (_, i) => {
    const id = `STU-${100 + i}`
    const name = `${firstNames[i % 30]} ${lastNames[(i + 7) % 30]}`

    const checkpoints = {
      grading: i % 10 !== 0,
      ocr: i % 15 !== 0,
      cheating: i % 20 !== 0,
      history: i % 8 !== 0,
      timeline: i % 12 !== 0,
    }

    const passedCount = Object.values(checkpoints).filter(Boolean).length

    let category: "critical" | "focus" | "verified" = "verified"
    let reason = "Verified Clear"
    let flags = 5 - passedCount

    if (passedCount <= 2) {
      category = "critical"
      reason = "Protocol Failure"
    } else if (passedCount <= 3) {
      category = "focus"
      reason = "Academic Anomaly"
    } else if (passedCount === 4) {
      category = "focus"
      reason = "Minor Variance"
    }

    const status = gradedSubmissions.includes(id) ? "graded" : (flags > 0 ? "flagged" : "ready")

    return {
      id,
      name,
      code: `#${100 + i}`,
      status,
      flags,
      reason,
      category,
      checkpoints
    }
  })

  const submissions = allSubmissions.filter(s => {
    const matchesFilter = triageFilter === "all" || s.category === triageFilter
    const matchesSearch = !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xs font-semibold tracking-wider text-slate-500">Submissions Cohort</h2>
          <p className="text-xs text-slate-400">Filter and select papers for evaluation</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Filter chips — segmented control over slate-100 with white
              elevated active state per EDUCAITORS_DS_GUIDE.md. */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg w-64">
            {(["all", "critical", "focus", "verified"] as const).map((filter) => {
              const active = triageFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => setTriageFilter(filter)}
                  className="w-full h-7 rounded-md text-xs font-semibold capitalize transition-colors"
                  style={{
                    backgroundColor: active ? '#FFFFFF' : 'transparent',
                    color: active ? '#0F172A' : '#64748B',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.04)' : undefined,
                  }}
                >
                  {filter === 'all' ? 'All' : filter === 'critical' ? 'Crit' : filter === 'focus' ? 'Focus' : 'Veri'}
                </button>
              )
            })}
          </div>

          {/* Search field — guide's Search Field pattern */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or code…"
              className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col items-end gap-1 px-4 border-l border-slate-200">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
              {gradedSubmissions.length} / {allSubmissions.length} Completed
            </span>
            <div className="w-32 h-1 rounded-full overflow-hidden bg-slate-100">
              <div
                className="h-full transition-all duration-700 ease-in-out"
                style={{
                  width: `${(gradedSubmissions.length / allSubmissions.length) * 100}%`,
                  backgroundColor: '#1F4E8C',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold tracking-wider text-slate-400">
        <div className="col-span-5">Student</div>
        <div className="col-span-2 text-center">Checkpoints</div>
        <div className="col-span-2 text-center">Flags</div>
        <div className="col-span-2 text-center">Reason</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-2 space-y-1">
          {submissions.map((sub) => {
            const isSelected = selectedStudentId === sub.id
            const isGraded = gradedSubmissions.includes(sub.id)
            const checkpointsPassed = Object.values(sub.checkpoints).filter(Boolean).length
            // Per guide's active-nav pattern: blue-50 bg + navy border + navy name.
            const catAccent =
              sub.category === 'critical' ? '#EF4444' :
              sub.category === 'focus' ? '#F59E0B' :
              '#10B981'
            const catBg =
              sub.category === 'critical' ? '#FEF2F2' :
              sub.category === 'focus' ? '#FFFBEB' :
              '#ECFDF5'
            return (
              <div
                key={sub.id}
                role="button"
                onClick={() => onStudentSelect(sub.id)}
                className="w-full grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg transition-colors text-left cursor-pointer group border"
                style={
                  isSelected
                    ? { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }
                    : { backgroundColor: 'transparent', borderColor: 'transparent' }
                }
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {/* Student Info */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="relative shrink-0">
                    {isGraded ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border"
                        style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}
                      >
                        <CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border"
                        style={{ backgroundColor: catBg, borderColor: catAccent + '40', color: catAccent }}
                      >
                        <span className="text-xs font-semibold">{sub.name.charAt(0)}</span>
                      </div>
                    )}
                    {!isGraded && sub.category !== 'verified' && (
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: catAccent }}
                      />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold truncate"
                        style={{
                          color: isSelected ? '#1F4E8C' : '#0F172A',
                          textDecoration: isGraded ? 'line-through' : undefined,
                          opacity: isGraded ? 0.5 : 1,
                        }}
                      >
                        {sub.name}
                      </span>
                      {isSelected && !isGraded && (
                        <Sparkles className="h-3 w-3 animate-pulse" style={{ color: '#1F4E8C' }} />
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">{sub.code}</span>
                  </div>
                </div>

                {/* Protocol Integrity */}
                <div className="col-span-2 flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tabular-nums"
                          style={
                            checkpointsPassed <= 2
                              ? { backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }
                              : checkpointsPassed <= 4
                                ? { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', color: '#B45309' }
                                : { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#047857' }
                          }
                        >
                          {checkpointsPassed}/5
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-3 space-y-2 border border-slate-200 bg-white shadow-xl">
                        <div className="text-xs font-semibold tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">Checkpoints</div>
                        <div className="space-y-1.5 min-w-[140px]">
                          {Object.entries(sub.checkpoints).map(([key, passed]) => (
                            <div key={key} className="flex items-center justify-between gap-6 text-xs">
                              <span className="capitalize text-slate-500">{key}</span>
                              <span
                                className="font-semibold"
                                style={{ color: passed ? '#10B981' : '#EF4444' }}
                              >
                                {passed ? '✓' : '✗'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Critical Flags */}
                <div className="col-span-2 flex justify-center">
                  {!isGraded && sub.flags > 0 ? (
                    <span
                      className="inline-flex items-center rounded-full h-6 px-2.5 text-xs font-semibold border"
                      style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}
                    >
                      {sub.flags} flags
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </div>

                {/* Validation Reason */}
                <div className="col-span-2 text-center">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color:
                        sub.category === 'critical' ? '#B91C1C' :
                        sub.category === 'focus' ? '#B45309' :
                        '#64748B',
                    }}
                  >
                    {sub.reason}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 text-right">
                  <button
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    aria-label="Open student"
                  >
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
