"use client"

import { useState, use, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useGradingStore } from "@/lib/store/grading-store"
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
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
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Edit2,
  Upload,
  X
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RevisionHistorySheet, RevisionEvent } from "@/components/evaluation/revision-history-sheet"
import { FeedbackSummaryModal } from "@/components/evaluation/feedback-summary-modal"
import { CriterionFeedbackCard } from "@/components/evaluation/feedback/criterion-feedback-card"
import { FeedbackGenerating } from "@/components/evaluation/feedback/feedback-generating"
import { InternalNotesPanel } from "@/components/evaluation/feedback/internal-notes-panel"
import { generateCriterionFeedback } from "@/lib/feedback-generator"
import { useGradingStore as useFeedbackStore } from "@/lib/store/grading-store"

export default function GradingDesk({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { calibration } = useGradingStore()
  const cal = calibration[id]
  const isCalibrated = cal?.phase === "complete"

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

  const { assignments, activeStudentId, setActiveStudent } = useGradingStore()
  const assignment = assignments[id]
  
  // Resolve active student from multiple sources
  const [selectedSubmission, setSelectedSubmission] = useState(() => {
    // 1. Check if we have an active assignment/student in store
    if (activeStudentId && assignment?.students.find(s => s.id === activeStudentId)) {
      return activeStudentId
    }
    // 2. Fallback to first student
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
  const [triageFilter, setTriageFilter] = useState<"all" | "critical" | "focus" | "verified">("all")
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
  }

  const [overrideDrafts, setOverrideDrafts] = useState<Record<string, OverrideDraft>>({})
  const [activeOverrideId, setActiveOverrideId] = useState<string | null>(null)
  const [textSelectionMode, setTextSelectionMode] = useState<{ active: boolean, criterionId: string | null }>({ active: false, criterionId: null })
  const [pendingTextSelection, setPendingTextSelection] = useState<{ text: string, page: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
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

    // Prototype: review-prompt banners derived from the 5 accountability checkpoints.
    // Each failing checkpoint pushes a banner with its own severity + copy, so the
    // banner stack matches the ✗ indicators already shown in the triage sidebar tooltip.
    type ReviewFlag = { severity: 'info' | 'success' | 'warning' | 'danger'; message: string }
    const reviewFlags: ReviewFlag[] = []
    if (!checkpoints.grading) {
      reviewFlags.push({
        severity: 'warning',
        message: `Scores are unusually high for ${name} — please review.`,
      })
    }
    if (!checkpoints.ocr) {
      reviewFlags.push({
        severity: 'info',
        message: 'OCR quality is low on this submission — please review.',
      })
    }
    if (!checkpoints.cheating) {
      reviewFlags.push({
        severity: 'danger',
        message: 'Possible cheating or plagiarism detected — please review.',
      })
    }
    if (!checkpoints.history) {
      reviewFlags.push({
        severity: 'warning',
        message: 'Grade history is inconsistent with prior submissions — please review.',
      })
    }
    if (!checkpoints.timeline) {
      reviewFlags.push({
        severity: 'warning',
        message: 'Submission timeline is unusual — please review.',
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

  const submissions = allSubmissions.filter(s => {
    const matchesFilter = triageFilter === "all" || s.category === triageFilter
    const matchesSearch = !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })
  const currentStudent = allSubmissions.find(s => s.id === selectedSubmission)

  const rubricPoints = [
    { id: "c1", type: "c1", label: "Problem Understanding & Direction", maxPoints: 10, aiScore: 6, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the problem framing, user/task clarity, assumptions/constraints, outcomes/non-goals, and scoped use-case mapping is present, and 20% of the work has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", levels: [{val: 5, name: "Exceeds expectations", points: 10}, {val: 4, name: "Meets expectations", points: 8}, {val: 3, name: "Meets expectations with fewer issues", points: 6}, {val: 2, name: "Below Expectations", points: 4}, {val: 1, name: "Significant issues identified", points: 2}] },
    { id: "c2", type: "c2", label: "Iteration & Improvement", maxPoints: 10, aiScore: 6, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the iteration rationale, before/after evidence, and next-steps articulation is present, and 20% has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", levels: [{val: 5, name: "Exceeds expectations", points: 10}, {val: 4, name: "Meets expectations", points: 8}, {val: 3, name: "Meets expectations with fewer issues", points: 6}, {val: 2, name: "Below Expectations", points: 4}, {val: 1, name: "Significant issues identified", points: 2}] },
    { id: "c3", type: "c3", label: "Documentation & Reproducibility", maxPoints: 12, aiScore: 7.2, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the setup/run steps, samples/expected outputs, troubleshooting, and limitations is present, and 20% has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", levels: [{val: 5, name: "Exceeds expectations", points: 12}, {val: 4, name: "Meets expectations", points: 9.6}, {val: 3, name: "Meets expectations with fewer issues", points: 7.2}, {val: 2, name: "Below Expectations", points: 4.8}, {val: 1, name: "Significant issues identified", points: 2.4}] },
    { id: "c4", type: "c4", label: "Technical Setup & Integration", maxPoints: 12, aiScore: 7.2, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the tool/API integration, config documentation, runnable end-to-end execution, basic error handling, and test path is present, and 20% has issues.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", levels: [{val: 5, name: "Exceeds expectations", points: 12}, {val: 4, name: "Meets expectations", points: 9.6}, {val: 3, name: "Meets expectations with fewer issues", points: 7.2}, {val: 2, name: "Below Expectations", points: 4.8}, {val: 1, name: "Significant issues identified", points: 2.4}] }
  ]

  const [criterionState, setCriterionState] = useState<Record<string, { score: number, isOverridden: boolean, feedback: string, confirmed: boolean }>>({})

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
        reasoning: prev[criterionId]?.reasoning || ''
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
    if (!draft || draft.reasoning.length < 20) return
    setCriterionState(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score: draft.proposedScore, isOverridden: true, confirmed: true }
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
  const [rubricAccordionOpen, setRubricAccordionOpen] = useState<Record<string, boolean>>({})
  const [rubricReviewStripOpen, setRubricReviewStripOpen] = useState<Record<string, boolean>>({})

  const handleConfirmNext = () => {
    const currentSub = submissions.find(s => s.id === selectedSubmission)
    // Trigger spot check only for "Clear" papers and if not already active
    setGradedSubmissions(prev => [...prev, selectedSubmission])

    // Find next ungraded submission
    const currentIndex = submissions.findIndex(s => s.id === selectedSubmission)
    const nextSub = submissions.slice(currentIndex + 1).find(s => s.status !== "graded") || submissions[0]

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
  }

  // Mock data for 4 pages
  const totalPages = 4
  const questionMap = [
    { id: "Q1", label: "Question 1: Architecture & Design", pages: [1] },
    { id: "Q2", label: "Question 2: Implementation", pages: [2] },
    { id: "Q3", label: "Question 3: Testing & Quality", pages: [3] },
    { id: "Q4", label: "Question 4: Deployment", pages: [4] },
  ]

  const ManuscriptPage = ({ index, children }: { index: number, children: React.ReactNode }) => {
    const question = questionMap.find(q => q.pages.includes(index))
    
    return (
      <div 
        id={`page-${index}`}
        className={`bg-background shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-[#E6E1D6]/50 mx-auto transition-all duration-300 relative group/page ${textSelectionMode.active ? 'cursor-crosshair' : 'cursor-text'}`}
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
        {/* Left Panel: Triage Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} className="bg-muted/5">
          <div className="flex flex-col h-full border-r border-border">
             <div className="p-4 border-b border-border space-y-4">
               <div className="flex items-center justify-between">
                 <h2 className="eyebrow text-muted-foreground/80">Triage Sidebar</h2>
                 <div className="flex flex-col items-end gap-1">
                   <Badge variant="outline" className="rounded-full bg-background border-border text-xs font-semibold">
                     {gradedSubmissions.length} / {allSubmissions.length} Completed
                   </Badge>
                   <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-primary transition-all duration-500" 
                       style={{ width: `${(gradedSubmissions.length / allSubmissions.length) * 100}%` }} 
                     />
                   </div>
                 </div>
               </div>
              
              {/* Triage Categories */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
                <Button
                  variant={triageFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTriageFilter("all")}
                  className="w-full"
                >All</Button>
                <Button
                  variant={triageFilter === 'critical' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTriageFilter("critical")}
                  className="w-full"
                >Crit</Button>
                <Button
                  variant={triageFilter === 'focus' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTriageFilter("focus")}
                  className="w-full"
                >Focus</Button>
                <Button
                  variant={triageFilter === 'verified' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTriageFilter("verified")}
                  className="w-full"
                >Veri</Button>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs bg-background border-border focus-visible:ring-primary/20" placeholder="Filter cohort..." />
              </div>

              {/* Bulk Approve — only visible in Verified tab */}
              {triageFilter === "verified" && (() => {
                const pendingVerified = allSubmissions.filter(
                  s => s.category === "verified" && !gradedSubmissions.includes(s.id)
                )
                return pendingVerified.length > 0 ? (
                  <Button
                    onClick={() => {
                      setGradedSubmissions(prev => [...new Set([...prev, ...pendingVerified.map(s => s.id)])])
                    }}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Bulk approve all</span>
                    </div>
                    <span className="tabular-nums">
                      {pendingVerified.length}
                    </span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[color:var(--status-success-bg)] border border-[color:var(--status-success)]/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--status-success)] shrink-0" />
                    <span className="eyebrow text-[color:var(--status-success)]">All Verified Approved</span>
                  </div>
                )
              })()}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    role="button"
                    onClick={() => {
                      setSelectedSubmission(sub.id)
                      setIsFixed(false)
                      setCurrentPage(1)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left text-sm cursor-pointer border-l-2 ${
                      selectedSubmission === sub.id 
                        ? 'bg-primary/5 border-l-primary text-foreground' 
                        : 'hover:bg-muted/50 border-l-transparent text-muted-foreground'
                    }`}
                  >
                    <div className="flex flex-col gap-1.5 flex-1">
                       <div className="flex items-center gap-2">
                         {gradedSubmissions.includes(sub.id) ? (
                           <CheckCircle2 className="h-3 w-3 text-[color:var(--status-success)]" />
                         ) : (
                           <div className={`w-1.5 h-1.5 rounded-full ${
                               sub.category === 'critical' ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                               sub.category === 'focus' ? 'bg-[color:var(--status-warning)]' : 'bg-[color:var(--status-success)]'
                           }`} />
                         )}
                         <span className={`eyebrow tracking-tight ${selectedSubmission === sub.id ? 'text-primary' : 'text-foreground/70'} ${gradedSubmissions.includes(sub.id) ? 'line-through opacity-60' : ''}`}>{sub.name}</span>
                         {selectedSubmission === sub.id && !gradedSubmissions.includes(sub.id) && <Sparkles className="h-2.5 w-2.5 text-primary" />}
                         {gradedSubmissions.includes(sub.id) && <span className="eyebrow text-[color:var(--status-success)]">Done</span>}
                       </div>
                       <div className="flex items-center gap-2 ml-3.5">
                         <span className="text-xs font-semibold text-muted-foreground/40 tabular-nums">{sub.code}</span>
                         {!gradedSubmissions.includes(sub.id) && (
                           <>
                             <span className="text-xs opacity-40">•</span>
                             <Tooltip>
                                 <TooltipTrigger>
                                     <span className={`eyebrow px-1.5 py-0.5 rounded-sm ${
                                         (Object.values(sub.checkpoints).filter(Boolean).length) <= 2 ? 'bg-[color:var(--status-error-bg)] text-[color:var(--status-error)]' :
                                         (Object.values(sub.checkpoints).filter(Boolean).length) <= 4 ? 'bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)]' :
                                         'bg-primary/5 text-primary'
                                     }`}>
                                         Checkpoints: {Object.values(sub.checkpoints).filter(Boolean).length}/5
                                     </span>
                                 </TooltipTrigger>
                                  <TooltipContent 
                                    side="right"
                                    className="bg-popover text-popover-foreground border border-border shadow-xl p-3 space-y-2 min-w-[140px]"
                                  >
                                      <div className="eyebrow text-popover-foreground/70 border-b border-border/50 pb-1.5 mb-1.5">
                                          Checkpoints
                                      </div>
                                      <div className="space-y-1">
                                          {Object.entries(sub.checkpoints).map(([key, passed]) => (
                                              <div key={key} className="flex items-center justify-between gap-4 text-xs">
                                                  <span className="text-popover-foreground/80 capitalize">{key}</span>
                                                  <span className={passed ? 'text-[color:var(--status-success)]' : 'text-destructive'}>
                                                      {passed ? '✓' : '✗'}
                                                  </span>
                                              </div>
                                          ))}
                                      </div>
                                  </TooltipContent>
                             </Tooltip>
                           </>
                         )}
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                         {!gradedSubmissions.includes(sub.id) && sub.flags > 0 && (
                           <Badge variant="destructive" className="h-5 px-1.5 rounded-md text-xs font-semibold">
                               {sub.flags}
                           </Badge>
                         )}
                     </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border" />

        {/* Center Panel: Document Viewer */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col bg-muted/10">
            <header className="p-4 border-b border-border bg-background flex flex-col gap-4 z-10 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="eyebrow text-primary/60 mb-0.5">Authoring Identity</span>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">{currentStudent?.name || "Evaluating..."}</h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
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

            {/* Per-student review flags — surfaced as shadcn Alert strip(s) above the full manuscript
                viewer. Rendered here (between header and the horizontal artifact+manuscript row) so
                it spans full width. */}
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
                className="flex-1 bg-[#F9F8F4] scroll-smooth"
                onScrollCapture={(e) => {
                  const target = e.currentTarget as HTMLElement
                  const containerHeight = target.clientHeight
                  
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
                  {/* Page 1 */}
                  <ManuscriptPage index={1}>
                    <div className="max-w-3xl mx-auto space-y-10">
                      <div className="space-y-6 border-b border-border/80 pb-8">
                        <div className="flex items-center justify-between">
                          <h1 className="text-4xl font-serif text-foreground leading-tight italic tracking-tight underline decoration-primary/20">{manuscript.title}</h1>
                        </div>
                      </div>
                      <ManuscriptRenderer elements={manuscript.pages[0].elements} userEvidence={mappedEvidence} />
                    </div>
                  </ManuscriptPage>

                  {/* Page 2 */}
                  <ManuscriptPage index={2}>
                    <ManuscriptRenderer elements={manuscript.pages[1].elements} userEvidence={mappedEvidence} />
                  </ManuscriptPage>
                  
                  {/* Page 3 */}
                  <ManuscriptPage index={3}>
                    <ManuscriptRenderer elements={manuscript.pages[2].elements} userEvidence={mappedEvidence} />
                  </ManuscriptPage>

                  {/* Page 4 */}
                  <ManuscriptPage index={4}>
                    <ManuscriptRenderer elements={manuscript.pages[3].elements} userEvidence={mappedEvidence} />
                  </ManuscriptPage>

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
        <ResizablePanel defaultSize={35} minSize={25}>
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
            const isOverrideValid = !!draft && draft.reasoning.length >= 20 && (draft.reasonCategory !== 'found_more_evidence' || draft.linkedEvidence.length > 0)
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
                      return (
                        <Button key={p.id} variant="ghost" size="sm" onClick={() => setActiveRubricCriterionIdx(idx)} className="flex-1 h-auto flex-col gap-1 py-1">
                          <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                            done ? 'bg-foreground border-foreground' :
                            active ? 'border-[color:var(--category-2)]/30 bg-background' :
                            'border-border bg-background'
                          }`}>
                            {active && !done && <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--category-2)]" />}
                          </div>
                          <span className={`text-xs font-bold transition-colors ${active ? 'text-foreground' : 'text-muted-foreground/50'}`}>C{p.id}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-3">
                    {point.status === 'REVIEW_NEEDED' && (
                      <div className="rounded-lg bg-[color:var(--status-warning-bg)] border border-[color:var(--status-warning)]/30 overflow-hidden">
                        <Button
                          variant="ghost"
                          className="w-full justify-between"
                          onClick={() => setRubricReviewStripOpen(prev => ({ ...prev, [point.id]: !prev[point.id] }))}
                        >
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-[color:var(--status-warning)] shrink-0" />
                            <span className="eyebrow text-[color:var(--status-warning)]">Review needed</span>
                          </div>
                          <ChevronDown className={`h-3.5 w-3.5 text-[color:var(--status-warning)] transition-transform ${rubricReviewStripOpen[point.id] ? 'rotate-180' : ''}`} />
                        </Button>
                        {rubricReviewStripOpen[point.id] && (
                          <div className="px-3 pb-3">
                            <p className="text-xs text-[color:var(--status-warning)] leading-relaxed">{point.note}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                      <div className="p-4 space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-foreground leading-tight">{point.label}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">{point.reasoning}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="eyebrow text-muted-foreground">Score</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-semibold text-foreground tabular-nums">{(state.score ?? point.aiScore).toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">/{point.maxPoints}</span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-auto">Adjust:</span>
                          </div>
                          <div className="flex gap-1.5">
                            {point.levels.map(lvl => {
                              const isDraftSelected = isOverride && draft.proposedScore === lvl.points
                              const isCurrentConfirmed = state.confirmed && state.score === lvl.points
                              const isAiDefault = lvl.points === point.aiScore && !state.confirmed && !isOverride
                              const selected = isDraftSelected || isCurrentConfirmed || isAiDefault
                              return (
                                <Button
                                  key={lvl.val}
                                  variant={selected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleScoreLevelClick(point.id, lvl.points, point.aiScore)}
                                  className="flex-1"
                                >
                                  {lvl.points}pts
                                </Button>
                              )
                            })}
                          </div>
                        </div>

                        {isOverride && (
                          <div className="border border-[color:var(--status-warning)]/30 rounded-lg bg-[color:var(--status-warning-bg)]/50 p-3 space-y-3">
                            <div className={`flex items-center gap-2 ${isIncrease ? 'text-[color:var(--status-success)]' : 'text-[color:var(--status-error)]'}`}>
                              {isIncrease ? <ArrowUp className="h-3.5 w-3.5 shrink-0" /> : <ArrowDown className="h-3.5 w-3.5 shrink-0" />}
                              <span className="text-xs font-semibold">
                                Proposing {draft.proposedScore}pts ({isIncrease ? '↑' : '↓'}{Math.abs(draft.proposedScore - draft.aiScore).toFixed(1)} from AI&apos;s {draft.aiScore}pts)
                              </span>
                            </div>
                            <select
                              value={draft.reasonCategory}
                              onChange={e => {
                                handleUpdateDraft(point.id, { reasonCategory: e.target.value })
                                if (e.target.value === 'found_more_evidence') {
                                  setTextSelectionMode({ active: true, criterionId: point.id })
                                } else {
                                  setTextSelectionMode({ active: false, criterionId: null })
                                }
                              }}
                              className="w-full text-xs rounded border border-[color:var(--status-warning)]/30 bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-amber-300"
                            >
                              <option value="">Select a reason&hellip;</option>
                              {overrideReasons.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            {draft.reasonCategory === 'found_more_evidence' && (
                              <div className="p-2.5 rounded-lg bg-[color:var(--status-info-bg)] border border-[color:var(--status-info)]/30">
                                <p className="text-xs text-[color:var(--status-info)]/80 leading-relaxed mb-2">Highlight text in the manuscript to link as evidence.</p>
                                {draft.linkedEvidence.length > 0 && (
                                  <div className="space-y-1.5 mb-2">
                                    {draft.linkedEvidence.map((ev, i) => (
                                      <div key={ev.id} className="flex items-start gap-2 p-2 rounded bg-background border border-[color:var(--status-info)]/30 group/ev">
                                        <span className="text-xs font-mono font-bold text-[color:var(--status-info)] shrink-0">E{i + 1}</span>
                                        <p className="text-xs font-serif italic text-foreground/70 flex-1 leading-relaxed">&quot;{ev.text.length > 60 ? ev.text.substring(0, 60) + '...' : ev.text}&quot;</p>
                                        <Button variant="ghost" size="icon-xs" onClick={() => handleRemoveOverrideEvidence(point.id, ev.id)} className="opacity-0 group-hover/ev:opacity-100 transition-opacity shrink-0">
                                          <X className="h-3 w-3 text-destructive hover:text-[color:var(--status-error)]" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {draft.linkedEvidence.length === 0 && (
                                  <p className="text-xs text-[color:var(--status-info)]/60 italic">No evidence linked yet</p>
                                )}
                              </div>
                            )}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="eyebrow text-muted-foreground">Explain your override</span>
                                <span className={`text-xs font-mono ${draft.reasoning.length >= 20 ? 'text-[color:var(--status-success)]' : 'text-[color:var(--status-warning)]'}`}>{draft.reasoning.length}/20</span>
                              </div>
                              <textarea
                                value={draft.reasoning}
                                onChange={e => handleUpdateDraft(point.id, { reasoning: e.target.value })}
                                placeholder={isIncrease ? 'Describe what the AI missed...' : "Explain what's wrong with the AI's interpretation..."}
                                className="w-full h-20 rounded-lg border border-[color:var(--status-warning)]/30 bg-background p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-300 text-foreground/80 placeholder:text-xs placeholder:text-muted-foreground/40"
                              />
                            </div>
                            {!isOverrideValid && draft.reasonCategory && (
                              <div className="flex items-center gap-2 p-2 rounded bg-[color:var(--status-warning-bg)] border border-[color:var(--status-warning)]/30">
                                <AlertCircle className="h-3 w-3 text-[color:var(--status-warning)] shrink-0" />
                                <span className="text-xs text-[color:var(--status-warning)]">
                                  {draft.reasoning.length < 20
                                    ? 'At least 20 characters required.'
                                    : draft.reasonCategory === 'found_more_evidence' && draft.linkedEvidence.length === 0
                                    ? 'Link at least one evidence from the manuscript.'
                                    : ''}
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleCancelOverride(point.id)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => handleConfirmOverride(point.id)} disabled={!isOverrideValid}
                                className="flex-1">
                                Confirm override
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Pre-filled Feedback — seamless review & edit */}
                        {(() => {
                          const criterionKey = point.id
                          const storeFb = studentCriterionFeedbacks[criterionKey]
                          const isGenerating = generatingFeedbackFor === point.id
                          
                          // Consistently use suggested or stored feedback
                          const currentScore = state.score ?? point.aiScore
                          const suggestedFb = !storeFb ? generateCriterionFeedback(point.label, Math.round(currentScore / 2), [], '') : null
                          
                          const fb = storeFb || {
                            ...suggestedFb,
                            authorship: 'ai_generated' as const,
                            isConfirmed: false,
                            isApproved: false,
                            regenCount: 0,
                          }

                          return (
                            <div className="space-y-4">
                              {isGenerating ? (
                                <FeedbackGenerating />
                              ) : (
                                <CriterionFeedbackCard
                                  tier={fb.tier as any}
                                  tierLabel={fb.tierLabel}
                                  feedbackText={fb.feedbackText}
                                  thinkingPrompt={fb.thinkingPrompt}
                                  authorship={fb.authorship}
                                  isApproved={fb.isApproved}
                                  regenCount={fb.regenCount}
                                  onEdit={(text) => {
                                    // Implicit adoption on edit
                                    if (!storeFb) {
                                      confirmFeedback(criterionKey, {
                                        tier: fb.tier as any,
                                        tierLabel: fb.tierLabel,
                                        feedbackText: text,
                                        thinkingPrompt: fb.thinkingPrompt,
                                      })
                                    } else {
                                      updateCriterionFeedback(criterionKey, text)
                                    }
                                  }}
                                  onRegenerate={() => {
                                    const regen = generateCriterionFeedback(point.label, Math.round(currentScore / 2), [], '')
                                    if (!storeFb) {
                                       // If not yet in store, just adopt the regen
                                       confirmFeedback(criterionKey, {

                                        tier: regen.tier as any,
                                        tierLabel: regen.tierLabel,
                                        feedbackText: regen.feedbackText,
                                        thinkingPrompt: regen.thinkingPrompt,
                                      })
                                    } else {
                                      regenerateCriterionFeedback(criterionKey, regen.feedbackText, regen.tier as any, regen.tierLabel)
                                    }
                                  }}
                                  onApprove={() => {
                                    // Explicit adoption on confirm
                                    if (!storeFb) {
                                      confirmFeedback(criterionKey, {

                                        tier: fb.tier as any,
                                        tierLabel: fb.tierLabel,
                                        feedbackText: fb.feedbackText,
                                        thinkingPrompt: fb.thinkingPrompt,
                                      })
                                    }
                                    approveCriterionFeedback(criterionKey)
                                  }}
                                />
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                      <Button
                        variant="ghost"
                        onClick={() => setRubricAccordionOpen(prev => ({ ...prev, [`evidence-${point.id}`]: !prev[`evidence-${point.id}`] }))}
                        className="w-full justify-between"
                      >
                        <span className="eyebrow text-muted-foreground">
                          Evidence ({pointEvidence.length} linked)
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${rubricAccordionOpen[`evidence-${point.id}`] ? 'rotate-180' : ''}`} />
                      </Button>
                      {rubricAccordionOpen[`evidence-${point.id}`] && (
                        <div className="px-4 pb-4 space-y-4">
                          {pointEvidence.length === 0 ? (
                            <div className="border-2 border-dashed border-[color:var(--category-2)]/30 rounded-lg p-6 text-center bg-[color:var(--category-2-bg)]/30">
                              <p className="eyebrow text-[color:var(--category-2)] leading-relaxed">No evidence linked yet</p>
                              <p className="text-xs text-[color:var(--category-2)] italic mt-1">Select text in the manuscript to map it here</p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 py-1">
                              {pointEvidence.map((ev, i) => (
                                <Tooltip key={ev.id}>
                                  <TooltipTrigger render={
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => scrollToEvidence(ev.id)}
                                      className="group"
                                    />
                                  }>
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:animate-pulse" />
                                      <span className="eyebrow text-muted-foreground group-hover:text-primary transition-colors">
                                        Evidence #{i+1}
                                      </span>
                                      <div 
                                        role="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setMappedEvidence(prev => prev.filter(e => e.id !== ev.id))
                                        }}
                                        className="ml-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[color:var(--status-error-bg)] rounded-full transition-all"
                                      >
                                        <X className="h-2.5 w-2.5 text-destructive hover:text-[color:var(--status-error)]" />
                                      </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-xs p-3 z-[100] bg-popover text-popover-foreground border border-border shadow-xl">
                                    <div className="space-y-1">
                                      <span className="eyebrow text-primary/60">Source Text</span>
                                      <p className="text-xs font-serif italic leading-relaxed">
                                        &ldquo;{ev.text || "No text available"}&rdquo;
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          )}
                          <Button
                            variant={textSelectionMode.active && textSelectionMode.criterionId === point.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTextSelectionMode({ active: true, criterionId: point.id })}
                            className="w-full border-dashed"
                          >
                            <LinkIcon className={`h-3.5 w-3.5 ${textSelectionMode.active && textSelectionMode.criterionId === point.id ? 'animate-bounce' : ''}`} />
                            {textSelectionMode.active && textSelectionMode.criterionId === point.id ? 'Selecting evidence...' : '+ Add evidence'}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                      <Button
                        variant="ghost"
                        onClick={() => setRubricAccordionOpen(prev => ({ ...prev, [`reasoning-${point.id}`]: !prev[`reasoning-${point.id}`] }))}
                        className="w-full justify-between"
                      >
                        <span className="eyebrow text-muted-foreground">AI reasoning</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${rubricAccordionOpen[`reasoning-${point.id}`] ? 'rotate-180' : ''}`} />
                      </Button>
                      {rubricAccordionOpen[`reasoning-${point.id}`] && (
                        <div className="px-4 pb-4 space-y-2">
                          <p className="text-xs font-serif italic text-muted-foreground leading-relaxed">{point.reasoning}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge className="text-xs bg-[color:var(--status-success-bg)] text-[color:var(--status-success)] border-[color:var(--status-success)]/30 border shadow-none">{point.aiScoreLabel}</Badge>
                            {point.status === 'REVIEW_NEEDED' && (
                              <Badge className="text-xs bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30 border shadow-none">Review needed</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                {/* Internal Notes */}
                <InternalNotesPanel />

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
    </TooltipProvider>
  )
}

