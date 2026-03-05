import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getSubscribers } from "@/lib/subscribers";

export const metadata: Metadata = {
  title: "Admin Subscribers",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminSubscribersPage() {
  const subscribers = await getSubscribers();

  return (
    <Section className="py-10">
      <Container>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="type-h2">Subscribers</h2>
              <p className="type-body">Newsletter subscribers captured from the public site.</p>
            </div>

            <a
              href="/api/admin/subscribers/export"
              className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Export CSV
            </a>
          </div>

          {subscribers.length === 0 ? (
            <p className="type-body">No subscribers yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-card/80 text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Subscription Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-t border-border">
                      <td className="px-4 py-3 text-foreground">{subscriber.email}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(subscriber.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

