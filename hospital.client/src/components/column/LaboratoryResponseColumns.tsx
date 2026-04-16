import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { LaboratoryResponse } from "../../types/LaboratoryResponse";
import { LaboratoryButton } from "../button/LaboratoryButton";

export const LaboratoryResponseColumns: TableColumnWithFilters<LaboratoryResponse>[] = [
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
    id: "description",
    name: "Descripción",
    selector: (data) => data.description ?? "",
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
    cell: (data) => <LaboratoryButton data={data} />,
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
