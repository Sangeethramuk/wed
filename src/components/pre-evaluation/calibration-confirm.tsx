"use client"

import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, ArrowLeft, Send } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function CalibrationConfirm() {
  const { creationMode, prevStep, reset, nextStep } = usePreEvalStore()

  const isHistory = creationMode === "history"

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={prevStep}>
            <ArrowLeft />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight secondary-text">Preparing your digital desk</h1>
            <p className="eyebrow font-semibold text-muted-foreground/40 leading-none">Confirm your strategy and publish the assignment.</p>
          </div>
        </div>

        <div className="grid gap-6">
          {isHistory ? (
            <Card className="border-2 border-[color:var(--status-success)]/20 bg-[color:var(--status-success)]/[0.02] rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/5">
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex items-center gap-3 text-[color:var(--status-success)]/60 transition-all">
                  <div className="h-6 w-6 rounded-full bg-[color:var(--status-success)]/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="eyebrow">Verified Strategy</span>
                </div>
                <CardTitle className="mt-4 text-3xl font-semibold secondary-text tracking-tight">Based on your past results</CardTitle>
                <CardDescription className="text-base font-semibold opacity-60 leading-relaxed mt-2">
                  AI has analyzed patterns from your previous semesters. 150+ sample responses are ready to guide the grading logic.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="p-5 rounded-xl bg-background/50 border border-[color:var(--status-success)]/10 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[color:var(--status-success)] animate-pulse" />
                    <span className="eyebrow opacity-40 group-hover:opacity-100 transition-opacity">Institutional Alignment</span>
                  </div>
                  <span className="text-lg font-semibold text-[color:var(--status-success)] tracking-tight">98% Match</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-[color:var(--status-warning)]/20 bg-[color:var(--status-warning)]/[0.02] rounded-2xl overflow-hidden shadow-xl shadow-amber-500/5">
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex items-center gap-3 text-[color:var(--status-warning)]/60">
                  <div className="h-6 w-6 rounded-full bg-[color:var(--status-warning)]/10 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span className="eyebrow">New Environment</span>
                </div>
                <CardTitle className="mt-4 text-3xl font-semibold secondary-text tracking-tight">Ready to start grading?</CardTitle>
                <CardDescription className="text-base font-semibold opacity-60 leading-relaxed mt-2">
                  You are deploying this assignment format for the first time. Choose how the AI should learn your standards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-8 pb-8">
                <div className="flex items-start gap-5 p-6 rounded-2xl bg-background/50 border border-[color:var(--status-warning)]/10 group hover:border-[color:var(--status-warning)]/40 transition-all cursor-pointer hover:bg-background shadow-none hover:shadow-lg hover:shadow-amber-500/5">
                  <div className="eyebrow px-3 py-1 rounded-md bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] mt-1">Option 1</div>
                  <div className="space-y-1 flex-1">
                    <p className="text-lg font-semibold tracking-tight">Interactive Calibration</p>
                    <p className="text-xs font-semibold text-muted-foreground opacity-60 leading-relaxed">The AI will observe your grading of the first 5 student responses to align with your personal bias.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 p-6 rounded-2xl bg-background/30 border border-border/40 group hover:border-primary/40 transition-all cursor-pointer hover:bg-background shadow-none hover:shadow-lg hover:shadow-primary/5">
                  <div className="eyebrow px-3 py-1 rounded-md bg-muted text-muted-foreground mt-1">Option 2</div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold tracking-tight">Expert Reference Sheet</p>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground opacity-60 leading-relaxed">Upload a master answer key for the AI to synchronize immediately.</p>
                    <Button variant="link" size="sm" className="mt-2">Upload key →</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Tooltip>
              <TooltipTrigger className="border border-border/20 rounded-2xl overflow-hidden shadow-none bg-muted/[0.02] hover:bg-background transition-all hover:border-primary/20 cursor-help">
                <CardContent className="pt-6 pb-6 px-6 space-y-2">
                  <p className="eyebrow text-muted-foreground opacity-30">Assignment Scope</p>
                  <p className="text-sm font-semibold tracking-tight secondary-text">Multiple Files (Artifacts)</p>
                </CardContent>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground border-none p-2 shadow-none rounded-lg"><p className="text-xs font-bold text-primary-foreground">Project-style submission with secondary documentation support</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="border border-border/20 rounded-2xl overflow-hidden shadow-none bg-muted/[0.02] hover:bg-background transition-all hover:border-primary/20 cursor-help">
                <CardContent className="pt-6 pb-6 px-6 space-y-2">
                  <p className="eyebrow text-muted-foreground opacity-30">Framework Mapping</p>
                  <p className="text-sm font-semibold tracking-tight secondary-text">3 Linked CO-POs</p>
                </CardContent>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground border-none p-2 shadow-none rounded-lg"><p className="text-xs font-bold text-primary-foreground">Accreditation outcomes verified for this session</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="border border-border/20 rounded-2xl overflow-hidden shadow-none bg-muted/[0.02] hover:bg-background transition-all hover:border-primary/20 cursor-help">
                <CardContent className="pt-6 pb-6 px-6 space-y-2">
                  <p className="eyebrow text-muted-foreground opacity-30">Class Size</p>
                  <p className="text-sm font-semibold tracking-tight secondary-text">~45 Students</p>
                </CardContent>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground border-none p-2 shadow-none rounded-lg"><p className="text-xs font-bold text-primary-foreground">Based on current course enrollment</p></TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-end pt-10 gap-4 border-t border-border/10">
          <Button variant="outline" onClick={reset}>Save as draft</Button>
          <Button size="lg" onClick={nextStep}>
            <Send />
            Launch session
          </Button>
        </div>
      </div>
  )
}
