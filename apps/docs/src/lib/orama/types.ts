/**
 * Type definitions for Orama Cloud search integration.
 * Based on fumadocs-core search types with strong typing.
 */

import type { StructuredData } from "fumadocs-core/mdx-plugins";

/**
 * Document structure for indexing in Orama Cloud.
 * This is the format used when syncing documents to Orama.
 */
export interface OramaDocument {
  /** Unique ID for the document (typically the page URL) */
  id: string;
  /** Page title */
  title: string;
  /** Optional page description */
  description?: string;
  /** URL to the page */
  url: string;
  /** Structured data extracted from MDX content */
  structured: StructuredData;
  /** Optional tag for filtering results */
  tag?: string;
  /** Additional data to add to each section index */
  extra_data?: Record<string, unknown>;
  /** Navigation breadcrumbs */
  breadcrumbs?: string[];
}

/**
 * Index entry stored in Orama Cloud.
 * Each document is split into multiple index entries.
 */
export interface OramaIndex {
  /** Unique ID for the index entry */
  id: string;
  /** Page title */
  title: string;
  /** Page URL */
  url: string;
  /** Optional tag for filtering */
  tag?: string;
  /** Page ID for grouping results */
  page_id: string;
  /** Heading content (if this entry is under a heading) */
  section?: string;
  /** Navigation breadcrumbs */
  breadcrumbs?: string[];
  /** Heading anchor ID (for deep linking) */
  section_id?: string;
  /** Searchable content text */
  content: string;
}

/**
 * Individual search hit from Orama API.
 */
export interface OramaHit {
  /** Hit ID */
  id: string;
  /** Index ID */
  index_id: string;
  /** Relevance score */
  score: number;
  /** The matched document */
  document: OramaIndex;
}

/**
 * Group of search hits (when using groupBy).
 */
export interface OramaGroup {
  /** Group identifier (page_id) */
  id: string[];
  /** Hits within this group */
  result: OramaHit[];
}

/**
 * Complete search response from Orama API.
 */
export interface OramaSearchResponse {
  /** Total hit count */
  count: number;
  /** Individual hits (when not using groupBy) */
  hits: OramaHit[];
  /** Grouped results (when using groupBy) */
  groups?: OramaGroup[];
  /** Facet data */
  facets?: Record<string, unknown>;
  /** Query processing time in ms */
  elapsed?: {
    raw: number;
    formatted: string;
  };
}

/**
 * Highlighted text segment for search result display.
 */
export interface HighlightedText {
  /** Segment type */
  type: "text";
  /** Text content */
  content: string;
  /** Optional styling */
  styles?: {
    highlight?: boolean;
  };
}

/**
 * Sorted search result for UI display.
 */
export interface SortedResult {
  /** Unique identifier */
  id: string;
  /** Result URL */
  url: string;
  /** Result type */
  type: "page" | "heading" | "text";
  /** Display content */
  content: string;
  /** Navigation breadcrumbs */
  breadcrumbs?: string[];
  /** Content with search term highlighting */
  contentWithHighlights?: HighlightedText[];
}

/**
 * Search hook return type.
 */
export interface UseOramaSearchResult {
  /** Current search query */
  search: string;
  /** Function to update search query */
  setSearch: (value: string) => void;
  /** Whether a search is in progress */
  isLoading: boolean;
  /** Search results or 'empty' if no search performed */
  results: SortedResult[] | "empty";
  /** Any error that occurred */
  error: Error | undefined;
}

/**
 * Options for the search function.
 */
export interface SearchOptions {
  /** Filter by tag */
  tag?: string;
  /** Maximum results per page group */
  maxResultsPerPage?: number;
  /** Total result limit */
  limit?: number;
}
