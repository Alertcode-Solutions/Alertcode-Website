"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { trackError } from "@/lib/observability";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const pathname = usePathname();

  useEffect(() => {
    trackError("app.global_error", {
      message: error.message,
      digest: error.digest ?? "none",
      route: pathname ?? "unknown",
      timestamp: new Date().toISOString(),
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    });
  }, [error, pathname]);

  return (
    <Section className="min-h-screen flex items-center">
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="type-h1">Something went wrong.</h1>
          <p className="type-body">We could not complete this request.</p>
          <Button type="button" onClick={reset} aria-label="Retry this action">
            Retry
          </Button>
        </div>
      </Container>
    </Section>
  );
}
