"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type BlogShareActionsProps = {
  articleUrl: string;
  title: string;
};

export default function BlogShareActions({ articleUrl, title }: BlogShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(title)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2" aria-label="Share this article">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Share on X
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Share on LinkedIn
      </a>
      <Button type="button" variant="outline" onClick={() => void copyLink()} aria-label="Copy article link">
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
