"use client";

import { Suspense, useMemo, useState } from "react";
import { useGradingStore } from "@/lib/store/grading-store";
import { useReEvalStore } from "@/lib/store/re-evaluation-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import { CourseOverviewCard } from "@/components/post-evaluation/course-overview-card";
import { GradeDistributionBars } from "@/components/post-evaluation/grade-distribution-bars";
import { COAttainmentTable } from "@/components/post-evaluation/co-attainment-table";
import { GradeReleaseBanner } from "@/components/post-evaluation/grade-release-banner";
import { AtRiskPanel } from "@/components/post-evaluation/at-risk-panel";
import { StrugglingCriteriaPanel } from "@/components/post-evaluation/struggling-criteria-panel";
import { MyPatternsTab } from "@/components/post-evaluation/my-patterns-tab";
import {
  computeAssignmentSummary,
  computeGradeDistribution,
  computeCOAttainment,
  computeAtRiskStudents,
  computeStrugglingCriteria,
  computePatternStats,
  computeOverridePatterns,
  computeFeedbackTierDistribution,
  computeCalibrationDeltas,
  computeRegenerationHotspots,
  computeIntegrityProfiles,
  computeScoreSpreads,
  computeGradingSpeed,
  studentScorePct,
} from "@/components/post-evaluation/utils";

export default function PostEvaluationPage() {
  return (
    <Suspense fallback={null}>
      <ResultInsights />
    </Suspense>
  );
}

function ResultInsights() {
  const { assignments, criterionFeedbacks, calibration, gradingTimestamps } = useGradingStore();
  const { hodPendingIds } = useReEvalStore();

  const [tab, setTab] = useState<"overview" | "patterns">("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allAssignments = useMemo(
    () => Object.values(assignments),
    [assignments]
  );

  const summaries = useMemo(
    () => allAssignments.map(computeAssignmentSummary),
    [allAssignments]
  );

  const patternStats = useMemo(
    () => computePatternStats(assignments, criterionFeedbacks),
    [assignments, criterionFeedbacks]
  );

  const overridePatterns = useMemo(
    () => computeOverridePatterns(assignments),
    [assignments]
  );

  const tierDistributions = useMemo(
    () => computeFeedbackTierDistribution(assignments, criterionFeedbacks),
    [assignments, criterionFeedbacks]
  );

  const calibrationDeltas = useMemo(
    () => computeCalibrationDeltas(assignments, calibration),
    [assignments, calibration]
  );

  const regenerationHotspots = useMemo(
    () => computeRegenerationHotspots(assignments, criterionFeedbacks),
    [assignments, criterionFeedbacks]
  );

  const integrityProfiles = useMemo(
    () => computeIntegrityProfiles(assignments),
    [assignments]
  );

  const scoreSpreads = useMemo(
    () => computeScoreSpreads(assignments),
    [assignments]
  );

  const gradingSpeed = useMemo(
    () => computeGradingSpeed(assignments, gradingTimestamps),
    [assignments, gradingTimestamps]
  );

  // Course detail computed values
  const selectedAssignment = selectedId ? assignments[selectedId] : null;
  const students = selectedAssignment?.students ?? [];

  const distribution = useMemo(
    () => computeGradeDistribution(students),
    [students]
  );
  const coAttainment = useMemo(() => computeCOAttainment(students), [students]);
  const struggling = useMemo(
    () => computeStrugglingCriteria(students),
    [students]
  );
  const atRisk = useMemo(() => computeAtRiskStudents(students), [students]);
  const classAvg = useMemo(() => {
    if (!students.length) return 0;
    return Math.round(
      students.map(studentScorePct).reduce((a, b) => a + b, 0) /
        students.length
    );
  }, [students]);

  function selectCourse(id: string) {
    setSelectedId(id);
  }

  function backToOverview() {
    setSelectedId(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Result Insights
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Post-grading summary across all your courses
            </p>
          </div>
          {hodPendingIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                (window.location.href = "/dashboard/re-evaluation")
              }
            >
              <RefreshCcw />
              Re-evaluation queue
              <Badge variant="outline" className="ml-1">
                {hodPendingIds.length}
              </Badge>
            </Button>
          )}
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as "overview" | "patterns");
            // switching away from overview clears the drill-down
            if (v !== "overview") setSelectedId(null);
          }}
        >
          <TabsList className={cn("mb-4", selectedAssignment && "hidden")}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patterns">My Grading Patterns</TabsTrigger>
          </TabsList>

          {/* ── Overview: grid or course detail ── */}
          <TabsContent value="overview">
            {selectedAssignment ? (
              /* ── Course detail drill-down ── */
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={backToOverview}>
                    <ArrowLeft />
                    All courses
                  </Button>
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedAssignment.title}
                  </h2>
                </div>

                <GradeReleaseBanner
                  assignmentId={selectedAssignment.id}
                  assignmentTitle={selectedAssignment.title}
                  studentCount={students.length}
                  releasedAt={selectedAssignment.releasedAt}
                />

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Students", value: students.length, suffix: "" },
                    { label: "Class average", value: classAvg, suffix: "%" },
                    { label: "Need attention", value: atRisk.length, suffix: "" },
                  ].map((stat) => (
                    <Card key={stat.label} className="bg-card border-border">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-semibold text-foreground tabular-nums">
                          {stat.value}
                          {stat.suffix}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Grade distribution */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Grade distribution</CardTitle>
                    <CardDescription>
                      How grades spread across your class
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GradeDistributionBars
                      counts={distribution}
                      totalStudents={students.length}
                    />
                  </CardContent>
                </Card>

                {/* CO Attainment */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Course outcome attainment</CardTitle>
                    <CardDescription>
                      % of students who attained each course outcome (≥ 3/5
                      threshold). Required for NAAC/NBA reporting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <COAttainmentTable rows={coAttainment} />
                  </CardContent>
                </Card>

                {/* Topics students struggled with */}
                {struggling.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Topics students struggled with
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Criteria where a significant number of students scored
                        below passing
                      </p>
                    </div>
                    <StrugglingCriteriaPanel
                      criteria={struggling}
                      assignmentId={selectedAssignment.id}
                      studentCount={students.length}
                    />
                  </div>
                )}

                {/* Students who need attention */}
                {atRisk.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Students who need attention
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Students scoring below 50% or with integrity flags
                        </p>
                      </div>
                      <Badge variant="outline">{atRisk.length}</Badge>
                    </div>
                    <AtRiskPanel
                      students={atRisk}
                      assignmentId={selectedAssignment.id}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* ── Course grid ── */
              allAssignments.length === 0 ? (
                <Alert variant="info">
                  <AlertTitle>No graded assignments yet</AlertTitle>
                  <AlertDescription>
                    Complete an evaluation to see insights here.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {summaries.map((summary) => (
                    <CourseOverviewCard
                      key={summary.id}
                      summary={summary}
                      reEvalCount={0}
                      onSelect={() => selectCourse(summary.id)}
                    />
                  ))}
                </div>
              )
            )}
          </TabsContent>

          {/* ── My Grading Patterns ── */}
          <TabsContent value="patterns">
            <MyPatternsTab
              stats={patternStats}
              overridePatterns={overridePatterns}
              tierDistributions={tierDistributions}
              calibrationDeltas={calibrationDeltas}
              regenerationHotspots={regenerationHotspots}
              integrityProfiles={integrityProfiles}
              scoreSpreads={scoreSpreads}
              gradingSpeed={gradingSpeed}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
