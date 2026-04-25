'use client';

import React from 'react';
import { Mic, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstructorFeedbackPanelProps {
  value: string;
  onChange: (value: string) => void;
  onVoiceClick?: () => void;
}

export function InstructorFeedbackPanel({ value, onChange, onVoiceClick }: InstructorFeedbackPanelProps) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-[#F8F9FA] px-8 py-6">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-[12px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#1F4E8C]" />
              Instructor Feedback
            </h4>
            <p className="text-[11px] font-medium text-slate-400">
              Write your feedback for the student. This appears first in the final report.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 gap-2 rounded-lg text-[11px] font-bold"
              onClick={onVoiceClick}
            >
              <Mic className="w-3.5 h-3.5 text-[#1F4E8C]" />
              Voice note
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 border-slate-200 text-[#1F4E8C] bg-white hover:bg-blue-50/50 gap-2 rounded-lg text-[11px] font-bold"
              onClick={() => onChange('APPEND_TO_DRAFT')}
            >
              Add feedback
            </Button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[100px] p-4 text-[14px] leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4E8C]/5 focus:border-[#1F4E8C]/30 transition-all placeholder:text-slate-300 placeholder:italic font-medium"
            placeholder="Add a personal note... e.g. Good improvement from last submission. Please meet me if you need help."
          />
          <div className="absolute bottom-3 right-3">
             <span className="text-[10px] font-mono text-slate-300 bg-white px-2 py-0.5 rounded-full border border-slate-100">
               {value.length} chars
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}
