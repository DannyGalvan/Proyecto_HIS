import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { OptionsSelect } from "../../components/select/OptionsSelect";
import { PaymentReceipt } from "../../components/shared/PaymentReceipt";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import {
  createPayment,
  getPendingOrders,
} from "../../services/paymentService";
import type { PendingOrderResponse } from "../../types/PendingOrderResponse";
import type {
  PaymentRequest,
  PaymentResponse,
} from "../../types/PaymentResponse";
import { calculateChange } from "../../utils/calculateChange";
import { generateIdempotencyKey } from "../../utils/generateIdempotencyKey";

const PAYMENT_METHODS = [
  { label: "Efectivo (Q)", value: "0" },
  { label: "Visa", value: "1" },
  { label: "Mastercard", value: "2" },
  { label: "Débito", value: "3" },
];

export function LabCashierPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"dpi" | "order">("dpi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] =
    useState<PendingOrderResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<number>(0);
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [cardLastFour, setCardLastFour] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState<{
    payment: PaymentResponse;
    change: number;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["lab-cashier-search", searchQuery, searchType],
    queryFn: () => {
      if (!searchQuery) return Promise.resolve({ success: true as const, data: [], message: "", totalResults: 0 });
      return getPendingOrders(
        searchType === "dpi" ? searchQuery : undefined,
        searchType === "order" ? searchQuery : undefined,
      );
    },
    enabled: !!searchQuery,
  });

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: PaymentRequest) => {
      const response = await createPayment(paymentData);
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        const payment = response.data as PaymentResponse;
        const change =
          paymentMethod === 0
            ? Math.max(
                0,
                calculateChange(
                  Number(amountReceived),
                  selectedOrder?.totalAmount ?? 0,
                ),
              )
            : 0;
        setPaymentSuccess({ payment, change });
        const patientName = selectedOrder?.patientName ?? "Paciente";
        toast.success(
          `¡Pago de laboratorio registrado exitosamente! Paciente: ${patientName}. La orden ha sido actualizada a estado "En proceso".`,
        );
        queryClient.invalidateQueries({ queryKey: ["lab-cashier-search"] });
      } else {
        const msg = response.message ?? "";
        if (
          msg.toLowerCase().includes("rechaz") ||
          msg.toLowerCase().includes("declined")
        ) {
          toast.danger(
            "La transacción con tarjeta fue rechazada por el banco. Solicite al paciente otro método de pago.",
          );
        } else {
          toast.danger(
            `Error al procesar el pago: ${msg || "Intente nuevamente."}`,
          );
        }
      }
    },
    onError: () =>
      toast.danger(
        "Error de comunicación con el sistema de pagos. Intente nuevamente.",
      ),
  });

  const handleSearchTypeDpi = useCallback(() => setSearchType("dpi"), []);
  const handleSearchTypeOrder = useCallback(() => setSearchType("order"), []);
  const handleSearchValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value),
    [],
  );
  const handleDeselectOrder = useCallback(() => setSelectedOrder(null), []);
  const handlePaymentMethodChange = useCallback((v: unknown) => {
    const val =
      v &&
      !Array.isArray(v) &&
      typeof v === "object" && true &&
      "value" in v
        ? Number((v as { value: string }).value)
        : 0;
    setPaymentMethod(val);
  }, []);
  const handleAmountReceivedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAmountReceived(e.target.value),
    [],
  );
  const handleCardLastFourChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setCardLastFour(e.target.value.replace(/\D/g, "")),
    [],
  );
  const handleNewPayment = useCallback(() => {
    setSelectedOrder(null);
    setPaymentSuccess(null);
    setSearchValue("");
    setSearchQuery("");
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchValue.trim()) {
        toast.danger("Ingrese un DPI o número de orden para buscar");
        return;
      }
      setSearchQuery(searchValue.trim());
      setSelectedOrder(null);
      setPaymentSuccess(null);
    },
    [searchValue],
  );

  const handleSelectOrder = useCallback((order: PendingOrderResponse) => {
    setSelectedOrder(order);
    setPaymentSuccess(null);
    setAmountReceived(String(order.totalAmount));
  }, []);

  const handlePay = useCallback(() => {
    if (!selectedOrder) return;

    if (paymentMethod === 0) {
      const received = Number(amountReceived);
      if (received < selectedOrder.totalAmount) {
        toast.danger(
          `El monto recibido (Q${received}) es menor al monto a cobrar (Q${selectedOrder.totalAmount})`,
        );
        return;
      }
    }

    if (
      (paymentMethod === 1 || paymentMethod === 2 || paymentMethod === 3) &&
      cardLastFour.length !== 4
    ) {
      toast.danger("Ingrese los últimos 4 dígitos de la tarjeta");
      return;
    }

    const paymentData: PaymentRequest = {
      labOrderId: selectedOrder.orderId,
      amount: selectedOrder.totalAmount,
      paymentMethod,
      paymentType: selectedOrder.paymentType,
      paymentStatus: 1, // Completado
      paymentDate: new Date().toISOString(),
      idempotencyKey: generateIdempotencyKey(),
      amountReceived: paymentMethod === 0 ? Number(amountReceived) : null,
      changeAmount:
        paymentMethod === 0
          ? Math.max(
              0,
              calculateChange(
                Number(amountReceived),
                selectedOrder.totalAmount,
              ),
            )
          : null,
      cardLastFourDigits: paymentMethod !== 0 ? cardLastFour : null,
      state: 1,
    };

    paymentMutation.mutate(paymentData);
  }, [
    selectedOrder,
    paymentMethod,
    amountReceived,
    cardLastFour,
    paymentMutation,
  ]);

  const orders = data?.success ? data.data : [];
  const change =
    paymentMethod === 0 && selectedOrder
      ? Math.max(
          0,
          calculateChange(Number(amountReceived), selectedOrder.totalAmount),
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Cobro de Laboratorio en Caja</h1>
      <p className="text-gray-500 text-sm mb-6">
        Busque órdenes de laboratorio pendientes de pago para procesar el cobro.
      </p>

      {/* Buscador */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
        <form
          className="flex flex-col md:flex-row gap-3"
          onSubmit={handleSearch}
        >
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${searchType === "dpi" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
              type="button"
              onClick={handleSearchTypeDpi}
            >
              Por DPI
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${searchType === "order" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
              type="button"
              onClick={handleSearchTypeOrder}
            >
              Por No. Orden
            </button>
          </div>
          <input
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              searchType === "dpi"
                ? "DPI del paciente (13 dígitos)"
                : "Número de orden"
            }
            type="text"
            value={searchValue}
            onChange={handleSearchValueChange}
          />
          <Button className="px-6" type="submit" variant="primary">
            <i className="bi bi-search mr-2" /> Buscar
          </Button>
        </form>
      </div>

      {isLoading ? <LoadingComponent /> : null}

      {/* Lista de órdenes pendientes */}
      {!isLoading && orders.length > 0 && !selectedOrder && (
        <div className="space-y-3 mb-6">
          <h2 className="font-bold text-lg">Órdenes Pendientes de Pago</h2>
          {orders.map((order) => (
            <button
              key={order.orderId}
              className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              type="button"
              onClick={() => handleSelectOrder(order)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-base">
                    Orden #{order.orderNumber} — {order.patientName}
                  </p>
                  <p className="text-sm text-gray-500">
                    DPI: {order.patientDpi} · {order.itemCount} examen(es)
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Creada: {new Date(order.createdAt).toLocaleString("es-GT")}
                  </p>
                </div>
                <span className="text-xl font-bold text-green-700">
                  Q{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!isLoading && searchQuery && orders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <i className="bi bi-flask text-4xl block mb-3" />
          <p>
            No se encontraron órdenes de laboratorio pendientes de pago.
            Verifique el DPI o número de orden e intente de nuevo.
          </p>
        </div>
      ) : null}

      {/* Formulario de cobro */}
      {selectedOrder && !paymentSuccess ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">Cobro de Laboratorio</h2>
              <p className="text-gray-500 text-sm">
                Orden #{selectedOrder.orderNumber}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onPress={handleDeselectOrder}
            >
              <i className="bi bi-arrow-left mr-1" /> Cambiar orden
            </Button>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div>
                <span className="font-semibold">Paciente:</span>{" "}
                {selectedOrder.patientName}
              </div>
              <div>
                <span className="font-semibold">DPI:</span>{" "}
                {selectedOrder.patientDpi}
              </div>
              <div>
                <span className="font-semibold">No. Orden:</span>{" "}
                {selectedOrder.orderNumber}
              </div>
              <div>
                <span className="font-semibold">Exámenes:</span>{" "}
                {selectedOrder.itemCount}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <span className="font-bold text-lg">Total a Cobrar:</span>
              <span className="text-3xl font-bold text-green-700">
                Q{selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="mb-4">
            <OptionsSelect
              isRequired
              defaultValue={{ label: "Efectivo (Q)", value: "0" }}
              label="Método de Pago"
              name="paymentMethod"
              options={PAYMENT_METHODS}
              placeholder="Seleccione método de pago"
              onChange={handlePaymentMethodChange}
            />
          </div>

          {/* Efectivo */}
          {paymentMethod === 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Monto Recibido (Q)
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={selectedOrder.totalAmount}
                  step="0.01"
                  type="number"
                  value={amountReceived}
                  onChange={handleAmountReceivedChange}
                />
              </div>
              <div className="flex flex-col justify-end">
                <div
                  className={`p-3 rounded-lg text-center ${change >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                >
                  <p className="text-sm font-semibold text-gray-600">
                    Cambio a Devolver
                  </p>
                  <p
                    className={`text-2xl font-bold ${change >= 0 ? "text-green-700" : "text-red-600"}`}
                  >
                    Q{change.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta */}
          {paymentMethod !== 0 && (
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">
                Últimos 4 dígitos de la tarjeta
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
                placeholder="XXXX"
                type="text"
                value={cardLastFour}
                onChange={handleCardLastFourChange}
              />
            </div>
          )}

          <Button
            className="w-full py-3 text-lg font-bold"
            isDisabled={paymentMutation.isPending}
            variant="primary"
            onPress={handlePay}
          >
            {paymentMutation.isPending ? (
              <>
                <i className="bi bi-hourglass-split mr-2 animate-spin" />{" "}
                Procesando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle mr-2" /> Confirmar Pago Q
                {selectedOrder.totalAmount.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      ) : null}

      {/* Comprobante de pago */}
      {paymentSuccess && selectedOrder ? (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-8 text-center">
          <i className="bi bi-check-circle-fill text-green-600 text-5xl block mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            ¡Pago de Laboratorio Registrado Exitosamente!
          </h2>
          <p className="text-green-700 mb-6">
            La orden ha sido actualizada. La toma de muestras puede proceder.
          </p>

          <PaymentReceipt
            branchName="Laboratorio"
            patientName={selectedOrder.patientName}
            payment={paymentSuccess.payment}
            serviceDetail={`Orden de Laboratorio #${selectedOrder.orderNumber} — ${selectedOrder.itemCount} examen(es)`}
          />

          <div className="flex gap-3 justify-center mt-6">
            <Button variant="secondary" onPress={handleNewPayment}>
              <i className="bi bi-arrow-repeat mr-2" /> Nuevo Cobro
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
