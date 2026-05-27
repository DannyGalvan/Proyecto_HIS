import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useReservationTimer } from "../useReservationTimer";

describe("useReservationTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with minutes * 60 seconds", () => {
    const onExpiry = vi.fn();
    const { result } = renderHook(() => useReservationTimer(5, onExpiry));
    expect(result.current.remaining).toBe(300);
    expect(result.current.isExpired).toBe(false);
  });

  it("decrements remaining every second", () => {
    const onExpiry = vi.fn();
    const { result } = renderHook(() => useReservationTimer(1, onExpiry));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.remaining).toBe(55);
  });

  it("calls onExpiry when timer reaches zero", () => {
    const onExpiry = vi.fn();
    const { result } = renderHook(() => useReservationTimer(1, onExpiry));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.isExpired).toBe(true);
    expect(onExpiry).toHaveBeenCalledTimes(1);
  });

  it("reset restarts the timer", () => {
    const onExpiry = vi.fn();
    const { result } = renderHook(() => useReservationTimer(1, onExpiry));

    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(result.current.remaining).toBe(30);

    act(() => {
      result.current.reset();
    });
    expect(result.current.remaining).toBe(60);
    expect(result.current.isExpired).toBe(false);
  });
});
