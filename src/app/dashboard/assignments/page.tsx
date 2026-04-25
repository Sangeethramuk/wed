"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlusCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { statusStyles, type StatusKey } from "@/lib/design-tokens"
import { MOCK_ASSIGNMENTS, type AssignmentStatus } from "@/lib/mock/assignments"
import { StartAssignmentModal } from "@/components/pre-evaluation/start-assignment-modal"
import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"

type Tab = "all" | "published" | "draft"

const STATUS_TOKEN: Record<AssignmentStatus, StatusKey> = {
  active: "success",
  completed: "neutral",
  draft: "warning",
}

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  active: "Active",
  completed: "Completed",
  draft: "Draft",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getDaysLabel(dateStr: string, status: AssignmentStatus): { label: string; sub: string; tone: StatusKey } {
  if (status === "draft") return { label: formatDate(dateStr), sub: "Target date", tone: "neutral" }
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (status === "completed" || diff < 0) return { label: formatDate(dateStr), sub: "Closed", tone: "neutral" }
  if (diff === 0) return { label: "Today", sub: "Closes tonight", tone: "error" }
  if (diff <= 3) return { label: `${diff}d left`, sub: formatDate(dateStr), tone: "warning" }
  return { label: formatDate(dateStr), sub: `${diff} days left`, tone: "success" }
}

export default function AssignmentsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const { setCourse, updateAssignment, setStep } = usePreEvalStore()

  const filtered = MOCK_ASSIGNMENTS.filter((a) => {
    if (tab === "all") return true
    if (tab === "published") return a.status === "active" || a.status === "completed"
    return a.status === "draft"
  })

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: MOCK_ASSIGNMENTS.length },
    {
      id: "published",
      label: "Published",
      count: MOCK_ASSIGNMENTS.filter((a) => a.status === "active" || a.status === "completed").length,
    },
    {
      id: "draft",
      label: "Draft",
      count: MOCK_ASSIGNMENTS.filter((a) => a.status === "draft").length,
    },
  ]

  return (
    <>
    <StartAssignmentModal open={modalOpen} onOpenChange={setModalOpen} />
    <div className="max-w-6xl mx-auto space-y-8 py-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight secondary-text">Assignments</h1>
          <p className="text-sm text-muted-foreground font-medium opacity-60">
            Manage and track all your assignments across courses.
          </p>
        </div>
        <Button size="lg" onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Start Preparing Assignment
          <ChevronRight className="h-4 w-4 opacity-60" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border/20">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground/60 hover:text-foreground hover:border-border/40"
              )}
            >
              {t.label}
              <span className={cn(
                "eyebrow px-1.5 py-0.5 rounded-md text-[10px] font-black",
                tab === t.id ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground/50"
              )}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <p className="text-sm font-semibold text-muted-foreground/50">No assignments here yet.</p>
            <Button variant="outline" size="sm" render={<Link href="/dashboard/pre-evaluation" />} nativeButton={false}>
              <PlusCircle className="h-3.5 w-3.5" />
              Create one
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table className="text-left">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-muted/40">
                  <TableHead className="eyebrow text-muted-foreground/60 px-4 py-4 h-auto" style={{ width: 300 }}>Assignment</TableHead>
                  <TableHead className="eyebrow text-muted-foreground/60 px-4 py-4 h-auto">Course · Code</TableHead>
                  <TableHead className="eyebrow text-muted-foreground/60 px-4 py-4 h-auto" style={{ width: 120 }}>Semester</TableHead>
                  <TableHead className="eyebrow text-muted-foreground/60 px-4 py-4 h-auto" style={{ width: 130 }}>Due Date</TableHead>
                  <TableHead className="eyebrow text-muted-foreground/60 px-4 py-4 h-auto text-center" style={{ width: 150 }}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((assignment) => {
                  const token = STATUS_TOKEN[assignment.status]
                  const s = statusStyles[token]
                  const isPublished = assignment.status === "active" || assignment.status === "completed"
                  const due = getDaysLabel(assignment.deadline, assignment.status)
                  const dueStyle = statusStyles[due.tone]

                  return (
                    <TableRow key={assignment.id} className="group/row hover:bg-muted/20">
                      {/* Assignment title — with left stripe */}
                      <TableCell className="p-0 align-middle whitespace-normal">
                        <div className="flex items-stretch">
                          <div className={cn("w-1 flex-shrink-0 self-stretch", s.dot)} />
                          <div className="px-4 py-4 flex flex-col gap-1">
                            <span className="text-sm font-semibold tracking-tight text-foreground leading-snug">
                              {assignment.title}
                            </span>
                            <span className="eyebrow text-muted-foreground/50">{assignment.institution}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Course · Code */}
                      <TableCell className="px-4 py-4 align-middle whitespace-normal">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-foreground">{assignment.course}</span>
                          <span className={cn("eyebrow self-start whitespace-nowrap px-1.5 py-0.5 rounded-md border", "bg-primary/5 text-primary border-primary/10")}>
                            {assignment.code}
                          </span>
                        </div>
                      </TableCell>

                      {/* Semester */}
                      <TableCell className="px-4 py-4 align-middle">
                        <span className="eyebrow text-muted-foreground/60">{assignment.semester}</span>
                      </TableCell>

                      {/* Due Date */}
                      <TableCell className="px-4 py-4 align-middle whitespace-normal">
                        <div className="flex flex-col">
                          <span className={cn("text-xs font-semibold tracking-tight", dueStyle.text)}>{due.label}</span>
                          <span className="eyebrow text-muted-foreground/50">{due.sub}</span>
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="px-4 py-4 align-middle text-center">
                        {isPublished ? (
                          <button
                            onClick={() => router.push(`/dashboard/assignments/${assignment.id}`)}
                            className="group/btn inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm"
                          >
                            View
                            <ChevronLeft className="size-3 rotate-180 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCourse(assignment.course)
                              updateAssignment({ title: assignment.title, type: assignment.type })
                              setStep(1)
                              router.push("/dashboard/pre-evaluation")
                            }}
                            className="group/btn inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium border border-border/40 bg-card hover:bg-muted/30 transition-all text-foreground/70"
                          >
                            Continue
                            <ChevronLeft className="size-3 rotate-180 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
