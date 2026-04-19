import type { FeedbackTier } from '@/lib/store/grading-store';
export type { FeedbackTier };

export function getTierColors(tier: FeedbackTier) {
  switch (tier) {
    case 'perfect': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' };
    case 'minor': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' };
    case 'gap': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' };
    case 'major': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
    default: return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' };
  }
}

export function generateCriterionFeedback(
  name: string,
  level: number,
  evidence: string[],
  reasoning: string
): { tier: FeedbackTier; tierLabel: string; feedbackText: string; thinkingPrompt: string } {
  let tier: FeedbackTier = 'major';
  let tierLabel = 'Major Revision Needed';
  let feedbackText = '';
  let thinkingPrompt = '';

  if (level >= 4.5) {
    tier = 'perfect';
    tierLabel = 'Excellent Work';
    feedbackText = `Your approach to ${name} is exceptional. The evidence clearly demonstrates mastery of this criterion. You have successfully met and exceeded the core requirements. Keep up this level of detail and rigor.`;
  } else if (level >= 3.5) {
    tier = 'minor';
    tierLabel = 'Minor Adjustments';
    feedbackText = `Good work on ${name}. You have a solid foundation, but there are a few minor areas that could be polished. Consider reviewing the evidence you provided and adding a bit more depth to your explanation to ensure complete clarity.`;
  } else if (level >= 2.5) {
    tier = 'gap';
    tierLabel = 'Significant Gap';
    feedbackText = `There is a significant gap in your implementation of ${name}. While you have touched on the concept, the execution lacks the necessary depth and connection to the rubric requirements. Please review the core concepts and re-evaluate your approach.`;
    thinkingPrompt = `Consider how the evidence you provided aligns with the core principles of ${name}. What specific details are missing that would bridge the gap between your current work and a comprehensive understanding?`;
  } else {
    tier = 'major';
    tierLabel = 'Major Revision Needed';
    feedbackText = `Your work on ${name} requires substantial revision. The current submission does not meet the basic expectations outlined in the rubric. It is crucial to revisit the foundational materials and completely rework this section.`;
    thinkingPrompt = `You need to start from first principles. What is the fundamental goal of ${name}, and why does your current evidence fail to support it? Focus on building a logically sound argument from the ground up.`;
  }

  if (reasoning) {
     feedbackText += `\n\nGrader Note: ${reasoning}`;
  }

  return { tier, tierLabel, feedbackText, thinkingPrompt };
}

export function generateOverallFeedback(
  criteria: { name: string; level: number; maxLevel: number; feedbackText: string }[],
  studentName: string
) {
  const averageLevel = criteria.reduce((sum, c) => sum + c.level, 0) / (criteria.length || 1);
  
  let snapshot = '';
  if (averageLevel >= 4) {
    snapshot = `${studentName} has demonstrated a strong understanding of the core concepts and delivered a high-quality submission. The work is well-structured and shows clear mastery of the material.`;
  } else if (averageLevel >= 3) {
    snapshot = `${studentName} has submitted a solid effort with some good foundational elements, but there are noticeable gaps that prevent it from being a top-tier submission.`;
  } else {
    snapshot = `${studentName}'s submission requires significant rework. There are fundamental misunderstandings of the core concepts that need to be addressed.`;
  }

  const strengths = criteria.filter(c => c.level >= 4).map(c => c.name);
  if (strengths.length === 0) strengths.push('Effort and foundational setup');

  const gaps = criteria.filter(c => c.level < 4).map(c => c.name);
  if (gaps.length === 0) gaps.push('Minor polishing and edge-case handling');

  return {
    performanceSnapshot: snapshot,
    strengths,
    keyGaps: gaps,
    improvementDirection: [
      'Review the criteria where you scored below expectations.',
      'Incorporate the specific feedback provided for each section.',
      'Focus on adding depth and clarity to your explanations.'
    ],
    closingNote: 'Keep pushing forward. Use this feedback to refine your understanding and improve your future work.'
  };
}

export function generateSolutionSteps(criteria: { name: string; level: number }[]) {
  return criteria.map(c => {
    let priority: 'critical' | 'important' | 'maintain' = 'maintain';
    if (c.level < 3) priority = 'critical';
    else if (c.level < 4) priority = 'important';

    return {
      criterionName: c.name,
      priority,
      score: `${c.level}/5`,
      steps: [
        `Re-evaluate your approach to ${c.name}.`,
        `Cross-reference your work with the rubric requirements.`,
        `Apply the specific feedback provided in the evaluation.`
      ]
    };
  });
}
