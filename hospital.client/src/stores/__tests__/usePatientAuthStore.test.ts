import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { usePatientAuthStore } from "../usePatientAuthStore";

describe("usePatientAuthStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Reset store state
    act(() => {
      usePatientAuthStore.getState().logoutPatient();
    });
  });

  it("starts with loading true and isLoggedIn false", () => {
    const state = usePatientAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.token).toBe("");
  });

  it("signInPatient sets auth state and persists to localStorage", () => {
    act(() => {
      usePatientAuthStore.getState().signInPatient({
        isLoggedIn: true,
        token: "test-token",
        userId: 1,
        name: "Patient",
        email: "patient@test.com",
        userName: "patient1",
        timezoneIanaId: "America/Guatemala",
      });
    });

    const state = usePatientAuthStore.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.token).toBe("test-token");
    expect(state.name).toBe("Patient");
    expect(state.loading).toBe(false);

    const stored = JSON.parse(
      window.localStorage.getItem("@patient-auth") ?? "{}",
    );
    expect(stored.token).toBe("test-token");
  });

  it("logoutPatient clears state and removes from localStorage", () => {
    act(() => {
      usePatientAuthStore.getState().signInPatient({
        isLoggedIn: true,
        token: "test-token",
        userId: 1,
        name: "Patient",
        email: "patient@test.com",
        userName: "patient1",
        timezoneIanaId: "America/Guatemala",
      });
    });

    act(() => {
      usePatientAuthStore.getState().logoutPatient();
    });

    const state = usePatientAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.token).toBe("");
    expect(window.localStorage.getItem("@patient-auth")).toBeNull();
  });

  it("syncPatientAuth restores state from localStorage", () => {
    window.localStorage.setItem(
      "@patient-auth",
      JSON.stringify({
        isLoggedIn: true,
        token: "stored-token",
        userId: 5,
        name: "Stored Patient",
        email: "stored@test.com",
        userName: "stored1",
        timezoneIanaId: "America/Guatemala",
      }),
    );

    act(() => {
      usePatientAuthStore.getState().syncPatientAuth();
    });

    const state = usePatientAuthStore.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.token).toBe("stored-token");
    expect(state.loading).toBe(false);
  });

  it("syncPatientAuth handles malformed localStorage gracefully", () => {
    window.localStorage.setItem("@patient-auth", "not-json");

    act(() => {
      usePatientAuthStore.getState().syncPatientAuth();
    });

    const state = usePatientAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.loading).toBe(false);
  });

  it("syncPatientAuth resets to initial when no stored data", () => {
    act(() => {
      usePatientAuthStore.getState().syncPatientAuth();
    });

    const state = usePatientAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.loading).toBe(false);
  });
});
