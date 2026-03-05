"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import { useScrollSpy } from "@/lib/use-scroll-spy";

type NavItem = {
  href: string;
  label: string;
  sectionId: "work" | "community" | "contact";
};

const navItems: NavItem[] = [
  {
    href: "#work",
    label: "Work",
    sectionId: "work",
  },
  {
    href: "#community",
    label: "Community",
    sectionId: "community",
  },
  {
    href: "#contact",
    label: "Contact",
    sectionId: "contact",
  },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const activeSection = useScrollSpy();

  let resolvedActiveSection = activeSection;

  if (pathname.startsWith("/work")) {
    resolvedActiveSection = "work";
  } else if (pathname === "/contact") {
    resolvedActiveSection = "contact";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/90 bg-background/85 backdrop-blur">
      <Container>
        <div className="flex min-h-[72px] items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Alertcode homepage"
            className="text-base font-semibold tracking-tight transition-colors duration-200 hover:text-muted"
          >
            Alertcode
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const active = resolvedActiveSection === item.sectionId;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    active
                      ? "font-semibold text-primary"
                      : "font-medium text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </Container>
    </header>
  );
}

