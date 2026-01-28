"use client";

import { OramaCloud } from "@orama/core";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useMemo } from "react";
import { useOramaSearch } from "@/hooks/use-orama-search";

/**
 * Environment configuration for Orama.
 * Validated at component initialization.
 */
function getOramaConfig(): { client: OramaCloud; dataSourceId: string } {
  const projectId = process.env.NEXT_PUBLIC_ORAMA_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_ORAMA_API_KEY;
  const dataSourceId = process.env.NEXT_PUBLIC_ORAMA_DATASOURCE_ID;

  if (!projectId || !apiKey || !dataSourceId) {
    throw new Error(
      "Missing Orama configuration. Please set NEXT_PUBLIC_ORAMA_PROJECT_ID, NEXT_PUBLIC_ORAMA_API_KEY, and NEXT_PUBLIC_ORAMA_DATASOURCE_ID.",
    );
  }

  const client = new OramaCloud({
    projectId,
    apiKey,
  });

  return { client, dataSourceId };
}

// Initialize config at module level (will throw if env vars missing)
const oramaConfig = getOramaConfig();

export default function CustomSearchDialog(props: SharedProps) {
  // Memoize the client to prevent recreation on each render
  const { client, dataSourceId } = useMemo(() => oramaConfig, []);

  const { search, setSearch, isLoading, results } = useOramaSearch(
    client,
    dataSourceId,
    {
      debounceMs: 100,
      maxResultsPerPage: 7,
    },
  );

  return (
    <SearchDialog
      isLoading={isLoading}
      onSearchChange={setSearch}
      search={search}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={results !== "empty" ? results : null} />
        <SearchDialogFooter>
          <a
            className="ms-auto text-fd-muted-foreground text-xs"
            href="https://orama.com"
            rel="noreferrer noopener"
          >
            Search powered by Orama
          </a>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
