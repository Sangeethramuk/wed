"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  FileText,
  Sparkles,
  History,
  Building2,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  usePreEvalStore,
  MOCK_DRAFTS,
  MOCK_HISTORY,
  type DraftAssignment,
} from "@/lib/store/pre-evaluation-store"
import { MOCK_COURSES } from "@/components/pre-evaluation/course-selection"

type ModalStep = 1 | 2 | 3
type CreationOption = "scratch" | "history" | "suggestions"

const STEP_LABELS = ["Select course", "Existing draft", "Starting point"]
const ALL_DEPTS = "All departments"
const UNIQUE_DEPTS = [...new Set(MOCK_COURSES.map((c) => c.dept))]


interface StartAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StartAssignmentModal({ open, onOpenChange }: StartAssignmentModalProps) {
  const router = useRouter()
  const { setCourse, setCreationMode, selectHistory, setStep, resumeDraft } = usePreEvalStore()

  const [modalStep, setModalStep] = useState<ModalStep>(1)
  const [pendingCourse, setPendingCourse] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [existingDraft, setExistingDraft] = useState<DraftAssignment | null>(null)
  const [creationOption, setCreationOption] = useState<CreationOption>("scratch")
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [selectedDept, setSelectedDept] = useState<string>(ALL_DEPTS)
  const [deptOpen, setDeptOpen] = useState(false)
  const deptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setDeptOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  function reset() {
    setModalStep(1)
    setPendingCourse(null)
    setSelectedCourse(null)
    setExistingDraft(null)
    setCreationOption("scratch")
    setSelectedHistoryId(null)
    setSelectedDept(ALL_DEPTS)
    setDeptOpen(false)
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(reset, 300)
  }

  function handleCourseSelect(courseName: string) {
    setPendingCourse(courseName)
  }

  function handleCourseConfirm() {
    if (!pendingCourse) return
    setSelectedCourse(pendingCourse)
    setModalStep(3)
  }

  function handleContinueDraft() {
    if (!existingDraft) return
    resumeDraft(existingDraft)
    onOpenChange(false)
    setTimeout(reset, 300)
    router.push("/dashboard/pre-evaluation")
  }

  function handleConfirmStart() {
    if (!selectedCourse) return
    setCourse(selectedCourse)
    setCreationMode(creationOption)
    if (creationOption === "history" && selectedHistoryId) {
      selectHistory(selectedHistoryId)
    }
    setStep(1)
    onOpenChange(false)
    setTimeout(reset, 300)
    router.push("/dashboard/pre-evaluation")
  }

  const filteredCourses =
    selectedDept === ALL_DEPTS
      ? MOCK_COURSES
      : MOCK_COURSES.filter((c) => c.dept === selectedDept)

  const courseHistory = selectedCourse
    ? MOCK_HISTORY.filter((h) => h.course === selectedCourse)
    : []

  const canProceed = true

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "w-[calc(100vw-2rem)] max-w-[calc(100%-2rem)]",
            "sm:max-w-[940px]",
            "p-0 overflow-hidden rounded-2xl border border-slate-200 gap-0"
          )}
          style={{ boxShadow: "0 12px 48px rgba(0,0,0,0.16)" }}
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between px-8 pt-7 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {STEP_LABELS[modalStep - 1]}
              </p>
              <div className="flex items-center gap-3">
                {modalStep === 3 && (
                  <button
                    onClick={() => setModalStep(1)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <h2 className="text-2xl font-semibold text-slate-900">
                  {modalStep === 1 && "Select a course to get started"}
                  {modalStep === 2 && "You have an open draft"}
                  {modalStep === 3 && "How would you like to start?"}
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {modalStep === 1 && "Choose the course you're preparing an assignment for"}
                {modalStep === 2 && "Pick up where you left off, or discard and start fresh"}
                {modalStep === 3 && "Select a starting point for your new assignment"}
              </p>
            </div>
            <div className="flex items-center gap-4 ml-8 flex-shrink-0 mt-1">
              {/* Step dots — 2 steps: 1=course, 3=starting point */}
              <div className="flex items-center gap-1.5">
                {([1, 3] as const).map((step, idx) => {
                  const displayIdx = idx + 1
                  const currentIdx = modalStep === 1 ? 1 : 2
                  return (
                    <div
                      key={step}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        displayIdx === currentIdx
                          ? "w-6 bg-[#1F4E8C]"
                          : displayIdx < currentIdx
                          ? "w-1.5 bg-[#1F4E8C]/40"
                          : "w-1.5 bg-slate-200"
                      )}
                    />
                  )
                })}
              </div>
              {/* Close button */}
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Step 1: Course cards ── */}
          {modalStep === 1 && (
            <div className="px-8 pt-6 pb-8 space-y-5">
              {/* Department filter */}
              <div className="flex items-center gap-3">
                <div className="relative" ref={deptRef}>
                  <button
                    onClick={() => setDeptOpen((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-slate-300 transition-colors font-medium"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  >
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {selectedDept === ALL_DEPTS ? "Department: All" : `Dept: ${selectedDept}`}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-slate-400 transition-transform duration-150",
                        deptOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {deptOpen && (
                    <div
                      className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl py-1.5 z-20 overflow-hidden"
                      style={{ boxShadow: "0 10px 24px rgba(0,0,0,0.1)" }}
                    >
                      {[ALL_DEPTS, ...UNIQUE_DEPTS].map((dept) => (
                        <button
                          key={dept}
                          onClick={() => {
                            setSelectedDept(dept)
                            setDeptOpen(false)
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors",
                            selectedDept === dept
                              ? "bg-[#1F4E8C]/[0.05] text-[#1F4E8C] font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {dept}
                          {selectedDept === dept && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-sm text-slate-400">
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* 3-column card grid */}
              <div className="grid grid-cols-3 gap-4">
                {filteredCourses.map((course) => {
                  const isSelected = pendingCourse === course.name
                  return (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course.name)}
                      className={cn(
                        "bg-white border rounded-xl p-5 flex flex-col gap-4 text-left transition-all duration-150",
                        isSelected
                          ? "border-[#1F4E8C] ring-1 ring-[#1F4E8C]/20 shadow-md"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      )}
                      style={{ boxShadow: isSelected ? undefined : "0 1px 3px rgba(0,0,0,0.04)" }}
                    >
                      {/* Card top */}
                      <div className="space-y-1">
                        <h3 className={cn("text-base font-semibold", isSelected ? "text-[#1F4E8C]" : "text-slate-900")}>{course.name}</h3>
                        <p className="text-xs text-slate-400">{course.code} · {course.semester}</p>
                      </div>

                      {/* Card stats */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Published</p>
                          <Tooltip>
                            <TooltipTrigger render={<span />}>
                              <span className="text-sm font-semibold text-slate-900 cursor-default">
                                {course.assignmentCount} Active
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-xs font-medium">Deadline window still open</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Last Created</p>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-sm text-slate-500">{course.lastAssignment}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Single CTA */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleCourseConfirm}
                  disabled={!pendingCourse}
                  className="h-11 px-8 bg-[#1F4E8C] hover:bg-[#1a4279] text-white font-semibold rounded-xl disabled:opacity-40"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Draft Detection ── */}
          {modalStep === 2 && existingDraft && (
            <div className="px-8 py-8 space-y-6">
              <div
                className="bg-amber-50 border border-amber-200/70 rounded-2xl p-6 space-y-4"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-slate-900 leading-snug">{existingDraft.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-sm text-slate-500">{existingDraft.type}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm text-slate-500">Step {existingDraft.step} of 4</span>
                      <span className="text-slate-300">·</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm text-slate-400">{existingDraft.lastEdited}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {([1, 2, 3, 4] as const).map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors",
                        s <= existingDraft.step ? "bg-amber-400" : "bg-amber-100"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleContinueDraft}
                  className="h-12 bg-[#1F4E8C] hover:bg-[#1a4279] text-white font-semibold rounded-xl"
                >
                  Continue editing
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
                <Button
                  onClick={() => setModalStep(3)}
                  variant="outline"
                  className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl"
                >
                  Start a new assignment
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Starting Options ── */}
          {modalStep === 3 && (
            <div className="px-8 py-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                {/* Modify existing */}
                <button
                  onClick={() => { setCreationOption("history"); setSelectedHistoryId(null) }}
                  className={cn(
                    "bg-white border rounded-xl p-6 text-left flex flex-col gap-5 transition-all duration-150",
                    creationOption === "history"
                      ? "border-[#1F4E8C] ring-1 ring-[#1F4E8C]/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  )}
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center">
                    <History className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <p className={cn("text-lg font-bold", creationOption === "history" ? "text-[#1F4E8C]" : "text-slate-900")}>Modify existing assignment</p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      We&apos;ll show relevant assignments you can adapt — fastest way to get started.
                    </p>
                  </div>
                </button>

                {/* Create new */}
                <button
                  onClick={() => { setCreationOption("scratch"); setSelectedHistoryId(null) }}
                  className={cn(
                    "bg-white border rounded-xl p-6 text-left flex flex-col gap-5 transition-all duration-150",
                    creationOption === "scratch"
                      ? "border-[#1F4E8C] ring-1 ring-[#1F4E8C]/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  )}
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <p className={cn("text-lg font-bold", creationOption === "scratch" ? "text-[#1F4E8C]" : "text-slate-900")}>Create new assignment</p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      We&apos;ll guide you step-by-step as you build — full control over every detail.
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleConfirmStart}
                  disabled={!canProceed}
                  className="h-11 px-8 bg-[#1F4E8C] hover:bg-[#1a4279] text-white font-semibold rounded-xl disabled:opacity-40"
                >
                  Start building
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
