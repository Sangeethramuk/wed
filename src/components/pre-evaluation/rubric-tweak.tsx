"use client"

import { usePreEvalStore, CO_DEFINITIONS, MIN_CRITERIA, MAX_CRITERIA, type MatrixCriterion } from "@/lib/store/pre-evaluation-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Check,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Pencil,
  Sparkles,
  RotateCcw,
  Info,
} from "lucide-react"
import { useMemo, useState, useCallback } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
    updateCriterion,
    updateCriterionLevel,
    resetRubricToDefault,
    nextStep,
    prevStep,
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
  const isModified = rubric.some(c => !c.isDefault)

  const totalCells = rubric.length * 4
  const filledCells = rubric.flatMap(c => c.levels).filter(l => l.description.trim().length >= 20).length
  const alignmentScore = totalCells > 0 ? Math.round(filledCells / totalCells * 100) : 0

  const canProceed = rubric.length >= MIN_CRITERIA && rubric.length <= MAX_CRITERIA && weightsBalanced && rubric.every(c => c.name.trim())

  return (
    <TooltipProvider delay={120}>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-6 px-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 -mx-4 px-4 pt-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">Grading Rubric</h1>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Define your grade levels — pre-loaded from institutional standards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isModified && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary rounded-md"
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
            <p className="text-[10px] font-medium text-slate-500 leading-tight mt-0.5">
              Rubric loaded from <span className="font-black text-slate-700">{assignment.institution.name}</span> standards. Edit criteria, weights, and descriptions — structure and grade levels are locked.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3 w-3 opacity-60" />
              <span>Structure & levels locked</span>
            </span>
            <span className="opacity-30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Pencil className="h-3 w-3 text-primary" />
              <span>Descriptions editable</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "eyebrow text-[10px] font-black tabular-nums",
              alignmentScore === 100 ? "text-[color:var(--status-success)]" : alignmentScore >= 60 ? "text-[color:var(--status-warning)]" : "text-slate-400"
            )}>{alignmentScore}% described</span>
          </div>
        </div>

        {/* Rubric Grid */}
        <Card className="border border-slate-200 overflow-hidden rounded-xl bg-white " style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-left w-[280px] sticky left-0 z-10 bg-white border-r border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Pencil className="h-3 w-3 text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Criterion</span>
                    </div>
                  </th>
                  {["Exemplary", "Proficient", "Developing", "Beginning"].map((level, i) => (
                    <th key={level} className="p-3 text-center border-r border-slate-100 min-w-[200px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <Lock className="h-2.5 w-2.5 text-slate-400" />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            i === 0 ? "text-primary" : "text-slate-400"
                          )}>{level}</span>
                        </div>
                        <LevelScoreEditor
                          critId={rubric[0]?.id}
                          levelLabel={level}
                          currentPoints={rubric[0]?.levels.find(l => l.label === level)?.points ?? 0}
                          onChange={(val) => {
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
                  <tr key={crit.id} className="border-b border-slate-100 hover:bg-slate-50/50 group">
                    <td className="p-4 border-r border-slate-100 bg-white align-top sticky left-0 z-10 w-[280px]">
                      <CriterionCell
                        crit={crit}
                        rowIdx={rowIdx}
                        totalWeight={totalWeight}
                        onNameChange={(v) => updateCriterion(crit.id, { name: v })}
                        onWeightChange={(v) => updateCriterion(crit.id, { weight: v })}
                      />
                    </td>
                    {crit.levels.map((lvl) => (
                      <td key={lvl.label} className="p-3 border-r border-slate-100 align-top">
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
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Weight total footer */}
                <tr className="bg-white">
                  <td className="p-3 border-r border-slate-100 sticky left-0 z-10 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total weight</span>
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
        <div className="flex items-start gap-2 text-slate-400">
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
            Check calibration →
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
        className="h-6 w-12 text-center text-[10px] font-black tabular-nums bg-slate-100 border border-slate-200 rounded-md focus-visible:ring-primary/10 px-1"
      />
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">%</span>
    </div>
  )
}

function inferBlooms(name: string): string {
  if (/evaluat|assess|judg|justif|critic/i.test(name)) return "L5 · Evaluate"
  if (/creat|design|construct|develop|generat/i.test(name)) return "L6 · Create"
  if (/analys|diagnos|compar|examin|break/i.test(name)) return "L4 · Analyze"
  if (/appl|demonstrat|implement|execut|use|organis/i.test(name)) return "L3 · Apply"
  if (/explain|describ|interpret|summar/i.test(name)) return "L2 · Understand"
  return "L3 · Apply"
}

function CriterionCell({
  crit,
  rowIdx,
  onNameChange,
  onWeightChange,
}: {
  crit: MatrixCriterion
  rowIdx: number
  totalWeight: number
  onNameChange: (v: string) => void
  onWeightChange: (v: number) => void
}) {
  const hasNameIssue = !crit.name.trim()
  const blooms = inferBlooms(crit.name)

  return (
    <div className="space-y-2">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">#{rowIdx + 1}</span>
      <Input
        value={crit.name}
        placeholder="e.g. Technical Accuracy"
        className={cn(
          "h-9 font-semibold text-xs bg-white border rounded-md px-3 focus-visible:ring-primary/10",
          hasNameIssue ? "border-amber-500/40" : "border-slate-200"
        )}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <Badge variant="outline" className="eyebrow text-primary border-primary/20 bg-primary/[0.03] px-1.5 h-5 rounded-md">
                {crit.linkedCO}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-foreground border-none p-2 rounded-lg max-w-[200px]">
              <p className="text-xs font-bold text-primary-foreground leading-snug">{CO_DEFINITIONS[crit.linkedCO] ?? crit.linkedCO}</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-[9px] font-medium text-slate-400">{blooms}</span>
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
            className="h-7 w-12 text-right text-[10px] font-black tabular-nums bg-slate-100 border border-slate-200 rounded-md focus-visible:ring-primary/10 pr-1"
          />
          <span className="text-[9px] font-black text-slate-400">%</span>
        </div>
      </div>
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
}: {
  critName: string
  levelLabel: string
  description: string
  isEdited: boolean
  resolved: boolean
  onChange: (v: string) => void
  onResolve: () => void
}) {
  const issue = isEdited ? descriptionIssues(description) : null
  const showWarning = !!issue && !resolved

  return (
    <div className="space-y-1.5">
      <Textarea
        placeholder={`What does "${levelLabel}" look like for ${critName}?`}
        value={description}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "min-h-[110px] text-[11px] font-medium leading-relaxed bg-white border focus-visible:ring-primary/10 p-2.5 rounded-md resize-none placeholder:opacity-30",
          showWarning ? "border-amber-500/30" : "border-slate-200"
        )}
      />
      <div className="flex items-center gap-1.5 min-h-[16px]">
        {showWarning ? (
          <>
            <AlertTriangle className="h-2.5 w-2.5 text-amber-600 shrink-0" />
            <span className="text-[9px] font-semibold text-amber-700/80 leading-tight truncate">{issue}</span>
            <button
              type="button"
              onClick={onResolve}
              className="shrink-0 text-[8px] font-black uppercase tracking-widest text-amber-700/60 hover:text-amber-700 border border-amber-500/20 hover:border-amber-500/40 rounded px-1.5 py-0.5 transition-colors"
            >
              Ok
            </button>
          </>
        ) : isEdited && description.trim().length > 0 ? (
          <>
            <Check className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
            <span className="text-[9px] font-semibold text-emerald-700/70">Clear</span>
          </>
        ) : null}
      </div>
    </div>
  )
}
