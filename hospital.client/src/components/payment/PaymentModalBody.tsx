import { Input, Label, TextField } from "@heroui/react";

import type { PendingOrderResponse } from "../../types/PendingOrderResponse";
import { Icon } from "../icons/Icon";

const ORDER_TYPE_LABELS: Record<string, string> = {
  LabOrder: "Laboratorio",
  Dispense: "Farmacia",
};

function formatCurrency(amount: number): string {
  return `Q ${amount.toFixed(2)}`;
}

interface PaymentFormState {
  paymentMethod: "cash" | "card";
  amountReceived: string;
  cardLastFourDigits: string;
}

interface PaymentModalBodyProps {
  readonly ordersToPayList: PendingOrderResponse[];
  readonly paymentForm: PaymentFormState;
  readonly paymentTotal: number;
  readonly changeAmount: number;
  readonly onSelectCash: () => void;
  readonly onSelectCard: () => void;
  readonly onAmountReceivedChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  readonly onCardDigitsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PaymentModalBody({
  ordersToPayList,
  paymentForm,
  paymentTotal,
  changeAmount,
  onSelectCash,
  onSelectCard,
  onAmountReceivedChange,
  onCardDigitsChange,
}: PaymentModalBodyProps) {
  const isCash = paymentForm.paymentMethod === "cash";

  return (
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
            key={`${order.orderType}-${order.orderId}`}
            className="flex justify-between items-center text-sm py-1 border-b border-blue-100 dark:border-blue-800 last:border-0"
          >
            <span className="text-gray-700 dark:text-gray-300">
              {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType} —{" "}
              {order.orderNumber}
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
            className={`flex-1 rounded-lg border-2 p-3 text-center transition-colors ${
              isCash
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
            }`}
            type="button"
            onClick={onSelectCash}
          >
            <Icon
              color={isCash ? "#0A4FA6" : "#9CA3AF"}
              name="bi bi-cash"
              size={20}
            />
            <p className="text-sm font-medium mt-1">Efectivo</p>
          </button>
          <button
            className={`flex-1 rounded-lg border-2 p-3 text-center transition-colors ${
              !isCash
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
            }`}
            type="button"
            onClick={onSelectCard}
          >
            <Icon
              color={!isCash ? "#0A4FA6" : "#9CA3AF"}
              name="bi bi-credit-card"
              size={20}
            />
            <p className="text-sm font-medium mt-1">Tarjeta</p>
          </button>
        </div>
      </div>

      {/* Cash payment fields */}
      {isCash ? (
        <div className="space-y-4">
          <TextField name="amountReceived">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto recibido (GTQ)
            </Label>
            <Input
              min={0}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={paymentForm.amountReceived}
              onChange={onAmountReceivedChange}
            />
          </TextField>

          {paymentForm.amountReceived &&
          parseFloat(paymentForm.amountReceived) >= paymentTotal ? (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Cambio
              </span>
              <span className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(changeAmount)}
              </span>
            </div>
          ) : null}

          {paymentForm.amountReceived &&
          parseFloat(paymentForm.amountReceived) > 0 &&
          parseFloat(paymentForm.amountReceived) < paymentTotal ? (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <span className="text-sm text-red-700 dark:text-red-300">
                El monto recibido es insuficiente. Faltan{" "}
                {formatCurrency(
                  paymentTotal - parseFloat(paymentForm.amountReceived),
                )}
                .
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Card payment fields */}
      {!isCash && (
        <TextField name="cardLastFour">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Últimos 4 dígitos de la tarjeta
          </Label>
          <Input
            inputMode="numeric"
            maxLength={4}
            placeholder="1234"
            type="text"
            value={paymentForm.cardLastFourDigits}
            onChange={onCardDigitsChange}
          />
        </TextField>
      )}
    </div>
  );
}
