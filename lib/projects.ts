import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type Project = {
  id: string;
  slug: string;
  title: string;
  industry: string;
  description: string;
  problem: string;
  solution: string;
  features: string;
  results: string;
  technologies: string[];
  outcome: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectInput = {
  slug: string;
  title: string;
  industry: string;
  description: string;
  problem: string;
  solution: string;
  features: string;
  results: string;
  technologies: string[];
  outcome: string;
};

const seedProjects: ProjectInput[] = [
  {
    slug: "ai-ops-intelligence-suite",
    title: "AI Ops Intelligence Suite",
    industry: "Enterprise SaaS",
    description:
      "A unified operations intelligence platform that automated incident triage, reduced manual escalations, and improved uptime across distributed teams.",
    problem:
      "Operations teams were overwhelmed by noisy alerts and fragmented diagnostics across multiple monitoring systems.",
    solution:
      "Alertcode engineered a centralized intelligence layer that prioritized incidents, automated root-cause suggestions, and routed tasks to the right teams.",
    features:
      "AI-powered incident scoring\nCross-service telemetry aggregation\nAutomated escalation routing\nSLA-focused alert workflows",
    results:
      "Mean-time-to-resolution dropped by 42%, on-call fatigue reduced significantly, and SLA compliance reached 99.95%.",
    technologies: ["AI", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "OpenAI APIs"],
    outcome:
      "Cut mean-time-to-resolution by 42% and increased SLA compliance to 99.95% within one quarter.",
  },
  {
    slug: "cross-chain-trust-layer",
    title: "Cross-Chain Trust Layer",
    industry: "Fintech",
    description:
      "A blockchain infrastructure layer enabling secure settlement and verifiable data exchange between private and public networks.",
    problem:
      "Settlement systems across networks lacked a shared trust model, causing reconciliation delays and audit complexity.",
    solution:
      "Alertcode built a cross-chain trust and validation layer with deterministic proofs and unified settlement orchestration.",
    features:
      "Cross-chain verification protocol\nProof-based reconciliation\nSettlement orchestration service\nCompliance-ready audit logs",
    results:
      "Settlement reconciliation moved from multi-day windows to near real-time, with improved traceability for compliance teams.",
    technologies: ["Blockchain", "Solidity", "Node.js", "GraphQL", "Redis", "AWS"],
    outcome:
      "Reduced settlement reconciliation time from days to minutes with auditable transaction integrity.",
  },
  {
    slug: "scalable-platform-modernization",
    title: "Scalable Platform Modernization",
    industry: "Digital Commerce",
    description:
      "A full-stack modernization program replacing legacy monolith services with resilient, modular infrastructure and modern developer tooling.",
    problem:
      "Legacy monolith architecture slowed release cycles and created frequent reliability bottlenecks during traffic spikes.",
    solution:
      "Alertcode redesigned the platform into modular services, introduced progressive rollout pipelines, and standardized observability.",
    features:
      "Service modularization roadmap\nProgressive deployment controls\nUnified observability stack\nDeveloper platform automation",
    results:
      "Release velocity increased 3x while incident frequency and infrastructure overhead were both reduced.",
    technologies: ["Web", "Next.js", "React", "TypeScript", "Go", "Kubernetes"],
    outcome:
      "Improved release velocity by 3x while lowering platform downtime and infrastructure overhead.",
  },
];

let seedPromise: Promise<void> | null = null;

const projectSelect = {
  id: true,
  slug: true,
  title: true,
  industry: true,
  description: true,
  problem: true,
  solution: true,
  features: true,
  results: true,
  technologies: true,
  outcome: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

function cleanString(value: string): string {
  return value.trim();
}

function cleanTechnologies(technologies: string[]): string[] {
  return technologies.map((technology) => technology.trim()).filter(Boolean);
}

function serializeTechnologies(technologies: string[]): string {
  return JSON.stringify(cleanTechnologies(technologies));
}

function deserializeTechnologies(technologies: string): string[] {
  try {
    const parsed = JSON.parse(technologies) as unknown;

    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }

    return [];
  } catch {
    return technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

type ProjectRecord = Prisma.ProjectGetPayload<{ select: typeof projectSelect }>;

function mapProject(record: ProjectRecord): Project {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    industry: record.industry,
    description: record.description,
    problem: record.problem,
    solution: record.solution,
    features: record.features,
    results: record.results,
    technologies: deserializeTechnologies(record.technologies),
    outcome: record.outcome,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function ensureSeedData(): Promise<void> {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    const total = await db.project.count();

    if (total > 0) {
      return;
    }

    await db.project.createMany({
      data: seedProjects.map((project) => ({
        slug: cleanString(project.slug),
        title: cleanString(project.title),
        industry: cleanString(project.industry),
        description: cleanString(project.description),
        problem: cleanString(project.problem),
        solution: cleanString(project.solution),
        features: cleanString(project.features),
        results: cleanString(project.results),
        technologies: serializeTechnologies(project.technologies),
        outcome: cleanString(project.outcome),
      })),
    });
  })();

  await seedPromise;
}

export async function getProjects(): Promise<Project[]> {
  await ensureSeedData();

  const projects = await db.project.findMany({
    select: projectSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map((project) => mapProject(project));
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  await ensureSeedData();

  const project = await db.project.findUnique({
    select: projectSelect,
    where: {
      slug: cleanString(slug),
    },
  });

  return project ? mapProject(project) : undefined;
}

export async function getAllTechnologies(): Promise<string[]> {
  const projects = await getProjects();
  const unique = new Set<string>();

  for (const project of projects) {
    for (const technology of project.technologies) {
      const normalized = technology.trim();

      if (normalized) {
        unique.add(normalized);
      }
    }
  }

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const project = await db.project.create({
    select: projectSelect,
    data: {
      slug: cleanString(input.slug),
      title: cleanString(input.title),
      industry: cleanString(input.industry),
      description: cleanString(input.description),
      problem: cleanString(input.problem),
      solution: cleanString(input.solution),
      features: cleanString(input.features),
      results: cleanString(input.results),
      technologies: serializeTechnologies(input.technologies),
      outcome: cleanString(input.outcome),
    },
  });

  return mapProject(project);
}

export async function updateProject(
  id: string,
  updates: Partial<ProjectInput>,
): Promise<Project | undefined> {
  const projectId = cleanString(id);

  if (!projectId) {
    return undefined;
  }

  try {
    const updated = await db.project.update({
      select: projectSelect,
      where: {
        id: projectId,
      },
      data: {
        slug: updates.slug ? cleanString(updates.slug) : undefined,
        title: updates.title ? cleanString(updates.title) : undefined,
        industry: updates.industry ? cleanString(updates.industry) : undefined,
        description: updates.description ? cleanString(updates.description) : undefined,
        problem: updates.problem ? cleanString(updates.problem) : undefined,
        solution: updates.solution ? cleanString(updates.solution) : undefined,
        features: updates.features ? cleanString(updates.features) : undefined,
        results: updates.results ? cleanString(updates.results) : undefined,
        technologies: updates.technologies ? serializeTechnologies(updates.technologies) : undefined,
        outcome: updates.outcome ? cleanString(updates.outcome) : undefined,
      },
    });

    return mapProject(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return undefined;
    }

    throw error;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  const projectId = cleanString(id);

  if (!projectId) {
    return false;
  }

  try {
    await db.project.delete({
      where: {
        id: projectId,
      },
    });

    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return false;
    }

    throw error;
  }
}

