using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Interceptors.Interfaces;
using Hospital.Server.Interceptors.userInterceptors;
using Hospital.Server.Services.Background;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Utils;
using Project.Server.Security;
using Project.Server.Services.Core;
using AuthService = Project.Server.Services.Core.AuthService;
using SendEmail = Project.Server.Services.Core.SendEmail;


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
            services.AddScoped<IEntityService<User, UserRequest, long>, EntityService<User, UserRequest, long>>();
            services.AddScoped<IEntityService<Rol, RolRequest, long>, EntityService<Rol, RolRequest, long>>();
            services.AddScoped<IEntityService<Operation, OperationRequest, long>, EntityService<Operation, OperationRequest, long>>();
            services.AddScoped<IEntityService<RolOperation, RolOperationRequest, long>, EntityService<RolOperation, RolOperationRequest, long>>();

            // Catalogs CRUD services
            services.AddScoped<IEntityService<Specialty, SpecialtyRequest, long>, EntityService<Specialty, SpecialtyRequest, long>>();
            services.AddScoped<IEntityService<Laboratory, LaboratoryRequest, long>, EntityService<Laboratory, LaboratoryRequest, long>>();
            services.AddScoped<IEntityService<Branch, BranchRequest, long>, EntityService<Branch, BranchRequest, long>>();
            services.AddScoped<IEntityService<AppointmentStatus, AppointmentStatusRequest, long>, EntityService<AppointmentStatus, AppointmentStatusRequest, long>>();

            // User interceptors
            services.AddScoped<IEntityBeforeCreateInterceptor<User, UserRequest>, UserBeforeCreateInterceptor>();
            services.AddScoped<IEntityBeforeUpdateInterceptor<User, UserRequest>, UserBeforeUpdateInterceptor>();

            // security services
            services.AddScoped<ISecurityAuthService, SecurityAuthService>();
            // SessionAuthService and SessionAuthorizationFilter removed - using JWT authorization
            // services.AddScoped<SessionAuthService>();
            // services.AddScoped<SessionAuthorizationFilter>();

            // operation sync service
            services.AddScoped<IOperationSyncService, OperationSyncService>();

            // hosted service para sincronización al inicio
            services.AddHostedService<OperationSyncHostedService>();

            // other services
            services.AddScoped<ISendMail, SendEmail>();

            services.AddScoped<IFilterTranslator, FilterTranslator>();
            services.AddScoped<IEntitySupportService, EntitySupportService>();

            return services;
        }
    }
}
