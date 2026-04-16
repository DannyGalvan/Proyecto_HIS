import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { BranchResponse } from "../../types/BranchResponse";
import { BranchButton } from "../button/BranchButton";

export const BranchResponseColumns: TableColumnWithFilters<BranchResponse>[] = [
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
    id: "name",
    name: "Nombre",
    selector: (data) => data.name ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Name:like:${value}` : ""),
  },
  {
    id: "phone",
    name: "Teléfono",
    selector: (data) => data.phone ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "address",
    name: "Dirección",
    selector: (data) => data.address ?? "",
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
    cell: (data) => <BranchButton data={data} />,
  },
  {
    id: "createdAt",
    name: "Creado",
    selector: (data) => data.createdAt ?? "",
    sortable: true,
    maxWidth: "160px",
    omit: true,
  },
];
