"use client"

import { usePreEvalStore, CO_DEFINITIONS, MIN_CRITERIA, MAX_CRITERIA, type MatrixCriterion } from "@/lib/store/pre-evaluation-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Check,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Pencil,
  Wand2,
  Sparkles,
  RotateCcw,
  X,
  Info,
  HelpCircle,
} from "lucide-react"
import { useMemo, useState, useCallback } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const VAGUE_TERMS = ["good", "bad", "nice", "poor", "great", "okay", "fine", "some", "many", "few"]

function descriptionIssues(desc: string): string | null {
  const trimmed = desc.trim()
  if (!trimmed) return "Empty — describe what this level looks like."
  if (trimmed.length < 20) return "Too short — add a measurable detail."
  const lower = ` ${trimmed.toLowerCase()} `
  const vague = VAGUE_TERMS.find(t => lower.includes(` ${t} `))
  if (vague) return `Avoid vague term "${vague}" — be specific.`
  return null
}

export function RubricTweak() {
  const {
    rubric,
    assignment,
    addCriterion,
    updateCriterion,
    removeCriterion,
    updateCriterionLevel,
    resetRubricToDefault,
    nextStep,
    prevStep,
    addAudit,
  } = usePreEvalStore()

  const [editedCells, setEditedCells] = useState<Set<string>>(new Set())
  const [resolvedCells, setResolvedCells] = useState<Set<string>>(new Set())

  const markEdited = useCallback((critId: string, levelLabel: string) => {
    setEditedCells(prev => new Set([...prev, `${critId}::${levelLabel}`]))
  }, [])

  const resolveCell = useCallback((critId: string, levelLabel: string) => {
    setResolvedCells(prev => new Set([...prev, `${critId}::${levelLabel}`]))
  }, [])

  const unresolveCell = useCallback((critId: string, levelLabel: string) => {
    setResolvedCells(prev => {
      const next = new Set(prev)
      next.delete(`${critId}::${levelLabel}`)
      return next
    })
  }, [])

  const totalWeight = rubric.reduce((s, c) => s + Number(c.weight || 0), 0)
  const weightsBalanced = totalWeight === 100
  const modifiedCount = rubric.filter(c => !c.isDefault).length
  const isModified = modifiedCount > 0

  const canProceed = rubric.length >= MIN_CRITERIA && rubric.length <= MAX_CRITERIA && weightsBalanced && rubric.every(c => c.name.trim())

  const handleRewriteDescription = (critId: string, levelLabel: string, mode: "measurable" | "specific") => {
    const crit = rubric.find(c => c.id === critId)
    const lvl = crit?.levels.find(l => l.label === levelLabel)
    if (!lvl || !lvl.description.trim()) return
    const prefix = mode === "measurable" ? "Measurable outcome: " : "Specifically, "
    const cleaned = lvl.description.replace(/^(Measurable outcome: |Specifically, )/, "")
    updateCriterionLevel(critId, levelLabel, { description: prefix + cleaned })
    addAudit({ action: "Rubric rewrite", details: `AI rewrite (${mode}) applied to ${crit?.name} — ${levelLabel}.`, type: "ai" })
  }

  return (
    <TooltipProvider delay={120}>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-6 px-4">
        <div className="flex items-center justify-between border-b border-border/10 pb-6 sticky top-0 z-50 bg-background/80 backdrop-blur-md -mx-4 px-4 pt-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-border/20 shadow-none" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight secondary-text">Grading Rubric</h1>
                {assignment.type && (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase font-black text-[9px] tracking-widest px-2 h-5">{assignment.type}</Badge>
                )}
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Define your grade levels — pre-loaded from institutional standards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isModified && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 hover:text-primary rounded-md"
                onClick={resetRubricToDefault}
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Reset to default
              </Button>
            )}
          </div>
        </div>

        {/* Pre-filled banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/10 bg-primary/[0.02]">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-primary/80 leading-tight">Pre-filled for you</p>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight mt-0.5">
              Rubric loaded from <span className="font-black text-foreground/80">{assignment.institution.name}</span> standards for <span className="font-black text-foreground/80">{assignment.type ?? "this assignment"}</span>. Edit criteria, weights, and descriptions — structure and grade levels are locked.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-muted-foreground/70 text-[10px] font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3 w-3 opacity-60" />
              <span>Structure & levels locked</span>
            </span>
            <span className="opacity-30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Pencil className="h-3 w-3 text-primary" />
              <span>Criteria, weights & descriptions editable</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{rubric.length}/{MAX_CRITERIA}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[9px] font-black uppercase tracking-widest border border-dashed border-border/40 bg-transparent hover:border-primary/40 hover:text-primary rounded-md"
              onClick={addCriterion}
              disabled={rubric.length >= MAX_CRITERIA}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add criterion
            </Button>
          </div>
        </div>

        {/* Rubric Grid */}
        <Card className="border border-border/20 overflow-hidden rounded-xl bg-card/10 backdrop-blur-sm shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/[0.02] border-b border-border/10">
                  <th className="p-4 text-left w-[280px] sticky left-0 z-10 bg-background/80 backdrop-blur-sm border-r border-border/10">
                    <div className="flex items-center gap-1.5">
                      <Pencil className="h-3 w-3 text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Criterion</span>
                    </div>
                  </th>
                  {["Exemplary", "Proficient", "Developing", "Beginning"].map((level, i) => (
                    <th key={level} className="p-3 text-center border-r border-border/10 min-w-[200px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <Lock className="h-2.5 w-2.5 text-muted-foreground/40" />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            i === 0 ? "text-primary" : "text-muted-foreground/60"
                          )}>{level}</span>
                        </div>
                        <LevelScoreEditor
                          critId={rubric[0]?.id}
                          levelLabel={level}
                          currentPoints={rubric[0]?.levels.find(l => l.label === level)?.points ?? 0}
                          onChange={(val) => {
                            // apply to all criteria's matching level (keeps grade structure consistent)
                            for (const c of rubric) updateCriterionLevel(c.id, level, { points: val })
                          }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rubric.map((crit, rowIdx) => (
                  <tr key={crit.id} className="border-b border-border/10 hover:bg-primary/[0.01] group">
                    <td className="p-4 border-r border-border/10 bg-muted/[0.02] align-top sticky left-0 z-10 backdrop-blur-sm w-[280px]">
                      <CriterionCell
                        crit={crit}
                        rowIdx={rowIdx}
                        totalWeight={totalWeight}
                        onNameChange={(v) => updateCriterion(crit.id, { name: v })}
                        onWeightChange={(v) => updateCriterion(crit.id, { weight: v })}
                        onCOChange={(v) => updateCriterion(crit.id, { linkedCO: v })}
                        onRemove={() => removeCriterion(crit.id)}
                        canRemove={rubric.length > MIN_CRITERIA}
                      />
                    </td>
                    {crit.levels.map((lvl) => (
                      <td key={lvl.label} className="p-3 border-r border-border/10 align-top">
                        <LevelDescriptionCell
                          critName={crit.name || "this criterion"}
                          levelLabel={lvl.label}
                          description={lvl.description}
                          isEdited={editedCells.has(`${crit.id}::${lvl.label}`)}
                          resolved={resolvedCells.has(`${crit.id}::${lvl.label}`)}
                          onChange={(v) => {
                            markEdited(crit.id, lvl.label)
                            unresolveCell(crit.id, lvl.label)
                            updateCriterionLevel(crit.id, lvl.label, { description: v })
                          }}
                          onResolve={() => resolveCell(crit.id, lvl.label)}
                          onRewrite={(mode) => handleRewriteDescription(crit.id, lvl.label, mode)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Weight total footer */}
                <tr className="bg-muted/[0.02]">
                  <td className="p-3 border-r border-border/10 sticky left-0 z-10 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Total weight</span>
                      <span className={cn(
                        "text-sm font-black tabular-nums",
                        weightsBalanced ? "text-emerald-600" : "text-amber-600"
                      )}>{totalWeight}%</span>
                    </div>
                  </td>
                  <td colSpan={4} className="p-3">
                    {!weightsBalanced && (
                      <p className="text-[10px] font-semibold text-amber-700/80 leading-tight">
                        Weights should total 100% — adjust criterion weights above.
                      </p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Helper footer */}
        <div className="flex items-start gap-2 text-muted-foreground/60">
          <Info className="h-3.5 w-3.5 opacity-60 mt-0.5 shrink-0" />
          <p className="text-[11px] font-medium opacity-70 leading-relaxed">
            Write descriptions that a second grader could use to grade consistently. Be specific — what would you actually see in an Exemplary submission? Avoid vague terms like &ldquo;good&rdquo; or &ldquo;great&rdquo;.
          </p>
        </div>

        <div className="flex justify-end pt-6">
          <Button
            size="lg"
            className="h-14 px-12 text-lg font-black tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90"
            onClick={nextStep}
            disabled={!canProceed}
          >
            See student view →
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

function LevelScoreEditor({
  critId,
  levelLabel,
  currentPoints,
  onChange,
}: {
  critId: string | undefined
  levelLabel: string
  currentPoints: number
  onChange: (val: number) => void
}) {
  if (!critId) return null
  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        min={0}
        max={100}
        value={currentPoints}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, "")
          onChange(Math.min(100, Number(val) || 0))
        }}
        className="h-6 w-12 text-center text-[10px] font-black tabular-nums bg-muted/10 border border-border/40 rounded-md focus-visible:ring-primary/10 px-1"
      />
      <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">%</span>
    </div>
  )
}

function CriterionCell({
  crit,
  rowIdx,
  onNameChange,
  onWeightChange,
  onCOChange,
  onRemove,
  canRemove,
}: {
  crit: MatrixCriterion
  rowIdx: number
  totalWeight: number
  onNameChange: (v: string) => void
  onWeightChange: (v: number) => void
  onCOChange: (v: string) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const hasNameIssue = !crit.name.trim()

  return (
    <div className="space-y-2 relative">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 pt-2">#{rowIdx + 1}</span>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Input
        value={crit.name}
        placeholder="e.g. Technical Accuracy"
        className={cn(
          "h-9 font-black text-xs bg-background border rounded-md px-3 focus-visible:ring-primary/10",
          hasNameIssue ? "border-amber-500/40" : "border-border/40"
        )}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Select value={crit.linkedCO} onValueChange={(v) => { if (v) onCOChange(v) }}>
            <SelectTrigger className="h-7 text-[10px] font-bold bg-muted/10 border border-border/40 text-primary rounded-md px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent sideOffset={4} className="z-[105] border border-border/20 rounded-xl p-1 shadow-none max-w-[240px]">
              {Object.keys(CO_DEFINITIONS).map(co => (
                <SelectItem key={co} value={co} className="text-[11px] font-bold py-1.5 rounded-md">
                  <div className="flex flex-col">
                    <span>{co}</span>
                    <span className="text-[9px] opacity-50">{CO_DEFINITIONS[co]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            max={100}
            value={crit.weight}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "")
              onWeightChange(Math.min(100, Number(val) || 0))
            }}
            className="h-7 w-12 text-right text-[10px] font-black tabular-nums bg-muted/10 border border-border/40 rounded-md focus-visible:ring-primary/10 pr-1"
          />
          <span className="text-[9px] font-black text-muted-foreground/40">%</span>
        </div>
      </div>

      {!crit.isDefault && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-1.5 h-4 bg-amber-500/5 text-amber-700 border-amber-500/20 rounded">
            Modified
          </Badge>
        </div>
      )}
    </div>
  )
}

function LevelDescriptionCell({
  critName,
  levelLabel,
  description,
  isEdited,
  resolved,
  onChange,
  onResolve,
  onRewrite,
}: {
  critName: string
  levelLabel: string
  description: string
  isEdited: boolean
  resolved: boolean
  onChange: (v: string) => void
  onResolve: () => void
  onRewrite: (mode: "measurable" | "specific") => void
}) {
  const issue = isEdited ? descriptionIssues(description) : null
  const hasContent = description.trim().length > 0
  const showWarning = !!issue && !resolved

  return (
    <div className="space-y-1.5 group/cell">
      <Textarea
        placeholder={`What does "${levelLabel}" look like for ${critName}? Be specific and measurable.`}
        value={description}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "min-h-[110px] text-[11px] font-medium leading-relaxed bg-background/40 border focus-visible:ring-primary/10 p-2.5 rounded-md resize-none placeholder:opacity-30",
          showWarning ? "border-amber-500/30" : "border-border/40"
        )}
      />
      <div className="flex items-center justify-between gap-2 min-h-[18px]">
        <div className="flex items-center gap-1.5 min-w-0">
          {showWarning ? (
            <>
              <AlertTriangle className="h-2.5 w-2.5 text-amber-600 shrink-0" />
              <span className="text-[9px] font-semibold text-amber-700/80 leading-tight truncate">{issue}</span>
              <button
                type="button"
                onClick={onResolve}
                className="shrink-0 text-[8px] font-black uppercase tracking-widest text-amber-700/60 hover:text-amber-700 border border-amber-500/20 hover:border-amber-500/40 rounded px-1.5 py-0.5 transition-colors"
              >
                Resolve
              </button>
            </>
          ) : isEdited && resolved && descriptionIssues(description) ? (
            <>
              <Check className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />
              <span className="text-[9px] font-semibold text-muted-foreground/40 leading-tight">Reviewed</span>
            </>
          ) : isEdited && hasContent ? (
            <>
              <Check className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
              <span className="text-[9px] font-semibold text-emerald-700/70">Clear</span>
            </>
          ) : <span />
          }
        </div>
        {hasContent && (
          <div className="flex items-center gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0">
            <Tooltip>
              <TooltipTrigger
                className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:text-primary hover:bg-accent transition-colors"
                onClick={() => onRewrite("measurable")}
              >
                <Wand2 className="h-2.5 w-2.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-900 border-none p-2 rounded-lg">
                <p className="text-[9px] font-bold text-white">Make it measurable</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:text-primary hover:bg-accent transition-colors"
                onClick={() => onRewrite("specific")}
              >
                <HelpCircle className="h-2.5 w-2.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-900 border-none p-2 rounded-lg">
                <p className="text-[9px] font-bold text-white">Rewrite to be more specific</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
