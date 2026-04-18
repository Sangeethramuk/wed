"use client";

import { Check, Palette } from "lucide-react";
import { useTheme } from "@/components/multi-theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { themes, type ThemeVariant } from "@/lib/themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (variant: ThemeVariant) => {
    setTheme(variant);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Switch theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="space-y-1 p-1">
            {themes.map((t) => (
              <DropdownMenuItem
                key={t.variant}
                onClick={() => handleThemeChange(t.variant)}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
              >
                <div className="flex flex-1 items-center gap-3">
                  <span className="text-lg">{t.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.description}
                    </span>
                  </div>
                </div>
                {theme === t.variant && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground">
              Current: <span className="font-medium text-foreground">{themes.find((t) => t.variant === theme)?.name}</span>
            </p>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
