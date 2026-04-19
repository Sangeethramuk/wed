"use client"

import { useState } from "react"
import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  TriangleAlert,
  Info,
} from "lucide-react"

type CalibrationMode = "guided" | "lightweight"

const INSIGHTS = [
  { label: "Weightage is balanced", status: "pass" },
  { label: "Criteria overlap detected", status: "warn" },
  { label: "Deliverables not clearly mapped to rubric", status: "warn" },
]

export function CalibrationCheck() {
  const {
    creationMode,
    nextStep,
    prevStep,
    setCalibrationConfirmed,
    setCalibrationStatus,
    addAudit,
  } = usePreEvalStore()

  const mode: CalibrationMode = creationMode === "scratch" ? "guided" : "lightweight"

  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)
  const [status, setStatus] = useState<"good" | "needs_attention" | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const canConfirm = check1 && check2

  const handleConfirm = () => {
    const result: "good" | "needs_attention" = canConfirm ? "good" : "needs_attention"
    setStatus(result)
    setCalibrationConfirmed(canConfirm)
    setCalibrationStatus(result)
    addAudit({
      action: "Calibration Check",
      details: `Completed with status: ${result === "good" ? "Good to proceed" : "Needs attention"}`,
      type: "system",
    })
    setAdvancing(true)
    setTimeout(() => nextStep(), 1400)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* A. Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevStep}
          className="rounded-full h-10 w-10 border border-border/20 mt-1 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight secondary-text uppercase">
            Calibration Check
          </h1>
          <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-widest leading-none">
            Before publishing, review how your assignment will be evaluated.
          </p>
        </div>
      </div>

      {/* B. System Insights */}
      <Card className="rounded-2xl border border-border/20 shadow-none overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-primary opacity-60" />
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
              Evaluation Insights
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-2">
          {INSIGHTS.map((insight) => (
            <div
              key={insight.label}
              className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-muted/30 border border-border/10"
            >
              {insight.status === "pass" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              ) : (
                <TriangleAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              )}
              <span className="text-xs font-semibold text-foreground/70">{insight.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* C. Quick Review (Contextual) */}
      <Card className="rounded-2xl border border-border/20 shadow-none overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-3">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
            Quick Review
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          {mode === "guided" ? (
            /* Case 1: New Assignment */
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground/60 leading-relaxed">
                No past reference available. Define what a good response should include{" "}
                <span className="opacity-50">(optional):</span>
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest rounded-xl border-border/30 h-9"
                >
                  + Add guideline
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest rounded-xl opacity-40 hover:opacity-100 h-9"
                >
                  Skip
                </Button>
              </div>
            </div>
          ) : (
            /* Case 2: Rubric Modified */
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground/60 leading-relaxed">
                Your rubric has been modified. Quick check: Do the criteria clearly
                differentiate performance levels?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest rounded-xl border-border/30 h-9"
                >
                  Review criteria
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest rounded-xl opacity-40 hover:opacity-100 h-9"
                >
                  Looks good
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* D. Optional Assist Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
          Optional
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] font-black tracking-wide rounded-xl border border-border/20 h-9 gap-1.5 text-primary hover:text-primary opacity-70 hover:opacity-100"
        >
          <Sparkles className="h-3 w-3" />
          Improve rubric clarity
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] font-black tracking-wide rounded-xl border border-border/20 h-9 gap-1.5 text-primary hover:text-primary opacity-70 hover:opacity-100"
        >
          <Sparkles className="h-3 w-3" />
          Suggest missing criteria
        </Button>
      </div>

      <Separator className="opacity-10" />

      {/* E. Confirmation */}
      <div className="space-y-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
          Before continuing
        </p>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={check1}
              onCheckedChange={(v) => setCheck1(!!v)}
              className="mt-0.5 rounded-md"
            />
            <span className="text-sm font-semibold text-foreground/70 leading-relaxed group-hover:text-foreground/90 transition-colors">
              The rubric clearly defines performance levels
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={check2}
              onCheckedChange={(v) => setCheck2(!!v)}
              className="mt-0.5 rounded-md"
            />
            <span className="text-sm font-semibold text-foreground/70 leading-relaxed group-hover:text-foreground/90 transition-colors">
              The evaluation aligns with assignment tasks
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between pt-4">
          {/* F. Calibration Status */}
          {status && (
            <div className="flex items-center gap-2">
              {status === "good" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600/70">
                    Calibration Status: Good to proceed
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-600/70">
                    Calibration Status: Needs attention
                  </span>
                </>
              )}
            </div>
          )}
          {!status && <div />}

          <Button
            size="lg"
            disabled={advancing}
            onClick={handleConfirm}
            className="h-12 px-10 text-sm font-black tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90 gap-3 disabled:opacity-50"
          >
            {advancing ? "Continuing…" : "Confirm & Continue"}
            {!advancing && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
