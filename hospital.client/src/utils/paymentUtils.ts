/** Mask card number: show only last 4 digits as ****-****-****-XXXX */
export const maskCardNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 4) return raw;
  const last4 = digits.slice(-4);
  const maskedGroups = Math.ceil((digits.length - 4) / 4);
  const masked = Array(maskedGroups).fill("****").join("-");
  return `${masked}-${last4}`;
};

/** Determine payment method: 1 = Visa (starts with 4), 2 = Mastercard (starts with 5) */
export const getPaymentMethod = (cardNumber: string): number => {
  if (cardNumber.startsWith("4")) return 1;
  if (cardNumber.startsWith("5")) return 2;
  return 1;
};

export function parseExpiry(
  expiry: string,
): { month: number; year: number } | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export function isExpiryInFuture(expiry: string): boolean {
  const parsed = parseExpiry(expiry);
  if (!parsed) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based
  if (parsed.year > currentYear) return true;
  if (parsed.year === currentYear && parsed.month >= currentMonth) return true;
  return false;
}
