import * as fs from "node:fs/promises";
import { OramaCloud } from "@orama/core";
import { type OramaDocument, sync } from "fumadocs-core/search/orama-cloud";

/**
 * Sync search indexes to Orama Cloud.
 * Reads the pre-rendered static.json from the Next.js build output
 * and uploads to Orama Cloud.
 */
async function updateSearchIndexes(): Promise<void> {
  // Validate environment variables
  const apiKey = process.env.ORAMA_PRIVATE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_ORAMA_PROJECT_ID;
  const dataSourceId = process.env.NEXT_PUBLIC_ORAMA_DATASOURCE_ID;

  if (!apiKey || !projectId || !dataSourceId) {
    console.log("Missing Orama credentials, skipping sync");
    console.log(`  ORAMA_PRIVATE_API_KEY: ${apiKey ? "set" : "missing"}`);
    console.log(
      `  NEXT_PUBLIC_ORAMA_PROJECT_ID: ${projectId ? "set" : "missing"}`,
    );
    console.log(
      `  NEXT_PUBLIC_ORAMA_DATASOURCE_ID: ${dataSourceId ? "set" : "missing"}`,
    );
    return;
  }

  // Read the pre-rendered search index
  const staticJsonPath = ".next/server/app/static.json.body";

  try {
    const content = await fs.readFile(staticJsonPath);
    const records: OramaDocument[] = JSON.parse(content.toString());

    // Create Orama client with private API key for admin operations
    const orama = new OramaCloud({
      projectId,
      apiKey,
    });

    // Sync documents to Orama Cloud
    await sync(orama, {
      index: dataSourceId,
      documents: records,
    });

    console.log(`Search indexes synced: ${records.length} records`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      console.error(
        `Error: ${staticJsonPath} not found. Run 'next build' first.`,
      );
    } else {
      console.error("Error syncing search indexes:", error);
    }
    process.exit(1);
  }
}

void updateSearchIndexes();
