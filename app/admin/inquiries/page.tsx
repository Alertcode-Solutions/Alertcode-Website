import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getInquiries } from "@/lib/inquiries";

export const metadata: Metadata = {
  title: "Admin Inquiries",
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

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <Section className="py-10">
      <Container>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="type-h2">Project Inquiries</h2>
            <p className="type-body">Lead capture submissions from the project inquiry form.</p>
          </div>

          {inquiries.length === 0 ? (
            <p className="type-body">No inquiries yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-card/80 text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Timeline</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="border-t border-border align-top">
                      <td className="px-4 py-3 text-foreground">{inquiry.name}</td>
                      <td className="px-4 py-3 text-foreground">{inquiry.email}</td>
                      <td className="px-4 py-3 text-muted">{inquiry.company || "-"}</td>
                      <td className="px-4 py-3 text-muted">{inquiry.budget || "-"}</td>
                      <td className="px-4 py-3 text-muted">{inquiry.timeline || "-"}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(inquiry.createdAt)}</td>
                      <td className="px-4 py-3 text-muted">
                        <details>
                          <summary className="cursor-pointer text-foreground">View</summary>
                          <p className="mt-2 max-w-lg whitespace-pre-wrap text-sm text-muted">{inquiry.project}</p>
                        </details>
                      </td>
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

