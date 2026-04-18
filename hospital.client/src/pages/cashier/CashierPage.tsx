import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointments } from "../../services/appointmentService";
import { createPayment } from "../../services/paymentService";
import type { AppointmentResponse } from "../../types/AppointmentResponse";
import type { PaymentRequest, PaymentResponse } from "../../types/PaymentResponse";
import { OptionsSelect } from "../../components/select/OptionsSelect";
import { PaymentReceipt } from "../../components/shared/PaymentReceipt";
import { generateIdempotencyKey } from "../../utils/generateIdempotencyKey";
import { calculateChange } from "../../utils/calculateChange";

const PAYMENT_METHODS = [
  { label: "Efectivo (Q)", value: "0" },
  { label: "Visa", value: "1" },
  { label: "Mastercard", value: "2" },
  { label: "Débito", value: "3" },
];

export function CashierPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"dpi" | "id">("dpi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<number>(0);
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [cardLastFour, setCardLastFour] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState<{ payment: PaymentResponse; change: number } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cashier-search", searchQuery, searchType],
    queryFn: () => {
      if (!searchQuery) return Promise.resolve({ success: true as const, data: [], message: "", totalResults: 0 });
      const filter = searchType === "dpi"
        ? `Patient.IdentificationDocument:eq:${searchQuery} AND AppointmentStatus.Name:eq:Pendiente`
        : `Id:eq:${searchQuery} AND AppointmentStatus.Name:eq:Pendiente`;
      return getAppointments({
        pageNumber: 1,
        pageSize: 20,
        filters: `${filter} AND State:eq:1`,
        include: "Specialty,Branch,AppointmentStatus,Patient",
        includeTotal: false,
      });
    },
    enabled: !!searchQuery,
  });

  const paymentMutation = useMutation({
    mutationFn: (paymentData: PaymentRequest) => createPayment(paymentData),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const payment = response.data as PaymentResponse;
        const change = paymentMethod === 0
          ? Math.max(0, calculateChange(Number(amountReceived), selectedAppointment?.amount ?? 0))
          : 0;
        setPaymentSuccess({ payment, change });
        const patientName = selectedAppointment?.patient?.name ?? "Paciente";
        toast.success(`¡Pago registrado exitosamente! Paciente: ${patientName}. La cita ha sido actualizada a estado "Pagada".`);
        queryClient.invalidateQueries({ queryKey: ["cashier-search"] });
      } else {
        const msg = response.message ?? "";
        if (msg.toLowerCase().includes("rechaz") || msg.toLowerCase().includes("declined")) {
          toast.danger("La transacción con tarjeta fue rechazada por el banco. Solicite al paciente otro método de pago.");
        } else {
          toast.danger(`Error al procesar el pago: ${msg || "Intente nuevamente."}`);
        }
      }
    },
    onError: () => toast.danger("Error de comunicación con el sistema de pagos. Intente nuevamente."),
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) { toast.danger("Ingrese un número de cita o DPI para buscar"); return; }
    setSearchQuery(searchValue.trim());
    setSelectedAppointment(null);
    setPaymentSuccess(null);
  }, [searchValue]);

  const handleSelectAppointment = useCallback((appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setPaymentSuccess(null);
    setAmountReceived(String(appointment.amount));
  }, []);

  const handlePay = useCallback(() => {
    if (!selectedAppointment) return;

    if (paymentMethod === 0) {
      const received = Number(amountReceived);
      if (received < selectedAppointment.amount) {
        toast.danger(`El monto recibido (Q${received}) es menor al monto a cobrar (Q${selectedAppointment.amount})`);
        return;
      }
    }

    if ((paymentMethod === 1 || paymentMethod === 2 || paymentMethod === 3) && cardLastFour.length !== 4) {
      toast.danger("Ingrese los últimos 4 dígitos de la tarjeta");
      return;
    }

    const paymentData: PaymentRequest = {
      appointmentId: selectedAppointment.id,
      amount: selectedAppointment.amount,
      paymentMethod,
      paymentType: 0, // Consulta
      paymentStatus: 1, // Completado
      paymentDate: new Date().toISOString(),
      idempotencyKey: generateIdempotencyKey(),
      amountReceived: paymentMethod === 0 ? Number(amountReceived) : null,
      changeAmount: paymentMethod === 0 ? Math.max(0, calculateChange(Number(amountReceived), selectedAppointment.amount)) : null,
      cardLastFourDigits: paymentMethod !== 0 ? cardLastFour : null,
      state: 1,
    };

    paymentMutation.mutate(paymentData);
  }, [selectedAppointment, paymentMethod, amountReceived, cardLastFour, paymentMutation]);

  const appointments = data?.success ? data.data : [];
  const change = paymentMethod === 0 && selectedAppointment
    ? Math.max(0, calculateChange(Number(amountReceived), selectedAppointment.amount))
    : 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Cobro de Consulta en Caja</h1>
      <p className="text-gray-500 text-sm mb-6">Busque citas con estado "Pendiente de pago" para procesar el cobro.</p>

      {/* Buscador */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
        <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSearch}>
          <div className="flex gap-2">
            <button type="button"
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${searchType === "dpi" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
              onClick={() => setSearchType("dpi")}>Por DPI</button>
            <button type="button"
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${searchType === "id" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
              onClick={() => setSearchType("id")}>Por No. Cita</button>
          </div>
          <input
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={searchType === "dpi" ? "DPI del paciente (13 dígitos)" : "Número de cita"}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Button type="submit" variant="primary" className="px-6">
            <i className="bi bi-search mr-2" /> Buscar
          </Button>
        </form>
      </div>

      {isLoading && <LoadingComponent />}

      {/* Lista de citas pendientes */}
      {!isLoading && appointments.length > 0 && !selectedAppointment && (
        <div className="space-y-3 mb-6">
          <h2 className="font-bold text-lg">Citas Pendientes de Pago</h2>
          {appointments.map((appointment) => (
            <div key={appointment.id}
              className="border rounded-xl p-4 bg-yellow-50 border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => handleSelectAppointment(appointment)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{appointment.patient?.name ?? `Paciente #${appointment.patientId}`}</p>
                  <p className="text-sm text-gray-600">Cita #{appointment.id} · {appointment.specialty?.name} · {appointment.appointmentDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-700">Q{appointment.amount?.toFixed(2)}</p>
                  <Button size="sm" variant="primary">Cobrar</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && searchQuery && appointments.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <i className="bi bi-cash-coin text-4xl block mb-3" />
          <p>No se encontraron citas pendientes de pago para los datos ingresados. Verifique el DPI o número de cita e intente de nuevo.</p>
        </div>
      )}

      {/* Formulario de cobro */}
      {selectedAppointment && !paymentSuccess && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">Cobro de Consulta</h2>
              <p className="text-gray-500 text-sm">Cita #{selectedAppointment.id}</p>
            </div>
            <Button size="sm" variant="secondary" onPress={() => setSelectedAppointment(null)}>
              <i className="bi bi-arrow-left mr-1" /> Cambiar cita
            </Button>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-semibold">Paciente:</span> {selectedAppointment.patient?.name}</div>
              <div><span className="font-semibold">Especialidad:</span> {selectedAppointment.specialty?.name}</div>
              <div><span className="font-semibold">Sucursal:</span> {selectedAppointment.branch?.name}</div>
              <div><span className="font-semibold">Fecha:</span> {selectedAppointment.appointmentDate}</div>
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <span className="font-bold text-lg">Total a Cobrar:</span>
              <span className="text-3xl font-bold text-green-700">Q{selectedAppointment.amount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="mb-4">
            <OptionsSelect
              isRequired
              defaultValue={{ label: "Efectivo (Q)", value: "0" }}
              label="Método de Pago"
              name="paymentMethod"
              options={PAYMENT_METHODS}
              placeholder="Seleccione método de pago"
              onChange={(v) => {
                const val = v && !Array.isArray(v) && "value" in v ? Number((v as { value: string }).value) : 0;
                setPaymentMethod(val);
              }}
            />
          </div>

          {/* Efectivo */}
          {paymentMethod === 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-1">Monto Recibido (Q)</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  min={selectedAppointment.amount}
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className={`p-3 rounded-lg text-center ${change >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <p className="text-sm font-semibold text-gray-600">Cambio a Devolver</p>
                  <p className={`text-2xl font-bold ${change >= 0 ? "text-green-700" : "text-red-600"}`}>
                    Q{change.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta */}
          {paymentMethod !== 0 && (
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Últimos 4 dígitos de la tarjeta</label>
              <input
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                maxLength={4}
                placeholder="XXXX"
                value={cardLastFour}
                onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          )}

          <Button
            className="w-full py-3 text-lg font-bold"
            variant="primary"
            isDisabled={paymentMutation.isPending}
            onPress={handlePay}
          >
            {paymentMutation.isPending ? (
              <><i className="bi bi-hourglass-split mr-2 animate-spin" /> Procesando...</>
            ) : (
              <><i className="bi bi-check-circle mr-2" /> Confirmar Pago Q{selectedAppointment.amount?.toFixed(2)}</>
            )}
          </Button>
        </div>
      )}

      {/* Comprobante de pago */}
      {paymentSuccess && selectedAppointment && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-8 text-center">
          <i className="bi bi-check-circle-fill text-green-600 text-5xl block mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">¡Pago Registrado Exitosamente!</h2>
          <p className="text-green-700 mb-6">La cita ha sido actualizada a estado "Pagada".</p>

          <PaymentReceipt
            payment={paymentSuccess.payment}
            patientName={selectedAppointment.patient?.name ?? `Paciente #${selectedAppointment.patientId}`}
            serviceDetail={`${selectedAppointment.specialty?.name ?? "Consulta"} — Cita #${selectedAppointment.id}`}
            branchName={selectedAppointment.branch?.name ?? "—"}
          />

          <div className="flex gap-3 justify-center mt-6">
            <Button variant="secondary" onPress={() => {
              setSelectedAppointment(null);
              setPaymentSuccess(null);
              setSearchValue("");
              setSearchQuery("");
            }}>
              <i className="bi bi-arrow-repeat mr-2" /> Nuevo Cobro
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
