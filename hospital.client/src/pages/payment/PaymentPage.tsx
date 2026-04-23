import { Button, Input, Label, Spinner, TextField, toast } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";

import { PaymentResponseColumns } from "../../components/column/PaymentResponseColumns";
import { Icon } from "../../components/icons/Icon";
import { PaymentModal } from "../../components/payment/PaymentModal";
import { PendingOrdersTable } from "../../components/payment/PendingOrdersTable";
import { TableServer } from "../../components/table/TableServer";
import { partialUpdateDispense } from "../../services/dispenseService";
import { partialUpdateLabOrder } from "../../services/labOrderService";
import {
  createPayment,
  getPayments,
  getPendingOrders,
} from "../../services/paymentService";
import { usePaymentStore } from "../../stores/usePaymentStore";
import { customStyles } from "../../theme/tableTheme";
import type { PaymentRequest } from "../../types/PaymentResponse";
import type { PendingOrderResponse } from "../../types/PendingOrderResponse";
import { generateIdempotencyKey } from "../../utils/generateIdempotencyKey";

type PaymentMethodType = "cash" | "card";

interface PaymentFormState {
  paymentMethod: PaymentMethodType;
  amountReceived: string;
  cardLastFourDigits: string;
}

function formatCurrency(amount: number): string {
  return `Q ${amount.toFixed(2)}`;
}

export function PaymentPage() {
  const { filters, setFilters } = usePaymentStore();

  // Pending orders state
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingOrders, setPendingOrders] = useState<PendingOrderResponse[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    new Set(),
  );

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [ordersToPayList, setOrdersToPayList] = useState<
    PendingOrderResponse[]
  >([]);
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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [],
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  // Toggle selection of a single order (accepts key directly)
  const toggleOrderSelection = useCallback((key: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Toggle all orders
  const toggleAllOrders = useCallback(() => {
    if (selectedOrderIds.size === pendingOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(pendingOrders.map(getOrderKey)));
    }
  }, [selectedOrderIds.size, pendingOrders, getOrderKey]);

  const resetPaymentForm = useCallback(() => {
    setPaymentForm({
      paymentMethod: "cash",
      amountReceived: "",
      cardLastFourDigits: "",
    });
  }, []);

  // Open payment modal for a single order
  const handlePaySingle = useCallback(
    (order: PendingOrderResponse) => {
      setOrdersToPayList([order]);
      resetPaymentForm();
      setIsPaymentModalOpen(true);
    },
    [resetPaymentForm],
  );

  // Open payment modal for selected orders
  const handlePaySelected = useCallback(() => {
    const selected = pendingOrders.filter((o) =>
      selectedOrderIds.has(getOrderKey(o)),
    );
    if (selected.length === 0) {
      toast.danger("Seleccione al menos una orden para cobrar.");
      return;
    }
    setOrdersToPayList(selected);
    resetPaymentForm();
    setIsPaymentModalOpen(true);
  }, [pendingOrders, selectedOrderIds, getOrderKey, resetPaymentForm]);

  // Close payment modal
  const closePaymentModal = useCallback(() => {
    if (!isProcessingPayment) {
      setIsPaymentModalOpen(false);
      setOrdersToPayList([]);
    }
  }, [isProcessingPayment]);

  // Payment form field handlers
  const handleSelectCash = useCallback(
    () => setPaymentForm((prev) => ({ ...prev, paymentMethod: "cash" })),
    [],
  );
  const handleSelectCard = useCallback(
    () => setPaymentForm((prev) => ({ ...prev, paymentMethod: "card" })),
    [],
  );
  const handleAmountReceivedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPaymentForm((prev) => ({ ...prev, amountReceived: e.target.value })),
    [],
  );
  const handleCardDigitsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPaymentForm((prev) => ({
        ...prev,
        cardLastFourDigits: e.target.value.replace(/\D/g, "").slice(0, 4),
      })),
    [],
  );

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
                changeAmount: Math.max(
                  0,
                  parseFloat(paymentForm.amountReceived) - order.totalAmount,
                ),
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

        try {
          if (order.orderType === "LabOrder") {
            await partialUpdateLabOrder({ id: order.orderId, orderStatus: 1 });
          } else if (order.orderType === "Dispense") {
            await partialUpdateDispense({
              id: order.orderId,
              dispenseStatus: 1,
            });
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

      const paidKeys = new Set(ordersToPayList.map(getOrderKey));
      setPendingOrders((prev) =>
        prev.filter((o) => !paidKeys.has(getOrderKey(o))),
      );
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
      return getPayments({
        pageNumber: page,
        pageSize,
        filters,
        include: "",
        includeTotal: false,
      });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Pagos</h1>

      {/* Pending Orders Section */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Icon color="#0A4FA6" name="bi bi-clock-history" size={22} />
          <span>Órdenes Pendientes de Pago</span>
        </h2>

        {/* Search bar */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-62.5">
            <TextField name="pendingSearch">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Buscar por DPI del paciente o número de orden
              </Label>
              <Input
                placeholder="Ingrese DPI o número de orden..."
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
              />
            </TextField>
          </div>
          <Button
            className="px-6 py-2"
            isDisabled={isSearching}
            variant="primary"
            onPress={handleSearch}
          >
            {isSearching ? (
              <Spinner color="current" size="sm" />
            ) : (
              <Icon color="white" name="bi bi-search" size={16} />
            )}
            <span className="ml-1">Buscar</span>
          </Button>
        </div>

        {/* Loading */}
        {isSearching ? (
          <div className="flex justify-center py-8">
            <Spinner color="accent" size="lg" />
          </div>
        ) : null}

        {/* Empty state */}
        {!isSearching && hasSearched && pendingOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon color="#9CA3AF" name="bi bi-inbox" size={40} />
            <p className="mt-2">No se encontraron órdenes pendientes.</p>
          </div>
        ) : null}

        {/* Results */}
        {!isSearching && pendingOrders.length > 0 && (
          <>
            {/* Selection actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedOrderIds.size} de {pendingOrders.length}{" "}
                  seleccionadas
                </span>
                {selectedOrderIds.size > 0 && (
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Total seleccionado: {formatCurrency(selectedTotal)}
                  </span>
                )}
              </div>
              {selectedOrderIds.size > 1 && (
                <Button size="sm" variant="primary" onPress={handlePaySelected}>
                  <Icon color="white" name="bi bi-cash-stack" size={16} />
                  <span className="ml-1">
                    Cobrar Seleccionados ({formatCurrency(selectedTotal)})
                  </span>
                </Button>
              )}
            </div>

            {/* Pending orders table */}
            <PendingOrdersTable
              getOrderKey={getOrderKey}
              orders={pendingOrders}
              selectedOrderIds={selectedOrderIds}
              onPaySingle={handlePaySingle}
              onToggleAll={toggleAllOrders}
              onToggleOrder={toggleOrderSelection}
            />
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
      <PaymentModal
        changeAmount={changeAmount}
        isOpen={isPaymentModalOpen}
        isProcessingPayment={isProcessingPayment}
        ordersToPayList={ordersToPayList}
        paymentForm={paymentForm}
        paymentTotal={paymentTotal}
        onAmountReceivedChange={handleAmountReceivedChange}
        onCardDigitsChange={handleCardDigitsChange}
        onClose={closePaymentModal}
        onProcessPayment={handleProcessPayment}
        onSelectCard={handleSelectCard}
        onSelectCash={handleSelectCash}
      />
    </div>
  );
}
