"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/ui/Skeleton";
import type { SearchIndexItem, SearchItemType } from "@/lib/search";

type SearchApiResponse = {
  success: boolean;
  data?: SearchIndexItem[];
  error?: string;
};

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

type MatchRange = [number, number];

type RankedResult = {
  item: SearchIndexItem;
  score: number;
  matchFields: string[];
  titleMatches: MatchRange[];
  descriptionMatches: MatchRange[];
};

const typeLabelMap: Record<SearchItemType, string> = {
  project: "Projects",
  blog: "Blog Posts",
  page: "Pages",
};

const SEARCH_INDEX_CACHE_KEY = "alertcode_search_index_v1";
const SEARCH_FETCH_TIMEOUT_MS = 7000;
const SEARCH_FETCH_RETRY_DELAYS_MS = [0, 300, 900];

function readCachedSearchIndex(): SearchIndexItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(SEARCH_INDEX_CACHE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as SearchIndexItem[];
  } catch {
    return [];
  }
}

function writeCachedSearchIndex(items: SearchIndexItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(SEARCH_INDEX_CACHE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolvePromise) => {
    window.setTimeout(resolvePromise, ms);
  });
}

function mergeRanges(ranges: MatchRange[]): MatchRange[] {
  if (ranges.length <= 1) {
    return ranges;
  }

  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: MatchRange[] = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const last = merged[merged.length - 1];

    if (current[0] <= last[1] + 1) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push([...current] as MatchRange);
    }
  }

  return merged;
}

function highlightByRanges(text: string, ranges: MatchRange[]): React.ReactNode {
  if (ranges.length === 0) {
    return text;
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  const merged = mergeRanges(ranges);

  merged.forEach((range, index) => {
    const [start, end] = range;

    if (cursor < start) {
      nodes.push(<span key={`text-${index}-${cursor}`}>{text.slice(cursor, start)}</span>);
    }

    nodes.push(
      <mark key={`mark-${index}-${start}`} className="rounded bg-primary/20 px-0.5 text-foreground">
        {text.slice(start, end + 1)}
      </mark>,
    );

    cursor = end + 1;
  });

  if (cursor < text.length) {
    nodes.push(<span key={`tail-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return nodes;
}

function rankResults(results: RankedResult[]): RankedResult[] {
  return [...results].sort((left, right) => {
    if (left.score !== right.score) {
      return left.score - right.score;
    }

    const leftTitle = left.matchFields.includes("title") ? 0 : 1;
    const rightTitle = right.matchFields.includes("title") ? 0 : 1;

    if (leftTitle !== rightTitle) {
      return leftTitle - rightTitle;
    }

    const leftDescription = left.matchFields.includes("description") ? 0 : 1;
    const rightDescription = right.matchFields.includes("description") ? 0 : 1;

    if (leftDescription !== rightDescription) {
      return leftDescription - rightDescription;
    }

    return left.item.title.localeCompare(right.item.title);
  });
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<SearchIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    const loadIndex = async () => {
      const cachedItems = readCachedSearchIndex();
      const hasCachedItems = cachedItems.length > 0;

      if (hasCachedItems) {
        setItems(cachedItems);
      }

      setIsLoading(!hasCachedItems);
      setLoadError(null);

      for (const delayMs of SEARCH_FETCH_RETRY_DELAYS_MS) {
        if (delayMs > 0) {
          await wait(delayMs);
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), SEARCH_FETCH_TIMEOUT_MS);

        try {
          const response = await fetch("/api/search", {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          });
          const payload = (await response.json()) as SearchApiResponse;

          if (!isMounted) {
            return;
          }

          if (response.ok && payload.success && payload.data) {
            setItems(payload.data);
            writeCachedSearchIndex(payload.data);
            setLoadError(null);
            setIsLoading(false);
            return;
          }
        } catch {
          // retry on transient failures
        } finally {
          window.clearTimeout(timeoutId);
        }
      }

      if (isMounted && !hasCachedItems) {
        setItems([]);
        setLoadError("Search is temporarily unavailable. Please try again.");
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    void loadIndex();

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery("");
    setActiveIndex(0);

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onEscape);
    };
  }, [onClose, open]);

  const fuse = useMemo(() => {
    if (items.length === 0) {
      return null;
    }

    return new Fuse(items, {
      includeScore: true,
      includeMatches: true,
      threshold: 0.38,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: "title", weight: 0.6 },
        { name: "description", weight: 0.3 },
        { name: "keywords", weight: 0.1 },
      ],
    });
  }, [items]);

  const rankedResults = useMemo(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return items.slice(0, 20).map((item) => ({
        item,
        score: 0,
        matchFields: ["title"],
        titleMatches: [],
        descriptionMatches: [],
      }));
    }

    if (!fuse) {
      return [];
    }

    const results = fuse.search(normalizedQuery, { limit: 30 }).map((result) => {
      const titleMatches: MatchRange[] = [];
      const descriptionMatches: MatchRange[] = [];
      const matchFields = Array.from(new Set((result.matches ?? []).map((match) => String(match.key))));

      (result.matches ?? []).forEach((match) => {
        if (match.key === "title") {
          match.indices.forEach((indices) => titleMatches.push([indices[0], indices[1]]));
        }

        if (match.key === "description") {
          match.indices.forEach((indices) => descriptionMatches.push([indices[0], indices[1]]));
        }
      });

      return {
        item: result.item,
        score: result.score ?? 1,
        matchFields,
        titleMatches,
        descriptionMatches,
      } satisfies RankedResult;
    });

    return rankResults(results);
  }, [fuse, items, query]);

  const groupedResults = useMemo(() => {
    return {
      project: rankedResults.filter((result) => result.item.type === "project"),
      blog: rankedResults.filter((result) => result.item.type === "blog"),
      page: rankedResults.filter((result) => result.item.type === "page"),
    };
  }, [rankedResults]);

  const flatResults = useMemo(() => rankedResults.map((result) => result.item), [rankedResults]);

  const openResult = (url: string) => {
    router.push(url);
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
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
        openResult(selected.url);
      }
    }
  };

  if (!open) {
    return null;
  }

  let currentIndex = -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[70] pointer-events-auto isolated-scroll flex items-center justify-center bg-background/80 px-4 py-6 opacity-100 backdrop-blur transition-opacity sm:py-10"
    >
      <div className="w-full max-w-3xl rounded-lg border border-border bg-background p-4 sm:p-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="global-search-input" className="text-sm font-medium text-muted">
              Search across projects, insights, and pages
            </label>
            <input
              ref={inputRef}
              id="global-search-input"
              type="text"
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

          <div
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="search-results-scroll isolated-scroll max-h-[70vh] overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth rounded-md border border-border bg-card p-3"
            aria-label="Search results"
          >
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

            {!isLoading && rankedResults.length === 0 && !loadError ? (
              <p className="px-1 py-2 text-sm text-muted">No results found.</p>
            ) : null}

            {!isLoading && loadError ? (
              <p className="px-1 py-2 text-sm text-muted">{loadError}</p>
            ) : null}

            {!isLoading && rankedResults.length > 0 ? (
              <div className="space-y-4">
                {(["project", "blog", "page"] as const).map((type) => {
                  const results = groupedResults[type];

                  if (results.length === 0) {
                    return null;
                  }

                  return (
                    <section key={type} className="space-y-2">
                      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{typeLabelMap[type]}</h3>
                      <ul className="space-y-1" role="listbox" aria-label={typeLabelMap[type]}>
                        {results.map((result) => {
                          currentIndex += 1;
                          const index = currentIndex;
                          const isActive = activeIndex === index;

                          return (
                            <li key={`${result.item.type}-${result.item.url}`}>
                              <button
                                type="button"
                                onClick={() => openResult(result.item.url)}
                                className={`w-full rounded-md border px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                  isActive
                                    ? "border-primary/60 bg-primary/10"
                                    : "border-transparent hover:border-border hover:bg-background/70"
                                }`}
                              >
                                <p className="text-sm font-medium text-foreground">
                                  {highlightByRanges(result.item.title, result.titleMatches)}
                                </p>
                                <p className="mt-1 text-xs text-muted">
                                  {highlightByRanges(result.item.description, result.descriptionMatches)}
                                </p>
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
      </div>
    </div>
  );
}

