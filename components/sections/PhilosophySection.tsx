import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const principles = [
  "Intelligence-first engineering",
  "Decentralized trust systems",
  "Infrastructure designed for scale",
];

export default function PhilosophySection() {
  return (
    <Section id="philosophy">
      <Container>
        <Reveal className="space-y-8 sm:space-y-10">
          <h2 className="type-h2 max-w-3xl">{"We don\u2019t build features. We architect systems."}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {principles.map((principle) => (
              <article key={principle} className="surface-card p-6">
                <h3 className="type-h3">{principle}</h3>
              </article>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
