# Guía de Uso del Sistema de Logging

## 📚 Índice
1. [Configuración Básica](#configuración-básica)
2. [Uso en Controladores](#uso-en-controladores)
3. [Uso en Servicios](#uso-en-servicios)
4. [Niveles de Log](#niveles-de-log)
5. [Contexto Enriquecido](#contexto-enriquecido)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [Mejores Prácticas](#mejores-prácticas)

## ⚙️ Configuración Básica

El sistema de logging ya está configurado y activado en `Program.cs`:

```csharp
// Se configura automáticamente al iniciar la aplicación
builder.AddLoggingConfiguration();
```

## 🎮 Uso en Controladores

### Opción 1: Inyección de Dependencias (Recomendado)

```csharp
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Server.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PacienteController : ControllerBase
    {
        private readonly ILogger<PacienteController> _logger;
        private readonly IPacienteService _pacienteService;

        public PacienteController(
            ILogger<PacienteController> logger,
            IPacienteService pacienteService)
        {
            _logger = logger;
            _pacienteService = pacienteService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetPaciente(int id)
        {
            _logger.LogInformation("Consultando paciente {PacienteId}", id);
            
            try
            {
                var paciente = await _pacienteService.GetByIdAsync(id);
                
                if (paciente == null)
                {
                    _logger.LogWarning("Paciente {PacienteId} no encontrado", id);
                    return NotFound();
                }
                
                _logger.LogDebug("Paciente {PacienteId} encontrado: {@Paciente}", id, paciente);
                return Ok(paciente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al consultar paciente {PacienteId}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreatePaciente([FromBody] PacienteRequest request)
        {
            _logger.LogInformation("Creando nuevo paciente: {Nombre}", request.Nombre);
            
            try
            {
                var paciente = await _pacienteService.CreateAsync(request);
                
                _logger.LogInformation(
                    "Paciente creado exitosamente. Id: {PacienteId}, Nombre: {Nombre}",
                    paciente.Id,
                    paciente.Nombre);
                
                return CreatedAtAction(nameof(GetPaciente), new { id = paciente.Id }, paciente);
            }
            catch (ValidationException vex)
            {
                _logger.LogWarning(vex, "Validación fallida al crear paciente: {Nombre}", request.Nombre);
                return BadRequest(vex.Errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al crear paciente: {Nombre}", request.Nombre);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePaciente(int id)
        {
            _logger.LogWarning("Solicitando eliminación de paciente {PacienteId}", id);
            
            try
            {
                await _pacienteService.DeleteAsync(id);
                
                _logger.LogInformation("Paciente {PacienteId} eliminado exitosamente", id);
                return NoContent();
            }
            catch (NotFoundException)
            {
                _logger.LogWarning("Intento de eliminar paciente inexistente {PacienteId}", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar paciente {PacienteId}", id);
                return StatusCode(500);
            }
        }
    }
}
```

### Opción 2: Usando el Helper Estático

```csharp
using Hospital.Server.Context.Config;
using Serilog;

namespace Hospital.Server.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CitaController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly ICitaService _citaService;

        public CitaController(ICitaService citaService)
        {
            _logger = LoggingExtensions.GetLogger<CitaController>();
            _citaService = citaService;
        }

        [HttpGet]
        public async Task<ActionResult> GetCitas([FromQuery] DateTime fecha)
        {
            _logger.Information("Consultando citas para fecha {Fecha}", fecha);
            
            var citas = await _citaService.GetByFechaAsync(fecha);
            
            _logger.Information("Se encontraron {Total} citas para {Fecha}", citas.Count, fecha);
            
            return Ok(citas);
        }
    }
}
```

## 🔧 Uso en Servicios

```csharp
using Serilog;

namespace Hospital.Server.Services
{
    public class PacienteService : IPacienteService
    {
        private readonly ILogger<PacienteService> _logger;
        private readonly DataContext _context;

        public PacienteService(
            ILogger<PacienteService> logger,
            DataContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<Paciente> CreateAsync(PacienteRequest request)
        {
            _logger.LogDebug("Iniciando creación de paciente: {@Request}", request);
            
            // Validar duplicados
            var existe = await _context.Pacientes
                .AnyAsync(p => p.DNI == request.DNI);
            
            if (existe)
            {
                _logger.LogWarning(
                    "Intento de crear paciente duplicado. DNI: {DNI}",
                    request.DNI);
                throw new DuplicateException("Ya existe un paciente con ese DNI");
            }

            var paciente = new Paciente
            {
                Nombre = request.Nombre,
                DNI = request.DNI,
                FechaNacimiento = request.FechaNacimiento
            };

            _context.Pacientes.Add(paciente);
            
            try
            {
                await _context.SaveChangesAsync();
                
                _logger.LogInformation(
                    "Paciente creado: Id={Id}, DNI={DNI}, Nombre={Nombre}",
                    paciente.Id,
                    paciente.DNI,
                    paciente.Nombre);
                
                return paciente;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(
                    ex,
                    "Error de base de datos al guardar paciente. DNI: {DNI}",
                    request.DNI);
                throw;
            }
        }

        public async Task<List<Paciente>> BuscarAsync(string criterio)
        {
            var sw = Stopwatch.StartNew();
            
            _logger.LogInformation("Iniciando búsqueda de pacientes: {Criterio}", criterio);
            
            var pacientes = await _context.Pacientes
                .Where(p => p.Nombre.Contains(criterio) || p.DNI.Contains(criterio))
                .ToListAsync();
            
            sw.Stop();
            
            _logger.LogInformation(
                "Búsqueda completada. Encontrados: {Total}, Tiempo: {Elapsed}ms, Criterio: {Criterio}",
                pacientes.Count,
                sw.ElapsedMilliseconds,
                criterio);
            
            return pacientes;
        }
    }
}
```

## 📊 Niveles de Log

### 1. Verbose (Muy Detallado)
Información extremadamente detallada, útil solo en debugging profundo.

```csharp
_logger.LogTrace("Entrando al método CalcularEdad con fecha: {Fecha}", fechaNacimiento);
```

### 2. Debug (Depuración)
Información útil durante el desarrollo y debugging.

```csharp
_logger.LogDebug("Parámetros de búsqueda: Nombre={Nombre}, Edad={Edad}", nombre, edad);
_logger.LogDebug("Resultado de consulta: {@Resultado}", resultado);
```

### 3. Information (Información)
Información general del flujo de la aplicación.

```csharp
_logger.LogInformation("Usuario {UserId} inició sesión", userId);
_logger.LogInformation("Procesados {Total} registros en {Tiempo}ms", total, tiempo);
```

### 4. Warning (Advertencia)
Situaciones anormales pero no críticas.

```csharp
_logger.LogWarning("Paciente {PacienteId} no encontrado en caché, consultando BD", id);
_logger.LogWarning("Límite de intentos alcanzado para usuario {Username}", username);
```

### 5. Error (Error)
Errores que impiden completar una operación.

```csharp
_logger.LogError(ex, "Error al procesar pago {PagoId}", pagoId);
_logger.LogError("Falló validación: {Errores}", string.Join(", ", errores));
```

### 6. Fatal (Crítico)
Errores graves que pueden causar fallo de la aplicación.

```csharp
_logger.LogCritical(ex, "Error crítico: Base de datos inaccesible");
_logger.LogCritical("Memoria insuficiente para continuar procesamiento");
```

## 🎯 Contexto Enriquecido

### Propiedades Estructuradas

```csharp
// ✅ CORRECTO - Propiedades estructuradas
_logger.LogInformation(
    "Venta completada: Id={VentaId}, Cliente={ClienteId}, Total={Total:C}, Items={Items}",
    venta.Id,
    venta.ClienteId,
    venta.Total,
    venta.Items.Count);

// ❌ INCORRECTO - String interpolation (no consultable en BD)
_logger.LogInformation($"Venta {venta.Id} completada para cliente {venta.ClienteId}");
```

### Serialización de Objetos Completos

```csharp
// Usar @ para serializar el objeto completo
_logger.LogDebug("Request recibido: {@Request}", request);
_logger.LogDebug("Configuración cargada: {@Config}", configuration);

// Sin @ solo serializa ToString()
_logger.LogDebug("Request recibido: {Request}", request); // Solo muestra el tipo
```

### Agregar Contexto Global

```csharp
using (LogContext.PushProperty("UserId", currentUserId))
using (LogContext.PushProperty("TenantId", tenantId))
{
    _logger.LogInformation("Procesando operación");
    // Todos los logs dentro de este bloque tendrán UserId y TenantId
}
```

## 💡 Ejemplos Prácticos

### Logging en Operaciones de Base de Datos

```csharp
public async Task<bool> UpdatePacienteAsync(int id, PacienteRequest request)
{
    using (_logger.BeginScope("UpdatePaciente - Id:{PacienteId}", id))
    {
        _logger.LogInformation("Iniciando actualización");
        
        var paciente = await _context.Pacientes.FindAsync(id);
        
        if (paciente == null)
        {
            _logger.LogWarning("Paciente no encontrado");
            return false;
        }

        var cambios = new List<string>();
        
        if (paciente.Nombre != request.Nombre)
        {
            cambios.Add($"Nombre: '{paciente.Nombre}' -> '{request.Nombre}'");
            paciente.Nombre = request.Nombre;
        }
        
        if (cambios.Any())
        {
            _logger.LogInformation("Cambios detectados: {Cambios}", string.Join(", ", cambios));
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Paciente actualizado exitosamente");
        }
        else
        {
            _logger.LogDebug("No se detectaron cambios");
        }
        
        return true;
    }
}
```

### Logging de Performance

```csharp
public async Task<List<Reporte>> GenerarReporteAsync(DateTime inicio, DateTime fin)
{
    var sw = Stopwatch.StartNew();
    
    _logger.LogInformation(
        "Generando reporte desde {Inicio:yyyy-MM-dd} hasta {Fin:yyyy-MM-dd}",
        inicio,
        fin);
    
    try
    {
        var datos = await _context.Ventas
            .Where(v => v.Fecha >= inicio && v.Fecha <= fin)
            .ToListAsync();
        
        sw.Stop();
        
        _logger.LogInformation(
            "Reporte generado exitosamente. Registros: {Total}, Tiempo: {Elapsed}ms",
            datos.Count,
            sw.ElapsedMilliseconds);
        
        if (sw.ElapsedMilliseconds > 5000)
        {
            _logger.LogWarning(
                "Reporte tardó más de 5 segundos: {Elapsed}ms",
                sw.ElapsedMilliseconds);
        }
        
        return datos;
    }
    catch (Exception ex)
    {
        sw.Stop();
        
        _logger.LogError(
            ex,
            "Error generando reporte. Tiempo antes del error: {Elapsed}ms",
            sw.ElapsedMilliseconds);
        
        throw;
    }
}
```

### Logging en Background Services

```csharp
public class CleanupBackgroundService : BackgroundService
{
    private readonly ILogger<CleanupBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public CleanupBackgroundService(
        ILogger<CleanupBackgroundService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("CleanupBackgroundService iniciado");
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Iniciando limpieza de datos temporales");
                
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<DataContext>();
                    
                    var deleted = await context.Database
                        .ExecuteSqlRawAsync(
                            "DELETE FROM TempData WHERE CreatedAt < DATEADD(DAY, -7, GETUTCDATE())",
                            stoppingToken);
                    
                    _logger.LogInformation(
                        "Limpieza completada. Registros eliminados: {Deleted}",
                        deleted);
                }
                
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en CleanupBackgroundService");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
        
        _logger.LogInformation("CleanupBackgroundService detenido");
    }
}
```

## ✅ Mejores Prácticas

### ✅ DO (Hacer)

```csharp
// 1. Usar propiedades estructuradas
_logger.LogInformation("Usuario {UserId} creó orden {OrderId}", userId, orderId);

// 2. Incluir contexto relevante
_logger.LogError(ex, "Error procesando pago {PaymentId} para cliente {ClienteId}", 
    paymentId, clienteId);

// 3. Usar niveles apropiados
_logger.LogWarning("Stock bajo para producto {ProductId}: {Stock} unidades", 
    productId, stock);

// 4. Serializar objetos con @
_logger.LogDebug("Request recibido: {@Request}", request);

// 5. Medir tiempo de operaciones importantes
var sw = Stopwatch.StartNew();
// ... operación ...
_logger.LogInformation("Operación completada en {Elapsed}ms", sw.ElapsedMilliseconds);
```

### ❌ DON'T (No hacer)

```csharp
// 1. ❌ NO usar string interpolation
_logger.LogInformation($"Usuario {userId} creó orden {orderId}");

// 2. ❌ NO logear información sensible
_logger.LogInformation("Password: {Password}", password); // NUNCA!
_logger.LogDebug("Request: {@Request}", request); // Si contiene contraseñas

// 3. ❌ NO logear en loops intensivos
for (int i = 0; i < 1000000; i++)
{
    _logger.LogDebug("Procesando item {Index}", i); // Genera millones de logs
}

// 4. ❌ NO usar Debug/Trace en producción para operaciones comunes
_logger.LogDebug("Método GetAll llamado"); // Innecesario en producción

// 5. ❌ NO capturar exceptions solo para logear
try 
{
    // código
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error");
    // ❌ No hacer nada más - la exception se pierde
}
```

## 🔍 Consultar Logs

Ver [MULTI_DATABASE_LOGGING.md](./MULTI_DATABASE_LOGGING.md#-consultar-logs) para consultas SQL específicas por base de datos.

## 📚 Referencias

- [Serilog Best Practices](https://github.com/serilog/serilog/wiki/Writing-Log-Events)
- [Structured Logging](https://github.com/serilog/serilog/wiki/Structured-Data)
- [Configuration](./MULTI_DATABASE_LOGGING.md)
