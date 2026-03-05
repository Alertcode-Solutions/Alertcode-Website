import Link from "next/link";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getAllPosts } from "@/lib/blog";
import { getInquiries } from "@/lib/inquiries";
import { getProjects } from "@/lib/projects";
import { getSubscribers } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [projects, posts, subscribers, inquiries] = await Promise.all([
    getProjects(),
    getAllPosts(),
    getSubscribers(),
    getInquiries(),
  ]);

  return (
    <Section className="py-10">
      <Container>
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="type-h2">Dashboard</h2>
            <p className="type-body">Manage dynamic content used across the Alertcode website.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="surface-card p-6">
              <h3 className="text-sm text-muted">Total Projects</h3>
              <p className="mt-3 text-3xl font-semibold leading-none">{projects.length}</p>
            </article>
            <article className="surface-card p-6">
              <h3 className="text-sm text-muted">Total Blog Posts</h3>
              <p className="mt-3 text-3xl font-semibold leading-none">{posts.length}</p>
            </article>
            <article className="surface-card p-6">
              <h3 className="text-sm text-muted">Subscribers</h3>
              <p className="mt-3 text-3xl font-semibold leading-none">{subscribers.length}</p>
            </article>
            <article className="surface-card p-6">
              <h3 className="text-sm text-muted">Inquiries</h3>
              <p className="mt-3 text-3xl font-semibold leading-none">{inquiries.length}</p>
            </article>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/projects"
              className="inline-flex min-h-11 items-center rounded-md border border-transparent bg-primary px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Manage Projects
            </Link>
            <Link
              href="/admin/blog"
              className="inline-flex min-h-11 items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Manage Blog Posts
            </Link>
            <Link
              href="/admin/subscribers"
              className="inline-flex min-h-11 items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View Subscribers
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}

