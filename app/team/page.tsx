import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { communityContributors, coreTeam } from "@/lib/team";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the engineers and builders behind Alertcode and its technology ecosystem.",
  alternates: {
    canonical: "/team",
  },
  openGraph: {
    title: "Team | Alertcode",
    description: "Meet the engineers and builders behind Alertcode and its technology ecosystem.",
    url: "/team",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team | Alertcode",
    description: "Meet the engineers and builders behind Alertcode and its technology ecosystem.",
  },
};

export default function TeamPage() {
  return (
    <>
      <Section>
        <Container>
          <header className="mx-auto max-w-4xl space-y-4 text-center">
            <h1 className="type-h1">The People Behind Alertcode</h1>
            <p className="type-body">
              Engineers, builders, and innovators shaping the future of digital infrastructure.
            </p>
          </header>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="space-y-8">
            <h2 className="type-h2 text-center">Core Team</h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {coreTeam.map((member) => (
                <article key={member.name} className="surface-card flex h-full flex-col p-5">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border border-border">
                    <Image
                      src={member.image}
                      alt={`${member.name} profile photo`}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-4 space-y-1 text-center">
                    <h3 className="type-h3">{member.name}</h3>
                    <p className="type-body-sm">{member.role}</p>
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      LinkedIn
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      GitHub
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="space-y-6">
            <h2 className="type-h2 text-center">Community Contributors</h2>
            <p className="mx-auto max-w-4xl text-center type-body">
              Alertcode grows through an ecosystem of developers contributing to projects, open-source initiatives,
              and community programs.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {communityContributors.map((contributor) => (
                <article key={contributor.name} className="surface-card p-5">
                  <h3 className="type-h3">{contributor.name}</h3>
                  <p className="mt-3 type-body-sm">{contributor.focus}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
