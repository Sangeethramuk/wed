import { cn } from "@/lib/utils";
import { workflowStatusStyles, type WorkflowStatusKey } from "@/lib/design-tokens";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: WorkflowStatusKey;
  showDot?: boolean;
}

const LABEL: Record<WorkflowStatusKey, string> = {
  calibrated: "Calibrated",
  complete: "Complete",
  "in-progress": "In progress",
  "not-started": "Not started",
  overdue: "Overdue",
};

export function StatusBadge({
  status,
  showDot = true,
  className,
  children,
  ...rest
}: StatusBadgeProps) {
  const style = workflowStatusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        style.bg,
        style.text,
        className
      )}
      {...rest}
    >
      {showDot && <span className={cn("size-1.5 rounded-full", style.dot)} />}
      {children ?? LABEL[status]}
    </span>
  );
}
