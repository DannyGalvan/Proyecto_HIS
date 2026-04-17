# Documento de Requisitos — Cuentas, Órdenes e Inventario (HIS)

## Introducción

Este documento especifica los requisitos para mejoras integrales al Sistema de Información Hospitalaria (HIS) en tres áreas interconectadas: gestión de cuentas de usuario, cálculo de precios en órdenes médicas y gestión de inventario de farmacia.

**Área 1 — Cuentas de Usuario** cubre: recuperación de contraseña (pacientes y personal), gestión de perfil del paciente, toggle de visibilidad de contraseña en formularios, cambio manual de contraseña, plantillas de correo profesionales y limpieza de la página de login.

**Área 2 — Precios y Pagos de Órdenes** cubre: cálculo automático de precios en órdenes de laboratorio (desde LabExam.DefaultAmount), cálculo de precios en órdenes/despachos de farmacia (desde Medicine.DefaultPrice), y la integración de órdenes pendientes en el módulo de caja para que los cajeros puedan cobrar.

**Área 3 — Inventario de Farmacia** cubre: bitácora de entradas/salidas de medicamentos y operaciones CRUD completas para reabastecimiento (compras, devoluciones, ventas, reclamos).

El backend es ASP.NET Core 8 con PostgreSQL. El frontend es React 19 + TypeScript + Vite + HeroUI + TailwindCSS. La arquitectura sigue el patrón `EntityService` + `CrudController` con sincronización automática de permisos mediante reflexión.

---

## Glosario

- **HIS**: Sistema de Información Hospitalaria. Aplicación web compuesta por un backend ASP.NET Core 8 y un frontend React 19.
- **Portal_Paciente**: Subsistema público del HIS accesible para pacientes externos registrados con Rol_Paciente.
- **Panel_Administrativo**: Conjunto de rutas del frontend accesibles únicamente para personal interno del hospital (médicos, enfermería, administración, laboratorio, farmacia, caja).
- **AuthService**: Servicio del backend que gestiona autenticación, registro, recuperación y cambio de contraseña. Utiliza BCrypt para hashing.
- **SendEmail**: Servicio del backend que envía correos electrónicos vía SMTP. Actualmente envía HTML plano sin plantillas profesionales.
- **RecoveryToken**: Token BCrypt generado por el AuthService y almacenado en User.RecoveryToken. Tiene una vigencia de 15 minutos controlada por User.DateToken.
- **Plantilla_Correo**: Estructura HTML/CSS profesional con branding del HIS utilizada para todos los correos transaccionales del sistema.
- **Toggle_Visibilidad**: Componente de interfaz (icono de ojo) que permite alternar entre mostrar y ocultar el texto de un campo de contraseña.
- **LabOrder**: Entidad que representa una orden de laboratorio. Contiene TotalAmount y una colección de LabOrderItem.
- **LabOrderItem**: Línea de detalle de una LabOrder. Contiene Amount (precio individual del examen) y referencia a LabExam.
- **LabExam**: Catálogo de exámenes de laboratorio. Contiene DefaultAmount (precio base del examen en GTQ).
- **Dispense**: Entidad que representa un despacho de farmacia vinculado a una Prescription. Contiene TotalAmount y una colección de DispenseItem.
- **DispenseItem**: Línea de detalle de un Dispense. Contiene MedicineId, Quantity, UnitPrice y referencia a Medicine.
- **Medicine**: Catálogo de medicamentos. Contiene DefaultPrice (precio unitario base en GTQ).
- **MedicineInventory**: Entidad que rastrea el stock actual (CurrentStock) de un Medicine en una Branch específica. Usa bloqueo optimista con RowVersion (xmin de PostgreSQL).
- **InventoryMovement**: Nueva entidad propuesta para registrar cada entrada o salida de medicamentos en el inventario, incluyendo tipo de movimiento, cantidad, referencia y usuario responsable.
- **MovementType**: Enumeración que clasifica los movimientos de inventario: 0=Compra, 1=Devolución_Proveedor, 2=Venta, 3=Reclamo, 4=Ajuste_Positivo, 5=Ajuste_Negativo, 6=Despacho.
- **Cajero**: Usuario del HIS con rol de Caja/Recepción que procesa pagos presenciales de órdenes de laboratorio, despachos de farmacia y citas.
- **Payment**: Entidad que registra un pago. Soporta AppointmentId, LabOrderId y DispenseId como FK opcionales para vincular el pago al servicio correspondiente.
- **Orden_Pendiente**: Cualquier LabOrder con OrderStatus=0 (Pending) o Dispense con DispenseStatus=0 (Pending) que aún no ha sido pagada.

---

## Requisitos

---

### Requisito 1: Recuperación de Contraseña para Pacientes y Personal

**User Story:** Como usuario del HIS (paciente externo o personal administrativo), quiero recuperar mi contraseña mediante un enlace enviado a mi correo electrónico, para poder restablecer el acceso a mi cuenta sin intervención del administrador.

#### Criterios de Aceptación

1. WHEN un usuario ingresa su correo electrónico registrado en el formulario de recuperación y envía la solicitud, THE AuthService SHALL generar un RecoveryToken, almacenarlo en User.RecoveryToken, registrar la fecha en User.DateToken y enviar un correo electrónico al usuario con un enlace que contenga el token.

2. WHEN el usuario accede al enlace de recuperación con un token válido cuya antigüedad sea menor a 15 minutos respecto a User.DateToken, THE AuthService SHALL permitir al usuario establecer una nueva contraseña.

3. IF el token de recuperación tiene una antigüedad igual o mayor a 15 minutos respecto a User.DateToken, THEN THE AuthService SHALL rechazar la solicitud de cambio y retornar el mensaje "El token de recuperación ha expirado. Solicite uno nuevo."

4. IF el correo electrónico ingresado no corresponde a ningún usuario activo (State=1) en la base de datos, THEN THE AuthService SHALL retornar una respuesta genérica de éxito sin revelar si el correo existe o no, para prevenir enumeración de cuentas.

5. THE Portal_Paciente SHALL exponer un enlace "¿Olvidó su contraseña?" en la página de login del portal que dirija al formulario de recuperación.

6. THE Panel_Administrativo SHALL exponer un enlace "¿Olvidó su contraseña?" en la página de login administrativo que dirija al formulario de recuperación.

7. WHEN el usuario establece una nueva contraseña mediante el token de recuperación, THE AuthService SHALL validar que la nueva contraseña tenga un mínimo de 12 caracteres, sea diferente a la contraseña anterior y que los campos "contraseña" y "confirmar contraseña" coincidan.

8. WHEN el cambio de contraseña por recuperación es exitoso, THE AuthService SHALL limpiar el RecoveryToken del usuario, establecer Reset en false y registrar la fecha de actualización.

---

### Requisito 2: Gestión de Perfil del Paciente en el Portal

**User Story:** Como paciente registrado en el portal, quiero acceder a una sección de perfil donde pueda ver y actualizar mis datos personales, para mantener mi información al día sin necesidad de contactar al hospital.

#### Criterios de Aceptación

1. THE Portal_Paciente SHALL exponer una vista de perfil en la ruta `/portal/profile` accesible únicamente para pacientes autenticados con Rol_Paciente.

2. WHEN un paciente autenticado accede a su perfil, THE Portal_Paciente SHALL mostrar los datos actuales del usuario: nombre completo, correo electrónico, teléfono, DPI (solo lectura), NIT y número de seguro médico.

3. THE Portal_Paciente SHALL impedir la edición del campo DPI (IdentificationDocument) en el formulario de perfil, mostrándolo como campo de solo lectura.

4. WHEN el paciente modifica sus datos y envía el formulario, THE Portal_Paciente SHALL enviar una petición `PATCH /api/v1/User` con únicamente los campos modificados y el Id del usuario autenticado.

5. THE Portal_Paciente SHALL validar en el frontend que el nombre completo tenga entre 10 y 100 caracteres, el teléfono contenga exactamente 8 dígitos numéricos y el correo electrónico tenga formato válido antes de enviar la petición.

6. IF el correo electrónico actualizado ya está en uso por otro usuario, THEN THE Portal_Paciente SHALL mostrar el mensaje "El correo electrónico ya está en uso por otra cuenta."

7. WHEN la actualización del perfil es exitosa, THE Portal_Paciente SHALL mostrar un mensaje de confirmación "Perfil actualizado correctamente" y refrescar los datos mostrados.

---

### Requisito 3: Toggle de Visibilidad de Contraseña en Formularios

**User Story:** Como usuario del HIS, quiero poder alternar la visibilidad de mi contraseña en cualquier formulario que contenga campos de contraseña, para verificar lo que estoy escribiendo y reducir errores de ingreso.

#### Criterios de Aceptación

1. THE HIS SHALL incluir un Toggle_Visibilidad (icono de ojo) en cada campo de tipo contraseña de los siguientes formularios: LoginForm (login administrativo), formulario de login del portal, formulario de registro de paciente, formulario de recuperación de contraseña, formulario de cambio manual de contraseña y formulario de perfil (si incluye cambio de contraseña).

2. WHEN el usuario hace clic en el Toggle_Visibilidad, THE HIS SHALL alternar el atributo `type` del campo entre "password" y "text", mostrando u ocultando el contenido del campo.

3. THE Toggle_Visibilidad SHALL mostrar un icono de ojo abierto cuando la contraseña está oculta y un icono de ojo cerrado (tachado) cuando la contraseña es visible.

4. THE Toggle_Visibilidad SHALL ser un componente reutilizable que pueda integrarse en cualquier campo de contraseña del sistema sin duplicar lógica.

5. WHILE el campo de contraseña tiene el tipo "text" (contraseña visible), THE HIS SHALL revertir automáticamente a tipo "password" después de 10 segundos de inactividad en el campo, como medida de seguridad.

---

### Requisito 4: Cambio Manual de Contraseña para Usuarios Autenticados

**User Story:** Como usuario autenticado del HIS (paciente o personal), quiero poder cambiar mi contraseña manualmente desde mi sesión activa, para mantener la seguridad de mi cuenta de forma proactiva.

#### Criterios de Aceptación

1. THE Portal_Paciente SHALL exponer una opción de "Cambiar Contraseña" accesible desde la vista de perfil del paciente o desde el menú de usuario.

2. THE Panel_Administrativo SHALL exponer una opción de "Cambiar Contraseña" accesible desde el menú de usuario del personal administrativo.

3. WHEN un usuario autenticado solicita cambiar su contraseña, THE HIS SHALL requerir tres campos: contraseña actual, nueva contraseña y confirmación de nueva contraseña.

4. THE AuthService SHALL validar que la contraseña actual proporcionada coincida con la contraseña almacenada del usuario antes de permitir el cambio.

5. IF la contraseña actual proporcionada no coincide con la almacenada, THEN THE AuthService SHALL retornar el mensaje "La contraseña actual es incorrecta."

6. THE AuthService SHALL validar que la nueva contraseña tenga un mínimo de 12 caracteres y sea diferente a la contraseña actual.

7. WHEN el cambio de contraseña es exitoso, THE AuthService SHALL actualizar el hash BCrypt de la contraseña, registrar la fecha en User.LastPasswordChange y retornar un mensaje de confirmación.

8. WHEN el cambio de contraseña es exitoso, THE HIS SHALL mostrar el mensaje "Contraseña actualizada correctamente" y mantener la sesión activa del usuario.

---

### Requisito 5: Plantillas de Correo Profesionales para el HIS

**User Story:** Como administrador del hospital, quiero que todos los correos electrónicos enviados por el sistema tengan un diseño profesional y consistente con la marca del HIS, para transmitir confianza y seriedad a pacientes y personal.

#### Criterios de Aceptación

1. THE SendEmail SHALL utilizar plantillas HTML responsivas con el branding del HIS (logo, colores institucionales, tipografía) para todos los correos transaccionales del sistema.

2. THE Plantilla_Correo SHALL incluir: encabezado con logo del HIS, cuerpo del mensaje con formato legible, pie de página con datos de contacto del hospital y aviso de no-responder.

3. THE SendEmail SHALL soportar las siguientes plantillas específicas: recuperación de contraseña, confirmación de cambio de contraseña, confirmación de cita (existente) y confirmación de pago.

4. WHEN el AuthService envía un correo de recuperación de contraseña, THE SendEmail SHALL utilizar la plantilla de recuperación que incluya: saludo personalizado con el nombre del usuario, enlace de recuperación con el token, indicación de vigencia de 15 minutos y advertencia de ignorar si no fue solicitado.

5. WHEN el AuthService completa un cambio de contraseña exitoso, THE SendEmail SHALL enviar un correo de confirmación al usuario utilizando la plantilla correspondiente que incluya: notificación del cambio, fecha y hora del cambio e instrucciones para contactar soporte si el cambio no fue realizado por el usuario.

6. THE Plantilla_Correo SHALL ser compatible con los principales clientes de correo electrónico (Gmail, Outlook, Yahoo) utilizando CSS inline y tablas para layout.

7. THE SendEmail SHALL recibir los datos dinámicos (nombre del usuario, enlace, fecha) como parámetros y reemplazarlos en la plantilla antes del envío, sin concatenar HTML manualmente.

---

### Requisito 6: Limpieza de la Página de Login Administrativo

**User Story:** Como personal del hospital, quiero que la página de login muestre únicamente los elementos funcionales necesarios, para evitar confusión con enlaces o elementos que no funcionan.

#### Criterios de Aceptación

1. THE LoginForm del Panel_Administrativo SHALL mostrar únicamente los siguientes elementos: campo de nombre de usuario, campo de contraseña con Toggle_Visibilidad, botón de "Iniciar Sesión" y enlace funcional de "¿Olvidó su contraseña?".

2. THE LoginForm del Panel_Administrativo SHALL eliminar el enlace "No tienes cuenta? Registrate" ya que el registro de personal se realiza exclusivamente por administradores desde el panel interno.

3. THE LoginForm del Panel_Administrativo SHALL eliminar el enlace "Ver Portal de Servicios" ya que no es relevante para el flujo de login del personal.

4. THE LoginForm del Panel_Administrativo SHALL mantener el logo del HIS y un diseño limpio y profesional acorde a la identidad visual del hospital.

5. IF el usuario intenta acceder a una ruta protegida sin autenticación, THEN THE Panel_Administrativo SHALL redirigir al formulario de login mostrando el mensaje "Debe iniciar sesión para acceder."

---

### Requisito 7: Cálculo de Precios en Órdenes de Laboratorio

**User Story:** Como doctor que crea órdenes de laboratorio, quiero que el sistema calcule automáticamente el precio de cada examen y el total de la orden, para que el paciente y el cajero conozcan el monto a pagar.

#### Criterios de Aceptación

1. WHEN un doctor agrega un LabExam a una LabOrder, THE HIS SHALL copiar el valor de LabExam.DefaultAmount al campo LabOrderItem.Amount automáticamente.

2. WHEN se agregan, eliminan o modifican LabOrderItems en una LabOrder, THE HIS SHALL recalcular LabOrder.TotalAmount como la suma de todos los LabOrderItem.Amount activos (State=1) de esa orden.

3. THE HIS SHALL mostrar en la interfaz de creación de órdenes de laboratorio: el nombre de cada examen, su precio individual (Amount) y el total acumulado de la orden (TotalAmount) actualizado en tiempo real.

4. THE HIS SHALL mostrar en la vista de detalle de una LabOrder existente: la lista de exámenes con sus precios individuales y el total de la orden.

5. WHEN el backend recibe una petición para crear una LabOrder con Items, THE HIS SHALL calcular el TotalAmount en el servidor como la suma de los Amount de cada LabOrderItem, ignorando cualquier TotalAmount enviado por el frontend.

6. IF un LabExam no tiene DefaultAmount definido (valor 0 o nulo), THEN THE HIS SHALL mostrar una advertencia visual "Precio no configurado" junto al examen y asignar Amount=0 al LabOrderItem correspondiente.

7. THE HIS SHALL mostrar el TotalAmount de cada LabOrder en la tabla de listado de órdenes de laboratorio con formato de moneda GTQ (ejemplo: "Q 150.00").

---

### Requisito 8: Integración de Órdenes Pendientes en el Módulo de Caja

**User Story:** Como cajero del hospital, quiero ver todas las órdenes de laboratorio y despachos de farmacia pendientes de pago, para poder cobrar a los pacientes de forma eficiente desde un solo módulo.

#### Criterios de Aceptación

1. THE HIS SHALL agregar en el módulo de pagos (PaymentPage) una sección de "Órdenes Pendientes de Pago" que permita al Cajero buscar órdenes por DPI del paciente o por número de orden.

2. WHEN el Cajero busca por DPI de un paciente, THE HIS SHALL consultar y mostrar todas las LabOrders con OrderStatus=0 (Pending) y todos los Dispenses con DispenseStatus=0 (Pending) asociados a ese paciente.

3. THE HIS SHALL mostrar para cada LabOrder pendiente: número de orden (OrderNumber), nombre del paciente, fecha de creación, cantidad de exámenes, TotalAmount y un botón de "Cobrar".

4. THE HIS SHALL mostrar para cada Dispense pendiente: Id del despacho, nombre del paciente, fecha de creación, cantidad de medicamentos, TotalAmount y un botón de "Cobrar".

5. WHEN el Cajero selecciona "Cobrar" en una Orden_Pendiente, THE HIS SHALL abrir el formulario de pago prellenado con: el monto total de la orden, el tipo de pago correspondiente (PaymentType=1 para laboratorio, PaymentType=2 para farmacia) y la referencia a la orden (LabOrderId o DispenseId).

6. WHEN el pago de una LabOrder es completado exitosamente (PaymentStatus=1), THE HIS SHALL actualizar LabOrder.OrderStatus a 1 (Paid) mediante una petición `PATCH /api/v1/LabOrder`.

7. WHEN el pago de un Dispense es completado exitosamente (PaymentStatus=1), THE HIS SHALL actualizar Dispense.DispenseStatus a 1 (Paid) mediante una petición `PATCH /api/v1/Dispense`.

8. THE HIS SHALL soportar pago en efectivo y con tarjeta (POS) para las órdenes pendientes, siguiendo el mismo flujo de pago presencial existente (cálculo de cambio para efectivo, últimos 4 dígitos para tarjeta).

9. THE HIS SHALL generar un IdempotencyKey (UUID v4) único para cada transacción de pago de orden pendiente, previniendo cobros duplicados.

10. THE HIS SHALL mostrar un resumen consolidado cuando un paciente tiene múltiples órdenes pendientes, permitiendo al Cajero seleccionar cuáles cobrar en una misma sesión.

---

### Requisito 9: Cálculo de Precios en Órdenes y Despachos de Farmacia

**User Story:** Como farmacéutico que crea despachos de medicamentos, quiero que el sistema calcule automáticamente el precio de cada medicamento y el total del despacho, para que el paciente y el cajero conozcan el monto a pagar.

#### Criterios de Aceptación

1. WHEN un farmacéutico agrega un Medicine a un DispenseItem, THE HIS SHALL copiar el valor de Medicine.DefaultPrice al campo DispenseItem.UnitPrice automáticamente.

2. WHEN se agregan, eliminan o modifican DispenseItems en un Dispense, THE HIS SHALL recalcular Dispense.TotalAmount como la suma de (DispenseItem.UnitPrice × DispenseItem.Quantity) para todos los DispenseItems activos (State=1) de ese despacho.

3. THE HIS SHALL mostrar en la interfaz de creación de despachos: el nombre de cada medicamento, cantidad, precio unitario (UnitPrice), subtotal por línea (UnitPrice × Quantity) y el total acumulado del despacho (TotalAmount) actualizado en tiempo real.

4. THE HIS SHALL mostrar en la vista de detalle de un Dispense existente: la lista de medicamentos con cantidad, precio unitario, subtotal por línea y el total del despacho.

5. WHEN el backend recibe una petición para crear un Dispense con Items, THE HIS SHALL calcular el TotalAmount en el servidor como la suma de (UnitPrice × Quantity) de cada DispenseItem, ignorando cualquier TotalAmount enviado por el frontend.

6. IF un Medicine no tiene DefaultPrice definido (valor 0 o nulo), THEN THE HIS SHALL mostrar una advertencia visual "Precio no configurado" junto al medicamento y asignar UnitPrice=0 al DispenseItem correspondiente.

7. THE HIS SHALL mostrar el TotalAmount de cada Dispense en la tabla de listado de despachos con formato de moneda GTQ (ejemplo: "Q 250.00").

8. WHEN el farmacéutico modifica la cantidad (Quantity) de un DispenseItem, THE HIS SHALL recalcular el subtotal de esa línea y el TotalAmount del despacho en tiempo real.

---

### Requisito 10: Bitácora de Movimientos de Inventario de Farmacia

**User Story:** Como administrador de farmacia, quiero un registro detallado de todas las entradas y salidas de medicamentos, para tener trazabilidad completa de los movimientos de inventario y facilitar auditorías.

#### Criterios de Aceptación

1. THE HIS SHALL crear una nueva entidad InventoryMovement que registre cada movimiento de inventario con los campos: Id, MedicineInventoryId (FK), MedicineId (FK), BranchId (FK), MovementType (enum: 0=Compra, 1=Devolución_Proveedor, 2=Venta, 3=Reclamo, 4=Ajuste_Positivo, 5=Ajuste_Negativo, 6=Despacho), Quantity (entero positivo), PreviousStock (stock antes del movimiento), NewStock (stock después del movimiento), UnitCost (costo unitario del movimiento), TotalCost (costo total del movimiento), ReferenceNumber (número de factura, orden o documento de referencia), ReferenceType (tipo de documento: "Factura", "OrdenCompra", "Despacho", "Reclamo"), Notes (observaciones), UserId (FK al usuario que realizó el movimiento) y campos de auditoría estándar (State, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy).

2. THE HIS SHALL exponer un controlador InventoryMovementController con ruta `api/v1/InventoryMovement`, decorado con `[ModuleInfo]` para sincronización automática de permisos, que soporte las operaciones CRUD estándar del patrón EntityService.

3. THE HIS SHALL mostrar en el módulo de inventario una vista de "Bitácora de Movimientos" que liste todos los movimientos de inventario con filtros por: medicamento, sucursal, tipo de movimiento, rango de fechas y usuario responsable.

4. THE HIS SHALL mostrar para cada movimiento en la bitácora: fecha y hora, tipo de movimiento (con badge de color), nombre del medicamento, sucursal, cantidad, stock anterior, stock nuevo, costo, número de referencia y nombre del usuario responsable.

5. WHEN se registra un movimiento de tipo entrada (Compra, Devolución_Proveedor, Ajuste_Positivo), THE HIS SHALL incrementar MedicineInventory.CurrentStock en la cantidad especificada.

6. WHEN se registra un movimiento de tipo salida (Venta, Reclamo, Ajuste_Negativo, Despacho), THE HIS SHALL decrementar MedicineInventory.CurrentStock en la cantidad especificada.

7. IF un movimiento de salida resultaría en un CurrentStock negativo, THEN THE HIS SHALL rechazar la operación y retornar el mensaje "Stock insuficiente. Stock actual: {currentStock}, cantidad solicitada: {quantity}."

8. THE HIS SHALL registrar automáticamente un InventoryMovement de tipo Despacho (MovementType=6) cuando un Dispense cambia a estado Dispensed (DispenseStatus=2), decrementando el stock de cada medicamento despachado.

9. THE HIS SHALL utilizar bloqueo optimista (RowVersion/xmin) de MedicineInventory para prevenir condiciones de carrera al actualizar el stock concurrentemente.

10. FOR ALL movimientos de inventario, registrar el movimiento y actualizar el stock SHALL producir un estado consistente donde NewStock del movimiento sea igual a MedicineInventory.CurrentStock después de la operación (propiedad de consistencia).

---

### Requisito 11: Operaciones CRUD de Reabastecimiento de Farmacia

**User Story:** Como administrador de farmacia, quiero gestionar las operaciones de entrada y salida de medicamentos (compras, devoluciones, ventas, reclamos), para mantener el inventario actualizado y cubrir todos los escenarios operativos de la farmacia.

#### Criterios de Aceptación

1. THE HIS SHALL exponer en el módulo de inventario una interfaz para registrar entradas de medicamentos por compra (MovementType=0) que requiera: medicamento, sucursal, cantidad, costo unitario, número de factura del proveedor y notas opcionales.

2. THE HIS SHALL exponer en el módulo de inventario una interfaz para registrar entradas por devolución de proveedor (MovementType=1) que requiera: medicamento, sucursal, cantidad, número de referencia de la devolución y motivo de la devolución en notas.

3. THE HIS SHALL exponer en el módulo de inventario una interfaz para registrar salidas por venta directa (MovementType=2) que requiera: medicamento, sucursal, cantidad y número de referencia de venta.

4. THE HIS SHALL exponer en el módulo de inventario una interfaz para registrar salidas por reclamo (MovementType=3) que requiera: medicamento, sucursal, cantidad, número de referencia del reclamo y motivo del reclamo en notas.

5. THE HIS SHALL validar que la cantidad ingresada en cualquier operación de inventario sea un número entero positivo mayor a cero.

6. THE HIS SHALL validar que el costo unitario ingresado en operaciones de compra sea un valor decimal positivo con precisión de hasta 2 decimales.

7. WHEN se registra una operación de entrada (compra o devolución), THE HIS SHALL crear un InventoryMovement con PreviousStock igual al CurrentStock actual, calcular NewStock como PreviousStock + Quantity y actualizar MedicineInventory.CurrentStock al valor de NewStock.

8. WHEN se registra una operación de salida (venta o reclamo), THE HIS SHALL crear un InventoryMovement con PreviousStock igual al CurrentStock actual, calcular NewStock como PreviousStock - Quantity y actualizar MedicineInventory.CurrentStock al valor de NewStock.

9. IF el CurrentStock de un medicamento cae por debajo de Medicine.MinimumStock después de una operación de salida, THEN THE HIS SHALL mostrar una alerta visual "Stock bajo: el medicamento {nombre} tiene {currentStock} unidades, por debajo del mínimo de {minimumStock}."

10. THE HIS SHALL permitir registrar ajustes positivos (MovementType=4) y ajustes negativos (MovementType=5) para correcciones de inventario, requiriendo una justificación obligatoria en el campo Notes con un mínimo de 10 caracteres.

11. THE HIS SHALL mostrar en la vista de inventario de cada medicamento un resumen con: stock actual, stock mínimo, total de entradas del mes, total de salidas del mes y último movimiento registrado.

12. FOR ALL operaciones de inventario, crear un movimiento de entrada y luego un movimiento de salida por la misma cantidad SHALL restaurar el CurrentStock al valor original (propiedad de ida y vuelta).
