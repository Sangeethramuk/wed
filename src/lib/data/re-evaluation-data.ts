import type { StatusKey, ConfidenceKey } from '@/lib/design-tokens'

export type AgeStatus = 'overdue' | 'pending' | 'new'
export type ConcernVariant = 'red' | 'orange' | 'blue'

/**
 * Map UI state to a design-system status key.
 * Consumers should read these instead of the deprecated raw-hex fields.
 */
export function ageStatusKind(age: AgeStatus): StatusKey {
  if (age === 'overdue') return 'error'
  if (age === 'pending') return 'warning'
  return 'info'
}

export function confidenceKind(label: string): ConfidenceKey {
  if (label === 'Strong') return 'high'
  if (label === 'Partial') return 'low'
  return 'med'
}

export function verdictKind(vcolor: string): StatusKey {
  // Maps mock-data hex strings to semantic keys. Will disappear once
  // the `vcolor` field is removed in Phase 2.
  if (vcolor === '#10B981') return 'success'
  if (vcolor === '#F59E0B') return 'warning'
  if (vcolor === '#3B82F6') return 'info'
  if (vcolor === '#EF4444') return 'error'
  return 'neutral'
}

export function auditEventKind(color: string): StatusKey {
  if (color === '#10B981') return 'success'
  if (color === '#F59E0B') return 'warning'
  if (color === '#EF4444') return 'error'
  if (color === '#3B7FE8') return 'info'
  if (color === '#7C3AED') return 'info'
  return 'neutral'
}

export type StudentRecord = {
  id: string
  name: string
  first: string
  rollId: string
  assign: string
  crit: string
  critShort: string
  origScore: number
  maxScore: number
  wait: string
  ageLabel: string
  ageStatus: AgeStatus
  accentColor: string
  rowBg?: string
  concern: string
  concernType: string
  concernVariant: ConcernVariant
  evidence: string
  sv: string
  verdict: string
  vcolor: string
  confScore: string
  confLabel: string
  confColor: string
  gradingEvidence: string
  hasOverride: boolean
  isCluster: boolean
  isNew: boolean
}

export type AIReval = { score: number; reason: string }

export type BriefingFlag = { type: 'red' | 'amber' | 'blue' | 'green'; text: string }

export type AuditEntry = { time: string; event: string; color: string }

export type Briefing = {
  requestType: string
  aiSummaryParagraphs: string[]
  flags: BriefingFlag[]
  gradingEvidenceLines: string[]
  auditTrail: AuditEntry[]
  hasCluster: boolean
  clusterText: string
}

export const STUDENTS: Record<string, StudentRecord> = {
  rohan: {
    id: 'rohan', name: 'Rohan Verma', first: 'Rohan', rollId: 'CS21B001',
    assign: 'DSA Assignment 1', crit: 'C1 · Problem Analysis', critShort: 'C1',
    origScore: 7, maxScore: 10, wait: 'Waiting 52 hours',
    ageLabel: '2 days ago', ageStatus: 'overdue',
    accentColor: '#EF4444', rowBg: '#FFF8F8',
    concern: 'Marks seem incorrect', concernType: 'Re-eval', concernVariant: 'red',
    evidence: 'Page 2 · Lines 15–20',
    sv: '"I analysed edge cases on page 2 — empty arrays, single elements, negative values. Lines 15–20 show this directly."',
    verdict: 'Specific evidence cited · re-evaluation may be valid', vcolor: '#10B981',
    confScore: '0.85', confLabel: 'Clear', confColor: '#3B82F6',
    gradingEvidence: '"Two boundary conditions identified before sort. Negative value handling not explicitly shown."',
    hasOverride: true, isCluster: true, isNew: false,
  },
  priya: {
    id: 'priya', name: 'Priya Ramesh', first: 'Priya', rollId: 'CS21B018',
    assign: 'DSA Assignment 1', crit: 'C2 · Code Quality', critShort: 'C2',
    origScore: 5, maxScore: 10, wait: 'Waiting 51 hours',
    ageLabel: '51 hrs ago', ageStatus: 'overdue',
    accentColor: '#EF4444', rowBg: '#FFF8F8',
    concern: 'Rubric unclear', concernType: 'Re-eval', concernVariant: 'red',
    evidence: 'Page 3 · Lines 8–14',
    sv: '"The rubric said efficient algorithm but O(n²) is correct — I was not told O(n log n) was required."',
    verdict: 'Rubric ambiguity · 4 students disputed same criterion', vcolor: '#F59E0B',
    confScore: '0.78', confLabel: 'Clear', confColor: '#3B82F6',
    gradingEvidence: '"O(n²) implementation identified. Rubric criterion: efficient algorithm."',
    hasOverride: false, isCluster: true, isNew: false,
  },
  arjun: {
    id: 'arjun', name: 'Arjun Nair', first: 'Arjun', rollId: 'CS21B033',
    assign: 'DSA Assignment 1', crit: 'C2 · Code Quality', critShort: 'C2',
    origScore: 5, maxScore: 10, wait: 'Waiting 1 day',
    ageLabel: '1 day ago', ageStatus: 'pending',
    accentColor: '#F59E0B',
    concern: 'Rubric unclear', concernType: 'Clarification', concernVariant: 'orange',
    evidence: 'Page 3 · Lines 8–14',
    sv: '"I used the same approach as lecture note examples. Efficient was not defined — just efficient."',
    verdict: 'Rubric ambiguity · 4 students disputed same criterion', vcolor: '#F59E0B',
    confScore: '0.78', confLabel: 'Clear', confColor: '#3B82F6',
    gradingEvidence: '"O(n²) implementation identified. Rubric criterion: efficient algorithm."',
    hasOverride: false, isCluster: true, isNew: false,
  },
  sneha: {
    id: 'sneha', name: 'Sneha Krishnan', first: 'Sneha', rollId: 'CS21B047',
    assign: 'DSA Assignment 1', crit: 'C2 · Code Quality', critShort: 'C2',
    origScore: 5, maxScore: 10, wait: 'Waiting 22 hours',
    ageLabel: '22 hrs ago', ageStatus: 'pending',
    accentColor: '#F59E0B',
    concern: 'Feedback mismatch', concernType: 'Clarification', concernVariant: 'orange',
    evidence: 'Page 3 · Lines 10–16',
    sv: '"My code is clean and passes all test cases mentioned in class. Poor code quality feedback doesn\'t match my work."',
    verdict: 'Rubric ambiguity · 4 students disputed same criterion', vcolor: '#F59E0B',
    confScore: '0.76', confLabel: 'Clear', confColor: '#3B82F6',
    gradingEvidence: '"O(n²) implementation. No inline comments. Variable naming inconsistent."',
    hasOverride: false, isCluster: true, isNew: false,
  },
  vikram: {
    id: 'vikram', name: 'Vikram Bose', first: 'Vikram', rollId: 'CS21B009',
    assign: 'DSA Assignment 2', crit: 'C3 · Documentation', critShort: 'C3',
    origScore: 4, maxScore: 10, wait: 'Waiting 18 hours',
    ageLabel: '18 hrs ago', ageStatus: 'pending',
    accentColor: '#F59E0B',
    concern: 'Page not read', concernType: 'Scan', concernVariant: 'orange',
    evidence: 'Page 4 · Section header',
    sv: '"My documentation was on page 4 — section header and inline comments. Page 4 appears not to have been read."',
    verdict: 'Scan flagged · page 4 may not have been read correctly', vcolor: '#F59E0B',
    confScore: '0.72', confLabel: 'Partial', confColor: '#FBBF24',
    gradingEvidence: '"No documentation content extracted. Pages 1–3 reviewed only."',
    hasOverride: false, isCluster: false, isNew: false,
  },
  kavitha: {
    id: 'kavitha', name: 'Kavitha Reddy', first: 'Kavitha', rollId: 'CS21B022',
    assign: 'DSA Assignment 1', crit: 'All criteria', critShort: 'All',
    origScore: 23, maxScore: 30, wait: 'Waiting 12 hours',
    ageLabel: '12 hrs ago', ageStatus: 'new',
    accentColor: '#3B82F6', rowBg: '#F0F7FF',
    concern: 'Calculation error', concernType: 'Tally', concernVariant: 'blue',
    evidence: 'Tally sheet',
    sv: '"My scores add up to 23 but total shows 21. C1: 8 + C2: 7 + C3: 8 = 23, not 21."',
    verdict: 'Tally issue · arithmetic mismatch flagged', vcolor: '#3B82F6',
    confScore: '0.95', confLabel: 'Strong', confColor: '#10B981',
    gradingEvidence: '"C1: 8, C2: 7, C3: 8 — total recorded as 21."',
    hasOverride: false, isCluster: false, isNew: true,
  },
  mihail: {
    id: 'mihail', name: 'Mihail Patel', first: 'Mihail', rollId: 'CS21B055',
    assign: 'DSA Assignment 2', crit: 'C1 · Problem Analysis', critShort: 'C1',
    origScore: 6, maxScore: 10, wait: 'Waiting 6 hours',
    ageLabel: '6 hrs ago', ageStatus: 'new',
    accentColor: '#EF4444', rowBg: '#F0F7FF',
    concern: 'Marks seem incorrect', concernType: 'Re-eval', concernVariant: 'red',
    evidence: 'Not provided',
    sv: '"I feel my score should be higher. I worked very hard and spent many hours preparing for this assignment."',
    verdict: 'No evidence cited · original grade was well-supported', vcolor: '#EF4444',
    confScore: '0.91', confLabel: 'Strong', confColor: '#10B981',
    gradingEvidence: '"Problem analysis present but surface-level. No explicit edge cases identified."',
    hasOverride: false, isCluster: false, isNew: true,
  },
}

export const STUDENT_ORDER = ['rohan', 'priya', 'arjun', 'sneha', 'vikram', 'kavitha', 'mihail']

export const AI_REVALS: Record<string, AIReval> = {
  rohan:   { score: 8,  reason: 'Edge case handling on lines 15–20 present. Negative value case on line 19 not extracted in original scan.' },
  vikram:  { score: 7,  reason: 'Page 4 — section header and inline comments constitute valid documentation. OCR did not extract this page.' },
  mihail:  { score: 6,  reason: 'No new evidence demonstrated. Score of 6/10 accurately reflects the submitted work.' },
  priya:   { score: 6,  reason: 'O(n²) complexity present. Rubric says efficient algorithm — ambiguous. Could support higher score.' },
  kavitha: { score: 23, reason: 'Individual criterion scores sum to 23. Total recorded as 21 — arithmetic error confirmed.' },
  arjun:   { score: 6,  reason: 'O(n²) correct but not optimal. Rubric ambiguity on complexity threshold.' },
  sneha:   { score: 6,  reason: 'Correct implementation. Code style issues do not justify current score given rubric wording.' },
}

export const BRIEFINGS: Record<string, Briefing> = {
  rohan: {
    requestType: 'Re-evaluation',
    aiSummaryParagraphs: [
      "Rohan's claim is specific and evidence-backed. He points to lines 15–20 on page 2, where he says three edge cases for the sort algorithm are explicitly handled — empty arrays, single elements, and negative values.",
      "The original grading noted only two boundary conditions and flagged that negative value handling was not explicitly shown. However, the submission references negative value handling on line 19. This raises a legitimate question: was page 2 fully read during original evaluation?",
      "There is also a prior override on this submission — the AI initially scored it 6/10 and it was manually raised to 7/10. The student is now requesting a further review of the same criterion. Pay close attention to lines 15–20 and the original grader's reasoning for stopping at 7.",
    ],
    flags: [
      { type: 'amber', text: 'Cited section (lines 15–20) was not explicitly referenced in the original grading evidence.' },
      { type: 'amber', text: 'Manual override occurred on this submission. AI scored 6/10 → instructor changed to 7/10.' },
      { type: 'blue', text: 'This student is part of a 4-student cluster who raised concerns on the same criterion (C2 · Code Quality) within 6 hours.' },
    ],
    gradingEvidenceLines: [
      'Evidence used at grading: "Student identified two boundary conditions before sort. Negative value handling not explicitly shown."',
      'Rubric criterion: C1 · Problem Analysis — assessed on depth of edge case identification and handling.',
      'AI confidence at grading: Clear · 0.85 — system was fairly confident but not at Strong threshold.',
    ],
    auditTrail: [
      { time: '3 Apr, 10:12 AM', event: 'Submission received and validated', color: '#6B7280' },
      { time: '3 Apr, 2:34 PM', event: 'AI evaluation completed — C1 scored 6/10', color: '#3B7FE8' },
      { time: '3 Apr, 3:01 PM', event: 'Instructor reviewed C1 — override applied: 6 → 7/10', color: '#F59E0B' },
      { time: '3 Apr, 3:02 PM', event: 'Feedback released to student', color: '#10B981' },
      { time: '15 Apr, 9:45 AM', event: 'Student submitted re-evaluation request — cited page 2, lines 15–20', color: '#7C3AED' },
      { time: '17 Apr, 8:00 AM', event: 'Request auto-flagged overdue — no instructor response', color: '#EF4444' },
    ],
    hasCluster: true,
    clusterText: 'Rohan, Priya, Arjun, and Sneha all raised concerns on C2 · Code Quality within 6 hours of each other. This pattern suggests a possible rubric ambiguity — the criterion "efficient algorithm" was interpreted differently by multiple students. Your decision here may set a precedent for the other three cases. Consider whether a rubric clarification is needed for the whole batch.',
  },
  priya: {
    requestType: 'Rubric dispute',
    aiSummaryParagraphs: [
      "Priya's argument is about rubric interpretation, not missing evidence. She agrees her implementation is O(n²) — she disputes whether O(n²) should have been penalised given that the rubric said \"efficient algorithm\" without specifying complexity class.",
      "This is a legitimate institutional concern. If the rubric was genuinely ambiguous about whether O(n log n) was required, a single student's score change is insufficient. The correct resolution may affect all 4 students in this cluster.",
      "Your decision here should be considered alongside Rohan, Arjun, and Sneha's requests. If you uphold Priya's score, apply the same reasoning to the cluster. If you find rubric ambiguity, a batch correction may be warranted — with HOD awareness.",
    ],
    flags: [
      { type: 'amber', text: '4 students disputed C2 on the same assignment within 6 hours — systemic rubric ambiguity likely.' },
      { type: 'amber', text: 'Rubric criterion reads "efficient algorithm" — complexity class not specified. Ambiguity confirmed.' },
      { type: 'blue', text: 'No OCR or scan issue. The grading input was clean. This is a pure rubric interpretation dispute.' },
    ],
    gradingEvidenceLines: [
      'Evidence used at grading: "O(n²) implementation identified. Rubric criterion: efficient algorithm."',
      'Rubric criterion: C2 · Code Quality — efficient algorithm, clean structure, readable code.',
      'Issue: The rubric does not define what "efficient" means in terms of complexity. This is a rubric design gap that may require HOD-level review.',
    ],
    auditTrail: [
      { time: '3 Apr, 10:20 AM', event: 'Submission received and validated', color: '#6B7280' },
      { time: '3 Apr, 2:38 PM', event: 'AI evaluation completed — C2 scored 5/10', color: '#3B7FE8' },
      { time: '3 Apr, 3:10 PM', event: 'Feedback released — no override', color: '#10B981' },
      { time: '15 Apr, 8:30 AM', event: 'Student submitted re-evaluation — rubric ambiguity cited', color: '#7C3AED' },
      { time: '17 Apr, 8:00 AM', event: 'Request auto-flagged overdue', color: '#EF4444' },
    ],
    hasCluster: true,
    clusterText: 'Priya, Rohan, Arjun, and Sneha all raised concerns on C2 · Code Quality. All four cite similar reasoning — the rubric did not specify whether O(n log n) was required. This is strong evidence of a rubric design ambiguity. If you find the rubric was unclear, a single-student score correction is insufficient — the HOD should be informed so a batch review can be initiated.',
  },
  arjun: {
    requestType: 'Rubric dispute',
    aiSummaryParagraphs: [
      "Arjun's concern mirrors Priya's exactly. He used the same O(n²) approach as examples from lecture notes and argues the rubric did not define \"efficient\" in terms of complexity. This is the third of four students raising the same dispute on C2.",
      "His argument is strengthened by the lecture note reference — if the course material demonstrated O(n²) solutions without flagging them as inefficient, students had a reasonable basis for their interpretation.",
      "The cluster pattern is now clear. Consider whether this case, along with Priya and Sneha's, points to a rubric that needs HOD-level review before individual decisions are made.",
    ],
    flags: [
      { type: 'amber', text: 'Part of a 4-student cluster (Priya, Arjun, Sneha, Rohan) — same concern on same criterion.' },
      { type: 'amber', text: 'Student references lecture note examples as justification — a strong contextual argument.' },
      { type: 'blue', text: 'No scan or OCR issue. Clean submission. Pure rubric interpretation dispute.' },
    ],
    gradingEvidenceLines: [
      'Evidence used at grading: "O(n²) implementation identified. Rubric criterion: efficient algorithm."',
      'Rubric criterion: C2 · Code Quality — efficient algorithm, clean structure, readable code.',
      'Lecture note context: If course materials demonstrated O(n²) without marking it as inefficient, this strengthens the ambiguity argument.',
    ],
    auditTrail: [
      { time: '3 Apr, 10:28 AM', event: 'Submission received and validated', color: '#6B7280' },
      { time: '3 Apr, 2:42 PM', event: 'AI evaluation completed — C2 scored 5/10', color: '#3B7FE8' },
      { time: '3 Apr, 3:12 PM', event: 'Feedback released — no override', color: '#10B981' },
      { time: '16 Apr, 10:15 AM', event: 'Student submitted re-evaluation — rubric ambiguity + lecture notes cited', color: '#7C3AED' },
    ],
    hasCluster: true,
    clusterText: 'Arjun, Priya, Sneha, and Rohan all disputed C2 · Code Quality. Arjun specifically cites lecture notes — if the course demonstrated O(n²) without flagging it as inefficient, the rubric was genuinely unclear. A systemic rubric review is strongly recommended before resolving any individual case in this cluster.',
  },
  sneha: {
    requestType: 'Feedback mismatch',
    aiSummaryParagraphs: [
      "Sneha's concern has two components. First, she disputes the code quality score — her code passes all test cases, which she says contradicts a \"poor code quality\" characterisation. Second, the feedback she received does not appear to match the quality of work she describes.",
      "The AI's own re-evaluation scores her at 6/10 (up from 5/10), citing that code style issues do not justify the current score given the rubric's wording. There is a divergence between the original score and what the AI would give today.",
      "Check whether the feedback references functional correctness at all. If the code passes test cases but was penalised only on style without clear rubric backing, Sneha's concern may be valid on both the score and the feedback quality.",
    ],
    flags: [
      { type: 'amber', text: 'Possible feedback mismatch — student says functional correctness was not acknowledged in feedback.' },
      { type: 'amber', text: 'Part of the 4-student C2 cluster. Rubric ambiguity context applies.' },
      { type: 'blue', text: 'AI re-evaluation gives 6/10 vs original 5/10 — 1-point divergence suggesting borderline case.' },
    ],
    gradingEvidenceLines: [
      'Evidence used at grading: "O(n²) implementation. No inline comments. Variable naming inconsistent."',
      'Rubric criterion: C2 · Code Quality — efficient algorithm, clean structure, readable code.',
      'Note: The grading evidence focuses on style issues — it does not reference whether the code was functionally correct or passed test cases.',
    ],
    auditTrail: [
      { time: '3 Apr, 10:55 AM', event: 'Submission received and validated', color: '#6B7280' },
      { time: '3 Apr, 2:50 PM', event: 'AI evaluation completed — C2 scored 5/10', color: '#3B7FE8' },
      { time: '3 Apr, 3:18 PM', event: 'Feedback released — focuses on style, functional correctness not mentioned', color: '#10B981' },
      { time: '16 Apr, 8:40 PM', event: 'Student submitted re-evaluation — feedback mismatch + test case passing cited', color: '#7C3AED' },
    ],
    hasCluster: true,
    clusterText: 'Sneha is the fourth student in the C2 cluster. Her additional concern about feedback quality adds another dimension — if functional correctness was not acknowledged in any of the four students\' feedback, that is a feedback consistency issue, not just a scoring issue. Consider whether the feedback template for C2 needs revision alongside the rubric review.',
  },
  vikram: {
    requestType: 'Scan issue',
    aiSummaryParagraphs: [
      "This is a technical concern, not a grading judgment dispute. Vikram's documentation was on page 4 of his submission. According to the original grading evidence, only pages 1–3 were extracted and reviewed. Page 4 does not appear in the evaluation record.",
      "This is a likely OCR or scan extraction failure. The AI confidence on this criterion was Partial (0.72) — below the Strong threshold — which suggests the system itself was uncertain about what it had read.",
      "Before making any grading decision, verify the original scan directly. If page 4 contains what Vikram describes, this may be a straightforward correction rather than a subjective re-evaluation.",
    ],
    flags: [
      { type: 'red', text: 'Page 4 not present in extracted content. Grading was completed on pages 1–3 only.' },
      { type: 'amber', text: 'AI confidence was Partial (0.72) — below the Clear threshold. System uncertainty was elevated.' },
      { type: 'blue', text: 'No prior override on this submission. Original score reflects AI recommendation directly.' },
    ],
    gradingEvidenceLines: [
      'Evidence used at grading: "No documentation content extracted from submission. Pages 1–3 reviewed only."',
      'Rubric criterion: C3 · Documentation — assessed on presence of section headers, inline comments, and code explanation.',
      'OCR note: Page 4 extraction failed or was not included in the validated submission package.',
    ],
    auditTrail: [
      { time: '3 Apr, 10:34 AM', event: 'Submission received — OCR extraction completed for pages 1–3', color: '#6B7280' },
      { time: '3 Apr, 10:34 AM', event: 'Page 4 not found in extraction output — no flag raised', color: '#EF4444' },
      { time: '3 Apr, 2:41 PM', event: 'AI evaluation completed — C3 scored 4/10 based on pages 1–3', color: '#3B7FE8' },
      { time: '3 Apr, 3:15 PM', event: 'Feedback released without page 4 review', color: '#10B981' },
      { time: '16 Apr, 4:22 PM', event: 'Student submitted re-evaluation — cited page 4 documentation', color: '#7C3AED' },
    ],
    hasCluster: false,
    clusterText: '',
  },
  kavitha: {
    requestType: 'Score mismatch',
    aiSummaryParagraphs: [
      "This is the most straightforward case in the queue. Kavitha is claiming a simple arithmetic error. Her criterion scores sum to 23 (C1: 8 + C2: 7 + C3: 8) but the recorded total shows 21. This is a 2-mark discrepancy.",
      "The AI's own re-evaluation confirms the total should be 23. This is not a grading judgment dispute — the individual criterion scores are not in question.",
      "Verify the tally in the system record and correct if the arithmetic is wrong. This should take under 2 minutes to resolve. No HOD involvement is needed unless a system error is identified.",
    ],
    flags: [
      { type: 'red', text: 'Arithmetic discrepancy confirmed: C1(8) + C2(7) + C3(8) = 23, but total recorded as 21.' },
      { type: 'green', text: 'AI re-evaluation independently confirms total should be 23/30.' },
      { type: 'blue', text: 'Individual criterion scores are not disputed. This is a totalling issue only.' },
    ],
    gradingEvidenceLines: [
      'Recorded scores: C1: 8/10 · C2: 7/10 · C3: 8/10 · Total recorded: 21/30',
      'Correct total: 8 + 7 + 8 = 23/30',
      'This is a 2-mark discrepancy that affects Kavitha\'s final grade. No rubric or evidence review needed — verify the tally and correct if confirmed.',
    ],
    auditTrail: [
      { time: '3 Apr, 10:45 AM', event: 'Submission received and validated', color: '#6B7280' },
      { time: '3 Apr, 3:00 PM', event: 'AI evaluation completed — criteria scored individually', color: '#3B7FE8' },
      { time: '3 Apr, 3:30 PM', event: 'Total recorded as 21/30 in system — possible tallying error', color: '#EF4444' },
      { time: '3 Apr, 3:35 PM', event: 'Feedback released with incorrect total', color: '#10B981' },
      { time: '16 Apr, 2:00 PM', event: 'Student submitted re-evaluation — total mismatch cited', color: '#7C3AED' },
    ],
    hasCluster: false,
    clusterText: '',
  },
  mihail: {
    requestType: 'Re-evaluation',
    aiSummaryParagraphs: [
      "Mihail's request does not cite specific evidence. His argument is emotional rather than evidential — he states he worked hard but provides no reference to any particular section, criterion, or content that was missed or misread.",
      "The original grading evidence is well-supported: the AI scored this at 6/10 with Strong confidence (0.91), finding that problem analysis was present but surface-level, with no explicit edge case identification.",
      "This is a low-validity request. The original score appears defensible. A written reason explaining the grading decision is likely all that is required here — upholding the grade is a reasonable outcome unless the submission review reveals something the summary has missed.",
    ],
    flags: [
      { type: 'green', text: 'No specific evidence cited by student. Original grading is well-supported with Strong confidence.' },
      { type: 'blue', text: 'AI confidence was Strong (0.91). No override on this submission.' },
    ],
    gradingEvidenceLines: [
      'Evidence used at grading: "Problem analysis present but surface-level. No explicit edge cases identified."',
      'Rubric criterion: C1 · Problem Analysis — requires identification and handling of edge cases with justification.',
      'AI confidence: Strong · 0.91 — high confidence in the original evaluation outcome.',
    ],
    auditTrail: [
      { time: '3 Apr, 11:02 AM', event: 'Submission received and validated', color: '#6B7280' },
      { time: '3 Apr, 2:55 PM', event: 'AI evaluation completed — C1 scored 6/10 (Strong confidence)', color: '#3B7FE8' },
      { time: '3 Apr, 3:20 PM', event: 'Feedback released to student — no instructor override', color: '#10B981' },
      { time: '17 Apr, 3:10 PM', event: 'Student submitted re-evaluation — no evidence provided', color: '#7C3AED' },
    ],
    hasCluster: false,
    clusterText: '',
  },
}
