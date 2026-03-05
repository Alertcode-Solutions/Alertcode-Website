import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getAllPosts } from "@/lib/blog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Insights",
  description: "Thoughts, research, and engineering insights from Alertcode.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Insights | Alertcode",
    description: "Thoughts, research, and engineering insights from Alertcode.",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights | Alertcode",
    description: "Thoughts, research, and engineering insights from Alertcode.",
  },
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(new Date(date));
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <Section>
      <Container>
        <div className="space-y-10 sm:space-y-12">
          <header className="space-y-4">
            <h1 className="type-h1">Insights</h1>
            <p className="type-body max-w-3xl">Thoughts, research, and engineering insights from Alertcode.</p>
          </header>

          {posts.length === 0 ? (
            <p className="type-body">No insights published yet.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article key={post.slug} className="surface-card flex h-full flex-col p-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium uppercase tracking-wide text-muted">
                      {formatDate(post.date)} · {post.readingTime}
                    </p>
                    <h2 className="type-h3 text-foreground">{post.title}</h2>
                    <p className="type-body-sm">{post.description}</p>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Read more
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
