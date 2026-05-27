import { describe, expect, it } from "vitest";

import { generateIdempotencyKey } from "../generateIdempotencyKey";

describe("generateIdempotencyKey", () => {
  it("returns a string in UUID v4 format", () => {
    const key = generateIdempotencyKey();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(key).toMatch(uuidRegex);
  });

  it("generates unique keys on each call", () => {
    const key1 = generateIdempotencyKey();
    const key2 = generateIdempotencyKey();
    expect(key1).not.toBe(key2);
  });
});
