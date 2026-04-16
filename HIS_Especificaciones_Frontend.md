# Especificaciones Frontend — Sistema de Información Hospitalaria (HIS)

**Versión:** 1.0.0  
**Fecha:** 16 de abril de 2026  
**Backend:** ASP.NET Core 8.0 · PostgreSQL (Neon) · JWT Auth  
**Base URL:** `https://{host}/api/v1`

---

## 1. Arquitectura General de Comunicación

### 1.1 Patrón de Respuesta Estándar

Todos los endpoints del backend retornan un objeto `Response<T>` con la siguiente estructura:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... },
  "totalResults": 100
}
```

En caso de error (validación, negocio, etc.):

```json
{
  "success": false,
  "message": "Error de validación",
  "data": [
    { "propertyName": "Name", "errorMessage": "El nombre es requerido." }
  ],
  "totalResults": 0
}
```

### 1.2 Autenticación JWT

Todas las peticiones (excepto login, registro, recuperación de contraseña y portal público) requieren el header:

```
Authorization: Bearer {token}
```

El token se obtiene del endpoint de login y contiene claims de usuario (Id, Rol, Operaciones permitidas).

### 1.3 Paginación y Filtros (QueryParams)

Todos los endpoints `GET` de listado aceptan los siguientes query params:

| Parámetro      | Tipo    | Default | Descripción                                        |
|----------------|---------|---------|----------------------------------------------------|
| `Filters`      | string  | null    | Filtros dinámicos (ej. `Name:Acetaminofén`)        |
| `Include`      | string  | null    | Relaciones a incluir separadas por coma             |
| `PageNumber`   | int     | 1       | Número de página                                   |
| `PageSize`     | int     | 30      | Registros por página                               |
| `IncludeTotal` | bool    | false   | Si es `true`, retorna `totalResults` en la respuesta|

### 1.4 Operaciones CRUD Base

Todos los controladores de entidades heredan del mismo patrón:

| Método   | Ruta                        | Descripción              | Body           |
|----------|-----------------------------|--------------------------|----------------|
| `GET`    | `/api/v1/{controller}`      | Listar con paginación    | —              |
| `GET`    | `/api/v1/{controller}/{id}` | Obtener por ID           | —              |
| `POST`   | `/api/v1/{controller}`      | Crear                    | Request DTO    |
| `PUT`    | `/api/v1/{controller}`      | Actualización completa   | Request DTO    |
| `PATCH`  | `/api/v1/{controller}`      | Actualización parcial    | Request DTO    |
| `DELETE` | `/api/v1/{controller}/{id}` | Eliminación lógica       | —              |

**Nota importante:** `PUT` y `PATCH` NO llevan `{id}` en la ruta — el `Id` viaja dentro del body del Request DTO.

### 1.5 Auditoría Automática

El backend asigna automáticamente `CreatedBy`, `CreatedAt`, `UpdatedBy`, `UpdatedAt` a partir del JWT. El frontend debe enviar estos campos como `null` en los requests, pues el backend los sobreescribe.

### 1.6 Eliminación Lógica

`DELETE` no elimina físicamente — cambia `State` a `0`. El campo `State` es `1` = Activo, `0` = Inactivo.

---

## 2. Módulo de Autenticación

**Controller:** `Auth` — `POST /api/v1/Auth`

### 2.1 Login (CU-01, CU-02)

```
POST /api/v1/Auth
```

**Request:**

```json
{
  "userName": "admin",
  "password": "Admin123!"
}
```

**Response exitoso** — `AuthResponse`:

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "name": "Administrador",
    "userName": "admin",
    "email": "admin@hospital.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "redirect": false,
    "userId": 1,
    "rol": "Administrador",
    "operations": [
      {
        "module": {
          "id": 1,
          "name": "Usuarios",
          "description": "...",
          "image": "bi-people",
          "path": "user",
          "state": 1,
          "order": 2,
          "isVisible": true,
          "operations": []
        },
        "operations": [
          {
            "id": 10,
            "guid": "...",
            "name": "Listar Usuarios",
            "icon": "bi-list",
            "path": "user",
            "isVisible": true,
            "httpMethod": "GET"
          }
        ]
      }
    ]
  }
}
```

**Comportamiento frontend:**
- Almacenar el `token` para todas las peticiones subsecuentes.
- Construir el menú de navegación dinámicamente a partir de `operations` (módulos visibles + operaciones visibles).
- Si `redirect` es `true`, redirigir al cambio de contraseña obligatorio.
- Implementar bloqueo después de 5 intentos fallidos (RN-GLOBAL-007).

### 2.2 Registro de Usuario Externo (CU-02)

```
POST /api/v1/Auth/Register
```

**Request** — `RegisterRequest`:

```json
{
  "name": "Juan Pérez",
  "identificationDocument": "1234567890123",
  "userName": "jperez123",
  "password": "MiPassword123!",
  "email": "jperez@mail.com",
  "number": "55551234",
  "nit": "1234567K",
  "countryCode": "GT",
  "municipalityCode": "0101",
  "state": 1,
  "createdBy": null,
  "updatedBy": null
}
```

**Validaciones frontend (RN-CU02):**
- Nombre: 10–100 caracteres.
- DPI: exactamente 13 dígitos numéricos (RN-GLOBAL-001).
- NIT: 8–9 caracteres alfanuméricos (RN-GLOBAL-002).
- Teléfono: exactamente 8 dígitos numéricos.
- Email: formato válido, único en el sistema.
- Contraseña: mínimo 12 caracteres (RNF-018).
- Nombre de usuario: 8–9 caracteres.

### 2.3 Cambio de Contraseña

```
PUT /api/v1/Auth/ChangePassword
```

**Request** — `ChangePasswordRequest`:

```json
{
  "token": "recovery-token-here",
  "password": "NuevaPassword123!",
  "confirmPassword": "NuevaPassword123!"
}
```

### 2.4 Reset de Contraseña (usuario autenticado)

```
POST /api/v1/Auth/ResetPassword     [Authorize]
```

**Request** — `ResetPasswordRequest`:

```json
{
  "password": "NuevaPassword123!",
  "confirmPassword": "NuevaPassword123!"
}
```

`idUser` se inyecta automáticamente desde el JWT.

### 2.5 Recuperación de Contraseña

```
POST /api/v1/Auth/RecoveryPassword
```

**Request** — `RecoveryPasswordRequest`:

```json
{
  "email": "usuario@mail.com"
}
```

El backend envía un correo con token de recuperación.

### 2.6 Validar Token

```
GET /api/v1/Auth/{token}
```

Valida si un token de recuperación/activación es válido.

---

## 3. Catálogos del Sistema

Catálogos de solo lectura general, administrados por usuarios con rol adecuado. Todos siguen el CRUD estándar.

### 3.1 Especialidades (CU-00, CU-03)

**Ruta:** `/api/v1/Specialty`

| Campo       | Tipo   | Requerido | Descripción              |
|-------------|--------|-----------|--------------------------|
| id          | long?  | PUT/PATCH | Identificador            |
| name        | string | Sí        | Nombre (max 200)         |
| description | string | Sí        | Descripción (max 500)    |
| state       | int?   | Sí        | 0=Inactivo, 1=Activo     |

**Uso frontend:** Dropdown en formulario de agendar cita, listado en portal público.

### 3.2 Sucursales / Sedes (CU-00, CU-03)

**Ruta:** `/api/v1/Branch`

| Campo       | Tipo   | Requerido | Descripción                |
|-------------|--------|-----------|----------------------------|
| id          | long?  | PUT/PATCH | Identificador              |
| name        | string | Sí        | Nombre (max 100)           |
| phone       | string | No        | Teléfono (8 dígitos)       |
| address     | string | No        | Dirección (max 500)        |
| description | string | No        | Descripción (max 250)      |
| state       | int?   | Sí        | 0=Inactivo, 1=Activo       |

**Datos seed:** Sede Central (Zona 10), Sede Zona 1.

### 3.3 Estados de Cita (CU-03, CU-05)

**Ruta:** `/api/v1/AppointmentStatus`

| Campo       | Tipo   | Requerido | Descripción              |
|-------------|--------|-----------|--------------------------|
| id          | long?  | PUT/PATCH | Identificador            |
| name        | string | Sí        | Nombre (max 50)          |
| description | string | No        | Descripción (max 200)    |
| state       | int?   | Sí        | 0=Inactivo, 1=Activo     |

**Datos seed:** Pendiente, Confirmada, Pagada, En curso, Completada, Cancelada, No asistió.

**Visualización (RN-CU05):** Badges de colores: Pagada=verde, Pendiente=amarillo, Cancelada=rojo.

### 3.4 Laboratorios (CU-09)

**Ruta:** `/api/v1/Laboratory`

| Campo       | Tipo   | Requerido | Descripción              |
|-------------|--------|-----------|--------------------------|
| id          | long?  | PUT/PATCH | Identificador            |
| name        | string | Sí        | Nombre (max 200)         |
| description | string | No        | Descripción (max 500)    |
| state       | int?   | Sí        | 0=Inactivo, 1=Activo     |

### 3.5 Exámenes de Laboratorio (CU-09)

**Ruta:** `/api/v1/LabExam`

| Campo          | Tipo    | Requerido | Descripción                     |
|----------------|---------|-----------|---------------------------------|
| id             | long?   | PUT/PATCH | Identificador                   |
| name           | string  | Sí        | Nombre del examen (max 200)     |
| description    | string  | No        | Descripción (max 500)           |
| defaultAmount  | decimal | Sí        | Precio base (precision 10,2)    |
| referenceRange | string  | No        | Rango de referencia             |
| unit           | string  | No        | Unidad de medida                |
| laboratoryId   | long    | Sí        | FK al laboratorio               |
| state          | int?    | Sí        | 0=Inactivo, 1=Activo            |

**Include:** `?Include=Laboratory`

### 3.6 Catálogo de Medicamentos (CU-10)

**Ruta:** `/api/v1/Medicine`

| Campo        | Tipo    | Requerido | Descripción                        |
|--------------|---------|-----------|------------------------------------|
| id           | long?   | PUT/PATCH | Identificador                      |
| name         | string  | Sí        | Nombre (max 200)                   |
| description  | string  | Sí        | Descripción (max 500)              |
| defaultPrice | decimal | Sí        | Precio unitario (precision 10,2)   |
| unit         | string  | Sí        | Unidad (tableta, cápsula, ml, etc.)|
| isControlled | bool    | No        | Medicamento controlado (RNF-017)   |
| minimumStock | int     | No        | Stock mínimo de alerta (RN-CU10-03)|
| state        | int?    | Sí        | 0=Inactivo, 1=Activo               |

**Datos seed:** 10 medicamentos comunes (Acetaminofén, Ibuprofeno, Amoxicilina, Omeprazol, Metformina, Losartán, Atorvastatina, Diclofenaco, Ranitidina, Tramadol).

**Nota:** Tramadol tiene `isControlled=true` — el frontend debe mostrar indicador visual de medicamento controlado y aplicar auditoría especial (RNF-017).

---

## 4. Gestión de Usuarios (CU-01)

**Ruta:** `/api/v1/User`

### 4.1 Request DTO — `UserRequest`

| Campo                  | Tipo   | Requerido     | Descripción                     |
|------------------------|--------|---------------|---------------------------------|
| id                     | long?  | PUT/PATCH     | Identificador                   |
| rolId                  | long?  | Sí (crear)    | FK al rol                       |
| password               | string | Sí (crear)    | Contraseña (min 12 chars)       |
| email                  | string | Sí            | Email único                     |
| name                   | string | Sí            | Nombre completo (10–100 chars)  |
| identificationDocument | string | Sí            | DPI (13 dígitos)                |
| userName               | string | Sí            | Usuario (8–9 chars)             |
| number                 | string | No            | Teléfono (8 dígitos)            |
| nit                    | string | No            | NIT (8–9 chars alfanuméricos)   |
| branchId               | long?  | No            | FK a sucursal asignada          |
| insuranceNumber        | string | No            | Número de seguro (5–50 chars)   |
| state                  | int?   | Sí            | 0=Inactivo, 1=Activo            |

### 4.2 Response DTO — `UserResponse`

Incluye todos los campos del request (excepto `password`) más `createdAt`, `updatedAt`, `createdBy`, `updatedBy` y navegación `rol` (objeto Rol).

**Include:** `?Include=Rol`

### 4.3 Roles del Sistema (CU-01)

**Ruta:** `/api/v1/Rol`

| Campo       | Tipo   | Descripción                |
|-------------|--------|----------------------------|
| id          | long?  | Identificador              |
| name        | string | Nombre del rol (max 100)   |
| description | string | Descripción (max 250)      |
| state       | int?   | 0=Inactivo, 1=Activo       |

**Roles predefinidos (RN-CU01-04):** Administrador, Médico, Enfermería, Laboratorio, Farmacia, Caja/Recepción, Paciente.

### 4.4 Permisos Rol-Operación

**Ruta:** `/api/v1/RolOperation`

| Campo       | Tipo  | Descripción           |
|-------------|-------|-----------------------|
| id          | long? | Identificador         |
| rolId       | long  | FK al rol             |
| operationId | long  | FK a la operación     |
| state       | int?  | 0=Inactivo, 1=Activo  |

**Include:** `?Include=Rol,Operation`

### 4.5 Operaciones del Sistema

**Ruta:** `/api/v1/Operation`

Contiene todas las operaciones sincronizadas automáticamente desde los controllers (vía `OperationSyncHostedService`). El frontend usa la respuesta del login para construir menús; este endpoint es para administración avanzada.

---

## 5. Agendamiento de Citas (CU-03)

**Ruta:** `/api/v1/Appointment`

### 5.1 Request DTO — `AppointmentRequest`

| Campo                | Tipo      | Requerido | Descripción                                               |
|----------------------|-----------|-----------|------------------------------------------------------------|
| id                   | long?     | PUT/PATCH | Identificador                                              |
| patientId            | long?     | Sí        | FK al usuario paciente                                     |
| doctorId             | long?     | Sí        | FK al usuario doctor                                       |
| specialtyId          | long?     | Sí        | FK a especialidad                                          |
| branchId             | long?     | Sí        | FK a sucursal                                              |
| appointmentStatusId  | long?     | Sí        | FK a estado de cita                                        |
| appointmentDate      | DateTime? | Sí        | Fecha y hora (solo futuras, RN-CU03-03)                   |
| reason               | string    | Sí        | Motivo de consulta (10–2000 chars, RN-CU03-01)            |
| amount               | decimal?  | No        | Monto de la cita                                           |
| priority             | int?      | No        | Prioridad (null=normal, valores para urgencia)             |
| arrivalTime          | DateTime? | No        | Hora de llegada del paciente                               |
| notes                | string    | No        | Notas adicionales                                          |
| followUpType         | int?      | No        | Tipo de seguimiento: null=normal, 0=Monitoreo, 1=Revisión de resultados (CU-11) |
| parentConsultationId | long?     | No        | FK a consulta médica padre (CU-11)                         |
| state                | int?      | Sí        | 0=Inactivo, 1=Activo                                      |

### 5.2 Response DTO — `AppointmentResponse`

Todos los campos del request + `createdAt`, `updatedAt` (formato `dd/MM/yyyy HH:mm:ss`) + navegaciones opcionales.

**Include:** `?Include=Specialty,Branch,AppointmentStatus,Patient,Doctor,ParentConsultation`

### 5.3 Flujo Frontend — Agendar Cita (CU-03)

1. Paciente selecciona **Especialidad** (dropdown desde `/api/v1/Specialty`).
2. Paciente selecciona **Sucursal** (dropdown desde `/api/v1/Branch`).
3. Frontend muestra calendario con horarios disponibles (filtrar citas existentes).
4. Paciente escribe **motivo de consulta** (10–2000 caracteres).
5. Opcionalmente sube documentos de referencia (PDF, max 2MB, sin encriptar — RN-CU03-02).
6. Al confirmar, se activa **temporizador de 5 minutos** para reserva temporal (RNF-024).
7. Se redirige al flujo de **pago**.

### 5.4 Documentos de Cita

**Ruta:** `/api/v1/AppointmentDocument`

| Campo       | Tipo   | Requerido | Descripción                         |
|-------------|--------|-----------|--------------------------------------|
| id          | long?  | PUT/PATCH | Identificador                        |
| appointmentId| long  | Sí        | FK a la cita                         |
| fileName    | string | Sí        | Nombre del archivo                   |
| filePath    | string | Sí        | Ruta de almacenamiento               |
| contentType | string | No        | Tipo MIME (application/pdf)          |
| fileSize    | long?  | No        | Tamaño en bytes                      |
| state       | int?   | Sí        | 0=Inactivo, 1=Activo                |

**Validaciones frontend (RN-CU03-02):** Solo archivos PDF, máximo 2MB, sin encriptación.

---

## 6. Pagos (CU-04, CU-06)

**Ruta:** `/api/v1/Payment`

### 6.1 Request DTO — `PaymentRequest`

| Campo               | Tipo      | Requerido | Descripción                                          |
|----------------------|-----------|-----------|------------------------------------------------------|
| id                   | long?     | PUT/PATCH | Identificador                                        |
| appointmentId        | long?     | Condicional| FK a cita (pago de consulta)                        |
| labOrderId           | long?     | Condicional| FK a orden de laboratorio (pago de exámenes)        |
| dispenseId           | long?     | Condicional| FK a despacho (pago de farmacia, CU-10)             |
| transactionNumber    | string    | No        | Número de transacción (generado por backend)         |
| amount               | decimal?  | Sí        | Monto a pagar (precision 10,2)                       |
| paymentMethod        | int?      | Sí        | 0=Efectivo, 1=Visa, 2=Mastercard, 3=Débito          |
| paymentType          | int?      | Sí        | 0=Consulta, 1=Laboratorio, 2=Farmacia               |
| paymentStatus        | int?      | Sí        | 0=Pendiente, 1=Completado, 2=Fallido, 3=Reembolsado|
| paymentDate          | DateTime? | Sí        | Fecha del pago                                       |
| cardLastFourDigits   | string    | Condicional| Últimos 4 dígitos (solo tarjeta, RNF-013)           |
| idempotencyKey       | string    | Sí        | Clave de idempotencia (RNF-016) — UUID generado por frontend |
| amountReceived       | decimal?  | Condicional| Monto recibido (solo efectivo, CU-06)               |
| changeAmount         | decimal?  | Condicional| Cambio a devolver (solo efectivo, CU-06)            |
| gatewayResponseCode  | string    | No        | Código de respuesta del gateway                      |
| gatewayMessage       | string    | No        | Mensaje del gateway                                  |
| state                | int?      | Sí        | 0=Inactivo, 1=Activo                                |

### 6.2 Flujo Frontend — Pago en Línea con Tarjeta (CU-04)

1. Mostrar resumen de la cita con monto.
2. Formulario de tarjeta con validaciones:
   - Número: 13–19 dígitos, validación Luhn (RN-CU04-01).
   - Titular: 5–100 caracteres (RN-CU04-02).
   - Expiración: formato MM/AA, no puede ser pasada (RN-CU04-03).
   - CVV: 3–4 dígitos, **nunca almacenar ni mostrar** (RNF-014).
3. Generar `idempotencyKey` (UUID v4) antes de enviar — previene cobros duplicados (RNF-016).
4. Enmascarar número de tarjeta mostrando solo últimos 4 dígitos (RNF-013).
5. Timeout de sesión de pago: **10 minutos** (RNF-009).
6. Enviar al gateway mock del backend. Manejar respuestas: fondos insuficientes, tarjeta inválida, expirada, error de comunicación.
7. Si exitoso, actualizar estado de cita a "Pagada" y mostrar recibo.

### 6.3 Flujo Frontend — Cobro en Caja / Efectivo (CU-06)

1. Buscar cita por número de cita o DPI del paciente.
2. Seleccionar método de pago (Efectivo / Tarjeta POS).
3. Si efectivo en quetzales:
   - Ingresar `amountReceived`.
   - Calcular `changeAmount = amountReceived - amount`.
   - Validar que `amountReceived >= amount`.
4. Si tarjeta POS: capturar últimos 4 dígitos.
5. Generar recibo con: número de transacción, nombre del paciente, monto, fecha/hora, detalle del servicio, sucursal (RN-GLOBAL-005).

---

## 7. Recepción y Verificación de Cita (CU-05)

**No requiere endpoints adicionales.** Utiliza los endpoints existentes:

1. **Buscar cita:** `GET /api/v1/Appointment?Filters=...&Include=Patient,AppointmentStatus,Branch`
2. **Verificar pago:** Revisar `appointmentStatusId` y pagos asociados en `/api/v1/Payment?Filters=AppointmentId:X`.
3. **Registrar llegada:** `PATCH /api/v1/Appointment` con `arrivalTime` y cambiar `appointmentStatusId` a "Paciente presente".
4. **Manejo de casos:**
   - Walk-in sin cita → crear nueva cita + redirigir a pago.
   - Emergencia → asignar prioridad alta, saltar al flujo de signos vitales.
   - Cita no pagada → redirigir a caja (CU-06).

**Visualización de estados (RN-CU05):**

| Estado          | Color Badge |
|-----------------|-------------|
| Pagada          | Verde       |
| Pendiente       | Amarillo    |
| Cancelada       | Rojo        |
| En curso        | Azul        |
| Completada      | Gris        |
| No asistió      | Naranja     |

---

## 8. Toma de Signos Vitales (CU-07)

**Ruta:** `/api/v1/VitalSign`

### 8.1 Request DTO — `VitalSignRequest`

| Campo                   | Tipo     | Requerido | Descripción                              |
|--------------------------|----------|-----------|------------------------------------------|
| id                       | long?    | PUT/PATCH | Identificador                            |
| appointmentId            | long?    | Sí        | FK a la cita                             |
| nurseId                  | long?    | Sí        | FK al usuario enfermero/a                |
| bloodPressureSystolic    | int?     | Sí        | Presión sistólica (60–250 mmHg)          |
| bloodPressureDiastolic   | int?     | Sí        | Presión diastólica (40–150 mmHg)         |
| temperature              | decimal? | Sí        | Temperatura (34.0–42.0 °C, 1 decimal)   |
| weight                   | decimal? | Sí        | Peso (0.5–300.0 kg, 2 decimales)         |
| height                   | decimal? | Sí        | Altura (30–250 cm, 2 decimales)          |
| heartRate                | int?     | Sí        | Frecuencia cardíaca (30–220 bpm)         |
| isEmergency              | bool?    | No        | Marca de emergencia                      |
| clinicalAlerts           | string   | No        | Alertas clínicas generadas               |
| state                    | int?     | Sí        | 0=Inactivo, 1=Activo                     |

### 8.2 Rangos Normales y Alertas (RN-CU07)

El frontend debe mostrar alertas visuales (sin bloquear) cuando los valores estén fuera de rango:

| Signo              | Rango Normal          | Alerta                              |
|---------------------|-----------------------|--------------------------------------|
| PA Sistólica        | 90–140 mmHg          | < 90 = Hipotensión, > 140 = Hipertensión |
| PA Diastólica       | 60–90 mmHg           | < 60 = Baja, > 90 = Alta             |
| Temperatura         | 36.0–37.5 °C         | < 36 = Hipotermia, > 37.5 = Fiebre   |
| Peso                | Varía por paciente    | Valores extremos                      |
| Frecuencia Cardíaca | 60–100 bpm           | < 60 = Bradicardia, > 100 = Taquicardia |

**Comportamiento:** Las alertas se registran en `clinicalAlerts` pero NO impiden guardar. Sincronización inmediata (<2 segundos — RNF-029).

---

## 9. Consulta Médica (CU-08)

**Ruta:** `/api/v1/MedicalConsultation`

### 9.1 Request DTO — `MedicalConsultationRequest`

| Campo               | Tipo   | Requerido | Descripción                                      |
|----------------------|--------|-----------|--------------------------------------------------|
| id                   | long?  | PUT/PATCH | Identificador                                    |
| appointmentId        | long?  | Sí        | FK a la cita                                     |
| doctorId             | long?  | Sí        | FK al usuario doctor                             |
| reasonForVisit       | string | Sí        | Motivo de consulta                               |
| clinicalFindings     | string | No        | Hallazgos clínicos del examen físico             |
| diagnosis            | string | Sí (cierre)| Diagnóstico (10–5000 chars, RN-CU08-01)         |
| diagnosisCie10Code   | string | No        | Código CIE-10 (autocompletado <500ms, RNF-027)  |
| treatmentPlan        | string | No        | Plan de tratamiento                              |
| consultationStatus   | int?   | Sí        | 0=En curso, 1=Finalizada                         |
| notes                | string | No        | Notas adicionales                                |
| state                | int?   | Sí        | 0=Inactivo, 1=Activo                             |

### 9.2 Flujo Frontend — Consulta Médica

1. El doctor selecciona una cita con estado "Paciente presente" de su lista.
2. Se muestra automáticamente: signos vitales (`GET /api/v1/VitalSign?Filters=AppointmentId:X`) e historial del paciente.
3. El doctor completa: motivo de visita, hallazgos clínicos, diagnóstico, plan de tratamiento.
4. El diagnóstico es **obligatorio** para finalizar la consulta (RN-CU08-01).
5. Campo de autocompletado CIE-10 con búsqueda local o API (<500ms).
6. Desde la consulta, el doctor puede acceder a:
   - **Recetas** (CU-10) → `/api/v1/Prescription`
   - **Órdenes de laboratorio** (CU-09) → `/api/v1/LabOrder`
   - **Agendar cita de seguimiento** (CU-11) → `/api/v1/Appointment` con `followUpType` y `parentConsultationId`

---

## 10. Gestión de Laboratorio (CU-09)

### 10.1 Órdenes de Laboratorio

**Ruta:** `/api/v1/LabOrder`

| Campo           | Tipo    | Requerido | Descripción                                    |
|------------------|---------|-----------|-------------------------------------------------|
| id               | long?   | PUT/PATCH | Identificador                                  |
| consultationId   | long?   | Sí        | FK a consulta médica                           |
| doctorId         | long?   | Sí        | FK al doctor que ordena                        |
| patientId        | long?   | Sí        | FK al paciente                                 |
| orderNumber      | string  | No        | Número de orden (generado)                     |
| orderStatus      | int?    | Sí        | 0=Pendiente, 1=EnProceso, 2=Completada, 3=Cancelada |
| totalAmount      | decimal?| No        | Monto total de los exámenes                    |
| isExternal       | bool?   | No        | Si se envía a laboratorio externo              |
| notes            | string  | No        | Notas adicionales                              |
| state            | int?    | Sí        | 0=Inactivo, 1=Activo                           |

**Include:** `?Include=Consultation,Doctor,Patient,Items`

### 10.2 Ítems de Orden de Laboratorio

**Ruta:** `/api/v1/LabOrderItem`

| Campo          | Tipo      | Requerido | Descripción                               |
|----------------|-----------|-----------|-------------------------------------------|
| id             | long?     | PUT/PATCH | Identificador                             |
| labOrderId     | long?     | Sí        | FK a la orden                             |
| labExamId      | long?     | Sí        | FK al examen                              |
| examName       | string    | No        | Nombre del examen (snapshot)              |
| amount         | decimal?  | No        | Precio del examen                         |
| resultValue    | string    | No        | Valor del resultado                       |
| resultUnit     | string    | No        | Unidad del resultado                      |
| referenceRange | string    | No        | Rango de referencia                       |
| isOutOfRange   | bool?     | No        | Resultado fuera de rango (alerta visual)  |
| resultNotes    | string    | No        | Notas del resultado                       |
| resultDate     | DateTime? | No        | Fecha del resultado                       |
| isPublished    | bool?     | No        | Si el resultado ya fue publicado          |
| state          | int?      | Sí        | 0=Inactivo, 1=Activo                      |

### 10.3 Flujo Frontend — Laboratorio

1. Laboratorista ve órdenes pendientes: `GET /api/v1/LabOrder?Filters=OrderStatus:0&Include=Patient,Items`.
2. Valida pago de la orden.
3. Registra resultados por cada ítem: `PATCH /api/v1/LabOrderItem` con `resultValue`, `resultUnit`, `isOutOfRange`, `resultDate`.
4. Si `isOutOfRange=true`, mostrar **alerta visual** automática.
5. Requiere revisión de supervisor antes de publicar (`isPublished=true`).
6. Al publicar, se notifica al doctor y queda disponible en historial del paciente (<2 min — RNF-028).

---

## 11. Recetas Médicas (CU-08, CU-10)

### 11.1 Prescripciones

**Ruta:** `/api/v1/Prescription`

| Campo            | Tipo      | Requerido | Descripción                          |
|-------------------|-----------|-----------|--------------------------------------|
| id                | long?     | PUT/PATCH | Identificador                        |
| consultationId    | long?     | Sí        | FK a consulta médica                 |
| doctorId          | long?     | Sí        | FK al doctor prescriptor             |
| prescriptionDate  | DateTime? | Sí        | Fecha de emisión                     |
| notes             | string    | No        | Indicaciones generales               |
| state             | int?      | Sí        | 0=Inactivo, 1=Activo                |

**Include:** `?Include=Consultation,Doctor,Items`

### 11.2 Ítems de Receta

**Ruta:** `/api/v1/PrescriptionItem`

| Campo               | Tipo   | Requerido | Descripción                       |
|----------------------|--------|-----------|-----------------------------------|
| id                   | long?  | PUT/PATCH | Identificador                     |
| prescriptionId       | long?  | Sí        | FK a la receta                    |
| medicineName         | string | Sí        | Nombre del medicamento recetado   |
| dosage               | string | No        | Dosis (ej. "500mg")              |
| frequency            | string | No        | Frecuencia (ej. "cada 8 horas")  |
| duration             | string | No        | Duración (ej. "7 días")          |
| specialInstructions  | string | No        | Instrucciones especiales          |
| state                | int?   | Sí        | 0=Inactivo, 1=Activo             |

---

## 12. Despacho de Medicamentos — Farmacia (CU-10)

### 12.1 Despacho

**Ruta:** `/api/v1/Dispense`

| Campo          | Tipo    | Requerido | Descripción                                            |
|----------------|---------|-----------|--------------------------------------------------------|
| id             | long?   | PUT/PATCH | Identificador                                          |
| prescriptionId | long?   | Sí        | FK a la receta                                         |
| patientId      | long?   | Sí        | FK al paciente                                         |
| pharmacistId   | long?   | Sí        | FK al usuario farmacéutico                             |
| dispenseStatus | int?    | Sí        | 0=Pendiente, 1=Pagado, 2=Despachado, 3=Parcial, 4=Rechazado |
| totalAmount    | decimal?| No        | Monto total (precision 10,2)                           |
| notes          | string  | No        | Notas (max 2000)                                       |
| state          | int?    | Sí        | 0=Inactivo, 1=Activo                                   |

**Include:** `?Include=Prescription,Patient,Pharmacist,Items,Payments`

### 12.2 Ítems de Despacho

**Ruta:** `/api/v1/DispenseItem`

| Campo                | Tipo    | Requerido | Descripción                                |
|-----------------------|---------|-----------|--------------------------------------------|
| id                    | long?   | PUT/PATCH | Identificador                              |
| dispenseId            | long?   | Sí        | FK al despacho                             |
| medicineId            | long?   | Sí        | FK al medicamento del catálogo             |
| prescriptionItemId    | long?   | No        | FK al ítem de receta (si aplica)           |
| originalMedicineName  | string  | Sí        | Nombre original recetado (max 200)         |
| dispensedMedicineName | string  | Sí        | Nombre del medicamento despachado (max 200)|
| quantity              | int?    | Sí        | Cantidad despachada                        |
| unitPrice             | decimal?| No        | Precio unitario (precision 10,2)           |
| wasSubstituted        | bool?   | No        | Si hubo sustitución de medicamento         |
| substitutionReason    | string  | No        | Razón de sustitución (max 500)             |
| state                 | int?    | Sí        | 0=Inactivo, 1=Activo                       |

### 12.3 Inventario de Medicamentos

**Ruta:** `/api/v1/MedicineInventory`

| Campo        | Tipo  | Requerido | Descripción                                                |
|--------------|-------|-----------|------------------------------------------------------------|
| id           | long? | PUT/PATCH | Identificador                                              |
| medicineId   | long? | Sí        | FK al medicamento                                          |
| branchId     | long? | Sí        | FK a la sucursal                                           |
| currentStock | int?  | Sí        | Stock actual                                               |
| rowVersion   | uint  | Solo lectura| Control de concurrencia optimista (RNF-025)               |
| state        | int?  | Sí        | 0=Inactivo, 1=Activo                                      |

**Include:** `?Include=Medicine,Branch`

**Índice único:** (MedicineId, BranchId) — no puede haber duplicados por sucursal.

### 12.4 Flujo Frontend — Despacho de Medicamentos

1. Farmacéutico busca paciente por DPI o número de cita.
2. Se muestran las recetas pendientes de despacho: `GET /api/v1/Prescription?Filters=...&Include=Items`.
3. Validar vigencia: la receta no puede tener más de **7 días** (RN-CU10-01).
4. Por cada ítem de la receta:
   - Verificar disponibilidad en inventario: `GET /api/v1/MedicineInventory?Filters=MedicineId:X,BranchId:Y`.
   - Si no hay stock, ofrecer **sustitución** → marcar `wasSubstituted=true` y registrar `substitutionReason`.
5. Calcular total y cobrar (efectivo/tarjeta → crear `Payment` con `dispenseId`).
6. Al despachar, actualizar inventario (`PATCH /api/v1/MedicineInventory` con nuevo `currentStock`).
7. Si `currentStock <= minimumStock` del medicamento → mostrar **alerta de stock bajo** (RN-CU10-03).
8. Entregar instrucciones impresas al paciente.

---

## 13. Cita de Seguimiento (CU-11)

### 13.1 Creación desde Consulta Médica

Se utiliza el endpoint estándar de `Appointment` con campos adicionales:

```json
{
  "patientId": 15,
  "doctorId": 3,
  "specialtyId": 2,
  "branchId": 1,
  "appointmentStatusId": 2,
  "appointmentDate": "2026-04-30T10:00:00",
  "reason": "Seguimiento de tratamiento de hipertensión",
  "followUpType": 0,
  "parentConsultationId": 42,
  "state": 1
}
```

| followUpType | Significado                  |
|--------------|------------------------------|
| null         | Cita normal (no seguimiento) |
| 0            | Monitoreo de condición       |
| 1            | Revisión de resultados       |

### 13.2 Flujo Frontend — Agendar Seguimiento

1. Desde la pantalla de consulta médica, botón "Agendar Seguimiento".
2. Selección obligatoria de `followUpType` (RN-CU11-01).
3. Selector de fecha futura con verificación de disponibilidad del doctor.
4. Campo de observaciones (10–2000 caracteres, RN-CU11-03).
5. Al guardar:
   - Se crea la cita con `parentConsultationId` apuntando a la consulta actual.
   - Se envía notificación por correo al paciente.
   - Se programa recordatorio automático 1–2 días antes de la cita.

---

## 14. Registro de Notificaciones (CU-04, CU-09, CU-11)

**Ruta:** `/api/v1/NotificationLog`

| Campo             | Tipo      | Requerido | Descripción                                   |
|--------------------|-----------|-----------|------------------------------------------------|
| id                 | long?     | PUT/PATCH | Identificador                                 |
| recipientEmail     | string    | Sí        | Email destino (max 255)                       |
| subject            | string    | Sí        | Asunto (max 500)                              |
| notificationType   | int?      | Sí        | 0=Confirmación Cita, 1=Recibo Pago, 2=Resultado Lab, 3=Recordatorio, 4=Recuperación Contraseña |
| relatedEntityType  | string    | Sí        | Tipo de entidad (ej. "Appointment", "LabOrder")|
| relatedEntityId    | long?     | Sí        | ID de la entidad relacionada                  |
| sentAt             | DateTime? | No        | Fecha de envío                                |
| status             | int?      | Sí        | 0=Pendiente, 1=Enviado, 2=Fallido, 3=Reintentando |
| retryCount         | int?      | No        | Intentos de reenvío                           |
| errorMessage       | string    | No        | Mensaje de error si falló (max 2000)          |
| state              | int?      | Sí        | 0=Inactivo, 1=Activo                          |

**Uso frontend:** Panel de administración para monitorear el estado de las notificaciones. Filtrar por `status`, `recipientEmail`, o entidad relacionada.

**Requisito de rendimiento:** Email debe enviarse en menos de 5 minutos (RNF-001).

Todas las notificaciones deben incluir en el pie: identificador del sistema y teléfono de contacto (RN-GLOBAL-006).

---

## 15. Requisitos No Funcionales para Frontend

### 15.1 Rendimiento

| Requisito  | Métrica                                         |
|------------|--------------------------------------------------|
| RNF-002    | Búsquedas < 3 segundos                          |
| RNF-003    | Carga de expediente < 2 segundos                |
| RNF-004    | Portal soporta 100 usuarios concurrentes        |
| RNF-005    | Carga de página < 3 segundos                    |
| RNF-027    | Autocompletado CIE-10 < 500ms                   |
| RNF-029    | Sincronización signos vitales < 2 segundos       |
| RNF-030    | Respuesta POS terminal < 15 segundos             |

### 15.2 Seguridad

| Requisito  | Implementación Frontend                          |
|------------|--------------------------------------------------|
| RNF-010    | Toda la comunicación via HTTPS TLS 1.2+          |
| RNF-011    | Cumplimiento PCI DSS para formularios de pago    |
| RNF-013    | Enmascarar tarjeta — solo mostrar últimos 4 dígitos |
| RNF-014    | CVV enmascarado, nunca almacenado en frontend     |
| RNF-015    | DPI y NIT cifrados (backend), mostrar enmascarados|
| RNF-016    | Idempotency key (UUID v4) generado por frontend   |
| RNF-018    | Contraseñas mínimo 12 caracteres                 |

### 15.3 Sesión y Timeouts

| Requisito  | Comportamiento                                   |
|------------|--------------------------------------------------|
| RNF-009    | Sesión de pago expira en 10 minutos              |
| RNF-024    | Reserva temporal de horario: 5 minutos           |
| GLOBAL-007 | Bloqueo de cuenta después de 5 intentos fallidos |
| GLOBAL-007 | Expiración de sesión configurable por inactividad|

### 15.4 Accesibilidad y UX

| Requisito  | Implementación                                   |
|------------|--------------------------------------------------|
| RNF-022    | Calendario con disponibilidad en tiempo real     |
| RNF-023    | Actualización de estado en tiempo real           |
| RNF-031    | Reimpresión ilimitada de recibos                 |

---

## 16. Resumen de Endpoints por Módulo

| #  | Controller          | Ruta Base                        | Auth | Módulo CU        |
|----|---------------------|----------------------------------|------|-------------------|
| 1  | Auth                | `/api/v1/Auth`                   | No*  | CU-01, CU-02     |
| 2  | User                | `/api/v1/User`                   | Sí   | CU-01             |
| 3  | Rol                 | `/api/v1/Rol`                    | Sí   | CU-01             |
| 4  | RolOperation        | `/api/v1/RolOperation`           | Sí   | CU-01             |
| 5  | Operation           | `/api/v1/Operation`              | Sí   | CU-01             |
| 6  | Specialty           | `/api/v1/Specialty`              | Sí   | CU-00, CU-03     |
| 7  | Branch              | `/api/v1/Branch`                 | Sí   | CU-00, CU-03     |
| 8  | AppointmentStatus   | `/api/v1/AppointmentStatus`      | Sí   | CU-03, CU-05     |
| 9  | Appointment         | `/api/v1/Appointment`            | Sí   | CU-03, CU-05, CU-11 |
| 10 | AppointmentDocument | `/api/v1/AppointmentDocument`    | Sí   | CU-03             |
| 11 | Payment             | `/api/v1/Payment`                | Sí   | CU-04, CU-06     |
| 12 | VitalSign           | `/api/v1/VitalSign`              | Sí   | CU-07             |
| 13 | MedicalConsultation | `/api/v1/MedicalConsultation`    | Sí   | CU-08             |
| 14 | Prescription        | `/api/v1/Prescription`           | Sí   | CU-08, CU-10     |
| 15 | PrescriptionItem    | `/api/v1/PrescriptionItem`       | Sí   | CU-08, CU-10     |
| 16 | Laboratory          | `/api/v1/Laboratory`             | Sí   | CU-09             |
| 17 | LabExam             | `/api/v1/LabExam`                | Sí   | CU-09             |
| 18 | LabOrder            | `/api/v1/LabOrder`               | Sí   | CU-09             |
| 19 | LabOrderItem        | `/api/v1/LabOrderItem`           | Sí   | CU-09             |
| 20 | Medicine            | `/api/v1/Medicine`               | Sí   | CU-10             |
| 21 | MedicineInventory   | `/api/v1/MedicineInventory`      | Sí   | CU-10             |
| 22 | Dispense            | `/api/v1/Dispense`               | Sí   | CU-10             |
| 23 | DispenseItem        | `/api/v1/DispenseItem`           | Sí   | CU-10             |
| 24 | NotificationLog     | `/api/v1/NotificationLog`        | Sí   | CU-04, CU-09, CU-11 |

*Auth: Login, Register, RecoveryPassword y ChangePassword son `[AllowAnonymous]`. ResetPassword requiere `[Authorize]`.

---

## 17. Formato de Fechas

Todas las fechas en las respuestas del backend vienen formateadas como `dd/MM/yyyy HH:mm:ss` (strings). Para enviar al backend en requests, usar formato ISO 8601: `yyyy-MM-ddTHH:mm:ss`.
