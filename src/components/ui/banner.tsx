import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const bannerVariants = cva(
  "flex w-full items-center gap-3 rounded-md border-l-[3px] bg-muted/40 px-3 py-2 text-sm leading-snug",
  {
    variants: {
      variant: {
        info:
          "[border-left-color:var(--status-info)] [&>svg]:text-[color:var(--status-info)]",
        success:
          "[border-left-color:var(--status-success)] [&>svg]:text-[color:var(--status-success)]",
        warning:
          "[border-left-color:var(--status-warning)] [&>svg]:text-[color:var(--status-warning)]",
        danger:
          "[border-left-color:var(--status-error)] [&>svg]:text-[color:var(--status-error)]",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const VARIANT_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} as const

export interface BannerProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof bannerVariants> {
  /** Optional icon override. If omitted, the variant's default icon is rendered. Set to `null` to hide the icon. */
  icon?: React.ReactNode
  /** If provided, shows a right-aligned close button that calls this handler. */
  onDismiss?: () => void
  children?: React.ReactNode
}

function Banner({
  className,
  variant = "info",
  icon,
  onDismiss,
  children,
  ...props
}: BannerProps) {
  const resolvedVariant = variant ?? "info"
  const DefaultIcon = VARIANT_ICON[resolvedVariant]
  const iconNode =
    icon === undefined ? <DefaultIcon className="size-4 shrink-0" /> : icon

  return (
    <div
      role={resolvedVariant === "danger" || resolvedVariant === "warning" ? "alert" : "status"}
      data-slot="banner"
      className={cn(bannerVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {iconNode}
      <div className="flex-1 min-w-0">{children}</div>
      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}

export { Banner, bannerVariants }
