"use client"

/**
 * Demo navigation panel — a floating jump-to-screen menu for presentations.
 * Mounted globally in the dashboard layout so it's reachable from any route.
 *
 * Each row is a plain Link to an existing screen. No state seeding, no
 * route-gate bypass. If a target screen has prerequisites (e.g., the grading
 * desk redirects to calibrate when calibration is incomplete), the user
 * must satisfy those once per session — same as the real flow.
 *
 * Distinct from the in-screen `DemoControlPanel` in
 * `progressive-nudges.tsx`, which controls nudge / spot-check triggers
 * inside the grading desk and stays where it is.
 */

import Link from "next/link"
import {
  Compass,
  EyeOff,
  ScanSearch,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Send,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

const DEMO_ASSIGNMENT_ID = "se-101"

type Shortcut = {
  href: string
  label: string
  hint?: string
  icon: typeof Compass
}

const SECTIONS: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: "Spot check & nudges",
    shortcuts: [
      {
        href: `/dashboard/evaluation/${DEMO_ASSIGNMENT_ID}/grading`,
        label: "Open grading desk",
        hint: "In-screen demo button lives here",
        icon: ScanSearch,
      },
    ],
  },
  {
    title: "Double-blind",
    shortcuts: [
      {
        href: `/dashboard/evaluation/${DEMO_ASSIGNMENT_ID}/calibrate`,
        label: "Blind grading flow",
        hint: "Start / mid / final screen",
        icon: EyeOff,
      },
      {
        href: `/dashboard/evaluation/${DEMO_ASSIGNMENT_ID}/grading`,
        label: "Grading desk (post-blind)",
        icon: ClipboardList,
      },
      {
        href: `/dashboard/evaluation/${DEMO_ASSIGNMENT_ID}/feedback`,
        label: "Feedback page",
        icon: MessageSquare,
      },
      {
        href: `/dashboard/evaluation/results`,
        label: "Results overview",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Publish",
    shortcuts: [
      {
        href: `/dashboard/evaluation/publish`,
        label: "Ready to publish",
        hint: "All grades saved · Publish button live",
        icon: Send,
      },
    ],
  },
]

export function DemoNavPanel() {
  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <Popover>
        <PopoverTrigger
          className="inline-flex items-center gap-1.5 rounded-full shadow-lg bg-background border border-primary/40 text-primary hover:bg-primary/5 h-9 px-4 text-sm font-medium"
        >
          <Compass className="h-4 w-4" />
          Demo flows
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-72 p-2">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-foreground">Jump to screen</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Navigate directly to any flow without clicking through the wizard.
            </p>
          </div>
          {SECTIONS.map((section, sectionIdx) => (
            <div key={section.title}>
              <Separator className="my-1" />
              <p className="eyebrow text-muted-foreground px-2 py-1">{section.title}</p>
              {section.shortcuts.map((shortcut) => {
                const Icon = shortcut.icon
                return (
                  <Link
                    key={`${sectionIdx}-${shortcut.label}`}
                    href={shortcut.href}
                    className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-normal leading-tight">{shortcut.label}</span>
                      {shortcut.hint && (
                        <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                          {shortcut.hint}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
