"use client"

import { ClipboardCheck, Zap, CheckCircle2, LayoutGrid } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatsHeaderProps {
  total: number
  pendingCalibration: number
  inGrading: number
  complete: number
}

export function StatsHeader({ total, pendingCalibration, inGrading, complete }: StatsHeaderProps) {
  const stats = [
    { label: "Total Assignments", value: total, icon: LayoutGrid, color: "text-foreground", bg: "bg-muted/30" },
    { label: "Pending Calibration", value: pendingCalibration, icon: Zap, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30" },
    { label: "In Grading", value: inGrading, icon: ClipboardCheck, color: "text-primary", bg: "bg-primary/5 border-primary/10" },
    { label: "Fully Graded", value: complete, icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bg: "bg-green-50/60 dark:bg-green-950/20 border-green-200/50 dark:border-green-900/30" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`p-6 border ${stat.bg} transition-all hover:shadow-sm`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="eyebrow text-muted-foreground/60">{stat.label}</p>
              <p className={`text-4xl font-semibold tracking-tight tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon className={`h-5 w-5 mt-1 ${stat.color} opacity-40`} />
          </div>
        </Card>
      ))}
    </div>
  )
}
