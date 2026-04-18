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
      className="space-y-2"
    >
      {/* Section label */}
      <span className="text-[9px] font-bold tracking-[0.09em] uppercase text-muted-foreground/60 block">
        Feedback for this Criterion
      </span>

      {/* Authorship tag */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`text-[9px] font-bold tracking-[0.05em] h-5 ${
            isEdited
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-primary/10 text-primary border-primary/20'
          }`}
        >
          {isEdited ? <Pencil className="w-2.5 h-2.5 mr-1" /> : <Sparkles className="w-2.5 h-2.5 mr-1" />}
          {getAuthorshipLabel(authorship)}
        </Badge>
      </div>

      {/* Feedback card */}
      <div className={`rounded-[10px] border-[1.5px] ${styles.border} ${styles.bg} overflow-hidden`}>
        {/* Tier label */}
        <div className={`px-3.5 pt-3 pb-0 flex items-center justify-between`}>
          <span className={`text-[8px] font-bold tracking-[0.1em] uppercase ${styles.text} flex items-center gap-1.5`}>
            <TierIcon className="w-3 h-3" />
            {tierLabel}
          </span>
          <Badge
            variant="outline"
            className={`text-[8px] font-bold h-4 ${
              isEdited
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}
          >
            {getAuthorshipLabel(authorship)}
          </Badge>
        </div>

        {/* Feedback text */}
        <div className="px-3.5 py-3">
          <textarea
            value={feedbackText}
            onChange={(e) => onEdit(e.target.value)}
            rows={4}
            className={`w-full text-[12px] leading-[1.75] text-foreground bg-transparent border-none p-0 resize-y focus:outline-none focus:bg-white/60 rounded-md font-sans transition-colors min-h-[80px]`}
          />
        </div>

        {/* Thinking prompt — only for gap/major tiers */}
        {thinkingPrompt && (tier === 'gap' || tier === 'major') && (
          <div className="mx-3.5 mb-3 px-3 py-2.5 bg-white/50 border-l-[3px] border-amber-300 rounded-r-md">
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb className="w-3 h-3 text-amber-600" />
              <span className="text-[8px] font-bold tracking-[0.1em] uppercase text-amber-600">
                Thinking Direction
              </span>
            </div>
            <p className="text-[11px] text-amber-700 leading-[1.6] italic">
              {thinkingPrompt}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-[10px] font-medium text-muted-foreground gap-1"
          onClick={() => {/* focus textarea above */}}
        >
          <Pencil className="w-3 h-3" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-[10px] font-medium text-muted-foreground gap-1"
          onClick={onRegenerate}
          disabled={regenCount >= 2}
        >
          <RotateCcw className="w-3 h-3" />
          {regenCount >= 2 ? 'Max uses' : 'Regenerate'}
        </Button>

        {isApproved ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 gap-1 ml-auto cursor-default hover:bg-green-50"
          >
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-7 px-3 text-[10px] font-medium bg-primary text-primary-foreground gap-1 ml-auto"
            onClick={onApprove}
          >
            <CheckCircle2 className="w-3 h-3" /> Approve
          </Button>
        )}
      </div>
    </motion.div>
  );
}
