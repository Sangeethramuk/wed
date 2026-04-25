"use client"

import { usePreEvalStore, type Block, type Assignment, type MatrixCriterion } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import {
  ArrowLeft,
  Clock,
  FileText,
  Scale,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Monitor,
  Sparkles,
  ShieldCheck,
  Copy,
  Mail,
  Database,
  ArrowRight,
  LayoutDashboard,
  FileCheck2,
  Link2,
  BookOpen,
  ChevronDown,
  Target,
  Users,
  Lightbulb,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const TYPE_STYLES: Record<string, string> = {
  Project:      "bg-primary/10 text-primary border-primary/20",
  MCQ:          "bg-[color:var(--status-info)]/10 text-[color:var(--status-info)] border-[color:var(--status-info)]/20",
  Essay:        "bg-[color:var(--status-warning)]/10 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/20",
  Design:       "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Lab Record": "bg-[color:var(--status-success)]/10 text-[color:var(--status-success)] border-[color:var(--status-success)]/20",
  Viva:         "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Case Study": "bg-[color:var(--status-info)]/10 text-[color:var(--status-info)] border-[color:var(--status-info)]/20",
  Specialized:  "bg-muted/30 text-slate-400 border-muted-foreground/20",
}

function resolveType(assignment: Assignment): string {
  if (assignment.type) return assignment.type

  const questions = assignment.blocks
    .filter(b => b.type === "questions")
    .flatMap(b => (b as Extract<Block, { type: "questions" }>).questions)
    .filter(q => q.text.trim())

  const deliverables = assignment.blocks
    .filter(b => b.type === "deliverables")
    .flatMap(b => (b as Extract<Block, { type: "deliverables" }>).items)
    .filter(i => i.name.trim())

  const instrBody = (assignment.blocks.find(b => b.type === "instructions") as Extract<Block, { type: "instructions" }> | undefined)?.body ?? ""
  const text = `${assignment.title} ${instrBody} ${deliverables.map(d => d.name).join(" ")}`.toLowerCase()

  if (/\bviva\b|\boral\b/.test(text)) return "Viva"
  if (/\blab\b|\brecord\b/.test(text)) return "Lab Record"
  if (/\bessay\b/.test(text)) return "Essay"
  if (/\bcase[\s-]?stud/.test(text)) return "Case Study"
  if (/\bdesign\b|\bprototype\b|\bfigma\b/.test(text)) return "Design"
  if (questions.length > 10) return "MCQ"
  if (deliverables.some(d => /repo|github|source|code/.test(d.name.toLowerCase()))) return "Project"
  if (questions.length > 0 && deliverables.length === 0) return "MCQ"
  if (deliverables.length >= 2) return "Project"

  return "Specialized"
}

export function StudentPreview() {
  const { assignment, rubric, prevStep, reset } = usePreEvalStore()
  const [viewMode, setViewMode] = useState<"student" | "instructor">("student")
  const [view, setView] = useState<"preview" | "launch">("preview")
  const [copied, setCopied] = useState(false)
  const questionBlocks = assignment.blocks.filter(b => b.type === "questions") as Extract<Block, { type: "questions" }>[]
  const deliverableBlocks = assignment.blocks.filter(b => b.type === "deliverables") as Extract<Block, { type: "deliverables" }>[]
  const allQuestions = questionBlocks.flatMap(b => b.questions).filter(q => q.text.trim())
  const allDeliverables = deliverableBlocks.flatMap(b => b.items).filter(i => i.name.trim())
  const instructionBlock = assignment.blocks.find(b => b.type === "instructions") as Extract<Block, { type: "instructions" }> | undefined

  const deadlineDate = assignment.deadline
    ? new Date(assignment.deadline).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "Not set"
  const deadlineTime = assignment.deadline
    ? new Date(assignment.deadline).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : ""

  const latePolicyLabel: Record<string, string> = {
    "no-late": "Not allowed",
    "grace-24": "24-hour grace period",
    "penalty-10": "10% penalty per day",
    "penalty-20": "20% penalty per day",
  }

  const shareLink = `https://edu.univ.edu/eval/${assignment.title?.toLowerCase().replace(/\s+/g, '-') || 'assignment'}`
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (view === "launch") {
    return (
      <div className="max-w-2xl mx-auto py-20 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="text-center space-y-6">
          <div className="relative inline-flex mb-4">
            <div className="h-32 w-32 rounded-xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:scale-150 transition-transform duration-1000" />
              <Monitor className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute bottom-4 right-4 h-8 w-8 rounded-xl bg-[color:var(--status-success)] flex items-center justify-center border-4 border-background shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <Sparkles className="absolute top-4 right-4 h-4 w-4 text-primary/40 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Your assignment is live!</h1>
            <p className="text-slate-500 font-semibold text-base opacity-70">Your students can now submit their work.</p>
          </div>
        </div>

        <Card className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Submission link for students</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-[color:var(--status-success)]" />
                  <span className="eyebrow text-[color:var(--status-success)]/60">Verified</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Input readOnly value={shareLink} className="h-12 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-sm px-5 focus-visible:ring-primary/10 tracking-tight" />
                <Button variant="secondary" size="icon" onClick={copyToClipboard}>
                  {copied ? <CheckCircle2 className="h-5 w-5 text-[color:var(--status-success)]" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-400">What&apos;s next</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto flex-col items-start gap-3 p-5 group text-left whitespace-normal">
                  <div className="h-9 w-9 rounded-lg bg-[color:var(--status-info)]/10 flex items-center justify-center border border-[color:var(--status-info)]/10">
                    <Database className="h-4 w-4 text-[color:var(--status-info)] opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold block">Connect to LMS</span>
                    <span className="text-xs text-slate-400">Sync with Canvas or Moodle</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-start gap-3 p-5 group text-left whitespace-normal">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                    <Mail className="h-4 w-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold block">Share with staff</span>
                    <span className="text-xs text-slate-400">Send this assignment to other teachers</span>
                  </div>
                </Button>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={() => (window.location.href = "/dashboard")}>
              Go to grading desk <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button variant="link" className="group" onClick={reset}>
            <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-primary/40 transition-all">
              <LayoutDashboard className="h-3.5 w-3.5" />
            </div>
            Return to course dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6 -mx-4 px-4 pt-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Preview & Publish</h1>
            <p className="eyebrow font-semibold text-slate-400">Review before publishing</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
          <Button
            variant={viewMode === "student" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("student")}
          >
            <Users className="h-3 w-3" />
            Student view
          </Button>
          <Button
            variant={viewMode === "instructor" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("instructor")}
          >
            <GraduationCap className="h-3 w-3" />
            Instructor view
          </Button>
        </div>
      </div>

      {viewMode === "student" ? (
        <StudentView
          assignment={assignment}
          rubric={rubric}
          allQuestions={allQuestions}
          allDeliverables={allDeliverables}
          instructionBlock={instructionBlock}
          deadlineDate={deadlineDate}
          deadlineTime={deadlineTime}
          latePolicyLabel={latePolicyLabel}
        />
      ) : (
        <InstructorView
          assignment={assignment}
          rubric={rubric}
          allQuestions={allQuestions}
          deadlineDate={deadlineDate}
          deadlineTime={deadlineTime}
          latePolicyLabel={latePolicyLabel}
        />
      )}

      <div className="flex justify-end pt-10 gap-3">
        <Button variant="ghost" onClick={reset}>
          Save as draft
        </Button>
        <Button
          size="lg"
          onClick={() => setView("launch")}
        >
          Publish assignment <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Reusable Preview Body ────────────────────────────────────────────────────
//
// Renders the same Student/Instructor toggle + view that StudentPreview shows,
// but without the back-arrow header or publish footer. Other surfaces (e.g.,
// the Assignments detail page Preview tab) embed this directly.
export function AssignmentPreviewBody({
  assignment,
  rubric,
}: {
  assignment: Assignment
  rubric: MatrixCriterion[]
}) {
  const [viewMode, setViewMode] = useState<"student" | "instructor">("student")

  const questionBlocks = assignment.blocks.filter(b => b.type === "questions") as Extract<Block, { type: "questions" }>[]
  const deliverableBlocks = assignment.blocks.filter(b => b.type === "deliverables") as Extract<Block, { type: "deliverables" }>[]
  const allQuestions = questionBlocks.flatMap(b => b.questions).filter(q => q.text.trim())
  const allDeliverables = deliverableBlocks.flatMap(b => b.items).filter(i => i.name.trim())
  const instructionBlock = assignment.blocks.find(b => b.type === "instructions") as Extract<Block, { type: "instructions" }> | undefined

  const deadlineDate = assignment.deadline
    ? new Date(assignment.deadline).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "Not set"
  const deadlineTime = assignment.deadline
    ? new Date(assignment.deadline).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : ""

  const latePolicyLabel: Record<string, string> = {
    "no-late": "Not allowed",
    "grace-24": "24-hour grace period",
    "penalty-10": "10% penalty per day",
    "penalty-20": "20% penalty per day",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
          <Button
            variant={viewMode === "student" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("student")}
          >
            <Users className="h-3 w-3" />
            Student view
          </Button>
          <Button
            variant={viewMode === "instructor" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("instructor")}
          >
            <GraduationCap className="h-3 w-3" />
            Instructor view
          </Button>
        </div>
      </div>

      {viewMode === "student" ? (
        <StudentView
          assignment={assignment}
          rubric={rubric}
          allQuestions={allQuestions}
          allDeliverables={allDeliverables}
          instructionBlock={instructionBlock}
          deadlineDate={deadlineDate}
          deadlineTime={deadlineTime}
          latePolicyLabel={latePolicyLabel}
        />
      ) : (
        <InstructorView
          assignment={assignment}
          rubric={rubric}
          allQuestions={allQuestions}
          deadlineDate={deadlineDate}
          deadlineTime={deadlineTime}
          latePolicyLabel={latePolicyLabel}
        />
      )}
    </div>
  )
}

// ─── Student View ─────────────────────────────────────────────────────────────

function StudentView({
  assignment,
  rubric,
  allQuestions,
  allDeliverables,
  instructionBlock,
  deadlineDate,
  deadlineTime,
  latePolicyLabel,
}: {
  assignment: Assignment
  rubric: MatrixCriterion[]
  allQuestions: Extract<Block, { type: "questions" }>["questions"]
  allDeliverables: Extract<Block, { type: "deliverables" }>["items"]
  instructionBlock: Extract<Block, { type: "instructions" }> | undefined
  deadlineDate: string
  deadlineTime: string
  latePolicyLabel: Record<string, string>
}) {
  const resolvedType = resolveType(assignment)
  const typeClass = TYPE_STYLES[resolvedType] ?? TYPE_STYLES.Specialized

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white animate-in fade-in duration-300">
      {/* Assignment Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-8 py-8 space-y-3">
        <p className="text-xs text-slate-400">
          {assignment.institution.name}
        </p>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-2xl font-semibold text-slate-900">
            {assignment.title || "Untitled Assignment"}
          </h2>
          <Badge variant="outline" className={`eyebrow ${typeClass}`}>
            {resolvedType}
          </Badge>
        </div>
        {instructionBlock?.body.trim() && (
          <p className="text-sm text-slate-700 leading-relaxed font-medium pt-1">
            {instructionBlock.body}
          </p>
        )}
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Submission Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Clock className="h-4 w-4 text-primary/50 mt-0.5 shrink-0" />
            <div>
              <p className="eyebrow text-slate-400 mb-1">Deadline</p>
              <p className="text-sm font-bold">{deadlineDate}</p>
              {deadlineTime && <p className="text-xs text-slate-400 font-medium">{deadlineTime}</p>}
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Scale className="h-4 w-4 text-primary/50 mt-0.5 shrink-0" />
            <div>
              <p className="eyebrow text-slate-400 mb-1">Late Submissions</p>
              <p className="text-sm font-bold">{latePolicyLabel[assignment.latePolicy] || "No policy set"}</p>
            </div>
          </div>
        </div>

        {/* Tasks */}
        {allQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">What to do</p>
            </div>
            <div className="space-y-2">
              {allQuestions.map((q, idx) => (
                <div key={q.id} className="flex items-start gap-4 px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <span className="eyebrow text-primary/50 shrink-0 pt-0.5">Task {idx + 1}</span>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">{q.text || <span className="italic opacity-40">Untitled task</span>}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliverables */}
        {allDeliverables.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">What to submit</p>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
              {allDeliverables.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50/50">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">{idx + 1}</span>
                  <p className="text-sm font-semibold text-slate-900">{item.name || <span className="italic opacity-40">Untitled</span>}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simplified Rubric */}
        {rubric.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">How you will be graded</p>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
              {rubric.map((crit) => {
                const exemplary = crit.levels.find(l => l.label === "Exemplary")
                return (
                  <div key={crit.id} className="px-4 py-3.5 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{crit.name}</p>
                      <span className="text-xs text-slate-400">{crit.weight}%</span>
                    </div>
                    {exemplary?.description.trim() && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        <span className="text-primary/60 font-semibold">→ </span>{exemplary.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        )}

        {/* Skills you will develop */}
        {rubric.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">Skills you will develop</p>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
              {rubric.map((crit, idx) => {
                const exemplary = crit.levels.find(l => l.label === "Exemplary")
                return (
                  <div key={crit.id} className="flex items-start gap-3 px-4 py-3.5 bg-slate-50/50">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{crit.name}</p>
                      {exemplary?.description.trim() && (
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{exemplary.description}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="h-3 w-3" />
          <span className="eyebrow">Verified</span>
        </div>
        <span className="eyebrow text-slate-300">{assignment.institution.name}</span>
      </div>
    </div>
  )
}

// ─── Instructor View ──────────────────────────────────────────────────────────

function InstructorView({
  assignment,
  rubric,
  allQuestions,
  deadlineDate,
  deadlineTime,
  latePolicyLabel,
}: {
  assignment: Assignment
  rubric: MatrixCriterion[]
  allQuestions: Extract<Block, { type: "questions" }>["questions"]
  deadlineDate: string
  deadlineTime: string
  latePolicyLabel: Record<string, string>
}) {
  const totalWeight = allQuestions.reduce((s, q) => s + Number(q.weight || 0), 0)
  const resolvedType = resolveType(assignment)
  const typeClass = TYPE_STYLES[resolvedType] ?? TYPE_STYLES.Specialized

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white animate-in fade-in duration-300">
      <div className="bg-slate-50 border-b border-slate-100 px-8 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs text-slate-400">
            {assignment.institution.name} — {assignment.institution.dept}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-2xl font-semibold text-slate-900">{assignment.title || "Untitled Assignment"}</h2>
          <Badge variant="outline" className={`eyebrow ${typeClass}`}>
            {resolvedType}
          </Badge>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {assignment.brief && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">What students need to do</p>
            </div>
            <p className="text-sm text-slate-900 leading-relaxed font-medium">{assignment.brief}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <Clock className="h-4 w-4 text-primary/60" />
            <div>
              <p className="text-xs text-slate-400">Deadline</p>
              <p className="text-sm font-bold">{deadlineDate}</p>
              {deadlineTime && <p className="text-xs text-slate-500 font-medium">{deadlineTime}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <Scale className="h-4 w-4 text-primary/60" />
            <div>
              <p className="text-xs text-slate-400">Late Policy</p>
              <p className="text-sm font-bold">{latePolicyLabel[assignment.latePolicy] || "No policy set"}</p>
            </div>
          </div>
        </div>

        {/* All blocks — full detail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">Assignment structure</p>
            </div>
            <p className="text-xs text-slate-400">Weights total: {totalWeight}%</p>
          </div>

          {assignment.blocks.map((block) => {
            const Icon = block.type === "instructions" ? FileText : block.type === "questions" ? FileCheck2 : block.type === "deliverables" ? BookOpen : Link2
            return (
              <Card key={block.id} className="border border-slate-200 rounded-lg overflow-hidden shadow-none">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-primary/70" />
                  <p className="text-xs font-semibold text-slate-900 tracking-tight">{block.title}</p>
                </div>

                {block.type === "instructions" && (
                  <div className="px-5 py-4">
                    {block.body.trim()
                      ? <p className="text-sm text-slate-900 leading-relaxed font-medium whitespace-pre-wrap">{block.body}</p>
                      : <p className="text-xs text-slate-400 font-medium italic">No instructions provided.</p>
                    }
                  </div>
                )}

                {block.type === "questions" && (
                  <div className="divide-y divide-slate-100">
                    {block.questions.length === 0
                      ? <div className="px-5 py-3 text-xs text-slate-400 font-medium italic">No questions added.</div>
                      : block.questions.map((q, idx) => (
                        <div key={q.id} className="px-5 py-3 flex items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 leading-relaxed">
                              <span className="text-slate-400 mr-2">Q{idx + 1}.</span>
                              {q.text || <span className="italic opacity-40">Empty question</span>}
                            </p>
                            <Badge variant="outline" className="eyebrow px-1.5 h-4 bg-muted/30 border-slate-200 rounded">
                              {q.bloomLevel}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">{q.weight}%</span>
                        </div>
                      ))
                    }
                  </div>
                )}

                {block.type === "deliverables" && (
                  <div className="divide-y divide-slate-100">
                    {block.items.length === 0
                      ? <div className="px-5 py-3 text-xs text-slate-400 font-medium italic">No deliverables defined.</div>
                      : block.items.map((item) => (
                        <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-4">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{item.name || <span className="italic opacity-40">Untitled</span>}</p>
                            {item.description && <p className="text-xs text-slate-500 font-medium">{item.description}</p>}
                          </div>
                          <Badge variant="outline" className="eyebrow px-2 h-5 bg-muted/30 border-slate-200 rounded shrink-0">{item.format}</Badge>
                        </div>
                      ))
                    }
                  </div>
                )}

                {block.type === "resources" && (
                  <div className="divide-y divide-slate-100">
                    {block.items.length === 0
                      ? <div className="px-5 py-3 text-xs text-slate-400 font-medium italic">No resources added.</div>
                      : block.items.map((item) => (
                        <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-4">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.name || <span className="italic opacity-40">Untitled</span>}</p>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="eyebrow text-primary/70 hover:text-primary inline-flex items-center gap-1 shrink-0">
                              <Link2 className="h-3 w-3" />Open
                            </a>
                          )}
                        </div>
                      ))
                    }
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Full rubric grid */}
        {rubric.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">How it will be graded</p>
              <span className="text-xs text-slate-400 font-medium">— applies to entire submission</span>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                    <TableHead className="eyebrow p-3 text-left text-slate-400 w-48 whitespace-normal">Criterion</TableHead>
                    {rubric[0].levels.map(lvl => (
                      <TableHead key={lvl.label} className="eyebrow p-3 text-center text-slate-400 min-w-[120px]">{lvl.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rubric.map(crit => (
                    <TableRow key={crit.id} className="border-b border-slate-100 hover:bg-slate-100">
                      <TableCell className="p-3 whitespace-normal align-top">
                        <p className="text-xs font-bold text-slate-900">{crit.name}</p>
                        <Badge variant="outline" className="eyebrow mt-1 text-xs px-1 h-3 bg-primary/5 text-primary border-primary/20 rounded">{crit.linkedCO}</Badge>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{crit.weight}%</p>
                      </TableCell>
                      {crit.levels.map(lvl => (
                        <TableCell key={lvl.label} className="p-3 text-center text-xs text-slate-500 font-medium whitespace-normal align-top">{lvl.description}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="h-3 w-3" />
          <span className="eyebrow">Verified</span>
        </div>
        <span className="eyebrow text-slate-300">
          {assignment.institution.accreditation.join(" · ")}
        </span>
      </div>
    </div>
  )
}
