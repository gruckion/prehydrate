/**
 * Orama search integration barrel exports.
 */

// Client
export {
  createOramaClient,
  getDataSourceId,
  getOramaClient,
  isAdmin,
} from "./client";

// Environment
export {
  getOramaClientEnvironment,
  getOramaEnvironment,
  getSyncEnvironment,
  hasAdminCredentials,
} from "./env";

// Highlighter
export {
  type ContentHighlighter,
  createContentHighlighter,
} from "./highlighter";

// Types
export type {
  HighlightedText,
  OramaDocument,
  OramaGroup,
  OramaHit,
  OramaIndex,
  OramaSearchResponse,
  SearchOptions,
  SortedResult,
  UseOramaSearchResult,
} from "./types";

// Utils
export { getProperty, isNonEmptyString, removeUndefined } from "./utils";
