import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkAutolinkHeadings from "remark-autolink-headings";
import remarkHtml from "remark-html";
import remarkSlug from "remark-slug";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 200;

type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
};

export type BlogPostMeta = BlogFrontmatter & {
  readingTime: string;
};

export type BlogTocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

export type BlogPost = BlogPostMeta & {
  contentHtml: string;
  tableOfContents: BlogTocItem[];
};

export type EditableBlogPost = BlogFrontmatter & {
  content: string;
};

export type BlogPostInput = {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
  content: string;
};

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function validateSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

function sanitizeInput(input: BlogPostInput): BlogPostInput {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    date: input.date.trim(),
    author: input.author.trim(),
    slug: normalizeSlug(input.slug),
    content: normalizeLineEndings(input.content),
  };
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return !Number.isNaN(timestamp);
}

function assertValidInput(input: BlogPostInput): void {
  if (!input.title) {
    throw new Error("Title is required.");
  }

  if (!input.description) {
    throw new Error("Description is required.");
  }

  if (!input.author) {
    throw new Error("Author is required.");
  }

  if (!input.slug) {
    throw new Error("Slug is required.");
  }

  if (!validateSlug(input.slug)) {
    throw new Error("Slug must contain lowercase letters, numbers, and hyphens only.");
  }

  if (!input.date || !isValidIsoDate(input.date)) {
    throw new Error("Date must be in YYYY-MM-DD format.");
  }

  if (!input.content) {
    throw new Error("Markdown content is required.");
  }
}

function buildPostFilePath(slug: string): string {
  const safeSlug = normalizeSlug(slug);

  if (!validateSlug(safeSlug)) {
    throw new Error("Invalid slug.");
  }

  return path.join(BLOG_CONTENT_DIR, `${safeSlug}.md`);
}

function readFrontmatterString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return "";
}

function parseFrontmatter(fileName: string, content: string): BlogFrontmatter {
  const { data } = matter(content);

  const frontmatter = data as Record<string, unknown>;

  const title = readFrontmatterString(frontmatter.title);
  const description = readFrontmatterString(frontmatter.description);
  const date = readFrontmatterString(frontmatter.date);
  const author = readFrontmatterString(frontmatter.author);
  const slug = normalizeSlug(readFrontmatterString(frontmatter.slug));

  if (!title || !description || !date || !author || !slug) {
    throw new Error(`Invalid blog frontmatter in ${fileName}. Required fields: title, description, date, author, slug.`);
  }

  if (!validateSlug(slug)) {
    throw new Error(`Invalid slug in ${fileName}.`);
  }

  return { title, description, date, author, slug };
}

function toMarkdown(post: BlogPostInput): string {
  return `---\ntitle: ${post.title}\ndescription: ${post.description}\ndate: ${post.date}\nauthor: ${post.author}\nslug: ${post.slug}\n---\n\n${post.content}\n`;
}

async function listMarkdownFiles(): Promise<string[]> {
  const entries = await fs.readdir(BLOG_CONTENT_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => entry.name);
}

async function ensureBlogDirectory(): Promise<void> {
  await fs.mkdir(BLOG_CONTENT_DIR, { recursive: true });
}

export function calculateReadingTime(content: string): string {
  const words = content
    .replace(/[#>*`_\-\[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

function extractTableOfContents(contentHtml: string): BlogTocItem[] {
  const toc: BlogTocItem[] = [];
  const headingRegex = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;

  let match: RegExpExecArray | null = headingRegex.exec(contentHtml);

  while (match) {
    const level = Number(match[1]) as 2 | 3;
    const id = match[2]?.trim();
    const rawTitle = match[3] ?? "";
    const title = rawTitle.replace(/<[^>]+>/g, "").trim();

    if (id && title) {
      toc.push({ id, title, level });
    }

    match = headingRegex.exec(contentHtml);
  }

  return toc;
}

async function renderMarkdownToHtml(content: string): Promise<string> {
  const processed = await remark()
    .use(remarkSlug as never)
    .use(remarkAutolinkHeadings as never, {
      behavior: "append",
      content: {
        type: "text",
        value: " #",
      },
      properties: {
        className: ["anchor-link"],
      },
    })
    .use(remarkHtml, { sanitize: true })
    .process(content);

  return processed.toString();
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  await ensureBlogDirectory();
  const fileNames = await listMarkdownFiles();

  const posts = await Promise.all(
    fileNames.map(async (fileName) => {
      const fullPath = path.join(BLOG_CONTENT_DIR, fileName);
      const fileContent = await fs.readFile(fullPath, "utf8");
      const parsed = matter(fileContent);
      const metadata = parseFrontmatter(fileName, fileContent);

      return {
        ...metadata,
        readingTime: calculateReadingTime(parsed.content),
      };
    }),
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  const filePath = buildPostFilePath(normalizedSlug);

  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const parsed = matter(fileContent);
    const metadata = parseFrontmatter(path.basename(filePath), fileContent);
    const contentHtml = await renderMarkdownToHtml(parsed.content);

    return {
      ...metadata,
      readingTime: calculateReadingTime(parsed.content),
      contentHtml,
      tableOfContents: extractTableOfContents(contentHtml),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

export async function getEditablePostBySlug(slug: string): Promise<EditableBlogPost | undefined> {
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  const filePath = buildPostFilePath(normalizedSlug);

  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const parsed = matter(fileContent);
    const metadata = parseFrontmatter(path.basename(filePath), fileContent);

    return {
      ...metadata,
      content: normalizeLineEndings(parsed.content),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

export async function createPost(input: BlogPostInput): Promise<BlogPostMeta> {
  await ensureBlogDirectory();
  const sanitized = sanitizeInput(input);
  assertValidInput(sanitized);

  const filePath = buildPostFilePath(sanitized.slug);

  try {
    await fs.access(filePath);
    throw new Error("A post with this slug already exists.");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await fs.writeFile(filePath, toMarkdown(sanitized), "utf8");

  return {
    title: sanitized.title,
    description: sanitized.description,
    date: sanitized.date,
    author: sanitized.author,
    slug: sanitized.slug,
    readingTime: calculateReadingTime(sanitized.content),
  };
}

export async function updatePostBySlug(slug: string, input: BlogPostInput): Promise<BlogPostMeta | undefined> {
  await ensureBlogDirectory();

  const currentSlug = normalizeSlug(slug);
  if (!currentSlug) {
    return undefined;
  }

  const existingPath = buildPostFilePath(currentSlug);

  try {
    await fs.access(existingPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }

    throw error;
  }

  const sanitized = sanitizeInput(input);
  assertValidInput(sanitized);

  const targetPath = buildPostFilePath(sanitized.slug);

  if (sanitized.slug !== currentSlug) {
    try {
      await fs.access(targetPath);
      throw new Error("A post with this slug already exists.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  await fs.writeFile(targetPath, toMarkdown(sanitized), "utf8");

  if (targetPath !== existingPath) {
    await fs.unlink(existingPath);
  }

  return {
    title: sanitized.title,
    description: sanitized.description,
    date: sanitized.date,
    author: sanitized.author,
    slug: sanitized.slug,
    readingTime: calculateReadingTime(sanitized.content),
  };
}

export async function deletePostBySlug(slug: string): Promise<boolean> {
  await ensureBlogDirectory();
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    return false;
  }

  const filePath = buildPostFilePath(normalizedSlug);

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}


