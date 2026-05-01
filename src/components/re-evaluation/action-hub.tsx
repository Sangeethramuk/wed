"use client"

import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  MessageSquareIcon, 
  BookOpenIcon, 
  CheckCircle2Icon, 
  ChevronRightIcon,
  InfoIcon,
  ZapIcon,
  EditIcon,
  CheckIcon,
  Sparkles,
  Lightbulb,
  RotateCcw,
  X
} from "lucide-react"
import { type StudentRecord, type AIReval, type Briefing } from '@/lib/data/re-evaluation-data'

interface ReEvalActionHubProps {
  student: StudentRecord
  aiReval: AIReval
  briefing: Briefing
  onUphold: (reason: string) => void
  onAdjust: (score: number, reason: string, category: string) => void
  onCancel: () => void
}

export function ReEvalActionHub({ 
  student, 
  aiReval, 
  briefing,
  onUphold,
  onAdjust,
  onCancel
}: ReEvalActionHubProps) {
  const [activeTab, setActiveTab] = useState<string>("dispute")
  const [currentCrit, setCurrentCrit] = useState<string>("c1")
  const [isSummaryView, setIsSummaryView] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [decision, setDecision] = useState<'uphold' | 'adjust' | null>(null)
  const [proposedScore, setProposedScore] = useState<number | null>(null)
  const [reason, setReason] = useState("")
  const [reasonCategory, setReasonCategory] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)

  const CRITERIA = [
    { id: 'c1', label: 'Problem Analysis' },
    { id: 'c2', label: 'Solution Design' },
    { id: 'c3', label: 'Implementation' },
    { id: 'c4', label: 'Edge Case Handling' }
  ]

  const isLastCrit = currentCrit === 'c4'
  const currentCritLabel = CRITERIA.find(c => c.id === currentCrit)?.label || student.crit

  const handleNext = () => {
    if (isLastCrit) {
      setIsSummaryView(true)
    } else {
      const idx = CRITERIA.findIndex(c => c.id === currentCrit)
      if (idx < CRITERIA.length - 1) setCurrentCrit(CRITERIA[idx + 1].id)
    }
  }

  const handlePrev = () => {
    if (isSummaryView) {
      setIsSummaryView(false)
    } else {
      const idx = CRITERIA.findIndex(c => c.id === currentCrit)
      if (idx > 0) setCurrentCrit(CRITERIA[idx - 1].id)
    }
  }

  const REASON_MIN = decision === 'adjust' ? 50 : 30
  const isSubmitEnabled = 
    decision !== null && 
    (decision === 'uphold' || (proposedScore !== null && reasonCategory !== null)) &&
    reason.length >= REASON_MIN

  const handleAction = () => {
    setIsSubmitted(true)
    // Simulate real action after a small delay if needed, 
    // or just show the success state immediately for the demo
  }

  if (isSubmitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
          <div className="size-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckIcon className="size-8 text-white stroke-[3]" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight mb-2">Submission Successful</h2>
        <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mb-8">
          The re-evaluation for <span className="text-foreground font-bold">{student.name}</span> has been successfully routed to the <span className="text-foreground font-bold">Exam Department</span>.
        </p>

        <Card className="w-full max-w-sm border-emerald-500/20 bg-emerald-50/10 mb-8 overflow-hidden">
          <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/10 flex items-center justify-between">
            <span className="text-[10px] eyebrow text-emerald-700 font-bold uppercase tracking-widest">Final Decision Receipt</span>
            <span className="text-[10px] font-bold text-emerald-600">ID: RE-2024-001</span>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Revised Total Score</span>
              <span className="text-xl font-bold text-foreground">76/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Adjustment</span>
              <span className="text-sm font-bold text-emerald-600">+1.0 Points</span>
            </div>
            <div className="h-px bg-emerald-500/10" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Routing</span>
              <span className="text-xs font-bold text-foreground uppercase tracking-tight">Exam Department</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 w-full max-w-sm">
          <div className="p-4 rounded-xl border border-border/60 bg-muted/5 italic text-[11px] text-muted-foreground/80 leading-relaxed">
            "Thank you for your dedication to academic excellence. Your meticulous review ensures that every student receives the fair assessment they deserve."
          </div>
          
          <Button 
            className="w-full h-12 text-sm font-bold tracking-widest uppercase"
            onClick={onCancel}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border overflow-hidden">
      {/* Anchor Header: Replicated from Grading Desk Rubric Panel */}
      <header className="p-4 border-b border-border bg-background flex flex-col gap-4 z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Intelligence Layer</h3>
            <span className="text-[9px] eyebrow bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">Blind Mode Active</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
             <div className="size-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-bold text-primary uppercase tracking-tight">Active Analysis</span>
          </div>
        </div>
      </header>

      {/* KPI Row: Masked for Bias Mitigation */}
      <div className="flex border-b border-border bg-muted/5 flex-shrink-0">
        <KPIBlock label="Original Score" className="flex-1 border-r border-border/60">
          <div className="flex items-center gap-2">
            <div className={cn(
              "text-sm font-bold transition-all duration-500",
              showOriginal ? "text-foreground opacity-100 blur-0" : "text-muted-foreground/20 blur-[3px] select-none"
            )}>
              {student.origScore}<span className="text-muted-foreground/30 ml-0.5">/ {student.maxScore}</span>
            </div>
            {!showOriginal && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-5 text-[9px] hover:bg-primary/10 hover:text-primary rounded"
                onClick={() => setShowOriginal(true)}
              >
                <InfoIcon className="size-3" />
              </Button>
            )}
          </div>
        </KPIBlock>
        <KPIBlock label="AI Re-eval" className="flex-1 border-r border-border/60">
          <div className="text-sm font-bold text-primary">
            {aiReval.score}<span className="text-muted-foreground/30 ml-0.5">/ {student.maxScore}</span>
          </div>
        </KPIBlock>
        <KPIBlock label="Confidence" className="flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <div className={cn("size-1.5 rounded-full", student.confLabel === 'Strong' ? 'bg-emerald-500' : 'bg-amber-500')} />
            {student.confScore}
          </div>
        </KPIBlock>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-muted/20">
          <TabsList className="grid grid-cols-2 w-full bg-background border border-border">
            <TabsTrigger value="dispute" className="gap-2">
              <MessageSquareIcon className="size-3.5" />
              <span>Student Dispute</span>
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="gap-2">
              <CheckCircle2Icon className="size-3.5" />
              <span>Review & Decision</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 pb-20 space-y-8">
            
            <TabsContent value="dispute" className="m-0 space-y-6">
              <section className="space-y-3">
                <div className="eyebrow text-muted-foreground/40">Student Perspective</div>
                <div className="rounded-xl bg-primary/[0.03] border border-primary/10 p-5 relative">
                  <div className="eyebrow absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    Disputed Reasoning
                  </div>
                  <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">
                    "{student.sv}"
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                    <CheckCircle2Icon className="size-3.5" />
                    {student.verdict}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="eyebrow text-muted-foreground/40">AI Case Briefing</div>
                <div className="space-y-3">
                  {briefing.aiSummaryParagraphs.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-foreground/80">
                      {p}
                    </p>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {briefing.flags.map((flag, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border text-xs font-medium",
                      flag.type === 'red' ? "bg-red-50 border-red-100 text-red-700" :
                      flag.type === 'amber' ? "bg-amber-50 border-amber-100 text-amber-700" :
                      "bg-blue-50 border-blue-100 text-blue-700"
                    )}>
                      <InfoIcon className="size-3.5 shrink-0" />
                      {flag.text}
                    </div>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="evaluation" className="m-0 space-y-8">
              {!isSummaryView ? (
                <>
                  {/* Criterion Navigation Dots */}
                  <div className="flex items-center justify-center gap-8 py-2">
                    {CRITERIA.map((c) => (
                      <button 
                        key={c.id} 
                        onClick={() => { setCurrentCrit(c.id); setIsSummaryView(false); }}
                        className="flex flex-col items-center gap-1.5 group outline-none"
                      >
                        <div className={cn(
                          "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                          c.id === currentCrit ? "border-primary bg-primary/10" : "border-border bg-background group-hover:border-primary/50"
                        )}>
                          {c.id === currentCrit && <div className="size-2 rounded-full bg-primary" />}
                        </div>
                        <span className={cn("text-[10px] font-bold uppercase", c.id === currentCrit ? "text-foreground" : "text-muted-foreground/30")}>
                          {c.id}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                    <div className="p-4 space-y-5">
                      {/* Title row + badge */}
                      <div className="relative">
                        <div className="absolute -top-4 -right-4 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-bl-lg rounded-tr-xl shadow-sm">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L1 9h8L5 1z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="0.8" strokeLinejoin="round"/><path d="M5 4.5v2M5 7.5v.5" stroke="white" strokeWidth="0.9" strokeLinecap="round"/></svg>
                          Review Required
                        </div>
                        <div className="flex items-start justify-between gap-2 pr-2">
                          <h3 className="text-sm font-bold text-foreground leading-tight">{currentCritLabel}</h3>
                        </div>
                      </div>

                      {/* Score + selector (Active for decision) */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="eyebrow text-muted-foreground/60">Final Score</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-2xl font-semibold text-foreground tabular-nums">
                              {(proposedScore ?? student.origScore).toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground/60">/10</span>
                          </div>
                          <span className="text-xs text-muted-foreground/50 ml-auto">Adjust:</span>
                        </div>

                        <div className="flex gap-1 items-center">
                          {[10, 8, 6, 4, 2].map(points => {
                            const selected = (proposedScore ?? student.origScore) === points
                            return (
                              <button
                                key={points}
                                onClick={() => {
                                  setShowOriginal(true)
                                  if (points === student.origScore) {
                                    setDecision('uphold')
                                    setProposedScore(null)
                                  } else {
                                    setDecision('adjust')
                                    setProposedScore(points)
                                  }
                                }}
                                className={cn(
                                  "flex-1 text-xs font-semibold py-1.5 rounded-md border transition-all",
                                  selected
                                    ? 'bg-foreground text-background border-foreground'
                                    : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
                                )}
                              >
                                {points}
                              </button>
                            )
                          })}
                          <button className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground/50 hover:border-foreground/40 transition-all">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4h8M2 8h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      </div>

                      {/* Decision Triage */}
                      <div className="space-y-3 pt-2 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <span className="eyebrow text-muted-foreground/50 text-[10px] uppercase tracking-widest">Resolution Path</span>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => { setDecision('uphold'); setProposedScore(null); }}
                              className={cn("h-7 px-3 text-[10px] font-bold uppercase", decision === 'uphold' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "text-muted-foreground")}
                            >
                              Uphold
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => { setDecision('adjust'); if(!proposedScore) setProposedScore(student.origScore - 1); }}
                              className={cn("h-7 px-3 text-[10px] font-bold uppercase", decision === 'adjust' ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground")}
                            >
                              Adjust
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Reasoning & Evidence */}
                      <div className="space-y-4 pt-4 border-t border-border/40">
                        <div className="space-y-2">
                          <span className="eyebrow text-muted-foreground/50 block text-[10px] uppercase tracking-wider">Intelligence Context</span>
                          <div className="flex items-start gap-2 text-xs text-foreground/75">
                            <span className="text-emerald-500 font-bold shrink-0">✓</span>
                            <span className="leading-relaxed">Problem scope is clearly defined with boundaries</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-foreground/75">
                            <span className="text-red-400 font-bold shrink-0">✗</span>
                            <span className="leading-relaxed">Outcome metrics are vague and unmeasureable</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <div className="group flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border bg-muted/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="eyebrow text-muted-foreground text-[10px]">E1 Linked</span>
                          </div>
                        </div>
                      </div>

                      {/* Rationale Input (Integrated) */}
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <span className="eyebrow text-muted-foreground/50 text-[10px] uppercase tracking-widest">Formal Rationale</span>
                          <span className={cn("text-[10px] font-bold tabular-nums", reason.length >= REASON_MIN ? "text-emerald-600" : "text-muted-foreground/40")}>
                            {reason.length}/500
                          </span>
                        </div>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Explain your decision to the HOD and student..."
                          className="w-full h-24 bg-muted/20 border border-border/60 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feedback Preview (Integrated at bottom) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="eyebrow text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Student Feedback Preview</span>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm border-l-4 border-l-primary/50">
                      <span className="eyebrow text-amber-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        {decision === 'uphold' ? 'Meets Expectations with Issues' : 'Score Adjusted • Needs Clarity'}
                      </span>
                      <p className="text-xs text-foreground leading-[1.8] font-medium italic">
                        {reason || "Balanced work on Problem Analysis. While you've successfully addressed core requirements, there are gaps in the evidence provided..."}
                      </p>
                    </div>
                  </div>

                  {/* Primary CTA: Next/Finalize */}
                  <div className="pt-6 border-t border-border/40">
                    <Button 
                      onClick={handleNext}
                      className="w-full h-12 text-sm font-bold tracking-widest uppercase bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      {isLastCrit ? 'Review & Finalize' : 'Next Criterion'}
                      <ChevronRightIcon className="ml-2 size-4" />
                    </Button>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="eyebrow text-muted-foreground/40 text-[10px] uppercase tracking-widest">Progress</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-foreground">{CRITERIA.findIndex(c => c.id === currentCrit) + 1}</span>
                          <span className="text-xs text-muted-foreground/60">/ {CRITERIA.length}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handlePrev}
                        disabled={currentCrit === 'c1'}
                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        Previous
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight">Final Re-evaluation Summary</h2>
                    <p className="text-sm text-muted-foreground">Review your changes before submitting to the department.</p>
                  </div>

                  <Card className="border-border/60 bg-muted/5 shadow-none overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 border-b border-border bg-background/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Score Summary</span>
                          <span className="text-xs font-bold text-emerald-600">+1.0 Adjustment</span>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-foreground">Original Total</span>
                               <span className="text-xs text-muted-foreground">Human Verified</span>
                            </div>
                            <span className="text-lg font-bold text-muted-foreground">75/100</span>
                         </div>
                         <div className="h-px bg-border/40" />
                         <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-primary">Revised Total</span>
                               <span className="text-xs text-primary/60">AI + New Instructor Verified</span>
                            </div>
                            <span className="text-2xl font-bold text-primary">76/100</span>
                         </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Global Conclusion</span>
                      <span className="text-[10px] font-bold tabular-nums text-muted-foreground/40">{reason.length}/1000</span>
                    </div>
                    <textarea
                      placeholder="Write a final closing summary for the HOD and student..."
                      className="w-full h-40 bg-muted/10 border border-border/60 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                    />
                  </div>

                  <div className="pt-6 space-y-3">
                    <Button 
                      className="w-full h-14 text-sm font-bold tracking-widest uppercase bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex flex-col items-center justify-center gap-1"
                      onClick={handleAction}
                    >
                      <span>Route to Exam Department</span>
                      <span className="text-[9px] font-normal lowercase tracking-normal text-white/60">Final submission for record update</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full h-12 text-xs font-bold tracking-widest uppercase border-border/60"
                      onClick={() => setIsSummaryView(false)}
                    >
                      Back to Criteria
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Redundant decision tab content removed as it is now integrated above */}

          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}

function KPIBlock({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 p-4", className)}>
      <span className="eyebrow text-muted-foreground/30 text-[10px] uppercase tracking-[0.1em]">{label}</span>
      {children}
    </div>
  )
}

function DecisionOption({ active, variant, label, desc, onClick, children }: { active: boolean; variant: 'uphold' | 'adjust'; label: string; desc: string; onClick: () => void; children: React.ReactNode }) {
  const isUphold = variant === 'uphold'
  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 transition-all cursor-pointer overflow-hidden",
        active 
          ? isUphold ? "border-emerald-500 bg-emerald-50/30" : "border-primary bg-primary/5" 
          : "border-border bg-background hover:bg-muted/5"
      )}
    >
      <div className={cn(
        "px-4 py-3 flex items-center justify-between border-b",
        active ? isUphold ? "bg-emerald-500 border-emerald-600" : "bg-primary border-primary" : "border-transparent"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "size-4 rounded-full border-2 flex items-center justify-center transition-transform",
            active ? "border-white scale-110" : "border-border"
          )}>
            {active && <div className="size-2 rounded-full bg-background" />}
          </div>
          <div className="flex flex-col">
            <span className={cn("text-[10px] eyebrow uppercase tracking-widest", active ? "text-white" : "text-muted-foreground")}>{label}</span>
            <span className={cn("text-xs font-bold", active ? "text-white/80" : "text-foreground")}>{desc}</span>
          </div>
        </div>
        {active && <CheckIcon className="size-4 text-white" />}
      </div>
      {active && (
        <div className="p-4 bg-background animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}
