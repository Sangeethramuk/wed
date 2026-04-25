'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, CircleDot, Lightbulb, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CriterionData } from '@/lib/feedback-logic';

interface CriterionRecapSidebarProps {
  criteria: CriterionData[];
}

export function CriterionRecapSidebar({ criteria }: CriterionRecapSidebarProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'perfect': return Star;
      case 'minor': return CircleDot;
      case 'gap': return Lightbulb;
      case 'major': return AlertTriangle;
      default: return CircleDot;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'perfect': return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20';
      case 'minor': return 'text-[#1F4E8C] bg-[#EFF6FF] border-[#1F4E8C]/20';
      case 'gap': return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
      case 'major': return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <aside className="w-[320px] border-r border-slate-200 bg-white flex flex-col shrink-0">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Criterion Feedback Recap</span>
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">
          {criteria.length}
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {criteria.map((c) => {
          const isExpanded = expandedId === c.name;
          const Icon = getTierIcon(c.tier);
          const colors = getTierColor(c.tier);
          
          return (
            <div 
              key={c.name} 
              className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <button 
                onClick={() => setExpandedId(isExpanded ? null : c.name)}
                className="w-full px-4 py-3.5 flex items-start justify-between text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex gap-3 min-w-0">
                  <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colors}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[13px] font-bold text-slate-900 leading-tight truncate">{c.name}</h4>
                    <p className={`text-[10px] font-bold tracking-tight uppercase mt-1 ${colors.split(' ')[0]}`}>
                      {c.tierLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                    {c.score}<span className="text-slate-400 font-medium">/{c.maxScore}</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                </div>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-4 pt-0">
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[12px] leading-relaxed text-slate-600 font-medium italic">
                          "{c.feedbackText}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
