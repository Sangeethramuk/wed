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

  if (level >= 5) {
    tier = 'perfect';
    tierLabel = 'Exceeds Expectations';
    feedbackText = `Outstanding work on ${name}. Your response demonstrates a deep and accurate understanding, with specific evidence from the manuscript perfectly integrated. This is a model for professional-grade analysis.`;
  } else if (level >= 4) {
    tier = 'minor';
    tierLabel = 'Meets Expectations';
    feedbackText = `Strong performance in ${name}. You've accurately identified the core requirements and supported them with clear evidence. To elevate this further, consider adding more depth to your explanation of the underlying constraints.`;
  } else if (level >= 2.5) {
    tier = 'gap';
    tierLabel = 'Meets Expectations with Issues';
    feedbackText = `Balanced work on ${name}. While you've successfully addressed several core requirements, there are gaps in the evidence provided. Specifically, the connection between your implementation and the stated outcomes needs to be more explicitly grounded in the manuscript text to meet the full requirements.`;
    thinkingPrompt = `Review the evidence provided for ${name}. What specific manuscript details are currently missing that would strengthen the link between your implementation and the required outcomes?`;
  } else {
    tier = 'major';
    tierLabel = 'Below Expectations';
    feedbackText = `I appreciate your attempt at ${name}, but there are clear gaps between your response and the rubric requirements. The current analysis lacks sufficient evidence and does not yet meet the basic expectations. Focus on rebuilding this section by first identifying the foundational goals and then mapping them to specific manuscript excerpts.`;
    thinkingPrompt = `Revisit the foundational goals for ${name}. How can you rework your analysis to build a logically sound argument supported by direct evidence from the manuscript?`;
  }

  if (reasoning) {
     feedbackText += `\n\nGrader Note: ${reasoning}`;
  }

  return { tier, tierLabel, feedbackText, thinkingPrompt };
}

export interface OverallFeedbackContent {
  performanceSnapshot: string;
  strengths: string[];
  keyGaps: string[];
  improvementDirection: string[];
  closingNote: string;
}

export function generateOverallFeedback(
  criteria: { name: string; level: number; maxLevel: number; feedbackText: string }[],
  studentName: string
): OverallFeedbackContent {
  const averageLevel = criteria.reduce((sum, c) => sum + c.level, 0) / (criteria.length || 1);
  
  let snapshot = '';
  if (averageLevel >= 4.5) {
    snapshot = `${studentName} has delivered an exceptional submission. The work demonstrates complete mastery of the core concepts with production-level precision and rigor.`;
  } else if (averageLevel >= 3.5) {
    snapshot = `${studentName} has submitted a solid effort with strong foundational elements. The approach is well-structured, though minor refinements would elevate it to professional grade.`;
  } else if (averageLevel >= 2.5) {
    snapshot = `${studentName}'s work shows a satisfactory understanding but contains significant gaps in key areas. Targeted revision is needed to move from basic implementation to mastery.`;
  } else {
    snapshot = `${studentName}'s submission requires major rework. Fundamental misunderstandings of the core principles are evident and must be addressed through a complete revision.`;
  }

  const strengths = criteria.filter(c => c.level >= 4).map(c => c.name);
  if (strengths.length === 0) strengths.push('Core effort and structural setup');

  const gaps = criteria.filter(c => c.level < 4).map(c => c.name);
  if (gaps.length === 0) gaps.push('Minor polishing and edge-case handling');

  return {
    performanceSnapshot: snapshot,
    strengths,
    keyGaps: gaps,
    improvementDirection: [
      'Prioritize addressing the "Major Gaps" identified in the criterion feedback.',
      'Explicitly state non-goals and constraints before describing solutions.',
      'Ensure every technical claim is backed by specific evidence from the manuscript.'
    ],
    closingNote: 'The foundation is built. Focus your next revision on the high-impact gaps identified to significantly improve the total assessment.'
  };
}

export interface SolutionStep {
  criterionName: string;
  priority: 'critical' | 'important' | 'maintain';
  score: string;
  steps: string[];
}

export function generateSolutionSteps(criteria: { name: string; level: number }[]): SolutionStep[] {
  return criteria.map(c => {
    let priority: 'critical' | 'important' | 'maintain' = 'maintain';
    let steps: string[] = [];
    
    if (c.level < 2.5) {
      priority = 'critical';
      steps = [
        `Start from first principles. Re-read the foundational concepts for ${c.name}.`,
        `Draft a new response that addresses every specific requirement in the rubric.`,
        `Schedule a peer-review session to validate your new logic.`
      ];
    } else if (c.level < 4) {
      priority = 'important';
      steps = [
        `Refine the evidence mapping for ${c.name} to show deeper integration.`,
        `Add a "Decision Log" explaining the rationale behind your implementation choice.`,
        `Check for boundary conditions and edge cases that may have been missed.`
      ];
    } else {
      priority = 'maintain';
      steps = [
        `Keep up this level of detail.`,
        `Ensure these patterns are applied consistently throughout the entire project.`,
        `Consider documenting this approach as a best-practice template.`
      ];
    }

    return {
      criterionName: c.name,
      priority,
      score: `${c.level}/5`,
      steps
    };
  });
}
