/**
 * Decodes a JWT payload without verifying the signature.
 * Returns null if the token is malformed.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extracts the role name from a JWT token.
 * Checks both the custom "RoleName" claim and the standard role claim.
 */
export function getRoleFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  return (
    (payload["RoleName"] as string | undefined) ??
    (payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string | undefined) ??
    null
  );
}
