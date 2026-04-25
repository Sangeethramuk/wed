"use client"

import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, ChevronDown } from "lucide-react"

export const MOCK_COURSES = [
  {
    id: "cs201",
    name: "Software Engineering",
    code: "CS201",
    dept: "Computer Science",
    semester: "SEM 6",
    credits: 4,
    assignmentCount: 3,
    lastAssignment: "2 days ago",
    status: "Active" as const,
  },
  {
    id: "cs305",
    name: "Database Management",
    code: "CS305",
    dept: "Information Tech",
    semester: "SEM 4",
    credits: 3,
    assignmentCount: 5,
    lastAssignment: "1 week ago",
    status: "Active" as const,
  },
  {
    id: "cs402",
    name: "Artificial Intelligence",
    code: "CS402",
    dept: "Computer Science",
    semester: "SEM 8",
    credits: 4,
    assignmentCount: 2,
    lastAssignment: "3 weeks ago",
    status: "Active" as const,
  },
]

export function CourseSelection() {
  const { setCourse, nextStep } = usePreEvalStore()

  const handleSelect = (courseName: string) => {
    setCourse(courseName)
    nextStep()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20 pt-6 px-6">

      {/* Page heading + filter */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Select course to get started</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-slate-300 transition-colors">
          Department: Computer science
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      {/* Course cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_COURSES.map((course) => (
          <div
            key={course.id}
            onClick={() => handleSelect(course.name)}
            className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer flex flex-col gap-4 hover:border-slate-300 hover:shadow-md transition-all duration-150"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            {/* Card top */}
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900">{course.name}</h2>
              <p className="text-xs text-slate-400">{course.code} · {course.semester}</p>
            </div>

            {/* Card bottom */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Published</p>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-sm font-semibold text-slate-900 cursor-default">
                      {course.assignmentCount} Active
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs font-medium">Deadline window still open</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Last Created</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-sm text-slate-500">{course.lastAssignment}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
