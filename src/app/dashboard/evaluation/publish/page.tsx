"use client"

import { useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, 
  Calendar, 
  Zap, 
  Clock, 
  ChevronDown, 
  CheckCircle2, 
  Settings2,
  ShieldCheck,
  Eye,
  MessagesSquare,
  Sparkles,
  Save,
  Rocket,
  Loader2,
  FileDown
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

function PublishResultsContent() {
  const searchParams = useSearchParams()
  const assignmentId = searchParams.get("id") || "SWE-PH2"
  
  const [releaseTime, setReleaseTime] = useState<"standard" | "immediate" | "custom">("standard")
  const [appealsEnabled, setAppealsEnabled] = useState(false)
  const [appealDuration, setAppealDuration] = useState("7 Days")
  const [appealRules, setAppealRules] = useState({
    appealWindow: false,
    oneAppeal: false,
    viewFeedback: false,
    aiPrescreen: false,
  })
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    // Simulate 1.2s publishing delay
    await new Promise(resolve => setTimeout(resolve, 1200))
    setIsPublishing(false)
    setShowSuccess(true)
  }

  const releaseOptions = [
    {
      id: "standard" as const,
      title: "Standard Release",
      subtitle: "Monday, 9:00 AM",
      description: "Recommended for office-hours follow-up support",
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      id: "immediate" as const,
      title: "Immediate Release",
      subtitle: "Publish instantly",
      description: "Students are notified immediately",
      icon: Zap,
      color: "text-amber-500",
    },
    {
      id: "custom" as const,
      title: "Custom Schedule",
      subtitle: "Choose date and time",
      description: "Schedule for a future release",
      icon: Clock,
      color: "text-purple-500",
    }
  ]

  const assignmentInfo = {
    course: assignmentId === "DB-Q1" ? "Symbiosis University" : "Advanced Algorithm Design",
    name: assignmentId === "DB-Q1" ? "Database Queries - Quiz 1" : "Final Project",
    students: assignmentId === "DB-Q1" ? "1 Students" : "45 Students"
  }

  return (
    <div className="min-h-screen bg-muted/40 -m-4 p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="space-y-4">
          <Link href={`/dashboard/evaluation/results?id=${assignmentId}`}>
            <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
            </Button>
          </Link>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Publish Results</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">Review release timing and student appeal settings before publishing results to the cohort.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          {/* Left Column: Main Configuration */}
          <main className="space-y-6">
            
            {/* Section 1: Release Timing */}
            <Card className="bg-white shadow-sm border-border/50 overflow-hidden">
              <CardHeader className="pb-4 bg-white">
                <CardTitle className="text-xl font-bold tracking-tight">Choose Release Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pb-6">
                {releaseOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setReleaseTime(option.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group relative",
                      releaseTime === option.id 
                        ? "bg-primary/[0.03] border-primary/40 ring-1 ring-primary/10" 
                        : "bg-white border-border/40 hover:border-border/80 hover:bg-muted/5"
                    )}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                      releaseTime === option.id ? "bg-primary border-primary" : "border-muted-foreground/20"
                    )}>
                      {releaseTime === option.id && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-sm font-bold", releaseTime === option.id ? "text-primary" : "text-foreground")}>
                          {option.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-foreground/70">{option.subtitle}</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="text-[11px] text-muted-foreground leading-none">{option.description}</span>
                      </div>
                    </div>
                    <option.icon className={cn("h-3.5 w-3.5 opacity-20 transition-opacity", option.color)} />
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Section 2: Student Appeals */}
            <Card className="bg-white shadow-sm border-border/50 overflow-hidden">
              <CardHeader className="pb-1 bg-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xl font-bold tracking-tight">Student Appeals</CardTitle>
                    <CardDescription className="text-sm font-normal text-muted-foreground leading-none">
                      Allow students to request a review after results are published.
                    </CardDescription>
                  </div>
                  <div 
                    onClick={() => {
                      const nextState = !appealsEnabled
                      setAppealsEnabled(nextState)
                      if (nextState) {
                        setAppealRules({
                          appealWindow: false,
                          oneAppeal: false,
                          viewFeedback: false,
                          aiPrescreen: false,
                        })
                      }
                    }}
                    className={cn(
                      "w-11 h-6 rounded-full p-1 cursor-pointer transition-colors flex items-center",
                      appealsEnabled ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                  >
                    <motion.div 
                      layout
                      className="h-4 w-4 bg-white rounded-full shadow-sm"
                      animate={{ x: appealsEnabled ? 20 : 0 }}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {appealsEnabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-muted/5"
                  >
                    <CardContent className="pt-2 pb-6">
                      <div className="grid gap-2">
                        {[
                          { id: "appealWindow", title: "7 Day Appeal Window", desc: "Set a clear window for students to submit appeal requests.", icon: Clock },
                          { id: "oneAppeal", title: "One Appeal Per Submission", desc: "Each student can appeal only once for this assignment.", icon: MessagesSquare },
                          { id: "viewFeedback", title: "Must View Feedback First", desc: "Students must open feedback before submitting appeal.", icon: Eye },
                          { id: "aiPrescreen", title: "AI Pre-screen + HOD Routing", desc: "Low-validity appeals auto-filtered, escalations routed when needed.", icon: Sparkles }
                        ].map((rule) => (
                          <div
                            key={rule.id}
                            onClick={() => setAppealRules(prev => ({ ...prev, [rule.id]: !prev[rule.id as keyof typeof appealRules] }))}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group/rule relative",
                              appealRules[rule.id as keyof typeof appealRules] 
                                ? "bg-primary/[0.03] border-primary/40 ring-1 ring-primary/10" 
                                : "bg-white border-border/40 hover:border-border/80 hover:bg-muted/5"
                            )}
                          >
                            <div className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors shadow-sm",
                              appealRules[rule.id as keyof typeof appealRules] 
                                ? "bg-primary border-primary text-white" 
                                : "border-muted-foreground/30 bg-white"
                            )}>
                              {appealRules[rule.id as keyof typeof appealRules] && (
                                <motion.svg 
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="4" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="h-2.5 w-2.5"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </motion.svg>
                              )}
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <span className={cn(
                                "text-[14px] font-bold leading-none transition-colors",
                                appealRules[rule.id as keyof typeof appealRules] ? "text-primary" : "text-foreground"
                              )}>
                                {rule.title}
                              </span>
                              <p className="text-[11px] text-muted-foreground font-medium">{rule.desc}</p>
                            </div>
                            <rule.icon className={cn("h-4 w-4 opacity-10 transition-opacity", appealRules[rule.id as keyof typeof appealRules] ? "text-primary opacity-30" : "group-hover/rule:opacity-20")} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </main>

          {/* Right Column: Sticky Summary Rail */}
          <aside className="sticky top-6 space-y-6 self-start h-fit pb-12">
            
            {/* 1. Batch Health Card (Priority Top) */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-none overflow-hidden">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/60">Batch Health</span>
                    <CardTitle className="text-xl font-bold text-emerald-900 leading-none">Validation Passed</CardTitle>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    "Evaluation complete",
                    "All students graded",
                    "No blockers detected",
                    "Results ready for release"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-[13px] font-bold text-emerald-800/80 leading-none">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2. Combined Summary Card */}
            <Card className="bg-white shadow-xl border-border/20 overflow-hidden">
              <CardContent className="p-0">
                {/* Summary Header */}
                <div className="px-6 pt-6 pb-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Summary</h2>
                </div>
                
                {/* Project Details Section */}
                <div className="px-6 pt-1 pb-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wide">Course Name</p>
                    <p className="text-[13px] font-bold text-foreground leading-snug">{assignmentInfo.course}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wide">Assignment Name</p>
                    <p className="text-[13px] font-bold text-foreground leading-snug">{assignmentInfo.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wide">Class Strength</p>
                    <p className="text-[13px] font-bold text-foreground">{assignmentInfo.students}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wide">Publishing Date</p>
                    <p className="text-[13px] font-bold text-primary">
                      {releaseOptions.find(o => o.id === releaseTime)?.subtitle || "Immediately"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/10 space-y-3">
                    <div className="flex items-center gap-3 text-[12px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      All students graded
                    </div>
                    <div className="flex items-center gap-3 text-[12px] font-bold text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Grades + feedback visible
                    </div>
                    {appealsEnabled && appealRules.appealWindow && (
                      <div className="flex items-center gap-3 text-[12px] font-bold text-foreground/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        7 Day appeals window
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="p-6 bg-muted/5 border-t border-border/10 space-y-5">
                  <div className="space-y-3">
                    <div 
                      onClick={() => setIsAcknowledged(!isAcknowledged)}
                      className="flex gap-3 cursor-pointer group"
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border shrink-0 mt-0.5 transition-all flex items-center justify-center",
                        isAcknowledged ? "bg-primary border-primary text-white" : "border-border bg-white group-hover:border-primary/50"
                      )}>
                        {isAcknowledged && <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><CheckCircle2 className="h-3 w-3" /></motion.div>}
                      </div>
                      <div className="space-y-1">
                        <p className={cn(
                          "text-[13px] font-bold leading-tight transition-colors",
                          isAcknowledged ? "text-foreground" : "text-muted-foreground"
                        )}>
                          Ready to publish results to students
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground/60 leading-snug">
                          Grades, feedback, and reports will become visible based on the selected release timing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handlePublish}
                      disabled={!isAcknowledged || isPublishing}
                      className={cn(
                        "w-full h-12 font-bold tracking-tight rounded-xl transition-all duration-300",
                        isAcknowledged 
                          ? "bg-primary hover:bg-primary/90 text-sm shadow-lg shadow-primary/10 hover:translate-y-[-1px]" 
                          : "bg-muted text-muted-foreground/40 cursor-not-allowed border border-border/50"
                      )}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing Results...
                        </>
                      ) : (
                        <>
                          <Rocket className={cn("mr-2 h-4 w-4 transition-transform", isAcknowledged && "animate-pulse")} />
                          Publish Results
                        </>
                      )}
                    </Button>
                    <p className="text-[9px] text-center text-muted-foreground/40 pt-2 italic">
                      Protocol v2.4.1 • Secure Release
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Premium Success State Interaction */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Soft Dim Overlay + Premium Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/15 backdrop-blur-[10px]"
              onClick={() => setShowSuccess(false)}
            />

            {/* Success Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[440px] bg-white rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border border-white p-8 text-center space-y-8 overflow-hidden"
            >
              {/* Ultra-Smooth Celebratory Success Visual */}
              <div className="flex flex-col items-center">
                <div className="relative h-24 w-24 flex items-center justify-center">
                  
                  {/* Outer Diffused Ripple Layers */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity, repeatDelay: 1 }}
                    className="absolute inset-0 rounded-full border border-emerald-500/20"
                  />
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity, repeatDelay: 1.3 }}
                    className="absolute inset-0 rounded-full border border-emerald-500/30"
                  />
                  
                  {/* Soft Emerald Gradient Glow */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/10 via-emerald-400/5 to-transparent blur-sm"
                  />

                  {/* Main Circle Ring */}
                  <svg className="absolute inset-0 h-24 w-24 transform -rotate-90">
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      className="text-emerald-500/80"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ 
                        duration: 0.9, 
                        ease: [0.16, 1, 0.3, 1] // Custom organic ease
                      }}
                    />
                  </svg>

                  {/* Organic Checkmark Animation */}
                  <div className="relative z-10 flex items-center justify-center">
                    <motion.svg 
                      viewBox="0 0 24 24" 
                      className="h-10 w-10 text-emerald-600"
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <motion.polyline 
                        points="20 6 9 17 4 12" 
                        initial={{ pathLength: 0, scale: 0.8 }}
                        animate={{ pathLength: 1, scale: 1 }}
                        transition={{ 
                          pathLength: { duration: 0.6, delay: 0.4, ease: "easeInOut" },
                          scale: { 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20, 
                            delay: 0.4 
                          }
                        }}
                      />
                    </motion.svg>
                  </div>

                  {/* Weightless Center Fill */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="absolute h-20 w-20 rounded-full bg-emerald-50/50 backdrop-blur-[2px]"
                  />
                </div>
              </div>

              {/* Success Copy Content */}
              <div className="space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold tracking-tight text-foreground"
                >
                  Results Published
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground font-medium"
                >
                  {assignmentInfo.students} can now view grades and feedback.
                </motion.p>
              </div>

              {/* Meta Intelligence Line */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="py-3 px-4 bg-muted/30 rounded-xl border border-border/10 flex flex-col gap-1"
              >
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  {appealsEnabled ? (
                    <>
                      <span>Appeals open for {appealDuration}</span>
                      <span className="opacity-30">•</span>
                    </>
                  ) : (
                    <>
                      <span>Appeals Disabled</span>
                      <span className="opacity-30">•</span>
                    </>
                  )}
                  <span>Notifications Sent</span>
                </div>
                <p className="text-[10px] text-muted-foreground/40 font-medium italic">
                  Published {releaseOptions.find(o => o.id === releaseTime)?.subtitle || "Today"} • Secure Release archived
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-3 pt-2"
              >
                <Button className="w-full h-13 font-bold rounded-xl bg-primary text-white shadow-xl shadow-primary/10 transition-transform active:scale-95">
                  Preview Student View
                </Button>
                <Link href={`/dashboard/evaluation/results?id=${assignmentId}`} className="block w-full">
                  <Button 
                    variant="ghost" 
                    className="w-full h-11 font-bold rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  >
                    Return to Report
                  </Button>
                </Link>
                <Button variant="link" className="text-xs font-bold text-primary/60 hover:text-primary">
                  <FileDown className="mr-2 h-3.5 w-3.5" />
                  Download Release Summary
                </Button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PublishResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Publish Settings...</div>}>
      <PublishResultsContent />
    </Suspense>
  )
}
