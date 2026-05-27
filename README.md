# 🏥 Sistema de Información Hospitalaria (HIS)

Sistema integral de gestión hospitalaria construido con **ASP.NET Core 8.0** (backend) y **React 19 + TypeScript** (frontend). Incluye gestión de citas, consultas médicas, laboratorio, farmacia, facturación y portal de pacientes.

---

## 🚀 Características

### Backend (ASP.NET Core 8.0)

- 🔐 Autenticación JWT con sistema de permisos basado en roles y operaciones
- 🔄 Sincronización automática de módulos/operaciones vía reflexión (`[ModuleInfo]`, `[OperationInfo]`)
- 🔁 Mapeo de entidades con [Mapster](https://github.com/MapsterMapper/Mapster)
- 🗃️ Entity Framework Core con soporte multi-base de datos (PostgreSQL, SQL Server, MySQL)
- 🧪 Validaciones con [FluentValidation](https://docs.fluentvalidation.net/)
- 📡 Comunicación en tiempo real con SignalR (notificaciones de citas)
- 🔥 Logging estructurado con Serilog
- 📖 Documentación de API con Swagger
- 🏗️ Arquitectura genérica CRUD (`EntityService<T>`, `CrudController<T>`)

### Frontend (React 19 + TypeScript)

- ⚡ SPA con **Vite** y code-splitting por vendors
- 🎨 UI con **HeroUI** (componentes) + **Tailwind CSS v4**
- ✅ Validaciones con **Zod v4**
- 🗄️ Estado global con **Zustand**
- 🔄 Caché de datos con **React Query v5**
- 📡 Conexión en tiempo real con **SignalR**
- 📅 Calendario de citas con **FullCalendar**
- 🧪 Testing con **Vitest** + **Testing Library** + **MSW** (cobertura > 90%)
- 🔍 ESLint + Prettier configurados con reglas estrictas de React

---

## 📁 Estructura del proyecto

### Backend — `Hospital.Server/`

```
Hospital.Server/
├── Attributes/        # Atributos personalizados (ModuleInfo, OperationInfo, ExcludeFromSync)
├── Configs/           # Configuración de servicios, JWT, CORS, Mapster, validaciones
├── Context/           # DbContext de EF Core + configuraciones de entidades
├── Controllers/       # Endpoints HTTP (CrudController genérico + controladores específicos)
├── Database/          # Seeds y migraciones de datos
├── Entities/          # Entidades del dominio
├── Hubs/              # SignalR Hubs (notificaciones en tiempo real)
├── Infrastructure/    # Infraestructura (base de datos, servicios externos)
├── Interceptors/      # Middleware personalizado
├── Mappers/           # Configuración de Mapster (Request → Entity → Response)
├── Migrations/        # Migraciones de EF Core
├── Security/          # Autorización y políticas de seguridad
├── Services/          # Lógica de negocio (EntityService genérico + servicios específicos)
├── Utils/             # Utilidades generales
├── Validations/       # Validadores FluentValidation (Create, Update, Partial)
├── Program.cs         # Punto de entrada
└── appsettings.json   # Configuración de entorno
```

### Frontend — `hospital.client/`

```
hospital.client/
├── src/
│   ├── assets/        # Imágenes y recursos estáticos
│   ├── components/    # Componentes reutilizables (forms, tables, buttons, layout)
│   ├── configs/       # Constantes, configuración de axios, dashboard config
│   ├── containers/    # Layouts (Root, PortalLayout)
│   ├── data/          # Datos estáticos (CIE-10)
│   ├── hooks/         # Custom hooks (useForm, useAuth, usePermissions, timers)
│   ├── pages/         # Páginas por módulo (auth, appointment, dashboard, etc.)
│   ├── routes/        # Definición de rutas y middlewares de protección
│   ├── services/      # Servicios HTTP (llamadas a la API)
│   ├── stores/        # Stores de Zustand (auth, filtros, errores)
│   ├── styles/        # Estilos globales
│   ├── test-utils/    # Utilidades de testing (render, factories, MSW server)
│   ├── theme/         # Configuración de tema
│   ├── types/         # Interfaces y tipos TypeScript
│   ├── utils/         # Funciones utilitarias puras
│   └── validations/   # Esquemas de validación Zod
├── vite.config.ts     # Configuración de Vite (build, test, proxy)
├── eslint.config.js   # Configuración de ESLint
├── tsconfig.json      # Configuración de TypeScript
└── package.json       # Dependencias y scripts
```

---

## 🛠️ Requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org) y npm
- PostgreSQL (o SQL Server / MySQL según configuración)

---

## 📦 Instalación

### Backend

```bash
cd Hospital.Server
dotnet restore
```

### Frontend

```bash
cd hospital.client
npm install
```

---

## ▶️ Ejecución en desarrollo

### Backend

```bash
cd Hospital.Server
dotnet run
```

El servidor se levanta en `https://localhost:7266`.

### Frontend

```bash
cd hospital.client
npm run dev
```

El frontend se levanta en `https://localhost:60263` con proxy configurado hacia el backend.

---

## 🧪 Testing

```bash
cd hospital.client

# Ejecutar tests
npm run test

# Ejecutar tests con cobertura (threshold: 90% líneas)
npm run test:coverage
```

El proyecto usa **Vitest** con **jsdom**, **Testing Library** para renderizado de componentes, y **MSW** para mock de APIs.

---

## 🏗️ Build de producción

```bash
cd hospital.client
npm run build
```

El build incluye:
- TypeScript compilation (`tsc -b`)
- Vite build con code-splitting por vendors (React, HeroUI, SignalR, FullCalendar)
- Compresión gzip automática
- CSS minificado con LightningCSS

---

## 📋 Scripts disponibles (Frontend)

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (tsc + vite) |
| `npm run lint` | Ejecutar ESLint |
| `npm run test` | Ejecutar tests una vez |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run preview` | Preview del build de producción |

---

## 🔐 Sistema de permisos

El sistema usa sincronización automática de permisos basada en reflexión:

1. Los controladores se decoran con `[ModuleInfo]` para definir metadata del módulo
2. Las acciones se decoran con `[OperationInfo]` para metadata de operaciones
3. Al iniciar la app, `OperationSyncService` sincroniza módulos y operaciones con la BD
4. Las políticas de autorización se generan automáticamente como `{Controller}.{Action}`
5. El rol SA (Super Admin) recibe todos los permisos automáticamente

---

## 📌 Módulos del sistema

- **Autenticación** — Login, registro, cambio de contraseña, recuperación
- **Usuarios y Roles** — CRUD con asignación de permisos por operación
- **Citas** — Creación multi-paso, calendario, reasignación, estados
- **Consultas Médicas** — Registro de consultas con diagnóstico CIE-10
- **Signos Vitales** — Registro por enfermería con alertas automáticas
- **Recetas** — Prescripción con validez de 7 días
- **Farmacia** — Despacho de medicamentos, inventario, movimientos
- **Laboratorio** — Órdenes, exámenes, resultados
- **Pagos** — Efectivo y tarjeta con validación Luhn, idempotencia
- **Portal de Pacientes** — Reserva de citas, historial, pagos en línea
- **Dashboards** — Por rol (médico, enfermero, recepción, caja, admin)
- **Notificaciones** — En tiempo real vía SignalR
