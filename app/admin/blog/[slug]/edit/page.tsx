import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getEditablePostBySlug } from "@/lib/blog";
import BlogPostForm from "@/app/admin/blog/BlogPostForm";

type EditAdminBlogPostPageProps = {
  params: {
    slug: string;
  };
};

export default async function EditAdminBlogPostPage({ params }: EditAdminBlogPostPageProps) {
  const post = await getEditablePostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <Section className="py-10">
      <Container>
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="type-h2">Edit Blog Post</h2>
          <BlogPostForm
            mode="edit"
            initialSlug={params.slug}
            initialValues={{
              title: post.title,
              description: post.description,
              author: post.author,
              date: post.date,
              slug: post.slug,
              content: post.content,
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
