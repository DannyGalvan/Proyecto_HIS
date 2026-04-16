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
    using Hospital.Server.Validations.AppointmentStatus;
    using Hospital.Server.Validations.Appointment;
    using Hospital.Server.Validations.Payment;
    using Hospital.Server.Validations.AppointmentDocument;

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

            return services;
        }

    }

}
