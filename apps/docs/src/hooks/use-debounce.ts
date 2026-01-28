/**
 * Debounce hook for delaying value updates.
 */

import { useEffect, useState } from "react";

/**
 * Debounce a value by the specified delay.
 * Returns the debounced value that only updates after the delay has passed
 * without any new value being set.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
