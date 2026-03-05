"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.35 14.95A8.5 8.5 0 1 1 9.05 3.65a7 7 0 1 0 11.3 11.3z" />
    </svg>
  );
}

type ThemeName = "light" | "dark";

function applyTheme(theme: ThemeName): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");

  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // ignore storage errors
  }
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("dark");

  useEffect(() => {
    setMounted(true);

    const isDark = document.documentElement.classList.contains("dark");
    setCurrentTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const normalized = resolvedTheme === "light" ? "light" : "dark";
    setCurrentTheme(normalized);
    applyTheme(normalized);
  }, [mounted, resolvedTheme]);

  const isDark = currentTheme === "dark";

  const onToggle = () => {
    const nextTheme: ThemeName = isDark ? "light" : "dark";
    setCurrentTheme(nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border text-foreground transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {mounted ? (isDark ? <SunIcon /> : <MoonIcon />) : <MoonIcon />}
    </button>
  );
}
