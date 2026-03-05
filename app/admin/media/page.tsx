import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import AdminMediaClient from "./AdminMediaClient";

export const metadata: Metadata = {
  title: "Admin Media",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminMediaPage() {
  return (
    <Section className="py-10">
      <Container>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="type-h2">Media Library</h2>
            <p className="type-body">Upload and manage image assets for blog posts, projects, and team profiles.</p>
          </div>

          <AdminMediaClient />
        </div>
      </Container>
    </Section>
  );
}

