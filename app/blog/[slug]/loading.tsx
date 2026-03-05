import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Skeleton from "@/components/ui/Skeleton";

export default function BlogPostLoading() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-4xl space-y-10">
          <header className="space-y-4 border-b border-border pb-8">
            <Skeleton className="h-12 w-full max-w-3xl" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </header>

          <div className="space-y-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} className={`h-5 ${index % 3 === 0 ? "w-full" : "w-11/12"}`} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
