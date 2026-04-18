"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  MessageSquareQuote
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Student {
  id: string
  name: string
  code: string
  status: string
  flags: number
  category: "critical" | "focus" | "verified"
  checkpoints: Record<string, boolean>
  score?: number
  revaluationRequested?: boolean
}

interface StudentTableProps {
  students: Student[]
  assignmentId: string
}

export function StudentTable({ students, assignmentId }: StudentTableProps) {
  const router = useRouter()

  const getStatusBadge = (student: Student) => {
    if (student.status === "graded") {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 shadow-none gap-1.5 font-bold text-[10px] uppercase tracking-wider">
          <CheckCircle2 className="h-3 w-3" /> Graded
        </Badge>
      )
    }
    if (student.category === "verified") {
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none gap-1.5 font-bold text-[10px] uppercase tracking-wider">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none gap-1.5 font-bold text-[10px] uppercase tracking-wider">
        <Clock className="h-3 w-3" /> Needs Review
      </Badge>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="w-[300px] text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 py-4">Student</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Review Alerts</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Quality Checks</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Grade</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow 
              key={student.id} 
              className={`group cursor-pointer transition-colors border-b border-border/30 last:border-0 ${
                student.revaluationRequested ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-muted/40'
              }`}
              onClick={() => router.push(`/dashboard/evaluation/${assignmentId}/grading/${student.id}`)}
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-10 rounded-full shrink-0 ${
                    student.revaluationRequested ? 'bg-amber-400' : 'bg-transparent'
                  }`} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm text-foreground">{student.name}</span>
                       {student.revaluationRequested && (
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger>
                               <MessageSquareQuote className="h-3.5 w-3.5 text-amber-500" />
                             </TooltipTrigger>
                             <TooltipContent className="bg-amber-600 text-white border-none font-bold text-[10px] uppercase tracking-widest">
                               Requesting New Grade
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                       )}
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{student.code}</span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(student)}
              </TableCell>
              
              <TableCell>
                {student.flags > 0 ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="h-6 px-2 rounded-full text-[9px] font-black flex items-center gap-1">
                       <ShieldAlert className="h-3 w-3" /> {student.flags} Alerts
                    </Badge>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-muted-foreground/20 tracking-widest">—</span>
                )}
              </TableCell>
              
              <TableCell>
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-1">
                     {Object.values(student.checkpoints).map((pass, i) => (
                       <div 
                         key={i} 
                         className={`w-1.5 h-1.5 rounded-full ${pass ? 'bg-primary/40' : 'bg-red-400/40'}`} 
                       />
                     ))}
                   </div>
                   <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-tighter">
                     {Object.values(student.checkpoints).filter(Boolean).length}/5 Checks Passed
                   </span>
                 </div>
              </TableCell>
              
              <TableCell>
                {student.status === "graded" ? (
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-black text-foreground">{student.score}</span>
                    <span className="text-[9px] text-muted-foreground font-black">/100</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-muted-foreground/20 tracking-widest">—</span>
                )}
              </TableCell>
              
              <TableCell className="text-right pr-6">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
