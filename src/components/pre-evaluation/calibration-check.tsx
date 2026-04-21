"use client"

import { useState, useEffect, useMemo } from "react"
import { usePreEvalStore, MOCK_HISTORY } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Check,
  Zap,
  Info,
} from "lucide-react"

type CalibrationState = "pre_calibrated" | "review_recommended" | "calibration_needed" | "limited"
type Phase = "status" | "form" | "summary"
type MultipleApproaches = "yes" | "no" | "partial"

interface GuidanceForm {
  strongAnswer: string
  excellentVsAverage: string
  penalties: string
  multipleApproaches: MultipleApproaches | null
}

const STATUS_CONFIG: Record<
  CalibrationState,
  { badge: string; badgeClass: string; dotClass: string; title: string; explanation: string; details: string[] }
> = {
  pre_calibrated: {
    badge: "Pre-calibrated",
    badgeClass: "border-emerald-500/20 text-emerald-700/80 bg-emerald-500/[0.05]",
    dotClass: "bg-emerald-500",
    title: "This assignment is already calibrated",
    explanation:
      "This version closely matches a previously evaluated assignment, so existing calibration can be reused.",
    details: [
      "Assignment structure matches a prior evaluated version",
      "Rubric criteria and weights are substantially unchanged",
      "Sufficient prior reviewed evaluations exist",
    ],
  },
  review_recommended: {
    badge: "Review recommended",
    badgeClass: "border-amber-500/20 text-amber-700/80 bg-amber-500/[0.05]",
    dotClass: "bg-amber-500",
    title: "Calibration review recommended",
    explanation: "We found changes that may slightly affect how responses are judged.",
    details: [
      "1 rubric criterion was reworded",
      "Task instructions changed slightly",
      "Prior calibration is still partially usable",
    ],
  },
  calibration_needed: {
    badge: "Calibration needed",
    badgeClass: "border-primary/20 text-primary/80 bg-primary/[0.05]",
    dotClass: "bg-primary",
    title: "Calibration needed",
    explanation:
      "Before this assignment is published, the system needs guidance on how it should be evaluated.",
    details: [
      "No prior evaluation history found for this assignment",
      "New rubric criteria have been created from scratch",
      "Assignment type and scope are new to the system",
    ],
  },
  limited: {
    badge: "Limited calibration",
    badgeClass: "border-orange-500/20 text-orange-700/80 bg-orange-500/[0.05]",
    dotClass: "bg-orange-500",
    title: "Calibration is incomplete",
    explanation:
      "This assignment can proceed, but evaluation reliability may be lower until more guidance is provided.",
    details: [
      "Guidance was provided but lacks sufficient detail",
      "Ambiguity detected in one or more criteria",
      "System confidence is too low to distinguish grade levels reliably",
    ],
  },
}

const MOCK_CHANGES = [
  {
    item: '"Code quality" criterion wording updated',
    impact: "May affect how strong and average responses are distinguished",
  },
  {
    item: "Submission instructions revised",
    impact: "Students may interpret task scope differently",
  },
]

const PAST_LEARNINGS = [
  "Students answered correctly in multiple valid formats",
  "Criterion 2 caused more instructor overrides than other criteria",
  "Clearer expectations around evidence improved scoring consistency",
]

const NUDGES: Partial<Record<CalibrationState, string[]>> = {
  calibration_needed: [
    "For assignments like this, instructors usually clarify whether evidence quality or writing clarity matters more.",
    "Open-ended assignments are easier to evaluate when you define what distinguishes average from excellent.",
    "Consider specifying whether alternate valid interpretations should receive full credit.",
  ],
  review_recommended: [
    "You updated criterion wording, but no new guidance exists for it yet.",
    "Your instructions now emphasize analysis more strongly than the previously calibrated version.",
    "This rubric now appears slightly more open-ended than the prior calibrated version.",
  ],
  pre_calibrated: [
    "In past evaluations, students used multiple valid answer structures — consider allowing flexibility explicitly.",
    "Most instructor overrides from last term happened under 'Critical Analysis.' Review before reuse.",
  ],
  limited: [
    '"Quality" may be too broad — define whether this means structure, depth, accuracy, or originality.',
    "Your guidance explains what a good answer includes, but not what should be penalized.",
    "You have not yet described how acceptable and excellent responses differ.",
  ],
}

const LIMITED_ISSUES = [
  "Guidance does not explain how excellent answers differ from average ones",
  "Penalty conditions are unclear or missing",
  'The rubric mentions "clarity," but the guidance does not define what it means here',
  "The assignment appears open-ended but the guidance implies exact answer matching",
]

const AMBIGUITY_FLAGS = [
  '"Code quality" may combine multiple dimensions such as readability and efficiency.',
  '"Strong argument" is not yet clearly defined in the context of this assignment.',
]

export function CalibrationCheck() {
  const {
    prevStep,
    nextStep,
    creationMode,
    selectedHistoryId,
    rubric,
    setCalibrationConfirmed,
    setCalibrationStatus,
  } = usePreEvalStore()

  const initialCalState = useMemo((): CalibrationState => {
    if (creationMode === "history" && selectedHistoryId) {
      const h = MOCK_HISTORY.find((x) => x.id === selectedHistoryId)
      return h && h.avgScore >= 80 ? "pre_calibrated" : "review_recommended"
    }
    return "calibration_needed"
  }, [creationMode, selectedHistoryId])

  const [calState, setCalState] = useState<CalibrationState>(initialCalState)
  const [phase, setPhase] = useState<Phase>("status")
  const [expandDetails, setExpandDetails] = useState(false)
  const [cameFromForm, setCameFromForm] = useState(false)
  const [guidance, setGuidance] = useState<GuidanceForm>({
    strongAnswer: "",
    excellentVsAverage: "",
    penalties: "",
    multipleApproaches: null,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!isAnalyzing) return
    let p = 0
    const t = setInterval(() => {
      p += 25
      setAnalyzeProgress(p)
      if (p >= 100) {
        clearInterval(t)
        setIsAnalyzing(false)
        const isGood =
          guidance.strongAnswer.length >= 40 &&
          guidance.excellentVsAverage.length >= 40 &&
          guidance.penalties.length >= 30 &&
          guidance.multipleApproaches !== null
        if (isGood) {
          setCameFromForm(true)
          setPhase("summary")
        } else {
          setCalState("limited")
          setPhase("status")
        }
      }
    }, 350)
    return () => clearInterval(t)
  }, [isAnalyzing, guidance])

  const handleGoToForm = () => {
    setCameFromForm(false)
    setPhase("form")
  }

  const handleProceedWithExisting = () => {
    setCameFromForm(false)
    setPhase("summary")
  }

  const handleGenerateSummary = () => {
    setIsAnalyzing(true)
    setAnalyzeProgress(0)
  }

  const handleConfirm = () => {
    setConfirming(true)
    setCalibrationConfirmed(true)
    setCalibrationStatus(calState === "limited" ? "needs_attention" : "good")
    setTimeout(() => nextStep(), 1200)
  }

  const isFormValid =
    guidance.strongAnswer.trim().length > 0 &&
    guidance.excellentVsAverage.trim().length > 0 &&
    guidance.penalties.trim().length > 0 &&
    guidance.multipleApproaches !== null

  const config = STATUS_CONFIG[calState]
  const nudges = NUDGES[calState] ?? []

  const sourcesConfig =
    calState === "pre_calibrated"
      ? [
          { label: "Previous reviewed evaluations", active: true },
          { label: "Current rubric structure", active: true },
          { label: "Similar past assignments", active: true },
        ]
      : calState === "review_recommended"
      ? [
          { label: "Previous reviewed evaluations", active: true },
          { label: "Current rubric structure", active: true },
          { label: "Instructor answer guidance", active: false },
          { label: "Similar past assignments", active: true },
        ]
      : calState === "limited"
      ? [
          { label: "Current rubric structure", active: true },
          { label: "Partial instructor guidance", active: true },
        ]
      : [
          { label: "Current rubric structure", active: true },
          { label: "Similar past assignments from your history", active: true },
        ]

  const confidence =
    calState === "pre_calibrated"
      ? { label: "High confidence", colorClass: "text-emerald-600" }
      : calState === "review_recommended"
      ? { label: "Moderate confidence", colorClass: "text-amber-600" }
      : calState === "limited"
      ? { label: "Low confidence", colorClass: "text-orange-600" }
      : { label: "Moderate confidence", colorClass: "text-primary" }

  return (
    <div className="max-w-3xl mx-auto space-y-0 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20 pt-6 px-4">
      {/* Sticky Header */}
      <div className="flex items-center gap-4 border-b border-border/10 pb-6 sticky top-0 z-50 bg-background/80 backdrop-blur-md -mx-4 px-4 pt-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 border border-border/20 shrink-0 shadow-none"
          onClick={phase === "status" ? prevStep : () => setPhase(cameFromForm ? "form" : "status")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight secondary-text">Calibration</h1>
          <p className="eyebrow font-semibold text-muted-foreground/40">
            Evaluation readiness check
          </p>
        </div>
      </div>

      {/* ── PHASE: STATUS ── */}
      {phase === "status" && (
        <div className="space-y-5">
          {/* Block 1: Status header */}
          <Card className="border border-border/20 bg-card/20 rounded-xl shadow-none overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className={`eyebrow rounded-full px-2.5 py-1 ${config.badgeClass}`}
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${config.dotClass}`} />
                  {config.badge}
                </Badge>
                <div>
                  <h2 className="text-lg font-black tracking-tight">{config.title}</h2>
                  <p className="text-sm text-muted-foreground/70 font-medium mt-1">{config.explanation}</p>
                </div>
              </div>
              <button
                onClick={() => setExpandDetails(!expandDetails)}
                className="eyebrow flex items-center gap-1.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
              >
                {expandDetails ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Why am I seeing this?
              </button>
              {expandDetails && (
                <div className="space-y-1.5 pt-1">
                  {config.details.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium"
                    >
                      <div className="h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Block 2: What we're using */}
          <Card className="border border-border/20 bg-card/20 rounded-xl shadow-none">
            <CardContent className="p-6 space-y-3">
              <p className="eyebrow text-muted-foreground/40">
                What calibration is based on
              </p>
              <div className="flex flex-wrap gap-2">
                {sourcesConfig.map((src) => (
                  <div
                    key={src.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
                      src.active
                        ? "border-primary/20 bg-primary/5 text-primary/70"
                        : "border-border/20 bg-muted/10 text-muted-foreground/30 line-through"
                    }`}
                  >
                    {src.active ? (
                      <Check className="h-2.5 w-2.5 shrink-0" />
                    ) : (
                      <span className="opacity-30">—</span>
                    )}
                    {src.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Block 3: Conditional content */}
          {calState === "pre_calibrated" && (
            <Card className="border border-emerald-500/10 bg-emerald-500/[0.03] rounded-xl shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600/60" />
                  <p className="eyebrow text-emerald-700/60">
                    What we learned previously
                  </p>
                </div>
                <div className="space-y-2">
                  {PAST_LEARNINGS.map((l, i) => (
                    <p
                      key={i}
                      className="text-sm text-muted-foreground/70 font-medium flex items-start gap-2"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500/50 shrink-0" />
                      {l}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {calState === "review_recommended" && (
            <div className="space-y-4">
              <Card className="border border-amber-500/10 bg-amber-500/[0.03] rounded-xl shadow-none">
                <CardContent className="p-6 space-y-4">
                  <p className="eyebrow text-amber-600/60">
                    Detected changes
                  </p>
                  <div className="space-y-3">
                    {MOCK_CHANGES.map((c, i) => (
                      <div key={i} className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground/80">{c.item}</p>
                        <p className="text-xs text-muted-foreground/50 font-medium">{c.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-border/20 bg-card/20 rounded-xl shadow-none">
                <CardContent className="p-6 space-y-1">
                  <p className="eyebrow text-muted-foreground/40">
                    Recommended action
                  </p>
                  <p className="text-sm text-muted-foreground/70 font-medium">
                    Review or update answer guidance for the changed areas.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {calState === "calibration_needed" && (
            <Card className="border border-primary/10 bg-primary/[0.02] rounded-xl shadow-none">
              <CardContent className="p-6 space-y-1">
                <p className="eyebrow text-primary/50">
                  Next step
                </p>
                <p className="text-sm text-muted-foreground/70 font-medium">
                  Provide answer guidance so the system understands how this assignment should be
                  evaluated. This takes about 2–3 minutes.
                </p>
              </CardContent>
            </Card>
          )}

          {calState === "limited" && (
            <Card className="border border-orange-500/10 bg-orange-500/[0.03] rounded-xl shadow-none">
              <CardContent className="p-6 space-y-3">
                <p className="eyebrow text-orange-600/60">
                  Issues detected
                </p>
                <div className="space-y-2">
                  {LIMITED_ISSUES.map((issue, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground/70 font-medium"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-orange-500/50 mt-0.5 shrink-0" />
                      {issue}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Block 4: Nudges */}
          {nudges.length > 0 && (
            <Card className="border border-border/10 bg-card/10 rounded-xl shadow-none">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary/40" />
                  <p className="eyebrow text-muted-foreground/40">
                    {calState === "pre_calibrated"
                      ? "Learnings from past evaluations"
                      : "Guidance suggestions"}
                  </p>
                </div>
                <div className="space-y-2">
                  {nudges.map((n, i) => (
                    <p
                      key={i}
                      className="text-xs text-muted-foreground/60 font-medium leading-relaxed flex items-start gap-2"
                    >
                      <span className="mt-1 h-1 w-1 rounded-full bg-primary/30 shrink-0" />
                      {n}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA row */}
          <div className="flex items-center justify-between pt-4">
            {calState === "pre_calibrated" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="eyebrow text-muted-foreground/40 hover:text-muted-foreground shadow-none"
                  onClick={handleGoToForm}
                >
                  Add optional guidance
                </Button>
                <Button
                  size="lg"
                  className="h-12 px-10 font-black tracking-tight rounded-xl shadow-none bg-primary hover:bg-primary/90"
                  onClick={handleConfirm}
                  disabled={confirming}
                >
                  {confirming ? "Confirming..." : "Continue to Preview →"}
                </Button>
              </>
            )}
            {calState === "review_recommended" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="eyebrow text-muted-foreground/40 hover:text-muted-foreground shadow-none"
                  onClick={handleProceedWithExisting}
                >
                  Proceed with existing calibration
                </Button>
                <Button
                  size="lg"
                  className="h-12 px-10 font-black tracking-tight rounded-xl shadow-none bg-primary hover:bg-primary/90"
                  onClick={handleGoToForm}
                >
                  Review and update →
                </Button>
              </>
            )}
            {calState === "calibration_needed" && (
              <Button
                size="lg"
                className="h-12 px-10 font-black tracking-tight rounded-xl shadow-none ml-auto bg-primary hover:bg-primary/90"
                onClick={handleGoToForm}
              >
                Start calibration →
              </Button>
            )}
            {calState === "limited" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="eyebrow text-muted-foreground/40 hover:text-muted-foreground shadow-none"
                  onClick={handleConfirm}
                  disabled={confirming}
                >
                  {confirming ? "Confirming..." : "Proceed with caution"}
                </Button>
                <Button
                  size="lg"
                  className="h-12 px-10 font-black tracking-tight rounded-xl shadow-none bg-primary hover:bg-primary/90"
                  onClick={handleGoToForm}
                >
                  Improve guidance →
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PHASE: FORM ── */}
      {phase === "form" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight">Answer guidance</h2>
            <p className="text-sm text-muted-foreground/60 font-medium">
              Describe how this assignment should be evaluated. Your guidance helps the system
              support consistent grading.
            </p>
          </div>

          {/* Field 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="eyebrow text-foreground/70">
                What should a strong answer include?
              </p>
              <span className="eyebrow text-primary/60 border border-primary/20 px-1.5 py-0.5 rounded-full">
                Required
              </span>
            </div>
            <p className="text-xs text-muted-foreground/50 font-medium">
              Describe the key qualities, concepts, evidence, structure, or reasoning a strong
              submission should demonstrate.
            </p>
            <Textarea
              placeholder="e.g. Strong answers should include a clear problem statement, well-structured code with comments, proper use of design patterns, and evidence of testing..."
              className="min-h-[100px] text-sm border-border/30 bg-card/30 focus-visible:ring-primary/20 resize-none rounded-lg shadow-none placeholder:text-muted-foreground/20"
              value={guidance.strongAnswer}
              onChange={(e) => setGuidance((g) => ({ ...g, strongAnswer: e.target.value }))}
            />
          </div>

          <Separator className="opacity-10" />

          {/* Field 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="eyebrow text-foreground/70">
                What separates average from excellent?
              </p>
              <span className="eyebrow text-primary/60 border border-primary/20 px-1.5 py-0.5 rounded-full">
                Required
              </span>
            </div>
            <p className="text-xs text-muted-foreground/50 font-medium">
              What makes a response merely acceptable versus truly strong?
            </p>
            <Textarea
              placeholder="e.g. Average answers meet the requirements. Excellent answers go beyond by demonstrating original thinking, edge case handling, and clear justification of design choices..."
              className="min-h-[100px] text-sm border-border/30 bg-card/30 focus-visible:ring-primary/20 resize-none rounded-lg shadow-none placeholder:text-muted-foreground/20"
              value={guidance.excellentVsAverage}
              onChange={(e) => setGuidance((g) => ({ ...g, excellentVsAverage: e.target.value }))}
            />
          </div>

          <Separator className="opacity-10" />

          {/* Field 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="eyebrow text-foreground/70">
                What should be penalized?
              </p>
              <span className="eyebrow text-primary/60 border border-primary/20 px-1.5 py-0.5 rounded-full">
                Required
              </span>
            </div>
            <p className="text-xs text-muted-foreground/50 font-medium">
              List common mistakes, missing elements, or weak patterns that should reduce the score.
            </p>
            <Textarea
              placeholder="e.g. Missing documentation, hardcoded values, no error handling, incomplete test coverage, copy-pasted code without understanding..."
              className="min-h-[100px] text-sm border-border/30 bg-card/30 focus-visible:ring-primary/20 resize-none rounded-lg shadow-none placeholder:text-muted-foreground/20"
              value={guidance.penalties}
              onChange={(e) => setGuidance((g) => ({ ...g, penalties: e.target.value }))}
            />
          </div>

          <Separator className="opacity-10" />

          {/* Field 4: Multiple approaches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="eyebrow text-foreground/70">
                Are multiple valid answer approaches acceptable?
              </p>
              <span className="eyebrow text-primary/60 border border-primary/20 px-1.5 py-0.5 rounded-full">
                Required
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { value: "yes" as const, label: "Yes", sub: "Multiple valid approaches" },
                  { value: "no" as const, label: "No", sub: "Fixed expected elements" },
                  { value: "partial" as const, label: "Partially", sub: "Some flexibility allowed" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGuidance((g) => ({ ...g, multipleApproaches: opt.value }))}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                    guidance.multipleApproaches === opt.value
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/20 bg-card/20 hover:border-border/40"
                  }`}
                >
                  <span className="text-sm font-black tracking-tight">{opt.label}</span>
                  <span className="text-xs font-medium text-muted-foreground/50 mt-0.5">
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis progress */}
          {isAnalyzing && (
            <Card className="border border-primary/10 bg-primary/[0.03] rounded-xl shadow-none">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary/50 animate-pulse" />
                  <p className="eyebrow text-primary/60">
                    Analysing alignment...
                  </p>
                </div>
                <Progress value={analyzeProgress} className="h-1 bg-primary/10 shadow-none" />
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="eyebrow text-muted-foreground/40 shadow-none"
              onClick={() => setPhase("status")}
            >
              ← Back
            </Button>
            <Button
              size="lg"
              className="h-12 px-10 font-black tracking-tight rounded-xl shadow-none bg-primary hover:bg-primary/90 disabled:opacity-40"
              onClick={handleGenerateSummary}
              disabled={!isFormValid || isAnalyzing}
            >
              Generate calibration summary →
            </Button>
          </div>
        </div>
      )}

      {/* ── PHASE: SUMMARY ── */}
      {phase === "summary" && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight">Calibration summary</h2>
            <p className="text-sm text-muted-foreground/60 font-medium">
              Here is how the system will interpret this assignment during evaluation.
            </p>
          </div>

          {/* System understanding */}
          <Card className="border border-border/20 bg-card/20 rounded-xl shadow-none">
            <CardContent className="p-6 space-y-5">
              <p className="eyebrow text-muted-foreground/40">
                How this assignment will be interpreted
              </p>
              <div className="space-y-4">
                {[
                  {
                    label: "Strong responses should include",
                    text: "Clear problem framing, well-structured implementation, appropriate use of patterns, and evidence of systematic testing.",
                  },
                  {
                    label: "Excellent responses go beyond average by",
                    text: "Demonstrating original thinking, handling edge cases explicitly, and justifying design decisions with reasoning.",
                  },
                  {
                    label: "Scores should be reduced when",
                    text: "Documentation is missing, errors are unhandled, test coverage is incomplete, or logic is copied without understanding.",
                  },
                  {
                    label: "Multiple valid response structures",
                    text:
                      guidance.multipleApproaches === "yes"
                        ? "Are allowed — multiple valid approaches will be accepted."
                        : guidance.multipleApproaches === "no"
                        ? "Are not allowed — core elements are fixed."
                        : "Partially allowed — some flexibility with fixed core elements.",
                  },
                ].map((item, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="eyebrow text-muted-foreground/40">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-foreground/70">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rubric alignment */}
          <Card className="border border-border/20 bg-card/20 rounded-xl shadow-none">
            <CardContent className="p-6 space-y-3">
              <p className="eyebrow text-muted-foreground/40">
                Rubric alignment
              </p>
              <div className="space-y-0">
                {(rubric.length > 0 ? rubric : [{ id: "1", name: "Technical Accuracy" }, { id: "2", name: "Code Organization" }]).map(
                  (crit, i) => {
                    const status = i === 1 ? "partially_ambiguous" : "aligned"
                    return (
                      <div
                        key={crit.id}
                        className="flex items-center justify-between py-2.5 border-b border-border/5 last:border-0"
                      >
                        <span className="text-sm font-bold text-foreground/70">{crit.name}</span>
                        <Badge
                          variant="outline"
                          className={`eyebrow rounded-full ${
                            status === "aligned"
                              ? "border-emerald-500/20 text-emerald-600/70 bg-emerald-500/5"
                              : "border-amber-500/20 text-amber-600/70 bg-amber-500/5"
                          }`}
                        >
                          {status === "aligned" ? "Aligned" : "Partially ambiguous"}
                        </Badge>
                      </div>
                    )
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ambiguity flags */}
          <Card className="border border-amber-500/10 bg-amber-500/[0.02] rounded-xl shadow-none">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500/50" />
                <p className="eyebrow text-amber-600/50">
                  Ambiguity flags
                </p>
              </div>
              <div className="space-y-2">
                {AMBIGUITY_FLAGS.map((f, i) => (
                  <p
                    key={i}
                    className="text-xs text-muted-foreground/60 font-medium flex items-start gap-2"
                  >
                    <span className="mt-1 h-1 w-1 rounded-full bg-amber-400/40 shrink-0" />
                    {f}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Confidence indicator */}
          <div className="flex items-center gap-2.5 px-1">
            <Info className="h-3.5 w-3.5 text-muted-foreground/30" />
            <p className="eyebrow text-muted-foreground/40">
              Confidence:{" "}
              <span className={confidence.colorClass}>{confidence.label}</span>
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="eyebrow text-muted-foreground/40 shadow-none"
              onClick={() => (cameFromForm ? setPhase("form") : setPhase("status"))}
            >
              ← {cameFromForm ? "Edit guidance" : "Back"}
            </Button>
            <Button
              size="lg"
              className="h-12 px-10 font-black tracking-tight rounded-xl shadow-none bg-primary hover:bg-primary/90 disabled:opacity-50"
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? "Confirming..." : "Confirm calibration →"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
