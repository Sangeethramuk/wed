"use client"

import { useState, use, useEffect, useMemo, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useGradingStore } from "@/lib/store/grading-store"
import { useEvaluationOverviewStore } from "@/lib/store/evaluation-overview-store"
import { generateManuscript, generateArtifacts } from "@/lib/manuscript-generator"
import ManuscriptRenderer, { CRITERION_COLORS } from "@/components/evaluation/manuscript-renderer"
import ArtifactSidebar from "@/components/evaluation/artifact-sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import {
  CriterionStatusTag,
  DemoControlPanel,
  ESCALATION_DISMISS_THRESHOLD,
  FloatingNudgeStack,
  type SessionTelemetry,
  deriveNudges,
  deriveTag,
  emptySessionTelemetry,
  telemetryKey,
} from "@/components/evaluation/progressive-nudges"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Info,
  XCircle,
  MoreVertical,
  History,
  EyeOff,
  Scale,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Edit2,
  X
} from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RevisionHistorySheet, RevisionEvent } from "@/components/evaluation/revision-history-sheet"
import { FeedbackSummaryModal } from "@/components/evaluation/feedback-summary-modal"
import { CriterionFeedbackCard } from "@/components/evaluation/feedback/criterion-feedback-card"
import { FeedbackGenerating } from "@/components/evaluation/feedback/feedback-generating"

import { generateCriterionFeedback } from "@/lib/feedback-generator"
import { useGradingStore as useFeedbackStore } from "@/lib/store/grading-store"

function GradingDeskContent({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentIdFromUrl = searchParams.get("studentId")
  const { calibration } = useGradingStore()
  const overviewAssignment = useEvaluationOverviewStore(s =>
    s.assignments.find(a => a.id === id)
  )
  const cal = calibration[id]
  const isCalibrated =
    cal?.phase === "complete" ||
    overviewAssignment?.calibrationState === "complete"

  useEffect(() => {
    if (cal !== undefined && !isCalibrated) {
      router.replace(`/dashboard/evaluation/${id}/calibrate`)
    }
  }, [cal, isCalibrated, id, router])

  if (cal !== undefined && !isCalibrated) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[color:var(--status-warning)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="eyebrow text-muted-foreground/40">Redirecting to calibration…</p>
        </div>
      </div>
    )
  }

  const {
    assignments,
    activeStudentId,
    setActiveStudent,
    triggerSpotCheck,
    progressiveNudges,
    incrementIgnoredNudge,
    markSpotCheckAutoFired,
    resetProgressiveNudges,
  } = useGradingStore()
  const assignment = assignments[id]
  
  // Resolve active student from multiple sources
  const [selectedSubmission, setSelectedSubmission] = useState(() => {
    // 1. Check URL param (from triage sidebar link)
    if (studentIdFromUrl) return studentIdFromUrl
    // 2. Check if we have an active assignment/student in store
    if (activeStudentId && assignment?.students.find(s => s.id === activeStudentId)) {
      return activeStudentId
    }
    // 3. Fallback to first student
    return assignment?.students[0]?.id || "STU-102"
  })

  // Sync with store
  useEffect(() => {
    if (selectedSubmission && selectedSubmission !== activeStudentId) {
      setActiveStudent(selectedSubmission)
    }
  }, [selectedSubmission, activeStudentId, setActiveStudent])
  const [isFixed, setIsFixed] = useState(false)
  const [activeTab, setActiveTab] = useState<"rubric" | "feedback" | "integrity">("rubric")
  // Manuscript view toggle — 'ocr' (default) renders the real content via
  // ManuscriptRenderer; 'scanned' shows a skeleton-based handwritten-paper
  // preview for the prototype (no real scan pipeline wired yet).
  const [manuscriptView, setManuscriptView] = useState<"scanned" | "ocr">("ocr")
  const [showInsights, setShowInsights] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [dismissedPoints, setDismissedPoints] = useState<string[]>([])
  const [gradedSubmissions, setGradedSubmissions] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null)
  const [mappedEvidence, setMappedEvidence] = useState<{ id: string, text: string, criterionId: string }[]>([])

  // Override draft state management
  interface OverrideDraft {
    criterionId: string
    proposedScore: number
    aiScore: number
    direction: 'increase' | 'decrease' | 'same'
    reasonCategory: string
    linkedEvidence: Array<{ id: string, text: string, page: number }>
    ocrFile?: { name: string, size: string }
    reasoning: string
    scoreReasoning: string
  }

  const [overrideDrafts, setOverrideDrafts] = useState<Record<string, OverrideDraft>>({})
  const [activeOverrideId, setActiveOverrideId] = useState<string | null>(null)
  const [textSelectionMode, setTextSelectionMode] = useState<{ active: boolean, criterionId: string | null }>({ active: false, criterionId: null })
  const [pendingTextSelection, setPendingTextSelection] = useState<{ text: string, page: number } | null>(null)
  const [expandedRubricId, setExpandedRubricId] = useState<string>("c1")
  const [overrideReasoning, setOverrideReasoning] = useState<Record<string, string>>({})
  const [generatingFeedbackFor, setGeneratingFeedbackFor] = useState<string | null>(null)
  const [recordingId, setRecordingId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const [revisionEvents, setRevisionEvents] = useState<RevisionEvent[]>([])
  const [revisionHistoryOpen, setRevisionHistoryOpen] = useState(false)
  
  // Feedback summary modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [overallFeedback, setOverallFeedback] = useState("")
  
  // AI Feedback flow state
  const {
    criterionFeedbacks,
    confirmCriterionScore: confirmFeedbackAction,
    updateCriterionFeedback: updateCriterionFeedbackAction,
    approveCriterionFeedback: approveCriterionFeedbackAction,
    regenerateCriterionFeedback: regenerateCriterionFeedbackAction,
  } = useFeedbackStore()

  // Keyed feedback for current student
  const studentCriterionFeedbacks = criterionFeedbacks[selectedSubmission] || {}

  const confirmFeedback = (cid: string, data: any) => confirmFeedbackAction(selectedSubmission, cid, data)
  const updateCriterionFeedback = (cid: string, text: string) => updateCriterionFeedbackAction(selectedSubmission, cid, text)
  const approveCriterionFeedback = (cid: string) => approveCriterionFeedbackAction(selectedSubmission, cid)
  const regenerateCriterionFeedback = (cid: string, nt: string, ntier: any, nlbl: string) => regenerateCriterionFeedbackAction(selectedSubmission, cid, nt, ntier, nlbl)

  const manuscript = useMemo(() => generateManuscript(selectedSubmission), [selectedSubmission])
  const artifacts = useMemo(() => generateArtifacts(selectedSubmission), [selectedSubmission])

  // Pre-seed one evidence excerpt per criterion from the manuscript's highlighted paragraphs
  useEffect(() => {
    const seeded: { id: string; text: string; criterionId: string }[] = []
    const seen = new Set<string>()
    for (const page of manuscript.pages) {
      for (const el of page.elements) {
        if (el.type === 'paragraph' && el.highlight && !seen.has(el.highlight.criterionId)) {
          seen.add(el.highlight.criterionId)
          const full = el.text
          // grab a ~80-char window from the middle to avoid sentence-start boilerplate
          const start = Math.max(0, Math.floor(full.length * 0.2))
          const raw = full.slice(start, start + 85)
          // trim to the nearest word boundary
          const trimmed = raw.slice(0, raw.lastIndexOf(' ') > 20 ? raw.lastIndexOf(' ') : raw.length)
          seeded.push({ id: `seed-${el.highlight.criterionId}`, text: trimmed, criterionId: el.highlight.criterionId })
        }
      }
    }
    setMappedEvidence(seeded)
  }, [selectedSubmission]) // eslint-disable-line react-hooks/exhaustive-deps
  // Mock data for 60 students - Indian names
  const firstNames = [
    "Arjun", "Priya", "Rahul", "Ananya", "Vikram", 
    "Neha", "Aditya", "Meera", "Rohan", "Kavita",
    "Krishna", "Divya", "Sanjay", "Pooja", "Rajesh",
    "Sunita", "Vivek", "Anjali", "Amit", "Deepa",
    "Suresh", "Lakshmi", "Nikhil", "Radha", "Manoj",
    "Geeta", "Prakash", "Sneha", "Ashok", "Nisha"
  ]
  const lastNames = [
    "Sharma", "Patel", "Gupta", "Singh", "Reddy",
    "Iyer", "Nair", "Desai", "Joshi", "Mehta",
    "Agarwal", "Malhotra", "Khanna", "Banerjee", "Chatterjee",
    "Menon", "Pillai", "Rao", "Verma", "Tiwari",
    "Kapoor", "Chopra", "Sethi", "Bhatia", "Grover",
    "Bajaj", "Chawla", "Dutta", "Ghosh", "Mukherjee"
  ]
  
  const allSubmissions = Array.from({ length: 60 }, (_, i) => {
    const id = `STU-${100 + i}`
    const name = `${firstNames[i % 30]} ${lastNames[(i + 7) % 30]}`
    
    // Five-Parameter Accountability Checkpoints
    const checkpoints = {
      grading: i % 10 !== 0,   // Fail 10%
      ocr: i % 15 !== 0,       // Fail 6.6%
      cheating: i % 20 !== 0,  // Fail 5%
      history: i % 8 !== 0,    // Fail 12.5%
      timeline: i % 12 !== 0,  // Fail 8.3%
    }

    const passedCount = Object.values(checkpoints).filter(Boolean).length
    
    let category: "critical" | "focus" | "verified" = "verified"
    let reason = "Verified Clear"
    let flags = 5 - passedCount

    if (passedCount <= 2) {
      category = "critical"
      reason = "Protocol Failure"
    } else if (passedCount <= 3) {
      category = "focus"
      reason = "Academic Anomaly"
    } else if (passedCount === 4) {
      category = "focus"
      reason = "Minor Variance"
    }

    const status = gradedSubmissions.includes(id) ? "graded" : (flags > 0 ? "flagged" : "ready")

    // Review-prompt banners derived from 3 accountability checkpoints:
    //   ocr      → info   (OCR quality is low)
    //   history  → warning (historical-grade deviation)
    //   cheating → danger (plagiarism / cheating)
    type ReviewFlag = { severity: 'info' | 'success' | 'warning' | 'danger'; message: string }
    const reviewFlags: ReviewFlag[] = []
    if (!checkpoints.ocr) {
      reviewFlags.push({
        severity: 'info',
        message: 'OCR quality is low on this submission — please review.',
      })
    }
    if (!checkpoints.history) {
      reviewFlags.push({
        severity: 'warning',
        message: `${name}'s submission is not in their usual pattern — please review carefully.`,
      })
    }
    if (!checkpoints.cheating) {
      reviewFlags.push({
        severity: 'danger',
        message: 'Possible cheating or plagiarism detected — please review.',
      })
    }

    return {
      id,
      name,
      code: `#${100 + i}`,
      status,
      flags,
      score: gradedSubmissions.includes(id) ? 85 + (i % 10) : 0,
      reason,
      category,
      checkpoints,
      reviewFlags,
    }
  })

  const currentStudent = allSubmissions.find(s => s.id === selectedSubmission)

  const LOW_CONFIDENCE_THRESHOLD = 0.7
  const rubricPoints = [
    { id: "c1", type: "c1", label: "Problem Understanding & Direction", maxPoints: 10, aiScore: 6, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the problem framing, user/task clarity, assumptions/constraints, outcomes/non-goals, and scoped use-case mapping is present, and 20% of the work has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", aiConfidence: 0.92, working: ["Problem scope is clearly defined with boundaries", "User tasks and goals are well articulated", "Assumptions and constraints explicitly stated"], gaps: ["Outcome metrics are vague and unmeasurable", "Use-case mapping is incomplete — 2 of 5 scenarios missing"], levels: [{val: 5, name: "Exceeds expectations", points: 10}, {val: 4, name: "Meets expectations", points: 8}, {val: 3, name: "Meets expectations with fewer issues", points: 6}, {val: 2, name: "Below Expectations", points: 4}, {val: 1, name: "Significant issues identified", points: 2}] },
    { id: "c2", type: "c2", label: "Iteration & Improvement", maxPoints: 10, aiScore: 6, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the iteration rationale, before/after evidence, and next-steps articulation is present, and 20% has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", aiConfidence: 0.55, working: ["Before/after comparison evidence is present", "Iteration rationale clearly stated for v1 → v2", "Next steps are articulated with justification"], gaps: ["v3 changes lack documented rationale", "No quantitative improvement metrics provided"], levels: [{val: 5, name: "Exceeds expectations", points: 10}, {val: 4, name: "Meets expectations", points: 8}, {val: 3, name: "Meets expectations with fewer issues", points: 6}, {val: 2, name: "Below Expectations", points: 4}, {val: 1, name: "Significant issues identified", points: 2}] },
    { id: "c3", type: "c3", label: "Documentation & Reproducibility", maxPoints: 12, aiScore: 7.2, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the setup/run steps, samples/expected outputs, troubleshooting, and limitations is present, and 20% has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", aiConfidence: 0.88, working: ["Setup and run steps are complete and correct", "Sample inputs and expected outputs provided", "Limitations section acknowledges key constraints"], gaps: ["Troubleshooting guide is missing for 3 common error states", "No environment version pinning (Python/Node versions unspecified)"], levels: [{val: 5, name: "Exceeds expectations", points: 12}, {val: 4, name: "Meets expectations", points: 9.6}, {val: 3, name: "Meets expectations with fewer issues", points: 7.2}, {val: 2, name: "Below Expectations", points: 4.8}, {val: 1, name: "Significant issues identified", points: 2.4}] },
    { id: "c4", type: "c4", label: "Technical Setup & Integration", maxPoints: 12, aiScore: 7.2, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the tool/API integration, config documentation, runnable end-to-end execution, basic error handling, and test path is present, and 20% has issues.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", aiConfidence: 0.60, working: ["Tool and API integration correctly implemented", "Config documented with environment variable descriptions", "End-to-end execution path is runnable"], gaps: ["Basic error handling missing for network timeout scenarios", "No test path or smoke test included"], levels: [{val: 5, name: "Exceeds expectations", points: 12}, {val: 4, name: "Meets expectations", points: 9.6}, {val: 3, name: "Meets expectations with fewer issues", points: 7.2}, {val: 2, name: "Below Expectations", points: 4.8}, {val: 1, name: "Significant issues identified", points: 2.4}] }
  ]

  const [criterionState, setCriterionState] = useState<Record<string, { score: number, isOverridden: boolean, feedback: string, confirmed: boolean, instructorReasoning?: string }>>({})

  // ---------- Progressive-assurance telemetry (Phase 1) ----------
  // Drives the Verified / Quick review / Not verified tags on criterion cards and
  // the 3 contextual nudges (incomplete scroll / fast confirm / agreement streak).
  // See src/components/evaluation/progressive-nudges.tsx for derivation.
  const [sessionTelemetry, setSessionTelemetry] = useState<SessionTelemetry>(emptySessionTelemetry)
  // Most-recent Confirm that could warrant Nudge B (kept separately from telemetry
  // so the nudge can auto-clear after a few seconds without losing the telemetry).
  const [lastConfirmed, setLastConfirmed] = useState<{ id: string; at: number } | null>(null)
  // Demo-panel force flags — OR'd with natural derivation so a presenter can trigger
  // any nudge without performing the behavior that normally produces it.
  const [demoForce, setDemoForce] = useState<{ A: boolean; B: boolean; C: boolean }>({ A: false, B: false, C: false })
  // Recurrence-aware dismissal state — a dismissal is "not now", not "never".
  // Each entry remembers the counter at dismiss time so the nudge reappears
  // when the instructor repeats the same behavior (another confirm, another
  // fast-confirm on a different criterion, another +6 agreement streak).
  const [nudgeDismissState, setNudgeDismissState] = useState<{
    A?: { confirmCountAt: number }
    B?: string
    C?: { streakAt: number }
  }>({})
  // Escalation counter lives in the grading store (session-global) so the
  // cohort-level Publish action on the submissions-list page can read it too.
  // Ticked by dismissNudgeA / dismissNudgeB / dismissNudgeC below.
  const { ignoredCount: ignoredNudgeCount } = progressiveNudges

  // Telemetry mutators — each corresponds to one observable instructor action.
  const markCriterionOpened = (criterionId: string) => {
    const key = telemetryKey(selectedSubmission, criterionId)
    setSessionTelemetry(prev => {
      if (prev.byCriterion[key]?.openedAt) return prev
      return {
        ...prev,
        byCriterion: {
          ...prev.byCriterion,
          [key]: {
            ...(prev.byCriterion[key] ?? { evidenceOpens: 0, wasOverridden: false, hasReasoning: false }),
            openedAt: Date.now(),
          },
        },
      }
    })
  }
  const markEvidenceOpened = (criterionId: string) => {
    const key = telemetryKey(selectedSubmission, criterionId)
    setSessionTelemetry(prev => ({
      ...prev,
      byCriterion: {
        ...prev.byCriterion,
        [key]: {
          ...(prev.byCriterion[key] ?? { evidenceOpens: 0, wasOverridden: false, hasReasoning: false }),
          evidenceOpens: (prev.byCriterion[key]?.evidenceOpens ?? 0) + 1,
        },
      },
    }))
  }
  const markCriterionConfirmed = (criterionId: string, opts: { overridden: boolean; reasoning?: string }) => {
    const key = telemetryKey(selectedSubmission, criterionId)
    const now = Date.now()
    setSessionTelemetry(prev => ({
      ...prev,
      byCriterion: {
        ...prev.byCriterion,
        [key]: {
          ...(prev.byCriterion[key] ?? { evidenceOpens: 0, wasOverridden: false, hasReasoning: false }),
          confirmedAt: now,
          wasOverridden: opts.overridden,
          hasReasoning: (prev.byCriterion[key]?.hasReasoning ?? false) || Boolean(opts.reasoning?.trim().length),
        },
      },
      consecutiveAgreements: opts.overridden ? 0 : prev.consecutiveAgreements + 1,
    }))
    setLastConfirmed({ id: criterionId, at: now })
    // If this criterion now has evidence or override, clear its Nudge-B dismiss
    // so a future fast-confirm on this same criterion can re-trigger.
    if (opts.overridden || opts.reasoning?.trim().length) {
      setNudgeDismissState(prev => (prev.B === criterionId ? { ...prev, B: undefined } : prev))
    }
  }
  const markScrollProgress = (pct: number) => {
    setSessionTelemetry(prev => {
      const current = prev.maxScrollByStudent[selectedSubmission] ?? 0
      if (pct <= current) return prev
      return {
        ...prev,
        maxScrollByStudent: { ...prev.maxScrollByStudent, [selectedSubmission]: pct },
      }
    })
  }
  const resetTelemetry = () => {
    setSessionTelemetry(emptySessionTelemetry())
    setLastConfirmed(null)
    setDemoForce({ A: false, B: false, C: false })
    setNudgeDismissState({})
    resetProgressiveNudges()
  }

  // Note: the useEffect that marks the active criterion as "opened" + the
  // derived nudge visibility live below the `activeRubricCriterionIdx`
  // declaration (search for PROGRESSIVE_NUDGE_DERIVATION).

  const calculateTotalScore = () => {
    return rubricPoints.reduce((total, point) => {
      const state = criterionState[point.id]
      if (state?.confirmed) {
        return total + (state.score || 0)
      }
      return total + (point.aiScore || 0)
    }, 0)
  }

  const totalMaxPoints = rubricPoints.reduce((sum, p) => sum + p.maxPoints, 0)
  const currentTotalScore = calculateTotalScore()  
  const handleScoreConfirm = (id: string, aiScore: number) => {
    setCriterionState(prev => ({ ...prev, [id]: { ...prev[id], score: aiScore, isOverridden: false, confirmed: true } }))
    markCriterionConfirmed(id, { overridden: false })
    addRevisionEvent({
      type: 'score_confirmed',
      criterionId: id,
      criterionLabel: rubricPoints.find(p => p.id === id)?.label || '',
      details: { newScore: aiScore }
    })
    const nextIndex = rubricPoints.findIndex(p => p.id === id) + 1
    if (nextIndex < rubricPoints.length) setActiveRubricCriterionIdx(nextIndex)
  }

  const handleOverrideScore = (id: string, newScore: number) => {
    setCriterionState(prev => ({ ...prev, [id]: { ...prev[id], score: newScore, isOverridden: true, confirmed: true } }))
    markCriterionConfirmed(id, { overridden: true, reasoning: criterionState[id]?.instructorReasoning })
  }
  
  const addRevisionEvent = (event: Omit<RevisionEvent, 'id' | 'timestamp' | 'actor'>) => {
    setRevisionEvents(prev => [...prev, {
      ...event,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      actor: 'instructor' as const
    }])
  }

  const handleScoreLevelClick = (criterionId: string, proposedScore: number, aiScore: number) => {
    if (proposedScore === aiScore) {
      handleScoreConfirm(criterionId, aiScore)
      setActiveOverrideId(null)
      return
    }
    const direction = proposedScore > aiScore ? 'increase' : 'decrease'
    setActiveOverrideId(criterionId as any)
    setOverrideDrafts(prev => ({
      ...prev,
      [criterionId as any]: {
        criterionId,
        proposedScore,
        aiScore,
        direction,
        reasonCategory: prev[criterionId]?.reasonCategory || '',
        linkedEvidence: prev[criterionId]?.linkedEvidence || [],
        reasoning: prev[criterionId]?.reasoning || '',
        scoreReasoning: prev[criterionId]?.scoreReasoning || ''
      }
    }))
  }

  const handleUpdateDraft = (criterionId: string, updates: Partial<OverrideDraft>) => {
    setOverrideDrafts(prev => {
      const existing = prev[criterionId]
      if (!existing) return prev
      return { ...prev, [criterionId]: { ...existing, ...updates } }
    })
  }

  const handleConfirmOverride = (criterionId: string) => {
    const draft = overrideDrafts[criterionId]
    if (!draft || (draft.reasonCategory === '' && draft.reasoning.trim().length === 0)) return
    setCriterionState(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score: draft.proposedScore, isOverridden: true, confirmed: true, instructorReasoning: draft.scoreReasoning }
    }))
    addRevisionEvent({
      type: 'override',
      criterionId,
      criterionLabel: rubricPoints.find(p => p.id === criterionId)?.label || '',
      details: {
        previousScore: draft.aiScore,
        newScore: draft.proposedScore,
        reasoning: draft.reasoning
      }
    })
    draft.linkedEvidence.forEach(ev => {
      addRevisionEvent({
        type: 'evidence_mapped',
        criterionId,
        criterionLabel: rubricPoints.find(p => p.id === criterionId)?.label || '',
        details: { evidenceText: ev.text }
      })
    })
    if (draft.ocrFile) {
      addRevisionEvent({
        type: 'override',
        criterionId,
        criterionLabel: rubricPoints.find(p => p.id === criterionId)?.label || '',
        details: {
          reasoning: `OCR correction uploaded: ${draft.ocrFile.name} (${draft.ocrFile.size})`
        }
      })
    }
    setActiveOverrideId(null)
    setTextSelectionMode({ active: false, criterionId: null })
    setOverrideDrafts(prev => {
      const next = { ...prev }
      delete next[criterionId as any]
      return next
    })
  }

  const handleCancelOverride = (criterionId: string) => {
    setActiveOverrideId(null)
    setTextSelectionMode({ active: false, criterionId: null })
  }

  const handleLinkOverrideEvidence = (text: string, page: number, criterionId: string) => {
    const draft = overrideDrafts[criterionId]
    if (!draft) return
    const newEvidence = { id: `ov-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text, page }
    handleUpdateDraft(criterionId, { linkedEvidence: [...draft.linkedEvidence, newEvidence] })
    setMappedEvidence(prev => [...prev, { id: newEvidence.id, text, criterionId }])
    setSelection(null)
  }

  const handleRemoveOverrideEvidence = (criterionId: string, evidenceId: string) => {
    const draft = overrideDrafts[criterionId]
    if (!draft) return
    handleUpdateDraft(criterionId, { linkedEvidence: draft.linkedEvidence.filter(e => e.id !== evidenceId) })
    setMappedEvidence(prev => prev.filter(e => e.id !== evidenceId))
  }

  const INCREASE_REASONS = [
    { value: 'additional_depth', label: 'Additional depth not captured by AI' },
    { value: 'missed_evidence', label: 'AI missed key insights' },
    { value: 'found_more_evidence', label: 'Adding more evidence from manuscript' },
    { value: 'better_quality', label: 'Quality exceeds rubric description' },
  ] as const

  const DECREASE_REASONS = [
    { value: 'misinterpreted', label: 'Evidence misinterpreted or out of context' },
    { value: 'incorrect_claim', label: 'Technical claim is incorrect' },
    { value: 'contradiction', label: 'Contradicts other parts of submission' },
    { value: 'ocr_issue', label: 'OCR / text extraction quality issues' },
    { value: 'superficial', label: 'Superficial treatment despite appearances' },
  ] as const
  
  const handleFeedbackChange = (id: string, text: string) => {
    setCriterionState(prev => ({ ...prev, [id]: { ...prev[id], feedback: text } }))
  }

  const handleConfirmAndGenerate = (pointId: string, pointLabel: string, score: number) => {
    setGeneratingFeedbackFor(pointId as any)
    const criterionKey = pointId
    setTimeout(() => {
      const fb = generateCriterionFeedback(pointLabel, Math.round(score / 2), [], '')
      confirmFeedback(criterionKey, {
        tier: fb.tier,
        tierLabel: fb.tierLabel,
        feedbackText: fb.feedbackText,
        thinkingPrompt: fb.thinkingPrompt,
      })
      setGeneratingFeedbackFor(null)
    }, 1800)
  }
  
  const handleDismiss = (id: string) => {
    setDismissedPoints(prev => [...prev, id])
  }

  // isSpotCheckActive + dismissSpotCheck come from grading store (triggered by header button)
  const [activeRubricCriterionIdx, setActiveRubricCriterionIdx] = useState(0)

  // PROGRESSIVE_NUDGE_DERIVATION — relocated here so `activeRubricCriterionIdx`
  // is in scope. The active criterion at mount / student-change is effectively
  // "opened" — wire that into telemetry so duration clocks start ticking.
  useEffect(() => {
    const activeId = rubricPoints[activeRubricCriterionIdx]?.id
    if (activeId) markCriterionOpened(activeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubmission, activeRubricCriterionIdx])

  // Level 3 failsafe is now gated by the Publish-grades action (see
  // `handlePublishGrades` below). The mid-session auto-trigger was removed —
  // the spot-check only fires when the instructor tries to finalize grades
  // with too many ignored nudges behind them.

  // Derived visibility — natural triggers + demo-force flags, filtered by
  // recurrence-aware dismissal. Dismissals auto-expire when the behavior
  // recurs (more confirms / different criterion / bigger streak).
  const naturalNudges = deriveNudges(sessionTelemetry, selectedSubmission, rubricPoints.map(p => p.id), lastConfirmed)
  const confirmedCount = rubricPoints.filter(
    (p) => sessionTelemetry.byCriterion[telemetryKey(selectedSubmission, p.id)]?.confirmedAt
  ).length
  const showNudgeA =
    (naturalNudges.A || demoForce.A) &&
    (!nudgeDismissState.A || confirmedCount > nudgeDismissState.A.confirmCountAt)
  const nudgeBCriterion = demoForce.B
    ? rubricPoints[activeRubricCriterionIdx]?.id ?? null
    : naturalNudges.B
  const showNudgeB = Boolean(nudgeBCriterion) && nudgeDismissState.B !== nudgeBCriterion
  const showNudgeC =
    (naturalNudges.C || demoForce.C) &&
    (!nudgeDismissState.C || sessionTelemetry.consecutiveAgreements >= nudgeDismissState.C.streakAt + 6)
  const nudgeBCriterionLabel = showNudgeB && nudgeBCriterion
    ? rubricPoints.find(p => p.id === nudgeBCriterion)?.label ?? nudgeBCriterion
    : null

  // Dismiss handlers — snapshot the current counter so the nudge re-appears
  // only when the instructor repeats the behavior. Each un-productive dismiss
  // (Skip/X, NOT Reopen evidence) ticks the store-level escalation counter.
  const dismissNudgeA = () => {
    setNudgeDismissState(prev => ({ ...prev, A: { confirmCountAt: confirmedCount } }))
    setDemoForce(f => ({ ...f, A: false }))
    incrementIgnoredNudge()
  }
  const dismissNudgeB = () => {
    setNudgeDismissState(prev => ({ ...prev, B: nudgeBCriterion ?? undefined }))
    setDemoForce(f => ({ ...f, B: false }))
    incrementIgnoredNudge()
  }
  const dismissNudgeC = () => {
    setNudgeDismissState(prev => ({ ...prev, C: { streakAt: sessionTelemetry.consecutiveAgreements } }))
    setDemoForce(f => ({ ...f, C: false }))
    incrementIgnoredNudge()
  }
  const reopenFromNudgeB = () => {
    const idx = rubricPoints.findIndex(p => p.id === nudgeBCriterion)
    if (idx >= 0) setActiveRubricCriterionIdx(idx)
    // Productive action — marks Nudge B resolved WITHOUT ticking the
    // escalation counter (the instructor did the right thing).
    setNudgeDismissState(prev => ({ ...prev, B: nudgeBCriterion ?? undefined }))
    setDemoForce(f => ({ ...f, B: false }))
  }
  const [rubricAccordionOpen, setRubricAccordionOpen] = useState<Record<string, boolean>>({})
  const [rubricReviewStripOpen, setRubricReviewStripOpen] = useState<Record<string, boolean>>({})
  const [scoreLevelExpanded, setScoreLevelExpanded] = useState<Record<string, boolean>>({})

  const handleConfirmNext = () => {
    const currentSub = allSubmissions.find(s => s.id === selectedSubmission)
    // Trigger spot check only for "Clear" papers and if not already active
    setGradedSubmissions(prev => [...prev, selectedSubmission])

    // Find next ungraded submission
    const currentIndex = allSubmissions.findIndex(s => s.id === selectedSubmission)
    const nextSub = allSubmissions.slice(currentIndex + 1).find(s => s.status !== "graded") || allSubmissions[0]

    setSelectedSubmission(nextSub.id)
    setIsFixed(false)
    setDismissedPoints([])
    setCurrentPage(1)
    setOverrideDrafts({})
    setActiveOverrideId(null)
    setTextSelectionMode({ active: false, criterionId: null })
  }

  const handleMapEvidence = (criterionId: string) => {
    if (selection) {
      setMappedEvidence(prev => [...prev, { id: Math.random().toString(), text: selection.text, criterionId }])
      setSelection(null)
    }
  }

  const handleToggleRecording = (criterionId: string) => {
    if (recordingId === criterionId) {
      // Stop recording
      recognitionRef.current?.stop()
      setRecordingId(null)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = "en-US"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript
      setCriterionState(prev => ({
        ...prev,
        [criterionId]: { ...prev[criterionId], feedback: (prev[criterionId]?.feedback ?? "") + (prev[criterionId]?.feedback ? " " : "") + transcript }
      }))
    }
    recognition.onend = () => setRecordingId(null)
    recognitionRef.current = recognition
    recognition.start()
    setRecordingId(criterionId)
  }
  
  const scrollToEvidence = (evidenceId: string) => {
    const el = document.getElementById(`evidence-${evidenceId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Add a quick visual pulse/blink
      el.classList.add('animate-pulse')
      setTimeout(() => el.classList.remove('animate-pulse'), 2000)
    }
    // Tick telemetry for the currently-active criterion so Nudge B / tag logic
    // knows the instructor actually opened evidence.
    const activeId = rubricPoints[activeRubricCriterionIdx]?.id
    if (activeId) markEvidenceOpened(activeId)
  }

  // Mock data for 4 pages
  const totalPages = 4
  const questionMap = [
    { id: "Q1", label: "Question 1: Architecture & Design", pages: [1] },
    { id: "Q2", label: "Question 2: Implementation", pages: [2] },
    { id: "Q3", label: "Question 3: Testing & Quality", pages: [3] },
    { id: "Q4", label: "Question 4: Deployment", pages: [4] },
  ]

  // Prototype placeholder for the "Scanned" tab — mimics a handwritten-paper
  // scan using DS Skeleton primitives. Shape matches ManuscriptPage (max-width,
  // shadow, border, inner padding) so flipping between tabs feels consistent.
  // Keeps the id="page-N" anchor so page-navigation chevrons still resolve.
  const ScannedPagePreview = ({ index }: { index: number }) => (
    <div
      id={`page-${index}`}
      className="bg-background shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-[#E6E1D6]/50 mx-auto transition-all duration-300 relative w-full max-w-4xl my-4"
    >
      <div className="p-16 lg:p-24 space-y-10">
        {/* Title row */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        {/* Paragraph group 1 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-10/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-9/12" />
        </div>

        {/* Figure / diagram placeholder */}
        <div className="flex justify-center py-4">
          <Skeleton className="aspect-[4/3] w-1/2" />
        </div>

        {/* Paragraph group 2 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-9/12" />
        </div>

        {/* Paragraph group 3 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-8/12" />
        </div>
      </div>
    </div>
  )

  const ManuscriptPage = ({ index, children }: { index: number, children: React.ReactNode }) => {
    const question = questionMap.find(q => q.pages.includes(index))
    
    return (
      <div 
        id={`page-${index}`}
        className={`bg-background shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-border mx-auto transition-all duration-300 relative group/page ${textSelectionMode.active ? 'cursor-crosshair' : 'cursor-text'}`}
        onMouseUp={(e) => {
          const sel = window.getSelection()
          if (sel && sel.toString().trim().length > 0) {
              const range = sel.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              const selectedText = sel.toString().trim()
              
              if (textSelectionMode.active && textSelectionMode.criterionId !== null) {
                // Auto-map if in selection mode
                const evidenceId = Math.random().toString(36).substring(2, 9)
                setMappedEvidence(prev => [...prev, { id: evidenceId, text: selectedText, criterionId: textSelectionMode.criterionId! }])
                
                // If there's an active override draft, add to it as well
                if (overrideDrafts[textSelectionMode.criterionId]) {
                  handleUpdateDraft(textSelectionMode.criterionId, { 
                    linkedEvidence: [...(overrideDrafts[textSelectionMode.criterionId].linkedEvidence || []), { id: evidenceId, text: selectedText, page: index }] 
                  })
                }

                addRevisionEvent({
                  type: 'evidence_mapped',
                  criterionId: textSelectionMode.criterionId,
                  criterionLabel: rubricPoints.find(p => p.id === textSelectionMode.criterionId)?.label || '',
                  details: { evidenceText: selectedText }
                })
                setTextSelectionMode({ active: false, criterionId: null })
                setSelection(null)
                // Clear the browser selection
                sel.removeAllRanges()
              } else {
                setSelection({
                  text: selectedText,
                  x: rect.left + rect.width / 2,
                  y: rect.top
                })
              }
          } else {
              setSelection(null)
          }
        }}
        style={{ 
          width: "100%", 
          maxWidth: "800px", 
          aspectRatio: "1/1.414",
          marginBottom: "60px"
        }}
      >
        <div className={`absolute inset-0 transition-all duration-300 pointer-events-none z-10 ${textSelectionMode.active ? 'ring-4 ring-blue-500/20 ring-inset bg-[color:var(--status-info)]/[0.02]' : ''}`} />
        <div className="absolute top-8 left-8 flex flex-col items-start gap-1">
          <span className="eyebrow text-primary/40 group-hover/page:text-primary transition-colors">Digital Manuscript</span>
          <span className="eyebrow text-[#E6E1D6] group-hover/page:text-muted-foreground/70 transition-colors">Folio {index} / {totalPages}</span>
        </div>

        {question && (
             <div className="eyebrow absolute top-8 right-8 text-[color:var(--status-warning)]/40 flex items-center gap-2 group-hover/page:text-[color:var(--status-warning)] transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--status-warning)]" />
                {question.id}
             </div>
        )}

        <div className="p-16 lg:p-24 h-full font-serif overflow-hidden">
          {children}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delay={0}>
      <div className={`h-[calc(100vh-4rem)] overflow-hidden border rounded-xl bg-background transition-all ${isPaused ? 'opacity-50 grayscale-[0.5] pointer-events-none' : ''}`}>
      <ResizablePanelGroup orientation="horizontal">
        {/* Center Panel: Document Viewer */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col bg-muted/10">
            <header className="p-4 border-b border-border bg-background flex flex-col gap-4 z-10 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="eyebrow text-primary/60 mb-0.5">Authoring Identity</span>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold tracking-tight text-foreground">{currentStudent?.name || "Evaluating..."}</h2>
                      {currentStudent && !currentStudent.checkpoints.timeline ? (
                        <Badge
                          variant="outline"
                          className="text-[11px] h-5 px-2 rounded-full border-[color:var(--status-warning)]/40 bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)]"
                        >
                          Late submission — 10% penalty
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Scanned vs OCR Original view toggle — DS Tabs primitive per
                    CONTRIBUTING.md. State is tracked now; downstream rendering
                    can branch on `manuscriptView` once the OCR view is wired. */}
                <Tabs value={manuscriptView} onValueChange={(v) => setManuscriptView(v as "scanned" | "ocr")}>
                  <TabsList className="border border-border">
                    <TabsTrigger value="scanned" className="px-4">Scanned</TabsTrigger>
                    <TabsTrigger value="ocr" className="px-4">OCR Original</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setRevisionHistoryOpen(true)}
                        className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all cursor-pointer focus:outline-none border border-border relative"
                      >
                        <History className="h-4.5 w-4.5" />
                        {revisionEvents.length > 0 && (
                          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">{revisionEvents.length}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Revision History</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </header>

            {/* Per-student review flags — surfaced as shadcn Alert strip(s) above the full manuscript viewer. */}
            {currentStudent?.reviewFlags?.length ? (
              <div className="px-6 pt-3 space-y-2 shrink-0">
                {currentStudent.reviewFlags.map((flag, i) => {
                  const variant =
                    flag.severity === "danger" ? "danger" :
                    flag.severity === "warning" ? "warning" :
                    flag.severity === "success" ? "success" : "info"
                  const Icon =
                    flag.severity === "danger" ? XCircle :
                    flag.severity === "warning" ? AlertTriangle :
                    flag.severity === "success" ? CheckCircle2 : Info
                  return (
                    <Alert key={i} variant={variant}>
                      <Icon />
                      <AlertDescription>{flag.message}</AlertDescription>
                    </Alert>
                  )
                })}
              </div>
            ) : null}

            <div className="flex-1 flex overflow-hidden relative">
              <ArtifactSidebar artifacts={artifacts} />
              {/* Text Selection Mode Banner */}
              <AnimatePresence>
                {textSelectionMode.active && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-0 left-0 right-0 z-30 bg-[color:var(--status-info)] text-primary-foreground p-2 flex items-center justify-center gap-3"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span className="eyebrow">
                      Select text to link as evidence for C{textSelectionMode.criterionId}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setTextSelectionMode({ active: false, criterionId: null })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Main Canvas */}
              <ScrollArea
                className="flex-1 bg-muted/30 scroll-smooth"
                onScrollCapture={(e) => {
                  const target = e.currentTarget as HTMLElement
                  const containerHeight = target.clientHeight

                  // Compute scroll-percent over the scrollable viewport for Nudge A.
                  // ScrollArea's Radix viewport lives inside target; find it.
                  const viewport = target.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
                  if (viewport) {
                    const { scrollTop, scrollHeight, clientHeight } = viewport
                    const denom = scrollHeight - clientHeight
                    if (denom > 0) {
                      const pct = Math.min(1, Math.max(0, (scrollTop + clientHeight) / scrollHeight))
                      markScrollProgress(pct)
                    }
                  }

                  for (let i = 1; i <= totalPages; i++) {
                    const pageEl = document.getElementById(`page-${i}`)
                    if (pageEl) {
                      const rect = pageEl.getBoundingClientRect()
                      if (rect.top >= 0 && rect.top < containerHeight / 2) {
                        if (currentPage !== i) setCurrentPage(i)
                        break
                      } else if (rect.top < 0 && rect.bottom > containerHeight / 2) {
                        if (currentPage !== i) setCurrentPage(i)
                        break
                      }
                    }
                  }
                }}
              >
                <div 
                  className="p-10 lg:p-24 transition-transform duration-500 ease-out origin-top flex flex-col items-center"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  {manuscriptView === "ocr" ? (
                    <>
                      {(() => {
                        const cheatingFlagged = currentStudent ? !currentStudent.checkpoints.cheating : false
                        const page1Flags = cheatingFlagged ? [1, 4] : []
                        const page3Flags = cheatingFlagged ? [2] : []
                        return (
                          <>
                            {/* Page 1 */}
                            <ManuscriptPage index={1}>
                              <div className="max-w-3xl mx-auto space-y-10">
                                <div className="space-y-6 border-b border-border/80 pb-8">
                                  <div className="flex items-center justify-between">
                                    <h1 className="text-4xl font-serif text-foreground leading-tight italic tracking-tight underline decoration-primary/20">{manuscript.title}</h1>
                                  </div>
                                </div>
                                <ManuscriptRenderer elements={manuscript.pages[0].elements} userEvidence={mappedEvidence} suspiciousElementIndices={page1Flags} />
                              </div>
                            </ManuscriptPage>

                            {/* Page 2 */}
                            <ManuscriptPage index={2}>
                              <ManuscriptRenderer elements={manuscript.pages[1].elements} userEvidence={mappedEvidence} />
                            </ManuscriptPage>

                            {/* Page 3 */}
                            <ManuscriptPage index={3}>
                              <ManuscriptRenderer elements={manuscript.pages[2].elements} userEvidence={mappedEvidence} suspiciousElementIndices={page3Flags} />
                            </ManuscriptPage>

                            {/* Page 4 */}
                            <ManuscriptPage index={4}>
                              <ManuscriptRenderer elements={manuscript.pages[3].elements} userEvidence={mappedEvidence} />
                            </ManuscriptPage>
                          </>
                        )
                      })()}
                    </>
                  ) : (
                    <>
                      <ScannedPagePreview index={1} />
                      <ScannedPagePreview index={2} />
                      <ScannedPagePreview index={3} />
                      <ScannedPagePreview index={4} />
                    </>
                  )}

                  <div className="h-60 shrink-0 w-full flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity">
                      <div className="flex flex-col items-center gap-4">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                        <span className="eyebrow text-xs">Manuscript Verified</span>
                      </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Floating Bottom Pagination */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-secondary text-secondary-foreground shadow-2xl z-20 flex items-center gap-6 group transition-all hover:scale-105 border border-border/10 backdrop-blur-md">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    const next = Math.max(1, currentPage - 1)
                    document.getElementById(`page-${next}`)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest">
                  <span className="text-primary">PAGE {currentPage}</span>
                  <span className="opacity-30">/</span>
                  <span className="opacity-50">{totalPages}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1)
                    document.getElementById(`page-${next}`)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border" />

        {/* Right Panel: Rubric Suite */}
        <ResizablePanel defaultSize={40} minSize={25}>
          {(() => {
            const point = rubricPoints[activeRubricCriterionIdx]
            const state = criterionState[point.id] || { score: null, isOverridden: false, feedback: '', confirmed: false }
            const draft = overrideDrafts[point.id]
            const confirmedCount = rubricPoints.filter(p => criterionState[p.id]?.confirmed).length
            const isLastCriterion = activeRubricCriterionIdx === rubricPoints.length - 1
            const allConfirmed = confirmedCount === rubricPoints.length
            const isOverride = activeOverrideId === point.id && !!draft
            const isIncrease = draft?.direction === 'increase'
            const overrideReasons = isIncrease ? INCREASE_REASONS : DECREASE_REASONS
            const isOverrideValid = !!draft && (draft.reasonCategory !== '' || draft.reasoning.trim().length > 0) && draft.scoreReasoning.trim().length > 0
            const pointEvidence = mappedEvidence.filter(e => e.criterionId === point.id)

            return (
              <div className="h-full flex flex-col border-l border-border bg-background overflow-hidden">
                {/* Sticky header */}
                <div className="p-4 border-b border-border bg-background shrink-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">Rubric evaluation</h2>
                    <Badge variant="outline" className="rounded-full text-xs font-semibold px-2 h-5 bg-background">
                      {confirmedCount} of {rubricPoints.length} scored
                    </Badge>
                  </div>
                  <Progress value={(confirmedCount / rubricPoints.length) * 100} className="h-1" />
                  <div className="flex gap-1">
                    {rubricPoints.map((p, idx) => {
                      const done = !!criterionState[p.id]?.confirmed
                      const active = idx === activeRubricCriterionIdx
                      const lowConfidence = (p.aiConfidence ?? 1) < LOW_CONFIDENCE_THRESHOLD
                      return (
                        <Button key={p.id} variant="ghost" size="sm" onClick={() => { setActiveRubricCriterionIdx(idx); markCriterionOpened(p.id) }} className="flex-1 h-auto flex-col gap-1 py-1 relative">
                          <div className="relative">
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                              done ? 'bg-foreground border-foreground' :
                              active ? 'border-[color:var(--category-2)]/30 bg-background' :
                              'border-border bg-background'
                            }`}>
                              {active && !done && <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--category-2)]" />}
                            </div>
                            {lowConfidence && !done ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background">
                                    <AlertTriangle className="h-3 w-3 text-[color:var(--status-warning)]" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>AI confidence is low for this criterion — please review.</TooltipContent>
                              </Tooltip>
                            ) : null}
                          </div>
                          <span className={`text-xs font-bold transition-colors ${active ? 'text-foreground' : 'text-muted-foreground/50'}`}>C{p.id}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-5">
                    {/* Progressive-assurance nudges now render in a floating
                        top-right stack via <FloatingNudgeStack /> at the page
                        top level — no space carved out of the rubric sidebar. */}
                    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                      <div className="p-4 space-y-5">

                        {/* Title row + badge */}
                        <div className="relative">
                          {point.status === 'REVIEW_NEEDED' && (
                            <div className="absolute -top-4 -right-4 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-bl-lg rounded-tr-xl shadow-sm">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L1 9h8L5 1z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="0.8" strokeLinejoin="round"/><path d="M5 4.5v2M5 7.5v.5" stroke="white" strokeWidth="0.9" strokeLinecap="round"/></svg>
                              Review Required
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-2 pr-2">
                            <h3 className="text-sm font-bold text-foreground leading-tight">{point.label}</h3>
                            <CriterionStatusTag tag={deriveTag(sessionTelemetry.byCriterion[telemetryKey(selectedSubmission, point.id)])} />
                          </div>
                        </div>

                        {/* Score + selector */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="eyebrow text-muted-foreground/60">Score</span>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-2xl font-semibold text-foreground tabular-nums">{(state.score ?? point.aiScore).toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground/60">/{point.maxPoints}</span>
                            </div>
                            {state.isOverridden && (
                              <span className="ml-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                Overridden
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground/50 ml-auto">Adjust:</span>
                          </div>

                          {/* Compact horizontal score buttons + expand toggle */}
                          {!scoreLevelExpanded[point.id] && (
                            <div className="flex gap-1 items-center">
                              {point.levels.map(lvl => {
                                const isDraftSelected = isOverride && draft.proposedScore === lvl.points
                                const isCurrentConfirmed = state.confirmed && state.score === lvl.points
                                const isAiDefault = lvl.points === point.aiScore && !state.confirmed && !isOverride
                                const selected = isDraftSelected || isCurrentConfirmed || isAiDefault
                                return (
                                  <button
                                    key={lvl.val}
                                    onClick={() => handleScoreLevelClick(point.id, lvl.points, point.aiScore)}
                                    className={`flex-1 text-xs font-semibold py-1.5 rounded-md border transition-all ${
                                      selected
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
                                    }`}
                                  >
                                    {lvl.points}
                                  </button>
                                )
                              })}
                              <button
                                onClick={() => setScoreLevelExpanded(s => ({ ...s, [point.id]: true }))}
                                className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground/50 hover:border-foreground/40 hover:text-foreground transition-all shrink-0"
                                title="Show level descriptors"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4h8M2 8h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                              </button>
                            </div>
                          )}

                          {/* Expanded vertical score list with descriptors */}
                          {scoreLevelExpanded[point.id] && (
                            <div className="space-y-1">
                              {point.levels.map(lvl => {
                                const isDraftSelected = isOverride && draft.proposedScore === lvl.points
                                const isCurrentConfirmed = state.confirmed && state.score === lvl.points
                                const isAiDefault = lvl.points === point.aiScore && !state.confirmed && !isOverride
                                const selected = isDraftSelected || isCurrentConfirmed || isAiDefault
                                return (
                                  <button
                                    key={lvl.val}
                                    onClick={() => handleScoreLevelClick(point.id, lvl.points, point.aiScore)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                                      selected
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'bg-background border-border hover:border-foreground/40'
                                    }`}
                                  >
                                    <span className={`text-sm font-bold tabular-nums shrink-0 ${selected ? 'text-background' : 'text-foreground'}`}>{lvl.points}</span>
                                    <span className={`text-xs leading-snug ${selected ? 'text-background/80' : 'text-muted-foreground'}`}>{lvl.name}</span>
                                  </button>
                                )
                              })}
                              <button
                                onClick={() => setScoreLevelExpanded(s => ({ ...s, [point.id]: false }))}
                                className="w-full text-xs text-muted-foreground/50 hover:text-foreground py-1 text-center transition-colors"
                              >
                                Collapse ↑
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Override block — chip + custom-input pattern */}
                        {isOverride && (() => {
                          const chipReasons = [
                            'Rubric ambiguity',
                            'Student explained verbally',
                            'Missed context',
                            'Effort acknowledged',
                            'Partial credit warranted',
                          ]
                          return (
                            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3.5">
                              {/* Header */}
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  {isIncrease ? <ArrowUp className="h-3.5 w-3.5 text-[color:var(--status-success)] shrink-0" /> : <ArrowDown className="h-3.5 w-3.5 text-[color:var(--status-error)] shrink-0" />}
                                  <span className="text-sm font-semibold text-foreground">
                                    Proposing {draft.proposedScore}pts
                                    <span className={`ml-1 text-xs font-normal ${isIncrease ? 'text-[color:var(--status-success)]' : 'text-[color:var(--status-error)]'}`}>
                                      ({isIncrease ? '+' : '−'}{Math.abs(draft.proposedScore - draft.aiScore).toFixed(1)} from AI&apos;s {draft.aiScore}pts)
                                    </span>
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground/60 pl-5">One tap for common reasons, or type a custom reason</p>
                              </div>

                              {/* Reason chips */}
                              <div className="flex flex-wrap gap-2">
                                {chipReasons.map(chip => {
                                  const active = draft.reasonCategory === chip
                                  return (
                                    <button
                                      key={chip}
                                      onClick={() => handleUpdateDraft(point.id, { reasonCategory: active ? '' : chip })}
                                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                                        active
                                          ? 'bg-foreground text-background border-foreground'
                                          : 'bg-background text-foreground border-border hover:border-foreground/50'
                                      }`}
                                    >
                                      {chip}
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Custom reason input */}
                              <input
                                type="text"
                                value={draft.reasoning}
                                onChange={e => handleUpdateDraft(point.id, { reasoning: e.target.value })}
                                placeholder="Or type a custom reason…"
                                className="w-full text-xs px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                              />

                              {/* Score justification */}
                              <div className="space-y-1.5">
                                <p className="text-xs font-medium text-foreground/70">
                                  Why is <span className="font-bold text-foreground">{draft.proposedScore}pts</span> the correct score for this criterion?
                                </p>
                                <textarea
                                  value={draft.scoreReasoning}
                                  onChange={e => handleUpdateDraft(point.id, { scoreReasoning: e.target.value })}
                                  rows={3}
                                  placeholder="Describe what in the student's work justifies this score…"
                                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 resize-none transition-colors min-h-[72px]"
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-0.5">
                                <Button variant="outline" size="sm" onClick={() => handleCancelOverride(point.id)} className="shrink-0">Cancel</Button>
                                <Button size="sm" onClick={() => handleConfirmOverride(point.id)} disabled={!isOverrideValid} className="flex-1">
                                  Confirm override
                                </Button>
                              </div>
                            </div>
                          )
                        })()}

                        {/* Reasoning — instructor's when overridden, AI's otherwise */}
                        <div className="space-y-2 pt-2 border-t border-border/40">
                          {state.isOverridden && state.instructorReasoning ? (
                            <>
                              <span className="eyebrow text-muted-foreground/50 block text-xs">Instructor reasoning</span>
                              <p className="text-xs text-foreground/75 leading-[1.6]">{state.instructorReasoning}</p>
                            </>
                          ) : (
                            <>
                              <span className="eyebrow text-muted-foreground/50 block text-xs">AI reasoning</span>
                              {(point as any).working?.[0] && (
                                <div className="flex items-start gap-2 text-xs text-foreground/75">
                                  <span className="text-emerald-500 font-bold shrink-0 mt-px">✓</span>
                                  <span className="leading-[1.5]">{(point as any).working[0]}</span>
                                </div>
                              )}
                              {(point as any).gaps?.[0] && (
                                <div className="flex items-start gap-2 text-xs text-foreground/75">
                                  <span className="text-red-400 font-bold shrink-0 mt-px">✗</span>
                                  <span className="leading-[1.5]">{(point as any).gaps[0]}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Evidence — inline */}
                        <div className="space-y-2 pt-2 border-t border-border/40">
                          <span className="eyebrow text-muted-foreground/50 block text-xs">Evidence ({pointEvidence.length} linked)</span>
                          {pointEvidence.length === 0 ? (
                            <p className="text-xs text-muted-foreground/60 leading-[1.5]">No evidence linked. Scores with evidence attached see <span className="font-semibold text-foreground/50">40% fewer re-evaluation requests.</span></p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {pointEvidence.map((ev, i) => (
                                <Tooltip key={ev.id}>
                                  <TooltipTrigger render={
                                    <button
                                      onClick={() => scrollToEvidence(ev.id)}
                                      className="group flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border bg-muted/30 hover:border-primary hover:bg-primary/5 transition-all"
                                    />
                                  }>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:animate-pulse shrink-0" />
                                    <span className="eyebrow text-muted-foreground group-hover:text-primary transition-colors">E{i+1}</span>
                                    <div
                                      role="button"
                                      onClick={(e) => { e.stopPropagation(); setMappedEvidence(prev => prev.filter(e => e.id !== ev.id)) }}
                                      className="ml-0.5 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <X className="h-2.5 w-2.5 text-destructive" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-xs p-3 z-[100] bg-popover text-popover-foreground border border-border shadow-xl">
                                    <p className="text-xs font-serif italic leading-relaxed">&ldquo;{ev.text || 'No text available'}&rdquo;</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          )}
                          <Button
                            variant={textSelectionMode.active && textSelectionMode.criterionId === point.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTextSelectionMode({ active: true, criterionId: point.id })}
                            className="w-full border-dashed text-xs"
                          >
                            <LinkIcon className={`h-3 w-3 ${textSelectionMode.active && textSelectionMode.criterionId === point.id ? 'animate-bounce' : ''}`} />
                            {textSelectionMode.active && textSelectionMode.criterionId === point.id ? 'Selecting evidence...' : '+ Add evidence'}
                          </Button>
                        </div>

                        {/* Feedback — plain editable text box */}
                        {(() => {
                          const criterionKey = point.id
                          const storeFb = studentCriterionFeedbacks[criterionKey]
                          const currentScore = state.score ?? point.aiScore
                          const suggestedFb = !storeFb ? generateCriterionFeedback(point.label, Math.round(currentScore / 2), [], '') : null
                          const fb = storeFb || { ...suggestedFb, authorship: 'ai_generated' as const, isConfirmed: false, isApproved: false, regenCount: 0 }
                          const isApproved = fb.isApproved

                          return (
                            <div className="space-y-2 pt-2 border-t border-border/40">
                              <span className="eyebrow text-muted-foreground/50 block text-xs">Feedback</span>
                              <textarea
                                value={fb.feedbackText}
                                onChange={e => {
                                  if (!storeFb) {
                                    confirmFeedback(criterionKey, { tier: fb.tier as any, tierLabel: fb.tierLabel, feedbackText: e.target.value, thinkingPrompt: fb.thinkingPrompt })
                                  } else {
                                    updateCriterionFeedback(criterionKey, e.target.value)
                                  }
                                }}
                                rows={5}
                                placeholder="Write feedback for this criterion…"
                                className="w-full text-xs leading-[1.75] text-foreground bg-background border border-border rounded-lg p-3 resize-y focus:outline-none focus:border-primary/50 font-sans min-h-[100px] transition-colors"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={fb.regenCount >= 2}
                                  onClick={() => {
                                    const regen = generateCriterionFeedback(point.label, Math.round(currentScore / 2), [], '')
                                    if (!storeFb) {
                                      confirmFeedback(criterionKey, { tier: regen.tier as any, tierLabel: regen.tierLabel, feedbackText: regen.feedbackText, thinkingPrompt: regen.thinkingPrompt })
                                    } else {
                                      regenerateCriterionFeedback(criterionKey, regen.feedbackText, regen.tier as any, regen.tierLabel)
                                    }
                                  }}
                                  className="eyebrow h-8 px-2.5 text-muted-foreground/60 gap-1.5 hover:text-foreground"
                                >
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 2C8.5.8 6.5.5 4.5 1.3A5 5 0 0 0 2 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M2 6.5v3H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  {fb.regenCount >= 2 ? 'Max uses' : 'Regenerate'}
                                </Button>
                                {isApproved ? (
                                  <Button variant="ghost" size="sm" className="eyebrow h-8 px-4 ml-auto bg-[color:var(--status-success-bg)] text-[color:var(--status-success)] border border-[color:var(--status-success)]/30 gap-1.5 cursor-default hover:bg-[color:var(--status-success-bg)] rounded-full">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="eyebrow h-8 px-5 bg-foreground text-background gap-1.5 ml-auto rounded-full hover:opacity-90"
                                    onClick={() => {
                                      if (!storeFb) {
                                        confirmFeedback(criterionKey, { tier: fb.tier as any, tierLabel: fb.tierLabel, feedbackText: fb.feedbackText, thinkingPrompt: fb.thinkingPrompt })
                                      }
                                      approveCriterionFeedback(criterionKey)
                                    }}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })()}

                      </div>
                    </div>
                  </div>
                </ScrollArea>


                <div className="p-4 border-t border-border bg-background shrink-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow text-muted-foreground">Total</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-semibold tracking-tight text-foreground tabular-nums">{Math.round((currentTotalScore / totalMaxPoints) * 100)}</span>
                        <span className="text-xs text-muted-foreground font-bold">/ 100</span>
                        <span className="text-xs text-muted-foreground/50 ml-1">({currentTotalScore.toFixed(1)}/{totalMaxPoints}pts)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={activeRubricCriterionIdx === 0}
                      onClick={() => setActiveRubricCriterionIdx(i => i - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScoreConfirm(point.id, state.score ?? point.aiScore)}
                    >
                      Save
                    </Button>
                    {isLastCriterion ? (
                      <Button
                        size="sm"
                        disabled={!allConfirmed}
                        onClick={() => {
                          if (allConfirmed) {
                            router.push(`/dashboard/evaluation/${id}/feedback`)
                          }
                        }}
                        className="flex-1"
                      >
                        {allConfirmed ? 'Overall feedback →' : `· ${rubricPoints.length - confirmedCount} remaining`}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setActiveRubricCriterionIdx(i => i + 1)}
                        className="flex-1"
                      >
                        Next criterion
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Floating Status Bar Hidden when paused */}

      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-3xl z-[60]"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="shadow-[0_40px_100px_-12px_rgba(0,0,0,0.2)] border-border bg-card overflow-hidden rounded-2xl">
                <div className="h-2.5 w-full bg-primary shadow-[0_4px_12px_rgba(var(--primary),0.3)]" />
                <CardContent className="p-16 text-center space-y-8">
                  <div className="p-6 w-fit mx-auto rounded-2xl bg-accent text-primary shadow-inner">
                    <History className="h-10 w-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-serif italic tracking-tight text-foreground">Session Suspended</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed px-4 font-medium italic">"Evaluation environment securely cached. Your current calibration metrics and annotations have been preserved in absolute state."</p>
                  </div>
                  <Button size="lg" onClick={() => setIsPaused(false)} className="w-full">Resume academic review</Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* FLOATING EVIDENCE MAPPING MENU */}
      <AnimatePresence>
        {selection && (() => {
          const isOverrideSelectionMode = textSelectionMode.active && textSelectionMode.criterionId !== null
          const activeCriterion = isOverrideSelectionMode ? rubricPoints.find(p => p.id === textSelectionMode.criterionId) : null

          if (isOverrideSelectionMode && activeCriterion) {
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="fixed z-[100] bg-background border border-[color:var(--status-info)]/30 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-xl p-4 flex flex-col gap-3 w-80 backdrop-blur-md"
                style={{ left: selection.x, top: selection.y, transform: 'translate(-50%, -110%)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-3.5 w-3.5 text-[color:var(--status-info)]" />
                    <span className="eyebrow text-[color:var(--status-info)]">Link to C{activeCriterion.id}</span>
                  </div>
                  <span className="text-xs font-semibold text-[color:var(--status-info)] tabular-nums">Folio {currentPage}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[color:var(--status-info-bg)] border border-[color:var(--status-info)]/30">
                  <p className="text-xs font-serif italic text-foreground/70 leading-relaxed">
                    &ldquo;{selection.text.length > 100 ? selection.text.substring(0, 100) + '...' : selection.text}&rdquo;
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/60">
                  Link this text as evidence for <span className="font-bold text-[color:var(--status-info)]">C{activeCriterion.id} — {activeCriterion.label}</span>?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelection(null)}
                    className="flex-1"
                  >
                    No, dismiss
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleLinkOverrideEvidence(selection.text, currentPage, textSelectionMode.criterionId!)}
                    className="flex-1"
                  >
                    Yes, link it
                  </Button>
                </div>
              </motion.div>
            )
          }

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed z-[100] bg-background border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-xl p-3 flex flex-col gap-2 w-72 backdrop-blur-md"
              style={{ left: selection.x, top: selection.y, transform: 'translate(-50%, -110%)' }}
            >
              <div className="flex items-center justify-between px-2 pb-2 border-b border-border/80 mb-1">
                <div className="flex items-center gap-2">
                    <LinkIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="eyebrow text-muted-foreground">Link Evidence</span>
                </div>
                <span className="text-xs font-semibold text-primary/40 tabular-nums">Folio {currentPage}</span>
              </div>
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
                {rubricPoints.map(point => (
                  <div 
                    key={point.id}
                    role="button"
                    onClick={() => {
                        handleMapEvidence(point.id)
                        addRevisionEvent({
                          type: 'evidence_mapped',
                          criterionId: point.id,
                          criterionLabel: point.label,
                          details: { evidenceText: selection.text }
                        })
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-primary/5 transition-all flex flex-col gap-0.5 group/btn cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-tight text-foreground group-hover/btn:text-primary transition-colors">{point.label}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-all text-primary" />
                    </div>
                    <span className="eyebrow text-muted-foreground/50">Criterion {point.id}</span>
                  </div>
                ))}
              </div>
              <Separator className="bg-border/50 my-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelection(null)}
                className="w-full"
              >
                Dismiss
              </Button>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
    <RevisionHistorySheet
      open={revisionHistoryOpen}
      onOpenChange={setRevisionHistoryOpen}
      events={revisionEvents}
      studentName={currentStudent?.name || 'Unknown'}
    />
    <FloatingNudgeStack
      showA={showNudgeA}
      showBCriterionLabel={nudgeBCriterionLabel}
      showC={showNudgeC}
      onDismissA={dismissNudgeA}
      onDismissB={dismissNudgeB}
      onDismissC={dismissNudgeC}
      onReopenEvidence={reopenFromNudgeB}
    />
    <DemoControlPanel
      onTriggerA={() => { setNudgeDismissState(p => ({ ...p, A: undefined })); setDemoForce(f => ({ ...f, A: true })) }}
      onTriggerB={() => { setNudgeDismissState(p => ({ ...p, B: undefined })); setDemoForce(f => ({ ...f, B: true })) }}
      onTriggerC={() => { setNudgeDismissState(p => ({ ...p, C: undefined })); setDemoForce(f => ({ ...f, C: true })) }}
      onSimulateEscalation={() => {
        // Fast-forward the store counter to threshold + fire the spot-check
        // modal directly — simulates the flow a presenter would see if they
        // ignored 3 nudges then hit Publish on the submissions-list page.
        setDemoForce({ A: false, B: false, C: false })
        resetProgressiveNudges()
        for (let i = 0; i < ESCALATION_DISMISS_THRESHOLD; i++) incrementIgnoredNudge()
        markSpotCheckAutoFired()
        triggerSpotCheck()
      }}
      onOpenSpotCheck={() => triggerSpotCheck()}
      onResetTelemetry={resetTelemetry}
    />
    </TooltipProvider>
  )
}

export default function GradingDesk({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    }>
      <GradingDeskContent params={{ id }} />
    </Suspense>
  )
}

