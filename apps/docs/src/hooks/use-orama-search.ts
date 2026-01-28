/**
 * Custom hook for Orama Cloud search with proper typing.
 */

"use client";

import type { OramaCloud } from "@orama/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { createContentHighlighter } from "@/lib/orama/highlighter";
import type { SortedResult } from "@/lib/orama/types";
import { useDebounce } from "./use-debounce";

/**
 * Document structure returned from Orama search.
 */
interface OramaIndexDocument {
  id: string;
  title: string;
  url: string;
  page_id: string;
  content: string;
  section?: string;
  section_id?: string;
  breadcrumbs?: string[];
}

/**
 * Hit from Orama search response.
 */
interface SearchHit {
  id: string;
  score: number;
  document: OramaIndexDocument;
}

/**
 * Group from Orama grouped search response.
 */
interface SearchGroup {
  id: string[];
  result: SearchHit[];
}

/**
 * Orama search response structure.
 */
interface SearchResponse {
  count: number;
  hits?: SearchHit[];
  groups?: SearchGroup[];
}

/**
 * Hook options.
 */
interface UseOramaSearchOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Filter by tag */
  tag?: string;
  /** Maximum results per page group */
  maxResultsPerPage?: number;
}

/**
 * Hook return type.
 */
interface UseOramaSearchReturn {
  search: string;
  setSearch: (value: string) => void;
  isLoading: boolean;
  results: SortedResult[] | "empty";
  error: Error | undefined;
}

/**
 * Custom hook for Orama search with debouncing and result transformation.
 */
export function useOramaSearch(
  client: OramaCloud,
  dataSourceId: string,
  options: UseOramaSearchOptions = {},
): UseOramaSearchReturn {
  const { debounceMs = 100, tag, maxResultsPerPage = 7 } = options;

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SortedResult[] | "empty">("empty");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const debouncedSearch = useDebounce(search, debounceMs);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(
    async (query: string) => {
      // Cancel any pending search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (query.trim().length === 0) {
        setResults("empty");
        setError(undefined);
        return;
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(undefined);

      try {
        const response = await client.search({
          term: query,
          datasources: [dataSourceId],
          where: tag ? { tag } : undefined,
          groupBy: {
            properties: ["page_id"],
            max_results: maxResultsPerPage,
          },
          limit: 20,
        });

        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const searchResponse = response as unknown as SearchResponse;
        const highlighter = createContentHighlighter(query);
        const sortedResults: SortedResult[] = [];

        // Process grouped results if available
        if (searchResponse.groups && searchResponse.groups.length > 0) {
          for (const group of searchResponse.groups) {
            let addedPageHeader = false;

            for (const hit of group.result) {
              const doc = hit.document;

              // Add page header for first hit in group
              if (!addedPageHeader) {
                sortedResults.push({
                  id: doc.page_id,
                  type: "page",
                  content: doc.title,
                  breadcrumbs: doc.breadcrumbs,
                  contentWithHighlights: highlighter.highlight(doc.title),
                  url: doc.url,
                });
                addedPageHeader = true;
              }

              // Add content result
              const isHeading = doc.content === doc.section;
              const resultUrl = doc.section_id
                ? `${doc.url}#${doc.section_id}`
                : doc.url;

              sortedResults.push({
                id: doc.id,
                content: doc.content,
                contentWithHighlights: highlighter.highlight(doc.content),
                type: isHeading ? "heading" : "text",
                url: resultUrl,
              });
            }
          }
        } else if (searchResponse.hits && searchResponse.hits.length > 0) {
          // Fallback: manually group hits by page_id
          const grouped = new Map<string, SearchHit[]>();

          for (const hit of searchResponse.hits) {
            const pageId = hit.document.page_id || hit.document.url;
            const existing = grouped.get(pageId);
            if (existing) {
              existing.push(hit);
            } else {
              grouped.set(pageId, [hit]);
            }
          }

          for (const [pageId, hits] of grouped) {
            const firstHit = hits[0];
            if (!firstHit) continue;

            const firstDoc = firstHit.document;

            // Add page result
            sortedResults.push({
              id: pageId,
              type: "page",
              content: firstDoc.title,
              breadcrumbs: firstDoc.breadcrumbs,
              contentWithHighlights: highlighter.highlight(firstDoc.title),
              url: firstDoc.url,
            });

            // Add content results
            for (const hit of hits) {
              const doc = hit.document;

              if (doc.section || doc.content !== doc.title) {
                const isHeading = doc.content === doc.section;
                const resultUrl = doc.section_id
                  ? `${doc.url}#${doc.section_id}`
                  : doc.url;

                sortedResults.push({
                  id: doc.id,
                  type: isHeading ? "heading" : "text",
                  content: doc.content,
                  contentWithHighlights: highlighter.highlight(doc.content),
                  url: resultUrl,
                });
              }
            }
          }
        }

        setResults(sortedResults.length > 0 ? sortedResults : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err : new Error("Search failed"));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [client, dataSourceId, tag, maxResultsPerPage],
  );

  useEffect(() => {
    performSearch(debouncedSearch);
  }, [debouncedSearch, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    search,
    setSearch,
    isLoading,
    results,
    error,
  };
}
