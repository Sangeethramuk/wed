"use client"

import { use, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, GraduationCap, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StudentTable } from "@/components/evaluation/batch/student-table"
import { StudentFilters } from "@/components/evaluation/batch/student-filters"
import { Badge } from "@/components/ui/badge"

export default function AssignmentSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeRevaluation, setActiveRevaluation] = useState(false)

  // Mock data for 60 students - Indian names (Same as in grading page for consistency)
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
  
  const allSubmissions = useMemo(() => Array.from({ length: 60 }, (_, i) => {
    const studentId = `STU-${100 + i}`
    const name = `${firstNames[i % 30]} ${lastNames[(i + 7) % 30]}`
    
    // Five-Parameter Accountability Checkpoints
    const checkpoints = {
      grading: i % 10 !== 0,   // Fail 10%
      ocr: i % 15 !== 0,       // Fail 6.6%
      cheating: i % 20 !== 0,  // Fail 5%
      history: i % 8 !== 0,    // Fail 12.5%
      timeline: i % 12 !== 0,  // Fail 8.3%
    }

    const passedCount = Object.values(checkpoints).filter(Boolean).length
    
    let category: "critical" | "focus" | "verified" = "verified"
    let flags = 5 - passedCount

    if (passedCount <= 2) {
      category = "critical"
    } else if (passedCount <= 4) {
      category = "focus"
    }

    const status = i < 15 ? "graded" : "ready"

    return { 
      id: studentId, 
      name, 
      code: `#${100 + i}`, 
      status, 
      flags, 
      category,
      checkpoints,
      score: status === "graded" ? 82 + (i % 8) : 0,
      revaluationRequested: i === 5 || i === 12 || i === 42 // Mock some revaluation requests
    }
  }), [])

  const filteredSubmissions = useMemo(() => {
    return allSubmissions.filter(s => {
      const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !activeStatus || s.status === activeStatus
      const matchesCategory = !activeCategory || s.category === activeCategory
      const matchesRevaluation = !activeRevaluation || s.revaluationRequested
      return matchesSearch && matchesStatus && matchesCategory && matchesRevaluation
    })
  }, [allSubmissions, searchQuery, activeStatus, activeCategory, activeRevaluation])

  const gradedCount = allSubmissions.filter(s => s.status === "graded").length

  return (
    <div className="container max-w-7xl py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard/evaluation" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Assignments</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                 <GraduationCap className="h-6 w-6 text-primary" />
               </div>
               <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Python Programming 101</h1>
            </div>
            <p className="text-sm text-muted-foreground font-medium italic">Mid-term Assessment Evaluation — Batch A</p>
          </div>
          
          <div className="flex items-center gap-6 bg-card border border-border/50 p-4 rounded-2xl shadow-sm">
             <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Total</span>
               <span className="text-xl font-black text-foreground">{allSubmissions.length}</span>
             </div>
             <div className="h-8 w-px bg-border/50" />
             <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Graded</span>
               <span className="text-xl font-black text-green-600">{gradedCount}</span>
             </div>
             <div className="h-8 w-px bg-border/50" />
             <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Alerts</span>
               <span className="text-xl font-black text-red-500">{allSubmissions.filter(s => s.flags > 0).length}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <StudentFilters 
          onSearch={setSearchQuery}
          onStatusFilter={setActiveStatus}
          onCategoryFilter={setActiveCategory}
          onRevaluationFilter={setActiveRevaluation}
          activeStatus={activeStatus}
          activeCategory={activeCategory}
          activeRevaluation={activeRevaluation}
        />
        
        <StudentTable 
          students={filteredSubmissions} 
          assignmentId={id} 
        />
      </div>
    </div>
  )
}
