import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Skeleton from "@/components/ui/Skeleton";

export default function GlobalLoading() {
  return (
    <Section>
      <Container>
        <div className="space-y-10 sm:space-y-12">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full max-w-xl" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="surface-card p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-7 w-11/12" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-10/12" />
                </div>
                <Skeleton className="mt-6 h-11 w-36" />
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
