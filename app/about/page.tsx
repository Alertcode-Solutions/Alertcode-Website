import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Alertcode, a technology architecture studio building AI systems, blockchain infrastructure, and scalable digital platforms.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | Alertcode",
    description:
      "Learn about Alertcode, a technology architecture studio building AI systems, blockchain infrastructure, and scalable digital platforms.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Alertcode",
    description:
      "Learn about Alertcode, a technology architecture studio building AI systems, blockchain infrastructure, and scalable digital platforms.",
  },
};

const philosophyItems = [
  {
    title: "Intelligent Systems",
    description:
      "We design systems where intelligence and automation drive real-world impact.",
  },
  {
    title: "Decentralized Infrastructure",
    description:
      "We build trustless systems using blockchain technologies for transparency and security.",
  },
  {
    title: "Scalable Platforms",
    description:
      "Every platform we engineer is built to scale with performance, reliability, and longevity.",
  },
];

const technologyDomains = [
  "Artificial Intelligence",
  "Blockchain Infrastructure",
  "Modern Web Platforms",
  "Automation Systems",
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <Container>
          <div className="mx-auto max-w-4xl space-y-5 text-center">
            <h1 className="type-h1">About Alertcode</h1>
            <p className="type-body">
              Engineering intelligent digital infrastructure with AI, blockchain, and modern web technologies.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-4xl space-y-5">
            <h2 className="type-h2 text-center">Our Mission</h2>
            <p className="type-body text-center">
              Alertcode is a technology architecture studio focused on building scalable digital ecosystems. We
              engineer AI systems, blockchain infrastructures, and modern platforms designed for startups and
              forward-thinking organizations.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="space-y-8">
            <h2 className="type-h2 text-center">Our Philosophy</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {philosophyItems.map((item) => (
                <article key={item.title} className="surface-card p-6">
                  <h3 className="type-h3">{item.title}</h3>
                  <p className="mt-3 type-body-sm">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-4xl space-y-5 text-center">
            <h2 className="type-h2">Alertcode 3.0 Ecosystem</h2>
            <p className="type-body">
              Beyond engineering products, Alertcode is building a developer ecosystem. Through the Alertcode
              3.0 community we help developers learn emerging technologies, build real-world systems, and unlock
              new opportunities in the modern digital economy.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="space-y-8">
            <h2 className="type-h2 text-center">Technology Focus</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {technologyDomains.map((domain) => (
                <article key={domain} className="surface-card p-5 text-center">
                  <h3 className="type-h3">{domain}</h3>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <h2 className="type-h2">Let’s build the future together.</h2>
            <Link href="/contact" aria-label="Start a project with Alertcode">
              <Button>Start a Project</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
