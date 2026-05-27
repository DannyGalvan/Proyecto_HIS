import { setupServer } from "msw/node";

/**
 * MSW server instance for intercepting HTTP requests in tests.
 *
 * Usage in test files:
 * ```ts
 * import { server } from "@/test-utils/server";
 * import { http, HttpResponse } from "msw";
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 *
 * server.use(
 *   http.get("/api/v1/user", () => {
 *     return HttpResponse.json({ success: true, data: [...] });
 *   })
 * );
 * ```
 */
export const server = setupServer();
