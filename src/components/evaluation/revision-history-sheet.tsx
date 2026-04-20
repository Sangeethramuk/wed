"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Edit3,
  Link2,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Clock,
  User,
  Bot,
} from "lucide-react"

export type RevisionEventType =
  | "override"
  | "score_confirmed"
  | "evidence_mapped"
  | "evidence_removed"
  | "feedback_edited"

export interface RevisionEvent {
  id: string
  type: RevisionEventType
  timestamp: Date
  criterionId: string
  criterionLabel: string
  actor: "instructor" | "ai"
  details: {
    previousScore?: number
    newScore?: number
    reasoning?: string
    evidenceText?: string
    feedbackSnippet?: string
  }
}

interface RevisionHistorySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  events: RevisionEvent[]
  studentName: string
}

const EVENT_CONFIG: Record<
  RevisionEventType,
  {
    label: string
    icon: typeof Edit3
    color: string
    bgColor: string
    borderColor: string
  }
> = {
  override: {
    label: "Score Override",
    icon: AlertTriangle,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  score_confirmed: {
    label: "Score Confirmed",
    icon: CheckCircle2,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  evidence_mapped: {
    label: "Evidence Mapped",
    icon: Link2,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  evidence_removed: {
    label: "Evidence Removed",
    icon: Trash2,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  feedback_edited: {
    label: "Feedback Edited",
    icon: MessageSquare,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 5) return "just now"
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}h ago`
}

function EventCard({ event }: { event: RevisionEvent }) {
  const config = EVENT_CONFIG[event.type]
  const Icon = config.icon

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border/50 last:hidden" />
      <div
        className={`absolute left-0 top-0 h-6 w-6 rounded-full flex items-center justify-center ${config.bgColor} border ${config.borderColor}`}
      >
        <Icon className={`h-3 w-3 ${config.color}`} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`eyebrow ${config.color}`}>
              {config.label}
            </span>
            <Badge
              variant="outline"
              className={`h-4 px-1.5 text-[8px] font-bold rounded-sm ${config.bgColor} ${config.color} ${config.borderColor} border`}
            >
              {String(event.criterionId).toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground/50">
            <Clock className="h-2.5 w-2.5" />
            <span className="text-[9px] font-mono tabular-nums">
              {formatTime(event.timestamp)}
            </span>
            <span className="text-[8px] text-muted-foreground/30">
              ({formatRelativeTime(event.timestamp)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          {event.actor === "instructor" ? (
            <User className="h-3 w-3 text-muted-foreground/60" />
          ) : (
            <Bot className="h-3 w-3 text-muted-foreground/60" />
          )}
          <span className="eyebrow text-muted-foreground/60">
            {event.actor === "instructor" ? "Instructor" : "AI System"}
          </span>
        </div>

        <p className="text-[10px] font-bold text-muted-foreground tracking-wider">
          {event.criterionLabel}
        </p>

        {(event.type === "override" || event.type === "score_confirmed") && (
          <div className="flex items-center gap-3 py-1.5 px-3 rounded-md bg-muted/40 border border-border/50">
            {event.details.previousScore !== undefined && (
              <span className="text-xs font-mono text-muted-foreground line-through">
                {event.details.previousScore}
              </span>
            )}
            {event.details.previousScore !== undefined && event.details.newScore !== undefined && (
              <span className="text-muted-foreground/30">→</span>
            )}
            {event.details.newScore !== undefined && (
              <span className="text-xs font-mono font-bold text-foreground">
                {event.details.newScore}
              </span>
            )}
            <span className="text-[9px] text-muted-foreground/50 ml-auto">pts</span>
          </div>
        )}

        {event.type === "override" && event.details.reasoning && (
          <div className="py-1.5 px-3 rounded-md bg-amber-50/50 border border-amber-100 text-xs italic text-amber-800/70 leading-relaxed">
            {event.details.reasoning}
          </div>
        )}

        {(event.type === "evidence_mapped" || event.type === "evidence_removed") &&
          event.details.evidenceText && (
            <div
              className={`py-1.5 px-3 rounded-md border text-xs italic leading-relaxed ${
                event.type === "evidence_mapped"
                  ? "bg-blue-50/50 border-blue-100 text-blue-800/70"
                  : "bg-red-50/50 border-red-100 text-red-800/70"
              }`}
            >
              &ldquo;{event.details.evidenceText.length > 120
                ? event.details.evidenceText.slice(0, 120) + "..."
                : event.details.evidenceText}&rdquo;
            </div>
          )}

        {event.type === "feedback_edited" && event.details.feedbackSnippet && (
          <div className="py-1.5 px-3 rounded-md bg-purple-50/50 border border-purple-100 text-xs italic text-purple-800/70 leading-relaxed">
            {event.details.feedbackSnippet.length > 150
              ? event.details.feedbackSnippet.slice(0, 150) + "..."
              : event.details.feedbackSnippet}
          </div>
        )}
      </div>
    </div>
  )
}

export function RevisionHistorySheet({
  open,
  onOpenChange,
  events,
  studentName,
}: RevisionHistorySheetProps) {
  const sortedEvents = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  )

  const eventCounts = events.reduce<Record<RevisionEventType, number>>(
    (acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1
      return acc
    },
    {} as Record<RevisionEventType, number>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[420px] sm:max-w-[420px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <SheetTitle className="eyebrow text-sm">
                  Revision History
                </SheetTitle>
                <SheetDescription className="eyebrow text-muted-foreground/60">
                  Audit trail for {studentName}
                </SheetDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="h-6 px-2 text-[9px] font-black rounded-full"
            >
              {events.length} {events.length === 1 ? "event" : "events"}
            </Badge>
          </div>

          {events.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(eventCounts).map(([type, count]) => {
                const config = EVENT_CONFIG[type as RevisionEventType]
                return (
                  <Badge
                    key={type}
                    variant="outline"
                    className={`h-5 px-2 text-[8px] font-bold tracking-wider rounded-full ${config.bgColor} ${config.color} ${config.borderColor} border`}
                  >
                    {config.label} ({count})
                  </Badge>
                )
              })}
            </div>
          )}
        </SheetHeader>

        {events.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-muted-foreground/20" />
              </div>
              <div>
                <p className="eyebrow text-xs text-muted-foreground/40">
                  No revisions yet
                </p>
                <p className="text-[10px] text-muted-foreground/30 mt-1 leading-relaxed">
                  Override scores, map evidence, or edit feedback to build an audit trail
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-6 pt-4">
              <div className="space-y-0">
                {sortedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </ScrollArea>
        )}

        {events.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/10">
            <div className="eyebrow flex items-center justify-between text-muted-foreground/40">
              <span>
                First event at{" "}
                {sortedEvents[sortedEvents.length - 1]?.timestamp.toLocaleTimeString(
                  "en-US",
                  { hour: "2-digit", minute: "2-digit", hour12: false }
                )}
              </span>
              <span>
                Last at{" "}
                {sortedEvents[0]?.timestamp.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
