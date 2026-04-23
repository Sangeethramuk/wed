export type AssignmentStatus = "active" | "completed" | "draft"

export type PreviewTask = { id: string; text: string }
export type PreviewDeliverable = { id: string; name: string }
export type PreviewRubricCriterion = { id: string; name: string; weight: number; exemplary: string }

export type AssignmentType = "Project" | "MCQ" | "Design" | "Lab Record" | "Essay" | "Viva" | "Case Study" | "Specialized"

export type MockAssignment = {
  id: string
  title: string
  type: AssignmentType
  course: string
  code: string
  semester: string
  deadline: string
  latePolicy: string
  status: AssignmentStatus
  institution: string
  instructions?: string
  tasks: PreviewTask[]
  deliverables: PreviewDeliverable[]
  rubric: PreviewRubricCriterion[]
}

export const LATE_POLICY_LABEL: Record<string, string> = {
  "no-late": "Not allowed",
  "grace-24": "24-hour grace period",
  "daily-10": "10% penalty per day",
  "daily-20": "20% penalty per day",
}

export const MOCK_ASSIGNMENTS: MockAssignment[] = [
  {
    id: "1",
    title: "MVC Architecture Implementation",
    type: "Project",
    course: "Software Engineering",
    code: "SE301",
    semester: "Sem 5",
    deadline: "2026-05-15",
    latePolicy: "no-late",
    status: "active",
    institution: "Symbiosis University",
    instructions:
      "Design and implement a modular MVC architecture for a small e-commerce catalog. Your solution should clearly separate concerns across Model, View, and Controller layers.",
    tasks: [
      { id: "t1", text: "Design a modular MVC architecture for a small e-commerce catalog." },
      { id: "t2", text: "Compare MVC, MVVM, and MVP — when would you pick each?" },
      { id: "t3", text: "Identify three separation-of-concerns violations in the provided legacy code." },
    ],
    deliverables: [
      { id: "d1", name: "Architecture diagram (PDF)" },
      { id: "d2", name: "Source code with README" },
      { id: "d3", name: "Pattern comparison table" },
    ],
    rubric: [
      { id: "r1", name: "Technical Accuracy", weight: 35, exemplary: "Solution is technically flawless with correct application of MVC principles throughout." },
      { id: "r2", name: "Code Organisation", weight: 35, exemplary: "Code is exceptionally well-structured with clear, consistent naming and separation of concerns." },
      { id: "r3", name: "Reasoning & Justification", weight: 30, exemplary: "Justification is thorough, well-evidenced, and demonstrates deep critical thinking." },
    ],
  },
  {
    id: "2",
    title: "Database Normalization Lab",
    type: "Lab Record",
    course: "Database Management",
    code: "DM202",
    semester: "Sem 3",
    deadline: "2026-03-10",
    latePolicy: "grace-24",
    status: "completed",
    institution: "Symbiosis University",
    instructions:
      "Normalise the provided denormalised schema up to 3NF, justify each step, and demonstrate query performance improvements.",
    tasks: [
      { id: "t1", text: "Identify all functional dependencies in the provided schema." },
      { id: "t2", text: "Transform the schema to 1NF, 2NF, and 3NF with justification for each step." },
      { id: "t3", text: "Write three SQL queries demonstrating performance benefits of the normalised schema." },
    ],
    deliverables: [
      { id: "d1", name: "Normalisation report (PDF)" },
      { id: "d2", name: "SQL script file (.sql)" },
    ],
    rubric: [
      { id: "r1", name: "Schema Correctness", weight: 40, exemplary: "All normal forms applied correctly with no anomalies remaining." },
      { id: "r2", name: "Justification Depth", weight: 35, exemplary: "Each transformation step is clearly explained with reference to dependency rules." },
      { id: "r3", name: "Query Quality", weight: 25, exemplary: "Queries are optimised, well-commented, and demonstrate measurable performance gains." },
    ],
  },
  {
    id: "3",
    title: "UX Research Methods Essay",
    type: "Essay",
    course: "Human-Computer Interaction",
    code: "HCI401",
    semester: "Sem 6",
    deadline: "2026-06-01",
    latePolicy: "daily-10",
    status: "active",
    institution: "Symbiosis University",
    instructions:
      "Write a critical essay comparing qualitative and quantitative UX research methods, supported by real-world case studies.",
    tasks: [
      { id: "t1", text: "Define and contrast qualitative vs quantitative UX research methods." },
      { id: "t2", text: "Analyse two case studies — one using each method type." },
      { id: "t3", text: "Recommend which method suits a given product scenario and justify your choice." },
    ],
    deliverables: [
      { id: "d1", name: "Essay document (PDF, 1,500–2,000 words)" },
      { id: "d2", name: "Reference list (APA format)" },
    ],
    rubric: [
      { id: "r1", name: "Analytical Depth", weight: 40, exemplary: "Analysis is incisive, well-evidenced, and reveals nuanced understanding of both methods." },
      { id: "r2", name: "Case Study Integration", weight: 35, exemplary: "Case studies are highly relevant and seamlessly integrated to support arguments." },
      { id: "r3", name: "Clarity & Structure", weight: 25, exemplary: "Essay is exceptionally clear, logically structured, and a pleasure to read." },
    ],
  },
  {
    id: "4",
    title: "Microservices Design Pattern",
    type: "Project",
    course: "Advanced Software Architecture",
    code: "ASA501",
    semester: "Sem 7",
    deadline: "2026-04-01",
    latePolicy: "no-late",
    status: "completed",
    institution: "Symbiosis University",
    instructions:
      "Architect a microservices system for a ride-sharing platform, documenting inter-service communication and fault tolerance strategies.",
    tasks: [
      { id: "t1", text: "Define service boundaries and responsibilities for a ride-sharing platform." },
      { id: "t2", text: "Design the inter-service communication strategy (REST vs. event-driven)." },
      { id: "t3", text: "Document fault tolerance and resilience patterns used." },
    ],
    deliverables: [
      { id: "d1", name: "System architecture diagram" },
      { id: "d2", name: "Design document (PDF)" },
    ],
    rubric: [
      { id: "r1", name: "Service Decomposition", weight: 35, exemplary: "Boundaries are precise, domain-aligned, and free of coupling issues." },
      { id: "r2", name: "Communication Design", weight: 35, exemplary: "Communication patterns are appropriate, justified, and account for failure modes." },
      { id: "r3", name: "Resilience Strategy", weight: 30, exemplary: "Fault tolerance patterns are correctly applied and comprehensively documented." },
    ],
  },
  {
    id: "5",
    title: "Agile Sprint Planning Analysis",
    type: "Case Study",
    course: "Project Management",
    code: "PM301",
    semester: "Sem 5",
    deadline: "2026-07-10",
    latePolicy: "grace-24",
    status: "draft",
    institution: "Symbiosis University",
    tasks: [],
    deliverables: [],
    rubric: [],
  },
  {
    id: "6",
    title: "Neural Network Fundamentals",
    type: "Project",
    course: "Artificial Intelligence",
    code: "AI401",
    semester: "Sem 6",
    deadline: "2026-05-30",
    latePolicy: "no-late",
    status: "draft",
    institution: "Symbiosis University",
    tasks: [],
    deliverables: [],
    rubric: [],
  },
  {
    id: "7",
    title: "Operating Systems — Process Scheduling",
    type: "Lab Record",
    course: "Operating Systems",
    code: "OS302",
    semester: "Sem 4",
    deadline: "2026-03-22",
    latePolicy: "no-late",
    status: "completed",
    institution: "Symbiosis University",
    instructions:
      "Simulate and evaluate three CPU scheduling algorithms, comparing their performance on a given process workload.",
    tasks: [
      { id: "t1", text: "Implement FCFS, SJF, and Round Robin scheduling algorithms." },
      { id: "t2", text: "Run each algorithm on the provided process set and record turnaround and waiting times." },
      { id: "t3", text: "Analyse the results and recommend the most suitable algorithm for an interactive OS." },
    ],
    deliverables: [
      { id: "d1", name: "Source code (.zip)" },
      { id: "d2", name: "Performance comparison report (PDF)" },
    ],
    rubric: [
      { id: "r1", name: "Implementation Correctness", weight: 40, exemplary: "All three algorithms are implemented correctly and produce accurate results." },
      { id: "r2", name: "Performance Analysis", weight: 35, exemplary: "Metrics are accurate, clearly presented, and correctly interpreted." },
      { id: "r3", name: "Recommendation Quality", weight: 25, exemplary: "Recommendation is well-argued and firmly grounded in the performance data." },
    ],
  },
  {
    id: "8",
    title: "RESTful API Design & Documentation",
    type: "Project",
    course: "Web Technologies",
    code: "WT401",
    semester: "Sem 6",
    deadline: "2026-06-20",
    latePolicy: "daily-10",
    status: "active",
    institution: "Symbiosis University",
    instructions:
      "Design, implement, and document a RESTful API for a library management system following OpenAPI 3.0 standards.",
    tasks: [
      { id: "t1", text: "Define resources, endpoints, and HTTP methods for a library management system." },
      { id: "t2", text: "Implement the API with proper status codes, error handling, and authentication." },
      { id: "t3", text: "Write complete OpenAPI 3.0 documentation for all endpoints." },
    ],
    deliverables: [
      { id: "d1", name: "API source code (GitHub link)" },
      { id: "d2", name: "OpenAPI spec file (.yaml)" },
      { id: "d3", name: "Postman collection (.json)" },
    ],
    rubric: [
      { id: "r1", name: "API Design Quality", weight: 40, exemplary: "API is RESTful, consistent, and follows industry best practices throughout." },
      { id: "r2", name: "Implementation", weight: 35, exemplary: "Code is clean, secure, and handles all edge cases gracefully." },
      { id: "r3", name: "Documentation", weight: 25, exemplary: "Documentation is complete, accurate, and immediately usable by a new developer." },
    ],
  },
]
