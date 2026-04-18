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
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Redirecting to calibration…</p>
        </div>
      </div>
    )
  }

  const [selectedSubmission, setSelectedSubmission] = useState("STU-102")
  const [isFixed, setIsFixed] = useState(false)
  const [activeTab, setActiveTab] = useState<"rubric" | "feedback" | "integrity">("rubric")
  const [triageFilter, setTriageFilter] = useState<"all" | "critical" | "focus" | "verified">("all")
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
  const [rephrasingId, setRephrasingId] = useState<number | null>(null)
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

  const submissions = allSubmissions.filter(s => {
    const matchesFilter = triageFilter === "all" || s.category === triageFilter
    const matchesSearch = !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })
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
    const nextPoint = rubricPoints.find(p => p.id > id)
    if (nextPoint) setExpandedRubricId(nextPoint.id)
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

  const handleRephrase = async (criterionId: number) => {
    const text = criterionState[criterionId]?.feedback
    if (!text?.trim()) return
    setRephrasingId(criterionId)
    try {
      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      if (data.rephrased) {
        setCriterionState(prev => ({ ...prev, [criterionId]: { ...prev[criterionId], feedback: data.rephrased } }))
      }
    } finally {
      setRephrasingId(null)
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
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40 group-hover/page:text-primary transition-colors">Digital Manuscript</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#E6E1D6] group-hover/page:text-slate-400 transition-colors">Folio {index} / {totalPages}</span>
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
        {/* Left Panel: Triage Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} className="bg-muted/5">
          <div className="flex flex-col h-full border-r border-border">
             <div className="p-4 border-b border-border space-y-4">
               <div className="flex items-center justify-between">
                 <h2 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">Triage Sidebar</h2>
                 <div className="flex flex-col items-end gap-1">
                   <Badge variant="outline" className="rounded-full bg-background border-border text-[10px] font-black">
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
                <button 
                  onClick={() => setTriageFilter("all")}
                  className={`py-1 rounded-md text-[9px] font-black uppercase transition-all ${triageFilter === 'all' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/40'}`}
                >ALL</button>
                <button 
                  onClick={() => setTriageFilter("critical")}
                  className={`py-1 rounded-md text-[9px] font-black uppercase transition-all ${triageFilter === 'critical' ? 'bg-red-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-background/40'}`}
                >CRIT</button>
                <button 
                  onClick={() => setTriageFilter("focus")}
                  className={`py-1 rounded-md text-[9px] font-black uppercase transition-all ${triageFilter === 'focus' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-background/40'}`}
                >FOCUS</button>
                <button 
                  onClick={() => setTriageFilter("verified")}
                  className={`py-1 rounded-md text-[9px] font-black uppercase transition-all ${triageFilter === 'verified' ? 'bg-green-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-background/40'}`}
                >VERI</button>
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
                  <button
                    onClick={() => {
                      setGradedSubmissions(prev => [...new Set([...prev, ...pendingVerified.map(s => s.id)])])
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white transition-all group/bulk"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bulk Approve All</span>
                    </div>
                    <span className="text-[10px] font-black bg-white/20 group-hover/bulk:bg-white/30 transition-colors px-2 py-0.5 rounded-full tabular-nums">
                      {pendingVerified.length}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 border border-green-200/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-700">All Verified Approved</span>
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
                           <CheckCircle2 className="h-3 w-3 text-green-500" />
                         ) : (
                           <div className={`w-1.5 h-1.5 rounded-full ${
                               sub.category === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                               sub.category === 'focus' ? 'bg-amber-500' : 'bg-green-500'
                           }`} />
                         )}
                         <span className={`font-bold tracking-tight text-[11px] uppercase tracking-widest ${selectedSubmission === sub.id ? 'text-primary' : 'text-foreground/70'} ${gradedSubmissions.includes(sub.id) ? 'line-through opacity-60' : ''}`}>{sub.name}</span>
                         {selectedSubmission === sub.id && !gradedSubmissions.includes(sub.id) && <Sparkles className="h-2.5 w-2.5 text-primary" />}
                         {gradedSubmissions.includes(sub.id) && <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Done</span>}
                       </div>
                       <div className="flex items-center gap-2 ml-3.5">
                         <span className="text-[9px] font-black text-muted-foreground/40 tabular-nums">{sub.code}</span>
                         {!gradedSubmissions.includes(sub.id) && (
                           <>
                             <span className="text-[10px] opacity-40">•</span>
                             <Tooltip>
                                 <TooltipTrigger>
                                     <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${
                                         (Object.values(sub.checkpoints).filter(Boolean).length) <= 2 ? 'bg-red-50 text-red-600' :
                                         (Object.values(sub.checkpoints).filter(Boolean).length) <= 4 ? 'bg-amber-50 text-amber-600' :
                                         'bg-primary/5 text-primary'
                                     }`}>
                                         Checkpoints: {Object.values(sub.checkpoints).filter(Boolean).length}/5
                                     </span>
                                 </TooltipTrigger>
                                  <TooltipContent 
                                    side="right"
                                    className="bg-popover text-popover-foreground border border-border shadow-xl p-3 space-y-2 min-w-[140px]"
                                  >
                                      <div className="text-[10px] font-black uppercase tracking-widest text-popover-foreground/70 border-b border-border/50 pb-1.5 mb-1.5">
                                          Checkpoints
                                      </div>
                                      <div className="space-y-1">
                                          {Object.entries(sub.checkpoints).map(([key, passed]) => (
                                              <div key={key} className="flex items-center justify-between gap-4 text-[11px]">
                                                  <span className="text-popover-foreground/80 capitalize">{key}</span>
                                                  <span className={passed ? 'text-green-600' : 'text-red-500'}>
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
                           <Badge variant="destructive" className="h-5 px-1.5 rounded-md text-[9px] font-black">
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
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 mb-0.5">Authoring Identity</span>
                    <h2 className="text-sm font-black tracking-tight text-foreground uppercase">{currentStudent?.name || "Evaluating..."}</h2>
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
                        <span className="text-xs font-black uppercase tracking-[0.5em]">Manuscript Verified</span>
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
          <div className="h-full flex flex-col border-l border-border bg-background overflow-hidden">
            <div className="p-6 border-b border-border bg-white shrink-0">
               <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-sm font-black tracking-tight text-foreground">Grading Panel</h2>
                 </div>
               </div>
            </div>
            
            <ScrollArea className="flex-1 min-h-0 bg-[#FAFAFA]">
              <div className="p-6 space-y-8">
                {/* Rubric Annotations Section */}
                <div className="space-y-6">
                      {rubricPoints.map((point) => {
                          const state = criterionState[point.id] || { score: null, isOverridden: false, feedback: "", confirmed: false }
                          const currentScore = state.score != null ? state.score : (point?.aiScore ?? 0)
                          const isExpanded = expandedRubricId === point.id
                          const c = CRITERION_COLORS[point.id] ?? CRITERION_COLORS[1]

                          return (
                        <div key={point.id} className="relative bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                           {/* Accordion Header */}
                           <button
                             onClick={() => setExpandedRubricId(isExpanded ? -1 : point.id)}
                             className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                           >
                             <div className="flex items-center gap-3 min-w-0">
                               <div className={`h-2 w-2 rounded-full shrink-0 ${c.dot}`} />
                               <span className="text-sm font-bold text-foreground truncate">C{point.id} — {point.label}</span>
                               {state.confirmed && (
                                 <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                               )}
                             </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                {!isExpanded && (
                                  <div className="flex flex-col items-end">
                                     <span className={`text-[10px] font-black ${c.label}`}>{(currentScore ?? 0).toFixed(1)} pts</span>
                                    {state.isOverridden && (
                                      <span className="text-[8px] text-muted-foreground/40">was {point.aiScore} pts (AI)</span>
                                    )}
                                  </div>
                                )}
                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                           </button>

                           <AnimatePresence initial={false}>
                           {isExpanded && (
                           <motion.div
                             key="content"
                             initial={{ height: 0 }}
                             animate={{ height: "auto" }}
                             exit={{ height: 0 }}
                             transition={{ duration: 0.2, ease: "easeInOut" }}
                             className="overflow-hidden"
                           >
                           <div className="border-t border-border/50">
                           <div className="p-6 pb-4">
                              <div className="flex items-center gap-3 mb-6">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SCORE</span>
                                   <Badge className="bg-green-50 text-green-700 border-green-200 border rounded-sm uppercase text-[9px] tracking-widest font-black shadow-none">{point.status}</Badge>
                               </div>

                               <div className="space-y-2 mb-6">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Criterion Score: <span className="text-foreground">{(currentScore ?? 0).toFixed(1)}</span> / {point.maxPoints}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {point.levels.map(lvl => {
                                          const isActive = activeOverrideId === point.id && overrideDrafts[point.id]?.proposedScore === lvl.points
                                          const isAiScore = lvl.points === point.aiScore
                                          return (
                                             <button 
                                               key={lvl.val}
                                               onClick={(e) => {
                                                 e.stopPropagation()
                                                 handleScoreLevelClick(point.id, lvl.points, point.aiScore)
                                               }}
                                              className={`flex-1 py-2 px-2 border rounded-md text-[10px] font-bold transition-all text-center leading-tight ${
                                                  isActive
                                                  ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-500/30'
                                                  : isAiScore && activeOverrideId !== point.id
                                                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                  : isAiScore && activeOverrideId === point.id
                                                  ? 'border-primary/40 bg-primary/10 text-primary'
                                                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                                              }`}
                                            >
                                                <div className="mb-1">{lvl.points} pts</div>
                                                <div className="text-[9px] opacity-80 font-medium leading-tight">{lvl.name}</div>
                                            </button>
                                        )})}
                                    </div>
                                </div>

                               <div className="space-y-4 mb-6">
                                  <div className="flex items-center justify-between border-b pb-2 border-border/50">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Evidence</span>
                                      <Badge variant="outline" className="rounded-full text-[10px] font-medium h-5 px-2 bg-muted/30">
                                          {mappedEvidence.filter(e => e.criterionId === point.id).length + 1} item{mappedEvidence.filter(e => e.criterionId === point.id).length !== 0 ? 's' : ''}
                                      </Badge>
                                  </div>
                                  
                                   {/* AI Default Evidence Block */}
                                   {(() => { const c = CRITERION_COLORS[point.id] ?? CRITERION_COLORS[1]; return (
                                   <div className={`p-4 rounded-lg ${c.cardBg} border ${c.cardBorder} relative group/ev`}>
                                       <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar} rounded-l-lg`} />
                                       <div className="flex gap-3">
                                           <div className={`h-6 w-6 rounded bg-white border ${c.cardBorder} shadow-sm flex items-center justify-center text-[10px] font-mono ${c.label} shrink-0`}>E1</div>
                                           <div className="space-y-1.5 flex-1">
                                               <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">"{manuscript.pages.flatMap(p => p.elements).filter(e => e.type === 'paragraph' && e.highlight && e.highlight.criterionId === point.id).map(e => e.type === 'paragraph' ? e.text : '')[0]?.substring(0, 80) || 'No AI evidence extracted'}..."</p>
                                               <div className="flex items-center gap-2">
                                                   <span className={`text-[9px] font-bold ${c.label} uppercase tracking-widest`}>L{point.aiScore} - {point.aiScoreLabel}</span>
                                                   <span className="text-[9px] font-bold text-muted-foreground/40 italic uppercase tracking-widest">AI extracted</span>
                                               </div>
                                           </div>
                                       </div>
                                   </div>
                                   ); })()}

                                  {/* User Mapped Evidence Fragments */}
                                  {mappedEvidence.filter(e => e.criterionId === point.id).map((ev, i) => {
                                     const c = CRITERION_COLORS[point.id] ?? CRITERION_COLORS[1]
                                     return (
                                     <div key={ev.id} className={`p-4 rounded-lg ${c.cardBg} border ${c.cardBorder} border-dashed relative group/ev`}>
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar} rounded-l-lg opacity-60`} />
                                        <div className="flex gap-3">
                                            <div className={`h-6 w-6 rounded bg-white border ${c.cardBorder} shadow-sm flex items-center justify-center text-[10px] font-mono ${c.label} shrink-0`}>U{i+1}</div>
                                            <div className="space-y-1.5 flex-1">
                                                <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">"{ev.text}"</p>
                                                <div className="flex items-center justify-between">
                                                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${c.label} opacity-70`}>
                                                        <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4v2.5l1.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                                        Mapped by you
                                                    </span>
                                                    <button onClick={() => setMappedEvidence(prev => prev.filter(e => e.id !== ev.id))} className="text-[9px] font-black uppercase text-red-500 opacity-0 group-hover/ev:opacity-100 transition-opacity hover:underline">Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                  )})}
                                  <div className="flex justify-end pt-1">
                                      <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">+ Add evidence</button>
                                  </div>
                              </div>

                              <div className="space-y-3 mb-6">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block border-b pb-2 border-border/50">Reasoning</span>
                                  <div className="p-4 rounded-lg bg-white border border-border/50 text-xs italic font-medium text-muted-foreground leading-relaxed relative group/reasoning hover:border-primary/20 transition-colors">
                                      {point.reasoning}
                                      <Edit2 className="absolute right-3 bottom-3 h-3 w-3 text-muted-foreground/30 opacity-0 group-hover/reasoning:opacity-100 transition-opacity cursor-pointer hover:text-primary" />
                                  </div>
                              </div>

                               <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleScoreConfirm(point.id, point.aiScore)
                                          handleCancelOverride(point.id)
                                        }}
                                       className={`h-9 px-4 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm transition-all flex items-center ${
                                           state.confirmed && !state.isOverridden
                                           ? 'bg-foreground text-background pointer-events-none'
                                           : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                       }`}
                                   >
                                       {state.confirmed && !state.isOverridden ? <><CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Confirmed AI score</> : '✓ Confirm AI score'}
                                   </Button>
                                   {activeOverrideId === point.id && (
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => handleCancelOverride(point.id)}
                                       className="h-9 px-3 rounded-md text-[10px] font-black uppercase tracking-widest border text-muted-foreground hover:bg-accent border-transparent hover:border-border"
                                     >
                                       Cancel
                                     </Button>
                                   )}
                               </div>

                               <AnimatePresence>
                                 {activeOverrideId === point.id && overrideDrafts[point.id] && (() => {
                                   const draft = overrideDrafts[point.id]
                                   const delta = Math.abs(draft.proposedScore - draft.aiScore)
                                   const isIncrease = draft.direction === 'increase'
                                   const aiEvidence = manuscript.pages.flatMap(p => p.elements).filter(e => e.type === 'paragraph' && e.highlight && e.highlight.criterionId === point.id).map(e => e.type === 'paragraph' ? e.text : '')[0] || ''
                                   const reasons = isIncrease ? INCREASE_REASONS : DECREASE_REASONS
                                   const isValid = draft.reasoning.length >= 20 && (draft.reasonCategory !== 'found_more_evidence' || draft.linkedEvidence.length > 0)
                                   return (
                                     <motion.div
                                        key={`override-panel-${point.id}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                       <div className="mt-4 pt-4 border-t border-amber-100 space-y-4">
                                         {/* Delta Banner */}
                                         <div className={`flex items-center gap-2 p-3 rounded-lg ${isIncrease ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                           {isIncrease ? <ArrowUp className="h-4 w-4 text-green-600" /> : <ArrowDown className="h-4 w-4 text-red-600" />}
                                           <span className={`text-[11px] font-black ${isIncrease ? 'text-green-700' : 'text-red-700'}`}>
                                             Proposing {draft.proposedScore}pts ({isIncrease ? '↑' : '↓'}{delta.toFixed(1)} from AI's {draft.aiScore}pts)
                                           </span>
                                         </div>

                                         {/* AI Evidence Context */}
                                         <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">AI's Assessment &amp; Evidence</span>
                                           <p className="text-xs font-serif italic text-foreground/70 leading-relaxed">
                                             "{aiEvidence.substring(0, 150)}{aiEvidence.length > 150 ? '...' : ''}"
                                           </p>
                                           <div className="flex items-center gap-2 mt-2">
                                             <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">AI scored: {draft.aiScore}pts</span>
                                             <span className="text-[9px] text-muted-foreground/30">—</span>
                                             <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{point.aiScoreLabel}</span>
                                           </div>
                                         </div>

                                         {/* Direction-specific guidance */}
                                         <div className={`p-3 rounded-lg ${isIncrease ? 'bg-amber-50 border border-amber-200' : 'bg-amber-50 border border-amber-200'}`}>
                                           <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-1">
                                             {isIncrease ? 'Why higher?' : 'Why lower?'}
                                           </span>
                                           <p className="text-[10px] text-amber-800/70 leading-relaxed">
                                             {isIncrease
                                               ? 'Based on current evidence, the AI assigned this score. To justify a higher score, add more evidence or explain what the AI missed.'
                                               : 'The AI found evidence supporting this score. Tell us what\'s wrong — is the evidence misinterpreted, incorrect, or are there quality issues?'}
                                           </p>
                                         </div>

                                         {/* Reason Selector */}
                                         <div className="space-y-2">
                                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Select a reason</span>
                                           <div className="flex flex-col gap-1.5">
                                             {reasons.map(reason => (
                                               <button
                                                 key={reason.value}
                                                 onClick={() => {
                                                   handleUpdateDraft(point.id, { reasonCategory: reason.value })
                                                   if (reason.value === 'found_more_evidence') {
                                                     setTextSelectionMode({ active: true, criterionId: point.id })
                                                   } else {
                                                     setTextSelectionMode({ active: false, criterionId: null })
                                                   }
                                                 }}
                                                 className={`w-full text-left p-2.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-2 ${
                                                   draft.reasonCategory === reason.value
                                                   ? 'bg-amber-50 border border-amber-300 text-amber-800'
                                                   : 'bg-white border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                 }`}
                                               >
                                                 <div className={`h-3 w-3 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                                   draft.reasonCategory === reason.value
                                                   ? 'border-amber-500'
                                                   : 'border-border'
                                                 }`}>
                                                   {draft.reasonCategory === reason.value && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                                                 </div>
                                                 {reason.label}
                                               </button>
                                             ))}
                                           </div>
                                         </div>

                                         {/* Conditional: Text Selection Mode */}
                                         {draft.reasonCategory === 'found_more_evidence' && (
                                           <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                             <div className="flex items-center gap-2 mb-2">
                                               <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
                                               <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Select text from manuscript</span>
                                             </div>
                                             <p className="text-[10px] text-blue-700/70 leading-relaxed mb-3">
                                               Highlight text in the manuscript on the left to link it as supporting evidence for this higher score.
                                             </p>
                                             {draft.linkedEvidence.length > 0 && (
                                               <div className="space-y-1.5">
                                                 {draft.linkedEvidence.map((ev, i) => (
                                                   <div key={ev.id} className="flex items-start gap-2 p-2 rounded bg-white border border-blue-100 group/ev">
                                                     <span className="text-[9px] font-mono font-bold text-blue-600 shrink-0">E{i + 2}</span>
                                                     <p className="text-[10px] font-serif italic text-foreground/70 leading-relaxed flex-1">"{ev.text.length > 80 ? ev.text.substring(0, 80) + '...' : ev.text}"</p>
                                                     <button
                                                       onClick={() => handleRemoveOverrideEvidence(point.id, ev.id)}
                                                       className="shrink-0 opacity-0 group-hover/ev:opacity-100 transition-opacity"
                                                     >
                                                       <X className="h-3 w-3 text-red-400 hover:text-red-600" />
                                                     </button>
                                                   </div>
                                                 ))}
                                               </div>
                                             )}
                                             {draft.linkedEvidence.length === 0 && (
                                               <p className="text-[9px] text-blue-600/50 italic">No evidence linked yet — select text from the manuscript</p>
                                             )}
                                           </div>
                                         )}

                                         {/* Conditional: OCR File Upload */}
                                         {draft.reasonCategory === 'ocr_issue' && (
                                           <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                                             <div className="flex items-center gap-2 mb-2">
                                               <Upload className="h-3.5 w-3.5 text-orange-600" />
                                               <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">Upload correction</span>
                                             </div>
                                             <p className="text-[10px] text-orange-700/70 leading-relaxed mb-3">
                                               Upload a clearer scan or corrected text to replace the OCR extraction.
                                             </p>
                                             <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50/50 transition-colors">
                                               <Upload className="h-5 w-5 text-orange-400 mb-1" />
                                               <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Click to browse or drag file</span>
                                               <span className="text-[8px] text-orange-400/60 mt-0.5">PDF, PNG, JPG, or TXT</span>
                                               <input
                                                 type="file"
                                                 className="hidden"
                                                 accept=".pdf,.png,.jpg,.jpeg,.txt"
                                                 onChange={(e) => {
                                                   const file = e.target.files?.[0]
                                                   if (file) {
                                                     handleUpdateDraft(point.id, {
                                                       ocrFile: { name: file.name, size: `${(file.size / 1024).toFixed(1)}KB` }
                                                     })
                                                   }
                                                 }}
                                               />
                                             </label>
                                             {draft.ocrFile && (
                                               <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded border border-orange-100">
                                                 <Upload className="h-3 w-3 text-orange-500" />
                                                 <span className="text-[10px] font-medium text-orange-700">{draft.ocrFile.name}</span>
                                                 <span className="text-[9px] text-orange-400">({draft.ocrFile.size})</span>
                                                 <button onClick={() => handleUpdateDraft(point.id, { ocrFile: undefined })} className="ml-auto">
                                                   <X className="h-3 w-3 text-red-400 hover:text-red-600" />
                                                 </button>
                                               </div>
                                             )}
                                           </div>
                                         )}

                                         {/* Reasoning Textarea */}
                                         <div className="space-y-2">
                                           <div className="flex items-center justify-between">
                                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Explain your assessment</span>
                                             <span className={`text-[9px] font-mono ${draft.reasoning.length >= 20 ? 'text-green-600' : 'text-amber-500'}`}>
                                               {draft.reasoning.length}/20 min chars
                                             </span>
                                           </div>
                                           <textarea
                                             value={draft.reasoning}
                                             onChange={e => handleUpdateDraft(point.id, { reasoning: e.target.value })}
                                             placeholder={isIncrease
                                               ? "Describe what the AI missed or underestimated in this criterion..."
                                               : "Explain what's wrong with the evidence or AI's interpretation..."}
                                             className="w-full h-24 rounded-lg border border-amber-200 bg-amber-50/20 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/30 resize-none text-foreground/80 placeholder:text-xs placeholder:text-muted-foreground/40"
                                           />
                                         </div>

                                         {/* Validation warning */}
                                         {!isValid && draft.reasonCategory && (
                                           <div className="flex items-center gap-2 p-2 rounded bg-amber-50 border border-amber-200">
                                             <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                             <span className="text-[10px] text-amber-700">
                                               {draft.reasoning.length < 20
                                                 ? 'Please provide at least 20 characters of reasoning.'
                                                 : draft.reasonCategory === 'found_more_evidence' && draft.linkedEvidence.length === 0
                                                 ? 'Please select at least one evidence from the manuscript.'
                                                 : ''}
                                             </span>
                                           </div>
                                         )}

                                         {/* Actions */}
                                         <div className="flex items-center gap-3 pt-1">
                                           <Button
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => handleCancelOverride(point.id)}
                                             className="h-9 px-4 rounded-md text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted"
                                           >
                                             Cancel
                                           </Button>
                                           <Button
                                             size="sm"
                                             onClick={() => handleConfirmOverride(point.id)}
                                             disabled={!isValid}
                                             className="h-9 px-4 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:pointer-events-none"
                                           >
                                             Confirm Override
                                           </Button>
                                         </div>
                                       </div>
                                     </motion.div>
                                   )
                                 })()}
                               </AnimatePresence>
                           </div>
                           
                           {/* Feedback Area */}
                           <div className="bg-muted/10 p-6 border-t border-border/60">
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3">Feedback for this criterion</span>
                              <textarea 
                                  value={state.feedback}
                                  onChange={(e) => handleFeedbackChange(point.id, e.target.value)}
                                  placeholder="Add specific feedback for student on this criterion..."
                                  className="w-full h-24 rounded-lg border border-border bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-serif italic text-foreground/80 mb-4 placeholder:font-sans placeholder:not-italic placeholder:text-xs"
                              />
                              <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleRecording(point.id)}
                                    className={`h-7 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${recordingId === point.id ? 'bg-red-50 text-red-600 border-red-200' : 'text-foreground bg-white hover:bg-muted'}`}
                                  >
                                    {recordingId === point.id ? (
                                      <span className="flex items-center gap-1.5">
                                        <span className="flex gap-0.5 items-end h-3">
                                          {[1,2,3,4,3,2,1].map((h, i) => (
                                            <span key={i} className="w-0.5 bg-red-500 rounded-full animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }} />
                                          ))}
                                        </span>
                                        Stop
                                      </span>
                                    ) : (
                                      <><div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2" /> Record</>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRephrase(point.id)}
                                    disabled={rephrasingId === point.id || !criterionState[point.id]?.feedback?.trim()}
                                    className="h-7 text-[9px] font-black uppercase tracking-widest rounded-md text-primary bg-primary/5 hover:bg-primary/10 border-none disabled:opacity-40"
                                  >
                                    {rephrasingId === point.id ? (
                                      <><span className="mr-1.5 h-3 w-3 border border-primary border-t-transparent rounded-full animate-spin inline-block" /> Rephrasing…</>
                                    ) : (
                                      <><Sparkles className="h-3 w-3 mr-1.5" /> Rephrase</>
                                    )}
                                  </Button>
                              </div>
                           </div>
                           <div className="bg-white border-t border-border/60 p-4">
                                <label className="flex items-center gap-3 cursor-pointer group/label w-fit">
                                    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${dismissedPoints.includes(point.id) ? 'bg-primary border-primary' : 'border-border bg-white group-hover/label:border-primary/50'}`}>
                                        {dismissedPoints.includes(point.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/70 group-hover/label:text-foreground transition-colors select-none" onClick={() => {
                                        if (dismissedPoints.includes(point.id)) {
                                            setDismissedPoints(prev => prev.filter(id => id !== point.id))
                                        } else {
                                            setDismissedPoints(prev => [...prev, point.id])
                                        }
                                    }}>Mark as reviewed</span>
                                </label>
                           </div>
                           </div>
                           </motion.div>
                           )}
                           </AnimatePresence>
                        </div>
                      )})}
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-background shadow-[0_-12px_40px_rgba(0,0,0,0.03)] shrink-0 z-10 w-full relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Final Evaluation Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tighter text-foreground">{Math.round((currentTotalScore / totalMaxPoints) * 100)}</span>
                      <span className="text-sm font-bold text-muted-foreground/50">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Raw Score</p>
                    <span className="text-sm font-bold text-muted-foreground">{currentTotalScore.toFixed(1)} / {totalMaxPoints}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextUngraded = submissions.find(s => !gradedSubmissions.includes(s.id) && s.id !== selectedSubmission)
                      if (nextUngraded) {
                        setSelectedSubmission(nextUngraded.id)
                        setIsFixed(false)
                        setCurrentPage(1)
                      }
                    }}
                    className="flex-1 rounded-md h-12 border-border text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-muted hover:text-foreground"
                  >
                    Review Later
                  </Button>
                  <Button 
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
                    className="flex-1 rounded-md h-12 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-primary/90"
                  >
                    {gradedSubmissions.includes(selectedSubmission) ? 'Already Completed ✓' : 'Submit Grade →'}
                  </Button>
                </div>
            </div>
          </div>
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
                    <p className="text-muted-foreground text-sm leading-relaxed px-4 font-medium italic">"Evaluation environment securely cached. Your current calibration metrics and annotations have been preserved in absolute state."</p>
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
                  <span className="text-[9px] font-black text-blue-400 tabular-nums">Folio {currentPage}</span>
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
                <span className="text-[9px] font-black text-primary/40 tabular-nums">Folio {currentPage}</span>
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

