import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { AsyncButton } from "../../components/button/AsyncButton";
import { useAuth } from "../../hooks/useAuth";
import { nameRoutes } from "../../configs/constants";
import { BlockedWithoutContext } from "../../components/shared/BlockedWithoutContext";
import {
  createPrescriptionWithItems,
  deletePrescriptionItem,
  createPrescriptionItem,
  getPrescriptionByConsultation,
  getPrescriptionById,
} from "../../services/prescriptionService";
import { getMedicalConsultations } from "../../services/medicalConsultationService";
import type { PrescriptionItemInlineRequest } from "../../types/PrescriptionResponse";

// ── Inline item row for the creation form ─────────────────────────────────────
interface ItemRow {
  key: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  specialInstructions: string;
}

const newRow = (): ItemRow => ({
  key: crypto.randomUUID(),
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  specialInstructions: "",
});

// ── Add-item form (for existing prescription) ─────────────────────────────────
function AddItemForm({ prescriptionId, onSuccess }: { readonly prescriptionId: number; readonly onSuccess: () => void }) {
  const { userId } = useAuth();
  const [item, setItem] = useState({ medicineName: "", dosage: "", frequency: "", duration: "", specialInstructions: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) => setItem((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!item.medicineName || !item.dosage || !item.frequency || !item.duration) {
      setError("Todos los campos obligatorios deben estar completos.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await createPrescriptionItem({
        prescriptionId,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        specialInstructions: item.specialInstructions || null,
        state: 1,
        createdBy: userId,
      });
      if (response.success) {
        setItem({ medicineName: "", dosage: "", frequency: "", duration: "", specialInstructions: "" });
        onSuccess();
      } else {
        setError(response.message ?? "Error al agregar medicamento.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      {error && <p className="text-sm text-red-600"><i className="bi bi-exclamation-circle mr-1" />{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Medicamento *</label>
          <input required className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: Acetaminofen 500mg" value={item.medicineName} onChange={(e) => update("medicineName", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Dosis *</label>
          <input required className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: 500mg" value={item.dosage} onChange={(e) => update("dosage", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Frecuencia *</label>
          <input required className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: Cada 8 horas" value={item.frequency} onChange={(e) => update("frequency", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-sm">Duración *</label>
          <input required className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: 7 días" value={item.duration} onChange={(e) => update("duration", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="font-bold text-sm">Instrucciones Especiales</label>
          <input className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: Tomar con alimentos" value={item.specialInstructions} onChange={(e) => update("specialInstructions", e.target.value)} />
        </div>
      </div>
      <AsyncButton className="font-bold w-full" isLoading={submitting} loadingText="Agregando..." size="md" type="submit" variant="primary">
        <i className="bi bi-plus-circle mr-2" /> Agregar Medicamento
      </AsyncButton>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function PrescriptionDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const appointmentId = searchParams.get("appointmentId");
  const doctorId = searchParams.get("doctorId") ?? String(userId);
  const patientNameParam = searchParams.get("patientName");
  const isCreating = !id;
  const fromDoctorDashboard = !!appointmentId;

  // ── Guard: no context and creating ────────────────────────────────────────
  if (!appointmentId && isCreating) {
    return (
      <BlockedWithoutContext
        backLabel="Ir al Panel del Medico"
        backRoute={nameRoutes.doctorDashboard}
        icon="bi-prescription2"
        message="No puedes crear una receta medica sin que provenga de una consulta medica completada."
        title="Acceso no permitido"
      />
    );
  }

  // ── If we have a prescriptionId in URL, show that prescription directly ────
  if (id) {
    return <ExistingPrescriptionView prescriptionId={Number(id)} fromDoctorDashboard={fromDoctorDashboard} patientName={patientNameParam ?? undefined} />;
  }

  // ── Creating: look up consultation then check for existing prescription ────
  return (
    <CreatePrescriptionGuard
      appointmentId={Number(appointmentId)}
      doctorId={Number(doctorId)}
      patientName={patientNameParam ?? undefined}
      onCreated={(prescriptionId) => {
        // Persist prescriptionId in URL so page reload keeps state
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set("prescriptionId", String(prescriptionId));
          return next;
        });
        navigate(`/prescription/${prescriptionId}?appointmentId=${appointmentId}&doctorId=${doctorId}&patientName=${encodeURIComponent(patientNameParam ?? "")}`);
      }}
    />
  );
}

// ── Guard: check for existing prescription before showing create form ─────────
function CreatePrescriptionGuard({ appointmentId, doctorId, patientName, onCreated }: {
  readonly appointmentId: number;
  readonly doctorId: number;
  readonly patientName?: string;
  readonly onCreated: (id: number) => void;
}) {
  const navigate = useNavigate();

  // Look up completed consultation for this appointment
  const { data: consultationData, isLoading: loadingConsultation } = useQuery({
    queryKey: ["consultation-for-prescription", appointmentId],
    queryFn: () => getMedicalConsultations({ pageNumber: 1, pageSize: 1, filters: `AppointmentId:eq:${appointmentId} AND ConsultationStatus:eq:1 AND State:eq:1`, include: null, includeTotal: false }),
    staleTime: 0,
  });

  const consultationId = consultationData?.success && consultationData.data.length > 0 ? consultationData.data[0].id : null;

  // Check if prescription already exists for this consultation
  const { data: existingData, isLoading: loadingExisting } = useQuery({
    queryKey: ["prescription-by-consultation", consultationId],
    queryFn: () => getPrescriptionByConsultation(consultationId!),
    enabled: !!consultationId,
    staleTime: 0,
  });

  if (loadingConsultation || loadingExisting) return <LoadingComponent />;

  // No completed consultation
  if (!consultationId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-exclamation-triangle text-6xl text-yellow-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Consulta no finalizada</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">Debes finalizar la consulta medica antes de crear una receta.</p>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700" type="button" onClick={() => navigate(nameRoutes.doctorDashboard)}>
          <i className="bi bi-arrow-left" /> Volver al Panel
        </button>
      </div>
    );
  }

  // Prescription already exists → redirect to it
  if (existingData?.success && existingData.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-prescription2 text-6xl text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ya existe una receta</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">Esta consulta ya tiene una receta medica. Solo puede existir una receta por consulta.</p>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700" type="button"
          onClick={() => navigate(`/prescription/${existingData.data!.id}?appointmentId=${appointmentId}&doctorId=${doctorId}&patientName=${encodeURIComponent(patientName ?? "")}`)}>
          <i className="bi bi-eye mr-1" /> Ver Receta Existente
        </button>
      </div>
    );
  }

  return <CreatePrescriptionForm consultationId={consultationId} doctorId={doctorId} patientName={patientName} onCreated={onCreated} />;
}

// ── Unified create form: prescription + items in one submit ───────────────────
function CreatePrescriptionForm({ consultationId, doctorId, patientName, onCreated }: {
  readonly consultationId: number;
  readonly doctorId: number;
  readonly patientName?: string;
  readonly onCreated: (id: number) => void;
}) {
  const { userId } = useAuth();
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([newRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRow = () => setItems((prev) => [...prev, newRow()]);
  const removeRow = (key: string) => setItems((prev) => prev.filter((r) => r.key !== key));
  const updateRow = (key: string, field: keyof Omit<ItemRow, "key">, value: string) =>
    setItems((prev) => prev.map((r) => r.key === key ? { ...r, [field]: value } : r));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.some((r) => !r.medicineName || !r.dosage || !r.frequency || !r.duration)) {
      setError("Todos los medicamentos deben tener nombre, dosis, frecuencia y duracion.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        consultationId,
        doctorId,
        prescriptionDate: new Date().toISOString(),
        notes: notes || null,
        state: 1,
        createdBy: userId,
        items: items.map((r): PrescriptionItemInlineRequest => ({
          medicineName: r.medicineName,
          dosage: r.dosage,
          frequency: r.frequency,
          duration: r.duration,
          specialInstructions: r.specialInstructions || null,
        })),
      };
      const response = await createPrescriptionWithItems(payload);
      if (response.success && response.data) {
        toast.success("Receta creada correctamente con todos sus medicamentos.");
        onCreated(response.data.id);
      } else {
        setError(response.message ?? "Error al crear la receta.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Nueva Receta Medica</h1>
      {patientName && (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 dark:bg-blue-900/20 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300"><i className="bi bi-person-check mr-2" />Receta para: <strong>{patientName}</strong></p>
        </div>
      )}
      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-300 p-3 text-sm text-red-800"><i className="bi bi-exclamation-triangle mr-2" />{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h2 className="font-bold mb-3">Indicaciones Generales</h2>
          <textarea className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Indicaciones generales de la receta (opcional)..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold"><i className="bi bi-capsule mr-2" />Medicamentos ({items.length})</h2>
            <button type="button" className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors" onClick={addRow}>
              <i className="bi bi-plus-circle mr-1" /> Agregar
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {items.map((row, idx) => (
              <div key={row.key} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-600">Medicamento #{idx + 1}</span>
                  {items.length > 1 && (
                    <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => removeRow(row.key)}>
                      <i className="bi bi-trash" /> Eliminar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Medicamento *</label>
                    <input required className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: Acetaminofen 500mg" value={row.medicineName} onChange={(e) => updateRow(row.key, "medicineName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Dosis *</label>
                    <input required className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: 500mg" value={row.dosage} onChange={(e) => updateRow(row.key, "dosage", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Frecuencia *</label>
                    <input required className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: Cada 8 horas" value={row.frequency} onChange={(e) => updateRow(row.key, "frequency", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Duracion *</label>
                    <input required className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: 7 dias" value={row.duration} onChange={(e) => updateRow(row.key, "duration", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs font-bold">Instrucciones Especiales</label>
                    <input className="px-3 py-2 border rounded-md text-sm" type="text" placeholder="Ej: Tomar con alimentos" value={row.specialInstructions} onChange={(e) => updateRow(row.key, "specialInstructions", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <AsyncButton isLoading={submitting} loadingText="Guardando receta..." size="lg" type="submit" variant="primary">
            <i className="bi bi-prescription2 mr-2" /> Guardar Receta Completa
          </AsyncButton>
        </div>
      </form>
    </div>
  );
}

// ── View/edit existing prescription ──────────────────────────────────────────
function ExistingPrescriptionView({ prescriptionId, fromDoctorDashboard, patientName }: {
  readonly prescriptionId: number;
  readonly fromDoctorDashboard: boolean;
  readonly patientName?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["prescription-detail", prescriptionId],
    queryFn: () => getPrescriptionById(prescriptionId),
    staleTime: 1000 * 60 * 2,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => deletePrescriptionItem(itemId),
    onSuccess: () => {
      toast.success("Medicamento eliminado");
      queryClient.invalidateQueries({ queryKey: ["prescription-detail", prescriptionId] });
    },
    onError: () => toast.danger("Error al eliminar el medicamento"),
  });

  const handleItemAdded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["prescription-detail", prescriptionId] });
    toast.success("Medicamento agregado");
  }, [queryClient, prescriptionId]);

  if (isLoading) return <LoadingComponent />;

  const prescription = data?.success ? data.data : null;
  if (!prescription) return <div className="p-8 text-center text-gray-400">Receta no encontrada.</div>;

  const items = prescription.items ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button size="sm" variant="secondary" onPress={() => fromDoctorDashboard ? navigate(nameRoutes.doctorDashboard) : navigate(-1)}>
          <i className="bi bi-arrow-left mr-1" /> Volver
        </Button>
        <h1 className="text-2xl font-bold">Receta #{prescription.id}</h1>
      </div>
      {patientName && (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 dark:bg-blue-900/20 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300"><i className="bi bi-person-check mr-2" />Receta para: <strong>{patientName}</strong></p>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="font-semibold text-gray-500">Consulta:</span> #{prescription.consultationId}</div>
          <div><span className="font-semibold text-gray-500">Fecha:</span> {prescription.prescriptionDate}</div>
          <div><span className="font-semibold text-gray-500">Estado:</span> {prescription.state === 1 ? "Activa" : "Inactiva"}</div>
          {prescription.notes && <div className="col-span-2 md:col-span-4"><span className="font-semibold text-gray-500">Indicaciones:</span> {prescription.notes}</div>}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4"><i className="bi bi-capsule mr-2" />Medicamentos ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No hay medicamentos. Agregue al menos uno.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-bold">{item.medicineName}</p>
                  <div className="text-sm text-gray-600 dark:text-gray-300 grid grid-cols-3 gap-2 mt-1">
                    <span><strong>Dosis:</strong> {item.dosage}</span>
                    <span><strong>Frecuencia:</strong> {item.frequency}</span>
                    <span><strong>Duracion:</strong> {item.duration}</span>
                  </div>
                  {item.specialInstructions && <p className="text-sm text-blue-600 mt-1"><i className="bi bi-info-circle mr-1" />{item.specialInstructions}</p>}
                </div>
                <Button isIconOnly size="sm" variant="danger" onPress={() => deleteItemMutation.mutate(item.id)}>
                  <i className="bi bi-trash" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4"><i className="bi bi-plus-circle mr-2" />Agregar Medicamento</h2>
        <AddItemForm prescriptionId={prescriptionId} onSuccess={handleItemAdded} />
      </div>
    </div>
  );
}
