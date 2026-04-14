using Hospital.Server.Security.Authorization;
using Microsoft.AspNetCore.Authorization;

namespace Hospital.Server.Configs.Extensions
{
    /// <summary>
    /// Defines the <see cref="AuthorizationConfiguration" />
    /// </summary>
    public static class AuthorizationConfiguration
    {
        /// <summary>
        /// Adds operation-based authorization configuration
        /// </summary>
        /// <param name="services">The services<see cref="IServiceCollection"/></param>
        /// <returns>The <see cref="IServiceCollection"/></returns>
        public static IServiceCollection AddOperationAuthorization(this IServiceCollection services)
        {
            // Register the authorization handler
            services.AddScoped<IAuthorizationHandler, OperationAuthorizationHandler>();

            // Configure authorization options
            services.AddAuthorization(options =>
            {
                // Default policy: require authenticated user
                options.DefaultPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();

                // Fallback policy: deny by default if no policy is specified
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
            });

            return services;
        }
    }
}
