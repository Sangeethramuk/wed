"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, User, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface Student {
  id: string
  name: string
  code: string
  status: string
  flags: number
  category: "critical" | "focus" | "verified"
}

interface UpcomingStudentsDropdownProps {
  students: Student[]
  currentStudentId: string
  assignmentId: string
}

export function UpcomingStudentsDropdown({
  students,
  currentStudentId,
  assignmentId,
}: UpcomingStudentsDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const currentStudent = students.find((s) => s.id === currentStudentId)

  const getStatusIcon = (status: string, category: string) => {
    if (status === "graded") return <CheckCircle2 className="h-3 w-3 text-green-500" />
    if (category === "verified") return <CheckCircle2 className="h-3 w-3 text-blue-500" />
    if (category === "critical" || category === "focus") return <AlertCircle className="h-3 w-3 text-amber-500" />
    return <Clock className="h-3 w-3 text-muted-foreground" />
  }

  const getStatusLabel = (status: string, category: string) => {
    if (status === "graded") return "Done"
    if (category === "verified") return "Verified"
    if (category === "critical" || category === "focus") return "Needs Review"
    return "Ready"
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between bg-background border-border hover:bg-accent/50 transition-all h-10 px-3 rounded-lg"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
               <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col items-start truncate">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 leading-none mb-0.5">
                Submissions
              </span>
              <span className="text-xs font-bold truncate">
                {currentStudent ? currentStudent.name : "Select Student..."}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 shadow-2xl border-border/50" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput placeholder="Search students..." className="h-10 border-none focus:ring-0 text-xs" />
          </div>
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No student found.</CommandEmpty>
            <CommandGroup heading="All Submissions">
              {students.map((student) => (
                <CommandItem
                  key={student.id}
                  value={student.name}
                  onSelect={() => {
                    router.push(`/dashboard/evaluation/${assignmentId}/grading/${student.id}`)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between py-2.5 px-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0 transition-opacity",
                        currentStudentId === student.id ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col truncate">
                      <span className={cn(
                        "text-xs font-bold truncate",
                        currentStudentId === student.id ? "text-primary" : "text-foreground"
                      )}>
                        {student.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        {student.code}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-1.5">
                         <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">
                           {getStatusLabel(student.status, student.category)}
                         </span>
                         {getStatusIcon(student.status, student.category)}
                       </div>
                       {student.flags > 0 && student.status !== "graded" && (
                         <div className="flex items-center gap-1">
                           <span className="text-[8px] font-black text-amber-600/80 uppercase tracking-tighter">
                             {student.flags} Review Alerts
                           </span>
                         </div>
                       )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
