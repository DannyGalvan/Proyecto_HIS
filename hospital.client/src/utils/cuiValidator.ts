/**
 * Validates a Guatemalan CUI/DPI number using the official modulo-11 algorithm.
 *
 * Checks:
 *  1. Exactly 13 numeric digits
 *  2. Valid department and municipality codes
 *  3. Correct check digit (modulo 11)
 *
 * @param cui - The CUI/DPI string to validate
 * @returns `true` if the CUI is structurally valid
 */
export function isCuiValid(cui: string | null | undefined): boolean {
  if (!cui) return false;

  // Remove spaces
  cui = cui.replace(/\s/g, "");

  // Must be exactly 13 digits
  if (!/^\d{13}$/.test(cui)) return false;

  // Extract parts
  const numero = cui.substring(0, 8);
  const verificador = parseInt(cui.charAt(8), 10);
  const depto = parseInt(cui.substring(9, 11), 10);
  const muni = parseInt(cui.substring(11, 13), 10);

  if (isNaN(verificador) || isNaN(depto) || isNaN(muni)) return false;

  // Municipality count per department (Guatemala has 22 departments)
  const munisPorDepto = [
    17, 8, 16, 16, 13, 14, 19, 8, 24, 21, 9,
    30, 32, 21, 8, 17, 14, 5, 11, 11, 7, 17,
  ];

  if (depto === 0 || muni === 0) return false;
  if (depto > munisPorDepto.length) return false;
  if (muni > munisPorDepto[depto - 1]) return false;

  // Validate check digit (modulo 11)
  let total = 0;
  for (let i = 0; i < numero.length; i++) {
    total += parseInt(numero[i], 10) * (i + 2);
  }

  return total % 11 === verificador;
}
