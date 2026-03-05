import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Alertcode Community",
  description:
    "Join the Alertcode 3.0 developer ecosystem and collaborate on projects across AI, blockchain, and modern web technologies.",
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "Alertcode Community | Alertcode",
    description:
      "Join the Alertcode 3.0 developer ecosystem and collaborate on projects across AI, blockchain, and modern web technologies.",
    url: "/community",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alertcode Community | Alertcode",
    description:
      "Join the Alertcode 3.0 developer ecosystem and collaborate on projects across AI, blockchain, and modern web technologies.",
  },
};

const pillars = [
  {
    title: "Learn",
    description:
      "Master AI, blockchain, and modern web technologies through guided learning and hands-on practice.",
  },
  {
    title: "Build",
    description:
      "Work on real-world projects and collaborate with developers building innovative systems.",
  },
  {
    title: "Collaborate",
    description:
      "Connect with developers, founders, and builders within a growing technology community.",
  },
  {
    title: "Earn",
    description:
      "Unlock opportunities through freelancing, startup building, and ecosystem participation.",
  },
];

const activities = [
  "Hackathons",
  "Workshops",
  "Developer meetups",
  "Startup collaborations",
  "Open-source contributions",
];

export default function CommunityPage() {
  return (
    <>
      <Section>
        <Container>
          <div className="mx-auto max-w-4xl space-y-5 text-center">
            <h1 className="type-h1">Alertcode 3.0 Community</h1>
            <p className="type-body">
              A developer ecosystem focused on learning, building, and earning through modern technologies.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-4xl space-y-5">
            <h2 className="type-h2 text-center">Why Alertcode 3.0 Exists</h2>
            <p className="type-body text-center">
              Alertcode 3.0 is a developer ecosystem designed to help ambitious builders learn emerging
              technologies, collaborate on real-world projects, and unlock new opportunities in the modern
              digital economy.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="space-y-8">
            <h2 className="type-h2 text-center">Community Pillars</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="surface-card p-6">
                  <h3 className="type-h3">{pillar.title}</h3>
                  <p className="mt-3 type-body-sm">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-4xl space-y-8">
            <h2 className="type-h2 text-center">Community Activities</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Community activities list">
              {activities.map((activity) => (
                <li key={activity} className="surface-card px-4 py-3 text-sm font-medium text-foreground">
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <h2 className="type-h2">Join the Alertcode 3.0 Ecosystem</h2>
            <p className="type-body">
              Become part of a growing network of developers building the future of technology.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" aria-label="Join the Alertcode community">
                <Button>Join Community</Button>
              </Link>
              <Link href="/work" aria-label="Explore Alertcode projects">
                <Button variant="outline">Explore Projects</Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
