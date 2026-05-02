import { ArrowRight, Users, AlertTriangle, ShieldAlert } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatNumber } from "@/components/ui/stat-number";
import { GradeDistributionBars } from "./grade-distribution-bars";
import type { AssignmentSummary } from "./utils";

interface Props {
  summary: AssignmentSummary;
  reEvalCount: number;
  onSelect: () => void;
}

export function CourseOverviewCard({ summary, reEvalCount, onSelect }: Props) {
  const isReleased = !!summary.releasedAt;

  return (
    <Card className="bg-card border-border flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">
            {summary.title}
          </CardTitle>
          <CardAction>
            <StatusBadge status={isReleased ? "complete" : "not-started"}>
              {isReleased ? "Released" : "Not released"}
            </StatusBadge>
          </CardAction>
        </div>
        <CardDescription className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          {summary.studentCount} student{summary.studentCount !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        <div className="flex items-baseline gap-2">
          <StatNumber value={summary.classAvgPct} suffix="%" />
          <span className="text-xs text-muted-foreground">class average</span>
        </div>

        <GradeDistributionBars
          counts={summary.distribution}
          totalStudents={summary.studentCount}
          mini
        />

        <div className="flex flex-wrap gap-2">
          {summary.atRiskCount > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <AlertTriangle className="size-3 text-[color:var(--status-warning)]" />
              {summary.atRiskCount} at risk
            </Badge>
          )}
          {summary.suspiciousCount > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <ShieldAlert className="size-3 text-[color:var(--status-error)]" />
              {summary.suspiciousCount} integrity flag
              {summary.suspiciousCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {reEvalCount > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              {reEvalCount} re-eval pending
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="ghost" className="w-full justify-between" onClick={onSelect}>
          View Details
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
