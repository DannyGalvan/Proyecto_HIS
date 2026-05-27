import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIdempotencyKey } from "../useIdempotencyKey";

describe("useIdempotencyKey", () => {
  it("generates a UUID on mount", () => {
    const { result } = renderHook(() => useIdempotencyKey());
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(result.current.key).toMatch(uuidRegex);
  });

  it("regenerate produces a new key", () => {
    const { result } = renderHook(() => useIdempotencyKey());
    const firstKey = result.current.key;
    act(() => {
      result.current.regenerate();
    });
    expect(result.current.key).not.toBe(firstKey);
  });
});
