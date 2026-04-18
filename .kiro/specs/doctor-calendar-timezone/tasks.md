# Plan de Implementación: Calendario del Doctor, Zona Horaria y Notificaciones de Recordatorio

## Resumen

Este plan cubre la implementación de tres áreas complementarias del HIS: (1) Calendario/Agenda del Doctor con entidades DoctorEvent y DoctorTask, vista de calendario con FullCalendar y bloqueo de disponibilidad; (2) Zona Horaria Configurable con entidad Timezone, preferencia por usuario, integración con AuthResponse y dateFormatter.ts dinámico; (3) Notificaciones de Recordatorio con servicio de background DoctorAgendaReminderService, plantillas de email y registro en NotificationLog. Backend en C# (ASP.NET Core 8) y frontend en TypeScript (React 19 + HeroUI + TailwindCSS).

## Tareas

- [x] 1. Área 1 — Backend: Entidad DoctorEvent y patrón CRUD completo
  - [x] 1.1 Crear entidad `DoctorEvent` en `hospital.Server/Entities/Models/`
    - Crear clase que herede de `IEntity<long>` con propiedades: `Id`, `DoctorId` (FK a User), `Title` (string, 3–200 chars), `Description` (string?, max 500 chars), `StartDate` (DateTime), `EndDate` (DateTime), `EventType` (int, 0=Reunión, 1=Descanso, 2=Capacitación, 3=Personal, 4=Otro), `IsAllDay` (bool), campos de auditoría estándar (`State`, `CreatedAt`, `CreatedBy`, `UpdatedBy`, `UpdatedAt`)
    - Agregar propiedad de navegación: `virtual User? Doctor`
    - _Requisitos: 2.1_

  - [x] 1.2 Crear configuración de entidad `DoctorEventConfiguration` en `hospital.Server/Context/Config/`
    - Configurar tabla "DoctorEvents", clave primaria con `ValueGeneratedOnAdd`
    - `Title` max 200 chars requerido, `Description` max 500 chars, `StartDate` y `EndDate` requeridos, `EventType` requerido
    - Configurar FK a `User` con `OnDelete(DeleteBehavior.Restrict)`
    - Crear índices en `DoctorId`, `StartDate`, `EndDate`
    - Registrar `DbSet<DoctorEvent>` en `DataContext`
    - _Requisitos: 2.1_

  - [x] 1.3 Crear DTOs `DoctorEventRequest` y `DoctorEventResponse`
    - `DoctorEventRequest` en `hospital.Server/Entities/Request/`: implementar `IRequest<long?>` con todas las propiedades nullable
    - `DoctorEventResponse` en `hospital.Server/Entities/Response/`: propiedades tipadas con `StartDate`, `EndDate`, `CreatedAt`, `UpdatedAt` como string, incluir `DoctorName` para display
    - _Requisitos: 2.1, 2.2_

  - [x] 1.4 Crear validadores para DoctorEvent
    - `CreateDoctorEventValidator` (hereda `CreateValidator<DoctorEventRequest>`): `DoctorId` requerido, `Title` requerido (3–200 chars), `StartDate` requerido, `EndDate` requerido, `EventType` requerido (0–4)
    - `UpdateDoctorEventValidator` (hereda `UpdateValidator<DoctorEventRequest>`): mismas reglas + `Id` requerido
    - `PartialDoctorEventValidator` (hereda `PartialUpdateValidator<DoctorEventRequest>`): solo valida campos presentes
    - Registrar los 3 validadores en `ValidationsGroup.cs` con `AddKeyedScoped`
    - _Requisitos: 2.1, 2.3_

  - [x] 1.5 Crear mappers Mapster para DoctorEvent en `MapsterConfig.cs`
    - `TypeAdapterConfig<DoctorEventRequest, DoctorEvent>.NewConfig()` — Request → Entity
    - `TypeAdapterConfig<DoctorEvent, DoctorEventResponse>.NewConfig()` — Entity → Response, mapear `DoctorName` desde `Doctor.Name`
    - `TypeAdapterConfig<DoctorEvent, DoctorEvent>.NewConfig()` — Entity → Entity para actualizaciones parciales
    - _Requisitos: 2.1_

  - [x] 1.6 Registrar `EntityService<DoctorEvent>` en `ServicesGroup.cs` y crear controlador
    - Agregar `services.AddScoped<IEntityService<DoctorEvent, DoctorEventRequest, long>, EntityService<DoctorEvent, DoctorEventRequest, long>>()`
    - Crear `DoctorEventController` heredando de `CrudController<DoctorEvent, DoctorEventRequest, DoctorEventResponse, long>` con ruta `api/v1/[controller]`
    - Decorar con `[ModuleInfo(DisplayName = "Eventos del Doctor", Description = "Gestión de eventos personales y bloqueos de disponibilidad del médico", Icon = "bi-calendar-event", Path = "doctor-event", Order = 20, IsVisible = false)]`
    - _Requisitos: 2.2_

  - [x] 1.7 Crear `DoctorEventBeforeCreateInterceptor` en `hospital.Server/Interceptors/`
    - Validar que `StartDate < EndDate`, rechazar con "La fecha de inicio debe ser anterior a la fecha de fin"
    - Validar que no exista superposición con otro `DoctorEvent` activo (State=1) del mismo `DoctorId`
    - Si `IsAllDay=true`, ajustar `StartDate` a 00:00 UTC y `EndDate` a 23:59 UTC de la fecha seleccionada
    - Validar que `DoctorId` corresponda al usuario autenticado (desde JWT claims), rechazar con 403 si no coincide
    - Registrar interceptor en `ServicesGroup.cs`
    - _Requisitos: 2.3, 2.7, 2.8_

  - [ ]* 1.8 Escribir property tests para DoctorEvent (backend, FsCheck + xUnit)
    - **Property 3: DoctorEvent date validation and overlap detection** — Verificar que `StartDate >= EndDate` es rechazado y que eventos superpuestos del mismo doctor son rechazados
    - **Validates: Requirements 2.3**
    - **Property 5: IsAllDay events span full day** — Verificar que eventos con `IsAllDay=true` ajustan StartDate a 00:00 y EndDate a 23:59
    - **Validates: Requirements 2.7**
    - **Property 6: Ownership validation for doctor entities** — Verificar que `DoctorId != userId` es rechazado
    - **Validates: Requirements 2.8, 3.6**

- [x] 2. Área 1 — Backend: Entidad DoctorTask y patrón CRUD completo
  - [x] 2.1 Crear entidad `DoctorTask` en `hospital.Server/Entities/Models/`
    - Crear clase que herede de `IEntity<long>` con propiedades: `Id`, `DoctorId` (FK a User), `Title` (string, 3–200 chars), `Description` (string?, max 1000 chars), `DueDate` (DateTime), `IsCompleted` (bool, default false), `Priority` (int, 0=Baja, 1=Normal, 2=Alta), campos de auditoría estándar
    - Agregar propiedad de navegación: `virtual User? Doctor`
    - _Requisitos: 3.1_

  - [x] 2.2 Crear configuración de entidad `DoctorTaskConfiguration` en `hospital.Server/Context/Config/`
    - Configurar tabla "DoctorTasks", clave primaria con `ValueGeneratedOnAdd`
    - `Title` max 200 chars requerido, `Description` max 1000 chars, `DueDate` requerido, `Priority` default 1, `IsCompleted` default false
    - Configurar FK a `User` con `OnDelete(DeleteBehavior.Restrict)`
    - Crear índices en `DoctorId`, `DueDate`, `IsCompleted`
    - Registrar `DbSet<DoctorTask>` en `DataContext`
    - _Requisitos: 3.1_

  - [x] 2.3 Crear DTOs `DoctorTaskRequest` y `DoctorTaskResponse`
    - `DoctorTaskRequest` en `hospital.Server/Entities/Request/`: implementar `IRequest<long?>` con todas las propiedades nullable
    - `DoctorTaskResponse` en `hospital.Server/Entities/Response/`: propiedades tipadas con `DueDate`, `CreatedAt`, `UpdatedAt` como string, incluir `DoctorName` para display
    - _Requisitos: 3.1, 3.2_

  - [x] 2.4 Crear validadores para DoctorTask
    - `CreateDoctorTaskValidator` (hereda `CreateValidator<DoctorTaskRequest>`): `DoctorId` requerido, `Title` requerido (3–200 chars), `DueDate` requerido, `Priority` requerido (0–2)
    - `UpdateDoctorTaskValidator` (hereda `UpdateValidator<DoctorTaskRequest>`): mismas reglas + `Id` requerido
    - `PartialDoctorTaskValidator` (hereda `PartialUpdateValidator<DoctorTaskRequest>`): solo valida campos presentes
    - Registrar los 3 validadores en `ValidationsGroup.cs` con `AddKeyedScoped`
    - _Requisitos: 3.1_

  - [x] 2.5 Crear mappers Mapster para DoctorTask en `MapsterConfig.cs`
    - `TypeAdapterConfig<DoctorTaskRequest, DoctorTask>.NewConfig()` — Request → Entity
    - `TypeAdapterConfig<DoctorTask, DoctorTaskResponse>.NewConfig()` — Entity → Response, mapear `DoctorName` desde `Doctor.Name`
    - `TypeAdapterConfig<DoctorTask, DoctorTask>.NewConfig()` — Entity → Entity para actualizaciones parciales
    - _Requisitos: 3.1_

  - [x] 2.6 Registrar `EntityService<DoctorTask>` en `ServicesGroup.cs` y crear controlador
    - Agregar `services.AddScoped<IEntityService<DoctorTask, DoctorTaskRequest, long>, EntityService<DoctorTask, DoctorTaskRequest, long>>()`
    - Crear `DoctorTaskController` heredando de `CrudController<DoctorTask, DoctorTaskRequest, DoctorTaskResponse, long>` con ruta `api/v1/[controller]`
    - Decorar con `[ModuleInfo(DisplayName = "Tareas del Doctor", Description = "Gestión de tareas y recordatorios personales del médico", Icon = "bi-check2-square", Path = "doctor-task", Order = 21, IsVisible = false)]`
    - _Requisitos: 3.2_

  - [x] 2.7 Crear `DoctorTaskBeforeCreateInterceptor` en `hospital.Server/Interceptors/`
    - Validar que `DoctorId` corresponda al usuario autenticado (desde JWT claims), rechazar con 403 si no coincide
    - Registrar interceptor en `ServicesGroup.cs`
    - _Requisitos: 3.6_

  - [ ]* 2.8 Escribir property tests para DoctorTask (backend, FsCheck + xUnit)
    - **Property 7: Task priority sorting** — Verificar que ordenar por prioridad descendente produce Alta(2) > Normal(1) > Baja(0)
    - **Validates: Requirements 3.5**
    - **Property 8: Task status filtering** — Verificar que filtrar por "pending" retorna solo `IsCompleted=false`, "completed" solo `IsCompleted=true`, "all" retorna todas
    - **Validates: Requirements 3.7**

- [x] 3. Área 1 — Backend: Bloqueo de disponibilidad por eventos del doctor
  - [x] 3.1 Extender `AppointmentBeforeCreateInterceptor` para verificar superposición con DoctorEvent
    - Al crear una cita, consultar `DoctorEvents` activos (State=1) del doctor cuyo rango `[StartDate, EndDate]` se superponga con la hora de la cita
    - Si existe superposición, rechazar con "El médico tiene un bloqueo de disponibilidad en ese horario"
    - Aplica tanto para citas del panel administrativo como del portal del paciente
    - _Requisitos: 2.5_

  - [ ]* 3.2 Escribir property test para bloqueo de disponibilidad (backend, FsCheck + xUnit)
    - **Property 4: Availability blocking on DoctorEvent overlap** — Verificar que citas en horarios superpuestos con DoctorEvent activo son rechazadas
    - **Validates: Requirements 2.5**

- [x] 4. Checkpoint — Verificar compilación del backend Área 1 (DoctorEvent + DoctorTask + Bloqueo)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.


- [x] 5. Área 2 — Backend: Entidad Timezone y patrón CRUD completo
  - [x] 5.1 Crear entidad `Timezone` en `hospital.Server/Entities/Models/`
    - Crear clase que herede de `IEntity<long>` con propiedades: `Id`, `IanaId` (string, max 100 chars), `DisplayName` (string, max 200 chars), `UtcOffset` (string, max 10 chars), campos de auditoría estándar (`State`, `CreatedAt`, `CreatedBy`, `UpdatedBy`, `UpdatedAt`)
    - _Requisitos: 4.1_

  - [x] 5.2 Crear configuración de entidad `TimezoneConfiguration` en `hospital.Server/Context/Config/`
    - Configurar tabla "Timezones", clave primaria con `ValueGeneratedOnAdd`
    - `IanaId` max 100 chars requerido, `DisplayName` max 200 chars requerido, `UtcOffset` max 10 chars requerido
    - Crear índice único en `IanaId`
    - Registrar `DbSet<Timezone>` en `DataContext`
    - _Requisitos: 4.1, 4.4_

  - [x] 5.3 Crear migración EF con seed de zonas horarias
    - Insertar las 16 zonas horarias IANA requeridas usando `migrationBuilder.InsertData()`: America/Guatemala, America/Mexico_City, America/New_York, America/Chicago, America/Denver, America/Los_Angeles, America/Bogota, America/Lima, America/Santiago, America/Argentina/Buenos_Aires, America/Sao_Paulo, Europe/London, Europe/Madrid, Europe/Berlin, Asia/Tokyo, UTC
    - Incluir `DisplayName` con formato "(UTC±XX:00) IanaId" y `UtcOffset` para cada zona
    - Marcar "America/Guatemala" como zona horaria por defecto del sistema (Id=1)
    - _Requisitos: 4.2, 4.5_

  - [x] 5.4 Crear DTOs `TimezoneRequest` y `TimezoneResponse`
    - `TimezoneRequest` en `hospital.Server/Entities/Request/`: implementar `IRequest<long?>` con todas las propiedades nullable
    - `TimezoneResponse` en `hospital.Server/Entities/Response/`: propiedades `Id`, `IanaId`, `DisplayName`, `UtcOffset`, `State`
    - _Requisitos: 4.1, 4.3_

  - [x] 5.5 Crear validadores para Timezone
    - `CreateTimezoneValidator` (hereda `CreateValidator<TimezoneRequest>`): `IanaId` requerido (max 100), `DisplayName` requerido (max 200), `UtcOffset` requerido
    - `UpdateTimezoneValidator` (hereda `UpdateValidator<TimezoneRequest>`): mismas reglas + `Id` requerido
    - `PartialTimezoneValidator` (hereda `PartialUpdateValidator<TimezoneRequest>`): solo valida campos presentes
    - Registrar los 3 validadores en `ValidationsGroup.cs` con `AddKeyedScoped`
    - _Requisitos: 4.1_

  - [x] 5.6 Crear mappers Mapster para Timezone en `MapsterConfig.cs`
    - `TypeAdapterConfig<TimezoneRequest, Timezone>.NewConfig()` — Request → Entity
    - `TypeAdapterConfig<Timezone, TimezoneResponse>.NewConfig()` — Entity → Response
    - `TypeAdapterConfig<Timezone, Timezone>.NewConfig()` — Entity → Entity para actualizaciones parciales
    - _Requisitos: 4.1_

  - [x] 5.7 Registrar `EntityService<Timezone>` en `ServicesGroup.cs` y crear controlador
    - Agregar `services.AddScoped<IEntityService<Timezone, TimezoneRequest, long>, EntityService<Timezone, TimezoneRequest, long>>()`
    - Crear `TimezoneController` heredando de `CrudController<Timezone, TimezoneRequest, TimezoneResponse, long>` con ruta `api/v1/[controller]`
    - Decorar con `[ModuleInfo(DisplayName = "Zonas Horarias", Description = "Catálogo de zonas horarias IANA del sistema", Icon = "bi-globe", Path = "timezone", Order = 22, IsVisible = false)]`
    - _Requisitos: 4.3_

- [x] 6. Área 2 — Backend: Preferencia de zona horaria en User y AuthResponse
  - [x] 6.1 Modificar entidad `User` para agregar campo `TimezoneId`
    - Agregar `long? TimezoneId` y `virtual Timezone? Timezone` en `User.cs`
    - Actualizar `UserConfiguration.cs`: agregar FK a Timezone con `OnDelete(DeleteBehavior.SetNull)`, `IsRequired(false)`
    - Crear migración EF para agregar columna `TimezoneId` y FK
    - _Requisitos: 5.1_

  - [x] 6.2 Actualizar DTOs de User para incluir zona horaria
    - Agregar `long? TimezoneId` en `UserRequest.cs`
    - Agregar `long? TimezoneId`, `string? TimezoneIanaId`, `string? TimezoneDisplayName` en `UserResponse.cs`
    - Actualizar mapper de `User → UserResponse` para mapear `TimezoneIanaId` desde `Timezone.IanaId` y `TimezoneDisplayName` desde `Timezone.DisplayName`
    - _Requisitos: 5.1, 5.3, 5.5_

  - [x] 6.3 Modificar `AuthResponse` y `AuthService` para incluir zona horaria en login
    - Agregar `string TimezoneIanaId = "America/Guatemala"` en `AuthResponse.cs`
    - En `AuthService` (método Login): hacer `Include(u => u.Timezone)` en la consulta del usuario y asignar `TimezoneIanaId = user.Timezone?.IanaId ?? "America/Guatemala"`
    - _Requisitos: 5.6_

  - [ ]* 6.4 Escribir property tests para zona horaria en User y Auth (backend, FsCheck + xUnit)
    - **Property 9: Default timezone fallback** — Verificar que usuario con `TimezoneId=null` resuelve a "America/Guatemala"
    - **Validates: Requirements 5.2**
    - **Property 10: AuthResponse timezone correctness** — Verificar que `AuthResponse.TimezoneIanaId` es correcto según `User.Timezone.IanaId` o fallback
    - **Validates: Requirements 5.6**
    - **Property 11: TimezoneId validation on user update** — Verificar que `TimezoneId` inválido o inactivo es rechazado
    - **Validates: Requirements 5.7**

- [x] 7. Checkpoint — Verificar compilación del backend Área 2 (Timezone + User + Auth)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.


- [x] 8. Área 3 — Backend: Servicio de background DoctorAgendaReminderService
  - [x] 8.1 Crear nuevos tipos de plantilla de email para recordatorios
    - Extender `EmailTemplateType` con valores: `DailyAgendaSummary=4`, `AppointmentReminder=5`, `EventReminder=6`, `NewAppointmentNotification=7`
    - Crear plantillas HTML en `EmailTemplateService` para cada tipo:
      - `DailyAgendaSummary`: placeholders `{{NombreDoctor}}`, `{{Fecha}}`, `{{TablaCitas}}`, `{{TablaEventos}}`, `{{TablaTareas}}`
      - `AppointmentReminder`: placeholders `{{NombreDoctor}}`, `{{TiempoRestante}}`, `{{NombrePaciente}}`, `{{Especialidad}}`, `{{HoraCita}}`, `{{Sucursal}}`
      - `EventReminder`: placeholders `{{NombreDoctor}}`, `{{TiempoRestante}}`, `{{TituloEvento}}`, `{{TipoEvento}}`, `{{HoraInicio}}`, `{{HoraFin}}`
      - `NewAppointmentNotification`: placeholders `{{NombreDoctor}}`, `{{NombrePaciente}}`, `{{FechaCita}}`, `{{HoraCita}}`, `{{Especialidad}}`, `{{MotivoCita}}`
    - _Requisitos: 7.4_

  - [x] 8.2 Crear `DoctorAgendaReminderService` en `hospital.Server/Services/Background/`
    - Implementar como `BackgroundService` que se ejecuta cada 5 minutos
    - Para cada médico activo (User con rol de médico, State=1):
      - Obtener zona horaria del médico (`User.Timezone.IanaId ?? "America/Guatemala"`)
      - Convertir hora UTC a hora local usando `TimeZoneInfo.FindSystemTimeZoneById(ianaId)`
      - **Resumen diario**: Si hora local ≈ 06:00 (ventana 05:55–06:05) y no se envió hoy → consultar citas, eventos y tareas del día → enviar correo `DailyAgendaSummary` → registrar en `NotificationLog` (NotificationType=7)
      - **Recordatorio 1h**: Para cada cita/evento que inicie en 55–65 minutos → enviar `AppointmentReminder`/`EventReminder` → registrar en `NotificationLog` (NotificationType=8 para citas, 11 para eventos)
      - **Recordatorio 15m**: Para cada cita/evento que inicie en 10–20 minutos → enviar recordatorio → registrar en `NotificationLog` (NotificationType=9 para citas, 12 para eventos)
    - Omitir resumen diario si el médico no tiene actividades programadas para ese día
    - Verificar `NotificationLog` antes de enviar para evitar duplicados
    - Registrar errores de envío en `NotificationLog` con Status=2 (Failed) sin interrumpir el servicio
    - Registrar `DoctorAgendaReminderService` como `AddHostedService` en `ServicesGroup.cs`
    - _Requisitos: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 7.8_

  - [x] 8.3 Crear interceptor de notificación inmediata al agendar nueva cita
    - Crear `AppointmentAfterCreateNotifyDoctorInterceptor` en `hospital.Server/Interceptors/`
    - Después de crear una cita con `DoctorId` asignado: obtener datos del médico (email, nombre, zona horaria), enviar correo con plantilla `NewAppointmentNotification`, registrar en `NotificationLog` (NotificationType=10)
    - Registrar interceptor en `ServicesGroup.cs`
    - _Requisitos: 7.9_

  - [x] 8.4 Crear interceptor para recalcular recordatorios al modificar evento/tarea
    - Cuando un DoctorEvent o DoctorTask es creado o modificado, cancelar recordatorios pendientes obsoletos (marcar NotificationLog existentes como Status=0) y permitir que el servicio de background programe los nuevos
    - _Requisitos: 7.10_

  - [ ]* 8.5 Escribir property tests para recordatorios (backend, FsCheck + xUnit)
    - **Property 13: Reminder window calculation is timezone-aware** — Verificar que la conversión UTC → local y las ventanas de 1h y 15m son correctas para cualquier zona horaria
    - **Validates: Requirements 7.2, 7.3, 7.8**
    - **Property 14: Reminder deduplication via NotificationLog** — Verificar que si ya existe un NotificationLog con mismo tipo y entidad, no se envía duplicado
    - **Validates: Requirements 7.6**
    - **Property 15: Skip daily summary for empty agenda** — Verificar que médicos sin actividades no reciben resumen diario
    - **Validates: Requirements 7.7**

- [x] 9. Checkpoint — Verificar compilación del backend Área 3 (Notificaciones)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.


- [x] 10. Área 1 — Frontend: Tipos, servicios y página del Calendario del Doctor
  - [x] 10.1 Crear tipos TypeScript para DoctorEvent y DoctorTask
    - Crear `DoctorEventRequest`, `DoctorEventResponse` en `hospital.client/src/types/`
    - Crear `DoctorTaskRequest`, `DoctorTaskResponse` en `hospital.client/src/types/`
    - Crear constantes `EventTypeLabels` con mapeo de valores numéricos a nombres en español y colores (0=Reunión, 1=Descanso, 2=Capacitación, 3=Personal, 4=Otro)
    - Crear constantes `PriorityLabels` con mapeo (0=Baja, 1=Normal, 2=Alta) y colores
    - _Requisitos: 1.4, 2.1, 3.1_

  - [x] 10.2 Crear servicios frontend `doctorEventService.ts` y `doctorTaskService.ts`
    - Implementar funciones CRUD para DoctorEvent: `getDoctorEvents`, `getDoctorEvent`, `createDoctorEvent`, `updateDoctorEvent`, `deleteDoctorEvent`, `patchDoctorEvent`
    - Implementar funciones CRUD para DoctorTask: `getDoctorTasks`, `getDoctorTask`, `createDoctorTask`, `updateDoctorTask`, `deleteDoctorTask`, `patchDoctorTask`
    - Usar `API_URL + "DoctorEvent"` y `API_URL + "DoctorTask"` como base URL
    - _Requisitos: 2.2, 2.6, 3.2, 3.4_

  - [x] 10.3 Instalar paquetes de FullCalendar y crear página `DoctorCalendarPage.tsx`
    - Instalar: `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`
    - Crear página en `hospital.client/src/pages/doctor-calendar/DoctorCalendarPage.tsx`
    - Configurar FullCalendar con plugins: `dayGridPlugin` (mes), `timeGridPlugin` (día/semana), `interactionPlugin` (click)
    - Soportar vistas: `timeGridDay` (día), `timeGridWeek` (semana), `dayGridMonth` (mes)
    - Registrar ruta `/doctor-calendar` en el router del panel administrativo
    - Agregar enlace en el menú lateral para usuarios con rol de médico
    - _Requisitos: 1.1, 1.3_

  - [x] 10.4 Implementar carga de datos y diferenciación visual en el calendario
    - Al cambiar rango de fechas visible, cargar datos de tres fuentes:
      - `GET /api/v1/Appointment?filters=DoctorId=={userId},AppointmentDate>={start},AppointmentDate<={end}`
      - `GET /api/v1/DoctorEvent?filters=DoctorId=={userId},StartDate<={end},EndDate>={start},State==1`
      - `GET /api/v1/DoctorTask?filters=DoctorId=={userId},DueDate>={start},DueDate<={end},State==1`
    - Mapear cada tipo a eventos de FullCalendar con colores diferenciados:
      - Citas: azul (pendiente), verde (confirmada), amarillo (en progreso), gris (completada)
      - Eventos personales: morado
      - Tareas: naranja (pendiente), gris tachado (completada)
    - Mostrar para cada cita: hora programada, nombre del paciente, especialidad y estado con código de color
    - Actualizar automáticamente al cambiar vista o navegar a otro rango de fechas
    - _Requisitos: 1.2, 1.4, 1.6, 1.7, 2.4_

  - [x] 10.5 Implementar interacciones del calendario (click en eventos, modales)
    - Click en cita → redirigir a `/dashboard` (DoctorDashboardPage existente)
    - Click en evento personal → abrir modal de edición del evento con formulario (título, descripción, tipo, fechas, isAllDay)
    - Click en tarea → abrir modal de edición/completar tarea
    - Crear modal de creación de evento personal con validaciones (título 3–200 chars, StartDate < EndDate, EventType 0–4)
    - Crear modal de creación de tarea con validaciones (título 3–200 chars, DueDate requerido, Priority 0–2)
    - Permitir editar y eliminar (desactivar State=0) eventos personales desde el calendario
    - _Requisitos: 1.5, 2.3, 2.6, 3.4_

  - [x] 10.6 Implementar panel lateral "Tareas del Día"
    - Crear panel lateral que liste las tareas pendientes (`IsCompleted=false`) para la fecha seleccionada
    - Ordenar por prioridad: Alta (2) primero, Normal (1), Baja (0) al final
    - Permitir marcar tarea como completada (`IsCompleted=true`) mediante `PATCH /api/v1/DoctorTask` y reflejar cambio visual
    - Implementar filtro por estado: todas, pendientes, completadas
    - _Requisitos: 3.3, 3.4, 3.5, 3.7_

  - [ ]* 10.7 Escribir property tests para el calendario (frontend, fast-check + Vitest)
    - **Property 1: Appointment filtering by DoctorId** — Verificar que filtrar citas por DoctorId retorna solo citas del doctor correcto
    - **Validates: Requirements 1.2**
    - **Property 2: Date range filtering returns bounded results** — Verificar que filtrar por rango de fechas retorna solo citas dentro del rango
    - **Validates: Requirements 1.6**

- [x] 11. Checkpoint — Verificar compilación frontend Área 1 (Calendario del Doctor)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.


- [x] 12. Área 2 — Frontend: Integración de zona horaria con dateFormatter y selector
  - [x] 12.1 Actualizar `InitialAuth.ts` y `constants.ts` para incluir zona horaria
    - Agregar campo `timezoneIanaId: string` en la interfaz `InitialAuth`
    - Agregar valor por defecto `timezoneIanaId: "America/Guatemala"` en `authInitialState` de `constants.ts`
    - Asegurar que al hacer login, el `timezoneIanaId` del `AuthResponse` se almacene en el estado de auth y `localStorage`
    - _Requisitos: 6.2_

  - [x] 12.2 Modificar `dateFormatter.ts` para leer zona horaria dinámica del usuario
    - Reemplazar la constante hardcodeada `APP_TIMEZONE = "America/Guatemala"` por función `getAppTimezone()` que lee de `localStorage` (`@auth` → `timezoneIanaId`)
    - Fallback a "America/Guatemala" si no hay sesión o falla la lectura
    - Actualizar todas las funciones de formateo (`formatDate`, `formatDateTime`, `formatDateTimeFull`, `formatTime`, `formatDateLong`, `formatDateShort`, `formatDateTimeLong`) para usar `getAppTimezone()` en lugar de la constante
    - Mantener compatibilidad con todas las funciones existentes
    - _Requisitos: 6.1, 6.3, 6.5_

  - [x] 12.3 Crear componente `TimezoneSelector.tsx` y crear servicio `timezoneService.ts`
    - Crear `timezoneService.ts` en `hospital.client/src/services/` con funciones CRUD usando `API_URL + "Timezone"`
    - Crear tipos `TimezoneRequest` y `TimezoneResponse` en `hospital.client/src/types/`
    - Crear componente `TimezoneSelector.tsx` usando `<Select>` de HeroUI
    - Cargar opciones desde `GET /api/v1/Timezone?filters=State==1`, mostrar `DisplayName` como label
    - Al cambiar, enviar `PATCH /api/v1/User` con `{ timezoneId: selectedId }`
    - Actualizar `timezoneIanaId` en el auth store y `localStorage` para que `dateFormatter.ts` use la nueva zona sin recargar
    - _Requisitos: 5.3, 5.4, 5.5, 6.4_

  - [x] 12.4 Integrar `TimezoneSelector` en páginas de perfil
    - Agregar `TimezoneSelector` en la sección de configuración del panel administrativo (accesible desde menú de usuario o perfil)
    - Agregar `TimezoneSelector` en la vista de perfil del portal del paciente (`/portal/profile`)
    - _Requisitos: 5.3, 5.4_

  - [ ]* 12.5 Escribir property tests para dateFormatter con zona horaria (frontend, fast-check + Vitest)
    - **Property 9: Default timezone fallback (frontend)** — Verificar que sin sesión o sin `timezoneIanaId`, `getAppTimezone()` retorna "America/Guatemala"
    - **Validates: Requirements 5.2, 6.3**
    - **Property 12: dateFormatter works with any valid IANA timezone** — Verificar que todas las funciones de formateo producen output válido para cualquier zona horaria IANA
    - **Validates: Requirements 6.1, 6.5**

- [x] 13. Checkpoint — Verificar compilación frontend Área 2 (Zona Horaria)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.

- [x] 14. Registro final de todos los servicios, validadores e interceptores en DI
  - [x] 14.1 Verificar y completar registros en `ServicesGroup.cs`
    - Confirmar registro de `EntityService<DoctorEvent, DoctorEventRequest, long>`
    - Confirmar registro de `EntityService<DoctorTask, DoctorTaskRequest, long>`
    - Confirmar registro de `EntityService<Timezone, TimezoneRequest, long>`
    - Confirmar registro de `DoctorEventBeforeCreateInterceptor`
    - Confirmar registro de `DoctorTaskBeforeCreateInterceptor`
    - Confirmar registro de `AppointmentAfterCreateNotifyDoctorInterceptor`
    - Confirmar registro de `DoctorAgendaReminderService` como `AddHostedService`
    - _Requisitos: 2.2, 3.2, 4.3, 7.5, 7.9_

  - [x] 14.2 Verificar y completar registros en `ValidationsGroup.cs`
    - Confirmar registro de validadores de DoctorEvent (Create, Update, Partial)
    - Confirmar registro de validadores de DoctorTask (Create, Update, Partial)
    - Confirmar registro de validadores de Timezone (Create, Update, Partial)
    - _Requisitos: 2.1, 3.1, 4.1_

  - [x] 14.3 Verificar mappers en `MapsterConfig.cs`
    - Confirmar mappers de DoctorEvent (Request→Entity, Entity→Response, Entity→Entity)
    - Confirmar mappers de DoctorTask (Request→Entity, Entity→Response, Entity→Entity)
    - Confirmar mappers de Timezone (Request→Entity, Entity→Response, Entity→Entity)
    - Confirmar actualización del mapper User→UserResponse para incluir campos de zona horaria
    - _Requisitos: 2.1, 3.1, 4.1, 5.1_

- [x] 15. Checkpoint final — Verificar compilación completa del proyecto
  - Ejecutar build completo del backend (`dotnet build`) y frontend (`npm run build`)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- El backend usa C# (ASP.NET Core 8) y el frontend usa TypeScript (React 19 + HeroUI + TailwindCSS)
- Se respetan las convenciones del proyecto: `EntityService` + `CrudController`, `[ModuleInfo]`, validadores con `AddKeyedScoped`, configuraciones de entidad en `Context/Config/`, mappers en `MapsterConfig.cs`
- Property tests usan FsCheck + xUnit (backend) y fast-check + Vitest (frontend)
- Todas las fechas se almacenan en UTC en la base de datos; la conversión a zona horaria del usuario se realiza exclusivamente en la capa de presentación (frontend)
- La zona horaria por defecto del sistema es "America/Guatemala" (UTC-6)
