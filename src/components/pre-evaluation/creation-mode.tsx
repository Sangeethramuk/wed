"use client"

import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, PlusCircle, ArrowLeft, Calendar, Users, Star, ChevronRight, LayoutGrid, TableIcon, ArrowUpRight } from "lucide-react"
import { MOCK_HISTORY } from "@/lib/store/pre-evaluation-store"

export function CreationMode() {
  const { creationMode, setCreationMode, selectedHistoryId, selectHistory, nextStep, prevStep, viewMode, setViewMode } = usePreEvalStore()

  const handleModeSelect = (mode: "history" | "scratch") => {
    setCreationMode(mode)
    if (mode === "scratch") {
      nextStep()
    }
  }

  const handleHistorySelect = (id: string) => {
    selectHistory(id)
    nextStep()
  }

  // If "history" is selected but no specific history is chosen yet, show the list
  const showHistoryList = creationMode === "history" && !selectedHistoryId

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => creationMode ? setCreationMode(null) : prevStep()} className="gap-2 px-3 text-muted-foreground hover:text-foreground group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">{creationMode ? "Back" : "Back to courses"}</span>
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter secondary-text">
          {showHistoryList ? "Which assignment should we use?" : "Have you run this assignment before?"}
        </h1>
        <p className="text-base text-muted-foreground font-medium opacity-70 border-b border-border/10 pb-6 uppercase text-[10px] tracking-widest">
          {showHistoryList ? `Found ${MOCK_HISTORY.length} past assignments for this course` : "Choose how you'd like to start."}
        </p>
      </div>

      {!showHistoryList ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card 
            className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg p-4 border-2 border-primary/20 bg-primary/[0.01]"
            onClick={() => handleModeSelect("history")}
          >
            <CardHeader>
              <div className="mb-4">
                <div className="p-3 w-fit rounded-full bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <History className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight">Use an existing assignment</CardTitle>
              <CardDescription className="text-base font-medium leading-relaxed mt-4 opacity-70">
                Pull data from previous years. I'll help you tweak the question paper and rubric. This is the fastest way to get started.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg p-4 border border-border/40 bg-card/10"
            onClick={() => handleModeSelect("scratch")}
          >
            <CardHeader>
              <div className="p-3 w-fit rounded-full bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all mb-4 group-hover:scale-110">
                <PlusCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight">Create from scratch</CardTitle>
              <CardDescription className="text-base font-medium leading-relaxed mt-4 opacity-70">
                Build a new assignment from the ground up. I'll help you structure it and set up grading from scratch.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">{MOCK_HISTORY.length}</span> assignments found
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
              <button
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === "cards" 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === "table" 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                Table
              </button>
            </div>
          </div>

          {viewMode === "cards" ? (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_HISTORY.map((hist) => (
                <Card 
                  key={hist.id} 
                  className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md border border-border/40 hover:bg-primary/[0.01] overflow-hidden"
                  onClick={() => handleHistorySelect(hist.id)}
                >
                  <div className="flex items-stretch gap-0 h-32">
                     <div className="w-2 bg-primary/10 group-hover:bg-primary transition-colors h-full" />
                     <div className="flex-1 p-5 flex items-center justify-between">
                        <div className="space-y-3">
                           <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest bg-muted/10 border-border/40 px-2 py-0.5">{hist.type}</Badge>
                              <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-widest flex items-center gap-1.5">
                                 <Calendar className="size-3" />
                                 {hist.lastUsed}
                              </span>
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1">{hist.title}</h3>
                              <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground/60">
                                 <span className="flex items-center gap-1"><Users className="size-3 opacity-40" /> {hist.semester}</span>
                                 <span className="flex items-center gap-1"><Star className="size-3 text-amber-500/60" /> {hist.avgScore}%</span>
                                 <span className="text-[10px] opacity-50">{hist.course}</span>
                              </div>
                           </div>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/5 group-hover:bg-primary group-hover:text-white transition-all group-hover:translate-x-1">
                           <ChevronRight className="h-5 w-5" />
                        </div>
                     </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Table View */
            <Card className="border border-border/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest w-[40%]">Assignment</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Type</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Semester</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Last Used</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Avg Score</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_HISTORY.map((hist) => (
                    <TableRow 
                      key={hist.id} 
                      className="cursor-pointer hover:bg-primary/[0.02] transition-colors"
                      onClick={() => handleHistorySelect(hist.id)}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-bold text-sm">{hist.title}</div>
                          <div className="text-[10px] text-muted-foreground">{hist.course}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider bg-muted/10 border-border/40">
                          {hist.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{hist.semester}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="size-3 opacity-50" />
                          {hist.lastUsed}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="size-3.5 text-amber-500/60" />
                          <span className="text-sm font-semibold">{hist.avgScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
