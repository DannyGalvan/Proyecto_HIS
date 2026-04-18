import { Button } from "@heroui/react";
import { useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicSpecialties, getPublicBranches, verifyDpi } from "../../services/patientPortalService";
import { nameRoutes } from "../../configs/constants";
import { LogoHIS } from "../../components/brand/LogoHIS";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";

// ── Sección Hero ──────────────────────────────────────────────────────────────
function HeroSection({ onSchedule }: { readonly onSchedule: () => void }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-cyan-600 dark:from-blue-900 dark:via-blue-800 dark:to-cyan-700 text-white py-20 px-6 overflow-hidden">
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
          Atención médica de calidad al alcance de todos. Agende su cita en línea de forma rápida y segura.
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
            className="px-8 py-3 text-lg font-bold border-2 border-white text-white hover:bg-white/10"
            size="lg"
            variant="secondary"
            onPress={() => document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth" })}
          >
            <i className="bi bi-info-circle mr-2" />
            Ver Servicios
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Tarjeta de especialidad ───────────────────────────────────────────────────
function SpecialtyCard({ specialty }: { readonly specialty: { id: number; name: string; description?: string | null } }) {
  const icons: Record<string, string> = {
    "Cardiología": "bi-heart-pulse",
    "Pediatría": "bi-person-hearts",
    "Neurología": "bi-brain",
    "Ortopedia": "bi-bandaid",
    "Ginecología": "bi-gender-female",
    "Dermatología": "bi-droplet",
    "Oftalmología": "bi-eye",
    "Medicina General": "bi-clipboard2-pulse",
  };
  const icon = icons[specialty.name] ?? "bi-hospital";

  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
        <i className={`bi ${icon} text-2xl text-blue-600 dark:text-blue-400`} />
      </div>
      <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{specialty.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{specialty.description}</p>
    </div>
  );
}

// ── Tarjeta de sucursal ───────────────────────────────────────────────────────
function BranchCard({ branch }: { readonly branch: { id: number; name: string; address?: string | null; phone?: string | null; description?: string | null } }) {
  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
          <i className="bi bi-geo-alt-fill text-xl text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{branch.name}</h3>
          {branch.address && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <i className="bi bi-map" /> {branch.address}
            </p>
          )}
          {branch.phone && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <i className="bi bi-telephone" /> {branch.phone}
            </p>
          )}
          {branch.description && (
            <p className="text-sm text-gray-400 mt-2">{branch.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal de verificación de DPI ─────────────────────────────────────────────
function DpiVerificationModal({
  isOpen,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}) {
  const [dpi, setDpi] = useState("");
  const [dpiError, setDpiError] = useState("");
  const [internalUserMsg, setInternalUserMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setDpiError("");
      setInternalUserMsg("");

      if (!dpi.trim()) {
        setDpiError("El campo DPI es obligatorio. Por favor, ingrese su número de DPI.");
        return;
      }
      if (!/^\d{13}$/.test(dpi.trim())) {
        setDpiError(`El DPI debe contener exactamente 13 dígitos. Usted ingresó ${dpi.trim().length} dígitos.`);
        return;
      }

      setIsVerifying(true);
      try {
        const response = await verifyDpi(dpi.trim());
        if (response.success) {
          const { exists, hasPatientRole } = response.data;
          if (exists && hasPatientRole) {
            onClose();
            navigate(nameRoutes.portalLogin);
          } else if (!exists) {
            setDpiError(
              "No se encontró un registro asociado a este DPI. Será redirigido al formulario de registro.",
            );
            setTimeout(() => {
              onClose();
              navigate(nameRoutes.portalRegister);
            }, 5000);
          } else {
            // exists=true but hasPatientRole=false → internal user
            setInternalUserMsg(
              "Este DPI pertenece a un usuario del sistema interno. Por favor, contacte a recepción.",
            );
          }
        } else {
          setDpiError(response.message ?? "Error al verificar el DPI. Intente de nuevo.");
        }
      } catch {
        setDpiError("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
      } finally {
        setIsVerifying(false);
      }
    },
    [dpi, navigate, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            <i className="bi bi-person-badge mr-2 text-blue-600" />
            Verificar Registro
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            onClick={onClose}
          >
            <i className="bi bi-x-lg text-xl" />
          </button>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Ingrese su número de DPI para verificar si está registrado en el sistema.
        </p>

        {internalUserMsg && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-sm flex items-start gap-2">
            <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
            <span>{internalUserMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              Número de DPI *
            </label>
            <input
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-widest ${
                dpiError
                  ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              }`}
              maxLength={13}
              placeholder="0000000000000"
              type="text"
              value={dpi}
              onChange={(e) => {
                setDpi(e.target.value.replace(/\D/g, ""));
                setDpiError("");
                setInternalUserMsg("");
              }}
            />
            {dpiError && (
              <p className="text-red-500 text-sm mt-1">
                <i className="bi bi-exclamation-circle mr-1" />
                {dpiError}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {dpi.length}/13 dígitos
            </p>
          </div>

          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={isVerifying}
            type="submit"
          >
            {isVerifying ? (
              <>
                <i className="bi bi-hourglass-split animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <i className="bi bi-search" />
                Verificar DPI
              </>
            )}
          </button>

          <button
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Página principal del portal ───────────────────────────────────────────────
export function PortalPage() {
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

  const handleScheduleClick = useCallback(() => {
    setIsDpiModalOpen(true);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <HeroSection onSchedule={handleScheduleClick} />

      {/* Servicios / Especialidades */}
      <section id="servicios" className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            Nuestras Especialidades
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Contamos con médicos especializados en diversas áreas para brindarle la mejor atención.
          </p>
        </div>

          {loadingSpecialties ? (
            <LoadingComponent />
          ) : specialties.length === 0 ? (
            <p className="text-center text-gray-400">No hay especialidades disponibles en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {specialties.map((s) => (
                <SpecialtyCard key={s.id} specialty={s} />
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
            <p className="text-center text-gray-400">No hay sedes disponibles en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branches.map((b) => (
                <BranchCard key={b.id} branch={b} />
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
              { icon: "bi-sun", title: "Lunes a Viernes", hours: "7:00 AM – 7:00 PM", color: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300" },
              { icon: "bi-calendar-week", title: "Sábados", hours: "8:00 AM – 2:00 PM", color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" },
              { icon: "bi-alarm", title: "Emergencias", hours: "24 horas / 7 días", color: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300" },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl border p-6 text-center ${item.color}`}>
                <i className={`bi ${item.icon} text-3xl block mb-3`} />
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="font-semibold text-xl">{item.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-900 dark:to-cyan-800 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para agendar su cita?</h2>
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
            onPress={() => navigate(nameRoutes.portalRegister)}
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
          Sistema Informático Hospitalario (HIS) — Todos los derechos reservados.
        </p>
        <p>
          Este es un sistema automático. Para consultas, comuníquese al teléfono{" "}
          <span className="text-gray-900 dark:text-gray-100 font-semibold">+502 2222-3333</span>.
        </p>
      </footer>

      {/* Modal de verificación DPI */}
      <DpiVerificationModal
        isOpen={isDpiModalOpen}
        onClose={() => setIsDpiModalOpen(false)}
      />
    </div>
  );
}

// Export lazy para react-router
export function Component() {
  return <PortalPage />;
}
Component.displayName = "PortalPage";
