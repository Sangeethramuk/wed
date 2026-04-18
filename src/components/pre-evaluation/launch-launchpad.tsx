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
 <div className="h-32 w-32 rounded-3xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:scale-150 transition-transform duration-1000" />
 <Monitor className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-500" />
 <div className="absolute bottom-4 right-4 h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center border-4 border-background shadow-lg">
 <CheckCircle className="h-4 w-4 text-white" />
 </div>
 {/* Sparkles Decoration */}
 <Sparkles className="absolute top-4 right-4 h-4 w-4 text-primary/40 animate-pulse" />
 </div>
 {/* Orbital rings decoration */}
 <div className="absolute inset-0 border border-primary/10 rounded-full -m-4 animate-[spin_10s_linear_infinite] pointer-events-none" />
 <div className="absolute inset-0 border border-primary/5 rounded-full -m-8 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
 </div>

 <div className="space-y-2">
 <h1 className="text-4xl font-medium tracking-tight secondary-text ">Your digital desk is ready</h1>
 <p className="text-muted-foreground font-semibold text-base opacity-70">Setting up grading patterns... Success! Your students can now submit their work.</p>
 </div>
 </div>

 <Card className="border-2 border-border/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 bg-background/50 backdrop-blur-xl">
 <CardContent className="p-10 space-y-10">
 {/* Shareable Link Area */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground opacity-50">Student submission link</p>
 <div className="flex items-center gap-2">
 <ShieldCheck className="h-3 w-3 text-emerald-500" />
 <span className="text-xs font-medium text-emerald-600/60 tracking-widest">Protocol P1 Verified</span>
 </div>
 </div>
 <div className="flex gap-3">
 <Input 
 readOnly 
 value={shareLink} 
 className="h-14 bg-muted/20 border-2 border-border/40 rounded-2xl font-medium text-sm px-6 focus-visible:ring-primary/10 tracking-tight"
 />
 <Button 
 variant="secondary" 
 className="h-14 w-14 rounded-2xl border-2 border-border/30 bg-background hover:bg-primary/5 hover:text-primary transition-all active:scale-90 shadow-sm"
 onClick={copyToClipboard}
 >
 {copied ? <CheckCircle className="h-6 w-6 text-emerald-500" /> : <Copy className="h-6 w-6" />}
 </Button>
 </div>
 </div>

 <div className="space-y-6">
 <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground opacity-50">Workflows</p>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Button 
 variant="outline" 
 className="h-auto p-6 flex flex-col items-start gap-3 rounded-2xl border-2 border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group text-left"
 >
 <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 mb-1">
 <Database className="h-5 w-5 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
 </div>
 <div className="space-y-1">
 <span className="text-xs font-medium tracking-widest block">Sync LMS</span>
 <span className="text-xs font-bold text-muted-foreground opacity-40 leading-none">Connect to Canvas/Moodle</span>
 </div>
 </Button>

 <Button 
 variant="outline" 
 className="h-auto p-6 flex flex-col items-start gap-3 rounded-2xl border-2 border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group text-left"
 >
 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10 mb-1">
 <Mail className="h-5 w-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
 </div>
 <div className="space-y-1">
 <span className="text-xs font-medium tracking-widest block">Dept Briefing</span>
 <span className="text-xs font-bold text-muted-foreground opacity-40 leading-none">Share blueprint with faculty</span>
 </div>
 </Button>
 </div>

 <Button 
 className="h-14 w-full rounded-xl bg-primary text-white font-medium text-lg tracking-tight gap-4 shadow-none active:scale-95 transition-all hover:bg-primary/90"
 onClick={() => (window.location.href = "/dashboard")}
 >
 Open Grading Desk
 <ArrowRight className="h-5 w-5" />
 </Button>
 </div>
 </CardContent>
 </Card>

 {/* Footer Utility */}
 <div className="flex justify-center pt-4">
 <button 
 className="group flex items-center gap-3 text-xs font-medium tracking-widest text-muted-foreground/30 hover:text-primary transition-all"
 onClick={reset}
 >
 <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 transition-all">
 <LayoutDashboard className="h-3.5 w-3.5" />
 </div>
 Return to course dashboard
 </button>
 </div>
 </div>
 )
}
