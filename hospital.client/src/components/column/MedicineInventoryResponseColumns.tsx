import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { MedicineInventoryResponse } from "../../types/MedicineInventoryResponse";
import { MedicineInventoryButton } from "../button/MedicineInventoryButton";

export const MedicineInventoryResponseColumns: TableColumnWithFilters<MedicineInventoryResponse>[] = [
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
    id: "medicine",
    name: "Medicamento",
    selector: (data) => data.medicine?.name ?? String(data.medicineId),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Medicine.Name:like:${value}` : ""),
  },
  {
    id: "branch",
    name: "Sucursal",
    selector: (data) => data.branch?.name ?? String(data.branchId),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "currentStock",
    name: "Stock Actual",
    cell: (data) => {
      const minStock = data.medicine?.minimumStock ?? 0;
      const isLow = data.currentStock <= minStock;
      return (
        <span className={`font-bold ${isLow ? "text-red-600" : "text-green-600"}`}>
          {data.currentStock}
          {isLow && " ⚠️"}
        </span>
      );
    },
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "minimumStock",
    name: "Stock Mínimo",
    selector: (data) => data.medicine?.minimumStock ?? 0,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "isControlled",
    name: "Controlado",
    selector: (data) => (data.medicine?.isControlled ? "⚠️ Sí" : "No"),
    sortable: false,
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
    cell: (data) => <MedicineInventoryButton data={data} />,
  },
  {
    id: "updatedAt",
    name: "Actualizado",
    selector: (data) => data.updatedAt ?? "",
    sortable: true,
    maxWidth: "160px",
    omit: true,
  },
];
