import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { customRender } from "@/test-utils/render";
import { server } from "@/test-utils/server";

// Mock useAuth to return a token
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    token: "fake-token",
    userId: 1,
    isLoggedIn: true,
    email: "test@hospital.com",
    userName: "testuser",
    name: "Test User",
    operations: [],
    allOperations: [],
    loading: false,
  }),
}));

// Mock getRoleFromToken to return "Cajero" role
vi.mock("@/utils/jwt", () => ({
  getRoleFromToken: () => "Cajero",
  decodeJwtPayload: () => ({ RoleName: "Cajero" }),
}));

// Import after mocks
import { RoleDashboardPage } from "@/pages/dashboard/RoleDashboardPage";

// ─── MSW lifecycle ───────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("RoleDashboardPage", () => {
  it("renders role-specific title, StatCard KPIs, and QuickActionButtons", async () => {
    // Mock the appointments API to return data for KPI computation
    server.use(
      http.get("*/api/v1/appointment", () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              appointmentStatusId: 1,
              appointmentStatus: { name: "Pendiente de Pago" },
              arrivalTime: null,
              priority: 0,
              state: 1,
            },
            {
              id: 2,
              appointmentStatusId: 2,
              appointmentStatus: { name: "Confirmada" },
              arrivalTime: null,
              priority: 0,
              state: 1,
            },
            {
              id: 3,
              appointmentStatusId: 1,
              appointmentStatus: { name: "Pendiente de Pago" },
              arrivalTime: null,
              priority: 1,
              state: 1,
            },
          ],
          totalResults: 3,
          message: "",
        });
      }),
    );

    customRender(<RoleDashboardPage />);

    // Verify role-specific title for "Cajero"
    expect(await screen.findByText("Panel de Caja")).toBeInTheDocument();

    // Verify KPI StatCards are rendered (Cajero has 3 KPIs)
    expect(await screen.findByText("Pendientes de cobro")).toBeInTheDocument();
    expect(screen.getByText("Cobradas hoy")).toBeInTheDocument();
    expect(screen.getByText("Emergencias")).toBeInTheDocument();

    // Verify QuickActionButtons are rendered
    expect(screen.getByText("Caja")).toBeInTheDocument();
    expect(screen.getByText("Cobro Lab")).toBeInTheDocument();
    expect(screen.getByText("Pagos")).toBeInTheDocument();
  });
});
