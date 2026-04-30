import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { nameRoutes } from "../../configs/constants";
import {
  deletePrescriptionItem,
  getPrescriptionById,
} from "../../services/prescriptionService";
import { LoadingComponent } from "../spinner/LoadingComponent";
import { AddItemForm } from "./AddItemForm";
import { PrescriptionItemRow } from "./PrescriptionItemRow";

interface ExistingPrescriptionViewProps {
  readonly prescriptionId: number;
  readonly fromDoctorDashboard: boolean;
  readonly patientName?: string;
}

export function ExistingPrescriptionView({
  prescriptionId,
  fromDoctorDashboard,
  patientName,
}: ExistingPrescriptionViewProps) {
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
      queryClient.invalidateQueries({
        queryKey: ["prescription-detail", prescriptionId],
      });
    },
    onError: () => toast.danger("Error al eliminar el medicamento"),
  });

  const handleItemAdded = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["prescription-detail", prescriptionId],
    });
    toast.success("Medicamento agregado");
  }, [queryClient, prescriptionId]);

  const handleBack = useCallback(
    () =>
      fromDoctorDashboard ? navigate(nameRoutes.doctorDashboard) : navigate(-1),
    [fromDoctorDashboard, navigate],
  );

  const handleDeleteItem = useCallback(
    (id: number) => deleteItemMutation.mutate(id),
    [deleteItemMutation],
  );

  if (isLoading) return <LoadingComponent />;

  const prescription = data?.success ? data.data : null;
  if (!prescription)
    return (
      <div className="p-8 text-center text-gray-400">Receta no encontrada.</div>
    );

  const items = prescription.items ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button size="sm" variant="secondary" onPress={handleBack}>
          <i className="bi bi-arrow-left mr-1" /> Volver
        </Button>
        <h1 className="text-2xl font-bold">Receta #{prescription.id}</h1>
      </div>
      {patientName ? (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 dark:bg-blue-900/20 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <i className="bi bi-person-check mr-2" />
            Receta para: <strong>{patientName}</strong>
          </p>
        </div>
      ) : null}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="font-semibold text-gray-500">Consulta:</span> #
            {prescription.consultationId}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Fecha:</span>{" "}
            {prescription.prescriptionDate}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Estado:</span>{" "}
            {prescription.state === 1 ? "Activa" : "Inactiva"}
          </div>
          {prescription.notes ? (
            <div className="col-span-2 md:col-span-4">
              <span className="font-semibold text-gray-500">Indicaciones:</span>{" "}
              {prescription.notes}
            </div>
          ) : null}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">
          <i className="bi bi-capsule mr-2" />
          Medicamentos ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No hay medicamentos. Agregue al menos uno.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <PrescriptionItemRow
                key={item.id}
                item={item}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4">
          <i className="bi bi-plus-circle mr-2" />
          Agregar Medicamento
        </h2>
        <AddItemForm
          prescriptionId={prescriptionId}
          onSuccess={handleItemAdded}
        />
      </div>
    </div>
  );
}
