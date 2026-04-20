import { cn } from "@/lib/utils";

interface StatNumberProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "prefix"> {
  value: string | number;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
}

export function StatNumber({
  value,
  suffix,
  prefix,
  className,
  ...rest
}: StatNumberProps) {
  return (
    <div
      className={cn("num-display flex items-baseline gap-1 text-foreground", className)}
      {...rest}
    >
      {prefix && <span className="text-base font-medium text-muted-foreground">{prefix}</span>}
      <span>{value}</span>
      {suffix && <span className="text-base font-medium text-muted-foreground">{suffix}</span>}
    </div>
  );
}
