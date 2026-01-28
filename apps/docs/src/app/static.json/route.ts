import type { OramaDocument } from "fumadocs-core/search/orama-cloud";
import { source } from "@/lib/source";

export const revalidate = false;

export function GET(): Response {
  const pages = source.getPages();

  const results: OramaDocument[] = pages.map((page) => {
    return {
      id: page.url,
      structured: page.data.structuredData,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
    };
  });

  return Response.json(results);
}
