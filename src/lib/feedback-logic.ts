import { FeedbackTier } from './store/grading-store';

export interface CriterionData {
  name: string;
  score: number;
  maxScore: number;
  feedbackText: string;
  tier: FeedbackTier;
  tierLabel: string;
}

export interface FeedbackDraft {
  instructorNote: string;
  performanceSnapshot: string;
  whatWentWell: string[];
  improvementFocus: string[];
  nextSteps: string[];
  closingNote: string;
}

export interface GeneratedOverallFeedback {
  instructorNote: string;
  performanceSnapshot: string;
  strengths: string[];
  keyGaps: string[];
  improvementDirection: string[];
  closingNote: string;
}

/**
 * Generates dynamic, score-sensitive overall feedback based on confirmed criteria.
 */
export function generateDynamicOverallFeedback(
  criteria: CriterionData[],
  studentName: string,
  mode: 'standard' | 'detailed' = 'standard'
): GeneratedOverallFeedback {
  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const maxTotal = criteria.reduce((sum, c) => sum + c.maxScore, 0);
  const percentage = (totalScore / maxTotal) * 100;

  // Determine score band
  const isHigh = percentage >= 85;
  const isMid = percentage >= 65 && percentage < 85;
  const isLow = percentage < 65;
  const isBorderline = (percentage >= 58 && percentage < 65) || (percentage >= 80 && percentage < 85);

  // 1. Performance Snapshot
  let performanceSnapshot = '';
  if (isHigh) {
    performanceSnapshot = `${studentName} has delivered an exceptional performance, demonstrating a deep understanding of the core concepts and applying them with high precision.`;
  } else if (isMid) {
    performanceSnapshot = `${studentName} has shown solid foundational knowledge and met most requirements effectively, though some areas would benefit from further refinement.`;
  } else {
    performanceSnapshot = `${studentName}'s submission identifies several critical gaps in understanding or application that require immediate attention to meet the required standards.`;
  }

  if (mode === 'detailed') {
    performanceSnapshot += ` The overall score of ${totalScore}/${maxTotal} reflects a ${isHigh ? 'thorough' : isMid ? 'competent' : 'partial'} alignment with the rubric expectations.`;
  }

  // 2. Strengths (What Went Well)
  const perfectCriteria = criteria.filter(c => c.tier === 'perfect').slice(0, 2);
  const minorCriteria = criteria.filter(c => c.tier === 'minor').slice(0, 2);
  const strengthSources = perfectCriteria.length > 0 ? perfectCriteria : minorCriteria;
  
  const strengths = strengthSources.map(c => 
    mode === 'detailed' 
      ? `Strong mastery shown in ${c.name}, specifically regarding the clear logic and well-supported claims mentioned in the feedback.`
      : `Excellent work on ${c.name}.`
  );
  
  if (strengths.length === 0) {
    strengths.push(isHigh ? "Consistent effort across all rubric dimensions." : "Foundational elements are present in the core structure.");
  }

  // 3. Key Gaps (Improvement Focus)
  const majorCriteria = criteria.filter(c => c.tier === 'major').slice(0, 2);
  const gapCriteria = criteria.filter(c => c.tier === 'gap').slice(0, 2);
  const gapSources = majorCriteria.length > 0 ? majorCriteria : gapCriteria;

  const keyGaps = gapSources.map(c => 
    mode === 'detailed'
      ? `The ${c.name} section lacks the required depth, particularly where ${c.feedbackText.split('.')[0].toLowerCase()} was noted.`
      : `Refine the approach to ${c.name}.`
  );

  if (keyGaps.length === 0 && isHigh) {
    keyGaps.push("Minor polish on formatting and edge-case handling.");
  } else if (keyGaps.length === 0) {
    keyGaps.push("Review core theoretical principles to strengthen application.");
  }

  // 4. Improvement Direction (Next Steps)
  const improvementDirection = [];
  if (isLow || isBorderline) {
    improvementDirection.push("Revisit the primary lecture materials specifically covering the areas identified as 'Major Gaps'.");
    improvementDirection.push("Focus on establishing a clearer link between your technical claims and the provided evidence.");
  } else {
    improvementDirection.push("Explore advanced implementations of these concepts to push towards the highest performance tier.");
    improvementDirection.push("Continue maintaining this level of documentation and structural clarity in future modules.");
  }

  if (mode === 'detailed') {
    improvementDirection.push("Schedule a brief review session if the specific feedback on technical implementation remains unclear.");
  }

  // 5. Closing Note
  let closingNote = '';
  if (isHigh) {
    closingNote = `Outstanding work overall, ${studentName}. Keep pushing this level of rigor.`;
  } else if (isMid) {
    closingNote = `Good progress. With targeted focus on the gaps identified, you are well-positioned for top-tier results next time.`;
  } else {
    closingNote = `While this submission didn't meet all standards, the identified path for improvement is clear. Please reach out if you need further clarification on these points.`;
  }

  return {
    performanceSnapshot,
    strengths: strengths.slice(0, 2),
    keyGaps: keyGaps.slice(0, 2),
    improvementDirection: improvementDirection.slice(0, 2),
    closingNote
  };
}

/**
 * Converts a GeneratedOverallFeedback object into a formatted markdown string.
 */
export function formatFeedbackToMarkdown(feedback: GeneratedOverallFeedback): string {
  return [
    `**Performance Snapshot**\n${feedback.performanceSnapshot}`,
    `**What Went Well**\n${feedback.strengths.map(s => `• ${s}`).join('\n')}`,
    `**Improvement Focus**\n${feedback.keyGaps.map(g => `• ${g}`).join('\n')}`,
    `**Next Steps**\n${feedback.improvementDirection.map(d => `• ${d}`).join('\n')}`,
    `**Closing Note**\n${feedback.closingNote}`
  ].join('\n\n');
}
