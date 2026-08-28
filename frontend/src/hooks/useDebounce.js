import { useState, useEffect } from 'react';

/**
 * Hook to debounce value changes
 * @param {any} value - Input value
 * @param {number} delay - Debounce delay in ms
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
