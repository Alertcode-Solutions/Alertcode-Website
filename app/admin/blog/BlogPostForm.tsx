"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export type BlogFormValues = {
  title: string;
  description: string;
  author: string;
  date: string;
  slug: string;
  content: string;
};

type BlogPostFormProps = {
  mode: "create" | "edit";
  initialValues?: BlogFormValues;
  initialSlug?: string;
};

type ApiResponse = {
  success: boolean;
  error?: string;
};

const emptyValues: BlogFormValues = {
  title: "",
  description: "",
  author: "",
  date: "",
  slug: "",
  content: "",
};

export default function BlogPostForm({ mode, initialValues, initialSlug }: BlogPostFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<BlogFormValues>(initialValues ?? emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const endpoint = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${encodeURIComponent(initialSlug ?? values.slug)}`;
  const method = mode === "create" ? "POST" : "PUT";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error ?? "Unable to save blog post.");
        return;
      }

      router.push("/admin/blog");
      router.refresh();
    } catch {
      setErrorMessage("Unable to save blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={values.title}
            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={values.description}
            onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="author" className="text-sm font-medium">
            Author
          </label>
          <input
            id="author"
            value={values.author}
            onChange={(event) => setValues((prev) => ({ ...prev, author: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={values.date}
            onChange={(event) => setValues((prev) => ({ ...prev, date: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Slug
          </label>
          <input
            id="slug"
            value={values.slug}
            onChange={(event) => setValues((prev) => ({ ...prev, slug: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="content" className="text-sm font-medium">
              Markdown Content
            </label>
            <Link href="/admin/media" className="text-xs font-medium text-primary underline-offset-2 hover:underline">
              Open media library
            </Link>
          </div>
          <p className="text-xs text-muted">Use uploaded assets in markdown like: ![alt text](/uploads/blog/your-image.jpg)</p>
          <textarea
            id="content"
            rows={16}
            value={values.content}
            onChange={(event) => setValues((prev) => ({ ...prev, content: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Post" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

