# Design Document — Hospital Backend-Frontend Integration

## Overview

This document describes the complete technical design for integrating the Hospital Information System (HIS) ASP.NET Core 8.0 backend with the React + TypeScript frontend. The backend exposes 24 controllers at `/api/v1/` following a generic `EntityService` + `CrudController` pattern. The frontend uses React 18, TypeScript, Vite, React Query, Zod, Zustand, HeroUI, and Axios with JWT interceptors.

The integration covers 13 functional modules (A–M) plus shared infrastructure. All new code must follow the established patterns already present in the codebase: `TableServer` for lists, `CatalogueSelect` for FK dropdowns, `useForm` hook for form state, Zod schemas for validation, and Zustand stores for filter state.

**Scope of this document:** Only NEW files to be created or EXISTING files to be modified are described. The backend API, existing services, types, validations, and stores are already in place and are referenced but not redesigned.

---

## Architecture

### Communication Pattern

```
React Component
    │
    ├── useQuery / useMutation  (React Query)
    │       │
    │       └── XxxService.ts  (axios wrapper)
    │               │
    │               └── api (axios instance with JWT interceptor)
    │                       │
    │                       └── /api/v1/{Controller}  (ASP.NET Core)
    │
    ├── useXxxStore (Zustand)  — filter/pagination state
    │
    └── validateXxx (Zod)     — form validation before submit
```

### Request/Response Cycle

All API responses conform to `ApiResponse<T>`:
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalResults: number;
}
```

- `success=true` → render data
- `success=false` + `data` is `ValidationFailure[]` → map errors to form fields via `handleOneLevelZodError`
- `success=false` + no validation failures → display `message` as toast

### Authentication Flow

JWT token stored in `localStorage["@auth"]`. The axios interceptor (`interceptors.ts`) attaches `Authorization: Bearer {token}` to every request. On HTTP 401, the interceptor clears the token and redirects to `/auth`. On HTTP 403, it displays the forbidden message without redirect.

---

## Components and Interfaces

### Directory Structure — New Files Only

```
hospital.client/src/
├── components/
│   ├── badge/
│   │   ├── AppointmentStatusBadge.tsx       # Module C
│   │   ├── MedicineControlledBadge.tsx      # Module D
│   │   └── NotificationStatusBadge.tsx      # Module M
│   ├── button/
│   │   ├── AppointmentStatusButton.tsx      # Module C
│   │   ├── BranchButton.tsx                 # (already exists)
│   │   ├── LabExamButton.tsx                # Module D
│   │   ├── LaboratoryButton.tsx             # Module D
│   │   ├── MedicineButton.tsx               # Module D
│   │   ├── SpecialtyButton.tsx              # Module C
│   │   └── AppointmentButton.tsx            # Module E
│   ├── column/
│   │   ├── AppointmentResponseColumns.tsx   # Module E
│   │   ├── AppointmentStatusResponseColumns.tsx  # Module C
│   │   ├── DispenseResponseColumns.tsx      # Module L
│   │   ├── LabExamResponseColumns.tsx       # Module D
│   │   ├── LabOrderResponseColumns.tsx      # Module K
│   │   ├── MedicalConsultationResponseColumns.tsx  # Module J
│   │   ├── MedicineResponseColumns.tsx      # Module D
│   │   ├── NotificationLogResponseColumns.tsx  # Module M
│   │   ├── PrescriptionResponseColumns.tsx  # Module L
│   │   ├── RolOperationResponseColumns.tsx  # Module B
│   │   └── VitalSignResponseColumns.tsx     # Module I
│   ├── form/
│   │   ├── AppointmentStatusForm.tsx        # Module C
│   │   ├── BranchForm.tsx                   # Module C
│   │   ├── DispenseForm.tsx                 # Module L
│   │   ├── LabExamForm.tsx                  # Module D
│   │   ├── LaboratoryForm.tsx               # Module D
│   │   ├── LabOrderForm.tsx                 # Module K
│   │   ├── LabOrderItemResultForm.tsx       # Module K
│   │   ├── MedicalConsultationForm.tsx      # Module J
│   │   ├── MedicineForm.tsx                 # Module D
│   │   ├── PrescriptionForm.tsx             # Module L
│   │   ├── SpecialtyForm.tsx                # Module C
│   │   └── VitalSignForm.tsx                # Module I
│   ├── payment/
│   │   ├── CardPaymentForm.tsx              # Module G
│   │   └── PaymentReceipt.tsx               # Modules G, H
│   ├── shared/
│   │   ├── CountdownTimer.tsx               # Modules E, G
│   │   ├── LowStockAlert.tsx                # Module L
│   │   ├── OutOfRangeAlert.tsx              # Module K
│   │   ├── StepForm.tsx                     # Module E
│   │   └── VitalSignAlertsDisplay.tsx       # Module I
│   └── reception/
│       └── ReceptionSearch.tsx              # Module F
├── hooks/
│   ├── useCie10Autocomplete.ts              # Module J
│   ├── useIdempotencyKey.ts                 # Modules G, H
│   ├── useLuhnValidator.ts                  # Module G
│   ├── usePaymentTimer.ts                   # Module G
│   ├── usePrescriptionValidity.ts           # Module L
│   ├── useReservationTimer.ts               # Module E
│   └── useVitalSignAlerts.ts                # Module I
├── pages/
│   ├── appointment/
│   │   ├── AppointmentPage.tsx
│   │   ├── CreateAppointmentPage.tsx
│   │   └── UpdateAppointmentPage.tsx
│   ├── appointment-status/
│   │   ├── AppointmentStatusPage.tsx
│   │   ├── CreateAppointmentStatusPage.tsx
│   │   └── UpdateAppointmentStatusPage.tsx
│   ├── branch/
│   │   ├── BranchPage.tsx
│   │   ├── CreateBranchPage.tsx
│   │   └── UpdateBranchPage.tsx
│   ├── dispense/
│   │   ├── DispensePage.tsx
│   │   └── CreateDispensePage.tsx
│   ├── lab-exam/
│   │   ├── LabExamPage.tsx
│   │   ├── CreateLabExamPage.tsx
│   │   └── UpdateLabExamPage.tsx
│   ├── lab-order/
│   │   ├── LabOrderPage.tsx
│   │   ├── CreateLabOrderPage.tsx
│   │   └── LabOrderDetailPage.tsx
│   ├── laboratory/
│   │   ├── LaboratoryPage.tsx
│   │   ├── CreateLaboratoryPage.tsx
│   │   └── UpdateLaboratoryPage.tsx
│   ├── medical-consultation/
│   │   ├── MedicalConsultationPage.tsx
│   │   ├── CreateMedicalConsultationPage.tsx
│   │   └── UpdateMedicalConsultationPage.tsx
│   ├── medicine/
│   │   ├── MedicinePage.tsx
│   │   ├── CreateMedicinePage.tsx
│   │   └── UpdateMedicinePage.tsx
│   ├── notification-log/
│   │   └── NotificationLogPage.tsx
│   ├── payment/
│   │   ├── CashPaymentPage.tsx
│   │   └── OnlinePaymentPage.tsx
│   ├── prescription/
│   │   ├── PrescriptionPage.tsx
│   │   └── CreatePrescriptionPage.tsx
│   ├── reception/
│   │   └── ReceptionPage.tsx
│   ├── rol/
│   │   └── RolOperationPage.tsx             # Module B (new)
│   ├── specialty/
│   │   ├── SpecialtyPage.tsx
│   │   ├── CreateSpecialtyPage.tsx
│   │   └── UpdateSpecialtyPage.tsx
│   └── vital-sign/
│       ├── VitalSignPage.tsx
│       └── CreateVitalSignPage.tsx
└── utils/
    ├── calculateChange.ts                   # Module H
    ├── maskCardNumber.ts                    # Module G
    └── generateIdempotencyKey.ts            # Modules G, H
```

**Modified existing files:**
- `src/components/form/UserForm.tsx` — add branchId CatalogueSelect, insuranceNumber, nit fields (already done per codebase inspection)
- `src/components/column/UserResponseColumns.tsx` — mask DPI/NIT to last 4 chars
- `src/configs/constants.ts` — add all new route names + initialUser with branchId/insuranceNumber/nit
- `src/routes/PublicRoutes.tsx` — add all new routes
- `src/hooks/useAuthorizationRoutes.tsx` — routes already filtered by operations; no change needed

---

## Module Designs

### Module A: User Management (UPDATE existing)

**Files to modify:**

`UserResponseColumns.tsx` — update DPI and NIT selectors to mask:
```typescript
selector: (data) => maskLastFour(data.identificationDocument),
// maskLastFour: (s) => s ? '•'.repeat(s.length - 4) + s.slice(-4) : ''
```

`constants.ts` — update `initialUser` to include the three new fields:
```typescript
export const initialUser: UserRequest = {
  ...existing fields...,
  branchId: null,
  insuranceNumber: null,
  nit: null,
};
```

`UserForm.tsx` — already contains branchId, insuranceNumber, nit fields per current codebase. No further changes needed.

---

### Module B: Role and Permissions

**New file: `RolOperationPage.tsx`**

This page manages the assignment of operations to a role. It uses two data sources:
1. All operations: `GET /api/v1/Operation` (paginated, searchable)
2. Current role's operations: `GET /api/v1/RolOperation?Filters=RolId:{id}&Include=Rol,Operation`

The page renders a list of all operations with a toggle per row. When toggled ON, it calls `POST /api/v1/RolOperation` with `{ rolId, operationId, state: 1 }`. When toggled OFF, it calls `DELETE /api/v1/RolOperation/{id}`.

```typescript
// RolOperationPage component interface
interface RolOperationPageProps {
  rolId: number;  // from useParams
}
// Uses useQuery for both data sources
// Uses useMutation for assign/revoke
// Invalidates ["rolOperations", rolId] on success
```

**New column: `RolOperationResponseColumns.tsx`**
- Columns: operationId, operation name, operation path, HTTP method, assigned (boolean badge), actions (toggle button)

---

### Module C: Catalogs — Specialty, Branch, AppointmentStatus

**Pattern for all three:** identical structure to existing Rol module.

**SpecialtyForm.tsx** — fields: name (max 200), description (max 500), state. Uses `validateSpecialty` (already exists).

**BranchForm.tsx** — fields: name (max 100), phone (8 digits, optional), address (max 500, optional), description (max 250, optional), state. Uses `validateBranch` (already exists).

**AppointmentStatusForm.tsx** — fields: name (max 50), description (max 200, optional), state. Uses `validateAppointmentStatus` (already exists).

**AppointmentStatusBadge.tsx:**
```typescript
const STATUS_COLORS: Record<string, string> = {
  'Pagada':      'bg-green-100 text-green-800',
  'Pendiente':   'bg-yellow-100 text-yellow-800',
  'Cancelada':   'bg-red-100 text-red-800',
  'En curso':    'bg-blue-100 text-blue-800',
  'Completada':  'bg-gray-100 text-gray-800',
  'No asistió':  'bg-orange-100 text-orange-800',
};
interface AppointmentStatusBadgeProps {
  statusName: string;
}
```

Pages follow the exact pattern of `RolPage`, `CreateRolPage`, `UpdateRolPage`.

---

### Module D: Catalogs — Laboratory, LabExam, Medicine

**LaboratoryForm.tsx** — fields: name (max 200), description (max 500), state.

**LabExamForm.tsx** — fields: name (max 200), defaultAmount (decimal), referenceRange (optional), unit (optional), laboratoryId (CatalogueSelect → Laboratory), state.

**MedicineForm.tsx** — fields: name (max 200), description (max 500), defaultPrice (decimal), unit, isControlled (checkbox), minimumStock (integer, optional), state.

**MedicineControlledBadge.tsx:**
```typescript
interface MedicineControlledBadgeProps {
  isControlled: boolean;
}
// Renders a warning badge with "Controlado" text when isControlled=true
// Renders nothing when isControlled=false
```

**MedicineResponseColumns.tsx** — includes a cell for `isControlled` that renders `MedicineControlledBadge`.

---

### Module E: Appointment Scheduling (CU-03)

**StepForm.tsx** — generic multi-step wrapper:
```typescript
interface StepFormProps {
  steps: string[];          // step labels
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
}
```

**AppointmentForm.tsx** — 4-step form:
- Step 1: specialtyId (CatalogueSelect), branchId (CatalogueSelect)
- Step 2: doctorId (CatalogueSelect filtered by specialty), appointmentDate (InputDateSelector, future dates only)
- Step 3: reason (textarea, 10–2000 chars), document upload (PDF, ≤2MB)
- Step 4: confirmation summary + submit

On step 4 confirmation, `useReservationTimer(5)` starts. Timer displayed via `CountdownTimer`.

**useReservationTimer.ts:**
```typescript
export function useReservationTimer(minutes: number, onExpiry: () => void) {
  // Returns: { remaining: number, isExpired: boolean, reset: () => void }
  // Uses setInterval, decrements every second
  // Calls onExpiry when remaining reaches 0
  // Cleans up interval on unmount
}
```

**CountdownTimer.tsx:**
```typescript
interface CountdownTimerProps {
  remaining: number;  // seconds
  label?: string;
}
// Displays MM:SS format, red when < 60 seconds
```

**Document upload validation** is handled in the form's onChange handler before setting state:
```typescript
const validateDocument = (file: File): string | null => {
  if (file.type !== 'application/pdf') return 'Solo se permiten archivos PDF';
  if (file.size > 2097152) return 'El archivo no puede superar 2MB';
  return null;
};
```

---

### Module F: Appointment Reception (CU-05)

**ReceptionPage.tsx** — search interface with two inputs: DPI or appointment number. Uses `getAppointments` with `Filters=IdentificationDocument:eq:{dpi}` or `Filters=Id:eq:{num}` and `Include=Patient,AppointmentStatus,Branch`.

Results display appointment cards with `AppointmentStatusBadge`. Three action buttons per result:
- **Check-in**: calls `partialUpdateAppointment({ id, arrivalTime: now, appointmentStatusId: checkedInStatusId })`
- **Walk-in**: navigates to `/appointment/create`
- **Emergency**: calls `partialUpdateAppointment({ id, priority: 1 })` then navigates to `/vital-sign/create?appointmentId={id}`

**ReceptionSearch.tsx** — reusable search bar component used by ReceptionPage.

---

### Module G: Online Payment (CU-04)

**OnlinePaymentPage.tsx** — receives `appointmentId` from route params or navigation state. Displays payment summary, then `CardPaymentForm`.

**CardPaymentForm.tsx:**
```typescript
interface CardPaymentFormProps {
  amount: number;
  appointmentId: number;
  onSuccess: (payment: PaymentResponse) => void;
}
// Internal state: cardNumber (masked display), cardholderName, expiry, cvv (local only)
// cvv is NEVER stored outside this component's local useState
// On submit: clears cvv from state immediately after API call
// Uses useIdempotencyKey() for idempotencyKey
// Uses usePaymentTimer(10) for session timeout
// Uses useLuhnValidator() for card number validation
```

**useLuhnValidator.ts:**
```typescript
export function useLuhnValidator() {
  const validate = (cardNumber: string): boolean => {
    // Pure Luhn algorithm implementation
    // Returns true iff the number passes the Luhn checksum
  };
  return { validate };
}
```

**useIdempotencyKey.ts:**
```typescript
export function useIdempotencyKey() {
  // Generates a UUID v4 on mount using crypto.randomUUID()
  // Returns: { key: string, regenerate: () => void }
  // regenerate() creates a new UUID v4 for retry scenarios
}
```

**usePaymentTimer.ts:**
```typescript
export function usePaymentTimer(minutes: number, onExpiry: () => void) {
  // Same pattern as useReservationTimer but for payment sessions
  // Returns: { remaining: number, isExpired: boolean }
}
```

**maskCardNumber.ts:**
```typescript
export function maskCardNumber(cardNumber: string): string {
  // Returns string of same length where first (length-4) chars are '•'
  // and last 4 chars are preserved
  // Example: '4111111111111111' → '••••••••••••1111'
}
```

**generateIdempotencyKey.ts:**
```typescript
export function generateIdempotencyKey(): string {
  return crypto.randomUUID(); // UUID v4 via Web Crypto API
}
```

**PaymentReceipt.tsx:**
```typescript
interface PaymentReceiptProps {
  payment: PaymentResponse;
  patientName: string;
  serviceDetail: string;
  branchName: string;
}
// Printable receipt component
// Uses window.print() via a print button
// Displays: transactionNumber, patientName, amount, paymentDate, serviceDetail, branchName
```

---

### Module H: Cash Payment (CU-06)

**CashPaymentPage.tsx** — search patient by DPI or appointment number (same `ReceptionSearch` component). Displays pending payment details. Payment method selector (Efectivo / Tarjeta POS). For cash: `amountReceived` input + calculated change display. For POS: last 4 digits input only.

**calculateChange.ts:**
```typescript
export function calculateChange(amountReceived: number, amount: number): number {
  // Returns Math.round((amountReceived - amount) * 100) / 100
  // Ensures 2 decimal precision without floating-point drift
}
```

On success, renders `PaymentReceipt` (shared with Module G).

---

### Module I: Vital Signs (CU-07)

**VitalSignForm.tsx** — 7 numeric fields with range validation from `validateVitalSign` (already exists). Also renders `VitalSignAlertsDisplay` below the form when any field is out of range.

**useVitalSignAlerts.ts:**
```typescript
interface VitalSignValues {
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  temperature?: number | null;
  heartRate?: number | null;
}

export function useVitalSignAlerts(values: VitalSignValues): string[] {
  // Returns array of alert messages for out-of-range values
  // Systolic < 90 → 'Hipotensión', > 140 → 'Hipertensión'
  // Diastolic < 60 → 'Presión diastólica baja', > 90 → 'Presión diastólica alta'
  // Temperature < 36.0 → 'Hipotermia', > 37.5 → 'Fiebre'
  // HeartRate < 60 → 'Bradicardia', > 100 → 'Taquicardia'
  // Returns [] when all values are within normal range
}
```

**VitalSignAlertsDisplay.tsx:**
```typescript
interface VitalSignAlertsDisplayProps {
  alerts: string[];
}
// Renders a non-blocking yellow/orange alert panel
// Does NOT prevent form submission
// Renders nothing when alerts is empty
```

---

### Module J: Medical Consultation (CU-08)

**MedicalConsultationForm.tsx** — fields: appointmentId, doctorId, reasonForVisit, clinicalFindings, diagnosisCie10Code (AsyncSelect with debounce), diagnosis (required when consultationStatus=1), treatmentPlan, consultationStatus, notes, state.

The form uses a conditional validation: when `consultationStatus === 1`, `diagnosis` is required and must be 10–5000 chars. This is handled in `validateMedicalConsultation` (already exists).

**useCie10Autocomplete.ts:**
```typescript
export function useCie10Autocomplete(query: string) {
  // Debounced search with 300ms delay (well under 500ms requirement)
  // Searches a local CIE-10 JSON dataset bundled with the app
  // Returns: { suggestions: Cie10Item[], isLoading: boolean }
  // Falls back to empty array on error
}
// CIE-10 data is a static JSON file imported at build time
// No external API call needed — dataset is ~3MB compressed
```

Navigation buttons at the bottom of the consultation form:
- "Crear Receta" → navigates to `/prescription/create?consultationId={id}`
- "Crear Orden de Lab" → navigates to `/lab-order/create?consultationId={id}`
- "Agendar Seguimiento" → navigates to `/appointment/create?followUp=true&parentConsultationId={id}`

---

### Module K: Laboratory (CU-09)

**LabOrderForm.tsx** — creates a LabOrder with multiple LabOrderItems. Uses a dynamic list of items, each with a `labExamId` (CatalogueSelect → LabExam). Items can be added/removed before submission.

**LabOrderItemResultForm.tsx** — used by lab technicians to enter results for a specific LabOrderItem. Fields: resultValue, resultUnit, isOutOfRange (checkbox), resultNotes, resultDate. Calls `PATCH /api/v1/LabOrderItem`.

**OutOfRangeAlert.tsx:**
```typescript
interface OutOfRangeAlertProps {
  isOutOfRange: boolean;
  referenceRange?: string;
}
// Renders a red alert badge when isOutOfRange=true
// Renders nothing when isOutOfRange=false
```

**LabOrderDetailPage.tsx** — displays a single LabOrder with all its items. Each item row shows result data and `OutOfRangeAlert`. Supervisor can toggle `isPublished=true` per item.

---

### Module L: Prescriptions and Pharmacy (CU-10)

**PrescriptionForm.tsx** — creates a Prescription with multiple PrescriptionItems. Dynamic item list with fields: medicineName, dosage, frequency, duration, specialInstructions.

**DispenseForm.tsx** — dispenses a prescription. For each item, checks inventory via `GET /api/v1/MedicineInventory?Filters=MedicineId:{id},BranchId:{branchId}`. Shows `LowStockAlert` when `currentStock <= minimumStock`. Supports substitution: `wasSubstituted` checkbox + `substitutionReason` field (required when wasSubstituted=true).

**usePrescriptionValidity.ts:**
```typescript
export function usePrescriptionValidity(prescriptionDate: string | null): {
  isValid: boolean;
  daysOld: number;
} {
  // Returns isValid=true iff (today - prescriptionDate) <= 7 days
  // daysOld is the number of days since prescriptionDate
}
```

**LowStockAlert.tsx:**
```typescript
interface LowStockAlertProps {
  medicineName: string;
  currentStock: number;
  minimumStock: number;
}
// Renders an orange warning alert when currentStock <= minimumStock
// Renders nothing otherwise
```

---

### Module M: Notifications (Admin)

**NotificationLogPage.tsx** — list page using `TableServer`. Filters: status (OptionsSelect), recipientEmail (text search), relatedEntityType (text search).

**NotificationStatusBadge.tsx:**
```typescript
const NOTIFICATION_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: 'Pendiente',    color: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Enviado',      color: 'bg-green-100 text-green-800' },
  2: { label: 'Fallido',      color: 'bg-red-100 text-red-800' },
  3: { label: 'Reintentando', color: 'bg-blue-100 text-blue-800' },
};
```

**NotificationLogResponseColumns.tsx** — columns: id, recipientEmail, subject, notificationType (label), status (NotificationStatusBadge), retryCount, errorMessage (truncated), sentAt, createdAt.

---

## Data Models

All data models (types) already exist in `src/types/`. The following summarizes the key models used by new components:

### Appointment Scheduling State (multi-step form)
```typescript
interface AppointmentFormState {
  step: 1 | 2 | 3 | 4;
  specialtyId: number | null;
  branchId: number | null;
  doctorId: number | null;
  appointmentDate: string | null;
  reason: string;
  document: File | null;
  documentError: string | null;
}
```

### Card Payment Local State (never persisted)
```typescript
interface CardFormState {
  cardNumber: string;       // raw digits, masked in display
  cardholderName: string;
  expiry: string;           // MM/YY format
  cvv: string;              // cleared immediately after submission
  maskedDisplay: string;    // derived from cardNumber via maskCardNumber()
}
```

### Vital Sign Alert Model
```typescript
interface VitalSignAlert {
  field: string;
  message: string;
  severity: 'warning' | 'danger';
}
```

### Dispense Item with Substitution
```typescript
interface DispenseItemFormState {
  prescriptionItemId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  wasSubstituted: boolean;
  substitutionReason: string;  // required when wasSubstituted=true
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: DPI Format Validation

*For any* string `s`, the DPI validator SHALL accept `s` if and only if `s` matches the pattern `/^\d{13}$/`. Any string with fewer than 13 digits, more than 13 digits, or containing non-numeric characters SHALL be rejected.

**Validates: Requirements 2.3**

---

### Property 2: NIT Format Validation

*For any* string `s`, the NIT validator SHALL accept `s` if and only if `s` matches the pattern `/^[a-zA-Z0-9]{8,9}$/`. Strings shorter than 8 characters, longer than 9 characters, or containing non-alphanumeric characters SHALL be rejected.

**Validates: Requirements 2.4**

---

### Property 3: Phone Format Validation

*For any* string `s`, the phone validator SHALL accept `s` if and only if `s` matches the pattern `/^\d{8}$/`. Any string that is not exactly 8 numeric digits SHALL be rejected.

**Validates: Requirements 2.5**

---

### Property 4: Password Minimum Length Validation

*For any* string `s`, the password validator SHALL accept `s` if and only if `s.length >= 12`. Any string with fewer than 12 characters SHALL be rejected.

**Validates: Requirements 2.6**

---

### Property 5: Username Length Validation

*For any* string `s`, the username validator SHALL accept `s` if and only if `s.length >= 8 AND s.length <= 9`. Strings of length 7 or less, or length 10 or more, SHALL be rejected.

**Validates: Requirements 2.7**

---

### Property 6: Controlled Medicine Indicator

*For any* Medicine record, the medicine display component SHALL render the controlled indicator if and only if `isControlled === true`. For any Medicine record where `isControlled === false` or `isControlled` is absent, the controlled indicator SHALL NOT be rendered.

**Validates: Requirements 6.1**

---

### Property 7: Future Appointment Date Validation

*For any* DateTime value `d`, the appointment date validator SHALL accept `d` if and only if `d` is strictly greater than the current timestamp at the moment of validation. Any date in the past or equal to the current moment SHALL be rejected.

**Validates: Requirements 7.4**

---

### Property 8: Document Upload Validation

*For any* file object `f`, the document validator SHALL accept `f` if and only if `f.size <= 2097152 AND f.type === "application/pdf"`. Files exceeding 2MB or with a non-PDF MIME type SHALL be rejected regardless of the other field's value.

**Validates: Requirements 7.6, 7.7**

---

### Property 9: Luhn Card Number Validation

*For any* digit string `s` of length 13–19, the Luhn validator SHALL return `true` if and only if `s` passes the Luhn checksum algorithm. Furthermore, for any valid card number `s`, modifying any single digit to a different digit SHALL cause the validator to return `false`.

**Validates: Requirements 9.2**

---

### Property 10: Idempotency Key Uniqueness and Format

*For any* two consecutive invocations of `generateIdempotencyKey()`, the returned values SHALL be different strings. *For any* generated key `k`, `k` SHALL match the UUID v4 format pattern `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`.

**Validates: Requirements 9.8, 18.4**

---

### Property 11: Card Number Masking

*For any* card number string `s` of length `L` where `13 <= L <= 19`, the `maskCardNumber` function SHALL return a string of the same length `L` where the first `(L - 4)` characters are replaced with the masking character `'•'` and the last 4 characters are identical to the last 4 characters of `s`.

**Validates: Requirements 9.7, 18.5**

---

### Property 12: Cash Change Calculation

*For any* cash payment where `amountReceived >= amount`, the `calculateChange` function SHALL return a value equal to `amountReceived - amount` with no rounding error beyond 2 decimal places. The result SHALL always be greater than or equal to zero.

**Validates: Requirements 10.2, 10.3**

---

### Property 13: Vital Sign Alert Completeness

*For any* `VitalSignValues` object, the `useVitalSignAlerts` hook SHALL produce an alert message for each field that is outside its defined normal range, and SHALL produce no alert for each field that is within its normal range. The set of returned alerts SHALL be exactly the set of out-of-range fields — no more, no fewer.

Normal ranges:
- `bloodPressureSystolic`: 90–140 mmHg
- `bloodPressureDiastolic`: 60–90 mmHg
- `temperature`: 36.0–37.5 °C
- `heartRate`: 60–100 bpm

**Validates: Requirements 11.8–11.13**

---

### Property 14: Diagnosis Required for Consultation Closure

*For any* `MedicalConsultationRequest` where `consultationStatus === 1`, the validator SHALL reject the submission if `diagnosis` is `null`, `undefined`, or has fewer than 10 characters. *For any* submission where `consultationStatus === 0`, the `diagnosis` field SHALL be optional and its absence SHALL not cause a validation error.

**Validates: Requirements 12.4**

---

### Property 15: Out-of-Range Lab Result Alert

*For any* `LabOrderItem` record where `isOutOfRange === true`, the result display component SHALL render the out-of-range alert indicator. *For any* record where `isOutOfRange === false` or `isOutOfRange` is `null`, the alert indicator SHALL NOT be rendered.

**Validates: Requirements 13.5**

---

### Property 16: Lab Order Total Invariant

*For any* `LabOrder` record with one or more items, the displayed `totalAmount` SHALL equal the arithmetic sum of all `LabOrderItem.amount` values in that order. Adding or removing an item SHALL update the total accordingly.

**Validates: Requirements 13.8**

---

### Property 17: Prescription Validity Window

*For any* `Prescription` record, the `usePrescriptionValidity` hook SHALL return `isValid = true` if and only if the difference between the current date and `prescriptionDate` is less than or equal to 7 days. Any prescription older than 7 days SHALL return `isValid = false`.

**Validates: Requirements 14.4**

---

### Property 18: Dispense Total Invariant

*For any* `Dispense` record, the displayed `totalAmount` SHALL equal the sum of `(DispenseItem.quantity × DispenseItem.unitPrice)` for all items in that dispense. The calculation SHALL be consistent regardless of the number of items.

**Validates: Requirements 14.11**

---

### Property 19: Substitution Reason Invariant

*For any* `DispenseItem` where `wasSubstituted === true`, the `substitutionReason` field SHALL be non-null and non-empty. *For any* `DispenseItem` where `wasSubstituted === false` or `null`, the `substitutionReason` field SHALL be optional and its absence SHALL not cause a validation error.

**Validates: Requirements 14.7, 14.8**

---

### Property 20: Low-Stock Alert Threshold

*For any* `MedicineInventory` record after a dispense operation, the `LowStockAlert` component SHALL be displayed if and only if `currentStock <= Medicine.minimumStock`. When `currentStock > minimumStock`, no alert SHALL be shown.

**Validates: Requirements 14.10**

---

### Property 21: Notification Filter Consistency

*For any* filtered notification list request with a specific status value `S`, every `NotificationLog` record in the response SHALL have `status === S`. No record with a different status value SHALL appear in the filtered results.

**Validates: Requirements 16.2**

---

## Error Handling

### HTTP Error Codes

| Code | Handling |
|------|----------|
| 400  | Map `data[]` (ValidationFailure[]) to form field errors via `handleOneLevelZodError` |
| 401  | Clear localStorage, redirect to `/auth`, display session expiry message |
| 403  | Display "No tienes permisos para realizar esta acción contacta con el administrador" toast |
| 404  | Display "Recurso no encontrado" toast |
| 500  | Display generic error message, log to console |

All error handling is centralized in the axios interceptors (`interceptors.ts`). Individual components only need to handle `success=false` responses from the API.

### Form Validation Errors

Zod validation runs client-side before any API call. The `useForm` hook calls `validateForm(form)` on every change and on submit. If `Object.keys(errors).length > 0`, the submit is blocked and errors are displayed inline via HeroUI `FieldError` components.

### Payment Error Handling

The `CardPaymentForm` maps gateway response codes to user-friendly messages:
```typescript
const GATEWAY_ERRORS: Record<string, string> = {
  'INSUFFICIENT_FUNDS': 'Fondos insuficientes. Verifique su saldo.',
  'INVALID_CARD':       'Tarjeta inválida. Verifique los datos.',
  'EXPIRED_CARD':       'Tarjeta expirada. Use otra tarjeta.',
  'COMMUNICATION_ERROR':'Error de comunicación. Intente nuevamente.',
};
```

### Timer Expiry Handling

- **Reservation timer (5 min):** On expiry, display modal "La reserva ha expirado" and navigate to `/appointment`.
- **Payment timer (10 min):** On expiry, clear the card form state (including CVV), display modal "La sesión de pago ha expirado", and navigate to `/appointment`.

### CIE-10 Autocomplete Errors

If the local CIE-10 dataset fails to load, the field degrades gracefully to a plain text input. No blocking error is shown.

---

## Testing Strategy

### Dual Testing Approach

The testing strategy combines example-based unit tests for specific scenarios with property-based tests for universal invariants. Both are necessary for comprehensive coverage.

**Property-based testing library:** `fast-check` (to be added as a dev dependency: `npm install --save-dev fast-check`).

**Test runner:** Vitest (standard for Vite projects; to be added: `npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event`).

### Unit Tests (Example-Based)

Focus areas:
- `AppointmentStatusBadge`: verify each of the 6 status names maps to the correct color class
- `CardPaymentForm`: verify CVV is cleared from state after submission
- `PaymentReceipt`: verify all required fields are rendered
- `ReceptionPage`: verify search by DPI and by appointment number trigger correct API calls
- `RolOperationPage`: verify toggle ON calls POST, toggle OFF calls DELETE

### Property-Based Tests

Each property from the Correctness Properties section maps to one property-based test. Configuration: minimum 100 iterations per test.

**Tag format:** `// Feature: hospital-backend-frontend-integration, Property {N}: {property_text}`

#### Test file: `src/utils/__tests__/validators.property.test.ts`

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { userSchema } from '../validations/userValidation';

// Feature: hospital-backend-frontend-integration, Property 1: DPI format validation
it('Property 1: DPI validator accepts exactly 13-digit strings', () => {
  fc.assert(fc.property(fc.string(), (s) => {
    const result = userSchema.shape.identificationDocument.safeParse(s);
    const expected = /^\d{13}$/.test(s) || s === '';
    return result.success === expected;
  }), { numRuns: 100 });
});

// Feature: hospital-backend-frontend-integration, Property 2: NIT format validation
it('Property 2: NIT validator accepts 8-9 alphanumeric strings', () => {
  fc.assert(fc.property(fc.string(), (s) => {
    const result = userSchema.shape.nit.safeParse(s);
    const expected = /^[a-zA-Z0-9]{8,9}$/.test(s) || s === '';
    return result.success === expected;
  }), { numRuns: 100 });
});

// Feature: hospital-backend-frontend-integration, Property 3: Phone format validation
it('Property 3: Phone validator accepts exactly 8-digit strings', () => {
  fc.assert(fc.property(fc.string(), (s) => {
    const result = userSchema.shape.number.safeParse(s);
    const expected = /^\d{8}$/.test(s) || s === '';
    return result.success === expected;
  }), { numRuns: 100 });
});

// Feature: hospital-backend-frontend-integration, Property 4: Password minimum length
it('Property 4: Password validator accepts strings of length >= 12', () => {
  fc.assert(fc.property(fc.string({ minLength: 0, maxLength: 50 }), (s) => {
    const result = userSchema.shape.password.safeParse(s);
    const expected = s.length >= 12 || s === '';
    return result.success === expected;
  }), { numRuns: 100 });
});

// Feature: hospital-backend-frontend-integration, Property 5: Username length
it('Property 5: Username validator accepts strings of length 8-9', () => {
  fc.assert(fc.property(fc.string({ minLength: 0, maxLength: 15 }), (s) => {
    const result = userSchema.shape.userName.safeParse(s);
    const expected = s.length >= 8 && s.length <= 9;
    return result.success === expected;
  }), { numRuns: 100 });
});
```

#### Test file: `src/utils/__tests__/luhn.property.test.ts`

```typescript
// Feature: hospital-backend-frontend-integration, Property 9: Luhn validation
it('Property 9: Luhn validator correctly identifies valid and invalid card numbers', () => {
  // Generate valid Luhn numbers and verify acceptance
  // Generate valid numbers with one digit flipped and verify rejection
  fc.assert(fc.property(
    fc.integer({ min: 13, max: 19 }).chain(len =>
      fc.array(fc.integer({ min: 0, max: 9 }), { minLength: len, maxLength: len })
    ),
    (digits) => {
      const withCheckDigit = appendLuhnCheckDigit(digits.slice(0, -1));
      const valid = validate(withCheckDigit.join(''));
      return valid === true;
    }
  ), { numRuns: 100 });
});
```

#### Test file: `src/utils/__tests__/maskCardNumber.property.test.ts`

```typescript
// Feature: hospital-backend-frontend-integration, Property 11: Card masking
it('Property 11: maskCardNumber preserves last 4 chars and masks all others', () => {
  fc.assert(fc.property(
    fc.integer({ min: 13, max: 19 }).chain(len =>
      fc.string({ minLength: len, maxLength: len })
    ),
    (s) => {
      const masked = maskCardNumber(s);
      const L = s.length;
      return (
        masked.length === L &&
        masked.slice(-4) === s.slice(-4) &&
        masked.slice(0, L - 4).split('').every(c => c === '•')
      );
    }
  ), { numRuns: 100 });
});
```

#### Test file: `src/utils/__tests__/calculateChange.property.test.ts`

```typescript
// Feature: hospital-backend-frontend-integration, Property 12: Change calculation
it('Property 12: calculateChange returns amountReceived - amount with 2 decimal precision', () => {
  fc.assert(fc.property(
    fc.float({ min: 0.01, max: 10000, noNaN: true }),
    fc.float({ min: 0, max: 5000, noNaN: true }),
    (amount, extra) => {
      const amountReceived = amount + extra;
      const change = calculateChange(amountReceived, amount);
      const expected = Math.round((amountReceived - amount) * 100) / 100;
      return change >= 0 && Math.abs(change - expected) < 0.001;
    }
  ), { numRuns: 100 });
});
```

#### Test file: `src/hooks/__tests__/useVitalSignAlerts.property.test.ts`

```typescript
// Feature: hospital-backend-frontend-integration, Property 13: Vital sign alert completeness
it('Property 13: useVitalSignAlerts produces exactly the set of out-of-range alerts', () => {
  fc.assert(fc.property(
    fc.record({
      bloodPressureSystolic: fc.integer({ min: 60, max: 250 }),
      bloodPressureDiastolic: fc.integer({ min: 40, max: 150 }),
      temperature: fc.float({ min: 34.0, max: 42.0, noNaN: true }),
      heartRate: fc.integer({ min: 30, max: 220 }),
    }),
    (values) => {
      const alerts = computeVitalSignAlerts(values);
      const expectedCount = [
        values.bloodPressureSystolic < 90 || values.bloodPressureSystolic > 140,
        values.bloodPressureDiastolic < 60 || values.bloodPressureDiastolic > 90,
        values.temperature < 36.0 || values.temperature > 37.5,
        values.heartRate < 60 || values.heartRate > 100,
      ].filter(Boolean).length;
      return alerts.length === expectedCount;
    }
  ), { numRuns: 100 });
});
```

#### Test file: `src/hooks/__tests__/usePrescriptionValidity.property.test.ts`

```typescript
// Feature: hospital-backend-frontend-integration, Property 17: Prescription validity
it('Property 17: prescription is valid iff <= 7 days old', () => {
  fc.assert(fc.property(
    fc.integer({ min: -30, max: 30 }),
    (daysOffset) => {
      const date = new Date();
      date.setDate(date.getDate() - daysOffset);
      const { isValid } = computePrescriptionValidity(date.toISOString());
      return isValid === (daysOffset >= 0 && daysOffset <= 7);
    }
  ), { numRuns: 100 });
});
```

#### Test file: `src/utils/__tests__/idempotencyKey.property.test.ts`

```typescript
// Feature: hospital-backend-frontend-integration, Property 10: Idempotency key format and uniqueness
it('Property 10: all generated keys match UUID v4 format and are unique', () => {
  const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  fc.assert(fc.property(fc.constant(null), () => {
    const keys = Array.from({ length: 10 }, () => generateIdempotencyKey());
    const allMatch = keys.every(k => UUID_V4_REGEX.test(k));
    const allUnique = new Set(keys).size === keys.length;
    return allMatch && allUnique;
  }), { numRuns: 100 });
});
```

### Integration Tests

The following scenarios require integration tests (not property-based) because they test external service wiring:

- Appointment creation flow: verify POST to `/api/v1/Appointment` with correct payload
- Payment submission: verify POST to `/api/v1/Payment` includes `idempotencyKey`
- Vital sign save: verify POST to `/api/v1/VitalSign` succeeds and data appears in list within 2 seconds
- Lab result publish: verify PATCH to `/api/v1/LabOrderItem` with `isPublished=true`

These use MSW (Mock Service Worker) to intercept API calls without a live backend.

---

## Route Structure

All new routes to be added to `nameRoutes` in `constants.ts` and registered in `PublicRoutes.tsx`:

```typescript
// constants.ts additions
export const nameRoutes = {
  // ... existing routes ...
  specialty:              '/specialty',
  specialtyCreate:        '/specialty/create',
  specialtyUpdate:        '/specialty/update',
  branch:                 '/branch',
  branchCreate:           '/branch/create',
  branchUpdate:           '/branch/update',
  appointmentStatus:      '/appointment-status',
  appointmentStatusCreate:'/appointment-status/create',
  appointmentStatusUpdate:'/appointment-status/update',
  laboratory:             '/laboratory',
  laboratoryCreate:       '/laboratory/create',
  laboratoryUpdate:       '/laboratory/update',
  labExam:                '/lab-exam',
  labExamCreate:          '/lab-exam/create',
  labExamUpdate:          '/lab-exam/update',
  medicine:               '/medicine',
  medicineCreate:         '/medicine/create',
  medicineUpdate:         '/medicine/update',
  appointment:            '/appointment',
  appointmentCreate:      '/appointment/create',
  appointmentUpdate:      '/appointment/update',
  reception:              '/reception',
  paymentOnline:          '/payment/online',
  paymentCash:            '/payment/cash',
  vitalSign:              '/vital-sign',
  vitalSignCreate:        '/vital-sign/create',
  medicalConsultation:    '/medical-consultation',
  medicalConsultationCreate: '/medical-consultation/create',
  medicalConsultationUpdate: '/medical-consultation/update',
  labOrder:               '/lab-order',
  labOrderCreate:         '/lab-order/create',
  labOrderDetail:         '/lab-order/detail',
  prescription:           '/prescription',
  prescriptionCreate:     '/prescription/create',
  dispense:               '/dispense',
  dispenseCreate:         '/dispense/create',
  notificationLog:        '/notification-log',
  rolOperation:           '/rol-operation',
};
```

Route registration in `PublicRoutes.tsx` follows the same pattern as existing routes, wrapping each page in `<ProtectedPublic>`. Update routes use `/:id` suffix.

---
