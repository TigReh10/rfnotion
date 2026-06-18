"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Dark / light mode toggle backed by next-themes.
 * Renders a placeholder until mounted to avoid hydration mismatch, since the
 * resolved theme is only known on the client.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background/70 text-muted-foreground backdrop-blur transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const cls = className ? base + " " + className : base;

  if (!mounted) {
    return (
      <button type="button" aria-label="Toggle theme" className={cls} disabled>
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cls}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
