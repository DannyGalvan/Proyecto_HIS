/**
 * PublicOnly — permite acceso sin autenticación.
 * Usado para el portal público, registro y recuperación de contraseña.
 */
import type { ReactNode } from "react";

interface PublicOnlyProps {
  readonly children: ReactNode;
}

function PublicOnly({ children }: PublicOnlyProps) {
  return <>{children}</>;
}

export default PublicOnly;
