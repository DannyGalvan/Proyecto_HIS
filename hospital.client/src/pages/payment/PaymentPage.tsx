import { Button, Input, Label, Modal, Spinner, TextField, toast } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";
import { PaymentResponseColumns } from "../../components/column/PaymentResponseColumns";
import { AsyncButton } from "../../components/button/AsyncButton";
import { Icon } from "../../components/icons/Icon";
import { TableServer } from "../../components/table/TableServer";
import { createPayment, getPayments, getPendingOrders } from "../../services/paymentService";
import { partialUpdateLabOrder } from "../../services/labOrderService";
import { partialUpdateDispense } from "../../services/dispenseService";
import { usePaymentStore } from "../../stores/usePaymentStore";
import { customStyles } from "../../theme/tableTheme";
import type { PendingOrderResponse } from "../../types/PendingOrderResponse";
import type { PaymentRequest } from "../../types/PaymentResponse";
import { generateIdempotencyKey } from "../../utils/generateIdempotencyKey";

type PaymentMethodType = "cash" | "card";

interface PaymentFormState {
  paymentMethod: PaymentMethodType;
  amountReceived: string;
  cardLastFourDigits: string;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  LabOrder: "Laboratorio",
  Dispense: "Farmacia",
};

function formatCurrency(amount: number): string {
  return `Q ${amount.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function PaymentPage() {
  const { filters, setFilters } = usePaymentStore();

  // Pending orders state
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingOrders, setPendingOrders] = useState<PendingOrderResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [ordersToPayList, setOrdersToPayList] = useState<PendingOrderResponse[]>([]);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    paymentMethod: "cash",
    amountReceived: "",
    cardLastFourDigits: "",
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Unique key for each order row (used for selection)
  const getOrderKey = useCallback(
    (order: PendingOrderResponse) => `${order.orderType}-${order.orderId}`,
    [],
  );

  // Total for selected orders
  const selectedTotal = useMemo(() => {
    return pendingOrders
      .filter((o) => selectedOrderIds.has(getOrderKey(o)))
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [pendingOrders, selectedOrderIds, getOrderKey]);

  // Total for orders in payment modal
  const paymentTotal = useMemo(() => {
    return ordersToPayList.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [ordersToPayList]);

  // Change calculation for cash
  const changeAmount = useMemo(() => {
    const received = parseFloat(paymentForm.amountReceived);
    if (isNaN(received)) return 0;
    return Math.max(0, received - paymentTotal);
  }, [paymentForm.amountReceived, paymentTotal]);

  // Search pending orders
  const handleSearch = useCallback(async () => {
    const term = searchTerm.trim();
    if (!term) {
      toast.danger("Ingrese un DPI o número de orden para buscar.");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSelectedOrderIds(new Set());

    try {
      // Determine if search term is a DPI (numeric, 13 digits) or order number
      const isNumericOnly = /^\d+$/.test(term);
      const isDpi = isNumericOnly && term.length >= 8;

      const response = await getPendingOrders(
        isDpi ? term : undefined,
        !isDpi ? term : undefined,
      );

      if (response.success && response.data) {
        setPendingOrders(response.data);
        if (response.data.length === 0) {
          toast.info("No se encontraron órdenes pendientes.");
        }
      } else {
        setPendingOrders([]);
        toast.danger(response.message ?? "Error al buscar órdenes pendientes.");
      }
    } catch {
      setPendingOrders([]);
      toast.danger("Error al buscar órdenes pendientes.");
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  // Toggle selection of a single order
  const toggleOrderSelection = useCallback(
    (order: PendingOrderResponse) => {
      const key = getOrderKey(order);
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [getOrderKey],
  );

  // Toggle all orders
  const toggleAllOrders = useCallback(() => {
    if (selectedOrderIds.size === pendingOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(pendingOrders.map(getOrderKey)));
    }
  }, [selectedOrderIds.size, pendingOrders, getOrderKey]);

  // Open payment modal for a single order
  const handlePaySingle = useCallback((order: PendingOrderResponse) => {
    setOrdersToPayList([order]);
    setPaymentForm({ paymentMethod: "cash", amountReceived: "", cardLastFourDigits: "" });
    setIsPaymentModalOpen(true);
  }, []);

  // Open payment modal for selected orders
  const handlePaySelected = useCallback(() => {
    const selected = pendingOrders.filter((o) => selectedOrderIds.has(getOrderKey(o)));
    if (selected.length === 0) {
      toast.danger("Seleccione al menos una orden para cobrar.");
      return;
    }
    setOrdersToPayList(selected);
    setPaymentForm({ paymentMethod: "cash", amountReceived: "", cardLastFourDigits: "" });
    setIsPaymentModalOpen(true);
  }, [pendingOrders, selectedOrderIds, getOrderKey]);

  // Close payment modal
  const closePaymentModal = useCallback(() => {
    if (!isProcessingPayment) {
      setIsPaymentModalOpen(false);
      setOrdersToPayList([]);
    }
  }, [isProcessingPayment]);

  // Validate payment form
  const validatePayment = useCallback((): boolean => {
    if (paymentForm.paymentMethod === "cash") {
      const received = parseFloat(paymentForm.amountReceived);
      if (isNaN(received) || received <= 0) {
        toast.danger("Ingrese el monto recibido.");
        return false;
      }
      if (received < paymentTotal) {
        toast.danger("El monto recibido es menor al total a pagar.");
        return false;
      }
    } else {
      if (!/^\d{4}$/.test(paymentForm.cardLastFourDigits)) {
        toast.danger("Ingrese los últimos 4 dígitos de la tarjeta.");
        return false;
      }
    }
    return true;
  }, [paymentForm, paymentTotal]);

  // Process payment
  const handleProcessPayment = useCallback(async () => {
    if (!validatePayment()) return;

    setIsProcessingPayment(true);

    try {
      // Process each order individually
      for (const order of ordersToPayList) {
        const idempotencyKey = generateIdempotencyKey();

        const paymentRequest: PaymentRequest = {
          amount: order.totalAmount,
          paymentMethod: paymentForm.paymentMethod === "cash" ? 0 : 1,
          paymentType: order.paymentType,
          paymentStatus: 1,
          paymentDate: new Date().toISOString(),
          idempotencyKey,
          state: 1,
          ...(order.paymentType === 1 ? { labOrderId: order.orderId } : {}),
          ...(order.paymentType === 2 ? { dispenseId: order.orderId } : {}),
          ...(paymentForm.paymentMethod === "cash"
            ? {
                amountReceived: parseFloat(paymentForm.amountReceived),
                changeAmount: Math.max(0, parseFloat(paymentForm.amountReceived) - order.totalAmount),
              }
            : {
                cardLastFourDigits: paymentForm.cardLastFourDigits,
              }),
        };

        const paymentResponse = await createPayment(paymentRequest);

        if (!paymentResponse.success) {
          toast.danger(
            paymentResponse.message ??
              `Error al procesar pago de orden ${order.orderNumber}.`,
          );
          setIsProcessingPayment(false);
          return;
        }

        // Update order status to Paid (1)
        try {
          if (order.orderType === "LabOrder") {
            await partialUpdateLabOrder({ id: order.orderId, orderStatus: 1 });
          } else if (order.orderType === "Dispense") {
            await partialUpdateDispense({ id: order.orderId, dispenseStatus: 1 });
          }
        } catch {
          toast.warning(
            `Pago registrado pero no se pudo actualizar el estado de la orden ${order.orderNumber}.`,
          );
        }
      }

      toast.success(
        ordersToPayList.length === 1
          ? "Pago procesado exitosamente."
          : `${ordersToPayList.length} pagos procesados exitosamente.`,
      );

      // Remove paid orders from the list
      const paidKeys = new Set(ordersToPayList.map(getOrderKey));
      setPendingOrders((prev) => prev.filter((o) => !paidKeys.has(getOrderKey(o))));
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        for (const key of paidKeys) next.delete(key);
        return next;
      });

      setIsPaymentModalOpen(false);
      setOrdersToPayList([]);
    } catch {
      toast.danger("Error inesperado al procesar el pago.");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [ordersToPayList, paymentForm, validatePayment, getOrderKey]);

  // Payments table query
  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getPayments({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Pagos</h1>

      {/* Pending Orders Section */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Icon name="bi bi-clock-history" size={22} color="#0A4FA6" />
          <span>Órdenes Pendientes de Pago</span>
        </h2>

        {/* Search bar */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-[250px]">
            <TextField name="pendingSearch">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Buscar por DPI del paciente o número de orden
              </Label>
              <Input
                placeholder="Ingrese DPI o número de orden..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </TextField>
          </div>
          <Button
            className="px-6 py-2"
            color="primary"
            isDisabled={isSearching}
            onPress={handleSearch}
          >
            {isSearching ? <Spinner color="current" size="sm" /> : <Icon name="bi bi-search" size={16} color="white" />}
            <span className="ml-1">Buscar</span>
          </Button>
        </div>

        {/* Results */}
        {isSearching && (
          <div className="flex justify-center py-8">
            <Spinner color="primary" size="lg" />
          </div>
        )}

        {!isSearching && hasSearched && pendingOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon name="bi bi-inbox" size={40} color="#9CA3AF" />
            <p className="mt-2">No se encontraron órdenes pendientes.</p>
          </div>
        )}

        {!isSearching && pendingOrders.length > 0 && (
          <>
            {/* Selection actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedOrderIds.size} de {pendingOrders.length} seleccionadas
                </span>
                {selectedOrderIds.size > 0 && (
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Total seleccionado: {formatCurrency(selectedTotal)}
                  </span>
                )}
              </div>
              {selectedOrderIds.size > 1 && (
                <Button
                  color="success"
                  size="sm"
                  onPress={handlePaySelected}
                >
                  <Icon name="bi bi-cash-stack" size={16} color="white" />
                  <span className="ml-1">Cobrar Seleccionados ({formatCurrency(selectedTotal)})</span>
                </Button>
              )}
            </div>

            {/* Pending orders table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 text-left">
                    <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.size === pendingOrders.length && pendingOrders.length > 0}
                        onChange={toggleAllOrders}
                        className="rounded border-gray-300"
                        aria-label="Seleccionar todas las órdenes"
                      />
                    </th>
                    <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300 uppercase text-xs tracking-wide">
                      Tipo
                    </th>
                    <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300 uppercase text-xs tracking-wide">
                      Número
                    </th>
                    <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300 uppercase text-xs tracking-wide">
                      Paciente
                    </th>
                    <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300 uppercase text-xs tracking-wide">
                      Fecha
                    </th>
                    <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300 uppercase text-xs tracking-wide text-center">
                      Ítems
                    </th>
                    <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300 uppercase text-xs tracking-wide text-right">
                      Total
                    </th>
                    <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300 uppercase text-xs tracking-wide text-center">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => {
                    const key = getOrderKey(order);
                    const isSelected = selectedOrderIds.has(key);
                    return (
                      <tr
                        key={key}
                        className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/10"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOrderSelection(order)}
                            className="rounded border-gray-300"
                            aria-label={`Seleccionar orden ${order.orderNumber}`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              order.orderType === "LabOrder"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs">
                          {order.orderNumber}
                        </td>
                        <td className="px-3 py-3">{order.patientName}</td>
                        <td className="px-3 py-3 text-gray-600 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-center">{order.itemCount}</td>
                        <td className="px-3 py-3 text-right font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handlePaySingle(order)}
                          >
                            <Icon name="bi bi-cash" size={14} color="#0A4FA6" />
                            <span className="ml-1">Cobrar</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Existing Payments Table */}
      <TableServer
        hasFilters
        columns={PaymentResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="payments"
        setFilters={setFilters}
        styles={customStyles}
        text="pagos"
        title="Pagos"
      />

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onOpenChange={closePaymentModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="max-w-lg w-full">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Procesar Pago</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-5 p-2">
                  {/* Order summary */}
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      {ordersToPayList.length === 1
                        ? "Orden a cobrar"
                        : `${ordersToPayList.length} órdenes a cobrar`}
                    </p>
                    {ordersToPayList.map((order) => (
                      <div
                        key={getOrderKey(order)}
                        className="flex justify-between items-center text-sm py-1 border-b border-blue-100 dark:border-blue-800 last:border-0"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType} — {order.orderNumber}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-blue-300 dark:border-blue-700">
                      <span className="text-base font-bold text-blue-900 dark:text-blue-100">
                        Total a pagar
                      </span>
                      <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(paymentTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Método de pago
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentForm((prev) => ({ ...prev, paymentMethod: "cash" }))
                        }
                        className={`flex-1 rounded-lg border-2 p-3 text-center transition-colors ${
                          paymentForm.paymentMethod === "cash"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          name="bi bi-cash"
                          size={20}
                          color={paymentForm.paymentMethod === "cash" ? "#0A4FA6" : "#9CA3AF"}
                        />
                        <p className="text-sm font-medium mt-1">Efectivo</p>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentForm((prev) => ({ ...prev, paymentMethod: "card" }))
                        }
                        className={`flex-1 rounded-lg border-2 p-3 text-center transition-colors ${
                          paymentForm.paymentMethod === "card"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          name="bi bi-credit-card"
                          size={20}
                          color={paymentForm.paymentMethod === "card" ? "#0A4FA6" : "#9CA3AF"}
                        />
                        <p className="text-sm font-medium mt-1">Tarjeta</p>
                      </button>
                    </div>
                  </div>

                  {/* Cash payment fields */}
                  {paymentForm.paymentMethod === "cash" && (
                    <div className="space-y-4">
                      <TextField name="amountReceived">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Monto recibido (GTQ)
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={paymentForm.amountReceived}
                          onChange={(e) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              amountReceived: e.target.value,
                            }))
                          }
                        />
                      </TextField>

                      {paymentForm.amountReceived &&
                        parseFloat(paymentForm.amountReceived) >= paymentTotal && (
                          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 flex justify-between items-center">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Cambio
                            </span>
                            <span className="text-xl font-bold text-green-800 dark:text-green-200">
                              {formatCurrency(changeAmount)}
                            </span>
                          </div>
                        )}

                      {paymentForm.amountReceived &&
                        parseFloat(paymentForm.amountReceived) > 0 &&
                        parseFloat(paymentForm.amountReceived) < paymentTotal && (
                          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                            <span className="text-sm text-red-700 dark:text-red-300">
                              El monto recibido es insuficiente. Faltan{" "}
                              {formatCurrency(paymentTotal - parseFloat(paymentForm.amountReceived))}.
                            </span>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Card payment fields */}
                  {paymentForm.paymentMethod === "card" && (
                    <TextField name="cardLastFour">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Últimos 4 dígitos de la tarjeta
                      </Label>
                      <Input
                        type="text"
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="1234"
                        value={paymentForm.cardLastFourDigits}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            cardLastFourDigits: e.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                      />
                    </TextField>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="flex gap-2 justify-end w-full">
                  <Button
                    variant="secondary"
                    isDisabled={isProcessingPayment}
                    onPress={closePaymentModal}
                  >
                    Cancelar
                  </Button>
                  <AsyncButton
                    isLoading={isProcessingPayment}
                    color="primary"
                    onPress={handleProcessPayment}
                  >
                    Confirmar Pago ({formatCurrency(paymentTotal)})
                  </AsyncButton>
                </div>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}