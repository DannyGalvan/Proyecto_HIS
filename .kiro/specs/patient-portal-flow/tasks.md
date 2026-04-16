# Tasks - Flujo del Portal del Paciente (HIS)

## Task List

- [x] 1. Backend: DTOs y Validador del Portal del Paciente
  - [x] 1.1 Crear PatientRegisterRequest.cs en Hospital.Server/Entities/Request/
  - [x] 1.2 Crear BookAppointmentRequest.cs en Hospital.Server/Entities/Request/
  - [x] 1.3 Crear PatientPaymentRequest.cs en Hospital.Server/Entities/Request/
  - [x] 1.4 Crear DpiVerificationResponse.cs en Hospital.Server/Entities/Response/
  - [x] 1.5 Crear DoctorResponse.cs en Hospital.Server/Entities/Response/
  - [x] 1.6 Crear AvailabilityResponse.cs en Hospital.Server/Entities/Response/
  - [x] 1.7 Crear PaymentConfirmationResponse.cs en Hospital.Server/Entities/Response/
  - [x] 1.8 Crear CreatePatientValidator.cs en Hospital.Server/Validations/PatientPortal/ con reglas: Name 10-100 chars, DPI exactamente 13 digitos numericos, UserName 8-9 chars, Password min 12 chars, Email formato valido, Number exactamente 8 digitos, Nit 8-9 chars alfanumerico (opcional), InsuranceNumber 5-50 chars (opcional)
  - [x] 1.9 Registrar CreatePatientValidator en Hospital.Server/Configs/Extensions/ValidationsGroup.cs

- [x] 2. Backend: PatientPortalController - Endpoints Publicos
  - [x] 2.1 Crear PatientPortalController.cs en Hospital.Server/Controllers/ heredando de CommonController, con atributo ModuleInfo(IsVisible=false)
  - [x] 2.2 Implementar GET /api/v1/PatientPortal/verify-dpi/{dpi} con [AllowAnonymous][ExcludeFromSync]: validar 13 digitos, buscar usuario activo, retornar DpiVerificationResponse con exists y hasPatientRole
  - [x] 2.3 Implementar POST /api/v1/PatientPortal/register con [AllowAnonymous][ExcludeFromSync]: validar con CreatePatientValidator, verificar unicidad de DPI/email/username, buscar RolId del rol Paciente en BD, hashear password con BCrypt, crear usuario
  - [x] 2.4 Implementar GET /api/v1/PatientPortal/doctors con [AllowAnonymous][ExcludeFromSync]: recibir specialtyId como query param, retornar lista de usuarios activos con rol Medico como DoctorResponse
  - [x] 2.5 Implementar GET /api/v1/PatientPortal/availability con [AllowAnonymous][ExcludeFromSync]: recibir doctorId y date (yyyy-MM-dd), consultar citas activas del medico en esa fecha, retornar AvailabilityResponse con lista de occupiedSlots como strings ISO 8601

- [x] 3. Backend: PatientPortalController - Endpoints Autenticados
  - [x] 3.1 Implementar POST /api/v1/PatientPortal/book con [Authorize]: validar que appointmentDate sea futura, verificar conflicto de slot de 30 minutos con query LINQ (AppointmentDate < requestedEnd AND AppointmentDate+30min > requestedStart), obtener AppointmentStatusId del estado Pendiente, crear cita via EntityService, retornar HTTP 409 si slot ocupado
  - [x] 3.2 Implementar POST /api/v1/PatientPortal/pay con [Authorize]: verificar que la cita pertenece al paciente autenticado (GetUserId()), verificar estado Pendiente, verificar que no han pasado mas de 5 minutos desde CreatedAt (HTTP 410 si expiro), verificar idempotency key no duplicada (HTTP 409), procesar pago con IPaymentGateway, si exitoso crear Payment y actualizar cita a estado Pagada, enviar correo con ISendMail, registrar en NotificationLog, retornar PaymentConfirmationResponse
  - [x] 3.3 Implementar GET /api/v1/PatientPortal/my-appointments con [Authorize]: retornar citas del paciente autenticado con Include de Specialty, Branch, AppointmentStatus y Doctor, ordenadas por AppointmentDate descendente, paginadas (pageNumber, pageSize)

- [x] 4. Backend: Modificacion de AuthService para claim RoleName
  - [x] 4.1 Modificar Hospital.Server/Services/Core/AuthService.cs metodo GetToken(): agregar claim new Claim(RoleName, user.Rol!.Name) a la lista de claims del JWT, para que el frontend pueda detectar el rol sin depender del RolId hardcodeado

- [x] 5. Frontend: Instalacion de Dependencias y Utilidades
  - [x] 5.1 Instalar react-calendar y sus tipos: npm install react-calendar @types/react-calendar
  - [x] 5.2 Instalar uuid y sus tipos: npm install uuid @types/uuid
  - [x] 5.3 Crear hospital.client/src/utils/luhn.ts con funcion luhnCheck(cardNumber: string): boolean que implementa el algoritmo de Luhn para validacion de tarjetas
  - [x] 5.4 Crear hospital.client/src/types/PatientPortalTypes.ts con interfaces: DpiVerificationResponse, DoctorResponse, AvailabilityResponse, BookAppointmentRequest, PatientPaymentRequest, PaymentConfirmationResponse, PatientRegisterRequest, PatientAuthState

- [x] 6. Frontend: Store y Servicio del Portal del Paciente
  - [x] 6.1 Crear hospital.client/src/stores/usePatientAuthStore.ts con Zustand: estado PatientAuthState (isLoggedIn, token, userId, name, email, userName), acciones signInPatient/logoutPatient/syncPatientAuth, persistencia en localStorage[@patient-auth], separado completamente de useAuthStore
  - [x] 6.2 Crear hospital.client/src/services/patientPortalService.ts con funciones: verifyDpi, registerPatient, loginPatient (reutiliza /api/v1/Auth), getDoctorsBySpecialty, getDoctorAvailability, bookAppointment, processPatientPayment, getMyAppointments. Todas usan el interceptor axios existente pero con el token del usePatientAuthStore

- [x] 7. Frontend: Layout, Middlewares y Rutas del Portal
  - [x] 7.1 Crear hospital.client/src/containers/PortalLayout.tsx: layout publico con navbar (logo, links, botones Login/Registro) y footer con informacion de contacto, sin sidebar administrativo
  - [x] 7.2 Crear hospital.client/src/routes/middlewares/ProtectedPatient.tsx: redirige a /portal/login si usePatientAuthStore.isLoggedIn es false
  - [x] 7.3 Modificar hospital.client/src/routes/middlewares/ProtectedPublic.tsx: agregar verificacion del claim RoleName del JWT almacenado en @auth; si el rol es Paciente, redirigir a /portal/dashboard en lugar de mostrar el panel administrativo
  - [x] 7.4 Crear hospital.client/src/routes/PortalRoutes.tsx con todas las rutas del portal: /portal (publico), /portal/login (publico), /portal/register (publico), /portal/dashboard (ProtectedPatient), /portal/book (ProtectedPatient), /portal/book/pay (ProtectedPatient), /portal/book/confirm (ProtectedPatient), /portal/appointments (ProtectedPatient)
  - [x] 7.5 Modificar hospital.client/src/routes/AppRoutes.tsx para montar PortalRoutes bajo el path /portal con PortalLayout como elemento padre
  - [x] 7.6 Actualizar hospital.client/src/configs/constants.ts: agregar rutas del portal (portalHome, portalLogin, portalRegister, portalDashboard, portalBook, portalPay, portalConfirm, portalAppointments) y eliminar las rutas /register y /portal duplicadas de PublicRoutes

- [x] 8. Frontend: Componentes Reutilizables del Portal
  - [x] 8.1 Crear hospital.client/src/components/portal/DynamicCalendar.tsx: usar react-calendar para seleccion de fecha, al seleccionar fecha llamar getDoctorAvailability, generar todos los slots de 07:00 a 18:30 en intervalos de 30 minutos, filtrar slots ocupados (solapamiento de 30 min) y slots pasados, mostrar grid de botones (disponibles en verde, ocupados en gris deshabilitado), props: doctorId y onSlotSelected
  - [x] 8.2 Crear hospital.client/src/components/portal/ReservationTimer.tsx: recibir appointmentId, createdAt y onExpired como props, calcular segundos restantes (300 - elapsed), actualizar cada segundo con setInterval, mostrar en formato MM:SS, color rojo cuando quedan menos de 60 segundos, al llegar a 0 llamar PATCH /api/v1/Appointment para cancelar la cita y luego llamar onExpired, mostrar advertencia beforeunload al intentar navegar fuera
  - [x] 8.3 Crear hospital.client/src/components/portal/PaymentForm.tsx: campos numero de tarjeta (validacion Luhn + 13-19 digitos), titular (5-100 chars), expiracion MM/AA (no vencida), CVV (3-4 digitos, enmascarado, nunca enviado al backend), validaciones con Zod, enmascarar numero de tarjeta al salir del campo mostrando solo ultimos 4 digitos, generar idempotencyKey con uuidv4() antes del submit, deshabilitar boton mientras peticion esta en curso

- [x] 9. Frontend: Paginas Publicas del Portal
  - [x] 9.1 Actualizar hospital.client/src/pages/portal/PortalPage.tsx: reemplazar el modal de verificacion DPI actual por uno que llame verifyDpi del patientPortalService, si exists=true y hasPatientRole=true redirigir a /portal/login, si exists=false redirigir a /portal/register, si exists=true y hasPatientRole=false mostrar mensaje de usuario interno
  - [x] 9.2 Crear hospital.client/src/pages/portal/PortalLoginPage.tsx: formulario con username y password, validacion Zod, llamar loginPatient que usa POST /api/v1/Auth, al autenticar guardar en usePatientAuthStore (NO en useAuthStore), redirigir a /portal/dashboard, mostrar mensaje de error generico sin revelar cual campo es incorrecto, bloquear tras 5 intentos fallidos
  - [x] 9.3 Crear hospital.client/src/pages/portal/PortalRegisterPage.tsx: formulario completo con todos los campos del PatientRegisterRequest, validaciones Zod (DPI 13 digitos, password min 12, nombre 10-100, telefono 8 digitos, username 8-9, email valido), llamar registerPatient, al exito redirigir a /portal/login con mensaje de exito, campos NIT e InsuranceNumber opcionales

- [x] 10. Frontend: Paginas Autenticadas del Portal
  - [x] 10.1 Crear hospital.client/src/pages/portal/PatientDashboardPage.tsx: saludo personalizado con nombre del paciente desde usePatientAuthStore, boton principal Agendar Nueva Cita que navega a /portal/book, resumen de proximas 3 citas usando getMyAppointments, link a /portal/appointments para historial completo
  - [x] 10.2 Crear hospital.client/src/pages/portal/BookAppointmentPage.tsx: wizard de 4 pasos con indicador de progreso visual; Paso 1 seleccion de especialidad con cards (carga desde /api/v1/Specialty); Paso 2 seleccion de medico con lista (carga desde getDoctorsBySpecialty); Paso 3 seleccion de sucursal mas DynamicCalendar para fecha y slot; Paso 4 campo de motivo de consulta (10-2000 chars) mas resumen de la cita mas boton Confirmar; al confirmar llamar bookAppointment, si HTTP 409 mostrar error y volver al paso 3, si exito navegar a /portal/book/pay pasando appointmentId y createdAt en el estado de navegacion
  - [x] 10.3 Crear hospital.client/src/pages/portal/PaymentPage.tsx: mostrar resumen de la cita (medico, especialidad, fecha, monto), incluir ReservationTimer con el createdAt de la cita, incluir PaymentForm, al pago exitoso navegar a /portal/book/confirm con datos del comprobante, si pago rechazado mostrar mensaje especifico segun el tipo de rechazo sin cancelar el timer, si timer expira mostrar mensaje y redirigir a /portal/book
  - [x] 10.4 Crear hospital.client/src/pages/portal/ConfirmationPage.tsx: mostrar comprobante completo (numero de transaccion, medico, especialidad, sucursal, fecha, monto pagado), mensaje de confirmacion indicando que se envio correo al email del paciente, boton Volver al Portal que navega a /portal, boton Ver Mis Citas que navega a /portal/appointments
  - [x] 10.5 Crear hospital.client/src/pages/portal/MyAppointmentsPage.tsx: lista paginada de citas del paciente (10 por pagina) usando getMyAppointments con react-query, mostrar para cada cita: fecha, hora, medico, especialidad, sucursal, estado con badge de color (Pagada=verde, Pendiente=amarillo, Cancelada=rojo, En curso=azul), monto pagado, ordenadas por fecha descendente

- [x] 11. Verificacion y Pruebas de Integracion
  - [x] 11.1 Verificar que el rol Paciente existe en el seed de la BD y que NO tiene operaciones del panel administrativo asignadas en la tabla RolOperation
  - [x] 11.2 Verificar que el endpoint verify-dpi retorna correctamente los tres casos: usuario paciente existente, usuario no existente, usuario interno existente
  - [x] 11.3 Verificar que el registro de paciente externo asigna el RolId correcto del rol Paciente y que el usuario creado puede autenticarse via /api/v1/Auth
  - [x] 11.4 Verificar que el calendario dinamico muestra correctamente los slots disponibles y bloquea los ocupados para un medico con citas existentes
  - [x] 11.5 Verificar que la reserva temporal de 5 minutos cancela la cita correctamente al expirar y que el endpoint /pay retorna HTTP 410 si han pasado mas de 5 minutos
  - [x] 11.6 Verificar que el pago con idempotency key duplicada retorna HTTP 409
  - [x] 11.7 Verificar que un usuario con rol Paciente no puede acceder al panel administrativo (HTTP 403 en backend, redireccion en frontend)
  - [x] 11.8 Verificar que el correo de confirmacion se registra en NotificationLog con Status=1 (Sent) o Status=2 (Failed) segun el resultado del envio
  - [x] 11.9 Ejecutar npx tsc --noEmit en hospital.client para verificar que no hay errores de TypeScript

