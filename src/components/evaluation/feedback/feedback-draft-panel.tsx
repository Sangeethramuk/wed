'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronDown, 
  Type, 
  Zap, 
  MessageSquareText, 
  RotateCcw,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GeneratedOverallFeedback } from '@/lib/feedback-logic';

interface FeedbackDraftPanelProps {
  feedback: GeneratedOverallFeedback;
  mode: 'standard' | 'detailed';
  onModeChange: (mode: 'standard' | 'detailed') => void;
  onUpdateSection: (section: keyof GeneratedOverallFeedback, text: string) => void;
  isSaving: boolean;
  onRefine: (section: keyof GeneratedOverallFeedback, type: 'shorter' | 'specific' | 'softer' | 'stronger' | 'regen') => void;
  editedSections: Set<string>;
}

export function FeedbackDraftPanel({
  feedback,
  mode,
  onModeChange,
  onUpdateSection,
  isSaving,
  onRefine,
  editedSections
}: FeedbackDraftPanelProps) {
  const sections = [
    { key: 'instructorNote', label: "Instructor's Feedback" },
    { key: 'performanceSnapshot', label: 'Performance Snapshot' },
    { key: 'strengths', label: 'What Went Well' },
    { key: 'keyGaps', label: 'Improvement Focus' },
    { key: 'improvementDirection', label: 'Next Steps' },
    { key: 'closingNote', label: 'Closing Note' },
  ] as const;

  return (
    <div className="w-full bg-white px-8">
      <div className="max-w-3xl mx-auto py-2">
        {/* Header Area */}
        <div className="flex items-center justify-between mb-0">
          <div className="space-y-1">
            <h3 className="text-[12px] font-bold tracking-widest text-slate-400 uppercase">Comprehensive Assessment Draft</h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                Based on confirmed criteria scores
              </span>
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-[#10B981]'}`} />
                {isSaving ? 'Saving...' : 'Autosaved'}
              </span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onModeChange('standard')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                mode === 'standard' 
                  ? 'bg-white text-[#1F4E8C] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => onModeChange('detailed')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                mode === 'detailed' 
                  ? 'bg-white text-[#1F4E8C] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>

        {/* Feedback Sections */}
        <div className="space-y-3 relative">
          {sections.map((section) => {
            const content = feedback[section.key];
            const isEdited = editedSections.has(section.key);
            
            return (
              <div key={section.key} className="group relative">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1F4E8C]/20" />
                    <span className="text-[11px] font-bold tracking-widest text-slate-900 uppercase">
                      {section.label}
                    </span>
                    {isEdited && (
                      <Badge variant="outline" className="bg-blue-50 text-[#1F4E8C] border-[#1F4E8C]/20 text-[9px] font-bold h-4 px-1.5">
                        Edited by Instructor
                      </Badge>
                    )}
                  </div>

                  {/* Quick AI Actions - Cleanup as per request */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionButton icon={MessageSquareText} label="Softer Tone" onClick={() => onRefine(section.key, 'softer')} />
                    <ActionButton icon={RotateCcw} label="Regenerate" onClick={() => onRefine(section.key, 'regen')} />
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-slate-100 group-hover:border-[#1F4E8C]/20 transition-colors ml-1">
                  {Array.isArray(content) ? (
                    <div className="space-y-2">
                      {content.map((item, i) => (
                        <EditableItem 
                          key={i} 
                          text={item} 
                          onUpdate={(newText) => {
                            const newArray = [...content];
                            newArray[i] = newText;
                            onUpdateSection(section.key, newArray as any);
                          }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <AutoResizingTextarea 
                      value={content as string}
                      onChange={(value) => onUpdateSection(section.key, value)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AutoResizingTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-[14px] leading-snug text-slate-600 bg-transparent border-none p-0 resize-none focus:outline-none placeholder:text-slate-300 font-medium overflow-hidden"
      rows={1}
      onInput={(e) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
      }}
    />
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#1F4E8C] transition-all flex items-center gap-1 group/btn"
      title={label}
    >
      <Icon className="w-3 h-3" />
      <span className="text-[9px] font-bold hidden group-hover/btn:inline">{label}</span>
    </button>
  );
}

function EditableItem({ text, onUpdate }: { text: string; onUpdate: (text: string) => void }) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="flex gap-2.5 items-start group/item">
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onUpdate(e.target.value)}
        className="flex-1 text-[14px] leading-snug text-slate-600 bg-transparent border-none p-0 resize-none focus:outline-none placeholder:text-slate-300 font-medium overflow-hidden"
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />
    </div>
  );
}
