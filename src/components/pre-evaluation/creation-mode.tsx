"use client"

import { useState } from "react"
import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  History,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  Target,
  CheckCircle2,
  ArrowRight,
  FileText,
  ListChecks,
  Layers,
  BookOpen,
  TrendingUp,
} from "lucide-react"
import {
  MOCK_HISTORY,
  CO_DEFINITIONS,
  type HistoricalAssignment,
  type COStrength,
} from "@/lib/store/pre-evaluation-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const strengthClasses: Record<COStrength, string> = {
  Strong: "border-[color:var(--status-success)]/30 text-[color:var(--status-success)]/80 bg-[color:var(--status-success)]/[0.04]",
  Moderate: "border-[color:var(--status-warning)]/30 text-[color:var(--status-warning)]/80 bg-[color:var(--status-warning)]/[0.04]",
  Weak: "border-muted-foreground/20 text-muted-foreground/60 bg-muted/20",
}

const strengthTextClass: Record<COStrength, string> = {
  Strong: "text-[color:var(--status-success)]",
  Moderate: "text-[color:var(--status-warning)]",
  Weak: "text-muted-foreground/50",
}

// Short, action-focused CO briefs for scanning (not the full definition)
const CO_BRIEF: Record<string, string> = {
  CO1: "Foundational concepts applied but not the primary assessment focus",
  CO2: "Core system design and architecture is the primary task",
  CO3: "Testing and validation strategies are directly evaluated",
  CO4: "Performance analysis and ethical reasoning are explicitly assessed",
  CO5: "Collaborative process and peer engagement are assessed",
}

export function CreationMode() {
  const { creationMode, selectedCourse, setCreationMode, selectedHistoryId, selectHistory, nextStep, prevStep } = usePreEvalStore()
  const [previewId, setPreviewId] = useState<string | null>(null)

  const handleModeSelect = (mode: "history" | "scratch" | "suggestions") => {
    setCreationMode(mode)
    if (mode === "scratch" || mode === "suggestions") {
      nextStep()
    }
  }

  const handleHistorySelect = (id: string) => {
    selectHistory(id)
    nextStep()
  }

  const similarHistory = selectedCourse
    ? MOCK_HISTORY.filter(h => h.course === selectedCourse)
    : MOCK_HISTORY
  const similarCount = similarHistory.length
  const lastUsed = similarHistory[0]?.lastUsed ?? "recently"

  const displayed = similarHistory.length > 0 ? similarHistory : MOCK_HISTORY
  const bestMatches = displayed.filter(h => h.bestMatch).slice(0, 3)
  const rest = displayed.filter(h => !bestMatches.includes(h))
  const previewed = previewId ? MOCK_HISTORY.find(h => h.id === previewId) ?? null : null

  const showHistoryList = creationMode === "history" && !selectedHistoryId

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => creationMode ? setCreationMode(null) : prevStep()} className="gap-2 px-3 text-muted-foreground hover:text-foreground group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="eyebrow">{creationMode ? "Back" : "Back to courses"}</span>
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight secondary-text">
          {showHistoryList ? "Pick an assignment to adapt" : "How would you like to start?"}
        </h1>
        {showHistoryList && (
          <p className="eyebrow text-base text-muted-foreground font-medium opacity-70 border-b border-border/10 pb-6">
            {displayed.length} past assignments for {selectedCourse ?? "this course"} — we&apos;ll copy the structure and rubric so you can tweak.
          </p>
        )}
      </div>

      {!showHistoryList ? (
        <div className="grid gap-5 md:grid-cols-2">
          {/* Option 1 — Modify existing */}
          <Card
            className="group cursor-pointer hover:border-primary/40 transition-all border border-border/40 bg-card p-4 flex flex-col shadow-none"
            onClick={() => handleModeSelect("history")}
          >
            <CardHeader className="pb-2">
              <div className="mb-4">
                <div className="p-3 w-fit rounded-full bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <History className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Modify existing assignment</CardTitle>
              <CardDescription className="text-sm font-medium leading-relaxed mt-3 opacity-70">
                We&apos;ll show relevant assignments you can adapt — fastest way to get started.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Option 2 — Create new */}
          <Card
            className="group cursor-pointer hover:border-primary/40 transition-all border border-border/40 bg-card p-4 flex flex-col shadow-none"
            onClick={() => handleModeSelect("suggestions")}
          >
            <CardHeader className="pb-2">
              <div className="mb-4">
                <div className="p-3 w-fit rounded-full bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Create new assignment</CardTitle>
              <CardDescription className="text-sm font-medium leading-relaxed mt-3 opacity-70">
                We&apos;ll guide you step-by-step as you build — full control over every detail.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
          {/* Best Matches */}
          {bestMatches.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <h2 className="eyebrow text-primary/80">
                  Best matches · Top {bestMatches.length}
                </h2>
                <span className="eyebrow text-muted-foreground opacity-40">
                  ranked by CO alignment &amp; past performance
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {bestMatches.map(hist => (
                  <HistoryCard
                    key={hist.id}
                    hist={hist}
                    onDetails={() => setPreviewId(hist.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All past assignments */}
          {rest.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                <h2 className="eyebrow text-muted-foreground opacity-60">
                  {bestMatches.length > 0 ? "Other past assignments" : "All past assignments"}
                </h2>
              </div>
              <div className="flex flex-col divide-y divide-border/10 rounded-xl border border-border/30 overflow-hidden bg-card">
                {rest.map(hist => (
                  <HistoryCard
                    key={hist.id}
                    hist={hist}
                    onDetails={() => setPreviewId(hist.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Fallback */}
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border/40 bg-card px-6 py-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-tight">Can&apos;t find a good match?</p>
              <p className="text-xs text-muted-foreground opacity-60 font-medium">
                Skip the library and start a fresh assignment — we&apos;ll guide you step-by-step.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModeSelect("scratch")}
              className="eyebrow gap-2"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Create from scratch
            </Button>
          </div>
        </div>
      )}

      {/* Detail sheet */}
      <Sheet open={!!previewed} onOpenChange={(open) => { if (!open) setPreviewId(null) }}>
        <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-lg p-0 overflow-y-auto">
          {previewed && (
            <DetailSheetContent
              key={previewed.id}
              previewed={previewed}
              onUse={() => { handleHistorySelect(previewed.id); setPreviewId(null) }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetailSheetContent({
  previewed,
  onUse,
}: {
  previewed: HistoricalAssignment
  onUse: () => void
}) {
  const [expandInstructions, setExpandInstructions] = useState(false)
  const [expandTasks, setExpandTasks] = useState(false)
  const [expandDeliverables, setExpandDeliverables] = useState(false)

  const TASK_LIMIT = 3
  const DEL_LIMIT = 3

  const tasks = previewed.sampleQuestions ?? []
  const deliverables = previewed.sampleDeliverables ?? []
  const visibleTasks = expandTasks ? tasks : tasks.slice(0, TASK_LIMIT)
  const visibleDeliverables = expandDeliverables ? deliverables : deliverables.slice(0, DEL_LIMIT)

  const scoreColor =
    previewed.avgScore >= 85 ? "text-[color:var(--status-success)]"
    : previewed.avgScore >= 75 ? "text-[color:var(--status-warning)]"
    : "text-[color:var(--status-error)]"

  const perfLines: string[] =
    previewed.avgScore >= 85
      ? ["Students performed well overall", "Scoring was consistent across all criteria"]
      : previewed.avgScore >= 75
      ? ["Students performed well overall", "Some difficulty with advanced reasoning tasks"]
      : ["Students found this assignment challenging", "Results varied significantly across criteria"]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SheetHeader className="px-6 pt-6 pb-5 border-b border-border/10 shrink-0">
        <div className="pr-4">
          <SheetTitle className="text-xl font-semibold tracking-tight leading-snug">
            {previewed.title}
          </SheetTitle>
          <p className="eyebrow text-muted-foreground/40 mt-1.5">
            {previewed.course} · {previewed.semester} · {previewed.lastUsed}
          </p>
        </div>
      </SheetHeader>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* 1 — Why this fits — stands out as a card */}
        <div className="px-6 pt-5 pb-5">
          <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4 space-y-4">
            <p className="eyebrow flex items-center gap-1.5 text-primary/70">
              <Sparkles className="h-3 w-3" /> Why this fits
            </p>

            {/* Outcome alignment */}
            {previewed.coAlignment && previewed.coAlignment.length > 0 && (
              <div className="space-y-1.5">
                <p className="eyebrow text-muted-foreground/50">Outcome alignment</p>
                <div className="space-y-1">
                  {previewed.coAlignment.map(a => (
                    <div key={a.co} className="flex items-baseline gap-1 text-xs">
                      <span className={`font-bold shrink-0 ${strengthTextClass[a.strength]}`}>
                        {a.co} · {a.strength}
                      </span>
                      <span className="text-foreground/30 shrink-0">—</span>
                      <span className="text-foreground/55 font-medium leading-snug">
                        {CO_BRIEF[a.co] ?? CO_DEFINITIONS[a.co]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-primary/10" />

            {/* Student performance */}
            <div className="space-y-1">
              <p className="eyebrow text-muted-foreground/50">Student performance</p>
              <p className="text-xs font-semibold text-foreground/70">
                Average score: <span className={`font-bold ${scoreColor}`}>{previewed.avgScore}%</span>
              </p>
              <div className="space-y-0.5 pt-0.5">
                {perfLines.map((line, i) => (
                  <p key={i} className="text-xs font-medium text-foreground/50 flex items-center gap-1.5">
                    <span className={`h-1 w-1 rounded-full shrink-0 ${i === 0 ? "bg-foreground/30" : "bg-foreground/20"}`} />
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* 1-line summary */}
            {previewed.whyThisFits && (
              <p className="text-[11px] font-medium text-primary/50 leading-relaxed border-t border-primary/10 pt-3">
                {previewed.whyThisFits}
              </p>
            )}
          </div>
        </div>

        {/* Remaining sections — separated by borders */}
        <div className="divide-y divide-border/10 border-t border-border/10">

          {/* 2 — Instructions */}
          {previewed.instructionsPreview && (
            <div className="px-6 py-4 space-y-2">
              <p className="eyebrow flex items-center gap-1.5 text-muted-foreground/40">
                <FileText className="h-3 w-3" /> Instructions
              </p>
              <p className={`text-sm leading-relaxed text-foreground/70 font-medium ${expandInstructions ? "" : "line-clamp-3"}`}>
                {previewed.instructionsPreview}
              </p>
              <button
                onClick={() => setExpandInstructions(v => !v)}
                className="eyebrow text-primary/60 hover:text-primary transition-colors"
              >
                {expandInstructions ? "Show less" : "Show more"}
              </button>
            </div>
          )}

          {/* 3 — What to do (Tasks) */}
          {tasks.length > 0 && (
            <div className="px-6 py-4 space-y-3">
              <p className="eyebrow flex items-center gap-1.5 text-muted-foreground/40">
                <ListChecks className="h-3 w-3" /> What to do
              </p>
              <ol className="space-y-2.5">
                {visibleTasks.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/70 font-medium">
                    <span className="eyebrow text-muted-foreground/30 shrink-0 tabular-nums w-5">{i + 1}</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
              {tasks.length > TASK_LIMIT && (
                <button
                  onClick={() => setExpandTasks(v => !v)}
                  className="eyebrow text-primary/60 hover:text-primary transition-colors"
                >
                  {expandTasks ? "Show less" : `+${tasks.length - TASK_LIMIT} more task${tasks.length - TASK_LIMIT > 1 ? "s" : ""}`}
                </button>
              )}
            </div>
          )}

          {/* 4 — What to submit (Deliverables) */}
          {deliverables.length > 0 && (
            <div className="px-6 py-4 space-y-3">
              <p className="eyebrow flex items-center gap-1.5 text-muted-foreground/40">
                <BookOpen className="h-3 w-3" /> What to submit
              </p>
              <ul className="space-y-2">
                {visibleDeliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-foreground/70 leading-relaxed">
                    <span className="mt-2 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
              {deliverables.length > DEL_LIMIT && (
                <button
                  onClick={() => setExpandDeliverables(v => !v)}
                  className="eyebrow text-primary/60 hover:text-primary transition-colors"
                >
                  {expandDeliverables ? "Show less" : `+${deliverables.length - DEL_LIMIT} more`}
                </button>
              )}
            </div>
          )}

          {/* 5 — How it will be graded (Rubric) */}
          {previewed.rubricSummary && previewed.rubricSummary.length > 0 && (
            <div className="px-6 py-4 space-y-3">
              <p className="eyebrow flex items-center gap-1.5 text-muted-foreground/40">
                <Target className="h-3 w-3" /> How it will be graded
              </p>
              <ul className="space-y-1.5">
                {previewed.rubricSummary.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-semibold text-foreground/70">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--status-success)]/60 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>{/* end divide-y wrapper */}
      </div>{/* end scrollable body */}

      {/* Sticky footer */}
      <div className="shrink-0 border-t border-border/20 bg-background px-6 py-4 flex justify-end">
        <button
          onClick={onUse}
          className="group/btn inline-flex items-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm"
        >
          Use this assignment
          <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}

function HistoryCard({
  hist,
  onDetails,
}: {
  hist: HistoricalAssignment
  onDetails: () => void
}) {
  return (
    <div className="group flex items-center gap-6 px-5 py-4 rounded-xl border border-border/30 bg-card hover:border-primary/30 transition-colors shadow-none">
      {/* Left: all info */}
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-sm font-semibold tracking-tight text-foreground leading-snug line-clamp-1">
          {hist.title}
        </p>
        <p className="eyebrow text-muted-foreground/40">
          Average Student Performance: <span className="text-[color:var(--status-warning)] font-bold">{hist.avgScore}%</span>
        </p>
        {hist.coAlignment && hist.coAlignment.length > 0 && (
          <TooltipProvider delay={100}>
            <div className="flex gap-1.5 flex-wrap">
              {hist.coAlignment.map(a => (
                <Tooltip key={a.co}>
                  <TooltipTrigger className="cursor-help">
                    <Badge
                      variant="outline"
                      className={`eyebrow rounded-md ${strengthClasses[a.strength]}`}
                    >
                      {a.co} · {a.strength}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-foreground border-none p-2 rounded-lg max-w-[200px]">
                    <p className="text-xs font-bold text-primary-foreground leading-snug">{CO_DEFINITIONS[a.co] ?? a.co}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* Right: CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); onDetails() }}
        className="group/btn shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm"
      >
        Details
        <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}
