import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { CreatePrescriptionForm } from "@/components/prescription/CreatePrescriptionForm";
import { customRender } from "@/test-utils/render";
import { server } from "@/test-utils/server";

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    token: "fake-token",
    userId: 1,
    isLoggedIn: true,
    email: "doctor@hospital.com",
    userName: "drsmith",
    name: "Dr. Smith",
    operations: [],
    allOperations: [],
    loading: false,
  }),
}));

// ─── MSW lifecycle ───────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CreatePrescriptionForm", () => {
  const handleCreated = vi.fn();
  const defaultProps = {
    consultationId: 1,
    doctorId: 2,
    patientName: "Carlos López",
  };

  it("renders medicine items with initial row", () => {
    customRender(
      <CreatePrescriptionForm
        consultationId={defaultProps.consultationId}
        doctorId={defaultProps.doctorId}
        patientName={defaultProps.patientName}
        onCreated={handleCreated}
      />,
    );

    // Title
    expect(screen.getByText("Nueva Receta Medica")).toBeInTheDocument();

    // Patient name
    expect(screen.getByText(/Carlos López/)).toBeInTheDocument();

    // Initial medicine row (Medicamento #1)
    expect(screen.getByText("Medicamento #1")).toBeInTheDocument();

    // Medicine item fields
    expect(
      screen.getByPlaceholderText("Ej: Acetaminofen 500mg"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej: 500mg")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej: Cada 8 horas")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej: 7 dias")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ej: Tomar con alimentos"),
    ).toBeInTheDocument();

    // Agregar button
    expect(screen.getByText("Agregar")).toBeInTheDocument();

    // Submit button
    expect(screen.getByText("Guardar Receta Completa")).toBeInTheDocument();
  });

  it('"Agregar" button adds a new medicine row', async () => {
    const user = userEvent.setup();

    customRender(
      <CreatePrescriptionForm
        consultationId={defaultProps.consultationId}
        doctorId={defaultProps.doctorId}
        patientName={defaultProps.patientName}
        onCreated={handleCreated}
      />,
    );

    // Initially only 1 row
    expect(screen.getByText("Medicamento #1")).toBeInTheDocument();
    expect(screen.queryByText("Medicamento #2")).not.toBeInTheDocument();

    // Click "Agregar"
    const addButton = screen.getByText("Agregar");
    await user.click(addButton);

    // Now there should be 2 rows
    expect(screen.getByText("Medicamento #1")).toBeInTheDocument();
    expect(screen.getByText("Medicamento #2")).toBeInTheDocument();

    // Header should show count
    expect(screen.getByText("Medicamentos (2)")).toBeInTheDocument();
  });

  it("shows error when submitting with empty medicineName", async () => {
    customRender(
      <CreatePrescriptionForm
        consultationId={defaultProps.consultationId}
        doctorId={defaultProps.doctorId}
        patientName={defaultProps.patientName}
        onCreated={handleCreated}
      />,
    );

    // The initial row has empty medicineName. Submit the form directly.
    // Since the inputs have `required` attribute, we need to trigger the
    // form's onSubmit handler. We'll use fireEvent.submit on the form element.
    const form = screen.getByText("Guardar Receta Completa").closest("form")!;

    // Trigger form submit event directly (bypasses HTML5 validation)
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.submit(form);

    // Verify error message appears
    await waitFor(() => {
      expect(
        screen.getByText(
          "Todos los medicamentos deben tener nombre, dosis, frecuencia y duracion.",
        ),
      ).toBeInTheDocument();
    });

    // onCreated should NOT have been called
    expect(handleCreated).not.toHaveBeenCalled();
  });
});
