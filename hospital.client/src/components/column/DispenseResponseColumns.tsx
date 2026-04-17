import { Button } from "@heroui/react";
import { useNavigate } from "react-router";
import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { DispenseResponse } from "../../types/DispenseResponse";

function DispenseButton({ data }: { readonly data: DispenseResponse }) {
  const navigate = useNavigate();
  return (
    <Button
      isIconOnly
      size="sm"
      aria-label="Ver detalle"
      variant="primary"
      onClick={() => navigate(`/dispense/${data.id}`)}
    >
      <i className="bi bi-eye" />
    </Button>
  );
}

export const DispenseResponseColumns: TableColumnWithFilters<DispenseResponse>[] = [
  {
    id: "id",
    name: "ID",
    selector: (data) => data.id ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Id:eq:${value}` : ""),
  },
  {
    id: "prescriptionId",
    name: "Receta ID",
    selector: (data) => data.prescriptionId ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `PrescriptionId:eq:${value}` : ""),
  },
  {
    id: "pharmacistId",
    name: "Farmacéutico ID",
    selector: (data) => data.pharmacistId ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "dispenseDate",
    name: "Fecha de Despacho",
    selector: (data) => data.createdAt ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "totalAmount",
    name: "Total",
    selector: (data) => `Q ${data.totalAmount?.toFixed(2) ?? "0.00"}`,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "state",
    name: "Estado",
    selector: (data) => (data.state === 1 ? "Activo" : "Inactivo"),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "actions",
    name: "Acciones",
    maxWidth: "100px",
    center: true,
    button: true,
    cell: (data) => <DispenseButton data={data} />,
  },
];
