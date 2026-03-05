import { getAllPosts } from "@/lib/blog";
import { getProjects } from "@/lib/projects";

export type SearchItemType = "project" | "blog" | "page";

export type SearchIndexItem = {
  title: string;
  description: string;
  keywords: string[];
  type: SearchItemType;
  url: string;
};

const staticPages: SearchIndexItem[] = [
  {
    title: "About Alertcode",
    description: "Learn about Alertcode's mission, philosophy, and engineering focus.",
    keywords: ["about", "mission", "philosophy", "company"],
    type: "page",
    url: "/about",
  },
  {
    title: "Community",
    description: "Explore the Alertcode 3.0 developer ecosystem and activities.",
    keywords: ["community", "ecosystem", "developers", "events"],
    type: "page",
    url: "/community",
  },
  {
    title: "Contact",
    description: "Start a project with Alertcode and connect with our team.",
    keywords: ["contact", "project", "inquiry", "hire"],
    type: "page",
    url: "/contact",
  },
  {
    title: "Team",
    description: "Meet the people behind Alertcode.",
    keywords: ["team", "contributors", "builders"],
    type: "page",
    url: "/team",
  },
];

export async function getSearchIndex(): Promise<SearchIndexItem[]> {
  const [projects, posts] = await Promise.all([getProjects(), getAllPosts()]);

  const projectItems: SearchIndexItem[] = projects.map((project) => ({
    title: project.title,
    description: project.description,
    keywords: [project.industry, ...project.technologies, "work", "case study"],
    type: "project",
    url: `/work/${project.slug}`,
  }));

  const blogItems: SearchIndexItem[] = posts.map((post) => ({
    title: post.title,
    description: post.description,
    keywords: [post.author, "blog", "insights", "article"],
    type: "blog",
    url: `/blog/${post.slug}`,
  }));

  return [...projectItems, ...blogItems, ...staticPages];
}

