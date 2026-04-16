# Documento de Diseno - Flujo del Portal del Paciente (HIS)

## 1. Arquitectura General

### 1.1 Vision de Alto Nivel

El flujo del paciente externo se implementa como un subsistema separado dentro del mismo proyecto HIS, con las siguientes caracteristicas de separacion:

- **Backend**: Nuevo controlador PatientPortalController en Hospital.Server/Controllers/ con endpoints propios, sin contaminar los controladores internos existentes.
- **Frontend**: Nuevas rutas bajo el prefijo /portal/* con su propio layout, store de autenticacion y middleware de acceso, completamente separadas del panel administrativo.
- **Seguridad**: El rol "Paciente" (RolId = 7 segun seed) no tiene operaciones del panel administrativo asignadas. Un middleware en el frontend bloquea el acceso a rutas internas si el token pertenece a un paciente.

### 1.2 Flujo Completo del Paciente

`
Portal (/) --> Verificacion DPI --> [Existe] --> Login Portal --> Dashboard Paciente
                                --> [No existe] --> Registro --> Login Portal --> Dashboard Paciente

Dashboard Paciente --> Agendar Cita:
  1. Seleccionar Especialidad
  2. Seleccionar Medico (filtrado por especialidad)
  3. Seleccionar Fecha en calendario
  4. Seleccionar Slot disponible (30 min, 07:00-19:00)
  5. Ingresar motivo de consulta
  6. Confirmar --> Cita creada (estado: Pendiente) + Timer 5 min
  7. Formulario de pago con tarjeta
  8. Pago procesado --> Cita actualizada (estado: Pagada)
  9. Pantalla de confirmacion + Correo enviado
`


## 2. Backend - Cambios en Hospital.Server

### 2.1 Nuevo Controlador: PatientPortalController

**Archivo**: Hospital.Server/Controllers/PatientPortalController.cs

El controlador hereda de CommonController (no de CrudController) ya que expone endpoints especializados, no CRUD generico.

`csharp
[Route("api/v1/[controller]")]
[ApiController]
[ModuleInfo(
    DisplayName = "Portal Paciente",
    Description = "Endpoints publicos para el flujo del paciente externo",
    Icon = "bi-person-circle",
    Path = "portal",
    Order = 99,
    IsVisible = false  // No aparece en el menu administrativo
)]
public class PatientPortalController : CommonController
{
    // Inyecciones:
    // - DataContext _bd (acceso directo para queries especializadas)
    // - IEntityService<User, UserRequest, long> _userService
    // - IEntityService<Appointment, AppointmentRequest, long> _appointmentService
    // - IEntityService<Payment, PaymentRequest, long> _paymentService
    // - IEntityService<NotificationLog, NotificationLogRequest, long> _notificationService
    // - IPaymentGateway _paymentGateway
    // - ISendMail _sendMail
    // - IMapper _mapper
    // - IValidator<PatientRegisterRequest> _registerValidator
}
`

### 2.2 Endpoints del PatientPortalController

#### POST /api/v1/PatientPortal/register
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Request**: PatientRegisterRequest (nuevo DTO)
- **Logica**:
  1. Validar con CreatePatientValidator
  2. Verificar unicidad de DPI, email y username
  3. Obtener RolId del rol "Paciente" desde BD
  4. Hashear password con BCrypt
  5. Crear usuario con State = 1
  6. Retornar UserResponse sin password
- **Response**: Response<UserResponse>

#### GET /api/v1/PatientPortal/verify-dpi/{dpi}
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Logica**:
  1. Validar que DPI tenga exactamente 13 digitos numericos
  2. Buscar usuario activo con ese DPI
  3. Si existe, verificar si su rol es "Paciente"
- **Response**: Response<DpiVerificationResponse>
  `json
  { "exists": true, "hasPatientRole": true, "name": "Juan Perez" }
  `

#### GET /api/v1/PatientPortal/doctors
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: specialtyId (requerido)
- **Logica**: Buscar usuarios activos con rol "Medico" que tengan citas en la especialidad indicada. Como no hay tabla Doctor-Specialty directa, se retornan todos los medicos activos filtrados por especialidad via citas existentes o simplemente todos los medicos activos.
- **Response**: Response<List<DoctorResponse>>
  `json
  [{ "id": 3, "name": "Dr. Carlos Lopez", "specialtyId": 1 }]
  `

#### GET /api/v1/PatientPortal/availability
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: doctorId, date (yyyy-MM-dd)
- **Logica**:
  1. Parsear fecha
  2. Consultar citas activas del medico en esa fecha (State = 1)
  3. Retornar lista de DateTime de inicio de cada cita ocupada
- **Response**: Response<AvailabilityResponse>
  `json
  { "doctorId": 3, "date": "2026-05-01", "occupiedSlots": ["2026-05-01T09:00:00", "2026-05-01T10:30:00"] }
  `

#### POST /api/v1/PatientPortal/book
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: BookAppointmentRequest
- **Logica**:
  1. Validar que appointmentDate sea futura
  2. Verificar que el slot no este ocupado (conflicto de 30 min)
  3. Obtener AppointmentStatusId del estado "Pendiente"
  4. Crear cita con _appointmentService.Create()
  5. Retornar cita creada con ID para el pago
- **Response**: Response<AppointmentResponse>
- **Errores**: HTTP 409 si slot ocupado, HTTP 400 si fecha pasada

#### POST /api/v1/PatientPortal/pay
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: PatientPaymentRequest
- **Logica**:
  1. Verificar que la cita pertenece al paciente autenticado
  2. Verificar que la cita tiene estado "Pendiente"
  3. Verificar que no han pasado mas de 5 minutos desde la creacion (Reserva_Temporal)
  4. Verificar idempotency key no duplicada
  5. Procesar pago con _paymentGateway.ProcessPaymentAsync()
  6. Si exitoso: crear registro Payment, actualizar cita a "Pagada"
  7. Encolar notificacion de confirmacion por correo
  8. Registrar en NotificationLog
- **Response**: Response<PaymentConfirmationResponse>
- **Errores**: HTTP 409 idempotency duplicada, HTTP 410 reserva expirada

#### GET /api/v1/PatientPortal/my-appointments
- **Acceso**: [Authorize] (paciente autenticado)
- **Logica**: Retornar citas del paciente autenticado (GetUserId()) con Include de Specialty, Branch, AppointmentStatus, Doctor
- **Response**: Response<List<AppointmentResponse>>


## 2. Backend - Cambios en Hospital.Server

### 2.1 Nuevo Controlador: PatientPortalController

**Archivo**: Hospital.Server/Controllers/PatientPortalController.cs

El controlador hereda de CommonController (no de CrudController) ya que expone endpoints especializados, no CRUD generico.

`csharp
[Route("api/v1/[controller]")]
[ApiController]
[ModuleInfo(
    DisplayName = "Portal Paciente",
    Description = "Endpoints publicos para el flujo del paciente externo",
    Icon = "bi-person-circle",
    Path = "portal",
    Order = 99,
    IsVisible = false  // No aparece en el menu administrativo
)]
public class PatientPortalController : CommonController
{
    // Inyecciones:
    // - DataContext _bd (acceso directo para queries especializadas)
    // - IEntityService<User, UserRequest, long> _userService
    // - IEntityService<Appointment, AppointmentRequest, long> _appointmentService
    // - IEntityService<Payment, PaymentRequest, long> _paymentService
    // - IEntityService<NotificationLog, NotificationLogRequest, long> _notificationService
    // - IPaymentGateway _paymentGateway
    // - ISendMail _sendMail
    // - IMapper _mapper
    // - IValidator<PatientRegisterRequest> _registerValidator
}
`

### 2.2 Endpoints del PatientPortalController

#### POST /api/v1/PatientPortal/register
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Request**: PatientRegisterRequest (nuevo DTO)
- **Logica**:
  1. Validar con CreatePatientValidator
  2. Verificar unicidad de DPI, email y username
  3. Obtener RolId del rol "Paciente" desde BD
  4. Hashear password con BCrypt
  5. Crear usuario con State = 1
  6. Retornar UserResponse sin password
- **Response**: Response<UserResponse>

#### GET /api/v1/PatientPortal/verify-dpi/{dpi}
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Logica**:
  1. Validar que DPI tenga exactamente 13 digitos numericos
  2. Buscar usuario activo con ese DPI
  3. Si existe, verificar si su rol es "Paciente"
- **Response**: Response<DpiVerificationResponse>
  `json
  { "exists": true, "hasPatientRole": true, "name": "Juan Perez" }
  `

#### GET /api/v1/PatientPortal/doctors
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: specialtyId (requerido)
- **Logica**: Buscar usuarios activos con rol "Medico" que tengan citas en la especialidad indicada. Como no hay tabla Doctor-Specialty directa, se retornan todos los medicos activos filtrados por especialidad via citas existentes o simplemente todos los medicos activos.
- **Response**: Response<List<DoctorResponse>>
  `json
  [{ "id": 3, "name": "Dr. Carlos Lopez", "specialtyId": 1 }]
  `

#### GET /api/v1/PatientPortal/availability
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: doctorId, date (yyyy-MM-dd)
- **Logica**:
  1. Parsear fecha
  2. Consultar citas activas del medico en esa fecha (State = 1)
  3. Retornar lista de DateTime de inicio de cada cita ocupada
- **Response**: Response<AvailabilityResponse>
  `json
  { "doctorId": 3, "date": "2026-05-01", "occupiedSlots": ["2026-05-01T09:00:00", "2026-05-01T10:30:00"] }
  `

#### POST /api/v1/PatientPortal/book
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: BookAppointmentRequest
- **Logica**:
  1. Validar que appointmentDate sea futura
  2. Verificar que el slot no este ocupado (conflicto de 30 min)
  3. Obtener AppointmentStatusId del estado "Pendiente"
  4. Crear cita con _appointmentService.Create()
  5. Retornar cita creada con ID para el pago
- **Response**: Response<AppointmentResponse>
- **Errores**: HTTP 409 si slot ocupado, HTTP 400 si fecha pasada

#### POST /api/v1/PatientPortal/pay
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: PatientPaymentRequest
- **Logica**:
  1. Verificar que la cita pertenece al paciente autenticado
  2. Verificar que la cita tiene estado "Pendiente"
  3. Verificar que no han pasado mas de 5 minutos desde la creacion (Reserva_Temporal)
  4. Verificar idempotency key no duplicada
  5. Procesar pago con _paymentGateway.ProcessPaymentAsync()
  6. Si exitoso: crear registro Payment, actualizar cita a "Pagada"
  7. Encolar notificacion de confirmacion por correo
  8. Registrar en NotificationLog
- **Response**: Response<PaymentConfirmationResponse>
- **Errores**: HTTP 409 idempotency duplicada, HTTP 410 reserva expirada

#### GET /api/v1/PatientPortal/my-appointments
- **Acceso**: [Authorize] (paciente autenticado)
- **Logica**: Retornar citas del paciente autenticado (GetUserId()) con Include de Specialty, Branch, AppointmentStatus, Doctor
- **Response**: Response<List<AppointmentResponse>>


## 2. Backend - Cambios en Hospital.Server

### 2.1 Nuevo Controlador: PatientPortalController

**Archivo**: Hospital.Server/Controllers/PatientPortalController.cs

El controlador hereda de CommonController (no de CrudController) ya que expone endpoints especializados, no CRUD generico.

`csharp
[Route("api/v1/[controller]")]
[ApiController]
[ModuleInfo(
    DisplayName = "Portal Paciente",
    Description = "Endpoints publicos para el flujo del paciente externo",
    Icon = "bi-person-circle",
    Path = "portal",
    Order = 99,
    IsVisible = false  // No aparece en el menu administrativo
)]
public class PatientPortalController : CommonController
{
    // Inyecciones:
    // - DataContext _bd (acceso directo para queries especializadas)
    // - IEntityService<User, UserRequest, long> _userService
    // - IEntityService<Appointment, AppointmentRequest, long> _appointmentService
    // - IEntityService<Payment, PaymentRequest, long> _paymentService
    // - IEntityService<NotificationLog, NotificationLogRequest, long> _notificationService
    // - IPaymentGateway _paymentGateway
    // - ISendMail _sendMail
    // - IMapper _mapper
    // - IValidator<PatientRegisterRequest> _registerValidator
}
`

### 2.2 Endpoints del PatientPortalController

#### POST /api/v1/PatientPortal/register
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Request**: PatientRegisterRequest (nuevo DTO)
- **Logica**:
  1. Validar con CreatePatientValidator
  2. Verificar unicidad de DPI, email y username
  3. Obtener RolId del rol "Paciente" desde BD
  4. Hashear password con BCrypt
  5. Crear usuario con State = 1
  6. Retornar UserResponse sin password
- **Response**: Response<UserResponse>

#### GET /api/v1/PatientPortal/verify-dpi/{dpi}
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Logica**:
  1. Validar que DPI tenga exactamente 13 digitos numericos
  2. Buscar usuario activo con ese DPI
  3. Si existe, verificar si su rol es "Paciente"
- **Response**: Response<DpiVerificationResponse>
  `json
  { "exists": true, "hasPatientRole": true, "name": "Juan Perez" }
  `

#### GET /api/v1/PatientPortal/doctors
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: specialtyId (requerido)
- **Logica**: Buscar usuarios activos con rol "Medico" que tengan citas en la especialidad indicada. Como no hay tabla Doctor-Specialty directa, se retornan todos los medicos activos filtrados por especialidad via citas existentes o simplemente todos los medicos activos.
- **Response**: Response<List<DoctorResponse>>
  `json
  [{ "id": 3, "name": "Dr. Carlos Lopez", "specialtyId": 1 }]
  `

#### GET /api/v1/PatientPortal/availability
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: doctorId, date (yyyy-MM-dd)
- **Logica**:
  1. Parsear fecha
  2. Consultar citas activas del medico en esa fecha (State = 1)
  3. Retornar lista de DateTime de inicio de cada cita ocupada
- **Response**: Response<AvailabilityResponse>
  `json
  { "doctorId": 3, "date": "2026-05-01", "occupiedSlots": ["2026-05-01T09:00:00", "2026-05-01T10:30:00"] }
  `

#### POST /api/v1/PatientPortal/book
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: BookAppointmentRequest
- **Logica**:
  1. Validar que appointmentDate sea futura
  2. Verificar que el slot no este ocupado (conflicto de 30 min)
  3. Obtener AppointmentStatusId del estado "Pendiente"
  4. Crear cita con _appointmentService.Create()
  5. Retornar cita creada con ID para el pago
- **Response**: Response<AppointmentResponse>
- **Errores**: HTTP 409 si slot ocupado, HTTP 400 si fecha pasada

#### POST /api/v1/PatientPortal/pay
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: PatientPaymentRequest
- **Logica**:
  1. Verificar que la cita pertenece al paciente autenticado
  2. Verificar que la cita tiene estado "Pendiente"
  3. Verificar que no han pasado mas de 5 minutos desde la creacion (Reserva_Temporal)
  4. Verificar idempotency key no duplicada
  5. Procesar pago con _paymentGateway.ProcessPaymentAsync()
  6. Si exitoso: crear registro Payment, actualizar cita a "Pagada"
  7. Encolar notificacion de confirmacion por correo
  8. Registrar en NotificationLog
- **Response**: Response<PaymentConfirmationResponse>
- **Errores**: HTTP 409 idempotency duplicada, HTTP 410 reserva expirada

#### GET /api/v1/PatientPortal/my-appointments
- **Acceso**: [Authorize] (paciente autenticado)
- **Logica**: Retornar citas del paciente autenticado (GetUserId()) con Include de Specialty, Branch, AppointmentStatus, Doctor
- **Response**: Response<List<AppointmentResponse>>


## 2. Backend - Cambios en Hospital.Server

### 2.1 Nuevo Controlador: PatientPortalController

**Archivo**: Hospital.Server/Controllers/PatientPortalController.cs

El controlador hereda de CommonController (no de CrudController) ya que expone endpoints especializados, no CRUD generico.

`csharp
[Route("api/v1/[controller]")]
[ApiController]
[ModuleInfo(
    DisplayName = "Portal Paciente",
    Description = "Endpoints publicos para el flujo del paciente externo",
    Icon = "bi-person-circle",
    Path = "portal",
    Order = 99,
    IsVisible = false  // No aparece en el menu administrativo
)]
public class PatientPortalController : CommonController
{
    // Inyecciones:
    // - DataContext _bd (acceso directo para queries especializadas)
    // - IEntityService<User, UserRequest, long> _userService
    // - IEntityService<Appointment, AppointmentRequest, long> _appointmentService
    // - IEntityService<Payment, PaymentRequest, long> _paymentService
    // - IEntityService<NotificationLog, NotificationLogRequest, long> _notificationService
    // - IPaymentGateway _paymentGateway
    // - ISendMail _sendMail
    // - IMapper _mapper
    // - IValidator<PatientRegisterRequest> _registerValidator
}
`

### 2.2 Endpoints del PatientPortalController

#### POST /api/v1/PatientPortal/register
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Request**: PatientRegisterRequest (nuevo DTO)
- **Logica**:
  1. Validar con CreatePatientValidator
  2. Verificar unicidad de DPI, email y username
  3. Obtener RolId del rol "Paciente" desde BD
  4. Hashear password con BCrypt
  5. Crear usuario con State = 1
  6. Retornar UserResponse sin password
- **Response**: Response<UserResponse>

#### GET /api/v1/PatientPortal/verify-dpi/{dpi}
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Logica**:
  1. Validar que DPI tenga exactamente 13 digitos numericos
  2. Buscar usuario activo con ese DPI
  3. Si existe, verificar si su rol es "Paciente"
- **Response**: Response<DpiVerificationResponse>
  `json
  { "exists": true, "hasPatientRole": true, "name": "Juan Perez" }
  `

#### GET /api/v1/PatientPortal/doctors
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: specialtyId (requerido)
- **Logica**: Buscar usuarios activos con rol "Medico" que tengan citas en la especialidad indicada. Como no hay tabla Doctor-Specialty directa, se retornan todos los medicos activos filtrados por especialidad via citas existentes o simplemente todos los medicos activos.
- **Response**: Response<List<DoctorResponse>>
  `json
  [{ "id": 3, "name": "Dr. Carlos Lopez", "specialtyId": 1 }]
  `

#### GET /api/v1/PatientPortal/availability
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: doctorId, date (yyyy-MM-dd)
- **Logica**:
  1. Parsear fecha
  2. Consultar citas activas del medico en esa fecha (State = 1)
  3. Retornar lista de DateTime de inicio de cada cita ocupada
- **Response**: Response<AvailabilityResponse>
  `json
  { "doctorId": 3, "date": "2026-05-01", "occupiedSlots": ["2026-05-01T09:00:00", "2026-05-01T10:30:00"] }
  `

#### POST /api/v1/PatientPortal/book
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: BookAppointmentRequest
- **Logica**:
  1. Validar que appointmentDate sea futura
  2. Verificar que el slot no este ocupado (conflicto de 30 min)
  3. Obtener AppointmentStatusId del estado "Pendiente"
  4. Crear cita con _appointmentService.Create()
  5. Retornar cita creada con ID para el pago
- **Response**: Response<AppointmentResponse>
- **Errores**: HTTP 409 si slot ocupado, HTTP 400 si fecha pasada

#### POST /api/v1/PatientPortal/pay
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: PatientPaymentRequest
- **Logica**:
  1. Verificar que la cita pertenece al paciente autenticado
  2. Verificar que la cita tiene estado "Pendiente"
  3. Verificar que no han pasado mas de 5 minutos desde la creacion (Reserva_Temporal)
  4. Verificar idempotency key no duplicada
  5. Procesar pago con _paymentGateway.ProcessPaymentAsync()
  6. Si exitoso: crear registro Payment, actualizar cita a "Pagada"
  7. Encolar notificacion de confirmacion por correo
  8. Registrar en NotificationLog
- **Response**: Response<PaymentConfirmationResponse>
- **Errores**: HTTP 409 idempotency duplicada, HTTP 410 reserva expirada

#### GET /api/v1/PatientPortal/my-appointments
- **Acceso**: [Authorize] (paciente autenticado)
- **Logica**: Retornar citas del paciente autenticado (GetUserId()) con Include de Specialty, Branch, AppointmentStatus, Doctor
- **Response**: Response<List<AppointmentResponse>>


## 2. Backend - Cambios en Hospital.Server

### 2.1 Nuevo Controlador: PatientPortalController

**Archivo**: Hospital.Server/Controllers/PatientPortalController.cs

El controlador hereda de CommonController (no de CrudController) ya que expone endpoints especializados, no CRUD generico.

`csharp
[Route("api/v1/[controller]")]
[ApiController]
[ModuleInfo(
    DisplayName = "Portal Paciente",
    Description = "Endpoints publicos para el flujo del paciente externo",
    Icon = "bi-person-circle",
    Path = "portal",
    Order = 99,
    IsVisible = false  // No aparece en el menu administrativo
)]
public class PatientPortalController : CommonController
{
    // Inyecciones:
    // - DataContext _bd (acceso directo para queries especializadas)
    // - IEntityService<User, UserRequest, long> _userService
    // - IEntityService<Appointment, AppointmentRequest, long> _appointmentService
    // - IEntityService<Payment, PaymentRequest, long> _paymentService
    // - IEntityService<NotificationLog, NotificationLogRequest, long> _notificationService
    // - IPaymentGateway _paymentGateway
    // - ISendMail _sendMail
    // - IMapper _mapper
    // - IValidator<PatientRegisterRequest> _registerValidator
}
`

### 2.2 Endpoints del PatientPortalController

#### POST /api/v1/PatientPortal/register
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Request**: PatientRegisterRequest (nuevo DTO)
- **Logica**:
  1. Validar con CreatePatientValidator
  2. Verificar unicidad de DPI, email y username
  3. Obtener RolId del rol "Paciente" desde BD
  4. Hashear password con BCrypt
  5. Crear usuario con State = 1
  6. Retornar UserResponse sin password
- **Response**: Response<UserResponse>

#### GET /api/v1/PatientPortal/verify-dpi/{dpi}
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Logica**:
  1. Validar que DPI tenga exactamente 13 digitos numericos
  2. Buscar usuario activo con ese DPI
  3. Si existe, verificar si su rol es "Paciente"
- **Response**: Response<DpiVerificationResponse>
  `json
  { "exists": true, "hasPatientRole": true, "name": "Juan Perez" }
  `

#### GET /api/v1/PatientPortal/doctors
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: specialtyId (requerido)
- **Logica**: Buscar usuarios activos con rol "Medico" que tengan citas en la especialidad indicada. Como no hay tabla Doctor-Specialty directa, se retornan todos los medicos activos filtrados por especialidad via citas existentes o simplemente todos los medicos activos.
- **Response**: Response<List<DoctorResponse>>
  `json
  [{ "id": 3, "name": "Dr. Carlos Lopez", "specialtyId": 1 }]
  `

#### GET /api/v1/PatientPortal/availability
- **Acceso**: [AllowAnonymous] + [ExcludeFromSync]
- **Query params**: doctorId, date (yyyy-MM-dd)
- **Logica**:
  1. Parsear fecha
  2. Consultar citas activas del medico en esa fecha (State = 1)
  3. Retornar lista de DateTime de inicio de cada cita ocupada
- **Response**: Response<AvailabilityResponse>
  `json
  { "doctorId": 3, "date": "2026-05-01", "occupiedSlots": ["2026-05-01T09:00:00", "2026-05-01T10:30:00"] }
  `

#### POST /api/v1/PatientPortal/book
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: BookAppointmentRequest
- **Logica**:
  1. Validar que appointmentDate sea futura
  2. Verificar que el slot no este ocupado (conflicto de 30 min)
  3. Obtener AppointmentStatusId del estado "Pendiente"
  4. Crear cita con _appointmentService.Create()
  5. Retornar cita creada con ID para el pago
- **Response**: Response<AppointmentResponse>
- **Errores**: HTTP 409 si slot ocupado, HTTP 400 si fecha pasada

#### POST /api/v1/PatientPortal/pay
- **Acceso**: [Authorize] (paciente autenticado)
- **Request**: PatientPaymentRequest
- **Logica**:
  1. Verificar que la cita pertenece al paciente autenticado
  2. Verificar que la cita tiene estado "Pendiente"
  3. Verificar que no han pasado mas de 5 minutos desde la creacion (Reserva_Temporal)
  4. Verificar idempotency key no duplicada
  5. Procesar pago con _paymentGateway.ProcessPaymentAsync()
  6. Si exitoso: crear registro Payment, actualizar cita a "Pagada"
  7. Encolar notificacion de confirmacion por correo
  8. Registrar en NotificationLog
- **Response**: Response<PaymentConfirmationResponse>
- **Errores**: HTTP 409 idempotency duplicada, HTTP 410 reserva expirada

#### GET /api/v1/PatientPortal/my-appointments
- **Acceso**: [Authorize] (paciente autenticado)
- **Logica**: Retornar citas del paciente autenticado (GetUserId()) con Include de Specialty, Branch, AppointmentStatus, Doctor
- **Response**: Response<List<AppointmentResponse>>

## 3. Frontend - Cambios en hospital.client

### 3.1 Estructura de Rutas del Portal

Las rutas del portal del paciente se separan completamente del panel administrativo:

- /portal --> PortalPage (publico, sin auth)
- /portal/login --> PortalLoginPage (publico)
- /portal/register --> PortalRegisterPage (publico)
- /portal/dashboard --> PatientDashboardPage (requiere auth paciente)
- /portal/book --> BookAppointmentPage (requiere auth paciente)
- /portal/book/pay --> PaymentPage (requiere auth paciente)
- /portal/book/confirm --> ConfirmationPage (requiere auth paciente)
- /portal/appointments --> MyAppointmentsPage (requiere auth paciente)

Estas rutas se agregan en un nuevo archivo PortalRoutes.tsx y se montan en AppRoutes.tsx bajo el path /portal.

### 3.2 Nuevo Store: usePatientAuthStore

Archivo: hospital.client/src/stores/usePatientAuthStore.ts

Store separado del useAuthStore administrativo. Almacena el estado de autenticacion del paciente en localStorage bajo la clave @patient-auth.

Estado que maneja:
- isLoggedIn: boolean
- token: string
- userId: number
- name: string
- email: string
- userName: string

Acciones: signInPatient, logoutPatient, syncPatientAuth

Razon de separacion: El useAuthStore existente maneja el JWT del personal interno. Si un paciente inicia sesion en el portal, no debe contaminar el estado del panel administrativo ni viceversa.

### 3.3 Nuevo Middleware: ProtectedPatient

Archivo: hospital.client/src/routes/middlewares/ProtectedPatient.tsx

Redirige a /portal/login si el paciente no esta autenticado en el portal. Verifica usePatientAuthStore.isLoggedIn.

### 3.4 Nuevo Middleware: BlockAdminForPatient

Archivo: hospital.client/src/routes/middlewares/BlockAdminForPatient.tsx

Modifica ProtectedPublic para verificar que el usuario autenticado NO sea un paciente. Si el token del panel administrativo pertenece a un paciente, redirige a /portal/dashboard.

Alternativa mas simple: en useAuthorizationRoutes.tsx, verificar el claim de rol del token JWT. Si el rol es Paciente, redirigir a /portal/dashboard en lugar de mostrar el panel.

### 3.5 Nuevo Layout: PortalLayout

Archivo: hospital.client/src/containers/PortalLayout.tsx

Layout publico para el portal del paciente. Incluye:
- Navbar con logo, links de navegacion y botones de Login/Registro
- Footer con informacion de contacto
- Sin sidebar administrativo

### 3.6 Nuevo Servicio: patientPortalService

Archivo: hospital.client/src/services/patientPortalService.ts

Funciones exportadas:
- verifyDpi(dpi: string) --> GET /api/v1/PatientPortal/verify-dpi/{dpi}
- registerPatient(data) --> POST /api/v1/PatientPortal/register
- loginPatient(credentials) --> POST /api/v1/Auth (reutiliza endpoint existente)
- getDoctorsBySpecialty(specialtyId) --> GET /api/v1/PatientPortal/doctors?specialtyId=
- getDoctorAvailability(doctorId, date) --> GET /api/v1/PatientPortal/availability?doctorId=&date=
- bookAppointment(data) --> POST /api/v1/PatientPortal/book
- processPatientPayment(data) --> POST /api/v1/PatientPortal/pay
- getMyAppointments(page) --> GET /api/v1/PatientPortal/my-appointments

### 3.7 Componente: DynamicCalendar

Archivo: hospital.client/src/components/portal/DynamicCalendar.tsx
Libreria: react-calendar (npm install react-calendar)

Logica de slots:
- Horario de atencion: 07:00 - 19:00, intervalos de 30 minutos
- Genera todos los slots posibles del dia: [07:00, 07:30, 08:00, ..., 18:30]
- Al seleccionar fecha, llama getDoctorAvailability(doctorId, date)
- Filtra slots ocupados: un slot esta ocupado si su rango [inicio, inicio+30min) se solapa con alguna cita existente
- Filtra slots pasados: descarta slots cuya hora ya paso respecto al momento actual
- Muestra grid de botones: disponibles en verde, ocupados en gris deshabilitado

Props:
- doctorId: number
- onSlotSelected: (dateTime: Date) => void

### 3.8 Componente: ReservationTimer

Archivo: hospital.client/src/components/portal/ReservationTimer.tsx

Props:
- appointmentId: number
- createdAt: string (ISO string de cuando se creo la cita)
- onExpired: () => void

Logica:
- Calcula segundos restantes: 300 - (Date.now() - new Date(createdAt).getTime()) / 1000
- Actualiza cada segundo con setInterval
- Cuando llega a 0: llama onExpired() que cancela la cita via PATCH y redirige
- Muestra en formato MM:SS con color rojo cuando quedan menos de 60 segundos
- Muestra advertencia al intentar navegar fuera (beforeunload event)

### 3.9 Componente: PaymentForm

Archivo: hospital.client/src/components/portal/PaymentForm.tsx

Validaciones con Zod:
- Numero de tarjeta: 13-19 digitos + algoritmo de Luhn (ver utils/luhn.ts)
- Titular: 5-100 caracteres alfabeticos
- Expiracion: formato MM/AA, no vencida
- CVV: 3-4 digitos (enmascarado visualmente, nunca almacenado ni enviado al backend)

Seguridad:
- El numero de tarjeta se enmascara al salir del campo (solo muestra ultimos 4 digitos)
- El CVV nunca se envia al backend ni se almacena en el estado de React
- Se genera idempotencyKey = uuidv4() antes del submit
- Solo se envia al backend: cardLastFourDigits, idempotencyKey, paymentToken (simulado en mock)

### 3.10 Paginas del Portal

#### PortalPage (/portal)
- Hero section con informacion del hospital
- Seccion de especialidades (carga desde /api/v1/Specialty?Filters=State:eq:1)
- Seccion de sucursales (carga desde /api/v1/Branch?Filters=State:eq:1)
- Horarios de atencion estaticos
- Modal de verificacion de DPI (flujo CU-00): llama verify-dpi, redirige segun resultado
- Boton Agendar Cita abre el modal de DPI

#### PortalLoginPage (/portal/login)
- Formulario de login con username y password
- Usa el endpoint existente POST /api/v1/Auth
- Al autenticar, guarda en usePatientAuthStore (NO en useAuthStore)
- Redirige a /portal/dashboard
- Link a registro y recuperacion de contrasena

#### PortalRegisterPage (/portal/register)
- Formulario de registro de paciente externo
- Usa POST /api/v1/PatientPortal/register
- Validaciones Zod completas segun Requisito 1
- Al registrar exitosamente, redirige a /portal/login con mensaje de exito

#### PatientDashboardPage (/portal/dashboard)
- Saludo personalizado con nombre del paciente
- Boton principal Agendar Nueva Cita
- Resumen de proximas citas (max 3, carga desde my-appointments)
- Link a historial completo

#### BookAppointmentPage (/portal/book)
- Wizard de 4 pasos con indicador de progreso:
  Paso 1: Seleccion de especialidad (cards con icono y nombre)
  Paso 2: Seleccion de medico (lista con nombre, filtrado por especialidad)
  Paso 3: Seleccion de sucursal + DynamicCalendar (seleccion de fecha y slot)
  Paso 4: Motivo de consulta (10-2000 chars) + resumen de la cita + boton Confirmar
- Al confirmar: crea cita via POST /api/v1/PatientPortal/book
- Si exito: redirige a /portal/book/pay con appointmentId y createdAt en el estado
- Si conflicto (HTTP 409): muestra error y regresa al paso 3

#### PaymentPage (/portal/book/pay)
- Muestra resumen de la cita (medico, especialidad, fecha, monto)
- ReservationTimer visible con cuenta regresiva de 5 minutos
- PaymentForm con validaciones completas
- Al pagar exitosamente: redirige a /portal/book/confirm con datos del comprobante
- Si pago rechazado: muestra mensaje especifico sin cancelar el timer
- Si timer expira: cancela cita y redirige a /portal/book con mensaje

#### ConfirmationPage (/portal/book/confirm)
- Muestra comprobante: numero de transaccion, medico, especialidad, sucursal, fecha, monto
- Mensaje: Su cita ha sido confirmada. Se envio un correo a [email]
- Boton Volver al Portal
- Boton Ver Mis Citas

#### MyAppointmentsPage (/portal/appointments)
- Lista paginada de citas del paciente (10 por pagina)
- Badges de estado con colores (Pagada=verde, Pendiente=amarillo, Cancelada=rojo)
- Para citas Pendiente: muestra tiempo restante si aplica
- Ordenadas por fecha descendente

## 4. Segmentacion de Acceso

### 4.1 Backend: Sin Middleware Adicional Necesario

El backend ya tiene el sistema RequireOperation que valida operaciones por rol. Como el rol Paciente no tiene operaciones del panel administrativo asignadas, cualquier intento de acceder a endpoints internos con un token de paciente fallara con HTTP 403.

No se requiere middleware adicional en el backend. La seguridad ya esta garantizada por el sistema de permisos existente.

### 4.2 Frontend: Separacion de Contextos de Autenticacion

Problema actual: El useAuthStore y ProtectedPublic asumen que cualquier usuario autenticado puede acceder al panel administrativo.

Solucion:
1. usePatientAuthStore (nuevo): Maneja el JWT del paciente en localStorage[@patient-auth]. Completamente separado de useAuthStore que usa localStorage[@auth].
2. ProtectedPatient (nuevo): Middleware para rutas /portal/* autenticadas. Verifica usePatientAuthStore.isLoggedIn.
3. ProtectedPublic (modificacion minima): Agregar verificacion: si el usuario autenticado tiene rol Paciente (detectable desde el claim Operator del JWT), redirigir a /portal/dashboard.
4. Root.tsx (sin cambios): El layout del portal se maneja en PortalLayout, no en el Layout administrativo.

### 4.3 Deteccion del Rol desde el JWT

El JWT incluye el claim Operator con el RolId. Para detectar si es paciente en el frontend se puede decodificar el payload del JWT (base64) y comparar el RolId.

Mejora recomendada en el backend: Agregar el nombre del rol como claim en el JWT dentro de AuthService.GetToken():
  new Claim(RoleName, user.Rol!.Name)

Esto permite al frontend detectar el rol sin depender del ID hardcodeado.

## 5. Nuevas Dependencias del Frontend

### 5.1 Libreria de Calendario

Opcion recomendada: react-calendar (ligera, sin dependencias pesadas)
  npm install react-calendar
  npm install @types/react-calendar

### 5.2 UUID para Idempotency Key

  npm install uuid
  npm install @types/uuid

### 5.3 Validacion Luhn para Tarjetas

Implementacion propia en hospital.client/src/utils/luhn.ts
Algoritmo: suma de digitos con doble en posiciones impares (desde la derecha), resultado divisible por 10.

## 6. Modelo de Datos - Sin Cambios en BD

No se requieren migraciones de base de datos. El flujo del paciente reutiliza las entidades existentes:

| Entidad | Uso en flujo paciente |
|---|---|
| User | Paciente registrado con RolId del rol Paciente |
| Rol | Rol Paciente ya existe en seed |
| Appointment | Cita creada por el paciente |
| Payment | Pago de la cita |
| NotificationLog | Registro del correo de confirmacion |
| Specialty | Catalogo para seleccion en el wizard |
| Branch | Catalogo para seleccion en el wizard |
| AppointmentStatus | Estados: Pendiente, Pagada, Cancelada |

Unica consideracion: Verificar que el seed incluya el rol Paciente con Name = Paciente y que NO tenga operaciones del panel administrativo asignadas en RolOperation.

## 7. Resumen de Archivos a Crear/Modificar

### Backend (Hospital.Server)

| Accion | Archivo |
|---|---|
| CREAR | Controllers/PatientPortalController.cs |
| CREAR | Entities/Request/PatientRegisterRequest.cs |
| CREAR | Entities/Request/BookAppointmentRequest.cs |
| CREAR | Entities/Request/PatientPaymentRequest.cs |
| CREAR | Entities/Response/DpiVerificationResponse.cs |
| CREAR | Entities/Response/DoctorResponse.cs |
| CREAR | Entities/Response/AvailabilityResponse.cs |
| CREAR | Entities/Response/PaymentConfirmationResponse.cs |
| CREAR | Validations/PatientPortal/CreatePatientValidator.cs |
| MODIFICAR | Configs/Extensions/ValidationsGroup.cs |
| MODIFICAR | Services/Core/AuthService.cs (agregar claim RoleName al JWT) |

### Frontend (hospital.client)

| Accion | Archivo |
|---|---|
| CREAR | src/stores/usePatientAuthStore.ts |
| CREAR | src/services/patientPortalService.ts |
| CREAR | src/routes/PortalRoutes.tsx |
| CREAR | src/routes/middlewares/ProtectedPatient.tsx |
| CREAR | src/containers/PortalLayout.tsx |
| CREAR | src/components/portal/DynamicCalendar.tsx |
| CREAR | src/components/portal/ReservationTimer.tsx |
| CREAR | src/components/portal/PaymentForm.tsx |
| CREAR | src/pages/portal/PortalLoginPage.tsx |
| CREAR | src/pages/portal/PortalRegisterPage.tsx |
| CREAR | src/pages/portal/PatientDashboardPage.tsx |
| CREAR | src/pages/portal/BookAppointmentPage.tsx |
| CREAR | src/pages/portal/PaymentPage.tsx |
| CREAR | src/pages/portal/ConfirmationPage.tsx |
| CREAR | src/pages/portal/MyAppointmentsPage.tsx |
| CREAR | src/utils/luhn.ts |
| CREAR | src/types/PatientPortalTypes.ts |
| MODIFICAR | src/routes/AppRoutes.tsx (montar PortalRoutes) |
| MODIFICAR | src/routes/PublicRoutes.tsx (limpiar rutas duplicadas) |
| MODIFICAR | src/routes/middlewares/ProtectedPublic.tsx (bloquear pacientes) |
| MODIFICAR | src/configs/constants.ts (agregar rutas del portal) |
| MODIFICAR | src/pages/portal/PortalPage.tsx (actualizar modal DPI) |
| INSTALAR | react-calendar, uuid |

