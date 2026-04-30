import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { nameRoutes } from "../../configs/constants";
import { getMedicalConsultations } from "../../services/medicalConsultationService";
import { getPrescriptionByConsultation } from "../../services/prescriptionService";
import { LoadingComponent } from "../spinner/LoadingComponent";
import { CreatePrescriptionForm } from "./CreatePrescriptionForm";

interface CreatePrescriptionGuardProps {
  readonly appointmentId: number;
  readonly doctorId: number;
  readonly patientName?: string;
  readonly onCreated: (id: number) => void;
}

export function CreatePrescriptionGuard({
  appointmentId,
  doctorId,
  patientName,
  onCreated,
}: CreatePrescriptionGuardProps) {
  const navigate = useNavigate();

  const { data: consultationData, isLoading: loadingConsultation } = useQuery({
    queryKey: ["consultation-for-prescription", appointmentId],
    queryFn: () =>
      getMedicalConsultations({
        pageNumber: 1,
        pageSize: 1,
        filters: `AppointmentId:eq:${appointmentId} AND ConsultationStatus:eq:1 AND State:eq:1`,
        include: null,
        includeTotal: false,
      }),
    staleTime: 0,
  });

  const consultationId =
    consultationData?.success && consultationData.data.length > 0
      ? consultationData.data[0].id
      : null;

  const { data: existingData, isLoading: loadingExisting } = useQuery({
    queryKey: ["prescription-by-consultation", consultationId],
    queryFn: () => getPrescriptionByConsultation(consultationId!),
    enabled: !!consultationId,
    staleTime: 0,
  });

  const handleGoBack = useCallback(
    () => navigate(nameRoutes.doctorDashboard),
    [navigate],
  );

  const handleViewExisting = useCallback(
    () =>
      navigate(
        `/prescription/${existingData?.data?.id}?appointmentId=${appointmentId}&doctorId=${doctorId}&patientName=${encodeURIComponent(patientName ?? "")}`,
      ),
    [navigate, existingData, appointmentId, doctorId, patientName],
  );

  if (loadingConsultation || loadingExisting) return <LoadingComponent />;

  if (!consultationId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-exclamation-triangle text-6xl text-yellow-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Consulta no finalizada
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Debes finalizar la consulta medica antes de crear una receta.
        </p>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          type="button"
          onClick={handleGoBack}
        >
          <i className="bi bi-arrow-left" /> Volver al Panel
        </button>
      </div>
    );
  }

  if (existingData?.success && existingData.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-prescription2 text-6xl text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Ya existe una receta
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Esta consulta ya tiene una receta medica. Solo puede existir una
          receta por consulta.
        </p>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          type="button"
          onClick={handleViewExisting}
        >
          <i className="bi bi-eye mr-1" /> Ver Receta Existente
        </button>
      </div>
    );
  }

  return (
    <CreatePrescriptionForm
      consultationId={consultationId}
      doctorId={doctorId}
      patientName={patientName}
      onCreated={onCreated}
    />
  );
}
