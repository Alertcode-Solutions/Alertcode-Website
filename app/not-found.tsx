import Link from "next/link";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function NotFoundPage() {
  return (
    <Section className="min-h-[calc(100vh-72px)] flex items-center">
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="type-h1">Page Not Found</h1>
          <p className="type-body">The page you are looking for does not exist.</p>
          <Link
            href="/"
            aria-label="Return home"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Return Home
          </Link>
        </div>
      </Container>
    </Section>
  );
}
