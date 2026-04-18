"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { ThemeVariant } from "@/lib/themes";
import { defaultTheme, themes } from "@/lib/themes";

interface ThemeContextType {
  theme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  resolvedTheme: ThemeVariant;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "dashboard-theme";

// Check if we're on the server
const isServer = typeof window === "undefined";

// Get stored theme from localStorage
function getStoredTheme(): ThemeVariant {
  if (isServer) return defaultTheme;
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeVariant | null;
  return stored && themes.some((t) => t.variant === stored)
    ? stored
    : defaultTheme;
}

// Subscribe to storage changes
function subscribe(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

// Get snapshot (current theme)
function getSnapshot(): ThemeVariant {
  return getStoredTheme();
}

// Server snapshot
function getServerSnapshot(): ThemeVariant {
  return defaultTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storedTheme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Track if we've hydrated (client-side mounted)
  const mounted = useSyncExternalStore(
    () => () => {}, // No-op unsubscribe
    () => true, // Client: always mounted
    () => false // Server: never mounted
  );

  const setTheme = useCallback((newTheme: ThemeVariant) => {
    if (!isServer) {
      localStorage.setItem(STORAGE_KEY, newTheme);
      // Dispatch custom event to trigger re-render
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: newTheme,
        })
      );
    }
  }, []);

  // Apply theme to document
  const value = useMemo(
    () => ({
      theme: storedTheme,
      setTheme,
      resolvedTheme: storedTheme,
      mounted,
    }),
    [storedTheme, setTheme, mounted]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeApplier theme={storedTheme} />
      {children}
    </ThemeContext.Provider>
  );
}

// Separate component to handle DOM updates
function ThemeApplier({ theme }: { theme: ThemeVariant }) {
  // This runs on every render and updates the DOM
  if (!isServer) {
    document.documentElement.setAttribute("data-theme", theme);
  }
  return null;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
