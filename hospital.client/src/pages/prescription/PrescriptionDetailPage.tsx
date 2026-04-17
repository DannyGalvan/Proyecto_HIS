import { Button, FieldError, Form, Input, Label, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { Response } from "../../components/messages/Response";
import { AsyncButton } from "../../components/button/AsyncButton";
import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../hooks/useAuth";
import { nameRoutes } from "../../configs/constants";
import { BlockedWithoutContext } from "../../components/shared/BlockedWithoutContext";
import {
  createPrescription,
  createPrescriptionItem,
  deletePrescriptionItem,
  getPrescriptionById,
  getPrescriptionItems,
} from "../../services/prescriptionService";
import { getMedicalConsultations } from "../../services/medicalConsultationService";
import type { PrescriptionRequest } from "../../types/PrescriptionResponse";
import type { PrescriptionItemRequest } from "../../types/PrescriptionItemResponse";
import { validatePrescription, validatePrescriptionItem } from "../../validations/prescriptionValidation";

// ── Formulario de ítem de receta ──────────────────────────────────────────────
function PrescriptionItemForm({
  prescriptionId,
  onSuccess,
}: {
  readonly prescriptionId: number;
  readonly onSuccess: () => void;
}) {
  const initialItem: PrescriptionItemRequest = {
    prescriptionId,
    medicineName: "",
    dosage: "",
    frequency: "",
    duration: "",
    specialInstructions: "",
    state: 1,
  };

  const onSubmit = useCallback(async (data : PrescriptionItemRequest) => {
    const response = await createPrescriptionItem(data);
    if (response.success) onSuccess();
    return response;
  }, [])

  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<PrescriptionItemRequest, unknown>(initialItem, validatePrescriptionItem, onSubmit, true);

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({ target: { name, value: val } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  return (
    <Form className="flex flex-col gap-3" validationErrors={errors} onSubmit={handleSubmit}>
      {success != null && <Response message={message} type={success} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.medicineName} name="medicineName" onChange={handleTextChange("medicineName")}>
          <Label className="font-bold text-sm">Medicamento *</Label>
          <Input className="px-3 py-2 border rounded-md" type="text" value={form.medicineName || ""} placeholder="Ej: Acetaminofén 500mg" />
          {errors?.medicineName ? <FieldError>{errors.medicineName as string}</FieldError> : null}
        </TextField>
        <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.dosage} name="dosage" onChange={handleTextChange("dosage")}>
          <Label className="font-bold text-sm">Dosis *</Label>
          <Input className="px-3 py-2 border rounded-md" type="text" value={form.dosage || ""} placeholder="Ej: 500mg" />
          {errors?.dosage ? <FieldError>{errors.dosage as string}</FieldError> : null}
        </TextField>
        <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.frequency} name="frequency" onChange={handleTextChange("frequency")}>
          <Label className="font-bold text-sm">Frecuencia *</Label>
          <Input className="px-3 py-2 border rounded-md" type="text" value={form.frequency || ""} placeholder="Ej: Cada 8 horas" />
          {errors?.frequency ? <FieldError>{errors.frequency as string}</FieldError> : null}
        </TextField>
        <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.duration} name="duration" onChange={handleTextChange("duration")}>
          <Label className="font-bold text-sm">Duración *</Label>
          <Input className="px-3 py-2 border rounded-md" type="text" value={form.duration || ""} placeholder="Ej: 7 días" />
          {errors?.duration ? <FieldError>{errors.duration as string}</FieldError> : null}
        </TextField>
        <TextField className="flex flex-col gap-1 md:col-span-2" name="specialInstructions" onChange={handleTextChange("specialInstructions")}>
          <Label className="font-bold text-sm">Instrucciones Especiales</Label>
          <Input className="px-3 py-2 border rounded-md" type="text" value={form.specialInstructions || ""} placeholder="Ej: Tomar con alimentos" />
        </TextField>
      </div>
      <AsyncButton className="font-bold w-full" isLoading={loading} loadingText="Agregando..." size="md" type="submit" variant="primary">
        <i className="bi bi-plus-circle mr-2" /> Agregar Medicamento
      </AsyncButton>
    </Form>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export function PrescriptionDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  // Modo creación desde dashboard
  const appointmentId = searchParams.get("appointmentId");
  const doctorId = searchParams.get("doctorId") ?? String(userId);
  const patientNameParam = searchParams.get("patientName");
  const isCreating = !id;
  const fromDoctorDashboard = !!appointmentId;


  // ── Guard: no appointmentId and not editing → blocked ─────────────────────
  if (!appointmentId && isCreating) {
    return (
      <BlockedWithoutContext
        backLabel="Ir al Panel del Médico"
        backRoute={nameRoutes.doctorDashboard}
        icon="bi-prescription2"
        message="No puedes crear una receta médica sin que provenga de una consulta médica completada. Las recetas solo pueden generarse desde el panel del médico."
        title="Acceso no permitido"
      />
    );
  }

  // Look up the completed consultation for this appointment
  const { data: consultationData } = useQuery({
    queryKey: ["consultation-for-prescription", appointmentId],
    queryFn: () => getMedicalConsultations({
      pageNumber: 1,
      pageSize: 1,
      filters: `AppointmentId:eq:${appointmentId} AND ConsultationStatus:eq:1 AND State:eq:1`,
      include: null,
      includeTotal: false,
    }),
    enabled: !!appointmentId && isCreating,
  });

  const resolvedConsultationId = consultationData?.success && consultationData.data.length > 0
    ? consultationData.data[0].id
    : null;

  // Estado para nueva receta
  const [prescriptionId, setPrescriptionId] = useState<number | null>(isCreating ? null : Number(id));

  const initialPrescription = useMemo<PrescriptionRequest>(() => ({
    consultationId: resolvedConsultationId,
    doctorId: Number(doctorId),
    prescriptionDate: new Date().toISOString().split("T")[0],
    notes: "",
    state: 1,
  }), [resolvedConsultationId, doctorId]);

  const onSubmit = useCallback(async (data : PrescriptionRequest) => {
    const response = await createPrescription(data);
    if (response.success && response.data) {
      setPrescriptionId((response.data as { id: number }).id);
      toast.success("Receta creada. Ahora puede agregar medicamentos.");
      if (fromDoctorDashboard) {
        // After creating prescription, stay on page to add medicines
        // The "Volver" button will go back to dashboard
      }
    }
    return response;
  }, []);


  const { form, errors, handleChange, handleSubmit, success, message, loading } =
    useForm<PrescriptionRequest, unknown>(initialPrescription, validatePrescription, onSubmit);

  const handleTextChange = useCallback(
    (name: string) => (val: string) => {
      handleChange({ target: { name, value: val } } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handleChange],
  );

  // Cargar receta existente
  const { data: prescriptionData, isLoading: loadingPrescription } = useQuery({
    queryKey: ["prescription", prescriptionId],
    queryFn: () => getPrescriptionById(prescriptionId!),
    enabled: !!prescriptionId,
  });

  // Cargar ítems de la receta
  const { data: itemsData, isLoading: loadingItems } = useQuery({
    queryKey: ["prescription-items", prescriptionId],
    queryFn: () => getPrescriptionItems({
      filters: `PrescriptionId:eq:${prescriptionId}`,
      pageNumber: 1,
      pageSize: 100,
      include: null,
      includeTotal: false,
    }),
    enabled: !!prescriptionId,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => deletePrescriptionItem(itemId),
    onSuccess: () => {
      toast.success("Medicamento eliminado de la receta");
      queryClient.invalidateQueries({ queryKey: ["prescription-items", prescriptionId] });
    },
    onError: () => toast.danger("Error al eliminar el medicamento"),
  });

  const handleItemAdded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["prescription-items", prescriptionId] });
    toast.success("Medicamento agregado a la receta");
  }, [queryClient, prescriptionId]);

  if (loadingPrescription || loadingItems) return <LoadingComponent />;

  const items = itemsData?.success ? itemsData.data : [];
  const prescription = prescriptionData?.success ? prescriptionData.data : null;

  if (fromDoctorDashboard && !resolvedConsultationId) return <LoadingComponent />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button size="sm" variant="secondary" onPress={() => fromDoctorDashboard ? navigate(nameRoutes.doctorDashboard) : navigate(-1)}>
          <i className="bi bi-arrow-left mr-1" /> Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {prescriptionId ? `Receta #${prescriptionId}` : "Nueva Receta Médica"}
        </h1>
      </div>

      {/* Patient context banner when coming from doctor dashboard */}
      {fromDoctorDashboard && patientNameParam && (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 dark:bg-blue-900/20 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <i className="bi bi-person-check mr-2" />
            Receta para: <strong>{patientNameParam}</strong>
          </p>
        </div>
      )}

      {/* Crear receta si no existe */}
      {!prescriptionId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Datos de la Receta</h2>
          {success != null && <Response message={message} type={success} />}
          <Form className="flex flex-col gap-4" validationErrors={errors} onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!fromDoctorDashboard && (
                <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.consultationId} name="consultationId" onChange={handleTextChange("consultationId")}>
                  <Label className="font-bold">ID de Consulta *</Label>
                  <Input className="px-3 py-2 border rounded-md" type="number" value={form.consultationId?.toString() || ""} />
                  {errors?.consultationId ? <FieldError>{errors.consultationId as string}</FieldError> : null}
                </TextField>
              )}
              <TextField isRequired className="flex flex-col gap-1" isInvalid={!!errors?.prescriptionDate} name="prescriptionDate" onChange={handleTextChange("prescriptionDate")}>
                <Label className="font-bold">Fecha de Receta *</Label>
                <Input className="px-3 py-2 border rounded-md" type="date" value={form.prescriptionDate || ""} />
                {errors?.prescriptionDate ? <FieldError>{errors.prescriptionDate as string}</FieldError> : null}
              </TextField>
              <TextField className="flex flex-col gap-1 md:col-span-2" name="notes" onChange={handleTextChange("notes")}>
                <Label className="font-bold">Indicaciones Generales</Label>
                <Input className="px-3 py-2 border rounded-md" type="text" value={form.notes || ""} placeholder="Indicaciones generales de la receta..." />
              </TextField>
            </div>
            <AsyncButton className="font-bold" isLoading={loading} loadingText="Creando receta..." size="lg" type="submit" variant="primary">
              <i className="bi bi-prescription2 mr-2" /> Crear Receta
            </AsyncButton>
          </Form>
        </div>
      )}

      {/* Detalle de receta existente */}
      {prescription && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="font-semibold text-gray-500">Consulta:</span> #{prescription.consultationId}</div>
            <div><span className="font-semibold text-gray-500">Médico:</span> #{prescription.doctorId}</div>
            <div><span className="font-semibold text-gray-500">Fecha:</span> {prescription.prescriptionDate}</div>
            <div><span className="font-semibold text-gray-500">Estado:</span> {prescription.state === 1 ? "✅ Activa" : "❌ Inactiva"}</div>
            {prescription.notes && (
              <div className="col-span-2 md:col-span-4">
                <span className="font-semibold text-gray-500">Indicaciones:</span> {prescription.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medicamentos de la receta */}
      {prescriptionId && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">
              <i className="bi bi-capsule mr-2" />
              Medicamentos ({items.length})
            </h2>

            {items.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No hay medicamentos en esta receta. Agregue al menos uno.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-bold">{item.medicineName}</p>
                      <div className="text-sm text-gray-600 dark:text-gray-300 grid grid-cols-3 gap-2 mt-1">
                        <span><strong>Dosis:</strong> {item.dosage}</span>
                        <span><strong>Frecuencia:</strong> {item.frequency}</span>
                        <span><strong>Duración:</strong> {item.duration}</span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-sm text-blue-600 mt-1">
                          <i className="bi bi-info-circle mr-1" />
                          {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="danger"
                      onPress={() => deleteItemMutation.mutate(item.id)}
                    >
                      <i className="bi bi-trash" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <h2 className="text-lg font-bold mb-4">
              <i className="bi bi-plus-circle mr-2" />
              Agregar Medicamento
            </h2>
            <PrescriptionItemForm prescriptionId={prescriptionId} onSuccess={handleItemAdded} />
          </div>
        </>
      )}
    </div>
  );
}
