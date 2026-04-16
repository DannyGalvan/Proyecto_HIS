# Plan de Implementación: hospital-ui-theme

## Visión General

Implementar el rediseño visual del sistema HIS mediante un sistema de diseño centralizado basado en variables CSS. El enfoque es de abajo hacia arriba: primero los tokens de diseño (capa base), luego las clases utilitarias y el tema de tablas, y finalmente los componentes React que consumen esos tokens.

## Tareas

- [x] 1. Establecer tokens de diseño en `styles.css`
  - Añadir el bloque `:root` con todas las variables CSS de la paleta médica: `--color-primary` (`#0A4FA6`), `--color-secondary` (`#0891B2`), `--color-accent` (`#0D9E6E`), superficies (`--color-surface-50/100/200`), estados semánticos (`--color-success`, `--color-warning`, `--color-danger`), texto (`--color-text-primary`, `--color-text-secondary`), borde (`--color-border`) y tipografía (`--font-size-xs/sm/base/lg/xl`), transiciones (`--transition-fast: 200ms ease`, `--transition-normal: 300ms ease`)
  - Añadir el bloque `.dark` con las variantes oscuras de la paleta: `--color-primary: #3B82F6`, superficies zinc (`#18181B`, `#27272A`, `#3F3F46`), texto claro (`#E4E4E7`, `#A1A1AA`), borde `#27272A`
  - Añadir la regla de transición global `*, *::before, *::after` para `background-color`, `border-color` y `color` con duración `300ms ease`
  - Añadir el bloque `@media (prefers-reduced-motion: reduce)` que fija `transition-duration: 0ms !important` y `animation-duration: 0ms !important`
  - Mantener las variables legacy `--bs-container`, `--solusersa`, etc. para no romper código existente
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.7, 2.8, 10.1, 10.2, 10.3, 10.4, 11.1, 11.4_

- [x] 2. Extender la paleta médica en `tailwind.config.js`
  - Reemplazar los colores actuales (`primary: "#043d86"`, `secondary: "#28A8E8"`, `accent: "#ff5722"`) por los valores médicos: `primary: "#0A4FA6"`, `secondary: "#0891B2"`, `accent: "#0D9E6E"`
  - Añadir los colores de estado: `success: "#059669"`, `warning: "#D97706"`, `danger: "#DC2626"`
  - Añadir la escala de superficies: `surface: { 50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0" }`
  - Mantener las fuentes existentes (`montserrat`, `funnel`)
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Actualizar clases utilitarias en `components.css`
  - [x] 3.1 Actualizar `.btn-primary`, `.btn-success`, `.btn-danger`
    - Reemplazar `.btn-primary` (actualmente `bg-indigo-800`) por `background-color: #0A4FA6; border-color: #0A4FA6; color: #FFFFFF` con hover `#0D3A7A`
    - Reemplazar `.btn-success` (actualmente `bg-green-500`) por `background-color: #0D9E6E; border-color: #0D9E6E; color: #FFFFFF` con hover `#0A7A56`
    - Actualizar `.btn-danger` para usar `#DC2626` con hover `#B91C1C` (mantiene semántica roja, actualiza valores exactos)
    - _Requisitos: 9.1, 9.2, 9.3_

  - [x] 3.2 Actualizar `.input-form-internal` y `.active`
    - Reemplazar `.input-form-internal` (actualmente `bg-sky-100`) por `border: 1px solid var(--color-surface-200); background-color: var(--color-surface-50)` con focus en `#0A4FA6` y `box-shadow: 0 0 0 3px rgba(10,79,166,0.15)`
    - Reemplazar `.active` (actualmente `bg-black text-blue-600`) por `background-color: rgba(10,79,166,0.10); color: #0A4FA6` con variante `.dark .active` para `rgba(10,79,166,0.20)` y `color: #93C5FD`
    - _Requisitos: 9.4, 9.5_

  - [x] 3.3 Añadir nuevas clases de componentes
    - Añadir `.badge-medical`: fondo `rgba(10,79,166,0.10)`, texto `#0A4FA6`, `border-radius: 9999px`, padding `0.25rem 0.75rem`, `font-size: var(--font-size-xs)`, `font-weight: 600`, `letter-spacing: 0.025em`; variante `.dark .badge-medical` con fondo `rgba(59,130,246,0.15)` y texto `#93C5FD`
    - Añadir `.sidebar-link-active` con `position: relative`, fondo `rgba(10,79,166,0.10)`, texto `#0A4FA6`; pseudo-elemento `::before` para la franja de 3px `background-color: #0A4FA6`; variante `.dark .sidebar-link-active` con fondo `rgba(10,79,166,0.20)`, texto `#93C5FD`, y `::before` con `background-color: #3B82F6`
    - Añadir `.sidebar-divider`: `height: 1px; background: linear-gradient(to right, #0A4FA6, transparent); margin: 0.5rem 1rem`
    - Añadir `.version-badge`: `border: 1px solid rgba(10,79,166,0.20); background-color: rgba(10,79,166,0.05); border-radius: 9999px; padding: 0.25rem 0.75rem`; variante `.dark .version-badge` con `border-color: #3F3F46; background-color: #27272A`
    - Añadir `.submenu-floating`: `border: 1px solid rgba(10,79,166,0.20); box-shadow: 0 8px 24px rgba(10,79,166,0.12); background-color: var(--color-surface-50)`
    - Añadir `.submenu-floating-header`: `color: #0A4FA6; text-transform: uppercase; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.05em`; variante `.dark .submenu-floating-header` con `color: #93C5FD`
    - Añadir `.submenu-floating-item:hover`: `background-color: rgba(10,79,166,0.08); color: #0A4FA6`; variante `.dark .submenu-floating-item:hover` con `rgba(59,130,246,0.15)` y `color: #93C5FD`
    - Añadir `.header-accent-line`: `position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background-color: rgba(10,79,166,0.30)`
    - Añadir `.login-card`: `box-shadow: 0 20px 40px rgba(10,79,166,0.15)`; variante `.dark .login-card` con `box-shadow: 0 20px 40px rgba(0,0,0,0.4)`
    - Añadir `.login-bg`: `background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)`; variante `.dark .login-bg` con `background: linear-gradient(135deg, #0F172A 0%, #0C1A2E 100%)`
    - Añadir `:focus-visible` global: `outline: 2px solid #0A4FA6; outline-offset: 2px`
    - _Requisitos: 3.2, 3.3, 4.2, 5.3, 5.4, 6.3, 6.4, 6.5, 8.2, 9.6, 12.2, 12.3_

- [x] 4. Actualizar `tableTheme.ts` con identidad médica
  - [x] 4.1 Actualizar `customStyles` con colores médicos
    - Actualizar `headRow.style`: cambiar `backgroundColor` de `hsl(var(--heroui-content2))` a `rgba(10,79,166,0.08)`, mantener `borderTopLeftRadius` y `borderTopRightRadius` en `0.75rem`
    - Actualizar `headCells.style`: cambiar `color` de `hsl(var(--heroui-foreground-600))` a `#0A4FA6`, añadir `textTransform: "uppercase"` y `letterSpacing: "0.025em"`, `fontWeight: "700"`
    - Actualizar `rows.stripedStyle`: cambiar `backgroundColor` de `hsl(var(--heroui-content1))` a `rgba(10,79,166,0.03)`
    - Actualizar `rows.highlightOnHoverStyle`: añadir `borderLeft: "3px solid #0A4FA6"` y `transitionProperty: "background-color, border-left"`
    - Actualizar `pagination.pageButtonsStyle`: cambiar `"&:hover:not(:disabled)"` y `"&:focus"` para usar `backgroundColor: "rgba(10,79,166,0.10)"` y `color: "#0A4FA6"`
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 4.2 Crear tema oscuro con `createTheme` para tablas
    - Añadir llamada a `createTheme("heroui-theme-dark", ...)` que herede de `"default"` y sobreescriba `text.primary` con `"#E4E4E7"` y `text.secondary` con `"#A1A1AA"`
    - Exportar `customStylesDark` con `headRow.style.backgroundColor: "rgba(10,79,166,0.15)"` y `headCells.style.color: "#93C5FD"` para el modo oscuro
    - _Requisitos: 7.1, 7.2_

- [x] 5. Checkpoint — Verificar tokens y estilos base
  - Asegurarse de que todos los tests pasen y que no haya errores de TypeScript en los archivos modificados hasta este punto. Consultar al usuario si surgen dudas.

- [x] 6. Actualizar `Sidebar.tsx` con variables CSS y nuevas clases
  - [x] 6.1 Reemplazar colores hardcodeados en el `<aside>`
    - Cambiar `bg-white dark:bg-[#18181b]` por `bg-[var(--color-surface-50)]` (aplica a ambos temas vía variables CSS)
    - Cambiar `border-gray-200 dark:border-zinc-800` por `border-[var(--color-border)]`
    - Cambiar `shadow-xl` por `shadow-[4px_0_12px_rgba(10,79,166,0.08)]`
    - Aplicar el mismo reemplazo en el `<div>` del header del sidebar y en el `<div>` del footer del sidebar (bordes `border-gray-200 dark:border-zinc-800`)
    - _Requisitos: 2.2, 2.5, 3.1, 3.7_

  - [x] 6.2 Aplicar `.sidebar-link-active` al enlace de Inicio y al separador
    - Reemplazar las clases condicionales del enlace "Inicio" (`bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`) por la clase `.sidebar-link-active`
    - Reemplazar el separador `<div className="w-[80%] h-px bg-gray-200 dark:bg-zinc-800 my-2 mx-auto" />` por `<div className="sidebar-divider" />`
    - Reemplazar los estilos hover del enlace no activo (`hover:bg-gray-100 dark:hover:bg-zinc-800/50`) por `hover:bg-[var(--color-surface-100)]`
    - _Requisitos: 3.2, 3.3, 3.4, 3.5_

  - [x] 6.3 Añadir indicador de punto para estado colapsado activo
    - Cuando `isOpen` es `false` y el enlace es activo, renderizar un `<span>` de 4px × 4px con `background-color: var(--color-primary)` y `border-radius: 9999px` debajo del icono
    - Aplicar la misma lógica al enlace "Inicio" y delegar la responsabilidad al componente `SubMenu` para los módulos
    - _Requisitos: 3.6_

  - [ ]* 6.4 Escribir tests unitarios para Sidebar
    - Verificar que el enlace activo tiene la clase `sidebar-link-active`
    - Verificar que el separador usa la clase `sidebar-divider`
    - Verificar que no hay clases hardcodeadas `bg-white`, `dark:bg-[#18181b]`, `border-gray-200`, `dark:border-zinc-800`
    - _Requisitos: 3.1, 3.2, 3.5_

- [x] 7. Actualizar `SubMenu.tsx` con variables CSS y nuevas clases
  - [x] 7.1 Reemplazar colores hardcodeados en el botón principal
    - Reemplazar las clases condicionales del estado activo (`bg-blue-50/50 text-blue-700 dark:bg-zinc-800/80 dark:text-blue-400`) por la clase `.sidebar-link-active`
    - Reemplazar hover no activo (`hover:bg-gray-100 dark:hover:bg-zinc-800/50`) por `hover:bg-[var(--color-surface-100)]`
    - _Requisitos: 6.1, 6.2_

  - [x] 7.2 Actualizar el menú flotante (modo colapsado)
    - Reemplazar las clases del `<motion.div>` del menú flotante (`border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900`) por la clase `.submenu-floating`
    - Reemplazar las clases del encabezado del menú flotante (`text-gray-500 dark:text-gray-400`) por la clase `.submenu-floating-header`
    - Reemplazar las clases del `<div>` separador interno (`border-gray-100 dark:border-zinc-800`) por `border-[var(--color-border)]`
    - Reemplazar las clases de la flecha del menú flotante (`border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900`) por `border-[var(--color-border)] bg-[var(--color-surface-50)]`
    - Añadir la clase `.submenu-floating-item` a cada `<Link>` del menú flotante y reemplazar sus clases de hover hardcodeadas
    - _Requisitos: 6.3, 6.4, 6.5_

  - [x] 7.3 Actualizar el acordeón inline (modo expandido)
    - Reemplazar las clases del enlace activo en el acordeón (`bg-blue-100/50 text-blue-700 dark:bg-zinc-800 dark:text-blue-400`) por la clase `.sidebar-link-active`
    - Reemplazar las clases hover del enlace no activo (`hover:bg-gray-100 dark:hover:bg-zinc-800/50`) por `hover:bg-[var(--color-surface-100)]`
    - _Requisitos: 6.2_

  - [ ]* 7.4 Escribir tests unitarios para SubMenu
    - Verificar que el botón activo tiene la clase `sidebar-link-active`
    - Verificar que el menú flotante tiene la clase `submenu-floating`
    - Verificar que el encabezado flotante tiene la clase `submenu-floating-header`
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Actualizar `Header.tsx` con variables CSS y animación
  - [x] 8.1 Reemplazar colores hardcodeados en el `<header>`
    - Cambiar `bg-white/80 dark:bg-[#18181b]/80` por `bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(24,24,27,0.85)]`
    - Cambiar `border-gray-200 dark:border-zinc-800` por `border-[var(--color-border)]`
    - Añadir `relative` al `<header>` para posicionar el pseudo-elemento de la línea de acento
    - Añadir un `<div className="header-accent-line" />` como último hijo del `<header>`
    - _Requisitos: 2.3, 2.6, 4.1, 4.2_

  - [x] 8.2 Actualizar botones del Header
    - Cambiar el hover del botón toggle (`hover:bg-gray-100 dark:hover:bg-zinc-800`) por `hover:bg-[var(--color-surface-100)]`
    - Cambiar el color del botón de tema (`bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300`) por `bg-[var(--color-surface-100)] text-[var(--color-primary)]`
    - Añadir la clase `theme-toggle-btn` al botón de cambio de tema para activar la animación de rotación definida en `components.css`
    - _Requisitos: 4.3, 4.4, 4.5_

  - [ ]* 8.3 Escribir tests unitarios para Header
    - Verificar que no hay clases hardcodeadas `bg-white/80`, `dark:bg-[#18181b]/80`, `border-gray-200`, `dark:border-zinc-800`
    - Verificar que el `<div className="header-accent-line" />` está presente en el DOM
    - _Requisitos: 4.1, 4.2_

- [x] 9. Actualizar `Footer.tsx` con variables CSS y badge de versión
  - Cambiar `bg-white/80 dark:bg-[#18181b]/90` por `bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(24,24,27,0.9)]`
  - Cambiar `border-gray-200 dark:border-zinc-800` por `border-[var(--color-border)]`
  - Cambiar `text-gray-500 dark:text-gray-400` por `text-[var(--color-text-secondary)]`
  - Cambiar `hover:text-blue-600 dark:hover:text-blue-400` del enlace "HIS" por `hover:text-[var(--color-primary)]`
  - Reemplazar el `<span>` del badge de versión (actualmente `rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-zinc-800 dark:text-gray-300 border border-gray-200 dark:border-zinc-700`) por la clase `.version-badge`
  - _Requisitos: 2.4, 5.1, 5.2, 5.3, 5.4_

- [x] 10. Actualizar `Layout.tsx` con variables CSS
  - Cambiar `bg-slate-50 dark:bg-background` del `<div>` raíz por `bg-[var(--color-surface-50)]`
  - Eliminar el wrapper `bg-white dark:bg-[#18181b]` del `<div>` que envuelve al `<Footer />` (el Footer ya gestiona su propio fondo con variables CSS)
  - Mantener sin cambios la animación de framer-motion (`opacity: 0→1`, `y: 15→0`, `duration: 0.25`, `ease: "easeOut"`)
  - _Requisitos: 2.1, 11.2_

- [x] 11. Checkpoint — Verificar layout y navegación
  - Asegurarse de que todos los tests pasen y que la aplicación compile sin errores de TypeScript. Verificar visualmente que Sidebar, Header, Footer y SubMenu usan las variables CSS correctas. Consultar al usuario si surgen dudas.

- [x] 12. Actualizar `LoginPage.tsx` con gradiente y tarjeta médica
  - [x] 12.1 Añadir fondo con gradiente y elemento decorativo
    - Añadir la clase `login-bg` al `<section>` raíz y `relative overflow-hidden` para posicionar el elemento decorativo
    - Añadir un `<div>` absoluto con `pointer-events-none`, `opacity-[0.04]` y `aria-hidden="true"` que contenga un SVG de patrón de cruces médicas repetido como `backgroundImage` con `backgroundSize: "40px 40px"`
    - _Requisitos: 8.1, 8.3_

  - [x] 12.2 Actualizar la tarjeta de login
    - Añadir la clase `login-card` al componente `<Card>` de HeroUI para aplicar la sombra médica
    - Actualizar el `<img>` del logo para usar `style={{ maxWidth: "200px", marginBottom: "1.5rem" }}`
    - _Requisitos: 8.2, 8.4_

  - [ ]* 12.3 Escribir tests unitarios para LoginPage
    - Verificar que el `<section>` tiene la clase `login-bg`
    - Verificar que el `<Card>` tiene la clase `login-card`
    - Verificar que el elemento decorativo tiene `aria-hidden="true"` y `pointer-events-none`
    - _Requisitos: 8.1, 8.2, 8.3_

- [x] 13. Integrar tema oscuro en `TableServer.tsx`
  - Importar `useTheme` de `next-themes` en `TableServer.tsx`
  - Leer `resolvedTheme` y seleccionar el tema de tabla: `"heroui-theme-dark"` cuando `resolvedTheme === "dark"`, `"heroui-theme"` en caso contrario
  - Importar y usar `customStylesDark` de `tableTheme.ts` cuando el tema es oscuro
  - _Requisitos: 7.1, 7.2_

- [x] 14. Checkpoint final — Verificar integración completa
  - Asegurarse de que todos los tests pasen, que la aplicación compile sin errores de TypeScript y que no haya variables CSS sin definir en ningún componente. Consultar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- El orden de las tareas respeta las dependencias: los tokens CSS (tareas 1–3) deben completarse antes que los componentes (tareas 6–13)
- Cada tarea referencia los requisitos específicos del documento `requirements.md` para trazabilidad
- Los valores hexadecimales hardcodeados en los componentes deben reemplazarse por variables CSS o clases Tailwind que apunten a variables CSS — nunca al revés
- El bloque `@media (prefers-reduced-motion: reduce)` en `styles.css` (tarea 1) cubre automáticamente todos los componentes sin cambios adicionales en cada uno
- La animación de framer-motion en `Layout.tsx` se mantiene sin cambios (ya usa `duration: 0.25` y no depende de colores)
