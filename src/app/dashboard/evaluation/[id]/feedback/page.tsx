'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  ChevronLeft, 
  Send, 
  Search, 
  HelpCircle, 
  Bell, 
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';

import { useGradingStore } from '@/lib/store/grading-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  generateDynamicOverallFeedback, 
  GeneratedOverallFeedback,
  CriterionData
} from '@/lib/feedback-logic';

import { CriterionRecapSidebar } from '@/components/evaluation/feedback/criterion-recap-sidebar';
import { FeedbackDraftPanel } from '@/components/evaluation/feedback/feedback-draft-panel';
import { InstructorFeedbackPanel } from '@/components/evaluation/feedback/instructor-feedback-panel';

export default function FeedbackPage() {
  const { id: assignmentId } = useParams();
  const router = useRouter();
  const {
    currentAssignmentId, assignments, activeStudentId,
    studentCriterionFeedbacks, overallFeedback,
    setOverallFeedback, updateOverallFeedbackText,
    submitFinalFeedback, setActiveStudent, syncAssignments
  } = useGradingStore();

  const [mode, setMode] = useState<'standard' | 'detailed'>('standard');
  const [isSaving, setIsSaving] = useState(false);
  const [editedSections, setEditedSections] = useState<Set<string>>(new Set());
  const [instructorNote, setInstructorNote] = useState('');

  // Sync assignments from store
  useEffect(() => {
    syncAssignments();
    if (assignmentId && currentAssignmentId !== assignmentId) {
      // selectAssignment(assignmentId as string);
    }
  }, [assignmentId, currentAssignmentId, syncAssignments]);

  const assignment = useMemo(() => 
    assignments[assignmentId as string] || Object.values(assignments)[0] || null
  , [assignments, assignmentId]);

  const activeStudent = useMemo(() => 
    assignment?.students.find(s => s.id === activeStudentId) || assignment?.students[0] || null
  , [assignment, activeStudentId]);

  // Transform store data into CriterionData for the logic & sidebar
  const confirmedCriteria: CriterionData[] = useMemo(() => {
    if (!activeStudent) return [];
    
    const storeCriteria = Object.values(activeStudent.criteria)
      .filter(c => studentCriterionFeedbacks?.[c.id])
      .map(c => ({
        name: c.name,
        score: c.level,
        maxScore: 10,
        feedbackText: studentCriterionFeedbacks[c.id]?.feedbackText || '',
        tier: studentCriterionFeedbacks[c.id]?.tier || 'minor',
        tierLabel: studentCriterionFeedbacks[c.id]?.tierLabel || 'Approaching Expectations'
      }));

    // FALLBACK DATA if no criteria were confirmed
    if (storeCriteria.length === 0) {
      return [
        { name: 'Architecture & Design', score: 8, maxScore: 10, feedbackText: 'The system architecture demonstrates a solid understanding of modular design principles. Layer separation is clear, though some coupling persists in the utility layer.', tier: 'minor', tierLabel: 'Meets Expectations' },
        { name: 'Technical Implementation', score: 6, maxScore: 10, feedbackText: 'Core technical requirements are met, but error handling across asynchronous boundaries needs more rigorous attention.', tier: 'gap', tierLabel: 'Approaching Expectations' },
        { name: 'Documentation Quality', score: 10, maxScore: 10, feedbackText: 'Exceptional documentation standards. API contracts are well-defined and samples are immediately runnable.', tier: 'perfect', tierLabel: 'Exceeds Expectations' },
      ];
    }
    return storeCriteria;
  }, [activeStudent, studentCriterionFeedbacks]);

  // Initial feedback generation
  const [feedbackDraft, setFeedbackDraft] = useState<GeneratedOverallFeedback | null>(null);

  useEffect(() => {
    if (activeStudent && !feedbackDraft) {
      const generated = generateDynamicOverallFeedback(confirmedCriteria, activeStudent.name, mode);
      setFeedbackDraft(generated);
    }
  }, [confirmedCriteria, activeStudent, feedbackDraft, mode]);

  // Handle section updates (autosave simulation)
  const handleUpdateSection = (section: keyof GeneratedOverallFeedback, value: string | string[]) => {
    if (!feedbackDraft) return;
    
    setFeedbackDraft(prev => prev ? ({ ...prev, [section]: value }) : null);
    setEditedSections(prev => new Set(prev).add(section));
    
    // Simulate autosave
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  // Handle AI refinements
  const handleRefine = (section: keyof GeneratedOverallFeedback, type: string) => {
    if (!feedbackDraft) return;
    setIsSaving(true);
    
    setTimeout(() => {
      // Mocked refinement logic
      const current = feedbackDraft[section];
      let newValue = current;
      
      if (type === 'shorter' && typeof current === 'string') {
        newValue = current.split('.')[0] + '.';
      } else if (type === 'regen') {
        const fresh = generateDynamicOverallFeedback(confirmedCriteria, activeStudent!.name, mode);
        newValue = fresh[section];
      }
      
      setFeedbackDraft(prev => prev ? ({ ...prev, [section]: newValue }) : null);
      setIsSaving(false);
      toast.info(`${section.replace(/([A-Z])/g, ' $1')} refined: ${type}`);
    }, 600);
  };

  const handleModeChange = (newMode: 'standard' | 'detailed') => {
    setMode(newMode);
    if (activeStudent) {
      const regenerated = generateDynamicOverallFeedback(confirmedCriteria, activeStudent.name, newMode);
      setFeedbackDraft(regenerated);
    }
  };

  // Final submission logic
  const handleFinalSubmit = () => {
    if (!activeStudent || !assignment) return;

    submitFinalFeedback(activeStudent.id);
    
    toast.success(`Grades submitted for ${activeStudent.name}`, {
      description: "Opening next student's paper...",
    });

    // Compute next student ID (STU-NNN sequence)
    const match = activeStudent.id.match(/^STU-(\d+)$/);
    let nextId: string | null = null;
    
    if (match) {
      const currentNum = parseInt(match[1], 10);
      if (currentNum < 159) {
        nextId = `STU-${currentNum + 1}`;
      }
    }

    setTimeout(() => {
      if (nextId) {
        setActiveStudent(nextId);
        router.push(`/dashboard/evaluation/${assignmentId}/grading?studentId=${nextId}`);
      } else {
        router.push(`/dashboard/evaluation/${assignmentId}`);
      }
    }, 1000);
  };

  if (!assignment || !activeStudent || !feedbackDraft) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#1F4E8C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Restoring Academic State…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-sans select-none overflow-hidden">
      {/* 1:1 Layout Header - Cleaned up */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-lg hover:bg-slate-50">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Button>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Final Feedback Summary</h2>
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 rounded-sm font-bold tracking-widest uppercase border-slate-200 bg-slate-50 text-slate-400">STUDENT RECORD</Badge>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                {activeStudent.name} • {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <div className="text-[20px] font-bold text-slate-900 leading-none tabular-nums">
              60<span className="text-[11px] text-slate-400 font-medium">/100</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight text-[#F59E0B] mt-1">Satisfactory</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
            {/* profile image if needed */}
          </div>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Recap (Fixed Height) */}
        <CriterionRecapSidebar criteria={confirmedCriteria} />

        {/* Right Section: Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
          {/* Scrollable Draft Summary Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
            <FeedbackDraftPanel 
              feedback={feedbackDraft}
              mode={mode}
              onModeChange={handleModeChange}
              onUpdateSection={handleUpdateSection}
              isSaving={isSaving}
              onRefine={handleRefine}
              editedSections={editedSections}
            />
          </div>

          {/* Fixed Bottom Zone: Instructor Note + Footer */}
          <div className="shrink-0 border-t border-slate-200">
            <InstructorFeedbackPanel 
              value={instructorNote}
              onChange={(val) => {
                if (val === 'APPEND_TO_DRAFT') {
                  if (instructorNote.trim() && feedbackDraft) {
                    const currentSnapshot = feedbackDraft.performanceSnapshot;
                    const newSnapshot = `${instructorNote.trim()}\n\n${currentSnapshot}`;
                    handleUpdateSection('performanceSnapshot', newSnapshot);
                    setInstructorNote('');
                    toast.success('Note added to summary draft');
                  }
                } else {
                  setInstructorNote(val);
                }
              }}
            />

            {/* Footer: Submit & Navigation (Sticky) */}
            <footer className="h-20 border-t border-slate-100 bg-white flex items-center justify-between px-8 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[11px] font-bold text-slate-400 hover:text-[#1F4E8C] gap-2">
                <ChevronLeft className="w-3.5 h-3.5" /> Criteria desk
              </Button>
              
              <div className="flex items-center gap-8">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[11px] font-bold text-[#1F4E8C] tracking-tight uppercase">State: Ready for Publication</span>
                  <span className="text-[10px] font-medium text-slate-400">Final draft cached for cohort scheduling</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <Button
                    onClick={handleFinalSubmit}
                    className="bg-[#1F4E8C] hover:bg-[#1E3A5F] text-white rounded-lg px-10 py-5 h-auto text-[14px] font-bold shadow-[0_4px_12px_rgba(31,78,140,0.2)] transition-all active:scale-95 gap-2"
                  >
                    Submit & Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                  <span className="text-[10px] font-bold text-slate-400 mt-1.5 tracking-tight uppercase">Grade next student</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
          border: 2px solid white;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}
