/**
 * Type-safe environment variable access for Orama Cloud configuration.
 * Throws meaningful errors if required variables are missing.
 */

interface OramaEnvironment {
  projectId: string;
  publicApiKey: string;
  privateApiKey: string | undefined;
  dataSourceId: string;
}

interface OramaClientEnvironment {
  projectId: string;
  apiKey: string;
  dataSourceId: string;
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return undefined;
  }
  return value;
}

/**
 * Get all Orama environment variables with validation.
 * Use this for admin/sync operations.
 */
export function getOramaEnvironment(): OramaEnvironment {
  return {
    projectId: getRequiredEnvVar("NEXT_PUBLIC_ORAMA_PROJECT_ID"),
    publicApiKey: getRequiredEnvVar("NEXT_PUBLIC_ORAMA_API_KEY"),
    privateApiKey: getOptionalEnvVar("ORAMA_PRIVATE_API_KEY"),
    dataSourceId: getRequiredEnvVar("NEXT_PUBLIC_ORAMA_DATASOURCE_ID"),
  };
}

/**
 * Get environment variables for the Orama client.
 * Uses private API key if available (for admin operations), otherwise public key.
 */
export function getOramaClientEnvironment(): OramaClientEnvironment {
  const env = getOramaEnvironment();
  return {
    projectId: env.projectId,
    apiKey: env.privateApiKey ?? env.publicApiKey,
    dataSourceId: env.dataSourceId,
  };
}

/**
 * Check if we have admin credentials for syncing.
 */
export function hasAdminCredentials(): boolean {
  const privateApiKey = getOptionalEnvVar("ORAMA_PRIVATE_API_KEY");
  return privateApiKey !== undefined;
}

/**
 * Get environment for sync operations. Validates private key exists.
 */
export function getSyncEnvironment(): {
  projectId: string;
  privateApiKey: string;
  dataSourceId: string;
} {
  const projectId = getRequiredEnvVar("NEXT_PUBLIC_ORAMA_PROJECT_ID");
  const privateApiKey = getOptionalEnvVar("ORAMA_PRIVATE_API_KEY");
  const dataSourceId = getRequiredEnvVar("NEXT_PUBLIC_ORAMA_DATASOURCE_ID");

  if (privateApiKey === undefined) {
    throw new Error("ORAMA_PRIVATE_API_KEY is required for sync operations");
  }

  return { projectId, privateApiKey, dataSourceId };
}
