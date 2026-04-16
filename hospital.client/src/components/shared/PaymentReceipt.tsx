import type { PaymentResponse } from '../../types/PaymentResponse';

interface PaymentReceiptProps {
  readonly payment: PaymentResponse;
  readonly patientName: string;
  readonly serviceDetail: string;
  readonly branchName: string;
}

/**
 * Printable payment receipt component.
 * Displays transaction details and provides a print button.
 */
export function PaymentReceipt({
  payment,
  patientName,
  serviceDetail,
  branchName,
}: PaymentReceiptProps) {
  const formattedDate = payment.paymentDate
    ? new Date(payment.paymentDate).toLocaleString('es-GT', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : '—';

  const formattedAmount = new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(payment.amount);

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md print:shadow-none print:border-none">
      {/* Header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Recibo de Pago</h2>
        <p className="text-sm text-gray-500">{branchName}</p>
      </div>

      <hr className="my-3 border-gray-200" />

      {/* Details */}
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="font-medium text-gray-600">N° Transacción</dt>
          <dd className="font-mono text-gray-800">{payment.transactionNumber}</dd>
        </div>

        <div className="flex justify-between">
          <dt className="font-medium text-gray-600">Paciente</dt>
          <dd className="text-gray-800">{patientName}</dd>
        </div>

        <div className="flex justify-between">
          <dt className="font-medium text-gray-600">Servicio</dt>
          <dd className="text-gray-800 text-right max-w-[60%]">{serviceDetail}</dd>
        </div>

        <div className="flex justify-between">
          <dt className="font-medium text-gray-600">Sucursal</dt>
          <dd className="text-gray-800">{branchName}</dd>
        </div>

        <div className="flex justify-between">
          <dt className="font-medium text-gray-600">Fecha y hora</dt>
          <dd className="text-gray-800">{formattedDate}</dd>
        </div>

        <hr className="my-2 border-gray-200" />

        <div className="flex justify-between text-base font-bold">
          <dt className="text-gray-700">Total</dt>
          <dd className="text-green-700">{formattedAmount}</dd>
        </div>
      </dl>

      <hr className="my-4 border-gray-200" />

      {/* Print button — hidden when printing */}
      <div className="flex justify-center print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          🖨️ Imprimir recibo
        </button>
      </div>
    </div>
  );
}
