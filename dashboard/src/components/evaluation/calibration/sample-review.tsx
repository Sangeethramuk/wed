"use client"

import { useGradingStore, CalibrationPaper } from "@/lib/store/grading-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Wifi, AlertTriangle, ArrowRight, Info } from "lucide-react"

const REASON_CONFIG = {
  high_confidence: {
    label: "High Confidence",
    description: "All 5 checkpoints pass. Selected to validate AI baseline on clean submissions.",
    icon: ShieldCheck,
    color: "bg-green-50 dark:bg-green-950/20 border-green-200/50 dark:border-green-900/40 text-green-700 dark:text-green-400",
    dot: "bg-green-500",
    badge: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/40",
  },
  ocr_issue: {
    label: "OCR Issue",
    description: "OCR extraction confidence is low. Selected to test AI performance on poor-quality scans.",
    icon: Wifi,
    color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/40",
  },
  complex_case: {
    label: "Complex Case",
    description: "Multiple checkpoint failures. Selected to test AI on submissions with integrity anomalies.",
    icon: AlertTriangle,
    color: "bg-red-50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/40 text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/40",
  },
}

const CHECKPOINT_LABELS: Record<string, string> = {
  grading: "Grading",
  ocr: "OCR",
  cheating: "Integrity",
  history: "History",
  timeline: "Timeline",
}

function PaperCard({ paper }: { paper: CalibrationPaper }) {
  const config = REASON_CONFIG[paper.selectionReason]
  const Icon = config.icon
  const passCount = Object.values(paper.checkpointProfile).filter(Boolean).length

  return (
    <Card className={`p-5 border ${config.color} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-sm font-black uppercase tracking-wider text-foreground">{paper.anonymizedLabel}</span>
        </div>
        <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-wider ${config.badge}`}>
          <Icon className="h-2.5 w-2.5 mr-1" />
          {config.label}
        </Badge>
      </div>

      <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic mb-4">"{config.description}"</p>

      <Separator className="mb-4 opacity-30" />

      <div className="space-y-1.5">
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
          Checkpoint Profile — {passCount}/5 Pass
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(paper.checkpointProfile).map(([key, passed]) => (
            <Tooltip key={key}>
              <TooltipTrigger>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider cursor-help border ${
                  passed
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/30"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/30"
                }`}>
                  {CHECKPOINT_LABELS[key] ?? key}: {passed ? "✓" : "✗"}
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-[10px] font-bold uppercase tracking-widest">
                {CHECKPOINT_LABELS[key]} checkpoint: {passed ? "PASSED" : "FAILED"}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function SampleReview({ assignmentId }: { assignmentId: string }) {
  const { calibration, setCalibrationPhase, setActiveCalibrationPaper } = useGradingStore()
  const cal = calibration[assignmentId]
  if (!cal) return null

  const papers = cal.papers
  const highConf = papers.filter(p => p.selectionReason === "high_confidence")
  const ocrIssue = papers.filter(p => p.selectionReason === "ocr_issue")
  const complex = papers.filter(p => p.selectionReason === "complex_case")

  const handleBegin = () => {
    setCalibrationPhase(assignmentId, "blind_grading")
    setActiveCalibrationPaper(assignmentId, papers[0]?.paperId ?? null)
  }

  return (
    <TooltipProvider delay={100}>
      <div className="max-w-5xl mx-auto px-4 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {/* Intro */}
        <div className="text-center space-y-3 pt-4">
          <Badge variant="secondary" className="rounded-full px-4 py-1 text-[10px] font-black tracking-[0.2em] uppercase bg-primary/10 text-primary border-primary/20">
            Calibration Protocol Active
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">Sample Paper Selection</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            The system has selected <strong>{papers.length} papers</strong> from this assignment for calibration —
            approximately 10% of the cohort, chosen to represent the full spectrum of submission quality.
          </p>
        </div>

        {/* Info strip */}
        <div className="flex flex-wrap justify-center items-center gap-6 py-4 px-8 rounded-full border border-border/40 bg-muted/10 text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
          <span className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-green-500/60" /> {highConf.length} High Confidence</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-2"><Wifi className="h-3 w-3 text-amber-500/60" /> {ocrIssue.length} OCR Issue</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-red-500/60" /> {complex.length} Complex Case</span>
        </div>

        {/* Paper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map(paper => (
            <PaperCard key={paper.paperId} paper={paper} />
          ))}
        </div>

        {/* What happens next */}
        <Card className="p-6 border-primary/20 bg-primary/5 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-primary/80">What happens next</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You will grade each paper one at a time using the rubric criteria — <strong>without seeing the AI's scores</strong>.
              After all {papers.length} papers are graded, the system will compare your scores against the AI baseline
              and compute a calibration delta. If the delta is within 15%, you proceed directly to grading.
            </p>
          </div>
        </Card>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <Button
            onClick={handleBegin}
            className="rounded-full h-14 px-12 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            Begin Blind Grading — {papers.length} Papers
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/30">
            Student identities are anonymized throughout calibration
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}
