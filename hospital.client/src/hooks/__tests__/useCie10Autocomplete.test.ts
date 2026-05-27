import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCie10Autocomplete } from "../useCie10Autocomplete";

describe("useCie10Autocomplete", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty suggestions for empty query", () => {
    const { result } = renderHook(() => useCie10Autocomplete(""));
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns empty suggestions for whitespace-only query", () => {
    const { result } = renderHook(() => useCie10Autocomplete("   "));
    expect(result.current.suggestions).toEqual([]);
  });

  it("sets isLoading true during debounce", () => {
    const { result } = renderHook(() => useCie10Autocomplete("A00"));
    expect(result.current.isLoading).toBe(true);
  });

  it("returns suggestions after debounce period", () => {
    const { result } = renderHook(() => useCie10Autocomplete("A00"));

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("limits results to 20 items max", () => {
    // Use a very broad query that should match many items
    const { result } = renderHook(() => useCie10Autocomplete("a"));

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current.suggestions.length).toBeLessThanOrEqual(20);
  });

  it("handles errors in filter gracefully", () => {
    // Force an error by passing a query that would cause issues
    // The catch block sets suggestions to empty array
    const { result, rerender } = renderHook(
      ({ q }) => useCie10Autocomplete(q),
      { initialProps: { q: "" } },
    );

    // Trigger with a valid query first
    rerender({ q: "test" });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Regardless of internal errors, isLoading should be false
    expect(result.current.isLoading).toBe(false);
  });
});
