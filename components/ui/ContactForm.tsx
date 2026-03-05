"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";

type FormState = {
  name: string;
  email: string;
  company: string;
  project: string;
  budget: string;
  timeline: string;
  website: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUDGET_OPTIONS = ["Under $5k", "$5k - $20k", "$20k - $50k", "$50k+"] as const;
const TIMELINE_OPTIONS = ["1 month", "1-3 months", "3-6 months", "Flexible"] as const;

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  project: "",
  budget: "",
  timeline: "",
  website: "",
};

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const project = formData.project.trim();

    if (!name || !email || !project) {
      setError("Please complete all required fields.");
      setSuccess("");
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }

    if (formData.budget && !BUDGET_OPTIONS.includes(formData.budget as (typeof BUDGET_OPTIONS)[number])) {
      setError("Please choose a valid budget range.");
      setSuccess("");
      return;
    }

    if (formData.timeline && !TIMELINE_OPTIONS.includes(formData.timeline as (typeof TIMELINE_OPTIONS)[number])) {
      setError("Please choose a valid timeline.");
      setSuccess("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          company: formData.company.trim(),
          project,
          budget: formData.budget,
          timeline: formData.timeline,
          website: formData.website,
        }),
      });

      const payload = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Unable to submit inquiry right now.");
        return;
      }

      setSuccess("Message sent successfully.");
      setFormData(initialState);
    } catch {
      setError("Unable to submit inquiry right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className="text-sm font-medium">
          Company (optional)
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          value={formData.company}
          onChange={(event) => setFormData((prev) => ({ ...prev, company: event.target.value }))}
          className="w-full min-h-11 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="project" className="text-sm font-medium">
          Project Description
        </label>
        <textarea
          id="project"
          name="project"
          rows={6}
          value={formData.project}
          onChange={(event) => setFormData((prev) => ({ ...prev, project: event.target.value }))}
          className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="budget" className="text-sm font-medium">
            Budget Range
          </label>
          <select
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={(event) => setFormData((prev) => ({ ...prev, budget: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <option value="">Select budget</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="timeline" className="text-sm font-medium">
            Timeline
          </label>
          <select
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={(event) => setFormData((prev) => ({ ...prev, timeline: event.target.value }))}
            className="w-full min-h-11 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <option value="">Select timeline</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(event) => setFormData((prev) => ({ ...prev, website: event.target.value }))}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" aria-live="polite" className="text-sm text-foreground">
          {success}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} aria-label="Submit project inquiry form">
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}

