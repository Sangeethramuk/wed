"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import {
  X, Mic, MicOff, Sparkles, ChevronDown, ChevronLeft,
  Copy, RotateCcw, Star, Check, CheckCircle2, ArrowUpRight, Pencil,
  Scan, Palette, Search, Bell, User
} from "lucide-react"

interface CriterionFeedback {
  id: number
  label: string
  score: number
  maxPoints: number
  feedback: string
  isOverridden: boolean
  aiScore: number
}

interface FeedbackSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (overallFeedback: string) => void
  studentName: string
  criteria: CriterionFeedback[]
  totalScore: number
  maxScore: number
}

interface FeedbackDoc {
  performanceSnapshot: string
  strengths: string[]
  improvementFocus: string[]
  closingNote: string
}

type Authorship = 'ai' | 'ai_instructor' | 'instructor'
type LengthMode = 'standard' | 'detailed'
type Tone = 'softer' | 'stronger' | 'standard'

function getCriterionStatus(score: number, max: number) {
  const pct = score / max
  if (pct >= 0.8) return { label: 'Meeting Expectations', color: 'text-green-600', bg: 'bg-green-50/60', dot: 'bg-green-500' }
  if (pct >= 0.6) return { label: 'Approaching Expectations', color: 'text-amber-600', bg: 'bg-amber-50/60', dot: 'bg-amber-500' }
  if (pct >= 0.4) return { label: 'Significant Gap', color: 'text-orange-600', bg: 'bg-orange-50/60', dot: 'bg-orange-500' }
  return { label: 'Critical Gap', color: 'text-red-600', bg: 'bg-red-50/60', dot: 'bg-red-500' }
}

function getPerformanceLevel(pct: number) {
  if (pct >= 90) return { label: 'Excellent', color: 'text-green-600' }
  if (pct >= 75) return { label: 'Good', color: 'text-blue-600' }
  if (pct >= 60) return { label: 'Satisfactory', color: 'text-amber-600' }
  return { label: 'Needs Improvement', color: 'text-red-600' }
}

function synthesizeFeedback(
  studentName: string, 
  criteria: CriterionFeedback[], 
  percentage: number, 
  mode: LengthMode = 'standard',
  tone: Tone = 'standard'
): FeedbackDoc {
  const firstName = studentName.split(' ')[0]
  const isBorderline = percentage >= 50 && percentage < 65
  const isLow = percentage < 50
  
  const strengths = criteria.filter(c => c.score / c.maxPoints >= 0.75).map(c => c.label)
  const gaps = criteria.filter(c => c.score / c.maxPoints < 0.6).map(c => c.label)

  // 1. Performance Snapshot
  let snapshot = ""
  if (isLow) {
    snapshot = `${firstName}'s submission did not meet several core requirements, resulting in a score of ${percentage}/100.`
  } else if (isBorderline) {
    snapshot = `${firstName} achieved a passing score of ${percentage}/100, though significant gaps remain in core technical areas.`
  } else {
    snapshot = `${firstName} has delivered a ${percentage >= 85 ? 'high-quality' : 'solid'} effort, scoring ${percentage}/100 across the rubric.`
  }
  
  if (mode === 'detailed') {
    snapshot += ` The evaluation reveals a ${percentage >= 75 ? 'consistent' : 'developing'} pattern of performance across the ${criteria.length} assessed criteria. By examining the submission's structure and the depth of analysis provided, it's clear that the student has engaged seriously with the module's core objectives, though the precision of evidence varies across sections.`
  }

  // 2. Strengths
  let finalStrengths = strengths.length > 0 ? strengths : ["Engagement with the assignment goals"]
  if (mode === 'standard') finalStrengths = finalStrengths.slice(0, 2)
  if (mode === 'detailed') {
    finalStrengths = finalStrengths.map(s => `${s} — The work in this area shows a high degree of technical accuracy and aligns well with the professional standards expected at this level. Continuing to apply this level of rigour will be beneficial for future tasks.`)
  }

  // 3. Improvement Focus
  let improvements: string[] = []
  if (isLow || isBorderline) {
    improvements = gaps.length > 0 ? gaps.map(g => `Address the critical requirements identified in ${g}.`) : [
      `Review core concepts to ensure all rubric requirements are addressed.`,
      `Provide specific evidence for each claim to meet technical expectations.`
    ]
  } else {
    improvements = gaps.length > 0 ? gaps.map(g => `Refine the approach to ${g} to reach the next performance tier.`) : [
      `Explore advanced applications to reach the next performance tier.`,
      `Refine structural clarity for even greater impact.`
    ]
  }
  
  if (mode === 'standard') improvements = improvements.slice(0, 2)
  if (mode === 'detailed') {
    improvements = improvements.map(i => `${i} Specifically, look at the transition between theory and application to ensure that your arguments are fully supported by the data provided in the prompt. This will help bridge the gap between satisfactory and excellent performance.`)
  }

  // 4. Closing Note
  let closing = ""
  if (isLow) {
    closing = "Please review the gaps above and reach out for a consultation before the next submission."
  } else if (isBorderline) {
    closing = "Focusing on the improvement areas highlighted will help stabilize your performance."
  } else {
    closing = `Great work, ${firstName}. Keep pushing this level of detail in future modules.`
  }
  
  if (mode === 'detailed') {
    closing += " Your commitment to the learning objectives is evident, and addressing the specific feedback provided in the sections above will be instrumental to your continued academic growth and professional development. Don't hesitate to revisit the course materials for a deeper dive into the more complex topics."
  }

  // Tone adjustments (Simulated for prototype)
  if (tone === 'softer') {
    snapshot = "I appreciate the effort put into this submission. " + snapshot
    closing = "I'm looking forward to seeing your growth. " + closing
  } else if (tone === 'stronger') {
    snapshot = snapshot + " Precision and rigor must be improved."
    closing = "Rigorous attention to the rubric is essential for success."
  }

  return {
    performanceSnapshot: snapshot,
    strengths: finalStrengths,
    improvementFocus: improvements,
    closingNote: closing,
  }
}

export function FeedbackSummaryModal({ isOpen, onClose, onSubmit, studentName, criteria, totalScore, maxScore }: FeedbackSummaryModalProps) {
  const { state } = useSidebar()
  const sidebarWidth = state === "expanded" ? "16rem" : "3rem"
  const percentage = Math.round((totalScore / maxScore) * 100)
  const perf = getPerformanceLevel(percentage)
  const initialDoc = useCallback(() => synthesizeFeedback(studentName, criteria, percentage), [studentName, criteria, percentage])

  const [doc, setDoc] = useState<FeedbackDoc>(initialDoc)
  const [originalDoc] = useState<FeedbackDoc>(initialDoc)
  const [authorship, setAuthorship] = useState<Authorship>('ai')
  const [lengthMode, setLengthMode] = useState<LengthMode>('standard')
  const [tone, setTone] = useState<Tone>('standard')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [instructorNote, setInstructorNote] = useState('')
  const [noteIncluded, setNoteIncluded] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [history, setHistory] = useState<FeedbackDoc[]>([])
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const d = synthesizeFeedback(studentName, criteria, percentage, lengthMode, tone)
    setDoc(d)
    setAuthorship('ai')
    setInstructorNote('')
    setNoteIncluded(false)
    setExpandedIds(new Set())
    setHistory([])
    setEditingSection(null)
    setIsSubmitting(false)
    setShowToast(false)
  }, [isOpen, studentName, lengthMode, tone])

  const pushHistory = (current: FeedbackDoc) => setHistory(h => [...h.slice(-9), current])

  const updateSection = (key: keyof FeedbackDoc, value: string | string[]) => {
    pushHistory(doc)
    setDoc(prev => ({ ...prev, [key]: value }))
    setAuthorship('instructor')
  }

  const undoLast = () => {
    if (history.length === 0) return
    setDoc(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
    setAuthorship(history.length === 1 ? 'ai' : 'instructor')
  }

  const revertToAI = () => {
    pushHistory(doc)
    setDoc(originalDoc)
    setAuthorship('ai')
    setNoteIncluded(false)
  }

  const includeNote = () => {
    if (!instructorNote.trim()) return
    setNoteIncluded(true)
    setAuthorship('ai_instructor')
  }

  const handleCopy = () => {
    const text = [
      instructorNote.trim() && noteIncluded ? `[Instructor Feedback]\n${instructorNote}\n` : '',
      `[AI Draft Summary]\n`,
      doc.performanceSnapshot,
      '\nStrengths:\n' + doc.strengths.map(s => `• ${s}`).join('\n'),
      '\nImprovement Focus:\n' + doc.improvementFocus.map(i => `• ${i}`).join('\n'),
      '\n' + doc.closingNote,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRecord = () => {
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert('Voice not supported'); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SR()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = false
    recognitionRef.current.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(' ')
      setInstructorNote(prev => prev + (prev ? ' ' : '') + t)
    }
    recognitionRef.current.start()
    setIsRecording(true)
  }

  const authorshipBadge = {
    ai: { label: '✦ AI Generated', cls: 'bg-violet-50 text-violet-600 border-violet-200' },
    ai_instructor: { label: '✦ AI + Instructor Input', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    instructor: { label: '✏ Instructor Edited', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  }[authorship]

  const docText = [doc.performanceSnapshot, ...doc.strengths, ...doc.improvementFocus, doc.closingNote].join('\n')

  const sections = [
    { key: 'performanceSnapshot' as const, title: 'Performance Snapshot', type: 'text' as const },
    { key: 'strengths' as const, title: 'Strengths', type: 'list' as const },
    { key: 'improvementFocus' as const, title: 'Improvement Focus', type: 'list' as const },
    { key: 'closingNote' as const, title: 'Closing Note', type: 'text' as const },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden"
          style={{ left: sidebarWidth }}
        >
          {/* Success Toast */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[110] bg-foreground text-background px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-black"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Submitted
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Student Loading Overlay */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[105] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
              >
                <div className="w-8 h-8 border-4 border-foreground/10 border-t-foreground rounded-full animate-spin" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Opening Next Student</span>
                  <p className="text-[10px] text-muted-foreground">Syncing grade and feedback...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Header bar — mirrors DashboardHeader */}
          <div className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="w-px h-5 bg-border" />
              <button
              suppressHydrationWarning
              onClick={onClose}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0 text-[11px] font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-border" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-black tracking-tight text-foreground">Final Feedback Summary</h2>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm">Student Record</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight" suppressHydrationWarning>
                {studentName} · {mounted ? new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-2 border-r border-border">
              <button
                suppressHydrationWarning
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted transition-colors text-[11px] font-bold text-foreground cursor-pointer shadow-sm"
              >
                <Scan className="w-3.5 h-3.5" /> Spot check
              </button>
              <button suppressHydrationWarning className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors bg-transparent border-none cursor-pointer">
                <Palette className="w-4 h-4" />
              </button>
              <button suppressHydrationWarning className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors bg-transparent border-none cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
              <button suppressHydrationWarning className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors bg-transparent border-none cursor-pointer">
                <Bell className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-full border border-border overflow-hidden bg-muted">
                <img src="https://avatar.vercel.sh/instructor" alt="Instructor" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex w-full overflow-hidden">
          {/* Left: Criterion Recap */}
          <div className="w-[280px] shrink-0 border-r border-border flex flex-col bg-muted/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Criterion Feedback Recap</span>
              <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{criteria.length}</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {criteria.map(c => {
                  const st = getCriterionStatus(c.score, c.maxPoints)
                  const expanded = expandedIds.has(c.id)
                  return (
                    <div key={c.id} className="rounded-xl border border-border bg-white overflow-hidden">
                      <button
                        suppressHydrationWarning
                        onClick={() => setExpandedIds(prev => {
                          const n = new Set(prev); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n
                        })}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left bg-transparent border-none cursor-pointer hover:bg-muted/20 transition-colors"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-foreground leading-tight truncate">{c.label}</p>
                          <span className={`text-[9px] font-black ${st.color}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-black text-foreground tabular-nums">{c.score}/{c.maxPoints}</span>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {expanded && (
                        <div className={`px-3 pb-3 pt-2 ${st.bg} border-t border-border/30`}>
                          <p className="text-[11px] text-foreground/80 leading-relaxed">
                            {c.feedback || <span className="italic text-muted-foreground/50">No feedback recorded.</span>}
                          </p>
                          {c.isOverridden && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              Override from {c.aiScore}pts
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Feedback Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Tab-style header (single tab — Overall feedback) */}
            <div className="border-b border-border px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold border-b-2 border-foreground text-foreground">
                <Star className="w-3 h-3" /> Overall feedback
              </div>
              <div className="flex items-center gap-4 py-2">
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-xl font-black tracking-tighter text-foreground">{percentage}</span>
                    <span className="text-xs text-muted-foreground/50 font-bold">/100</span>
                  </div>
                  <span className={`text-[10px] font-black ${perf.color}`}>{perf.label}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-2 border-b border-border/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground/80 font-bold">AI Draft Summary</span>
                <span className="text-[9px] text-muted-foreground/40 font-medium italic">Draft created from {criteria.length} confirmed criteria scores and evidence.</span>
              </div>
              <div className="flex items-center gap-1 bg-muted/10 p-0.5 rounded-lg border border-border/50">
                {(['standard', 'detailed'] as LengthMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setLengthMode(m)}
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all border-none cursor-pointer ${lengthMode === m ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground/60 hover:text-foreground'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable document — only the 5-part draft */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-8 py-5 max-w-3xl space-y-5">
                
                {/* Instructor note pinned at top when included */}
                <AnimatePresence>
                  {noteIncluded && instructorNote.trim() && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Instructor Feedback</span>
                        <button
                          suppressHydrationWarning
                          onClick={() => { setNoteIncluded(false); setAuthorship('ai') }}
                          className="text-[9px] text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-[12px] text-foreground/80 leading-relaxed">{instructorNote}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {sections.map(({ key, title, type }) => {
                  const isEditing = editingSection === key
                  const value = doc[key]
                  const text = Array.isArray(value) ? value.join('\n') : value
                  return (
                    <div key={key} className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[14px] font-black text-foreground tracking-tight">{title}</span>
                        <button
                          suppressHydrationWarning
                          onClick={() => setEditingSection(isEditing ? null : key)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                      {isEditing ? (
                        <div className="ml-0">
                          <textarea
                            defaultValue={text}
                            autoFocus
                            onBlur={e => {
                              const raw = e.target.value
                              if (type === 'list') {
                                updateSection(key, raw.split('\n').map(l => l.replace(/^[•\-]\s*/, '').trim()).filter(Boolean))
                              } else {
                                updateSection(key, raw.trim())
                              }
                              setEditingSection(null)
                            }}
                            rows={type === 'list' ? Math.max(3, (Array.isArray(value) ? value.length + 1 : 3)) : 4}
                            className="w-full text-[12px] leading-[1.7] text-foreground bg-muted/10 border border-border rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans"
                          />
                          <p className="text-[9px] text-muted-foreground/60 mt-1">{type === 'list' ? 'One item per line · ' : ''}Click outside to save</p>
                        </div>
                      ) : (
                        <div className="ml-0 text-[13px] leading-[1.6] text-foreground/80 font-medium">
                          {type === 'list' && Array.isArray(value) ? (
                            <ul className="space-y-1">
                              {value.map((item, i) => <li key={i} className="flex items-start gap-2"><span>{item}</span></li>)}
                            </ul>
                          ) : <p>{text as string}</p>}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Regenerate instead of Copy */}
                <div className="flex justify-start pt-2">
                  <button
                    suppressHydrationWarning
                    onClick={revertToAI}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all bg-transparent border-none p-0 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3 h-3" /> Regenerate draft
                  </button>
                </div>
              </div>
            </ScrollArea>

            {/* Instructor Note Workspace — always pinned above footer, never scrolled away */}
            <div className="border-t border-border bg-white px-6 py-4 shrink-0">
              <div className="flex flex-col gap-0.5 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instructor Feedback</span>
                <p className="text-[10px] text-muted-foreground/60">Add your feedback for the student. This message appears above the AI summary in the final report.</p>
              </div>
              <textarea
                value={instructorNote}
                onChange={e => setInstructorNote(e.target.value)}
                placeholder="Add personal feedback here..."
                rows={2}
                className="w-full text-[12px] leading-relaxed text-foreground bg-muted/5 border border-border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans placeholder:text-muted-foreground/40"
              />
              <div className="flex items-center justify-between mt-2">
                <button
                  suppressHydrationWarning
                  onClick={handleRecord}
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors bg-transparent cursor-pointer font-sans ${isRecording ? 'text-red-600 border-red-200 bg-red-50' : 'text-muted-foreground border-border hover:bg-muted'}`}
                >
                  {isRecording ? <><MicOff className="w-3 h-3" /> Stop recording</> : <><Mic className="w-3 h-3" /> Voice note</>}
                </button>
                <button
                  suppressHydrationWarning
                  onClick={includeNote}
                  disabled={!instructorNote.trim() || noteIncluded}
                  className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/80 disabled:opacity-30 disabled:pointer-events-none transition-colors border-none cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {noteIncluded ? 'Applied to draft ✓' : 'Apply to draft'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-border bg-white flex items-center justify-between px-5 shrink-0">
          <button
            suppressHydrationWarning
            onClick={onClose}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Criteria desk
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground">State: Ready for Publication</span>
              <span className="text-[9px] text-muted-foreground/50">· Draft cached</span>
            </div>
            <p className="text-[9px] text-muted-foreground/40 font-medium">Next student opens automatically</p>
          </div>
          <button
            suppressHydrationWarning
            onClick={() => {
              setShowToast(true)
              setTimeout(() => {
                setIsSubmitting(true)
                setTimeout(() => {
                  onSubmit(docText)
                }, 800)
              }, 400)
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-[11px] font-black hover:bg-foreground/80 transition-all border-none cursor-pointer shadow-lg shadow-foreground/10"
          >
            Submit & Continue <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
