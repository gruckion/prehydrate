import type { ReactNode, ComponentType } from 'react';

/**
 * Map of dependency names to their values (functions or constants)
 * These are serialized and made available in the inline script
 */
export type DependencyMap = Record<string, unknown>;

/**
 * Options for configuring prehydration behavior
 */
export interface PrehydrateOptions<T = unknown> {
  /**
   * Unique key identifying this prehydration instance
   * Used to generate the container ID
   */
  key: string;

  /**
   * Initial state value or factory function
   * - If a value: serialized as JSON for the inline script
   * - If a function: called at inline script execution time (useful for dynamic values like Date)
   */
  initialState?: T | (() => T);

  /**
   * Dependencies (functions or constants) to inject into the inline script
   * Useful for helper functions that compute derived state
   */
  deps?: DependencyMap;
}

/**
 * Props for the Prehydrate wrapper component
 */
export interface PrehydrateProps {
  children: ReactNode;
}

/**
 * Return value from the prehydrate() function
 */
export interface PrehydrateResult<T = unknown> {
  /**
   * Wrapper component that handles SSR rendering and inline script injection
   */
  Prehydrate: ComponentType<PrehydrateProps>;

  /**
   * Function to bind a state key to the prehydration system
   * - During generateDOMCode: returns { [key]: initialState }
   * - During normal renders: returns {} (component controls its own state)
   */
  bind: (key: string) => Record<string, T | undefined>;
}
