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

export interface Deliverable {
  id: string;
  name: string;
  weight: number;
  format: string;
  bloomLevel: BloomLevel;
  linkedCOs: string[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  deliverables: Deliverable[];
}

export type AssignmentType = "Project" | "MCQ" | "Design" | "Lab Record" | "Essay" | "Viva" | "Case Study" | "Specialized" | null;

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

interface Assignment {
  type: AssignmentType;
  title: string;
  brief: string;
  syllabusScope?: string; // Syllabus or scope for AI to analyze
  artifacts: string[];
  sections: Section[];
  copoMapping: COPOEntry[];
  deadline: string;
  latePolicy: string;
  institution: {
    name: string;
    dept: string;
    accreditation: string[];
  };
}

interface CriterionLevel {
  label: string;
  description: string;
  points: number;
}

interface MatrixCriterion {
  id: string;
  name: string;
  linkedCO: string;
  levels: CriterionLevel[];
  version: string;
}

export interface HistoricalAssignment {
  id: string;
  title: string;
  type: AssignmentType;
  semester: string;
  course: string;
  avgScore: number;
  lastUsed: string;
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
  creationMode: "history" | "scratch" | null;
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
  setCreationMode: (mode: "history" | "scratch" | null) => void;
  selectHistory: (id: string) => void;
  setViewMode: (mode: "cards" | "table") => void;
  resumeDraft: (draft: DraftAssignment) => void;
  
  // Assignment Actions
  updateAssignment: (data: Partial<Assignment>) => void;
  addSection: () => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, data: Partial<Section>) => void;
  addDeliverable: (sectionId: string) => void;
  removeDeliverable: (sectionId: string, delivId: string) => void;
  
  // Rubric Actions
  updateRubric: (rubric: MatrixCriterion[]) => void;
  addCriterion: () => void;
  
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
  sections: [
    { 
      id: "sec-a-" + Date.now(), 
      title: "Section A: Foundational Concepts", 
      description: "Focus on theoretical understanding and core definitions.",
      deliverables: [
        { id: "d1", name: "Theoretical Quiz", weight: 20, format: "PDF Document", bloomLevel: "L1: Remember", linkedCOs: ["CO1"] }
      ]
    },
    { 
      id: "sec-b-" + Date.now(), 
      title: "Section B: Implementation & Application", 
      description: "Applying concepts to practical scenarios.",
      deliverables: [
        { id: "d2", name: "Source Code & Logic", weight: 50, format: "Cloud Link (Figma/GitHub)", bloomLevel: "L3: Apply", linkedCOs: ["CO2", "CO3"] }
      ]
    }
  ],
  copoMapping: Object.keys(CO_DEFINITIONS).map(co => ({
    co,
    poMapping: { PO1: 3, PO2: 2 }
  })),
  deadline: "",
  latePolicy: "no-late",
  institution: {
    name: "Emerald State University of Technology",
    dept: "Faculty of Computer Science & Engineering",
    accreditation: ["NAAC A++", "NBA Accredited", "Tier-1 Institutional Grant"],
  }
};

const initialMatrixRubric: MatrixCriterion[] = [
  { 
    id: "1", 
    name: "Technical Accuracy", 
    linkedCO: "CO1", 
    version: "v1.0 (Faculty Standard)",
    levels: defaultLevels 
  },
  { 
    id: "2", 
    name: "Code Organization", 
    linkedCO: "CO2", 
    version: "v1.0 (Faculty Standard)",
    levels: defaultLevels 
  },
];

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
  { id: "hist-1", title: "Fall 2024: MVC Design Patterns Final", type: "Project", semester: "SEM VI", course: "Software Engineering", avgScore: 82, lastUsed: "Dec 2024" },
  { id: "hist-2", title: "Spring 2024: Agile Scrum Quiz", type: "MCQ", semester: "SEM VI", course: "Software Engineering", avgScore: 74, lastUsed: "May 2024" },
  { id: "hist-3", title: "Fall 2023: Enterprise System Specs", type: "Essay", semester: "SEM VI", course: "Software Engineering", avgScore: 88, lastUsed: "Dec 2023" },
  { id: "hist-4", title: "Winter 2024: Cloud Architecture Case Study", type: "Case Study", semester: "SEM VII", course: "Cloud Computing", avgScore: 79, lastUsed: "Jan 2024" },
  { id: "hist-5", title: "Spring 2023: Database Normalization Lab", type: "Lab Record", semester: "SEM V", course: "Database Systems", avgScore: 85, lastUsed: "Apr 2023" },
  { id: "hist-6", title: "Fall 2023: Microservices Design Pattern", type: "Project", semester: "SEM VII", course: "Software Architecture", avgScore: 91, lastUsed: "Nov 2023" },
  { id: "hist-7", title: "Summer 2024: DevOps Pipeline Implementation", type: "Project", semester: "SEM VIII", course: "DevOps Practices", avgScore: 87, lastUsed: "Jun 2024" },
  { id: "hist-8", title: "Spring 2024: API Security Viva", type: "Viva", semester: "SEM VI", course: "Cyber Security", avgScore: 76, lastUsed: "Mar 2024" },
  { id: "hist-9", title: "Winter 2023: Mobile App UX Design", type: "Design", semester: "SEM V", course: "UI/UX Design", avgScore: 83, lastUsed: "Feb 2023" },
  { id: "hist-10", title: "Fall 2024: Data Structures Algorithm Analysis", type: "Specialized", semester: "SEM IV", course: "Data Structures", avgScore: 80, lastUsed: "Oct 2024" },
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
      nextStep: () => set((state) => {
        const next = state.currentStep + 1;
        // Skip calibration (step 5) for reused assignments
        if (next === 5 && state.creationMode === "history" && state.selectedHistoryId) {
          return { currentStep: 6 as Step };
        }
        return { currentStep: Math.min(next, 6) as Step };
      }),
      prevStep: () => set((state) => {
        const prev = state.currentStep - 1;
        // Skip back over calibration (step 5) for reused assignments
        if (prev === 5 && state.creationMode === "history" && state.selectedHistoryId) {
          return { currentStep: 4 as Step };
        }
        return { currentStep: Math.max(prev, 1) as Step };
      }),
      setCalibrationConfirmed: (confirmed) => set({ calibrationConfirmed: confirmed }),
      setCalibrationStatus: (status) => set({ calibrationStatus: status }),
      
      setCourse: (course) => {
        set({ selectedCourse: course });
        get().addAudit({ action: "Institutional Context Loaded", details: `Context: ${course} (ESU Tech)`, type: "system" });
      },
      
      setCreationMode: (mode) => {
        set({ creationMode: mode, selectedHistoryId: null });
        if (mode) {
          get().addAudit({ action: "Strategy Selection", details: `High-fidelity creation path: ${mode}`, type: "user" });
        }
      },

      selectHistory: (id) => {
        const history = MOCK_HISTORY.find(h => h.id === id);
        if (history) {
          set({ 
            selectedHistoryId: id,
            assignment: {
              ...get().assignment,
              title: history.title,
              type: history.type,
              brief: `REUSED FROM ${history.semester}: ${history.title}. Institutional data pre-loaded.`
            }
          });
          get().addAudit({ action: "Historical Reuse", details: `Selected: ${history.title}`, type: "user" });
        }
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

      addSection: () => set((state) => {
        const newSection: Section = {
          id: "sec-" + Date.now(),
          title: "New Assessment Section",
          description: "Define the pedagogical scope for this section.",
          deliverables: []
        };
        return { assignment: { ...state.assignment, sections: [...state.assignment.sections, newSection] } };
      }),

      removeSection: (id) => set((state) => ({
        assignment: { ...state.assignment, sections: state.assignment.sections.filter(s => s.id !== id) }
      })),

      updateSection: (id, data) => set((state) => ({
        assignment: {
          ...state.assignment,
          sections: state.assignment.sections.map(s => s.id === id ? { ...s, ...data } : s)
        }
      })),

      addDeliverable: (sectionId) => set((state) => ({
        assignment: {
          ...state.assignment,
          sections: state.assignment.sections.map(sec => {
            if (sec.id === sectionId) {
              return {
                ...sec,
                deliverables: [...sec.deliverables, {
                  id: "d-" + Date.now(),
                  name: "New Deliverable",
                  weight: 10,
                  format: "PDF Document",
                  bloomLevel: "L1: Remember",
                  linkedCOs: ["CO1"]
                }]
              };
            }
            return sec;
          })
        }
      })),

      removeDeliverable: (sectionId, delivId) => set((state) => ({
        assignment: {
          ...state.assignment,
          sections: state.assignment.sections.map(sec => {
            if (sec.id === sectionId) {
              return { ...sec, deliverables: sec.deliverables.filter(d => d.id !== delivId) };
            }
            return sec;
          })
        }
      })),
      
      updateRubric: (rubric) => {
        set({ rubric, lastSaved: new Date().toLocaleTimeString() });
      },

      addCriterion: () => set((state) => {
        const newCrit: MatrixCriterion = {
          id: "crit-" + Date.now(),
          name: "New Qualitative Criterion",
          linkedCO: "CO1",
          version: "v1.0 (Manual Addition)",
          levels: defaultLevels
        };
        return { rubric: [...state.rubric, newCrit] };
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
      name: "pre-eval-persistence-v3",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
