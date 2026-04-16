import { useEffect, useState } from 'react';
import cie10Data from '../data/cie10.json';

export interface Cie10Item {
  code: string;
  description: string;
}

const dataset: Cie10Item[] = cie10Data as Cie10Item[];

/**
 * Searches the bundled CIE-10 dataset with a 300ms debounce.
 * No external API call is made — the dataset is a static JSON file.
 *
 * @param query - The search string (matches code or description, case-insensitive)
 * @returns `suggestions` — matching CIE-10 items; `isLoading` — true during debounce
 */
export function useCie10Autocomplete(query: string): {
  suggestions: Cie10Item[];
  isLoading: boolean;
} {
  const [suggestions, setSuggestions] = useState<Cie10Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(() => {
      try {
        const lower = trimmed.toLowerCase();
        const results = dataset.filter(
          (item) =>
            item.code.toLowerCase().includes(lower) ||
            item.description.toLowerCase().includes(lower),
        );
        setSuggestions(results.slice(0, 20));
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  return { suggestions, isLoading };
}
