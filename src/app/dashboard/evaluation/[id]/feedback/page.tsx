'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGradingStore } from '@/lib/store/grading-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronDown, ChevronUp,
  CheckCircle2, Sparkles, Pencil, RotateCcw, Copy,
  Mic, MicOff, Square,
  AlertTriangle, Star, CircleDot, Lightbulb,
  ArrowRight, Send, Undo2,
} from 'lucide-react';
import { generateOverallFeedback, generateSolutionSteps, getTierColors, type FeedbackTier } from '@/lib/feedback-generator';

// ── Criteria Recap Card (left panel) ──
function CriteriaRecapCard({ name, level, tier, tierLabel, feedbackSnippet, isExpanded, onToggle }: {
  name: string; level: number; tier: FeedbackTier; tierLabel: string;
  feedbackSnippet: string; isExpanded: boolean; onToggle: () => void;
}) {
  const colors = getTierColors(tier);
  const TierIcon = tier === 'perfect' ? Star : tier === 'minor' ? CircleDot : tier === 'gap' ? Lightbulb : AlertTriangle;
  return (
    <div className={`rounded-[10px] border ${colors.border} ${colors.bg} overflow-hidden transition-all`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 bg-transparent border-none cursor-pointer font-sans text-left">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-6 h-6 rounded-md ${colors.badge} flex items-center justify-center shrink-0`}>
            <TierIcon className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-foreground truncate">{name}</div>
            <div className={`text-[9px] font-bold uppercase tracking-[0.06em] ${colors.text}`}>{tierLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[13px] font-semibold text-foreground">{level}<span className="text-[10px] text-muted-foreground/60">/5</span></span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 pt-0">
              <p className="text-[11px] text-muted-foreground leading-[1.65]">{feedbackSnippet}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Voice Recorder (dummy prototype) ──
function VoiceRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const stop = () => {
    setIsRecording(false);
    setElapsed(0);
    onTranscript('The student shows good foundational understanding but needs to work on connecting theory to practice more explicitly.');
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[10px] gap-1 text-muted-foreground" onClick={() => setIsRecording(true)}>
          <Mic className="w-3 h-3" /> Voice Note
        </Button>
      ) : (
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-200">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono text-red-600">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>
          <button onClick={stop} className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border-none cursor-pointer">
            <Square className="w-2.5 h-2.5 text-white fill-white" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function FeedbackPage() {
  const {
    currentAssignmentId, assignments, activeStudentId,
    criterionFeedbacks, overallFeedback,
    setOverallFeedback, updateOverallFeedbackText, mergeInstructorNote, submitFinalFeedback,
  } = useGradingStore();

  const assignment = currentAssignmentId ? assignments[currentAssignmentId] : null;
  const activeStudent = assignment?.students.find(s => s.id === (activeStudentId || assignment.students[0]?.id));
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});
  const [instructorInput, setInstructorInput] = useState('');
  const [showInstructorPanel, setShowInstructorPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');

  // Generate overall feedback on mount if not present
  const confirmedCriteria = useMemo(() => {
    if (!activeStudent) return [];
    return Object.values(activeStudent.criteria).filter(c => criterionFeedbacks[c.id]?.isConfirmed).map(c => ({
      name: c.name,
      level: criterionFeedbacks[c.id] ? (c.level) : c.level,
      maxLevel: 5,
      feedbackText: criterionFeedbacks[c.id]?.feedbackText ?? '',
    }));
  }, [activeStudent, criterionFeedbacks]);

  useEffect(() => {
    if (!overallFeedback && confirmedCriteria.length > 0 && activeStudent) {
      const content = generateOverallFeedback(confirmedCriteria, activeStudent.name);
      const docText = [
        `**Performance Snapshot**\n${content.performanceSnapshot}`,
        `**Strengths**\n${content.strengths.map(s => `• ${s}`).join('\n')}`,
        `**Key Gaps**\n${content.keyGaps.map(g => `• ${g}`).join('\n')}`,
        `**Improvement Direction**\n${content.improvementDirection.map(d => `• ${d}`).join('\n')}`,
        `**Closing Note**\n${content.closingNote}`,
      ].join('\n\n');

      setOverallFeedback({
        documentText: docText,
        originalDocumentText: docText,
        instructorNote: '',
        authorship: 'ai_generated',
        isSubmitted: false,
      });
    }
  }, [overallFeedback, confirmedCriteria, activeStudent, setOverallFeedback]);

  const solutionSteps = useMemo(() => generateSolutionSteps(confirmedCriteria), [confirmedCriteria]);

  if (!assignment || !activeStudent) return null;
  if (overallFeedback?.isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full bg-background border border-border rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-3">Feedback Submitted</h1>
          <p className="text-[13px] text-muted-foreground mb-8 leading-relaxed">
            All criterion feedback and overall assessment have been finalized for <strong>{activeStudent.name}</strong>. The audit trail is locked.
          </p>
          <Button onClick={() => window.location.href = '/dashboard/evaluation'} className="w-full h-11 rounded-lg">
            Return to Triage Desk
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleCopy = () => {
    if (overallFeedback) navigator.clipboard.writeText(overallFeedback.documentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMerge = () => {
    if (instructorInput.trim()) {
      mergeInstructorNote(instructorInput.trim());
      if (overallFeedback) {
        const merged = `**Instructor Note**\n${instructorInput.trim()}\n\n${overallFeedback.documentText}`;
        updateOverallFeedbackText(merged);
      }
      setInstructorInput('');
      setShowInstructorPanel(false);
    }
  };

  const handleRevert = () => {
    if (overallFeedback) updateOverallFeedbackText(overallFeedback.originalDocumentText);
  };

  const charCount = overallFeedback?.documentText.length ?? 0;
  const isEdited = overallFeedback?.authorship === 'instructor_edited';

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans select-none">
      {/* Header */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground rounded-lg" onClick={() => window.history.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] font-mono leading-none mb-1">Overall Feedback</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{activeStudent.name}</span>
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 rounded font-mono tracking-tighter border-border">{activeStudent.roll}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[9px] font-bold h-5 ${isEdited ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
            {isEdited ? <><Pencil className="w-2.5 h-2.5 mr-1" /> Instructor Edited</> : <><Sparkles className="w-2.5 h-2.5 mr-1" /> AI Generated</>}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Criteria Recap */}
        <div className="w-[300px] border-r border-border bg-background flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60">Criterion Feedback ({confirmedCriteria.length})</span>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
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
            </div>
          </ScrollArea>
        </div>

        {/* Right: Overall Feedback + Solution Direction */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="feedback" value={activeTab} onValueChange={(v) => setActiveTab(v as string)} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b border-border shrink-0">
              <TabsList variant="line">
                <TabsTrigger value="feedback">Overall Feedback</TabsTrigger>
                <TabsTrigger value="solution">Solution Direction</TabsTrigger>
              </TabsList>
            </div>

            {/* Overall Feedback Tab */}
            <TabsContent value="feedback" className="flex-1 flex flex-col overflow-hidden">
              {/* Edit bar */}
              {isEdited && (
                <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                  <span className="text-[10px] text-amber-700 font-medium">Document has been edited</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-amber-700 gap-1" onClick={handleRevert}>
                    <Undo2 className="w-3 h-3" /> Revert to AI version
                  </Button>
                </div>
              )}

              <ScrollArea className="flex-1 p-6">
                <div className="max-w-2xl mx-auto">
                  <textarea
                    value={overallFeedback?.documentText ?? ''}
                    onChange={(e) => updateOverallFeedbackText(e.target.value)}
                    className="w-full text-[13px] leading-[1.8] text-foreground bg-transparent border border-border rounded-xl p-6 resize-y focus:outline-none focus:border-primary font-sans min-h-[500px] transition-colors"
                  />
                </div>
              </ScrollArea>

              {/* Toolbar */}
              <div className="px-6 py-2 border-t border-border bg-background flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[10px] gap-1 text-muted-foreground" onClick={handleCopy}>
                    <Copy className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <VoiceRecorder onTranscript={(text) => setInstructorInput(prev => prev ? prev + ' ' + text : text)} />
                  <span className="text-[9px] text-muted-foreground font-mono">{charCount} chars</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[10px] gap-1 text-muted-foreground" onClick={() => setShowInstructorPanel(!showInstructorPanel)}>
                  <Pencil className="w-3 h-3" /> {showInstructorPanel ? 'Hide' : 'Add'} Instructor Note
                </Button>
              </div>

              {/* Instructor input panel */}
              <AnimatePresence>
                {showInstructorPanel && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                    <div className="px-6 py-3 bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold tracking-[0.08em] uppercase text-muted-foreground/60">Personal Observation</span>
                        <span className="text-[9px] text-muted-foreground">{instructorInput.length} chars</span>
                      </div>
                      <textarea
                        value={instructorInput}
                        onChange={(e) => setInstructorInput(e.target.value)}
                        placeholder="Add observations that should appear at the top of the feedback document…"
                        rows={3}
                        className="w-full text-[12px] text-foreground leading-[1.65] bg-background border border-border rounded-md p-2.5 resize-none focus:outline-none focus:border-primary font-sans min-h-[72px] transition-colors"
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm" className="h-7 px-3.5 text-[10px] gap-1" onClick={handleMerge} disabled={!instructorInput.trim()}>
                          <ArrowRight className="w-3 h-3" /> Include in Feedback
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Solution Direction Tab */}
            <TabsContent value="solution" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <div className="max-w-2xl mx-auto space-y-3">
                  <div className="mb-4">
                    <h3 className="text-[13px] font-semibold text-foreground mb-1">Priority Action Plan</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Improvement steps ordered by impact — address critical items first.</p>
                  </div>
                  {solutionSteps.map((step, i) => {
                    const prioStyles = step.priority === 'critical'
                      ? { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: AlertTriangle }
                      : step.priority === 'important'
                      ? { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: Lightbulb }
                      : { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', icon: Star };
                    const PIcon = prioStyles.icon;
                    return (
                      <div key={i} className={`rounded-[10px] border ${prioStyles.border} ${prioStyles.bg} p-4`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <PIcon className={`w-3.5 h-3.5 ${step.priority === 'critical' ? 'text-red-600' : step.priority === 'important' ? 'text-amber-600' : 'text-green-600'}`} />
                            <span className="text-[12px] font-semibold text-foreground">{step.criterionName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[8px] font-bold h-4 ${prioStyles.badge}`}>
                              {step.priority === 'critical' ? 'P1 · Critical' : step.priority === 'important' ? 'P2 · Important' : 'Maintain'}
                            </Badge>
                            <span className="text-[11px] font-mono text-muted-foreground">{step.score}</span>
                          </div>
                        </div>
                        <ol className="space-y-1.5 ml-5">
                          {step.steps.map((s, j) => (
                            <li key={j} className="text-[11px] text-muted-foreground leading-[1.6] list-decimal">{s}</li>
                          ))}
                        </ol>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="h-14 border-t border-border bg-background flex items-center justify-between px-6 shrink-0">
        <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground gap-1" onClick={() => window.history.back()}>
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Criteria
        </Button>
        <Button className="h-9 px-6 text-[12px] font-semibold gap-1.5" onClick={submitFinalFeedback}>
          <Send className="w-3.5 h-3.5" /> Submit Grade
        </Button>
      </footer>
    </div>
  );
}
