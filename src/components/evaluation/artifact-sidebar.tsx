"use client"

import { useState } from "react"
import { type StudentArtifact, type ArtifactType } from "@/lib/manuscript-generator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Presentation,
  Video,
  ExternalLink,
  Code2,
  Image,
  ChevronRight,
  ChevronLeft,
  Play,
  Globe,
  Monitor,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const ARTIFACT_ICONS: Record<ArtifactType, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  pptx: Presentation,
  video: Video,
  link: ExternalLink,
  code: Code2,
  image: Image,
}

const ARTIFACT_COLORS: Record<ArtifactType, string> = {
  pdf: "text-red-500",
  docx: "text-blue-500",
  pptx: "text-orange-500",
  video: "text-purple-500",
  link: "text-cyan-500",
  code: "text-green-500",
  image: "text-pink-500",
}

const ARTIFACT_BG: Record<ArtifactType, string> = {
  pdf: "bg-red-50",
  docx: "bg-blue-50",
  pptx: "bg-orange-50",
  video: "bg-purple-50",
  link: "bg-cyan-50",
  code: "bg-green-50",
  image: "bg-pink-50",
}

function ArtifactPreviewDialog({
  artifact,
  open,
  onOpenChange,
}: {
  artifact: StudentArtifact | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!artifact) return null

  const Icon = ARTIFACT_ICONS[artifact.type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-sm">
            <div className={`h-8 w-8 rounded-md ${ARTIFACT_BG[artifact.type]} flex items-center justify-center`}>
              <Icon className={`h-4 w-4 ${ARTIFACT_COLORS[artifact.type]}`} />
            </div>
            <div>
              <div className="font-bold text-foreground">{artifact.name}</div>
              <div className="eyebrow text-muted-foreground">
                {artifact.type.toUpperCase()} {artifact.size && `• ${artifact.size}`}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {artifact.type === "video" && (
            <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
                <span className="eyebrow text-xs text-white/50">Video Preview</span>
                <span className="text-sm font-mono text-white/70">{artifact.size}</span>
              </div>
            </div>
          )}

          {artifact.type === "link" && (
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  {artifact.name.toLowerCase().includes("github") ? (
                    <Globe className="h-5 w-5 text-foreground" />
                  ) : (
                    <Monitor className="h-5 w-5 text-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{artifact.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {artifact.name.toLowerCase().includes("github")
                      ? "github.com/student-repo"
                      : artifact.name.toLowerCase().includes("deployed")
                      ? "app.example.com/student-project"
                      : "docs.example.com"}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-md">
                <p className="text-xs text-muted-foreground italic">{artifact.previewContent}</p>
              </div>
            </div>
          )}

          {artifact.type === "code" && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono ml-2">{artifact.name}</span>
              </div>
              <div className="p-6 bg-slate-900 min-h-[200px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Code2 className="h-8 w-8 text-green-400/50 mx-auto" />
                  <p className="text-xs text-slate-400">{artifact.previewContent}</p>
                </div>
              </div>
            </div>
          )}

          {(artifact.type === "pptx") && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[16/9] bg-muted/40 border border-border/50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Presentation className="h-4 w-4 text-muted-foreground/40 mx-auto mb-1" />
                      <span className="text-[9px] text-muted-foreground/40">Slide {i + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic text-center">{artifact.previewContent}</p>
            </div>
          )}

          {artifact.type === "image" && (
            <div className="border border-border rounded-lg p-6 flex items-center justify-center min-h-[300px] bg-muted/20">
              <div className="text-center space-y-3">
                <Image className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="text-xs text-muted-foreground italic">{artifact.previewContent}</p>
              </div>
            </div>
          )}

          {(artifact.type === "pdf" || artifact.type === "docx") && (
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="aspect-[3/4] bg-white shadow-inner rounded-md border border-border/30 p-8 max-h-[400px] overflow-hidden">
                <div className="space-y-3">
                  <div className="h-4 bg-muted/40 rounded w-3/4" />
                  <div className="h-3 bg-muted/30 rounded w-full" />
                  <div className="h-3 bg-muted/30 rounded w-5/6" />
                  <div className="h-3 bg-muted/30 rounded w-full" />
                  <div className="h-3 bg-muted/20 rounded w-2/3" />
                  <div className="h-8" />
                  <div className="h-3 bg-muted/30 rounded w-full" />
                  <div className="h-3 bg-muted/30 rounded w-4/5" />
                  <div className="h-3 bg-muted/20 rounded w-full" />
                  <div className="h-3 bg-muted/30 rounded w-3/4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic text-center">{artifact.previewContent}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ArtifactSidebar({
  artifacts,
  onArtifactClick,
}: {
  artifacts: StudentArtifact[]
  onArtifactClick?: (artifact: StudentArtifact) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [previewArtifact, setPreviewArtifact] = useState<StudentArtifact | null>(null)

  const primaryArtifact = artifacts.find((a) => a.isPrimary)
  const secondaryArtifacts = artifacts.filter((a) => !a.isPrimary)
  const totalCount = artifacts.length

  const handleClick = (artifact: StudentArtifact) => {
    if (artifact.isPrimary) return
    if (onArtifactClick) {
      onArtifactClick(artifact)
    } else {
      setPreviewArtifact(artifact)
    }
  }

  return (
    <>
      <div
        className={`shrink-0 border-r border-border bg-background transition-all duration-300 ease-in-out flex flex-col ${
          expanded ? "w-52" : "w-11"
        }`}
      >
        <div className="p-2 border-b border-border flex items-center justify-between">
          {expanded ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="eyebrow text-muted-foreground truncate">
                {totalCount} Artifact{totalCount !== 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <Badge
              variant="outline"
              className="h-5 w-5 p-0 flex items-center justify-center text-[9px] font-black rounded-full mx-auto"
            >
              {totalCount}
            </Badge>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            {expanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className={`p-1.5 space-y-1 ${expanded ? "" : "flex flex-col items-center"}`}>
            {artifacts.map((artifact) => {
              const Icon = ARTIFACT_ICONS[artifact.type]
              const color = ARTIFACT_COLORS[artifact.type]
              const bg = ARTIFACT_BG[artifact.type]

              return (
                <button
                  key={artifact.id}
                  onClick={() => handleClick(artifact)}
                  disabled={artifact.isPrimary}
                  className={`w-full rounded-md transition-colors ${
                    expanded
                      ? `flex items-center gap-2.5 p-2 text-left ${
                          artifact.isPrimary
                            ? "bg-primary/5 border border-primary/10"
                            : "hover:bg-muted/50 cursor-pointer"
                        }`
                      : `flex items-center justify-center p-2 ${
                          artifact.isPrimary
                            ? "bg-primary/5 border border-primary/10"
                            : "hover:bg-muted/50 cursor-pointer"
                        }`
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded flex items-center justify-center shrink-0 ${bg}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  {expanded && (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-foreground truncate">
                          {artifact.name}
                        </span>
                        {artifact.isPrimary && (
                          <Badge className="h-4 px-1 rounded text-[8px] font-black bg-primary text-primary-foreground shrink-0">
                            PRIMARY
                          </Badge>
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground">
                        {artifact.type.toUpperCase()}
                        {artifact.size ? ` • ${artifact.size}` : ""}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      <ArtifactPreviewDialog
        artifact={previewArtifact}
        open={!!previewArtifact}
        onOpenChange={(open) => {
          if (!open) setPreviewArtifact(null)
        }}
      />
    </>
  )
}
