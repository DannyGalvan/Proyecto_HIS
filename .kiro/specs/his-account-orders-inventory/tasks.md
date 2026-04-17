# Plan de Implementación: Cuentas, Órdenes e Inventario (HIS)

## Resumen

Este plan cubre la implementación de mejoras al HIS en tres áreas: gestión de cuentas de usuario (recuperación de contraseña, perfil, toggle de visibilidad, cambio manual, plantillas de correo, limpieza del login), cálculo de precios en órdenes médicas (laboratorio y farmacia) con integración de órdenes pendientes en caja, y gestión de inventario de farmacia (bitácora de movimientos y operaciones CRUD de reabastecimiento). Backend en C# (ASP.NET Core 8) y frontend en TypeScript (React 19 + HeroUI + TailwindCSS).

## Tareas

- [x] 1. Área 1 — Mejoras al AuthService y recuperación de contraseña
  - [x] 1.1 Crear el DTO `ManualChangePasswordRequest` en `hospital.Server/Entities/Request/`
    - Crear la clase con propiedades: `UserId` (long), `CurrentPassword` (string), `NewPassword` (string), `ConfirmPassword` (string)
    - _Requisitos: 4.3, 4.4, 4.6_

  - [x] 1.2 Crear el validador `ManualChangePasswordValidation` en `hospital.Server/Validations/Auth/`
    - Validar que `CurrentPassword` no esté vacío
    - Validar que `NewPassword` tenga mínimo 12 caracteres
    - Validar que `ConfirmPassword` coincida con `NewPassword`
    - Validar que `NewPassword` sea diferente a `CurrentPassword`
    - Registrar en `ValidationsGroup.cs` como `IValidator<ManualChangePasswordRequest>`
    - _Requisitos: 4.3, 4.6, 1.7_

  - [x] 1.3 Agregar método `ManualChangePassword` en `IAuthService` y `AuthService`
    - Agregar firma `Response<string, List<ValidationFailure>> ManualChangePassword(ManualChangePasswordRequest model)` en la interfaz
    - Implementar en `AuthService`: buscar usuario por `UserId`, verificar contraseña actual con BCrypt, hashear nueva contraseña, actualizar `User.Password`, `User.LastPasswordChange` y `User.UpdatedAt`
    - Si la contraseña actual no coincide, retornar "La contraseña actual es incorrecta."
    - Inyectar `IValidator<ManualChangePasswordRequest>` en el constructor de `AuthService`
    - _Requisitos: 4.4, 4.5, 4.6, 4.7_

  - [x] 1.4 Agregar endpoint `ManualChangePassword` en `AuthController`
    - Crear `[Authorize] [HttpPost("ManualChangePassword")]` que extraiga `UserId` del JWT con `GetUserId()` y llame a `_authService.ManualChangePassword(model)`
    - _Requisitos: 4.1, 4.2_

  - [x] 1.5 Corregir `RecoveryPassword` en `AuthService` para prevenir enumeración de cuentas
    - Cuando el correo no existe en BD, retornar respuesta genérica de éxito (Success=true, Message="Si el correo está registrado, recibirá un enlace de recuperación.") en lugar de "Usuario no encontrado"
    - _Requisitos: 1.4_

  - [ ]* 1.6 Escribir tests unitarios para `ManualChangePassword` y corrección de `RecoveryPassword`
    - Verificar que contraseña actual incorrecta retorna error
    - Verificar que nueva contraseña < 12 chars es rechazada
    - Verificar que `RecoveryPassword` con correo inexistente retorna éxito genérico
    - _Requisitos: 1.4, 4.4, 4.5, 4.6_

- [x] 2. Área 1 — Servicio de correo con plantillas profesionales
  - [x] 2.1 Crear enum `EmailTemplateType` y extender `ISendMail` con `SendWithTemplate`
    - Crear enum en `hospital.Server/Services/Interfaces/` con valores: `PasswordRecovery=0`, `PasswordChangeConfirmation=1`, `AppointmentConfirmation=2`, `PaymentConfirmation=3`
    - Agregar método `bool SendWithTemplate(string correo, string asunto, EmailTemplateType templateType, Dictionary<string, string> data)` en `ISendMail`
    - _Requisitos: 5.1, 5.3_

  - [x] 2.2 Crear `EmailTemplateService` e implementar `SendWithTemplate` en `SendEmail`
    - Crear clase `EmailTemplateService` en `hospital.Server/Services/Core/` con plantillas HTML inline (encabezado con logo HIS, cuerpo, pie de página con datos de contacto y aviso no-responder)
    - Implementar plantillas específicas: recuperación de contraseña (saludo, enlace, vigencia 15 min, advertencia), confirmación de cambio de contraseña (notificación, fecha/hora, instrucciones soporte)
    - Implementar `SendWithTemplate` en `SendEmail.cs` que use `EmailTemplateService` para generar el HTML y enviar
    - Usar CSS inline y tablas para compatibilidad con Gmail, Outlook, Yahoo
    - Registrar `EmailTemplateService` en `ServicesGroup.cs`
    - _Requisitos: 5.1, 5.2, 5.4, 5.5, 5.6, 5.7_

  - [x] 2.3 Actualizar `RecoveryPassword` y `ChangePassword` en `AuthService` para usar plantillas
    - Reemplazar el HTML concatenado en `RecoveryPassword` por `SendWithTemplate(email, asunto, EmailTemplateType.PasswordRecovery, data)`
    - Agregar envío de correo de confirmación tras cambio exitoso de contraseña usando `EmailTemplateType.PasswordChangeConfirmation`
    - _Requisitos: 5.4, 5.5_

- [x] 3. Checkpoint — Verificar compilación del backend Área 1 (Auth + Email)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.

- [x] 4. Área 1 — Frontend: Toggle de visibilidad, limpieza del login, perfil y cambio de contraseña
  - [x] 4.1 Crear componente reutilizable `PasswordVisibilityToggle.tsx` en `hospital.client/src/components/input/`
    - Implementar componente que envuelva un campo `<Input>` de HeroUI con toggle de icono ojo abierto/cerrado
    - Alternar `type` entre "password" y "text" al hacer clic
    - Auto-revert a "password" después de 10 segundos de inactividad usando `useEffect` con timer
    - Props: `value`, `onChange`, `name`, `label`, `isInvalid`, `errorMessage`
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Actualizar `LoginForm.tsx` — limpieza y toggle de contraseña
    - Eliminar el enlace "No tienes cuenta? Registrate" (`nameRoutes.register`)
    - Eliminar el enlace "Ver Portal de Servicios" (`nameRoutes.portal`)
    - Integrar `PasswordVisibilityToggle` en el campo de contraseña reemplazando el `<Input type="password">`
    - Mantener solo: campos usuario/contraseña, botón "Iniciar Sesión", enlace "¿Olvidó su contraseña?"
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 3.1_

  - [x] 4.3 Crear página `ProfilePage.tsx` en `hospital.client/src/pages/portal/`
    - Crear vista de perfil en ruta `/portal/profile` para pacientes autenticados
    - Mostrar campos: nombre completo, email, teléfono, DPI (solo lectura con `isReadOnly`), NIT, número de seguro médico
    - Formulario con validación: nombre (10–100 chars), teléfono (8 dígitos), email válido
    - Enviar `PATCH /api/v1/User` con solo campos modificados y el Id del usuario autenticado
    - Mostrar mensaje "Perfil actualizado correctamente" tras éxito
    - Manejar error "El correo electrónico ya está en uso por otra cuenta."
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 4.4 Crear componentes `ChangePasswordModal.tsx` y `ChangePasswordForm.tsx`
    - Crear formulario con 3 campos: contraseña actual, nueva contraseña, confirmar nueva contraseña
    - Integrar `PasswordVisibilityToggle` en los 3 campos
    - Validar: nueva contraseña mínimo 12 caracteres, confirmación coincide, nueva diferente a actual
    - Llamar a `POST /api/v1/Auth/ManualChangePassword` con datos del formulario
    - Mostrar mensaje "Contraseña actualizada correctamente" tras éxito
    - Crear modal reutilizable que se pueda abrir desde perfil del portal y menú del panel administrativo
    - _Requisitos: 4.1, 4.2, 4.3, 4.8, 3.1_

  - [x] 4.5 Actualizar `constants.ts` con nuevas rutas y crear/actualizar servicios frontend
    - Agregar rutas: `portalProfile: "/portal/profile"`, `inventoryMovement: "/inventory-movement"`, `inventoryMovementCreate: "/inventory-movement/create"`
    - Actualizar `authService.ts`: agregar función `manualChangePassword(data: ManualChangePasswordRequest)`
    - Crear tipos TypeScript: `ManualChangePasswordRequest` en `hospital.client/src/types/`
    - Registrar rutas en el router del portal y del panel administrativo
    - _Requisitos: 2.1, 4.1, 4.2_

  - [ ]* 4.6 Escribir tests unitarios para `PasswordVisibilityToggle` y `ChangePasswordForm`
    - Verificar que el toggle alterna entre password y text
    - Verificar auto-revert después de 10 segundos
    - Verificar validaciones del formulario de cambio de contraseña
    - _Requisitos: 3.2, 3.5, 4.3_

- [x] 5. Checkpoint — Verificar compilación frontend Área 1
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.


- [x] 6. Área 2 — Backend: Interceptores de precios para órdenes de laboratorio
  - [x] 6.1 Crear `LabOrderItemBeforeCreateInterceptor` en `hospital.Server/Interceptors/`
    - Implementar `IEntityBeforeCreateInterceptor<LabOrderItem, LabOrderItemRequest>`
    - Buscar `LabExam` por `LabExamId` del request
    - Copiar `LabExam.DefaultAmount` → `LabOrderItem.Amount`
    - Copiar `LabExam.Name` → `LabOrderItem.ExamName`
    - Si `DefaultAmount` es 0 o nulo, asignar `Amount=0`
    - Registrar en `ServicesGroup.cs`
    - _Requisitos: 7.1, 7.6_

  - [x] 6.2 Mejorar `LabOrderAfterCreateInterceptor` para recalcular `TotalAmount`
    - Después de crear una LabOrder con Items, recalcular `TotalAmount = SUM(Items.Amount)` donde `State=1`
    - Ignorar cualquier `TotalAmount` enviado por el frontend
    - Guardar el `TotalAmount` recalculado en la entidad `LabOrder`
    - _Requisitos: 7.2, 7.5_

  - [ ]* 6.3 Escribir tests unitarios para interceptores de LabOrder
    - Verificar que `DefaultAmount` se copia correctamente a `Amount`
    - Verificar que `TotalAmount` se recalcula como suma de `Amount` de items activos
    - Verificar que `TotalAmount` del frontend se ignora
    - _Requisitos: 7.1, 7.2, 7.5_

- [x] 7. Área 2 — Backend: Interceptores de precios para despachos de farmacia
  - [x] 7.1 Crear `DispenseItemBeforeCreateInterceptor` en `hospital.Server/Interceptors/`
    - Implementar `IEntityBeforeCreateInterceptor<DispenseItem, DispenseItemRequest>`
    - Buscar `Medicine` por `MedicineId` del request
    - Copiar `Medicine.DefaultPrice` → `DispenseItem.UnitPrice`
    - Si `DefaultPrice` es 0 o nulo, asignar `UnitPrice=0`
    - Registrar en `ServicesGroup.cs`
    - _Requisitos: 9.1, 9.6_

  - [x] 7.2 Mejorar `DispenseAfterCreateInterceptor` para recalcular `TotalAmount`
    - Después de crear un Dispense con Items, recalcular `TotalAmount = SUM(Items.UnitPrice × Items.Quantity)` donde `State=1`
    - Ignorar cualquier `TotalAmount` enviado por el frontend
    - Guardar el `TotalAmount` recalculado en la entidad `Dispense`
    - _Requisitos: 9.2, 9.5_

  - [ ]* 7.3 Escribir tests unitarios para interceptores de Dispense
    - Verificar que `DefaultPrice` se copia correctamente a `UnitPrice`
    - Verificar que `TotalAmount` se recalcula como suma de `UnitPrice × Quantity` de items activos
    - Verificar que `TotalAmount` del frontend se ignora
    - _Requisitos: 9.1, 9.2, 9.5_

- [x] 8. Área 2 — Backend: Endpoint de órdenes pendientes en módulo de caja
  - [x] 8.1 Crear DTO `PendingOrderResponse` en `hospital.Server/Entities/Response/`
    - Crear clase con propiedades: `OrderType` (string), `OrderId` (long), `OrderNumber` (string), `PatientName` (string), `PatientDpi` (string), `CreatedAt` (string), `ItemCount` (int), `TotalAmount` (decimal), `PaymentType` (int)
    - _Requisitos: 8.3, 8.4_

  - [x] 8.2 Agregar endpoint `GetPendingOrders` en `PaymentController`
    - Crear `[HttpGet("PendingOrders")]` con parámetros `[FromQuery] string? dpi` y `[FromQuery] string? orderNumber`
    - Buscar paciente por DPI (`IdentificationDocument`) en la tabla `Users`
    - Consultar `LabOrders` con `OrderStatus=0` del paciente, incluyendo `Items` y `Patient`
    - Consultar `Dispenses` con `DispenseStatus=0` del paciente, incluyendo `Items` y `Patient`
    - Si se proporciona `orderNumber`, filtrar también por número de orden
    - Mapear resultados a lista de `PendingOrderResponse`
    - Retornar lista consolidada ordenada por fecha de creación
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.10_

  - [ ]* 8.3 Escribir tests unitarios para endpoint `GetPendingOrders`
    - Verificar búsqueda por DPI retorna órdenes pendientes correctas
    - Verificar que solo retorna órdenes con status Pending (0)
    - Verificar búsqueda por número de orden
    - _Requisitos: 8.1, 8.2_

- [x] 9. Checkpoint — Verificar compilación del backend Área 2 (Precios + Pagos)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.

- [x] 10. Área 2 — Frontend: Precios en órdenes de laboratorio y despachos
  - [x] 10.1 Actualizar `LabOrderForm.tsx` — mostrar precios por examen y total en tiempo real
    - Al seleccionar un LabExam, mostrar su `DefaultAmount` como precio individual
    - Agregar columna de precio en la tabla de exámenes seleccionados
    - Calcular y mostrar total acumulado (`TotalAmount`) en tiempo real al agregar/eliminar exámenes
    - Si `DefaultAmount` es 0 o nulo, mostrar advertencia "Precio no configurado" junto al examen
    - Formato de moneda: `Q {monto}` con 2 decimales
    - Mostrar `TotalAmount` en la tabla de listado de órdenes con formato GTQ
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7_

  - [x] 10.2 Actualizar `DispenseForm.tsx` — mostrar precios por medicamento, subtotales y total
    - Al seleccionar un Medicine, mostrar su `DefaultPrice` como precio unitario
    - Agregar columnas: precio unitario, subtotal por línea (`UnitPrice × Quantity`)
    - Calcular y mostrar total acumulado (`TotalAmount`) en tiempo real
    - Recalcular subtotal y total al cambiar cantidad de un DispenseItem
    - Si `DefaultPrice` es 0 o nulo, mostrar advertencia "Precio no configurado"
    - Formato de moneda: `Q {monto}` con 2 decimales
    - Mostrar `TotalAmount` en la tabla de listado de despachos con formato GTQ
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.6, 9.7, 9.8_

- [x] 11. Área 2 — Frontend: Órdenes pendientes en módulo de caja
  - [x] 11.1 Crear servicio y tipos para órdenes pendientes
    - Crear tipo `PendingOrderResponse` en `hospital.client/src/types/`
    - Agregar función `getPendingOrders(dpi?: string, orderNumber?: string)` en `paymentService.ts` que llame a `GET /api/v1/Payment/PendingOrders`
    - _Requisitos: 8.1_

  - [x] 11.2 Actualizar `PaymentPage.tsx` — sección de órdenes pendientes
    - Agregar sección "Órdenes Pendientes de Pago" arriba de la tabla de pagos existente
    - Campo de búsqueda por DPI del paciente o número de orden
    - Tabla de resultados con columnas: tipo de orden, número, paciente, fecha, cantidad de ítems, total (formato GTQ), botón "Cobrar"
    - Al hacer clic en "Cobrar", abrir formulario de pago prellenado con: monto total, tipo de pago (`PaymentType=1` para laboratorio, `PaymentType=2` para farmacia), referencia a la orden (`LabOrderId` o `DispenseId`)
    - Generar `IdempotencyKey` (UUID v4) por cada transacción
    - Tras pago exitoso, actualizar estado de la orden vía `PATCH /api/v1/LabOrder` o `PATCH /api/v1/Dispense`
    - Soporte para selección múltiple cuando un paciente tiene varias órdenes pendientes
    - Soporte para pago en efectivo (cálculo de cambio) y tarjeta (últimos 4 dígitos)
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

  - [ ]* 11.3 Escribir tests unitarios para la sección de órdenes pendientes
    - Verificar que la búsqueda por DPI muestra resultados correctos
    - Verificar que el formulario de pago se prellena correctamente
    - Verificar generación de `IdempotencyKey` único
    - _Requisitos: 8.1, 8.5, 8.9_

- [x] 12. Checkpoint — Verificar compilación frontend Área 2
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.


- [x] 13. Área 3 — Backend: Entidad InventoryMovement y patrón CRUD completo
  - [x] 13.1 Crear entidad `InventoryMovement` en `hospital.Server/Entities/Models/`
    - Crear clase que herede de `IEntity<long>` con propiedades: `Id`, `MedicineInventoryId` (FK), `MedicineId` (FK), `BranchId` (FK), `MovementType` (int, enum 0-6), `Quantity` (int), `PreviousStock` (int), `NewStock` (int), `UnitCost` (decimal), `TotalCost` (decimal), `ReferenceNumber` (string?), `ReferenceType` (string?), `Notes` (string?), `UserId` (FK), campos de auditoría estándar (`State`, `CreatedAt`, `CreatedBy`, `UpdatedBy`, `UpdatedAt`)
    - Agregar propiedades de navegación: `MedicineInventory`, `Medicine`, `Branch`, `User`
    - _Requisitos: 10.1_

  - [x] 13.2 Crear configuración de entidad `InventoryMovementConfiguration` en `hospital.Server/Context/Configurations/`
    - Configurar tabla "InventoryMovements", clave primaria, precisión de `UnitCost` y `TotalCost` (10,2), longitudes máximas de `ReferenceNumber` (100), `ReferenceType` (50), `Notes` (500)
    - Configurar relaciones FK: `MedicineInventory`, `Medicine`, `Branch`, `User`
    - Registrar en `DataContext` como `DbSet<InventoryMovement>`
    - _Requisitos: 10.1_

  - [x] 13.3 Crear DTOs `InventoryMovementRequest` y `InventoryMovementResponse`
    - `InventoryMovementRequest` en `hospital.Server/Entities/Request/`: implementar `IRequest<long?>` con todas las propiedades nullable
    - `InventoryMovementResponse` en `hospital.Server/Entities/Response/`: propiedades no-nullable con `CreatedAt` y `UpdatedAt` como string (formato fecha)
    - _Requisitos: 10.1_

  - [x] 13.4 Crear validadores para InventoryMovement
    - `CreateInventoryMovementValidation` (hereda `CreateValidator<InventoryMovementRequest>`): validar `MedicineInventoryId`, `MedicineId`, `BranchId` requeridos; `MovementType` entre 0-6; `Quantity` > 0 entero; `UnitCost` >= 0 decimal; para ajustes (4,5) validar `Notes` obligatorio con mínimo 10 caracteres; para compras (0) validar `UnitCost` > 0
    - `UpdateInventoryMovementValidation` (hereda `UpdateValidator<InventoryMovementRequest>`)
    - `PartialInventoryMovementValidation` (hereda `PartialUpdateValidator<InventoryMovementRequest>`)
    - Registrar los 3 validadores en `ValidationsGroup.cs` con `AddKeyedScoped`
    - _Requisitos: 10.1, 11.5, 11.6, 11.10_

  - [x] 13.5 Crear mappers Mapster para InventoryMovement en `MapsterConfig.cs`
    - `TypeAdapterConfig<InventoryMovementRequest, InventoryMovement>.NewConfig()` — Request → Entity
    - `TypeAdapterConfig<InventoryMovement, InventoryMovementResponse>.NewConfig()` — Entity → Response (formatear `CreatedAt` y `UpdatedAt`)
    - `TypeAdapterConfig<InventoryMovement, InventoryMovement>.NewConfig()` — Entity → Entity para actualizaciones parciales
    - _Requisitos: 10.1_

  - [x] 13.6 Registrar `EntityService<InventoryMovement>` en `ServicesGroup.cs`
    - Agregar `services.AddScoped<IEntityService<InventoryMovement, InventoryMovementRequest, long>, EntityService<InventoryMovement, InventoryMovementRequest, long>>()`
    - _Requisitos: 10.1, 10.2_

  - [x] 13.7 Crear `InventoryMovementController` en `hospital.Server/Controllers/`
    - Heredar de `CrudController<InventoryMovement, InventoryMovementRequest, InventoryMovementResponse, long>`
    - Decorar con `[ModuleInfo(DisplayName = "Bitácora de Inventario", Description = "Gestión de movimientos de inventario de farmacia", Icon = "bi-journal-text", Path = "inventory-movement", Order = 16, IsVisible = true)]`
    - Ruta: `[Route("api/v1/[controller]")]`
    - _Requisitos: 10.2_

- [x] 14. Área 3 — Backend: Interceptores de inventario y movimiento automático por despacho
  - [x] 14.1 Crear `InventoryMovementBeforeCreateInterceptor` en `hospital.Server/Interceptors/`
    - Implementar `IEntityBeforeCreateInterceptor<InventoryMovement, InventoryMovementRequest>`
    - Obtener `MedicineInventory` por `MedicineInventoryId`
    - Registrar `PreviousStock = MedicineInventory.CurrentStock`
    - Si es entrada (MovementType 0, 1, 4): `NewStock = PreviousStock + Quantity`
    - Si es salida (MovementType 2, 3, 5, 6): validar `PreviousStock >= Quantity`, sino rechazar con "Stock insuficiente. Stock actual: {currentStock}, cantidad solicitada: {quantity}"; `NewStock = PreviousStock - Quantity`
    - Actualizar `MedicineInventory.CurrentStock = NewStock`
    - Calcular `TotalCost = UnitCost × Quantity`
    - Usar bloqueo optimista (`RowVersion`) al guardar `MedicineInventory`
    - Registrar en `ServicesGroup.cs`
    - _Requisitos: 10.5, 10.6, 10.7, 10.9, 10.10, 11.7, 11.8_

  - [x] 14.2 Crear `DispenseAfterStatusChangeInterceptor` en `hospital.Server/Interceptors/`
    - Implementar interceptor que detecte cuando un `Dispense` cambia a `DispenseStatus=2` (Dispensed)
    - Por cada `DispenseItem` del despacho, crear automáticamente un `InventoryMovement` de tipo `Despacho` (MovementType=6)
    - Decrementar `MedicineInventory.CurrentStock` por cada medicamento despachado
    - Registrar `PreviousStock`, `NewStock`, `ReferenceType="Despacho"`, `ReferenceNumber=Dispense.Id`
    - Registrar en `ServicesGroup.cs`
    - _Requisitos: 10.8_

  - [ ]* 14.3 Escribir tests unitarios para interceptores de inventario
    - Verificar que movimiento de entrada incrementa `CurrentStock`
    - Verificar que movimiento de salida decrementa `CurrentStock`
    - Verificar rechazo cuando stock insuficiente
    - Verificar que `PreviousStock` y `NewStock` son consistentes
    - Verificar movimiento automático al despachar
    - _Requisitos: 10.5, 10.6, 10.7, 10.8, 10.10_

- [x] 15. Checkpoint — Verificar compilación del backend Área 3 (Inventario)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.

- [x] 16. Área 3 — Frontend: Tipos, servicios y bitácora de movimientos
  - [x] 16.1 Crear tipos TypeScript para InventoryMovement
    - Crear `InventoryMovementRequest` y `InventoryMovementResponse` en `hospital.client/src/types/`
    - Incluir todos los campos definidos en el diseño
    - Crear constante `MovementTypeLabels` con mapeo de valores numéricos a nombres en español y colores de badge
    - _Requisitos: 10.1, 10.4_

  - [x] 16.2 Crear `inventoryMovementService.ts` en `hospital.client/src/services/`
    - Implementar funciones CRUD: `getInventoryMovements`, `getInventoryMovement`, `createInventoryMovement`, `updateInventoryMovement`, `deleteInventoryMovement`
    - Usar `API_URL + "InventoryMovement"` como base URL
    - _Requisitos: 10.2, 10.3_

  - [x] 16.3 Actualizar `MedicineInventoryPage.tsx` — agregar sección de bitácora de movimientos
    - Agregar tab o sección "Bitácora de Movimientos" debajo de la tabla de inventario existente
    - Usar `TableServer` con filtros por: medicamento, sucursal, tipo de movimiento, rango de fechas, usuario
    - Columnas: fecha/hora, tipo de movimiento (badge de color: Compra=verde, Venta=azul, Reclamo=rojo, Ajuste=amarillo, Despacho=morado), medicamento, sucursal, cantidad, stock anterior, stock nuevo, costo, referencia, usuario
    - Crear `InventoryMovementResponseColumns.tsx` en `hospital.client/src/components/column/`
    - _Requisitos: 10.3, 10.4_

  - [x] 16.4 Agregar resumen por medicamento en vista de inventario
    - Mostrar en la vista de inventario de cada medicamento: stock actual, stock mínimo, total de entradas del mes, total de salidas del mes, último movimiento registrado
    - _Requisitos: 11.11_

- [x] 17. Área 3 — Frontend: Formulario de operaciones CRUD de inventario
  - [x] 17.1 Crear `InventoryMovementForm.tsx` en `hospital.client/src/components/form/`
    - Selector de tipo de operación: Compra (0), Devolución (1), Venta (2), Reclamo (3), Ajuste+ (4), Ajuste- (5)
    - Campos dinámicos según tipo seleccionado:
      - Compra: medicamento, sucursal, cantidad, costo unitario, número de factura, notas
      - Devolución: medicamento, sucursal, cantidad, referencia, motivo (notas)
      - Venta: medicamento, sucursal, cantidad, referencia
      - Reclamo: medicamento, sucursal, cantidad, referencia, motivo (notas)
      - Ajustes (+/-): medicamento, sucursal, cantidad, justificación obligatoria (min 10 chars en Notes)
    - Validaciones: cantidad > 0 (entero), costo unitario > 0 (decimal, 2 decimales) para compras
    - Alerta visual si stock cae por debajo de `Medicine.MinimumStock` tras operación de salida
    - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.9, 11.10_

  - [x] 17.2 Crear página y rutas para gestión de movimientos de inventario
    - Crear `InventoryMovementPage.tsx` en `hospital.client/src/pages/inventory-movement/`
    - Crear botón `InventoryMovementButton.tsx` en `hospital.client/src/components/button/`
    - Registrar rutas en el router: `/inventory-movement` y `/inventory-movement/create`
    - Crear store `useInventoryMovementStore.ts` en `hospital.client/src/stores/`
    - _Requisitos: 10.2, 10.3, 11.1_

  - [ ]* 17.3 Escribir tests unitarios para `InventoryMovementForm`
    - Verificar que campos dinámicos cambian según tipo de operación
    - Verificar validación de cantidad > 0
    - Verificar validación de justificación obligatoria para ajustes (min 10 chars)
    - Verificar alerta de stock bajo
    - _Requisitos: 11.5, 11.6, 11.9, 11.10_

- [x] 18. Registro de todos los nuevos servicios, validadores e interceptores en DI
  - [x] 18.1 Verificar y completar registros en `ServicesGroup.cs`
    - Confirmar registro de `EntityService<InventoryMovement, InventoryMovementRequest, long>`
    - Confirmar registro de `InventoryMovementBeforeCreateInterceptor`
    - Confirmar registro de `LabOrderItemBeforeCreateInterceptor`
    - Confirmar registro de `DispenseItemBeforeCreateInterceptor`
    - Confirmar registro de `DispenseAfterStatusChangeInterceptor`
    - Confirmar registro de `EmailTemplateService`
    - _Requisitos: 10.2, 7.1, 9.1, 10.8, 5.7_

  - [x] 18.2 Verificar y completar registros en `ValidationsGroup.cs`
    - Confirmar registro de `ManualChangePasswordValidation`
    - Confirmar registro de `CreateInventoryMovementValidation`, `UpdateInventoryMovementValidation`, `PartialInventoryMovementValidation`
    - _Requisitos: 4.3, 10.1_

- [x] 19. Checkpoint final — Verificar compilación completa del proyecto
  - Ejecutar build completo del backend (`dotnet build`) y frontend (`npm run build`)
  - Asegurar que todos los tests pasan, preguntar a Danny si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- El backend usa C# (ASP.NET Core 8) y el frontend usa TypeScript (React 19 + HeroUI + TailwindCSS)
- Se respetan las convenciones del proyecto: `EntityService` + `CrudController`, `[ModuleInfo]`, validadores con `AddKeyedScoped`, configuraciones de entidad en `Context/Configurations/`, mappers en `MapsterConfig.cs`