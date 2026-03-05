import { db } from "@/lib/db";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  project: string;
  budget: string | null;
  timeline: string | null;
  createdAt: Date;
};

export type InquiryInput = {
  name: string;
  email: string;
  company?: string;
  project: string;
  budget?: string;
  timeline?: string;
};

type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  project: string;
  budget: string | null;
  timeline: string | null;
  createdAt: Date;
};

function mapInquiry(record: InquiryRecord): Inquiry {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    company: record.company,
    project: record.project,
    budget: record.budget,
    timeline: record.timeline,
    createdAt: record.createdAt,
  };
}

export async function getInquiries(): Promise<Inquiry[]> {
  const inquiries = await db.inquiry.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      project: true,
      budget: true,
      timeline: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return inquiries.map(mapInquiry);
}

export async function createInquiry(input: InquiryInput): Promise<Inquiry> {
  const created = await db.inquiry.create({
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      project: true,
      budget: true,
      timeline: true,
      createdAt: true,
    },
    data: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      company: input.company?.trim() || null,
      project: input.project.trim(),
      budget: input.budget?.trim() || null,
      timeline: input.timeline?.trim() || null,
    },
  });

  return mapInquiry(created);
}

