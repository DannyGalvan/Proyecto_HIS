import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { SingleValue } from "react-select";
import { CatalogueSelect } from "../../components/select/CatalogueSelect";
import { AsyncButton } from "../../components/button/AsyncButton";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { api } from "../../configs/axios/interceptors";
import { getBranches } from "../../services/branchService";
import { getBranchSpecialties } from "../../services/branchSpecialtyService";
import { getUsers } from "../../services/userService";
import type { ApiResponse } from "../../types/ApiResponse";
import type { BranchResponse } from "../../types/BranchResponse";
import type { UserRequest } from "../../types/UserRequest";
import type { UserResponse } from "../../types/UserResponse";
import { useAuth } from "../../hooks/useAuth";
import { nameRoutes } from "../../configs/constants";
import { useNavigate } from "react-router";

type Step = "select-doctor" | "select-branch" | "confirm";

export function DoctorTransferPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("select-doctor");
  const [selectedDoctor, setSelectedDoctor] = useState<UserResponse | null>(null);
  const [selectedDoctorOption, setSelectedDoctorOption] = useState<{ label: string; value: string } | null>(null);
  const [newBranchId, setNewBranchId] = useState<number | null>(null);
  const [newBranchName, setNewBranchName] = useState<string>("");

  // Fetch full doctor details when one is selected
  const { data: doctorData, isLoading: doctorLoading } = useQuery({
    queryKey: ["doctor-detail", selectedDoctorOption?.value],
    queryFn: () =>
      getUsers({
        pageNumber: 1,
        pageSize: 1,
        filters: `Id:eq:${selectedDoctorOption!.value} AND State:eq:1`,
        include: "Rol,Branch,Specialty",
        includeTotal: false,
      }),
    enabled: !!selectedDoctorOption?.value,
  });

  // Fetch specialties available at the new branch
  const { data: branchSpecialtiesData } = useQuery({
    queryKey: ["branch-specialties-transfer", newBranchId],
    queryFn: () =>
      getBranchSpecialties({
        pageNumber: 1,
        pageSize: 50,
        filters: `BranchId:eq:${newBranchId} AND State:eq:1`,
        include: "Specialty",
        includeTotal: false,
      }),
    enabled: !!newBranchId,
  });

  const transferMutation = useMutation({
    mutationFn: (payload: UserRequest) =>
      api.patch<unknown, ApiResponse<UserResponse>, UserRequest>("User", payload),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Médico trasladado correctamente");
        queryClient.invalidateQueries({ queryKey: ["doctors"] });
        navigate(nameRoutes.doctorManagement);
      } else {
        toast.danger(res.message ?? "Error al trasladar");
      }
    },
    onError: () => toast.danger("Error inesperado al trasladar"),
  });

  const selectorDoctor = useCallback(
    (item: UserResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const selectorBranch = useCallback(
    (item: BranchResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  // Resolve doctor once loaded
  const doctor = doctorData?.success && doctorData.data.length > 0
    ? doctorData.data[0]
    : selectedDoctor;

  const newBranchSpecialtyNames =
    branchSpecialtiesData?.success
      ? branchSpecialtiesData.data.map((bs) => bs.specialty?.name).filter(Boolean)
      : [];

  const doctorSpecialtyName = doctor?.specialty?.name;
  const specialtyWarning =
    newBranchId &&
    doctorSpecialtyName &&
    newBranchSpecialtyNames.length > 0 &&
    !newBranchSpecialtyNames.includes(doctorSpecialtyName);

  const handleConfirm = () => {
    if (!doctor || !newBranchId) return;
    transferMutation.mutate({
      id: doctor.id,
      state: 1,
      branchId: newBranchId,
      updatedBy: userId,
    });
  };

  const handleDoctorSelect = (opt: SingleValue<{ label: string; value: string }> | null) => {
    setSelectedDoctorOption(opt);
    setSelectedDoctor(null);
    setStep("select-doctor");
    setNewBranchId(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Traslado de Médico</h1>
      <p className="text-gray-500 text-sm mb-6">
        Reasigne a un médico de una sede a otra siguiendo los pasos a continuación.
      </p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {(["select-doctor", "select-branch", "confirm"] as Step[]).map((s, idx) => {
          const labels = ["Seleccionar médico", "Nueva sede", "Confirmar"];
          const active = step === s;
          const done =
            (s === "select-doctor" && (step === "select-branch" || step === "confirm")) ||
            (s === "select-branch" && step === "confirm");
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2
                  ${active ? "bg-primary text-white border-primary" : done ? "bg-green-500 text-white border-green-500" : "bg-gray-100 text-gray-400 border-gray-300"}`}
              >
                {done ? "✓" : idx + 1}
              </div>
              <span className={`text-sm ${active ? "font-semibold" : "text-gray-400"}`}>{labels[idx]}</span>
              {idx < 2 && <span className="text-gray-300 mx-1">›</span>}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Select doctor */}
      {(step === "select-doctor" || step === "select-branch" || step === "confirm") && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5 mb-4">
          <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">
            Paso 1 — Médico seleccionado
          </h2>
          <CatalogueSelect<UserResponse>
            defaultValue={selectedDoctorOption}
            deps="Rol.Name:eq:Medico AND State:eq:1"
            fieldSearch="Name"
            label="Buscar médico"
            name="doctorId"
            placeholder="Escriba el nombre del médico..."
            queryFn={getUsers}
            selectorFn={selectorDoctor}
            onChange={(opt) => {
              handleDoctorSelect(opt as SingleValue<{ label: string; value: string }>);
            }}
          />

          {doctorLoading && <LoadingComponent />}

          {doctor && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm grid grid-cols-2 gap-2">
              <div><span className="font-semibold">Nombre:</span> {doctor.name}</div>
              <div><span className="font-semibold">Sede actual:</span> {doctor.branch?.name ?? <em className="text-orange-500">Sin asignar</em>}</div>
              <div><span className="font-semibold">Especialidad:</span> {doctor.specialty?.name ?? <em className="text-orange-500">Sin asignar</em>}</div>
            </div>
          )}

          {doctor && step === "select-doctor" && (
            <div className="flex justify-end mt-4">
              <Button variant="primary" onPress={() => setStep("select-branch")}>
                Continuar <i className="bi bi-arrow-right ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Select new branch */}
      {(step === "select-branch" || step === "confirm") && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5 mb-4">
          <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">
            Paso 2 — Nueva sede
          </h2>
          <CatalogueSelect<BranchResponse>
            defaultValue={newBranchId ? { label: newBranchName, value: String(newBranchId) } : null}
            deps="State:eq:1"
            fieldSearch="Name"
            label="Seleccionar sede de destino"
            name="newBranchId"
            placeholder="Seleccione la nueva sede"
            queryFn={getBranches}
            selectorFn={selectorBranch}
            onChange={(opt) => {
              const o = opt as SingleValue<{ label: string; value: string }>;
              setNewBranchId(o?.value ? Number(o.value) : null);
              setNewBranchName(o?.label ?? "");
              if (step === "confirm") setStep("select-branch");
            }}
          />

          {specialtyWarning && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm flex gap-2">
              <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
              <span>
                La sede seleccionada no ofrece la especialidad <strong>{doctorSpecialtyName}</strong>.
                Considere también actualizar la especialidad del médico después del traslado.
              </span>
            </div>
          )}

          {newBranchSpecialtyNames.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Especialidades disponibles en esta sede: {newBranchSpecialtyNames.join(", ")}
            </p>
          )}

          {newBranchId && step === "select-branch" && (
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onPress={() => setStep("select-doctor")}>
                <i className="bi bi-arrow-left mr-1" /> Atrás
              </Button>
              <Button variant="primary" onPress={() => setStep("confirm")}>
                Continuar <i className="bi bi-arrow-right ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Confirm */}
      {step === "confirm" && doctor && newBranchId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">
            Paso 3 — Confirmar traslado
          </h2>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg text-sm space-y-2">
            <p><span className="font-semibold">Médico:</span> {doctor.name}</p>
            <p>
              <span className="font-semibold">Sede actual:</span>{" "}
              {doctor.branch?.name ?? "Sin asignar"}
              {" "}<i className="bi bi-arrow-right" />{" "}
              <span className="font-semibold text-blue-700">{newBranchName}</span>
            </p>
            <p><span className="font-semibold">Especialidad:</span> {doctor.specialty?.name ?? "Sin asignar"}</p>
          </div>

          {specialtyWarning && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm flex gap-2">
              <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
              <span>
                La nueva sede no ofrece <strong>{doctorSpecialtyName}</strong>. Recuerde actualizar la especialidad.
              </span>
            </div>
          )}

          <div className="flex justify-between mt-5">
            <Button variant="secondary" onPress={() => setStep("select-branch")}>
              <i className="bi bi-arrow-left mr-1" /> Atrás
            </Button>
            <AsyncButton
              isLoading={transferMutation.isPending}
              loadingText="Trasladando..."
              variant="primary"
              onPress={handleConfirm}
            >
              <i className="bi bi-check-circle mr-1" />
              Confirmar Traslado
            </AsyncButton>
          </div>
        </div>
      )}
    </div>
  );
}
