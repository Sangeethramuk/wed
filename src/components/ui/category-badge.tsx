import { cn } from "@/lib/utils";
import { resolveCategory } from "@/lib/design-tokens";

interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: string;
  showDot?: boolean;
}

export function CategoryBadge({
  category,
  showDot = true,
  className,
  children,
  ...rest
}: CategoryBadgeProps) {
  const style = resolveCategory(category);
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
      {children ?? category}
    </span>
  );
}
