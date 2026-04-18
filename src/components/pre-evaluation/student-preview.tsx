"use client"

import { usePreEvalStore, type Block, type Assignment, type MatrixCriterion } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
            <div className="h-32 w-32 rounded-3xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:scale-150 transition-transform duration-1000" />
              <Monitor className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute bottom-4 right-4 h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center border-4 border-background shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <Sparkles className="absolute top-4 right-4 h-4 w-4 text-primary/40 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight secondary-text uppercase">Your assignment is live!</h1>
            <p className="text-muted-foreground font-semibold text-base opacity-70">Your students can now submit their work.</p>
          </div>
        </div>

        <Card className="border border-border/20 rounded-2xl overflow-hidden bg-card">
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Submission link for students</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Verified</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Input readOnly value={shareLink} className="h-12 bg-muted/10 border border-border/30 rounded-xl font-black text-sm px-5 focus-visible:ring-primary/10 tracking-tight" />
                <Button variant="secondary" className="h-12 w-12 rounded-xl border border-border/30 bg-background hover:bg-primary/5 hover:text-primary transition-all active:scale-90 shadow-none" onClick={copyToClipboard}>
                  {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">What&apos;s next</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-3 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group text-left shadow-none">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                    <Database className="h-4 w-4 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest block">Connect to LMS</span>
                    <span className="text-[9px] font-bold text-muted-foreground/40 leading-none">Sync with Canvas or Moodle</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-5 flex flex-col items-start gap-3 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group text-left shadow-none">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                    <Mail className="h-4 w-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest block">Share with staff</span>
                    <span className="text-[9px] font-bold text-muted-foreground/40 leading-none">Send this assignment to other teachers</span>
                  </div>
                </Button>
              </div>
            </div>
            <Button className="h-14 px-12 w-full text-lg font-black tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90" onClick={() => (window.location.href = "/dashboard")}>
              Go to Grading Desk <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <button className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-primary transition-all" onClick={reset}>
            <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 transition-all">
              <LayoutDashboard className="h-3.5 w-3.5" />
            </div>
            Return to course dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/10 pb-6 sticky top-0 z-50 bg-background/80 backdrop-blur-md -mx-4 px-4 pt-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-border/20 shadow-none" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight secondary-text">Preview & Publish</h1>
            <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Review before publishing</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/20 border border-border/20">
          <button
            onClick={() => setViewMode("student")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
              viewMode === "student"
                ? "bg-background text-foreground shadow-sm border border-border/20"
                : "text-muted-foreground/50 hover:text-foreground"
            )}
          >
            <Users className="h-3 w-3" />
            Student View
          </button>
          <button
            onClick={() => setViewMode("instructor")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
              viewMode === "instructor"
                ? "bg-background text-foreground shadow-sm border border-border/20"
                : "text-muted-foreground/50 hover:text-foreground"
            )}
          >
            <GraduationCap className="h-3 w-3" />
            Instructor View
          </button>
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
        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground h-14 px-8 rounded-xl transition-all" onClick={reset}>
          Save as draft
        </Button>
        <Button
          className="h-14 px-12 text-lg font-black tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90"
          onClick={() => setView("launch")}
        >
          Publish Assignment <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      </div>
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
  return (
    <div className="border border-border/20 rounded-2xl overflow-hidden bg-card animate-in fade-in duration-300">
      {/* Assignment Header */}
      <div className="bg-muted/[0.03] border-b border-border/10 px-8 py-8 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
          {assignment.institution.name}
        </p>
        <h2 className="text-2xl font-black tracking-tight">
          {assignment.title || "Untitled Assignment"}
        </h2>
        {assignment.type && (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 h-5 rounded-full">
            {assignment.type}
          </Badge>
        )}
        {instructionBlock?.body.trim() && (
          <p className="text-sm text-foreground/70 leading-relaxed font-medium pt-1">
            {instructionBlock.body}
          </p>
        )}
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Submission Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/5 border border-border/10">
            <Clock className="h-4 w-4 text-primary/50 mt-0.5 shrink-0" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Deadline</p>
              <p className="text-sm font-bold">{deadlineDate}</p>
              {deadlineTime && <p className="text-[11px] text-muted-foreground/60 font-medium">{deadlineTime}</p>}
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/5 border border-border/10">
            <Scale className="h-4 w-4 text-primary/50 mt-0.5 shrink-0" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Late Submissions</p>
              <p className="text-sm font-bold">{latePolicyLabel[assignment.latePolicy] || "No policy set"}</p>
            </div>
          </div>
        </div>

        {/* Tasks */}
        {allQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-3.5 w-3.5 text-muted-foreground/40" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">What to do</p>
            </div>
            <div className="space-y-2">
              {allQuestions.map((q, idx) => (
                <div key={q.id} className="flex items-start justify-between gap-4 px-4 py-3.5 rounded-xl border border-border/15 bg-muted/[0.02] hover:bg-muted/[0.04] transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest shrink-0 pt-0.5">Task {idx + 1}</span>
                    <p className="text-sm font-semibold text-foreground leading-relaxed">{q.text || <span className="italic opacity-40">Untitled task</span>}</p>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest shrink-0 pt-0.5">{q.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliverables */}
        {allDeliverables.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground/40" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">What to submit</p>
            </div>
            <div className="rounded-xl border border-border/15 overflow-hidden divide-y divide-border/10">
              {allDeliverables.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-muted/[0.02]">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[9px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                  <p className="text-sm font-semibold text-foreground">{item.name || <span className="italic opacity-40">Untitled</span>}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simplified Rubric */}
        {rubric.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-muted-foreground/40" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">How you will be graded</p>
            </div>
            <div className="rounded-xl border border-border/15 overflow-hidden divide-y divide-border/10">
              {rubric.map((crit) => {
                const exemplary = crit.levels.find(l => l.label === "Exemplary")
                return (
                  <div key={crit.id} className="px-4 py-3.5 bg-muted/[0.02] space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black text-foreground">{crit.name}</p>
                      <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{crit.weight}%</span>
                    </div>
                    {exemplary?.description.trim() && (
                      <p className="text-[11px] text-muted-foreground/70 font-medium leading-relaxed">
                        <span className="text-primary/60 font-black">→ </span>{exemplary.description}
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
              <Lightbulb className="h-3.5 w-3.5 text-muted-foreground/40" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Skills you will develop</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {rubric.map(crit => (
                <div key={crit.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/20 bg-muted/5 text-[10px] font-bold text-foreground/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  {crit.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/10 bg-muted/[0.02] px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground/30">
          <CheckCircle2 className="h-3 w-3" />
          <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20">{assignment.institution.name}</span>
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

  return (
    <div className="border border-border/20 rounded-2xl overflow-hidden bg-card animate-in fade-in duration-300">
      <div className="bg-muted/5 border-b border-border/10 px-8 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
            {assignment.institution.name} — {assignment.institution.dept}
          </p>
        </div>
        <h2 className="text-2xl font-black tracking-tight secondary-text">{assignment.title || "Untitled Assignment"}</h2>
        {assignment.type && (
          <Badge variant="outline" className="mt-3 bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 h-5 rounded-full">{assignment.type}</Badge>
        )}
      </div>

      <div className="px-8 py-6 space-y-6">
        {assignment.brief && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground/40" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">What students need to do</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed font-medium">{assignment.brief}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/5 border border-border/10">
            <Clock className="h-4 w-4 text-primary/60" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Deadline</p>
              <p className="text-sm font-bold">{deadlineDate}</p>
              {deadlineTime && <p className="text-[11px] text-muted-foreground font-medium">{deadlineTime}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/5 border border-border/10">
            <Scale className="h-4 w-4 text-primary/60" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Late Policy</p>
              <p className="text-sm font-bold">{latePolicyLabel[assignment.latePolicy] || "No policy set"}</p>
            </div>
          </div>
        </div>

        {/* All blocks — full detail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground/40" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Assignment structure</p>
            </div>
            <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">Weights total: {totalWeight}%</p>
          </div>

          {assignment.blocks.map((block) => {
            const Icon = block.type === "instructions" ? FileText : block.type === "questions" ? FileCheck2 : block.type === "deliverables" ? BookOpen : Link2
            return (
              <Card key={block.id} className="border border-border/20 rounded-lg overflow-hidden shadow-none">
                <div className="px-5 py-3 bg-muted/5 border-b border-border/10 flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-primary/70" />
                  <p className="text-xs font-black text-foreground tracking-tight">{block.title}</p>
                </div>

                {block.type === "instructions" && (
                  <div className="px-5 py-4">
                    {block.body.trim()
                      ? <p className="text-sm text-foreground leading-relaxed font-medium whitespace-pre-wrap">{block.body}</p>
                      : <p className="text-[11px] text-muted-foreground/40 font-medium italic">No instructions provided.</p>
                    }
                  </div>
                )}

                {block.type === "questions" && (
                  <div className="divide-y divide-border/10">
                    {block.questions.length === 0
                      ? <div className="px-5 py-3 text-[11px] text-muted-foreground/40 font-medium italic">No questions added.</div>
                      : block.questions.map((q, idx) => (
                        <div key={q.id} className="px-5 py-3 flex items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-[12px] font-bold text-foreground leading-relaxed">
                              <span className="text-muted-foreground/50 mr-2">Q{idx + 1}.</span>
                              {q.text || <span className="italic opacity-40">Empty question</span>}
                            </p>
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-1.5 h-4 bg-muted/30 border-border/20 rounded">
                              {q.bloomLevel}
                            </Badge>
                          </div>
                          <span className="text-sm font-black text-foreground tabular-nums shrink-0">{q.weight}%</span>
                        </div>
                      ))
                    }
                  </div>
                )}

                {block.type === "deliverables" && (
                  <div className="divide-y divide-border/10">
                    {block.items.length === 0
                      ? <div className="px-5 py-3 text-[11px] text-muted-foreground/40 font-medium italic">No deliverables defined.</div>
                      : block.items.map((item) => (
                        <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-4">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[12px] font-bold text-foreground truncate">{item.name || <span className="italic opacity-40">Untitled</span>}</p>
                            {item.description && <p className="text-[11px] text-muted-foreground font-medium">{item.description}</p>}
                          </div>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 h-5 bg-muted/30 border-border/20 rounded shrink-0">{item.format}</Badge>
                        </div>
                      ))
                    }
                  </div>
                )}

                {block.type === "resources" && (
                  <div className="divide-y divide-border/10">
                    {block.items.length === 0
                      ? <div className="px-5 py-3 text-[11px] text-muted-foreground/40 font-medium italic">No resources added.</div>
                      : block.items.map((item) => (
                        <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-4">
                          <p className="text-[12px] font-bold text-foreground truncate">{item.name || <span className="italic opacity-40">Untitled</span>}</p>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary inline-flex items-center gap-1 shrink-0">
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
              <Scale className="h-3.5 w-3.5 text-muted-foreground/40" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">How it will be graded</p>
              <span className="text-[9px] text-muted-foreground/30 font-medium">— applies to entire submission</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/20">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/10 bg-muted/5">
                    <th className="p-3 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 w-48">Criterion</th>
                    {rubric[0].levels.map(lvl => (
                      <th key={lvl.label} className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 min-w-[120px]">{lvl.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rubric.map(crit => (
                    <tr key={crit.id} className="border-b border-border/5">
                      <td className="p-3">
                        <p className="text-[11px] font-bold text-foreground">{crit.name}</p>
                        <Badge variant="outline" className="mt-1 text-[7px] font-black uppercase tracking-widest px-1 h-3 bg-primary/5 text-primary border-primary/20 rounded">{crit.linkedCO}</Badge>
                        <p className="text-[9px] text-muted-foreground/50 font-semibold mt-0.5">{crit.weight}%</p>
                      </td>
                      {crit.levels.map(lvl => (
                        <td key={lvl.label} className="p-3 text-center text-[11px] text-muted-foreground font-medium">{lvl.description}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/10 bg-muted/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground/30">
          <CheckCircle2 className="h-3 w-3" />
          <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20">
          {assignment.institution.accreditation.join(" · ")}
        </span>
      </div>
    </div>
  )
}
