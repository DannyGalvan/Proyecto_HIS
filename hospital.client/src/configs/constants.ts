import type { CreateFormState } from "../components/appointmentForm/EditForm";
import type { InitialAuth } from "../types/InitialAuth";
import type { UserRequest } from "../types/UserRequest";

export const URL_BASE = "";
export const API_URL = `${URL_BASE}/api/v1/`;

export const invalid_type_error = "El tipo provisto es invalido";
export const required_error = "El campo es requerido";

// Constants
export const CONSULTATION_FEE = 150.0;

export const DEFAULT_BRANCH_ID = 1;

// ─── Step labels ─────────────────────────────────────────────────────────────

export const STEP_LABELS = [
  "Especialidad y Sucursal",
  "Médico y Fecha",
  "Motivo y Documento",
  "Confirmación",
];

export const nameRoutes = {
  login: "/auth",
  changePassword: "/change-password",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  settings: "/change-password",
  root: "/",
  notFound: "*",
  forbidden: "/forbidden",
  unauthorized: "/unauthorized",
  error: "/error",
  create: "create",
  // Users
  user: "/user",
  userCreate: "/user/create",
  userUpdate: "/user/update",
  // Roles
  rol: "/rol",
  rolCreate: "/rol/create",
  rolUpdate: "/rol/update",
  // Specialties
  specialty: "/specialty",
  specialtyCreate: "/specialty/create",
  specialtyUpdate: "/specialty/update",
  // Branches
  branch: "/branch",
  branchCreate: "/branch/create",
  branchUpdate: "/branch/update",
  // Branch-Specialty assignments
  branchSpecialty: "/branch-specialty",
  branchSpecialtyCreate: "/branch-specialty/create",
  // Appointments
  appointment: "/appointment",
  appointmentCreate: "/appointment/create",
  appointmentUpdate: "/appointment/update",
  appointmentView: "/appointment/view",
  // Vital Signs
  vitalSign: "/vital-sign",
  vitalSignCreate: "/vital-sign/create",
  vitalSignUpdate: "/vital-sign/update",
  // Medical Consultations
  medicalConsultation: "/medical-consultation",
  medicalConsultationCreate: "/medical-consultation/create",
  medicalConsultationUpdate: "/medical-consultation/update",
  // Laboratories
  laboratory: "/laboratory",
  laboratoryCreate: "/laboratory/create",
  laboratoryUpdate: "/laboratory/update",
  // Lab Exams
  labExam: "/lab-exam",
  labExamCreate: "/lab-exam/create",
  labExamUpdate: "/lab-exam/update",
  // Lab Orders
  labOrder: "/lab-order",
  labOrderCreate: "/lab-order/create",
  labOrderDetail: "/lab-order",
  // Medicines
  medicine: "/medicine",
  medicineCreate: "/medicine/create",
  medicineUpdate: "/medicine/update",
  // Payments
  payment: "/payment",
  // Notifications
  notificationLog: "/notification-log",
  // AppointmentStatus
  appointmentStatus: "/appointment-status",
  appointmentStatusCreate: "/appointment-status/create",
  appointmentStatusUpdate: "/appointment-status/update",
  // MedicineInventory
  medicineInventory: "/medicine-inventory",
  medicineInventoryCreate: "/medicine-inventory/create",
  medicineInventoryUpdate: "/medicine-inventory/update",
  // Prescription
  prescription: "/prescription",
  prescriptionDetail: "/prescription",
  // Dashboard médico/enfermero
  doctorDashboard: "/dashboard",
  // Dashboard rol interino (enfermero de signos vitales)
  nurseDashboard: "/nurse-dashboard",
  // Recepción
  reception: "/reception",
  // Caja
  cashier: "/cashier",
  // Pago en línea
  onlinePayment: "/payment/online",
  // Dispense
  dispense: "/dispense",
  dispenseCreate: "/dispense/create",
  // InventoryMovement
  inventoryMovement: "/inventory-movement",
  inventoryMovementCreate: "/inventory-movement/create",
  // Admin
  doctorManagement: "/doctor-management",
  doctorTransfer: "/doctor-transfer",
  adminDashboard: "/admin-dashboard",
  appointmentReassign: "/appointment/reassign",
  // Doctor Calendar
  doctorCalendar: "/doctor-calendar",
  // Registro externo
  register: "/register",
  // Portal del paciente
  portalHome: "/portal",
  portalLogin: "/portal/login",
  portalRegister: "/portal/register",
  portalDashboard: "/portal/dashboard",
  portalBook: "/portal/book",
  portalPay: "/portal/book/pay",
  portalConfirm: "/portal/book/confirm",
  portalAppointments: "/portal/appointments",
  portalProfile: "/portal/profile",
  portalChangePassword: "/portal/change-password",
  portalForgotPassword: "/portal/forgot-password",
  portalResetPassword: "/portal/reset-password",
};

export const authInitialState: InitialAuth = {
  isLoggedIn: false,
  redirect: false,
  email: "",
  token: "",
  userName: "",
  name: "",
  userId: 0,
  operations: [],
  timezoneIanaId: "America/Guatemala",
};

export const PAGINATION_OPTIONS = {
  rowsPerPageText: "Elementos Por página",
  rangeSeparatorText: "de",
  selectAllRowsItem: false,
  selectAllRowsItemText: "Todos",
};

export const SELECTED_MESSAGE = {
  singular: "Elemento",
  plural: "Elementos",
  message: "Seleccionado(s)",
};

export const initialUser: UserRequest = {
  id: null,
  rolId: null,
  email: null,
  name: null,
  userName: null,
  password: null,
  identificationDocument: null,
  number: null,
  nit: null,
  branchId: null,
  insuranceNumber: null,
  state: null,
  createdBy: null,
  updatedBy: null,
  timezoneId: null,
};

/**
 * IDs de roles con comportamiento especial en el frontend.
 * Coinciden con los seedeados por HasData en RolConfiguration.cs.
 * Solo usar para lógica condicional de UI (ej: mostrar campo Especialidad
 * solo si rolId === MEDICO_ROL_ID); la autorización real se valida en backend.
 */
export const MEDICO_ROL_ID = 3;

export const SPECIALTY_ICONS: Record<string, string> = {
  Cardiologia: "bi-heart-pulse",
  Pediatria: "bi-person-hearts",
  Neurologia: "bi-brain",
  Ortopedia: "bi-bandaid",
  Ginecologia: "bi-gender-female",
  Dermatologia: "bi-droplet",
  Oftalmologia: "bi-eye",
  "Medicina General": "bi-clipboard2-pulse",
};

export const TOTAL_APPOINTMENT_STEPS = 6;

export const initialCreateState: CreateFormState = {
  specialtyId: null,
  specialtyLabel: "",
  branchId: null,
  branchLabel: "",
  doctorId: null,
  doctorLabel: "",
  appointmentDate: "",
  reason: "",
  document: null,
  documentError: null,
};

export const STATUS_EN_ESPERA = 4;
export const STATUS_CONSULTA = 5;
export const STATUS_EVALUADO = 6;
export const STATUS_PACIENTE_PRESENTE = 12;
export const STATUS_SIGNOS = 3;
