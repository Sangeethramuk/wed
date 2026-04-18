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
          <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full h-10 w-10 border border-border/20">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight secondary-text uppercase">Preparing your digital desk</h1>
            <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest leading-none">Confirm your strategy and publish the assignment.</p>
          </div>
        </div>

        <div className="grid gap-6">
          {isHistory ? (
            <Card className="border-2 border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/5">
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex items-center gap-3 text-emerald-600/60 transition-all">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[10px]">Verified Strategy</span>
                </div>
                <CardTitle className="mt-4 text-3xl font-black secondary-text tracking-tighter">Based on your past results</CardTitle>
                <CardDescription className="text-base font-semibold opacity-60 leading-relaxed mt-2">
                  AI has analyzed patterns from your previous semesters. 150+ sample responses are ready to guide the grading logic.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="p-5 rounded-xl bg-background/50 border border-emerald-500/10 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Institutional Alignment</span>
                  </div>
                  <span className="text-lg font-black text-emerald-600 tracking-tighter">98% Match</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-amber-500/20 bg-amber-500/[0.02] rounded-2xl overflow-hidden shadow-xl shadow-amber-500/5">
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex items-center gap-3 text-amber-600/60">
                  <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[10px]">New Environment</span>
                </div>
                <CardTitle className="mt-4 text-3xl font-black secondary-text tracking-tighter">Ready to start grading?</CardTitle>
                <CardDescription className="text-base font-semibold opacity-60 leading-relaxed mt-2">
                  You are deploying this assignment format for the first time. Choose how the AI should learn your standards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-8 pb-8">
                <div className="flex items-start gap-5 p-6 rounded-2xl bg-background/50 border border-amber-500/10 group hover:border-amber-500/40 transition-all cursor-pointer hover:bg-white shadow-none hover:shadow-lg hover:shadow-amber-500/5">
                  <div className="px-3 py-1 rounded-md text-[9px] font-black bg-amber-100 text-amber-700 mt-1 uppercase tracking-widest">Option 1</div>
                  <div className="space-y-1 flex-1">
                    <p className="text-lg font-black tracking-tight">Interactive Calibration</p>
                    <p className="text-xs font-semibold text-muted-foreground opacity-60 leading-relaxed">The AI will observe your grading of the first 5 student responses to align with your personal bias.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 p-6 rounded-2xl bg-background/30 border border-border/40 group hover:border-primary/40 transition-all cursor-pointer hover:bg-white shadow-none hover:shadow-lg hover:shadow-primary/5">
                  <div className="px-3 py-1 rounded-md text-[9px] font-black bg-muted text-muted-foreground mt-1 uppercase tracking-widest">Option 2</div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black tracking-tight">Expert Reference Sheet</p>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground opacity-60 leading-relaxed">Upload a master answer key for the AI to synchronize immediately.</p>
                    <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase text-primary tracking-widest mt-2 hover:no-underline group-hover:translate-x-1 transition-transform">Upload key →</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Tooltip>
              <TooltipTrigger className="border border-border/20 rounded-2xl overflow-hidden shadow-none bg-muted/[0.02] hover:bg-white transition-all hover:border-primary/20 cursor-help">
                <CardContent className="pt-6 pb-6 px-6 space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Assignment Scope</p>
                  <p className="text-sm font-black tracking-tight secondary-text">Multiple Files (Artifacts)</p>
                </CardContent>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-none p-2 shadow-none rounded-lg"><p className="text-[9px] font-bold text-white">Project-style submission with secondary documentation support</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="border border-border/20 rounded-2xl overflow-hidden shadow-none bg-muted/[0.02] hover:bg-white transition-all hover:border-primary/20 cursor-help">
                <CardContent className="pt-6 pb-6 px-6 space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Framework Mapping</p>
                  <p className="text-sm font-black tracking-tight secondary-text">3 Linked CO-POs</p>
                </CardContent>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-none p-2 shadow-none rounded-lg"><p className="text-[9px] font-bold text-white">Accreditation outcomes verified for this session</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="border border-border/20 rounded-2xl overflow-hidden shadow-none bg-muted/[0.02] hover:bg-white transition-all hover:border-primary/20 cursor-help">
                <CardContent className="pt-6 pb-6 px-6 space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Class Size</p>
                  <p className="text-sm font-black tracking-tight secondary-text">~45 Students</p>
                </CardContent>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-none p-2 shadow-none rounded-lg"><p className="text-[9px] font-bold text-white">Based on current course enrollment</p></TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-end pt-10 gap-4 border-t border-border/10">
          <Button variant="ghost" className="px-8 text-[11px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 h-14 rounded-xl transition-all" onClick={reset}>Save as draft</Button>
          <Button size="lg" className="h-14 px-12 text-lg font-black tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90 gap-4" onClick={nextStep}>
            <Send className="h-5 w-5" /> 
            Launch Session
          </Button>
        </div>
      </div>
  )
}
