import Link from "next/link";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getAllPosts } from "@/lib/blog";
import AdminBlogList from "./AdminBlogList";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return (
    <Section className="py-10">
      <Container>
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="type-h2">Blog Posts</h2>
              <p className="mt-2 type-body-sm">Create, edit, and delete markdown insights content.</p>
            </div>
            <Link
              href="/admin/blog/new"
              className="inline-flex min-h-11 items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              New Post
            </Link>
          </div>

          <AdminBlogList initialPosts={posts} />
        </div>
      </Container>
    </Section>
  );
}
