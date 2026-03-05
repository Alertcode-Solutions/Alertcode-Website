import type { Metadata } from "next";
import ContactForm from "@/components/ui/ContactForm";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start your next project with Alertcode. Contact us to build AI systems, blockchain infrastructure, and modern web platforms.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Alertcode",
    description:
      "Start your next project with Alertcode. Contact us to build AI systems, blockchain infrastructure, and modern web platforms.",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Alertcode",
    description:
      "Start your next project with Alertcode. Contact us to build AI systems, blockchain infrastructure, and modern web platforms.",
  },
};

export default function ContactPage() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl space-y-10 sm:space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="type-h1">Start a Project</h1>
            <p className="type-body">
              Tell us about your idea or project. Our team will get back to you soon.
            </p>
          </div>

          <ContactForm />

          <div className="space-y-4 border-t border-border/80 pt-8 text-center">
            <h2 className="type-h3">Other Ways to Reach Us</h2>
            <div className="space-y-2">
              <p className="type-body-sm">contact@alertcode.dev</p>
              <p className="type-body-sm">Indore, India</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
