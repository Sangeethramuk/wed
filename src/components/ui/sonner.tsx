"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#0F172A",
          "--normal-border": "#E2E8F0",
          "--success-bg": "#FFFFFF",
          "--success-text": "#10B981",
          "--success-border": "#10B98120",
          "--warning-bg": "#FFFFFF",
          "--warning-text": "#F59E0B",
          "--warning-border": "#F59E0B20",
          "--error-bg": "#FFFFFF",
          "--error-text": "#EF4444",
          "--error-border": "#EF444420",
          "--info-bg": "#FFFFFF",
          "--info-text": "#1F4E8C",
          "--info-border": "#1F4E8C20",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans border shadow-lg",
          title: "text-[13px] font-bold",
          description: "text-[11px] font-medium text-slate-500",
          success: "text-[#10B981]",
          error: "text-[#EF4444]",
          warning: "text-[#F59E0B]",
          info: "text-[#1F4E8C]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
