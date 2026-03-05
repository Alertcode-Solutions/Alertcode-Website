import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getProjectBySlug } from "@/lib/projects";
import EditProjectForm from "./EditProjectForm";

type EditProjectPageProps = {
  params: {
    slug: string;
  };
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <Section className="py-10">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="type-h2">Edit Project</h2>
          <EditProjectForm
            initialValues={{
              id: project.id,
              title: project.title,
              slug: project.slug,
              industry: project.industry,
              description: project.description,
              problem: project.problem,
              solution: project.solution,
              features: project.features,
              results: project.results,
              technologies: project.technologies.join(", "),
              outcome: project.outcome,
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
