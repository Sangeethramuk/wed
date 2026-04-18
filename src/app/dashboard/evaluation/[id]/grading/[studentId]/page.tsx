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
  ShieldAlert,
  Zap,
  Info,
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
  Activity,
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

import { UpcomingStudentsDropdown } from "@/components/evaluation/grading/upcoming-students-dropdown"

export default function GradingDesk({ params }: { params: Promise<{ id: string, studentId: string }> }) {
  const { id, studentId } = use(params)
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
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Redirecting to calibration…</p>
        </div>
      </div>
    )
  }

  const [selectedSubmission, setSelectedSubmission] = useState(studentId)
  const [isFixed, setIsFixed] = useState(false)
  const [activeTab, setActiveTab] = useState<"rubric" | "feedback" | "integrity">("rubric")
  const [showInsights, setShowInsights] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [dismissedPoints, setDismissedPoints] = useState<number[]>([])
  const [gradedSubmissions, setGradedSubmissions] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null)
  const [mappedEvidence, setMappedEvidence] = useState<{ id: string, text: string, criterionId: number }[]>([])

  // Override draft state management
  interface OverrideDraft {
    criterionId: number
    proposedScore: number
    aiScore: number
    direction: 'increase' | 'decrease' | 'same'
    reasonCategory: string
    linkedEvidence: Array<{ id: string, text: string, page: number }>
    ocrFile?: { name: string, size: string }
    reasoning: string
  }

  const [overrideDrafts, setOverrideDrafts] = useState<Record<number, OverrideDraft>>({})
  const [activeOverrideId, setActiveOverrideId] = useState<number | null>(null)
  const [textSelectionMode, setTextSelectionMode] = useState<{ active: boolean, criterionId: number | null }>({ active: false, criterionId: null })
  const [pendingTextSelection, setPendingTextSelection] = useState<{ text: string, page: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRubricId, setExpandedRubricId] = useState<number>(1)
  const [overrideReasoning, setOverrideReasoning] = useState<Record<number, string>>({})
  const [recordingId, setRecordingId] = useState<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const [revisionEvents, setRevisionEvents] = useState<RevisionEvent[]>([])
  const [revisionHistoryOpen, setRevisionHistoryOpen] = useState(false)
  
  // Feedback summary modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [overallFeedback, setOverallFeedback] = useState("")

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

    return { 
      id, 
      name, 
      code: `#${100 + i}`, 
      status, 
      flags, 
      score: gradedSubmissions.includes(id) ? 85 + (i % 10) : 0, 
      reason, 
      category,
      checkpoints 
    }
  })

  const submissions = allSubmissions
  const currentStudent = allSubmissions.find(s => s.id === selectedSubmission)

  const rubricPoints = [
    { id: 1, type: "c1", label: "Problem Understanding & Direction", maxPoints: 10, aiScore: 6, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the problem framing, user/task clarity, assumptions/constraints, outcomes/non-goals, and scoped use-case mapping is present, and 20% of the work has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", levels: [{val: 5, name: "Exceeds expectations", points: 10}, {val: 4, name: "Meets expectations", points: 8}, {val: 3, name: "Meets expectations with fewer issues", points: 6}, {val: 2, name: "Below Expectations", points: 4}, {val: 1, name: "Significant issues identified", points: 2}] },
    { id: 2, type: "c2", label: "Iteration & Improvement", maxPoints: 10, aiScore: 6, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the iteration rationale, before/after evidence, and next-steps articulation is present, and 20% has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", levels: [{val: 5, name: "Exceeds expectations", points: 10}, {val: 4, name: "Meets expectations", points: 8}, {val: 3, name: "Meets expectations with fewer issues", points: 6}, {val: 2, name: "Below Expectations", points: 4}, {val: 1, name: "Significant issues identified", points: 2}] },
    { id: 3, type: "c3", label: "Documentation & Reproducibility", maxPoints: 12, aiScore: 7.2, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the setup/run steps, samples/expected outputs, troubleshooting, and limitations is present, and 20% has issues that need to be addressed.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", levels: [{val: 5, name: "Exceeds expectations", points: 12}, {val: 4, name: "Meets expectations", points: 9.6}, {val: 3, name: "Meets expectations with fewer issues", points: 7.2}, {val: 2, name: "Below Expectations", points: 4.8}, {val: 1, name: "Significant issues identified", points: 2.4}] },
    { id: 4, type: "c4", label: "Technical Setup & Integration", maxPoints: 12, aiScore: 7.2, aiScoreLabel: "Meets expectations with fewer issues", reasoning: "At least 80% of the tool/API integration, config documentation, runnable end-to-end execution, basic error handling, and test path is present, and 20% has issues.", status: "REVIEW_NEEDED", note: "Extraction confidence moderate.", levels: [{val: 5, name: "Exceeds expectations", points: 12}, {val: 4, name: "Meets expectations", points: 9.6}, {val: 3, name: "Meets expectations with fewer issues", points: 7.2}, {val: 2, name: "Below Expectations", points: 4.8}, {val: 1, name: "Significant issues identified", points: 2.4}] }
  ]

  const [criterionState, setCriterionState] = useState<Record<number, { score: number, isOverridden: boolean, feedback: string, confirmed: boolean }>>({})

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
  const handleScoreConfirm = (id: number, aiScore: number) => {
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

  const handleOverrideScore = (id: number, newScore: number) => {
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

  const handleScoreLevelClick = (criterionId: number, proposedScore: number, aiScore: number) => {
    if (proposedScore === aiScore) {
      handleScoreConfirm(criterionId, aiScore)
      setActiveOverrideId(null)
      return
    }
    const direction = proposedScore > aiScore ? 'increase' : 'decrease'
    setActiveOverrideId(criterionId)
    setOverrideDrafts(prev => ({
      ...prev,
      [criterionId]: {
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

  const handleUpdateDraft = (criterionId: number, updates: Partial<OverrideDraft>) => {
    setOverrideDrafts(prev => {
      const existing = prev[criterionId]
      if (!existing) return prev
      return { ...prev, [criterionId]: { ...existing, ...updates } }
    })
  }

  const handleConfirmOverride = (criterionId: number) => {
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
      delete next[criterionId]
      return next
    })
  }

  const handleCancelOverride = (criterionId: number) => {
    setActiveOverrideId(null)
    setTextSelectionMode({ active: false, criterionId: null })
  }

  const handleLinkOverrideEvidence = (text: string, page: number, criterionId: number) => {
    const draft = overrideDrafts[criterionId]
    if (!draft) return
    const newEvidence = { id: `ov-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text, page }
    handleUpdateDraft(criterionId, { linkedEvidence: [...draft.linkedEvidence, newEvidence] })
    setMappedEvidence(prev => [...prev, { id: newEvidence.id, text, criterionId }])
    setSelection(null)
  }

  const handleRemoveOverrideEvidence = (criterionId: number, evidenceId: string) => {
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
  
  const handleFeedbackChange = (id: number, text: string) => {
    setCriterionState(prev => ({ ...prev, [id]: { ...prev[id], feedback: text } }))
  }
  
  const handleDismiss = (id: number) => {
    setDismissedPoints(prev => [...prev, id])
  }

  const [isSpotCheckActive, setIsSpotCheckActive] = useState(false)
  const [activeRubricCriterionIdx, setActiveRubricCriterionIdx] = useState(0)
  const [rubricAccordionOpen, setRubricAccordionOpen] = useState<Record<string, boolean>>({})
  const [rubricReviewStripOpen, setRubricReviewStripOpen] = useState<Record<number, boolean>>({})

  const handleConfirmNext = () => {
    const currentSub = submissions.find(s => s.id === selectedSubmission)
    // Trigger spot check only for "Clear" papers and if not already active
    if (currentSub?.reason === "Clear" && !isSpotCheckActive && Math.random() > 0.5) {
        setIsSpotCheckActive(true)
        return
    }

    setGradedSubmissions(prev => [...prev, selectedSubmission])
    
    // Find next ungraded submission
    const currentIndex = submissions.findIndex(s => s.id === selectedSubmission)
    const nextSub = submissions.slice(currentIndex + 1).find(s => s.status !== "graded") || submissions[0]
    
    setSelectedSubmission(nextSub.id)
    setIsFixed(false)
    setIsSpotCheckActive(false)
    setDismissedPoints([])
    setCurrentPage(1)
    setOverrideDrafts({})
    setActiveOverrideId(null)
    setTextSelectionMode({ active: false, criterionId: null })
  }

  const handleMapEvidence = (criterionId: number) => {
    if (selection) {
      setMappedEvidence(prev => [...prev, { id: Math.random().toString(), text: selection.text, criterionId }])
      setSelection(null)
    }
  }

  const handleToggleRecording = (criterionId: number) => {
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
        className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-[#E6E1D6]/50 mx-auto transition-all duration-300 relative group/page cursor-text"
        onMouseUp={(e) => {
          const sel = window.getSelection()
          if (sel && sel.toString().length > 0) {
              const range = sel.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              setSelection({
                text: sel.toString(),
                x: rect.left + rect.width / 2,
                y: rect.top
              })
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
        <div className="absolute top-8 left-8 flex flex-col items-start gap-1">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40 group-hover/page:text-primary transition-colors">Student Paper</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#E6E1D6] group-hover/page:text-slate-400 transition-colors">Page {index} / {totalPages}</span>
        </div>

        {question && (
             <div className="absolute top-8 right-8 text-[9px] font-black text-amber-500/40 uppercase tracking-widest flex items-center gap-2 group-hover/page:text-amber-500 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="h-full flex flex-col bg-muted/10">
            <header className="p-4 border-b border-border bg-background flex flex-col gap-4 z-10 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <UpcomingStudentsDropdown students={submissions} currentStudentId={selectedSubmission} assignmentId={id} />
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
                          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary text-primary-foreground text-[7px] font-black flex items-center justify-center">{revisionEvents.length}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Revision History</TooltipContent>
                  </Tooltip>

                </div>
              </div>
            </header>
            
            <div className="flex-1 flex overflow-hidden relative">
              <ArtifactSidebar artifacts={artifacts} />
              {/* Text Selection Mode Banner */}
              <AnimatePresence>
                {textSelectionMode.active && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-0 left-0 right-0 z-30 bg-blue-600 text-white p-2 flex items-center justify-center gap-3"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Select text to link as evidence for C{textSelectionMode.criterionId}
                    </span>
                    <button
                      onClick={() => setTextSelectionMode({ active: false, criterionId: null })}
                      className="h-5 w-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
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
                        <span className="text-xs font-black uppercase tracking-[0.5em]">Paper Verified</span>
                      </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Floating Bottom Pagination */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-secondary text-secondary-foreground shadow-2xl z-20 flex items-center gap-6 group transition-all hover:scale-105 border border-border/10 backdrop-blur-md">
                <button 
                  onClick={() => {
                    const next = Math.max(1, currentPage - 1)
                    document.getElementById(`page-${next}`)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="hover:text-primary transition-colors text-secondary-foreground/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 text-xs font-black tracking-widest">
                  <span className="text-primary">PAGE {currentPage}</span>
                  <span className="opacity-30">/</span>
                  <span className="opacity-50">{totalPages}</span>
                </div>
                <button 
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1)
                    document.getElementById(`page-${next}`)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="hover:text-primary transition-colors text-secondary-foreground/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
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
                    <h2 className="text-sm font-black tracking-tight text-foreground">Rubric evaluation</h2>
                    <Badge variant="outline" className="rounded-full text-[10px] font-black px-2 h-5 bg-background">
                      {confirmedCount} of {rubricPoints.length} scored
                    </Badge>
                  </div>
                  <Progress value={(confirmedCount / rubricPoints.length) * 100} className="h-1" />
                  <div className="flex gap-1">
                    {rubricPoints.map((p, idx) => {
                      const done = !!criterionState[p.id]?.confirmed
                      const active = idx === activeRubricCriterionIdx
                      return (
                        <button key={p.id} onClick={() => setActiveRubricCriterionIdx(idx)} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                            done ? 'bg-foreground border-foreground' :
                            active ? 'border-purple-500 bg-white' :
                            'border-border bg-white'
                          }`}>
                            {active && !done && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                          </div>
                          <span className={`text-[8px] font-bold transition-colors ${active ? 'text-foreground' : 'text-muted-foreground/50'}`}>C{p.id}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-3">
                    {point.status === 'REVIEW_NEEDED' && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-3"
                          onClick={() => setRubricReviewStripOpen(prev => ({ ...prev, [point.id]: !prev[point.id] }))}
                        >
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Review needed</span>
                          </div>
                          <ChevronDown className={`h-3.5 w-3.5 text-amber-500 transition-transform ${rubricReviewStripOpen[point.id] ? 'rotate-180' : ''}`} />
                        </button>
                        {rubricReviewStripOpen[point.id] && (
                          <div className="px-3 pb-3">
                            <p className="text-[10px] text-amber-700 leading-relaxed">{point.note}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                      <div className="p-4 space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-foreground leading-tight">{point.label}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">{point.reasoning}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Score</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-foreground tabular-nums">{(state.score ?? point.aiScore).toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">/{point.maxPoints}</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground ml-auto">Adjust:</span>
                          </div>
                          <div className="flex gap-1.5">
                            {point.levels.map(lvl => {
                              const isDraftSelected = isOverride && draft.proposedScore === lvl.points
                              const isCurrentConfirmed = state.confirmed && state.score === lvl.points
                              const isAiDefault = lvl.points === point.aiScore && !state.confirmed && !isOverride
                              return (
                                <button
                                  key={lvl.val}
                                  onClick={() => handleScoreLevelClick(point.id, lvl.points, point.aiScore)}
                                  className={`flex-1 py-2 border rounded-md text-[10px] font-bold transition-all ${
                                    isDraftSelected
                                      ? 'bg-amber-500 text-white border-amber-500'
                                      : isCurrentConfirmed || isAiDefault
                                      ? 'bg-foreground text-background border-foreground'
                                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                                  }`}
                                >
                                  {lvl.points}pts
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {isOverride && (
                          <div className="border border-amber-200 rounded-lg bg-amber-50/50 p-3 space-y-3">
                            <div className={`flex items-center gap-2 ${isIncrease ? 'text-green-700' : 'text-red-700'}`}>
                              {isIncrease ? <ArrowUp className="h-3.5 w-3.5 shrink-0" /> : <ArrowDown className="h-3.5 w-3.5 shrink-0" />}
                              <span className="text-[10px] font-black">
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
                              className="w-full text-[11px] rounded border border-amber-200 bg-white p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-amber-300"
                            >
                              <option value="">Select a reason&hellip;</option>
                              {overrideReasons.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            {draft.reasonCategory === 'found_more_evidence' && (
                              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                                <p className="text-[10px] text-blue-700/80 leading-relaxed mb-2">Highlight text in the manuscript to link as evidence.</p>
                                {draft.linkedEvidence.length > 0 && (
                                  <div className="space-y-1.5 mb-2">
                                    {draft.linkedEvidence.map((ev, i) => (
                                      <div key={ev.id} className="flex items-start gap-2 p-2 rounded bg-white border border-blue-100 group/ev">
                                        <span className="text-[9px] font-mono font-bold text-blue-600 shrink-0">E{i + 1}</span>
                                        <p className="text-[10px] font-serif italic text-foreground/70 flex-1 leading-relaxed">&quot;{ev.text.length > 60 ? ev.text.substring(0, 60) + '...' : ev.text}&quot;</p>
                                        <button onClick={() => handleRemoveOverrideEvidence(point.id, ev.id)} className="opacity-0 group-hover/ev:opacity-100 transition-opacity shrink-0">
                                          <X className="h-3 w-3 text-red-400 hover:text-red-600" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {draft.linkedEvidence.length === 0 && (
                                  <p className="text-[9px] text-blue-500/60 italic">No evidence linked yet</p>
                                )}
                              </div>
                            )}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Explain your override</span>
                                <span className={`text-[9px] font-mono ${draft.reasoning.length >= 20 ? 'text-green-600' : 'text-amber-500'}`}>{draft.reasoning.length}/20</span>
                              </div>
                              <textarea
                                value={draft.reasoning}
                                onChange={e => handleUpdateDraft(point.id, { reasoning: e.target.value })}
                                placeholder={isIncrease ? 'Describe what the AI missed...' : "Explain what's wrong with the AI's interpretation..."}
                                className="w-full h-20 rounded-lg border border-amber-200 bg-white p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-300 text-foreground/80 placeholder:text-xs placeholder:text-muted-foreground/40"
                              />
                            </div>
                            {!isOverrideValid && draft.reasonCategory && (
                              <div className="flex items-center gap-2 p-2 rounded bg-amber-50 border border-amber-200">
                                <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                                <span className="text-[10px] text-amber-700">
                                  {draft.reasoning.length < 20
                                    ? 'At least 20 characters required.'
                                    : draft.reasonCategory === 'found_more_evidence' && draft.linkedEvidence.length === 0
                                    ? 'Link at least one evidence from the manuscript.'
                                    : ''}
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleCancelOverride(point.id)}
                                className="h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted">
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => handleConfirmOverride(point.id)} disabled={!isOverrideValid}
                                className="h-8 flex-1 text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:pointer-events-none">
                                Confirm Override
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Feedback</span>
                          <textarea
                            value={state.feedback || ''}
                            onChange={e => handleFeedbackChange(point.id, e.target.value)}
                            placeholder="Add specific feedback for this criterion..."
                            className="w-full h-20 rounded-lg border border-border bg-muted/5 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground/80 placeholder:text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                      <button
                        onClick={() => setRubricAccordionOpen(prev => ({ ...prev, [`evidence-${point.id}`]: !prev[`evidence-${point.id}`] }))}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Evidence ({pointEvidence.length} linked)
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${rubricAccordionOpen[`evidence-${point.id}`] ? 'rotate-180' : ''}`} />
                      </button>
                      {rubricAccordionOpen[`evidence-${point.id}`] && (
                        <div className="px-4 pb-4 space-y-2">
                          {pointEvidence.length === 0 ? (
                            <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center">
                              <p className="text-[10px] text-purple-400 leading-relaxed">No evidence linked yet &mdash; select text in the left panel to add evidence</p>
                            </div>
                          ) : (
                            pointEvidence.map((ev, i) => (
                              <div key={ev.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border group/ev">
                                <span className="text-[9px] font-mono font-bold text-primary shrink-0">E{i+1}</span>
                                <p className="text-[11px] font-serif italic text-foreground/70 flex-1 leading-relaxed">&quot;{ev.text.length > 80 ? ev.text.substring(0, 80) + '...' : ev.text}&quot;</p>
                                <button onClick={() => setMappedEvidence(prev => prev.filter(e => e.id !== ev.id))} className="opacity-0 group-hover/ev:opacity-100 transition-opacity shrink-0">
                                  <X className="h-3 w-3 text-red-400 hover:text-red-600" />
                                </button>
                              </div>
                            ))
                          )}
                          <button className="w-full border-2 border-dashed border-border rounded-lg p-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
                            + Add evidence
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                      <button
                        onClick={() => setRubricAccordionOpen(prev => ({ ...prev, [`reasoning-${point.id}`]: !prev[`reasoning-${point.id}`] }))}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI reasoning</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${rubricAccordionOpen[`reasoning-${point.id}`] ? 'rotate-180' : ''}`} />
                      </button>
                      {rubricAccordionOpen[`reasoning-${point.id}`] && (
                        <div className="px-4 pb-4 space-y-2">
                          <p className="text-xs font-serif italic text-muted-foreground leading-relaxed">{point.reasoning}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge className="text-[9px] bg-green-50 text-green-700 border-green-200 border shadow-none">{point.aiScoreLabel}</Badge>
                            {point.status === 'REVIEW_NEEDED' && (
                              <Badge className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 border shadow-none">Review needed</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border bg-background shrink-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black tracking-tighter text-foreground tabular-nums">{Math.round((currentTotalScore / totalMaxPoints) * 100)}</span>
                        <span className="text-xs text-muted-foreground font-bold">/ 100</span>
                        <span className="text-[10px] text-muted-foreground/50 ml-1">({currentTotalScore.toFixed(1)}/{totalMaxPoints}pts)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={activeRubricCriterionIdx === 0}
                      onClick={() => setActiveRubricCriterionIdx(i => i - 1)}
                      className="h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground disabled:opacity-30"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScoreConfirm(point.id, state.score ?? point.aiScore)}
                      className="h-9 text-[10px] font-black uppercase tracking-widest border-border"
                    >
                      Save
                    </Button>
                    {isLastCriterion ? (
                      <Button
                        size="sm"
                        disabled={!allConfirmed}
                        onClick={() => {
                          if (!gradedSubmissions.includes(selectedSubmission)) {
                            setGradedSubmissions(prev => [...new Set([...prev, selectedSubmission])])
                          }
                          const nextUngraded = submissions.find(s => !gradedSubmissions.includes(s.id) && s.id !== selectedSubmission)
                          if (nextUngraded) {
                            setSelectedSubmission(nextUngraded.id)
                            setIsFixed(false)
                            setCurrentPage(1)
                          }
                        }}
                        className="h-9 flex-1 text-[10px] font-black uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {allConfirmed ? 'Submit Grade →' : `· ${rubricPoints.length - confirmedCount} remaining`}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setActiveRubricCriterionIdx(i => i + 1)}
                        className="h-9 flex-1 text-[10px] font-black uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90"
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
              <Card className="shadow-[0_40px_100px_-12px_rgba(0,0,0,0.2)] border-border bg-card overflow-hidden rounded-3xl">
                <div className="h-2.5 w-full bg-primary shadow-[0_4px_12px_rgba(var(--primary),0.3)]" />
                <CardContent className="p-16 text-center space-y-8">
                  <div className="p-6 w-fit mx-auto rounded-3xl bg-accent text-primary shadow-inner">
                    <History className="h-10 w-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-serif italic tracking-tight text-foreground">Session Suspended</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed px-4 font-medium italic">"Grading environment securely cached. Your current progress and notes have been preserved."</p>
                  </div>
                  <Button onClick={() => setIsPaused(false)} className="w-full rounded-2xl h-14 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">Resume Academic Review</Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {isSpotCheckActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xl z-[70]"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6"
            >
              <Card className="shadow-2xl border-primary/20 bg-card overflow-hidden rounded-3xl">
                <div className="bg-primary/10 border-b border-primary/10 p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary text-primary-foreground rounded-2xl">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Spot Check Protocol</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">Integrity Verification Required</p>
                  </div>
                </div>
                <CardContent className="p-10 space-y-8">
                  <p className="text-sm text-muted-foreground leading-relaxed italic font-medium">
                    "To maintain Protocol P1 compliance, you must manually verify a randomly selected AI judgment for this submission."
                  </p>
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] uppercase font-black bg-background">Verification Task</Badge>
                        <span className="text-xs font-bold">Review Criterion: Rubric Alignment</span>
                    </div>
                    <p className="text-xs font-serif italic italic font-medium opacity-80">"Does the API documentation accurately reflect the required controller contracts?"</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1 rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest" onClick={() => setIsSpotCheckActive(false)}>Reject Auto-Grade</Button>
                    <Button className="flex-1 rounded-2xl h-14 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => handleConfirmNext()}>Verify Judgment</Button>
                  </div>
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
                className="fixed z-[100] bg-white border border-blue-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-xl p-4 flex flex-col gap-3 w-80 backdrop-blur-md"
                style={{ left: selection.x, top: selection.y, transform: 'translate(-50%, -110%)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Link to C{activeCriterion.id}</span>
                  </div>
                  <span className="text-[9px] font-black text-blue-400 tabular-nums">Page {currentPage}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-[11px] font-serif italic text-foreground/70 leading-relaxed">
                    &ldquo;{selection.text.length > 100 ? selection.text.substring(0, 100) + '...' : selection.text}&rdquo;
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground/60">
                  Link this text as evidence for <span className="font-bold text-blue-700">C{activeCriterion.id} — {activeCriterion.label}</span>?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelection(null)}
                    className="flex-1 p-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted border border-border transition-all"
                  >
                    No, dismiss
                  </button>
                  <button
                    onClick={() => handleLinkOverrideEvidence(selection.text, currentPage, textSelectionMode.criterionId!)}
                    className="flex-1 p-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 transition-all"
                  >
                    Yes, link it
                  </button>
                </div>
              </motion.div>
            )
          }

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed z-[100] bg-white border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-xl p-3 flex flex-col gap-2 w-72 backdrop-blur-md"
              style={{ left: selection.x, top: selection.y, transform: 'translate(-50%, -110%)' }}
            >
              <div className="flex items-center justify-between px-2 pb-2 border-b border-border/80 mb-1">
                <div className="flex items-center gap-2">
                    <LinkIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Link Evidence</span>
                </div>
                <span className="text-[9px] font-black text-primary/40 tabular-nums">Page {currentPage}</span>
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
                        <span className="text-[11px] font-black tracking-tight text-foreground group-hover/btn:text-primary transition-colors">{point.label}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-all text-primary" />
                    </div>
                    <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Criterion {point.id}</span>
                  </div>
                ))}
              </div>
              <Separator className="bg-border/50 my-1" />
              <button 
               onClick={() => setSelection(null)}
               className="w-full text-center p-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                 Dismiss
              </button>
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

