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

import { MedicalConsultationForm } from "@/components/form/MedicalConsultationForm";
import { customRender } from "@/test-utils/render";
import { server } from "@/test-utils/server";
import type { MedicalConsultationRequest } from "@/types/MedicalConsultationResponse";

// ─── MSW lifecycle ───────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const initialForm: MedicalConsultationRequest = {
  appointmentId: 1,
  doctorId: 2,
  reasonForVisit: "",
  clinicalFindings: "",
  diagnosis: "",
  diagnosisCie10Code: "",
  treatmentPlan: "",
  consultationStatus: 0,
  notes: "",
  state: 1,
};

describe("MedicalConsultationForm", () => {
  it("renders all form fields", () => {
    const mockSubmit = vi.fn().mockResolvedValue({
      success: true,
      data: null,
      message: "",
      totalResults: 0,
    });

    customRender(
      <MedicalConsultationForm
        fromDoctorDashboard
        initialForm={initialForm}
        patientName="Juan Pérez"
        type="create"
        onSubmit={mockSubmit}
      />,
    );

    // Title
    expect(screen.getByText("Nueva Consulta Médica")).toBeInTheDocument();

    // Patient info banner
    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();

    // Form fields
    expect(screen.getByText("Motivo de Visita")).toBeInTheDocument();
    expect(screen.getByText("Hallazgos Clínicos")).toBeInTheDocument();
    expect(screen.getByText("Código CIE-10")).toBeInTheDocument();
    expect(screen.getByText("Estado de Consulta")).toBeInTheDocument();
    expect(screen.getByText(/Diagnóstico/)).toBeInTheDocument();
    expect(screen.getByText("Plan de Tratamiento")).toBeInTheDocument();
    expect(screen.getByText("Notas Adicionales")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();

    // Buttons
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Guardar Consulta")).toBeInTheDocument();
  });

  it("shows validation error on empty diagnosis when consultationStatus is finalized", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn().mockResolvedValue({
      success: false,
      data: null,
      message: "Error en la validación del formulario",
      totalResults: 0,
    });

    // Set consultationStatus to 1 (Finalizada) to trigger diagnosis validation
    const formWithFinalized: MedicalConsultationRequest = {
      ...initialForm,
      consultationStatus: 1,
      reasonForVisit: "Dolor de cabeza",
    };

    customRender(
      <MedicalConsultationForm
        fromDoctorDashboard
        initialForm={formWithFinalized}
        patientName="Juan Pérez"
        type="create"
        onSubmit={mockSubmit}
      />,
    );

    // Submit the form without filling diagnosis
    const submitButton = screen.getByText("Guardar Consulta");
    await user.click(submitButton);

    // Verify the diagnosis validation error appears
    await waitFor(() => {
      expect(
        screen.getByText(
          "No es posible finalizar la consulta sin registrar un diagnóstico. El campo Diagnóstico es obligatorio.",
        ),
      ).toBeInTheDocument();
    });

    // onSubmit should NOT have been called since validation failed
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
