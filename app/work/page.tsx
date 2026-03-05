import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getAllTechnologies, getProjects } from "@/lib/projects";
import WorkProjectsClient from "./WorkProjectsClient";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Explore projects and systems engineered by Alertcode across AI, blockchain, and modern web platforms.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work | Alertcode",
    description:
      "Explore projects and systems engineered by Alertcode across AI, blockchain, and modern web platforms.",
    url: "/work",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work | Alertcode",
    description:
      "Explore projects and systems engineered by Alertcode across AI, blockchain, and modern web platforms.",
  },
};

export default async function WorkPage() {
  const [projects, technologies] = await Promise.all([getProjects(), getAllTechnologies()]);

  return (
    <Section>
      <Container>
        <div className="space-y-10 sm:space-y-12">
          <header className="space-y-4">
            <h1 className="type-h1">Our Work</h1>
            <p className="type-body max-w-3xl">
              Selected projects and systems engineered by Alertcode.
            </p>
          </header>

          {projects.length === 0 ? (
            <p className="type-body">Projects coming soon.</p>
          ) : (
            <WorkProjectsClient projects={projects} technologies={technologies} />
          )}
        </div>
      </Container>
    </Section>
  );
}
