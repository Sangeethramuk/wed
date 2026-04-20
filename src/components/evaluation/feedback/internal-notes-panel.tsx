'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  AlertTriangle, 
  BookOpen, 
  Scale, 
  Shield, 
  Plus, 
  Eye,
} from 'lucide-react';
import { useGradingStore, type InternalNote } from '@/lib/store/grading-store';
import { motion, AnimatePresence } from 'framer-motion';
import { statusStyles } from '@/lib/design-tokens';

const CATEGORY_OPTIONS = [
  { value: 'Medical Leave', icon: AlertTriangle, label: 'Medical Leave' },
  { value: 'Academic Context', icon: BookOpen, label: 'Academic Context' },
  { value: 'Grading Decision', icon: Scale, label: 'Grading Decision' },
  { value: 'Conduct', icon: Shield, label: 'Conduct' },
  { value: 'Other', icon: MessageSquare, label: 'Other' },
] as const;

function getAvatarColor(color: string) {
  switch (color) {
    case 'purple': return 'bg-primary';
    case 'teal': return 'bg-teal-500';
    case 'coral': return 'bg-orange-500';
    default: return 'bg-primary';
  }
}

function getCategoryStyle(cat: string) {
  switch (cat) {
    case 'Medical Leave': return `${statusStyles.error.bg} ${statusStyles.error.text} ${statusStyles.error.border}`;
    case 'Academic Context': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Grading Decision': return 'bg-primary/10 text-primary border-primary/20';
    case 'Conduct': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function InternalNotesPanel() {
  const { internalNotes, addInternalNote, activeStudentId } = useGradingStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const notes = (activeStudentId ? internalNotes[activeStudentId] : null) ?? [];
  const totalNotes = notes.length;

  const canAdd = newNoteText.trim().length > 0 && selectedCategory;

  const handleAddNote = () => {
    if (!canAdd) return;
    addInternalNote(activeStudentId ?? '', {
      author: 'You (Dr. J. Desai)',
      role: 'Primary Grader',
      initials: 'JD',
      avatarColor: 'purple',
      text: newNoteText.trim(),
      category: selectedCategory as InternalNote['category'],
      isFlagged: false,
      isOwn: true,
    });
    setNewNoteText('');
    setSelectedCategory('');
    // Navigate to the newly added note
    setTimeout(() => setCurrentNoteIdx(totalNotes), 50);
  };

  const goToNote = (idx: number) => {
    if (idx >= 0 && idx < totalNotes) setCurrentNoteIdx(idx);
  };

  return (
    <div className="border-t border-border bg-background">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors bg-transparent border-none cursor-pointer font-sans"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="eyebrow text-foreground/70">
            Internal Notes
          </span>
          <Badge variant="outline" className="text-xs font-bold h-4 bg-amber-50 text-amber-700 border-amber-200">
            INSTRUCTORS ONLY
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            {totalNotes} note{totalNotes !== 1 ? 's' : ''}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Note carousel */}
            {totalNotes > 0 && (
              <div className="px-4 pt-2">
                {/* Nav */}
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow text-muted-foreground/60">
                    Shared by instructors
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => goToNote(currentNoteIdx - 1)}
                      disabled={currentNoteIdx === 0}
                      className="w-5 h-5 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center text-xs cursor-pointer disabled:opacity-30 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >‹</button>
                    <span className="text-xs text-muted-foreground font-mono min-w-[28px] text-center">
                      {currentNoteIdx + 1} / {totalNotes}
                    </span>
                    <button
                      onClick={() => goToNote(currentNoteIdx + 1)}
                      disabled={currentNoteIdx >= totalNotes - 1}
                      className="w-5 h-5 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center text-xs cursor-pointer disabled:opacity-30 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >›</button>
                  </div>
                </div>

                {/* Note card */}
                <AnimatePresence mode="wait">
                  {notes[currentNoteIdx] && (
                    <motion.div
                      key={notes[currentNoteIdx].id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className={`rounded-[10px] border-[1.5px] p-3 mb-1 ${
                        notes[currentNoteIdx].isOwn
                          ? 'border-primary/30 bg-primary/5'
                          : notes[currentNoteIdx].isFlagged
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-full ${getAvatarColor(notes[currentNoteIdx].avatarColor)} flex items-center justify-center text-xs font-bold text-white`}>
                          {notes[currentNoteIdx].initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground">{notes[currentNoteIdx].author}</div>
                          <div className="text-xs text-muted-foreground">{notes[currentNoteIdx].role}</div>
                        </div>
                        {notes[currentNoteIdx].isFlagged && (
                          <Badge variant="outline" className="text-xs font-bold h-4 bg-amber-50 text-amber-700 border-amber-200">
                            Contextual
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                          {notes[currentNoteIdx].timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-[1.65]">
                        {notes[currentNoteIdx].text}
                      </p>
                      <Badge
                        variant="outline"
                        className={`eyebrow h-4 mt-2 ${getCategoryStyle(notes[currentNoteIdx].category)}`}
                      >
                        {notes[currentNoteIdx].category}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-1.5 py-1.5">
                  {notes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToNote(i)}
                      className={`rounded-full transition-all cursor-pointer border-none ${
                        i === currentNoteIdx
                          ? 'w-3.5 h-1.5 bg-primary rounded-sm'
                          : 'w-1.5 h-1.5 bg-border hover:bg-muted-foreground/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add new note */}
            <div className="px-4 pb-3 pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="eyebrow text-muted-foreground/60">
                  Add a Note
                </span>
                <span className="text-xs text-muted-foreground">
                  Visible to all instructors
                </span>
              </div>

              {/* Category select */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs font-medium px-3 py-1.5 rounded-full border border-border/70 bg-background text-foreground mb-2 font-sans focus:outline-none focus:border-primary cursor-pointer appearance-none"
              >
                <option value="" disabled>Select a category…</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add context, observations, or decisions that other instructors should know…"
                rows={2}
                className="w-full text-xs text-foreground leading-[1.65] bg-muted/20 border border-border rounded-md p-2.5 resize-none focus:outline-none focus:border-primary font-sans min-h-[56px] transition-colors"
              />

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  Not shown to student
                </div>
                <Button
                  size="sm"
                  className="h-7 px-3.5 text-xs font-semibold gap-1 ml-auto"
                  onClick={handleAddNote}
                  disabled={!canAdd}
                >
                  <Plus className="w-3 h-3" /> Add Note
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
