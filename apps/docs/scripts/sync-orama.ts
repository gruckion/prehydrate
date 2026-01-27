import { sync } from 'fumadocs-core/search/orama-cloud';
import * as fs from 'node:fs/promises';
import { OramaCloud } from '@orama/core';

async function updateSearchIndexes() {
  const apiKey = process.env.ORAMA_PRIVATE_API_KEY;

  if (!apiKey) {
    console.log('No ORAMA_PRIVATE_API_KEY found, skipping sync');
    return;
  }

  // Read the pre-rendered search index
  const content = await fs.readFile('.next/server/app/static.json.body');
  const records = JSON.parse(content.toString());

  const orama = new OramaCloud({
    projectId: 'ba9a6f25-29c4-4a38-b825-a1e6d8cd72d5',
    apiKey: apiKey,
  });

  await sync(orama, {
    index: 'ba9a6f25-29c4-4a38-b825-a1e6d8cd72d5',
    documents: records,
  });

  console.log(`Search indexes synced: ${records.length} records`);
}

void updateSearchIndexes();
