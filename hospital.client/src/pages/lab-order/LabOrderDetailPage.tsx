import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { LabOrderItemResultForm } from "../../components/form/LabOrderItemResultForm";
import { PublishButton } from "../../components/labOrder/PublishButton";
import { OutOfRangeAlert } from "../../components/shared/OutOfRangeAlert";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import {
  getLabOrderById,
  partialUpdateLabOrder,
  partialUpdateLabOrderItem,
} from "../../services/labOrderService";

export function LabOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const labOrderId = Number(id);

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["lab-order", labOrderId],
    queryFn: () => getLabOrderById(labOrderId),
    enabled: !!labOrderId,
  });

  const publishMutation = useMutation({
    mutationFn: (itemId: number) =>
      partialUpdateLabOrderItem({ id: itemId, isPublished: true }),
    onSuccess: async () => {
      toast.success("Resultado publicado exitosamente.");
      const refreshed = await refetch();
      const updatedOrder = refreshed.data?.data;
      if (!updatedOrder) return;
      const updatedItems = (updatedOrder as unknown as { items?: Array<{ isPublished?: boolean | null }> })?.items ?? [];
      const allPublished = updatedItems.length > 0 && updatedItems.every((i) => i.isPublished);
      if (allPublished && updatedOrder.orderStatus < 2) {
        await partialUpdateLabOrder({ id: labOrderId, orderStatus: 2 });
        toast.success("Todos los resultados publicados. Orden marcada como Completada.");
        queryClient.invalidateQueries({ queryKey: ["lab-order", labOrderId] });
      }
    },
    onError: () => toast.danger("Error al publicar el resultado."),
  });

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePublish = useCallback(
    (itemId: number) => {
      publishMutation.mutate(itemId);
    },
    [publishMutation],
  );

  if (isLoading) return <LoadingComponent />;

  const order = data?.success ? data.data : null;

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">No se encontró la orden de laboratorio.</p>
        <Button
          className="mt-4"
          size="sm"
          variant="secondary"
          onPress={handleGoBack}
        >
          <i className="bi bi-arrow-left mr-1" /> Volver
        </Button>
      </div>
    );
  }

  // Items may be nested in the response under different keys depending on the API include
  const items = (order as unknown as { items?: unknown[] })?.items ?? [];

  // Calculate total amount as sum of item amounts
  const totalAmount = (
    items as unknown as Array<{ amount?: number | null }>
  ).reduce((sum, item) => sum + (item.amount ?? 0), 0);

  const statusLabel =
    order.orderStatus === 0 ? "Pendiente" :
    order.orderStatus === 1 ? "En proceso" : "Completada";

  const statusColor =
    order.orderStatus === 0 ? "bg-yellow-100 text-yellow-800" :
    order.orderStatus === 1 ? "bg-blue-100 text-blue-800" :
    "bg-green-100 text-green-800";

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Button size="sm" variant="secondary" onPress={handleGoBack}>
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
            {(order as unknown as { patient?: { name?: string } })?.patient
              ?.name ?? `#${order.patientId}`}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Médico:</span>{" "}
            {(order as unknown as { doctor?: { name?: string } })?.doctor
              ?.name ?? `#${order.doctorId}`}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Estado:</span>{" "}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-500">Total:</span>{" "}
            <span className="font-bold">Q {totalAmount.toFixed(2)}</span>
          </div>
          {order.isExternal ? (
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                Externa
              </span>
            </div>
          ) : null}
          {order.notes ? (
            <div className="col-span-2 md:col-span-4">
              <span className="font-semibold text-gray-500">Notas:</span>{" "}
              {order.notes}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Pago pendiente: bloquear registro de resultados ── */}
      {order.orderStatus === 0 && (
        <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 px-5 py-4">
          <p className="font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-lg" />
            Pago pendiente — no se puede registrar resultados
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
            El paciente debe realizar el pago de esta orden en Caja antes de proceder con la toma de muestras y el registro de resultados.
          </p>
        </div>
      )}

      {/* ── Items ── */}
      <h2 className="text-lg font-bold mb-4">
        <i className="bi bi-flask mr-2" />
        Exámenes ({items.length})
      </h2>

      {items.length === 0 && (
        <p className="text-gray-400 text-center py-6">
          Esta orden no tiene exámenes registrados.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {(
          items as Array<{
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
          }>
        ).map((item) => (
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
                  Cantidad:{" "}
                  <span className="font-semibold">{item.amount ?? 0}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <OutOfRangeAlert
                  isOutOfRange={item.isOutOfRange ?? false}
                  referenceRange={item.referenceRange ?? undefined}
                />
                {item.isPublished ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                    ✅ Publicado
                  </span>
                ) : null}
              </div>
            </div>

            {/* Result entry form — solo disponible si la orden está pagada (En proceso o superior) */}
            {order.orderStatus >= 1 ? (
              <>
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    <i className="bi bi-pencil-square mr-1" /> Ingresar / Actualizar
                    Resultado
                  </p>
                  <LabOrderItemResultForm item={item} onSuccess={handleRefetch} />
                </div>

                {/* Publish button */}
                {!item.isPublished && (
                  <div className="mt-3 flex justify-end">
                    <PublishButton
                      isPending={publishMutation.isPending}
                      itemId={item.id}
                      onPublish={handlePublish}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="border-t pt-4 mt-2">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 italic">
                  <i className="bi bi-lock mr-1" /> Registro de resultado bloqueado hasta confirmar pago en Caja.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
