import { cn } from "@/lib/utils";
import {
  statusStyles,
  workflowStatusStyles,
  resolveCategory,
  type StatusKey,
  type WorkflowStatusKey,
} from "@/lib/design-tokens";

type DotColor =
  | { kind: "status"; value: StatusKey }
  | { kind: "workflow"; value: WorkflowStatusKey }
  | { kind: "category"; value: string };

interface ColorDotProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  color: DotColor;
  size?: "sm" | "md" | "lg";
}

const SIZE: Record<NonNullable<ColorDotProps["size"]>, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2.5",
};

export function ColorDot({ color, size = "md", className, ...rest }: ColorDotProps) {
  const dotClass =
    color.kind === "status"
      ? statusStyles[color.value].dot
      : color.kind === "workflow"
      ? workflowStatusStyles[color.value].dot
      : resolveCategory(color.value).dot;

  return (
    <span
      aria-hidden="true"
      className={cn("inline-block rounded-full", SIZE[size], dotClass, className)}
      {...rest}
    />
  );
}
