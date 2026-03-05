"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type ProjectViewTrackerProps = {
  slug: string;
  title: string;
};

export default function ProjectViewTracker({ slug, title }: ProjectViewTrackerProps) {
  useEffect(() => {
    trackEvent("project_viewed", {
      slug,
      title,
    });
  }, [slug, title]);

  return null;
}
