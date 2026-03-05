import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <Container>
          <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Internal</p>
              <h1 className="text-xl font-semibold tracking-tight">Alertcode Admin</h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/projects"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Projects
              </Link>
              <Link
                href="/admin/blog"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Blog Posts
              </Link>
              <Link
                href="/admin/subscribers"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Subscribers
              </Link>
              <Link
                href="/admin/inquiries"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Inquiries
              </Link>
              <Link
                href="/admin/media"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Media
              </Link>
              <Link
                href="/admin/logs"
                className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Logs
              </Link>
              <form action="/api/admin/logout" method="post">
                <Button type="submit" variant="outline" aria-label="Sign out from admin dashboard">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}

