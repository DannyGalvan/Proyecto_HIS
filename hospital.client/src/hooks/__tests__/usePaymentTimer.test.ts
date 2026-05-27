import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePaymentTimer } from "../usePaymentTimer";

describe("usePaymentTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with minutes * 60 seconds", () => {
    const onExpiry = vi.fn();
    const { result } = renderHook(() => usePaymentTimer(10, onExpiry));
    expect(result.current.remaining).toBe(600);
    expect(result.current.isExpired).toBe(false);
  });

  it("decrements remaining every second", () => {
    const onExpiry = vi.fn();
    const { result } = renderHook(() => usePaymentTimer(1, onExpiry));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.remaining).toBe(57);
  });

  it("calls onExpiry when timer reaches zero", () => {
    const onExpiry = vi.fn();
    const { result } = renderHook(() => usePaymentTimer(1, onExpiry));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.isExpired).toBe(true);
    expect(onExpiry).toHaveBeenCalledTimes(1);
  });

  it("does not call onExpiry before timer reaches zero", () => {
    const onExpiry = vi.fn();
    renderHook(() => usePaymentTimer(1, onExpiry));

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(onExpiry).not.toHaveBeenCalled();
  });
});
