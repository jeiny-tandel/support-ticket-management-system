import { useState, useEffect } from 'react';

/**
 * Custom React hook that debounces any fast-changing value.
 * Updates the returned debounced value only after the specified delay
 * has passed without further value changes.
 *
 * @param value The value to debounce.
 * @param delay Delay in milliseconds (default: 350ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
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
