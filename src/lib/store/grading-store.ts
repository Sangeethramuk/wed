import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GradingPhase = 'selection' | 'blind' | 'delta' | 'desk' | 'feedback' | 'complete';
export type FixType = 'f1' | 'f2' | 'f3' | 'f4';
export type IntegrityStatus = 'clean' | 'suspicious' | 'manipulated';
export type FeedbackTier = 'perfect' | 'minor' | 'gap' | 'major';
export type AuthorshipState = 'ai_generated' | 'instructor_edited' | 'regenerated';

export interface InternalNote {
  id: string;
  author: string;
  role: string;
  initials: string;
  avatarColor: string;
  text: string;
  timestamp: string;
  category: 'Medical Leave' | 'Academic Context' | 'Grading Decision' | 'Conduct' | 'Other';
  isFlagged: boolean;
  isOwn: boolean;
}

export interface CriterionFeedbackState {
  criterionId: string;
  tier: FeedbackTier;
  tierLabel: string;
  feedbackText: string;
  thinkingPrompt?: string;
  authorship: AuthorshipState;
  isConfirmed: boolean;
  isApproved: boolean;
  regenCount: number;
}

export interface OverallFeedbackState {
  documentText: string;
  originalDocumentText: string;
  instructorNote: string;
  authorship: AuthorshipState;
  isSubmitted: boolean;
}

export type CalibrationPhase =
  | 'not_started'
  | 'sample_review'
  | 'blind_grading'
  | 'delta_review'
  | 'negotiation'
  | 'complete';

export interface Criterion {
  id: string;
  name: string;
  level: number;
  reasoning: string;
  evidence: string[];
  confidence: number;
  isOverridden?: boolean;
}

export interface StudentSubmission {
  id: string;
  name: string;
  roll: string;
  status: IntegrityStatus;
  integrityFlags: string[];
  criteria: Record<string, Criterion>;
  progress: number;
  isDoubleBlind: boolean;
  ocrHealth?: number;
}

export interface AssignmentNarrative {
  id: string;
  title: string;
  description: string;
  targetFix: FixType;
  students: StudentSubmission[];
}

// --- Calibration Types ---

export interface CalibrationPaper {
  paperId: string;
  studentRef: string;
  anonymizedLabel: string;
  selectionReason: 'high_confidence' | 'ocr_issue' | 'complex_case';
  checkpointProfile: Record<string, boolean>;
}

export interface CalibrationCriterion {
  id: string;
  name: string;
  levelLabels: string[];
}

export interface EvidenceExchange {
  id: string;
  type: 'accept_ai' | 'add_instructor' | 'remove_ai_evidence' | 'revise_self';
  note?: string;
  timestamp: string;
}

export interface CalibrationScore {
  paperId: string;
  criterionId: string;
  instructorLevel: number; // 0 = not yet graded
  aiLevel: number;
  aiEvidence: string[];
  aiReasoning: string;
  delta: number;
  status: 'pending' | 'accepted' | 'negotiating' | 'resolved';
  evidenceExchanges: EvidenceExchange[];
}

export interface CalibrationData {
  phase: CalibrationPhase;
  papers: CalibrationPaper[];
  criteria: CalibrationCriterion[];
  scores: CalibrationScore[];
  activeCalibrationPaperId: string | null;
  deltaThreshold: number;
  aggregateDelta: number;
}

// --- Mock calibration seed data per assignment ---

const CALIBRATION_SEEDS: Record<string, { criteria: CalibrationCriterion[]; papers: CalibrationPaper[]; aiScores: Record<string, Record<string, { level: number; evidence: string[]; reasoning: string }>> }> = {
  'SWE-PH2': {
    criteria: [
      { id: 'c1', name: 'System Architecture', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c2', name: 'Code Logic & Correctness', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c3', name: 'API Design & Documentation', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c4', name: 'Testing Coverage', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
    ],
    papers: [
      { paperId: 'p1', studentRef: 'STU-101', anonymizedLabel: 'Paper #1', selectionReason: 'high_confidence', checkpointProfile: { grading: true, ocr: true, cheating: true, history: true, timeline: true } },
      { paperId: 'p2', studentRef: 'STU-102', anonymizedLabel: 'Paper #2', selectionReason: 'high_confidence', checkpointProfile: { grading: true, ocr: true, cheating: true, history: true, timeline: true } },
      { paperId: 'p3', studentRef: 'STU-115', anonymizedLabel: 'Paper #3', selectionReason: 'ocr_issue', checkpointProfile: { grading: true, ocr: false, cheating: true, history: true, timeline: true } },
      { paperId: 'p4', studentRef: 'STU-130', anonymizedLabel: 'Paper #4', selectionReason: 'ocr_issue', checkpointProfile: { grading: false, ocr: false, cheating: true, history: true, timeline: true } },
      { paperId: 'p5', studentRef: 'STU-100', anonymizedLabel: 'Paper #5', selectionReason: 'complex_case', checkpointProfile: { grading: false, ocr: true, cheating: false, history: false, timeline: true } },
      { paperId: 'p6', studentRef: 'STU-140', anonymizedLabel: 'Paper #6', selectionReason: 'complex_case', checkpointProfile: { grading: false, ocr: true, cheating: false, history: false, timeline: true } },
    ],
    aiScores: {
      p1: {
        c1: { level: 4, evidence: ['Clear separation of concerns across MVC layers', 'Service layer correctly abstracts business logic'], reasoning: 'Architecture adheres to SOLID principles with well-defined module boundaries.' },
        c2: { level: 3, evidence: ['Controller correctly delegates to service', 'Missing null-check on user input in line 42'], reasoning: 'Core logic is functional but minor edge cases unhandled.' },
        c3: { level: 4, evidence: ['OpenAPI annotations present on all endpoints', 'Response schemas documented'], reasoning: 'API contract is clearly defined and complete.' },
        c4: { level: 5, evidence: ['Unit tests cover 87% of branches', 'Integration tests for all API endpoints'], reasoning: 'Exceptional test coverage with meaningful assertions.' },
      },
      p2: {
        c1: { level: 3, evidence: ['Controllers directly access database in 2 places'], reasoning: 'Architecture mostly follows MVC but breaks separation in critical paths.' },
        c2: { level: 4, evidence: ['Algorithm efficiency is O(n log n)', 'Handles edge cases well'], reasoning: 'Logic is sound and well-structured.' },
        c3: { level: 3, evidence: ['README present', 'Missing error response schemas'], reasoning: 'Documentation covers happy path but incomplete for error states.' },
        c4: { level: 4, evidence: ['85% line coverage', 'Edge cases tested'], reasoning: 'Strong test suite with minor gaps.' },
      },
      p3: {
        c1: { level: 2, evidence: ['OCR extraction partial — layer boundaries unclear'], reasoning: 'OCR confidence 62%. Architecture assessment partial.' },
        c2: { level: 2, evidence: ['Visible logic appears correct but section 3 unreadable'], reasoning: 'Limited confidence due to OCR failure in critical section.' },
        c3: { level: 3, evidence: ['Documentation section clearly readable'], reasoning: 'Documentation unaffected by OCR issues.' },
        c4: { level: 2, evidence: ['Test section partially extracted'], reasoning: 'OCR failure prevents full test assessment.' },
      },
      p4: {
        c1: { level: 3, evidence: ['Architecture section readable', 'Standard MVC applied'], reasoning: 'Architecture adequate despite extraction gaps.' },
        c2: { level: 3, evidence: ['Core logic legible'], reasoning: 'Satisfactory implementation visible.' },
        c3: { level: 2, evidence: ['API docs section corrupted by OCR'], reasoning: 'Cannot assess documentation fully.' },
        c4: { level: 3, evidence: ['Test cases listed'], reasoning: 'Coverage partially determinable.' },
      },
      p5: {
        c1: { level: 1, evidence: ['No discernible architecture pattern', 'All logic in single file'], reasoning: 'Architecture absent — monolithic structure.' },
        c2: { level: 2, evidence: ['Basic CRUD operations present', 'No error handling'], reasoning: 'Minimal implementation.' },
        c3: { level: 1, evidence: ['No documentation found'], reasoning: 'API contract entirely absent.' },
        c4: { level: 2, evidence: ['2 unit tests found'], reasoning: 'Minimal testing present.' },
      },
      p6: {
        c1: { level: 4, evidence: ['Clean modular structure', 'Dependency injection used correctly'], reasoning: 'Strong architecture despite integrity flags.' },
        c2: { level: 1, evidence: ['Critical logic section appears copied', 'Stylometric deviation detected'], reasoning: 'Authorship confidence low — cannot validate logic.' },
        c3: { level: 3, evidence: ['Swagger annotations present'], reasoning: 'Documentation adequate.' },
        c4: { level: 2, evidence: ['Tests appear template-generated'], reasoning: 'Test authenticity questionable.' },
      },
    },
  },
  'DB-Q1': {
    criteria: [
      { id: 'c1', name: 'Normal Form Analysis', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c2', name: 'ER Diagram Accuracy', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c3', name: 'Query Optimization', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
    ],
    papers: [
      { paperId: 'p1', studentRef: 'DB-001', anonymizedLabel: 'Paper #1', selectionReason: 'high_confidence', checkpointProfile: { grading: true, ocr: true, cheating: true, history: true, timeline: true } },
      { paperId: 'p2', studentRef: 'DB-002', anonymizedLabel: 'Paper #2', selectionReason: 'high_confidence', checkpointProfile: { grading: true, ocr: true, cheating: true, history: true, timeline: true } },
      { paperId: 'p3', studentRef: 'DB-015', anonymizedLabel: 'Paper #3', selectionReason: 'ocr_issue', checkpointProfile: { grading: true, ocr: false, cheating: true, history: true, timeline: true } },
      { paperId: 'p4', studentRef: 'DB-022', anonymizedLabel: 'Paper #4', selectionReason: 'complex_case', checkpointProfile: { grading: false, ocr: true, cheating: false, history: false, timeline: true } },
    ],
    aiScores: {
      p1: {
        c1: { level: 5, evidence: ['Correctly identified 1NF, 2NF, 3NF', 'BCNF explained'], reasoning: 'Complete and accurate normalization analysis.' },
        c2: { level: 4, evidence: ['All entities identified', 'Cardinalities correct'], reasoning: 'ER diagram accurate with minor notation issues.' },
        c3: { level: 4, evidence: ['Index usage explained', 'Join order optimized'], reasoning: 'Strong query optimization strategy.' },
      },
      p2: {
        c1: { level: 3, evidence: ['1NF and 2NF correct', '3NF partially explained'], reasoning: 'Adequate normalization, BCNF missing.' },
        c2: { level: 3, evidence: ['Most entities captured'], reasoning: 'ER diagram mostly correct.' },
        c3: { level: 3, evidence: ['Basic indexing mentioned'], reasoning: 'Satisfactory optimization awareness.' },
      },
      p3: {
        c1: { level: 2, evidence: ['OCR partial — some normal forms unclear'], reasoning: 'Limited extraction confidence.' },
        c2: { level: 3, evidence: ['Diagram readable'], reasoning: 'ER diagram extractable.' },
        c3: { level: 2, evidence: ['Query section partially extracted'], reasoning: 'OCR limitations apply.' },
      },
      p4: {
        c1: { level: 1, evidence: ['Normalization section missing'], reasoning: 'Cannot assess — integrity flags raised.' },
        c2: { level: 2, evidence: ['Basic diagram present'], reasoning: 'Minimal ER work.' },
        c3: { level: 1, evidence: ['No optimization discussed'], reasoning: 'Query optimization absent.' },
      },
    },
  },
  'AI-ETH-01': {
    criteria: [
      { id: 'c1', name: 'Ethical Framework Application', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c2', name: 'Policy Analysis Depth', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c3', name: 'Case Study Integration', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c4', name: 'Argumentative Coherence', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
    ],
    papers: [
      { paperId: 'p1', studentRef: 'AI-001', anonymizedLabel: 'Paper #1', selectionReason: 'high_confidence', checkpointProfile: { grading: true, ocr: true, cheating: true, history: true, timeline: true } },
      { paperId: 'p2', studentRef: 'AI-002', anonymizedLabel: 'Paper #2', selectionReason: 'high_confidence', checkpointProfile: { grading: true, ocr: true, cheating: true, history: true, timeline: true } },
      { paperId: 'p3', studentRef: 'AI-015', anonymizedLabel: 'Paper #3', selectionReason: 'ocr_issue', checkpointProfile: { grading: true, ocr: false, cheating: true, history: true, timeline: false } },
      { paperId: 'p4', studentRef: 'AI-030', anonymizedLabel: 'Paper #4', selectionReason: 'ocr_issue', checkpointProfile: { grading: false, ocr: false, cheating: true, history: true, timeline: true } },
      { paperId: 'p5', studentRef: 'AI-008', anonymizedLabel: 'Paper #5', selectionReason: 'complex_case', checkpointProfile: { grading: false, ocr: true, cheating: false, history: false, timeline: true } },
      { paperId: 'p6', studentRef: 'AI-020', anonymizedLabel: 'Paper #6', selectionReason: 'complex_case', checkpointProfile: { grading: false, ocr: true, cheating: false, history: false, timeline: false } },
    ],
    aiScores: {
      p1: {
        c1: { level: 5, evidence: ['Utilitarian and deontological frameworks applied', 'Rawlsian justice invoked'], reasoning: 'Sophisticated multi-framework ethical analysis.' },
        c2: { level: 4, evidence: ['GDPR and EU AI Act cited', 'Policy gaps identified'], reasoning: 'Strong policy literacy.' },
        c3: { level: 4, evidence: ['Cambridge Analytica case analyzed', 'Connections drawn to framework'], reasoning: 'Well-integrated case study.' },
        c4: { level: 5, evidence: ['Thesis clearly stated', 'Each claim evidenced', 'Counterarguments addressed'], reasoning: 'Exemplary argumentation.' },
      },
      p2: {
        c1: { level: 3, evidence: ['Utilitarian framework applied only'], reasoning: 'Adequate but single-framework analysis.' },
        c2: { level: 3, evidence: ['GDPR mentioned', 'Limited depth'], reasoning: 'Surface-level policy coverage.' },
        c3: { level: 4, evidence: ['Two case studies integrated'], reasoning: 'Good case study use.' },
        c4: { level: 3, evidence: ['Coherent argument', 'Minor gaps in counterargument'], reasoning: 'Satisfactory coherence.' },
      },
      p3: {
        c1: { level: 3, evidence: ['Framework section readable'], reasoning: 'OCR partial — assessment limited.' },
        c2: { level: 2, evidence: ['Policy section partially extracted'], reasoning: 'OCR degraded this section.' },
        c3: { level: 3, evidence: ['Case study legible'], reasoning: 'Case study readable.' },
        c4: { level: 2, evidence: ['Conclusion unclear due to OCR'], reasoning: 'Argument coherence hard to assess.' },
      },
      p4: {
        c1: { level: 2, evidence: ['Basic ethical terms used'], reasoning: 'Framework application shallow.' },
        c2: { level: 2, evidence: ['One policy cited'], reasoning: 'Limited policy analysis.' },
        c3: { level: 3, evidence: ['One case study present'], reasoning: 'Adequate integration.' },
        c4: { level: 2, evidence: ['Argument present but weak'], reasoning: 'Coherence needs improvement.' },
      },
      p5: {
        c1: { level: 1, evidence: ['No framework identified'], reasoning: 'Ethical framework absent.' },
        c2: { level: 1, evidence: ['No policy cited'], reasoning: 'Policy analysis absent.' },
        c3: { level: 2, evidence: ['Brief mention of a case'], reasoning: 'Minimal case study use.' },
        c4: { level: 2, evidence: ['Some argument present'], reasoning: 'Weak but present.' },
      },
      p6: {
        c1: { level: 2, evidence: ['Framework mentioned but misapplied'], reasoning: 'Misapplication detected.' },
        c2: { level: 1, evidence: ['No substantive policy discussed'], reasoning: 'Policy section absent.' },
        c3: { level: 2, evidence: ['Case study misattributed'], reasoning: 'Integrity concern on sources.' },
        c4: { level: 1, evidence: ['Incoherent argument structure'], reasoning: 'Argument fails to cohere.' },
      },
    },
  },
  'NW-CASE-01': {
    criteria: [
      { id: 'c1', name: 'Database Normalization', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c2', name: 'SQL Query Design', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
      { id: 'c3', name: 'Transaction Handling', levelLabels: ['Beginning', 'Developing', 'Satisfactory', 'Proficient', 'Exemplary'] },
    ],
    papers: [
      { paperId: 'p1', studentRef: 'STU-101', anonymizedLabel: 'Paper #1', selectionReason: 'high_confidence', checkpointProfile: { grading: true, ocr: true, cheating: true, history: true, timeline: true } },
      { paperId: 'p2', studentRef: 'STU-102', anonymizedLabel: 'Paper #2', selectionReason: 'high_confidence', checkpointProfile: { grading: true, ocr: true, cheating: true, history: true, timeline: true } },
      { paperId: 'p3', studentRef: 'STU-103', anonymizedLabel: 'Paper #3', selectionReason: 'complex_case', checkpointProfile: { grading: false, ocr: true, cheating: false, history: true, timeline: true } },
    ],
    aiScores: {
      p1: {
        c1: { level: 4, evidence: ['Correctly identified 1NF, 2NF, 3NF'], reasoning: 'Strong normalization analysis with clear examples.' },
        c2: { level: 4, evidence: ['Optimized queries with proper indexing'], reasoning: 'Efficient SQL with good use of joins.' },
        c3: { level: 3, evidence: ['ACID properties explained'], reasoning: 'Adequate transaction handling coverage.' },
      },
      p2: {
        c1: { level: 3, evidence: ['1NF and 2NF correct, 3NF partially'], reasoning: 'Good normalization with minor gaps.' },
        c2: { level: 3, evidence: ['Queries functional but not optimized'], reasoning: 'Correct logic but could improve performance.' },
        c3: { level: 2, evidence: ['Basic transaction concepts only'], reasoning: 'Limited depth in transaction handling.' },
      },
      p3: {
        c1: { level: 2, evidence: ['Normalization partially explained'], reasoning: 'Incomplete normalization discussion.' },
        c2: { level: 2, evidence: ['Queries work but have errors'], reasoning: 'Functional but with logical flaws.' },
        c3: { level: 1, evidence: ['No transaction handling discussed'], reasoning: 'Missing transaction concepts.' },
      },
    },
  },
};

function buildCalibrationData(assignmentId: string): CalibrationData {
  const seed = CALIBRATION_SEEDS[assignmentId];
  if (!seed) {
    return { phase: 'not_started', papers: [], criteria: [], scores: [], activeCalibrationPaperId: null, deltaThreshold: 15, aggregateDelta: 0 };
  }

  const scores: CalibrationScore[] = [];
  for (const paper of seed.papers) {
    for (const criterion of seed.criteria) {
      const aiData = seed.aiScores[paper.paperId]?.[criterion.id];
      scores.push({
        paperId: paper.paperId,
        criterionId: criterion.id,
        instructorLevel: 0,
        aiLevel: aiData?.level ?? 3,
        aiEvidence: aiData?.evidence ?? [],
        aiReasoning: aiData?.reasoning ?? '',
        delta: 0,
        status: 'pending',
        evidenceExchanges: [],
      });
    }
  }

  return {
    phase: 'sample_review',
    papers: seed.papers,
    criteria: seed.criteria,
    scores,
    activeCalibrationPaperId: seed.papers[0]?.paperId ?? null,
    deltaThreshold: 15,
    aggregateDelta: 0,
  };
}

// --- Main Store ---

interface GradingState {
  currentAssignmentId: string | null;
  activeStudentId: string | null;
  phase: GradingPhase;
  assignments: Record<string, AssignmentNarrative>;

  // Calibration state keyed by assignment ID
  calibration: Record<string, CalibrationData>;

  // Actions
  selectAssignment: (id: string) => void;
  setPhase: (phase: GradingPhase) => void;
  setActiveStudent: (id: string | null) => void;
  updateCriterion: (studentId: string, criterionId: string, updates: Partial<Criterion>) => void;
  reset: () => void;

  // Calibration actions
  initCalibration: (assignmentId: string) => void;
  setCalibrationPhase: (assignmentId: string, phase: CalibrationPhase) => void;
  setActiveCalibrationPaper: (assignmentId: string, paperId: string | null) => void;
  setInstructorLevel: (assignmentId: string, paperId: string, criterionId: string, level: number) => void;
  computeDelta: (assignmentId: string) => void;
  addEvidenceExchange: (assignmentId: string, paperId: string, criterionId: string, exchange: Omit<EvidenceExchange, 'id' | 'timestamp'>) => void;
  resolveScore: (assignmentId: string, paperId: string, criterionId: string, status: 'accepted' | 'resolved') => void;
  completeCalibration: (assignmentId: string) => void;

  // Feedback & Notes State
  internalNotes: InternalNote[];
  criterionFeedbacks: Record<string, CriterionFeedbackState>;
  overallFeedback: OverallFeedbackState | null;

  // Feedback Actions
  addInternalNote: (note: Omit<InternalNote, 'id' | 'timestamp'>) => void;
  confirmCriterionScore: (criterionId: string, data: Pick<CriterionFeedbackState, 'tier' | 'tierLabel' | 'feedbackText' | 'thinkingPrompt'>) => void;
  updateCriterionFeedback: (criterionId: string, text: string) => void;
  approveCriterionFeedback: (criterionId: string) => void;
  regenerateCriterionFeedback: (criterionId: string, newText: string, newTier: FeedbackTier, newTierLabel: string) => void;
  setOverallFeedback: (data: OverallFeedbackState) => void;
  updateOverallFeedbackText: (text: string) => void;
  mergeInstructorNote: (note: string) => void;
  submitFinalFeedback: () => void;
}

export const useGradingStore = create<GradingState>()(
  persist(
    (set) => ({
      currentAssignmentId: null,
      activeStudentId: null,
      phase: 'selection',
      calibration: {},
      internalNotes: [],
      criterionFeedbacks: {},
      overallFeedback: null,

      assignments: {
        'se-101': {
          id: 'se-101',
          title: 'Software Engineering 101',
          description: 'Focus: Ambiguous Rubric (Fix 1). High override rate on C3 will trigger Rubric Realignment.',
          targetFix: 'f1',
          students: [
            {
              id: 'rohan',
              name: 'Rohan Verma',
              roll: 'CS21B001',
              status: 'manipulated',
              integrityFlags: ['Hidden White Font', 'Injection-style language'],
              isDoubleBlind: true,
              progress: 0,
              criteria: {
                c1: { id: 'c1', name: 'Conceptual Accuracy', level: 3, confidence: 0.85, reasoning: 'AI evaluated visible text.', evidence: ['Normalization ensures reduncancy...'] },
                c2: { id: 'c2', name: 'Logic Flow', level: 2, confidence: 0.9, reasoning: 'Structure matches rubric', evidence: ['First normal form requires...'] },
                c3: { id: 'c3', name: 'Real-world Context', level: 1, confidence: 0.45, reasoning: 'Vague description in rubric', evidence: [] },
              }
            },
            {
              id: 'meghna',
              name: 'Meghna Iyer',
              roll: 'CS21B004',
              status: 'clean',
              isDoubleBlind: false,
              progress: 0,
              integrityFlags: [],
              criteria: {
                c1: { id: 'c1', name: 'Conceptual Accuracy', level: 4, confidence: 0.95, reasoning: 'Clear definition provided.', evidence: ['Normalization ensures...'] },
                c2: { id: 'c2', name: 'Logic Flow', level: 3, confidence: 0.88, reasoning: 'Lossless join used.', evidence: ['Tables decomposed...'] },
                c3: { id: 'c3', name: 'Real-world Context', level: 2, confidence: 0.7, reasoning: 'Adequate application.', evidence: [] },
              }
            }
          ]
        },
        'dbms-202': {
          id: 'dbms-202',
          title: 'DBMS - Normalization',
          description: 'Focus: AI Extraction failure (Fix 2). Hand-written OCR errors on Arjun\'s paper.',
          targetFix: 'f2',
          students: [
            {
              id: 'arjun',
              name: 'Arjun Mehta',
              roll: 'CS21B002',
              status: 'suspicious',
              integrityFlags: ['OCR Confidence Low'],
              ocrHealth: 74,
              isDoubleBlind: true,
              progress: 0,
              criteria: {
                c1: { id: 'c1', name: 'Normal Forms', level: 3, confidence: 0.84, reasoning: 'Identified 1NF and 2NF', evidence: ['1NF requires atomic values'] },
                c3: { id: 'c3', name: 'Transitive Deps', level: 1, confidence: 0.55, reasoning: 'OCR unclear on line 4', evidence: [] },
              }
            }
          ]
        },
        'ds-303': {
          id: 'ds-303',
          title: 'Data Structures - Batch 3B',
          description: 'Focus: Instructor Realignment (Fix 3). Fatigue detection after bulk-approving.',
          targetFix: 'f3',
          students: [
            {
              id: 'priya',
              name: 'Priya Sharma',
              roll: 'CS21B009',
              status: 'clean',
              isDoubleBlind: true,
              progress: 0,
              integrityFlags: [],
              criteria: {
                c1: { id: 'c1', name: 'Algorithm Efficiency', level: 3, confidence: 0.95, reasoning: 'Correct Big-O analysis.', evidence: ['Time complexity is O(n)...'] },
                c2: { id: 'c2', name: 'Edge Case Handling', level: 2, confidence: 0.8, reasoning: 'Missed empty array case.', evidence: [] },
              }
            }
          ]
        }
      },

      selectAssignment: (id) => set({ currentAssignmentId: id, phase: 'blind' }),
      setPhase: (phase) => set({ phase }),
      setActiveStudent: (id) => set({ activeStudentId: id }),
      updateCriterion: (studentId, criterionId, updates) => set((state) => {
        const assignment = state.assignments[state.currentAssignmentId || ''];
        if (!assignment) return state;
        const updatedStudents = assignment.students.map(s => {
          if (s.id !== studentId) return s;
          return { ...s, criteria: { ...s.criteria, [criterionId]: { ...s.criteria[criterionId], ...updates } } };
        });
        return { ...state, assignments: { ...state.assignments, [state.currentAssignmentId!]: { ...assignment, students: updatedStudents } } };
      }),
      reset: () => set({ currentAssignmentId: null, activeStudentId: null, phase: 'selection' }),

      // --- Calibration Actions ---

      initCalibration: (assignmentId) => set((state) => {
        if (state.calibration[assignmentId]?.phase && state.calibration[assignmentId].phase !== 'not_started') {
          return state; // Already initialized, don't overwrite
        }
        return { calibration: { ...state.calibration, [assignmentId]: buildCalibrationData(assignmentId) } };
      }),

      setCalibrationPhase: (assignmentId, phase) => set((state) => {
        const cal = state.calibration[assignmentId];
        if (!cal) return state;
        return { calibration: { ...state.calibration, [assignmentId]: { ...cal, phase } } };
      }),

      setActiveCalibrationPaper: (assignmentId, paperId) => set((state) => {
        const cal = state.calibration[assignmentId];
        if (!cal) return state;
        return { calibration: { ...state.calibration, [assignmentId]: { ...cal, activeCalibrationPaperId: paperId } } };
      }),

      setInstructorLevel: (assignmentId, paperId, criterionId, level) => set((state) => {
        const cal = state.calibration[assignmentId];
        if (!cal) return state;
        const scores = cal.scores.map(s =>
          s.paperId === paperId && s.criterionId === criterionId ? { ...s, instructorLevel: level } : s
        );
        return { calibration: { ...state.calibration, [assignmentId]: { ...cal, scores } } };
      }),

      computeDelta: (assignmentId) => set((state) => {
        const cal = state.calibration[assignmentId];
        if (!cal) return state;

        const scores = cal.scores.map(s => {
          const delta = s.instructorLevel > 0 ? Math.abs(s.instructorLevel - s.aiLevel) : 0;
          return { ...s, delta };
        });

        const gradedScores = scores.filter(s => s.instructorLevel > 0);
        const aggregateDelta = gradedScores.length > 0
          ? (gradedScores.reduce((sum, s) => sum + (s.delta / 4) * 100, 0) / gradedScores.length)
          : 0;

        return { calibration: { ...state.calibration, [assignmentId]: { ...cal, scores, aggregateDelta } } };
      }),

      addEvidenceExchange: (assignmentId, paperId, criterionId, exchange) => set((state) => {
        const cal = state.calibration[assignmentId];
        if (!cal) return state;
        const newExchange: EvidenceExchange = {
          ...exchange,
          id: `ex-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        const scores = cal.scores.map(s =>
          s.paperId === paperId && s.criterionId === criterionId
            ? { ...s, status: 'negotiating' as const, evidenceExchanges: [...s.evidenceExchanges, newExchange] }
            : s
        );
        return { calibration: { ...state.calibration, [assignmentId]: { ...cal, scores } } };
      }),

      resolveScore: (assignmentId, paperId, criterionId, status) => set((state) => {
        const cal = state.calibration[assignmentId];
        if (!cal) return state;

        let adjustedScores = cal.scores.map(s => {
          if (s.paperId !== paperId || s.criterionId !== criterionId) return s;
          // If instructor accepted AI, reconcile instructor level to AI level
          const instructorLevel = status === 'accepted' ? s.aiLevel : s.instructorLevel;
          const delta = Math.abs(instructorLevel - s.aiLevel);
          return { ...s, instructorLevel, delta, status };
        });

        const gradedScores = adjustedScores.filter(s => s.instructorLevel > 0);
        const aggregateDelta = gradedScores.length > 0
          ? (gradedScores.reduce((sum, s) => sum + (s.delta / 4) * 100, 0) / gradedScores.length)
          : 0;

        return { calibration: { ...state.calibration, [assignmentId]: { ...cal, scores: adjustedScores, aggregateDelta } } };
      }),

      completeCalibration: (assignmentId) => set((state) => {
        const cal = state.calibration[assignmentId];
        if (!cal) return state;
        return { calibration: { ...state.calibration, [assignmentId]: { ...cal, phase: 'complete' } } };
      }),

      // --- Feedback Actions ---
      addInternalNote: (note) => set((state) => ({
        internalNotes: [...state.internalNotes, {
          ...note,
          id: `note-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }],
      })),

      confirmCriterionScore: (criterionId, data) => set((state) => ({
        criterionFeedbacks: {
          ...state.criterionFeedbacks,
          [criterionId]: {
            ...data,
            criterionId,
            authorship: 'ai_generated',
            isConfirmed: true,
            isApproved: false,
            regenCount: 0,
          },
        },
      })),

      updateCriterionFeedback: (criterionId, text) => set((state) => {
        const fb = state.criterionFeedbacks[criterionId];
        if (!fb) return state;
        return {
          criterionFeedbacks: {
            ...state.criterionFeedbacks,
            [criterionId]: { ...fb, feedbackText: text, authorship: 'instructor_edited' },
          },
        };
      }),

      approveCriterionFeedback: (criterionId) => set((state) => {
        const fb = state.criterionFeedbacks[criterionId];
        if (!fb) return state;
        return {
          criterionFeedbacks: {
            ...state.criterionFeedbacks,
            [criterionId]: { ...fb, isApproved: true },
          },
        };
      }),

      regenerateCriterionFeedback: (criterionId, newText, newTier, newTierLabel) => set((state) => {
        const fb = state.criterionFeedbacks[criterionId];
        if (!fb || fb.regenCount >= 2) return state;
        return {
          criterionFeedbacks: {
            ...state.criterionFeedbacks,
            [criterionId]: {
              ...fb,
              feedbackText: newText,
              tier: newTier,
              tierLabel: newTierLabel,
              regenCount: fb.regenCount + 1,
              authorship: 'regenerated',
            },
          },
        };
      }),

      setOverallFeedback: (data) => set(() => ({
        overallFeedback: data,
      })),

      updateOverallFeedbackText: (text) => set((state) => {
        if (!state.overallFeedback) return state;
        return {
          overallFeedback: { ...state.overallFeedback, documentText: text, authorship: 'instructor_edited' },
        };
      }),

      mergeInstructorNote: (note) => set((state) => {
        if (!state.overallFeedback) return state;
        return {
          overallFeedback: { ...state.overallFeedback, instructorNote: note },
        };
      }),

      submitFinalFeedback: () => set((state) => {
        if (!state.overallFeedback) return state;
        return {
          overallFeedback: { ...state.overallFeedback, isSubmitted: true },
        };
      }),
    }),
    { name: 'grading-hub-storage' }
  )
);
