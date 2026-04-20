# Documento de Requisitos — Bloqueo de Citas en Tiempo Real con SignalR

## Introducción

El Sistema de Información Hospitalaria (HIS) actualmente permite a los pacientes agendar citas a través del portal del paciente. Sin embargo, el flujo actual no previene que dos o más pacientes seleccionen el mismo horario simultáneamente, ya que el bloqueo solo ocurre al momento del pago. Esta funcionalidad implementa bloqueo temporal en tiempo real utilizando SignalR para comunicar las selecciones de horarios entre todos los clientes conectados, previniendo la doble reservación y proporcionando retroalimentación visual inmediata.

## Glosario

- **Hub_SignalR**: Componente del servidor ASP.NET Core que gestiona las conexiones WebSocket y la comunicación bidireccional en tiempo real entre el backend y los clientes React.
- **Slot**: Franja horaria de 30 minutos disponible para agendar una cita médica, generada entre las 07:00 y las 18:30.
- **Bloqueo_Temporal**: Reserva transitoria de un Slot por un paciente durante un período limitado, que impide que otros pacientes seleccionen el mismo Slot.
- **Cliente_Conectado**: Instancia del navegador de un paciente que mantiene una conexión activa con el Hub_SignalR.
- **Calendario_Dinámico**: Componente React (`DynamicCalendar`) que muestra los Slots disponibles para un doctor en una fecha específica.
- **Grupo_SignalR**: Agrupación lógica de conexiones SignalR que comparten el mismo contexto (doctor + fecha), utilizada para difundir eventos solo a los clientes relevantes.
- **TTL_Bloqueo**: Tiempo de vida (Time To Live) del Bloqueo_Temporal, expresado en segundos, tras el cual el bloqueo se libera automáticamente.
- **Servicio_Bloqueo**: Componente del backend responsable de gestionar el ciclo de vida de los Bloqueos_Temporales (crear, consultar, liberar, expirar).
- **Portal_Paciente**: Interfaz web pública donde los pacientes autenticados agendan citas, realizan pagos y consultan su historial.

## Requisitos

### Requisito 1: Conexión SignalR desde el Portal del Paciente

**Historia de Usuario:** Como paciente, quiero que mi navegador establezca una conexión en tiempo real con el servidor cuando estoy agendando una cita, para que pueda recibir actualizaciones instantáneas sobre la disponibilidad de horarios.

#### Criterios de Aceptación

1. WHEN el paciente navega a la pantalla de selección de horarios en el Portal_Paciente, THE Cliente_Conectado SHALL establecer una conexión con el Hub_SignalR utilizando el protocolo WebSocket.
2. WHEN la conexión WebSocket no está disponible, THE Cliente_Conectado SHALL recurrir a los mecanismos de transporte alternativos de SignalR (Server-Sent Events, Long Polling) de forma transparente.
3. WHEN el paciente abandona la pantalla de selección de horarios o cierra el navegador, THE Cliente_Conectado SHALL cerrar la conexión con el Hub_SignalR.
4. IF la conexión con el Hub_SignalR se pierde inesperadamente, THEN THE Cliente_Conectado SHALL intentar reconectarse automáticamente con una estrategia de reintento exponencial hasta un máximo de 5 intentos.
5. WHILE el Cliente_Conectado mantiene una conexión activa con el Hub_SignalR, THE Cliente_Conectado SHALL enviar un latido (heartbeat) cada 30 segundos para mantener la conexión viva.

### Requisito 2: Suscripción a Grupos por Doctor y Fecha

**Historia de Usuario:** Como paciente, quiero recibir únicamente las actualizaciones de disponibilidad del doctor y la fecha que estoy consultando, para que la comunicación sea eficiente y relevante.

#### Criterios de Aceptación

1. WHEN el paciente selecciona un doctor y una fecha en el Calendario_Dinámico, THE Hub_SignalR SHALL agregar la conexión del Cliente_Conectado al Grupo_SignalR correspondiente, identificado por el formato `doctor_{doctorId}_date_{yyyy-MM-dd}`.
2. WHEN el paciente cambia de fecha o de doctor en el Calendario_Dinámico, THE Hub_SignalR SHALL remover la conexión del Cliente_Conectado del Grupo_SignalR anterior y agregarla al nuevo Grupo_SignalR.
3. WHEN el Cliente_Conectado se desconecta del Hub_SignalR, THE Hub_SignalR SHALL remover la conexión de todos los Grupos_SignalR a los que pertenecía.
4. THE Hub_SignalR SHALL difundir eventos de bloqueo y liberación de Slots únicamente a los Clientes_Conectados que pertenezcan al Grupo_SignalR correspondiente.

### Requisito 3: Bloqueo Temporal de Slot al Seleccionar

**Historia de Usuario:** Como paciente, quiero que cuando selecciono un horario disponible, este quede temporalmente bloqueado para otros pacientes, para que nadie más pueda reservar el mismo horario mientras completo mi proceso de pago.

#### Criterios de Aceptación

1. WHEN un paciente selecciona un Slot disponible en el Calendario_Dinámico, THE Servicio_Bloqueo SHALL crear un Bloqueo_Temporal asociado al Slot, al doctor, a la fecha y al paciente que lo seleccionó.
2. WHEN el Servicio_Bloqueo crea un Bloqueo_Temporal, THE Hub_SignalR SHALL notificar a todos los Clientes_Conectados del Grupo_SignalR correspondiente que el Slot ha sido bloqueado, incluyendo el identificador del Slot y el TTL_Bloqueo.
3. IF un paciente intenta seleccionar un Slot que ya tiene un Bloqueo_Temporal activo de otro paciente, THEN THE Servicio_Bloqueo SHALL rechazar la solicitud y retornar un mensaje indicando que el Slot está temporalmente reservado por otro paciente.
4. THE Servicio_Bloqueo SHALL permitir que un paciente tenga como máximo un Bloqueo_Temporal activo por doctor y fecha a la vez; al seleccionar un nuevo Slot, el Bloqueo_Temporal anterior del mismo paciente para ese doctor y fecha se libera automáticamente.
5. WHEN el Servicio_Bloqueo rechaza un bloqueo por conflicto, THE Hub_SignalR SHALL enviar al Cliente_Conectado solicitante un evento de rechazo con el motivo del conflicto.

### Requisito 4: Expiración Automática del Bloqueo Temporal

**Historia de Usuario:** Como paciente, quiero que los horarios bloqueados por otros pacientes que no completan su reserva se liberen automáticamente, para que los horarios no queden indefinidamente inaccesibles.

#### Criterios de Aceptación

1. THE Servicio_Bloqueo SHALL asignar un TTL_Bloqueo de 300 segundos (5 minutos) a cada Bloqueo_Temporal creado, alineado con el temporizador de reserva existente (RNF-024).
2. WHEN el TTL_Bloqueo de un Bloqueo_Temporal expira, THE Servicio_Bloqueo SHALL eliminar el Bloqueo_Temporal automáticamente.
3. WHEN un Bloqueo_Temporal expira, THE Hub_SignalR SHALL notificar a todos los Clientes_Conectados del Grupo_SignalR correspondiente que el Slot ha sido liberado.
4. THE Servicio_Bloqueo SHALL ejecutar un proceso de limpieza periódico cada 30 segundos para detectar y eliminar Bloqueos_Temporales cuyo TTL_Bloqueo haya expirado.

### Requisito 5: Liberación Explícita del Bloqueo

**Historia de Usuario:** Como paciente, quiero que si cancelo mi selección de horario o abandono el proceso de reserva, el horario se libere inmediatamente para otros pacientes.

#### Criterios de Aceptación

1. WHEN el paciente deselecciona un Slot o selecciona un Slot diferente en el Calendario_Dinámico, THE Servicio_Bloqueo SHALL liberar el Bloqueo_Temporal del Slot anterior.
2. WHEN el Cliente_Conectado se desconecta del Hub_SignalR (cierre de navegador, navegación fuera de la página, pérdida de conexión), THE Servicio_Bloqueo SHALL liberar todos los Bloqueos_Temporales asociados a esa conexión.
3. WHEN un Bloqueo_Temporal es liberado explícitamente, THE Hub_SignalR SHALL notificar a todos los Clientes_Conectados del Grupo_SignalR correspondiente que el Slot ha sido liberado.
4. WHEN el pago de una cita se completa exitosamente, THE Servicio_Bloqueo SHALL liberar el Bloqueo_Temporal correspondiente, ya que el Slot pasa a estar ocupado de forma permanente.

### Requisito 6: Retroalimentación Visual en Tiempo Real

**Historia de Usuario:** Como paciente, quiero ver visualmente cuáles horarios están siendo seleccionados por otros pacientes en tiempo real, para que pueda elegir un horario que esté realmente disponible.

#### Criterios de Aceptación

1. THE Calendario_Dinámico SHALL mostrar los Slots en tres estados visuales diferenciados: disponible (verde), ocupado/confirmado (gris deshabilitado) y bloqueado temporalmente por otro paciente (amarillo/naranja deshabilitado).
2. WHEN el Hub_SignalR notifica que un Slot ha sido bloqueado por otro paciente, THE Calendario_Dinámico SHALL actualizar el estado visual del Slot a bloqueado temporalmente dentro de un máximo de 2 segundos desde la recepción del evento.
3. WHEN el Hub_SignalR notifica que un Slot ha sido liberado, THE Calendario_Dinámico SHALL actualizar el estado visual del Slot a disponible dentro de un máximo de 2 segundos desde la recepción del evento.
4. WHILE un Slot está bloqueado temporalmente por otro paciente, THE Calendario_Dinámico SHALL mostrar un indicador textual accesible (tooltip o texto) que indique "Reservado temporalmente por otro paciente".
5. WHEN el paciente actual tiene un Bloqueo_Temporal activo sobre un Slot, THE Calendario_Dinámico SHALL mostrar ese Slot con un estado visual de selección propia (azul) diferenciado del bloqueo de otros pacientes.

### Requisito 7: Prevención de Doble Reservación en el Backend

**Historia de Usuario:** Como administrador del sistema, quiero que el backend valide la disponibilidad del horario al momento de confirmar la cita, para que incluso si falla la comunicación en tiempo real, no se creen citas duplicadas.

#### Criterios de Aceptación

1. WHEN el Portal_Paciente envía una solicitud de reserva de cita (`POST /api/v1/PatientPortal/book`), THE Servicio_Bloqueo SHALL verificar que el paciente solicitante posee un Bloqueo_Temporal activo sobre el Slot solicitado antes de proceder con la creación de la cita.
2. IF un paciente intenta reservar un Slot sin poseer un Bloqueo_Temporal activo sobre el mismo, THEN THE Servicio_Bloqueo SHALL rechazar la solicitud con un código de error HTTP 409 (Conflict) y un mensaje descriptivo.
3. WHEN se crea una cita exitosamente, THE Servicio_Bloqueo SHALL marcar el Slot como ocupado de forma permanente y notificar a todos los Clientes_Conectados del Grupo_SignalR correspondiente.
4. THE Servicio_Bloqueo SHALL utilizar un mecanismo de concurrencia optimista o bloqueo a nivel de base de datos para garantizar que dos solicitudes simultáneas de reserva sobre el mismo Slot no resulten en dos citas creadas.

### Requisito 8: Configuración del Hub SignalR en el Backend (.NET 8)

**Historia de Usuario:** Como desarrollador, quiero que el Hub de SignalR esté correctamente configurado en el backend .NET 8, para que la comunicación en tiempo real funcione de forma confiable.

#### Criterios de Aceptación

1. THE Hub_SignalR SHALL estar registrado en el pipeline de ASP.NET Core en la ruta `/hubs/appointment-booking`.
2. THE Hub_SignalR SHALL requerir autenticación JWT para las conexiones, utilizando el mismo esquema de autenticación del Portal_Paciente.
3. THE Hub_SignalR SHALL exponer los siguientes métodos invocables por el cliente: `JoinSlotGroup` (unirse a un grupo), `LeaveSlotGroup` (salir de un grupo), `LockSlot` (solicitar bloqueo de un Slot), `ReleaseSlot` (liberar un Slot).
4. THE Hub_SignalR SHALL emitir los siguientes eventos hacia los clientes: `SlotLocked` (Slot bloqueado), `SlotReleased` (Slot liberado), `SlotLockRejected` (bloqueo rechazado), `SlotConfirmed` (Slot confirmado permanentemente).
5. IF el Hub_SignalR recibe una solicitud de un cliente no autenticado, THEN THE Hub_SignalR SHALL rechazar la conexión con un código de error 401 (Unauthorized).

### Requisito 9: Almacenamiento de Bloqueos Temporales

**Historia de Usuario:** Como desarrollador, quiero que los bloqueos temporales se almacenen de forma eficiente y con acceso rápido, para que el sistema responda en tiempo real sin degradar el rendimiento.

#### Criterios de Aceptación

1. THE Servicio_Bloqueo SHALL almacenar los Bloqueos_Temporales en una estructura de datos en memoria (por ejemplo, `ConcurrentDictionary`) para garantizar tiempos de acceso inferiores a 10 milisegundos.
2. THE Servicio_Bloqueo SHALL registrar cada Bloqueo_Temporal con los siguientes datos: identificador del doctor, fecha del Slot, hora del Slot, identificador del paciente, identificador de conexión SignalR y marca de tiempo de expiración.
3. THE Servicio_Bloqueo SHALL ser seguro para acceso concurrente (thread-safe) para manejar múltiples solicitudes simultáneas sin condiciones de carrera.
4. IF el servidor se reinicia, THEN THE Servicio_Bloqueo SHALL iniciar con un estado limpio de Bloqueos_Temporales, ya que los bloqueos son transitorios y las citas confirmadas persisten en la base de datos.

### Requisito 10: Integración del Cliente SignalR en React

**Historia de Usuario:** Como desarrollador frontend, quiero un hook de React reutilizable que gestione la conexión SignalR y el estado de los bloqueos, para que la integración con el Calendario_Dinámico sea limpia y mantenible.

#### Criterios de Aceptación

1. THE Cliente_Conectado SHALL utilizar la librería `@microsoft/signalr` para establecer y gestionar la conexión con el Hub_SignalR.
2. THE Cliente_Conectado SHALL exponer un hook de React (`useAppointmentHub`) que encapsule la lógica de conexión, suscripción a grupos, envío de comandos y recepción de eventos.
3. THE hook `useAppointmentHub` SHALL retornar el estado actual de los Slots bloqueados, funciones para bloquear y liberar Slots, y el estado de la conexión (conectado, desconectado, reconectando).
4. WHEN el componente que utiliza el hook `useAppointmentHub` se desmonta, THE hook SHALL cerrar la conexión con el Hub_SignalR y liberar los Bloqueos_Temporales del paciente.
5. THE hook `useAppointmentHub` SHALL integrarse con el store de Zustand (`usePatientAuthStore`) para obtener el token JWT necesario para la autenticación con el Hub_SignalR.
