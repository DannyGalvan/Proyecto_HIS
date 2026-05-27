# Implementation Plan: Unit & Integration Test Coverage

## Overview

This plan establishes a comprehensive test suite for the Hospital Information System (HIS) covering both the .NET 8 backend (xUnit, Moq, FluentAssertions, FsCheck) and the React + TypeScript frontend (Vitest, Testing Library, MSW, fast-check). The implementation is structured to build infrastructure first, then unit tests for isolated components, followed by integration tests, property-based tests, and finally CI/CD coverage enforcement.

## Tasks

- [x] 1. Set up backend test project infrastructure
  - [x] 1.1 Create Hospital.Server.Tests xUnit project with required NuGet packages
    - Create `Hospital.Server.Tests/Hospital.Server.Tests.csproj` targeting net8.0
    - Add project reference to `Hospital.Server`
    - Add NuGet packages: xUnit (2.9.x), xunit.runner.visualstudio, Moq (4.20.x), FluentAssertions (7.x), Microsoft.EntityFrameworkCore.InMemory (8.0.x), Microsoft.AspNetCore.Mvc.Testing (8.0.x), coverlet.collector (6.x), FsCheck.Xunit (3.x)
    - Add the test project to `Hospital.sln`
    - Configure coverlet with Cobertura output format, 90% threshold, and exclusions for Migrations, obj, bin, and Designer.cs files
    - _Requirements: 1.1, 1.2, 1.5, 13.1, 13.3_

  - [x] 1.2 Create TestBase class and test data factories
    - Create `Hospital.Server.Tests/Infrastructure/TestBase.cs` with in-memory database per test (unique name via Guid.NewGuid()) and IDisposable pattern
    - Create `Hospital.Server.Tests/Infrastructure/TestDataFactory.cs` with factory methods for User, Appointment, Medicine, Payment, DoctorEvent, DoctorTask, MedicalConsultation, LabOrder, Prescription, Dispense, InventoryMovement entities
    - _Requirements: 1.3_

  - [x] 1.3 Create HospitalWebApplicationFactory and TestAuthHandler
    - Create `Hospital.Server.Tests/Infrastructure/HospitalWebApplicationFactory.cs` replacing production DB with in-memory and configuring test authentication scheme
    - Create `Hospital.Server.Tests/Infrastructure/TestAuthHandler.cs` generating ClaimsPrincipal with NameIdentifier, Email, Name, RoleName, and configurable OperationKey claims
    - Create `Hospital.Server.Tests/Infrastructure/TestAuthOptions.cs` for configurable operation keys
    - Include `WithOperationKeys` helper method for per-test policy authorization scenarios
    - _Requirements: 1.4, 1.6_

- [x] 2. Set up frontend test infrastructure
  - [x] 2.1 Configure Vitest with jsdom, coverage, and path aliases
    - Update or create Vitest configuration with jsdom environment, v8 coverage provider, lcov + text reporters, 90% line threshold, and exclusions for vite.config.ts, tailwind.config.*, *.d.ts, test-setup.*, node_modules
    - Ensure `vite-tsconfig-paths` plugin resolves `@/` to `./src`
    - Add `test` and `test:coverage` scripts to package.json
    - _Requirements: 2.1, 2.4, 13.2, 13.4_

  - [x] 2.2 Create test setup file and install testing dependencies
    - Install dev dependencies: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, msw, @vitest/coverage-v8
    - Create `src/test-setup.ts` importing `@testing-library/jest-dom/vitest` matchers, mocking localStorage and matchMedia
    - Reference setup file in Vitest `setupFiles` array
    - _Requirements: 2.2, 2.3_

  - [x] 2.3 Create MSW server setup and frontend test utilities
    - Create `src/test-utils/server.ts` exporting a configured `setupServer` instance
    - Create `src/test-utils/factories.ts` with mock data factories for User, Appointment, Payment, Medicine, MedicalConsultation
    - Create `src/test-utils/render.ts` with custom render wrapper providing necessary providers (QueryClient, etc.)
    - _Requirements: 2.5_

- [x] 3. Checkpoint - Verify test infrastructure
  - Ensure `dotnet test` runs successfully with zero tests (project compiles), ensure `npm run test -- --run` executes without errors. Ask the user if questions arise.

- [x] 4. Implement EntityService unit tests
  - [x] 4.1 Write EntityService Create and validation failure tests
    - Test valid create: verify "Create" keyed validator invoked, entity mapped, CreatedAt set to UtcNow, UpdatedAt null, UpdatedBy null, BeforeCreate/AfterCreate interceptors called within transaction, entity persisted, response Success=true
    - Test create validation failure: verify response Success=false, Message="Validation failed", Errors contains ValidationFailure list, Data=null, SaveChanges not called
    - _Requirements: 3.1, 3.2_

  - [x] 4.2 Write EntityService Update and PartialUpdate tests
    - Test valid update: verify "Update" keyed validator invoked, entity retrieved by Id, non-null properties applied (skipping Id, CreatedAt, CreatedBy, Password), UpdatedAt set to UtcNow, CreatedAt preserved, BeforeUpdate/AfterUpdate interceptors called, response Success=true
    - Test update non-existent entity: verify response Success=false, Errors contains ValidationFailure with PropertyName "Id"
    - Test valid partial update: verify "Partial" keyed validator invoked, only non-null/non-zero properties applied, UpdatedAt set, CreatedAt preserved, response Success=true
    - Test partial update non-existent entity: verify response Success=false, Errors with PropertyName "Id"
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [x] 4.3 Write EntityService Delete and GetAll tests
    - Test valid delete: verify Util.HasValidId called, entity retrieved, State set to 0, UpdatedBy set, UpdatedAt set, changes persisted, response Success=true
    - Test delete with invalid ID (null, zero, negative): verify response Success=false, Message="Invalid Id", Errors with PropertyName "Id"
    - Test GetAll with filters: verify State!=0 filter applied, filter expression via IFilterTranslator applied, results ordered by CreatedAt descending, soft-deleted records excluded
    - Test GetAll with pagination: verify skip/take logic, TotalResults correct when includeTotal=true
    - _Requirements: 3.7, 3.8, 3.9, 3.10_

  - [x] 4.4 Write property tests for EntityService audit invariants
    - **Property 6: EntityService Create preserves audit invariants**
    - **Property 7: EntityService Update preserves CreatedAt**
    - **Property 8: EntityService GetAll excludes soft-deleted records**
    - **Property 9: EntityService pagination correctness**
    - **Validates: Requirements 3.1, 3.3, 3.5, 3.9, 3.10**

- [x] 5. Implement FilterTranslator unit tests
  - [x] 5.1 Write FilterTranslator operator tests (eq, ne, like, in, notin, gt, lt, gte, lte)
    - Test "Field:eq:value" produces Expression.Equal
    - Test "Field:ne:value" produces Expression.NotEqual
    - Test "Field:like:value" produces string.Contains expression
    - Test "Field:in:val1,val2,val3" produces Enumerable.Contains
    - Test "Field:notin:val1,val2,val3" produces negated Enumerable.Contains
    - Test "Field:gt:value", "Field:lt:value", "Field:gte:value", "Field:lte:value" produce correct comparison expressions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 4.10_

  - [x] 5.2 Write FilterTranslator combinator, nested property, and edge case tests
    - Test AND/OR combinators: verify AND binds tighter than OR
    - Test dot-separated nested property path (e.g., "Rol.Name:eq:Admin") navigates using Expression.PropertyOrField
    - Test unsupported operator throws ArgumentException
    - Test null/empty filter returns lambda evaluating to true
    - _Requirements: 4.5, 4.6, 4.8, 4.9_

  - [x] 5.3 Write property tests for FilterTranslator
    - **Property 1: FilterTranslator operator correctness**
    - **Property 2: FilterTranslator AND/OR precedence**
    - **Property 3: FilterTranslator null/empty identity**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 4.9, 4.10**

- [x] 6. Implement AppointmentStateMachine unit tests
  - [x] 6.1 Write AppointmentStateMachine CanTransition and TransitionAsync tests
    - Test all valid transition pairs (minimum 18) return true from CanTransition
    - Test invalid transition pairs return false
    - Test terminal states (STATUS_ATENCION_FINAL, STATUS_NO_ASISTIO, STATUS_CANCELADA) return false for all 12 targets
    - Test all 12 status constants have entries in transitions map
    - Test TransitionAsync with valid transition on active appointment: verify AppointmentStatusId updated, UpdatedAt/UpdatedBy set, SaveChangesAsync called once
    - Test TransitionAsync for non-existent/inactive appointment: verify returns (false, "Cita no encontrada"), SaveChangesAsync not called
    - Test TransitionAsync with invalid transition: verify returns (false, "Transición no permitida..."), AppointmentStatusId unchanged
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 6.2 Write property tests for AppointmentStateMachine
    - **Property 4: AppointmentStateMachine invalid transitions are rejected**
    - **Property 5: AppointmentStateMachine valid transitions succeed**
    - **Validates: Requirements 5.2, 5.3, 5.5, 5.7**

- [x] 7. Implement FluentValidation validator tests
  - [x] 7.1 Write base validator tests (Create, Update, Partial patterns)
    - Test CreateValidator passes with all required fields and Id=null
    - Test CreateValidator fails with non-null Id: "El Id No debes mandarlo al crear una nueva entidad"
    - Test CreateValidator fails with null/empty CreatedBy: "El Usuario creador no puede ser nulo/vacío"
    - Test UpdateValidator fails without Id: "El Id no puede ser nulo/vacío"
    - Test UpdateValidator fails with null/empty UpdatedBy: "El Usuario actualizador no puede ser nulo/vacío"
    - Test PartialUpdateValidator passes with only Id and UpdatedBy
    - Test PartialUpdateValidator fails with non-null CreatedBy: "El Usuario creador no puede ser modificado"
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 7.2 Write entity-specific validator tests (User, Appointment, Medicine, Payment)
    - Test UserValidator entity-specific rules (email format, name length, etc.)
    - Test AppointmentValidator entity-specific rules (date validation, required fields)
    - Test MedicineValidator entity-specific rules (name, price constraints)
    - Test PaymentValidator entity-specific rules (amount > 0, payment method)
    - _Requirements: 6.8_

- [x] 8. Implement AuthService unit tests
  - [x] 8.1 Write AuthService authentication and token tests
    - Test valid credentials return success with JWT containing NameIdentifier, Email, Name, Operator, RoleName, Role claims
    - Test invalid credentials return failure with "Usuario y/o contraseña invalidos"
    - Test duplicate username/email registration returns failure
    - Test JWT token generation includes all required claims (NameIdentifier, Email, Name, Hash, Operator, RoleName, Role, OperationKey)
    - _Requirements: 7.1, 7.2, 7.3, 14.6_

  - [x] 8.2 Write AuthService password management tests
    - Test ChangePassword with valid recovery token and matching passwords: password updated, token cleared, Reset=false
    - Test ManualChangePassword with incorrect current password returns failure
    - Test ValidateToken with expired token (>15 min) returns failure
    - Test ChangePassword with same password as current returns failure
    - Test ChangePassword with non-existent recovery token returns failure
    - Test ValidateToken with non-matching token returns failure
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [x] 9. Checkpoint - Verify backend unit tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Entity Interceptor unit tests
  - [x] 10.1 Write Appointment interceptor tests
    - Test AppointmentBeforeCreateInterceptor sets AppointmentStatusId to STATUS_PENDIENTE_PAGO (1)
    - Test AppointmentBeforeCreateInterceptor fails when appointment overlaps with active DoctorEvent
    - Test AppointmentAfterCreateNotifyDoctorInterceptor calls ISendMail.SendWithTemplate and creates NotificationLog
    - _Requirements: 16.1, 16.2, 16.26_

  - [x] 10.2 Write User interceptor tests
    - Test UserBeforeCreateInterceptor hashes non-empty password with BCrypt
    - Test UserBeforeCreateInterceptor fails with null/empty password
    - Test UserBeforeUpdateInterceptor hashes non-empty password
    - Test UserBeforeUpdateInterceptor preserves password when null/empty in request
    - _Requirements: 16.3, 16.4, 16.5, 16.6_

  - [x] 10.3 Write InventoryMovement and Dispense interceptor tests
    - Test entry movement types (0,1,4): PreviousStock, NewStock=PreviousStock+Quantity, TotalCost=UnitCost*Quantity
    - Test exit movement types (2,3,5,6) with insufficient stock: response.Success=false
    - Test exit movement types with sufficient stock: NewStock=PreviousStock-Quantity, CurrentStock updated
    - Test DispenseItemBeforeCreateInterceptor sets UnitPrice from Medicine.DefaultPrice
    - Test DispenseAfterCreateInterceptor calls TransitionAsync with STATUS_FARMACIA and recalculates TotalAmount
    - Test DispenseAfterStatusChangeInterceptor creates InventoryMovements when status transitions to 2
    - Test DispenseAfterStatusChangeInterceptor does nothing when status was already 2
    - _Requirements: 16.7, 16.8, 16.9, 16.10, 16.23, 16.24, 16.25_

  - [x] 10.4 Write MedicalConsultation, VitalSign, DoctorEvent, DoctorTask, LabOrder, and Prescription interceptor tests
    - Test MedicalConsultationAfterCreateInterceptor with ConsultationStatus=0 calls TransitionAsync with STATUS_CONSULTA_MEDICA (5)
    - Test MedicalConsultationAfterCreateInterceptor with ConsultationStatus=1 calls TransitionAsync with STATUS_EVALUADO (6)
    - Test VitalSignAfterCreateInterceptor calls TransitionAsync with STATUS_EN_ESPERA (4)
    - Test DoctorEventBeforeCreateInterceptor fails when StartDate >= EndDate
    - Test DoctorEventBeforeCreateInterceptor fails when time range overlaps existing active event
    - Test DoctorEventBeforeCreateInterceptor fails when DoctorId != CreatedBy
    - Test DoctorTaskBeforeCreateInterceptor passes when DoctorId == CreatedBy
    - Test DoctorTaskBeforeCreateInterceptor fails when DoctorId != CreatedBy
    - Test LabOrderBeforeCreateInterceptor passes when consultation has ConsultationStatus=1
    - Test LabOrderBeforeCreateInterceptor fails when ConsultationStatus != 1
    - Test PrescriptionBeforeCreateInterceptor passes when consultation has ConsultationStatus=1
    - Test PrescriptionBeforeCreateInterceptor fails when ConsultationStatus != 1
    - Test DoctorEventReminderRecalculationInterceptor cancels existing NotificationLog entries
    - Test DoctorTaskReminderRecalculationInterceptor cancels existing NotificationLog entries
    - _Requirements: 16.11, 16.12, 16.13, 16.14, 16.15, 16.16, 16.17, 16.18, 16.19, 16.20, 16.21, 16.22, 16.27, 16.28_

- [x] 11. Implement CrudController integration tests
  - [x] 11.1 Write CrudController CRUD endpoint integration tests
    - Test authenticated GET with pagination: verify 200, Response with Success=true, Data list, TotalResults
    - Test authenticated POST with valid data: verify 200, Success=true, Data with assigned ID
    - Test unauthenticated request: verify 401 Unauthorized
    - Test PUT with invalid data: verify 400, Success=false, ValidationFailure list
    - Test DELETE: verify 200, Success=true, entity soft-deleted
    - Test PATCH with partial data: verify 200, modified fields updated, other fields unchanged
    - Test GET by ID for non-existent entity: verify 400, Success=false
    - Test request with insufficient permissions: verify 403 Forbidden
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 12. Implement OperationSyncService integration tests
  - [x] 12.1 Write OperationSyncService sync and idempotency tests
    - Test SyncAsync creates Module for each non-excluded controller with correct Name and State=1
    - Test SyncAsync creates Operation with OperationKey format "{Controller}.{Action}.{HttpMethod}"
    - Test excluded controller (ExcludeFromSync at class level) has no Module/Operations
    - Test excluded action (ExcludeFromSync at method level) has no Operation
    - Test AssignAllOperationsToAdminRoleAsync creates RolOperation for all active Operations linked to "SA" role
    - Test second SyncAsync execution produces no duplicates and same record count
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 13. Implement Security and Authorization integration tests
  - [x] 13.1 Write JWT and policy-based authorization tests
    - Test valid JWT with matching OperationKey returns 200
    - Test valid JWT without matching OperationKey returns 403
    - Test valid JWT with no OperationKey claims returns 403
    - Test expired JWT returns 401 with "Token-Expired" header
    - Test missing Authorization header returns 401
    - Test OperationAuthorizationHandler calls context.Succeed only when OperationKey claims contain requirement (case-insensitive)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.7_

- [x] 14. Implement SignalR AppointmentBookingHub integration tests
  - [x] 14.1 Write AppointmentBookingHub connection and slot locking tests
    - Test JoinSlotGroup adds client to group "doctor_{id}_date_{date}" and receives ActiveLocks event
    - Test LockSlot broadcasts SlotLocked event to group with SlotLockInfo payload
    - Test LockSlot on already-locked slot sends SlotLockRejected only to caller
    - Test ReleaseSlot broadcasts SlotReleased event to group
    - Test client disconnect releases all held locks and broadcasts SlotReleased events
    - Test LockSlot while holding another lock releases previous slot first
    - Test unauthenticated connection is rejected
    - Test ReleaseSlot for slot not held by client does not broadcast
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

- [x] 15. Checkpoint - Verify all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement frontend utility function tests
  - [x] 16.1 Write utility function unit tests (luhnCheck, isCuiValid, formatDate, calculateChange, formatCurrency, formatLocalDateTime)
    - Test luhnCheck with valid 13-19 digit card numbers returns true
    - Test luhnCheck with invalid inputs (wrong length, bad checksum, non-digits) returns false
    - Test isCuiValid with valid 13-digit CUI (correct dept, municipality, check digit) returns true
    - Test isCuiValid with invalid CUI (bad dept, bad municipality, wrong check digit, wrong length, null) returns false
    - Test formatDate with valid ISO string returns "dd/MM/yyyy" in es-GT locale
    - Test formatDate with null/undefined returns "—", with unparseable returns original string
    - Test formatLocalDateTime returns "yyyy-MM-ddTHH:mm:ss" with zero-padded local components
    - Test calculateChange returns (amountReceived - amount) rounded to 2 decimal places
    - Test formatCurrency returns "Q " followed by amount with 2 decimal places
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [x] 16.2 Write property tests for frontend utility functions
    - **Property 10: Luhn check correctness**
    - **Property 11: CUI validation correctness**
    - **Property 12: calculateChange avoids floating-point drift**
    - **Property 13: formatCurrency output format**
    - **Property 14: formatLocalDateTime output format**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.7, 10.8, 10.9**

- [x] 17. Implement frontend Zod validation schema tests
  - [x] 17.1 Write Zod schema unit tests (login, register, appointment, payment)
    - Test loginSchema passes with valid userName (min 1) and password (min 6)
    - Test loginSchema fails with empty userName or short password with correct messages
    - Test registerSchema passes with valid name, CUI, userName, password, email, number
    - Test registerSchema fails with invalid CUI: "El número de DPI/CUI no es válido..."
    - Test appointmentSchema passes with all required fields and reason (10-2000 chars)
    - Test appointmentSchema fails with short reason: "El motivo debe tener al menos 10 caracteres"
    - Test paymentSchema passes with amount > 0.01, required fields, and idempotencyKey
    - Test paymentSchema fails with invalid cardLastFourDigits: "Deben ser exactamente 4 dígitos"
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [x] 17.2 Write property tests for Zod schema round-trip validity
    - **Property 15: Zod schema round-trip validity**
    - **Validates: Requirements 11.1, 11.3, 11.5, 11.7**

- [x] 18. Implement frontend Zustand store tests
  - [x] 18.1 Write Zustand store unit tests (useAuthStore, useAppointmentStore, useErrorsStore)
    - Test useAuthStore signIn: verify authState populated, localStorage "@auth" set, setAuthorization called
    - Test useAuthStore logout: verify state reset to authInitialState, localStorage "@auth" removed, setAuthorization called with empty string
    - Test useAuthStore syncAuth: verify state populated from localStorage, setAuthorization called, loading transitions from true to false
    - Test useAppointmentStore setFilters: verify filters state updated with filter, page, pageSize
    - Test useErrorsStore setError/resetError: verify error state set and reset to null
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 19. Implement frontend critical page rendering tests
  - [x] 19.1 Write LoginPage and AppointmentPage rendering tests
    - Test LoginPage renders username input, password input, submit button "Iniciar Sesión", and form submission calls authenticateUser
    - Test AppointmentPage renders TableServer with columns Paciente, Médico, Especialidad, Fecha, Estado, Monto with mock data
    - _Requirements: 17.1, 17.2_

  - [x] 19.2 Write RoleDashboardPage, MedicalConsultationForm, PaymentPage, and CreatePrescriptionForm rendering tests
    - Test RoleDashboardPage renders role-specific title, StatCard KPIs, and QuickActionButtons
    - Test MedicalConsultationForm renders all fields and shows validation error on empty diagnosis
    - Test PaymentPage renders pending order with formatted amount and enabled "Cobrar" button
    - Test CreatePrescriptionForm renders medicine items, "Agregar" adds row, empty medicineName shows error
    - _Requirements: 17.3, 17.4, 17.5, 17.6_

- [x] 20. Checkpoint - Verify all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Set up CI/CD coverage enforcement
  - [x] 21.1 Create GitHub Actions workflow for PR coverage gate
    - Create `.github/workflows/test-coverage.yml` that runs on pull requests
    - Configure `dotnet test` step with coverage collection producing Cobertura XML
    - Configure `npm run test -- --run --coverage` step producing lcov report
    - Add step to parse both reports and post coverage summary as PR comment showing line coverage for each project
    - Add step to fail the check if either project is below 90% line coverage
    - _Requirements: 13.5, 13.6_

- [x] 22. Final checkpoint - Ensure all tests pass and coverage meets threshold
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (15 properties total)
- Unit tests validate specific examples and edge cases
- Backend uses C# with xUnit + Moq + FluentAssertions + FsCheck
- Frontend uses TypeScript with Vitest + Testing Library + MSW + fast-check
- All property-based tests run minimum 100 iterations per property

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2"] },
    { "id": 2, "tasks": ["2.3"] },
    { "id": 3, "tasks": ["4.1", "5.1", "6.1", "7.1", "8.1", "16.1", "17.1", "18.1"] },
    { "id": 4, "tasks": ["4.2", "5.2", "6.2", "7.2", "8.2", "10.1", "10.2", "16.2", "17.2", "19.1"] },
    { "id": 5, "tasks": ["4.3", "5.3", "10.3", "10.4", "19.2"] },
    { "id": 6, "tasks": ["4.4", "11.1", "12.1", "13.1", "14.1"] },
    { "id": 7, "tasks": ["21.1"] }
  ]
}
```
