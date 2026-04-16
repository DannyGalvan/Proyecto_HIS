import { useNavigate, useSearchParams } from "react-router";
import { LabOrderForm } from "../../components/form/LabOrderForm";

export function CreateLabOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const consultationIdParam = searchParams.get("consultationId");
  const initialConsultationId = consultationIdParam ? Number(consultationIdParam) : null;

  return (
    <div>
      <LabOrderForm
        initialConsultationId={initialConsultationId}
        onSuccess={(id) => navigate(`/lab-order/${id}`)}
      />
    </div>
  );
}
