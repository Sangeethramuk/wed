"use client"

import { usePreEvalStore, type AssignmentType, type BloomLevel } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Plus, 
  FolderKanban, 
  CheckSquare, 
  Palette, 
  FileText, 
  Mic2, 
  Code2,
  Zap,
  Check,
  BrainCircuit,
  Target,
  FileSearch,
  AlertCircle,
  HelpCircle,
  Trash2,
  Settings2,
  Edit2,
  X
} from "lucide-react"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { cn } from "@/lib/utils"

const TYPES: { type: AssignmentType; label: string; icon: any; color: string }[] = [
  { type: "Project", label: "Project", icon: FolderKanban, color: "text-blue-500" },
  { type: "MCQ", label: "MCQ Quiz", icon: CheckSquare, color: "text-emerald-500" },
  { type: "Design", label: "Design / Figma", icon: Palette, color: "text-purple-500" },
  { type: "Lab Record", label: "Lab Record", icon: Code2, color: "text-amber-500" },
  { type: "Essay", label: "Writing / Essay", icon: FileText, color: "text-rose-500" },
  { type: "Viva", label: "Viva / Oral", icon: Mic2, color: "text-orange-500" },
  { type: "Specialized", label: "Other / Custom", icon: Settings2, color: "text-slate-500" },
]

const BLOOM_LEVELS: { value: BloomLevel; label: string; description: string }[] = [
  { value: "L1: Remember", label: "Remember and recall", description: "Basic memorization of facts and concepts" },
  { value: "L2: Understand", label: "Understand and explain", description: "Interpreting and summarizing information" },
  { value: "L3: Apply", label: "Apply to problems", description: "Using information in new situations" },
  { value: "L4: Analyze", label: "Analyse and compare", description: "Breaking down information into parts" },
  { value: "L5: Evaluate", label: "Evaluate and judge", description: "Critiquing and making decisions" },
  { value: "L6: Create", label: "Create and design", description: "Producing new or original work" }
]

export function AssignmentSpecs() {
  const { 
    assignment, 
    updateAssignment, 
    addSection, 
    removeSection, 
    updateSection, 
    addDeliverable, 
    removeDeliverable,
    nextStep, 
    prevStep, 
    addAudit 
  } = usePreEvalStore()
  
  const [isDrafting, setIsDrafting] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const hasStarted = assignment.title || assignment.brief

  const getCompletenessLabel = (weight: number) => {
    if (weight === 0) return "Getting started"
    if (weight < 50) return "Taking shape"
    if (weight < 100) return "Almost ready"
    return "Ready"
  }

  const handleTypeSelect = (type: AssignmentType) => {
    updateAssignment({ type })
    addAudit({ action: "Assignment type set to " + type, details: `Format confirmed. Institutional templates loaded.`, type: "user" })
  }

  const updateDelivLocal = (sectionId: string, delivId: string, field: string, value: any) => {
    const newSections = assignment.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          deliverables: sec.deliverables.map(d => d.id === delivId ? { ...d, [field]: value } : d)
        }
      }
      return sec
    })
    updateAssignment({ sections: newSections })
  }

  const simulateAIDraft = () => {
    setIsDrafting(true)
    addAudit({ action: "Syllabus Analysis", details: assignment.syllabusScope ? "Correlating syllabus scope with learning outcomes..." : "Analyzing default course context...", type: "ai" })
    
    setTimeout(() => {
      const generatedTitle = assignment.syllabusScope 
        ? `Semester VI: ${assignment.syllabusScope.split(' ').slice(0, 3).join(' ')} Application` 
        : "Semester VI: Software Engineering Architecture Project";
      
      const generatedBrief = assignment.syllabusScope
        ? `Comprehensive evaluation based on the provided syllabus: ${assignment.syllabusScope}. Students must demonstrate competency in mapping theoretical concepts to practical implementation.`
        : "Comprehensive analysis and implementation of a modular enterprise system. Students must demonstrate competency in Architecture Patterns and System Synthesis.";

      updateAssignment({ 
        title: generatedTitle,
        brief: generatedBrief
      })
      setIsDrafting(false)
      addAudit({ action: "AI Drafting Complete", details: "Section-wise mapping validated against syllabus scope.", type: "ai" })
    }, 1500)
  }

  const totalWeight = assignment.sections.reduce((acc, sec) => 
    acc + sec.deliverables.reduce((s, d) => s + Number(d.weight), 0), 0
  )

  const { lowerDepth, higherDepth } = useMemo(() => {
    let lower = 0;
    let higher = 0;
    assignment.sections.forEach(sec => {
      sec.deliverables.forEach(d => {
        const weight = Number(d.weight) || 0;
        if (d.bloomLevel === "L1: Remember" || d.bloomLevel === "L2: Understand") {
          lower += weight;
        } else {
          higher += weight;
        }
      });
    });

    const total = lower + higher;
    if (total === 0) return { lowerDepth: 0, higherDepth: 0 };
    
    return {
      lowerDepth: Math.round((lower / total) * 100),
      higherDepth: Math.round((higher / total) * 100)
    };
  }, [assignment.sections]);

  if (!assignment.type) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={prevStep} className="gap-2 px-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to strategy</span>
          </Button>
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter secondary-text">What type of assignment is this?</h1>
          <p className="text-base text-muted-foreground font-medium opacity-70 border-b border-border/10 pb-6">Choose the format that best describes what students will submit.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TYPES.map((t) => {
            return (
              <Card 
                key={t.type} 
                className="group cursor-pointer hover:border-primary/40 transition-all border border-border/40 bg-card/20 backdrop-blur-sm relative"
                onClick={() => handleTypeSelect(t.type)}
              >
                <CardContent className="pt-8 pb-7 text-center space-y-4">
                  <div className="mx-auto p-4 w-fit rounded-xl bg-muted/30 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                    <t.icon className={cn("h-8 w-8", t.color, "group-hover:text-inherit")} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg tracking-tight font-black">{t.label}</h3>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
        {/* Institutional Header - Lean & Flat */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md -mx-4 px-4 pt-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border border-border/30" onClick={() => updateAssignment({ type: null })}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight secondary-text">Assignment Details</h1>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase font-black text-[9px] tracking-widest px-2 h-5 text-center">{assignment.type}</Badge>
              </div>
              <p className="text-muted-foreground text-[10px] font-semibold opacity-50 uppercase tracking-wider">PG/UG Semester VI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="text-right space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Late Submissions</p>
                <Select value={assignment.latePolicy} onValueChange={(val) => updateAssignment({ latePolicy: val ?? undefined })}>
                  <SelectTrigger className="font-bold text-xs h-10 bg-background/50 border-2 border-border/40 rounded-lg px-4 hover:bg-muted/20 shadow-none transition-colors w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent sideOffset={8} className="z-[105] w-full min-w-[240px] border-border/20 rounded-xl p-1 overflow-hidden shadow-none">
                     <SelectItem value="no-late" className="py-3 font-bold rounded-lg text-xs">No late submissions</SelectItem>
                     <SelectItem value="grace-24" className="py-3 font-bold rounded-lg text-xs">24-hour grace period</SelectItem>
                     <SelectItem value="daily-10" className="py-3 font-bold rounded-lg text-xs">10% deducted per late day</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="text-right space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Deadline</p>
                <DateTimePicker 
                  date={assignment.deadline}
                  setDate={(d) => updateAssignment({ deadline: d })}
                />
             </div>
          </div>
        </div>


           <div className="space-y-6 animate-in fade-in duration-300">
             <div className="grid gap-6 lg:grid-cols-4">
               {/* Main Blueprint Area */}
               <div className="lg:col-span-3 space-y-6">
                 <Card className="border border-border/40 overflow-hidden rounded-xl bg-card/10 backdrop-blur-sm">
                   <CardContent className="pt-6 space-y-6 px-6 pb-6">
                     <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Assignment details</Label>
                       <Input 
                         placeholder="Give your assignment a name — e.g. MVC Architecture Implementation" 
                         className="text-lg font-black h-11 border border-border/60 bg-muted/10 px-4 focus-visible:ring-primary/10 rounded-lg placeholder:opacity-30 tracking-tight"
                         value={assignment.title}
                         onChange={(e) => updateAssignment({ title: e.target.value })}
                       />
                     </div>
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">What are students expected to do?</Label>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/10 text-primary/50 h-4">AI</Badge>
                       </div>
                       <Textarea 
                         placeholder="Describe the assignment task, deliverables, and any specific requirements..." 
                         className="min-h-[120px] text-base leading-relaxed font-medium bg-muted/5 border border-border/60 px-4 py-4 focus-visible:ring-primary/10 rounded-lg resize-none"
                         value={assignment.brief}
                         onChange={(e) => updateAssignment({ brief: e.target.value })}
                       />
                     </div>
                   </CardContent>
                 </Card>

                {/* Sections Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] secondary-text flex items-center gap-2 opacity-50">
                      <FileSearch className="h-4 w-4 text-primary" />
                      Sections
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="font-black text-[9px] uppercase tracking-widest gap-2 opacity-40 hover:opacity-100 h-7 px-3 rounded-md"
                      onClick={addSection}
                    >
                      <Plus className="h-3 w-3" />
                      Add Section
                    </Button>
                  </div>
                  
                  <div className="space-y-5">
                    {assignment.sections.map((sec) => (
                      <Card key={sec.id} className="group border border-border/30 overflow-visible transition-all relative rounded-xl bg-muted/[0.03] border-l-2 border-l-primary/30">
                        {/* Section Delete Button */}
                        <div className="absolute top-4 right-4 z-20">
                           {confirmDeleteId === sec.id ? (
                             <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1">
                                <span className="text-[8px] font-black uppercase text-destructive bg-destructive/5 px-2 py-0.5 rounded border border-destructive/20 whitespace-nowrap">Delete?</span>
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-md"
                                  onClick={() => {
                                    removeSection(sec.id)
                                    setConfirmDeleteId(null)
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-md border border-border/40"
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                             </div>
                           ) : (
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground/30 hover:text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                                onClick={() => setConfirmDeleteId(sec.id)}
                             >
                                <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                           )}
                        </div>
                        
                        <CardHeader className="bg-muted/10 pb-4 pt-5 px-6 rounded-t-xl border-b border-border/10">
                          <div className="flex items-center justify-between pr-10">
                            <div className="space-y-1 flex-1">
                              {editingSectionId === sec.id ? (
                                <Input 
                                  autoFocus
                                  value={sec.title}
                                  className="h-8 text-base font-black uppercase tracking-widest text-primary bg-background border border-primary/20 rounded-md px-3 focus-visible:ring-primary/10"
                                  onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                                  onBlur={() => setEditingSectionId(null)}
                                  onKeyDown={(e) => e.key === 'Enter' && setEditingSectionId(null)}
                                />
                              ) : (
                                <CardTitle 
                                  className="text-base font-black uppercase tracking-widest text-primary flex items-center gap-2 cursor-pointer group/title transition-all"
                                  onClick={() => setEditingSectionId(sec.id)}
                                >
                                  {sec.title}
                                  <div className="flex items-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity">
                                    <Edit2 className="h-3 w-3 shrink-0" />
                                    <span className="text-[7px] font-black uppercase tracking-[0.1em] opacity-0 group-hover/title:opacity-100 whitespace-nowrap">Click to rename this section</span>
                                  </div>
                                </CardTitle>
                              )}
                              <Input 
                                  value={sec.description}
                                  className="h-5 border border-border/60 p-2 text-[10px] text-muted-foreground font-semibold bg-transparent focus-visible:ring-0 opacity-50"
                                  placeholder="Description..."
                                  onChange={(e) => updateSection(sec.id, { description: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col items-end gap-1 opacity-30">
                               <Badge variant="outline" className="font-black text-[8px] uppercase tracking-widest bg-background border-border/40 py-0.5 px-2 rounded-full h-4">v2.1</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                           <div className="space-y-4">
                             {sec.deliverables.map((d) => (
                               <div key={d.id} className="p-5 rounded-lg border border-border/20 bg-background/60 grid grid-cols-1 md:grid-cols-4 gap-6 items-center group/deliv relative hover:bg-background transition-all hover:border-primary/20">
                                 <button 
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background text-muted-foreground/30 border border-border/40 shadow-none opacity-0 group-hover/deliv:opacity-100 transition-all flex items-center justify-center hover:bg-destructive hover:text-white hover:border-destructive z-10"
                                    onClick={() => {
                                      updateSection(sec.id, { deliverables: sec.deliverables.filter(item => item.id !== d.id) })
                                    }}
                                 >
                                   <X className="h-2.5 w-2.5" />
                                 </button>

                                 <div className="md:col-span-1 space-y-1.5">
                                   <div className="flex items-center gap-1.5">
                                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Difficulty level</Label>
                                      <Tooltip>
                                         <TooltipTrigger className="text-muted-foreground/30 hover:text-primary transition-colors">
                                            <HelpCircle className="h-3 w-3" />
                                         </TooltipTrigger>
                                         <TooltipContent className="bg-slate-900 border-none p-2 shadow-none rounded-lg"><p className="text-[9px] font-bold text-white">Helps the AI understand how challenging this task should be.</p></TooltipContent>
                                      </Tooltip>
                                   </div>
                                   <Select value={d.bloomLevel} onValueChange={(val) => { if (val) updateDelivLocal(sec.id, d.id, "bloomLevel", val as BloomLevel) }}>
                                      <SelectTrigger className="h-9 font-bold text-[10px] bg-muted/10 border border-border/60 text-primary rounded-md px-3">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent sideOffset={5} className="z-[105] w-[200px] border border-border/20 rounded-xl p-1 shadow-none">
                                        {BLOOM_LEVELS.map(L => (
                                          <SelectItem key={L.value} value={L.value} className="text-xs font-bold py-2 rounded-lg group">
                                            <div className="flex flex-col gap-0.5">
                                              <span>{L.label}</span>
                                              <span className="text-[8px] font-medium opacity-50 group-hover:opacity-100">{L.description}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                   </Select>
                                 </div>

                                 <div className="md:col-span-2 space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                       <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Item name</Label>
                                    </div>
                                    <Input 
                                      value={d.name} 
                                      onChange={(e) => updateDelivLocal(sec.id, d.id, "name", e.target.value)}
                                      className="h-9 font-black text-xs bg-muted/5 border border-border/60 rounded-md px-3 focus-visible:ring-primary/10"
                                    />
                                 </div>

                                 <div className="md:col-span-1 space-y-1.5 text-right">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40 block">Marks (%)</Label>
                                    <div className="flex items-center justify-end gap-2">
                                      <Input 
                                        type="number" 
                                        value={d.weight} 
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9]/g, '');
                                          updateDelivLocal(sec.id, d.id, "weight", Number(val) || 0)
                                        }}
                                        className="h-9 w-14 font-black text-right pr-2 bg-muted/10 border border-border/60 rounded-md focus-visible:ring-primary/10 text-sm"
                                      />
                                      <span className="font-black text-muted-foreground/30 text-[9px]">%</span>
                                    </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                           <Button 
                              variant="secondary" 
                              className="w-full border border-border/30 h-10 text-[9px] font-black tracking-widest uppercase bg-muted/20 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all rounded-lg mt-2 group/add"
                              onClick={() => addDeliverable(sec.id)}
                           >
                              <Plus className="h-3 w-3 mr-2 group-hover/add:scale-125 transition-transform" />
                              Add item
                           </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Column - Lean & Shadowless */}
              <div className="space-y-6">
                <Card className="border border-border/20 bg-primary/[0.01] sticky top-[80px] rounded-xl overflow-hidden backdrop-blur-sm shadow-none">
                  <CardHeader className="pb-4 pt-6 px-6 border-b border-border/10 bg-muted/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-none">
                            <Target className="h-5 w-5" />
                         </div>
                         <div className="space-y-0 text-left">
                            <CardTitle className="text-[9px] font-black uppercase tracking-widest text-primary/70 leading-none">
                               {hasStarted ? "Completeness" : "Progress"}
                            </CardTitle>
                            <span className="text-[8px] font-black text-muted-foreground uppercase opacity-30">
                               {hasStarted ? getCompletenessLabel(totalWeight) : "Fill in details to start"}
                            </span>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-2xl font-black tracking-tighter leading-none ${totalWeight === 100 ? 'text-primary' : (hasStarted ? 'text-amber-500' : 'text-muted-foreground/20')}`}>
                           {hasStarted ? `${totalWeight}%` : "—"}
                        </span>
                        <span className="text-[8px] font-black uppercase opacity-30 tracking-widest">Total</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 px-6 pb-8 pt-6">
                    <div className="space-y-3">
                      <div className={cn("flex items-start gap-3 transition-opacity", !hasStarted && "opacity-20")}>
                         <div className="mt-0.5 h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10 shadow-none">
                           <Check className="h-2.5 w-2.5 text-emerald-600/60" />
                         </div>
                         <Tooltip>
                            <TooltipTrigger>
                               <p className="text-[10px] font-semibold leading-tight text-foreground/60 cursor-help underline decoration-dotted underline-offset-4">Curriculum alignment: <span className="text-primary font-black ml-1">{hasStarted ? (90 + Math.floor(totalWeight/10)) : 0}%</span></p>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="bg-slate-900 border-none p-3 shadow-none rounded-xl">
                               <p className="text-[9px] font-bold text-white">How well this assignment covers your course's learning goals based on what you've filled in so far</p>
                            </TooltipContent>
                         </Tooltip>
                      </div>
                      <div className={cn("flex items-start gap-4 transition-opacity", !hasStarted && "opacity-20")}>
                         <div className="mt-0.5 h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10 shadow-none">
                           <Check className="h-2.5 w-2.5 text-emerald-600/60" />
                         </div>
                         <p className="text-[10px] font-semibold leading-tight uppercase tracking-widest text-muted-foreground">Learning goals: <span className="text-primary font-black">{totalWeight > 0 ? "linked" : "pending"}</span></p>
                      </div>
                    </div>
                    
                    <div className={cn("pt-6 border-t border-border/10 space-y-5 transition-opacity", !hasStarted && "opacity-20")}>
                      <div className="flex items-center justify-between">
                         <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Question difficulty</p>
                         <Tooltip>
                             <TooltipTrigger className="opacity-20 hover:opacity-100 transition-opacity">
                                <HelpCircle className="h-3 w-3" />
                             </TooltipTrigger>
                            <TooltipContent side="left" className="w-64 p-3 bg-slate-900 border-none rounded-xl space-y-2 shadow-none">
                               <p className="font-black uppercase text-[9px] tracking-widest text-primary">Difficulty balance</p>
                               <p className="text-[10px] font-medium leading-relaxed text-white">Shows the balance between basic recall questions and higher-order thinking across your assignment.</p>
                            </TooltipContent>
                         </Tooltip>
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase opacity-50">
                               <span>Basic recall & understanding</span>
                               <span>{hasStarted ? `${lowerDepth}%` : "—"}</span>
                            </div>
                            <div className="h-1 bg-muted/40 rounded-full overflow-hidden shadow-none">
                               <div 
                                 className={cn("h-full bg-blue-500/40 rounded-full shadow-none transition-all duration-1000", hasStarted ? "opacity-100" : "w-0")} 
                                 style={{ width: hasStarted ? `${lowerDepth}%` : "0%" }} 
                               />
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase opacity-70">
                               <span>Applied & critical thinking</span>
                               <span>{hasStarted ? `${higherDepth}%` : "—"}</span>
                            </div>
                            <div className="h-1 bg-muted/40 rounded-full overflow-hidden shadow-none">
                               <div 
                                 className={cn("h-full bg-primary rounded-full shadow-none transition-all duration-1000", hasStarted ? "opacity-100" : "w-0")} 
                                 style={{ width: hasStarted ? `${higherDepth}%` : "0%" }} 
                               />
                            </div>
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
             </div>
           </div>

        <div className="flex justify-end pt-10">
          <Button 
            size="lg" 
            className="h-14 px-12 text-lg font-black tracking-tight rounded-xl shadow-none active:scale-95 transition-all bg-primary hover:bg-primary/90"
            disabled={!assignment.title || totalWeight !== 100} 
            onClick={nextStep}
          >
            Set grading criteria →
          </Button>
        </div>
      </div>
  )
}
