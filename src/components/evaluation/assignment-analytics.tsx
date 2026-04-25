"use client"

import { TrendingUp, TrendingDown, Users, AlertTriangle, ArrowRight } from "lucide-react"

// Per-assignment analytics view rendered under the Analytics tab on
// /dashboard/evaluation/[id]. Aligned with the EducAItors DS guide:
// white cards / slate-200 borders / rounded-xl / inline shadows /
// hex palette CTAs (#1F4E8C brand, #10B981 success, #F59E0B warning,
// #EF4444 danger). Numbers are deterministic per assignment id so the
// view is stable across reloads.

interface AssignmentAnalyticsProps {
  assignmentId: string
  assignmentTitle: string
  totalSubmissions: number
}

// Simple deterministic hash so each assignment gets stable but distinct
// values without requiring a real backend.
function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const STUDENT_NAMES = [
  "Aanya Sharma", "Nikhil Malhotra", "Priya Iyer", "Rohan Kapoor",
  "Aarav Singh", "Isha Patel", "Vihaan Rao", "Diya Menon",
]

const RUBRIC_DIMENSIONS = [
  { name: "Conceptual Clarity", maxScore: 20 },
  { name: "Research Methodology", maxScore: 25 },
  { name: "Data Analysis & Synthesis", maxScore: 20 },
  { name: "Redesign Recommendations", maxScore: 15 },
  { name: "Presentation & Communication", maxScore: 10 },
  { name: "Academic Rigor & Citations", maxScore: 10 },
]

function bandColor(pct: number): { bar: string; tint: string; text: string } {
  if (pct >= 80) return { bar: "#10B981", tint: "#ECFDF5", text: "#047857" } // green
  if (pct >= 50) return { bar: "#1F4E8C", tint: "#EFF6FF", text: "#1F4E8C" } // brand
  return { bar: "#EF4444", tint: "#FEF2F2", text: "#B91C1C" } // red
}

function buildData(id: string, total: number) {
  const h = hashCode(id)
  const cohort = Math.max(10, Math.min(60, total))
  const submitted = Math.max(1, cohort - (h % 5))
  const median = 60 + (h % 18)
  const avg = median - 1 + ((h >> 3) % 5)
  const highestVal = Math.min(98, median + 12 + ((h >> 5) % 8))
  const lowestVal = Math.max(35, median - 18 + ((h >> 7) % 8))

  const dims = RUBRIC_DIMENSIONS.map((d, i) => {
    const seed = (h >> (i + 1)) & 0xff
    const pct = 50 + (seed % 35) // 50..84
    const score = Math.round((pct / 100) * d.maxScore * 10) / 10
    return { ...d, pct, score }
  })

  // Force the lowest dimension to be a clear standout
  const lowestIdx = dims.reduce((min, d, i, arr) => d.pct < arr[min].pct ? i : min, 0)
  const lowestDim = dims[lowestIdx]

  // Student distribution buckets (5 bands)
  const buckets = [
    { label: "<50%", color: "#EF4444" },
    { label: "50–59%", color: "#F59E0B" },
    { label: "60–69%", color: "#1F4E8C" },
    { label: "70–79%", color: "#10B981" },
    { label: "≥80%", color: "#6D28D9" },
  ].map((b, i) => {
    const seed = (h >> (i + 8)) & 0x3f
    return { ...b, count: Math.max(0, Math.round((cohort / 5) + (seed % 8) - 4)) }
  })
  // Scale buckets to match cohort size
  const sum = buckets.reduce((s, b) => s + b.count, 0) || 1
  buckets.forEach(b => { b.count = Math.max(0, Math.round((b.count / sum) * cohort)) })
  // Adjust last bucket so totals match
  const adj = cohort - buckets.reduce((s, b) => s + b.count, 0)
  buckets[2].count = Math.max(0, buckets[2].count + adj)

  return {
    submitted,
    avg,
    median,
    highest: { value: highestVal, name: STUDENT_NAMES[h % STUDENT_NAMES.length] },
    lowest: { value: lowestVal, name: STUDENT_NAMES[(h + 3) % STUDENT_NAMES.length] },
    dims,
    lowestDim,
    aiConfidence: 60 + (h % 12),
    deviationCount: 4 + (h % 6),
    inconsistencyCount: 3 + ((h >> 2) % 5),
    buckets,
  }
}

export function AssignmentAnalytics({ assignmentId, totalSubmissions }: AssignmentAnalyticsProps) {
  const data = buildData(assignmentId, totalSubmissions)
  const cardShadow = { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
  const maxBucket = Math.max(1, ...data.buckets.map(b => b.count))

  return (
    <div className="space-y-6">
      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Score" value={data.avg} sub={`across ${data.submitted} submissions`} color="#0F172A" />
        <StatCard
          label="Highest"
          value={data.highest.value}
          sub={data.highest.name}
          color="#10B981"
          icon={<TrendingUp className="h-3.5 w-3.5" style={{ color: "#10B981" }} />}
        />
        <StatCard
          label="Lowest"
          value={data.lowest.value}
          sub={data.lowest.name}
          color="#EF4444"
          icon={<TrendingDown className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />}
        />
        <StatCard label="Median" value={data.median} sub="class midpoint" color="#1F4E8C" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column: Rubric breakdown + Distribution */}
        <div className="space-y-6">
          {/* Rubric dimensions */}
          <div
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
            style={cardShadow}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider text-slate-400">
                AI Score by Rubric Dimension
              </p>
              <div className="flex items-center gap-3 text-[10px] font-semibold tracking-wider text-slate-400">
                <Legend color="#10B981" label="≥80%" />
                <Legend color="#1F4E8C" label="50–79%" />
                <Legend color="#EF4444" label="<50%" />
              </div>
            </div>
            <div className="space-y-1">
              {data.dims.map((d, i) => {
                const isLowest = i === data.dims.findIndex(x => x.name === data.lowestDim.name)
                return (
                  <DimensionRow
                    key={d.name}
                    name={d.name}
                    score={d.score}
                    maxScore={d.maxScore}
                    pct={d.pct}
                    highlight={isLowest}
                  />
                )
              })}
            </div>
            <div
              className="rounded-lg border px-3 py-2.5 text-xs"
              style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
            >
              <span className="font-semibold" style={{ color: "#B45309" }}>
                {data.lowestDim.name}
              </span>{" "}
              <span className="text-slate-600">
                has the lowest AI confidence ({data.aiConfidence}%). Plan extra review time on this dimension.
              </span>
            </div>
          </div>

          {/* Student distribution */}
          <div
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
            style={cardShadow}
          >
            <p className="text-xs font-semibold tracking-wider text-slate-400">
              Student Distribution
            </p>
            <div className="flex items-end justify-between gap-3 h-44 pt-2">
              {data.buckets.map((b) => {
                const heightPct = (b.count / maxBucket) * 100
                return (
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-semibold tabular-nums text-slate-900">
                      {b.count}
                    </span>
                    <div className="w-full flex items-end" style={{ height: "calc(100% - 36px)" }}>
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${heightPct}%`,
                          minHeight: b.count === 0 ? 4 : undefined,
                          backgroundColor: b.color,
                          opacity: b.count === 0 ? 0.2 : 1,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400">
                      {b.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column: Detected Patterns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-slate-400">
              Detected Patterns
            </p>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border"
              style={{ backgroundColor: "#FEF2F2", color: "#EF4444", borderColor: "#FECACA" }}
            >
              2 actionable
            </span>
          </div>

          <PatternCard
            tag="Score Deviation"
            tagColor="#EF4444"
            tagBg="#FEF2F2"
            tagBorder="#FECACA"
            stripe="#EF4444"
            title={`AI consistently under-scoring ${data.lowestDim.name}`}
            description={`AI scores are 3–5 pts below your overrides on this dimension across ${data.deviationCount} submissions. The model may be missing implicit citation styles.`}
            affected={data.deviationCount}
            ctaLabel="Apply bulk override"
            ctaColor="#EF4444"
          />

          <PatternCard
            tag="Inconsistency"
            tagColor="#B45309"
            tagBg="#FFFBEB"
            tagBorder="#FDE68A"
            stripe="#F59E0B"
            title="Mixed evidence quality in Redesign Recommendations"
            description={`${data.inconsistencyCount} submissions score 10–11 on Redesign but have strong visual evidence. Consider reviewing upper-bound scoring for this dimension.`}
            affected={data.inconsistencyCount}
            ctaLabel="Review flagged"
            ctaColor="#F59E0B"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, icon,
}: {
  label: string
  value: number | string
  sub: string
  color: string
  icon?: React.ReactNode
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-5"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold tracking-wider text-slate-400">
          {label}
        </p>
        {icon}
      </div>
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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function DimensionRow({
  name, score, maxScore, pct, highlight,
}: {
  name: string
  score: number
  maxScore: number
  pct: number
  highlight: boolean
}) {
  const c = bandColor(pct)
  return (
    <div
      className="grid grid-cols-[1fr_64px_1fr_64px] items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
      style={highlight ? { backgroundColor: "#FFFBEB" } : undefined}
    >
      <span className="text-sm font-semibold text-slate-900 truncate">{name}</span>
      <span className="text-xs text-slate-500 tabular-nums text-right">
        {score}/{maxScore}
      </span>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: c.bar }}
        />
      </div>
      <span className="inline-flex items-center justify-end gap-1.5 text-xs font-semibold tabular-nums">
        <span style={{ color: c.text }}>{pct}%</span>
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: c.bar }} />
      </span>
    </div>
  )
}

function PatternCard({
  tag, tagColor, tagBg, tagBorder, stripe, title, description, affected, ctaLabel, ctaColor,
}: {
  tag: string
  tagColor: string
  tagBg: string
  tagBorder: string
  stripe: string
  title: string
  description: string
  affected: number
  ctaLabel: string
  ctaColor: string
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="flex">
        <div className="w-1 shrink-0" style={{ backgroundColor: stripe }} />
        <div className="flex-1 p-4 space-y-3">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider border"
            style={{ backgroundColor: tagBg, color: tagColor, borderColor: tagBorder }}
          >
            {tag.toUpperCase()}
          </span>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-900 leading-snug">{title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Users className="h-3 w-3" />
              {affected} affected
            </span>
            <button
              className="inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80 group/cta"
              style={{ color: ctaColor }}
              onClick={(e) => e.preventDefault()}
            >
              {ctaLabel}
              <ArrowRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Re-export so unused-import linters don't whine if a future caller adds it.
export { AlertTriangle }
