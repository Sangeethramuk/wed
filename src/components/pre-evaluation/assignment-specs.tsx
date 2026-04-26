"use client"

import { usePreEvalStore, MOCK_HISTORY, type BloomLevel, type Block, type Question, type DeliverableItem, type ResourceItem } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Plus,
  FileText,
  Check,
  Trash2,
  X,
  Wand2,
  Sparkles,
  FileCheck2,
  Link2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
  Download,
  GripVertical,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { cn } from "@/lib/utils"


export function AssignmentSpecs() {
  const router = useRouter()
  const {
    assignment,
    selectedCourse,
    updateAssignment,
    addBlock,
    removeBlock,
    updateBlock,
    reorderBlock,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addDeliverableItem,
    updateDeliverableItem,
    removeDeliverableItem,
    addResourceItem,
    updateResourceItem,
    removeResourceItem,
    nextStep,
    prevStep,
    addAudit,
    creationMode,
    selectedHistoryId,
  } = usePreEvalStore()

  const sourceHistory = creationMode === "history" && selectedHistoryId
    ? MOCK_HISTORY.find(h => h.id === selectedHistoryId)
    : null

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const b of assignment.blocks) {
      if (b.type === "instructions" || b.type === "resources") init[b.id] = true
    }
    return init
  })
  const toggleCollapsed = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }))

  const questionsBlocks = assignment.blocks.filter(b => b.type === "questions") as Extract<Block, { type: "questions" }>[]
  const instructionsBlocks = assignment.blocks.filter(b => b.type === "instructions") as Extract<Block, { type: "instructions" }>[]
  const deliverablesBlocks = assignment.blocks.filter(b => b.type === "deliverables") as Extract<Block, { type: "deliverables" }>[]
  const resourcesBlocks = assignment.blocks.filter(b => b.type === "resources") as Extract<Block, { type: "resources" }>[]

  const allQuestions = questionsBlocks.flatMap(b => b.questions)
  const totalWeight = allQuestions.reduce((s, q) => s + Number(q.weight || 0), 0)

  const hasInstructionsBody = instructionsBlocks.some(b => b.body.trim().length >= 30)
  const hasAnyQuestions = allQuestions.length > 0
  const isSingleTask = allQuestions.length === 1
  const allQuestionsHaveText = allQuestions.every(q => q.text.trim().length > 0)
  const weightsSumCorrect = totalWeight === 100
  const hasDeliverables = deliverablesBlocks.some(b => b.items.length > 0 && b.items.every(i => i.name.trim()))

  type HealthCheck = { id: string; ok: boolean; label: string; hint?: string; blocking: boolean }

  const healthChecks: HealthCheck[] = [
    {
      id: "instructions",
      ok: hasInstructionsBody,
      label: hasInstructionsBody ? "Instructions written" : "Instructions need detail",
      hint: hasInstructionsBody ? undefined : "Describe what students should do — aim for 2–3 sentences.",
      blocking: true,
    },
    {
      id: "tasks",
      ok: hasAnyQuestions && allQuestionsHaveText,
      label: !hasAnyQuestions
        ? "No tasks defined yet"
        : !allQuestionsHaveText
        ? "Some tasks are incomplete"
        : `${allQuestions.length} task${allQuestions.length !== 1 ? "s" : ""} defined`,
      hint: !hasAnyQuestions
        ? "Add at least one task or question for students to complete."
        : !allQuestionsHaveText
        ? "Fill in the task prompts above."
        : undefined,
      blocking: true,
    },
    ...(isSingleTask ? [{
      id: "single-task",
      ok: false,
      label: "Single-task assignment",
      hint: "Ensure your rubric covers multiple aspects for reliable grading.",
      blocking: false,
    }] : []),
    {
      id: "weights",
      ok: weightsSumCorrect,
      label: weightsSumCorrect ? "Weights total 100%" : `Weights total ${totalWeight}% — should be 100%`,
      hint: weightsSumCorrect ? undefined : "Adjust task weightage so the total equals 100%.",
      blocking: true,
    },
    {
      id: "deliverables",
      ok: hasDeliverables,
      label: hasDeliverables ? "Deliverables defined" : "Deliverables not specified",
      hint: hasDeliverables ? undefined : "Define what students will submit to make evaluation clear.",
      blocking: false,
    },
  ]

  const readyScore = Math.round(healthChecks.filter(c => c.ok).length / healthChecks.length * 100)
  const canProceed = !!assignment.title && healthChecks.filter(c => c.blocking).every(c => c.ok)

  const handleAIRewrite = (blockId: string, mode: "clarity" | "simplify") => {
    const block = instructionsBlocks.find(b => b.id === blockId)
    if (!block || !block.body.trim()) return
    const prefix = mode === "clarity" ? "Clear instructions: " : "In simple terms: "
    updateBlock(blockId, { body: prefix + block.body.replace(/^(Clear instructions: |In simple terms: )/, "") })
    addAudit({ action: "AI rewrite applied", details: `Applied ${mode} rewrite to instructions block.`, type: "ai" })
  }

  const handleImportFromPast = (blockId: string) => {
    const best = MOCK_HISTORY.find(h => h.course === selectedCourse && h.sampleQuestions?.length) ?? MOCK_HISTORY.find(h => h.sampleQuestions?.length)
    if (!best?.sampleQuestions) return
    const block = questionsBlocks.find(b => b.id === blockId)
    if (!block) return
    const base = block.questions.filter(q => q.text.trim().length > 0)
    const imported: Question[] = best.sampleQuestions.map((text, i) => ({
      id: `q-imp-${Date.now()}-${i}`,
      text,
      bloomLevel: "L2: Understand",
      bloomSuggested: "L2: Understand",
      weight: 0,
    }))
    const all = [...base, ...imported]
    const even = Math.floor(100 / all.length)
    const remainder = 100 - even * all.length
    const redistributed = all.map((q, i) => ({ ...q, weight: even + (i === 0 ? remainder : 0) }))
    updateBlock(blockId, { questions: redistributed })
    addAudit({ action: "Imported questions", details: `Pulled ${imported.length} questions from "${best.title}".`, type: "user" })
  }

  const handleAddSuggested = (blockId: string) => {
    const block = questionsBlocks.find(b => b.id === blockId)
    if (!block) return
    const suggestions = [
      "Explain the core trade-off between the two approaches covered in the lectures.",
      "Apply the concept to a concrete scenario and justify your design choices.",
      "Analyse the provided example and identify two improvements you would make.",
    ]
    const next = suggestions[block.questions.length % suggestions.length]
    addQuestion(blockId)
    setTimeout(() => {
      const latest = usePreEvalStore.getState().assignment.blocks.find(b => b.id === blockId)
      if (latest && latest.type === "questions") {
        const lastQ = latest.questions[latest.questions.length - 1]
        if (lastQ) updateQuestion(blockId, lastQ.id, { text: next })
      }
    }, 0)
  }

  const blockIndex = (id: string) => assignment.blocks.findIndex(b => b.id === id)
  const isFirst = (id: string) => blockIndex(id) === 0
  const isLast = (id: string) => blockIndex(id) === assignment.blocks.length - 1

  const presentTypes = new Set(assignment.blocks.map(b => b.type))
  const allAddableTypes: { type: "instructions" | "questions" | "deliverables" | "resources"; label: string }[] = [
    { type: "instructions", label: "Instructions" },
    { type: "questions", label: "Questions / Tasks" },
    { type: "deliverables", label: "Deliverables" },
    { type: "resources", label: "Resources" },
  ]
  const availableToAdd = allAddableTypes.filter(x => !presentTypes.has(x.type))

  return (
    <TooltipProvider delay={150}>
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 -mx-4 px-4 pt-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/evaluation")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">Assignment Details</h1>
              </div>
              <p className="text-slate-500 text-xs font-semibold opacity-50 tracking-wider">
                {sourceHistory ? "Review and adjust the prefilled content below" : "Build it block by block — structure only, grading comes next"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="text-right space-y-1">
                <p className="eyebrow text-slate-500">Late Submissions</p>
                <Select value={assignment.latePolicy} onValueChange={(val) => updateAssignment({ latePolicy: val ?? undefined })}>
                  <SelectTrigger className="font-bold text-xs h-10 bg-white border-2 border-slate-200 rounded-lg px-4 hover:bg-slate-100 shadow-none transition-colors w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent sideOffset={8} className="z-[105] w-full min-w-[240px] border-slate-200 rounded-xl p-1 overflow-hidden shadow-none">
                     <SelectItem value="no-late" className="py-3 font-bold rounded-lg text-xs">No late submissions</SelectItem>
                     <SelectItem value="grace-24" className="py-3 font-bold rounded-lg text-xs">24-hour grace period</SelectItem>
                     <SelectItem value="daily-10" className="py-3 font-bold rounded-lg text-xs">10% deducted per late day</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="text-right space-y-1">
                <p className="eyebrow text-slate-500">Deadline</p>
                <DateTimePicker
                  date={assignment.deadline}
                  setDate={(d) => updateAssignment({ deadline: d })}
                />
             </div>
          </div>
        </div>

        {sourceHistory && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[color:var(--status-info)]/20 bg-[color:var(--status-info)]/[0.04]">
            <div className="h-2 w-2 rounded-full bg-[color:var(--status-info)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 leading-tight">
                Prefilled from <span className="text-slate-900">{sourceHistory.title}</span>
                <span className="text-slate-400 font-medium"> · {sourceHistory.semester}</span>
              </p>
              <p className="eyebrow text-slate-400 mt-0.5">Review and adjust the content below — nothing is locked in.</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-5">
            <Card className="border border-slate-200 rounded-xl bg-white " style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <CardContent className="pt-6 pb-6 px-6 space-y-4">
                <div className="space-y-2">
                  <Label className="eyebrow text-slate-500">Assignment title</Label>
                  <Input
                    placeholder="Give your assignment a name — e.g. MVC Architecture Implementation"
                    className="text-lg font-semibold h-11 border border-border/60 bg-slate-100 px-4 focus-visible:ring-primary/10 rounded-lg placeholder:opacity-30 tracking-tight"
                    value={assignment.title}
                    onChange={(e) => updateAssignment({ title: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {assignment.blocks.map((block) => {
              const isCollapsed = !!collapsed[block.id]
              const canRemove = block.type === "resources"
              const commonHeader = (
                <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
                  <GripVertical className="h-3.5 w-3.5 text-slate-400" />
                  <BlockIcon type={block.type} />
                  <Input
                    value={block.title}
                    onChange={(e) => updateBlock(block.id, { title: e.target.value } as Partial<Block>)}
                    className="eyebrow h-7 bg-transparent border-none text-slate-700 px-0 focus-visible:ring-0 flex-1"
                  />
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => reorderBlock(block.id, "up")}
                      disabled={isFirst(block.id)}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => reorderBlock(block.id, "down")}
                      disabled={isLast(block.id)}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleCollapsed(block.id)}
                    >
                      {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                    </Button>
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeBlock(block.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )

              return (
                <Card key={block.id} className="border border-slate-200 rounded-xl bg-white  overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  {commonHeader}
                  {isCollapsed && block.type === "instructions" && (block as Extract<Block, { type: "instructions" }>).body.trim() && (
                    <div className="px-5 py-2.5 border-t border-slate-100">
                      <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {(block as Extract<Block, { type: "instructions" }>).body}
                      </p>
                    </div>
                  )}
                  {!isCollapsed && (
                    <CardContent className="p-6 space-y-4">
                      {block.type === "instructions" && (
                        <InstructionsEditor
                          block={block}
                          onChange={(body) => updateBlock(block.id, { body } as Partial<Block>)}
                          onAIRewrite={(mode) => handleAIRewrite(block.id, mode)}
                        />
                      )}
                      {block.type === "questions" && (
                        <QuestionsEditor
                          block={block}
                          onUpdate={(qId, data) => updateQuestion(block.id, qId, data)}
                          onAdd={() => addQuestion(block.id)}
                          onRemove={(qId) => removeQuestion(block.id, qId)}
                          onImport={() => handleImportFromPast(block.id)}
                          onSuggest={() => handleAddSuggested(block.id)}
                        />
                      )}
                      {block.type === "deliverables" && (
                        <DeliverablesEditor
                          items={block.items}
                          onUpdate={(itemId, data) => updateDeliverableItem(block.id, itemId, data)}
                          onAdd={() => addDeliverableItem(block.id)}
                          onRemove={(itemId) => removeDeliverableItem(block.id, itemId)}
                        />
                      )}
                      {block.type === "resources" && (
                        <ResourcesEditor
                          items={block.items}
                          onUpdate={(itemId, data) => updateResourceItem(block.id, itemId, data)}
                          onAdd={() => addResourceItem(block.id)}
                          onRemove={(itemId) => removeResourceItem(block.id, itemId)}
                        />
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}

            {availableToAdd.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="eyebrow text-slate-500">Add block</span>
                {availableToAdd.map((opt) => (
                  <Button
                    key={opt.type}
                    variant="outline"
                    size="sm"
                    className="border-dashed"
                    onClick={() => addBlock(opt.type)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {opt.label}
                  </Button>
                ))}
              </div>
            )}

          </div>

          <div className="space-y-5">
            <Card className="border border-slate-200 bg-white sticky top-[90px] rounded-xl  overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center border",
                      canProceed
                        ? "bg-[color:var(--status-success)]/10 border-[color:var(--status-success)]/20 text-[color:var(--status-success)]"
                        : "bg-primary/5 border-primary/10 text-primary"
                    )}>
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={cn("eyebrow leading-tight", canProceed ? "text-[color:var(--status-success)]" : "text-primary/80")}>
                        {canProceed ? "Evaluation Ready" : "Assignment Health"}
                      </p>
                      <p className="eyebrow text-slate-500 leading-tight">{readyScore}% complete</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-2xl font-semibold text-slate-900 leading-none",
                    canProceed ? "text-[color:var(--status-success)]" : readyScore >= 60 ? "text-[color:var(--status-warning)]" : "text-slate-400"
                  )}>
                    {readyScore}%
                  </span>
                </div>
              </div>
              <CardContent className="px-5 pt-5 pb-6 space-y-3">
                {healthChecks.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-start gap-2.5">
                      <div className={cn(
                        "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 border",
                        c.ok
                          ? "bg-[color:var(--status-success)]/10 border-[color:var(--status-success)]/20 text-[color:var(--status-success)]/80"
                          : c.blocking
                          ? "bg-[color:var(--status-warning)]/10 border-[color:var(--status-warning)]/20 text-[color:var(--status-warning)]/80"
                          : "bg-[color:var(--status-info)]/10 border-[color:var(--status-info)]/20 text-[color:var(--status-info)]/80"
                      )}>
                        {c.ok ? <Check className="h-2.5 w-2.5" /> : c.blocking ? <AlertTriangle className="h-2.5 w-2.5" /> : <Lightbulb className="h-2.5 w-2.5" />}
                      </div>
                      <p className={cn(
                        "text-xs font-bold leading-tight",
                        c.ok ? "text-slate-700" : c.blocking ? "text-slate-900" : "text-slate-700"
                      )}>{c.label}</p>
                    </div>
                    {c.hint && (
                      <p className="text-xs font-medium text-slate-500 leading-relaxed pl-6">{c.hint}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button
            size="lg"
            disabled={!canProceed}
            onClick={nextStep}
          >
            Set grading criteria →
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

function BlockIcon({ type }: { type: Block["type"] }) {
  const common = "h-4 w-4"
  if (type === "instructions") return <FileText className={cn(common, "text-[color:var(--status-info)] opacity-70")} />
  if (type === "questions") return <FileCheck2 className={cn(common, "text-primary opacity-80")} />
  if (type === "deliverables") return <BookOpen className={cn(common, "text-[color:var(--status-success)] opacity-70")} />
  return <Link2 className={cn(common, "text-[color:var(--status-warning)] opacity-70")} />
}

function InstructionsEditor({
  block,
  onChange,
  onAIRewrite,
}: {
  block: Extract<Block, { type: "instructions" }>
  onChange: (body: string) => void
  onAIRewrite: (mode: "clarity" | "simplify") => void
}) {
  const hasBody = block.body.trim().length > 0
  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Describe what students should do, the context of the assignment, and any constraints or ground rules."
        className="min-h-[140px] text-sm leading-relaxed font-medium bg-slate-50 border border-slate-200 px-4 py-3 focus-visible:ring-primary/10 rounded-lg resize-y"
        value={block.body}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAIRewrite("clarity")}
          disabled={!hasBody}
          className="text-slate-400 hover:text-primary"
        >
          <Wand2 className="h-3 w-3 mr-1" />
          Improve clarity
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAIRewrite("simplify")}
          disabled={!hasBody}
          className="text-slate-400 hover:text-primary"
        >
          <Lightbulb className="h-3 w-3 mr-1" />
          Simplify language
        </Button>
      </div>
    </div>
  )
}

function QuestionsEditor({
  block,
  onUpdate,
  onAdd,
  onRemove,
  onImport,
  onSuggest,
}: {
  block: Extract<Block, { type: "questions" }>
  onUpdate: (qId: string, data: Partial<Question>) => void
  onAdd: () => void
  onRemove: (qId: string) => void
  onImport: () => void
  onSuggest: () => void
}) {
  const total = block.questions.reduce((s, q) => s + Number(q.weight || 0), 0)
  const weightOff = total !== 100

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {block.questions.map((q, idx) => (
          <QuestionRow
            key={q.id}
            index={idx + 1}
            question={q}
            onUpdate={(data) => onUpdate(q.id, data)}
            onRemove={() => onRemove(q.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={onAdd}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add question
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onImport}
          >
            <Download className="h-3 w-3 mr-1" />
            Import from past assignment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSuggest}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Add suggested question
          </Button>
        </div>
        <div className="eyebrow flex items-center gap-1.5">
          <span className="text-slate-400">Total</span>
          <span className={cn(
            "tabular-nums",
            weightOff ? "text-[color:var(--status-warning)]" : "text-[color:var(--status-success)]"
          )}>{total}%</span>
        </div>
      </div>
    </div>
  )
}

function QuestionRow({
  index,
  question,
  onUpdate,
  onRemove,
}: {
  index: number
  question: Question
  onUpdate: (data: Partial<Question>) => void
  onRemove: () => void
}) {
  const suggestionMatches = question.bloomLevel === question.bloomSuggested
  const suggestedLabel = question.bloomSuggested?.replace("L", "L").replace(": ", " · ") ?? ""

  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs text-slate-400">Question {index}</span>
        <div className="flex items-center gap-2">
          <div className="eyebrow flex items-center gap-1 text-slate-400">
            <span>Weight</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={question.weight}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "")
                onUpdate({ weight: Math.min(100, Number(val) || 0) })
              }}
              className="h-7 w-14 text-right pr-2 font-semibold text-xs bg-slate-100 border border-slate-200 rounded-md focus-visible:ring-primary/10"
            />
            <span className="text-slate-400">%</span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <Textarea
          placeholder="Write the question prompt — e.g. Decompose the provided monolith into three bounded contexts and justify each boundary."
          className="min-h-[70px] text-sm font-medium bg-transparent border border-slate-200 px-3 py-2 focus-visible:ring-primary/10 rounded-md resize-y placeholder:opacity-30"
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
        />
        {question.text.trim().length > 0 && !suggestionMatches && (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary/70 hover:text-primary border-dashed border border-primary/20 hover:border-primary/40 h-6 px-2"
              onClick={() => onUpdate({ bloomLevel: question.bloomSuggested })}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              <span className="eyebrow">{suggestedLabel}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function DeliverablesEditor({
  items,
  onUpdate,
  onAdd,
  onRemove,
}: {
  items: DeliverableItem[]
  onUpdate: (itemId: string, data: Partial<DeliverableItem>) => void
  onAdd: () => void
  onRemove: (itemId: string) => void
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[color:var(--status-warning)]/[0.04] border border-[color:var(--status-warning)]/15">
          <AlertTriangle className="h-3 w-3 text-[color:var(--status-warning)]/80 shrink-0" />
          <p className="text-xs font-semibold text-[color:var(--status-warning)]/80 leading-tight">
            Add at least one deliverable so students know what to submit.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.id} className="group grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-start rounded-lg border border-slate-200 bg-white/40 px-3 py-2.5 hover:border-primary/20 transition-all">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="eyebrow text-slate-400 shrink-0">#{idx + 1}</span>
                  <Input
                    placeholder="Deliverable name — e.g. Design document, Source code, Test report"
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                    className="h-8 font-bold text-xs bg-transparent border border-slate-200 rounded-md px-2 focus-visible:ring-primary/10"
                  />
                </div>
                <Input
                  placeholder="Short description (optional)"
                  value={item.description}
                  onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                  className="h-7 text-xs font-medium bg-transparent border border-slate-200 rounded-md px-2 focus-visible:ring-primary/10 placeholder:opacity-30 ml-6"
                />
              </div>
              <Select value={item.format} onValueChange={(val) => { if (val) onUpdate(item.id, { format: val }) }}>
                <SelectTrigger className="h-8 w-32 text-xs font-bold bg-slate-100 border border-slate-200 rounded-md px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent sideOffset={5} className="z-[105] border border-slate-200 rounded-xl p-1 shadow-none">
                  <SelectItem value="PDF" className="text-xs font-bold py-1.5 rounded-md">PDF</SelectItem>
                  <SelectItem value="Word Doc" className="text-xs font-bold py-1.5 rounded-md">Word Doc</SelectItem>
                  <SelectItem value="Slides" className="text-xs font-bold py-1.5 rounded-md">Slides</SelectItem>
                  <SelectItem value="Code repo" className="text-xs font-bold py-1.5 rounded-md">Code repo</SelectItem>
                  <SelectItem value="Figma link" className="text-xs font-bold py-1.5 rounded-md">Figma link</SelectItem>
                  <SelectItem value="Video" className="text-xs font-bold py-1.5 rounded-md">Video</SelectItem>
                  <SelectItem value="Other" className="text-xs font-bold py-1.5 rounded-md">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="border-dashed"
        onClick={onAdd}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add deliverable
      </Button>
    </div>
  )
}

function ResourcesEditor({
  items,
  onUpdate,
  onAdd,
  onRemove,
}: {
  items: ResourceItem[]
  onUpdate: (itemId: string, data: Partial<ResourceItem>) => void
  onAdd: () => void
  onRemove: (itemId: string) => void
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-xs font-medium text-slate-400 leading-relaxed">
          Optional — share textbook chapters, references, starter files, or anything else students should read before starting.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="group grid grid-cols-[1fr_1fr_auto] gap-2 items-center rounded-lg border border-slate-200 bg-white/40 px-3 py-2 hover:border-primary/20 transition-all">
              <Input
                placeholder="Resource name"
                value={item.name}
                onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                className="h-8 font-bold text-xs bg-transparent border border-slate-200 rounded-md px-2 focus-visible:ring-primary/10"
              />
              <Input
                placeholder="Link (optional)"
                value={item.link}
                onChange={(e) => onUpdate(item.id, { link: e.target.value })}
                className="h-8 text-xs font-medium bg-transparent border border-slate-200 rounded-md px-2 focus-visible:ring-primary/10 placeholder:opacity-30"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="border-dashed"
        onClick={onAdd}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add resource
      </Button>
    </div>
  )
}
