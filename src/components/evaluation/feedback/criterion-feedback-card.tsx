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
  onEdit: (text: string) => void;
  onRegenerate: () => void;
  onApprove: () => void;
}

function getTierStyles(tier: FeedbackTier) {
  switch (tier) {
    case 'perfect': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: Star };
    case 'minor': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: CircleDot };
    case 'gap': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: Lightbulb };
    case 'major': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle };
  }
}

function getAuthorshipLabel(authorship: AuthorshipState) {
  switch (authorship) {
    case 'ai_generated': return 'AI Generated';
    case 'instructor_edited': return 'Instructor Edited';
    case 'regenerated': return 'AI Generated';
  }
}

export function CriterionFeedbackCard({
  tier,
  tierLabel,
  feedbackText,
  thinkingPrompt,
  authorship,
  isApproved,
  regenCount,
  onEdit,
  onRegenerate,
  onApprove,
}: CriterionFeedbackCardProps) {
  const styles = getTierStyles(tier);
  const TierIcon = styles.icon;
  const isEdited = authorship === 'instructor_edited';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-2 pt-2"
    >
      {/* Section label */}
      <span className="eyebrow text-foreground/40 block px-0.5">
        Detailed Feedback
      </span>

      {/* Feedback card */}
      <div className={`rounded-[10px] border-[1.5px] ${styles.border} ${styles.bg} overflow-hidden shadow-sm`}>
        {/* Tier label */}
        <div className={`px-3.5 pt-3 pb-0 flex items-center justify-between`}>
          <span className={`eyebrow ${styles.text} flex items-center gap-1.5`}>
            <TierIcon className="w-3.5 h-3.5" />
            {tierLabel}
          </span>
        </div>

        {/* Feedback text area - seamless onclick edit */}
        <div className="px-3.5 py-3">
          <textarea
            value={feedbackText}
            onChange={(e) => onEdit(e.target.value)}
            rows={5}
            placeholder="No feedback provided yet..."
            className={`w-full text-xs leading-[1.75] text-foreground bg-transparent border-none p-0 resize-y focus:outline-none focus:bg-white/40 rounded-md font-medium transition-all min-h-[100px]`}
          />
        </div>
      </div>

      {/* Action buttons - simplified but functional */}
      <div className="flex items-center gap-1.5 px-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="eyebrow h-8 px-2.5 text-muted-foreground/60 gap-1.5 hover:text-primary transition-colors"
          onClick={onRegenerate}
          disabled={regenCount >= 2}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {regenCount >= 2 ? 'Max uses' : 'Regenerate'}
        </Button>

        {isApproved ? (
          <Button
            variant="ghost"
            size="sm"
            className="eyebrow h-8 px-4 bg-green-50 text-green-700 border border-green-200 gap-1.5 ml-auto cursor-default hover:bg-green-50 rounded-full"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
          </Button>
        ) : (
          <Button
            size="sm"
            className="eyebrow h-8 px-5 bg-primary text-primary-foreground gap-1.5 ml-auto shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all rounded-full"
            onClick={onApprove}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
          </Button>
        )}
      </div>
    </motion.div>
  );
}
