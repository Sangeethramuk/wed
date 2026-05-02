"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  STUDENTS, 
  AI_REVALS, 
  BRIEFINGS 
} from "@/lib/data/re-evaluation-data"
import { useReEvalStore } from "@/lib/store/re-evaluation-store"
import { generateManuscript, generateArtifacts } from "@/lib/manuscript-generator"
import ManuscriptRenderer from "@/components/evaluation/manuscript-renderer"
import { ReEvalActionHub } from "@/components/re-evaluation/action-hub"
import ArtifactSidebar from "@/components/evaluation/artifact-sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ChevronLeft, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  History,
  Info,
  AlertTriangle,
  XCircle
} from "lucide-react"
import { BriefingModal } from "@/components/re-evaluation/briefing-modal"

export default function ReEvalWorkspacePage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const { addHodPending, addResolved } = useReEvalStore()

  const student = STUDENTS[studentId]
  const aiReval = AI_REVALS[studentId]
  const briefing = BRIEFINGS[studentId]

  const [manuscriptView, setManuscriptView] = useState<"scanned" | "ocr">("ocr")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitVariant, setSubmitVariant] = useState<"uphold" | "adjust">("uphold")
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  const manuscript = useMemo(() => generateManuscript(studentId), [studentId])
  const artifacts = useMemo(() => generateArtifacts(studentId), [studentId])
  const totalPages = manuscript.pages.length

  const disputeEvidence = useMemo(() => {
    if (!student) return []
    // Find the first paragraph that matches the disputed criterion in the generated manuscript
    const targetCrit = student.critShort.toLowerCase()
    let foundPage = 0
    let foundElement: any = null

    for (let i = 0; i < manuscript.pages.length; i++) {
      const el = manuscript.pages[i].elements.find(e => 
        e.type === 'paragraph' && e.highlight?.criterionId === targetCrit
      )
      if (el) {
        foundPage = i + 1
        foundElement = el
        break
      }
    }
    
    if (foundElement && foundElement.type === 'paragraph') {
      const text = foundElement.text.split('.')[0] + '.'
      return [{
        id: 'dispute-focus',
        text: text,
        criterionId: 'dispute',
        page: foundPage
      }]
    }
    return []
  }, [student, manuscript])

  useEffect(() => {
    setIsSubmitted(false)
    const evidence = disputeEvidence[0] as any
    if (evidence?.page) {
      setCurrentPage(evidence.page)
    }

    const timer = setTimeout(() => {
      const el = document.getElementById('evidence-dispute-focus')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [studentId, disputeEvidence])

  const ManuscriptPage = ({ index, children }: { index: number, children: React.ReactNode }) => (
    <div 
      id={`page-${index}`}
      className="bg-background shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-border mx-auto transition-all duration-300 relative group/page cursor-text"
      style={{ 
        width: "100%", 
        maxWidth: "800px", 
        aspectRatio: "1/1.414",
        marginBottom: "60px"
      }}
    >
      <div className="absolute top-8 left-8 flex flex-col items-start gap-1">
        <span className="eyebrow text-primary/40 group-hover/page:text-primary transition-colors">Digital Manuscript</span>
        <span className="eyebrow text-[#E6E1D6] group-hover/page:text-muted-foreground/70 transition-colors">Folio {index} / {totalPages}</span>
      </div>

      <div className="eyebrow absolute top-8 right-8 text-[color:var(--status-warning)]/40 flex items-center gap-2 group-hover/page:text-[color:var(--status-warning)] transition-colors">
        <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--status-warning)]" />
        {student.critShort}
      </div>

      <div className="p-16 lg:p-24 h-full font-serif overflow-hidden">
        {children}
      </div>
    </div>
  )

  if (!student || !aiReval || !briefing) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Student re-evaluation record not found.</p>
      </div>
    )
  }

  const handleUphold = (reason: string) => {
    setSubmitVariant("uphold")
    setIsSubmitted(true)
    addResolved(studentId)
  }

  const handleAdjust = (score: number, reason: string, category: string) => {
    setSubmitVariant("adjust")
    setIsSubmitted(true)
    addHodPending(studentId)
  }

  const handleBack = () => router.push("/dashboard/re-evaluation/triage")

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-8 animate-in zoom-in-95 duration-500">
        <div className="size-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="size-12 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">Review Submitted</h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            The re-evaluation decision has been recorded and routed to the {submitVariant === 'adjust' ? 'HOD for final signature.' : 'triage desk.'}
          </p>
        </div>
        <div className="w-full max-w-sm p-6 rounded-2xl bg-muted/30 border border-border/10 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>Student</span>
            <span className="text-foreground">{student.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>Decision</span>
            <span className="text-emerald-600">{submitVariant === 'uphold' ? 'Grade Upheld' : 'Score Adjusted'}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>Routing</span>
            <span className="text-primary">{submitVariant === 'adjust' ? 'Manual HOD Approval' : 'Auto-Resolved'}</span>
          </div>
        </div>
        <Button size="lg" onClick={handleBack} className="gap-2">
          Return to triage desk
          <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden border rounded-xl bg-background shadow-sm">
      {/* Main Workspace Panels */}
      <main className="h-full relative overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          {/* Left: Manuscript Viewer */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="h-full flex flex-col bg-muted/10 overflow-hidden relative">
              {/* Anchor Header: Replicated from Grading Desk */}
              <header className="p-4 border-b border-border bg-background flex flex-col gap-4 z-10 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="eyebrow text-primary/60 mb-0.5">Authoring Identity</span>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold tracking-tight text-foreground">{student.name}</h2>
                        <span className="text-[10px] eyebrow bg-muted/50 px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground uppercase">{student.rollId}</span>
                      </div>
                    </div>
                  </div>

                  <Tabs value={manuscriptView} onValueChange={(v) => setManuscriptView(v as "scanned" | "ocr")}>
                    <TabsList className="border border-border">
                      <TabsTrigger value="scanned" className="px-4">Original</TabsTrigger>
                      <TabsTrigger value="ocr" className="px-4">Extracted</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                      <MessageSquare className="size-4" />
                    </div>
                    <div className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer relative">
                      <History className="size-4" />
                    </div>
                  </div>
                </div>
              </header>

              <div className="h-12 px-6 flex items-center justify-between border-b border-border bg-background/20 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={handleBack} className="group text-muted-foreground hover:text-foreground p-0 h-auto">
                    <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-[10px] font-bold ml-1 uppercase tracking-widest">Back to Triage</span>
                  </Button>
                  <div className="w-px h-4 bg-border/40" />
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    <Sparkles className="size-3 text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Re-evaluation</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] eyebrow text-muted-foreground/40 uppercase tracking-widest">Student Cited: {student.evidence}</span>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden relative">
                <ArtifactSidebar artifacts={artifacts} />
                
                <ScrollArea 
                  className="flex-1 bg-muted/30 scroll-smooth"
                  onScrollCapture={(e) => {
                    const target = e.currentTarget as HTMLElement
                    const containerHeight = target.clientHeight
                    const viewport = target.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
                    if (viewport) {
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
                    }
                  }}
                >
                  <div 
                    className="p-10 lg:p-24 transition-transform duration-500 ease-out origin-top flex flex-col items-center"
                    style={{ transform: `scale(${zoom / 100})` }}
                  >
                    {manuscriptView === "ocr" ? (
                      <>
                        {manuscript.pages.map((page, idx) => (
                          <ManuscriptPage key={idx} index={idx + 1}>
                             <ManuscriptRenderer 
                              elements={page.elements} 
                              userEvidence={disputeEvidence}
                            />
                          </ManuscriptPage>
                        ))}
                      </>
                    ) : (
                      <>
                        {manuscript.pages.map((_, idx) => (
                          <div key={idx} className="bg-white shadow-2xl border border-border/40 mx-auto mb-[60px] relative overflow-hidden" style={{ width: '100%', maxWidth: '800px', aspectRatio: '1/1.414' }}>
                             <div className="absolute inset-0 bg-muted/10 animate-pulse" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] eyebrow text-muted-foreground/20 uppercase tracking-widest italic">Scanned Preview · Page {idx + 1}</span>
                             </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Floating Bottom Pagination */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-background border border-border shadow-2xl z-20 flex items-center gap-6 backdrop-blur-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const next = Math.max(1, currentPage - 1)
                    document.getElementById(`page-${next}`)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest">
                  <span className="text-primary">PAGE {currentPage}</span>
                  <span className="opacity-30">/</span>
                  <span className="opacity-50">{totalPages}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1)
                    document.getElementById(`page-${next}`)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>

            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-border/20 hover:bg-primary/20 transition-colors" />

          {/* Right: Decision Hub */}
          <ResizablePanel defaultSize={35} minSize={30}>
            <ReEvalActionHub
              student={student}
              aiReval={aiReval}
              briefing={briefing}
              onUphold={handleUphold}
              onAdjust={handleAdjust}
              onCancel={handleBack}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* Case Briefing Modal */}
      {briefingOpen && (
        <BriefingModal
          studentId={studentId}
          onClose={() => setBriefingOpen(false)}
          onStart={null}
        />
      )}
    </div>
  )
}
