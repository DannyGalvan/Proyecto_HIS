interface LogoHISProps {
  readonly width?: string | number;
  readonly height?: string | number;
  readonly className?: string;
}

export function LogoHIS({ width = "200px", height = "auto", className }: LogoHISProps) {
  return (
    <svg
      className={className}
      height={height}
      width={width}
      viewBox="0 0 320 100" // Espacio justo para que no flote
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Icono: Usamos currentColor para que herede el color del texto del tema */}
      <g transform="translate(10, 15)">
        <path
          d="M30 0H40V70H30V0Z M0 30H70V40H0V30Z"
          fill="currentColor"
          className="text-blue-600 dark:text-blue-400"
        />
        <circle cx="35" cy="5" fill="#00D4FF" r="6" />
        <circle cx="35" cy="65" fill="#00D4FF" r="6" />
        <circle cx="5" cy="35" fill="#00D4FF" r="6" />
        <circle cx="65" cy="35" fill="#00D4FF" r="6" />
      </g>

      {/* Texto: Hereda la fuente y color del sistema */}
      <text
        fill="currentColor"
        fontFamily="inherit"
        fontSize="48"
        fontWeight="bold"
        x="100"
        y="70"
        className="text-gray-800 dark:text-gray-100"
      >
        HIS
        <tspan dy="-18" fill="#00D4FF" fontSize="24">
          SYSTEM
        </tspan>
      </text>

      {/* Línea inferior */}
      <rect fill="#00D4FF" height="4" rx="2" width="200" x="100" y="82" />
    </svg>
  );
}

export default LogoHIS;