import { toast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useIdempotencyKey } from "../../hooks/useIdempotencyKey";
import { useLuhnValidator } from "../../hooks/useLuhnValidator";
import { usePaymentTimer } from "../../hooks/usePaymentTimer";
import { createPayment } from "../../services/paymentService";
import type { PaymentResponse } from "../../types/PaymentResponse";
import { maskCardNumber } from "../../utils/maskCardNumber";
import { isExpiryInFuture } from "../../utils/paymentUtils";
import { AsyncButton } from "../button/AsyncButton";
import { CountdownTimer } from "../shared/CountdownTimer";

interface CardPaymentFormProps {
  readonly amount: number;
  readonly appointmentId: number;
  readonly onSuccess: (payment: PaymentResponse) => void;
}

const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  insufficient_funds: "Fondos insuficientes",
  invalid_card: "Tarjeta inválida",
  expired_card: "Tarjeta expirada",
};

/**
 * Credit/debit card payment form.
 * CVV is stored only in local state and cleared immediately after the API call.
 */
export function CardPaymentForm({
  amount,
  appointmentId,
  onSuccess,
}: CardPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExpired, setIsExpired] = useState(false);

  const { key, regenerate } = useIdempotencyKey();
  const { validate: validateLuhn } = useLuhnValidator();
  const { remaining } = usePaymentTimer(
    10,
    useCallback(() => setIsExpired(true), []),
  );

  const mutation = useMutation({
    mutationFn: createPayment,
  });

  const formattedAmount = new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(amount);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number: 13–19 digits, passes Luhn
    const digits = cardNumber.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(digits)) {
      newErrors.cardNumber =
        "El número de tarjeta debe tener entre 13 y 19 dígitos";
    } else if (!validateLuhn(digits)) {
      newErrors.cardNumber = "El número de tarjeta no es válido";
    }

    // Cardholder name: 5–100 chars
    if (
      cardholderName.trim().length < 5 ||
      cardholderName.trim().length > 100
    ) {
      newErrors.cardholderName =
        "El nombre debe tener entre 5 y 100 caracteres";
    }

    // Expiry: MM/YY format, not in the past
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Formato inválido. Use MM/AA";
    } else if (!isExpiryInFuture(expiry)) {
      newErrors.expiry = "La tarjeta está vencida";
    }

    // CVV: 3–4 digits
    if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "El CVV debe tener 3 o 4 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardNumber, cardholderName, expiry, cvv, validateLuhn]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isExpired) return;
      if (!validate()) return;

      const digits = cardNumber.replace(/\s/g, "");

      try {
        const response = await mutation.mutateAsync({
          appointmentId,
          amount,
          paymentMethod: 1,
          paymentType: 0,
          idempotencyKey: key,
          cardLastFourDigits: digits.slice(-4),
          state: 1,
        });

        // Clear CVV immediately after API call — before any other action
        setCvv("");

        if (response.success && response.data) {
          onSuccess(response.data);
        } else {
          const errorKey =
            response.message?.toLowerCase().replace(/\s+/g, "_") ?? "";
          const friendlyMessage =
            PAYMENT_ERROR_MESSAGES[errorKey] ??
            PAYMENT_ERROR_MESSAGES[response.message ?? ""] ??
            response.message ??
            "Error al procesar el pago";
          toast.danger(friendlyMessage);
          regenerate();
        }
      } catch {
        // CVV already cleared above in the try block; ensure it's cleared on error too
        setCvv("");
        toast.danger("Error al procesar el pago. Intente nuevamente.");
        regenerate();
      }
    },
    [
      isExpired,
      validate,
      cardNumber,
      mutation,
      appointmentId,
      amount,
      key,
      onSuccess,
      regenerate,
    ],
  );

  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only digits, max 19
      const value = e.target.value.replace(/\D/g, "").slice(0, 19);
      setCardNumber(value);
    },
    [],
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 4) value = value.slice(0, 4);
      if (value.length >= 3) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`;
      }
      setExpiry(value);
    },
    [],
  );

  const handleCardholderNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setCardholderName(e.target.value),
    [],
  );

  const handleCvvChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setCvv(e.target.value.replace(/\D/g, "").slice(0, 4)),
    [],
  );

  if (isExpired) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
        <p className="text-lg font-bold text-red-700">
          La sesión de pago ha expirado.
        </p>
        <p className="mt-1 text-sm text-red-600">
          Por favor, recargue la página para iniciar una nueva sesión.
        </p>
      </div>
    );
  }

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      {/* Timer */}
      <div className="flex justify-center">
        <CountdownTimer label="Sesión de pago" remaining={remaining} />
      </div>

      {/* Amount */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
        <p className="text-sm font-medium text-blue-700">Monto a pagar</p>
        <p className="text-3xl font-bold text-blue-900">{formattedAmount}</p>
      </div>

      {/* Card number */}
      <div>
        <label
          className="block text-sm font-semibold text-gray-700 mb-1"
          htmlFor="cardNumber"
        >
          Número de tarjeta
        </label>
        <input
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.cardNumber ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
          disabled={mutation.isPending}
          id="cardNumber"
          inputMode="numeric"
          maxLength={19}
          placeholder="1234 5678 9012 3456"
          type="text"
          value={cardNumber}
          onChange={handleCardNumberChange}
        />
        {/* Masked display */}
        {cardNumber.length > 0 && (
          <p className="mt-1 font-mono text-sm text-gray-500 tracking-widest">
            {maskCardNumber(cardNumber)}
          </p>
        )}
        {errors.cardNumber ? (
          <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
        ) : null}
      </div>

      {/* Cardholder name */}
      <div>
        <label
          className="block text-sm font-semibold text-gray-700 mb-1"
          htmlFor="cardholderName"
        >
          Nombre del titular
        </label>
        <input
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.cardholderName
              ? "border-red-400 bg-red-50"
              : "border-gray-300"
          }`}
          disabled={mutation.isPending}
          id="cardholderName"
          placeholder="Como aparece en la tarjeta"
          type="text"
          value={cardholderName}
          onChange={handleCardholderNameChange}
        />
        {errors.cardholderName ? (
          <p className="mt-1 text-xs text-red-600">{errors.cardholderName}</p>
        ) : null}
      </div>

      {/* Expiry + CVV row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1"
            htmlFor="expiry"
          >
            Vencimiento
          </label>
          <input
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.expiry ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            disabled={mutation.isPending}
            id="expiry"
            maxLength={5}
            placeholder="MM/AA"
            type="text"
            value={expiry}
            onChange={handleExpiryChange}
          />
          {errors.expiry ? (
            <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>
          ) : null}
        </div>

        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1"
            htmlFor="cvv"
          >
            CVV
          </label>
          <input
            autoComplete="off"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.cvv ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            disabled={mutation.isPending}
            id="cvv"
            maxLength={4}
            placeholder="•••"
            type="password"
            value={cvv}
            onChange={handleCvvChange}
          />
          {errors.cvv ? (
            <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>
          ) : null}
        </div>
      </div>

      {/* Submit */}
      <AsyncButton
        className="w-full"
        isDisabled={isExpired}
        isLoading={mutation.isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        Pagar {formattedAmount}
      </AsyncButton>
    </form>
  );
}
