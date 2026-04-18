import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Step = 1 | 2 | 3 | 4 | 5 | 6;

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: "system" | "user" | "ai" | "auditor";
}

export type BloomLevel = "L1: Remember" | "L2: Understand" | "L3: Apply" | "L4: Analyze" | "L5: Evaluate" | "L6: Create";

export type BlockType = "instructions" | "questions" | "deliverables" | "resources";

export interface InstructionsBlock {
  id: string;
  type: "instructions";
  title: string;
  body: string;
}

export interface Question {
  id: string;
  text: string;
  bloomLevel: BloomLevel;
  bloomSuggested: BloomLevel;
  weight: number;
}

export interface QuestionsBlock {
  id: string;
  type: "questions";
  title: string;
  questions: Question[];
}

export interface DeliverableItem {
  id: string;
  name: string;
  format: string;
  description: string;
}

export interface DeliverablesBlock {
  id: string;
  type: "deliverables";
  title: string;
  items: DeliverableItem[];
}

export interface ResourceItem {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface ResourcesBlock {
  id: string;
  type: "resources";
  title: string;
  items: ResourceItem[];
}

export type Block = InstructionsBlock | QuestionsBlock | DeliverablesBlock | ResourcesBlock;

export type AssignmentType = "Project" | "MCQ" | "Design" | "Lab Record" | "Essay" | "Viva" | "Case Study" | "Specialized" | null;

export function suggestBloom(text: string): BloomLevel {
  const t = text.toLowerCase();
  if (/\b(design|create|build|develop|construct|compose|produce|invent|propose)\b/.test(t)) return "L6: Create";
  if (/\b(evaluate|justify|critique|defend|argue|assess|judge|recommend)\b/.test(t)) return "L5: Evaluate";
  if (/\b(analy[sz]e|compare|contrast|differentiate|examine|investigate|decompose)\b/.test(t)) return "L4: Analyze";
  if (/\b(apply|implement|use|solve|demonstrate|execute|illustrate)\b/.test(t)) return "L3: Apply";
  if (/\b(explain|describe|summari[sz]e|interpret|paraphrase|classify)\b/.test(t)) return "L2: Understand";
  if (/\b(list|define|name|identify|recall|state|recognize)\b/.test(t)) return "L1: Remember";
  return "L2: Understand";
}

interface COPOEntry {
  co: string;
  poMapping: Record<string, number>;
}

export const PO_DEFINITIONS: Record<string, string> = {
  PO1: "Engineering Knowledge: Apply mathematics, science, and engineering fundamentals.",
  PO2: "Problem Analysis: Identify and analyze complex engineering problems.",
  PO3: "Design/Development of Solutions: Design systems that meet specific needs.",
  PO4: "Conduct Investigations of Complex Problems: Use research-based knowledge.",
  PO5: "Modern Tool Usage: Create, select, and apply appropriate techniques/tools.",
  PO6: "The Engineer and Society: Apply reasoning to assess societal/health/safety issues.",
};

export const CO_DEFINITIONS: Record<string, string> = {
  CO1: "Understand software development lifecycles and modern methodologies.",
  CO2: "Design and implement modular system architectures using design patterns.",
  CO3: "Apply comprehensive testing strategies and validation techniques.",
  CO4: "Evaluate system performance and ethical implications of software.",
  CO5: "Collaborate effectively in agile development and peer review environments.",
};

export interface Assignment {
  type: AssignmentType;
  title: string;
  brief: string;
  syllabusScope?: string; // Syllabus or scope for AI to analyze
  artifacts: string[];
  blocks: Block[];
  copoMapping: COPOEntry[];
  deadline: string;
  latePolicy: string;
  institution: {
    name: string;
    dept: string;
    accreditation: string[];
  };
}

export interface CriterionLevel {
  label: string;
  description: string;
  points: number;
}

export interface MatrixCriterion {
  id: string;
  name: string;
  linkedCO: string;
  levels: CriterionLevel[];
  version: string;
  weight: number;
  isDefault: boolean;
}

export type COStrength = "Strong" | "Moderate" | "Weak";

export interface COAlignment {
  co: string;
  strength: COStrength;
}

export interface HistoricalAssignment {
  id: string;
  title: string;
  type: AssignmentType;
  semester: string;
  course: string;
  avgScore: number;
  lastUsed: string;
  coAlignment?: COAlignment[];
  poAlignment?: string[];
  whyThisFits?: string;
  completeness?: { questions: number; deliverables: number; hasRubric: boolean };
  bestMatch?: boolean;
  sampleQuestions?: string[];
  sampleDeliverables?: string[];
  rubricSummary?: string[];
  instructionsPreview?: string;
}

export interface DraftAssignment {
  id: string;
  title: string;
  type: AssignmentType;
  course: string;
  semester: string;
  step: 2 | 3 | 4 | 5 | 6;
  lastEdited: string;
}

interface PreEvalState {
  currentStep: Step;
  selectedCourse: string | null;
  creationMode: "history" | "scratch" | "suggestions" | null;
  selectedHistoryId: string | null;
  assignment: Assignment;
  rubric: MatrixCriterion[];
  auditLog: AuditEvent[];
  lastSaved: string;
  viewMode: "cards" | "table";

  calibrationConfirmed: boolean;
  calibrationStatus: "good" | "needs_attention" | null;

  // Actions
  setStep: (step: Step) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCalibrationConfirmed: (confirmed: boolean) => void;
  setCalibrationStatus: (status: "good" | "needs_attention") => void;
  setCourse: (course: string) => void;
  setCreationMode: (mode: "history" | "scratch" | "suggestions" | null) => void;
  selectHistory: (id: string) => void;
  setViewMode: (mode: "cards" | "table") => void;
  resumeDraft: (draft: DraftAssignment) => void;
  
  // Assignment Actions
  updateAssignment: (data: Partial<Assignment>) => void;
  addBlock: (type: BlockType) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, data: Partial<Block>) => void;
  reorderBlock: (id: string, direction: "up" | "down") => void;
  addQuestion: (blockId: string) => void;
  updateQuestion: (blockId: string, qId: string, data: Partial<Question>) => void;
  removeQuestion: (blockId: string, qId: string) => void;
  addDeliverableItem: (blockId: string) => void;
  updateDeliverableItem: (blockId: string, itemId: string, data: Partial<DeliverableItem>) => void;
  removeDeliverableItem: (blockId: string, itemId: string) => void;
  addResourceItem: (blockId: string) => void;
  updateResourceItem: (blockId: string, itemId: string, data: Partial<ResourceItem>) => void;
  removeResourceItem: (blockId: string, itemId: string) => void;
  
  // Rubric Actions
  updateRubric: (rubric: MatrixCriterion[]) => void;
  addCriterion: () => void;
  updateCriterion: (id: string, data: Partial<MatrixCriterion>) => void;
  removeCriterion: (id: string) => void;
  updateCriterionLevel: (critId: string, levelLabel: string, data: Partial<CriterionLevel>) => void;
  resetRubricToDefault: () => void;
  
  addAudit: (event: Omit<AuditEvent, "id" | "timestamp">) => void;
  reset: () => void;
}

const defaultLevels: CriterionLevel[] = [
  { label: "Exemplary", points: 100, description: "Demonstrates deep mastery and original insight." },
  { label: "Proficient", points: 75, description: "Meets all requirements with good technical accuracy." },
  { label: "Developing", points: 50, description: "Meets basic requirements but lacks depth in some areas." },
  { label: "Beginning", points: 25, description: "Minimal understanding of the concepts shown." },
];

const initialAssignment: Assignment = {
  type: null,
  title: "",
  brief: "",
  artifacts: [],
  blocks: [
    {
      id: "blk-instructions-seed",
      type: "instructions",
      title: "Instructions",
      body: "",
    },
    {
      id: "blk-questions-seed",
      type: "questions",
      title: "Questions / Tasks",
      questions: [
        {
          id: "q-seed-1",
          text: "",
          bloomLevel: "L2: Understand",
          bloomSuggested: "L2: Understand",
          weight: 100,
        },
      ],
    },
    {
      id: "blk-deliverables-seed",
      type: "deliverables",
      title: "Deliverables",
      items: [],
    },
  ],
  copoMapping: Object.keys(CO_DEFINITIONS).map(co => ({
    co,
    poMapping: { PO1: 3, PO2: 2 }
  })),
  deadline: "",
  latePolicy: "no-late",
  institution: {
    name: "IIM Bangalore",
    dept: "Faculty of Computer Science & Engineering",
    accreditation: ["NAAC A++", "NBA Accredited", "Tier-1 Institutional Grant"],
  }
};

const makeBlock = (type: BlockType): Block => {
  const id = `blk-${type}-${Date.now()}`;
  switch (type) {
    case "instructions":
      return { id, type, title: "Instructions", body: "" };
    case "questions":
      return {
        id,
        type,
        title: "Questions / Tasks",
        questions: [{ id: `q-${Date.now()}`, text: "", bloomLevel: "L2: Understand", bloomSuggested: "L2: Understand", weight: 0 }],
      };
    case "deliverables":
      return { id, type, title: "Deliverables", items: [] };
    case "resources":
      return { id, type, title: "Resources", items: [] };
  }
};

const makeDefaultLevels = (): CriterionLevel[] => defaultLevels.map(l => ({ ...l }));

const initialMatrixRubric: MatrixCriterion[] = [
  {
    id: "crit-tech",
    name: "Technical Accuracy",
    linkedCO: "CO1",
    version: "v1.0 (Faculty Standard)",
    weight: 35,
    isDefault: true,
    levels: makeDefaultLevels(),
  },
  {
    id: "crit-org",
    name: "Code Organization",
    linkedCO: "CO2",
    version: "v1.0 (Faculty Standard)",
    weight: 35,
    isDefault: true,
    levels: makeDefaultLevels(),
  },
  {
    id: "crit-reason",
    name: "Reasoning & Justification",
    linkedCO: "CO4",
    version: "v1.0 (Faculty Standard)",
    weight: 30,
    isDefault: true,
    levels: makeDefaultLevels(),
  },
];

export const MIN_CRITERIA = 3;
export const MAX_CRITERIA = 6;

const mockAudit: AuditEvent[] = [
  { id: "1", timestamp: "Yesterday, 10:00 AM", action: "Session Initialized", details: "Faculty Session established at ESU Tech.", type: "system" },
  { id: "2", timestamp: "Yesterday, 11:30 AM", action: "Syllabus Compliance Check", details: "All 5 Course Outcomes (COs) validated for Semester VI.", type: "auditor" },
];

export const MOCK_DRAFTS: DraftAssignment[] = [
  { id: "draft-1", title: "Midterm: REST API Design Project", type: "Project", course: "Software Engineering", semester: "SEM 6", step: 3, lastEdited: "2 hours ago" },
  { id: "draft-2", title: "Unit Test: Database Indexing Quiz", type: "MCQ", course: "Database Management", semester: "SEM 4", step: 2, lastEdited: "Yesterday" },
  { id: "draft-3", title: "Final: Neural Network Implementation", type: "Project", course: "Artificial Intelligence", semester: "SEM 8", step: 4, lastEdited: "3 days ago" },
];

export const MOCK_HISTORY: HistoricalAssignment[] = [
  {
    id: "hist-1",
    title: "Fall 2024: MVC Design Patterns Final",
    type: "Project",
    semester: "SEM VI",
    course: "Software Engineering",
    avgScore: 82,
    lastUsed: "Dec 2024",
    bestMatch: true,
    coAlignment: [
      { co: "CO2", strength: "Strong" },
      { co: "CO3", strength: "Strong" },
      { co: "CO1", strength: "Moderate" },
    ],
    poAlignment: ["PO2", "PO3", "PO5"],
    whyThisFits: "Covers the same architecture outcomes you have mapped for this semester, with a rubric already calibrated to your faculty standard.",
    completeness: { questions: 6, deliverables: 3, hasRubric: true },
    sampleQuestions: [
      "Design a modular MVC architecture for a small e-commerce catalog.",
      "Compare MVC, MVVM, and MVP — when would you pick each?",
      "Identify three separation-of-concerns violations in the provided legacy code.",
    ],
    sampleDeliverables: [
      "Source code repository with README",
      "Architecture diagram (PDF)",
      "Written design rationale (500–800 words)",
    ],
    rubricSummary: ["Architecture decisions (30%)", "Separation of concerns (25%)", "Code organization (25%)", "Testing strategy (20%)"],
    instructionsPreview: "Students design and critique a small MVC application across model, view, and controller layers, then defend their architectural choices in a short write-up.",
  },
  {
    id: "hist-2",
    title: "Spring 2024: Agile Scrum Quiz",
    type: "MCQ",
    semester: "SEM VI",
    course: "Software Engineering",
    avgScore: 74,
    lastUsed: "May 2024",
    coAlignment: [
      { co: "CO5", strength: "Strong" },
      { co: "CO1", strength: "Moderate" },
    ],
    poAlignment: ["PO6"],
    whyThisFits: "Good fit for quick formative checks on process and collaboration outcomes.",
    completeness: { questions: 20, deliverables: 1, hasRubric: true },
    sampleQuestions: [
      "Which Scrum ceremony is used to demo completed work?",
      "Story points measure effort, not time — true or false?",
      "Define the role of a Product Owner in two sentences.",
    ],
    sampleDeliverables: ["Completed answer sheet (online submission)"],
    rubricSummary: ["Auto-scored", "Penalty for skipped items"],
    instructionsPreview: "20-question timed quiz covering Scrum ceremonies, roles, and estimation. Auto-scored with immediate feedback.",
  },
  {
    id: "hist-3",
    title: "Fall 2023: Enterprise System Specs",
    type: "Essay",
    semester: "SEM VI",
    course: "Software Engineering",
    avgScore: 88,
    lastUsed: "Dec 2023",
    bestMatch: true,
    coAlignment: [
      { co: "CO2", strength: "Strong" },
      { co: "CO4", strength: "Strong" },
    ],
    poAlignment: ["PO3", "PO4"],
    whyThisFits: "Strong essay-style prompt that aligned well with CO2/CO4 last year — high average score suggests calibrated difficulty.",
    completeness: { questions: 3, deliverables: 2, hasRubric: true },
    sampleQuestions: [
      "Write a 1,000-word specification for an enterprise inventory system.",
      "Identify two ethical risks in your proposed design.",
      "Justify your choice of stack against two alternatives.",
    ],
    sampleDeliverables: [
      "Essay document (PDF, 1,200–1,500 words)",
      "Stack comparison table (appendix)",
    ],
    rubricSummary: ["Clarity of specification (35%)", "Technical correctness (30%)", "Ethical reasoning (20%)", "Alternatives analysis (15%)"],
    instructionsPreview: "Extended essay assignment combining design specification with ethical evaluation of the proposed system.",
  },
  {
    id: "hist-4",
    title: "Winter 2024: Cloud Architecture Case Study",
    type: "Case Study",
    semester: "SEM VII",
    course: "Cloud Computing",
    avgScore: 79,
    lastUsed: "Jan 2024",
    coAlignment: [{ co: "CO2", strength: "Strong" }, { co: "CO3", strength: "Moderate" }],
    whyThisFits: "Case-study format with a ready rubric — adaptable to other architecture topics.",
    completeness: { questions: 4, deliverables: 2, hasRubric: true },
    sampleQuestions: ["Analyze the provided outage post-mortem.", "Propose a redundancy plan."],
    sampleDeliverables: ["Analysis report (PDF)", "Architecture diagram showing redundancy"],
    rubricSummary: ["Analysis depth (40%)", "Proposed solution (40%)", "Communication (20%)"],
    instructionsPreview: "Students analyze a published cloud outage and propose resilience improvements.",
  },
  {
    id: "hist-5",
    title: "Spring 2023: Database Normalization Lab",
    type: "Lab Record",
    semester: "SEM V",
    course: "Database Systems",
    avgScore: 85,
    lastUsed: "Apr 2023",
    coAlignment: [{ co: "CO2", strength: "Strong" }],
    whyThisFits: "Hands-on lab with predictable grading — mature rubric.",
    completeness: { questions: 5, deliverables: 2, hasRubric: true },
    sampleQuestions: ["Normalize the given schema to 3NF.", "Justify each decomposition step."],
    sampleDeliverables: ["Completed lab record (handwritten + scanned)", "Normalized schema diagram"],
    rubricSummary: ["Correctness (60%)", "Justification (40%)"],
    instructionsPreview: "Lab record walkthrough of progressive normalization with instructor checkpoints.",
  },
  {
    id: "hist-6",
    title: "Fall 2023: Microservices Design Pattern",
    type: "Project",
    semester: "SEM VII",
    course: "Software Architecture",
    avgScore: 91,
    lastUsed: "Nov 2023",
    bestMatch: true,
    coAlignment: [{ co: "CO2", strength: "Strong" }, { co: "CO3", strength: "Strong" }, { co: "CO4", strength: "Moderate" }],
    poAlignment: ["PO2", "PO3", "PO5"],
    whyThisFits: "Highest-performing project in your library — rubric is battle-tested across 2 semesters.",
    completeness: { questions: 5, deliverables: 3, hasRubric: true },
    sampleQuestions: ["Decompose a monolith into three bounded contexts.", "Design inter-service communication.", "Document trade-offs chosen."],
    sampleDeliverables: ["GitHub repository with service source", "Service contract document (OpenAPI)", "Trade-off report (PDF)"],
    rubricSummary: ["Decomposition rationale (30%)", "Service contracts (25%)", "Trade-off analysis (25%)", "Documentation (20%)"],
    instructionsPreview: "Small-group project to decompose a provided monolith into microservices and defend the boundary choices.",
  },
  {
    id: "hist-7",
    title: "Summer 2024: DevOps Pipeline Implementation",
    type: "Project",
    semester: "SEM VIII",
    course: "DevOps Practices",
    avgScore: 87,
    lastUsed: "Jun 2024",
    coAlignment: [{ co: "CO3", strength: "Strong" }],
    completeness: { questions: 3, deliverables: 2, hasRubric: true },
    sampleQuestions: ["Build a CI pipeline for the provided repo.", "Add a gated deploy step."],
    sampleDeliverables: ["Pipeline config file (YAML)", "Screenshot of passing pipeline run"],
    rubricSummary: ["Pipeline completeness (50%)", "Gate logic (30%)", "Documentation (20%)"],
    instructionsPreview: "Implement a CI/CD pipeline with staged deploy gates using the provided starter repo.",
  },
  {
    id: "hist-8",
    title: "Spring 2024: API Security Viva",
    type: "Viva",
    semester: "SEM VI",
    course: "Cyber Security",
    avgScore: 76,
    lastUsed: "Mar 2024",
    coAlignment: [{ co: "CO4", strength: "Moderate" }],
    completeness: { questions: 10, deliverables: 0, hasRubric: true },
    sampleQuestions: ["Explain OAuth 2.0 flows.", "Describe mitigation for IDOR."],
    rubricSummary: ["Depth (40%)", "Clarity (30%)", "Examples (30%)"],
    instructionsPreview: "Oral viva over 10 rotating questions covering common API security pitfalls.",
  },
  {
    id: "hist-9",
    title: "Winter 2023: Mobile App UX Design",
    type: "Design",
    semester: "SEM V",
    course: "UI/UX Design",
    avgScore: 83,
    lastUsed: "Feb 2023",
    coAlignment: [{ co: "CO2", strength: "Moderate" }],
    completeness: { questions: 2, deliverables: 3, hasRubric: true },
    sampleQuestions: ["Redesign the onboarding flow.", "Justify each interaction."],
    sampleDeliverables: ["Figma prototype (shared link)", "Justification document (PDF)", "Before/after comparison slide"],
    rubricSummary: ["Flow clarity (40%)", "Visual hierarchy (30%)", "Justification (30%)"],
    instructionsPreview: "Redesign exercise on a provided onboarding flow with a short justification write-up.",
  },
  {
    id: "hist-10",
    title: "Fall 2024: Data Structures Algorithm Analysis",
    type: "Specialized",
    semester: "SEM IV",
    course: "Data Structures",
    avgScore: 80,
    lastUsed: "Oct 2024",
    coAlignment: [{ co: "CO3", strength: "Strong" }],
    completeness: { questions: 8, deliverables: 1, hasRubric: false },
    sampleQuestions: ["Compare sorting algorithms.", "Prove worst-case of QuickSort."],
    rubricSummary: ["No rubric yet — add one"],
    instructionsPreview: "Analysis tasks on common DS/algorithm trade-offs.",
  },
];

export const usePreEvalStore = create<PreEvalState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      selectedCourse: null,
      creationMode: null,
      selectedHistoryId: null,
      assignment: initialAssignment,
      rubric: initialMatrixRubric,
      auditLog: mockAudit,
      lastSaved: new Date().toLocaleTimeString(),
      viewMode: "cards",
      calibrationConfirmed: false,
      calibrationStatus: null,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, 6) as Step,
      })),
      prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1) as Step,
      })),
      setCalibrationConfirmed: (confirmed) => set({ calibrationConfirmed: confirmed }),
      setCalibrationStatus: (status) => set({ calibrationStatus: status }),
      
      setCourse: (course) => {
        set({ selectedCourse: course });
        get().addAudit({ action: "Institutional Context Loaded", details: `Context: ${course} (ESU Tech)`, type: "system" });
      },
      
      setCreationMode: (mode) => {
        const update: Partial<PreEvalState> = { creationMode: mode, selectedHistoryId: null };
        if (mode === "scratch") {
          update.assignment = { ...get().assignment, ...initialAssignment };
        }
        set(update);
        if (mode) {
          get().addAudit({ action: "Strategy Selection", details: `High-fidelity creation path: ${mode}`, type: "user" });
        }
      },

      selectHistory: (id) => {
        const history = MOCK_HISTORY.find(h => h.id === id);
        if (!history) return;

        const questions = (history.sampleQuestions ?? []);
        const baseWeight = questions.length ? Math.floor(100 / questions.length) : 0;
        const remainder = questions.length ? 100 - baseWeight * questions.length : 0;
        const questionItems: Question[] = questions.map((text, i) => ({
          id: `q-hist-${id}-${i}`,
          text,
          bloomLevel: "L2: Understand" as BloomLevel,
          bloomSuggested: suggestBloom(text),
          weight: baseWeight + (i === questions.length - 1 ? remainder : 0),
        }));

        const deliverableItems: DeliverableItem[] = (history.sampleDeliverables ?? []).map((name, i) => ({
          id: `del-hist-${id}-${i}`,
          name,
          format: "",
          description: "",
        }));

        set({
          selectedHistoryId: id,
          assignment: {
            ...get().assignment,
            title: history.title,
            type: history.type,
            brief: `Reused from ${history.semester}: ${history.title}.`,
            blocks: [
              {
                id: "blk-instructions-seed",
                type: "instructions",
                title: "Instructions",
                body: history.instructionsPreview ?? "",
              },
              {
                id: "blk-questions-seed",
                type: "questions",
                title: "Questions / Tasks",
                questions: questionItems,
              },
              {
                id: "blk-deliverables-seed",
                type: "deliverables",
                title: "Deliverables",
                items: deliverableItems,
              },
            ],
          },
        });
        get().addAudit({ action: "Historical Reuse", details: `Selected: ${history.title}`, type: "user" });
      },

      setViewMode: (mode) => set({ viewMode: mode }),

      resumeDraft: (draft) => {
        set({
          currentStep: draft.step,
          selectedCourse: draft.course,
          assignment: { ...get().assignment, title: draft.title, type: draft.type },
        });
        get().addAudit({ action: "Draft Resumed", details: `Resumed: ${draft.title}`, type: "user" });
      },
      
      updateAssignment: (data) => set((state) => ({ 
        assignment: { ...state.assignment, ...data },
        lastSaved: new Date().toLocaleTimeString()
      })),

      addBlock: (type) => set((state) => ({
        assignment: { ...state.assignment, blocks: [...state.assignment.blocks, makeBlock(type)] },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      removeBlock: (id) => set((state) => ({
        assignment: { ...state.assignment, blocks: state.assignment.blocks.filter(b => b.id !== id) },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      updateBlock: (id, data) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => b.id === id ? ({ ...b, ...data } as Block) : b),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      reorderBlock: (id, direction) => set((state) => {
        const blocks = [...state.assignment.blocks];
        const idx = blocks.findIndex(b => b.id === id);
        if (idx < 0) return state;
        const target = direction === "up" ? idx - 1 : idx + 1;
        if (target < 0 || target >= blocks.length) return state;
        [blocks[idx], blocks[target]] = [blocks[target], blocks[idx]];
        return { assignment: { ...state.assignment, blocks }, lastSaved: new Date().toLocaleTimeString() };
      }),

      addQuestion: (blockId) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "questions") {
              return {
                ...b,
                questions: [...b.questions, {
                  id: "q-" + Date.now(),
                  text: "",
                  bloomLevel: "L2: Understand",
                  bloomSuggested: "L2: Understand",
                  weight: 0,
                }],
              };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      updateQuestion: (blockId, qId, data) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "questions") {
              return {
                ...b,
                questions: b.questions.map(q => {
                  if (q.id !== qId) return q;
                  const merged = { ...q, ...data };
                  if (data.text !== undefined) {
                    merged.bloomSuggested = suggestBloom(data.text);
                  }
                  return merged;
                }),
              };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      removeQuestion: (blockId, qId) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "questions") {
              return { ...b, questions: b.questions.filter(q => q.id !== qId) };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      addDeliverableItem: (blockId) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "deliverables") {
              return {
                ...b,
                items: [...b.items, {
                  id: "del-" + Date.now(),
                  name: "",
                  format: "PDF",
                  description: "",
                }],
              };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      updateDeliverableItem: (blockId, itemId, data) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "deliverables") {
              return {
                ...b,
                items: b.items.map(i => i.id === itemId ? { ...i, ...data } : i),
              };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      removeDeliverableItem: (blockId, itemId) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "deliverables") {
              return { ...b, items: b.items.filter(i => i.id !== itemId) };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      addResourceItem: (blockId) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "resources") {
              return {
                ...b,
                items: [...b.items, {
                  id: "res-" + Date.now(),
                  name: "",
                  link: "",
                  description: "",
                }],
              };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      updateResourceItem: (blockId, itemId, data) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "resources") {
              return {
                ...b,
                items: b.items.map(i => i.id === itemId ? { ...i, ...data } : i),
              };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),

      removeResourceItem: (blockId, itemId) => set((state) => ({
        assignment: {
          ...state.assignment,
          blocks: state.assignment.blocks.map(b => {
            if (b.id === blockId && b.type === "resources") {
              return { ...b, items: b.items.filter(i => i.id !== itemId) };
            }
            return b;
          }),
        },
        lastSaved: new Date().toLocaleTimeString(),
      })),
      
      updateRubric: (rubric) => {
        set({ rubric, lastSaved: new Date().toLocaleTimeString() });
      },

      addCriterion: () => set((state) => {
        if (state.rubric.length >= MAX_CRITERIA) return state;
        const newCrit: MatrixCriterion = {
          id: "crit-" + Date.now(),
          name: "",
          linkedCO: "CO1",
          version: "v1.0 (Custom)",
          weight: 0,
          isDefault: false,
          levels: makeDefaultLevels(),
        };
        return { rubric: [...state.rubric, newCrit], lastSaved: new Date().toLocaleTimeString() };
      }),

      updateCriterion: (id, data) => set((state) => ({
        rubric: state.rubric.map(c => {
          if (c.id !== id) return c;
          const merged = { ...c, ...data };
          if (data.name !== undefined || data.weight !== undefined || data.linkedCO !== undefined) {
            merged.isDefault = false;
            merged.version = "v1.1 (Modified)";
          }
          return merged;
        }),
        lastSaved: new Date().toLocaleTimeString(),
      })),

      removeCriterion: (id) => set((state) => {
        if (state.rubric.length <= MIN_CRITERIA) return state;
        return {
          rubric: state.rubric.filter(c => c.id !== id),
          lastSaved: new Date().toLocaleTimeString(),
        };
      }),

      updateCriterionLevel: (critId, levelLabel, data) => set((state) => ({
        rubric: state.rubric.map(c => {
          if (c.id !== critId) return c;
          return {
            ...c,
            isDefault: false,
            version: "v1.1 (Modified)",
            levels: c.levels.map(lvl => lvl.label === levelLabel ? { ...lvl, ...data } : lvl),
          };
        }),
        lastSaved: new Date().toLocaleTimeString(),
      })),

      resetRubricToDefault: () => set({
        rubric: initialMatrixRubric.map(c => ({ ...c, levels: makeDefaultLevels() })),
        lastSaved: new Date().toLocaleTimeString(),
      }),
      
      addAudit: (event) => set((state) => ({
        auditLog: [
          { 
            id: Date.now().toString(36), 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            ...event 
          },
          ...state.auditLog
        ].slice(0, 50)
      })),
      
      reset: () => set({
        currentStep: 1,
        selectedCourse: null,
        creationMode: null,
        selectedHistoryId: null,
        assignment: initialAssignment,
        rubric: initialMatrixRubric,
        auditLog: mockAudit,
        calibrationConfirmed: false,
        calibrationStatus: null,
      }),
    }),
    {
      name: "pre-eval-persistence-v8",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
