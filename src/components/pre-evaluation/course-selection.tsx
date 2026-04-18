"use client"

import { usePreEvalStore, MOCK_DRAFTS } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, GraduationCap, Check, Clock, ArrowRight } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const STEP_LABELS: Record<number, string> = {
  2: "Starting point",
  3: "Assignment details",
  4: "Grading rubric",
  5: "Preview & publish",
}

const MOCK_COURSES = [
  { 
    id: "cs201", 
    name: "Software Engineering", 
    code: "CS201", 
    dept: "Computer Science", 
    semester: "SEM 6",
    credits: 4,
    students: 45, 
    match: 94
  },
  { 
    id: "cs305", 
    name: "Database Management", 
    code: "CS305", 
    dept: "Information Tech", 
    semester: "SEM 4",
    credits: 3,
    students: 38, 
    match: 88
  },
  { 
    id: "cs402", 
    name: "Artificial Intelligence", 
    code: "CS402", 
    dept: "Computer Science", 
    semester: "SEM 8",
    credits: 4,
    students: 42, 
    match: 91
  },
]

export function CourseSelection() {
  const { setCourse, nextStep, resumeDraft } = usePreEvalStore()

  const handleSelect = (courseId: string) => {
    setCourse(courseId)
    nextStep()
  }

  return (
    <TooltipProvider delay={100}>
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20 pt-6 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-border/20">
            <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/20 shrink-0 relative overflow-hidden group">
               <GraduationCap className="h-7 w-7 text-primary relative z-10" />
            </div>
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Emerald State University</h3>
                  <div className="flex gap-1.5">
                     <Tooltip>
                        <TooltipTrigger className="inline-flex items-center">
                           <Badge variant="outline" className="text-[8px] font-black tracking-widest border-emerald-500/20 text-emerald-600/60 bg-emerald-500/[0.01] py-0 px-2 rounded-full cursor-help h-4">NAAC A++</Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 border-none rounded-lg p-2"><p className="text-[8px] font-bold text-white">Institutional Rating: 3.8/4.0</p></TooltipContent>
                     </Tooltip>
                  </div>
               </div>
               <p className="text-xl font-black tracking-tight secondary-text">Faculty of Computer Science & Engineering</p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter secondary-text">Set up your assignment</h1>
            <p className="text-base text-muted-foreground font-medium opacity-70">Which course is this assignment for?</p>
          </div>
        </div>

        {/* Draft Assignments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground opacity-40" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Continue where you left off</h2>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_DRAFTS.map((draft) => (
              <div
                key={draft.id}
                className="group flex items-center justify-between px-5 py-4 rounded-xl border border-border/20 bg-card/20 hover:border-primary/20 hover:bg-card/40 transition-all cursor-pointer"
                onClick={() => resumeDraft(draft)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 shrink-0">
                    <BookOpen className="h-4 w-4 text-primary opacity-60" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black tracking-tight truncate">{draft.title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mt-0.5">
                      {draft.course} <span className="opacity-40">•</span> {draft.semester}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-amber-500/20 text-amber-600/60 bg-amber-500/[0.03] rounded-md">
                      {STEP_LABELS[draft.step]}
                    </Badge>
                    <p className="text-[9px] text-muted-foreground opacity-30 font-bold mt-1">{draft.lastEdited}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-0.5">Or start a new assignment</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_COURSES.map((course) => (
            <Card 
              key={course.id} 
              className="group relative overflow-hidden cursor-pointer hover:border-primary/20 transition-all border-border/20 bg-card/20 backdrop-blur-sm rounded-2xl p-2 flex flex-col shadow-none"
              onClick={() => handleSelect(course.name)}
            >
              <div className="absolute top-6 right-6 z-10">
                <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-border/20 py-0.5 px-2 rounded-md bg-background/30 h-5 opacity-60">{course.code}</Badge>
              </div>
              
              <CardHeader className="pb-6 pt-8 px-6">
                <div className="p-3 w-fit rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 border border-primary/10">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="mt-6 text-xl font-black tracking-tight">{course.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest opacity-80 mt-1">
                  {course.dept} <span className="opacity-40">•</span> {course.semester}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-8 flex-1 flex flex-col justify-end">
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/10">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground opacity-30">Cohort</span>
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Users className="h-3.5 w-3.5 text-primary opacity-40" />
                      <span>{course.students} Students</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground opacity-30">Alignment</span>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1.5 text-xs font-black cursor-help">
                        <div className="h-4 w-4 flex items-center justify-center rounded-full bg-emerald-500/5 border border-emerald-500/10">
                          <Check className="h-2.5 w-2.5 text-emerald-600/60" />
                        </div>
                        <span className="text-emerald-600/60">{course.match}% Match</span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border-none rounded-lg p-3 max-w-[200px]">
                        <p className="text-[10px] font-bold text-white leading-relaxed">How well past assignments for this course matched your university's requirements</p>
                      </TooltipContent>
                    </Tooltip>
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
