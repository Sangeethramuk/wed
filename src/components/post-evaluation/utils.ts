import type {
  StudentSubmission,
  AssignmentNarrative,
  CriterionFeedbackState,
  CalibrationData,
} from "@/lib/store/grading-store";

export type GradeBand = "A" | "B" | "C" | "D" | "F";
export type BandCounts = Record<GradeBand, number>;

export function scorePctToBand(pct: number): GradeBand {
  if (pct >= 80) return "A";
  if (pct >= 65) return "B";
  if (pct >= 50) return "C";
  if (pct >= 35) return "D";
  return "F";
}

export function studentScorePct(student: StudentSubmission): number {
  const levels = Object.values(student.criteria).map((c) => c.level);
  if (!levels.length) return 0;
  return Math.round(
    (levels.reduce((a, b) => a + b, 0) / levels.length / 5) * 100
  );
}

export function computeGradeDistribution(
  students: StudentSubmission[]
): BandCounts {
  const counts: BandCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  students.forEach((s) => {
    counts[scorePctToBand(studentScorePct(s))]++;
  });
  return counts;
}

export type COAttainmentRow = {
  co: string;
  criterionId: string;
  criterionName: string;
  attainedPct: number;
  status: "met" | "at-risk" | "not-met";
};

export function computeCOAttainment(
  students: StudentSubmission[]
): COAttainmentRow[] {
  if (!students.length) return [];
  const criterionIds = Object.keys(students[0].criteria);
  return criterionIds.map((cid) => {
    const first = students[0].criteria[cid];
    const passing = students.filter(
      (s) => (s.criteria[cid]?.level ?? 0) >= 3
    ).length;
    const pct = Math.round((passing / students.length) * 100);
    return {
      co: first?.co ?? `CO${criterionIds.indexOf(cid) + 1}`,
      criterionId: cid,
      criterionName: first?.name ?? cid,
      attainedPct: pct,
      status: pct >= 70 ? "met" : pct >= 50 ? "at-risk" : "not-met",
    };
  });
}

export type AtRiskStudent = {
  student: StudentSubmission;
  scorePct: number;
  failedCriteria: Array<{ id: string; name: string; level: number }>;
};

export function computeAtRiskStudents(
  students: StudentSubmission[]
): AtRiskStudent[] {
  return students
    .map((s) => {
      const pct = studentScorePct(s);
      const failedCriteria = Object.entries(s.criteria)
        .filter(([, c]) => c.level < 3)
        .map(([id, c]) => ({ id, name: c.name, level: c.level }));
      return { student: s, scorePct: pct, failedCriteria };
    })
    .filter((r) => r.scorePct < 50 || r.student.status !== "clean")
    .sort((a, b) => a.scorePct - b.scorePct);
}

export type StrugglingCriterion = {
  cid: string;
  name: string;
  below50Count: number;
  below60Count: number;
  criticalFraction: number;
};

export function computeStrugglingCriteria(
  students: StudentSubmission[]
): StrugglingCriterion[] {
  if (!students.length) return [];
  const criterionIds = Object.keys(students[0].criteria);
  return criterionIds
    .map((cid) => {
      const name = students[0].criteria[cid]?.name ?? cid;
      const below50 = students.filter(
        (s) => (s.criteria[cid]?.level ?? 0) <= 2
      ).length;
      const below60 = students.filter(
        (s) => (s.criteria[cid]?.level ?? 0) < 3
      ).length;
      return {
        cid,
        name,
        below50Count: below50,
        below60Count: below60,
        criticalFraction: below50 / students.length,
      };
    })
    .filter((c) => c.below50Count > 0 || c.below60Count > 0)
    .sort((a, b) => b.below50Count - a.below50Count)
    .slice(0, 3);
}

export type AssignmentSummary = {
  id: string;
  title: string;
  studentCount: number;
  classAvgPct: number;
  distribution: BandCounts;
  atRiskCount: number;
  suspiciousCount: number;
  releasedAt?: string;
};

export function computeAssignmentSummary(
  a: AssignmentNarrative
): AssignmentSummary {
  const pcts = a.students.map(studentScorePct);
  const classAvgPct = pcts.length
    ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length)
    : 0;
  return {
    id: a.id,
    title: a.title,
    studentCount: a.students.length,
    classAvgPct,
    distribution: computeGradeDistribution(a.students),
    atRiskCount: computeAtRiskStudents(a.students).length,
    suspiciousCount: a.students.filter((s) => s.status !== "clean").length,
    releasedAt: a.releasedAt,
  };
}

export type PatternStats = {
  avgScorePerCourse: Array<{ title: string; avg: number }>;
  mostEditedCriteria: Array<{
    name: string;
    course: string;
    editedCount: number;
  }>;
  approvalRate: number;
};

export function computePatternStats(
  assignments: Record<string, AssignmentNarrative>,
  criterionFeedbacks: Record<string, Record<string, CriterionFeedbackState>>
): PatternStats {
  const allAssignments = Object.values(assignments);

  const avgScorePerCourse = allAssignments.map((a) => ({
    title: a.title,
    avg: a.students.length
      ? Math.round(
          a.students.map(studentScorePct).reduce((x, y) => x + y, 0) /
            a.students.length
        )
      : 0,
  }));

  let totalConfirmed = 0;
  let totalEdited = 0;
  const criteriaEdits: Array<{
    name: string;
    course: string;
    editedCount: number;
  }> = [];

  allAssignments.forEach((a) => {
    if (!a.students.length) return;
    const cids = Object.keys(a.students[0].criteria);
    cids.forEach((cid) => {
      let edited = 0;
      let confirmed = 0;
      a.students.forEach((s) => {
        const fb = criterionFeedbacks[s.id]?.[cid];
        if (!fb) return;
        if (fb.isConfirmed) confirmed++;
        if (fb.authorship === "instructor_edited") edited++;
      });
      totalConfirmed += confirmed;
      totalEdited += edited;
      if (edited > 0) {
        criteriaEdits.push({
          name: a.students[0].criteria[cid]?.name ?? cid,
          course: a.title,
          editedCount: edited,
        });
      }
    });
  });

  const approvalRate =
    totalConfirmed > 0
      ? Math.round(((totalConfirmed - totalEdited) / totalConfirmed) * 100)
      : 0;
  const mostEditedCriteria = criteriaEdits
    .sort((a, b) => b.editedCount - a.editedCount)
    .slice(0, 3);

  return { avgScorePerCourse, mostEditedCriteria, approvalRate };
}

// ── Score override patterns ────────────────────────────────────────────────────

export type OverridePattern = {
  criterionName: string;
  course: string;
  overrideCount: number;
  totalStudents: number;
  overridePct: number;
};

export function computeOverridePatterns(
  assignments: Record<string, AssignmentNarrative>
): OverridePattern[] {
  const results: OverridePattern[] = [];
  Object.values(assignments).forEach((a) => {
    if (!a.students.length) return;
    const cids = Object.keys(a.students[0].criteria);
    cids.forEach((cid) => {
      const name = a.students[0].criteria[cid]?.name ?? cid;
      const overrideCount = a.students.filter(
        (s) => s.criteria[cid]?.isOverridden
      ).length;
      if (overrideCount > 0) {
        results.push({
          criterionName: name,
          course: a.title,
          overrideCount,
          totalStudents: a.students.length,
          overridePct: Math.round((overrideCount / a.students.length) * 100),
        });
      }
    });
  });
  return results.sort((a, b) => b.overridePct - a.overridePct).slice(0, 6);
}

// ── Feedback tier distribution ─────────────────────────────────────────────────

export type TierDistribution = {
  course: string;
  perfect: number;
  minor: number;
  gap: number;
  major: number;
  total: number;
};

export function computeFeedbackTierDistribution(
  assignments: Record<string, AssignmentNarrative>,
  criterionFeedbacks: Record<string, Record<string, CriterionFeedbackState>>
): TierDistribution[] {
  return Object.values(assignments)
    .map((a) => {
      const tiers = { perfect: 0, minor: 0, gap: 0, major: 0 };
      a.students.forEach((s) => {
        const fb = criterionFeedbacks[s.id];
        if (!fb) return;
        Object.values(fb).forEach((f) => {
          if (f.isConfirmed && f.tier in tiers)
            tiers[f.tier as keyof typeof tiers]++;
        });
      });
      const total = tiers.perfect + tiers.minor + tiers.gap + tiers.major;
      return { course: a.title, ...tiers, total };
    })
    .filter((d) => d.total > 0);
}

// ── Calibration delta by criterion ────────────────────────────────────────────

export type CalibrationDeltaRow = {
  criterionName: string;
  course: string;
  avgDelta: number;
  highDeltaCount: number;
  totalPapers: number;
};

export function computeCalibrationDeltas(
  assignments: Record<string, AssignmentNarrative>,
  calibration: Record<string, CalibrationData>
): CalibrationDeltaRow[] {
  const results: CalibrationDeltaRow[] = [];
  Object.entries(calibration).forEach(([assignmentId, cal]) => {
    const assignment = assignments[assignmentId];
    if (!assignment || !cal.scores.length) return;
    const byCriterion = new Map<string, number[]>();
    cal.scores.forEach((score) => {
      if (score.instructorLevel === 0) return;
      const existing = byCriterion.get(score.criterionId) ?? [];
      existing.push(score.delta);
      byCriterion.set(score.criterionId, existing);
    });
    byCriterion.forEach((deltas, cid) => {
      const crit = cal.criteria.find((c) => c.id === cid);
      const avgDelta =
        deltas.reduce((a, b) => a + b, 0) / deltas.length;
      results.push({
        criterionName: crit?.name ?? cid,
        course: assignment.title,
        avgDelta: Math.round(avgDelta * 10) / 10,
        highDeltaCount: deltas.filter((d) => d >= 3).length,
        totalPapers: deltas.length,
      });
    });
  });
  return results.sort((a, b) => b.avgDelta - a.avgDelta).slice(0, 6);
}

// ── Regeneration hotspots ──────────────────────────────────────────────────────

export type RegenerationHotspot = {
  criterionName: string;
  course: string;
  maxRegenStudents: number;
  totalStudents: number;
};

export function computeRegenerationHotspots(
  assignments: Record<string, AssignmentNarrative>,
  criterionFeedbacks: Record<string, Record<string, CriterionFeedbackState>>
): RegenerationHotspot[] {
  const results: RegenerationHotspot[] = [];
  Object.values(assignments).forEach((a) => {
    if (!a.students.length) return;
    const cids = Object.keys(a.students[0].criteria);
    cids.forEach((cid) => {
      const name = a.students[0].criteria[cid]?.name ?? cid;
      const maxRegenStudents = a.students.filter(
        (s) => (criterionFeedbacks[s.id]?.[cid]?.regenCount ?? 0) >= 2
      ).length;
      if (maxRegenStudents > 0) {
        results.push({
          criterionName: name,
          course: a.title,
          maxRegenStudents,
          totalStudents: a.students.length,
        });
      }
    });
  });
  return results
    .sort(
      (a, b) =>
        b.maxRegenStudents / b.totalStudents -
        a.maxRegenStudents / a.totalStudents
    )
    .slice(0, 5);
}

// ── Integrity flag profile ─────────────────────────────────────────────────────

export type IntegrityProfile = {
  course: string;
  total: number;
  clean: number;
  suspicious: number;
  manipulated: number;
  topFlags: Array<{ flag: string; count: number }>;
};

export function computeIntegrityProfiles(
  assignments: Record<string, AssignmentNarrative>
): IntegrityProfile[] {
  return Object.values(assignments).map((a) => {
    const clean = a.students.filter((s) => s.status === "clean").length;
    const suspicious = a.students.filter(
      (s) => s.status === "suspicious"
    ).length;
    const manipulated = a.students.filter(
      (s) => s.status === "manipulated"
    ).length;
    const flagCounts: Record<string, number> = {};
    a.students.forEach((s) =>
      s.integrityFlags.forEach(
        (f) => (flagCounts[f] = (flagCounts[f] ?? 0) + 1)
      )
    );
    const topFlags = Object.entries(flagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([flag, count]) => ({ flag, count }));
    return {
      course: a.title,
      total: a.students.length,
      clean,
      suspicious,
      manipulated,
      topFlags,
    };
  });
}

// ── Score level spread ─────────────────────────────────────────────────────────

export type ScoreSpread = {
  course: string;
  levels: Array<{ level: number; count: number }>;
  totalCriterionScores: number;
};

export function computeScoreSpreads(
  assignments: Record<string, AssignmentNarrative>
): ScoreSpread[] {
  return Object.values(assignments).map((a) => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    a.students.forEach((s) =>
      Object.values(s.criteria).forEach(
        (c) => (counts[c.level] = (counts[c.level] ?? 0) + 1)
      )
    );
    const levels = [0, 1, 2, 3, 4, 5].map((l) => ({
      level: l,
      count: counts[l] ?? 0,
    }));
    const totalCriterionScores = levels.reduce((s, l) => s + l.count, 0);
    return { course: a.title, levels, totalCriterionScores };
  });
}

// ── Grading speed ──────────────────────────────────────────────────────────────

export type GradingSpeedRow = {
  studentName: string;
  course: string;
  minutesSpent: number;
};

export type GradingSpeedStats = {
  avgMinutes: number;
  fastest: number;
  slowest: number;
  completedCount: number;
  rows: GradingSpeedRow[];
  outliers: GradingSpeedRow[];
};

export function computeGradingSpeed(
  assignments: Record<string, AssignmentNarrative>,
  gradingTimestamps: Record<string, { startedAt: string; completedAt?: string }>
): GradingSpeedStats | null {
  const rows: GradingSpeedRow[] = [];
  Object.values(assignments).forEach((a) => {
    a.students.forEach((s) => {
      const ts = gradingTimestamps[s.id];
      if (!ts?.startedAt || !ts?.completedAt) return;
      const minutes = Math.round(
        (new Date(ts.completedAt).getTime() -
          new Date(ts.startedAt).getTime()) /
          60000
      );
      // Ignore implausible values — tab left open etc.
      if (minutes > 0 && minutes < 180) {
        rows.push({ studentName: s.name, course: a.title, minutesSpent: minutes });
      }
    });
  });
  if (!rows.length) return null;
  const avg = Math.round(
    rows.reduce((s, r) => s + r.minutesSpent, 0) / rows.length
  );
  return {
    avgMinutes: avg,
    fastest: Math.min(...rows.map((r) => r.minutesSpent)),
    slowest: Math.max(...rows.map((r) => r.minutesSpent)),
    completedCount: rows.length,
    rows,
    outliers: rows.filter((r) => r.minutesSpent > avg * 2),
  };
}
