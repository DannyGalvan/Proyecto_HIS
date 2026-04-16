/**
 * Masks a card number, replacing all but the last 4 characters with '•'.
 * Strings shorter than 4 characters are returned as-is.
 *
 * @example
 * maskCardNumber('4111111111111111') // '••••••••••••1111'
 */
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length <= 4) {
    return cardNumber;
  }
  const visiblePart = cardNumber.slice(-4);
  const maskedPart = '•'.repeat(cardNumber.length - 4);
  return maskedPart + visiblePart;
}
