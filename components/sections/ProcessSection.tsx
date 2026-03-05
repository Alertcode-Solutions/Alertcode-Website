import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const steps = [
  {
    title: "Strategic Discovery",
    description: "Define objectives, identify constraints, and establish the technical and operational direction.",
  },
  {
    title: "System Architecture",
    description: "Design robust foundations across infrastructure, data flow, and integration boundaries.",
  },
  {
    title: "Precision Engineering",
    description: "Implement production-grade systems with measurable quality, reliability, and maintainability.",
  },
  {
    title: "Continuous Optimization",
    description: "Iterate through monitoring, feedback, and refinement to sustain long-term performance.",
  },
];

export default function ProcessSection() {
  return (
    <Section id="process">
      <Container>
        <Reveal className="space-y-8 sm:space-y-10">
          <h2 className="type-h2">Engineering Methodology</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title} className="surface-card p-6">
                <p className="text-sm font-medium text-muted">Step {index + 1}</p>
                <h3 className="mt-3 type-h3">{step.title}</h3>
                <p className="mt-3 type-body-sm">{step.description}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
