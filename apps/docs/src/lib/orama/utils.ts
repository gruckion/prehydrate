/**
 * Utility functions for Orama search.
 */

/**
 * Remove undefined values from an object.
 * Useful for cleaning up search parameters before sending to API.
 */
export function removeUndefined<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(obj) as Array<keyof T>) {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Check if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Safely access a property from an unknown object.
 */
export function getProperty<T>(obj: unknown, key: string): T | undefined {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return undefined;
  }
  return (obj as Record<string, unknown>)[key] as T | undefined;
}
