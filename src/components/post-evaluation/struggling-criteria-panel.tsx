"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { statusStyles } from "@/lib/design-tokens";
import type { StrugglingCriterion } from "./utils";

interface Props {
  criteria: StrugglingCriterion[];
  assignmentId: string;
  studentCount: number;
}

export function StrugglingCriteriaPanel({
  criteria,
  assignmentId,
  studentCount,
}: Props) {
  const router = useRouter();

  if (!criteria.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {criteria.map((c) => {
        const isCritical = c.criticalFraction > 0.4;
        const style = isCritical ? statusStyles.error : statusStyles.warning;

        return (
          <Card
            key={c.cid}
            className={cn(
              "border-l-4 bg-card",
              isCritical
                ? "border-l-[color:var(--status-error)]"
                : "border-l-[color:var(--status-warning)]"
            )}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    style.text
                  )}
                >
                  {isCritical ? "Critical" : "Needs Review"}
                </span>
                <span className={cn("size-2 rounded-full", style.dot)} />
              </div>

              <h4 className="text-sm font-semibold text-foreground leading-snug">
                {c.name}
              </h4>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {isCritical
                  ? `${c.below50Count} of ${studentCount} students scored below 50%.`
                  : `${c.below60Count} of ${studentCount} students scored below 60%.`}
              </p>

              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full", style.bg)}
                  style={{
                    width: `${Math.round((c.below60Count / studentCount) * 100)}%`,
                  }}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                onClick={() =>
                  router.push(
                    `/dashboard/pre-evaluation?assignment=${assignmentId}`
                  )
                }
              >
                Refine rubric
                <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
