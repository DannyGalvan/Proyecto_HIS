import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { DpiVerificationModal } from "../../components/modal/DpiVerificationModal";
import { BranchPortalCard } from "../../components/pure/BranchPortalCard";
import { SpecialtyPortalCard } from "../../components/pure/SpecialyPortalCard";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { nameRoutes } from "../../configs/constants";
import {
  getPublicBranches,
  getPublicSpecialties,
} from "../../services/patientPortalService";
import { HeroSection } from "./HeroSection";

// ── Página principal del portal ───────────────────────────────────────────────
export function Component() {
  const [isDpiModalOpen, setIsDpiModalOpen] = useState(false);
  const navigate = useNavigate();

  // Cargar especialidades activas
  const { data: specialtiesData, isLoading: loadingSpecialties } = useQuery({
    queryKey: ["portal-specialties"],
    queryFn: () => getPublicSpecialties(),
    staleTime: 1000 * 60 * 10,
  });

  // Cargar sucursales activas
  const { data: branchesData, isLoading: loadingBranches } = useQuery({
    queryKey: ["portal-branches"],
    queryFn: () => getPublicBranches(),
    staleTime: 1000 * 60 * 10,
  });

  const specialties = specialtiesData?.success ? specialtiesData.data : [];
  const branches = branchesData?.success ? branchesData.data : [];

  const handleCloseDpiModal = useCallback(() => setIsDpiModalOpen(false), []);

  const handleNavigateRegister = useCallback(
    () => navigate(nameRoutes.portalRegister),
    [navigate],
  );

  const handleScheduleClick = useCallback(() => {
    setIsDpiModalOpen(true);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <HeroSection onSchedule={handleScheduleClick} />

      {/* Servicios / Especialidades */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800" id="servicios">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              Nuestras Especialidades
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Contamos con médicos especializados en diversas áreas para
              brindarle la mejor atención.
            </p>
          </div>

          {loadingSpecialties ? (
            <LoadingComponent />
          ) : specialties.length === 0 ? (
            <p className="text-center text-gray-400">
              No hay especialidades disponibles en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {specialties.map((s) => (
                <SpecialtyPortalCard key={s.id} specialty={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sucursales */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              Nuestras Sedes
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Encuentre la sede más cercana a usted y agende su cita.
            </p>
          </div>

          {loadingBranches ? (
            <LoadingComponent />
          ) : branches.length === 0 ? (
            <p className="text-center text-gray-400">
              No hay sedes disponibles en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branches.map((b) => (
                <BranchPortalCard key={b.id} branch={b} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Horarios de atención */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              Horarios de Atención
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "bi-sun",
                title: "Lunes a Viernes",
                hours: "7:00 AM – 7:00 PM",
                color:
                  "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
              },
              {
                icon: "bi-calendar-week",
                title: "Sábados",
                hours: "8:00 AM – 2:00 PM",
                color:
                  "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
              },
              {
                icon: "bi-alarm",
                title: "Emergencias",
                hours: "24 horas / 7 días",
                color:
                  "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border p-6 text-center ${item.color}`}
              >
                <i className={`bi ${item.icon} text-3xl block mb-3`} />
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="font-semibold text-xl">{item.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 bg-linear-to-r from-blue-700 to-cyan-600 dark:from-blue-900 dark:to-cyan-800 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para agendar su cita?
        </h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          El proceso es rápido y sencillo. Solo necesita su DPI y unos minutos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="px-8 py-3 text-lg font-bold bg-white text-blue-900 hover:bg-blue-50"
            size="lg"
            onPress={handleScheduleClick}
          >
            <i className="bi bi-calendar-plus mr-2" />
            Agendar Cita Ahora
          </Button>
          <Button
            className="px-8 py-3 text-lg font-bold border-2 border-white text-white hover:bg-white/10"
            size="lg"
            variant="secondary"
            onPress={handleNavigateRegister}
          >
            <i className="bi bi-person-plus mr-2" />
            Registrarse
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 py-8 px-6 text-center text-sm">
        <p className="mb-2">
          <i className="bi bi-hospital mr-2" />
          Sistema Informático Hospitalario (HIS) — Todos los derechos
          reservados.
        </p>
        <p>
          Este es un sistema automático. Para consultas, comuníquese al teléfono{" "}
          <span className="text-gray-900 dark:text-gray-100 font-semibold">
            +502 2222-3333
          </span>
          .
        </p>
      </footer>

      {/* Modal de verificación DPI */}
      <DpiVerificationModal
        isOpen={isDpiModalOpen}
        onClose={handleCloseDpiModal}
      />
    </div>
  );
}

Component.displayName = "PortalPage";
