import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { SingleValue } from "react-select";
import { useNavigate } from "react-router";
import { createBranchSpecialty } from "../../services/branchSpecialtyService";
import { getBranches } from "../../services/branchService";
import { getSpecialties } from "../../services/specialtyService";
import type { BranchResponse } from "../../types/BranchResponse";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import { nameRoutes } from "../../configs/constants";
import { CatalogueSelect } from "../../components/select/CatalogueSelect";
import { AsyncButton } from "../../components/button/AsyncButton";
import { useAuth } from "../../hooks/useAuth";

export function CreateBranchSpecialtyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const [branchId, setBranchId] = useState<number | null>(null);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectorBranch = useCallback(
    (item: BranchResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorSpecialty = useCallback(
    (item: SpecialtyResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!branchId) { setError("Debe seleccionar una sede."); return; }
    if (!specialtyId) { setError("Debe seleccionar una especialidad."); return; }

    setLoading(true);
    try {
      const response = await createBranchSpecialty({
        branchId,
        specialtyId,
        state: 1,
        createdBy: userId,
      });

      if (response.success) {
        toast.success("Especialidad asignada a la sede correctamente");
        await queryClient.invalidateQueries({ queryKey: ["branch-specialties"] });
        navigate(nameRoutes.branchSpecialty);
      } else {
        setError(response.message ?? "Error al crear la asignación");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [branchId, specialtyId, userId, navigate, queryClient]);

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Asignar Especialidad a Sede</h1>

      <div className="flex flex-col gap-5">
        <CatalogueSelect<BranchResponse>
          isRequired
          defaultValue={null}
          deps="State:eq:1"
          fieldSearch="Name"
          label="Sede"
          name="branchId"
          placeholder="Seleccione una sede"
          queryFn={getBranches}
          selectorFn={selectorBranch}
          onChange={(opt) => {
            const o = opt as SingleValue<{ label: string; value: string }>;
            setBranchId(o?.value ? Number(o.value) : null);
          }}
        />

        <CatalogueSelect<SpecialtyResponse>
          isRequired
          defaultValue={null}
          deps="State:eq:1"
          fieldSearch="Name"
          label="Especialidad"
          name="specialtyId"
          placeholder="Seleccione una especialidad"
          queryFn={getSpecialties}
          selectorFn={selectorSpecialty}
          onChange={(opt) => {
            const o = opt as SingleValue<{ label: string; value: string }>;
            setSpecialtyId(o?.value ? Number(o.value) : null);
          }}
        />

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <i className="bi bi-exclamation-circle" />
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end mt-2">
          <AsyncButton
            isLoading={false}
            size="lg"
            type="button"
            variant="secondary"
            onClick={() => navigate(nameRoutes.branchSpecialty)}
          >
            Cancelar
          </AsyncButton>
          <AsyncButton
            isLoading={loading}
            loadingText="Guardando..."
            size="lg"
            type="button"
            variant="primary"
            onClick={handleSubmit}
          >
            Asignar
          </AsyncButton>
        </div>
      </div>
    </div>
  );
}
