"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import type { Project } from "@/lib/projects";

type ProjectsResponse = {
  success: boolean;
  data?: Project[];
  error?: string;
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const hasProjects = useMemo(() => projects.length > 0, [projects]);

  const loadProjects = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "GET",
        credentials: "include",
      });

      const payload = (await response.json()) as ProjectsResponse;

      if (!response.ok || !payload.success || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to load projects.");
        setProjects([]);
        return;
      }

      setProjects(payload.data);
    } catch {
      setErrorMessage("Unable to load projects.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const removeProjectById = async (id: string) => {
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const payload = (await response.json()) as ProjectsResponse;

      if (!response.ok || !payload.success || !payload.data) {
        setErrorMessage(payload.error ?? "Unable to delete project.");
        return;
      }

      setProjects(payload.data);
    } catch {
      setErrorMessage("Unable to delete project.");
    }
  };

  return (
    <Section className="py-10">
      <Container>
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="type-h2">Projects</h2>
              <p className="mt-2 type-body-sm">Create, edit, and remove project case study entries.</p>
            </div>
            <Link
              href="/admin/projects/new"
              className="inline-flex min-h-11 items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              New Project
            </Link>
          </div>

          {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

          {isLoading ? <p className="text-sm text-muted">Loading projects...</p> : null}

          {!isLoading && !hasProjects ? <p className="text-sm text-muted">No projects available yet.</p> : null}

          {!isLoading && hasProjects ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <article key={project.id} className="surface-card p-5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="type-h3">{project.title}</h3>
                      <p className="text-sm text-muted">{project.slug}</p>
                    </div>
                    <p className="text-sm text-muted">{project.industry}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/projects/${project.slug}/edit`}
                        className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        Edit
                      </Link>
                      <Button type="button" variant="outline" onClick={() => void removeProjectById(project.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
