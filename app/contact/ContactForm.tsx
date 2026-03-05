"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";

type FormData = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

const initialData: FormData = {
  name: "",
  email: "",
  projectType: "AI & Automation",
  message: "",
};

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [error, setError] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { name, email, projectType, message } = formData;

    if (!name.trim() || !email.trim() || !projectType.trim() || !message.trim()) {
      setError("Please complete all required fields.");
      setIsSubmitted(false);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      setIsSubmitted(false);
      return;
    }

    setError("");
    setIsSubmitted(true);
    setFormData(initialData);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
          aria-invalid={Boolean(error) && !formData.name.trim()}
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
          aria-invalid={Boolean(error) && !formData.email.trim()}
          className="w-full min-h-11 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="projectType" className="text-sm font-medium">
          Project Type
        </label>
        <select
          id="projectType"
          name="projectType"
          value={formData.projectType}
          onChange={(event) => setFormData((prev) => ({ ...prev, projectType: event.target.value }))}
          className="w-full min-h-11 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          required
        >
          <option value="AI & Automation">AI & Automation</option>
          <option value="Blockchain Infrastructure">Blockchain Infrastructure</option>
          <option value="Platform Engineering">Platform Engineering</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
          aria-invalid={Boolean(error) && !formData.message.trim()}
          className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          required
        />
      </div>

      {error ? (
        <p id="contact-form-error" role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {isSubmitted ? (
        <p role="status" aria-live="polite" className="text-sm text-foreground">
          Thanks, your project request has been captured successfully.
        </p>
      ) : null}

      <Button type="submit" aria-label="Submit project inquiry form">
        Submit
      </Button>
    </form>
  );
}
