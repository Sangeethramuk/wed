"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Filter, 
  ChevronDown, 
  AlertCircle,
  AlertTriangle,
  Clock,
  Users
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StudentRow {
  id: string
  name: string
  rollNo: string
  submission: "On Time" | "Late" | "Missing"
  status: "Not Started" | "In Progress" | "Ready to Release"
  score: number | null
  issues: string[]
  submissionTime: string
}

const MOCK_DATA: StudentRow[] = [
  { id: "1", name: "Arjun Sharma", rollNo: "CS24-001", submission: "On Time", status: "Ready to Release", score: 85, issues: ["Possible plagiarism pattern", "Low answer clarity"], submissionTime: "2024-10-23T10:30:00Z" },
  { id: "2", name: "Priya Iyer", rollNo: "CS24-002", submission: "On Time", status: "Ready to Release", score: 92, issues: [], submissionTime: "2024-10-23T11:15:00Z" },
  { id: "3", name: "Rahul Malhotra", rollNo: "CS24-003", submission: "Late", status: "In Progress", score: null, issues: ["OCR / extraction issue", "Rubric alignment unclear", "Student flagged previously"], submissionTime: "2024-10-24T14:45:00Z" },
  { id: "4", name: "Ananya Gupta", rollNo: "CS24-004", submission: "On Time", status: "Ready to Release", score: 78, issues: ["Low answer clarity"], submissionTime: "2024-10-22T09:00:00Z" },
  { id: "5", name: "Vikram Singh", rollNo: "CS24-005", submission: "On Time", status: "Ready to Release", score: 88, issues: [], submissionTime: "2024-10-23T15:20:00Z" },
  { id: "6", name: "Neha Reddy", rollNo: "CS24-006", submission: "Missing", status: "Not Started", score: null, issues: [], submissionTime: "" },
  { id: "7", name: "Aditya Nair", rollNo: "CS24-007", submission: "On Time", status: "In Progress", score: null, issues: ["Possible plagiarism pattern"], submissionTime: "2024-10-23T12:00:00Z" },
  { id: "8", name: "Meera Desai", rollNo: "CS24-008", submission: "Late", status: "Ready to Release", score: 95, issues: [], submissionTime: "2024-10-24T08:30:00Z" },
  { id: "9", name: "Rohan Joshi", rollNo: "CS24-009", submission: "On Time", status: "In Progress", score: null, issues: ["OCR / extraction issue"], submissionTime: "2024-10-23T16:40:00Z" },
  { id: "10", name: "Kavita Mehta", rollNo: "CS24-010", submission: "On Time", status: "Ready to Release", score: 82, issues: [], submissionTime: "2024-10-22T14:10:00Z" },
  { id: "11", name: "Sanjay Khanna", rollNo: "CS24-011", submission: "On Time", status: "In Progress", score: null, issues: ["Low answer clarity", "Rubric alignment unclear"], submissionTime: "2024-10-23T09:50:00Z" },
  { id: "12", name: "Pooja Banerjee", rollNo: "CS24-012", submission: "Late", status: "Not Started", score: null, issues: ["Student flagged previously"], submissionTime: "2024-10-24T18:20:00Z" },
  { id: "13", name: "Vivek Kapoor", rollNo: "CS24-013", submission: "On Time", status: "Ready to Release", score: 91, issues: [], submissionTime: "2024-10-23T11:00:00Z" },
  { id: "14", name: "Anjali Sethi", rollNo: "CS24-014", submission: "On Time", status: "In Progress", score: null, issues: ["Possible plagiarism pattern"], submissionTime: "2024-10-23T13:45:00Z" },
  { id: "15", name: "Deepa Bhatia", rollNo: "CS24-015", submission: "Missing", status: "Not Started", score: null, issues: [], submissionTime: "" },
  { id: "16", name: "Suresh Grover", rollNo: "CS24-016", submission: "On Time", status: "Ready to Release", score: 76, issues: ["OCR / extraction issue", "Low answer clarity"], submissionTime: "2024-10-22T17:30:00Z" },
  { id: "17", name: "Geeta Chawla", rollNo: "CS24-017", submission: "On Time", status: "In Progress", score: null, issues: [], submissionTime: "2024-10-23T10:15:00Z" },
  { id: "18", name: "Prakash Dutta", rollNo: "CS24-018", submission: "Late", status: "In Progress", score: null, issues: ["Possible plagiarism pattern", "Rubric alignment unclear", "Student flagged previously"], submissionTime: "2024-10-24T12:10:00Z" },
  { id: "19", name: "Sneha Ghosh", rollNo: "CS24-019", submission: "On Time", status: "Ready to Release", score: 93, issues: [], submissionTime: "2024-10-23T08:40:00Z" },
  { id: "20", name: "Ashok Verma", rollNo: "CS24-020", submission: "On Time", status: "Not Started", score: null, issues: [], submissionTime: "2024-10-23T14:55:00Z" },
]

// MBA cohort for the Business Case Analysis assignment (MBA-BCA-01).
// All rows start ungraded ("In Progress", no score) so the demo can walk
// through manual grading from a clean slate. Riya Sharma sits on top.
const MOCK_DATA_MBA: StudentRow[] = [
  { id: "BA-101", name: "Riya Sharma",   rollNo: "MBA25-BA-101", submission: "On Time", status: "In Progress", score: null, issues: [], submissionTime: "2026-04-25T09:30:00Z" },
  { id: "BA-102", name: "Aarav Mehta",   rollNo: "MBA25-BA-102", submission: "On Time", status: "In Progress", score: null, issues: ["Rubric alignment unclear"], submissionTime: "2026-04-25T11:10:00Z" },
  { id: "BA-103", name: "Ishaan Kapoor", rollNo: "MBA25-BA-103", submission: "On Time", status: "In Progress", score: null, issues: [], submissionTime: "2026-04-25T13:45:00Z" },
  { id: "BA-104", name: "Anaya Nair",    rollNo: "MBA25-BA-104", submission: "Late",    status: "In Progress", score: null, issues: ["Possible plagiarism pattern"], submissionTime: "2026-04-26T18:20:00Z" },
  { id: "BA-105", name: "Vivaan Joshi",  rollNo: "MBA25-BA-105", submission: "On Time", status: "In Progress", score: null, issues: [], submissionTime: "2026-04-25T15:05:00Z" },
  { id: "BA-106", name: "Kavya Reddy",   rollNo: "MBA25-BA-106", submission: "On Time", status: "In Progress", score: null, issues: [], submissionTime: "2026-04-25T10:25:00Z" },
  { id: "BA-107", name: "Arnav Bansal",  rollNo: "MBA25-BA-107", submission: "On Time", status: "In Progress", score: null, issues: ["Low answer clarity"], submissionTime: "2026-04-25T16:40:00Z" },
  { id: "BA-108", name: "Saanvi Pillai", rollNo: "MBA25-BA-108", submission: "On Time", status: "In Progress", score: null, issues: [], submissionTime: "2026-04-25T09:55:00Z" },
  { id: "BA-109", name: "Reyansh Khanna",rollNo: "MBA25-BA-109", submission: "On Time", status: "In Progress", score: null, issues: [], submissionTime: "2026-04-25T12:15:00Z" },
  { id: "BA-110", name: "Diya Sethi",    rollNo: "MBA25-BA-110", submission: "On Time", status: "In Progress", score: null, issues: [], submissionTime: "2026-04-25T08:10:00Z" },
]

// Map assignment ids to their cohort. Falls back to the generic CS24 list
// when an id isn't covered.
const ASSIGNMENT_COHORTS: Record<string, StudentRow[]> = {
  "MBA-BCA-01": MOCK_DATA_MBA,
}

function rowsForAssignment(assignmentId?: string): StudentRow[] {
  if (assignmentId && ASSIGNMENT_COHORTS[assignmentId]) {
    return ASSIGNMENT_COHORTS[assignmentId]
  }
  return MOCK_DATA
}

// Re-exported so other surfaces (e.g., the grading header) can resolve a
// student name from the same mock cohort instead of falling back to a
// generic placeholder when the route id matches one of these rows.
export const SUBMISSION_ROWS = [...MOCK_DATA, ...MOCK_DATA_MBA]

interface AssignmentSubmissionsTableProps {
  onRowClick?: (studentId: string) => void
  /** When true, every row is rendered as "Ready to Release" (a placeholder
   *  score is filled in for the rows that didn't have one) — used by the
   *  demo control's "Mark all submissions ready" trigger. */
  forceReady?: boolean
  /** Identifies which mock cohort to render. Defaults to the generic
   *  CS24 list when omitted. */
  assignmentId?: string
}

export function AssignmentSubmissionsTable({ onRowClick, forceReady, assignmentId }: AssignmentSubmissionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [submissionFilter, setSubmissionFilter] = useState<string>("All")
  const [issuesFilter, setIssuesFilter] = useState<string>("All")
  const [sortBy, setSortBy] = useState<string>("Issues (High → Low)")

  const filteredData = useMemo(() => {
    const cohort = rowsForAssignment(assignmentId)
    let data: StudentRow[] = cohort.map(row => {
      if (!forceReady) return { ...row }
      // Skip Missing submissions — those have no paper to release.
      if (row.submission === "Missing") return { ...row }
      // Synthesize a plausible score for rows that hadn't been graded yet
      // so the "Ready to Release" status doesn't render with a blank score.
      const synthScore =
        row.score ?? 70 + ((row.id.charCodeAt(row.id.length - 1) ?? 0) % 25)
      return { ...row, status: "Ready to Release", score: synthScore }
    })

    // Search
    if (searchQuery) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status Filter
    if (statusFilter !== "All") {
      data = data.filter(item => item.status === statusFilter)
    }

    // Submission Filter
    if (submissionFilter !== "All") {
      data = data.filter(item => item.submission === submissionFilter)
    }

    // Issues Filter
    if (issuesFilter !== "All") {
      if (issuesFilter === "Has Issues") {
        data = data.filter(item => item.issues.length > 0)
      } else if (issuesFilter === "No Issues") {
        data = data.filter(item => item.issues.length === 0)
      }
    }

    // Sorting
    data.sort((a, b) => {
      switch (sortBy) {
        case "Issues (High → Low)":
          return b.issues.length - a.issues.length
        case "Issues (Low → High)":
          return a.issues.length - b.issues.length
        case "Submission Time":
          return new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime()
        case "Student Name":
          return a.name.localeCompare(b.name)
        case "Score":
          return (b.score || 0) - (a.score || 0)
        case "Roll Number":
          return a.rollNo.localeCompare(b.rollNo)
        default:
          return 0
      }
    })

    return data
  }, [searchQuery, statusFilter, submissionFilter, issuesFilter, sortBy, forceReady, assignmentId])

  const getStatusBadge = (status: StudentRow["status"]) => {
    switch (status) {
      case "Ready to Release":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 shadow-none font-semibold">Ready to Release</Badge>
      case "In Progress":
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50 shadow-none font-semibold">In Progress</Badge>
      case "Not Started":
        return <Badge variant="outline" className="text-slate-500 font-semibold">Not Started</Badge>
    }
  }

  const getSubmissionBadge = (submission: StudentRow["submission"]) => {
    switch (submission) {
      case "On Time":
        return <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> On Time</div>
      case "Late":
        return <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Late</div>
      case "Missing":
        return <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Missing</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters + Search bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200 rounded-lg text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="h-10 border-slate-200 bg-white text-slate-600 gap-2 rounded-lg text-sm font-medium">
                  <Filter className="h-4 w-4 text-slate-400" />
                  Status: {statusFilter}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              {["All", "Not Started", "In Progress", "Ready to Release"].map((status) => (
                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="h-10 border-slate-200 bg-white text-slate-600 gap-2 rounded-lg text-sm font-medium">
                  Submission: {submissionFilter}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              {["All", "On Time", "Late", "Missing"].map((sub) => (
                <DropdownMenuItem key={sub} onClick={() => setSubmissionFilter(sub)}>
                  {sub}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort by</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="h-10 border-slate-200 bg-white text-slate-900 gap-2 rounded-lg text-sm font-semibold min-w-[180px] justify-between">
                  {sortBy}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              {[
                "Issues (High → Low)",
                "Issues (Low → High)",
                "Submission Time",
                "Student Name",
                "Score",
                "Roll Number"
              ].map((opt) => (
                <DropdownMenuItem key={opt} onClick={() => setSortBy(opt)}>
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
              <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Student (Roll No.)</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Submission</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Issues</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow 
                key={row.id} 
                className="group hover:bg-slate-50/50 border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                onClick={() => onRowClick?.(row.id)}
              >
                <TableCell className="py-4 px-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-900 transition-colors">{row.name}</span>
                    <span className="text-xs font-medium text-slate-400">{row.rollNo}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex justify-center">
                    {getSubmissionBadge(row.submission)}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex justify-center">
                    {getStatusBadge(row.status)}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex justify-center">
                    {row.issues.length > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full cursor-help bg-amber-50 text-amber-700 border border-amber-100">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="text-[10px] font-bold">
                                  {row.issues.length} {row.issues.length === 1 ? 'issue' : 'issues'}
                                </span>
                              </div>
                            }
                          />
                          <TooltipContent side="right" className="p-3 bg-white border border-slate-200 shadow-xl rounded-lg">
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Detected Issues</p>
                              <ul className="space-y-1.5">
                                {row.issues.map((issue, idx) => (
                                  <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-400" />
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-slate-300 transform scale-150">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  {row.score !== null ? (
                    <span className="text-sm font-bold text-slate-900">{row.score}<span className="text-slate-400 font-medium">/100</span></span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredData.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm font-medium">No students match your filters.</p>
            <Button variant="link" onClick={() => {
              setSearchQuery("")
              setSortBy("Issues (High → Low)")
              setSubmissionFilter("All")
              setStatusFilter("All")
            }} className="mt-1 text-blue-600 font-bold p-0 h-auto">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
