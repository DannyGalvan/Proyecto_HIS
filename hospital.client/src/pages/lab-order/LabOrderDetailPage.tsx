import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { OutOfRangeAlert } from "../../components/shared/OutOfRangeAlert";
import { LabOrderItemResultForm } from "../../components/form/LabOrderItemResultForm";
import { getLabOrderById, partialUpdateLabOrderItem } from "../../services/labOrderService";

export function LabOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const labOrderId = Number(id);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["lab-order", labOrderId],
    queryFn: () => getLabOrderById(labOrderId),
    enabled: !!labOrderId,
  });

  const publishMutation = useMutation({
    mutationFn: (itemId: number) =>
      partialUpdateLabOrderItem({ id: itemId, isPublished: true }),
    onSuccess: () => {
      toast.success("Resultado publicado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["lab-order", labOrderId] });
    },
    onError: () => toast.danger("Error al publicar el resultado."),
  });

  if (isLoading) return <LoadingComponent />;

  const order = data?.success ? data.data : null;

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">No se encontró la orden de laboratorio.</p>
        <Button className="mt-4" size="sm" variant="secondary" onPress={() => navigate(-1)}>
          <i className="bi bi-arrow-left mr-1" /> Volver
        </Button>
      </div>
    );
  }

  // Items may be nested in the response under different keys depending on the API include
  const items = (order as unknown as { items?: unknown[] })?.items ?? [];

  // Calculate total amount as sum of item amounts
  const totalAmount = (items as unknown as Array<{ amount?: number | null }>).reduce(
    (sum, item) => sum + (item.amount ?? 0),
    0,
  );

  const statusLabel = order.orderStatus === 0 ? "Pendiente" : order.orderStatus === 1 ? "En proceso" : "Completada";

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Button size="sm" variant="secondary" onPress={() => navigate(-1)}>
          <i className="bi bi-arrow-left mr-1" /> Volver
        </Button>
        <h1 className="text-2xl font-bold">
          Orden de Laboratorio #{order.orderNumber ?? order.id}
        </h1>
      </div>

      {/* ── Order summary ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="font-semibold text-gray-500">Número:</span>{" "}
            {order.orderNumber ?? "—"}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Paciente:</span>{" "}
            {(order as unknown as { patient?: { name?: string } })?.patient?.name ?? `#${order.patientId}`}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Médico:</span>{" "}
            {(order as unknown as { doctor?: { name?: string } })?.doctor?.name ?? `#${order.doctorId}`}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Estado:</span>{" "}
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
              {statusLabel}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-500">Total:</span>{" "}
            <span className="font-bold">Q {totalAmount.toFixed(2)}</span>
          </div>
          {order.isExternal && (
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                Externa
              </span>
            </div>
          )}
          {order.notes && (
            <div className="col-span-2 md:col-span-4">
              <span className="font-semibold text-gray-500">Notas:</span> {order.notes}
            </div>
          )}
        </div>
      </div>

      {/* ── Items ── */}
      <h2 className="text-lg font-bold mb-4">
        <i className="bi bi-flask mr-2" />
        Exámenes ({items.length})
      </h2>

      {items.length === 0 && (
        <p className="text-gray-400 text-center py-6">Esta orden no tiene exámenes registrados.</p>
      )}

      <div className="flex flex-col gap-6">
        {(items as Array<{
          id: number;
          examName?: string | null;
          amount?: number | null;
          isOutOfRange?: boolean | null;
          referenceRange?: string | null;
          isPublished?: boolean | null;
          resultValue?: string | null;
          resultUnit?: string | null;
          resultNotes?: string | null;
          resultDate?: string | null;
          labExamId: number;
          labOrderId: number;
          state: number;
          createdAt: string;
          createdBy: number;
        }>).map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl border p-5"
          >
            {/* Item header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-base">
                  {item.examName ?? `Examen #${item.labExamId}`}
                </p>
                <p className="text-sm text-gray-500">
                  Cantidad: <span className="font-semibold">{item.amount ?? 0}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <OutOfRangeAlert
                  isOutOfRange={item.isOutOfRange ?? false}
                  referenceRange={item.referenceRange ?? undefined}
                />
                {item.isPublished && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                    ✅ Publicado
                  </span>
                )}
              </div>
            </div>

            {/* Result entry form */}
            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-semibold text-gray-600 mb-3">
                <i className="bi bi-pencil-square mr-1" /> Ingresar / Actualizar Resultado
              </p>
              <LabOrderItemResultForm
                item={item}
                onSuccess={() => refetch()}
              />
            </div>

            {/* Publish button */}
            {!item.isPublished && (
              <div className="mt-3 flex justify-end">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-800 hover:bg-green-200 transition-colors disabled:opacity-50"
                  disabled={publishMutation.isPending}
                  type="button"
                  onClick={() => publishMutation.mutate(item.id)}
                >
                  <i className="bi bi-send-check mr-1" /> Publicar resultado
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
