using Hospital.Server.Configs.Extensions;
using Hospital.Server.Configs.Models;
using Hospital.Server.Infrastructure.Extensions;
using Hospital.Server.Context.Config;

namespace Hospital.Server
{
    public abstract class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Obtain the environment current (Development, Production, etc.)
            string environment = builder.Environment.EnvironmentName;

            // Configure the ConfigurationBuilder y load the configurations del archive appsettings.json
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true) // Load base file appsettings.json
                .AddJsonFile($"appsettings.{environment}.json", optional: true, reloadOnChange: true) // Load environment-specific file
                .AddEnvironmentVariables()
                .Build();

            //Add the configuration to the builder
            IConfigurationSection appSettingsSection = configuration.GetSection("AppSettings");

            AppSettings appSettingsConfig = appSettingsSection.Get<AppSettings>()!;

            builder.Services.Configure<AppSettings>(appSettingsSection);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddMapsterSettings();
            builder.Services.AddJwtConfiguration(appSettingsConfig);
            builder.Services.AddOperationAuthorization(); // JWT-based operation authorization
            builder.Services.AddSwaggerConfiguration();
            builder.Services.AddContextGroup(configuration);
            builder.Services.AddValidationsGroup();
            builder.Services.AddServiceGroup();
            builder.Services.AddControllersConfiguration();

            // Configure Serilog logging (multi-database support: SQL Server, PostgreSQL, MySQL)
            builder.AddLoggingConfiguration();

            // Session configuration removed - using JWT stateless authentication
            //builder.Services.AddSessionSecurityConfiguration();

            var app = builder.Build();

            // 1. IMPORTANTE: Soporte para Nginx (Forwarded Headers)
            // Esto evita errores de "Unauthorized" cuando Nginx traduce de HTTPS a HTTP
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor |
                                   Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
            });

            // Aplicar migraciones automáticas si está configurado
            app.ApplyMigrations(configuration);

            // 2. Archivos estáticos y Swagger
            if (app.Environment.IsProduction())
            {
                app.UseDefaultFiles();
                app.UseStaticFiles();
            }

            app.UseSwagger();
            app.UseSwaggerUI();

            // 3. ENRUTAMIENTO (Debe ir antes de la Autenticación)
            app.UseRouting();

            // 4. SEGURIDAD (El orden debe ser: Routing -> Auth -> Endpoints)
            app.UseAuthentication();
            app.UseAuthorization();

            // 5. MAPEO DE RUTAS
            app.MapControllers();

            // 6. FALLBACK (Último recurso)
            // Solo si ninguna ruta de controlador o archivo estático coincidió,
            // enviamos al index.html para que el Front-end maneje la ruta.
            // IMPORTANTE: AllowAnonymous permite que las rutas del SPA se carguen sin autenticación
            app.MapFallbackToFile("/index.html").AllowAnonymous();

            app.Run();
        }
    }
}
