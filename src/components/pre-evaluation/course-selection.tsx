"use client"

import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
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
    <TooltipProvider delay={100}>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20 pt-6 px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight secondary-text">Select course to get started</h1>
          <Button variant="outline" size="sm" className="group">
            Department: Computer science
            <ChevronDown className="h-3 w-3 opacity-40 group-hover:opacity-80" />
          </Button>
        </div>

        {/* Course cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_COURSES.map((course) => (
            <Card
              key={course.id}
              className="group relative overflow-hidden cursor-pointer hover:border-primary/20 transition-all border-border/20 bg-card rounded-xl flex flex-col shadow-none"
              onClick={() => handleSelect(course.name)}
            >
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-lg font-semibold tracking-tight">{course.name}</CardTitle>
                <CardDescription className="eyebrow flex items-center gap-2 text-xs opacity-80 mt-0.5">
                  {course.code} <span className="opacity-40">•</span> {course.semester}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-end">
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/10">
                  <div className="space-y-1">
                    <span className="eyebrow text-muted-foreground opacity-30">Published</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Tooltip>
                        <TooltipTrigger className="cursor-default text-xs font-semibold">
                          {course.assignmentCount} Active
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-xs font-medium">Deadline window still open</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="eyebrow text-muted-foreground opacity-30">Last Created</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Clock className="h-3 w-3 opacity-50" />
                      <span>{course.lastAssignment}</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
