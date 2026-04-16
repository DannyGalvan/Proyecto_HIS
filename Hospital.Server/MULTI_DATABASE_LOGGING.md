# Configuración de Logging Multi-Base de Datos

## 📋 Resumen

El sistema de logging con Serilog ahora soporta **tres bases de datos diferentes**:
- ✅ **SQL Server**
- ✅ **PostgreSQL**
- ✅ **MySQL**

El sink de base de datos correcto se configura **automáticamente** según el `DatabaseProvider` configurado en `appsettings.json`.

## 🔧 Configuración

### 1. En `appsettings.json`

```json
{
  "DatabaseSettings": {
    "Provider": "SqlServer",  // o "PostgreSql" o "MySql"
    "ConnectionString": "...",
    "EnableAutoMigration": false
  },
  "SerilogLogger": {
    "MinimumLevel": "Information",
    "LogToConsole": true,
    "LogToFile": true,
    "LogToDatabase": true,
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information",
      "System": "Warning"
    }
  }
}
```

### 2. Valores Válidos para `Provider`

```csharp
"SqlServer"   // Microsoft SQL Server
"PostgreSql"  // PostgreSQL
"MySql"       // MySQL/MariaDB
```

## 📊 Estructura de Tablas

### SQL Server
```sql
CREATE TABLE [dbo].[Logs] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Message] NVARCHAR(1000),
    [MessageTemplate] NVARCHAR(MAX),
    [Level] NVARCHAR(128),
    [TimeStamp] DATETIME2(7),
    [Exception] NVARCHAR(2000),
    [LogEvent] NVARCHAR(MAX),
    [TraceId] NVARCHAR(128)
);
```

### PostgreSQL
```sql
CREATE TABLE logs (
    timestamp TIMESTAMPTZ NOT NULL,
    level VARCHAR(50) NOT NULL,
    message TEXT,
    message_template TEXT,
    exception TEXT,
    properties JSONB
);
```

### MySQL
```sql
CREATE TABLE Logs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Timestamp DATETIME NOT NULL,
    Level VARCHAR(15) NOT NULL,
    Message TEXT,
    Exception TEXT,
    Properties TEXT,
    LogEvent TEXT
);
```

## 🚀 Uso en el Código

### Activar Logging en `Program.cs`

```csharp
// Ya está configurado si usas la plantilla actual
builder.AddLoggingConfiguration();
```

### Usar el Logger en tus Clases

```csharp
using Serilog;

public class MiServicio
{
    private readonly ILogger _logger;

    public MiServicio()
    {
        _logger = Log.ForContext<MiServicio>();
    }

    public void MiMetodo()
    {
        _logger.Information("Operación iniciada");
        
        try
        {
            // Tu código aquí
            _logger.Debug("Detalle de debug: {Valor}", miValor);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error en MiMetodo");
            throw;
        }
    }
}
```

### O usando el Helper Estático

```csharp
using Hospital.Server.Context.Config;

var logger = LoggingExtensions.GetLogger<MiClase>();
logger.Information("Mensaje de log");
```

## 📝 Niveles de Log

```csharp
logger.Verbose("Muy detallado");     // Desarrollo detallado
logger.Debug("Debug");                // Información de debug
logger.Information("Info");           // Información general
logger.Warning("Advertencia");        // Advertencias
logger.Error(ex, "Error");            // Errores
logger.Fatal(ex, "Fatal");            // Errores críticos
```

## 🔄 Cambiar de Base de Datos

### Desarrollo (appsettings.Development.json)
```json
{
  "DatabaseSettings": {
    "Provider": "SqlServer",
    "ConnectionString": "Server=localhost;Database=HospitalDev;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

### Producción (appsettings.Production.json)
```json
{
  "DatabaseSettings": {
    "Provider": "PostgreSql",
    "ConnectionString": "Host=prod-db.example.com;Database=hospital;Username=app;Password=***"
  }
}
```

### MySQL (appsettings.json)
```json
{
  "DatabaseSettings": {
    "Provider": "MySql",
    "ConnectionString": "Server=localhost;Database=hospital;User=root;Password=***"
  }
}
```

## 🎯 Características por Base de Datos

### SQL Server
- ✅ Auto-creación de tabla
- ✅ Columnas estructuradas (Message, Exception, Level, etc.)
- ✅ LogEvent serializado completo
- ✅ TraceId para correlación
- 📊 Schema: `dbo`
- 📋 Tabla: `Logs`

### PostgreSQL
- ✅ Auto-creación de tabla
- ✅ Timestamps con zona horaria
- ✅ Propiedades en formato JSONB (búsquedas eficientes)
- ✅ Columnas de texto ilimitado
- 📊 Schema: `public` (por defecto)
- 📋 Tabla: `logs`

### MySQL
- ✅ Auto-creación de tabla
- ✅ Timestamps en UTC
- ✅ Compatibilidad con MariaDB
- ✅ Propiedades serializadas
- 📊 Schema: según database
- 📋 Tabla: `Logs`

## 🔍 Consultar Logs

### SQL Server
```sql
-- Logs de las últimas 24 horas
SELECT TOP 100
    TimeStamp,
    Level,
    Message,
    Exception
FROM Logs
WHERE TimeStamp > DATEADD(HOUR, -24, GETUTCDATE())
ORDER BY TimeStamp DESC;

-- Errores y fatales
SELECT *
FROM Logs
WHERE Level IN ('Error', 'Fatal')
ORDER BY TimeStamp DESC;
```

### PostgreSQL
```sql
-- Logs de las últimas 24 horas
SELECT
    timestamp,
    level,
    message,
    exception
FROM logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 100;

-- Buscar en propiedades JSON
SELECT *
FROM logs
WHERE properties @> '{"UserId": "123"}';

-- Errores y fatales
SELECT *
FROM logs
WHERE level IN ('Error', 'Fatal')
ORDER BY timestamp DESC;
```

### MySQL
```sql
-- Logs de las últimas 24 horas
SELECT *
FROM Logs
WHERE Timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY Timestamp DESC
LIMIT 100;

-- Errores y fatales
SELECT *
FROM Logs
WHERE Level IN ('Error', 'Fatal')
ORDER BY Timestamp DESC;
```

## 📦 Paquetes NuGet Requeridos

Todos estos paquetes ya están instalados en el proyecto:

```xml
<PackageReference Include="Serilog" Version="4.3.0" />
<PackageReference Include="Serilog.Extensions.Logging" Version="9.0.1" />
<PackageReference Include="Serilog.Sinks.Console" Version="6.1.1" />
<PackageReference Include="Serilog.Sinks.File" Version="7.0.0" />

<!-- SQL Server -->
<PackageReference Include="Serilog.Sinks.MSSqlServer" Version="8.2.0" />

<!-- PostgreSQL -->
<PackageReference Include="Serilog.Sinks.PostgreSQL" Version="2.3.0" />

<!-- MySQL -->
<PackageReference Include="Serilog.Sinks.MySQL" Version="5.0.0" />
```

## 🛠️ Troubleshooting

### Los logs no aparecen en la base de datos

1. **Verificar conexión:**
   ```bash
   # SQL Server
   sqlcmd -S localhost -d HospitalDb -U sa -P yourPassword
   
   # PostgreSQL
   psql -h localhost -U postgres -d hospital
   
   # MySQL
   mysql -h localhost -u root -p hospital
   ```

2. **Verificar que la tabla existe:**
   ```sql
   -- SQL Server
   SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Logs';
   
   -- PostgreSQL
   SELECT * FROM information_schema.tables WHERE table_name = 'logs';
   
   -- MySQL
   SHOW TABLES LIKE 'Logs';
   ```

3. **Verificar configuración:**
   - `LogToDatabase` debe ser `true` en `appsettings.json`
   - `ConnectionString` debe ser válida
   - `Provider` debe coincidir con la base de datos real

4. **Ver mensajes de consola:**
   Al iniciar la aplicación deberías ver:
   ```
   ✅ Serilog: Configurado para escribir en CONSOLA
   ✅ Serilog: Configurado para escribir en ARCHIVO (7 días)
   ✅ Serilog: Configurado para escribir en BASE DE DATOS (PostgreSql)
   ```

### Error: "Proveedor de base de datos no soportado"

Verifica que el valor en `DatabaseSettings.Provider` sea exactamente:
- `"SqlServer"` (no `"SQL Server"` ni `"SQLSERVER"`)
- `"PostgreSql"` (no `"Postgres"` ni `"PostgreSQL"`)
- `"MySql"` (no `"MySQL"` ni `"mysql"`)

### Tabla no se crea automáticamente

- **SQL Server:** La tabla se crea automáticamente (`AutoCreateSqlTable = true`)
- **PostgreSQL:** La tabla se crea automáticamente (`needAutoCreateTable: true`)
- **MySQL:** La tabla se crea automáticamente

Si no se crea, verifica los permisos del usuario de la base de datos.

## 📊 Mejores Prácticas

1. **En Desarrollo:**
   ```json
   {
     "SerilogLogger": {
       "MinimumLevel": "Debug",
       "LogToConsole": true,
       "LogToFile": true,
       "LogToDatabase": true
     }
   }
   ```

2. **En Producción:**
   ```json
   {
     "SerilogLogger": {
       "MinimumLevel": "Information",
       "LogToConsole": false,  // O true si usas docker logs
       "LogToFile": true,
       "LogToDatabase": true
     }
   }
   ```

3. **Usar contexto enriquecido:**
   ```csharp
   _logger.Information("Usuario {UserId} realizó acción {Action}", 
       userId, actionName);
   ```

4. **Limpieza periódica en producción:**
   ```sql
   -- SQL Server: Borrar logs > 30 días
   DELETE FROM Logs WHERE TimeStamp < DATEADD(DAY, -30, GETUTCDATE());
   
   -- PostgreSQL: Borrar logs > 30 días
   DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '30 days';
   
   -- MySQL: Borrar logs > 30 días
   DELETE FROM Logs WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);
   ```

## 🔐 Seguridad

- No logear información sensible (contraseñas, tokens, datos personales)
- Usar niveles de log apropiados
- Configurar retención de logs adecuada
- Restringir acceso a las tablas de logs
- Considerar encriptación de logs en reposo

## 📚 Recursos

- [Serilog Documentation](https://serilog.net/)
- [Serilog.Sinks.MSSqlServer](https://github.com/serilog-mssql/serilog-sinks-mssqlserver)
- [Serilog.Sinks.PostgreSQL](https://github.com/b00ted/serilog-sinks-postgresql)
- [Serilog.Sinks.MySQL](https://github.com/saleem-mirza/serilog-sinks-mysql)
