using Hospital.Server.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;

namespace Hospital.Server.Infrastructure.Database.Configurators
{
    /// <summary>
    /// Configurador para PostgreSQL
    /// </summary>
    public class PostgreSqlConfigurator : IDatabaseConfigurator
    {
        /// <summary>
        /// Configura Entity Framework para PostgreSQL
        /// </summary>
        /// <param name="optionsBuilder">Constructor de opciones de DbContext</param>
        /// <param name="connectionString">Cadena de conexión a PostgreSQL</param>
        /// <returns>DbContextOptionsBuilder configurado para PostgreSQL</returns>
        public DbContextOptionsBuilder Configure(DbContextOptionsBuilder optionsBuilder, string connectionString)
        {
            return optionsBuilder.UseNpgsql(
                connectionString,
                npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory");
                    npgsqlOptions.SetPostgresVersion(new Version(15, 0));

                    // Retry automático para fallas transitorias (Broken pipe, connection reset, etc.)
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                });
        }
    }
}
