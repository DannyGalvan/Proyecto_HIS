# Implementation Plan: Hospital Backend-Frontend Integration

## Overview

This plan covers the remaining implementation work for the HIS frontend integration. The codebase already has a substantial foundation: all services, types, Zod validations, Zustand stores, most column definitions, most page shells, and the existing forms. The tasks below focus exclusively on what is **missing or incomplete** based on a direct audit of the codebase.

Key findings from the audit:
- All Zustand stores already exist (`useAppointmentStore`, `useBranchStore`, `useSpecialtyStore`, etc.)
- All route names and `PublicRoutes.tsx` entries already exist
- `constants.ts` already has `initialUser` with `branchId`, `insuranceNumber`, `nit`
- Most column files already exist and are complete
- Most page files already exist (some as full implementations, some as shells needing wiring)
- `UserForm.tsx` already has `branchId`, `insuranceNumber`, `nit` fields
- `VitalSignForm.tsx` already has inline alert logic (needs extraction to `useVitalSignAlerts` hook)
- `MedicalConsultationForm.tsx` exists but lacks CIE-10 autocomplete and navigation buttons
- `CashierPage.tsx` is fully implemented (cash + POS payment with receipt)
- `ReceptionPage.tsx` is fully implemented
- `PrescriptionDetailPage.tsx` is fully implemented with item management
- `NotificationLogPage.tsx` is fully implemented inline (columns defined inside the page)

---

## Tasks

- [x] 1. Foundation — Shared Utilities and Components
  - [x] 1.1 Create `src/utils/maskCardNumber.ts`
    - Export `maskCardNumber(cardNumber: string): string`
    - Replace first `(length - 4)` characters with `'•'`, preserve last 4
    - Handle edge cases: strings shorter than 4 chars return as-is
    - _Requirements: 9.7, 10.4_

  - [x] 1.2 Create `src/utils/generateIdempotencyKey.ts`
    - Export `generateIdempotencyKey(): string` using `crypto.randomUUID()`
    - _Requirements: 9.8, 10.5_

  - [x] 1.3 Create `src/utils/calculateChange.ts`
    - Export `calculateChange(amountReceived: number, amount: number): number`
    - Return `Math.round((amountReceived - amount) * 100) / 100`
    - _Requirements: 10.2, 10.3_

  - [x] 1.4 Create `src/hooks/useIdempotencyKey.ts`
    - Generate UUID v4 on mount via `generateIdempotencyKey()`
    - Return `{ key: string, regenerate: () => void }`
    - `regenerate()` creates a new UUID for retry scenarios
    - _Requirements: 9.8, 10.5_

  - [x] 1.5 Create `src/hooks/useLuhnValidator.ts`
    - Export `useLuhnValidator()` returning `{ validate: (cardNumber: string) => boolean }`
    - Implement the standard Luhn checksum algorithm
    - Accept digit strings of length 13–19 only
    - _Requirements: 9.2_

  - [x] 1.6 Create `src/hooks/useReservationTimer.ts`
    - Signature: `useReservationTimer(minutes: number, onExpiry: () => void)`
    - Return `{ remaining: number, isExpired: boolean, reset: () => void }`
    - Use `setInterval` decrementing every second; call `onExpiry` at zero
    - Clean up interval on unmount
    - _Requirements: 7.8, 7.9_

  - [x] 1.7 Create `src/hooks/usePaymentTimer.ts`
    - Same pattern as `useReservationTimer` but for 10-minute payment sessions
    - Signature: `usePaymentTimer(minutes: number, onExpiry: () => void)`
    - Return `{ remaining: number, isExpired: boolean }`
    - _Requirements: 9.9_

  - [x] 1.8 Create `src/hooks/useVitalSignAlerts.ts`
    - Accept `VitalSignValues` object with optional numeric fields
    - Return `string[]` of alert messages for out-of-range values
    - Systolic < 90 → `'Hipotensión'`, > 140 → `'Hipertensión'`
    - Diastolic < 60 → `'Presión diastólica baja'`, > 90 → `'Presión diastólica alta'`
    - Temperature < 36.0 → `'Hipotermia'`, > 37.5 → `'Fiebre'`
    - HeartRate < 60 → `'Bradicardia'`, > 100 → `'Taquicardia'`
    - Return `[]` when all values are within normal range
    - _Requirements: 11.8–11.13_

  - [x] 1.9 Create `src/hooks/usePrescriptionValidity.ts`
    - Signature: `usePrescriptionValidity(prescriptionDate: string | null)`
    - Return `{ isValid: boolean, daysOld: number }`
    - `isValid = true` iff `(today - prescriptionDate) <= 7 days`
    - _Requirements: 14.4, 14.5_

  - [x] 1.10 Create `src/hooks/useCie10Autocomplete.ts`
    - Accept `query: string` with 300ms debounce
    - Search a local CIE-10 JSON dataset bundled with the app (static import)
    - Return `{ suggestions: Cie10Item[], isLoading: boolean }`
    - Fall back to empty array on error
    - _Requirements: 12.3_

  - [x] 1.11 Create `src/components/shared/CountdownTimer.tsx`
    - Props: `{ remaining: number; label?: string }`
    - Display `MM:SS` format
    - Apply red text/border styling when `remaining < 60`
    - _Requirements: 7.8_

  - [x] 1.12 Create `src/components/shared/StepForm.tsx`
    - Props: `{ steps: string[]; currentStep: number; onNext: () => void; onBack: () => void; children: React.ReactNode }`
    - Render step indicator bar and navigation buttons
    - _Requirements: 7.1_

  - [x] 1.13 Create `src/components/shared/VitalSignAlertsDisplay.tsx`
    - Props: `{ alerts: string[] }`
    - Render a non-blocking yellow/orange alert panel listing each alert
    - Render nothing when `alerts` is empty
    - Does NOT prevent form submission
    - _Requirements: 11.8–11.14_

  - [x] 1.14 Create `src/components/shared/OutOfRangeAlert.tsx`
    - Props: `{ isOutOfRange: boolean; referenceRange?: string }`
    - Render a red alert badge when `isOutOfRange=true`; render nothing otherwise
    - _Requirements: 13.5_

  - [x] 1.15 Create `src/components/shared/LowStockAlert.tsx`
    - Props: `{ medicineName: string; currentStock: number; minimumStock: number }`
    - Render an orange warning alert when `currentStock <= minimumStock`; render nothing otherwise
    - _Requirements: 14.10_

  - [x] 1.16 Create `src/components/shared/PaymentReceipt.tsx`
    - Props: `{ payment: PaymentResponse; patientName: string; serviceDetail: string; branchName: string }`
    - Display: transactionNumber, patientName, amount, paymentDate, serviceDetail, branchName
    - Include a print button that calls `window.print()`
    - _Requirements: 9.11, 10.6_

- [x] 2. Checkpoint — Verify shared utilities compile without errors
  - Ensure all new hooks and utils export correctly, ask the user if questions arise.

- [x] 3. Module A — User Management: Mask DPI and NIT in Columns
  - [x] 3.1 Update `src/components/column/UserResponseColumns.tsx`
    - Import `maskCardNumber` (or inline a `maskLastFour` helper) from utils
    - Update `identificationDocument` selector: `(data) => maskLastFour(data.identificationDocument)`
    - Update `nit` selector: `(data) => maskLastFour(data.nit)`
    - `maskLastFour`: show only last 4 chars, replace preceding chars with `'•'`
    - _Requirements: 3.9_

- [x] 4. Module B — Role Permissions Management
  - [x] 4.1 Create `src/components/column/RolOperationResponseColumns.tsx`
    - Columns: operationId, operation name, operation path, HTTP method, assigned (boolean badge), toggle action button
    - Import `RolOperationResponse` type (or define inline if type doesn't exist)
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 4.2 Create `src/pages/rol/RolOperationPage.tsx`
    - Read `rolId` from `useParams()`
    - Fetch all operations via `GET /api/v1/Operation` using `useQuery`
    - Fetch current role's operations via `GET /api/v1/RolOperation?Filters=RolId:{id}&Include=Rol,Operation`
    - Render a list of all operations with a toggle per row
    - Toggle ON → `POST /api/v1/RolOperation` with `{ rolId, operationId, state: 1 }`
    - Toggle OFF → `DELETE /api/v1/RolOperation/{id}`
    - Invalidate `["rolOperations", rolId]` on success
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

  - [x] 4.3 Register `RolOperationPage` route in `src/routes/PublicRoutes.tsx`
    - Add route: `{ path: \`${nameRoutes.rolUpdate}/:id/operations\`, element: <ProtectedPublic><RolOperationPage /></ProtectedPublic> }`
    - Add import for `RolOperationPage`
    - Add `rolOperations: "/rol/update"` key to `nameRoutes` in `constants.ts` if not present
    - _Requirements: 4.3_

- [x] 5. Module C — Core Catalogs: Badge Components
  - [x] 5.1 Create `src/components/badge/AppointmentStatusBadge.tsx`
    - Props: `{ statusName: string }`
    - Color map: Pagada=green, Pendiente=yellow, Cancelada=red, En curso=blue, Completada=gray, No asistió=orange
    - Render a `<span>` with the appropriate Tailwind color classes
    - _Requirements: 5.4_

  - [x] 5.2 Create `src/components/badge/MedicineControlledBadge.tsx`
    - Props: `{ isControlled: boolean }`
    - Render a warning badge with "Controlado" text when `isControlled=true`
    - Render nothing when `isControlled=false`
    - _Requirements: 6.5_

  - [x] 5.3 Create `src/components/badge/NotificationStatusBadge.tsx`
    - Props: `{ status: number }`
    - Status map: 0=Pendiente/yellow, 1=Enviado/green, 2=Fallido/red, 3=Reintentando/blue
    - _Requirements: 14 (Module M)_

- [x] 6. Module C — Core Catalogs: Wire AppointmentStatusBadge into existing columns
  - [x] 6.1 Update `src/components/column/AppointmentResponseColumns.tsx`
    - Replace the inline `statusColors` map and `<span>` logic with `<AppointmentStatusBadge statusName={...} />`
    - Import `AppointmentStatusBadge` from `../../components/badge/AppointmentStatusBadge`
    - _Requirements: 5.4, 8.6_

- [x] 7. Module D — Lab and Pharmacy: Wire MedicineControlledBadge into existing column
  - [x] 7.1 Update `src/components/column/MedicineResponseColumns.tsx`
    - Add a column for `isControlled` that renders `<MedicineControlledBadge isControlled={data.isControlled} />`
    - Import `MedicineControlledBadge`
    - _Requirements: 6.5_

- [x] 8. Module E — Appointment Scheduling: Upgrade AppointmentForm to multi-step with timer
  - [x] 8.1 Rewrite `src/components/form/AppointmentForm.tsx` as a 4-step form
    - Step 1: `specialtyId` (CatalogueSelect, State:eq:1), `branchId` (CatalogueSelect, State:eq:1)
    - Step 2: `doctorId` (CatalogueSelect filtered by specialty), `appointmentDate` (InputDateSelector, future dates only — reject past dates)
    - Step 3: `reason` (textarea, 10–2000 chars), optional PDF document upload (validate type=application/pdf, size ≤ 2MB)
    - Step 4: Confirmation summary; on render start `useReservationTimer(5, onExpiry)` and display `CountdownTimer`
    - Use `StepForm` wrapper for step indicators and navigation
    - On expiry: display expiration message and navigate back to step 1
    - On successful submit: navigate to payment flow
    - Support `followUp=true` query param: include `followUpType` and `parentConsultationId` in request
    - _Requirements: 7.1–7.11_

  - [x] 8.2 Update `src/pages/appointment/CreateAppointmentPage.tsx`
    - Wire the updated `AppointmentForm` with `createAppointment` mutation
    - Pass `onSuccess` callback that navigates to `/payment?appointmentId={id}`
    - _Requirements: 7.10_

- [x] 9. Module F — Reception: Extract ReceptionSearch component
  - [x] 9.1 Create `src/components/reception/ReceptionSearch.tsx`
    - Extract the search bar (DPI / appointment number toggle + input + submit) from `ReceptionPage.tsx` into a reusable component
    - Props: `{ onSearch: (query: string, type: 'dpi' | 'id') => void }`
    - _Requirements: 8.1_

  - [x] 9.2 Update `src/pages/reception/ReceptionPage.tsx`
    - Replace inline search bar with `<ReceptionSearch onSearch={...} />`
    - _Requirements: 8.1_

- [x] 10. Module G — Online Payment
  - [x] 10.1 Create `src/components/payment/CardPaymentForm.tsx`
    - Props: `{ amount: number; appointmentId: number; onSuccess: (payment: PaymentResponse) => void }`
    - Internal state: `cardNumber` (raw digits), `cardholderName`, `expiry` (MM/YY), `cvv` (local only — never persisted)
    - Display masked card number via `maskCardNumber()`
    - Validate card number with `useLuhnValidator()` (13–19 digits)
    - Validate cardholder name: 5–100 chars
    - Validate expiry: MM/YY format, not in the past
    - Validate CVV: 3–4 digits
    - Use `useIdempotencyKey()` for `idempotencyKey` field
    - Use `usePaymentTimer(10, onExpiry)` — show `CountdownTimer`, on expiry display timeout message
    - Clear `cvv` from state immediately after API call (before `onSuccess`)
    - On success: call `onSuccess(payment)`
    - _Requirements: 9.1–9.10_

  - [x] 10.2 Create `src/pages/payment/OnlinePaymentPage.tsx`
    - Read `appointmentId` from route params or navigation state
    - Fetch appointment details to display payment summary
    - Render `CardPaymentForm` with `amount` and `appointmentId`
    - On success: update appointment status to "Pagada", render `PaymentReceipt`
    - _Requirements: 9.1, 9.11_

  - [x] 10.3 Register `OnlinePaymentPage` route in `src/routes/PublicRoutes.tsx`
    - Add route: `{ path: nameRoutes.onlinePayment, element: <ProtectedPublic><OnlinePaymentPage /></ProtectedPublic> }`
    - Add `onlinePayment: "/payment/online"` to `nameRoutes` in `constants.ts`
    - _Requirements: 9.1_

- [x] 11. Module H — Cash Payment: Wire PaymentReceipt into CashierPage
  - [x] 11.1 Update `src/pages/cashier/CashierPage.tsx`
    - Replace the inline receipt JSX with `<PaymentReceipt payment={...} patientName={...} serviceDetail={...} branchName={...} />`
    - Import `PaymentReceipt` from `../../components/shared/PaymentReceipt`
    - Replace `uuidv4()` import with `generateIdempotencyKey()` from utils
    - Replace inline change calculation with `calculateChange()` from utils
    - _Requirements: 10.2, 10.5, 10.6_

- [x] 12. Module I — Vital Signs: Extract alert logic into hook and display component
  - [x] 12.1 Update `src/components/form/VitalSignForm.tsx`
    - Remove inline `getBloodPressureAlert`, `getTemperatureAlert`, `getHeartRateAlert` functions
    - Import and use `useVitalSignAlerts(form)` hook
    - Import and render `<VitalSignAlertsDisplay alerts={alerts} />` below the form fields
    - Ensure alerts do NOT block form submission
    - _Requirements: 11.8–11.14_

- [x] 13. Module J — Medical Consultation: Add CIE-10 autocomplete and navigation buttons
  - [x] 13.1 Update `src/components/form/MedicalConsultationForm.tsx`
    - Replace the plain text `diagnosisCie10Code` input with an async autocomplete using `useCie10Autocomplete`
    - Debounce: 300ms; display suggestions as a dropdown
    - Add navigation buttons at the bottom of the form (only visible when editing an existing consultation):
      - "Crear Receta" → navigate to `/prescription/create?consultationId={id}`
      - "Crear Orden de Lab" → navigate to `/lab-order/create?consultationId={id}`
      - "Agendar Seguimiento" → navigate to `/appointment/create?followUp=true&parentConsultationId={id}`
    - _Requirements: 12.3, 12.6_

- [x] 14. Module K — Laboratory Orders: Create and Detail pages
  - [x] 14.1 Create `src/components/form/LabOrderForm.tsx`
    - Fields: `consultationId`, `doctorId`, `patientId`, `orderStatus` (default 0 = Pendiente), `isExternal` (checkbox), `notes`
    - Dynamic items list: each item has `labExamId` (CatalogueSelect → LabExam) and `amount`
    - Items can be added/removed before submission
    - On submit: POST to `/api/v1/LabOrder` then POST each item to `/api/v1/LabOrderItem`
    - _Requirements: 13.1, 13.2_

  - [x] 14.2 Create `src/components/form/LabOrderItemResultForm.tsx`
    - Fields: `resultValue`, `resultUnit`, `isOutOfRange` (checkbox), `resultNotes`, `resultDate`
    - On submit: PATCH `/api/v1/LabOrderItem` with result fields
    - Render `<OutOfRangeAlert isOutOfRange={form.isOutOfRange} referenceRange={...} />` when `isOutOfRange=true`
    - _Requirements: 13.4, 13.5_

  - [x] 14.3 Create `src/pages/lab-order/CreateLabOrderPage.tsx`
    - Render `LabOrderForm` with `createLabOrder` mutation
    - Read optional `consultationId` from query params and pre-fill
    - _Requirements: 13.1_

  - [x] 14.4 Create `src/pages/lab-order/LabOrderDetailPage.tsx`
    - Fetch a single LabOrder with all items via `GET /api/v1/LabOrder/{id}?Include=Items,Patient`
    - Display each item row with `OutOfRangeAlert` when `isOutOfRange=true`
    - Render `LabOrderItemResultForm` per item for result entry
    - Supervisor toggle: button to set `isPublished=true` per item via PATCH
    - Display `totalAmount` as sum of all item amounts
    - _Requirements: 13.3–13.8_

  - [x] 14.5 Register new lab-order routes in `src/routes/PublicRoutes.tsx`
    - Add `labOrderCreate` and `labOrderDetail` to `nameRoutes` in `constants.ts`
    - Add routes for `CreateLabOrderPage` and `LabOrderDetailPage`
    - _Requirements: 13.1_

- [x] 15. Module L — Prescriptions and Pharmacy: Dispense flow
  - [x] 15.1 Create `src/components/form/DispenseForm.tsx`
    - For each prescription item: check inventory via `GET /api/v1/MedicineInventory?Filters=MedicineId:{id},BranchId:{branchId}`
    - Show `<LowStockAlert>` when `currentStock <= minimumStock`
    - Substitution support: `wasSubstituted` checkbox + `substitutionReason` field (required when `wasSubstituted=true`)
    - Calculate dispense total as sum of `(quantity × unitPrice)` for all items
    - On submit: POST to `/api/v1/Dispense`, then PATCH `/api/v1/MedicineInventory` with updated `currentStock`
    - _Requirements: 14.6–14.11_

  - [x] 15.2 Create `src/components/column/DispenseResponseColumns.tsx`
    - Columns: id, prescriptionId, pharmacistId, dispenseDate, totalAmount, state, actions
    - _Requirements: 14.3_

  - [x] 15.3 Create `src/pages/dispense/DispensePage.tsx`
    - List page using `TableServer` with `DispenseResponseColumns`
    - Fetch from `GET /api/v1/Dispense` with `Include=Prescription`
    - Use `useDispenseStore` for filter state
    - _Requirements: 14.3_

  - [x] 15.4 Create `src/pages/dispense/CreateDispensePage.tsx`
    - Read `prescriptionId` from route params or query params
    - Validate prescription validity using `usePrescriptionValidity(prescriptionDate)`
    - If `isValid=false`: display expiration warning and block the dispense form
    - Render `DispenseForm` when prescription is valid
    - _Requirements: 14.4, 14.5_

  - [x] 15.5 Create `src/components/column/PrescriptionResponseColumns.tsx`
    - Extract the inline columns from `PrescriptionPage.tsx` into a standalone file
    - Export `PrescriptionResponseColumns`
    - Update `PrescriptionPage.tsx` to import from the new file
    - _Requirements: 14.3_

  - [x] 15.6 Register dispense routes in `src/routes/PublicRoutes.tsx`
    - Add `dispense` and `dispenseCreate` to `nameRoutes` in `constants.ts`
    - Add routes for `DispensePage` and `CreateDispensePage`
    - _Requirements: 14.3_

- [x] 16. Module M — Notifications: Extract badge into standalone component
  - [x] 16.1 Create `src/components/column/NotificationLogResponseColumns.tsx`
    - Extract the inline `NotificationLogColumns` array from `NotificationLogPage.tsx` into a standalone file
    - Replace inline status badge cell with `<NotificationStatusBadge status={data.status} />`
    - Export `NotificationLogResponseColumns`
    - Update `NotificationLogPage.tsx` to import from the new file
    - _Requirements: Req 15 (Module M)_

- [x] 17. Checkpoint — Verify all modules compile and routes resolve
  - Run `tsc --noEmit` in `hospital.client/` to check for type errors.
  - Ensure all new imports resolve correctly.
  - Ask the user if questions arise.

- [x] 18. Property-Based Tests
  - [x] 18.1 Install `fast-check` and `vitest` dev dependencies
    - Run: `npm install --save-dev fast-check vitest @vitest/ui`
    - Add `vitest` config to `vite.config.ts` if not already present
    - _Requirements: All correctness properties_

  - [ ]* 18.2 Create `src/utils/__tests__/validators.property.test.ts`
    - **Property 1: DPI Format** — `fc.string()` → validator accepts iff matches `/^\d{13}$/`
    - **Property 2: NIT Format** — `fc.string()` → validator accepts iff matches `/^[a-zA-Z0-9]{8,9}$/`
    - **Property 3: Phone Format** — `fc.string()` → validator accepts iff matches `/^\d{8}$/`
    - **Property 4: Password Minimum Length** — `fc.string()` → validator accepts iff `s.length >= 12`
    - **Property 5: Username Length** — `fc.string()` → validator accepts iff `s.length >= 8 AND s.length <= 9`
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.6, 2.7**

  - [ ]* 18.3 Create `src/utils/__tests__/luhn.property.test.ts`
    - **Property 9: Luhn Validation** — for any valid card number, modifying any single digit causes validator to return false
    - Use `fc.stringMatching(/^\d{13,19}$/)` to generate test inputs
    - **Validates: Requirements 9.2**

  - [ ]* 18.4 Create `src/utils/__tests__/maskCardNumber.property.test.ts`
    - **Property 11: Card Masking** — for any string `s` of length 13–19, `maskCardNumber(s)` returns same length, last 4 chars identical, all preceding chars are `'•'`
    - **Validates: Requirements 9.7**

  - [ ]* 18.5 Create `src/utils/__tests__/calculateChange.property.test.ts`
    - **Property 12: Change Calculation** — for all `amountReceived >= amount`, result equals `amountReceived - amount` with ≤ 2 decimal places; result is always ≥ 0
    - Use `fc.float({ min: 0, max: 10000 })` for amounts
    - **Validates: Requirements 10.2, 10.3**

  - [ ]* 18.6 Create `src/utils/__tests__/idempotencyKey.property.test.ts`
    - **Property 10: UUID v4 Format and Uniqueness** — every generated key matches `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`; any two consecutive calls return different values
    - **Validates: Requirements 9.8, 10.5**

  - [ ]* 18.7 Create `src/hooks/__tests__/useVitalSignAlerts.property.test.ts`
    - **Property 13: Alert Completeness** — for any `VitalSignValues`, the hook returns an alert for each out-of-range field and no alert for each in-range field; the set of alerts is exactly the set of out-of-range fields
    - Use `fc.record({ bloodPressureSystolic: fc.integer(), ... })` for inputs
    - **Validates: Requirements 11.8–11.13**

  - [ ]* 18.8 Create `src/hooks/__tests__/usePrescriptionValidity.property.test.ts`
    - **Property 17: Prescription Validity Window** — `isValid=true` iff `(today - prescriptionDate) <= 7 days`; any date older than 7 days returns `isValid=false`
    - Use `fc.date()` for prescription dates
    - **Validates: Requirements 14.4**

- [x] 19. Final Checkpoint — Run all tests and verify build
  - Run `npx vitest --run` in `hospital.client/` to execute all property tests.
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All new components must follow the existing patterns: `useForm` hook, `CatalogueSelect` for FK dropdowns, `OptionsSelect` for enums, `AsyncButton` for submit buttons
- The `cvv` field in `CardPaymentForm` must NEVER be stored in localStorage, sessionStorage, or any Zustand store — local `useState` only, cleared immediately after submission
- Checkpoints use `tsc --noEmit` rather than running the dev server; run `npm run dev` manually to test in the browser
- Property tests use `fast-check` with `vitest`; run with `npx vitest --run` (not watch mode)
- The CIE-10 dataset should be a static JSON file bundled at build time — no external API call needed
