'use client';

import React from 'react';
import { Mic, MessageSquare, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface InstructorFeedbackPanelProps {
  value: string;
  onChange: (value: string) => void;
  onVoiceClick?: () => void;
  onFinalSubmit?: () => void;
}

export function InstructorFeedbackPanel({ value, onChange, onVoiceClick, onFinalSubmit }: InstructorFeedbackPanelProps) {
  const isDisabled = !value.trim();
  const [isSaved, setIsSaved] = React.useState(false);

  const handleFinalSubmit = () => {
    setIsSaved(true);
    setTimeout(() => {
      onFinalSubmit();
      setIsSaved(false);
    }, 1000);
  };

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-8 py-5 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-0.5">
            <h4 className="text-[12px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#1F4E8C]" />
              Instructor Feedback
              {value.trim() && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              )}
            </h4>
            <p className="text-[11px] font-medium text-slate-500">
              Write your feedback for the student. This appears first in the final report.
            </p>
          </div>
        </div>

        <div className="space-y-4 pb-1">
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full min-h-[100px] p-4 text-[13px] leading-relaxed text-slate-700 bg-[#F8F9FA] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4E8C]/5 focus:border-[#1F4E8C]/30 transition-all placeholder:text-slate-300 placeholder:italic font-medium"
              placeholder="Add a personal note... e.g. Good improvement from last submission. Please meet me if you need help."
            />
            <div className="absolute bottom-3 right-3">
              <span className="text-[10px] font-mono text-slate-300 bg-[#F8F9FA] px-2 py-0.5 rounded-full">
                {value.length} chars
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 gap-2 rounded-lg text-[11px] font-bold"
              onClick={onVoiceClick}
            >
              <Mic className="w-3.5 h-3.5 text-[#1F4E8C]" />
              Voice note
            </Button>

            <div className="flex items-center gap-2">
              <Button 
                variant={isDisabled ? "secondary" : "default"}
                size="sm" 
                className={`h-9 px-4 gap-2 rounded-lg text-[11px] font-bold transition-all ${
                  !isDisabled 
                    ? 'bg-blue-50 text-[#1F4E8C] border-[#1F4E8C]/10 hover:bg-blue-100' 
                    : 'bg-slate-100 text-slate-400 border-none opacity-50 cursor-not-allowed'
                }`}
                onClick={() => onChange('APPEND_TO_DRAFT')}
                disabled={isDisabled}
              >
                Include in feedback
              </Button>
              <Button 
                onClick={handleFinalSubmit}
                disabled={isSaved}
                className={`h-9 min-w-[160px] px-6 rounded-lg text-[12px] font-bold shadow-sm transition-all duration-300 ${
                  isSaved ? 'bg-[#10B981] hover:bg-[#059669]' : 'bg-[#1F4E8C] hover:bg-[#1E3A5F]'
                } text-white flex items-center justify-center gap-2`}
              >
                <AnimatePresence mode="wait">
                  {isSaved ? (
                    <motion.span
                      key="saved"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Saved
                    </motion.span>
                  ) : (
                    <motion.span
                      key="submit"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      Submit & Continue <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
