import { Button, Modal, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { SingleValue } from "react-select";
import { CatalogueSelect } from "../../components/select/CatalogueSelect";
import { AsyncButton } from "../../components/button/AsyncButton";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { api } from "../../configs/axios/interceptors";
import { getBranches } from "../../services/branchService";
import { getSpecialties } from "../../services/specialtyService";
import { getUsers } from "../../services/userService";
import type { ApiResponse } from "../../types/ApiResponse";
import type { BranchResponse } from "../../types/BranchResponse";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import type { UserRequest } from "../../types/UserRequest";
import type { UserResponse } from "../../types/UserResponse";
import { useAuth } from "../../hooks/useAuth";

interface EditModalState {
  open: boolean;
  doctor: UserResponse | null;
  branchId: number | null;
  specialtyId: number | null;
}

export function DoctorManagementPage() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const [filterBranchId, setFilterBranchId] = useState<number | null>(null);
  const [filterSpecialtyId, setFilterSpecialtyId] = useState<number | null>(null);
  const [modal, setModal] = useState<EditModalState>({
    open: false,
    doctor: null,
    branchId: null,
    specialtyId: null,
  });

  // Build filters for doctor list
  const buildFilters = () => {
    let f = "Rol.Name:eq:Medico AND State:eq:1";
    if (filterBranchId) f += ` AND BranchId:eq:${filterBranchId}`;
    if (filterSpecialtyId) f += ` AND SpecialtyId:eq:${filterSpecialtyId}`;
    return f;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", filterBranchId, filterSpecialtyId],
    queryFn: () =>
      getUsers({
        pageNumber: 1,
        pageSize: 100,
        filters: buildFilters(),
        include: "Rol,Branch,Specialty",
        includeTotal: false,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UserRequest) =>
      api.patch<unknown, ApiResponse<UserResponse>, UserRequest>("User", payload),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Sede/Especialidad actualizada correctamente");
        queryClient.invalidateQueries({ queryKey: ["doctors"] });
        setModal({ open: false, doctor: null, branchId: null, specialtyId: null });
      } else {
        toast.danger(res.message ?? "Error al actualizar");
      }
    },
    onError: () => toast.danger("Error inesperado al actualizar"),
  });

  const openModal = useCallback((doctor: UserResponse) => {
    setModal({
      open: true,
      doctor,
      branchId: doctor.branchId ?? null,
      specialtyId: doctor.specialtyId ?? null,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, doctor: null, branchId: null, specialtyId: null });
  }, []);

  const handleSave = useCallback(() => {
    if (!modal.doctor) return;
    updateMutation.mutate({
      id: modal.doctor.id,
      branchId: modal.branchId,
      specialtyId: modal.specialtyId,
      state: 1,
      updatedBy: userId,
    });
  }, [modal, userId, updateMutation]);

  const selectorBranch = useCallback(
    (item: BranchResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorSpecialty = useCallback(
    (item: SpecialtyResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const doctors = data?.success ? data.data : [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Gestión de Médicos</h1>
      <p className="text-gray-500 text-sm mb-6">
        Asigne o modifique la sede y especialidad de cada médico.
      </p>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
        <CatalogueSelect<BranchResponse>
          defaultValue={null}
          deps="State:eq:1"
          fieldSearch="Name"
          label="Filtrar por sede"
          name="filterBranch"
          placeholder="Todas las sedes"
          queryFn={getBranches}
          selectorFn={selectorBranch}
          onChange={(opt) => {
            const o = opt as SingleValue<{ label: string; value: string }>;
            setFilterBranchId(o?.value ? Number(o.value) : null);
          }}
        />
        <CatalogueSelect<SpecialtyResponse>
          defaultValue={null}
          deps="State:eq:1"
          fieldSearch="Name"
          label="Filtrar por especialidad"
          name="filterSpecialty"
          placeholder="Todas las especialidades"
          queryFn={getSpecialties}
          selectorFn={selectorSpecialty}
          onChange={(opt) => {
            const o = opt as SingleValue<{ label: string; value: string }>;
            setFilterSpecialtyId(o?.value ? Number(o.value) : null);
          }}
        />
      </div>

      {/* Tabla de médicos */}
      {isLoading && <LoadingComponent />}

      {!isLoading && doctors.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <i className="bi bi-person-x text-4xl block mb-3" />
          <p>No se encontraron médicos con los filtros aplicados.</p>
        </div>
      )}

      {!isLoading && doctors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold">Sede actual</th>
                <th className="text-left px-4 py-3 font-semibold">Especialidad actual</th>
                <th className="text-left px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="px-4 py-3 font-medium">{doctor.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {doctor.branch?.name ?? <span className="text-orange-500 italic">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {doctor.specialty?.name ?? <span className="text-orange-500 italic">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="secondary" onPress={() => openModal(doctor)}>
                      <i className="bi bi-pencil mr-1" />
                      Editar Sede/Especialidad
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      <Modal isOpen={modal.open} onOpenChange={closeModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="max-w-lg w-full">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  Editar Sede y Especialidad — {modal.doctor?.name}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-4 p-2">
                  <CatalogueSelect<BranchResponse>
                    defaultValue={
                      modal.doctor?.branch
                        ? { label: modal.doctor.branch.name, value: String(modal.doctor.branchId) }
                        : null
                    }
                    deps="State:eq:1"
                    fieldSearch="Name"
                    label="Nueva sede"
                    name="branchId"
                    placeholder="Seleccione una sede"
                    queryFn={getBranches}
                    selectorFn={selectorBranch}
                    onChange={(opt) => {
                      const o = opt as SingleValue<{ label: string; value: string }>;
                      setModal((prev) => ({ ...prev, branchId: o?.value ? Number(o.value) : null }));
                    }}
                  />
                  <CatalogueSelect<SpecialtyResponse>
                    defaultValue={
                      modal.doctor?.specialty
                        ? { label: modal.doctor.specialty.name, value: String(modal.doctor.specialtyId) }
                        : null
                    }
                    deps="State:eq:1"
                    fieldSearch="Name"
                    label="Nueva especialidad"
                    name="specialtyId"
                    placeholder="Seleccione una especialidad"
                    queryFn={getSpecialties}
                    selectorFn={selectorSpecialty}
                    onChange={(opt) => {
                      const o = opt as SingleValue<{ label: string; value: string }>;
                      setModal((prev) => ({ ...prev, specialtyId: o?.value ? Number(o.value) : null }));
                    }}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="flex gap-2 justify-end w-full">
                  <Button variant="secondary" onPress={closeModal}>
                    Cancelar
                  </Button>
                  <AsyncButton
                    isLoading={updateMutation.isPending}
                    loadingText="Guardando..."
                    variant="primary"
                    onPress={handleSave}
                  >
                    Guardar cambios
                  </AsyncButton>
                </div>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
