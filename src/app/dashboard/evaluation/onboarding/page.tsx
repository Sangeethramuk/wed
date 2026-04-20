"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShieldCheck, 
  Users, 
  Zap, 
  ArrowRight, 
  ChevronRight,
  EyeOff,
  Scale,
  Activity
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

export default function EvaluationOnboarding() {
  const briefingItems = [
    {
      title: "Anonymized Protocol",
      description: "Student identities are masked during initial triage to ensure impartial and objective assessment metrics.",
      icon: EyeOff,
      color: "bg-blue-500/10 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      points: ["Initial Blind Triage", "Anonymized Metadata", "Reveal for Oversight"]
    },
    {
      title: "Assessment Assistance",
      description: "AI-curated annotations highlight pattern alignment, semantic errors, and rubric deviations.",
      icon: Activity,
      color: "bg-purple-500/10 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      points: ["Annotation Pre-mapping", "Pattern Recognition", "Rubric Alignment"]
    },
    {
      title: "Integrity Verification",
      description: "Academic honesty safeguards are active, scanning for cross-submission anomalies.",
      icon: ShieldCheck,
      color: "bg-amber-500/10 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      points: ["Authorship Analysis", "Correlation Flags", "Protocol P1 Validation"]
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-12 px-4 max-w-6xl mx-auto space-y-12 animate-in fade-in zoom-in duration-700">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <Badge variant="secondary" className="rounded-full px-4 py-1 text-[10px] font-black tracking-[0.2em] uppercase bg-primary/10 text-primary border-primary/20">
          Academic Protocol Active
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Session Briefing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Please review the session safeguards before initiating the evaluation process. 
          Your environment is now configured for <span className="text-foreground">impartial academic assessment.</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {briefingItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-8 h-full flex flex-col space-y-8 hover:shadow-2xl hover:shadow-primary/5 transition-all border-border/50 bg-card/40 backdrop-blur-sm group hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                <item.icon className="h-7 w-7" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic font-medium">
                  "{item.description}"
                </p>
              </div>
              <div className="space-y-2.5 pt-6 border-t border-border/50">
                {item.points.map((point) => (
                  <div key={point} className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    {point}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-8 flex flex-col items-center gap-4 w-full"
      >
        <Link href="/dashboard/evaluation/SWE-PH2" className="w-full max-w-sm">
          <Button size="lg" className="w-full group">
            Initialize Session <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
          Estimated session time: 45-60 minutes
        </p>
      </motion.div>

      <div className="flex items-center gap-8 py-6 px-12 rounded-full border border-border/50 bg-muted/20 backdrop-blur-md text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/60 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Scale className="h-3.5 w-3.5 text-primary/60" /> Neutral Context
        </div>
        <Separator orientation="vertical" className="h-4 bg-border/50" />
        <div className="flex items-center gap-2.5">
          <Users className="h-3.5 w-3.5 text-primary/60" /> Double-Blind
        </div>
        <Separator orientation="vertical" className="h-4 bg-border/50" />
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary/60" /> Protocol P1
        </div>
      </div>
    </div>
  )
}
