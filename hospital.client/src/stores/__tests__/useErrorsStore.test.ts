import { beforeEach, describe, expect, it } from "vitest";

import type { AppError } from "../../types/AppError";
import { useErrorsStore } from "../useErrorsStore";

describe("useErrorsStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useErrorsStore.setState({ error: null });
  });

  describe("initial state", () => {
    it("should have error set to null", () => {
      const state = useErrorsStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe("setError", () => {
    it("should set error state with the provided AppError object", () => {
      const appError: AppError = {
        statusCode: "500",
        message: "Internal Server Error",
        name: "ServerError",
      };

      useErrorsStore.getState().setError(appError);

      const state = useErrorsStore.getState();
      expect(state.error).toEqual(appError);
      expect(state.error?.statusCode).toBe("500");
      expect(state.error?.message).toBe("Internal Server Error");
      expect(state.error?.name).toBe("ServerError");
    });

    it("should overwrite previous error with a new one", () => {
      const firstError: AppError = {
        statusCode: "404",
        message: "Not Found",
        name: "NotFoundError",
      };

      const secondError: AppError = {
        statusCode: "403",
        message: "Forbidden",
        name: "ForbiddenError",
      };

      useErrorsStore.getState().setError(firstError);
      useErrorsStore.getState().setError(secondError);

      const state = useErrorsStore.getState();
      expect(state.error).toEqual(secondError);
    });

    it("should allow setting error to null directly", () => {
      const appError: AppError = {
        statusCode: "401",
        message: "Unauthorized",
        name: "AuthError",
      };

      useErrorsStore.getState().setError(appError);
      useErrorsStore.getState().setError(null);

      const state = useErrorsStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe("resetError", () => {
    it("should reset error state to null", () => {
      const appError: AppError = {
        statusCode: "400",
        message: "Bad Request",
        name: "ValidationError",
      };

      useErrorsStore.getState().setError(appError);
      expect(useErrorsStore.getState().error).not.toBeNull();

      useErrorsStore.getState().resetError();

      const state = useErrorsStore.getState();
      expect(state.error).toBeNull();
    });

    it("should be safe to call when error is already null", () => {
      expect(useErrorsStore.getState().error).toBeNull();

      useErrorsStore.getState().resetError();

      expect(useErrorsStore.getState().error).toBeNull();
    });
  });
});
