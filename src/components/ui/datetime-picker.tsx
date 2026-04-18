"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Popover as PopoverRoot, PopoverContent as ShadPopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export function DateTimePicker({ 
  date, 
  setDate 
}: { 
  date: string, 
  setDate: (date: string) => void 
}) {
  const currentDate = date ? new Date(date) : new Date()
  
  const handleDateSelect = (d: Date | undefined) => {
    if (!d) return
    const newDate = new Date(d)
    newDate.setHours(currentDate.getHours())
    newDate.setMinutes(currentDate.getMinutes())
    setDate(newDate.toISOString())
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number)
    const newDate = new Date(currentDate)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)
    setDate(newDate.toISOString())
  }

  return (
    <PopoverRoot>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-56 justify-start text-left font-bold border-2 h-10",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(currentDate, "PPP p") : <span>Pick deadline</span>}
      </PopoverTrigger>
      <ShadPopoverContent className="w-auto p-0 z-[101]" align="end">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="p-3 border-t bg-muted/20 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input 
            type="time" 
            className="h-8 text-xs font-bold" 
            value={format(currentDate, "HH:mm")}
            onChange={handleTimeChange}
          />
        </div>
      </ShadPopoverContent>
    </PopoverRoot>
  )
}
