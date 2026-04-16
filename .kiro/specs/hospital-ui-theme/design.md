# Documento de Diseño — hospital-ui-theme

## Visión General

Este documento describe el diseño técnico del rediseño visual del sistema HIS (Hospital Information System). El objetivo es reemplazar los valores de color hardcodeados dispersos en los componentes por un sistema de diseño centralizado basado en variables CSS, extender la configuración de Tailwind con la paleta médica y actualizar cada componente principal para consumir ese sistema de forma coherente en modo claro y oscuro.

El diseño sigue una arquitectura de tres capas:

1. **Capa de tokens** — Variables CSS en `styles.css` (`:root` y `.dark`)
2. **Capa de configuración** — `tailwind.config.js` y configuración de HeroUI
3. **Capa de componentes** — Sidebar, Header, Footer, SubMenu, LoginPage, Layout, TableTheme, `components.css`

---

## Arquitectura

### Diagrama del Theme_System

```mermaid
graph TD
    A[styles.css<br/>:root / .dark<br/>CSS Variables] --> B[tailwind.config.js<br/>Tailwind theme extension]
    A --> C[HeroUI config<br/>heroui() plugin]
    B --> D[Componentes React<br/>Tailwind classes]
    C --> D
    A --> E[components.css<br/>Utility classes]
    E --> D
    A --> F[tableTheme.ts<br/>customStyles object]
    D --> G[Sidebar]
    D --> H[Header]
    D --> I[Footer]
    D --> J[SubMenu]
    D --> K[LoginPage]
    D --> L[Layout]
```

### Principio de diseño central

Todos los valores de color en los componentes deben referenciar variables CSS o clases Tailwind que a su vez apunten a variables CSS. Ningún componente debe contener valores hexadecimales hardcodeados como `bg-[#18181b]` o `dark:bg-zinc-800`. Esto garantiza que un cambio en la paleta se propague automáticamente a toda la interfaz.

### Compatibilidad con Tailwind v4

El proyecto usa Tailwind CSS v4 (`@tailwindcss/vite` y `@tailwindcss/postcss`). En v4 la configuración se puede expresar directamente en CSS con `@theme` dentro de `styles.css`, pero el proyecto mantiene `tailwind.config.js` con `@config "../../tailwind.config.js"`. El diseño respeta esta estructura existente y extiende el archivo de configuración JS.

---

## Componentes e Interfaces

### 1. Theme_System — `styles.css`

El archivo `styles.css` es el punto central de todos los tokens de diseño. Se añaden dos bloques de variables:

**`:root` (Light_Mode):**
```css
:root {
  /* Paleta médica */
  --color-primary:     #0A4FA6;   /* Medical_Blue */
  --color-secondary:   #0891B2;   /* Clinical_Teal */
  --color-accent:      #0D9E6E;   /* Health_Green */

  /* Superficies */
  --color-surface-50:  #F8FAFC;
  --color-surface-100: #F1F5F9;
  --color-surface-200: #E2E8F0;

  /* Estados semánticos */
  --color-success:     #059669;
  --color-warning:     #D97706;
  --color-danger:      #DC2626;

  /* Texto */
  --color-text-primary:   #1E293B;
  --color-text-secondary: #64748B;

  /* Bordes */
  --color-border:      #E2E8F0;

  /* Tipografía */
  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;

  /* Transiciones */
  --transition-fast:   200ms ease;
  --transition-normal: 300ms ease;
}
```

**`.dark` (Dark_Mode):**
```css
.dark {
  --color-primary:     #3B82F6;   /* Medical_Blue aclarado para contraste */
  --color-secondary:   #22D3EE;
  --color-accent:      #34D399;

  --color-surface-50:  #18181B;
  --color-surface-100: #27272A;
  --color-surface-200: #3F3F46;

  --color-text-primary:   #E4E4E7;
  --color-text-secondary: #A1A1AA;

  --color-border:      #27272A;
}
```

La transición global se aplica con:
```css
*, *::before, *::after {
  transition-property: background-color, border-color, color;
  transition-duration: 300ms;
  transition-timing-function: ease;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
```

### 2. Theme_System — `tailwind.config.js`

Se extiende el tema de Tailwind para exponer los colores médicos como clases utilitarias (`text-primary`, `bg-primary`, etc.) y para registrar las fuentes:

```js
theme: {
  extend: {
    fontFamily: {
      montserrat: ["Montserrat", "sans-serif"],
    },
    colors: {
      primary:   "#0A4FA6",
      secondary: "#0891B2",
      accent:    "#0D9E6E",
      success:   "#059669",
      warning:   "#D97706",
      danger:    "#DC2626",
      surface: {
        50:  "#F8FAFC",
        100: "#F1F5F9",
        200: "#E2E8F0",
      },
    },
  },
},
```

> **Decisión de diseño:** Los colores en `tailwind.config.js` son los valores del Light_Mode. El Dark_Mode se maneja exclusivamente a través de las variables CSS en el bloque `.dark` de `styles.css`, no mediante variantes `dark:` de Tailwind con valores hardcodeados. Los componentes usan clases como `bg-[var(--color-surface-50)]` o variables CSS directamente en los estilos inline cuando sea necesario.

### 3. Sidebar — `Sidebar.tsx`

**Cambios estructurales:**

El `<aside>` reemplaza las clases hardcodeadas por referencias a variables CSS:

| Antes | Después |
|---|---|
| `bg-white dark:bg-[#18181b]` | `bg-[var(--color-surface-50)] dark:bg-[var(--color-surface-50)]` |
| `border-gray-200 dark:border-zinc-800` | `border-[var(--color-border)]` |
| `shadow-xl` | `shadow-[4px_0_12px_rgba(10,79,166,0.08)]` |

**Active_Link con franja de acento:**

El enlace activo usa una pseudo-clase `::before` para la franja de 3px. Se añade la clase `.sidebar-link-active` en `components.css`:

```css
.sidebar-link-active {
  position: relative;
  background-color: rgba(10, 79, 166, 0.10);
  color: #0A4FA6;
}
.dark .sidebar-link-active {
  background-color: rgba(10, 79, 166, 0.20);
  color: #93C5FD;
}
.sidebar-link-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #0A4FA6;
  border-radius: 0 2px 2px 0;
}
.dark .sidebar-link-active::before {
  background-color: #3B82F6;
}
```

**Separador con gradiente:**

```css
.sidebar-divider {
  height: 1px;
  background: linear-gradient(to right, #0A4FA6, transparent);
  margin: 0.5rem 1rem;
}
```

**Estado colapsado — indicador de punto:**

Cuando `isCollapsed` es `true` y el enlace es activo, se muestra un punto de 4px debajo del icono con `background-color: var(--color-primary)`.

### 4. Header — `Header.tsx`

**Cambios:**

| Elemento | Antes | Después |
|---|---|---|
| Fondo | `bg-white/80 dark:bg-[#18181b]/80` | `bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(24,24,27,0.85)]` |
| Borde inferior | `border-gray-200 dark:border-zinc-800` | `border-[var(--color-border)]` + línea de 2px `Medical_Blue` al 30% |
| Botón toggle hover | `hover:bg-gray-100 dark:hover:bg-zinc-800` | `hover:bg-[var(--color-surface-100)]` |
| Botón tema — color icono | `text-gray-700 dark:text-gray-300` | `text-[var(--color-primary)]` |

**Línea inferior de acento:**

Se añade un pseudo-elemento `::after` al `<header>` o un `<div>` absoluto:
```css
.header-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: rgba(10, 79, 166, 0.30);
}
```

**Animación del botón de tema:**

```css
.theme-toggle-btn:hover i {
  transform: rotate(15deg);
  transition: transform var(--transition-fast);
}
```

### 5. Footer — `Footer.tsx`

**Cambios:**

| Elemento | Antes | Después |
|---|---|---|
| Fondo | `bg-white/80 dark:bg-[#18181b]/90` | `bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(24,24,27,0.9)]` |
| Borde | `border-gray-200 dark:border-zinc-800` | `border-[var(--color-border)]` |
| Texto | `text-gray-500 dark:text-gray-400` | `text-[var(--color-text-secondary)]` |
| Hover enlace HIS | `hover:text-blue-600` | `hover:text-[var(--color-primary)]` |

**Badge de versión:**

```css
.version-badge {
  border: 1px solid rgba(10, 79, 166, 0.20);
  background-color: rgba(10, 79, 166, 0.05);
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
}
.dark .version-badge {
  border-color: #3F3F46;
  background-color: #27272A;
}
```

### 6. SubMenu — `SubMenu.tsx`

**Cambios en el botón principal:**

| Estado | Antes | Después |
|---|---|---|
| Activo | `bg-blue-50/50 text-blue-700 dark:bg-zinc-800/80 dark:text-blue-400` | clase `.sidebar-link-active` (misma que Sidebar) |
| Hover | `hover:bg-gray-100 dark:hover:bg-zinc-800/50` | `hover:bg-[var(--color-surface-100)]` |

**Menú flotante (modo colapsado):**

```css
.submenu-floating {
  border: 1px solid rgba(10, 79, 166, 0.20);
  box-shadow: 0 8px 24px rgba(10, 79, 166, 0.12);
  background-color: var(--color-surface-50);
}
.submenu-floating-header {
  color: #0A4FA6;
  text-transform: uppercase;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.05em;
}
.dark .submenu-floating-header {
  color: #93C5FD;
}
.submenu-floating-item:hover {
  background-color: rgba(10, 79, 166, 0.08);
  color: #0A4FA6;
}
.dark .submenu-floating-item:hover {
  background-color: rgba(59, 130, 246, 0.15);
  color: #93C5FD;
}
```

**Enlace activo en acordeón inline:**

Reemplaza `bg-blue-100/50 text-blue-700 dark:bg-zinc-800 dark:text-blue-400` por la clase `.sidebar-link-active`.

### 7. LoginPage — `LoginPage.tsx`

**Fondo con gradiente:**

```tsx
<section
  className="flex flex-col md:flex-row justify-center items-center w-screen h-screen relative overflow-hidden"
  style={{
    background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)"
  }}
>
```

Para Dark_Mode se usa la clase `dark` del `<html>`:
```css
.dark .login-bg {
  background: linear-gradient(135deg, #0F172A 0%, #0C1A2E 100%);
}
```

**Elemento decorativo (patrón de cruz médica):**

Un `<div>` absoluto con `pointer-events-none` y `opacity-[0.04]` que contiene un SVG de patrón de cruces médicas repetido como `background-image`.

**Tarjeta de login:**

```css
.login-card {
  box-shadow: 0 20px 40px rgba(10, 79, 166, 0.15);
}
.dark .login-card {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
```

**Focus en inputs:**

```css
.login-input:focus {
  border-color: #0A4FA6;
  box-shadow: 0 0 0 3px rgba(10, 79, 166, 0.15);
  outline: none;
}
```

**Logo:**

```tsx
<img
  alt="HIS Logo"
  src={Images.logo}
  style={{ maxWidth: "200px", marginBottom: "1.5rem" }}
/>
```

### 8. Layout — `Layout.tsx`

El `Layout` requiere cambios mínimos: reemplazar `bg-slate-50 dark:bg-background` por `bg-[var(--color-surface-50)]` y eliminar el wrapper `bg-white dark:bg-[#18181b]` del Footer (que ahora usa sus propias variables CSS).

La animación de página con framer-motion se mantiene sin cambios:
```tsx
<motion.main
  key={location.pathname}
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -15 }}
  transition={{ duration: 0.25, ease: "easeOut" }}
>
```

### 9. TableTheme — `tableTheme.ts`

Se actualiza `customStyles` para incorporar la identidad médica:

```ts
headRow: {
  style: {
    backgroundColor: "rgba(10, 79, 166, 0.08)",  // Light_Mode
    // Dark_Mode se maneja con createTheme override
    borderTopLeftRadius: "0.75rem",
    borderTopRightRadius: "0.75rem",
  },
},
headCells: {
  style: {
    color: "#0A4FA6",  // Light_Mode; Dark_Mode via createTheme
    fontSize: "0.875rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.025em",
  },
},
rows: {
  stripedStyle: {
    backgroundColor: "rgba(10, 79, 166, 0.03)",
  },
  highlightOnHoverStyle: {
    backgroundColor: "hsl(var(--heroui-default-100))",
    borderLeft: "3px solid #0A4FA6",
    transitionDuration: "0.15s",
    transitionProperty: "background-color, border-left",
    outline: "none",
  },
},
pagination: {
  pageButtonsStyle: {
    "&:hover:not(:disabled)": {
      backgroundColor: "rgba(10, 79, 166, 0.10)",
      color: "#0A4FA6",
    },
    "&:focus": {
      backgroundColor: "rgba(10, 79, 166, 0.10)",
      color: "#0A4FA6",
    },
  },
},
```

Para el modo oscuro, se crea un segundo tema `heroui-theme-dark` con `createTheme` que sobreescribe los colores de encabezado:

```ts
createTheme("heroui-theme-dark", {
  // hereda heroui-theme y sobreescribe:
  text: {
    primary: "#E4E4E7",
    secondary: "#A1A1AA",
  },
  // headRow y headCells se manejan en customStylesDark
}, "default");
```

El componente `TableServer.tsx` selecciona el tema según `resolvedTheme` de `next-themes`.

### 10. components.css — Clases Utilitarias

```css
/* Botones */
.btn-primary {
  background-color: #0A4FA6;
  border-color: #0A4FA6;
  color: #FFFFFF;
}
.btn-primary:hover:not(:disabled) {
  background-color: #0D3A7A;
  border-color: #0D3A7A;
}

.btn-success {
  background-color: #0D9E6E;
  border-color: #0D9E6E;
  color: #FFFFFF;
}
.btn-success:hover:not(:disabled) {
  background-color: #0A7A56;
  border-color: #0A7A56;
}

.btn-danger {
  background-color: #DC2626;
  border-color: #DC2626;
  color: #FFFFFF;
}
.btn-danger:hover:not(:disabled) {
  background-color: #B91C1C;
  border-color: #B91C1C;
}

/* Inputs */
.input-form-internal {
  border: 1px solid var(--color-surface-200);
  background-color: var(--color-surface-50);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
}
.input-form-internal:focus {
  border-color: #0A4FA6;
  box-shadow: 0 0 0 3px rgba(10, 79, 166, 0.15);
  outline: none;
  background-color: #FFFFFF;
}

/* Estado activo (navegación) */
.active {
  background-color: rgba(10, 79, 166, 0.10);
  color: #0A4FA6;
}
.dark .active {
  background-color: rgba(10, 79, 166, 0.20);
  color: #93C5FD;
}

/* Badge médico */
.badge-medical {
  background-color: rgba(10, 79, 166, 0.10);
  color: #0A4FA6;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.025em;
}
.dark .badge-medical {
  background-color: rgba(59, 130, 246, 0.15);
  color: #93C5FD;
}

/* Focus visible global */
:focus-visible {
  outline: 2px solid #0A4FA6;
  outline-offset: 2px;
}

/* Tamaño mínimo de área de toque */
.sidebar-touch-target,
.header-touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

---

## Modelos de Datos

### Token de Color

```ts
interface ColorToken {
  name: string;           // e.g. "--color-primary"
  lightValue: string;     // e.g. "#0A4FA6"
  darkValue: string;      // e.g. "#3B82F6"
  tailwindKey?: string;   // e.g. "primary"
}
```

### Configuración de Tema de Tabla

```ts
interface TableThemeConfig {
  themeName: string;                    // "heroui-theme" | "heroui-theme-dark"
  customStyles: TableCustomStyles;      // objeto de estilos de react-data-table-component
}
```

### Paleta Completa

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-primary` | `#0A4FA6` | `#3B82F6` | Acciones primarias, Active_Link, bordes de foco |
| `--color-secondary` | `#0891B2` | `#22D3EE` | Elementos secundarios |
| `--color-accent` | `#0D9E6E` | `#34D399` | Éxito, acciones positivas |
| `--color-surface-50` | `#F8FAFC` | `#18181B` | Fondo principal |
| `--color-surface-100` | `#F1F5F9` | `#27272A` | Hover, fondos de tarjeta |
| `--color-surface-200` | `#E2E8F0` | `#3F3F46` | Bordes, separadores |
| `--color-text-primary` | `#1E293B` | `#E4E4E7` | Texto principal |
| `--color-text-secondary` | `#64748B` | `#A1A1AA` | Texto secundario, placeholders |
| `--color-border` | `#E2E8F0` | `#27272A` | Bordes de componentes |
| `--color-success` | `#059669` | — | Estado de éxito |
| `--color-warning` | `#D97706` | — | Estado de advertencia |
| `--color-danger` | `#DC2626` | — | Estado de error |

---

## Propiedades de Corrección

*Una propiedad es una característica o comportamiento que debe ser verdadero en todas las ejecuciones válidas del sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquina.*

La mayoría de los requisitos de este feature son de configuración CSS y renderizado de UI, que se validan mejor con pruebas de ejemplo. Sin embargo, existe una propiedad universal computable: el ratio de contraste de color.

### Propiedad 1: Ratio de contraste WCAG AA

*Para cualquier* par de colores (texto, fondo) definido en la paleta del Theme_System — tanto en Light_Mode como en Dark_Mode — el ratio de contraste calculado según la fórmula WCAG 2.1 SHALL ser mayor o igual a 4.5:1 para texto normal y 3:1 para texto grande (≥18pt o ≥14pt negrita).

**Valida: Requisitos 10.5, 12.1**

Esta propiedad es computable: dado que todos los valores de color son constantes definidas en el código, se puede escribir un test que itere sobre todos los pares texto/fondo de la paleta y calcule el ratio de contraste usando la fórmula de luminancia relativa de WCAG.

---

## Manejo de Errores

### Variable CSS no definida

Si una variable CSS no está definida para el tema activo, el navegador usa el valor de fallback de la sintaxis `var(--nombre, fallback)`. Todos los usos de variables CSS en los componentes deben incluir un fallback explícito:

```css
/* Correcto */
background-color: var(--color-surface-50, #F8FAFC);

/* Incorrecto — sin fallback */
background-color: var(--color-surface-50);
```

### Tema no montado (SSR / hidratación)

El componente `Header` ya maneja el estado `mounted` para evitar el flash de tema incorrecto. Este patrón se mantiene y se extiende a cualquier componente que renderice condicionalmente según el tema activo.

### Transición de tema

La transición global de `300ms` en `background-color`, `border-color` y `color` garantiza que el cambio de tema sea suave. Para elementos que no deben transicionar (imágenes, SVGs), se aplica `transition: none`.

### Reducción de movimiento

El bloque `@media (prefers-reduced-motion: reduce)` desactiva todas las transiciones y animaciones no esenciales. Las transiciones de color se consideran esenciales para la accesibilidad (indican cambio de estado), por lo que se mantienen con duración reducida a `0ms` solo para animaciones de movimiento (transform, opacity en page transitions).

---

## Estrategia de Pruebas

### Evaluación de PBT

Este feature es principalmente de configuración CSS y renderizado de UI. La mayoría de los requisitos son verificaciones de valores específicos (¿existe esta variable CSS con este valor?) o comportamientos de UI (¿se aplica esta clase cuando el enlace está activo?). Estas categorías no se benefician de property-based testing con múltiples iteraciones.

La única excepción es el cálculo de ratio de contraste (Propiedad 1), que sí es una función pura computable sobre los tokens de color definidos.

### Pruebas de Ejemplo (Unit Tests)

Se usan para verificar:

- **Tokens CSS**: Que `styles.css` define todas las variables requeridas en `:root` y `.dark` con los valores correctos.
- **Tailwind config**: Que `tailwind.config.js` expone los colores médicos correctos.
- **Clases utilitarias**: Que `components.css` define `.btn-primary`, `.btn-success`, `.btn-danger`, `.active`, `.badge-medical` con los valores correctos.
- **TableTheme**: Que `customStyles` contiene los valores de color, border-radius y hover correctos.
- **Componentes**: Que Sidebar, Header, Footer, SubMenu y LoginPage aplican las clases CSS correctas según el estado (activo, hover, tema).

### Prueba de Propiedad (Property-Based Test)

**Librería**: `fast-check` (ya disponible en el ecosistema JS/TS, compatible con Vitest).

**Configuración**: Mínimo 100 iteraciones por propiedad.

**Propiedad 1 — Ratio de contraste WCAG AA**

```ts
// Feature: hospital-ui-theme, Property 1: Ratio de contraste WCAG AA
// Para cualquier par (texto, fondo) de la paleta del Theme_System,
// el ratio de contraste SHALL ser >= 4.5:1

import fc from "fast-check";
import { describe, it } from "vitest";
import { calculateContrastRatio, hexToRelativeLuminance } from "../utils/colorUtils";
import { colorPairs } from "../theme/colorPairs";

describe("hospital-ui-theme: Propiedad 1 — Contraste WCAG AA", () => {
  it("todos los pares texto/fondo de la paleta cumplen ratio >= 4.5:1", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...colorPairs),
        ({ foreground, background, isLargeText }) => {
          const ratio = calculateContrastRatio(foreground, background);
          const minRatio = isLargeText ? 3.0 : 4.5;
          return ratio >= minRatio;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

`colorPairs` es un array de objetos `{ foreground, background, isLargeText }` generado a partir de los tokens de la paleta (texto sobre superficies, texto sobre primario, etc.).

### Pruebas de Integración

- Verificar que el cambio de tema (click en botón del Header) aplica la clase `.dark` al elemento `<html>` y que los componentes reflejan los colores correctos.
- Verificar que la animación de página (framer-motion) se ejecuta al navegar entre rutas.
- Verificar que el Sidebar colapsa y expande con la transición de `300ms`.

### Pruebas de Humo (Smoke Tests)

- Verificar que la aplicación carga sin errores de consola relacionados con variables CSS no definidas.
- Verificar que todos los tokens de color están definidos en `:root` y `.dark`.
- Verificar que `tailwind.config.js` contiene las claves de color médicas.
