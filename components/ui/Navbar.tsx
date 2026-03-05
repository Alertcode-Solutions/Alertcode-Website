"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import ThemeToggle from "@/components/ui/ThemeToggle";

const SearchModal = dynamic(() => import("@/components/ui/SearchModal"), {
  ssr: false,
});

type NavItem = {
  id: "work" | "about" | "team" | "community" | "insights" | "contact";
  label: string;
};

const navItems: NavItem[] = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "team", label: "Team" },
  { id: "community", label: "Community" },
  { id: "insights", label: "Insights" },
  { id: "contact", label: "Contact" },
];

const hiddenPrefixes = ["/admin", "/api"];
const hiddenExact = new Set(["/admin-login"]);

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.65 16.65" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const isHidden = hiddenExact.has(pathname) || hiddenPrefixes.some((prefix) => pathname.startsWith(prefix));

  const resolvedActive = useMemo<NavItem["id"] | null>(() => {
    if (pathname.startsWith("/work")) {
      return "work";
    }

    if (pathname === "/about") {
      return "about";
    }

    if (pathname === "/team") {
      return "team";
    }

    if (pathname === "/contact") {
      return "contact";
    }

    if (pathname === "/community") {
      return "community";
    }

    if (pathname === "/blog" || pathname.startsWith("/blog/")) {
      return "insights";
    }

    return null;
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onOpenSearchShortcut = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k";
      const usesCommand = event.metaKey || event.ctrlKey;

      if (!isK || !usesCommand) {
        return;
      }

      event.preventDefault();
      setSearchOpen(true);
    };

    window.addEventListener("keydown", onOpenSearchShortcut);
    return () => window.removeEventListener("keydown", onOpenSearchShortcut);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const warmSearchIndex = () => {
      fetch("/api/search", {
        method: "GET",
        credentials: "same-origin",
      }).catch(() => {
        return undefined;
      });
    };

    const idleCallback = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;

    if (idleCallback) {
      const id = idleCallback(warmSearchIndex);
      return () => {
        const cancelIdleCallback = (window as Window & { cancelIdleCallback?: (value: number) => void }).cancelIdleCallback;

        if (cancelIdleCallback) {
          cancelIdleCallback(id);
        }
      };
    }

    const timeoutId = window.setTimeout(warmSearchIndex, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      setMenuOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  if (isHidden) {
    return null;
  }

  const hrefFor = (id: NavItem["id"]) => {
    if (id === "work") {
      return "/work";
    }

    if (id === "about") {
      return "/about";
    }

    if (id === "team") {
      return "/team";
    }

    if (id === "community") {
      return "/community";
    }

    if (id === "insights") {
      return "/blog";
    }

    return pathname === "/" ? `#${id}` : `/#${id}`;
  };

  return (
    <>
      <header className="sticky top-0 z-[120] isolate pointer-events-auto border-b border-white/10 bg-background/95 backdrop-blur-md">
        <Container>
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="Alertcode homepage"
              className="text-base font-semibold tracking-tight transition-colors duration-200 hover:text-muted"
            >
              Alertcode
            </Link>

            <div className="hidden items-center gap-2 sm:flex">
              <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
                {navItems.map((item) => {
                  const active = resolvedActive === item.id;

                  return (
                    <a
                      key={item.id}
                      href={hrefFor(item.id)}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        active ? "font-semibold text-primary" : "font-medium text-muted hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              <button
                type="button"
                aria-label="Open global search"
                onClick={() => setSearchOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted transition-colors duration-200 hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <SearchIcon />
                <span>Search</span>
                <span className="rounded border border-border px-1.5 py-0.5 text-xs leading-none text-muted">Ctrl K</span>
              </button>

              <ThemeToggle />
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <ThemeToggle />

              <button
                type="button"
                aria-label="Open global search"
                onClick={() => setSearchOpen(true)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border text-foreground transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <SearchIcon />
              </button>

              <button
                ref={buttonRef}
                type="button"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-panel"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border text-foreground transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="sr-only">Menu</span>
                <span className="block h-[2px] w-5 bg-current" />
              </button>
            </div>
          </div>
        </Container>

        <div
          id="mobile-nav-panel"
          ref={panelRef}
          className={`sm:hidden isolated-scroll overflow-hidden overscroll-contain border-t border-border/80 bg-background/95 backdrop-blur transition-all duration-200 ${
            menuOpen ? "pointer-events-auto max-h-80 opacity-100" : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <Container>
            <nav aria-label="Mobile primary" className="flex flex-col py-2">
              {navItems.map((item) => {
                const active = resolvedActive === item.id;

                return (
                  <a
                    key={item.id}
                    href={hrefFor(item.id)}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-md px-2 py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      active ? "font-semibold text-primary" : "font-medium text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </Container>
        </div>
      </header>

      {searchOpen ? <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} /> : null}
    </>
  );
}





