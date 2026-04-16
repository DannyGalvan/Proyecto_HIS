# Documento de Requisitos

## Introducción

Este documento describe los requisitos para el rediseño visual del sistema HIS (Hospital Information System), una aplicación web React + TypeScript que gestiona operaciones hospitalarias. El objetivo es establecer un tema visual moderno, coherente y orientado al entorno de salud, mejorando la experiencia del personal hospitalario en modo claro y oscuro, con una paleta de colores médica, tipografía consistente y estilos actualizados para todos los componentes principales: layout, navegación, tablas de datos y formularios.

---

## Glosario

- **HIS**: Hospital Information System — el sistema frontend objeto de esta mejora.
- **Theme_System**: El subsistema de temas visuales compuesto por `tailwind.config.js`, `styles.css`, `components.css` y la configuración de HeroUI.
- **Sidebar**: Componente de navegación lateral (`Sidebar.tsx`) que contiene el logo, los menús de módulos y el botón de cierre de sesión.
- **Header**: Barra superior (`Header.tsx`) con el botón de menú y el selector de tema claro/oscuro.
- **Footer**: Pie de página (`Footer.tsx`) con información de versión y copyright.
- **SubMenu**: Componente de menú desplegable (`SubMenu.tsx`) que muestra las operaciones de cada módulo.
- **TableTheme**: Configuración de estilos para `react-data-table-component` definida en `tableTheme.ts`.
- **LoginPage**: Página de autenticación (`LoginPage.tsx`) con formulario de acceso.
- **Layout**: Contenedor principal (`Layout.tsx`) que organiza Sidebar, Header, contenido y Footer.
- **Medical_Blue**: Color primario hospitalario — azul médico profundo (`#0A4FA6`).
- **Health_Green**: Color de acento saludable — verde clínico (`#0D9E6E`).
- **Clinical_Teal**: Color secundario — verde azulado clínico (`#0891B2`).
- **Light_Mode**: Modo visual con fondo blanco/gris claro, texto oscuro.
- **Dark_Mode**: Modo visual con fondo zinc/slate oscuro, texto claro.
- **Active_Link**: Enlace de navegación que corresponde a la ruta actual del usuario.
- **CSS_Variable**: Variable CSS definida en `:root` o `.dark` para valores reutilizables de color.

---

## Requisitos

### Requisito 1: Paleta de Colores Hospitalaria

**User Story:** Como miembro del personal hospitalario, quiero que la interfaz use colores asociados al entorno médico, para que el sistema se sienta profesional y confiable durante mi jornada laboral.

#### Criterios de Aceptación

1. THE Theme_System SHALL definir `Medical_Blue` (`#0A4FA6`) como color primario en `tailwind.config.js` y como variable CSS `--color-primary` en `styles.css`.
2. THE Theme_System SHALL definir `Clinical_Teal` (`#0891B2`) como color secundario en `tailwind.config.js` y como variable CSS `--color-secondary`.
3. THE Theme_System SHALL definir `Health_Green` (`#0D9E6E`) como color de acento en `tailwind.config.js` y como variable CSS `--color-accent`.
4. THE Theme_System SHALL definir una escala de grises neutros (`--color-surface-*`) con al menos 3 niveles: `#F8FAFC` (surface-50), `#F1F5F9` (surface-100), `#E2E8F0` (surface-200) para fondos en Light_Mode.
5. THE Theme_System SHALL definir colores de estado semánticos: `--color-success` (`#059669`), `--color-warning` (`#D97706`), `--color-danger` (`#DC2626`) como variables CSS.
6. WHEN el usuario activa Dark_Mode, THE Theme_System SHALL aplicar variantes oscuras de la paleta: `Medical_Blue` aclarado a `#3B82F6` para contraste sobre fondos oscuros, fondos de superficie `#18181B`, `#27272A`, `#3F3F46`.

---

### Requisito 2: Mejora del Tema Claro/Oscuro

**User Story:** Como usuario del HIS, quiero que el cambio entre modo claro y oscuro sea visualmente consistente en todos los componentes, para no experimentar contrastes abruptos o elementos sin estilo al alternar temas.

#### Criterios de Aceptación

1. THE Theme_System SHALL definir todas las variables de color de superficie, borde y texto en los bloques `:root` (Light_Mode) y `.dark` (Dark_Mode) dentro de `styles.css`.
2. WHEN el usuario activa Dark_Mode, THE Sidebar SHALL aplicar fondo `#18181B`, borde `#27272A` y texto `#E4E4E7` sin valores hardcodeados en el componente.
3. WHEN el usuario activa Dark_Mode, THE Header SHALL aplicar fondo `rgba(24,24,27,0.85)` con `backdrop-blur` y borde `#27272A`.
4. WHEN el usuario activa Dark_Mode, THE Footer SHALL aplicar fondo `#18181B`, borde `#27272A` y texto `#A1A1AA`.
5. WHEN el usuario activa Light_Mode, THE Sidebar SHALL aplicar fondo `#FFFFFF`, borde `#E2E8F0` y texto `#1E293B`.
6. WHEN el usuario activa Light_Mode, THE Header SHALL aplicar fondo `rgba(255,255,255,0.85)` con `backdrop-blur` y borde `#E2E8F0`.
7. THE Theme_System SHALL aplicar una transición CSS de `300ms ease` en todos los cambios de color de fondo, borde y texto al alternar entre Light_Mode y Dark_Mode.
8. IF una variable CSS de color no está definida para el tema activo, THEN THE Theme_System SHALL usar el valor de fallback del tema contrario para evitar elementos sin color.

---

### Requisito 3: Rediseño del Sidebar

**User Story:** Como usuario del HIS, quiero que el sidebar tenga una identidad visual hospitalaria clara, para identificar fácilmente la navegación y el módulo activo durante mi trabajo.

#### Criterios de Aceptación

1. THE Sidebar SHALL usar variables CSS del Theme_System para todos sus colores de fondo, borde y texto, eliminando valores hardcodeados como `bg-white`, `dark:bg-[#18181b]`.
2. THE Sidebar SHALL mostrar una franja de acento vertical de color `Medical_Blue` de 3px de ancho en el lado izquierdo del Active_Link.
3. WHEN un enlace es Active_Link, THE Sidebar SHALL aplicar fondo `Medical_Blue` con opacidad 10% y texto `Medical_Blue` en Light_Mode, y fondo `Medical_Blue` con opacidad 20% y texto `#93C5FD` en Dark_Mode.
4. WHEN el usuario hace hover sobre un enlace no activo, THE Sidebar SHALL aplicar fondo `--color-surface-100` en Light_Mode y `#27272A` en Dark_Mode con transición de `200ms`.
5. THE Sidebar SHALL mostrar un separador horizontal con gradiente de `Medical_Blue` a transparente entre la sección del logo y los menús de navegación.
6. WHEN el Sidebar está colapsado, THE Sidebar SHALL mostrar los iconos de navegación centrados con un indicador de punto de color `Medical_Blue` debajo del icono activo.
7. THE Sidebar SHALL aplicar `box-shadow` lateral de `4px 0 12px rgba(10,79,166,0.08)` en Light_Mode para separación visual del contenido.

---

### Requisito 4: Rediseño del Header

**User Story:** Como usuario del HIS, quiero que el header sea visualmente limpio y coherente con la identidad hospitalaria, para orientarme fácilmente en la aplicación.

#### Criterios de Aceptación

1. THE Header SHALL usar variables CSS del Theme_System para todos sus colores, eliminando valores hardcodeados.
2. THE Header SHALL mostrar una línea inferior de 2px de color `Medical_Blue` con opacidad 30% como separador visual del contenido.
3. WHEN el usuario hace hover sobre el botón de toggle del Sidebar, THE Header SHALL aplicar fondo `--color-surface-100` en Light_Mode y `#27272A` en Dark_Mode.
4. THE Header SHALL mostrar el botón de cambio de tema con un ícono de sol (`bi-sun-fill`) en Dark_Mode y luna (`bi-moon-stars-fill`) en Light_Mode, con color `Medical_Blue` en Light_Mode y `#93C5FD` en Dark_Mode.
5. WHEN el usuario hace hover sobre el botón de cambio de tema, THE Header SHALL aplicar una animación de rotación de 15 grados en el ícono con duración de `200ms`.

---

### Requisito 5: Rediseño del Footer

**User Story:** Como usuario del HIS, quiero que el footer sea discreto pero coherente con el tema hospitalario, para que no distraiga del contenido principal.

#### Criterios de Aceptación

1. THE Footer SHALL usar variables CSS del Theme_System para todos sus colores, eliminando valores hardcodeados.
2. THE Footer SHALL mostrar el texto de copyright con el color `--color-primary` al hacer hover sobre el enlace "HIS".
3. THE Footer SHALL mostrar la etiqueta de versión con borde de color `Medical_Blue` con opacidad 20% y fondo `Medical_Blue` con opacidad 5% en Light_Mode.
4. WHEN el usuario activa Dark_Mode, THE Footer SHALL mostrar la etiqueta de versión con borde `#3F3F46` y fondo `#27272A`.

---

### Requisito 6: Rediseño del SubMenu

**User Story:** Como usuario del HIS, quiero que los submenús de navegación sean visualmente consistentes con el tema hospitalario, para identificar fácilmente las secciones activas.

#### Criterios de Aceptación

1. THE SubMenu SHALL usar variables CSS del Theme_System para todos sus colores, eliminando valores hardcodeados.
2. WHEN un elemento del SubMenu es Active_Link, THE SubMenu SHALL aplicar los mismos estilos de Active_Link definidos en el Requisito 3, criterio 3.
3. THE SubMenu SHALL mostrar el menú flotante (modo colapsado) con borde de color `Medical_Blue` con opacidad 20%, sombra `0 8px 24px rgba(10,79,166,0.12)` y fondo de superficie del tema activo.
4. THE SubMenu SHALL mostrar el encabezado del menú flotante con texto de color `Medical_Blue` en mayúsculas y tamaño `0.65rem`.
5. WHEN el usuario hace hover sobre un elemento del menú flotante, THE SubMenu SHALL aplicar fondo `Medical_Blue` con opacidad 8% y texto `Medical_Blue` en Light_Mode.

---

### Requisito 7: Actualización del TableTheme

**User Story:** Como usuario del HIS, quiero que las tablas de datos tengan un estilo hospitalario reconocible, para leer la información clínica con comodidad y claridad.

#### Criterios de Aceptación

1. THE TableTheme SHALL definir el color de la fila de encabezado (`headRow`) con fondo `Medical_Blue` con opacidad 8% en Light_Mode y `Medical_Blue` con opacidad 15% en Dark_Mode, usando variables CSS de HeroUI.
2. THE TableTheme SHALL definir el texto de las celdas de encabezado (`headCells`) con color `Medical_Blue` en Light_Mode y `#93C5FD` en Dark_Mode.
3. THE TableTheme SHALL aplicar un borde izquierdo de 3px de color `Medical_Blue` en las filas al hacer hover (`highlightOnHoverStyle`).
4. THE TableTheme SHALL definir filas alternas (`stripedStyle`) con fondo `Medical_Blue` con opacidad 3% en Light_Mode y `Medical_Blue` con opacidad 6% en Dark_Mode.
5. THE TableTheme SHALL aplicar `border-radius` de `0.75rem` al contenedor completo de la tabla (headRow superior y pagination inferior).
6. THE TableTheme SHALL definir los botones de paginación con color `Medical_Blue` al hacer hover y al estar activos.
7. WHEN no hay datos en la tabla, THE TableTheme SHALL mostrar el mensaje de "sin datos" con ícono y texto de color `--heroui-foreground-400` centrado verticalmente.

---

### Requisito 8: Rediseño de la Página de Login

**User Story:** Como usuario del HIS, quiero que la página de login transmita confianza y profesionalismo médico, para sentirme seguro al ingresar mis credenciales.

#### Criterios de Aceptación

1. THE LoginPage SHALL mostrar un fondo con gradiente diagonal de `#EFF6FF` a `#F0FDF4` en Light_Mode y de `#0F172A` a `#0C1A2E` en Dark_Mode.
2. THE LoginPage SHALL mostrar la tarjeta de login con sombra `0 20px 40px rgba(10,79,166,0.15)` en Light_Mode y `0 20px 40px rgba(0,0,0,0.4)` en Dark_Mode.
3. THE LoginPage SHALL mostrar un elemento decorativo de fondo (patrón de cruz médica o grilla sutil) con opacidad máxima de 5% para no interferir con la legibilidad.
4. THE LoginPage SHALL mostrar el logo centrado con un ancho máximo de 200px y margen inferior de `1.5rem`.
5. WHEN el usuario hace foco en un campo del formulario de login, THE LoginPage SHALL aplicar un borde de color `Medical_Blue` con `box-shadow` de `0 0 0 3px rgba(10,79,166,0.15)`.

---

### Requisito 9: Estilos de Componentes Utilitarios

**User Story:** Como desarrollador del HIS, quiero que las clases utilitarias de `components.css` sean coherentes con el tema hospitalario, para aplicar estilos consistentes en formularios y botones de toda la aplicación.

#### Criterios de Aceptación

1. THE Theme_System SHALL actualizar la clase `.btn-primary` en `components.css` para usar `Medical_Blue` como color de fondo y `#0D3A7A` como color de hover.
2. THE Theme_System SHALL actualizar la clase `.btn-success` en `components.css` para usar `Health_Green` (`#0D9E6E`) como color de fondo y `#0A7A56` como color de hover.
3. THE Theme_System SHALL actualizar la clase `.btn-danger` en `components.css` para mantener rojo semántico `#DC2626` como color de fondo y `#B91C1C` como color de hover.
4. THE Theme_System SHALL actualizar la clase `.input-form-internal` para usar borde `--color-surface-200` y fondo `--color-surface-50`, con foco en `Medical_Blue`.
5. THE Theme_System SHALL actualizar la clase `.active` en `components.css` para usar `Medical_Blue` con opacidad 10% como fondo y `Medical_Blue` como color de texto, reemplazando el valor hardcodeado `bg-black`.
6. THE Theme_System SHALL definir una nueva clase `.badge-medical` con fondo `Medical_Blue` con opacidad 10%, texto `Medical_Blue`, `border-radius` de `9999px` y padding `0.25rem 0.75rem` para etiquetas de estado clínico.

---

### Requisito 10: Consistencia Tipográfica

**User Story:** Como usuario del HIS, quiero que la tipografía sea uniforme y legible en toda la aplicación, para reducir la fatiga visual durante jornadas largas.

#### Criterios de Aceptación

1. THE Theme_System SHALL mantener Montserrat como fuente principal para todo el cuerpo de texto, con peso mínimo de `400` y máximo de `700`.
2. THE Theme_System SHALL definir una escala tipográfica base: `0.75rem` (xs), `0.875rem` (sm), `1rem` (base), `1.125rem` (lg), `1.25rem` (xl) como variables CSS `--font-size-*`.
3. THE Theme_System SHALL aplicar `line-height` de `1.6` para texto de párrafo y `1.3` para encabezados en toda la aplicación.
4. THE Theme_System SHALL definir `letter-spacing` de `0.025em` para etiquetas de formulario y encabezados de tabla en mayúsculas.
5. WHILE el usuario navega en Dark_Mode, THE Theme_System SHALL aplicar `color` de `#E4E4E7` para texto principal y `#A1A1AA` para texto secundario, garantizando ratio de contraste mínimo de 4.5:1 según WCAG AA.

---

### Requisito 11: Animaciones y Transiciones

**User Story:** Como usuario del HIS, quiero que las transiciones entre estados visuales sean suaves y no distractoras, para mantener el foco en las tareas clínicas.

#### Criterios de Aceptación

1. THE Theme_System SHALL definir una duración estándar de transición de `200ms` para interacciones de hover y `300ms` para cambios de estado de componentes (apertura/cierre de menús).
2. THE Layout SHALL mantener la animación de entrada de página (`opacity: 0→1`, `y: 15→0`) con duración de `250ms` y easing `easeOut` usando framer-motion.
3. THE Sidebar SHALL aplicar transición de `300ms ease-in-out` en el cambio de ancho entre estado colapsado (`4.5rem`) y expandido (`16rem`).
4. IF el usuario prefiere movimiento reducido (`prefers-reduced-motion: reduce`), THEN THE Theme_System SHALL desactivar todas las animaciones no esenciales manteniendo solo las transiciones de color.

---

### Requisito 12: Accesibilidad Visual

**User Story:** Como usuario del HIS con necesidades de accesibilidad, quiero que la interfaz cumpla estándares mínimos de contraste y navegación, para usar el sistema sin barreras visuales.

#### Criterios de Aceptación

1. THE Theme_System SHALL garantizar que todos los textos sobre fondos de color primario (`Medical_Blue`) usen color blanco (`#FFFFFF`) con ratio de contraste mínimo de 4.5:1 (WCAG AA).
2. THE Theme_System SHALL garantizar que los Active_Link tengan un indicador visual adicional al color (la franja lateral de 3px definida en Requisito 3) para no depender únicamente del color.
3. THE Theme_System SHALL aplicar `focus-visible` con `outline` de 2px de color `Medical_Blue` y `outline-offset` de 2px en todos los elementos interactivos (botones, enlaces, inputs).
4. THE Theme_System SHALL mantener un tamaño mínimo de área de toque de `44x44px` para todos los botones interactivos del Sidebar, Header y Footer.
