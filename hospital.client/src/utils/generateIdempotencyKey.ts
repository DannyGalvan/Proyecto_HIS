/**
 * Generates a UUID v4 idempotency key using the Web Crypto API.
 * Use this before each payment submission to prevent duplicate operations.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
