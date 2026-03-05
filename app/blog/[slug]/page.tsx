import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { buildAbsoluteUrl } from "@/lib/config";
import BlogReadTracker from "./BlogReadTracker";
import BlogShareActions from "./BlogShareActions";

const BLOG_OG_IMAGE = "/icons/icon-512.png";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Insight Not Found",
      description: "The requested article could not be found.",
      alternates: {
        canonical: "/blog",
      },
    };
  }

  const postPath = `/blog/${post.slug}`;
  const articleUrl = buildAbsoluteUrl(postPath);
  const pageTitle = `${post.title} | Alertcode`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: postPath,
    },
    openGraph: {
      type: "article",
      url: articleUrl,
      title: pageTitle,
      description: post.description,
      authors: [post.author],
      publishedTime: new Date(`${post.date}T00:00:00.000Z`).toISOString(),
      images: [
        {
          url: BLOG_OG_IMAGE,
          width: 512,
          height: 512,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: post.description,
      images: [BLOG_OG_IMAGE],
    },
  };
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(new Date(date));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const articlePath = `/blog/${post.slug}`;
  const articleUrl = buildAbsoluteUrl(articlePath);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.date,
    description: post.description,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
  };

  return (
    <Section>
      <Container>
        <Script
          id={`blogposting-jsonld-${post.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
        />

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <article className="min-w-0 space-y-10">
            <BlogReadTracker slug={post.slug} title={post.title} />
            <header className="space-y-4 border-b border-border pb-8">
              <h1 className="type-h1">{post.title}</h1>
              <p className="text-sm font-medium uppercase tracking-wide text-muted">
                {post.author} · {formatDate(post.date)} · {post.readingTime}
              </p>
              <p className="type-body">{post.description}</p>
            </header>

            <div
              className="max-w-[75ch] space-y-6 text-[var(--text-base)] leading-[1.75] text-muted [&_.anchor-link]:ml-2 [&_.anchor-link]:text-muted [&_.anchor-link]:no-underline hover:[&_.anchor-link]:text-primary [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:border [&_code]:border-border [&_code]:bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-foreground [&_h2]:mt-12 [&_h2]:text-[clamp(var(--text-2xl),3.4vw,var(--text-4xl))] [&_h2]:font-semibold [&_h2]:leading-[1.2] [&_h2]:tracking-[-0.02em] [&_h3]:mt-10 [&_h3]:text-[clamp(var(--text-lg),2.1vw,var(--text-xl))] [&_h3]:font-semibold [&_h3]:leading-[1.3] [&_h3]:tracking-[-0.01em] [&_li]:leading-7 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:leading-8 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-card [&_pre]:p-4 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            <footer className="space-y-4 border-t border-border pt-8">
              <h2 className="type-h3">Share this insight</h2>
              <BlogShareActions articleUrl={articleUrl} title={post.title} />
            </footer>
          </article>

          {post.tableOfContents.length > 0 ? (
            <aside className="hidden lg:sticky lg:top-28 lg:block">
              <nav aria-label="Table of contents" className="surface-card space-y-3 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">On this page</p>
                <ul className="space-y-2">
                  {post.tableOfContents.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "pl-4" : "pl-0"}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

