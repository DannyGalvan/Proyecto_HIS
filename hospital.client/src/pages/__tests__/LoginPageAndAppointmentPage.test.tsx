/* eslint-disable react/no-multi-comp */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { customRender } from "@/test-utils/render";
import { server } from "@/test-utils/server";

// ─── Top-level mocks (hoisted) ──────────────────────────────────────────────

// Mock useAuth to simulate a logged-out user
const mockSignIn = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isLoggedIn: false,
    token: "",
    signIn: mockSignIn,
    email: "",
    userName: "",
    name: "",
    operations: [],
    allOperations: [],
    loading: false,
    userId: 0,
  }),
}));

// Mock jwt utility
vi.mock("@/utils/jwt", () => ({
  getRoleFromToken: () => "SA",
  decodeJwtPayload: () => ({ RoleName: "SA" }),
}));

// Mock authenticateUser service
const mockAuthenticateUser = vi.fn();
vi.mock("@/services/authService", () => ({
  authenticateUser: (...args: unknown[]) => mockAuthenticateUser(...args),
}));

// Mock the appointment store
vi.mock("@/stores/useAppointmentStore", () => ({
  useAppointmentStore: () => ({
    filters: { filter: "", page: 1, pageSize: 10 },
    setFilters: vi.fn(),
  }),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

// Mock useRangeOfDatesStore
vi.mock("@/stores/useRangeOfDatesStore", () => ({
  useRangeOfDatesStore: () => ({
    start: "",
    end: "",
    getDateFilters: vi.fn().mockReturnValue(""),
  }),
}));

// Mock useErrorsStore
vi.mock("@/stores/useErrorsStore", () => ({
  useErrorsStore: () => ({
    error: null,
    setError: vi.fn(),
    resetError: vi.fn(),
  }),
}));

// Mock the AppointmentButton to avoid @react-aria/interactions focus issue
vi.mock("@/components/button/AppointmentButton", () => ({
  AppointmentButton: () => <button type="button">Acciones</button>,
}));

// Mock AppointmentStatusBadge
vi.mock("@/components/badge/AppointmentStatusBadge", () => ({
  AppointmentStatusBadge: ({ statusName }: { readonly statusName: string }) => {
    return <span>{statusName}</span>;
  },
}));

// Mock the appointment service
const mockGetAppointments = vi.fn();
vi.mock("@/services/appointmentService", () => ({
  getAppointments: (...args: unknown[]) => mockGetAppointments(...args),
}));

// ─── Imports after mocks ─────────────────────────────────────────────────────
import { AppointmentPage } from "@/pages/appointment/AppointmentPage";
import { Component as LoginPage } from "@/pages/auth/LoginPage";

// ─── MSW lifecycle ───────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders username input, password input, and submit button 'Iniciar Sesión'", () => {
    customRender(<LoginPage />);

    // Verify username input with id "admin-username"
    const usernameInput = screen.getByRole("textbox");
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute("id", "admin-username");

    // Verify password input with id "admin-password"
    const passwordInput = document.getElementById("admin-password");
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");

    // Verify submit button with text "Iniciar Sesión"
    const submitButton = screen.getByRole("button", {
      name: /Iniciar Sesión/i,
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("form submission calls authenticateUser with provided credentials", async () => {
    const user = userEvent.setup();

    mockAuthenticateUser.mockResolvedValue({
      success: true,
      data: {
        name: "Admin User",
        userName: "admin",
        email: "admin@hospital.com",
        token: "fake-jwt-token",
        redirect: false,
        userId: 1,
        rol: 1,
        operations: [],
        timezoneIanaId: "America/Guatemala",
      },
      totalResults: 0,
      message: "",
    });

    customRender(<LoginPage />);

    // Fill in username
    const usernameInput = screen.getByRole("textbox");
    await user.type(usernameInput, "admin");

    // Fill in password
    const passwordInput = document.getElementById(
      "admin-password",
    ) as HTMLInputElement;
    await user.type(passwordInput, "password123");

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /Iniciar Sesión/i,
    });
    await user.click(submitButton);

    // Verify authenticateUser was called exactly once with the credentials
    await waitFor(() => {
      expect(mockAuthenticateUser).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateUser).toHaveBeenCalledWith({
        userName: "admin",
        password: "password123",
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AppointmentPage Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("AppointmentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAppointments.mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          patientId: 10,
          doctorId: 20,
          specialtyId: 1,
          branchId: 1,
          appointmentStatusId: 2,
          appointmentDate: "2024-06-15T10:00:00",
          reason: "Consulta general",
          amount: 150.0,
          priority: 0,
          state: 1,
          createdAt: "2024-06-10T08:00:00",
          createdBy: 1,
          patient: { id: 10, name: "Juan Pérez" },
          doctor: { id: 20, name: "Dr. García" },
          specialty: { id: 1, name: "Medicina General" },
          branch: { id: 1, name: "Central" },
          appointmentStatus: { id: 2, name: "Confirmada" },
        },
        {
          id: 2,
          patientId: 11,
          doctorId: 21,
          specialtyId: 2,
          branchId: 1,
          appointmentStatusId: 1,
          appointmentDate: "2024-06-16T14:30:00",
          reason: "Control de rutina",
          amount: 200.5,
          priority: 0,
          state: 1,
          createdAt: "2024-06-11T09:00:00",
          createdBy: 1,
          patient: { id: 11, name: "María López" },
          doctor: { id: 21, name: "Dr. Rodríguez" },
          specialty: { id: 2, name: "Cardiología" },
          branch: { id: 1, name: "Central" },
          appointmentStatus: { id: 1, name: "Pendiente de Pago" },
        },
      ],
      totalResults: 2,
      message: "",
    });
  });

  it("renders TableServer with columns Paciente, Médico, Especialidad, Fecha, Estado, Monto with mock data", async () => {
    customRender(<AppointmentPage />);

    // Wait for data to load - patient name appears once query resolves
    expect(
      await screen.findByText("Juan Pérez", {}, { timeout: 5000 }),
    ).toBeInTheDocument();

    // Verify column headers are present (use getAllByText since column names may appear in filter dropdown too)
    expect(screen.getAllByText("Paciente").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Médico").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Especialidad").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("Fecha").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Estado").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Monto").length).toBeGreaterThanOrEqual(1);

    // Verify data rows are rendered with mock data
    expect(screen.getByText("María López")).toBeInTheDocument();
    expect(screen.getByText("Dr. García")).toBeInTheDocument();
    expect(screen.getByText("Dr. Rodríguez")).toBeInTheDocument();
    expect(screen.getByText("Medicina General")).toBeInTheDocument();
    expect(screen.getByText("Cardiología")).toBeInTheDocument();
    expect(screen.getByText("Q150.00")).toBeInTheDocument();
    expect(screen.getByText("Q200.50")).toBeInTheDocument();
  });
});
