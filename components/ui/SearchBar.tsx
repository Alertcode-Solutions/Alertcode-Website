"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/ui/Skeleton";
import type { SearchIndexItem } from "@/lib/search";

type SearchBarProps = {
  items: SearchIndexItem[];
  isLoading: boolean;
  autoFocus?: boolean;
  onNavigate: () => void;
  onRequestClose: () => void;
};

const typeLabelMap: Record<SearchIndexItem["type"], string> = {
  project: "Projects",
  blog: "Blog Posts",
  page: "Pages",
};

export default function SearchBar({ items, isLoading, autoFocus = false, onNavigate, onRequestClose }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items;
    }

    return items.filter((item) => {
      const title = item.title.toLowerCase();
      const description = item.description.toLowerCase();
      return title.includes(normalized) || description.includes(normalized);
    });
  }, [items, query]);

  const grouped = useMemo(() => {
    return {
      project: filtered.filter((item) => item.type === "project"),
      blog: filtered.filter((item) => item.type === "blog"),
      page: filtered.filter((item) => item.type === "page"),
    };
  }, [filtered]);

  const flatResults = useMemo(() => [...grouped.project, ...grouped.blog, ...grouped.page], [grouped]);

  const openResult = (item: SearchIndexItem) => {
    router.push(item.url);
    onNavigate();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onRequestClose();
      return;
    }

    if (flatResults.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % flatResults.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + flatResults.length) % flatResults.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = flatResults[activeIndex];

      if (selected) {
        openResult(selected);
      }
    }
  };

  const sectionOrder: SearchIndexItem["type"][] = ["project", "blog", "page"];
  let runningIndex = -1;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="global-search-input" className="text-sm font-medium text-muted">
          Search across projects, insights, and pages
        </label>
        <input
          id="global-search-input"
          type="text"
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search content..."
          className="w-full min-h-12 rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>

      <div className="search-results-scroll isolated-scroll max-h-[70vh] overflow-y-auto overflow-x-hidden overscroll-contain rounded-md border border-border bg-card p-3">
        {isLoading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <p className="px-1 py-2 text-sm text-muted">No results found.</p>
        ) : null}

        {!isLoading && filtered.length > 0 ? (
          <div className="space-y-4">
            {sectionOrder.map((type) => {
              const results = grouped[type];

              if (results.length === 0) {
                return null;
              }

              return (
                <section key={type} className="space-y-2">
                  <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{typeLabelMap[type]}</h3>
                  <ul className="space-y-1" role="listbox" aria-label={typeLabelMap[type]}>
                    {results.map((item) => {
                      runningIndex += 1;
                      const currentIndex = runningIndex;
                      const isActive = activeIndex === currentIndex;

                      return (
                        <li key={`${item.type}-${item.url}`}>
                          <button
                            type="button"
                            onClick={() => openResult(item)}
                            className={`w-full rounded-md border px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                              isActive
                                ? "border-primary/60 bg-primary/10"
                                : "border-transparent hover:border-border hover:bg-background/70"
                            }`}
                          >
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="mt-1 text-xs text-muted">{item.description}</p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

