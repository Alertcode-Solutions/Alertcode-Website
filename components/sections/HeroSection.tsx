import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function HeroSection() {
  return (
    <Section id="top" className="flex min-h-[calc(100vh-72px)] items-center py-0">
      <Container>
        <div className="max-w-3xl space-y-7 sm:space-y-8">
          <h1 className="type-h1">Engineering Intelligent Digital Infrastructure</h1>
          <p className="type-body max-w-2xl">
            Alertcode engineers AI systems, blockchain architectures, and scalable digital platforms for
            long-term performance and strategic growth.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button>Explore Capabilities</Button>
            <Button variant="outline">Start a Project</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
