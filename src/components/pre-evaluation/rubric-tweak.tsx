"use client"

import { usePreEvalStore, CO_DEFINITIONS } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
 Plus,
 Check, 
 ArrowLeft, 
 ShieldCheck, 
 AlertCircle,
 FileSpreadsheet,
 Layers,
 Search,
 Zap,
 ChevronRight,
 ChevronDown
} from "lucide-react"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RubricTweak() {
 const { rubric, updateRubric, addCriterion, nextStep, prevStep, addAudit } = usePreEvalStore()
 const [healthScore, setHealthScore] = useState(0)
 const [expandedRow, setExpandedRow] = useState<string | null>(null)

 useEffect(() => {
 const score = rubric.length >= 3 ? 96 : 82;
 const timer = setTimeout(() => setHealthScore(score), 500)
 return () => clearTimeout(timer)
 }, [rubric])

 const updateLevelDescription = (critId: string, levelLabel: string, newDesc: string) => {
 const newRubric = rubric.map(crit => {
 if (crit.id === critId) {
 return {
 ...crit,
 version: "v1.1 (Modified)",
 levels: crit.levels.map(lvl => lvl.label === levelLabel ? { ...lvl, description: newDesc } : lvl)
 }
 }
 return crit
 })
 updateRubric(newRubric)
 }

 return (
 <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-6 px-4">
 {/* Header - Flat & Lean */}
 <div className="flex items-center justify-between border-b border-border/10 pb-6 sticky top-0 z-50 bg-background/80 backdrop-blur-md -mx-4 px-4 pt-4 shadow-none">
 <div className="flex items-center gap-4">
 <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-border/20 shadow-none" onClick={prevStep}>
 <ArrowLeft className="h-4 w-4" />
 </Button>
 <div className="space-y-0">
 <h1 className="text-2xl font-medium tracking-tight secondary-text">Grading Rubric</h1>
 <p className="text-xs font-semibold text-muted-foreground/40 tracking-widest">Define your grade levels</p>
 </div>
 </div>


 </div>

 {/* Quick Insights Bar - Top Aligned */}
 <Card className="border border-border/20 bg-background/50 backdrop-blur-md rounded-xl overflow-hidden shadow-none">
 <CardContent className="p-4 flex flex-wrap items-center justify-between gap-6">
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-3 border-r border-border/10 pr-6">
 <div className="space-y-1">
 <p className="text-xs font-medium tracking-widest text-muted-foreground opacity-50">Readiness</p>
 <div className="flex items-center gap-3">
 <span className="text-xl font-medium text-primary tracking-tighter">{healthScore}%</span>
 <Progress value={healthScore} className="h-1 w-24 rounded-full bg-muted/20 shadow-none" />
 </div>
 </div>
 </div>

 <div className="flex items-center gap-6 border-r border-border/10 pr-6">
 <Tooltip>
 <TooltipTrigger className="flex gap-2 items-center cursor-help group">
 <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
 <Check className="h-3.5 w-3.5" />
 </div>
 <p className="text-xs font-medium tracking-widest text-foreground">Learning goals linked</p>
 </TooltipTrigger>
 <TooltipContent side="bottom" className="bg-slate-900 border-none p-2"><p className="text-xs font-bold text-white">All criteria are linked to your course's learning goals</p></TooltipContent>
 </Tooltip>
 
 <Tooltip>
 <TooltipTrigger className="flex gap-2 items-center cursor-help group">
 <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
 <Check className="h-3.5 w-3.5" />
 </div>
 <p className="text-xs font-medium tracking-widest text-foreground">Grade levels defined</p>
 </TooltipTrigger>
 <TooltipContent side="bottom" className="bg-slate-900 border-none p-2"><p className="text-xs font-bold text-white">AI will use these descriptions to assist with grading</p></TooltipContent>
 </Tooltip>
 </div>

 <div className="flex items-center gap-3 bg-primary/[0.02] px-3 py-1.5 rounded-lg border border-primary/10 transition-all">
 <FileSpreadsheet className="h-4 w-4 text-primary/40" />
 <p className="text-xs font-medium text-primary/60 tracking-widest">AI grading support active</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Main Matrix Area - Full Width */}
 <div className="space-y-6 shadow-none">
 <div className="flex items-center justify-between px-1">
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
 <Layers className="h-4 w-4" />
 </div>
 <h3 className="text-xs font-medium tracking-[0.3em] secondary-text opacity-50">
 Grading criteria
 </h3>
 </div>
 <Button 
 variant="ghost" 
 size="sm"
 className="text-xs font-medium tracking-widest hover:text-primary transition-all gap-2 h-8 px-4 bg-muted/5 border border-border/10 rounded-lg"
 onClick={addCriterion}
 >
 <Plus className="h-3.5 w-3.5" />
 New Criterion
 </Button>
 </div>

 <Card className="border border-border/20 overflow-hidden rounded-xl bg-card/10 backdrop-blur-sm shadow-none">
 <div className="overflow-x-auto shadow-none">
 <table className="w-full border-collapse">
 <thead>
 <tr className="bg-muted/[0.01] border-b border-border/10 shadow-none">
 <th className="p-6 text-left text-xs font-medium tracking-widest text-muted-foreground/30 border-r border-border/10 w-96 bg-background/30 sticky left-0 z-10 backdrop-blur-md">Criteria</th>
 {["Exemplary", "Proficient", "Developing", "Beginning"].map((level, i) => (
 <th key={level} className="p-4 text-center border-r border-border/10 min-w-[200px] shadow-none">
 <div className="space-y-0.5">
 <span className={`text-xs font-medium tracking-widest ${i === 0 ? 'text-primary' : 'text-muted-foreground/50'}`}>{level}</span>
 <span className="block text-xs font-medium text-muted-foreground/30 tracking-tighter">Grade: {i === 0 ? '100' : i === 1 ? '75' : i === 2 ? '50' : '25'}%</span>
 </div>
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="shadow-none">
 {rubric.map((crit) => (
 <tr key={crit.id} className="border-b border-border/10 transition-colors hover:bg-primary/[0.01] group shadow-none">
 <td className="p-6 border-r border-border/10 bg-muted/[0.01] align-top space-y-3 sticky left-0 z-10 backdrop-blur-sm shadow-none w-96">
 <div className="flex items-start justify-between shadow-none gap-4">
 <div className="space-y-2 flex-1 shadow-none">
 <Textarea 
 value={crit.name}
 className="font-medium text-xs text-foreground tracking-tight leading-tight border border-border/40 p-3 h-auto min-h-[60px] bg-background/50 focus-visible:ring-primary/20 shadow-none rounded-lg resize-none"
 placeholder="Enter criterion name..."
 onChange={(e) => {
 updateRubric(rubric.map(c => c.id === crit.id ? { ...c, name: e.target.value } : c))
 }}
 />
 <div className="flex items-center justify-between">
 <Tooltip>
 <TooltipTrigger className="text-xs font-medium tracking-widest border-border/20 text-muted-foreground/60 bg-background/30 py-0 px-2 rounded-full h-4 shadow-none cursor-help">
 <Badge variant="outline" className="border-none p-0 h-auto">
 {crit.linkedCO}
 </Badge>
 </TooltipTrigger>
 <TooltipContent side="right" className="max-w-[200px] text-xs font-bold bg-slate-900 border-none p-3 rounded-lg shadow-none">
 <p className="text-primary tracking-widest text-xs mb-1 font-medium">Linked learning goal</p>
 <p className="text-white/80">{CO_DEFINITIONS[crit.linkedCO] || "Standard institutional goal"}</p>
 </TooltipContent>
 </Tooltip>
 <button onClick={() => setExpandedRow(expandedRow === crit.id ? null : crit.id)} className="text-muted-foreground/20 hover:text-primary transition-all p-0.5 shadow-none">
 {expandedRow === crit.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
 </button>
 </div>
 </div>
 </div>
 </td>
 {crit.levels.map((lvl) => (
 <td key={lvl.label} className="p-4 border-r border-border/10 align-top shadow-none">
 <Textarea 
 className="text-xs font-medium leading-relaxed bg-background/40 border border-border/60 focus-visible:ring-1 focus-visible:ring-primary/10 p-3 min-h-[140px] resize-none hover:bg-white/50 rounded-lg transition-all shadow-none placeholder:opacity-10"
 value={lvl.description}
 onChange={(e) => updateLevelDescription(crit.id, lvl.label, e.target.value)}
 />
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </div>

 <div className="flex justify-end pt-10 shadow-none">
 <Button 
 size="lg" 
 className="h-14 px-12 text-lg font-medium tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90"
 onClick={nextStep}
 >
 See student view →
 </Button>
 </div>
 </div>
 )
}
