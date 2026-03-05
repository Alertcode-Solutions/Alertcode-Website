import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const ecosystemPillars = [
  {
    title: "Learn",
    description: "Structured pathways for mastering emerging technologies and systems thinking.",
  },
  {
    title: "Build",
    description: "Hands-on engineering environments to transform ideas into deployable infrastructure.",
  },
  {
    title: "Earn",
    description: "Value-driven opportunities through contribution, innovation, and technical execution.",
  },
  {
    title: "Collaborate",
    description: "A connected network of builders, mentors, and strategic partners creating at scale.",
  },
];

export default function CommunitySection() {
  return (
    <Section id="community">
      <Container>
        <Reveal className="space-y-8 sm:space-y-10">
          <h2 className="type-h2">{"Alertcode 3.0 \u2014 Developer Ecosystem"}</h2>
          <p className="type-body max-w-3xl">
            Learn. Build. Earn. Collaborate. Alertcode 3.0 connects ambitious developers with systems,
            mentorship, and opportunities designed for long-term technical growth.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ecosystemPillars.map((pillar) => (
              <article key={pillar.title} className="surface-card p-6">
                <h3 className="type-h3">{pillar.title}</h3>
                <p className="mt-3 type-body-sm">{pillar.description}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
