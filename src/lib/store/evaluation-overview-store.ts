import { create } from 'zustand';

export type AssignmentType = 'Project' | 'MCQ' | 'Essay' | 'Lab Record' | 'Case Study' | 'Viva';
export type GradingStatus = 'pending_calibration' | 'in_grading' | 'complete';
export type CalibrationState = 'not_started' | 'in_progress' | 'complete';

export interface EvaluationAssignment {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  department: string;
  semester: string;
  academicYear: string;
  assignmentType: AssignmentType;
  totalSubmissions: number;
  gradedSubmissions: number;
  readyToGrade: number;
  integrityFlags: number;
  calibrationStatus: number; // 0-100
  calibrationState: CalibrationState;
  gradingStatus: GradingStatus;
  dueDate: string;
  lastActivity: string;
}

const MOCK_ASSIGNMENTS: EvaluationAssignment[] = [
  // --- Computer Science ---
  {
    id: 'SWE-PH2',
    title: 'Software Engineering — Phase 2',
    course: 'CS301: Systems Architecture',
    courseCode: 'CS301',
    department: 'Computer Science',
    semester: 'SEM VI',
    academicYear: '2025–26',
    assignmentType: 'Project',
    totalSubmissions: 60,
    gradedSubmissions: 21,
    readyToGrade: 39,
    integrityFlags: 3,
    calibrationStatus: 0,
    calibrationState: 'not_started',
    gradingStatus: 'pending_calibration',
    dueDate: 'Apr 20, 2026',
    lastActivity: '2h ago',
  },
  {
    id: 'DB-Q1',
    title: 'Database Systems — Quiz 1',
    course: 'CS202: Data Management',
    courseCode: 'CS202',
    department: 'Computer Science',
    semester: 'SEM V',
    academicYear: '2025–26',
    assignmentType: 'MCQ',
    totalSubmissions: 42,
    gradedSubmissions: 42,
    readyToGrade: 0,
    integrityFlags: 0,
    calibrationStatus: 100,
    calibrationState: 'complete',
    gradingStatus: 'complete',
    dueDate: 'Mar 15, 2026',
    lastActivity: '3d ago',
  },
  {
    id: 'AI-ETH-01',
    title: 'AI Ethics & Policy Framework',
    course: 'CS405: AI and Society',
    courseCode: 'CS405',
    department: 'Computer Science',
    semester: 'SEM VI',
    academicYear: '2025–26',
    assignmentType: 'Essay',
    totalSubmissions: 60,
    gradedSubmissions: 0,
    readyToGrade: 60,
    integrityFlags: 1,
    calibrationStatus: 40,
    calibrationState: 'in_progress',
    gradingStatus: 'pending_calibration',
    dueDate: 'Apr 25, 2026',
    lastActivity: '5h ago',
  },
  {
    id: 'OS-LAB-03',
    title: 'Operating Systems — Lab Record 3',
    course: 'CS303: OS Internals',
    courseCode: 'CS303',
    department: 'Computer Science',
    semester: 'SEM V',
    academicYear: '2025–26',
    assignmentType: 'Lab Record',
    totalSubmissions: 55,
    gradedSubmissions: 30,
    readyToGrade: 25,
    integrityFlags: 2,
    calibrationStatus: 88,
    calibrationState: 'complete',
    gradingStatus: 'in_grading',
    dueDate: 'Apr 18, 2026',
    lastActivity: '1h ago',
  },

  // --- Information Technology ---
  {
    id: 'WD-PROJ-02',
    title: 'Web Development — Capstone Project',
    course: 'IT204: Full Stack Development',
    courseCode: 'IT204',
    department: 'Information Technology',
    semester: 'SEM VI',
    academicYear: '2025–26',
    assignmentType: 'Project',
    totalSubmissions: 48,
    gradedSubmissions: 12,
    readyToGrade: 36,
    integrityFlags: 0,
    calibrationStatus: 92,
    calibrationState: 'complete',
    gradingStatus: 'in_grading',
    dueDate: 'Apr 22, 2026',
    lastActivity: '30m ago',
  },
  {
    id: 'NW-CASE-01',
    title: 'Network Security — Case Study',
    course: 'IT302: Cybersecurity Fundamentals',
    courseCode: 'IT302',
    department: 'Information Technology',
    semester: 'SEM V',
    academicYear: '2025–26',
    assignmentType: 'Case Study',
    totalSubmissions: 38,
    gradedSubmissions: 0,
    readyToGrade: 38,
    integrityFlags: 5,
    calibrationStatus: 0,
    calibrationState: 'not_started',
    gradingStatus: 'pending_calibration',
    dueDate: 'Apr 28, 2026',
    lastActivity: '1d ago',
  },

  // --- Electronics ---
  {
    id: 'VLSI-LAB-02',
    title: 'VLSI Design — Lab Record 2',
    course: 'EC301: Digital VLSI',
    courseCode: 'EC301',
    department: 'Electronics',
    semester: 'SEM VI',
    academicYear: '2025–26',
    assignmentType: 'Lab Record',
    totalSubmissions: 44,
    gradedSubmissions: 44,
    readyToGrade: 0,
    integrityFlags: 0,
    calibrationStatus: 100,
    calibrationState: 'complete',
    gradingStatus: 'complete',
    dueDate: 'Mar 30, 2026',
    lastActivity: '1w ago',
  },
  {
    id: 'SIG-VIVA-01',
    title: 'Signal Processing — Viva Voce',
    course: 'EC205: Signals & Systems',
    courseCode: 'EC205',
    department: 'Electronics',
    semester: 'SEM V',
    academicYear: '2025–26',
    assignmentType: 'Viva',
    totalSubmissions: 36,
    gradedSubmissions: 18,
    readyToGrade: 18,
    integrityFlags: 0,
    calibrationStatus: 76,
    calibrationState: 'complete',
    gradingStatus: 'in_grading',
    dueDate: 'Apr 19, 2026',
    lastActivity: '4h ago',
  },
];

interface EvaluationOverviewState {
  assignments: EvaluationAssignment[];
  selectedDepartment: string;
  selectedSemester: string;
  selectedGradingStatus: string;
  selectedCalibrationState: string;

  setFilter: (key: 'selectedDepartment' | 'selectedSemester' | 'selectedGradingStatus' | 'selectedCalibrationState', value: string) => void;
  getFilteredAssignments: () => EvaluationAssignment[];
  getStats: () => { total: number; pendingCalibration: number; inGrading: number; complete: number };
  getDepartments: () => string[];
}

export const useEvaluationOverviewStore = create<EvaluationOverviewState>()((set, get) => ({
  assignments: MOCK_ASSIGNMENTS,
  selectedDepartment: 'all',
  selectedSemester: 'all',
  selectedGradingStatus: 'all',
  selectedCalibrationState: 'all',

  setFilter: (key, value) => set({ [key]: value }),

  getFilteredAssignments: () => {
    const { assignments, selectedDepartment, selectedSemester, selectedGradingStatus, selectedCalibrationState } = get();
    return assignments.filter(a => {
      if (selectedDepartment !== 'all' && a.department !== selectedDepartment) return false;
      if (selectedSemester !== 'all' && a.semester !== selectedSemester) return false;
      if (selectedGradingStatus !== 'all' && a.gradingStatus !== selectedGradingStatus) return false;
      if (selectedCalibrationState !== 'all' && a.calibrationState !== selectedCalibrationState) return false;
      return true;
    });
  },

  getStats: () => {
    const { assignments } = get();
    return {
      total: assignments.length,
      pendingCalibration: assignments.filter(a => a.calibrationState !== 'complete').length,
      inGrading: assignments.filter(a => a.gradingStatus === 'in_grading').length,
      complete: assignments.filter(a => a.gradingStatus === 'complete').length,
    };
  },

  getDepartments: () => {
    const { assignments } = get();
    return [...new Set(assignments.map(a => a.department))];
  },
}));
