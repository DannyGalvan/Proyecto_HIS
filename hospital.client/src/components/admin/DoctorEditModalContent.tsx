import { Button } from "@heroui/react";
import { getBranches } from "../../services/branchService";
import { getSpecialties } from "../../services/specialtyService";
import type { BranchResponse } from "../../types/BranchResponse";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import { AsyncButton } from "../button/AsyncButton";
import { CatalogueSelect } from "../select/CatalogueSelect";
interface DoctorEditModalContentProps {
  readonly isPending: boolean;
  readonly defaultBranch: { label: string; value: string } | null;
  readonly defaultSpecialty: { label: string; value: string } | null;
  readonly selectorBranch: (item: BranchResponse) => {
    label: string;
    value: string;
  };
  readonly selectorSpecialty: (item: SpecialtyResponse) => {
    label: string;
    value: string;
  };
  readonly onBranchChange: (opt: unknown) => void;
  readonly onSpecialtyChange: (opt: unknown) => void;
  readonly onCancel: () => void;
  readonly onSave: () => void;
}

export function DoctorEditModalContent({
  isPending,
  defaultBranch,
  defaultSpecialty,
  selectorBranch,
  selectorSpecialty,
  onBranchChange,
  onSpecialtyChange,
  onCancel,
  onSave,
}: DoctorEditModalContentProps) {
  return (
    <>
      <div className="flex flex-col gap-4 p-2">
        <CatalogueSelect<BranchResponse>
          defaultValue={defaultBranch}
          deps="State:eq:1"
          fieldSearch="Name"
          label="Nueva sede"
          name="branchId"
          placeholder="Seleccione una sede"
          queryFn={getBranches}
          selectorFn={selectorBranch}
          onChange={onBranchChange}
        />
        <CatalogueSelect<SpecialtyResponse>
          defaultValue={defaultSpecialty}
          deps="State:eq:1"
          fieldSearch="Name"
          label="Nueva especialidad"
          name="specialtyId"
          placeholder="Seleccione una especialidad"
          queryFn={getSpecialties}
          selectorFn={selectorSpecialty}
          onChange={onSpecialtyChange}
        />
      </div>
      <div className="flex gap-2 justify-end w-full pt-4">
        <Button variant="secondary" onPress={onCancel}>
          Cancelar
        </Button>
        <AsyncButton
          isLoading={isPending}
          loadingText="Guardando..."
          variant="primary"
          onPress={onSave}
        >
          Guardar cambios
        </AsyncButton>
      </div>
    </>
  );
}

DoctorEditModalContent.displayName = "DoctorEditModalContent";
