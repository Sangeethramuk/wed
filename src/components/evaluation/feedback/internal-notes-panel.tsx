'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  MessageSquare, 
  Plus, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  Check,
  Edit2,
  Trash2,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { useGradingStore, type InternalNote } from '@/lib/store/grading-store';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


export function InternalNotesPanel() {
  const { 
    internalNotes, 
    addInternalNote, 
    updateInternalNote, 
    deleteInternalNote, 
    markNotesAsSeen, 
    activeStudentId 
  } = useGradingStore();
  
  const [newNoteText, setNewNoteText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const notes = (activeStudentId ? internalNotes[activeStudentId] : null) ?? [];
  
  // Mark as seen when panel is opened

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!carouselApi) return;
    
    setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  useEffect(() => {
    if (activeStudentId) {
      markNotesAsSeen(activeStudentId);
    }
  }, [activeStudentId, markNotesAsSeen, notes.length]);

  const canAdd = newNoteText.trim().length > 0;

  const handleAddNote = () => {
    if (!canAdd) return;
    addInternalNote(activeStudentId ?? '', {
      author: 'Dr. J. Desai',
      role: 'Primary Grader',
      initials: 'JD',
      avatarColor: 'black',
      text: newNoteText.trim(),
      category: 'Other',
      isFlagged: false,
      isOwn: true,
      isSeen: true,
    });
    setNewNoteText('');
    
    // Scroll to the end of the carousel after a short delay
    setTimeout(() => {
      carouselApi?.scrollTo(notes.length);
    }, 100);
  };

  const startEditing = (note: InternalNote) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const handleUpdate = () => {
    if (editingId && activeStudentId) {
      updateInternalNote(activeStudentId, editingId, editingText);
      setEditingId(null);
    }
  };

  const confirmDelete = (noteId: string) => {
    setDeleteId(noteId);
  };

  const handleDelete = () => {
    if (deleteId && activeStudentId) {
      deleteInternalNote(activeStudentId, deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col w-[440px] max-h-[650px] bg-white font-sans rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" />
          <h3 className="text-[15px] font-bold text-slate-900">Internal Notes</h3>
          <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
            Instructors Only
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-slate-500 font-medium">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </span>
          <ChevronUp className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 bg-slate-50/30">
        <div className="flex flex-col min-h-full">
          {/* Shared by Instructors Section */}
          <AnimatePresence mode="wait">
            {notes.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 border-b border-slate-100 bg-[#F4F9FF]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Shared by instructors</span>
                  </div>
                  {notes.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => carouselApi?.scrollPrev()}
                        className="p-0.5 hover:bg-blue-100 rounded transition-colors disabled:opacity-30"
                        disabled={currentSlide === 1}
                      >
                        <ChevronLeft className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <span className="text-[11px] font-bold text-blue-400 tabular-nums min-w-[28px] text-center">
                        {currentSlide} / {notes.length}
                      </span>
                      <button 
                        onClick={() => carouselApi?.scrollNext()}
                        className="p-0.5 hover:bg-blue-100 rounded transition-colors disabled:opacity-30"
                        disabled={currentSlide === notes.length}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                    </div>
                  )}
                </div>

                <Carousel 
                  setApi={setCarouselApi}
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: false
                  }}
                >
                  <CarouselContent className="-ml-0">
                    {notes.map((note) => (
                      <CarouselItem key={note.id} className="pl-0">
                        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-3.5 relative min-h-[110px] flex flex-col">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                              {note.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="text-[13px] font-bold text-slate-900 leading-tight truncate">{note.author}</div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-medium text-slate-400">
                                    {note.timestamp}
                                  </span>
                                  {note.isOwn && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger
                                        render={
                                          <button className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                                            <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                                          </button>
                                        }
                                      />
                                      <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuItem onClick={() => startEditing(note)} className="text-xs">
                                          <Edit2 className="w-3 h-3 mr-2" /> Edit Note
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => confirmDelete(note.id)} variant="destructive" className="text-xs">
                                          <Trash2 className="w-3 h-3 mr-2" /> Delete Note
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium leading-none">{note.role}</div>
                            </div>
                          </div>

                          <div className="flex-1">
                            {editingId === note.id ? (
                              <div className="space-y-2 mt-1">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-200 min-h-[60px] resize-none"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-1.5">
                                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-[10px] font-bold">
                                    Cancel
                                  </Button>
                                  <Button size="sm" onClick={handleUpdate} className="h-7 text-[10px] font-bold bg-blue-600 hover:bg-blue-700">
                                    Save changes
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-[13px] text-slate-700 leading-relaxed">
                                  {note.text}
                                </p>
                                {note.isEdited && (
                                  <span className="text-[10px] text-slate-400 font-medium italic mt-2 block">
                                    (Edited)
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {notes.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-blue-200" />
              </div>
              <div className="space-y-1">
                <p className="text-[15px] font-bold text-slate-900">No instructor notes</p>
                <p className="text-[13px] text-slate-400">Collaborate with other instructors by adding a note about this submission.</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer / Add Note */}
      <div className="p-5 border-t border-slate-100 space-y-4 bg-white shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-slate-900">Add an internal note</span>
          <span className="text-[11px] text-slate-400 font-medium italic">Visible to all instructors</span>
        </div>

        <textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add an internal note for instructors..."
          rows={2}
          className="w-full text-[13px] text-slate-700 bg-white border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-300 placeholder:text-slate-300 transition-all"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <EyeOff className="w-4 h-4 text-slate-300" />
            <span className="text-[11px] font-medium">Not shown to student</span>
          </div>
          <Button
            className="h-9 px-5 text-[12px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors border-none"
            onClick={handleAddNote}
            disabled={!canAdd}
          >
            Add Note
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Delete note?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone and will remove the note for all instructors.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-bold h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-none text-xs font-bold h-9"
            >
              Delete note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
