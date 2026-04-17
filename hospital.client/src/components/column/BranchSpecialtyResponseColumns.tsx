import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { BranchSpecialtyResponse } from "../../types/BranchSpecialtyResponse";
import { BranchSpecialtyButton } from "../button/BranchSpecialtyButton";
import { formatDateTime } from "../../utils/dateFormatter";

export const BranchSpecialtyResponseColumns: TableColumnWithFilters<BranchSpecialtyResponse>[] = [
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
    id: "branch",
    name: "Sede",
    selector: (data) => data.branch?.name ?? String(data.branchId),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "specialty",
    name: "Especialidad",
    selector: (data) => data.specialty?.name ?? String(data.specialtyId),
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
    cell: (data) => <BranchSpecialtyButton data={data} />,
  },
  {
    id: "createdAt",
    name: "Creado",
    selector: (data) => formatDateTime(data.createdAt),
    sortable: true,
    maxWidth: "160px",
    omit: true,
  },
];
