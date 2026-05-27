import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useResponse } from "../useResponse";

describe("useResponse", () => {
  it("initializes with undefined dataResult and null success", () => {
    const { result } = renderHook(() => useResponse());
    expect(result.current.dataResult).toBeUndefined();
    expect(result.current.success).toBeNull();
    expect(result.current.fieldErrors).toBeUndefined();
    expect(result.current.apiMessage).toBe("");
  });

  it("handleApiResponse sets dataResult on success", () => {
    const { result } = renderHook(() => useResponse<{ id: number }, unknown>());

    act(() => {
      result.current.handleApiResponse({
        success: true,
        data: { id: 1 },
        message: "OK",
        totalResults: 1,
      });
    });

    expect(result.current.success).toBe(true);
    expect(result.current.dataResult).toEqual({ id: 1 });
    expect(result.current.apiMessage).toBe("OK");
  });

  it("handleApiResponse maps validation failures on failure", () => {
    const { result } = renderHook(() => useResponse<unknown, unknown>());

    act(() => {
      result.current.handleApiResponse({
        success: false,
        data: [
          { propertyName: "UserName", errorMessage: "Required" },
          { propertyName: "Email", errorMessage: "Invalid" },
        ] as any,
        message: "Validation failed",
        totalResults: 0,
      });
    });

    expect(result.current.success).toBe(false);
    expect(result.current.fieldErrors).toEqual({
      userName: "Required",
      email: "Invalid",
    });
    expect(result.current.apiMessage).toBe("Validation failed");
  });

  it("handleApiResponse handles null data on failure gracefully", () => {
    const { result } = renderHook(() => useResponse<unknown, unknown>());

    act(() => {
      result.current.handleApiResponse({
        success: false,
        data: null,
        message: "Error",
        totalResults: 0,
      });
    });

    expect(result.current.success).toBe(false);
    expect(result.current.apiMessage).toBe("Error");
  });

  it("setErrorsResponse updates fieldErrors directly", () => {
    const { result } = renderHook(() => useResponse());

    act(() => {
      result.current.setErrorsResponse({ name: "Required" });
    });

    expect(result.current.fieldErrors).toEqual({ name: "Required" });
  });
});
