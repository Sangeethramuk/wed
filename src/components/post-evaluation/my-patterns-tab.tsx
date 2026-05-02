"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Edit3,
  EyeOff,
  FileText,
  Inbox,
  Lightbulb,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { statusStyles } from "@/lib/design-tokens";
import type {
  PatternStats,
  OverridePattern,
  TierDistribution,
  CalibrationDeltaRow,
  RegenerationHotspot,
  IntegrityProfile,
  ScoreSpread,
  GradingSpeedStats,
} from "./utils";

export interface MyPatternsProps {
  stats: PatternStats;
  overridePatterns: OverridePattern[];
  tierDistributions: TierDistribution[];
  calibrationDeltas: CalibrationDeltaRow[];
  regenerationHotspots: RegenerationHotspot[];
  integrityProfiles: IntegrityProfile[];
  scoreSpreads: ScoreSpread[];
  gradingSpeed: GradingSpeedStats | null;
}

type ChecklistItem = {
  label: string;
  detail: string;
};

type RubricClarityRow = {
  name: string;
  course: string;
  status: "clear" | "examples" | "anchors";
  reason: string;
};

function SectionEmpty({ label }: { label: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>{label}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

function openPreEvaluation() {
  window.location.href = "/dashboard/pre-evaluation";
}

function confidenceLabel(count: number) {
  if (count >= 40) return "Strong signal";
  if (count >= 12) return "Good signal";
  if (count > 0) return "Early signal";
  return "Not enough data";
}

function clarityLabel(status: RubricClarityRow["status"]) {
  if (status === "clear") return "Clear";
  if (status === "examples") return "May need examples";
  return "Needs score anchors";
}

function clarityStyle(status: RubricClarityRow["status"]) {
  if (status === "clear") return statusStyles.success;
  if (status === "examples") return statusStyles.warning;
  return statusStyles.error;
}

function SectionIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">
        {label}
      </p>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
        {description}
      </p>
    </div>
  );
}

export function MyPatternsTab({
  stats,
  overridePatterns,
  tierDistributions,
  calibrationDeltas,
  regenerationHotspots,
  integrityProfiles,
  scoreSpreads,
  gradingSpeed,
}: MyPatternsProps) {
  const [showTiming, setShowTiming] = useState(false);
  const [privateNote, setPrivateNote] = useState("");
  const [completedChecklist, setCompletedChecklist] = useState<string[]>([]);

  const { avgScorePerCourse, mostEditedCriteria, approvalRate } = stats;
  const courseCount = avgScorePerCourse.length;
  const portfolioAvg =
    courseCount > 0
      ? Math.round(
          avgScorePerCourse.reduce((sum, course) => sum + course.avg, 0) /
            courseCount
        )
      : 0;
  const maxAvg = Math.max(...avgScorePerCourse.map((course) => course.avg), 1);
  const reviewCount =
    gradingSpeed?.completedCount ??
    integrityProfiles.reduce((sum, profile) => sum + profile.total, 0);
  const feedbackCount = tierDistributions.reduce(
    (sum, distribution) => sum + distribution.total,
    0
  );
  const scoreCount = scoreSpreads.reduce(
    (sum, spread) => sum + spread.totalCriterionScores,
    0
  );
  const flaggedCourses = integrityProfiles.filter(
    (profile) => profile.suspicious + profile.manipulated > 0
  );
  const lowCourses = avgScorePerCourse
    .filter((course) => course.avg < 60)
    .sort((a, b) => a.avg - b.avg);

  const rubricRows: RubricClarityRow[] = [
    ...mostEditedCriteria.slice(0, 3).map((criterion) => ({
      name: criterion.name,
      course: criterion.course,
      status: "examples" as const,
      reason: `${criterion.editedCount} AI suggestions were edited here.`,
    })),
    ...overridePatterns.slice(0, 3).map((pattern) => ({
      name: pattern.criterionName,
      course: pattern.course,
      status:
        pattern.overridePct >= 35 ? ("anchors" as const) : ("examples" as const),
      reason: `${pattern.overridePct}% of scores were adjusted from the first suggestion.`,
    })),
    ...calibrationDeltas.slice(0, 2).map((delta) => ({
      name: delta.criterionName,
      course: delta.course,
      status: delta.avgDelta >= 3 ? ("anchors" as const) : ("examples" as const),
      reason: `Calibration differed by ${delta.avgDelta} levels on average.`,
    })),
  ]
    .filter(
      (row, index, rows) =>
        rows.findIndex(
          (item) => item.name === row.name && item.course === row.course
        ) === index
    )
    .slice(0, 5);

  const clearRows =
    rubricRows.length === 0 && approvalRate > 0
      ? [
          {
            name: "Overall rubric",
            course: "Current graded set",
            status: "clear" as const,
            reason: "AI suggestions mostly matched your final review.",
          },
        ]
      : rubricRows;

  const topRubricItem = clearRows.find((row) => row.status !== "clear");
  const checklist: ChecklistItem[] = [
    topRubricItem
      ? {
          label: `Clarify ${topRubricItem.name}`,
          detail: `Add one sample answer or score anchor for ${topRubricItem.course}.`,
        }
      : {
          label: "Keep the current rubric structure",
          detail: "No major rubric clarification need stood out in this set.",
        },
    regenerationHotspots[0]
      ? {
          label: `Add a feedback example for ${regenerationHotspots[0].criterionName}`,
          detail: "This may reduce extra feedback draft attempts next time.",
        }
      : {
          label: "Reuse feedback guidance that worked",
          detail: "No repeated feedback draft issue stood out.",
        },
    lowCourses[0]
      ? {
          label: `Plan support for ${lowCourses[0].title}`,
          detail: `The class average is ${lowCourses[0].avg}%, so a short follow-up may help.`,
        }
      : {
          label: "Pick one topic for reinforcement",
          detail: "Choose the area students asked about most in class.",
        },
    flaggedCourses[0]
      ? {
          label: `Review flagged cases in ${flaggedCourses[0].course}`,
          detail: "Integrity context can explain why some papers needed closer review.",
        }
      : {
          label: "No integrity follow-up needed",
          detail: "No unusual integrity pattern stood out in this view.",
        },
  ];

  const evidenceExamples = clearRows.slice(0, 3).map((row, index) => ({
    title: row.name,
    course: row.course,
    example:
      row.status === "clear"
        ? "Most reviewed suggestions were accepted with minor or no changes."
        : index === 0
          ? "Several scores were adjusted after you checked the evidence against the rubric."
          : "Feedback wording needed review more than once before it matched your expectations.",
  }));

  const teachingReflection =
    lowCourses.length > 0 && clearRows.some((row) => row.status === "clear")
      ? "Students may need reteaching or extra practice more than rubric changes."
      : topRubricItem
        ? "The next improvement is likely rubric clarity: examples, score anchors, or calibration samples."
        : "The current pattern looks stable. Use the next cycle to preserve what worked.";

  const outcomeRows = avgScorePerCourse.slice(0, 4).map((course, index) => ({
    label: `CO${index + 1}`,
    course: course.title,
    pct: course.avg,
    action:
      course.avg >= 70
        ? "Keep current teaching approach"
        : course.avg >= 50
          ? "Add one practice example"
          : "Plan a short reteaching activity",
  }));

  const supportSuggestions = [
    lowCourses[0]
      ? `Share a model answer or practice set for ${lowCourses[0].title}.`
      : "Share one strong sample answer with the class.",
    flaggedCourses[0]
      ? `Privately review integrity-flagged submissions in ${flaggedCourses[0].course}.`
      : "No integrity-specific student support is needed from this view.",
    "Use office hours or a short recap for the criterion with the most scoring changes.",
  ];

  const rubricDraft = topRubricItem
    ? {
        title: topRubricItem.name,
        course: topRubricItem.course,
        draft: `Clarify what counts as strong, acceptable, and incomplete work for ${topRubricItem.name}. Add one example response and one common mistake so scoring is easier to apply consistently.`,
      }
    : {
        title: "Current rubric",
        course: "Current graded set",
        draft:
          "Keep the current rubric language, and add one example of strong work so future calibration stays quick.",
      };

  function toggleChecklist(label: string) {
    setCompletedChecklist((items) =>
      items.includes(label)
        ? items.filter((item) => item !== label)
        : [...items, label]
    );
  }

  return (
    <div className="w-full space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="space-y-4">
        <Card className="bg-card border-border">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--status-info)]">
                <EyeOff className="size-4" />
                Private grading reflection
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                A simple look at how your grading went
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These patterns are for your own review. They highlight where the
                rubric was clear, where you adjusted AI suggestions, and what may
                be worth refining before the next assignment.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="w-fit gap-1.5">
                <ShieldCheck className="size-3.5 text-[color:var(--status-success)]" />
                Only visible to you
              </Badge>
              <Badge variant="outline" className="w-fit">
                {confidenceLabel(scoreCount)}
              </Badge>
            </div>
          </div>
        </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "AI suggestions accepted",
              value: `${approvalRate}%`,
              helper: `Based on ${feedbackCount || "available"} feedback checks`,
              icon: CheckCircle2,
            },
            {
              label: "Courses reviewed",
              value: courseCount,
              helper: "In this insight set",
              icon: Inbox,
            },
            {
              label: "Average class score",
              value: `${portfolioAvg}%`,
              helper: "Across visible courses",
              icon: SlidersHorizontal,
            },
            {
              label: showTiming ? "Average review time" : "Completed reviews",
              value:
                showTiming && gradingSpeed
                  ? `${gradingSpeed.avgMinutes}m`
                  : reviewCount || "--",
              helper: showTiming
                ? "Timing is visible only here"
                : "Timing insights hidden",
              icon: Clock,
            },
          ].map((item) => (
            <Card key={item.label} className="bg-card border-border">
              <CardContent className="p-5 space-y-4">
                <div className="size-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground tabular-nums">
                    {item.value}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.helper}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionIntro
          label="Step 1"
          title="Start with the next actions"
          description="These are the few things that would most improve the next grading cycle. You can mark them off as you decide what to carry forward."
        />
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>Before your next assignment</CardTitle>
              <Badge variant="outline">
                {completedChecklist.length}/{checklist.length} done
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {checklist.map((item) => {
              const done = completedChecklist.includes(item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => toggleChecklist(item.label)}
                  className={cn(
                    "text-left rounded-lg border p-4 transition-colors h-full",
                    done
                      ? "border-[color:var(--status-success)] bg-[color:var(--status-success-bg)]"
                      : "border-border bg-background hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 items-center justify-center rounded-full border shrink-0",
                        done
                          ? "border-[color:var(--status-success)] text-[color:var(--status-success)]"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {done && <CheckCircle2 className="size-3.5" />}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {item.detail}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionIntro
          label="Step 2"
          title="Understand the rubric signals"
          description="This section separates rubric clarity from examples behind the insight, so the professor can see why a recommendation appears."
        />
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Rubric clarity by criterion</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clearRows.length === 0 ? (
                <SectionEmpty label="No rubric patterns yet" />
              ) : (
                clearRows.map((row) => {
                  const style = clarityStyle(row.status);
                  return (
                    <div
                      key={`${row.course}-${row.name}-${row.reason}`}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {row.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {row.course}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {row.reason}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn("shrink-0", style.text)}>
                          {clarityLabel(row.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Examples behind the insight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evidenceExamples.length === 0 ? (
                <SectionEmpty label="No examples available yet" />
              ) : (
                evidenceExamples.map((item) => (
                  <div
                    key={`${item.course}-${item.title}`}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.course}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {item.example}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <SectionIntro
          label="Step 3"
          title="Decide what to change"
          description="A low score does not always mean the rubric is unclear. This section helps separate teaching follow-up from rubric refinement."
        />
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Teaching or rubric signal?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="size-5 text-[color:var(--status-warning)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {teachingReflection}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Low student scores with few grading changes often point to
                      teaching follow-up. Frequent grading changes usually point
                      to rubric examples or score anchors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    Rubric signal
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {clearRows.filter((row) => row.status !== "clear").length}{" "}
                    criteria may need examples or anchors.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    Teaching signal
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lowCourses.length || 0} courses are below a 60% average.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Rubric improvement draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 text-[color:var(--status-info)] mt-0.5" />
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {rubricDraft.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rubricDraft.course}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rubricDraft.draft}
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-between" onClick={openPreEvaluation}>
                Use this in assignment setup
                <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <SectionIntro
          label="Step 4"
          title="Plan student support"
          description="Use course outcomes and class-level patterns to decide what students may need next."
        />
        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Course outcome follow-up</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outcomeRows.map((row) => (
                <div key={`${row.label}-${row.course}`} className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline">{row.label}</Badge>
                      <p className="text-sm font-medium text-foreground truncate">
                        {row.course}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {row.pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        row.pct >= 70
                          ? statusStyles.success.bg
                          : row.pct >= 50
                            ? statusStyles.warning.bg
                            : statusStyles.error.bg
                      )}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{row.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Student support suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supportSuggestions.map((suggestion) => (
                <div key={suggestion} className="rounded-lg border border-border p-4">
                  <div className="flex items-start gap-3">
                    <Users className="size-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <SectionIntro
          label="Step 5"
          title="Keep a personal record"
          description="These controls stay intentionally quiet. Timing is optional, and the note is a private reminder for the next cycle."
        />
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Course patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {avgScorePerCourse.map((course) => (
                <div key={course.title} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {course.title}
                    </p>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {course.avg}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", statusStyles.info.bg)}
                      style={{ width: `${(course.avg / maxAvg) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              {scoreCount > 0 && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                  Based on {scoreCount} criterion scores across the current
                  graded submissions.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Private note to self</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={privateNote}
                  onChange={(event) => setPrivateNote(event.target.value)}
                  placeholder="Example: Next time, add a sample answer for the analysis criterion."
                  className="min-h-32"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This note stays on this screen for now. It can later be carried
                  into assignment setup as a persisted professor note.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Insight settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Show review time insights
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Time patterns are optional because they can feel
                        sensitive. They are shown only in this private tab.
                      </p>
                    </div>
                    <Button
                      variant={showTiming ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowTiming((value) => !value)}
                    >
                      {showTiming ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-start gap-3">
                    <Target className="size-5 text-[color:var(--status-info)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Insight confidence
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {confidenceLabel(scoreCount)} based on {scoreCount}
                        criterion scores and {feedbackCount} reviewed feedback
                        items.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Card className="bg-card border-border">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <BookOpenCheck className="size-5 text-[color:var(--status-warning)] mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Suggested next step
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Review the checklist items, then open assignment setup to add
                  one clearer example or score anchor before your next grading
                  cycle.
                </p>
              </div>
            </div>
            <Button className="md:w-auto w-full" onClick={openPreEvaluation}>
              Open assignment setup
              <ArrowRight />
            </Button>
          </div>
        </CardContent>
      </Card>

      {privateNote && (
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <MessageSquareText className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Your note for next time
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {privateNote}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
