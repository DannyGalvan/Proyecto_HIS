import { FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import type { SingleValue } from "react-select";

import { AsyncButton } from "../button/AsyncButton";
import { CatalogueSelect } from "../select/CatalogueSelect";
import { Response } from "../messages/Response";
import { LowStockAlert } from "../shared/LowStockAlert";

import { createInventoryMovement } from "../../services/inventoryMovementService";
import { getMedicines } from "../../services/medicineService";
import { getMedicineInventory } from "../../services/medicineService";
import { getBranches } from "../../services/branchService";

import type { InventoryMovementRequest } from "../../types/InventoryMovementResponse";
import { MovementTypeLabels } from "../../types/InventoryMovementResponse";
import type { MedicineResponse } from "../../types/MedicineResponse";
import type { MedicineInventoryResponse } from "../../types/MedicineInventoryResponse";
import type { BranchResponse } from "../../types/BranchResponse";

import { useAuth } from "../../hooks/useAuth";
import { validateInventoryMovement } from "../../validations/inventoryMovementValidation";

// ── Movement type helpers ──────────────────────────────────────────────────

/** Movement types available for manual CRUD (excludes Despacho=6 which is automatic) */
const MANUAL_MOVEMENT_TYPES = [0, 1, 2, 3, 4, 5] as const;

/** Exit movement types that reduce stock */
const EXIT_TYPES = new Set([2, 3, 5]);

/** Whether a movement type is an entry (increases stock) */
const isEntryType = (type: number): boolean => [0, 1, 4].includes(type);

/** Field visibility configuration per movement type */
const FIELD_CONFIG: Record<number, { unitCost: boolean; referenceNumber: boolean; notes: boolean; notesLabel: string; referenceLabel: string }> = {
  0: { unitCost: true, referenceNumber: true, notes: true, notesLabel: "Notas (opcional)", referenceLabel: "Número de Factura" },
  1: { unitCost: false, referenceNumber: true, notes: true, notesLabel: "Motivo de Devolución", referenceLabel: "Referencia de Devolución" },
  2: { unitCost: false, referenceNumber: true, notes: false, notesLabel: "", referenceLabel: "Referencia de Venta" },
  3: { unitCost: false, referenceNumber: true, notes: true, notesLabel: "Motivo del Reclamo", referenceLabel: "Referencia del Reclamo" },
  4: { unitCost: false, referenceNumber: false, notes: true, notesLabel: "Justificación (mín. 10 caracteres) *", referenceLabel: "" },
  5: { unitCost: false, referenceNumber: false, notes: true, notesLabel: "Justificación (mín. 10 caracteres) *", referenceLabel: "" },
};

// ── Reference type mapping ─────────────────────────────────────────────────
const REFERENCE_TYPE_MAP: Record<number, string> = {
  0: "Factura",
  1: "Devolución",
  2: "Venta",
  3: "Reclamo",
  4: "Ajuste",
  5: "Ajuste",
};

// ── Component ──────────────────────────────────────────────────────────────

export function InventoryMovementForm() {
  const navigate = useNavigate();
  const { userId } = useAuth();

  // ── Form state ─────────────────────────────────────────────────────────
  const [movementType, setMovementType] = useState<number | null>(null);
  const [medicineId, setMedicineId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [unitCost, setUnitCost] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // ── Lookup state ───────────────────────────────────────────────────────
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineResponse | null>(null);
  const [inventory, setInventory] = useState<MedicineInventoryResponse | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // ── Medicine cache ─────────────────────────────────────────────────────
  const medicineCacheRef = useState<Map<number, MedicineResponse>>(() => new Map())[0];

  // ── Field config for current type ──────────────────────────────────────
  const fieldConfig = movementType !== null ? FIELD_CONFIG[movementType] : null;

  // ── Fetch inventory when medicine + branch are selected ────────────────
  useEffect(() => {
    if (!medicineId || !branchId) {
      setInventory(null);
      return;
    }

    let cancelled = false;
    setInventoryLoading(true);

    getMedicineInventory({
      filters: `MedicineId:eq:${medicineId},BranchId:eq:${branchId}`,
      include: "Medicine",
      pageSize: 1,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data && res.data.length > 0) {
          setInventory(res.data[0]);
        } else {
          setInventory(null);
        }
      })
      .finally(() => {
        if (!cancelled) setInventoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [medicineId, branchId]);

  // ── Projected stock after operation ────────────────────────────────────
  const projectedStock = useMemo(() => {
    if (!inventory || !quantity) return null;
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return null;
    if (movementType === null) return null;

    return isEntryType(movementType)
      ? inventory.currentStock + qty
      : inventory.currentStock - qty;
  }, [inventory, quantity, movementType]);

  // ── Low stock warning ──────────────────────────────────────────────────
  const showLowStockAlert = useMemo(() => {
    if (movementType === null || !EXIT_TYPES.has(movementType)) return false;
    if (projectedStock === null || !selectedMedicine) return false;
    return projectedStock < selectedMedicine.minimumStock;
  }, [movementType, projectedStock, selectedMedicine]);

  // ── Selectors for CatalogueSelect ──────────────────────────────────────
  const selectorMedicine = useCallback(
    (item: MedicineResponse) => {
      medicineCacheRef.set(item.id, item);
      return { label: `${item.name} (${item.unit})`, value: String(item.id) };
    },
    [medicineCacheRef],
  );

  const selectorBranch = useCallback(
    (item: BranchResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleMedicineChange = useCallback(
    (opt: SingleValue<{ label: string; value: string }> | null) => {
      if (opt) {
        const id = Number(opt.value);
        setMedicineId(id);
        setSelectedMedicine(medicineCacheRef.get(id) ?? null);
      } else {
        setMedicineId(null);
        setSelectedMedicine(null);
        setInventory(null);
      }
    },
    [medicineCacheRef],
  );

  const handleBranchChange = useCallback(
    (opt: SingleValue<{ label: string; value: string }> | null) => {
      setBranchId(opt ? Number(opt.value) : null);
    },
    [],
  );

  const handleMovementTypeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setMovementType(val === "" ? null : Number(val));
    // Reset type-specific fields
    setUnitCost("");
    setReferenceNumber("");
    setNotes("");
    setErrors({});
    setSubmitError(null);
  }, []);

  // ── Mutation ───────────────────────────────────────────────────────────
  const { mutateAsync: doCreate, isPending } = useMutation({
    mutationFn: createInventoryMovement,
  });

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(null);

      // Build form data for validation
      const formData = {
        movementType: movementType ?? "",
        medicineId: medicineId ?? "",
        branchId: branchId ?? "",
        quantity,
        unitCost,
        notes,
      };

      const validationErrors = validateInventoryMovement(formData);
      setErrors(validationErrors as Record<string, string>);

      if (Object.keys(validationErrors).length > 0) {
        setSubmitError("Corrija los errores del formulario.");
        return;
      }

      // Ensure inventory record exists
      if (!inventory) {
        setSubmitError("No se encontró registro de inventario para el medicamento y sucursal seleccionados. Verifique que exista un registro de inventario.");
        return;
      }

      const request: InventoryMovementRequest = {
        medicineInventoryId: inventory.id,
        medicineId: medicineId!,
        branchId: branchId!,
        movementType: movementType!,
        quantity: Number(quantity),
        unitCost: movementType === 0 ? Number(unitCost) : 0,
        referenceNumber: referenceNumber.trim() || null,
        referenceType: REFERENCE_TYPE_MAP[movementType!] ?? null,
        notes: notes.trim() || null,
        userId: userId ?? null,
        state: 1,
      };

      const response = await doCreate(request);

      if (!response.success) {
        setSubmitError(response.message ?? "Error al registrar el movimiento.");
        return;
      }

      setSubmitSuccess("Movimiento de inventario registrado exitosamente.");
      // Reset form
      setMovementType(null);
      setMedicineId(null);
      setBranchId(null);
      setSelectedMedicine(null);
      setInventory(null);
      setQuantity("");
      setUnitCost("");
      setReferenceNumber("");
      setNotes("");
      setErrors({});
    },
    [movementType, medicineId, branchId, quantity, unitCost, referenceNumber, notes, inventory, userId, doCreate],
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        <i className="bi bi-journal-plus mr-2" />
        Registrar Movimiento de Inventario
      </h1>

      {submitError && <Response message={submitError} type={false} />}
      {submitSuccess && <Response message={submitSuccess} type={true} />}

      {/* Low stock alert */}
      {showLowStockAlert && selectedMedicine && projectedStock !== null && (
        <div className="mb-4">
          <LowStockAlert
            currentStock={projectedStock}
            medicineName={selectedMedicine.name}
            minimumStock={selectedMedicine.minimumStock}
          />
        </div>
      )}

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* ── Operation type selector ── */}
        <div>
          <div
            className={`rounded-xl transition-colors ${
              errors.movementType
                ? "bg-danger-50 hover:bg-danger-100"
                : "bg-default-100 hover:bg-default-200"
            }`}
          >
            <label
              className={`${errors.movementType ? "text-danger" : "text-default-500"} text-xs ms-3 pt-2 block`}
              htmlFor="movementType"
            >
              Tipo de Operación <span className="text-danger font-bold ml-1">*</span>
            </label>
            <select
              className="w-full bg-transparent px-3 py-2 text-sm outline-none cursor-pointer"
              id="movementType"
              name="movementType"
              value={movementType ?? ""}
              onChange={handleMovementTypeChange}
            >
              <option value="">Seleccione un tipo de operación</option>
              {MANUAL_MOVEMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MovementTypeLabels[type].label}
                </option>
              ))}
            </select>
          </div>
          {errors.movementType && (
            <p className="text-danger text-sm ms-1 mt-1">{errors.movementType}</p>
          )}
        </div>

        {/* ── Dynamic fields (only shown when type is selected) ── */}
        {movementType !== null && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Medicine */}
              <CatalogueSelect<MedicineResponse>
                isRequired
                deps="State:eq:1"
                errorMessage={errors.medicineId}
                fieldSearch="Name"
                isInvalid={!!errors.medicineId}
                label="Medicamento"
                name="medicineId"
                placeholder="Buscar medicamento..."
                queryFn={getMedicines}
                selectorFn={selectorMedicine}
                onChange={handleMedicineChange}
              />

              {/* Branch */}
              <CatalogueSelect<BranchResponse>
                isRequired
                deps="State:eq:1"
                errorMessage={errors.branchId}
                fieldSearch="Name"
                isInvalid={!!errors.branchId}
                label="Sucursal"
                name="branchId"
                placeholder="Seleccionar sucursal..."
                queryFn={getBranches}
                selectorFn={selectorBranch}
                onChange={handleBranchChange}
              />

              {/* Quantity */}
              <TextField
                isRequired
                className="w-full flex flex-col gap-1"
                isInvalid={!!errors.quantity}
                name="quantity"
              >
                <Label className="font-bold">Cantidad</Label>
                <Input
                  className="w-full px-3 py-2 border rounded-md"
                  min="1"
                  step="1"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                {errors.quantity ? <FieldError>{errors.quantity}</FieldError> : null}
              </TextField>

              {/* Unit Cost (only for Compra) */}
              {fieldConfig?.unitCost && (
                <TextField
                  isRequired
                  className="w-full flex flex-col gap-1"
                  isInvalid={!!errors.unitCost}
                  name="unitCost"
                >
                  <Label className="font-bold">Costo Unitario (Q)</Label>
                  <Input
                    className="w-full px-3 py-2 border rounded-md"
                    min="0.01"
                    step="0.01"
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                  />
                  {errors.unitCost ? <FieldError>{errors.unitCost}</FieldError> : null}
                </TextField>
              )}

              {/* Reference Number */}
              {fieldConfig?.referenceNumber && (
                <TextField
                  className="w-full flex flex-col gap-1"
                  name="referenceNumber"
                >
                  <Label className="font-bold">{fieldConfig.referenceLabel}</Label>
                  <Input
                    className="w-full px-3 py-2 border rounded-md"
                    maxLength={100}
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </TextField>
              )}
            </div>

            {/* Notes / Justification */}
            {fieldConfig?.notes && (
              <div className="flex flex-col gap-1">
                <label
                  className={`font-bold text-sm ${errors.notes ? "text-danger" : ""}`}
                  htmlFor="notes"
                >
                  {fieldConfig.notesLabel}
                </label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-md resize-none ${
                    errors.notes ? "border-danger" : ""
                  }`}
                  id="notes"
                  maxLength={500}
                  name="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {errors.notes && (
                  <p className="text-danger text-sm">{errors.notes}</p>
                )}
                {(movementType === 4 || movementType === 5) && (
                  <p className="text-xs text-default-400">
                    {notes.trim().length}/10 caracteres mínimos
                  </p>
                )}
              </div>
            )}

            {/* ── Inventory info panel ── */}
            {medicineId && branchId && (
              <div className="p-4 rounded-lg border bg-default-50">
                <h3 className="text-sm font-bold mb-2">
                  <i className="bi bi-info-circle mr-1" />
                  Información de Inventario
                </h3>
                {inventoryLoading ? (
                  <p className="text-sm text-default-400">Consultando inventario...</p>
                ) : inventory ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-default-500 block">Stock Actual</span>
                      <span className="font-bold text-lg">{inventory.currentStock}</span>
                    </div>
                    <div>
                      <span className="text-default-500 block">Stock Mínimo</span>
                      <span className="font-bold text-lg">
                        {selectedMedicine?.minimumStock ?? "—"}
                      </span>
                    </div>
                    {projectedStock !== null && (
                      <div>
                        <span className="text-default-500 block">Stock Proyectado</span>
                        <span
                          className={`font-bold text-lg ${
                            projectedStock < 0
                              ? "text-danger"
                              : showLowStockAlert
                                ? "text-warning"
                                : "text-success"
                          }`}
                        >
                          {projectedStock}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-default-500 block">Operación</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                          MovementTypeLabels[movementType]?.color ?? ""
                        }`}
                      >
                        {isEntryType(movementType) ? "↑ Entrada" : "↓ Salida"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-warning">
                    ⚠️ No se encontró registro de inventario para esta combinación de medicamento y sucursal.
                  </p>
                )}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-4 justify-end mt-4">
              <AsyncButton
                className="font-bold"
                isLoading={false}
                size="lg"
                type="button"
                variant="secondary"
                onClick={() => navigate("/inventory-movement")}
              >
                Cancelar
              </AsyncButton>
              <AsyncButton
                className="font-bold"
                isLoading={isPending}
                loadingText="Registrando..."
                size="lg"
                type="submit"
                variant="primary"
              >
                <i className="bi bi-journal-plus mr-2" />
                Registrar Movimiento
              </AsyncButton>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
