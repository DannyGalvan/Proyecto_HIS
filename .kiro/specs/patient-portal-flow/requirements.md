# Documento de Requisitos — Flujo del Portal del Paciente (HIS)

## Introducción

Este documento especifica los requisitos para el flujo completo del paciente externo en el Sistema Informático Hospitalario (HIS). El sistema actual tiene un backend y frontend orientados al personal interno (médicos, enfermería, administración). El portal público existe visualmente pero carece de la lógica de negocio necesaria para que un paciente externo pueda registrarse, verificar su identidad, agendar una cita con calendario dinámico, pagar en línea y recibir confirmación por correo.

El flujo cubre seis áreas principales:
1. Registro de paciente externo con rol segregado
2. Verificación de DPI mediante endpoint dedicado
3. Autenticación del paciente en el portal
4. Calendario dinámico de disponibilidad médica
5. Agendamiento con reserva temporal y pago obligatorio
6. Notificación por correo al confirmar el pago

El backend es ASP.NET Core 8 con PostgreSQL. El frontend es React + TypeScript + Vite. La arquitectura sigue el patrón `EntityService` + `CrudController` con sincronización automática de permisos mediante reflexión.

---

## Glosario

- **Portal_Paciente**: Subsistema público del HIS accesible sin autenticación interna, desde el cual un paciente externo puede registrarse, iniciar sesión y agendar citas.
- **Paciente_Externo**: Persona que accede al HIS únicamente a través del Portal_Paciente. Posee el rol "Paciente" y no tiene acceso al panel administrativo.
- **DPI**: Documento Personal de Identificación guatemalteco. Exactamente 13 dígitos numéricos. Identificador único del Paciente_Externo en el sistema.
- **Rol_Paciente**: Rol del sistema con nombre "Paciente" que no tiene asignadas operaciones del panel administrativo. Impide el acceso a rutas internas del HIS.
- **Reserva_Temporal**: Estado transitorio de una cita recién creada. Dura exactamente 5 minutos. Si el pago no se completa en ese tiempo, la cita se cancela automáticamente.
- **Slot**: Intervalo de 30 minutos dentro del horario de atención de un médico. Representa una unidad de tiempo disponible para una cita.
- **Calendario_Dinamico**: Componente del frontend que muestra los Slots disponibles de un médico para una fecha seleccionada, calculados a partir de los horarios ocupados retornados por el backend.
- **Gateway_Mock**: Simulador de pasarela de pago con tarjeta implementado en el backend. Acepta o rechaza pagos según reglas de prueba predefinidas.
- **Notificacion_Confirmacion**: Correo electrónico enviado al Paciente_Externo tras completar el pago de una cita. Contiene número de transacción, fecha, hora, médico, especialidad y sucursal.
- **Panel_Administrativo**: Conjunto de rutas del frontend (`/user`, `/appointment`, `/dashboard`, etc.) accesibles únicamente para personal interno con roles distintos a "Paciente".
- **Middleware_Paciente**: Componente del backend que intercepta peticiones al Panel_Administrativo y rechaza tokens JWT cuyo claim de rol sea "Paciente".
- **Endpoint_Disponibilidad**: Nuevo endpoint `GET /api/v1/Appointment/availability` que retorna los Slots ocupados de un médico para una fecha dada.
- **Endpoint_Verificacion_DPI**: Nuevo endpoint `GET /api/v1/PatientPortal/verify-dpi/{dpi}` que verifica si un DPI ya está registrado en el sistema.
- **PatientPortal_Controller**: Nuevo controlador ASP.NET Core dedicado exclusivamente al flujo del Paciente_Externo. Marcado con `[ExcludeFromSync]` en sus endpoints públicos.
- **Idempotency_Key**: UUID v4 generado por el frontend antes de enviar un pago. Previene cobros duplicados si la petición se reintenta.

---

## Requisitos

---

### Requisito 1: Registro de Paciente Externo con Rol Segregado

**User Story:** Como paciente externo, quiero registrarme en el portal con mis datos personales, para poder agendar citas médicas sin acceder al panel administrativo del hospital.

#### Criterios de Aceptación

1. WHEN un visitante envía el formulario de registro con nombre completo, DPI, teléfono, correo electrónico, nombre de usuario y contraseña válidos, THE Portal_Paciente SHALL crear un nuevo usuario en la base de datos con el Rol_Paciente asignado automáticamente.

2. THE Portal_Paciente SHALL asignar el rol "Paciente" al nuevo usuario sin requerir intervención del administrador.

3. WHEN el DPI enviado en el registro ya existe en la base de datos con State = 1, THE Portal_Paciente SHALL rechazar el registro y retornar el mensaje "El DPI ya se encuentra registrado en el sistema".

4. WHEN el correo electrónico enviado en el registro ya existe en la base de datos, THE Portal_Paciente SHALL rechazar el registro y retornar el mensaje "El correo electrónico ya está en uso".

5. WHEN el nombre de usuario enviado en el registro ya existe en la base de datos, THE Portal_Paciente SHALL rechazar el registro y retornar el mensaje "El nombre de usuario ya está en uso".

6. THE Portal_Paciente SHALL validar que el DPI contenga exactamente 13 dígitos numéricos antes de enviar la petición al backend.

7. THE Portal_Paciente SHALL validar que la contraseña tenga un mínimo de 12 caracteres antes de enviar la petición al backend.

8. THE Portal_Paciente SHALL validar que el nombre completo tenga entre 10 y 100 caracteres antes de enviar la petición al backend.

9. THE Portal_Paciente SHALL validar que el teléfono contenga exactamente 8 dígitos numéricos antes de enviar la petición al backend.

10. THE Portal_Paciente SHALL validar que el correo electrónico tenga formato válido (RFC 5322) antes de enviar la petición al backend.

11. THE Portal_Paciente SHALL validar que el nombre de usuario tenga entre 8 y 9 caracteres antes de enviar la petición al backend.

12. IF el registro es exitoso, THEN THE Portal_Paciente SHALL redirigir al paciente al flujo de agendamiento de cita en un máximo de 3 segundos.

13. THE PatientPortal_Controller SHALL exponer el endpoint `POST /api/v1/PatientPortal/register` marcado con `[AllowAnonymous]` y `[ExcludeFromSync]` para el registro de pacientes externos.

14. THE PatientPortal_Controller SHALL utilizar un validador `CreatePatientValidator` que verifique todas las reglas de negocio del registro antes de persistir el usuario.

---

### Requisito 2: Verificación de DPI

**User Story:** Como visitante del portal, quiero verificar si mi DPI ya está registrado en el sistema, para saber si debo registrarme o puedo iniciar sesión directamente.

#### Criterios de Aceptación

1. THE PatientPortal_Controller SHALL exponer el endpoint `GET /api/v1/PatientPortal/verify-dpi/{dpi}` marcado con `[AllowAnonymous]` y `[ExcludeFromSync]`.

2. WHEN el endpoint recibe un DPI de exactamente 13 dígitos numéricos y existe un usuario activo (State = 1) con ese DPI en la base de datos, THE Endpoint_Verificacion_DPI SHALL retornar `{ "exists": true, "hasPatientRole": true/false }`.

3. WHEN el endpoint recibe un DPI de exactamente 13 dígitos numéricos y no existe ningún usuario activo con ese DPI, THE Endpoint_Verificacion_DPI SHALL retornar `{ "exists": false, "hasPatientRole": false }`.

4. IF el DPI recibido no contiene exactamente 13 dígitos numéricos, THEN THE Endpoint_Verificacion_DPI SHALL retornar HTTP 400 con el mensaje "El DPI debe contener exactamente 13 dígitos numéricos".

5. WHEN el Portal_Paciente recibe `exists: true` y `hasPatientRole: true`, THE Portal_Paciente SHALL redirigir al visitante al formulario de inicio de sesión del portal.

6. WHEN el Portal_Paciente recibe `exists: false`, THE Portal_Paciente SHALL redirigir al visitante al formulario de registro de paciente externo.

7. WHEN el Portal_Paciente recibe `exists: true` y `hasPatientRole: false`, THE Portal_Paciente SHALL mostrar el mensaje "Este DPI pertenece a un usuario del sistema interno. Por favor, contacte a recepción." sin redirigir.

8. THE Portal_Paciente SHALL mostrar el resultado de la verificación en un máximo de 3 segundos desde que el visitante envía el formulario.

---

### Requisito 3: Autenticación del Paciente en el Portal

**User Story:** Como paciente registrado, quiero iniciar sesión en el portal con mis credenciales, para acceder al flujo de agendamiento de citas de forma segura.

#### Criterios de Aceptación

1. THE Portal_Paciente SHALL exponer un formulario de inicio de sesión en la ruta `/portal/login` accesible sin autenticación.

2. WHEN un paciente envía credenciales válidas (userName y password) al endpoint `POST /api/v1/Auth`, THE Portal_Paciente SHALL almacenar el token JWT en el estado de la aplicación y redirigir al flujo de agendamiento.

3. IF las credenciales son inválidas, THEN THE Portal_Paciente SHALL mostrar el mensaje "Usuario o contraseña incorrectos" sin revelar cuál de los dos campos es incorrecto.

4. WHILE el paciente tiene una sesión activa en el portal, THE Portal_Paciente SHALL incluir el token JWT en el header `Authorization: Bearer {token}` en todas las peticiones autenticadas.

5. THE Portal_Paciente SHALL bloquear el acceso al formulario de inicio de sesión del portal después de 5 intentos fallidos consecutivos, mostrando el mensaje "Cuenta bloqueada temporalmente. Intente de nuevo en 15 minutos."

6. WHEN el token JWT del paciente expira, THE Portal_Paciente SHALL redirigir automáticamente al formulario de inicio de sesión del portal sin mostrar errores técnicos.

---

### Requisito 4: Segmentación de Acceso — Bloqueo del Panel Administrativo

**User Story:** Como administrador del sistema, quiero que los pacientes registrados externamente no puedan acceder al panel administrativo, para mantener la seguridad e integridad del sistema interno.

#### Criterios de Aceptación

1. THE Middleware_Paciente SHALL interceptar todas las peticiones HTTP a rutas del Panel_Administrativo que incluyan un token JWT con claim de rol igual a "Paciente".

2. WHEN el Middleware_Paciente detecta un token JWT con rol "Paciente" en una petición a una ruta del Panel_Administrativo, THE Middleware_Paciente SHALL retornar HTTP 403 con el mensaje "Acceso denegado. Esta área es exclusiva para personal del hospital."

3. THE Portal_Paciente SHALL redirigir al paciente autenticado a `/portal/dashboard` si intenta navegar manualmente a cualquier ruta del Panel_Administrativo desde el frontend.

4. THE Portal_Paciente SHALL construir el menú de navegación del portal exclusivamente con las operaciones del Rol_Paciente, sin mostrar ningún módulo del Panel_Administrativo.

5. THE PatientPortal_Controller SHALL aplicar `[Authorize]` con validación de rol "Paciente" en todos los endpoints que requieran autenticación del paciente.

6. WHERE el sistema de sincronización automática de operaciones está activo, THE Portal_Paciente SHALL excluir al Rol_Paciente de la asignación automática de operaciones del Panel_Administrativo durante la sincronización inicial.

---

### Requisito 5: Calendario Dinámico de Disponibilidad Médica

**User Story:** Como paciente, quiero ver los horarios disponibles de un médico en un calendario interactivo, para elegir la fecha y hora que mejor se adapte a mi disponibilidad.

#### Criterios de Aceptación

1. THE Portal_Paciente SHALL presentar el flujo de selección en el siguiente orden: (1) Especialidad, (2) Médico de esa especialidad, (3) Fecha, (4) Slot disponible.

2. THE PatientPortal_Controller SHALL exponer el endpoint `GET /api/v1/PatientPortal/doctors?specialtyId={id}` que retorne la lista de médicos activos (State = 1) con el rol "Médico" asignados a la especialidad indicada.

3. THE PatientPortal_Controller SHALL exponer el Endpoint_Disponibilidad `GET /api/v1/PatientPortal/availability?doctorId={id}&date={yyyy-MM-dd}` que retorne los Slots ocupados del médico para la fecha indicada.

4. WHEN el Endpoint_Disponibilidad recibe un `doctorId` y una `date` válidos, THE Endpoint_Disponibilidad SHALL retornar la lista de `DateTime` de inicio de cada cita existente (State = 1) del médico en esa fecha, con independencia del estado de la cita.

5. THE Portal_Paciente SHALL calcular los Slots disponibles restando los Slots ocupados retornados por el Endpoint_Disponibilidad del conjunto total de Slots del horario de atención del médico (07:00–19:00, intervalos de 30 minutos).

6. THE Portal_Paciente SHALL mostrar únicamente Slots cuya fecha y hora sean estrictamente posteriores al momento actual del cliente.

7. WHEN el paciente selecciona una fecha sin Slots disponibles, THE Portal_Paciente SHALL mostrar el mensaje "No hay horarios disponibles para esta fecha. Por favor, seleccione otra fecha."

8. THE Portal_Paciente SHALL deshabilitar en el calendario todas las fechas anteriores a la fecha actual del cliente.

9. WHEN el paciente selecciona un Slot, THE Portal_Paciente SHALL mostrar un resumen con: nombre del médico, especialidad, sucursal, fecha, hora y duración (30 minutos) antes de proceder al pago.

10. THE Endpoint_Disponibilidad SHALL retornar la respuesta en un máximo de 2 segundos bajo carga normal.

---

### Requisito 6: Agendamiento de Cita con Reserva Temporal

**User Story:** Como paciente, quiero reservar una cita médica y tener un tiempo limitado para completar el pago, para garantizar que el horario quede disponible para otros pacientes si no finalizo el proceso.

#### Criterios de Aceptación

1. WHEN el paciente confirma la selección de Slot y envía el motivo de consulta, THE Portal_Paciente SHALL crear la cita en el backend con `appointmentStatusId` correspondiente al estado "Pendiente" y `state = 1`.

2. THE Portal_Paciente SHALL requerir que el motivo de consulta tenga entre 10 y 2000 caracteres antes de crear la cita.

3. WHEN la cita es creada exitosamente, THE Portal_Paciente SHALL iniciar un temporizador visible de 5 minutos (Reserva_Temporal) en la pantalla de pago.

4. WHILE el temporizador de Reserva_Temporal está activo, THE Portal_Paciente SHALL mostrar el tiempo restante en formato `MM:SS` actualizado cada segundo.

5. WHEN el temporizador de Reserva_Temporal llega a cero sin que el pago haya sido completado, THE Portal_Paciente SHALL enviar una petición `PATCH /api/v1/Appointment` para cambiar el `appointmentStatusId` al estado "Cancelada" y redirigir al paciente al inicio del flujo de agendamiento con el mensaje "El tiempo para completar el pago ha expirado. La reserva fue cancelada."

6. THE Portal_Paciente SHALL impedir que el paciente navegue fuera de la pantalla de pago durante la Reserva_Temporal sin mostrar una advertencia de confirmación.

7. IF la creación de la cita falla por conflicto de horario (el Slot fue tomado por otro paciente entre la selección y la confirmación), THEN THE Portal_Paciente SHALL mostrar el mensaje "El horario seleccionado ya no está disponible. Por favor, elija otro horario." y retornar al Calendario_Dinamico.

8. THE Portal_Paciente SHALL enviar en la petición de creación de cita: `patientId`, `doctorId`, `specialtyId`, `branchId`, `appointmentStatusId`, `appointmentDate`, `reason`, `amount` y `state = 1`.

---

### Requisito 7: Pago en Línea Obligatorio

**User Story:** Como paciente, quiero pagar mi cita en línea con tarjeta de crédito o débito, para confirmar mi reserva de forma segura sin necesidad de ir al hospital.

#### Criterios de Aceptación

1. THE Portal_Paciente SHALL mostrar el formulario de pago únicamente después de que la cita haya sido creada exitosamente con estado "Pendiente".

2. THE Portal_Paciente SHALL mostrar en el formulario de pago: nombre del médico, especialidad, fecha, hora y monto a pagar antes de solicitar los datos de la tarjeta.

3. THE Portal_Paciente SHALL validar que el número de tarjeta tenga entre 13 y 19 dígitos y pase la validación del algoritmo de Luhn antes de enviar la petición de pago.

4. THE Portal_Paciente SHALL validar que el nombre del titular de la tarjeta tenga entre 5 y 100 caracteres.

5. THE Portal_Paciente SHALL validar que la fecha de expiración de la tarjeta tenga formato MM/AA y no sea una fecha pasada.

6. THE Portal_Paciente SHALL enmascarar el número de tarjeta mostrando únicamente los últimos 4 dígitos en cualquier elemento visual de la interfaz.

7. THE Portal_Paciente SHALL generar un Idempotency_Key (UUID v4) único antes de enviar cada petición de pago al backend.

8. WHEN el paciente envía el formulario de pago, THE Portal_Paciente SHALL enviar al endpoint `POST /api/v1/Payment` los campos: `appointmentId`, `amount`, `paymentMethod` (1=Visa o 2=Mastercard), `paymentType = 0` (Consulta), `paymentStatus = 0` (Pendiente), `paymentDate`, `cardLastFourDigits` e `idempotencyKey`.

9. WHEN el Gateway_Mock retorna una respuesta exitosa, THE Portal_Paciente SHALL actualizar el estado de la cita a "Pagada" mediante `PATCH /api/v1/Appointment` y redirigir al paciente a la pantalla de confirmación.

10. IF el Gateway_Mock retorna rechazo por fondos insuficientes, THEN THE Portal_Paciente SHALL mostrar el mensaje "Pago rechazado: fondos insuficientes. Verifique su saldo e intente de nuevo." sin cancelar la Reserva_Temporal.

11. IF el Gateway_Mock retorna rechazo por tarjeta inválida o expirada, THEN THE Portal_Paciente SHALL mostrar el mensaje "Pago rechazado: tarjeta inválida o expirada. Verifique los datos e intente de nuevo." sin cancelar la Reserva_Temporal.

12. THE Portal_Paciente SHALL aplicar un timeout de 10 minutos a la sesión de pago. WHEN el timeout expira, THE Portal_Paciente SHALL cancelar la Reserva_Temporal y redirigir al inicio del flujo.

13. THE Portal_Paciente SHALL deshabilitar el botón de pago mientras la petición está en curso para prevenir envíos duplicados.

14. THE Portal_Paciente SHALL nunca almacenar ni registrar en logs el número completo de la tarjeta ni el CVV.

---

### Requisito 8: Confirmación de Cita y Notificación por Correo

**User Story:** Como paciente, quiero recibir una confirmación por correo electrónico después de pagar mi cita, para tener un comprobante con todos los detalles del agendamiento.

#### Criterios de Aceptación

1. WHEN el pago de una cita es completado exitosamente (PaymentStatus = 1), THE Portal_Paciente SHALL mostrar una pantalla de confirmación con: número de transacción, nombre del médico, especialidad, sucursal, fecha, hora y monto pagado.

2. WHEN el pago de una cita es completado exitosamente, THE Portal_Paciente SHALL mostrar en la pantalla de confirmación un botón "Volver al Portal" que redirija a la página principal del portal.

3. WHEN el pago de una cita es completado exitosamente, THE PatientPortal_Controller SHALL encolar una Notificacion_Confirmacion de tipo `AppointmentConfirmation` (NotificationType = 0) dirigida al correo electrónico del paciente.

4. THE PatientPortal_Controller SHALL enviar la Notificacion_Confirmacion en un máximo de 5 minutos desde que el pago es registrado como completado.

5. THE Notificacion_Confirmacion SHALL incluir en el cuerpo del correo: número de transacción, nombre completo del paciente, nombre del médico, especialidad, sucursal, fecha y hora de la cita, y monto pagado.

6. IF el envío del correo falla en el primer intento, THEN THE PatientPortal_Controller SHALL registrar el fallo en la entidad `NotificationLog` con `Status = 2` (Failed) y `RetryCount` incrementado, y reintentará el envío hasta 3 veces con intervalos de 1 minuto.

7. THE PatientPortal_Controller SHALL registrar cada Notificacion_Confirmacion enviada exitosamente en la entidad `NotificationLog` con `Status = 1` (Sent), `RelatedEntityType = "Appointment"` y `RelatedEntityId` igual al ID de la cita.

---

### Requisito 9: Historial de Citas del Paciente en el Portal

**User Story:** Como paciente autenticado, quiero ver el historial de mis citas agendadas en el portal, para hacer seguimiento de mis consultas médicas.

#### Criterios de Aceptación

1. THE Portal_Paciente SHALL exponer una vista de historial de citas en la ruta `/portal/appointments` accesible únicamente para pacientes autenticados con Rol_Paciente.

2. WHEN un paciente autenticado accede a su historial, THE Portal_Paciente SHALL consultar `GET /api/v1/Appointment?Filters=PatientId:eq:{userId}&Include=Specialty,Branch,AppointmentStatus,Doctor` y mostrar las citas del paciente ordenadas por fecha descendente.

3. THE Portal_Paciente SHALL mostrar para cada cita: fecha, hora, nombre del médico, especialidad, sucursal, estado (con badge de color según RN-CU05) y monto pagado.

4. WHILE una cita tiene estado "Pendiente" y la Reserva_Temporal no ha expirado, THE Portal_Paciente SHALL mostrar el tiempo restante para completar el pago junto a esa cita en el historial.

5. THE Portal_Paciente SHALL paginar el historial mostrando un máximo de 10 citas por página.

---

### Requisito 10: Nuevo Controlador PatientPortal en el Backend

**User Story:** Como desarrollador, quiero un controlador dedicado para el flujo del paciente externo, para mantener la separación de responsabilidades y no contaminar los controladores internos del HIS.

#### Criterios de Aceptación

1. THE PatientPortal_Controller SHALL ser un controlador ASP.NET Core 8 con ruta base `api/v1/PatientPortal`, decorado con `[ModuleInfo]` con `IsVisible = false` para excluirlo del menú administrativo.

2. THE PatientPortal_Controller SHALL exponer los siguientes endpoints con `[AllowAnonymous]` y `[ExcludeFromSync]`:
   - `POST /api/v1/PatientPortal/register`
   - `GET /api/v1/PatientPortal/verify-dpi/{dpi}`
   - `GET /api/v1/PatientPortal/doctors`
   - `GET /api/v1/PatientPortal/availability`

3. THE PatientPortal_Controller SHALL exponer los siguientes endpoints con `[Authorize]` y validación de Rol_Paciente:
   - `GET /api/v1/PatientPortal/appointments` (historial del paciente autenticado)

4. THE PatientPortal_Controller SHALL utilizar el `EntityService` existente para operaciones de lectura/escritura sobre las entidades `User`, `Appointment` y `Payment`, sin duplicar lógica de persistencia.

5. THE PatientPortal_Controller SHALL retornar respuestas en el formato estándar `Response<T>` del sistema con los campos `success`, `message`, `data` y `totalResults`.

6. THE PatientPortal_Controller SHALL registrar en `NotificationLog` toda Notificacion_Confirmacion generada, con los campos `RecipientEmail`, `Subject`, `NotificationType`, `RelatedEntityType`, `RelatedEntityId` y `Status`.

---

### Requisito 11: Validaciones de Backend para el Flujo del Paciente

**User Story:** Como desarrollador, quiero que el backend valide todas las reglas de negocio del flujo del paciente, para garantizar la integridad de los datos independientemente del cliente que consuma la API.

#### Criterios de Aceptación

1. THE PatientPortal_Controller SHALL rechazar cualquier petición de registro donde el DPI no contenga exactamente 13 dígitos numéricos, retornando HTTP 400.

2. THE PatientPortal_Controller SHALL rechazar cualquier petición de registro donde la contraseña tenga menos de 12 caracteres, retornando HTTP 400.

3. THE PatientPortal_Controller SHALL rechazar cualquier petición de creación de cita donde `appointmentDate` sea una fecha y hora pasada respecto al momento de la petición, retornando HTTP 400 con el mensaje "La fecha de la cita debe ser futura".

4. THE PatientPortal_Controller SHALL rechazar cualquier petición de creación de cita donde el Slot solicitado ya esté ocupado por otra cita activa del mismo médico, retornando HTTP 409 con el mensaje "El horario seleccionado ya no está disponible".

5. THE PatientPortal_Controller SHALL rechazar cualquier petición de pago donde el `idempotencyKey` ya exista en la base de datos para un pago completado, retornando HTTP 409 con el mensaje "Esta transacción ya fue procesada".

6. THE PatientPortal_Controller SHALL rechazar cualquier petición de creación de cita cuyo `reason` tenga menos de 10 o más de 2000 caracteres, retornando HTTP 400.

7. IF una petición de pago llega para una cita cuya Reserva_Temporal ha expirado (más de 5 minutos desde la creación con estado "Pendiente"), THEN THE PatientPortal_Controller SHALL retornar HTTP 410 con el mensaje "La reserva temporal ha expirado. Por favor, inicie el proceso de agendamiento nuevamente."

