import type { PendingOrderResponse } from "../../types/PendingOrderResponse";
import { PendingOrderRow } from "./PendingOrderRow";

interface PendingOrdersTableProps {
  readonly orders: PendingOrderResponse[];
  readonly selectedOrderIds: Set<string>;
  readonly getOrderKey: (order: PendingOrderResponse) => string;
  readonly onToggleAll: () => void;
  readonly onToggleOrder: (key: string) => void;
  readonly onPaySingle: (order: PendingOrderResponse) => void;
}

export function PendingOrdersTable({
  orders,
  selectedOrderIds,
  getOrderKey,
  onToggleAll,
  onToggleOrder,
  onPaySingle,
}: PendingOrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-blue-50 dark:bg-blue-900/20 text-left">
            <th className="px-3 py-3 font-semibold text-blue-800 dark:text-blue-300">
              <input
                aria-label="Seleccionar todas las órdenes"
                checked={
                  selectedOrderIds.size === orders.length && orders.length > 0
                }
                className="rounded border-gray-300"
                type="checkbox"
                onChange={onToggleAll}
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
          {orders.map((order) => {
            const key = getOrderKey(order);
            return (
              <PendingOrderRow
                key={key}
                isSelected={selectedOrderIds.has(key)}
                order={order}
                orderKey={key}
                onPay={onPaySingle}
                onToggle={onToggleOrder}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
