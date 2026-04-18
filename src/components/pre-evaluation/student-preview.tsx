"use client"

import { usePreEvalStore, CO_DEFINITIONS } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Eye,
  GraduationCap,
  Clock,
  Scale,
  CheckCircle2,
  ChevronRight,
  Monitor,
  Sparkles,
  ShieldCheck,
  Copy,
  Mail,
  Database,
  ArrowRight,
  LayoutDashboard,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ClipboardList,
} from "lucide-react"
import { useState } from "react"

const BLOOM_ACTION: Record<string, string> = {
  "L1: Remember": "Answer recall-based questions",
  "L2: Understand": "Explain and describe key concepts",
  "L3: Apply": "Implement and apply the concepts",
  "L4: Analyze": "Analyze and compare approaches",
  "L5: Evaluate": "Critically evaluate and justify decisions",
  "L6: Create": "Design and create original work",
}

const FORMAT_SUBMIT: Record<string, string> = {
  "PDF Document": "PDF file",
  "Cloud Link (Figma/GitHub)": "GitHub or Figma link",
}

export function StudentPreview() {
  const { assignment, rubric, prevStep, reset } = usePreEvalStore()
  const [view, setView] = useState<"preview" | "launch">("preview")
  const [previewMode, setPreviewMode] = useState<"student" | "instructor">("student")
  const [showFullRubric, setShowFullRubric] = useState(false)
  const [copied, setCopied] = useState(false)

  const totalWeight = assignment.sections.reduce(
    (acc, sec) => acc + sec.deliverables.reduce((s, d) => s + Number(d.weight), 0), 0
  )

  const deadlineDate = assignment.deadline
    ? new Date(assignment.deadline).toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "No deadline set"

  const deadlineTime = assignment.deadline
    ? new Date(assignment.deadline).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : ""

  const latePolicyLabel: Record<string, string> = {
    "no-late": "No late submissions accepted",
    "grace-24": "24-hour grace period",
    "penalty-10": "10% penalty per day late",
    "penalty-20": "20% penalty per day late",
  }

  const shareLink = `https://edu.univ.edu/eval/${assignment.title?.toLowerCase().replace(/\s+/g, "-") || "assignment"}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Flatten all deliverables into numbered tasks
  const allTasks = assignment.sections.flatMap((sec) =>
    sec.deliverables.map((d) => ({ ...d, sectionTitle: sec.title }))
  )

  // Collect unique COs from deliverables + rubric
  const allLinkedCOs = Array.from(new Set([
    ...allTasks.flatMap((t) => t.linkedCOs),
    ...rubric.map((r) => r.linkedCO),
  ]))

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
            <div className="absolute inset-0 border border-primary/10 rounded-full -m-4 animate-[spin_10s_linear_infinite] pointer-events-none" />
            <div className="absolute inset-0 border border-primary/5 rounded-full -m-8 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
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
                <Input
                  readOnly
                  value={shareLink}
                  className="h-12 bg-muted/10 border border-border/30 rounded-xl font-black text-sm px-5 focus-visible:ring-primary/10 tracking-tight"
                />
                <Button
                  variant="secondary"
                  className="h-12 w-12 rounded-xl border border-border/30 bg-background hover:bg-primary/5 hover:text-primary transition-all active:scale-90 shadow-none"
                  onClick={copyToClipboard}
                >
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

            <Button
              className="h-14 px-12 w-full text-lg font-black tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to Grading Desk
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <button
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-primary transition-all"
            onClick={reset}
          >
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
            <h1 className="text-2xl font-black tracking-tight secondary-text">Student Preview</h1>
            <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest">How your students will see this assignment</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted/40 border border-border/20 rounded-xl">
          <button
            onClick={() => setPreviewMode("student")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              previewMode === "student"
                ? "bg-background text-primary shadow-sm border border-border/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="h-3 w-3" />
            Student View
          </button>
          <button
            onClick={() => setPreviewMode("instructor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              previewMode === "instructor"
                ? "bg-background text-primary shadow-sm border border-border/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3 w-3" />
            Instructor View
          </button>
        </div>
      </div>

      {previewMode === "student" ? (
        /* ─── STUDENT VIEW ─── */
        <div className="border border-border/20 rounded-xl overflow-hidden bg-card animate-in fade-in duration-200">

          {/* A. Assignment Overview */}
          <div className="bg-muted/5 border-b border-border/10 px-8 py-7 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
              {assignment.institution.name}
            </p>
            <h2 className="text-2xl font-black tracking-tight secondary-text">
              {assignment.title || "Untitled Assignment"}
            </h2>
            {assignment.type && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 h-5 rounded-full">
                {assignment.type}
              </Badge>
            )}
            {assignment.brief && (
              <div className="pt-2 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">What you need to do</p>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  Complete the following tasks and submit your work.
                </p>
              </div>
            )}
          </div>

          <div className="px-8 py-7 space-y-8">

            {/* B. Tasks */}
            {allTasks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Your Tasks</p>
                  <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest ml-auto">Total: {totalWeight}%</span>
                </div>
                <div className="space-y-3">
                  {allTasks.map((task, i) => (
                    <div key={task.id} className="p-5 rounded-xl border border-border/20 bg-muted/[0.02] space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Task {i + 1}</span>
                          </div>
                          <p className="text-sm font-black text-foreground tracking-tight">{task.name}</p>
                        </div>
                        <span className="text-lg font-black text-foreground tabular-nums shrink-0">{task.weight}%</span>
                      </div>
                      <div className="space-y-1.5 text-[11px] font-semibold text-muted-foreground/60">
                        <p>• {BLOOM_ACTION[task.bloomLevel] ?? "Complete the task"}</p>
                        <p>• Submit as: {FORMAT_SUBMIT[task.format] ?? task.format}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="opacity-10" />

            {/* D. Submission Details */}
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Submission Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/5 border border-border/10">
                  <Clock className="h-4 w-4 text-primary/50 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Deadline</p>
                    <p className="text-sm font-bold text-foreground">{deadlineDate}</p>
                    {deadlineTime && <p className="text-[11px] text-muted-foreground font-medium">{deadlineTime}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/5 border border-border/10">
                  <Scale className="h-4 w-4 text-primary/50 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Late submissions</p>
                    <p className="text-sm font-bold text-foreground">{latePolicyLabel[assignment.latePolicy] || "No policy set"}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="opacity-10" />

            {/* E. Simplified Rubric */}
            {rubric.length > 0 && (
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">How you will be graded</p>
                <p className="text-[11px] font-semibold text-muted-foreground/50">
                  These criteria apply to your entire submission.
                </p>
                <div className="space-y-2">
                  {rubric.map((crit) => {
                    const exemplary = crit.levels.find((l) => l.label === "Exemplary") ?? crit.levels[0]
                    return (
                      <div key={crit.id} className="flex items-start gap-4 py-3 border-b border-border/10 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-black text-foreground">{crit.name}</p>
                        </div>
                        <p className="text-[11px] font-semibold text-muted-foreground/60 max-w-xs text-right leading-relaxed">
                          {exemplary?.description}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* F. Progressive disclosure — full rubric */}
                <button
                  onClick={() => setShowFullRubric((v) => !v)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors mt-2"
                >
                  {showFullRubric ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {showFullRubric ? "Hide full rubric" : "View full rubric"}
                </button>

                {showFullRubric && (
                  <div className="overflow-x-auto rounded-xl border border-border/20 animate-in fade-in duration-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border/10 bg-muted/5">
                          <th className="p-3 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 w-40">Criterion</th>
                          {rubric[0]?.levels.map((lvl) => (
                            <th key={lvl.label} className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 min-w-[120px]">
                              {lvl.label} <span className="opacity-50">({lvl.points}%)</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rubric.map((crit) => (
                          <tr key={crit.id} className="border-b border-border/5">
                            <td className="p-3">
                              <p className="text-[11px] font-bold text-foreground">{crit.name}</p>
                            </td>
                            {crit.levels.map((lvl) => (
                              <td key={lvl.label} className="p-3 text-center text-[11px] text-muted-foreground font-medium">
                                {lvl.description}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <Separator className="opacity-10" />

            {/* G. Skills you will develop */}
            {allLinkedCOs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Skills you will develop</p>
                </div>
                <div className="space-y-2">
                  {allLinkedCOs.map((co) => (
                    CO_DEFINITIONS[co] && (
                      <p key={co} className="text-[11px] font-semibold text-muted-foreground/60 flex items-start gap-2">
                        <span className="text-primary/40 mt-0.5">•</span>
                        {CO_DEFINITIONS[co]}
                      </p>
                    )
                  ))}
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
      ) : (
        /* ─── INSTRUCTOR VIEW ─── */
        <div className="border border-border/20 rounded-xl overflow-hidden bg-card animate-in fade-in duration-200">
          <div className="bg-muted/5 border-b border-border/10 px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                {assignment.institution.name} — {assignment.institution.dept}
              </p>
            </div>
            <h2 className="text-2xl font-black tracking-tight secondary-text">
              {assignment.title || "Untitled Assignment"}
            </h2>
            {assignment.type && (
              <Badge variant="outline" className="mt-3 bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 h-5 rounded-full">
                {assignment.type}
              </Badge>
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
                  <p className="text-sm font-bold text-foreground">{deadlineDate}</p>
                  {deadlineTime && <p className="text-[11px] text-muted-foreground font-medium">{deadlineTime}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/5 border border-border/10">
                <Scale className="h-4 w-4 text-primary/60" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Late Policy</p>
                  <p className="text-sm font-bold text-foreground">{latePolicyLabel[assignment.latePolicy] || "No policy set"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Assignment sections</p>
                </div>
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">Total: {totalWeight}%</p>
              </div>
              {assignment.sections.map((sec) => (
                <Card key={sec.id} className="border border-border/20 rounded-lg overflow-hidden shadow-none">
                  <div className="px-5 py-3 bg-muted/5 border-b border-border/10">
                    <p className="text-xs font-black text-foreground tracking-tight">{sec.title}</p>
                    {sec.description && (
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{sec.description}</p>
                    )}
                  </div>
                  <div className="divide-y divide-border/10">
                    {sec.deliverables.map((d) => (
                      <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-[12px] font-bold text-foreground">{d.name}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-1.5 h-4 bg-muted/30 border-border/20 rounded">
                              {d.bloomLevel}
                            </Badge>
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-1.5 h-4 bg-muted/30 border-border/20 rounded">
                              {d.format}
                            </Badge>
                            {d.linkedCOs.map((co) => (
                              <Badge key={co} variant="outline" className="text-[8px] font-black uppercase tracking-widest px-1.5 h-4 bg-primary/5 text-primary border-primary/20 rounded">
                                {co}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm font-black text-foreground tabular-nums">{d.weight}%</span>
                      </div>
                    ))}
                    {sec.deliverables.length === 0 && (
                      <div className="px-5 py-3 text-[11px] text-muted-foreground/40 font-medium italic">No deliverables defined</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-muted-foreground/40" />
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">How it will be graded</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border/20">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border/10 bg-muted/5">
                      <th className="p-3 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 w-48">Criterion</th>
                      {rubric.length > 0 && rubric[0].levels.map((lvl) => (
                        <th key={lvl.label} className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 min-w-[120px]">
                          {lvl.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rubric.map((crit) => (
                      <tr key={crit.id} className="border-b border-border/5">
                        <td className="p-3">
                          <p className="text-[11px] font-bold text-foreground">{crit.name}</p>
                          <Badge variant="outline" className="mt-1 text-[7px] font-black uppercase tracking-widest px-1 h-3 bg-primary/5 text-primary border-primary/20 rounded">
                            {crit.linkedCO}
                          </Badge>
                        </td>
                        {crit.levels.map((lvl) => (
                          <td key={lvl.label} className="p-3 text-center text-[11px] text-muted-foreground font-medium">
                            {lvl.description}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {assignment.artifacts.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Required submissions</p>
                <div className="flex flex-wrap gap-2">
                  {assignment.artifacts.map((art) => (
                    <Badge key={art} variant="outline" className="text-[9px] font-bold px-2 h-5 bg-muted/30 border-border/20 rounded-full">
                      {art}
                    </Badge>
                  ))}
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
      )}

      {/* Footer Actions */}
      <div className="flex justify-end pt-6 gap-3">
        <Button
          variant="ghost"
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground h-14 px-8 rounded-xl transition-all"
          onClick={reset}
        >
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
