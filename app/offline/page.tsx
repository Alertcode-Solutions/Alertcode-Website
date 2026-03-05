import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function OfflinePage() {
  return (
    <Section className="min-h-screen flex items-center">
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">You are offline</h1>
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            Your internet connection is unavailable right now. Reconnect and reload to continue.
          </p>
          <form>
            <Button type="submit">Reload</Button>
          </form>
        </div>
      </Container>
    </Section>
  );
}
