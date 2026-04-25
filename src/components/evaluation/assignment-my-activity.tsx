"use client"

import {
  CheckCircle2, Clock, Gauge, Calendar, ArrowUp, ArrowDown,
  Send, Sparkles, ShieldCheck, Settings2, FileEdit,
} from "lucide-react"

// "My Activity" tab on /dashboard/evaluation/[id]. Shows the instructor's
// own grading progress + override patterns + change history. Same DS
// conventions as the Analytics tab: white slate-bordered rounded-xl
// cards with inline shadows and the EducAItors hex palette.

interface AssignmentMyActivityProps {
  assignmentId: string
  totalSubmissions: number
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function fmtDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`
  return `${s}s`
}

function fmtMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}m ${s}s`
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fmtClock(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
}

function buildData(id: string, total: number) {
  const h = hashCode(id)
  const cohort = Math.max(8, Math.min(60, total))
  const verified = cohort
  const sessions = 3 + (h % 3) // 3..5 sessions

  // Build sessions over recent days
  const baseEnd = new Date(2026, 1, 22, 18, 3) // Feb 22, 2026 6:03 PM
  const sessionData = Array.from({ length: sessions }).map((_, i) => {
    const day = sessions - 1 - i
    const date = new Date(baseEnd)
    date.setDate(baseEnd.getDate() - day)
    const reviewed = Math.max(2, Math.round(cohort / sessions) + ((h >> (i + 2)) & 0x3) - 1)
    const overrides = Math.max(0, Math.min(reviewed, 1 + ((h >> (i + 4)) & 0x3)))
    const avgPerSub = 180 + ((h >> (i + 1)) & 0x7f) // 180..307s
    const sessionSec = reviewed * avgPerSub
    const start = new Date(date.getTime() - sessionSec * 1000)
    const overrideDim = ["Academic Rigor & Citations", "Conceptual Clarity", "Research Methodology"][i % 3]
    return { date, start, end: date, reviewed, overrides, avgPerSub, durationSec: sessionSec, overrideDim }
  }).reverse()

  const totalSec = sessionData.reduce((s, x) => s + x.durationSec, 0)
  const totalReviewed = sessionData.reduce((s, x) => s + x.reviewed, 0)
  const totalOverrides = sessionData.reduce((s, x) => s + x.overrides, 0)
  const overrideRate = totalReviewed > 0 ? Math.round((totalOverrides / totalReviewed) * 100) : 0
  const avgPerSub = totalReviewed > 0 ? Math.round(totalSec / totalReviewed) : 0
  const fastestPerSub = sessionData.reduce((m, x) => Math.min(m, x.avgPerSub), Number.POSITIVE_INFINITY)

  const dimensions = [
    { name: "Conceptual Clarity",       count: 4, direction: "up",   delta: "+3.2" },
    { name: "Research Methodology",     count: 4, direction: "up",   delta: "+4.6" },
    { name: "Academic Rigor & Citations", count: 3, direction: "down", delta: "-2.0" },
  ]

  // Change tracker — events ordered newest first
  const lastSession = sessionData[sessionData.length - 1]
  const publishedAt = new Date(lastSession.end.getTime() + 12 * 3600 * 1000)
  const events = [
    {
      icon: Send,
      iconColor: "#10B981",
      iconBg: "#ECFDF5",
      title: "Grades published",
      description: `${verified} grades published to students.`,
      timestamp: `${fmtDate(publishedAt)} · ${fmtClock(publishedAt)}`,
      tag: `${verified} grades`,
      tagColor: "#047857",
      tagBg: "#ECFDF5",
      tagBorder: "#A7F3D0",
    },
    {
      icon: Sparkles,
      iconColor: "#F59E0B",
      iconBg: "#FFFBEB",
      title: "Calibration model retuned",
      description: "Model adjusted +1.4 pts on Conceptual Clarity based on your overrides.",
      timestamp: `${fmtDate(sessionData[1].end)} · ${fmtClock(sessionData[1].end)}`,
    },
    {
      icon: FileEdit,
      iconColor: "#1F4E8C",
      iconBg: "#EFF6FF",
      title: `${totalOverrides} overrides applied`,
      description: `Across ${sessions} sessions on ${dimensions.length} rubric dimensions.`,
      timestamp: `${fmtDate(sessionData[0].end)} · ${fmtClock(sessionData[0].end)}`,
    },
    {
      icon: ShieldCheck,
      iconColor: "#10B981",
      iconBg: "#ECFDF5",
      title: "Spot check completed",
      description: "Random sample of 5 submissions reviewed — no anomalies detected.",
      timestamp: `${fmtDate(sessionData[0].end)} · 9:42 AM`,
    },
    {
      icon: Settings2,
      iconColor: "#64748B",
      iconBg: "#F1F5F9",
      title: "Calibration completed",
      description: "Initial AI alignment finished. Grading desk unlocked.",
      timestamp: `${fmtDate(new Date(sessionData[0].start.getTime() - 3600 * 1000))} · 8:15 AM`,
    },
  ]

  return {
    cohort,
    verified,
    sessions,
    sessionData,
    totalSec,
    avgPerSub,
    fastestPerSub,
    totalOverrides,
    overrideRate,
    dimensions,
    events,
    daysAhead: 5 + (h % 4),
  }
}

export function AssignmentMyActivity({ assignmentId, totalSubmissions }: AssignmentMyActivityProps) {
  const data = buildData(assignmentId, totalSubmissions)
  const cardShadow = { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
  const progressPct = Math.round((data.verified / data.cohort) * 100)

  return (
    <div className="space-y-6">
      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Verified"
          value={String(data.verified)}
          sub={`of ${data.cohort} total`}
          color="#0F172A"
        />
        <StatCard
          label="Time Spent"
          value={fmtDuration(data.totalSec)}
          sub={`across ${data.sessions} sessions`}
          color="#0F172A"
        />
        <StatCard
          label="Avg / Submission"
          value={fmtMmSs(data.avgPerSub)}
          sub={`fastest: ${fmtMmSs(data.fastestPerSub)}`}
          color="#1F4E8C"
        />
        <StatCard
          label="Sessions"
          value={String(data.sessions)}
          sub={`last: ${fmtDate(data.sessionData[data.sessionData.length - 1].end)}`}
          color="#0F172A"
        />
      </div>

      {/* Grading progress */}
      <div
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
        style={cardShadow}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-slate-400">
            Grading Progress
          </p>
          <span
            className="text-xs font-semibold"
            style={{ color: "#10B981" }}
          >
            {data.daysAhead} days ahead
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
          <div
            className="h-full transition-all"
            style={{ width: `${progressPct}%`, backgroundColor: "#1F4E8C" }}
          />
        </div>
        <p className="text-xs text-slate-500">
          {data.verified} of {data.cohort} verified · {progressPct}% complete
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Session history */}
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-wider text-slate-400">
            Session History
          </p>
          <div className="space-y-3">
            {data.sessionData.slice().reverse().map((s, i) => (
              <SessionCard key={i} {...s} />
            ))}
          </div>
        </div>

        {/* Right column: Override patterns + Change tracker */}
        <div className="space-y-4">
          <OverridePatterns
            totalOverrides={data.totalOverrides}
            overrideRate={data.overrideRate}
            sessions={data.sessions}
            dimensions={data.dimensions}
          />
          <ChangeTracker events={data.events} />
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color,
}: {
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-5"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <p className="text-[10px] font-semibold tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className="text-3xl font-semibold tracking-tight tabular-nums mt-1.5"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-1 truncate">{sub}</p>
    </div>
  )
}

function SessionCard({
  date, start, end, reviewed, overrides, avgPerSub, durationSec, overrideDim,
}: {
  date: Date
  start: Date
  end: Date
  reviewed: number
  overrides: number
  avgPerSub: number
  durationSec: number
  overrideDim: string
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="flex">
        <div className="w-1 shrink-0" style={{ backgroundColor: "#1F4E8C" }} />
        <div className="flex-1 p-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {fmtDate(date)}
            </p>
            <p className="text-xs text-slate-500">
              {reviewed} reviewed · {overrides} override{overrides !== 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-slate-400">
              {fmtClock(start)} – {fmtClock(end)} · avg {fmtMmSs(avgPerSub)}/sub
            </p>
            <p className="text-[11px] text-slate-400">
              Overrides: <span className="font-semibold text-slate-600">{overrideDim}</span>
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: "#1F4E8C" }}>
            {fmtDuration(durationSec).replace("h ", "h ").replace("m", "m")}
          </span>
        </div>
      </div>
    </div>
  )
}

function OverridePatterns({
  totalOverrides, overrideRate, sessions, dimensions,
}: {
  totalOverrides: number
  overrideRate: number
  sessions: number
  dimensions: { name: string; count: number; direction: string; delta: string }[]
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-slate-400">
          Override Patterns
        </p>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border"
          style={{ backgroundColor: "#ECFDF5", color: "#047857", borderColor: "#A7F3D0" }}
        >
          STABLE
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-900">{totalOverrides} overrides</span> ·{" "}
        <span className="font-semibold text-slate-900">{overrideRate}% rate</span> · Override rate has been
        consistent across all {sessions} sessions.
      </p>

      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_44px_60px_72px] gap-2 px-3 pb-2 border-b border-slate-100">
          <span className="text-[10px] font-semibold tracking-wider text-slate-400">Dimension</span>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 text-right">Count</span>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 text-center">Direction</span>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 text-right">Avg Δ</span>
        </div>
        {dimensions.map((d) => {
          const isUp = d.direction === "up"
          const color = isUp ? "#10B981" : "#EF4444"
          return (
            <div
              key={d.name}
              className="grid grid-cols-[1fr_44px_60px_72px] gap-2 items-center px-3 py-2"
            >
              <span className="text-xs font-semibold text-slate-900 truncate">{d.name}</span>
              <span className="text-xs tabular-nums text-slate-700 text-right">{d.count}</span>
              <span className="flex justify-center">
                {isUp ? (
                  <ArrowUp className="h-3.5 w-3.5" style={{ color }} />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5" style={{ color }} />
                )}
              </span>
              <span className="text-xs font-semibold tabular-nums text-right" style={{ color }}>
                {d.delta} pts
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChangeTracker({
  events,
}: {
  events: {
    icon: typeof Send
    iconColor: string
    iconBg: string
    title: string
    description: string
    timestamp: string
    tag?: string
    tagColor?: string
    tagBg?: string
    tagBorder?: string
  }[]
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-5 space-y-1"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <p className="text-xs font-semibold tracking-wider text-slate-400">
        Change Tracker
      </p>
      <p className="text-xs text-slate-500 mb-3">
        Every change that has affected this assignment&apos;s grading or model behavior.
      </p>
      <div className="space-y-3">
        {events.map((ev, i) => {
          const Icon = ev.icon
          return (
            <div key={i} className="flex items-start gap-3">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: ev.iconBg }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: ev.iconColor }} />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {ev.title}
                  </p>
                  {ev.tag && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border shrink-0"
                      style={{
                        backgroundColor: ev.tagBg,
                        color: ev.tagColor,
                        borderColor: ev.tagBorder,
                      }}
                    >
                      {ev.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{ev.description}</p>
                <p className="text-[10px] font-semibold tracking-wider text-slate-400">
                  {ev.timestamp}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Re-exports kept so unused-import linters don't complain in case a future
// caller pulls these directly.
export { CheckCircle2, Clock, Gauge, Calendar }
