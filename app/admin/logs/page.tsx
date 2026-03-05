import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getAdminLogs } from "@/lib/admin-log";

export const metadata: Metadata = {
  title: "Admin Logs",
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
    second: "2-digit",
  }).format(date);
}

function prettyMetadata(metadata: string): string {
  try {
    const parsed = JSON.parse(metadata) as unknown;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return metadata;
  }
}

export default async function AdminLogsPage() {
  const logs = await getAdminLogs();

  return (
    <Section className="py-10">
      <Container>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="type-h2">Admin Logs</h2>
            <p className="type-body">Immutable activity history for administrative actions.</p>
          </div>

          {logs.length === 0 ? (
            <p className="type-body">No admin activity logged yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-card/80 text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Metadata</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((entry) => (
                    <tr key={entry.id} className="border-t border-border align-top">
                      <td className="px-4 py-3 text-foreground">{entry.action}</td>
                      <td className="px-4 py-3 text-muted">
                        <pre className="max-w-lg overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed">
                          {prettyMetadata(entry.metadata)}
                        </pre>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(entry.createdAt)}</td>
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

