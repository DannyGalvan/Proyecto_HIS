import type { RouteObject } from "react-router";

import { nameRoutes } from "../configs/constants";
import LoadingPage from "../pages/public/LoadingPage";
import ProtectedPublic from "./middlewares/ProtectedPublic";

// Auth pages
import { CreateRolPage } from "../pages/rol/CreateRolPage";
import { RolPage } from "../pages/rol/RolPage";
import { UpdateRolPage } from "../pages/rol/UpdateRolPage";
import { CreateUserPage } from "../pages/user/CreateUserPage";
import { UpdateUserPage } from "../pages/user/UpdateUserPage";
import { UserPage } from "../pages/user/UserPage";

// Specialty pages
import { SpecialtyPage } from "../pages/specialty/SpecialtyPage";
import { CreateSpecialtyPage } from "../pages/specialty/CreateSpecialtyPage";
import { UpdateSpecialtyPage } from "../pages/specialty/UpdateSpecialtyPage";

// Branch pages
import { BranchPage } from "../pages/branch/BranchPage";
import { CreateBranchPage } from "../pages/branch/CreateBranchPage";
import { UpdateBranchPage } from "../pages/branch/UpdateBranchPage";

// Appointment pages
import { AppointmentPage } from "../pages/appointment/AppointmentPage";
import { CreateAppointmentPage } from "../pages/appointment/CreateAppointmentPage";
import { UpdateAppointmentPage } from "../pages/appointment/UpdateAppointmentPage";

// Vital Sign pages
import { VitalSignPage } from "../pages/vital-sign/VitalSignPage";
import { CreateVitalSignPage } from "../pages/vital-sign/CreateVitalSignPage";
import { UpdateVitalSignPage } from "../pages/vital-sign/UpdateVitalSignPage";

// Medical Consultation pages
import { MedicalConsultationPage } from "../pages/medical-consultation/MedicalConsultationPage";
import { CreateMedicalConsultationPage } from "../pages/medical-consultation/CreateMedicalConsultationPage";
import { UpdateMedicalConsultationPage } from "../pages/medical-consultation/UpdateMedicalConsultationPage";

// Laboratory pages
import { LaboratoryPage } from "../pages/laboratory/LaboratoryPage";
import { CreateLaboratoryPage } from "../pages/laboratory/CreateLaboratoryPage";
import { UpdateLaboratoryPage } from "../pages/laboratory/UpdateLaboratoryPage";

// Lab Exam pages
import { LabExamPage } from "../pages/lab-exam/LabExamPage";
import { CreateLabExamPage } from "../pages/lab-exam/CreateLabExamPage";
import { UpdateLabExamPage } from "../pages/lab-exam/UpdateLabExamPage";

// Lab Order pages
import { LabOrderPage } from "../pages/lab-order/LabOrderPage";
import { CreateLabOrderPage } from "../pages/lab-order/CreateLabOrderPage";
import { LabOrderDetailPage } from "../pages/lab-order/LabOrderDetailPage";

// Medicine pages
import { MedicinePage } from "../pages/medicine/MedicinePage";
import { CreateMedicinePage } from "../pages/medicine/CreateMedicinePage";
import { UpdateMedicinePage } from "../pages/medicine/UpdateMedicinePage";

// Payment pages
import { PaymentPage } from "../pages/payment/PaymentPage";

// Notification pages
import { NotificationLogPage } from "../pages/notification/NotificationLogPage";

// AppointmentStatus pages
import { AppointmentStatusPage } from "../pages/appointment-status/AppointmentStatusPage";
import { CreateAppointmentStatusPage } from "../pages/appointment-status/CreateAppointmentStatusPage";
import { UpdateAppointmentStatusPage } from "../pages/appointment-status/UpdateAppointmentStatusPage";

// MedicineInventory pages
import { MedicineInventoryPage } from "../pages/medicine-inventory/MedicineInventoryPage";
import { CreateMedicineInventoryPage } from "../pages/medicine-inventory/CreateMedicineInventoryPage";
import { UpdateMedicineInventoryPage } from "../pages/medicine-inventory/UpdateMedicineInventoryPage";

// Prescription pages
import { PrescriptionPage } from "../pages/prescription/PrescriptionPage";
import { PrescriptionDetailPage } from "../pages/prescription/PrescriptionDetailPage";

// Dashboard
import { DoctorDashboardPage } from "../pages/dashboard/DoctorDashboardPage";

// Reception & Cashier
import { ReceptionPage } from "../pages/reception/ReceptionPage";
import { CashierPage } from "../pages/cashier/CashierPage";

// Online Payment
import { OnlinePaymentPage } from "../pages/payment/OnlinePaymentPage";

// Rol Operation pages
import { RolOperationPage } from "../pages/rol/RolOperationPage";

// Dispense pages
import { DispensePage } from "../pages/dispense/DispensePage";
import { CreateDispensePage } from "../pages/dispense/CreateDispensePage";

// Middlewares
// PublicOnly is available for future use

export const PublicRoutes: RouteObject[] = [
  {
    path: nameRoutes.login,
    lazy: () => import("../pages/auth/LoginPage"),
    hydrateFallbackElement: <LoadingPage />,
  },
  {
    path: nameRoutes.changePassword,
    lazy: () => import("../pages/auth/ChangePasswordPage"),
    hydrateFallbackElement: <LoadingPage />,
  },
  {
    path: nameRoutes.register,
    lazy: () => import("../pages/public/RegisterPage"),
    hydrateFallbackElement: <LoadingPage />,
  },
  // Portal público — manejado por PortalLayout + PortalRoutes en useAuthorizationRoutes
  {
    index: true,
    element: (
      <ProtectedPublic>
        <DoctorDashboardPage />
      </ProtectedPublic>
    ),
  },
  // Users
  {
    path: nameRoutes.user,
    element: <ProtectedPublic><UserPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.userCreate,
    element: <ProtectedPublic><CreateUserPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.userUpdate}/:id`,
    element: <ProtectedPublic><UpdateUserPage /></ProtectedPublic>,
  },
  // Roles
  {
    path: nameRoutes.rol,
    element: <ProtectedPublic><RolPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.rolCreate,
    element: <ProtectedPublic><CreateRolPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.rolUpdate}/:id`,
    element: <ProtectedPublic><UpdateRolPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.rolOperations}/:id/operations`,
    element: <ProtectedPublic><RolOperationPage /></ProtectedPublic>,
  },
  // Specialties
  {
    path: nameRoutes.specialty,
    element: <ProtectedPublic><SpecialtyPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.specialtyCreate,
    element: <ProtectedPublic><CreateSpecialtyPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.specialtyUpdate}/:id`,
    element: <ProtectedPublic><UpdateSpecialtyPage /></ProtectedPublic>,
  },
  // Branches
  {
    path: nameRoutes.branch,
    element: <ProtectedPublic><BranchPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.branchCreate,
    element: <ProtectedPublic><CreateBranchPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.branchUpdate}/:id`,
    element: <ProtectedPublic><UpdateBranchPage /></ProtectedPublic>,
  },
  // Appointments
  {
    path: nameRoutes.appointment,
    element: <ProtectedPublic><AppointmentPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.appointmentCreate,
    element: <ProtectedPublic><CreateAppointmentPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.appointmentUpdate}/:id`,
    element: <ProtectedPublic><UpdateAppointmentPage /></ProtectedPublic>,
  },
  // Vital Signs
  {
    path: nameRoutes.vitalSign,
    element: <ProtectedPublic><VitalSignPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.vitalSignCreate,
    element: <ProtectedPublic><CreateVitalSignPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.vitalSignUpdate}/:id`,
    element: <ProtectedPublic><UpdateVitalSignPage /></ProtectedPublic>,
  },
  // Medical Consultations
  {
    path: nameRoutes.medicalConsultation,
    element: <ProtectedPublic><MedicalConsultationPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.medicalConsultationCreate,
    element: <ProtectedPublic><CreateMedicalConsultationPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.medicalConsultationUpdate}/:id`,
    element: <ProtectedPublic><UpdateMedicalConsultationPage /></ProtectedPublic>,
  },
  // Laboratories
  {
    path: nameRoutes.laboratory,
    element: <ProtectedPublic><LaboratoryPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.laboratoryCreate,
    element: <ProtectedPublic><CreateLaboratoryPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.laboratoryUpdate}/:id`,
    element: <ProtectedPublic><UpdateLaboratoryPage /></ProtectedPublic>,
  },
  // Lab Exams
  {
    path: nameRoutes.labExam,
    element: <ProtectedPublic><LabExamPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.labExamCreate,
    element: <ProtectedPublic><CreateLabExamPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.labExamUpdate}/:id`,
    element: <ProtectedPublic><UpdateLabExamPage /></ProtectedPublic>,
  },
  // Lab Orders
  {
    path: nameRoutes.labOrder,
    element: <ProtectedPublic><LabOrderPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.labOrderCreate,
    element: <ProtectedPublic><CreateLabOrderPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.labOrderDetail}/:id`,
    element: <ProtectedPublic><LabOrderDetailPage /></ProtectedPublic>,
  },
  // Medicines
  {
    path: nameRoutes.medicine,
    element: <ProtectedPublic><MedicinePage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.medicineCreate,
    element: <ProtectedPublic><CreateMedicinePage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.medicineUpdate}/:id`,
    element: <ProtectedPublic><UpdateMedicinePage /></ProtectedPublic>,
  },
  // Payments
  {
    path: nameRoutes.payment,
    element: <ProtectedPublic><PaymentPage /></ProtectedPublic>,
  },
  // Notifications
  {
    path: nameRoutes.notificationLog,
    element: <ProtectedPublic><NotificationLogPage /></ProtectedPublic>,
  },
  // AppointmentStatus
  {
    path: nameRoutes.appointmentStatus,
    element: <ProtectedPublic><AppointmentStatusPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.appointmentStatusCreate,
    element: <ProtectedPublic><CreateAppointmentStatusPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.appointmentStatusUpdate}/:id`,
    element: <ProtectedPublic><UpdateAppointmentStatusPage /></ProtectedPublic>,
  },
  // MedicineInventory
  {
    path: nameRoutes.medicineInventory,
    element: <ProtectedPublic><MedicineInventoryPage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.medicineInventoryCreate,
    element: <ProtectedPublic><CreateMedicineInventoryPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.medicineInventoryUpdate}/:id`,
    element: <ProtectedPublic><UpdateMedicineInventoryPage /></ProtectedPublic>,
  },
  // Prescription
  {
    path: nameRoutes.prescription,
    element: <ProtectedPublic><PrescriptionPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.prescriptionDetail}/:id`,
    element: <ProtectedPublic><PrescriptionDetailPage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.prescriptionDetail}/create`,
    element: <ProtectedPublic><PrescriptionDetailPage /></ProtectedPublic>,
  },
  // Dashboard médico/enfermero
  {
    path: nameRoutes.doctorDashboard,
    element: <ProtectedPublic><DoctorDashboardPage /></ProtectedPublic>,
  },
  // Recepción
  {
    path: nameRoutes.reception,
    element: <ProtectedPublic><ReceptionPage /></ProtectedPublic>,
  },
  // Caja
  {
    path: nameRoutes.cashier,
    element: <ProtectedPublic><CashierPage /></ProtectedPublic>,
  },
  // Pago en línea
  {
    path: nameRoutes.onlinePayment,
    element: <ProtectedPublic><OnlinePaymentPage /></ProtectedPublic>,
  },
  // Dispense
  {
    path: nameRoutes.dispense,
    element: <ProtectedPublic><DispensePage /></ProtectedPublic>,
  },
  {
    path: nameRoutes.dispenseCreate,
    element: <ProtectedPublic><CreateDispensePage /></ProtectedPublic>,
  },
  {
    path: `${nameRoutes.dispenseCreate}/:prescriptionId`,
    element: <ProtectedPublic><CreateDispensePage /></ProtectedPublic>,
  },
];
