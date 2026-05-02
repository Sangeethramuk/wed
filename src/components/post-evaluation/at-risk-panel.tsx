"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, FileText, RefreshCcw, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { WorkflowStatusKey } from "@/lib/design-tokens";
import type { AtRiskStudent } from "./utils";
import type { IntegrityStatus } from "@/lib/store/grading-store";

function integrityToWorkflow(status: IntegrityStatus): WorkflowStatusKey {
  if (status === "clean") return "complete";
  if (status === "suspicious") return "in-progress";
  return "overdue";
}

function integrityLabel(status: IntegrityStatus) {
  if (status === "clean") return "Clean";
  if (status === "suspicious") return "Suspicious";
  return "Flagged";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  students: AtRiskStudent[];
  assignmentId: string;
}

export function AtRiskPanel({ students, assignmentId }: Props) {
  const router = useRouter();

  if (!students.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No students at risk for this assignment.
      </p>
    );
  }

  return (
    <ScrollArea className="max-h-[600px]">
      <div className="space-y-3 pr-2">
        {students.map(({ student, scorePct, failedCriteria }) => {
          const isLowScore = scorePct < 50;
          const hasIntegrityFlag = student.status !== "clean";

          return (
            <Card key={student.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold shrink-0">
                    {getInitials(student.name)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.roll}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            isLowScore
                              ? "text-[color:var(--status-error)]"
                              : "text-foreground"
                          )}
                        >
                          {scorePct}%
                        </span>
                        {hasIntegrityFlag && (
                          <StatusBadge status={integrityToWorkflow(student.status)}>
                            {integrityLabel(student.status)}
                          </StatusBadge>
                        )}
                      </div>
                    </div>

                    {failedCriteria.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {failedCriteria.map((c) => (
                          <Badge key={c.id} variant="outline" className="text-xs">
                            {c.name}: {c.level}/5
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/evaluation/${assignmentId}/grading?student=${student.id}`
                          )
                        }
                      >
                        <FileText />
                        View Submission
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/re-evaluation/${student.id}`)
                        }
                      >
                        <RefreshCcw />
                        Re-evaluate
                      </Button>
                      <Button variant="ghost" size="sm">
                        <StickyNote />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            router.push(`/dashboard/evaluation/${assignmentId}/grading`)
          }
        >
          View full cohort
          <ArrowRight />
        </Button>
      </div>
    </ScrollArea>
  );
}
