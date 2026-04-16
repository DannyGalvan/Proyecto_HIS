# Requirements Document

## Introduction

El sistema HIS (Hospital Information System) actualmente no tiene una relación directa entre médicos y especialidades. La entidad `User` no posee un campo `SpecialtyId`, por lo que el portal del paciente no puede listar médicos al seleccionar una especialidad (el endpoint `GET /api/v1/PatientPortal/doctors` filtra por citas existentes, no por una asignación directa). Esta feature agrega la relación muchos-a-uno entre `User` (médico) y `Specialty`, expone la asignación en el panel administrativo y corrige el endpoint del portal del paciente para usar la nueva relación.

## Glossary

- **System**: El sistema HIS (Hospital Information System) en su conjunto.
- **Admin_Panel**: El módulo de administración del sistema accesible por usuarios con rol administrativo.
- **Patient_Portal**: El portal web de autoservicio para pacientes externos.
- **User**: Entidad de dominio que representa a cualquier usuario del sistema (médico, paciente, administrador, etc.).
- **Doctor**: Un `User` cuyo `Rol.Name` es `"Medico"`.
- **Specialty**: Entidad de catálogo que representa una especialidad médica (Cardiología, Pediatría, etc.).
- **SpecialtyId**: Clave foránea nullable en la entidad `User` que referencia a `Specialty`.
- **UserRequest**: DTO de entrada para operaciones de creación y actualización de `User`.
- **UserResponse**: DTO de salida que representa la información de un `User`.
- **DoctorResponse**: DTO de salida del endpoint `GET /api/v1/PatientPortal/doctors`.
- **UserForm**: Componente React del panel administrativo para crear y editar usuarios.
- **BookAppointmentPage**: Página React del portal del paciente que implementa el wizard de agendamiento de citas.
- **EntityService**: Servicio genérico CRUD del backend (`IEntityService<TEntity, TRequest, TKey>`).
- **CrudController**: Controlador genérico del backend que expone las operaciones CRUD estándar.
- **EF_Core**: Entity Framework Core, ORM utilizado para el acceso a datos con PostgreSQL.
- **Migration**: Migración de base de datos de EF Core que aplica cambios de esquema.

---

## Requirements

### Requirement 1: Agregar campo SpecialtyId a la entidad User

**User Story:** Como desarrollador, quiero que la entidad `User` tenga un campo `SpecialtyId` nullable, para que los médicos puedan tener una especialidad asignada directamente en su registro.

#### Acceptance Criteria

1. THE System SHALL agregar la propiedad `long? SpecialtyId` a la clase `User`.
2. THE System SHALL agregar la propiedad de navegación `virtual Specialty? Specialty` a la clase `User`.
3. THE System SHALL configurar en `UserConfiguration` la relación `HasOne(Specialty).WithMany().HasForeignKey(SpecialtyId)` con `OnDelete(DeleteBehavior.Restrict)` e `IsRequired(false)`.
4. THE System SHALL generar una migración de EF Core que agregue la columna `SpecialtyId` (nullable, `bigint`) a la tabla `Users` con la clave foránea correspondiente hacia la tabla `Specialties`.
5. IF un `User` tiene `SpecialtyId = null`, THEN THE System SHALL permitir guardar el registro sin error de validación de base de datos.

---

### Requirement 2: Exponer SpecialtyId en los DTOs de User

**User Story:** Como desarrollador, quiero que `UserRequest` y `UserResponse` incluyan el campo `SpecialtyId` (y el objeto `Specialty` anidado en la respuesta), para que el frontend pueda enviar y recibir la especialidad del médico.

#### Acceptance Criteria

1. THE System SHALL agregar la propiedad `long? SpecialtyId` a `UserRequest`.
2. THE System SHALL agregar la propiedad `long? SpecialtyId` a `UserResponse`.
3. THE System SHALL agregar la propiedad `SpecialtyResponse? Specialty` a `UserResponse`.
4. THE System SHALL actualizar el mapper de Mapster (`TypeAdapterConfig<User, UserResponse>`) para incluir el mapeo de `Specialty` hacia `SpecialtyResponse`.
5. WHEN el `EntityService` ejecuta una consulta `GetAll` o `GetById` de `User`, THE System SHALL incluir (`Include`) la entidad `Specialty` en la consulta para que el campo `Specialty` de `UserResponse` no sea `null` cuando el médico tiene especialidad asignada.

---

### Requirement 3: Validar SpecialtyId en los validadores de User

**User Story:** Como administrador, quiero que el sistema valide que el `SpecialtyId` enviado sea un valor positivo cuando se proporciona, para evitar datos inconsistentes en la base de datos.

#### Acceptance Criteria

1. WHEN `UserRequest.SpecialtyId` no es `null` en una operación de creación, THE System SHALL validar que `SpecialtyId > 0` en `CreateUserValidation`.
2. WHEN `UserRequest.SpecialtyId` no es `null` en una operación de actualización completa, THE System SHALL validar que `SpecialtyId > 0` en `UpdateUserValidation`.
3. WHEN `UserRequest.SpecialtyId` no es `null` en una actualización parcial (PATCH), THE System SHALL validar que `SpecialtyId > 0` en `PartialUserValidation`.
4. IF `UserRequest.SpecialtyId` es `null`, THEN THE System SHALL omitir la validación del campo y permitir el guardado.

---

### Requirement 4: Asignar especialidad a médicos desde el panel administrativo

**User Story:** Como administrador, quiero poder asignar o cambiar la especialidad de un médico desde el formulario de usuario en el panel administrativo, para mantener actualizada la relación médico-especialidad.

#### Acceptance Criteria

1. WHEN el `UserForm` se renderiza en modo creación o edición, THE System SHALL mostrar un selector de especialidad (`CatalogueSelect`) que cargue las especialidades activas (`State:eq:1`) desde el endpoint de especialidades.
2. WHEN el usuario selecciona una especialidad en el `UserForm`, THE System SHALL actualizar el campo `specialtyId` del estado del formulario.
3. WHEN el `UserForm` se renderiza en modo edición y el usuario tiene una especialidad asignada, THE System SHALL pre-seleccionar la especialidad actual en el selector.
4. WHEN el administrador envía el formulario con una especialidad seleccionada, THE System SHALL incluir `specialtyId` en el `UserRequest` enviado al backend.
5. WHERE el usuario tiene rol distinto a `"Medico"`, THE System SHALL mostrar el selector de especialidad como campo opcional (no requerido).

---

### Requirement 5: Corregir el endpoint GET /api/v1/PatientPortal/doctors

**User Story:** Como paciente, quiero que al seleccionar una especialidad en el wizard de agendamiento se listen los médicos que tienen esa especialidad asignada directamente, para poder elegir un médico disponible.

#### Acceptance Criteria

1. WHEN se llama a `GET /api/v1/PatientPortal/doctors?specialtyId={id}` con un `specialtyId > 0`, THE System SHALL filtrar los médicos activos (`State = 1`, `Rol.Name = "Medico"`) cuyo `User.SpecialtyId == specialtyId`.
2. WHEN se llama a `GET /api/v1/PatientPortal/doctors` sin `specialtyId` o con `specialtyId = 0`, THE System SHALL retornar todos los médicos activos sin filtro de especialidad.
3. THE System SHALL eliminar el filtro actual basado en citas existentes (`Appointments` join) del endpoint `GetDoctors`.
4. WHEN el endpoint retorna la lista de médicos, THE System SHALL incluir en cada `DoctorResponse` el `SpecialtyId` real del médico (obtenido de `User.SpecialtyId`) y el nombre de la especialidad (`SpecialtyName`).
5. IF no existen médicos activos con la especialidad solicitada, THEN THE System SHALL retornar una lista vacía con `Success = true` y `TotalResults = 0`.

---

### Requirement 6: Actualizar el tipo DoctorResponse en el frontend

**User Story:** Como desarrollador frontend, quiero que el tipo `DoctorResponse` incluya `specialtyName`, para que el wizard de agendamiento pueda mostrar el nombre de la especialidad del médico seleccionado.

#### Acceptance Criteria

1. THE System SHALL agregar la propiedad `specialtyName?: string` al tipo `DoctorResponse` en `PatientPortalTypes`.
2. WHEN el `Step2Doctor` del `BookAppointmentPage` renderiza la lista de médicos, THE System SHALL mostrar el nombre de la especialidad del médico usando `d.specialtyName` si está disponible, o el `specialtyName` del paso anterior como fallback.
3. THE System SHALL mantener compatibilidad con el resto del wizard: los pasos 3 y 4 no requieren cambios de lógica.

---

### Requirement 7: Consistencia de datos — médicos sin especialidad

**User Story:** Como administrador, quiero que el sistema maneje correctamente a los médicos que aún no tienen especialidad asignada, para que no se rompan flujos existentes.

#### Acceptance Criteria

1. WHEN se consulta un `User` con rol `"Medico"` que tiene `SpecialtyId = null`, THE System SHALL retornar `Specialty = null` en `UserResponse` sin error.
2. WHEN el endpoint `GET /api/v1/PatientPortal/doctors` retorna un médico sin especialidad asignada, THE System SHALL incluir `SpecialtyId = null` y `SpecialtyName = null` en el `DoctorResponse` correspondiente.
3. THE System SHALL mantener los registros de `User` existentes sin modificar sus datos al aplicar la migración (la columna `SpecialtyId` se agrega como nullable, sin valor por defecto obligatorio).
