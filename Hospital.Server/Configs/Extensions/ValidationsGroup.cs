namespace Hospital.Server.Configs.Extensions
{
    using FluentValidation;
    using Hospital.Server.Entities.Request;
    using Hospital.Server.Validations.Auth;
    using Hospital.Server.Validations.Operation;
    using Hospital.Server.Validations.Rol;
    using Hospital.Server.Validations.RolOperation;
    using Hospital.Server.Validations.User;
    using Hospital.Server.Validations.Specialty;
    using Hospital.Server.Validations.Laboratory;
    using Hospital.Server.Validations.Branch;
    using Hospital.Server.Validations.BranchSpecialty;
    using Hospital.Server.Validations.AppointmentStatus;
    using Hospital.Server.Validations.Appointment;
    using Hospital.Server.Validations.Payment;
    using Hospital.Server.Validations.AppointmentDocument;
    using Hospital.Server.Validations.VitalSign;
    using Hospital.Server.Validations.MedicalConsultation;
    using Hospital.Server.Validations.Prescription;
    using Hospital.Server.Validations.PrescriptionItem;
    using Hospital.Server.Validations.LabExam;
    using Hospital.Server.Validations.LabOrder;
    using Hospital.Server.Validations.LabOrderItem;
    using Hospital.Server.Validations.Medicine;
    using Hospital.Server.Validations.MedicineInventory;
    using Hospital.Server.Validations.Dispense;
    using Hospital.Server.Validations.DispenseItem;
    using Hospital.Server.Validations.NotificationLog;
    using Hospital.Server.Validations.PatientPortal;
    using Hospital.Server.Validations.InventoryMovement;

    /// <summary>
    /// Defines the <see cref="ValidationsGroup" />
    /// </summary>
    public static class ValidationsGroup
    {
        /// <summary>
        /// The AddValidationsGroup
        /// </summary>
        /// <param name="services">The services<see cref="IServiceCollection"/></param>
        /// <returns>The <see cref="IServiceCollection"/></returns>
        public static IServiceCollection AddValidationsGroup(this IServiceCollection services)
        {
            //auth validations
            services.AddScoped<IValidator<LoginRequest>, LoginValidations>();
            services.AddScoped<IValidator<ChangePasswordRequest>, ChangePasswordValidations>();
            services.AddScoped<IValidator<ResetPasswordRequest>, ResetPasswordValidations>();
            services.AddScoped<IValidator<RecoveryPasswordRequest>, RecoveryPasswordValidations>();
            services.AddScoped<IValidator<RegisterRequest>, RegisterValidations>();
            services.AddScoped<IValidator<ManualChangePasswordRequest>, ManualChangePasswordValidation>();

            //user validations
            services.AddKeyedScoped<IValidator<UserRequest>, CreateUserValidation>("Create");
            services.AddKeyedScoped<IValidator<UserRequest>, UpdateUserValidation>("Update");
            services.AddKeyedScoped<IValidator<UserRequest>, PartialUserValidation>("Partial");

            //rol validations
            services.AddKeyedScoped<IValidator<RolRequest>, CreateRolValidation>("Create");
            services.AddKeyedScoped<IValidator<RolRequest>, UpdateRolValidation>("Update");
            services.AddKeyedScoped<IValidator<RolRequest>, PartialRolValidation>("Partial");

            //rolOperation validations
            services.AddKeyedScoped<IValidator<RolOperationRequest>, CreateRolOperationValidation>("Create");
            services.AddKeyedScoped<IValidator<RolOperationRequest>, UpdateRolOperationValidation>("Update");
            services.AddKeyedScoped<IValidator<RolOperationRequest>, PartialRolOperationValidation>("Partial");

            //operation validations
            services.AddKeyedScoped<IValidator<OperationRequest>, CreateOperationValidation>("Create");
            services.AddKeyedScoped<IValidator<OperationRequest>, UpdateOperationValidation>("Update");
            services.AddKeyedScoped<IValidator<OperationRequest>, PartialOperationValidation>("Partial");

            //specialty validations
            services.AddKeyedScoped<IValidator<SpecialtyRequest>, CreateSpecialtyValidation>("Create");
            services.AddKeyedScoped<IValidator<SpecialtyRequest>, UpdateSpecialtyValidation>("Update");
            services.AddKeyedScoped<IValidator<SpecialtyRequest>, PartialSpecialtyValidation>("Partial");

            //laboratory validations
            services.AddKeyedScoped<IValidator<LaboratoryRequest>, CreateLaboratoryValidation>("Create");
            services.AddKeyedScoped<IValidator<LaboratoryRequest>, UpdateLaboratoryValidation>("Update");
            services.AddKeyedScoped<IValidator<LaboratoryRequest>, PartialLaboratoryValidation>("Partial");

            //branch validations
            services.AddKeyedScoped<IValidator<BranchRequest>, CreateBranchValidation>("Create");
            services.AddKeyedScoped<IValidator<BranchRequest>, UpdateBranchValidation>("Update");
            services.AddKeyedScoped<IValidator<BranchRequest>, PartialBranchValidation>("Partial");

            //branchSpecialty validations
            services.AddKeyedScoped<IValidator<BranchSpecialtyRequest>, CreateBranchSpecialtyValidation>("Create");
            services.AddKeyedScoped<IValidator<BranchSpecialtyRequest>, UpdateBranchSpecialtyValidation>("Update");
            services.AddKeyedScoped<IValidator<BranchSpecialtyRequest>, PartialBranchSpecialtyValidation>("Partial");

            //appointmentStatus validations
            services.AddKeyedScoped<IValidator<AppointmentStatusRequest>, CreateAppointmentStatusValidation>("Create");
            services.AddKeyedScoped<IValidator<AppointmentStatusRequest>, UpdateAppointmentStatusValidation>("Update");
            services.AddKeyedScoped<IValidator<AppointmentStatusRequest>, PartialAppointmentStatusValidation>("Partial");

            //appointment validations
            services.AddKeyedScoped<IValidator<AppointmentRequest>, CreateAppointmentValidation>("Create");
            services.AddKeyedScoped<IValidator<AppointmentRequest>, UpdateAppointmentValidation>("Update");
            services.AddKeyedScoped<IValidator<AppointmentRequest>, PartialAppointmentValidation>("Partial");

            //payment validations
            services.AddKeyedScoped<IValidator<PaymentRequest>, CreatePaymentValidation>("Create");
            services.AddKeyedScoped<IValidator<PaymentRequest>, UpdatePaymentValidation>("Update");
            services.AddKeyedScoped<IValidator<PaymentRequest>, PartialPaymentValidation>("Partial");

            //appointmentDocument validations
            services.AddKeyedScoped<IValidator<AppointmentDocumentRequest>, CreateAppointmentDocumentValidation>("Create");
            services.AddKeyedScoped<IValidator<AppointmentDocumentRequest>, UpdateAppointmentDocumentValidation>("Update");
            services.AddKeyedScoped<IValidator<AppointmentDocumentRequest>, PartialAppointmentDocumentValidation>("Partial");

            //vitalSign validations
            services.AddKeyedScoped<IValidator<VitalSignRequest>, CreateVitalSignValidation>("Create");
            services.AddKeyedScoped<IValidator<VitalSignRequest>, UpdateVitalSignValidation>("Update");
            services.AddKeyedScoped<IValidator<VitalSignRequest>, PartialVitalSignValidation>("Partial");

            //medicalConsultation validations
            services.AddKeyedScoped<IValidator<MedicalConsultationRequest>, CreateMedicalConsultationValidation>("Create");
            services.AddKeyedScoped<IValidator<MedicalConsultationRequest>, UpdateMedicalConsultationValidation>("Update");
            services.AddKeyedScoped<IValidator<MedicalConsultationRequest>, PartialMedicalConsultationValidation>("Partial");

            //prescription validations
            services.AddKeyedScoped<IValidator<PrescriptionRequest>, CreatePrescriptionValidation>("Create");
            services.AddKeyedScoped<IValidator<PrescriptionRequest>, UpdatePrescriptionValidation>("Update");
            services.AddKeyedScoped<IValidator<PrescriptionRequest>, PartialPrescriptionValidation>("Partial");

            //prescriptionItem validations
            services.AddKeyedScoped<IValidator<PrescriptionItemRequest>, CreatePrescriptionItemValidation>("Create");
            services.AddKeyedScoped<IValidator<PrescriptionItemRequest>, UpdatePrescriptionItemValidation>("Update");
            services.AddKeyedScoped<IValidator<PrescriptionItemRequest>, PartialPrescriptionItemValidation>("Partial");

            //labExam validations
            services.AddKeyedScoped<IValidator<LabExamRequest>, CreateLabExamValidation>("Create");
            services.AddKeyedScoped<IValidator<LabExamRequest>, UpdateLabExamValidation>("Update");
            services.AddKeyedScoped<IValidator<LabExamRequest>, PartialLabExamValidation>("Partial");

            //labOrder validations
            services.AddKeyedScoped<IValidator<LabOrderRequest>, CreateLabOrderValidation>("Create");
            services.AddKeyedScoped<IValidator<LabOrderRequest>, UpdateLabOrderValidation>("Update");
            services.AddKeyedScoped<IValidator<LabOrderRequest>, PartialLabOrderValidation>("Partial");

            //labOrderItem validations
            services.AddKeyedScoped<IValidator<LabOrderItemRequest>, CreateLabOrderItemValidation>("Create");
            services.AddKeyedScoped<IValidator<LabOrderItemRequest>, UpdateLabOrderItemValidation>("Update");
            services.AddKeyedScoped<IValidator<LabOrderItemRequest>, PartialLabOrderItemValidation>("Partial");

            //medicine validations
            services.AddKeyedScoped<IValidator<MedicineRequest>, CreateMedicineValidation>("Create");
            services.AddKeyedScoped<IValidator<MedicineRequest>, UpdateMedicineValidation>("Update");
            services.AddKeyedScoped<IValidator<MedicineRequest>, PartialMedicineValidation>("Partial");

            //medicineInventory validations
            services.AddKeyedScoped<IValidator<MedicineInventoryRequest>, CreateMedicineInventoryValidation>("Create");
            services.AddKeyedScoped<IValidator<MedicineInventoryRequest>, UpdateMedicineInventoryValidation>("Update");
            services.AddKeyedScoped<IValidator<MedicineInventoryRequest>, PartialMedicineInventoryValidation>("Partial");

            //dispense validations
            services.AddKeyedScoped<IValidator<DispenseRequest>, CreateDispenseValidation>("Create");
            services.AddKeyedScoped<IValidator<DispenseRequest>, UpdateDispenseValidation>("Update");
            services.AddKeyedScoped<IValidator<DispenseRequest>, PartialDispenseValidation>("Partial");

            //dispenseItem validations
            services.AddKeyedScoped<IValidator<DispenseItemRequest>, CreateDispenseItemValidation>("Create");
            services.AddKeyedScoped<IValidator<DispenseItemRequest>, UpdateDispenseItemValidation>("Update");
            services.AddKeyedScoped<IValidator<DispenseItemRequest>, PartialDispenseItemValidation>("Partial");

            //notificationLog validations
            services.AddKeyedScoped<IValidator<NotificationLogRequest>, CreateNotificationLogValidation>("Create");
            services.AddKeyedScoped<IValidator<NotificationLogRequest>, UpdateNotificationLogValidation>("Update");
            services.AddKeyedScoped<IValidator<NotificationLogRequest>, PartialNotificationLogValidation>("Partial");

            //inventoryMovement validations
            services.AddKeyedScoped<IValidator<InventoryMovementRequest>, CreateInventoryMovementValidation>("Create");
            services.AddKeyedScoped<IValidator<InventoryMovementRequest>, UpdateInventoryMovementValidation>("Update");
            services.AddKeyedScoped<IValidator<InventoryMovementRequest>, PartialInventoryMovementValidation>("Partial");

            //patientPortal validations
            services.AddScoped<IValidator<PatientRegisterRequest>, CreatePatientValidator>();

            return services;
        }

    }

}
