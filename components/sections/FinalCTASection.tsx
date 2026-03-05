import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import NewsletterForm from "@/components/ui/NewsletterForm";
import Section from "@/components/ui/Section";

export default function FinalCTASection() {
  return (
    <Section id="contact">
      <Container>
        <Reveal className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-6 py-8 text-center sm:py-12">
            <h2 className="type-h2">{"Let\u2019s Architect What\u2019s Next."}</h2>
            <p className="type-body max-w-2xl">
              Build resilient, intelligent, and scalable digital infrastructure with a focused engineering
              partner.
            </p>
            <Button>Start a Project</Button>

            <div className="mt-8 w-full space-y-3 border-t border-border pt-8">
              <h3 className="type-h3">Stay Updated</h3>
              <p className="type-body">
                Receive insights, project updates, and ecosystem announcements from Alertcode.
              </p>
              <div className="flex justify-center">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

