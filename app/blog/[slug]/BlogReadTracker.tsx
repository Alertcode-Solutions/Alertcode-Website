"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type BlogReadTrackerProps = {
  slug: string;
  title: string;
};

export default function BlogReadTracker({ slug, title }: BlogReadTrackerProps) {
  useEffect(() => {
    trackEvent("blog_read", {
      slug,
      title,
    });
  }, [slug, title]);

  return null;
}
