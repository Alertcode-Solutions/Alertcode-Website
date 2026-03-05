"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_SECTIONS = ["work", "community", "contact"] as const;

type SectionId = (typeof DEFAULT_SECTIONS)[number];

export function useScrollSpy(sectionIds: readonly string[] = DEFAULT_SECTIONS): string {
  const normalizedSectionIds = useMemo(() => [...sectionIds], [sectionIds]);
  const [activeSection, setActiveSection] = useState<string>(normalizedSectionIds[0] ?? "");

  useEffect(() => {
    if (typeof window === "undefined" || normalizedSectionIds.length === 0) {
      return;
    }

    const visibleRatios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;

          if (!id) {
            continue;
          }

          visibleRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let nextActive = normalizedSectionIds[0] ?? "";
        let highestRatio = -1;

        for (const id of normalizedSectionIds) {
          const ratio = visibleRatios.get(id) ?? 0;

          if (ratio > highestRatio) {
            highestRatio = ratio;
            nextActive = id;
          }
        }

        setActiveSection((current) => (current === nextActive ? current : nextActive));
      },
      {
        root: null,
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const id of normalizedSectionIds) {
      const element = document.getElementById(id);

      if (!element) {
        continue;
      }

      visibleRatios.set(id, 0);
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [normalizedSectionIds]);

  return activeSection;
}

export type { SectionId };
