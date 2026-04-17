using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Interceptors.Interfaces;
using Hospital.Server.Interceptors.userInterceptors;
using Hospital.Server.Interceptors.AppointmentInterceptors;
using Hospital.Server.Services.Background;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Utils;
using AuthService = Hospital.Server.Services.Core.AuthService;
using EntitySupportService = Hospital.Server.Services.Core.EntitySupportService;
using SendEmail = Hospital.Server.Services.Core.SendEmail;


namespace Hospital.Server.Configs.Extensions
{

    /// <summary>
    /// Defines the <see cref="ServicesGroup" />
    /// </summary>
    public static class ServicesGroup
    {
        /// <summary>
        /// The AddServiceGroup
        /// </summary>
        /// <param name="services">The services<see cref="IServiceCollection"/></param>
        /// <returns>The <see cref="IServiceCollection"/></returns>
        public static IServiceCollection AddServiceGroup(this IServiceCollection services)
        {
            // entities services
            services.AddScoped<IAuthService, AuthService>();

            // CRUD services
            services.AddScoped<IEntityService<User, UserRequest, long>, Services.Core.EntityService<User, UserRequest, long>>();
            services.AddScoped<IEntityService<Rol, RolRequest, long>, Services.Core.EntityService<Rol, RolRequest, long>>();
            services.AddScoped<IEntityService<Operation, OperationRequest, long>, Services.Core.EntityService<Operation, OperationRequest, long>>();
            services.AddScoped<IEntityService<RolOperation, RolOperationRequest, long>, Services.Core.EntityService<RolOperation, RolOperationRequest, long>>();

            // Catalogs CRUD services
            services.AddScoped<IEntityService<Specialty, SpecialtyRequest, long>, Services.Core.EntityService<Specialty, SpecialtyRequest, long>>();
            services.AddScoped<IEntityService<Laboratory, LaboratoryRequest, long>, Services.Core.EntityService<Laboratory, LaboratoryRequest, long>>();
            services.AddScoped<IEntityService<Branch, BranchRequest, long>, Services.Core.EntityService<Branch, BranchRequest, long>>();
            services.AddScoped<IEntityService<BranchSpecialty, BranchSpecialtyRequest, long>, Services.Core.EntityService<BranchSpecialty, BranchSpecialtyRequest, long>>();
            services.AddScoped<IEntityService<AppointmentStatus, AppointmentStatusRequest, long>, Services.Core.EntityService<AppointmentStatus, AppointmentStatusRequest, long>>();

            // Core CRUD services
            services.AddScoped<IEntityService<Appointment, AppointmentRequest, long>, Services.Core.EntityService<Appointment, AppointmentRequest, long>>();
            services.AddScoped<IEntityService<Payment, PaymentRequest, long>, Services.Core.EntityService<Payment, PaymentRequest, long>>();
            services.AddScoped<IEntityService<AppointmentDocument, AppointmentDocumentRequest, long>, Services.Core.EntityService<AppointmentDocument, AppointmentDocumentRequest, long>>();

            // Clinical CRUD services
            services.AddScoped<IEntityService<VitalSign, VitalSignRequest, long>, Services.Core.EntityService<VitalSign, VitalSignRequest, long>>();
            services.AddScoped<IEntityService<MedicalConsultation, MedicalConsultationRequest, long>, Services.Core.EntityService<MedicalConsultation, MedicalConsultationRequest, long>>();
            services.AddScoped<IEntityService<Prescription, PrescriptionRequest, long>, Services.Core.EntityService<Prescription, PrescriptionRequest, long>>();
            services.AddScoped<IEntityService<PrescriptionItem, PrescriptionItemRequest, long>, Services.Core.EntityService<PrescriptionItem, PrescriptionItemRequest, long>>();

            // Laboratory CRUD services
            services.AddScoped<IEntityService<LabExam, LabExamRequest, long>, Services.Core.EntityService<LabExam, LabExamRequest, long>>();
            services.AddScoped<IEntityService<LabOrder, LabOrderRequest, long>, Services.Core.EntityService<LabOrder, LabOrderRequest, long>>();
            services.AddScoped<IEntityService<LabOrderItem, LabOrderItemRequest, long>, Services.Core.EntityService<LabOrderItem, LabOrderItemRequest, long>>();

            // Pharmacy CRUD services (CU-10)
            services.AddScoped<IEntityService<Medicine, MedicineRequest, long>, Services.Core.EntityService<Medicine, MedicineRequest, long>>();
            services.AddScoped<IEntityService<MedicineInventory, MedicineInventoryRequest, long>, Services.Core.EntityService<MedicineInventory, MedicineInventoryRequest, long>>();
            services.AddScoped<IEntityService<Dispense, DispenseRequest, long>, Services.Core.EntityService<Dispense, DispenseRequest, long>>();
            services.AddScoped<IEntityService<DispenseItem, DispenseItemRequest, long>, Services.Core.EntityService<DispenseItem, DispenseItemRequest, long>>();

            // Notification CRUD services (CU-11)
            services.AddScoped<IEntityService<NotificationLog, NotificationLogRequest, long>, Services.Core.EntityService<NotificationLog, NotificationLogRequest, long>>();

            // User interceptors
            services.AddScoped<IEntityBeforeCreateInterceptor<User, UserRequest>, UserBeforeCreateInterceptor>();
            services.AddScoped<IEntityBeforeUpdateInterceptor<User, UserRequest>, UserBeforeUpdateInterceptor>();

            // Appointment state machine
            services.AddScoped<IAppointmentStateMachine, AppointmentStateMachine>();

            // Appointment interceptors — enforce state machine on related entity creation
            services.AddScoped<IEntityBeforeCreateInterceptor<Appointment, AppointmentRequest>, AppointmentBeforeCreateInterceptor>();
            services.AddScoped<IEntityAfterCreateInterceptor<VitalSign, VitalSignRequest>, VitalSignAfterCreateInterceptor>();
            services.AddScoped<IEntityAfterCreateInterceptor<MedicalConsultation, MedicalConsultationRequest>, MedicalConsultationAfterCreateInterceptor>();
            services.AddScoped<IEntityAfterUpdateInterceptor<MedicalConsultation, MedicalConsultationRequest>, MedicalConsultationAfterUpdateInterceptor>();
            services.AddScoped<IEntityAfterCreateInterceptor<LabOrder, LabOrderRequest>, LabOrderAfterCreateInterceptor>();
            services.AddScoped<IEntityAfterCreateInterceptor<Dispense, DispenseRequest>, DispenseAfterCreateInterceptor>();

            // Prescription and LabOrder require a completed consultation
            services.AddScoped<IEntityBeforeCreateInterceptor<Prescription, PrescriptionRequest>, PrescriptionBeforeCreateInterceptor>();
            services.AddScoped<IEntityBeforeCreateInterceptor<LabOrder, LabOrderRequest>, LabOrderBeforeCreateInterceptor>();

            // security services
            services.AddScoped<ISecurityAuthService, SecurityAuthService>();
            // SessionAuthService and SessionAuthorizationFilter removed - using JWT authorization
            // services.AddScoped<SessionAuthService>();
            // services.AddScoped<SessionAuthorizationFilter>();

            // operation sync service
            services.AddScoped<IOperationSyncService, OperationSyncService>();

            // hosted service para sincronización al inicio
            services.AddHostedService<OperationSyncHostedService>();

            // hosted service para expiración automática de citas pendientes de pago
            services.AddHostedService<AppointmentExpirationService>();

            // hosted service para recordatorios de cita por correo (24h y 4h antes)
            services.AddHostedService<AppointmentReminderService>();

            // payment gateway (swap MockPaymentGateway for real implementation in production)
            services.AddScoped<IPaymentGateway, MockPaymentGateway>();

            // other services
            services.AddScoped<ISendMail, SendEmail>();

            services.AddScoped<IFilterTranslator, FilterTranslator>();
            services.AddScoped<IEntitySupportService, EntitySupportService>();

            return services;
        }
    }
}
