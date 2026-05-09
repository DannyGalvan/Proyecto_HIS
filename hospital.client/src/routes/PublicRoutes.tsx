import type { RouteObject } from "react-router";

import { nameRoutes } from "../configs/constants";
import { AdminForgotPasswordPage } from "../pages/auth/AdminForgotPasswordPage";

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
import { CreateSpecialtyPage } from "../pages/specialty/CreateSpecialtyPage";
import { SpecialtyPage } from "../pages/specialty/SpecialtyPage";
import { UpdateSpecialtyPage } from "../pages/specialty/UpdateSpecialtyPage";

// Branch pages
import { BranchPage } from "../pages/branch/BranchPage";
import { CreateBranchPage } from "../pages/branch/CreateBranchPage";
import { UpdateBranchPage } from "../pages/branch/UpdateBranchPage";

// Branch-Specialty pages
import { BranchSpecialtyPage } from "../pages/branch-specialty/BranchSpecialtyPage";
import { CreateBranchSpecialtyPage } from "../pages/branch-specialty/CreateBranchSpecialtyPage";

// Appointment pages
import { AppointmentPage } from "../pages/appointment/AppointmentPage";
import { AppointmentViewPage } from "../pages/appointment/AppointmentViewPage";
import { CreateAppointmentPage } from "../pages/appointment/CreateAppointmentPage";

// Vital Sign pages
import { CreateVitalSignPage } from "../pages/vital-sign/CreateVitalSignPage";
import { UpdateVitalSignPage } from "../pages/vital-sign/UpdateVitalSignPage";
import { VitalSignPage } from "../pages/vital-sign/VitalSignPage";

// Medical Consultation pages
import { CreateMedicalConsultationPage } from "../pages/medical-consultation/CreateMedicalConsultationPage";
import { MedicalConsultationPage } from "../pages/medical-consultation/MedicalConsultationPage";
import { UpdateMedicalConsultationPage } from "../pages/medical-consultation/UpdateMedicalConsultationPage";

// Laboratory pages
import { CreateLaboratoryPage } from "../pages/laboratory/CreateLaboratoryPage";
import { LaboratoryPage } from "../pages/laboratory/LaboratoryPage";
import { UpdateLaboratoryPage } from "../pages/laboratory/UpdateLaboratoryPage";

// Lab Exam pages
import { CreateLabExamPage } from "../pages/lab-exam/CreateLabExamPage";
import { LabExamPage } from "../pages/lab-exam/LabExamPage";
import { UpdateLabExamPage } from "../pages/lab-exam/UpdateLabExamPage";

// Lab Order pages
import { CreateLabOrderPage } from "../pages/lab-order/CreateLabOrderPage";
import { LabOrderDetailPage } from "../pages/lab-order/LabOrderDetailPage";
import { LabOrderPage } from "../pages/lab-order/LabOrderPage";

// Medicine pages
import { CreateMedicinePage } from "../pages/medicine/CreateMedicinePage";
import { MedicinePage } from "../pages/medicine/MedicinePage";
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
import { CreateMedicineInventoryPage } from "../pages/medicine-inventory/CreateMedicineInventoryPage";
import { MedicineInventoryPage } from "../pages/medicine-inventory/MedicineInventoryPage";
import { UpdateMedicineInventoryPage } from "../pages/medicine-inventory/UpdateMedicineInventoryPage";

// Prescription pages
import { PrescriptionDetailPage } from "../pages/prescription/PrescriptionDetailPage";
import { PrescriptionPage } from "../pages/prescription/PrescriptionPage";

// Dashboard
import { DoctorDashboardPage } from "../pages/dashboard/DoctorDashboardPage";
import { NurseDashboardPage } from "../pages/dashboard/NurseDashboardPage";
import { RoleDashboardPage } from "../pages/dashboard/RoleDashboardPage";

// Reception & Cashier
import { CashierPage } from "../pages/cashier/CashierPage";
import { LabCashierPage } from "../pages/cashier/LabCashierPage";
import { ReceptionPage } from "../pages/reception/ReceptionPage";

// Online Payment
import { OnlinePaymentPage } from "../pages/payment/OnlinePaymentPage";

// Dispense pages
import { CreateDispensePage } from "../pages/dispense/CreateDispensePage";
import { DispensePage } from "../pages/dispense/DispensePage";

// InventoryMovement pages
import { CreateInventoryMovementPage } from "../pages/inventory-movement/CreateInventoryMovementPage";
import { InventoryMovementPage } from "../pages/inventory-movement/InventoryMovementPage";

// Admin pages
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { DoctorManagementPage } from "../pages/admin/DoctorManagementPage";
import { DoctorTransferPage } from "../pages/admin/DoctorTransferPage";

// Appointment Reassign
import { AppointmentReassignPage } from "../pages/appointment/AppointmentReassignPage";

// Doctor Calendar
import { AdminResetPasswordPage } from "../pages/auth/AdminResetPasswordPage";
import { DoctorCalendarPage } from "../pages/doctor-calendar/DoctorCalendarPage";

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
    path: nameRoutes.forgotPassword,
    element: <AdminForgotPasswordPage />,
  },
  {
    path: nameRoutes.resetPassword,
    element: <AdminResetPasswordPage />,
  },
  {
    path: nameRoutes.register,
    lazy: () => import("../pages/public/RegisterPageLazy"),
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
    element: (
      <ProtectedPublic>
        <UserPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.userCreate,
    element: (
      <ProtectedPublic>
        <CreateUserPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.userUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateUserPage />
      </ProtectedPublic>
    ),
  },
  // Roles
  {
    path: nameRoutes.rol,
    element: (
      <ProtectedPublic>
        <RolPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.rolCreate,
    element: (
      <ProtectedPublic>
        <CreateRolPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.rolUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateRolPage />
      </ProtectedPublic>
    ),
  },
  // Specialties
  {
    path: nameRoutes.specialty,
    element: (
      <ProtectedPublic>
        <SpecialtyPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.specialtyCreate,
    element: (
      <ProtectedPublic>
        <CreateSpecialtyPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.specialtyUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateSpecialtyPage />
      </ProtectedPublic>
    ),
  },
  // Branches
  {
    path: nameRoutes.branch,
    element: (
      <ProtectedPublic>
        <BranchPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.branchCreate,
    element: (
      <ProtectedPublic>
        <CreateBranchPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.branchUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateBranchPage />
      </ProtectedPublic>
    ),
  },
  // Branch-Specialty assignments
  {
    path: nameRoutes.branchSpecialty,
    element: (
      <ProtectedPublic>
        <BranchSpecialtyPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.branchSpecialtyCreate,
    element: (
      <ProtectedPublic>
        <CreateBranchSpecialtyPage />
      </ProtectedPublic>
    ),
  },
  // Appointments
  {
    path: nameRoutes.appointment,
    element: (
      <ProtectedPublic>
        <AppointmentPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.appointmentCreate,
    element: (
      <ProtectedPublic>
        <CreateAppointmentPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.appointmentView}/:id`,
    element: (
      <ProtectedPublic>
        <AppointmentViewPage />
      </ProtectedPublic>
    ),
  },
  // Vital Signs
  {
    path: nameRoutes.vitalSign,
    element: (
      <ProtectedPublic>
        <VitalSignPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.vitalSignCreate,
    element: (
      <ProtectedPublic>
        <CreateVitalSignPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.vitalSignUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateVitalSignPage />
      </ProtectedPublic>
    ),
  },
  // Medical Consultations
  {
    path: nameRoutes.medicalConsultation,
    element: (
      <ProtectedPublic>
        <MedicalConsultationPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.medicalConsultationCreate,
    element: (
      <ProtectedPublic>
        <CreateMedicalConsultationPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.medicalConsultationUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateMedicalConsultationPage />
      </ProtectedPublic>
    ),
  },
  // Laboratories
  {
    path: nameRoutes.laboratory,
    element: (
      <ProtectedPublic>
        <LaboratoryPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.laboratoryCreate,
    element: (
      <ProtectedPublic>
        <CreateLaboratoryPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.laboratoryUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateLaboratoryPage />
      </ProtectedPublic>
    ),
  },
  // Lab Exams
  {
    path: nameRoutes.labExam,
    element: (
      <ProtectedPublic>
        <LabExamPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.labExamCreate,
    element: (
      <ProtectedPublic>
        <CreateLabExamPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.labExamUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateLabExamPage />
      </ProtectedPublic>
    ),
  },
  // Lab Orders
  {
    path: nameRoutes.labOrder,
    element: (
      <ProtectedPublic>
        <LabOrderPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.labOrderCreate,
    element: (
      <ProtectedPublic>
        <CreateLabOrderPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.labOrderDetail}/:id`,
    element: (
      <ProtectedPublic>
        <LabOrderDetailPage />
      </ProtectedPublic>
    ),
  },
  // Medicines
  {
    path: nameRoutes.medicine,
    element: (
      <ProtectedPublic>
        <MedicinePage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.medicineCreate,
    element: (
      <ProtectedPublic>
        <CreateMedicinePage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.medicineUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateMedicinePage />
      </ProtectedPublic>
    ),
  },
  // Payments
  {
    path: nameRoutes.payment,
    element: (
      <ProtectedPublic>
        <PaymentPage />
      </ProtectedPublic>
    ),
  },
  // Notifications
  {
    path: nameRoutes.notificationLog,
    element: (
      <ProtectedPublic>
        <NotificationLogPage />
      </ProtectedPublic>
    ),
  },
  // AppointmentStatus
  {
    path: nameRoutes.appointmentStatus,
    element: (
      <ProtectedPublic>
        <AppointmentStatusPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.appointmentStatusCreate,
    element: (
      <ProtectedPublic>
        <CreateAppointmentStatusPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.appointmentStatusUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateAppointmentStatusPage />
      </ProtectedPublic>
    ),
  },
  // MedicineInventory
  {
    path: nameRoutes.medicineInventory,
    element: (
      <ProtectedPublic>
        <MedicineInventoryPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.medicineInventoryCreate,
    element: (
      <ProtectedPublic>
        <CreateMedicineInventoryPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.medicineInventoryUpdate}/:id`,
    element: (
      <ProtectedPublic>
        <UpdateMedicineInventoryPage />
      </ProtectedPublic>
    ),
  },
  // Prescription
  {
    path: nameRoutes.prescription,
    element: (
      <ProtectedPublic>
        <PrescriptionPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.prescriptionDetail}/:id`,
    element: (
      <ProtectedPublic>
        <PrescriptionDetailPage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.prescriptionDetail}/create`,
    element: (
      <ProtectedPublic>
        <PrescriptionDetailPage />
      </ProtectedPublic>
    ),
  },
  // Dashboard médico/enfermero
  {
    path: nameRoutes.doctorDashboard,
    element: (
      <ProtectedPublic>
        <DoctorDashboardPage />
      </ProtectedPublic>
    ),
  },
  // Dashboard rol interino (signos vitales)
  {
    path: nameRoutes.nurseDashboard,
    element: (
      <ProtectedPublic>
        <NurseDashboardPage />
      </ProtectedPublic>
    ),
  },
  // Recepción
  {
    path: nameRoutes.reception,
    element: (
      <ProtectedPublic>
        <ReceptionPage />
      </ProtectedPublic>
    ),
  },
  // Caja
  {
    path: nameRoutes.cashier,
    element: (
      <ProtectedPublic>
        <CashierPage />
      </ProtectedPublic>
    ),
  },
  // Caja - Laboratorio
  {
    path: nameRoutes.labCashier,
    element: (
      <ProtectedPublic>
        <LabCashierPage />
      </ProtectedPublic>
    ),
  },
  // Pago en línea
  {
    path: nameRoutes.onlinePayment,
    element: (
      <ProtectedPublic>
        <OnlinePaymentPage />
      </ProtectedPublic>
    ),
  },
  // Dispense
  {
    path: nameRoutes.dispense,
    element: (
      <ProtectedPublic>
        <DispensePage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.dispenseCreate,
    element: (
      <ProtectedPublic>
        <CreateDispensePage />
      </ProtectedPublic>
    ),
  },
  {
    path: `${nameRoutes.dispenseCreate}/:prescriptionId`,
    element: (
      <ProtectedPublic>
        <CreateDispensePage />
      </ProtectedPublic>
    ),
  },
  // InventoryMovement
  {
    path: nameRoutes.inventoryMovement,
    element: (
      <ProtectedPublic>
        <InventoryMovementPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.inventoryMovementCreate,
    element: (
      <ProtectedPublic>
        <CreateInventoryMovementPage />
      </ProtectedPublic>
    ),
  },
  // Admin
  {
    path: nameRoutes.adminDashboard,
    element: (
      <ProtectedPublic>
        <AdminDashboardPage />
      </ProtectedPublic>
    ),
  },
  // Role-specific dashboard (Recepcionista, Cajero, Farmacéutico, Laboratorista)
  {
    path: nameRoutes.roleDashboard,
    element: (
      <ProtectedPublic>
        <RoleDashboardPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.doctorManagement,
    element: (
      <ProtectedPublic>
        <DoctorManagementPage />
      </ProtectedPublic>
    ),
  },
  {
    path: nameRoutes.doctorTransfer,
    element: (
      <ProtectedPublic>
        <DoctorTransferPage />
      </ProtectedPublic>
    ),
  },
  // Appointment Reassign
  {
    path: nameRoutes.appointmentReassign,
    element: (
      <ProtectedPublic>
        <AppointmentReassignPage />
      </ProtectedPublic>
    ),
  },
  // Doctor Calendar
  {
    path: nameRoutes.doctorCalendar,
    element: (
      <ProtectedPublic>
        <DoctorCalendarPage />
      </ProtectedPublic>
    ),
  },
];
