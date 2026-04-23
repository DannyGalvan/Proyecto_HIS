import { Button } from "@heroui/react";
import { useCallback } from "react";
import { LogoHIS } from "../../components/brand/LogoHIS";

// ── Sección Hero ──────────────────────────────────────────────────────────────
export function HeroSection({
  onSchedule,
}: {
  readonly onSchedule: () => void;
}) {
  const handleScrollToServices = useCallback(() => {
    document
      .getElementById("servicios")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section className="relative bg-linear-to-br from-blue-700 via-blue-800 to-cyan-600 dark:from-blue-900 dark:via-blue-800 dark:to-cyan-700 text-white py-20 px-6 overflow-hidden">
      {/* Patrón de cruces médicas decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='15' y='5' width='10' height='30' rx='2' fill='white'/%3E%3Crect x='5' y='15' width='30' height='10' rx='2' fill='white'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="flex justify-center mb-6">
          <LogoHIS className="h-16 w-auto" height="auto" width="180px" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Sistema Informático Hospitalario
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Atención médica de calidad al alcance de todos. Agende su cita en
          línea de forma rápida y segura.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="px-8 py-3 text-lg font-bold bg-white text-blue-900 hover:bg-blue-50"
            size="lg"
            onPress={onSchedule}
          >
            <i className="bi bi-calendar-plus mr-2" />
            Agendar Cita
          </Button>
          <Button
            className="px-8 py-3 text-lg font-bold border-2 border-white text-white hover:bg-green-600/60"
            size="lg"
            onPress={handleScrollToServices}
          >
            <i className="bi bi-info-circle mr-2" />
            Ver Servicios
          </Button>
        </div>
      </div>
    </section>
  );
}
