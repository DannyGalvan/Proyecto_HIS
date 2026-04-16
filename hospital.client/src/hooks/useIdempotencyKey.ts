import { useCallback, useState } from 'react';
import { generateIdempotencyKey } from '../utils/generateIdempotencyKey';

/**
 * Generates a UUID v4 idempotency key on mount.
 * Call `regenerate()` to get a fresh key for retry scenarios.
 */
export function useIdempotencyKey(): { key: string; regenerate: () => void } {
  const [key, setKey] = useState<string>(() => generateIdempotencyKey());

  const regenerate = useCallback(() => {
    setKey(generateIdempotencyKey());
  }, []);

  return { key, regenerate };
}
