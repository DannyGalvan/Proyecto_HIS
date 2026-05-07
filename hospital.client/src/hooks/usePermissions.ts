import { useMemo } from "react";
import { useAuth } from "./useAuth";

/**
 * Normaliza un path al mismo formato que se usa para comparar rutas:
 * en minúsculas y sin "/" inicial.
 *
 *   "/specialty/update" -> "specialty/update"
 *   "Specialty/Update"  -> "specialty/update"
 */
const normalizePath = (path: string): string =>
  path.toLowerCase().replace(/^\//, "").replace(/\/+$/, "");

/**
 * Hook centralizado para consultar si el usuario tiene un permiso (operation).
 *
 * Las operaciones autorizadas vienen en `authState.operations` (la respuesta
 * del login), aplanadas a través de `useAuth().allOperations`. Cada operación
 * tiene un `path` (ej: `specialty/update`, `payment/pending-orders`) que
 * coincide con el `Path` declarado en `OperationInfoAttribute` del controller.
 *
 * Uso:
 *   const { can, canAny } = usePermissions();
 *   if (can("specialty/update")) { ... }
 *   if (canAny("specialty/update", "specialty/partial-update")) { ... }
 */
export const usePermissions = () => {
  const { allOperations } = useAuth();

  const granted = useMemo(() => {
    const set = new Set<string>();
    for (const op of allOperations) {
      if (op?.path) set.add(normalizePath(op.path));
    }
    return set;
  }, [allOperations]);

  /** True si el usuario tiene la operación cuyo path coincide. */
  const can = (path: string): boolean => granted.has(normalizePath(path));

  /** True si el usuario tiene al menos UNA de las operaciones listadas. */
  const canAny = (...paths: string[]): boolean =>
    paths.some((p) => granted.has(normalizePath(p)));

  /** True si el usuario tiene TODAS las operaciones listadas. */
  const canAll = (...paths: string[]): boolean =>
    paths.every((p) => granted.has(normalizePath(p)));

  return { can, canAny, canAll, grantedPaths: granted };
};
