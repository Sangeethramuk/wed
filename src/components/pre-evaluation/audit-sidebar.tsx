"use client"

import { usePreEvalStore } from "@/lib/store/pre-evaluation-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { History, ShieldCheck, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AuditSidebar() {
  const { auditLog } = usePreEvalStore()

  const getIcon = (type: string) => {
    switch (type) {
      case "system": return <ShieldCheck className="h-4 w-4 text-[color:var(--status-success)]/40" />
      case "user": return <User className="h-4 w-4 text-primary/40" />
      case "ai": return <Zap className="h-4 w-4 text-[color:var(--status-warning)]/40 fill-current" />
      case "auditor": return <History className="h-4 w-4 text-muted-foreground/70" />
      default: return null
    }
  }

  return (
    <Sheet>
      <SheetTrigger className="eyebrow inline-flex items-center justify-center rounded-lg border border-border/20 bg-background/30 backdrop-blur-sm px-3 h-8 hover:bg-muted/50 gap-2 transition-all active:scale-95 shadow-none">
        <History className="h-3 w-3 opacity-40" />
        Trail
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md border-l border-border/10 p-0 overflow-hidden flex flex-col bg-background shadow-none">
        <SheetHeader className="p-8 border-b border-border/5 bg-muted/[0.01] space-y-4">
          <div className="h-12 w-12 rounded-xl bg-primary/[0.02] flex items-center justify-center text-primary border border-primary/5">
            <History className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-semibold tracking-tight secondary-text">
              Audit
            </SheetTitle>
            <p className="eyebrow font-semibold text-muted-foreground/40 leading-relaxed">
              Faculty activity calibration log.
            </p>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-8 py-8">
          <div className="space-y-8 relative ml-4 border-l border-dashed border-border/10 pl-8">
            {auditLog.map((event) => (
              <div key={event.id} className="relative group/item">
                <div className="absolute -left-[49px] top-0 h-8 w-8 rounded-lg bg-background border border-border/20 flex items-center justify-center transition-all duration-300">
                  {getIcon(event.type)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold tracking-tight text-foreground/60">{event.action}</h4>
                    <span className="eyebrow text-muted-foreground/30 bg-muted/20 px-1.5 py-0.5 rounded border border-border/10">{event.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/50 font-medium leading-relaxed pr-4">{event.details}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`eyebrow text-xs py-0 px-2 border border-border/20 bg-transparent opacity-30 rounded-full h-4`}>
                      {event.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-8 border-t border-border/5 bg-muted/[0.01]">
           <div className="p-4 rounded-xl border border-dashed border-primary/10 bg-primary/[0.01] flex items-start gap-4">
              <ShieldCheck className="h-8 w-8 text-primary opacity-5" />
              <div className="space-y-0.5">
                <p className="eyebrow text-primary/30">
                  Secure Log
                </p>
                <p className="text-xs font-bold text-muted-foreground/30 leading-relaxed">
                  Record #ESU-{Date.now().toString(36).toUpperCase()} locked.
                </p>
              </div>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
