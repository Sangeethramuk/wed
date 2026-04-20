import { cn } from "@/lib/utils";
import { confidenceStyles, type ConfidenceKey } from "@/lib/design-tokens";

interface ConfidenceBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: ConfidenceKey;
  showDot?: boolean;
}

const LABEL: Record<ConfidenceKey, string> = {
  high: "High confidence",
  med: "Medium confidence",
  low: "Low confidence",
};

export function ConfidenceBadge({
  level,
  showDot = true,
  className,
  children,
  ...rest
}: ConfidenceBadgeProps) {
  const style = confidenceStyles[level];
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
      {children ?? LABEL[level]}
    </span>
  );
}
