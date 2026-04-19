'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, CircleDot, Lightbulb, AlertTriangle, 
  ChevronUp, ChevronDown, CheckCircle2, Pencil, 
  Copy, Undo2, Send, ArrowRight, Star as StarIcon,
  ChevronLeft
} from 'lucide-react';
import { 
  getTierColors, 
  type FeedbackTier, 
  generateOverallFeedback, 
  generateSolutionSteps 
} from '@/lib/feedback-generator';
import { useGradingStore } from '@/lib/store/grading-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ── Criteria Recap Card (left panel) ──
function CriteriaRecapCard({ name, level, tier, tierLabel, feedbackSnippet, isExpanded, onToggle }: {
  name: string; level: number; tier: FeedbackTier; tierLabel: string;
  feedbackSnippet: string; isExpanded: boolean; onToggle: () => void;
}) {
  const colors = getTierColors(tier);
  const TierIcon = tier === 'perfect' ? StarIcon : tier === 'minor' ? CircleDot : tier === 'gap' ? Lightbulb : AlertTriangle;
  return (
    <div className={`rounded-[10px] border ${colors.border} ${colors.bg} overflow-hidden transition-all duration-200 hover:shadow-sm`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 bg-transparent border-none cursor-pointer font-sans text-left">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-6 h-6 rounded-md ${colors.badge} flex items-center justify-center shrink-0`}>
            <TierIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-foreground truncate uppercase tracking-tight">{name}</div>
            <div className={`text-[9px] font-black uppercase tracking-[0.08em] ${colors.text}`}>{tierLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-border/30 ml-2">
          <span className="text-[12px] font-black font-mono text-foreground">{level}<span className="text-[9px] text-muted-foreground/50">/5</span></span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/40" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-border/10 mt-1">
              <p className="text-[10px] text-muted-foreground/80 leading-[1.6] italic mt-2">{feedbackSnippet}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──
export default function FeedbackPage() {
  const { id: assignmentId } = useParams();
  const router = useRouter();
  const {
    currentAssignmentId, assignments, activeStudentId,
    criterionFeedbacks, overallFeedback,
    setOverallFeedback, updateOverallFeedbackText, 
    setSolutionSteps, updateSolutionStep,
    mergeInstructorNote, submitFinalFeedback,
    selectAssignment, setActiveStudent, syncAssignments
  } = useGradingStore();

  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
  const [instructorInput, setInstructorInput] = useState('');
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');
  const [copying, setCopying] = useState(false);

  // Sync assignments and assignment state from URL
  useEffect(() => {
    syncAssignments();
    if (assignmentId && currentAssignmentId !== assignmentId) {
      selectAssignment(assignmentId as string);
    }
  }, [assignmentId, currentAssignmentId, selectAssignment, syncAssignments]);

  const assignment = assignments[assignmentId as string] || (currentAssignmentId ? assignments[currentAssignmentId] : null);
  const activeStudent = assignment?.students.find(s => s.id === (activeStudentId || assignment.students[0]?.id));

  // Determine specific feedback for this student
  const studentOverallFeedback = useMemo(() => 
    activeStudent ? overallFeedback[activeStudent.id] : null
  , [overallFeedback, activeStudent]);

  const studentCriterionFeedbacks = useMemo(() => 
    activeStudent ? (criterionFeedbacks[activeStudent.id] || {}) : {}
  , [criterionFeedbacks, activeStudent]);

  // Generate overall feedback on mount if not present
  const confirmedCriteria = useMemo(() => {
    if (!activeStudent) return [];
    
    const activeCriteria = Object.values(activeStudent.criteria);
    const confirmed = activeCriteria
      .filter(c => studentCriterionFeedbacks[c.id]?.isConfirmed)
      .map(c => ({
        name: c.name,
        level: c.level,
        maxLevel: 5,
        feedbackText: studentCriterionFeedbacks[c.id]?.feedbackText ?? '',
      }));
    
    // FALLBACK DATA if no criteria were confirmed
    if (confirmed.length === 0) {
      return [
        { name: 'Architecture & Design', level: 4, maxLevel: 5, feedbackText: 'The system architecture demonstrates a solid understanding of modular design principles. Layer separation is clear, though some coupling persists in the utility layer.' },
        { name: 'Technical Implementation', level: 3, maxLevel: 5, feedbackText: 'Core technical requirements are met, but error handling across asynchronous boundaries needs more rigorous attention.' },
        { name: 'Documentation Quality', level: 5, maxLevel: 5, feedbackText: 'Exceptional documentation standards. API contracts are well-defined and samples are immediately runnable.' },
      ];
    }
    return confirmed;
  }, [activeStudent, studentCriterionFeedbacks]);

  useEffect(() => {
    if (!studentOverallFeedback && confirmedCriteria.length > 0 && activeStudent) {
      const content = generateOverallFeedback(confirmedCriteria, activeStudent.name);
      
      const sections = [
        `**Performance Snapshot**\n${content.performanceSnapshot}`,
        `**Strengths**\n${content.strengths.map(s => `• ${s}`).join('\n')}`,
        `**Key Gaps**\n${content.keyGaps.map(g => `• ${g}`).join('\n')}`,
        `**Improvement Direction**\n${content.improvementDirection.map(d => `• ${d}`).join('\n')}`,
        `**Closing Note**\n${content.closingNote}`,
      ];

      const docText = sections.join('\n\n');

      setOverallFeedback(activeStudent.id, {
        studentId: activeStudent.id,
        documentText: docText,
        originalDocumentText: docText,
        instructorNote: '',
        authorship: 'ai_generated',
        isSubmitted: false,
      });
    }
  }, [studentOverallFeedback, confirmedCriteria, activeStudent, setOverallFeedback]);

  const solutionSteps = useMemo(() => generateSolutionSteps(confirmedCriteria), [confirmedCriteria]);

  useEffect(() => {
    if (studentOverallFeedback && !studentOverallFeedback.solutionSteps && confirmedCriteria.length > 0 && activeStudent) {
      setSolutionSteps(activeStudent.id, solutionSteps);
    }
  }, [studentOverallFeedback, solutionSteps, setSolutionSteps, confirmedCriteria, activeStudent]);

  const displaySolutionSteps = studentOverallFeedback?.solutionSteps || solutionSteps;

  if (!assignment || !activeStudent) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Restoring Student Record…</p>
        </div>
      </div>
    );
  }

  // Handle final submission with sequential navigation
  const handleFinalSubmit = () => {
    if (!activeStudent || !assignment) return;

    // 1. Mark current student as submitted
    submitFinalFeedback(activeStudent.id);

    // 2. Find next student in roster
    const currentIndex = assignment.students.findIndex(s => s.id === activeStudent.id);
    const nextStudent = assignment.students[currentIndex + 1];

    if (nextStudent) {
      // 3. If there is a next student, move to them and go back to Desk
      setActiveStudent(nextStudent.id);
      router.push(`/dashboard/evaluation/${assignment.id}`);
    } else {
      // 4. If last student, finalize and go to results
      router.push('/dashboard/evaluation/results');
    }
  };

  const handleCopy = () => {
    if (studentOverallFeedback) {
      navigator.clipboard.writeText(studentOverallFeedback.documentText);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    }
  };

  const handleMerge = () => {
    if (instructorInput.trim() && activeStudent) {
      mergeInstructorNote(activeStudent.id, instructorInput.trim());
      if (studentOverallFeedback) {
        const merged = `**Instructor's Note**\n${instructorInput.trim()}\n\n${studentOverallFeedback.documentText}`;
        updateOverallFeedbackText(activeStudent.id, merged);
      }
      setInstructorInput('');
    }
  };

  const isAI = overallFeedback?.authorship === 'ai_generated';

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans select-none">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8 shrink-0 z-30">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-muted-foreground rounded-xl hover:bg-muted/50" onClick={() => window.history.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div style={{ width: '1px', height: '24px' }} className="bg-border" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-foreground tracking-tight">Final Feedback Summary</h2>
              <Badge variant="outline" className="text-[9px] h-4.5 px-1.5 rounded-sm font-mono tracking-tighter border-border bg-muted/30">STUDENT RECORD</Badge>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none grow-0">{activeStudent.name}</span>
               <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
               <span className="text-[10px] font-mono text-muted-foreground/50">{activeStudent.roll}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-2">
             <div className="text-[24px] font-black text-foreground leading-none font-mono">60<span className="text-[14px] text-muted-foreground/40 font-medium">/100</span></div>
             <Badge variant="outline" className="text-[9px] font-black h-4 px-1.5 bg-green-50 text-green-700 border-green-200 uppercase tracking-widest mt-1">Satisfactory</Badge>
          </div>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-muted">✕</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Criteria Recap */}
        <aside className="w-[320px] border-r border-border bg-background/50 flex flex-col shrink-0 backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-border bg-background/80 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">Criterion Feedback Recap</span>
            <Badge variant="secondary" className="text-[9px] font-bold h-5 px-2 bg-muted/50">{confirmedCriteria.length}</Badge>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2.5">
              {Object.values(activeStudent.criteria).map(c => {
                const fb = criterionFeedbacks[c.id];
                if (!fb?.isConfirmed) return null;
                return (
                  <CriteriaRecapCard
                    key={c.id}
                    name={c.name}
                    level={c.level}
                    tier={fb.tier}
                    tierLabel={fb.tierLabel}
                    feedbackSnippet={fb.feedbackText.slice(0, 150) + (fb.feedbackText.length > 150 ? '…' : '')}
                    isExpanded={!!expandedCriteria[c.id]}
                    onToggle={() => setExpandedCriteria(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                  />
                );
              })}
              {confirmedCriteria.length === 3 && (
                <div className="p-4 border border-dashed border-border rounded-xl bg-muted/5">
                   <p className="text-[9px] text-muted-foreground/50 uppercase font-black text-center">Using Evaluation Benchmarks</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Right: Overall Feedback + Solution Direction */}
        <section className="flex-1 flex flex-col overflow-hidden bg-[#fafafa]">
          <Tabs defaultValue="feedback" value={activeTab} onValueChange={(v) => setActiveTab(v as string)} className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-background flex items-center justify-center border-b border-border shrink-0 h-12">
               <div className="flex h-full">
                  <button 
                    onClick={() => setActiveTab('feedback')}
                    className={`px-8 h-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === 'feedback' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    <StarIcon className="w-3.5 h-3.5" /> Overall Feedback
                  </button>
                  <button 
                    onClick={() => setActiveTab('solution')}
                    className={`px-8 h-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === 'solution' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Solution Direction
                  </button>
               </div>
            </div>

            {/* Overall Feedback Tab */}
            <TabsContent value="feedback" className="flex-1 flex flex-col overflow-hidden outline-none">
              <ScrollArea className="flex-1 px-8 pt-8 pb-4">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Comprehensive Assessment Draft</div>
                    <Badge variant={isAI ? "secondary" : "outline"} className={`text-[9px] font-bold h-5 px-2.5 rounded-full ${isAI ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                       {isAI ? '✦ AI Generated' : '✎ Locally Adjusted'}
                    </Badge>
                  </div>

                  <div className="bg-background border border-border/60 rounded-[20px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] overflow-hidden relative">
                    <div 
                      className="p-10 text-[14px] leading-[1.85] text-foreground font-sans min-h-[500px] outline-none whitespace-pre-wrap cursor-text hover:bg-[#fdfdfd] transition-colors"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => activeStudent && updateOverallFeedbackText(activeStudent.id, e.currentTarget.innerText)}
                    >
                      {(studentOverallFeedback?.documentText || '').split('\n\n').map((block, i) => {
                        const [title, ...rest] = block.split('\n');
                        const isTitle = title.startsWith('**') && title.endsWith('**');
                        return (
                          <div key={i} className="mb-6 last:mb-0">
                            {isTitle ? (
                              <>
                                <div className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-foreground mb-3 flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-primary/20" /> {title.replace(/\*\*/g, '')}
                                </div>
                                <div className="text-muted-foreground/90 pl-4 border-l-2 border-border/40 ml-1">{rest.join('\n')}</div>
                              </>
                            ) : (
                              block
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Toolbar overlay */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                       <Button size="sm" variant="outline" className="h-8 px-3 text-[10px] font-bold rounded-lg bg-background shadow-sm hover:shadow-md transition-all gap-1.5" onClick={handleCopy}>
                          {copying ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />} {copying ? 'COPIED' : 'COPY'}
                       </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Enlarged Instructor Workspace Panel */}
              <div className="px-8 pb-8 pt-4 shrink-0 bg-[#fafafa]">
                 <div className="max-w-3xl mx-auto space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <div className="flex items-center gap-4">
                          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground">Instructor Note Workspace</span>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-[9px] font-black text-green-700/80 uppercase tracking-widest">Active Sink</span>
                          </div>
                       </div>
                       <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-red-600 gap-1.5 hover:bg-red-50">
                          <CircleDot className="w-3 h-3" /> Record Transcription
                       </Button>
                    </div>

                    <div className="relative group/panel">
                       <textarea 
                          value={instructorInput}
                          onChange={(e) => setInstructorInput(e.target.value)}
                          className="w-full min-h-[160px] text-[15px] leading-[1.75] text-foreground p-6 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.02)] focus:border-primary/40 focus:ring-0 bg-background transition-all placeholder:text-muted-foreground/30 placeholder:italic font-serif"
                          placeholder="Dictate or type your concluding remarks, specific references to the student's process, or encouraging closing notes..."
                       />
                       <div className="absolute right-4 bottom-4 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground/30 px-3 py-1 bg-muted/30 rounded-full">{instructorInput.length} chars</span>
                          <Button 
                            className="rounded-2xl h-10 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
                            onClick={handleMerge} 
                            disabled={!instructorInput.trim()}
                          >
                             Append to Summary <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>
            </TabsContent>

            {/* Solution Direction Tab */}
            <TabsContent value="solution" className="flex-1 overflow-hidden outline-none bg-[#fafafa]">
              <ScrollArea className="h-full p-8 font-sans">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col items-center text-center mb-10">
                     <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">Priority Improvement Roadmap</h3>
                     <p className="text-[13px] text-muted-foreground leading-relaxed max-w-lg">Targeted action plan based on identified gaps. Focus on critical items first for maximum impact on future assessments.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CRITICAL Column */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 px-1">
                          <div className="w-2 h-6 bg-red-500 rounded-full" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Priority 1 · Critical</span>
                       </div>
                       {displaySolutionSteps.filter(s => s.priority === 'critical').map((step, i) => (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-white border-1.5 border-red-100 rounded-[20px] p-6 shadow-[0_4px_16px_rgb(220,38,38,0.03)] hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                               <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                               <span className="text-[11px] font-black font-mono text-red-700 bg-red-50 px-2 rounded-full h-5 flex items-center">{step.score}</span>
                            </div>
                            <h4 className="text-[14px] font-bold text-foreground mb-4 leading-tight">{step.criterionName}</h4>
                            <div className="space-y-3">
                               {step.steps.map((s, j) => (
                                 <div key={j} className="flex gap-3 group/step">
                                    <div className="text-[10px] font-black text-red-200 mt-0.5">{j+1}.</div>
                                    <p 
                                       className="text-[12px] text-muted-foreground/90 leading-[1.6] outline-none cursor-text hover:bg-red-50/50 rounded-md transition-colors px-1 -ml-1 border-b border-transparent hover:border-red-100/50 focus:bg-red-50 focus:border-red-200/50"
                                       contentEditable
                                       suppressContentEditableWarning
                                       onBlur={(e) => updateSolutionStep(step.criterionName, j, e.currentTarget.innerText)}
                                    >
                                       {s}
                                    </p>
                                 </div>
                               ))}
                            </div>
                         </motion.div>
                       ))}
                       {displaySolutionSteps.filter(s => s.priority === 'critical').length === 0 && (
                         <div className="bg-muted/10 border-1.5 border-dashed border-border rounded-[20px] p-8 text-center">
                            <CheckCircle2 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">No Critical Gaps</p>
                         </div>
                       )}
                    </div>

                    {/* IMPORTANT Column */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 px-1">
                          <div className="w-2 h-6 bg-amber-500 rounded-full" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Priority 2 · Important</span>
                       </div>
                       {displaySolutionSteps.filter(s => s.priority === 'important').map((step, i) => (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-white border-1.5 border-amber-100 rounded-[20px] p-6 shadow-[0_4px_16px_rgb(217,119,6,0.03)] hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                               <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Lightbulb className="w-4 h-4 text-amber-600" /></div>
                               <span className="text-[11px] font-black font-mono text-amber-700 bg-amber-50 px-2 rounded-full h-5 flex items-center">{step.score}</span>
                            </div>
                            <h4 className="text-[14px] font-bold text-foreground mb-4 leading-tight">{step.criterionName}</h4>
                            <div className="space-y-3">
                               {step.steps.map((s, j) => (
                                 <div key={j} className="flex gap-3 group/step">
                                    <div className="text-[10px] font-black text-amber-200 mt-0.5">{j+1}.</div>
                                    <p 
                                       className="text-[12px] text-muted-foreground/90 leading-[1.6] outline-none cursor-text hover:bg-amber-50/50 rounded-md transition-colors px-1 -ml-1 border-b border-transparent hover:border-amber-100/50 focus:bg-amber-50 focus:border-amber-200/50"
                                       contentEditable
                                       suppressContentEditableWarning
                                       onBlur={(e) => updateSolutionStep(step.criterionName, j, e.currentTarget.innerText)}
                                    >
                                       {s}
                                    </p>
                                 </div>
                               ))}
                            </div>
                         </motion.div>
                       ))}
                    </div>

                    {/* MAINTAIN Column */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 px-1">
                          <div className="w-2 h-6 bg-green-500 rounded-full" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Maintain · Well Done</span>
                       </div>
                       {displaySolutionSteps.filter(s => s.priority === 'maintain').map((step, i) => (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-white border-1.5 border-green-100 rounded-[20px] p-6 shadow-[0_4px_16px_rgb(5,150,105,0.03)] hover:shadow-md transition-all opacity-80 filter grayscale-[20%]">
                            <div className="flex items-center justify-between mb-4">
                               <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><StarIcon className="w-4 h-4 text-green-600" /></div>
                               <span className="text-[11px] font-black font-mono text-green-700 bg-green-50 px-2 rounded-full h-5 flex items-center">{step.score}</span>
                            </div>
                            <h4 className="text-[14px] font-bold text-foreground mb-4 leading-tight">{step.criterionName}</h4>
                            <div className="space-y-3">
                               {step.steps.map((s, j) => (
                                 <div key={j} className="flex gap-3 group/step">
                                    <div className="w-1 h-1 rounded-full bg-green-200 mt-2" />
                                    <p 
                                       className="text-[11px] text-muted-foreground/70 leading-[1.6] italic outline-none cursor-text hover:bg-green-50/50 rounded-md transition-colors px-1 -ml-1 border-b border-transparent hover:border-green-100/50 focus:bg-green-50 focus:border-green-200/50"
                                       contentEditable
                                       suppressContentEditableWarning
                                       onBlur={(e) => updateSolutionStep(step.criterionName, j, e.currentTarget.innerText)}
                                    >
                                       {s}
                                    </p>
                                 </div>
                               ))}
                            </div>
                         </motion.div>
                       ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Bottom Bar */}
      <footer className="h-20 border-t border-border bg-background flex items-center justify-between px-8 shrink-0 z-50">
        <Button variant="ghost" size="sm" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest gap-2 hover:bg-muted" onClick={() => window.history.back()}>
          <ChevronLeft className="w-4 h-4" /> Criteria Desk
        </Button>
        <div className="flex items-center gap-6">
           <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">State: Ready for Publication</span>
              <span className="text-[10px] font-medium text-muted-foreground/60">Final draft cached for cohort scheduling</span>
           </div>
           <Button 
            className="h-12 px-12 text-[12px] font-black uppercase tracking-widest rounded-full gap-3 shadow-[0_10px_40px_rgba(59,130,246,0.25)] hover:shadow-[0_15px_50px_rgba(59,130,246,0.35)] hover:bg-primary/90 transition-all active:scale-[0.98]" 
            onClick={handleFinalSubmit}
           >
              <Send className="w-4 h-4" /> Submit Grade & Feedback
           </Button>
        </div>
      </footer>
    </div>
  );
}
