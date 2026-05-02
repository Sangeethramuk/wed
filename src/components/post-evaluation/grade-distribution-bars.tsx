import { cn } from "@/lib/utils";
import { statusStyles } from "@/lib/design-tokens";
import type { BandCounts, GradeBand } from "./utils";

const BAND_CONFIG: Array<{
  band: GradeBand;
  label: string;
  style: (typeof statusStyles)[keyof typeof statusStyles];
}> = [
  { band: "A", label: "A  ≥ 80%", style: statusStyles.success },
  { band: "B", label: "B  65–79%", style: statusStyles.info },
  { band: "C", label: "C  50–64%", style: statusStyles.warning },
  { band: "D", label: "D  35–49%", style: statusStyles.error },
  { band: "F", label: "F  < 35%", style: statusStyles.error },
];

interface Props {
  counts: BandCounts;
  totalStudents: number;
  mini?: boolean;
}

export function GradeDistributionBars({ counts, totalStudents, mini }: Props) {
  if (mini) {
    return (
      <div className="flex h-2 w-full rounded-full overflow-hidden gap-px">
        {BAND_CONFIG.map(({ band, style }) => {
          const count = counts[band];
          if (!count || !totalStudents) return null;
          return (
            <div
              key={band}
              className={cn("h-full", style.bg)}
              style={{ width: `${(count / totalStudents) * 100}%` }}
            />
          );
        })}
        {totalStudents === 0 && (
          <div className="h-full w-full bg-muted rounded-full" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {BAND_CONFIG.map(({ band, label, style }) => {
        const count = counts[band];
        const pct =
          totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
        return (
          <div key={band} className="flex items-center gap-3">
            <span className="w-20 text-xs text-muted-foreground font-medium shrink-0">
              {label}
            </span>
            <div className="flex-1 h-5 rounded-sm bg-muted overflow-hidden">
              {count > 0 && (
                <div
                  className={cn("h-full rounded-sm transition-all", style.bg)}
                  style={{ width: `${pct}%` }}
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums w-20 text-right shrink-0">
              {count} student{count !== 1 ? "s" : ""} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
