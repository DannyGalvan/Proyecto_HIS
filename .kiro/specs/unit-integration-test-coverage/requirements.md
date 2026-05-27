# Requirements Document

## Introduction

This document defines the requirements for establishing a comprehensive test suite across the Hospital Information System (HIS) application to achieve at least 90% code coverage. The system consists of a .NET 8 backend (ASP.NET Core with Entity Framework Core, FluentValidation, Mapster, and JWT authentication) and a React + TypeScript frontend (Vite, Zustand, TanStack Query, Zod). Currently, no test projects exist. This initiative covers creating test infrastructure, unit tests, and integration tests for both backend and frontend.

## Glossary

- **Test_Infrastructure**: The set of test projects, configuration files, test utilities, mocks, and fixtures required to run automated tests
- **Unit_Test**: An automated test that verifies a single unit of code (function, method, class) in isolation from external dependencies
- **Integration_Test**: An automated test that verifies the interaction between multiple components, including database access and HTTP endpoints
- **Code_Coverage**: The percentage of source code lines executed during test runs, measured by coverage tools (coverlet for .NET, v8/istanbul for TypeScript)
- **EntityService**: The generic CRUD service (`EntityService<TEntity, TRequest, TId>`) that handles Create, Read, Update, PartialUpdate, and Delete operations
- **CrudController**: The generic controller (`CrudController<TEntity, TRequest, TResponse, TId>`) that exposes REST endpoints for CRUD operations
- **FilterTranslator**: A utility class that parses string-based filter expressions (e.g., `Name:like:John AND Age:gt:18`) into Entity Framework LINQ expressions
- **AppointmentStateMachine**: A service that enforces valid appointment status transitions using a predefined state graph
- **FluentValidation_Validators**: The three validator types (CreateValidator, UpdateValidator, PartialUpdateValidator) used for request validation
- **OperationSyncService**: A service that uses reflection to discover controllers/actions and synchronize them as modules/operations in the database
- **Frontend_Utilities**: Pure TypeScript functions (luhnCheck, isCuiValid, dateFormatter, calculateChange, formatCurrency) that perform domain logic without side effects
- **Zustand_Store**: A lightweight state management store used in the frontend for managing application state
- **WebApplicationFactory**: The ASP.NET Core test host that creates an in-memory test server for integration testing

## Requirements

### Requirement 1: Backend Test Project Infrastructure

**User Story:** As a developer, I want a properly configured xUnit test project for the .NET backend, so that I can write and run unit and integration tests with appropriate tooling.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL include an xUnit test project named `Hospital.Server.Tests` targeting net8.0, with a project reference to `Hospital.Server`, and referenced in the solution file `Hospital.sln`
2. THE Test_Infrastructure SHALL include NuGet packages for xUnit, Moq, FluentAssertions, Microsoft.EntityFrameworkCore.InMemory, Microsoft.AspNetCore.Mvc.Testing, and coverlet.collector
3. THE Test_Infrastructure SHALL include a base test class that creates a new in-memory database instance per test method and disposes the DbContext after each test to ensure isolation between tests
4. THE Test_Infrastructure SHALL include a custom WebApplicationFactory that replaces the production database with an in-memory database and configures a test authentication scheme that generates a JWT with claims for NameIdentifier, Email, Name, RoleName, and at least one OperationKey, allowing integration tests to simulate authenticated requests without an external identity provider
5. WHEN the `dotnet test` command is executed, THE Test_Infrastructure SHALL produce a code coverage report in Cobertura format, excluding the Migrations folder and auto-generated files from coverage calculations
6. THE Test_Infrastructure SHALL include a helper method in the custom WebApplicationFactory that allows individual tests to configure specific OperationKey claims to test policy-based authorization scenarios

### Requirement 2: Frontend Test Infrastructure

**User Story:** As a developer, I want a properly configured Vitest test environment for the React frontend, so that I can write and run unit and component tests with coverage reporting.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL include a Vitest configuration with jsdom environment, coverage provider (v8), and path alias resolution using the `vite-tsconfig-paths` plugin so that `@/` resolves to the `./src` directory
2. THE Test_Infrastructure SHALL include testing-library packages (@testing-library/react, @testing-library/jest-dom, @testing-library/user-event) as dev dependencies
3. THE Test_Infrastructure SHALL include a test setup file referenced in the Vitest configuration `setupFiles` array that imports `@testing-library/jest-dom/vitest` matchers and provides mocks for localStorage and matchMedia browser APIs
4. WHEN the `npm run test -- --coverage` command is executed, THE Test_Infrastructure SHALL produce a coverage report in both terminal summary and lcov format showing line, branch, and function coverage percentages
5. THE Test_Infrastructure SHALL include MSW (Mock Service Worker) as a dev dependency with a shared test server setup module that exports a configured `setupServer` instance for intercepting HTTP requests in frontend tests

### Requirement 3: EntityService Unit Tests

**User Story:** As a developer, I want comprehensive unit tests for the generic EntityService, so that I can verify CRUD operations work correctly with validation, mapping, and interceptors.

#### Acceptance Criteria

1. WHEN a valid create request is provided, THE Unit_Test SHALL verify that EntityService invokes the "Create" keyed validator, maps the request to an entity, sets CreatedAt to DateTime.UtcNow, sets UpdatedAt to null, sets UpdatedBy to null, executes BeforeCreate and AfterCreate interceptors within a transaction, persists the entity, and returns a response with Success equal to true and Data containing the created entity
2. WHEN a create request fails validation, THE Unit_Test SHALL verify that EntityService returns a response with Success equal to false, Message equal to "Validation failed", Errors containing the list of ValidationFailure objects, and Data equal to null without calling SaveChanges
3. WHEN a valid update request is provided for an existing entity, THE Unit_Test SHALL verify that EntityService invokes the "Update" keyed validator, retrieves the existing entity by Id, applies non-null property values from the request using Util.UpdateProperties (skipping Id, CreatedAt, CreatedBy, and Password), sets UpdatedAt to DateTime.UtcNow, preserves the original CreatedAt value, executes BeforeUpdate and AfterUpdate interceptors, and returns a response with Success equal to true
4. WHEN an update request targets a non-existent entity, THE Unit_Test SHALL verify that EntityService returns a response with Success equal to false and Errors containing a ValidationFailure with PropertyName "Id" and ErrorMessage indicating entity not found
5. WHEN a partial update request is provided for an existing entity, THE Unit_Test SHALL verify that EntityService invokes the "Partial" keyed validator, retrieves the existing entity by Id, applies only non-null and non-zero property values using Util.UpdateProperties, sets UpdatedAt to DateTime.UtcNow, preserves the original CreatedAt, and returns a response with Success equal to true
6. IF a partial update request targets a non-existent entity, THEN THE Unit_Test SHALL verify that EntityService returns a response with Success equal to false and Errors containing a ValidationFailure with PropertyName "Id" and ErrorMessage indicating entity not found
7. WHEN a delete request is provided with a valid ID, THE Unit_Test SHALL verify that EntityService validates the ID using Util.HasValidId, retrieves the entity by Id, sets State to 0, sets UpdatedBy to the deletedBy parameter, sets UpdatedAt, persists the changes, and returns a response with Success equal to true
8. IF a delete request is provided with an invalid ID (null, zero, or negative), THEN THE Unit_Test SHALL verify that EntityService returns a response with Success equal to false, Message equal to "Invalid Id", and Errors containing a ValidationFailure with PropertyName "Id"
9. WHEN GetAll is called with filters, THE Unit_Test SHALL verify that EntityService applies a State not equal to 0 filter, applies the provided filter expression via IFilterTranslator, orders results by CreatedAt descending, and excludes soft-deleted records from the returned Data
10. WHEN GetAll is called with pagination parameters (pageNumber and pageSize), THE Unit_Test SHALL verify that EntityService skips ((pageNumber - 1) * pageSize) records, returns at most pageSize records in Data, and sets TotalResults to the exact count when includeTotal is true or to an estimated count when includeTotal is false

### Requirement 4: FilterTranslator Unit Tests

**User Story:** As a developer, I want unit tests for the FilterTranslator, so that I can verify that filter string parsing produces correct LINQ expressions for all supported operators.

#### Acceptance Criteria

1. WHEN a filter string with format "Field:eq:value" is provided (e.g., "Name:eq:Admin"), THE Unit_Test SHALL verify that FilterTranslator.TranslateToEfFilter produces an Expression.Equal comparing the specified property to the converted value
2. WHEN a filter string with format "Field:like:value" is provided (e.g., "Name:like:free"), THE Unit_Test SHALL verify that FilterTranslator.TranslateToEfFilter produces an expression calling string.Contains on the specified property with the given value
3. WHEN a filter string with format "Field:in:val1,val2,val3" is provided (e.g., "Id:in:1,2,3"), THE Unit_Test SHALL verify that FilterTranslator.TranslateToEfFilter produces an Enumerable.Contains expression matching the property against the array of converted values
4. WHEN a filter string with format "Field:notin:val1,val2,val3" is provided (e.g., "Id:notin:4,5"), THE Unit_Test SHALL verify that FilterTranslator.TranslateToEfFilter produces a negated (Expression.Not) Enumerable.Contains expression
5. WHEN a filter string contains " AND " and " OR " combinators (e.g., "Name:eq:A OR Name:eq:B AND Age:gt:18"), THE Unit_Test SHALL verify that FilterTranslator splits by AND first and OR second, resulting in AND binding tighter than OR in the final expression tree
6. WHEN a filter string references a dot-separated nested property path (e.g., "Rol.Name:eq:Admin"), THE Unit_Test SHALL verify that FilterTranslator navigates each segment of the property path using Expression.PropertyOrField to produce the correct nested MemberExpression
7. WHEN a filter string contains comparison operators gt, lt, gte, or lte (e.g., "Age:gt:18", "Age:lte:65"), THE Unit_Test SHALL verify that FilterTranslator produces Expression.GreaterThan, Expression.LessThan, Expression.GreaterThanOrEqual, or Expression.LessThanOrEqual respectively
8. IF an unsupported operator string is provided (e.g., "Name:xyz:value"), THEN THE Unit_Test SHALL verify that FilterTranslator.TranslateToEfFilter throws an ArgumentException with a message containing the unsupported operator name
9. WHEN a null or empty filter string is provided, THE Unit_Test SHALL verify that FilterTranslator.TranslateToEfFilter returns a lambda expression that evaluates to true for any entity (i.e., no filtering applied)
10. WHEN a filter string with operator "ne" is provided (e.g., "Status:ne:Inactive"), THE Unit_Test SHALL verify that FilterTranslator.TranslateToEfFilter produces an Expression.NotEqual comparing the specified property to the converted value

### Requirement 5: AppointmentStateMachine Unit Tests

**User Story:** As a developer, I want unit tests for the AppointmentStateMachine, so that I can verify that only valid status transitions are allowed according to the defined state graph.

#### Acceptance Criteria

1. WHEN CanTransition is called with a valid from-to pair (e.g., STATUS_PENDIENTE_PAGO to STATUS_CONFIRMADA), THE Unit_Test SHALL verify that AppointmentStateMachine returns true for each edge defined in the _allowedTransitions map (minimum 18 valid pairs across 12 statuses)
2. WHEN CanTransition is called with an invalid from-to pair (e.g., STATUS_PENDIENTE_PAGO to STATUS_ATENCION_FINAL), THE Unit_Test SHALL verify that AppointmentStateMachine returns false
3. WHEN CanTransition is called from a terminal state (STATUS_ATENCION_FINAL, STATUS_NO_ASISTIO, STATUS_CANCELADA), THE Unit_Test SHALL verify that AppointmentStateMachine returns false for every one of the 12 defined status IDs as target
4. THE Unit_Test SHALL verify that all 12 defined status constants (STATUS_PENDIENTE_PAGO through STATUS_PACIENTE_PRESENTE) have an entry in the transitions map
5. WHEN TransitionAsync is called with a valid transition on an active appointment (State == 1), THE Unit_Test SHALL verify that the appointment's AppointmentStatusId is updated to the target status, UpdatedAt and UpdatedBy are set, and SaveChangesAsync is called exactly once
6. WHEN TransitionAsync is called for a non-existent appointment or an appointment with State != 1, THE Unit_Test SHALL verify that it returns (false, "Cita no encontrada") and SaveChangesAsync is not called
7. WHEN TransitionAsync is called with a from-to pair not present in _allowedTransitions, THE Unit_Test SHALL verify that it returns (false, "Transición no permitida: '{currentStatusName}' → '{targetStatusName}'") and the appointment's AppointmentStatusId remains unchanged

### Requirement 6: FluentValidation Validator Tests

**User Story:** As a developer, I want unit tests for the FluentValidation validators, so that I can verify that create, update, and partial update validations enforce the correct rules.

#### Acceptance Criteria

1. WHEN a CreateValidator receives a request with all required fields populated and Id set to null, THE Unit_Test SHALL verify that validation passes with no errors
2. WHEN a CreateValidator receives a request with a non-null Id, THE Unit_Test SHALL verify that validation fails with the error message "El Id No debes mandarlo al crear una nueva entidad"
3. WHEN a CreateValidator receives a request with CreatedBy null or empty, THE Unit_Test SHALL verify that validation fails with the error message "El Usuario creador no puede ser nulo" or "El Usuario creador no puede ser vacío"
4. WHEN an UpdateValidator receives a request without an Id (null or empty), THE Unit_Test SHALL verify that validation fails with the error message "El Id no puede ser nulo" or "El Id no puede ser vacío"
5. WHEN an UpdateValidator receives a request with UpdatedBy null or empty, THE Unit_Test SHALL verify that validation fails with the error message "El Usuario actualizador no puede ser nulo" or "El Usuario actualizador no puede ser vacío"
6. WHEN a PartialUpdateValidator receives a request with only Id and UpdatedBy populated, THE Unit_Test SHALL verify that validation passes (other fields are optional)
7. WHEN a PartialUpdateValidator receives a request with CreatedBy set to a non-null value, THE Unit_Test SHALL verify that validation fails with the error message "El Usuario creador no puede ser modificado"
8. THE Unit_Test SHALL cover validators for at least the User, Appointment, Medicine, and Payment entities to achieve representative coverage of entity-specific rules beyond the base validator rules

### Requirement 7: AuthService Unit Tests

**User Story:** As a developer, I want unit tests for the AuthService, so that I can verify authentication, registration, password management, and JWT token generation logic.

#### Acceptance Criteria

1. WHEN valid credentials are provided, THE Unit_Test SHALL verify that AuthService returns a success response with a valid JWT token containing the user's NameIdentifier, Email, Name, Operator (RolId), RoleName, and Role (operation IDs) claims
2. WHEN invalid credentials are provided, THE Unit_Test SHALL verify that AuthService returns a failure response with the generic message "Usuario y/o contraseña invalidos" without revealing whether the username or password was incorrect
3. WHEN a registration request is provided with a duplicate username or email, THE Unit_Test SHALL verify that AuthService returns a failure response with Success equal to false and a message indicating the user already exists
4. WHEN ChangePassword is called with a recovery token that exists in the database and Password equal to ConfirmPassword, THE Unit_Test SHALL verify that the password is updated to the new hashed value, the RecoveryToken is cleared to empty string, and the Reset flag is set to false
5. WHEN ManualChangePassword is called with a CurrentPassword that does not match the user's stored hashed password, THE Unit_Test SHALL verify that AuthService returns a failure response with Success equal to false
6. WHEN ValidateToken is called with a recovery token whose associated DateToken is more than 15 minutes before the current UTC time, THE Unit_Test SHALL verify that AuthService returns a failure response with Success equal to false
7. WHEN ChangePassword is called with a Password that is identical to the user's current password, THE Unit_Test SHALL verify that AuthService returns a failure response with Success equal to false indicating the new password must differ from the previous password
8. WHEN ChangePassword is called with a recovery token that does not exist in the database, THE Unit_Test SHALL verify that AuthService returns a failure response with Success equal to false indicating the token is not valid
9. WHEN ValidateToken is called with a recovery token that does not match any user in the database, THE Unit_Test SHALL verify that AuthService returns a failure response with Success equal to false

### Requirement 8: CrudController Integration Tests

**User Story:** As a developer, I want integration tests for the CrudController endpoints, so that I can verify the full HTTP request pipeline including routing, authorization, validation, and response mapping.

#### Acceptance Criteria

1. WHEN an authenticated GET request is made to a CRUD endpoint with PageNumber and PageSize query parameters, THE Integration_Test SHALL verify that the response status is 200, the body contains a Response object with Success equal to true, Data containing a list of response DTOs, and TotalResults reflecting the count when IncludeTotal is true
2. WHEN an authenticated POST request is made with valid data, THE Integration_Test SHALL verify that the response status is 200, the body contains a Response object with Success equal to true, and Data containing the created entity mapped to the response DTO including its assigned identifier
3. WHEN a request without a valid authentication token is made to a protected endpoint, THE Integration_Test SHALL verify that the response status is 401 Unauthorized
4. WHEN a PUT request is made with data that violates the UpdateValidator rules, THE Integration_Test SHALL verify that the response status is 400, the body contains a Response object with Success equal to false, and Data containing a list of ValidationFailure objects identifying the invalid fields
5. WHEN a DELETE request is made for an existing entity by its identifier, THE Integration_Test SHALL verify that the response status is 200, the body contains a Response object with Success equal to true, and the entity is marked as soft-deleted in the database
6. WHEN a PATCH request is made with partial data containing only a subset of fields, THE Integration_Test SHALL verify that the response status is 200, the modified fields in the persisted entity match the request values, and all other fields remain unchanged from their prior state
7. WHEN an authenticated GET request by identifier is made for an entity that does not exist, THE Integration_Test SHALL verify that the response status is 400 and the body contains a Response object with Success equal to false
8. WHEN a request is made by an authenticated user whose role lacks the required policy for the endpoint, THE Integration_Test SHALL verify that the response status is 403 Forbidden

### Requirement 9: OperationSyncService Integration Tests

**User Story:** As a developer, I want integration tests for the OperationSyncService, so that I can verify that controller discovery, module creation, and operation synchronization work correctly.

#### Acceptance Criteria

1. WHEN SyncAsync is executed, THE Integration_Test SHALL verify that for each non-excluded controller (without the ExcludeFromSync attribute) a Module entity exists in the database with Name matching the controller name and State equal to 1
2. WHEN SyncAsync is executed, THE Integration_Test SHALL verify that for each non-excluded action a corresponding Operation entity is created with OperationKey in the format "{ControllerName}.{ActionName}.{HttpMethod}", and with ControllerName, ActionName, HttpMethod, and RouteTemplate fields populated
3. WHEN a controller has the ExcludeFromSync attribute applied at class level, THE Integration_Test SHALL verify that no Module entity is created for that controller and no Operation entities reference it
4. WHEN an action method has the ExcludeFromSync attribute, THE Integration_Test SHALL verify that no Operation entity is created for that specific action
5. WHEN AssignAllOperationsToAdminRoleAsync is executed, THE Integration_Test SHALL verify that a RolOperation record with State equal to 1 exists for every Operation where State equals 1, linked to the role named "SA"
6. WHEN SyncAsync is executed a second time without changes to controllers, THE Integration_Test SHALL verify that the total count of Module and Operation records remains unchanged and no duplicate OperationKey values exist in the Operations table

### Requirement 10: Frontend Utility Function Tests

**User Story:** As a developer, I want unit tests for frontend utility functions, so that I can verify that pure domain logic functions produce correct results for all input cases.

#### Acceptance Criteria

1. WHEN luhnCheck is called with a valid card number string of 13 to 19 digits where the Luhn checksum modulo 10 equals zero, THE Unit_Test SHALL verify that it returns true
2. WHEN luhnCheck is called with a string that contains fewer than 13 digits, more than 19 digits, or digits whose Luhn checksum modulo 10 is not zero, THE Unit_Test SHALL verify that it returns false
3. WHEN isCuiValid is called with a valid 13-digit Guatemalan CUI where the department code is between 1 and 22, the municipality code is between 1 and the maximum for that department, and the check digit equals the sum-of-products modulo 11, THE Unit_Test SHALL verify that it returns true
4. WHEN isCuiValid is called with a CUI that has an invalid department code, an invalid municipality code, an incorrect check digit, a length other than 13 digits, or a null/undefined value, THE Unit_Test SHALL verify that it returns false
5. WHEN formatDate is called with a valid ISO date string, THE Unit_Test SHALL verify that it returns the date formatted as "dd/MM/yyyy" using the "es-GT" locale in the configured timezone (default "America/Guatemala")
6. IF formatDate is called with a null, undefined, or unparseable date string, THEN THE Unit_Test SHALL verify that it returns the original string when provided or the "—" character when the input is null or undefined
7. WHEN formatLocalDateTime is called with a Date object, THE Unit_Test SHALL verify that it returns a string in "yyyy-MM-ddTHH:mm:ss" format using zero-padded local time components without UTC conversion
8. WHEN calculateChange is called with amountReceived and amount as numeric values, THE Unit_Test SHALL verify that it returns (amountReceived - amount) rounded to 2 decimal places using integer arithmetic to avoid floating-point drift
9. WHEN formatCurrency is called with a numeric value, THE Unit_Test SHALL verify that it returns a string in the format "Q " followed by the amount with exactly 2 decimal places (e.g., input 150 returns "Q 150.00")

### Requirement 11: Frontend Zod Validation Schema Tests

**User Story:** As a developer, I want unit tests for frontend Zod validation schemas, so that I can verify that form validation rules match business requirements.

#### Acceptance Criteria

1. WHEN a valid login object with userName (min 1 char) and password (min 6 chars) is parsed against loginSchema, THE Unit_Test SHALL verify that safeParse succeeds and returns the typed LoginValidation object
2. WHEN a login object with empty userName or password shorter than 6 characters is parsed, THE Unit_Test SHALL verify that safeParse fails with the messages "El campo nombre de usuario es requerido" or "El password debe tener al menos 6 caracteres" respectively
3. WHEN a valid register object with name (10-100 chars), identificationDocument (valid 13-digit CUI), userName (8-9 chars), password (min 12 chars), email (valid format), and number (8 digits) is parsed against registerSchema, THE Unit_Test SHALL verify that safeParse succeeds
4. WHEN a register object with an invalid CUI (fails isCuiValid check) is parsed, THE Unit_Test SHALL verify that safeParse fails with the message "El número de DPI/CUI no es válido. Verifique que los dígitos sean correctos."
5. WHEN a valid appointment object with patientId, doctorId, specialtyId, branchId, appointmentStatusId, appointmentDate, and reason (10-2000 chars) is parsed against appointmentSchema, THE Unit_Test SHALL verify that safeParse succeeds
6. WHEN an appointment object with reason shorter than 10 characters is parsed, THE Unit_Test SHALL verify that safeParse fails with the message "El motivo debe tener al menos 10 caracteres"
7. WHEN a valid payment object with amount (> 0.01), paymentMethod, paymentType, paymentStatus, paymentDate, and idempotencyKey is parsed against paymentSchema, THE Unit_Test SHALL verify that safeParse succeeds
8. WHEN a payment object with cardLastFourDigits not matching exactly 4 digits is parsed, THE Unit_Test SHALL verify that safeParse fails with the message "Deben ser exactamente 4 dígitos"

### Requirement 12: Frontend Zustand Store Tests

**User Story:** As a developer, I want unit tests for Zustand stores, so that I can verify that state management logic (actions, selectors, state transitions) works correctly.

#### Acceptance Criteria

1. WHEN the useAuthStore signIn action is called with an InitialAuth object containing token, email, userName, name, userId, and operations, THE Unit_Test SHALL verify that authState contains the provided values, localStorage key "@auth" stores the serialized state, and setAuthorization is called with the provided token
2. WHEN the useAuthStore logout action is called, THE Unit_Test SHALL verify that authState resets to authInitialState (isLoggedIn: false, token: empty string, operations: empty array), localStorage key "@auth" is removed, and setAuthorization is called with an empty string
3. WHEN the useAuthStore syncAuth action is called and localStorage key "@auth" contains a valid serialized InitialAuth object, THE Unit_Test SHALL verify that authState is populated from the stored value, setAuthorization is called with the stored token, and loading transitions from true to false
4. WHEN the useAppointmentStore setFilters action is called with a ListFilter object, THE Unit_Test SHALL verify that the filters state is updated to match the provided filter, page, and pageSize values
5. WHEN the useErrorsStore setError action is called with an AppError object, THE Unit_Test SHALL verify that the error state equals the provided object, and WHEN resetError is called, THE Unit_Test SHALL verify that the error state returns to null
6. THE Unit_Test SHALL cover the useAuthStore, useAppointmentStore, and useErrorsStore with at least one test per public action exposed by each store

### Requirement 13: Code Coverage Threshold Enforcement

**User Story:** As a developer, I want automated coverage threshold enforcement, so that the test suite maintains at least 90% overall code coverage and prevents regressions.

#### Acceptance Criteria

1. THE Test_Infrastructure SHALL configure the backend coverage tool (coverlet) to fail the test run if overall line coverage drops below 90%
2. THE Test_Infrastructure SHALL configure the frontend coverage tool (v8) to fail the test run if overall line coverage drops below 90%
3. THE Test_Infrastructure SHALL exclude auto-generated files matching the patterns `**/Migrations/**`, `**/obj/**`, `**/bin/**`, and `**/*.Designer.cs` from backend coverage calculations
4. THE Test_Infrastructure SHALL exclude files matching `vite.config.ts`, `tailwind.config.*`, `**/*.d.ts`, `**/test-setup.*`, and `**/node_modules/**` from frontend coverage calculations
5. WHEN a pull request is created, THE Test_Infrastructure SHALL post a coverage summary as a PR comment showing line coverage percentage for the backend project and the frontend project, each labeled with its project name
6. IF the overall line coverage for either backend or frontend is below 90%, THEN THE Test_Infrastructure SHALL fail the pull request check with a status indicating which project is below the threshold

### Requirement 14: Security and Authorization Tests

**User Story:** As a developer, I want tests for the security and authorization system, so that I can verify that JWT validation, session management, and policy-based authorization work correctly.

#### Acceptance Criteria

1. WHEN a request contains a valid JWT that includes an OperationKey claim matching the endpoint's required operation key (format "Controller.Action.HttpMethod"), THE Integration_Test SHALL verify that the request returns HTTP 200 and the response body contains the expected data
2. WHEN a request contains a valid JWT with OperationKey claims that do not include the endpoint's required operation key, THE Integration_Test SHALL verify that the request returns HTTP 403 Forbidden
3. WHEN a request contains a valid JWT with no OperationKey claims at all, THE Integration_Test SHALL verify that the request returns HTTP 403 Forbidden
4. WHEN a request contains an expired JWT, THE Integration_Test SHALL verify that the request returns HTTP 401 Unauthorized and the response includes a "Token-Expired" header with value "true"
5. WHEN a request is sent without an Authorization header to an endpoint decorated with [Authorize], THE Integration_Test SHALL verify that the request returns HTTP 401 Unauthorized
6. THE Unit_Test SHALL verify that the JWT token generation includes all required claims: ClaimTypes.NameIdentifier (user ID), ClaimTypes.Email, ClaimTypes.Name, ClaimTypes.Hash (unique GUID), "Operator" (role ID), "RoleName", ClaimTypes.Role (one per operation ID), and "OperationKey" (one per operation key in format "Controller.Action.HttpMethod")
7. THE Unit_Test SHALL verify that the OperationAuthorizationHandler calls context.Succeed only when the user's OperationKey claims contain the requirement's OperationKey using case-insensitive comparison

### Requirement 15: SignalR AppointmentBookingHub Tests

**User Story:** As a developer, I want integration tests for the AppointmentBookingHub, so that I can verify that real-time slot locking, releasing, and group management work correctly over WebSocket connections.

#### Acceptance Criteria

1. WHEN an authenticated client calls JoinSlotGroup with a doctorId (long) and date (string in "yyyy-MM-dd" format), THE Integration_Test SHALL verify that the client is added to the group named "doctor_{doctorId}_date_{date}" and receives the current active locks via the "ActiveLocks" event as a list of SlotLockInfo objects containing DoctorId, Date, Time, and ExpiresAt fields
2. WHEN an authenticated client calls LockSlot with a doctorId, date ("yyyy-MM-dd"), and time ("HH:mm") for an available slot, THE Integration_Test SHALL verify that all clients in the corresponding group receive the "SlotLocked" event with a SlotLockInfo payload containing the DoctorId, Date, Time, and ExpiresAt fields within 5 seconds of the call
3. WHEN an authenticated client calls LockSlot with a slot that is already locked by another patient, THE Integration_Test SHALL verify that only the caller receives the "SlotLockRejected" event with a payload containing DoctorId, Date, Time, and a non-empty Reason string, and that no "SlotLocked" event is broadcast to the group
4. WHEN an authenticated client calls ReleaseSlot for a slot that the client currently holds, THE Integration_Test SHALL verify that all clients in the corresponding group receive the "SlotReleased" event with a SlotLockInfo payload containing the DoctorId, Date, and Time of the released slot
5. WHEN a client disconnects, THE Integration_Test SHALL verify that all locks held by that connection are released and a "SlotReleased" event is broadcast to each affected group (identified by "doctor_{doctorId}_date_{date}") for each lock that was held
6. WHEN a client calls LockSlot while already holding a lock for a different time slot within the same doctor and date group, THE Integration_Test SHALL verify that the group receives the "SlotReleased" event for the previous slot before receiving the "SlotLocked" event for the new slot, in that order
7. IF an unauthenticated client attempts to connect to the AppointmentBookingHub, THEN THE Integration_Test SHALL verify that the connection is rejected and no hub methods can be invoked
8. IF an authenticated client calls ReleaseSlot for a slot that is not locked by that client, THEN THE Integration_Test SHALL verify that no "SlotReleased" event is broadcast to the group

### Requirement 16: Entity Interceptor Unit Tests

**User Story:** As a developer, I want unit tests for all entity interceptors, so that I can verify that business rules enforced before and after CRUD operations work correctly.

#### Acceptance Criteria

1. WHEN AppointmentBeforeCreateInterceptor executes with a valid Appointment (response.Data not null), THE Unit_Test SHALL verify that AppointmentStatusId is set to STATUS_PENDIENTE_PAGO (1) regardless of the value provided in the request
2. WHEN AppointmentBeforeCreateInterceptor executes with a DoctorId assigned and the appointment's 30-minute window (AppointmentDate to AppointmentDate + 30 minutes) overlaps with an active DoctorEvent (State=1) for that doctor, THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "AppointmentDate"
3. WHEN UserBeforeCreateInterceptor executes with a non-empty request.Password, THE Unit_Test SHALL verify that response.Data.Password is set to a BCrypt hash of the original password value (verifiable via BCrypt.Verify)
4. WHEN UserBeforeCreateInterceptor executes with a null or empty request.Password, THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "Password"
5. WHEN UserBeforeUpdateInterceptor executes with a non-empty request.Password, THE Unit_Test SHALL verify that response.Data.Password is updated to a BCrypt hash of the new password value
6. WHEN UserBeforeUpdateInterceptor executes with a null or empty request.Password, THE Unit_Test SHALL verify that response.Data.Password remains unchanged from its original value
7. WHEN InventoryMovementBeforeCreateInterceptor executes with an entry movement type (0=Compra, 1=Devolución, 4=Ajuste Positivo), THE Unit_Test SHALL verify that PreviousStock equals the MedicineInventory.CurrentStock before the operation, NewStock equals PreviousStock + Quantity, and TotalCost equals UnitCost multiplied by Quantity
8. WHEN InventoryMovementBeforeCreateInterceptor executes with an exit movement type (2=Venta, 3=Reclamo, 5=Ajuste Negativo, 6=Despacho) and MedicineInventory.CurrentStock is less than the requested Quantity, THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "Quantity"
9. WHEN InventoryMovementBeforeCreateInterceptor executes with an exit movement type and MedicineInventory.CurrentStock is greater than or equal to the requested Quantity, THE Unit_Test SHALL verify that NewStock equals PreviousStock minus Quantity and MedicineInventory.CurrentStock is updated to NewStock
10. WHEN DispenseItemBeforeCreateInterceptor executes with a valid MedicineId referencing an active Medicine (State=1), THE Unit_Test SHALL verify that response.Data.UnitPrice is set to Medicine.DefaultPrice when DefaultPrice is greater than 0, or set to 0 when DefaultPrice is 0 or null
11. WHEN MedicalConsultationAfterCreateInterceptor executes with ConsultationStatus=0 (In Progress), THE Unit_Test SHALL verify that IAppointmentStateMachine.TransitionAsync is called with the target status STATUS_CONSULTA_MEDICA (5)
12. WHEN MedicalConsultationAfterCreateInterceptor executes with ConsultationStatus=1 (Completed), THE Unit_Test SHALL verify that IAppointmentStateMachine.TransitionAsync is called with the target status STATUS_EVALUADO (6)
13. WHEN VitalSignAfterCreateInterceptor executes with a successful response containing a valid AppointmentId, THE Unit_Test SHALL verify that IAppointmentStateMachine.TransitionAsync is called with the target status STATUS_EN_ESPERA (4)
14. WHEN DoctorEventBeforeCreateInterceptor executes with StartDate >= EndDate, THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "StartDate"
15. WHEN DoctorEventBeforeCreateInterceptor executes with a time range that overlaps an existing active DoctorEvent (State=1) for the same doctor, THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "StartDate" indicating overlap
16. WHEN DoctorEventBeforeCreateInterceptor executes with DoctorId different from CreatedBy (JWT user), THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "DoctorId"
17. WHEN DoctorTaskBeforeCreateInterceptor executes with DoctorId equal to CreatedBy, THE Unit_Test SHALL verify that response.Success is true and the entity passes through unchanged
18. WHEN DoctorTaskBeforeCreateInterceptor executes with DoctorId different from CreatedBy, THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "DoctorId"
19. WHEN LabOrderBeforeCreateInterceptor executes with a ConsultationId referencing an active MedicalConsultation (State=1) that has ConsultationStatus=1 (Completed), THE Unit_Test SHALL verify that response.Success is true and the entity passes through unchanged
20. IF LabOrderBeforeCreateInterceptor executes with a ConsultationId referencing a MedicalConsultation with ConsultationStatus != 1, THEN THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "ConsultationId"
21. WHEN PrescriptionBeforeCreateInterceptor executes with a ConsultationId referencing an active MedicalConsultation (State=1) that has ConsultationStatus=1 (Completed), THE Unit_Test SHALL verify that response.Success is true and the entity passes through unchanged
22. IF PrescriptionBeforeCreateInterceptor executes with a ConsultationId referencing a MedicalConsultation with ConsultationStatus != 1, THEN THE Unit_Test SHALL verify that response.Success is false and response.Errors contains a ValidationFailure on field "ConsultationId"
23. WHEN DispenseAfterCreateInterceptor executes with a valid PrescriptionId that resolves to an Appointment via Prescription → MedicalConsultation chain, THE Unit_Test SHALL verify that IAppointmentStateMachine.TransitionAsync is called with the target status STATUS_FARMACIA (8) and that TotalAmount is recalculated as the sum of (UnitPrice × Quantity) for all active DispenseItems (State=1)
24. WHEN DispenseAfterStatusChangeInterceptor executes and DispenseStatus transitions from a value other than 2 to 2 (Dispensed), THE Unit_Test SHALL verify that for each active DispenseItem an InventoryMovement of MovementType=6 (Despacho) is created and the corresponding MedicineInventory.CurrentStock is decremented by the item Quantity
25. IF DispenseAfterStatusChangeInterceptor executes and DispenseStatus was already 2 before the update, THEN THE Unit_Test SHALL verify that no InventoryMovement records are created
26. WHEN AppointmentAfterCreateNotifyDoctorInterceptor executes with a DoctorId assigned, THE Unit_Test SHALL verify that ISendMail.SendWithTemplate is called and a NotificationLog record is created with NotificationType=10 and RelatedEntityType="Appointment"
27. WHEN DoctorEventReminderRecalculationInterceptor executes after a DoctorEvent is created or updated, THE Unit_Test SHALL verify that existing NotificationLog entries with RelatedEntityType="DoctorEvent", matching RelatedEntityId, NotificationType in (11, 12), and Status=1 are updated to Status=0 (cancelled)
28. WHEN DoctorTaskReminderRecalculationInterceptor executes after a DoctorTask is created or updated, THE Unit_Test SHALL verify that existing NotificationLog entries with RelatedEntityType="DoctorTask", matching RelatedEntityId, and Status=1 are updated to Status=0 (cancelled)

### Requirement 17: Frontend Critical Page Rendering Tests

**User Story:** As a developer, I want component rendering tests for the most critical React pages, so that I can verify that key user interfaces render correctly with expected data and respond to user interactions.

#### Acceptance Criteria

1. WHEN the LoginPage component renders, THE Unit_Test SHALL verify that an input with id "admin-username", a password input with id "admin-password", and a submit button with text "Iniciar Sesión" are present, and that submitting the form with valid userName and password values calls the authenticateUser service exactly once with the provided credentials
2. WHEN the AppointmentPage component renders with at least 2 mock appointment records, THE Unit_Test SHALL verify that the TableServer displays rows containing the columns Paciente, Médico, Especialidad, Fecha, Estado, and Monto with values matching the provided mock data
3. WHEN the RoleDashboardPage component renders for an authenticated user whose token decodes to a configured role (Recepcionista, Cajero, Farmaceutico, or Laboratorista), THE Unit_Test SHALL verify that the role-specific title, KPI StatCard widgets matching the role's kpis configuration, and QuickActionButton items matching the role's quickActions configuration are displayed
4. WHEN the MedicalConsultationForm component renders with initial data containing appointmentId and doctorId, THE Unit_Test SHALL verify that the fields reasonForVisit, clinicalFindings, diagnosis, diagnosisCie10Code, treatmentPlan, and notes are present, and that submitting the form with diagnosis left empty displays a validation error and does not call the createMedicalConsultation service
5. WHEN the PaymentPage component renders and a search returns at least 1 pending order, THE Unit_Test SHALL verify that the order's orderNumber, totalAmount formatted as "Q {amount}", and payment method options (cash and card) are displayed, and that the "Cobrar" action button is enabled for the pending order
6. WHEN the CreatePrescriptionForm component renders with a valid consultationId and doctorId, THE Unit_Test SHALL verify that at least 1 medicine item row is present with fields medicineName, dosage, frequency, and duration, that clicking the "Agregar" button adds a new item row incrementing the item count by 1, and that submitting with any item's medicineName empty displays the error message "Todos los medicamentos deben tener nombre, dosis, frecuencia y duracion." without calling the createPrescriptionWithItems service
