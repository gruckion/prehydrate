/**
 * Content highlighting utilities for search results.
 * Based on fumadocs-core search highlighter.
 */

import type { HighlightedText } from "./types";

/**
 * Escape special regex characters in a string.
 */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a regex pattern from a search query.
 * Splits query into terms and creates an OR pattern.
 */
function buildRegexFromQuery(query: string): RegExp | null {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const terms = Array.from(
    new Set(
      trimmed
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 0),
    ),
  );

  if (terms.length === 0) {
    return null;
  }

  const escaped = terms.map(escapeRegExp).join("|");
  return new RegExp(`(${escaped})`, "gi");
}

/**
 * Content highlighter interface.
 */
export interface ContentHighlighter {
  /**
   * Highlight matching terms in content.
   */
  highlight(content: string): HighlightedText[];
}

/**
 * Create a content highlighter for the given query.
 * The highlighter splits content into segments and marks matching terms.
 */
export function createContentHighlighter(
  query: string | RegExp,
): ContentHighlighter {
  const regex = typeof query === "string" ? buildRegexFromQuery(query) : query;

  return {
    highlight(content: string): HighlightedText[] {
      if (regex === null) {
        return [{ type: "text", content }];
      }

      const segments: HighlightedText[] = [];
      let lastIndex = 0;

      for (const match of content.matchAll(regex)) {
        const matchIndex = match.index;
        if (matchIndex === undefined) {
          continue;
        }

        // Add non-matching text before this match
        if (lastIndex < matchIndex) {
          segments.push({
            type: "text",
            content: content.substring(lastIndex, matchIndex),
          });
        }

        // Add the highlighted match
        segments.push({
          type: "text",
          content: match[0],
          styles: {
            highlight: true,
          },
        });

        lastIndex = matchIndex + match[0].length;
      }

      // Add remaining non-matching text
      if (lastIndex < content.length) {
        segments.push({
          type: "text",
          content: content.substring(lastIndex),
        });
      }

      // Return original content if no matches
      if (segments.length === 0) {
        return [{ type: "text", content }];
      }

      return segments;
    },
  };
}
