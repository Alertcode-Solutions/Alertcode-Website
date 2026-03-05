"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project } from "@/lib/projects";

type WorkProjectsClientProps = {
  projects: Project[];
  technologies: string[];
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

const categoryFilters = ["AI", "Blockchain", "Web", "Automation"];

export default function WorkProjectsClient({ projects, technologies }: WorkProjectsClientProps) {
  const filterOptions = useMemo(() => {
    const combined = new Set<string>(["All", ...categoryFilters, ...technologies]);
    return Array.from(combined);
  }, [technologies]);

  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") {
      return projects;
    }

    const normalizedFilter = normalize(activeFilter);

    return projects.filter((project) => {
      const inTechnology = project.technologies.some((tech) => normalize(tech).includes(normalizedFilter));
      const inIndustry = normalize(project.industry).includes(normalizedFilter);
      const inDescription = normalize(project.description).includes(normalizedFilter);
      return inTechnology || inIndustry || inDescription;
    });
  }, [activeFilter, projects]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2" aria-label="Project filters">
        {filterOptions.map((filter) => {
          const isActive = filter === activeFilter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`inline-flex min-h-10 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {filteredProjects.length === 0 ? (
        <p className="type-body">No projects found for this filter.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <article key={project.id} className="surface-card flex h-full flex-col p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="type-h3 text-foreground">{project.title}</h2>
                  <p className="text-sm font-medium uppercase tracking-wide text-muted">{project.industry}</p>
                </div>
                <p className="type-body-sm">{project.description}</p>
                <ul className="flex flex-wrap gap-2" aria-label={`${project.title} technology stack`}>
                  {project.technologies.map((tech) => (
                    <li
                      key={`${project.id}-${tech}`}
                      className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  View Case Study
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

