"use client"

import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Rocket, 
  Copy, 
  Mail, 
  Database, 
  ArrowRight, 
  CheckCircle,
  Users,
  LayoutDashboard,
  Monitor,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import { useState } from "react"

export function LaunchLaunchpad() {
  const { assignment, reset } = usePreEvalStore()
  const [copied, setCopied] = useState(false)

  const shareLink = `https://edu.univ.edu/eval/${assignment.title?.toLowerCase().replace(/\s+/g, '-') || 'assignment'}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto py-20 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Success Banner - Reimagined */}
      <div className="text-center space-y-6">
        <div className="relative inline-flex mb-4">
          <div className="h-32 w-32 rounded-xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:scale-150 transition-transform duration-1000" />
            <Monitor className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-4 right-4 h-8 w-8 rounded-xl bg-[color:var(--status-success)] flex items-center justify-center border-4 border-background shadow-lg">
              <CheckCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            {/* Sparkles Decoration */}
            <Sparkles className="absolute top-4 right-4 h-4 w-4 text-primary/40 animate-pulse" />
          </div>
          {/* Orbital rings decoration */}
          <div className="absolute inset-0 border border-primary/10 rounded-full -m-4 animate-[spin_10s_linear_infinite] pointer-events-none" />
          <div className="absolute inset-0 border border-primary/5 rounded-full -m-8 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight secondary-text">Your digital desk is ready</h1>
          <p className="text-muted-foreground font-semibold text-base opacity-70">Setting up grading patterns... Success! Your students can now submit their work.</p>
        </div>
      </div>

      <Card className="border-2 border-border/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 bg-background/50 backdrop-blur-xl">
        <CardContent className="p-10 space-y-10">
          {/* Shareable Link Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-muted-foreground opacity-50">Student submission link</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-[color:var(--status-success)]" />
                <span className="eyebrow text-[color:var(--status-success)]/60">Protocol P1 Verified</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Input 
                readOnly 
                value={shareLink} 
                className="h-14 bg-muted/20 border-2 border-border/40 rounded-xl font-semibold text-sm px-6 focus-visible:ring-primary/10 tracking-tight"
              />
              <Button
                variant="outline"
                size="icon-lg"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCircle className="h-6 w-6 text-[color:var(--status-success)]" /> : <Copy className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <p className="eyebrow text-muted-foreground opacity-50">Workflows</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-3 p-6 group text-left whitespace-normal"
              >
                <div className="h-10 w-10 rounded-xl bg-[color:var(--status-info)]/10 flex items-center justify-center border border-[color:var(--status-info)]/10 mb-1">
                  <Database className="h-5 w-5 text-[color:var(--status-info)] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold block">Sync LMS</span>
                  <span className="text-xs text-muted-foreground/60 leading-none">Connect to Canvas/Moodle</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-3 p-6 group text-left whitespace-normal"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10 mb-1">
                  <Mail className="h-5 w-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold block">Dept briefing</span>
                  <span className="text-xs text-muted-foreground/60 leading-none">Share blueprint with faculty</span>
                </div>
              </Button>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Open grading desk
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Utility */}
      <div className="flex justify-center pt-4">
        <Button
          variant="link"
          className="group"
          onClick={reset}
        >
          <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 transition-all">
            <LayoutDashboard className="h-3.5 w-3.5" />
          </div>
          Return to course dashboard
        </Button>
      </div>
    </div>
  )
}
