import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { buildAbsoluteUrl } from "@/lib/config";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import ProjectViewTracker from "./ProjectViewTracker";

type WorkPageProps = {
  params: {
    slug: string;
  };
};

const WORK_OG_IMAGE = "/icons/icon-512.png";

export const dynamicParams = false;
export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getProjects();

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: "Work Not Found",
      description: "The requested work case study could not be found.",
      alternates: {
        canonical: "/work",
      },
    };
  }

  const projectPath = `/work/${project.slug}`;
  const pageTitle = `${project.title} Case Study | Alertcode`;
  const pageDescription = project.description;

  return {
    title: `${project.title} Case Study`,
    description: pageDescription,
    alternates: {
      canonical: projectPath,
    },
    openGraph: {
      type: "article",
      url: buildAbsoluteUrl(projectPath),
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: WORK_OG_IMAGE,
          width: 512,
          height: 512,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [WORK_OG_IMAGE],
    },
  };
}

function getFeatureItems(features: string): string[] {
  return features
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function WorkProjectPage({ params }: WorkPageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const featureItems = getFeatureItems(project.features);

  return (
    <Section>
      <Container>
        <article className="mx-auto max-w-3xl space-y-10 sm:space-y-12">
          <ProjectViewTracker slug={project.slug} title={project.title} />

          <header className="space-y-4 border-b border-border/80 pb-8">
            <h1 className="type-h1">{project.title}</h1>
            <p className="type-body">{project.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium uppercase tracking-wide text-muted">
              <span>{project.industry}</span>
              <span>•</span>
              <span>{project.technologies.join(", ")}</span>
            </div>
          </header>

          <section className="space-y-3">
            <h2 className="type-h2">Problem</h2>
            <p className="type-body">{project.problem}</p>
          </section>

          <section className="space-y-3">
            <h2 className="type-h2">Solution</h2>
            <p className="type-body">{project.solution}</p>
          </section>

          <section className="space-y-3">
            <h2 className="type-h2">Key Features</h2>
            {featureItems.length > 0 ? (
              <ul className="list-inside list-disc space-y-2 text-base text-muted">
                {featureItems.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p className="type-body">{project.features}</p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="type-h2">Results</h2>
            <p className="type-body">{project.results}</p>
          </section>

          <section className="space-y-3">
            <h2 className="type-h3">Outcome Summary</h2>
            <p className="type-body">{project.outcome}</p>
          </section>

          <div>
            <Link
              href="/work"
              aria-label="Back to work page"
              className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Back to Work
            </Link>
          </div>
        </article>
      </Container>
    </Section>
  );
}
