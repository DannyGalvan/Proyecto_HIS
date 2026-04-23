import { Button } from "@heroui/react";
import { useCallback } from "react";

import type { PendingOrderResponse } from "../../types/PendingOrderResponse";
import { formatDate } from "../../utils/dateFormatter";
import { Icon } from "../icons/Icon";

const ORDER_TYPE_LABELS: Record<string, string> = {
  LabOrder: "Laboratorio",
  Dispense: "Farmacia",
};

function formatCurrency(amount: number): string {
  return `Q ${amount.toFixed(2)}`;
}

interface PendingOrderRowProps {
  readonly order: PendingOrderResponse;
  readonly orderKey: string;
  readonly isSelected: boolean;
  readonly onToggle: (key: string) => void;
  readonly onPay: (order: PendingOrderResponse) => void;
}

export function PendingOrderRow({
  order,
  orderKey,
  isSelected,
  onToggle,
  onPay,
}: PendingOrderRowProps) {
  const handleToggle = useCallback(
    () => onToggle(orderKey),
    [onToggle, orderKey],
  );
  const handlePay = useCallback(() => onPay(order), [onPay, order]);

  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/10"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      <td className="px-3 py-3">
        <input
          aria-label={`Seleccionar orden ${order.orderNumber}`}
          checked={isSelected}
          className="rounded border-gray-300"
          type="checkbox"
          onChange={handleToggle}
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
      <td className="px-3 py-3 font-mono text-xs">{order.orderNumber}</td>
      <td className="px-3 py-3">{order.patientName}</td>
      <td className="px-3 py-3 text-gray-600 dark:text-gray-400">
        {formatDate(order.createdAt)}
      </td>
      <td className="px-3 py-3 text-center">{order.itemCount}</td>
      <td className="px-3 py-3 text-right font-semibold">
        {formatCurrency(order.totalAmount)}
      </td>
      <td className="px-3 py-3 text-center">
        <Button size="sm" variant="ghost" onPress={handlePay}>
          <Icon color="#0A4FA6" name="bi bi-cash" size={14} />
          <span className="ml-1">Cobrar</span>
        </Button>
      </td>
    </tr>
  );
}
