'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGradingStore } from '@/lib/store/grading-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function FeedbackPage() {
  const { id: assignmentId } = useParams();
  const router = useRouter();
  const {
    currentAssignmentId, assignments, activeStudentId,
    overallFeedback, selectAssignment, setActiveStudent, syncAssignments
  } = useGradingStore();

  // Sync assignments and assignment state from URL
  useEffect(() => {
    syncAssignments();
    if (assignmentId && currentAssignmentId !== assignmentId) {
      selectAssignment(assignmentId as string);
    }
  }, [assignmentId, currentAssignmentId, selectAssignment, syncAssignments]);

  const assignment =
    assignments[assignmentId as string] ||
    (currentAssignmentId ? assignments[currentAssignmentId] : null) ||
    Object.values(assignments)[0] ||
    null;

  const activeStudent =
    assignment?.students.find(s => s.id === activeStudentId) ||
    assignment?.students[0] ||
    null;

  if (!assignment || !activeStudent) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground/40">Loading Student Record…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      {/* Redesign Foundation Placeholder */}
      <header className="h-16 border-b border-border bg-background flex items-center px-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="ml-4 text-lg font-bold">Redesigning Overall Feedback</h1>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Ready for Redesign</h2>
          <p className="text-muted-foreground">Current content cleared. Awaiting new design specifications.</p>
        </div>
      </main>
    </div>
  );
}
