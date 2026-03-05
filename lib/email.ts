import { Resend } from "resend";
import { logError, logInfo, logWarn } from "@/lib/logger";

type ContactNotificationInput = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

type ProjectNotificationInput = {
  title: string;
  slug: string;
  industry: string;
};

type BlogNotificationInput = {
  title: string;
  slug: string;
  author: string;
  date: string;
};

type InquiryNotificationInput = {
  name: string;
  email: string;
  company?: string;
  project: string;
  budget?: string;
  timeline?: string;
};

function getRecipientEmail(): string {
  return process.env.CONTACT_EMAIL?.trim() ?? "";
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

async function sendEmail(subject: string, body: string): Promise<boolean> {
  const recipientEmail = getRecipientEmail();

  if (!recipientEmail) {
    logWarn("email.recipient_missing", { subject });
    return false;
  }

  const client = getResendClient();

  if (!client) {
    logWarn("email.api_key_missing", { subject });
    return false;
  }

  try {
    await client.emails.send({
      from: "Alertcode Notifications <onboarding@resend.dev>",
      to: recipientEmail,
      subject,
      text: body,
    });

    logInfo("email.sent", { subject, to: recipientEmail });
    return true;
  } catch (error) {
    logError("email.send_failed", {
      subject,
      to: recipientEmail,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return false;
  }
}

export async function sendContactNotification(input: ContactNotificationInput): Promise<boolean> {
  return sendEmail(
    "New Contact Request",
    [
      "A new contact request was submitted.",
      "",
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Project Type: ${input.projectType}`,
      "",
      "Message:",
      input.message,
    ].join("\n"),
  );
}

export async function sendProjectCreatedNotification(input: ProjectNotificationInput): Promise<boolean> {
  return sendEmail(
    "New Project Created",
    [
      "A new project entry was created in admin.",
      "",
      `Title: ${input.title}`,
      `Slug: ${input.slug}`,
      `Industry: ${input.industry}`,
      `URL: /work/${input.slug}`,
    ].join("\n"),
  );
}

export async function sendBlogPublishedNotification(input: BlogNotificationInput): Promise<boolean> {
  return sendEmail(
    "New Blog Post Published",
    [
      "A new blog post was published from admin.",
      "",
      `Title: ${input.title}`,
      `Slug: ${input.slug}`,
      `Author: ${input.author}`,
      `Date: ${input.date}`,
      `URL: /blog/${input.slug}`,
    ].join("\n"),
  );
}

export async function sendInquiryNotification(input: InquiryNotificationInput): Promise<boolean> {
  return sendEmail(
    "New Project Inquiry",
    [
      "A new project inquiry was submitted.",
      "",
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Company: ${input.company?.trim() || "N/A"}`,
      `Budget: ${input.budget?.trim() || "N/A"}`,
      `Timeline: ${input.timeline?.trim() || "N/A"}`,
      "",
      "Project Description:",
      input.project,
    ].join("\n"),
  );
}

