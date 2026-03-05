import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const capabilities = [
  {
    title: "AI & Automation Systems",
    description:
      "Design and deployment of intelligent workflows, decision engines, and automation systems aligned to business outcomes.",
    relatedWorkSlug: "ai-ops-intelligence-suite",
  },
  {
    title: "Blockchain Infrastructure",
    description:
      "Development of secure decentralized protocols, tokenized ecosystems, and trust-centric digital transaction layers.",
    relatedWorkSlug: "cross-chain-trust-layer",
  },
  {
    title: "Modern Platform Engineering",
    description:
      "Architecture of high-performance web platforms with resilient backends, clear interfaces, and scalable deployment strategy.",
    relatedWorkSlug: "scalable-platform-modernization",
  },
];

export default function CapabilitiesSection() {
  return (
    <Section id="work">
      <Container>
        <Reveal className="space-y-8 sm:space-y-10">
          <h2 className="type-h2">Core Capabilities</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map((item) => (
              <article key={item.title} className="surface-card p-6">
                <h3 className="type-h3">{item.title}</h3>
                <p className="mt-4 type-body-sm">{item.description}</p>
                <Link
                  href={`/work/${item.relatedWorkSlug}`}
                  className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  View Related Work
                </Link>
              </article>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
