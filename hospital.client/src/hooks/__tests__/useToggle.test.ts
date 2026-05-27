import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useToggle } from "../useToggle";

describe("useToggle", () => {
  it("starts with open = false", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.open).toBe(false);
  });

  it("toggles to true on first call", () => {
    const { result } = renderHook(() => useToggle());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.open).toBe(true);
  });

  it("toggles back to false on second call", () => {
    const { result } = renderHook(() => useToggle());
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.toggle();
    });
    expect(result.current.open).toBe(false);
  });
});
