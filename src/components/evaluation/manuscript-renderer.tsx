"use client"

import { type ManuscriptElement } from "@/lib/manuscript-generator"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export const CRITERION_COLORS: Record<string, { bg: string; border: string; hoverBg: string; badge: string; dot: string; text: string; bar: string; cardBg: string; cardBorder: string; label: string }> = {
  "c1": { bg: "bg-yellow-100/80", border: "border-yellow-400", hoverBg: "hover:bg-yellow-200/80", badge: "bg-yellow-50", dot: "bg-yellow-500", text: "text-yellow-700", bar: "bg-yellow-400", cardBg: "bg-yellow-50/40", cardBorder: "border-yellow-200", label: "text-yellow-700" },
  "c2": { bg: "bg-green-100/80",  border: "border-green-400",  hoverBg: "hover:bg-green-200/80",  badge: "bg-green-50",  dot: "bg-green-500",  text: "text-green-700",  bar: "bg-green-400",  cardBg: "bg-green-50/40",  cardBorder: "border-green-200",  label: "text-green-700"  },
  "c3": { bg: "bg-blue-100/80",   border: "border-blue-400",   hoverBg: "hover:bg-blue-200/80",   badge: "bg-blue-50",   dot: "bg-blue-500",   text: "text-blue-700",   bar: "bg-blue-400",   cardBg: "bg-blue-50/40",   cardBorder: "border-blue-200",   label: "text-blue-700"   },
  "c4": { bg: "bg-purple-100/80", border: "border-purple-400", hoverBg: "hover:bg-purple-200/80", badge: "bg-purple-50", dot: "bg-purple-500", text: "text-purple-700", bar: "bg-purple-400", cardBg: "bg-purple-50/40", cardBorder: "border-purple-200", label: "text-purple-700" },
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
          className={`w-4 h-1.5 rounded-sm ${i <= filled ? "bg-green-500" : "bg-border"}`}
        />
      ))}
    </div>
  )
}

function UserHighlightedSpan({ text, criterionId, id }: { text: string; criterionId: number; id?: string }) {
  const c = CRITERION_COLORS[criterionId] ?? CRITERION_COLORS[1]
  const label = CRITERION_LABELS[criterionId] ?? `Criterion ${criterionId}`
  return (
    <HoverCard>
      <HoverCardTrigger
        id={id}
        className={`bg-amber-100/90 border-b-2 border-amber-400 border-dashed px-1 rounded cursor-pointer hover:bg-amber-200/80 transition-colors scroll-mt-20`}
      >
        {text}
      </HoverCardTrigger>
      <HoverCardContent side="top" className="max-w-xs p-4 border border-border shadow-lg">
        <div className="space-y-2">
          <div className={`inline-flex items-center gap-2 px-2 py-1 ${c.badge} rounded-md`}>
            <div className={`w-2 h-2 rounded-full ${c.dot}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${c.text}`}>Your Evidence</span>
          </div>
          <p className="text-sm font-bold text-popover-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground italic">Manually mapped by instructor</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function splitByEvidence(
  text: string,
  evidences: { id: string; text: string; criterionId: number }[]
): Array<{ text: string; evidence?: { criterionId: number; id: string } }> {
  let segments: Array<{ text: string; evidence?: { criterionId: number; id: string } }> = [{ text }]
  for (const ev of evidences) {
    const next: typeof segments = []
    for (const seg of segments) {
      if (seg.evidence) { next.push(seg); continue }
      const idx = seg.text.indexOf(ev.text)
      if (idx === -1) { next.push(seg); continue }
      if (idx > 0) next.push({ text: seg.text.slice(0, idx) })
      next.push({ text: ev.text, evidence: { criterionId: ev.criterionId, id: ev.id } })
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

  const descriptions: Record<number, string> = {
    1: "This passage demonstrates clear framing of the problem context, user/task clarity, and primary objectives.",
    2: "Demonstrates iterative thinking through progressive refinement with clear articulation of improvements.",
    3: "Provides technical documentation with clear explanations that enable reproducibility of the approach.",
    4: "Shows practical implementation capability with proper tool integration and configuration management.",
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
            <span className={`text-[9px] font-black uppercase tracking-widest ${c.text}`}>
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
            <span className="text-[9px] font-black uppercase tracking-widest text-popover-foreground/50">
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
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="p-6 bg-white min-h-[200px] flex items-center justify-center">
        {diagramType === "er" && (
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            {[
              { name: "Users", fields: ["id", "email", "role"] },
              { name: "Orders", fields: ["id", "user_id", "total"] },
              { name: "Products", fields: ["id", "sku", "price"] },
            ].map((t) => (
              <div key={t.name} className="border border-blue-200 rounded bg-blue-50/50">
                <div className="px-2 py-1 bg-blue-100 border-b border-blue-200 text-[10px] font-bold text-blue-800 text-center">
                  {t.name}
                </div>
                {t.fields.map((f) => (
                  <div key={f} className="px-2 py-0.5 text-[9px] text-foreground/70 font-mono border-b border-blue-100 last:border-0">
                    {f}
                  </div>
                ))}
              </div>
            ))}
            <div className="col-span-3 flex justify-center gap-8 text-[9px] text-muted-foreground font-mono">
              <span>Users ──1:N──▸ Orders</span>
              <span>Orders ──N:M──▸ Products</span>
            </div>
          </div>
        )}
        {diagramType === "flowchart" && (
          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            {["Client Request", "API Gateway", "Auth Middleware", "Controller", "Database"].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div className="px-4 py-2 border border-slate-300 rounded-md bg-slate-50 text-[10px] font-bold text-foreground/80">
                  {step}
                </div>
                {i < 4 && <div className="w-px h-3 bg-slate-300" />}
              </div>
            ))}
          </div>
        )}
        {diagramType === "architecture" && (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="px-6 py-2 border border-amber-300 rounded-md bg-amber-50 text-[10px] font-bold text-amber-800">
              API Gateway
            </div>
            <div className="flex gap-4">
              {["User Svc", "Order Svc", "Notify Svc"].map((svc) => (
                <div key={svc} className="px-3 py-2 border border-green-300 rounded-md bg-green-50 text-[9px] font-bold text-green-800">
                  {svc}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {["PostgreSQL", "Redis", "Kafka"].map((db) => (
                <div key={db} className="px-3 py-1.5 border border-purple-300 rounded bg-purple-50 text-[9px] font-mono text-purple-800">
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

export default function ManuscriptRenderer({
  elements,
  userEvidence = [],
}: {
  elements: ManuscriptElement[]
  userEvidence?: { id: string; text: string; criterionId: number }[]
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {elements.map((el, i) => {
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
            if (matches.length > 0) {
              const segments = splitByEvidence(el.text, matches)
              return (
                <p key={i} className="text-lg leading-[1.8] text-foreground/90 p-2 -m-2 rounded transition-colors font-serif">
                  {segments.map((seg, j) =>
                    seg.evidence ? (
                      <UserHighlightedSpan key={j} text={seg.text} criterionId={seg.evidence.criterionId} id={`evidence-${seg.evidence.id}`} />
                    ) : (
                      <span key={j}>{seg.text}</span>
                    )
                  )}
                </p>
              )
            }
            return el.highlight ? (
              <p key={i} className="text-lg leading-[1.8] text-foreground/90 p-2 -m-2 rounded transition-colors">
                <HighlightedSpan text={el.text} criterionId={el.highlight.criterionId} confidence={el.highlight.confidence} />
              </p>
            ) : (
              <p key={i} className="text-lg leading-[1.8] text-foreground/90">
                {el.text}
              </p>
            )
          }

          case "code":
            return (
              <div key={i} className="my-4 rounded-lg overflow-hidden border border-border/40">
                <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{el.language}</span>
                  <span className="text-[9px] text-slate-500 font-mono">source</span>
                </div>
                <pre className="p-4 bg-slate-900 overflow-x-auto">
                  <code className="text-sm text-green-400 font-mono leading-relaxed whitespace-pre">{el.code}</code>
                </pre>
              </div>
            )

          case "table":
            return (
              <div key={i} className="my-6 overflow-hidden border border-border/50 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/50">
                        {el.headers.map((h, hi) => (
                          <th key={hi} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {el.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-4 py-2 text-xs text-foreground/80">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {el.caption && (
                  <div className="px-4 py-2 bg-muted/20 border-t border-border/30">
                    <span className="text-[9px] font-bold text-muted-foreground italic">{el.caption}</span>
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
                  <p className="mt-2 text-[11px] font-bold text-muted-foreground/60 not-italic">
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
