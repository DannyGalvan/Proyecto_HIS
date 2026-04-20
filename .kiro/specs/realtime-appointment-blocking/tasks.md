# Plan de Implementación: Bloqueo de Citas en Tiempo Real con SignalR

## Resumen

Implementación de un sistema de bloqueo temporal de slots en tiempo real utilizando SignalR para prevenir la doble reservación de citas médicas. El backend usa .NET 8 con `ConcurrentDictionary` para almacenamiento en memoria y un Hub de SignalR con autenticación JWT. El frontend usa React + TypeScript con el paquete `@microsoft/signalr`, un hook reutilizable `useAppointmentHub` y la integración visual en `DynamicCalendar`.

## Tareas

- [ ] 1. Crear DTOs y modelos del backend para el sistema de bloqueo
  - [ ] 1.1 Crear los records `SlotLockEntry`, `SlotLockResult` y `SlotLockInfo` en `Hospital.Server/Entities/Dtos/`
    - `SlotLockEntry`: record con `DoctorId`, `Date`, `Time`, `PatientId`, `ConnectionId`, `ExpiresAt`
    - `SlotLockResult`: record con `Success`, `Reason`, `LockInfo`, `ReleasedPrevious`
    - `SlotLockInfo`: record con `DoctorId`, `Date` (string yyyy-MM-dd), `Time` (string HH:mm), `ExpiresAt`
    - _Requisitos: 9.2, 3.1_

- [ ] 2. Implementar la interfaz y servicio de bloqueo de slots
  - [ ] 2.1 Crear la interfaz `ISlotLockService` en `Hospital.Server/Services/Interfaces/`
    - Definir métodos: `TryLockSlot`, `ReleaseSlot`, `ReleaseAllByConnection`, `CleanExpiredLocks`, `VerifyLockOwnership`, `GetActiveLocksForGroup`
    - _Requisitos: 3.1, 3.3, 3.4, 4.2, 5.1, 5.2, 7.1, 9.1_
  - [ ] 2.2 Implementar `SlotLockService` en `Hospital.Server/Services/Core/`
    - Usar `static readonly ConcurrentDictionary<string, SlotLockEntry>` con clave formato `doctor_{id}_date_{yyyy-MM-dd}_time_{HH:mm}`
    - `TryLockSlot`: liberar bloqueo previo del mismo paciente para doctor+fecha, crear nuevo bloqueo con TTL de 300 segundos, rechazar si slot ya bloqueado por otro paciente
    - `ReleaseSlot`: liberar bloqueo solo si pertenece al paciente indicado
    - `ReleaseAllByConnection`: liberar todos los bloqueos de un connectionId
    - `CleanExpiredLocks`: eliminar bloqueos con `ExpiresAt` en el pasado
    - `VerifyLockOwnership`: verificar que el paciente posee bloqueo activo no expirado
    - `GetActiveLocksForGroup`: retornar bloqueos activos para doctor+fecha
    - _Requisitos: 3.1, 3.3, 3.4, 4.1, 4.2, 5.1, 5.2, 7.1, 7.2, 9.1, 9.2, 9.3_
  - [ ]* 2.3 Escribir test de propiedad para formato de nombre de grupo
    - **Propiedad 1: Formato de nombre de grupo SignalR**
    - **Valida: Requisito 2.1**
  - [ ]* 2.4 Escribir test de propiedad para creación de bloqueo con datos completos
    - **Propiedad 2: Creación de bloqueo almacena datos completos**
    - **Valida: Requisitos 3.1, 9.2**
  - [ ]* 2.5 Escribir test de propiedad para rechazo de conflicto
    - **Propiedad 3: Rechazo de conflicto — segundo intento de bloqueo falla**
    - **Valida: Requisito 3.3**
  - [ ]* 2.6 Escribir test de propiedad para máximo un bloqueo por paciente por doctor+fecha
    - **Propiedad 4: Máximo un bloqueo activo por paciente por doctor+fecha**
    - **Valida: Requisitos 3.4, 5.1**
  - [ ]* 2.7 Escribir test de propiedad para asignación de TTL de 300 segundos
    - **Propiedad 5: Asignación de TTL de 300 segundos**
    - **Valida: Requisito 4.1**
  - [ ]* 2.8 Escribir test de propiedad para limpieza de bloqueos expirados
    - **Propiedad 6: Limpieza elimina solo bloqueos expirados**
    - **Valida: Requisito 4.2**
  - [ ]* 2.9 Escribir test de propiedad para liberación por desconexión
    - **Propiedad 7: Desconexión libera todos los bloqueos de la conexión**
    - **Valida: Requisitos 2.3, 5.2**
  - [ ]* 2.10 Escribir test de propiedad para verificación de posesión de bloqueo
    - **Propiedad 8: Reserva de cita requiere posesión de bloqueo**
    - **Valida: Requisitos 7.1, 7.2**
  - [ ]* 2.11 Escribir test de propiedad para concurrencia — exactamente un ganador
    - **Propiedad 9: Intentos concurrentes de bloqueo — exactamente un ganador**
    - **Valida: Requisitos 7.4, 9.3**

- [ ] 3. Checkpoint — Verificar que el servicio de bloqueo compila correctamente
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [ ] 4. Implementar el Hub de SignalR y el servicio de limpieza en background
  - [ ] 4.1 Crear `AppointmentBookingHub` en `Hospital.Server/Hubs/`
    - Decorar con `[Authorize]` para requerir JWT
    - Implementar `JoinSlotGroup(long doctorId, string date)`: agregar conexión al grupo `doctor_{id}_date_{date}`, enviar bloqueos activos del grupo al cliente que se une
    - Implementar `LeaveSlotGroup(long doctorId, string date)`: remover conexión del grupo
    - Implementar `LockSlot(long doctorId, string date, string time)`: invocar `TryLockSlot`, si éxito emitir `SlotLocked` al grupo y si hubo bloqueo previo liberado emitir `SlotReleased`; si falla emitir `SlotLockRejected` al caller
    - Implementar `ReleaseSlot(long doctorId, string date, string time)`: invocar `ReleaseSlot`, emitir `SlotReleased` al grupo
    - Override `OnDisconnectedAsync`: invocar `ReleaseAllByConnection`, emitir `SlotReleased` por cada bloqueo liberado al grupo correspondiente
    - Extraer `patientId` del claim JWT del `Context.User`
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.5, 5.1, 5.2, 5.3, 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ] 4.2 Crear `SlotLockCleanupService` en `Hospital.Server/Services/Background/`
    - Heredar de `BackgroundService`, ejecutar limpieza cada 30 segundos
    - Usar `IServiceProvider.CreateScope()` para resolver `ISlotLockService`
    - Inyectar `IHubContext<AppointmentBookingHub>` para emitir `SlotReleased` por cada bloqueo expirado al grupo correspondiente
    - _Requisitos: 4.2, 4.3, 4.4_

- [ ] 5. Configurar inyección de dependencias y pipeline de SignalR
  - [ ] 5.1 Modificar `Hospital.Server/Program.cs`
    - Agregar `builder.Services.AddSignalR()` después de los servicios existentes
    - Agregar `app.MapHub<AppointmentBookingHub>("/hubs/appointment-booking")` antes del `MapFallbackToFile`
    - Configurar la autenticación JWT para SignalR: agregar evento `OnMessageReceived` en `JwtBearerEvents` para extraer el token del query string `access_token` cuando la ruta comienza con `/hubs/`
    - _Requisitos: 8.1, 8.2_
  - [ ] 5.2 Modificar `Hospital.Server/Configs/Extensions/ServicesGroup.cs`
    - Registrar `ISlotLockService` como Singleton: `services.AddSingleton<ISlotLockService, SlotLockService>()`
    - Registrar `SlotLockCleanupService` como HostedService: `services.AddHostedService<SlotLockCleanupService>()`
    - _Requisitos: 9.1, 4.4_

- [ ] 6. Modificar `PatientPortalController` para validar posesión de bloqueo
  - [ ] 6.1 Agregar inyección de `ISlotLockService` y `IHubContext<AppointmentBookingHub>` al constructor de `PatientPortalController`
    - _Requisitos: 7.1_
  - [ ] 6.2 Modificar el método `BookAppointment` para verificar lock ownership
    - Antes de crear la cita, invocar `VerifyLockOwnership(doctorId, date, time, patientId)`
    - Si no posee bloqueo, retornar 409 Conflict con mensaje descriptivo
    - Después de crear la cita exitosamente, invocar `ReleaseLock` y emitir `SlotConfirmed` al grupo vía `IHubContext`
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 5.4_

- [ ] 7. Checkpoint — Verificar que el backend compila y los endpoints están configurados
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [ ] 8. Implementar tipos TypeScript y dependencia SignalR en el frontend
  - [ ] 8.1 Instalar `@microsoft/signalr` como dependencia en `hospital.client/`
    - Ejecutar `npm install @microsoft/signalr` en el directorio `hospital.client/`
    - _Requisitos: 10.1_
  - [ ] 8.2 Crear tipos TypeScript en `hospital.client/src/types/SlotLockTypes.ts`
    - Definir interfaces: `SlotLockInfo` (doctorId, date, time, expiresAt), `SlotLockRejection` (doctorId, date, time, reason)
    - Definir type: `ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'`
    - _Requisitos: 10.3_

- [ ] 9. Implementar el hook `useAppointmentHub`
  - [ ] 9.1 Crear `hospital.client/src/hooks/useAppointmentHub.ts`
    - Crear conexión SignalR con `HubConnectionBuilder` apuntando a `/hubs/appointment-booking`
    - Configurar `accessTokenFactory` usando `usePatientAuthStore.getState().token`
    - Configurar reconexión automática con backoff exponencial: `[0, 2000, 5000, 10000, 30000]` (5 intentos)
    - Implementar `JoinSlotGroup` / `LeaveSlotGroup` al cambiar `doctorId` o `date`
    - Registrar listeners para eventos: `SlotLocked`, `SlotReleased`, `SlotLockRejected`, `SlotConfirmed`
    - Mantener estado local: `lockedSlots` (Map), `confirmedSlots` (Set), `myLockedSlot`, `connectionState`, `error`
    - Exponer funciones: `lockSlot(time)`, `releaseSlot(time)`
    - Limpiar conexión y liberar bloqueos al desmontar el componente
    - Al reconectarse: re-unirse al grupo actual y sincronizar estado
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 10.1, 10.2, 10.3, 10.4, 10.5_
  - [ ]* 9.2 Escribir unit tests para `useAppointmentHub`
    - Verificar que el hook retorna la interfaz completa (connectionState, lockedSlots, etc.)
    - Verificar que se conecta al montar y desconecta al desmontar
    - Verificar integración con `usePatientAuthStore` para obtener token JWT
    - _Requisitos: 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Integrar `useAppointmentHub` en `DynamicCalendar`
  - [ ] 10.1 Modificar `hospital.client/src/components/portal/DynamicCalendar.tsx`
    - Importar y usar `useAppointmentHub` pasando `doctorId` y la fecha seleccionada
    - Agregar tercer estado visual para slots: bloqueado temporalmente por otro paciente (amarillo/naranja, deshabilitado)
    - Mantener estado visual de selección propia (azul) diferenciado del bloqueo de otros
    - Slots confirmados permanentemente se muestran como ocupados (gris, deshabilitado)
    - Al hacer clic en un slot disponible, invocar `lockSlot(time)` en lugar de solo `setSelectedSlot`
    - Al cambiar de slot, el hook libera automáticamente el bloqueo anterior
    - Agregar tooltip accesible en slots bloqueados: "Reservado temporalmente por otro paciente"
    - Mostrar indicador de estado de conexión (conectado, reconectando, desconectado)
    - Mostrar mensajes de error/rechazo cuando un bloqueo es rechazado
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 1.4_
  - [ ]* 10.2 Escribir unit tests para los estados visuales de `DynamicCalendar`
    - Verificar renderizado de los tres estados visuales (disponible verde, bloqueado amarillo/naranja, seleccionado azul)
    - Verificar que slots bloqueados muestran tooltip accesible
    - Verificar que slots confirmados se muestran como ocupados (gris)
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Checkpoint final — Verificar compilación completa y ejecución de tests
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- Cada tarea referencia requisitos específicos del documento de requisitos para trazabilidad.
- Los checkpoints aseguran validación incremental del progreso.
- Los property-based tests validan propiedades universales de correctitud definidas en el diseño (backend con xUnit + generadores, frontend con fast-check).
- Los unit tests validan ejemplos específicos y casos borde.
- El paquete `Microsoft.AspNetCore.SignalR` ya está incluido en ASP.NET Core 8, no requiere instalación adicional en el backend.
- El `SlotLockService` se registra como Singleton (no Scoped) porque el `ConcurrentDictionary` es estático y el servicio no tiene dependencias scoped.
