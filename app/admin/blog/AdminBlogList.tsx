"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import type { BlogPostMeta } from "@/lib/blog";

type AdminBlogListProps = {
  initialPosts: BlogPostMeta[];
};

type ApiResponse = {
  success: boolean;
  error?: string;
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

export default function AdminBlogList({ initialPosts }: AdminBlogListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostMeta[]>(initialPosts);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const deletePost = async (slug: string) => {
    setBusySlug(slug);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/blog/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error ?? "Unable to delete post.");
        return;
      }

      setPosts((prev) => prev.filter((post) => post.slug !== slug));
      router.refresh();
    } catch {
      setErrorMessage("Unable to delete post.");
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

      {posts.length === 0 ? (
        <p className="text-sm text-muted">No blog posts found.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <article key={post.slug} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="type-h3">{post.title}</h3>
                  <p className="text-sm text-muted">{post.slug}</p>
                  <p className="text-sm text-muted">
                    {formatDate(post.date)} · {post.author}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/blog/${post.slug}/edit`}
                    className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Edit
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busySlug === post.slug}
                    onClick={() => void deletePost(post.slug)}
                  >
                    {busySlug === post.slug ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
