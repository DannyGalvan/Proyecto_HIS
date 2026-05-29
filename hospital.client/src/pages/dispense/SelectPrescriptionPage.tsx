import { Button, Input, Label, TextField } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { nameRoutes } from "../../configs/constants";
import { usePrescriptionValidity } from "../../hooks/usePrescriptionValidity";
import { getDispenses } from "../../services/dispenseService";
import { getPrescriptions } from "../../services/prescriptionService";
import type { PrescriptionResponse } from "../../types/PrescriptionResponse";
import { formatDateTime } from "../../utils/dateFormatter";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";

function PrescriptionRow({
  prescription,
  isAlreadyDispensed,
}: {
  readonly prescription: PrescriptionResponse;
  readonly isAlreadyDispensed: boolean;
}) {
  const navigate = useNavigate();
  const { isValid, daysOld } = usePrescriptionValidity(
    prescription.prescriptionDate,
  );

  const handleDispense = useCallback(
    () => navigate(`${nameRoutes.dispenseCreate}/${prescription.id}`),
    [navigate, prescription.id],
  );

  const canDispense = isValid && !isAlreadyDispensed;

  return (
    <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-4 py-3 text-center font-mono font-semibold">
        #{prescription.id}
      </td>
      <td className="px-4 py-3 text-center">
        #{prescription.consultationId}
      </td>
      <td className="px-4 py-3 text-center">
        {formatDateTime(prescription.prescriptionDate)}
      </td>
      <td className="px-4 py-3 text-center">
        {isAlreadyDispensed ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <i className="bi bi-bag-check-fill" />
            Ya despachada
          </span>
        ) : isValid ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <i className="bi bi-check-circle-fill" />
            Vigente ({daysOld}d)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <i className="bi bi-x-circle-fill" />
            Vencida ({daysOld}d)
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {prescription.notes ?? "—"}
      </td>
      <td className="px-4 py-3 text-center">
        <Button
          className="font-semibold"
          isDisabled={!canDispense}
          size="sm"
          variant={canDispense ? "primary" : "secondary"}
          onPress={handleDispense}
        >
          <i className={`bi ${isAlreadyDispensed ? "bi-bag-check" : "bi-bag-plus"} mr-1`} />
          {isAlreadyDispensed ? "Despachada" : "Despachar"}
        </Button>
      </td>
    </tr>
  );
}

export function SelectPrescriptionPage() {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");
  const [searchConsultationId, setSearchConsultationId] = useState("");

  const filters = [
    searchId ? `Id:eq:${searchId}` : "",
    searchConsultationId ? `ConsultationId:eq:${searchConsultationId}` : "",
    "State:eq:1",
  ]
    .filter(Boolean)
    .join(",");

  const { data, isLoading } = useQuery({
    queryKey: ["pending-prescriptions", filters],
    queryFn: () =>
      getPrescriptions({
        pageNumber: 1,
        pageSize: 20,
        filters,
        include: "",
        includeTotal: false,
      }),
  });

  const prescriptions = data?.data ?? [];

  // Fetch existing dispenses to mark already-dispensed prescriptions
  const prescriptionIds = prescriptions.map((rx) => rx.id);
  const { data: dispensesData } = useQuery({
    queryKey: ["dispenses-for-prescriptions", prescriptionIds],
    queryFn: () =>
      getDispenses({
        pageNumber: 1,
        pageSize: 50,
        filters: "State:eq:1",
        include: "",
        includeTotal: false,
      }),
    enabled: prescriptionIds.length > 0,
  });

  const dispensedPrescriptionIds = new Set(
    (dispensesData?.data ?? []).map((d) => d.prescriptionId).filter(Boolean),
  );

  const handleBack = useCallback(
    () => navigate(nameRoutes.dispense),
    [navigate],
  );

  return (
    <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <Button size="sm" variant="ghost" onPress={handleBack}>
            <i className="bi bi-arrow-left mr-1" /> Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              <i className="bi bi-search mr-2 text-blue-600" />
              Buscar Receta para Despacho
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Busque por ID de receta o ID de consulta. Solo se muestran recetas
              activas.
            </p>
          </div>
        </div>

        {/* Search filters */}
        <div className="rounded-xl bg-white border p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField className="flex flex-col gap-1">
              <Label className="font-bold text-sm">ID de Receta</Label>
              <Input
                className="rounded-xl bg-default-100 px-3 py-2"
                placeholder="Ej: 15"
                type="number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </TextField>
            <TextField className="flex flex-col gap-1">
              <Label className="font-bold text-sm">ID de Consulta</Label>
              <Input
                className="rounded-xl bg-default-100 px-3 py-2"
                placeholder="Ej: 42"
                type="number"
                value={searchConsultationId}
                onChange={(e) => setSearchConsultationId(e.target.value)}
              />
            </TextField>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl bg-white border dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="py-12">
              <LoadingComponent />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <i className="bi bi-inbox text-4xl block mb-2" />
              {searchId || searchConsultationId
                ? "No se encontraron recetas con los filtros aplicados."
                : "Ingrese un ID de receta o consulta para buscar."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold">
                    Receta ID
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Consulta
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Fecha Emisión
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Vigencia
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Notas
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <PrescriptionRow
                    key={rx.id}
                    isAlreadyDispensed={dispensedPrescriptionIds.has(rx.id)}
                    prescription={rx}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
