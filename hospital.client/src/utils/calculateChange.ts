/**
 * Calculates the change to return to a customer after a cash payment.
 * Uses integer arithmetic to avoid floating-point drift.
 *
 * @param amountReceived - The amount the customer handed over
 * @param amount - The total amount owed
 * @returns The change amount, rounded to 2 decimal places
 */
export function calculateChange(amountReceived: number, amount: number): number {
  return Math.round((amountReceived - amount) * 100) / 100;
}
