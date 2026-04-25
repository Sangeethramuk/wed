'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  RotateCcw, 
  Pencil, 
  Lightbulb, 
  Sparkles,
  AlertTriangle,
  CircleDot,
  Star,
  Info,
} from 'lucide-react';
import type { FeedbackTier, AuthorshipState } from '@/lib/store/grading-store';

interface CriterionFeedbackCardProps {
  tier: FeedbackTier;
  tierLabel: string;
  feedbackText: string;
  thinkingPrompt?: string;
  authorship: AuthorshipState;
  isApproved: boolean;
  regenCount: number;
  score: number;
  maxScore: number;
  onEdit: (text: string) => void;
  onRegenerate: () => void;
  onApprove: () => void;
  isPendingOverride?: boolean;
}

/**
 * Maps feedback tiers to the official status colors from EDUCAITORS_DS_GUIDE.md
 */
function getTierStyles(tier: FeedbackTier) {
  switch (tier) {
    case 'perfect': 
      return { 
        bg: 'bg-[#10B981]/10', 
        border: 'border-[#10B981]/20', 
        text: 'text-[#10B981]', 
        icon: Star 
      };
    case 'minor': 
      return { 
        bg: 'bg-[#EFF6FF]', 
        border: 'border-[#1F4E8C]/20', 
        text: 'text-[#1F4E8C]', 
        icon: CircleDot 
      };
    case 'gap': 
      return { 
        bg: 'bg-[#F59E0B]/10', 
        border: 'border-[#F59E0B]/20', 
        text: 'text-[#F59E0B]', 
        icon: Lightbulb 
      };
    case 'major': 
      return { 
        bg: 'bg-[#EF4444]/10', 
        border: 'border-[#EF4444]/20', 
        text: 'text-[#EF4444]', 
        icon: AlertTriangle 
      };
  }
}

export function CriterionFeedbackCard({
  tier,
  tierLabel,
  feedbackText,
  authorship,
  isApproved,
  regenCount,
  score,
  maxScore,
  onEdit,
  onRegenerate,
  onApprove,
  isPendingOverride = false,
}: CriterionFeedbackCardProps) {
  const styles = getTierStyles(tier);
  const TierIcon = styles.icon;
  const isInstructor = authorship === 'instructor_edited';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3 pt-4 border-t border-slate-200"
    >
      {/* Dynamic Header Label */}
      <div className="flex items-center justify-between px-0.5">
        <span className="eyebrow text-slate-500 flex items-center gap-1.5 font-semibold">
          {isInstructor ? (
            <>
              <Pencil className="w-3 h-3" />
              Instructor Input • Score {score}/{maxScore}
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-[#1F4E8C]" />
              Feedback • Score {score}/{maxScore}
            </>
          )}
        </span>
        
        {isInstructor && (
          <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold tracking-widest uppercase bg-blue-50 text-[#1F4E8C] border-[#1F4E8C]/20">
            Edited
          </Badge>
        )}
      </div>

      {/* Feedback card container */}
      <div className="relative group/fb">
        <div 
          className={`group relative rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg ${isPendingOverride ? 'opacity-0 pointer-events-none' : ''}`}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {/* Tier label strip — using status color logic from DS */}
          <div className={`px-4 pt-3.5 pb-1 flex items-center justify-between`}>
            <span className={`eyebrow ${styles.text} flex items-center gap-1.5 text-[10px] tracking-widest font-bold`}>
              <TierIcon className="w-3.5 h-3.5" />
              {tierLabel.toUpperCase()}
            </span>
          </div>

          {/* Feedback text area */}
          <div className="px-4 pb-4 pt-2">
            <textarea
              value={feedbackText}
              onChange={(e) => onEdit(e.target.value)}
              rows={5}
              placeholder="No feedback provided yet..."
              className="w-full text-[13px] leading-[1.8] text-slate-900 bg-transparent border-none p-0 resize-none focus:outline-none placeholder:text-slate-300 font-medium transition-all min-h-[120px]"
            />
          </div>

          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className={`w-1 h-1 rounded-full ${styles.text} bg-current opacity-20`} />
          </div>
        </div>

        {/* The Pending Override Overlay — opaque light color from DS Guide */}
        {isPendingOverride && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-[#F8F9FA] rounded-xl border border-dashed border-slate-200 shadow-sm">
            <div className="space-y-4 max-w-[260px]">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-1 border border-slate-200">
                <Info className="w-5 h-5 text-[#1F4E8C]" />
              </div>
              <div className="space-y-2">
                <p className="text-[14px] font-bold tracking-tight text-slate-900 leading-tight">
                  Confirm override score to generate updated feedback
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  Feedback updates after final score confirmation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-[11px] font-bold tracking-tight text-slate-400 gap-2 hover:text-[#1F4E8C] hover:bg-blue-50 transition-all rounded-lg"
          onClick={onRegenerate}
          disabled={regenCount >= 2 || isApproved || isPendingOverride}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${regenCount > 0 ? 'text-[#1F4E8C]/60' : ''}`} />
          {regenCount >= 2 ? 'MAX USES' : 'REGENERATE'}
          {regenCount > 0 && <span className="text-[9px] opacity-40">({regenCount}/2)</span>}
        </Button>

        {isApproved ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-4 bg-emerald-50 text-[#10B981] border border-[#10B981]/30 gap-2 ml-auto cursor-default hover:bg-emerald-50 rounded-full text-[11px] font-bold tracking-tight"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> FINALIZED
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-8 px-6 bg-[#1F4E8C] text-white gap-2 ml-auto shadow-sm hover:bg-[#1E3A5F] hover:scale-[1.02] active:scale-[0.98] transition-all rounded-full text-[11px] font-bold tracking-tight disabled:opacity-50 disabled:pointer-events-none"
            onClick={onApprove}
            disabled={isPendingOverride}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRM
          </Button>
        )}
      </div>
    </motion.div>
  );
}
