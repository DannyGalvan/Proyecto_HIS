import type { InitialAuth } from "../types/InitialAuth";
import type { UserRequest } from "../types/UserRequest";

export const URL_BASE = "";
export const API_URL = `${URL_BASE}/api/v1/`;

export const invalid_type_error = "El tipo provisto es invalido";
export const required_error = "El campo es requerido";

export const nameRoutes = {
  login: "/auth",
  changePassword: "/change-password",
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
  // Appointments
  appointment: "/appointment",
  appointmentCreate: "/appointment/create",
  appointmentUpdate: "/appointment/update",
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
  // Recepción
  reception: "/reception",
  // Caja
  cashier: "/cashier",
  // Registro externo
  register: "/register",
  // Portal público
  portal: "/portal",
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
};
