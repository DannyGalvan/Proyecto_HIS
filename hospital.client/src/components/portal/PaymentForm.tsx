import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { processPatientPayment } from '../../services/patientPortalService';
import type { PatientPaymentRequest, PaymentConfirmationResponse } from '../../types/PatientPortalTypes';
import { luhnCheck } from '../../utils/luhn';

interface PaymentFormProps {
  appointmentId: number;
  amount: number;
  onPaymentSuccess: (confirmation: PaymentConfirmationResponse) => void;
  onPaymentError: (message: string) => void;
}

// ---------------------------------------------------------------------------
// Zod schema (zod v4 uses `error` instead of `message`)
// ---------------------------------------------------------------------------
const paymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, { error: 'El número de tarjeta debe tener entre 13 y 19 dígitos' })
    .refine(luhnCheck, { error: 'El número de tarjeta no es válido' }),
  cardHolder: z
    .string()
    .min(5, { error: 'El nombre del titular debe tener al menos 5 caracteres' })
    .max(100, { error: 'El nombre del titular no puede exceder 100 caracteres' }),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { error: 'Formato inválido. Use MM/AA' })
    .refine(
      (val) => {
        const [month, year] = val.split('/');
        const expDate = new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1);
        return expDate > new Date();
      },
      { error: 'La tarjeta está vencida' },
    ),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, { error: 'El CVV debe tener 3 o 4 dígitos' }),
});

type PaymentFormErrors = Partial<Record<keyof z.infer<typeof paymentSchema>, string>>;

/** Mask card number: show only last 4 digits as ****-****-****-XXXX */
const maskCardNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 4) return raw;
  const last4 = digits.slice(-4);
  const maskedGroups = Math.ceil((digits.length - 4) / 4);
  const masked = Array(maskedGroups).fill('****').join('-');
  return `${masked}-${last4}`;
};

/** Determine payment method: 1 = Visa (starts with 4), 2 = Mastercard (starts with 5) */
const getPaymentMethod = (cardNumber: string): number => {
  if (cardNumber.startsWith('4')) return 1;
  if (cardNumber.startsWith('5')) return 2;
  return 1;
};

export function PaymentForm({
  appointmentId,
  amount,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) {
  // Raw card number (digits only) — used for validation and submission
  const rawCardNumberRef = useRef<string>('');

  const [cardNumberDisplay, setCardNumberDisplay] = useState('');
  const [isMasked, setIsMasked] = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<PaymentFormErrors>({});

  // idempotencyKey is generated once on mount and never regenerated
  const idempotencyKey = useRef<string>(uuidv4());

  // Keep idempotencyKey stable across re-renders
  useEffect(() => {
    idempotencyKey.current = uuidv4();
  }, []);

  // ---------------------------------------------------------------------------
  // Card number handlers
  // ---------------------------------------------------------------------------
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    rawCardNumberRef.current = raw;
    setCardNumberDisplay(raw);
    setIsMasked(false);
  };

  const handleCardNumberBlur = () => {
    if (rawCardNumberRef.current.length >= 4) {
      setCardNumberDisplay(maskCardNumber(rawCardNumberRef.current));
      setIsMasked(true);
    }
  };

  const handleCardNumberFocus = () => {
    if (isMasked) {
      setCardNumberDisplay(rawCardNumberRef.current);
      setIsMasked(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Expiry auto-format: insert "/" after 2 digits
  // ---------------------------------------------------------------------------
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiry(val);
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      cardNumber: rawCardNumberRef.current,
      cardHolder,
      expiry,
      cvv,
    };

    const result = paymentSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: PaymentFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PaymentFormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Clear CVV from state immediately — it must never be sent to the backend
    setCvv('');

    const cardNumber = rawCardNumberRef.current;
    const cardLastFourDigits = cardNumber.slice(-4);
    const paymentMethod = getPaymentMethod(cardNumber);

    const request: PatientPaymentRequest = {
      appointmentId,
      amount,
      paymentMethod,
      paymentType: 0, // Consulta
      paymentStatus: 0, // Pendiente
      paymentDate: new Date().toISOString(),
      cardLastFourDigits,
      idempotencyKey: idempotencyKey.current,
    };

    try {
      const response = await processPatientPayment(request);
      if (response.success && response.data) {
        onPaymentSuccess(response.data);
      } else {
        const rawMsg = response.message ?? '';
        let msg: string;
        if (rawMsg.toLowerCase().includes('rechaz') || rawMsg.toLowerCase().includes('declined')) {
          msg = 'La transacción con tarjeta fue rechazada por el banco. Verifique los datos de su tarjeta o utilice otro método de pago.';
        } else {
          msg = rawMsg || 'El pago no pudo ser procesado. Por favor, intente nuevamente o utilice otro método de pago.';
        }
        onPaymentError(msg);
      }
    } catch {
      onPaymentError('Error de comunicación con la pasarela de pago. Por favor, verifique su conexión e intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={(e) => void handleSubmit(e)}>
      <h2 className="text-lg font-bold text-gray-800">Datos de pago</h2>

      {/* Card Number */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="cardNumber">
          Número de tarjeta
        </label>
        <input
          autoComplete="cc-number"
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            errors.cardNumber
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300 focus:ring-blue-400'
          }`}
          id="cardNumber"
          inputMode="numeric"
          maxLength={19}
          name="cardNumber"
          placeholder="1234 5678 9012 3456"
          type="text"
          value={cardNumberDisplay}
          onBlur={handleCardNumberBlur}
          onChange={handleCardNumberChange}
          onFocus={handleCardNumberFocus}
        />
        {errors.cardNumber && (
          <span className="text-xs text-red-500" role="alert">
            {errors.cardNumber}
          </span>
        )}
      </div>

      {/* Card Holder */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="cardHolder">
          Nombre del titular
        </label>
        <input
          autoComplete="cc-name"
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            errors.cardHolder
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300 focus:ring-blue-400'
          }`}
          id="cardHolder"
          name="cardHolder"
          placeholder="JUAN PEREZ"
          type="text"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
        />
        {errors.cardHolder && (
          <span className="text-xs text-red-500" role="alert">
            {errors.cardHolder}
          </span>
        )}
      </div>

      {/* Expiry + CVV row */}
      <div className="flex gap-4">
        {/* Expiry */}
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="expiry">
            Vencimiento (MM/AA)
          </label>
          <input
            autoComplete="cc-exp"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.expiry
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-400'
            }`}
            id="expiry"
            inputMode="numeric"
            maxLength={5}
            name="expiry"
            placeholder="MM/AA"
            type="text"
            value={expiry}
            onChange={handleExpiryChange}
          />
          {errors.expiry && (
            <span className="text-xs text-red-500" role="alert">
              {errors.expiry}
            </span>
          )}
        </div>

        {/* CVV — type="password", never sent to backend */}
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cvv">
            CVV
          </label>
          <input
            autoComplete="cc-csc"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.cvv
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-400'
            }`}
            id="cvv"
            inputMode="numeric"
            maxLength={4}
            name="cvv"
            placeholder="•••"
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
          />
          {errors.cvv && (
            <span className="text-xs text-red-500" role="alert">
              {errors.cvv}
            </span>
          )}
        </div>
      </div>

      {/* Security note */}
      <p className="text-xs text-gray-500">
        <span aria-hidden="true">🔒 </span>
        Tu información de pago está protegida. El CVV nunca se almacena ni se envía.
      </p>

      {/* Submit */}
      <button
        className="mt-2 w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Procesando pago...' : `Pagar Q${amount.toFixed(2)}`}
      </button>
    </form>
  );
}
