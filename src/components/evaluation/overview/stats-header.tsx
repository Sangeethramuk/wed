"use client"

import { ClipboardCheck, Zap, CheckCircle2, LayoutGrid } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatsHeaderProps {
  total: number
  pendingCalibration: number
  inGrading: number
  complete: number
}

// Stats grid migrated to the EducAItors DS guide. White cards, very subtle
// inline shadow, slate text ramp, accent color used only for the icon (not a
// full tinted background). Numbers stay large (text-4xl) but in brand navy
// for emphasis and slate-900 otherwise.
export function StatsHeader({ total, pendingCalibration, inGrading, complete }: StatsHeaderProps) {
  const stats = [
    {
      label: "Total Assignments",
      value: total,
      icon: LayoutGrid,
      accent: "#64748B",      // slate-500
      numberColor: "#0F172A", // slate-900
    },
    {
      label: "Pending Calibration",
      value: pendingCalibration,
      icon: Zap,
      accent: "#F59E0B",      // warning
      numberColor: "#F59E0B",
    },
    {
      label: "In Grading",
      value: inGrading,
      icon: ClipboardCheck,
      accent: "#1F4E8C",      // brand primary
      numberColor: "#1F4E8C",
    },
    {
      label: "Fully Graded",
      value: complete,
      icon: CheckCircle2,
      accent: "#10B981",      // success
      numberColor: "#10B981",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-white border border-slate-200 rounded-xl p-5 transition-colors hover:border-slate-300"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-slate-400">{stat.label}</p>
              <p
                className="text-4xl font-semibold tracking-tight tabular-nums"
                style={{ color: stat.numberColor }}
              >
                {stat.value}
              </p>
            </div>
            <stat.icon className="h-5 w-5 mt-1 opacity-80" style={{ color: stat.accent }} />
          </div>
        </Card>
      ))}
    </div>
  )
}
