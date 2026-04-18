"use client"

import * as React from "react"
import { Search, Filter, X, CheckCircle2, AlertCircle, MessageSquareQuote } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StudentFiltersProps {
  onSearch: (query: string) => void
  onStatusFilter: (status: string | null) => void
  onCategoryFilter: (category: string | null) => void
  onRevaluationFilter: (active: boolean) => void
  activeStatus: string | null
  activeCategory: string | null
  activeRevaluation: boolean
}

export function StudentFilters({
  onSearch,
  onStatusFilter,
  onCategoryFilter,
  onRevaluationFilter,
  activeStatus,
  activeCategory,
  activeRevaluation
}: StudentFiltersProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search students by name or ID..." 
            className="pl-10 h-10 bg-card border-border shadow-sm text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={activeRevaluation ? "default" : "outline"}
            size="sm"
            onClick={() => onRevaluationFilter(!activeRevaluation)}
            className={`h-10 rounded-lg gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${
              activeRevaluation ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
            }`}
          >
            <MessageSquareQuote className="h-3.5 w-3.5" />
            Requesting New Grade
          </Button>
          
          <Button variant="outline" size="sm" className="h-10 rounded-lg gap-2 font-bold text-[10px] uppercase tracking-widest">
            <Filter className="h-3.5 w-3.5" />
            More Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">Quick Filters:</span>
        <Badge 
          variant={activeStatus === null && activeCategory === null ? "default" : "outline"}
          className="px-3 py-1 cursor-pointer font-bold text-[9px] uppercase tracking-wider h-7"
          onClick={() => {
            onStatusFilter(null)
            onCategoryFilter(null)
          }}
        >
          All
        </Badge>
        
        <Badge 
          variant={activeStatus === "graded" ? "default" : "outline"}
          className="px-3 py-1 cursor-pointer font-bold text-[9px] uppercase tracking-wider h-7 gap-1.5"
          onClick={() => onStatusFilter(activeStatus === "graded" ? null : "graded")}
        >
          <CheckCircle2 className="h-3 w-3" /> Graded
        </Badge>

        <Badge 
          variant={activeCategory === "verified" ? "default" : "outline"}
          className="px-3 py-1 cursor-pointer font-bold text-[9px] uppercase tracking-wider h-7 gap-1.5"
          onClick={() => onCategoryFilter(activeCategory === "verified" ? null : "verified")}
        >
           <CheckCircle2 className="h-3 w-3" /> Verified
        </Badge>

        <Badge 
          variant={activeCategory === "critical" || activeCategory === "focus" ? "default" : "outline"}
          className="px-3 py-1 cursor-pointer font-bold text-[9px] uppercase tracking-wider h-7 gap-1.5"
          onClick={() => onCategoryFilter(activeCategory === "critical" ? null : "critical")}
        >
          <AlertCircle className="h-3 w-3" /> Needs Review
        </Badge>

        {(activeStatus || activeCategory || activeRevaluation || searchQuery) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
               setSearchQuery("")
               onSearch("")
               onStatusFilter(null)
               onCategoryFilter(null)
               onRevaluationFilter(false)
            }}
            className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 gap-1.5"
          >
            <X className="h-3 w-3" /> Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
