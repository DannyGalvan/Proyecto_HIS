# Documento de Requisitos — Calendario del Doctor y Configuración de Zona Horaria

## Introducción

Este documento especifica los requisitos para tres funcionalidades complementarias del Sistema de Información Hospitalaria (HIS):

**Área 1 — Calendario / Agenda del Doctor** cubre: una vista de calendario dedicada para médicos que muestra todas sus citas (pendientes, confirmadas, en progreso, completadas), la creación de eventos personales/bloqueos que afectan la disponibilidad de citas, tareas/recordatorios personales para gestión diaria, y navegación directa al dashboard de atención del doctor al hacer clic en una cita. El calendario soporta vistas de día, semana y mes, y es una herramienta de planificación separada del panel de atención existente (DoctorDashboardPage).

**Área 2 — Zona Horaria Configurable desde Base de Datos** cubre: una tabla de zonas horarias IANA en la base de datos (sembrada vía migración de Entity Framework), preferencia de zona horaria por usuario (tanto personal administrativo como pacientes del portal), integración con `dateFormatter.ts` para que `APP_TIMEZONE` lea la preferencia del usuario en lugar de estar hardcodeada, y "America/Guatemala" (UTC-6) como zona horaria por defecto del sistema.

**Área 3 — Notificaciones por Correo de Recordatorio** cubre: envío automático de correos electrónicos al médico como recordatorio de citas, eventos personales y tareas. Se envían en tres momentos: resumen diario al inicio de la jornada, 1 hora antes y 15 minutos antes de cada actividad. También incluye notificación inmediata cuando un paciente agenda una nueva cita.

El backend es ASP.NET Core 8 con PostgreSQL. El frontend es React 19 + TypeScript + Vite + HeroUI + TailwindCSS. La arquitectura sigue el patrón `EntityService` + `CrudController` con sincronización automática de permisos mediante reflexión.

---

## Glosario

- **HIS**: Sistema de Información Hospitalaria. Aplicación web compuesta por un backend ASP.NET Core 8 y un frontend React 19.
- **Calendario_Doctor**: Nueva vista de calendario/agenda accesible para usuarios con rol de médico, que muestra citas asignadas, eventos personales y tareas en formato de día, semana y mes.
- **DoctorDashboardPage**: Página existente en la ruta `/dashboard` donde el médico atiende pacientes en tiempo real. Es el panel de atención, no de planificación.
- **Evento_Personal**: Nueva entidad que representa un bloqueo de tiempo creado por un médico en su calendario (reuniones, descansos, capacitaciones). Los rangos de tiempo de estos eventos bloquean la disponibilidad de citas para pacientes.
- **Tarea_Doctor**: Nueva entidad que representa un recordatorio o tarea personal del médico para su gestión diaria (seguimientos, llamadas, pendientes administrativos).
- **Zona_Horaria**: Entidad de catálogo que almacena las zonas horarias IANA disponibles en el sistema (por ejemplo, "America/Guatemala", "America/New_York", "Europe/Madrid").
- **IANA_Timezone**: Identificador estándar de zona horaria definido por la Internet Assigned Numbers Authority (por ejemplo, "America/Guatemala"). El sistema utiliza exclusivamente este formato.
- **APP_TIMEZONE**: Constante exportada en `dateFormatter.ts` que define la zona horaria utilizada para formatear todas las fechas en el frontend. Actualmente hardcodeada como "America/Guatemala".
- **Preferencia_Timezone**: Campo en la entidad User que almacena el identificador IANA de la zona horaria preferida del usuario. Valor por defecto: "America/Guatemala".
- **Panel_Administrativo**: Conjunto de rutas del frontend accesibles únicamente para personal interno del hospital (médicos, enfermería, administración, laboratorio, farmacia, caja).
- **Portal_Paciente**: Subsistema público del HIS accesible para pacientes externos registrados con Rol_Paciente.
- **EntityService**: Servicio genérico del backend que implementa operaciones CRUD estándar para cualquier entidad que implemente `IEntity<TId>`.
- **CrudController**: Controlador genérico del backend que expone endpoints REST estándar (GetAll, GetById, Create, Update, Delete, Patch) para una entidad.
- **ModuleInfo**: Atributo decorador para controladores que define metadata del módulo para la sincronización automática de permisos.
- **BranchSpecialty**: Entidad que vincula una sucursal con una especialidad y define los horarios de atención disponibles para citas.
- **Recordatorio_Agenda**: Notificación por correo electrónico enviada automáticamente al médico como recordatorio de una cita, evento personal o tarea próxima. Se envía en tres momentos: al inicio del día, una hora antes y 15 minutos antes del evento.

---

## Requisitos

---

### Requisito 1: Vista de Calendario del Doctor con Citas

**User Story:** Como médico del hospital, quiero acceder a una vista de calendario que muestre todas mis citas asignadas organizadas por día, semana y mes, para planificar mi jornada laboral y tener una visión general de mi agenda.

#### Criterios de Aceptación

1. THE HIS SHALL exponer una nueva ruta `/doctor-calendar` accesible para usuarios autenticados con rol de médico, que muestre el Calendario_Doctor.

2. WHEN un médico accede al Calendario_Doctor, THE HIS SHALL consultar todas las citas (Appointment) asignadas al médico autenticado (DoctorId = userId) y mostrarlas en el calendario con diferenciación visual por estado: pendiente, confirmada, en progreso y completada.

3. THE Calendario_Doctor SHALL soportar tres modos de visualización: vista de día (muestra franjas horarias de un día), vista de semana (muestra 7 días con franjas horarias) y vista de mes (muestra cuadrícula mensual con indicadores de citas por día).

4. THE Calendario_Doctor SHALL mostrar para cada cita en el calendario: hora programada, nombre del paciente, especialidad y estado actual representado con un código de color.

5. WHEN el médico hace clic en una cita dentro del Calendario_Doctor, THE HIS SHALL redirigir al DoctorDashboardPage (`/dashboard`) para que el médico pueda atender al paciente desde el panel de atención existente.

6. THE Calendario_Doctor SHALL cargar las citas del rango de fechas visible actualmente (día, semana o mes seleccionado) mediante una consulta filtrada al endpoint `GET /api/v1/Appointment` con los parámetros de fecha y DoctorId del usuario autenticado.

7. THE Calendario_Doctor SHALL actualizar automáticamente las citas mostradas cuando el médico cambia entre vistas (día, semana, mes) o navega a un rango de fechas diferente.

---

### Requisito 2: Eventos Personales y Bloqueos de Disponibilidad del Doctor

**User Story:** Como médico del hospital, quiero crear eventos personales en mi calendario (reuniones, descansos, capacitaciones) que bloqueen automáticamente esos horarios para que los pacientes no puedan agendar citas en esos rangos de tiempo.

#### Criterios de Aceptación

1. THE HIS SHALL crear una nueva entidad Evento_Personal (DoctorEvent) que contenga los campos: Id (PK, long), DoctorId (FK a User, long), Title (título del evento, string, 3–200 caracteres), Description (descripción opcional, string, máximo 500 caracteres), StartDate (fecha y hora de inicio, DateTime), EndDate (fecha y hora de fin, DateTime), EventType (tipo de evento: 0=Reunión, 1=Descanso, 2=Capacitación, 3=Personal, 4=Otro), IsAllDay (indica si es evento de día completo, bool), y campos de auditoría estándar (State, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy).

2. THE HIS SHALL exponer un controlador DoctorEventController con ruta `api/v1/DoctorEvent`, decorado con `[ModuleInfo]` para sincronización automática de permisos, que soporte las operaciones CRUD estándar del patrón EntityService.

3. WHEN un médico crea un Evento_Personal desde el Calendario_Doctor, THE HIS SHALL validar que StartDate sea anterior a EndDate y que el rango de tiempo no se superponga con otro Evento_Personal existente del mismo médico.

4. THE Calendario_Doctor SHALL mostrar los eventos personales del médico junto con las citas, diferenciándolos visualmente mediante un color y estilo distintos a los de las citas.

5. WHEN un paciente intenta agendar una cita en un horario que se superpone con un Evento_Personal activo (State=1) del médico asignado, THE HIS SHALL excluir esos horarios de la disponibilidad mostrada al paciente, impidiendo la reserva en esos rangos de tiempo.

6. THE HIS SHALL permitir al médico editar y eliminar (desactivar State=0) sus eventos personales desde el Calendario_Doctor.

7. WHEN un médico crea un evento de tipo IsAllDay=true, THE HIS SHALL bloquear la disponibilidad del médico para todo el día seleccionado, desde las 00:00 hasta las 23:59 de esa fecha.

8. THE HIS SHALL validar que el DoctorId del Evento_Personal corresponda al usuario autenticado, impidiendo que un médico cree eventos en el calendario de otro médico.

---

### Requisito 3: Tareas y Recordatorios Personales del Doctor

**User Story:** Como médico del hospital, quiero agregar tareas y recordatorios personales a mi calendario (seguimientos de pacientes, llamadas pendientes, pendientes administrativos), para gestionar mis actividades diarias de forma organizada.

#### Criterios de Aceptación

1. THE HIS SHALL crear una nueva entidad Tarea_Doctor (DoctorTask) que contenga los campos: Id (PK, long), DoctorId (FK a User, long), Title (título de la tarea, string, 3–200 caracteres), Description (descripción opcional, string, máximo 1000 caracteres), DueDate (fecha límite, DateTime), IsCompleted (indica si la tarea fue completada, bool, default false), Priority (prioridad: 0=Baja, 1=Normal, 2=Alta), y campos de auditoría estándar (State, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy).

2. THE HIS SHALL exponer un controlador DoctorTaskController con ruta `api/v1/DoctorTask`, decorado con `[ModuleInfo]` para sincronización automática de permisos, que soporte las operaciones CRUD estándar del patrón EntityService.

3. THE Calendario_Doctor SHALL mostrar las tareas del médico en la fecha correspondiente a su DueDate, diferenciándolas visualmente de las citas y los eventos personales.

4. WHEN un médico marca una tarea como completada (IsCompleted=true) desde el Calendario_Doctor, THE HIS SHALL actualizar el estado de la tarea mediante una petición `PATCH /api/v1/DoctorTask` y reflejar el cambio visual en el calendario.

5. THE Calendario_Doctor SHALL mostrar un panel lateral o sección de "Tareas del Día" que liste las tareas pendientes (IsCompleted=false) para la fecha seleccionada, ordenadas por prioridad (Alta primero, Baja al final).

6. THE HIS SHALL validar que el DoctorId de la Tarea_Doctor corresponda al usuario autenticado, impidiendo que un médico cree tareas en el calendario de otro médico.

7. THE HIS SHALL permitir al médico filtrar las tareas en el panel lateral por estado: todas, pendientes (IsCompleted=false) y completadas (IsCompleted=true).

---

### Requisito 4: Tabla de Zonas Horarias en Base de Datos

**User Story:** Como administrador del sistema, quiero que las zonas horarias disponibles estén almacenadas en una tabla de la base de datos sembrada mediante una migración de Entity Framework, para tener un catálogo centralizado y consistente de zonas horarias IANA.

#### Criterios de Aceptación

1. THE HIS SHALL crear una nueva entidad Zona_Horaria (Timezone) que contenga los campos: Id (PK, long), IanaId (identificador IANA único, string, máximo 100 caracteres, por ejemplo "America/Guatemala"), DisplayName (nombre legible para el usuario, string, máximo 200 caracteres, por ejemplo "(UTC-06:00) America/Guatemala"), UtcOffset (desplazamiento respecto a UTC en formato string, por ejemplo "-06:00"), y State (int, default 1).

2. THE HIS SHALL sembrar la tabla Timezone mediante una migración de Entity Framework que inserte las zonas horarias IANA más utilizadas en América, Europa y Asia, incluyendo como mínimo: "America/Guatemala", "America/Mexico_City", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Bogota", "America/Lima", "America/Santiago", "America/Argentina/Buenos_Aires", "America/Sao_Paulo", "Europe/London", "Europe/Madrid", "Europe/Berlin", "Asia/Tokyo" y "UTC".

3. THE HIS SHALL exponer un controlador TimezoneController con ruta `api/v1/Timezone`, decorado con `[ModuleInfo]` para sincronización automática de permisos, que soporte la operación de lectura (GetAll) para que el frontend pueda obtener la lista de zonas horarias disponibles.

4. THE HIS SHALL configurar la entidad Timezone en la carpeta `Context/Config/` siguiendo el patrón de configuración existente del proyecto, con un índice único en el campo IanaId.

5. THE HIS SHALL marcar "America/Guatemala" como la zona horaria por defecto del sistema, identificable por su IanaId en la tabla Timezone.

---

### Requisito 5: Preferencia de Zona Horaria por Usuario

**User Story:** Como usuario del HIS (personal administrativo o paciente del portal), quiero seleccionar mi zona horaria preferida desde mi perfil, para que todas las fechas y horas del sistema se muestren en mi zona horaria local.

#### Criterios de Aceptación

1. THE HIS SHALL agregar un campo TimezoneId (FK a Timezone, long, nullable) a la entidad User que almacene la referencia a la zona horaria preferida del usuario.

2. WHEN un usuario no tiene una zona horaria configurada (TimezoneId es null), THE HIS SHALL utilizar "America/Guatemala" como zona horaria por defecto para ese usuario.

3. THE Panel_Administrativo SHALL mostrar un selector de zona horaria en la sección de configuración del usuario (accesible desde el menú de usuario o perfil) que liste todas las zonas horarias activas (State=1) de la tabla Timezone, mostrando el DisplayName de cada una.

4. THE Portal_Paciente SHALL mostrar un selector de zona horaria en la vista de perfil del paciente (`/portal/profile`) que liste todas las zonas horarias activas (State=1) de la tabla Timezone.

5. WHEN un usuario selecciona una zona horaria y guarda su preferencia, THE HIS SHALL actualizar User.TimezoneId mediante una petición `PATCH /api/v1/User` con el Id de la zona horaria seleccionada.

6. WHEN un usuario inicia sesión exitosamente, THE HIS SHALL incluir el IanaId de la zona horaria preferida del usuario (o "America/Guatemala" si TimezoneId es null) en la respuesta de autenticación, para que el frontend pueda configurar la zona horaria de visualización.

7. THE HIS SHALL validar que el TimezoneId proporcionado en la actualización del usuario corresponda a una Timezone activa (State=1) existente en la base de datos.

---

### Requisito 6: Integración de Zona Horaria con el Frontend

**User Story:** Como usuario del HIS, quiero que todas las fechas y horas mostradas en la interfaz se conviertan automáticamente a mi zona horaria preferida, para ver la información temporal en mi contexto local sin necesidad de cálculos manuales.

#### Criterios de Aceptación

1. THE HIS SHALL modificar `dateFormatter.ts` para que `APP_TIMEZONE` lea la zona horaria preferida del usuario autenticado en lugar de utilizar el valor hardcodeado "America/Guatemala".

2. WHEN el usuario inicia sesión, THE HIS SHALL almacenar el IanaId de la zona horaria del usuario en el estado de autenticación del frontend (contexto de auth o localStorage) para que `dateFormatter.ts` pueda acceder a este valor.

3. WHILE un usuario no ha iniciado sesión o no tiene zona horaria configurada, THE HIS SHALL utilizar "America/Guatemala" como zona horaria por defecto en `dateFormatter.ts`.

4. WHEN el usuario cambia su zona horaria preferida desde el perfil, THE HIS SHALL actualizar el valor de zona horaria en el estado del frontend y todas las fechas visibles en la interfaz SHALL reflejar la nueva zona horaria sin necesidad de recargar la página completa.

5. THE HIS SHALL mantener la compatibilidad con todas las funciones existentes de `dateFormatter.ts` (formatDate, formatDateTime, formatDateTimeFull, formatTime, formatDateLong, formatDateShort, formatDateTimeLong), utilizando la zona horaria del usuario en lugar de la constante hardcodeada.

6. THE HIS SHALL almacenar todas las fechas en la base de datos en UTC y realizar la conversión a la zona horaria del usuario exclusivamente en la capa de presentación (frontend), sin modificar las fechas almacenadas en el backend.

---

### Requisito 7: Notificaciones por Correo de Recordatorio para el Doctor

**User Story:** Como médico del hospital, quiero recibir notificaciones por correo electrónico que me recuerden mis citas, eventos personales y tareas próximas, para no perder ningún compromiso de mi agenda diaria.

#### Criterios de Aceptación

1. THE HIS SHALL enviar un correo electrónico de resumen diario al médico al inicio de cada jornada laboral (configurable, por defecto a las 06:00 UTC-6) que liste todas las citas, eventos personales y tareas programadas para ese día, ordenadas cronológicamente.

2. THE HIS SHALL enviar un correo electrónico de recordatorio al médico **1 hora antes** de cada cita confirmada (Appointment con estado Confirmada), evento personal (DoctorEvent con State=1) y tarea con hora específica (DoctorTask con DueDate que incluya hora), indicando el tipo de actividad, título, hora programada y paciente (si aplica).

3. THE HIS SHALL enviar un correo electrónico de recordatorio al médico **15 minutos antes** de cada cita confirmada y evento personal, como último aviso antes de la actividad.

4. THE HIS SHALL utilizar las plantillas de correo profesionales existentes del sistema (EmailTemplateService) para los correos de recordatorio, creando nuevos tipos de plantilla: `DailyAgendaSummary`, `AppointmentReminder` y `EventReminder`.

5. THE HIS SHALL implementar los recordatorios mediante un servicio de background (IHostedService) que se ejecute periódicamente (cada 5 minutos) y verifique qué recordatorios deben enviarse según la hora actual y las actividades programadas.

6. THE HIS SHALL registrar cada recordatorio enviado en la tabla NotificationLog existente, con el tipo de notificación correspondiente (DailyAgenda, Reminder1h, Reminder15m), para evitar envíos duplicados y mantener trazabilidad.

7. IF un médico no tiene citas, eventos ni tareas programadas para un día determinado, THEN THE HIS SHALL omitir el envío del correo de resumen diario para ese médico en esa fecha.

8. THE HIS SHALL respetar la zona horaria preferida del médico (Requisito 5) al calcular los momentos de envío de los recordatorios, de modo que "1 hora antes" y "15 minutos antes" se calculen respecto a la hora local del médico.

9. WHEN un paciente agenda una nueva cita con un médico, THE HIS SHALL enviar una notificación inmediata al médico informándole de la nueva cita, incluyendo: nombre del paciente, fecha y hora de la cita, especialidad y motivo de consulta.

10. WHEN un evento personal o tarea es creado o modificado, THE HIS SHALL recalcular los momentos de envío de recordatorios para esa actividad, cancelando recordatorios pendientes obsoletos y programando los nuevos.

