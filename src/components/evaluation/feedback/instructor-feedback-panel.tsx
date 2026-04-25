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
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isDisabled = !value.trim();

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-8 py-2 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
        <div className={`flex items-center justify-between cursor-pointer group ${isCollapsed ? 'mb-0' : 'mb-2'}`} onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className="space-y-0.5">
            <h4 className="text-[12px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#1F4E8C]" />
              Instructor Feedback
              {value.trim() && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              )}
            </h4>
            <p className="text-[11px] font-medium text-slate-400">
              Write your feedback for the student. This appears first in the final report.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-slate-500 rounded-lg">
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pb-1">
                <div className="relative">
                  <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full min-h-[60px] p-3 text-[13px] leading-relaxed text-slate-700 bg-[#F8F9FA] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4E8C]/5 focus:border-[#1F4E8C]/30 transition-all placeholder:text-slate-300 placeholder:italic font-medium"
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
                    className="h-8 px-3 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 gap-2 rounded-lg text-[11px] font-bold"
                    onClick={onVoiceClick}
                  >
                    <Mic className="w-3.5 h-3.5 text-[#1F4E8C]" />
                    Voice note
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant={isDisabled ? "secondary" : "default"}
                      size="sm" 
                      className={`h-8 px-4 gap-2 rounded-lg text-[11px] font-bold transition-all ${
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
                      onClick={onFinalSubmit}
                      className="h-8 px-5 bg-[#1F4E8C] hover:bg-[#1E3A5F] text-white rounded-lg text-[11px] font-bold shadow-sm gap-2"
                    >
                      Submit & Continue <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
