import { useNavigate, useParams, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getPrescriptionById } from "../../services/prescriptionService";
import { usePrescriptionValidity } from "../../hooks/usePrescriptionValidity";
import { DispenseForm } from "../../components/form/DispenseForm";

export function CreateDispensePage() {
  const navigate = useNavigate();
  const { prescriptionId: paramId } = useParams<{ prescriptionId: string }>();
  const [searchParams] = useSearchParams();

  const prescriptionIdRaw = paramId ?? searchParams.get("prescriptionId");
  const prescriptionId = prescriptionIdRaw ? Number(prescriptionIdRaw) : null;

  const { data: prescriptionData, isLoading } = useQuery({
    queryKey: ["prescription", prescriptionId],
    queryFn: () => getPrescriptionById(prescriptionId!),
    enabled: !!prescriptionId,
  });

  const prescription = prescriptionData?.data ?? null;
  const { isValid, daysOld } = usePrescriptionValidity(prescription?.prescriptionDate ?? null);

  if (!prescriptionId) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-red-600 font-semibold">
          No se especificó un ID de receta. Acceda desde la lista de recetas.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="text-gray-500">Cargando receta...</span>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-red-600 font-semibold">
          No se encontró la receta #{prescriptionId}.
        </p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50 p-6 text-center">
          <span className="text-4xl" aria-hidden="true">⛔</span>
          <h2 className="text-xl font-bold text-red-800">Receta Vencida</h2>
          <p className="text-red-700">
            La receta #{prescriptionId} fue emitida hace{" "}
            <strong>{daysOld} días</strong> y ya no es válida para despacho.
            El paciente debe solicitar una nueva receta al médico tratante.
          </p>
          <p className="text-sm text-red-600">
            Las recetas son válidas por un máximo de 7 días desde su fecha de emisión.
          </p>
          <button
            className="mt-2 px-4 py-2 rounded-lg bg-red-100 text-red-800 font-semibold hover:bg-red-200 transition-colors"
            type="button"
            onClick={() => navigate("/dispense")}
          >
            Volver a Despachos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DispenseForm
        prescriptionDate={prescription.prescriptionDate}
        prescriptionId={prescriptionId}
        onSuccess={() => navigate("/dispense")}
      />
    </div>
  );
}
