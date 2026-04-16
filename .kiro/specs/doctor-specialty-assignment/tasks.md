# Implementation Plan: doctor-specialty-assignment

## Overview

Agregar la relación muchos-a-uno entre `User` (médico) y `Specialty` en el backend (.NET 8 / EF Core), exponer el campo en los DTOs y el formulario administrativo, y corregir el endpoint `GET /api/v1/PatientPortal/doctors` para filtrar por la nueva FK directa en lugar del join con citas. En el frontend se actualiza el tipo `DoctorResponse`, el `UserForm` y el `BookAppointmentPage`.

## Tasks

- [x] 1. Modificar la entidad `User` y su configuración EF Core
  - [x] 1.1 Agregar propiedades `SpecialtyId` y `Specialty` a `User.cs`
    - Abrir `Hospital.Server/Models/User.cs`
    - Agregar `public long? SpecialtyId { get; set; }` con su XML doc
    - Agregar `public virtual Specialty? Specialty { get; set; }` con su XML doc
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Configurar la relación FK en `UserConfiguration.cs`
    - Abrir `Hospital.Server/Context/Configurations/UserConfiguration.cs`
    - Agregar dentro de `Configure()`, después de la configuración de `Branch`:
      ```csharp
      entity.HasOne(e => e.Specialty)
          .WithMany()
          .HasForeignKey(e => e.SpecialtyId)
          .OnDelete(DeleteBehavior.Restrict)
          .IsRequired(false);
      ```
    - _Requirements: 1.3_

- [x] 2. Generar la migración EF Core
  - [x] 2.1 Crear la migración `AddSpecialtyIdToUser`
    - Ejecutar desde la raíz del proyecto backend:
      `dotnet ef migrations add AddSpecialtyIdToUser --project Hospital.Server`
    - Verificar que el método `Up` generado contiene:
      - `AddColumn<long>("SpecialtyId", nullable: true)`
      - `CreateIndex("IX_Users_SpecialtyId")`
      - `AddForeignKey` hacia `Specialties` con `onDelete: ReferentialAction.Restrict`
    - _Requirements: 1.4, 1.5, 7.3_

- [x] 3. Actualizar los DTOs de `User`
  - [x] 3.1 Agregar `SpecialtyId` a `UserRequest.cs`
    - Abrir `Hospital.Server/Dtos/Request/UserRequest.cs`
    - Agregar `public long? SpecialtyId { get; set; }` con su XML doc
    - _Requirements: 2.1_

  - [x] 3.2 Agregar `SpecialtyId` y `Specialty` a `UserResponse.cs`
    - Abrir `Hospital.Server/Dtos/Response/UserResponse.cs`
    - Agregar `public long? SpecialtyId { get; set; }` con su XML doc
    - Agregar `public virtual SpecialtyResponse? Specialty { get; set; }` con su XML doc
    - _Requirements: 2.2, 2.3_

  - [x] 3.3 Agregar `SpecialtyName` a `DoctorResponse.cs`
    - Abrir `Hospital.Server/Dtos/Response/DoctorResponse.cs`
    - Agregar `public string? SpecialtyName { get; set; }` con su XML doc
    - (La propiedad `SpecialtyId` ya existe en el DTO)
    - _Requirements: 5.4_

- [x] 4. Actualizar los validadores de `UserRequest`
  - [x] 4.1 Agregar regla condicional en `CreateUserValidation.cs`
    - Abrir `Hospital.Server/Validators/CreateUserValidation.cs`
    - Agregar al constructor:
      ```csharp
      When(x => x.SpecialtyId != null, () =>
      {
          RuleFor(x => x.SpecialtyId)
              .GreaterThan(0).WithMessage("Debe seleccionar una especialidad válida");
      });
      ```
    - _Requirements: 3.1, 3.4_

  - [x] 4.2 Agregar regla condicional en `UpdateUserValidation.cs`
    - Abrir `Hospital.Server/Validators/UpdateUserValidation.cs`
    - Agregar la misma regla condicional que en 4.1
    - _Requirements: 3.2, 3.4_

  - [x] 4.3 Agregar regla condicional en `PartialUserValidation.cs`
    - Abrir `Hospital.Server/Validators/PartialUserValidation.cs`
    - Agregar la misma regla condicional que en 4.1
    - _Requirements: 3.3, 3.4_

  - [ ]* 4.4 Escribir property test — Property 1: SpecialtyId inválido rechazado
    - **Property 1: SpecialtyId inválido es rechazado por todos los validadores**
    - Crear test en `Hospital.Server.Tests/` usando FsCheck.Xunit
    - Para cualquier `SpecialtyId <= 0` no-null, los tres validadores deben retornar error en `SpecialtyId`
    - Tag: `// Feature: doctor-specialty-assignment, Property 1`
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 4.5 Escribir property test — Property 2: SpecialtyId null siempre válido
    - **Property 2: SpecialtyId null siempre es válido**
    - Para cualquier `UserRequest` válido con `SpecialtyId = null`, ningún validador debe retornar error en `SpecialtyId`
    - Tag: `// Feature: doctor-specialty-assignment, Property 2`
    - **Validates: Requirements 1.5, 3.4**

- [x] 5. Actualizar el mapper Mapster en `MapsterConfig.cs`
  - [x] 5.1 Agregar mapeos de `SpecialtyId` y `Specialty` en los bloques de `User`
    - Abrir `Hospital.Server/Configs/MapsterConfig.cs`
    - En `TypeAdapterConfig<UserRequest, User>.NewConfig()` agregar:
      `.Map(dest => dest.SpecialtyId, src => src.SpecialtyId)`
    - En `TypeAdapterConfig<User, UserResponse>.NewConfig()` agregar:
      `.Map(dest => dest.SpecialtyId, src => src.SpecialtyId)`
      `.Map(dest => dest.Specialty, src => src.Specialty)`
    - Verificar que el mapper `Specialty → SpecialtyResponse` ya existe (Mapster lo usará automáticamente)
    - _Requirements: 2.4_

  - [ ]* 5.2 Escribir property test — Property 3: Round-trip mapper User → UserResponse
    - **Property 3: Round-trip de mapeo User → UserResponse preserva Specialty**
    - Para cualquier `User` con `Specialty` no-null, el mapper debe producir `UserResponse.Specialty` con `Id` y `Name` iguales
    - Tag: `// Feature: doctor-specialty-assignment, Property 3`
    - **Validates: Requirements 2.4, 2.5**

  - [ ]* 5.3 Escribir property test — Property 6: Médicos sin especialidad retornan null de forma segura
    - **Property 6: Médicos sin especialidad retornan campos null de forma segura**
    - Para cualquier `User` con `SpecialtyId = null`, el mapper no debe lanzar excepción y `UserResponse.Specialty` debe ser null
    - Tag: `// Feature: doctor-specialty-assignment, Property 6`
    - **Validates: Requirements 7.1**

- [x] 6. Agregar Include de `Specialty` en las queries de `User`
  - [x] 6.1 Verificar si `EntityService` soporta includes configurables
    - Revisar `Hospital.Server/Services/Core/EntityService.cs` para identificar si expone un método virtual `GetQueryable()` o similar
    - Si soporta includes: configurar el include de `Specialty` y `Rol` en la inyección del servicio en `ServicesGroup.cs`
    - Si no soporta includes: crear `UserService.cs` en `Hospital.Server/Services/` que herede de `EntityService<User, UserRequest, long>` y sobrescriba el método de query para agregar `.Include(u => u.Specialty).Include(u => u.Rol)`; registrar `UserService` en `ServicesGroup.cs` reemplazando el registro genérico de `User`
    - _Requirements: 2.5_

- [x] 7. Reescribir el método `GetDoctors` en `PatientPortalController.cs`
  - [x] 7.1 Reemplazar la implementación completa del método `GetDoctors`
    - Abrir `Hospital.Server/Controllers/PatientPortalController.cs`
    - Reemplazar el método `GetDoctors` con la nueva implementación que:
      - Agrega `.Include(u => u.Specialty)` al query
      - Filtra por `u.SpecialtyId == specialtyId` cuando `specialtyId > 0`
      - Elimina el join/filtro basado en `Appointments`
      - Proyecta `SpecialtyId = d.SpecialtyId` y `SpecialtyName = d.Specialty?.Name` en `DoctorResponse`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.2 Escribir property test — Property 4: Filtrado exacto por especialidad
    - **Property 4: Filtrado de médicos por especialidad es exacto**
    - Para cualquier `specialtyId > 0`, todos los `DoctorResponse` retornados deben tener `SpecialtyId == specialtyId` y ningún médico con `SpecialtyId != specialtyId` debe aparecer
    - Tag: `// Feature: doctor-specialty-assignment, Property 4`
    - **Validates: Requirements 5.1, 5.4**

  - [ ]* 7.3 Escribir property test — Property 5: Sin filtro retorna todos los médicos activos
    - **Property 5: Sin filtro retorna todos los médicos activos**
    - Para cualquier conjunto de usuarios, llamar sin `specialtyId` (o con `specialtyId = 0`) debe retornar exactamente todos los usuarios con `State = 1` y `Rol.Name = "Medico"`
    - Tag: `// Feature: doctor-specialty-assignment, Property 5`
    - **Validates: Requirements 5.2**

- [x] 8. Checkpoint — Verificar backend
  - Asegurarse de que el proyecto backend compila sin errores: `dotnet build Hospital.Server`
  - Verificar que la migración se generó correctamente
  - Asegurarse de que todos los tests del backend pasan, preguntar al usuario si hay dudas.

- [x] 9. Actualizar los tipos TypeScript del frontend
  - [x] 9.1 Agregar `specialtyName` al tipo `DoctorResponse` en `PatientPortalTypes.ts`
    - Abrir `hospital.client/src/types/PatientPortalTypes.ts`
    - Agregar `specialtyName?: string;` a la interfaz `DoctorResponse`
    - _Requirements: 6.1_

  - [x] 9.2 Agregar `specialtyId` y `specialty` al tipo `UserRequest` en `UserRequest.ts`
    - Abrir `hospital.client/src/types/UserRequest.ts`
    - Agregar `specialtyId?: number | null;` a la interfaz `UserRequest`
    - Agregar `specialty?: SpecialtyResponse | null;` a la interfaz `UserRequest`
    - Agregar el import: `import type { SpecialtyResponse } from "./SpecialtyResponse";`
    - _Requirements: 4.4_

- [x] 10. Actualizar `UserForm.tsx` con el selector de especialidad
  - [x] 10.1 Agregar imports y el `CatalogueSelect` de especialidad en `UserForm.tsx`
    - Abrir `hospital.client/src/components/form/UserForm.tsx`
    - Agregar imports de `getSpecialties` y `SpecialtyResponse`
    - Agregar el callback `selectorSpecialty` con `useCallback`
    - Agregar el componente `<CatalogueSelect>` para especialidad dentro del grid, después del selector de Sucursal y antes del selector de Estado:
      - `label="Especialidad (Médicos)"`, `placeholder="Seleccione una especialidad (opcional)"`
      - `deps="State:eq:1"`, `queryFn={getSpecialties}`, `selectorFn={selectorSpecialty}`
      - `onChange={handleSelectChange("specialtyId")}`
      - `defaultValue` pre-seleccionado cuando `type === "edit" && form.specialtyId`
    - El campo es opcional para todos los roles (sin `isRequired`)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 10.2 Escribir property test — Property 7: Formulario incluye specialtyId en el request
    - **Property 7: El formulario incluye specialtyId en el request enviado**
    - Usar fast-check con Vitest: para cualquier valor de `specialtyId` (incluyendo null), el `UserRequest` construido debe contener exactamente ese valor
    - Tag: `// Feature: doctor-specialty-assignment, Property 7`
    - **Validates: Requirements 4.2, 4.4**

- [x] 11. Actualizar `BookAppointmentPage.tsx` — Step2Doctor
  - [x] 11.1 Mostrar `d.specialtyName` con fallback en el listado de médicos
    - Abrir `hospital.client/src/pages/portal/BookAppointmentPage.tsx`
    - En el `map` de médicos dentro de `Step2Doctor`, reemplazar `{specialtyName}` por `{d.specialtyName ?? specialtyName}`
    - Los pasos 3 y 4 del wizard no requieren cambios
    - _Requirements: 6.2, 6.3, 7.2_

- [x] 12. Checkpoint final — Verificación de tipos y build
  - Ejecutar TypeScript check en el frontend: `npx tsc --noEmit` desde `hospital.client/`
  - Ejecutar build del backend: `dotnet build Hospital.Server`
  - Asegurarse de que no hay errores de tipos ni de compilación. Preguntar al usuario si hay dudas antes de cerrar.

## Notes

- Las tareas marcadas con `*` son opcionales (property tests y unit tests) y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- La tarea 6.1 tiene una bifurcación: revisar `EntityService` antes de decidir si crear `UserService`
- Los checkpoints en tareas 8 y 12 garantizan validación incremental
- El campo `SpecialtyId` es nullable en todos los niveles (BD, entidad, DTOs, tipos TS) para compatibilidad hacia atrás
