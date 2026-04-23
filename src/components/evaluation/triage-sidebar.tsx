"use client"

import { useState } from "react"
import { Search, CheckCircle2, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TriageSidebarProps {
  selectedStudentId: string
  onStudentSelect: (id: string) => void
  gradedSubmissions: string[]
  onBulkApprove?: (ids: string[]) => void
}

export function TriageSidebar({
  selectedStudentId,
  onStudentSelect,
  gradedSubmissions,
  onBulkApprove
}: TriageSidebarProps) {
  const [triageFilter, setTriageFilter] = useState<"all" | "critical" | "focus" | "verified">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const firstNames = [
    "Arjun", "Priya", "Rahul", "Ananya", "Vikram",
    "Neha", "Aditya", "Meera", "Rohan", "Kavita",
    "Krishna", "Divya", "Sanjay", "Pooja", "Rajesh",
    "Sunita", "Vivek", "Anjali", "Amit", "Deepa",
    "Suresh", "Lakshmi", "Nikhil", "Radha", "Manoj",
    "Geeta", "Prakash", "Sneha", "Ashok", "Nisha"
  ]
  const lastNames = [
    "Sharma", "Patel", "Gupta", "Singh", "Reddy",
    "Iyer", "Nair", "Desai", "Joshi", "Mehta",
    "Agarwal", "Malhotra", "Khanna", "Banerjee", "Chatterjee",
    "Menon", "Pillai", "Rao", "Verma", "Tiwari",
    "Kapoor", "Chopra", "Sethi", "Bhatia", "Grover",
    "Bajaj", "Chawla", "Dutta", "Ghosh", "Mukherjee"
  ]

  const allSubmissions = Array.from({ length: 60 }, (_, i) => {
    const id = `STU-${100 + i}`
    const name = `${firstNames[i % 30]} ${lastNames[(i + 7) % 30]}`

    const checkpoints = {
      grading: i % 10 !== 0,
      ocr: i % 15 !== 0,
      cheating: i % 20 !== 0,
      history: i % 8 !== 0,
      timeline: i % 12 !== 0,
    }

    const passedCount = Object.values(checkpoints).filter(Boolean).length

    let category: "critical" | "focus" | "verified" = "verified"
    let reason = "Verified Clear"
    let flags = 5 - passedCount

    if (passedCount <= 2) {
      category = "critical"
      reason = "Protocol Failure"
    } else if (passedCount <= 3) {
      category = "focus"
      reason = "Academic Anomaly"
    } else if (passedCount === 4) {
      category = "focus"
      reason = "Minor Variance"
    }

    const status = gradedSubmissions.includes(id) ? "graded" : (flags > 0 ? "flagged" : "ready")

    return {
      id,
      name,
      code: `#${100 + i}`,
      status,
      flags,
      reason,
      category,
      checkpoints
    }
  })

  const submissions = allSubmissions.filter(s => {
    const matchesFilter = triageFilter === "all" || s.category === triageFilter
    const matchesSearch = !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm">
      <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="eyebrow text-muted-foreground/80 font-bold tracking-wider">Submissions Cohort</h2>
          <p className="text-[10px] text-muted-foreground/50 font-medium italic">Filter and select papers for evaluation</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="grid grid-cols-4 gap-1 p-1 bg-muted/30 rounded-lg border border-border/30 w-64">
            {(["all", "critical", "focus", "verified"] as const).map((filter) => (
              <Button
                key={filter}
                variant={triageFilter === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTriageFilter(filter)}
                className={`w-full h-7 text-[9px] font-bold uppercase transition-all duration-200 ${
                  triageFilter === filter ? 'shadow-sm' : 'hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                {filter.slice(0, 4)}
              </Button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-background/50 border-border/40 focus-visible:ring-primary/20 placeholder:text-muted-foreground/30 rounded-full"
              placeholder="Search by student name or code..."
            />
          </div>

          <div className="flex flex-col items-end gap-1 px-4 border-l border-border/30">
            <Badge variant="outline" className="rounded-full bg-background/50 border-border/40 text-[10px] uppercase font-bold tracking-tighter px-2 h-5">
              {gradedSubmissions.length} / {allSubmissions.length} Completed
            </Badge>
            <div className="w-32 h-1 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 ease-in-out"
                style={{ width: `${(gradedSubmissions.length / allSubmissions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-muted/10 border-b border-border/30 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
        <div className="col-span-5">Student Information</div>
        <div className="col-span-2 text-center">Protocol Integrity</div>
        <div className="col-span-2 text-center">Critical Flags</div>
        <div className="col-span-2 text-center">Validation Reason</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-2 space-y-1">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              role="button"
              onClick={() => onStudentSelect(sub.id)}
              className={`w-full grid grid-cols-12 gap-4 items-center px-4 py-3.5 rounded-2xl transition-all duration-300 text-left cursor-pointer group border ${
                selectedStudentId === sub.id
                  ? 'bg-primary/5 border-primary/20 shadow-sm'
                  : 'hover:bg-muted/30 border-transparent text-muted-foreground'
              }`}
            >
              {/* Student Info */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="relative shrink-0">
                  {gradedSubmissions.includes(sub.id) ? (
                    <div className="w-8 h-8 rounded-full bg-[color:var(--status-success-bg)]/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-[color:var(--status-success)]" />
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed ${
                      sub.category === 'critical' ? 'border-destructive/40 bg-destructive/5' :
                      sub.category === 'focus' ? 'border-[color:var(--status-warning)]/40 bg-[color:var(--status-warning)]/5' :
                      'border-primary/20 bg-primary/5'
                    }`}>
                      <span className="text-[10px] font-bold">{sub.name.charAt(0)}</span>
                    </div>
                  )}
                  {!gradedSubmissions.includes(sub.id) && sub.category !== 'verified' && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      sub.category === 'critical' ? 'bg-destructive' : 'bg-[color:var(--status-warning)]'
                    }`} />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold truncate ${selectedStudentId === sub.id ? 'text-primary' : 'text-foreground/80'} ${gradedSubmissions.includes(sub.id) ? 'line-through opacity-40' : ''}`}>
                      {sub.name}
                    </span>
                    {selectedStudentId === sub.id && !gradedSubmissions.includes(sub.id) && (
                      <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground/30 tabular-nums uppercase tracking-tighter">{sub.code}</span>
                </div>
              </div>

              {/* Protocol Integrity */}
              <div className="col-span-2 flex justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                        Object.values(sub.checkpoints).filter(Boolean).length <= 2 ? 'bg-destructive/5 border-destructive/20 text-destructive' :
                        Object.values(sub.checkpoints).filter(Boolean).length <= 4 ? 'bg-[color:var(--status-warning-bg)]/20 border-[color:var(--status-warning)]/20 text-[color:var(--status-warning)]' :
                        'bg-primary/5 border-primary/10 text-primary'
                      }`}>
                        <span className="text-[11px] font-bold tabular-nums">
                          {Object.values(sub.checkpoints).filter(Boolean).length}/5
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Checks</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="p-3 space-y-2 border-border/50 bg-background/95 backdrop-blur-md shadow-2xl">
                      <div className="eyebrow text-[9px] text-muted-foreground/60 border-b border-border/50 pb-1.5 uppercase font-bold tracking-widest">Protocol Quality</div>
                      <div className="space-y-1.5 min-w-[120px]">
                        {Object.entries(sub.checkpoints).map(([key, passed]) => (
                          <div key={key} className="flex items-center justify-between gap-6 text-[10px]">
                            <span className="text-muted-foreground capitalize font-medium">{key}</span>
                            <span className={passed ? 'text-[color:var(--status-success)]' : 'text-destructive font-bold'}>
                              {passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Critical Flags */}
              <div className="col-span-2 flex justify-center">
                {!gradedSubmissions.includes(sub.id) && sub.flags > 0 ? (
                  <Badge variant="destructive" className="h-6 px-3 rounded-full text-[10px] font-black border-0 shadow-lg shadow-destructive/20 animate-pulse uppercase tracking-widest">
                    {sub.flags} FLAGS
                  </Badge>
                ) : (
                  <div className="h-1 w-4 rounded-full bg-muted/30" />
                )}
              </div>

              {/* Validation Reason */}
              <div className="col-span-2 text-center flex flex-col items-center">
                <span className={`text-[11px] font-medium italic ${
                  sub.category === 'critical' ? 'text-destructive/70' :
                  sub.category === 'focus' ? 'text-[color:var(--status-warning)]' :
                  'text-muted-foreground/40'
                }`}>
                  {sub.reason}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 text-right">
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary">
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
