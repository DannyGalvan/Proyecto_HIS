/**
 * Provides a Luhn checksum validator for credit/debit card numbers.
 * Accepts digit strings of length 13–19 only.
 */
export function useLuhnValidator(): { validate: (cardNumber: string) => boolean } {
  const validate = (cardNumber: string): boolean => {
    // Only accept digit strings of length 13–19
    if (!/^\d{13,19}$/.test(cardNumber)) {
      return false;
    }

    // Standard Luhn algorithm
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  };

  return { validate };
}
