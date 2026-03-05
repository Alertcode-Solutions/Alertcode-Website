import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import BlogPostForm from "../BlogPostForm";

export default function NewAdminBlogPostPage() {
  return (
    <Section className="py-10">
      <Container>
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="type-h2">Create Blog Post</h2>
          <BlogPostForm mode="create" />
        </div>
      </Container>
    </Section>
  );
}
