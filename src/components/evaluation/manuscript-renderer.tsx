"use client"

import React from "react"
import { type ManuscriptElement } from "@/lib/manuscript-generator"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { criterionStyles, type CriterionKey } from "@/lib/design-tokens"
import { AlertTriangle } from "lucide-react"

type CriterionColor = {
  bg: string
  border: string
  hoverBg: string
  badge: string
  dot: string
  text: string
  bar: string
  cardBg: string
  cardBorder: string
  label: string
}

const buildCriterionColor = (key: CriterionKey): CriterionColor => {
  const style = criterionStyles[key]
  return {
    bg: style.bg,
    border: style.border,
    hoverBg: `hover:${style.bg}`,
    badge: style.bg,
    dot: style.dot,
    text: style.text,
    bar: style.dot,
    cardBg: style.bg,
    cardBorder: style.border,
    label: style.text,
  }
}

export const CRITERION_COLORS: Record<string, CriterionColor> = {
  c1: buildCriterionColor("c1"),
  c2: buildCriterionColor("c2"),
  c3: buildCriterionColor("c3"),
  c4: buildCriterionColor("c4"),
}

const CRITERION_LABELS: Record<string, string> = {
  "c1": "Problem Understanding & Direction",
  "c2": "Iteration & Improvement",
  "c3": "Documentation & Reproducibility",
  "c4": "Technical Setup & Integration",
}

function ConfidenceBars({ confidence }: { confidence: number }) {
  const filled = confidence >= 0.8 ? 3 : confidence >= 0.6 ? 2 : 1
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-4 h-1.5 rounded-sm ${i <= filled ? "bg-[color:var(--status-success)]" : "bg-border"}`}
        />
      ))}
    </div>
  )
}

type EvidenceRef = { criterionId: string; id: string }

const HIGHLIGHTER_BG: Record<string, string> = {
  c1: 'bg-[color:var(--category-1)]/18 hover:bg-[color:var(--category-1)]/28',
  c2: 'bg-[color:var(--category-2)]/18 hover:bg-[color:var(--category-2)]/28',
  c3: 'bg-[color:var(--category-3)]/18 hover:bg-[color:var(--category-3)]/28',
  c4: 'bg-[color:var(--category-4)]/18 hover:bg-[color:var(--category-4)]/28',
}

function UserHighlightedSpan({
  text,
  evidences,
  id,
}: {
  text: string
  evidences: EvidenceRef[]
  id?: string
}) {
  const first = evidences[0]
  const highlighter = HIGHLIGHTER_BG[first.criterionId] ?? HIGHLIGHTER_BG.c1
  return (
    <HoverCard>
      <HoverCardTrigger
        id={id}
        className={`${highlighter} box-decoration-clone px-1 py-0.5 rounded-sm cursor-pointer transition-colors scroll-mt-20`}
      >
        {text}
      </HoverCardTrigger>
      <HoverCardContent side="top" className="max-w-xs p-4 border border-border shadow-lg">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-md">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="eyebrow text-primary">Evidence</span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Manually mapped by instructor to {evidences.length === 1 ? '1 criterion' : `${evidences.length} criteria`}
          </p>
          <div className="space-y-2">
            {evidences.map((ev) => {
              const style = CRITERION_COLORS[ev.criterionId] ?? CRITERION_COLORS['c1']
              const label = CRITERION_LABELS[ev.criterionId] ?? `Criterion ${ev.criterionId}`
              return (
                <div key={ev.id} className={`flex items-start gap-2 pl-2 border-l-2 ${style.border}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-popover-foreground leading-tight">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Criterion {ev.criterionId}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

/**
 * Split a paragraph text into plain + evidence segments. Multiple evidences
 * pointing at the same text produce ONE merged segment carrying the full list
 * of criterion links — the popover renders them all.
 */
function splitByEvidence(
  text: string,
  evidences: { id: string; text: string; criterionId: string }[]
): Array<{ text: string; evidences?: EvidenceRef[] }> {
  let segments: Array<{ text: string; evidences?: EvidenceRef[] }> = [{ text }]
  for (const ev of evidences) {
    const next: typeof segments = []
    for (const seg of segments) {
      if (seg.evidences && seg.text === ev.text) {
        next.push({ ...seg, evidences: [...seg.evidences, { criterionId: ev.criterionId, id: ev.id }] })
        continue
      }
      if (seg.evidences) { next.push(seg); continue }
      const idx = seg.text.indexOf(ev.text)
      if (idx === -1) { next.push(seg); continue }
      if (idx > 0) next.push({ text: seg.text.slice(0, idx) })
      next.push({ text: ev.text, evidences: [{ criterionId: ev.criterionId, id: ev.id }] })
      const tail = seg.text.slice(idx + ev.text.length)
      if (tail) next.push({ text: tail })
    }
    segments = next
  }
  return segments
}

function HighlightedSpan({
  text,
  criterionId,
  confidence,
}: {
  text: string
  criterionId: string
  confidence: number
}) {
  const c = CRITERION_COLORS[criterionId] ?? CRITERION_COLORS[1]
  const label = CRITERION_LABELS[criterionId] ?? `Criterion ${criterionId}`

  const descriptions: Record<string, string> = {
    "c1": "This passage demonstrates clear framing of the problem context, user/task clarity, and primary objectives.",
    "c2": "Demonstrates iterative thinking through progressive refinement with clear articulation of improvements.",
    "c3": "Provides technical documentation with clear explanations that enable reproducibility of the approach.",
    "c4": "Shows practical implementation capability with proper tool integration and configuration management.",
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        className={`${c.bg} border-b-2 ${c.border} px-1 rounded cursor-help ${c.hoverBg} transition-colors`}
      >
        {text}
      </HoverCardTrigger>
      <HoverCardContent side="top" className="max-w-xs p-4 border border-border shadow-lg">
        <div className="space-y-3">
          <div className={`inline-flex items-center gap-2 px-2 py-1 ${c.badge} rounded-md`}>
            <div className={`w-2 h-2 rounded-full ${c.dot}`} />
            <span className={`eyebrow ${c.text}`}>
              Evidence
            </span>
          </div>
          <div>
            <p className="text-base font-bold text-popover-foreground mb-1">{label}</p>
            <p className="text-xs text-popover-foreground/70 leading-relaxed">
              {descriptions[criterionId] ?? "Relevant evidence for this criterion."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="eyebrow text-popover-foreground/50">
              AI Confidence
            </span>
            <ConfidenceBars confidence={confidence} />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function DiagramElement({
  diagramType,
  label,
}: {
  diagramType: "er" | "flowchart" | "architecture"
  label: string
}) {
  return (
    <div className="my-6 border border-border/60 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-muted/30 border-b border-border/40">
        <span className="eyebrow text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="p-6 bg-background min-h-[200px] flex items-center justify-center">
        {diagramType === "er" && (
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            {[
              { name: "Users", fields: ["id", "email", "role"] },
              { name: "Orders", fields: ["id", "user_id", "total"] },
              { name: "Products", fields: ["id", "sku", "price"] },
            ].map((t) => (
              <div key={t.name} className="border border-[color:var(--status-info)]/30 rounded bg-[color:var(--status-info-bg)]/50">
                <div className="px-2 py-1 bg-[color:var(--status-info-bg)] border-b border-[color:var(--status-info)]/30 text-xs font-bold text-[color:var(--status-info)] text-center">
                  {t.name}
                </div>
                {t.fields.map((f) => (
                  <div key={f} className="px-2 py-0.5 text-xs text-foreground/70 font-mono border-b border-[color:var(--status-info)]/30 last:border-0">
                    {f}
                  </div>
                ))}
              </div>
            ))}
            <div className="col-span-3 flex justify-center gap-8 text-xs text-muted-foreground font-mono">
              <span>Users ──1:N──▸ Orders</span>
              <span>Orders ──N:M──▸ Products</span>
            </div>
          </div>
        )}
        {diagramType === "flowchart" && (
          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            {["Client Request", "API Gateway", "Auth Middleware", "Controller", "Database"].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div className="px-4 py-2 border border-border rounded-md bg-muted/40 text-xs font-bold text-foreground/80">
                  {step}
                </div>
                {i < 4 && <div className="w-px h-3 bg-muted" />}
              </div>
            ))}
          </div>
        )}
        {diagramType === "architecture" && (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="px-6 py-2 border border-[color:var(--status-warning)]/30 rounded-md bg-[color:var(--status-warning-bg)] text-xs font-bold text-[color:var(--status-warning)]">
              API Gateway
            </div>
            <div className="flex gap-4">
              {["User Svc", "Order Svc", "Notify Svc"].map((svc) => (
                <div key={svc} className="px-3 py-2 border border-[color:var(--status-success)]/30 rounded-md bg-[color:var(--status-success-bg)] text-xs font-bold text-[color:var(--status-success)]">
                  {svc}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {["PostgreSQL", "Redis", "Kafka"].map((db) => (
                <div key={db} className="px-3 py-1.5 border border-[color:var(--category-2)]/30 rounded bg-[color:var(--category-2-bg)] text-xs font-mono text-[color:var(--category-2)]">
                  {db}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SuspiciousParagraphWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-md border border-[color:var(--status-error)]/30 bg-[color:var(--status-error-bg)] pl-5 pr-3 py-3 group/sus"
      title="Review this area carefully — possible plagiarism or cheating detected."
    >
      <span className="absolute -top-2 left-3 inline-flex items-center gap-1 rounded-full border border-[color:var(--status-error)]/40 bg-background px-2 py-0.5 text-[10px] font-semibold text-[color:var(--status-error)]">
        <AlertTriangle className="h-2.5 w-2.5" />
        Review carefully
      </span>
      {children}
    </div>
  )
}

export default function ManuscriptRenderer({
  elements,
  userEvidence = [],
  suspiciousElementIndices = [],
}: {
  elements: ManuscriptElement[]
  userEvidence?: { id: string; text: string; criterionId: string }[]
  /** Element indices (within `elements`) to flag as suspicious — renders with a review-carefully overlay + tooltip. */
  suspiciousElementIndices?: number[]
}) {
  const suspiciousSet = new Set(suspiciousElementIndices)
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {elements.map((el, i) => {
        const isSuspicious = suspiciousSet.has(i)
        switch (el.type) {
          case "heading":
            return el.level === 3 ? (
              <h3 key={i} className="text-lg font-bold text-foreground/80 border-b border-border/40 pb-2 mt-8">
                {el.text}
              </h3>
            ) : (
              <h2 key={i} className="text-2xl font-bold text-foreground leading-tight">
                {el.text}
              </h2>
            )

          case "paragraph": {
            const matches = userEvidence.filter(ev => el.text.includes(ev.text))
            let paragraphNode: React.ReactNode
            if (matches.length > 0) {
              const segments = splitByEvidence(el.text, matches)
              paragraphNode = (
                <p className="text-lg leading-[1.8] text-foreground/90 p-2 -m-2 rounded transition-colors font-serif">
                  {segments.map((seg, j) =>
                    seg.evidences && seg.evidences.length > 0 ? (
                      <UserHighlightedSpan
                        key={j}
                        text={seg.text}
                        evidences={seg.evidences}
                        id={`evidence-${seg.evidences[0].id}`}
                      />
                    ) : (
                      <span key={j}>{seg.text}</span>
                    )
                  )}
                </p>
              )
            } else if (el.highlight) {
              paragraphNode = (
                <p className="text-lg leading-[1.8] text-foreground/90 p-2 -m-2 rounded transition-colors">
                  <HighlightedSpan text={el.text} criterionId={el.highlight.criterionId} confidence={el.highlight.confidence} />
                </p>
              )
            } else {
              paragraphNode = (
                <p className="text-lg leading-[1.8] text-foreground/90">
                  {el.text}
                </p>
              )
            }
            return isSuspicious
              ? <SuspiciousParagraphWrapper key={i}>{paragraphNode}</SuspiciousParagraphWrapper>
              : <div key={i}>{paragraphNode}</div>
          }

          case "code":
            return (
              <div key={i} className="my-4 rounded-lg overflow-hidden border border-border/40">
                <div className="px-4 py-2 bg-foreground border-b border-border flex items-center justify-between">
                  <span className="eyebrow text-muted-foreground/70">{el.language}</span>
                  <span className="text-xs text-muted-foreground font-mono">source</span>
                </div>
                <pre className="p-4 bg-foreground overflow-x-auto">
                  <code className="text-sm text-[color:var(--status-success)] font-mono leading-relaxed whitespace-pre">{el.code}</code>
                </pre>
              </div>
            )

          case "table":
            return (
              <div key={i} className="my-6 overflow-hidden border border-border/50 rounded-lg">
                <Table className="text-left">
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border/50 hover:bg-muted/40">
                      {el.headers.map((h, hi) => (
                        <TableHead key={hi} className="eyebrow px-4 py-2.5 text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {el.rows.map((row, ri) => (
                      <TableRow key={ri} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                        {row.map((cell, ci) => (
                          <TableCell key={ci} className="px-4 py-2 text-xs text-foreground/80 whitespace-normal">{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {el.caption && (
                  <div className="px-4 py-2 bg-muted/20 border-t border-border/30">
                    <span className="text-xs font-bold text-muted-foreground italic">{el.caption}</span>
                  </div>
                )}
              </div>
            )

          case "bulletList":
            return (
              <ul key={i} className="my-4 space-y-2 pl-6">
                {el.items.map((item, ii) => (
                  <li key={ii} className="text-base text-foreground/85 leading-relaxed flex gap-2">
                    <span className="text-muted-foreground/40 mt-1 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )

          case "numberedList":
            return (
              <ol key={i} className="my-4 space-y-2 pl-6">
                {el.items.map((item, ii) => (
                  <li key={ii} className="text-base text-foreground/85 leading-relaxed flex gap-2">
                    <span className="text-muted-foreground/50 font-bold text-sm shrink-0 min-w-[1.5rem]">{ii + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            )

          case "blockQuote":
            return (
              <div key={i} className="my-6 border-l-4 border-primary/30 bg-muted/20 pl-6 pr-4 py-4 rounded-r-lg">
                <p className="text-base italic text-foreground/70 leading-relaxed font-serif">
                  &ldquo;{el.text}&rdquo;
                </p>
                {el.source && (
                  <p className="mt-2 text-xs font-bold text-muted-foreground/60 not-italic">
                    — {el.source}
                  </p>
                )}
              </div>
            )

          case "diagram":
            return <DiagramElement key={i} diagramType={el.diagramType} label={el.label} />

          default:
            return null
        }
      })}
    </div>
  )
}
