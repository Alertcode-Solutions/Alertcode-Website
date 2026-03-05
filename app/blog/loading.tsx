import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Skeleton from "@/components/ui/Skeleton";

export default function BlogLoading() {
  return (
    <Section>
      <Container>
        <div className="space-y-10 sm:space-y-12">
          <header className="space-y-4">
            <Skeleton className="h-12 w-full max-w-sm" />
            <Skeleton className="h-6 w-full max-w-3xl" />
          </header>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="surface-card p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-7 w-11/12" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                </div>
                <Skeleton className="mt-6 h-11 w-28" />
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
