import { beforeEach, describe, expect, it, vi } from "vitest";

import { authInitialState } from "../../configs/constants";
import type { InitialAuth } from "../../types/InitialAuth";

// Mock setAuthorization
const mockSetAuthorization = vi.fn();
vi.mock("../../configs/axios/interceptors", () => ({
  setAuthorization: (...args: unknown[]) => mockSetAuthorization(...args),
}));

// Mock retrase to resolve immediately
vi.mock("../../utils/viewTransition", () => ({
  retrase: () => Promise.resolve(),
}));

// Import store after mocks are set up
import { useAuthStore } from "../useAuthStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    // Reset store to initial state
    useAuthStore.setState({
      authState: authInitialState,
      loading: true,
    });
  });

  describe("signIn", () => {
    it("should populate authState with provided auth data", () => {
      const loginData: InitialAuth = {
        isLoggedIn: true,
        email: "doctor@hospital.com",
        redirect: false,
        userName: "drsmith",
        name: "Dr. Smith",
        token: "jwt-token-123",
        userId: 42,
        operations: [],
        timezoneIanaId: "America/Guatemala",
      };

      useAuthStore.getState().signIn(loginData);

      const state = useAuthStore.getState();
      expect(state.authState.isLoggedIn).toBe(true);
      expect(state.authState.email).toBe("doctor@hospital.com");
      expect(state.authState.userName).toBe("drsmith");
      expect(state.authState.name).toBe("Dr. Smith");
      expect(state.authState.token).toBe("jwt-token-123");
      expect(state.authState.userId).toBe(42);
    });

    it('should set localStorage "@auth" with serialized state', () => {
      const loginData: InitialAuth = {
        isLoggedIn: true,
        email: "test@test.com",
        redirect: false,
        userName: "testuser",
        name: "Test User",
        token: "token-abc",
        userId: 1,
        operations: [],
        timezoneIanaId: "America/Guatemala",
      };

      useAuthStore.getState().signIn(loginData);

      const stored = window.localStorage.getItem("@auth");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.token).toBe("token-abc");
      expect(parsed.email).toBe("test@test.com");
      expect(parsed.isLoggedIn).toBe(true);
    });

    it("should call setAuthorization with the provided token", () => {
      const loginData: InitialAuth = {
        isLoggedIn: true,
        email: "user@hospital.com",
        redirect: false,
        userName: "user1",
        name: "User One",
        token: "my-jwt-token",
        userId: 5,
        operations: [],
        timezoneIanaId: "America/Guatemala",
      };

      useAuthStore.getState().signIn(loginData);

      expect(mockSetAuthorization).toHaveBeenCalledWith("my-jwt-token");
    });
  });

  describe("logout", () => {
    it("should reset state to authInitialState", async () => {
      // First sign in
      useAuthStore.getState().signIn({
        isLoggedIn: true,
        email: "test@test.com",
        redirect: false,
        userName: "testuser",
        name: "Test",
        token: "token-123",
        userId: 1,
        operations: [],
        timezoneIanaId: "America/Guatemala",
      });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.authState.isLoggedIn).toBe(false);
      expect(state.authState.token).toBe("");
      expect(state.authState.email).toBe("");
      expect(state.authState.userName).toBe("");
      expect(state.authState.operations).toEqual([]);
    });

    it('should remove localStorage "@auth"', async () => {
      window.localStorage.setItem("@auth", JSON.stringify({ token: "old" }));

      await useAuthStore.getState().logout();

      expect(window.localStorage.getItem("@auth")).toBeNull();
    });

    it("should call setAuthorization with empty string", async () => {
      await useAuthStore.getState().logout();

      expect(mockSetAuthorization).toHaveBeenCalledWith("");
    });
  });

  describe("syncAuth", () => {
    it("should populate state from localStorage when @auth exists", async () => {
      const storedAuth: InitialAuth = {
        isLoggedIn: true,
        email: "stored@hospital.com",
        redirect: false,
        userName: "storeduser",
        name: "Stored User",
        token: "stored-token",
        userId: 10,
        operations: [],
        timezoneIanaId: "America/Guatemala",
      };
      window.localStorage.setItem("@auth", JSON.stringify(storedAuth));

      await useAuthStore.getState().syncAuth();

      const state = useAuthStore.getState();
      expect(state.authState.isLoggedIn).toBe(true);
      expect(state.authState.email).toBe("stored@hospital.com");
      expect(state.authState.token).toBe("stored-token");
      expect(state.authState.userId).toBe(10);
    });

    it("should call setAuthorization with the stored token", async () => {
      const storedAuth: InitialAuth = {
        isLoggedIn: true,
        email: "test@test.com",
        redirect: false,
        userName: "user",
        name: "User",
        token: "sync-token-xyz",
        userId: 3,
        operations: [],
        timezoneIanaId: "America/Guatemala",
      };
      window.localStorage.setItem("@auth", JSON.stringify(storedAuth));

      await useAuthStore.getState().syncAuth();

      expect(mockSetAuthorization).toHaveBeenCalledWith("sync-token-xyz");
    });

    it("should transition loading from true to false", async () => {
      // Store starts with loading: true
      expect(useAuthStore.getState().loading).toBe(true);

      await useAuthStore.getState().syncAuth();

      expect(useAuthStore.getState().loading).toBe(false);
    });

    it("should set loading to false even when no stored auth exists", async () => {
      // No localStorage entry
      await useAuthStore.getState().syncAuth();

      expect(useAuthStore.getState().loading).toBe(false);
    });
  });
});

describe("useAuthStore error handling", () => {
  it("syncAuth handles errors gracefully and sets loading to false", async () => {
    // Store malformed JSON to trigger JSON.parse error
    window.localStorage.setItem("@auth", "not-valid-json{{{");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await useAuthStore.getState().syncAuth();

    expect(useAuthStore.getState().loading).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("logout handles errors gracefully and sets loading to false", async () => {
    // Mock localStorage.removeItem to throw
    const originalRemoveItem = window.localStorage.removeItem;
    window.localStorage.removeItem = () => {
      throw new Error("Storage error");
    };
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().loading).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
    window.localStorage.removeItem = originalRemoveItem;
  });
});
