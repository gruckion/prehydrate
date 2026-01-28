/**
 * Orama Cloud client configuration.
 * Provides a properly configured client instance for search operations.
 */

import { OramaCloud } from "@orama/core";
import { getOramaClientEnvironment, hasAdminCredentials } from "./env";

let clientInstance: OramaCloud | null = null;
let dataSourceIdValue: string | null = null;

/**
 * Get or create the Orama Cloud client instance.
 * Uses lazy initialization to avoid issues during build time.
 */
export function getOramaClient(): OramaCloud {
  if (clientInstance === null) {
    const env = getOramaClientEnvironment();
    clientInstance = new OramaCloud({
      projectId: env.projectId,
      apiKey: env.apiKey,
    });
    dataSourceIdValue = env.dataSourceId;
  }
  return clientInstance;
}

/**
 * Get the data source ID.
 */
export function getDataSourceId(): string {
  if (dataSourceIdValue === null) {
    const env = getOramaClientEnvironment();
    dataSourceIdValue = env.dataSourceId;
  }
  return dataSourceIdValue;
}

/**
 * Check if admin operations are available.
 */
export function isAdmin(): boolean {
  return hasAdminCredentials();
}

/**
 * Create a new Orama client with specific credentials.
 * Useful for sync operations that need the private API key.
 */
export function createOramaClient(
  projectId: string,
  apiKey: string,
): OramaCloud {
  return new OramaCloud({
    projectId,
    apiKey,
  });
}
