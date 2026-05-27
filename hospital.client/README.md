# 🏥 HIS Frontend — React 19 + TypeScript + Vite

Frontend del Sistema de Información Hospitalaria (HIS). SPA construida con React 19, TypeScript, Vite y HeroUI.

---

## ⚡ Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| UI Components | HeroUI (Tailwind CSS v4) |
| Estado global | Zustand |
| Data fetching | React Query v5 |
| Validaciones | Zod v4 |
| HTTP Client | Axios |
| Tiempo real | SignalR |
| Calendario | FullCalendar |
| Testing | Vitest + Testing Library + MSW |
| Linting | ESLint 9 + Prettier |

---

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (https://localhost:60263)
npm run dev

# Build de producción
npm run build

# Ejecutar tests
npm run test

# Tests con cobertura
npm run test:coverage
```

---

## 📁 Estructura de `src/`

```
src/
├── assets/        # Imágenes y recursos estáticos
├── components/    # Componentes reutilizables
│   ├── appointment/    # Componentes de citas (steps, indicators)
│   ├── badge/          # Badges de estado
│   ├── button/         # Botones de acción por módulo
│   ├── column/         # Definiciones de columnas para tablas
│   ├── form/           # Formularios CRUD por entidad
│   ├── grid/           # Layout grid
│   ├── input/          # Inputs especializados
│   ├── layout/         # Header, Sidebar, Footer
│   ├── messages/       # Mensajes de respuesta
│   ├── modal/          # Modales
│   ├── payment/        # Componentes de pago
│   ├── prescription/   # Formularios de recetas
│   ├── select/         # Selects personalizados
│   └── table/          # Tabla con paginación servidor
├── configs/       # Constantes, axios interceptors, dashboard config
├── containers/    # Layouts principales (Root, PortalLayout)
├── data/          # Datos estáticos (catálogo CIE-10)
├── hooks/         # Custom hooks
│   ├── useForm.ts              # Hook genérico de formularios
│   ├── useAuth.ts              # Acceso al estado de autenticación
│   ├── usePermissions.ts       # Verificación de permisos (can, canAny, canAll)
│   ├── useAppointmentHub.ts    # Conexión SignalR para citas
│   ├── usePaymentTimer.ts      # Countdown para sesiones de pago
│   └── useVitalSignAlerts.ts   # Alertas de signos vitales fuera de rango
├── pages/         # Páginas organizadas por módulo
├── routes/        # Rutas y middlewares de protección
├── services/      # Servicios HTTP (un archivo por entidad)
├── stores/        # Stores de Zustand
│   ├── useAuthStore.ts         # Autenticación admin
│   ├── usePatientAuthStore.ts  # Autenticación portal pacientes
│   └── use*Store.ts            # Filtros por módulo
├── test-utils/    # Helpers de testing
│   ├── factories.ts   # Factories de datos mock
│   ├── render.ts      # Custom render con providers
│   └── server.ts      # MSW server instance
├── theme/         # Configuración de tema para tablas
├── types/         # Interfaces TypeScript (responses, requests)
├── utils/         # Funciones utilitarias puras
│   ├── cuiValidator.ts      # Validación de DPI/CUI guatemalteco
│   ├── dateFormatter.ts     # Formateo de fechas con timezone
│   ├── luhn.ts              # Algoritmo Luhn para tarjetas
│   ├── paymentUtils.ts      # Utilidades de pago
│   └── converted.ts         # Helpers de conversión y FormData
└── validations/   # Esquemas Zod + funciones validate*
```

---

## 🧪 Testing

- **Framework**: Vitest 4 con jsdom
- **Rendering**: @testing-library/react
- **Mocking HTTP**: MSW (Mock Service Worker)
- **Property-based**: fast-check
- **Cobertura mínima**: 90% líneas

```bash
# Tests una sola vez
npm run test

# Con cobertura
npm run test:coverage
```

La cobertura se mide sobre: `utils/`, `validations/`, `hooks/`, y stores clave.

---

## 🏗️ Build

```bash
npm run build
```

El build produce chunks optimizados:
- `vendor-react` — React, ReactDOM, React Router
- `vendor-heroui` — HeroUI + theme
- `vendor-query` — React Query
- `vendor-signalr` — SignalR client
- `vendor-calendar` — FullCalendar
- `vendor-utils` — Axios, Zustand, Zod, Framer Motion
- Chunks lazy-loaded por página (Login, Portal, etc.)

CSS minificado con LightningCSS. Compresión gzip automática.

---

## 🔧 Configuración

### Proxy de desarrollo

El frontend proxea `/api` y `/hubs` hacia el backend en `https://localhost:7266`:

```ts
// vite.config.ts
server: {
  proxy: {
    "/api": { target: "https://localhost:7266/api", rewrite: path => path.replace(/^\/api/, "") },
    "/hubs": { target: "https://localhost:7266", ws: true },
  }
}
```

### Variables de entorno

Archivos `.env` con prefijo `VITE_`:

```
VITE_API_URL=https://localhost:7266/api/v1
```

---

## 📋 Convenciones

- **Servicios**: Un archivo por entidad en `services/` con funciones `get*`, `create*`, `update*`, `delete*`
- **Validaciones**: Un schema Zod + función `validate*` por entidad
- **Stores**: Zustand con patrón `create<State>((set, get) => ({...}))`
- **Componentes**: Un componente por archivo, props con `readonly`
- **Hooks**: Prefijo `use`, lógica extraída de componentes
- **Tests**: Colocados en `__tests__/` junto al código que prueban
