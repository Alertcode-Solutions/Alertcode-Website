"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type EditProjectFormValues = {
  id: string;
  title: string;
  slug: string;
  industry: string;
  description: string;
  problem: string;
  solution: string;
  features: string;
  results: string;
  technologies: string;
  outcome: string;
};

type ApiResponse = {
  success: boolean;
  error?: string;
};

type EditProjectFormProps = {
  initialValues: EditProjectFormValues;
};

export default function EditProjectForm({ initialValues }: EditProjectFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<EditProjectFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const technologies = form.technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/admin/projects", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          slug: form.slug,
          industry: form.industry,
          description: form.description,
          problem: form.problem,
          solution: form.solution,
          features: form.features,
          results: form.results,
          technologies,
          outcome: form.outcome,
        }),
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error ?? "Unable to update project.");
        return;
      }

      router.push("/admin/projects");
      router.refresh();
    } catch {
      setErrorMessage("Unable to update project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Slug
          </label>
          <input
            id="slug"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="industry" className="text-sm font-medium">
            Industry
          </label>
          <input
            id="industry"
            value={form.industry}
            onChange={(event) => setForm((prev) => ({ ...prev, industry: event.target.value }))}
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
            rows={4}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="problem" className="text-sm font-medium">
            Problem
          </label>
          <textarea
            id="problem"
            rows={4}
            value={form.problem}
            onChange={(event) => setForm((prev) => ({ ...prev, problem: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="solution" className="text-sm font-medium">
            Solution
          </label>
          <textarea
            id="solution"
            rows={4}
            value={form.solution}
            onChange={(event) => setForm((prev) => ({ ...prev, solution: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="features" className="text-sm font-medium">
            Key Features
          </label>
          <textarea
            id="features"
            rows={4}
            value={form.features}
            onChange={(event) => setForm((prev) => ({ ...prev, features: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="results" className="text-sm font-medium">
            Results
          </label>
          <textarea
            id="results"
            rows={4}
            value={form.results}
            onChange={(event) => setForm((prev) => ({ ...prev, results: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="technologies" className="text-sm font-medium">
            Technologies (comma separated)
          </label>
          <input
            id="technologies"
            value={form.technologies}
            onChange={(event) => setForm((prev) => ({ ...prev, technologies: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="outcome" className="text-sm font-medium">
            Outcome Summary
          </label>
          <textarea
            id="outcome"
            rows={3}
            value={form.outcome}
            onChange={(event) => setForm((prev) => ({ ...prev, outcome: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/projects")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
