using Hospital.Server.Infrastructure.Database;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using Serilog.Sinks.PostgreSQL;
using Serilog.Sinks.MySQL;
using NpgsqlTypes;

namespace Hospital.Server.Context.Config
{
    public static class LoggingExtensions
    {
        public static WebApplicationBuilder AddLoggingConfiguration(this WebApplicationBuilder builder)
        {
            try
            {
                var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
                var isDevelopment = builder.Environment.IsDevelopment();
                var isProduction = builder.Environment.IsProduction();

                // Obtener el proveedor de base de datos configurado
                var databaseSettings = builder.Configuration.GetSection("DatabaseSettings").Get<DatabaseSettings>();
                var databaseProvider = databaseSettings?.Provider ?? DatabaseProvider.SqlServer;

                var logConfig = builder.Configuration.GetSection("SerilogLogger");
                var minLevelString = logConfig.GetValue("MinimumLevel", isDevelopment ? "Debug" : "Information");
                var minLevel = ParseLogLevel(minLevelString);

                var logToConsole = logConfig.GetValue("LogToConsole", true);
                var logToFile = logConfig.GetValue("LogToFile", isDevelopment);
                var logToDatabase = logConfig.GetValue("LogToDatabase", true);

                var loggerConfig = new LoggerConfiguration()
                    .MinimumLevel.Is(minLevel)
                    .Enrich.WithProperty("Application", "Hospital")
                    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
                    .Enrich.FromLogContext();

                loggerConfig
                    .MinimumLevel.Override("Microsoft", ParseLogLevel(logConfig.GetValue("LogLevel:Microsoft", "Warning")!))
                    .MinimumLevel.Override("Microsoft.AspNetCore", ParseLogLevel(logConfig.GetValue("LogLevel:Microsoft.AspNetCore", "Warning")!))
                    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", ParseLogLevel(logConfig.GetValue("LogLevel:Microsoft.EntityFrameworkCore", "Information")!))
                    .MinimumLevel.Override("System", ParseLogLevel(logConfig.GetValue("LogLevel:System", "Warning")!));

                var logLevelSection = builder.Configuration.GetSection("SerilogLogger:LogLevel");
                ApplyDynamicLogLevels(loggerConfig, logLevelSection);

                if (logToConsole)
                {
                    var consoleTemplate = isDevelopment
                        ? "[{Timestamp:HH:mm:ss.fff}] [REQ: {RequestId}] [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}"
                        : "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz}] [REQ: {RequestId}] [{Level:u3}] {Message:lj}{NewLine}{Exception}";

                    loggerConfig.WriteTo.Console(outputTemplate: consoleTemplate);
                    Console.WriteLine("✅ Serilog: Configurado para escribir en CONSOLA");
                }

                if (logToFile)
                {
                    var logsPath = Path.Combine(AppContext.BaseDirectory, "Logs");
                    Directory.CreateDirectory(logsPath);

                    var retainedDays = isProduction ? 1 : 7;
                    loggerConfig.WriteTo.File(
                        path: Path.Combine(logsPath, "hospital-.txt"),
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: retainedDays,
                        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz}] [REQ: {RequestId}] [UserId: {UserId}] [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}");

                    Console.WriteLine($"✅ Serilog: Configurado para escribir en ARCHIVO ({retainedDays} días)");
                }

                if (logToDatabase && !string.IsNullOrEmpty(connectionString))
                {
                    try
                    {
                        ConfigureDatabaseSink(loggerConfig, databaseProvider, connectionString, minLevel);
                        Console.WriteLine($"✅ Serilog: Configurado para escribir en BASE DE DATOS ({databaseProvider})");
                    }
                    catch (Exception dbEx)
                    {
                        Console.WriteLine($"⚠️ Error configurando BD ({databaseProvider}): {dbEx.Message}");
                    }
                }

                Log.Logger = loggerConfig.CreateLogger();
                builder.Logging.ClearProviders();
                builder.Logging.AddSerilog(Log.Logger);

                Log.Information("=== Aplicación Hospital Iniciada ===");
                Log.Information("Ambiente: {Environment}", builder.Environment.EnvironmentName);
                Log.Information("Base de datos: {DatabaseProvider}", databaseProvider);

                return builder;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error configurando Serilog: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Configura el sink de base de datos según el proveedor especificado
        /// </summary>
        private static void ConfigureDatabaseSink(
            LoggerConfiguration loggerConfig,
            DatabaseProvider provider,
            string connectionString,
            LogEventLevel minLevel)
        {
            switch (provider)
            {
                case DatabaseProvider.SqlServer:
                    ConfigureSqlServerSink(loggerConfig, connectionString, minLevel);
                    break;

                case DatabaseProvider.PostgreSql:
                    ConfigurePostgreSqlSink(loggerConfig, connectionString, minLevel);
                    break;

                case DatabaseProvider.MySql:
                    ConfigureMySqlSink(loggerConfig, connectionString, minLevel);
                    break;

                default:
                    throw new NotSupportedException($"Proveedor de base de datos no soportado: {provider}");
            }
        }

        /// <summary>
        /// Configura el sink para SQL Server
        /// </summary>
        private static void ConfigureSqlServerSink(
            LoggerConfiguration loggerConfig,
            string connectionString,
            LogEventLevel minLevel)
        {
            var columnOptions = new Serilog.Sinks.MSSqlServer.ColumnOptions();
            columnOptions.Store.Remove(StandardColumn.Properties);
            columnOptions.Store.Add(StandardColumn.LogEvent);
            columnOptions.Store.Add(StandardColumn.TraceId);

            // Configurar tipos de datos
            columnOptions.Message.DataLength = 1000;
            columnOptions.Exception.DataLength = 2000;

            loggerConfig.WriteTo.MSSqlServer(
                connectionString: connectionString,
                sinkOptions: new MSSqlServerSinkOptions
                {
                    TableName = "Logs",
                    SchemaName = "dbo",
                    AutoCreateSqlTable = true
                },
                columnOptions: columnOptions,
                restrictedToMinimumLevel: minLevel);
        }

        /// <summary>
        /// Configura el sink para PostgreSQL
        /// </summary>
        private static void ConfigurePostgreSqlSink(
            LoggerConfiguration loggerConfig,
            string connectionString,
            LogEventLevel minLevel)
        {
            // Definir las columnas para PostgreSQL
            var columnsInfo = new Dictionary<string, ColumnWriterBase>
            {
                { "timestamp", new TimestampColumnWriter(NpgsqlDbType.TimestampTz) },
                { "level", new LevelColumnWriter(true, NpgsqlDbType.Varchar) },
                { "message", new RenderedMessageColumnWriter(NpgsqlDbType.Text) },
                { "message_template", new MessageTemplateColumnWriter(NpgsqlDbType.Text) },
                { "exception", new ExceptionColumnWriter(NpgsqlDbType.Text) },
                { "properties", new LogEventSerializedColumnWriter(NpgsqlDbType.Jsonb) }
            };

            loggerConfig.WriteTo.PostgreSQL(
                connectionString: connectionString,
                tableName: "logs",
                columnOptions: columnsInfo,
                needAutoCreateTable: true,
                restrictedToMinimumLevel: minLevel);
        }

        /// <summary>
        /// Configura el sink para MySQL
        /// </summary>
        private static void ConfigureMySqlSink(
            LoggerConfiguration loggerConfig,
            string connectionString,
            LogEventLevel minLevel)
        {
            loggerConfig.WriteTo.MySQL(
                connectionString: connectionString,
                tableName: "Logs",
                restrictedToMinimumLevel: minLevel,
                storeTimestampInUtc: true);
        }

        private static LogEventLevel ParseLogLevel(string level)
        {
            return level.ToLower() switch
            {
                "verbose" => LogEventLevel.Verbose,
                "debug" => LogEventLevel.Debug,
                "information" => LogEventLevel.Information,
                "warning" => LogEventLevel.Warning,
                "error" => LogEventLevel.Error,
                "fatal" => LogEventLevel.Fatal,
                _ => LogEventLevel.Information
            };
        }

        private static void ApplyDynamicLogLevels(LoggerConfiguration loggerConfig, IConfigurationSection logLevelSection)
        {
            if (logLevelSection == null)
                return;

            var children = logLevelSection.GetChildren();

            foreach (var child in children)
            {
                var namespace_ = child.Key;
                var levelValue = child.Value;

                if (string.IsNullOrWhiteSpace(namespace_) || string.IsNullOrWhiteSpace(levelValue))
                    continue;

                if (namespace_.Equals("Default", StringComparison.OrdinalIgnoreCase))
                    continue;

                var level = ParseLogLevel(levelValue);
                loggerConfig.MinimumLevel.Override(namespace_, level);

                Console.WriteLine($"   ℹ️ Nivel '{namespace_}': {level}");
            }
        }

        public static Serilog.ILogger GetLogger<T>() => Log.ForContext<T>();
    }
}
