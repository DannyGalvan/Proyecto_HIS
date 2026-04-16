-- ====================================================================
-- Scripts SQL para Tablas de Logs de Serilog
-- Soporta: SQL Server, PostgreSQL, MySQL
-- ====================================================================

-- ====================================================================
-- SQL SERVER
-- ====================================================================

-- Crear tabla de Logs en SQL Server
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Logs' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [dbo].[Logs] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [Message] NVARCHAR(1000) NULL,
        [MessageTemplate] NVARCHAR(MAX) NULL,
        [Level] NVARCHAR(128) NULL,
        [TimeStamp] DATETIME2(7) NOT NULL,
        [Exception] NVARCHAR(2000) NULL,
        [LogEvent] NVARCHAR(MAX) NULL,
        [TraceId] NVARCHAR(128) NULL,
        
        CONSTRAINT [PK_Logs] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    
    -- Índices para mejorar rendimiento
    CREATE NONCLUSTERED INDEX [IX_Logs_TimeStamp] 
        ON [dbo].[Logs]([TimeStamp] DESC);
    
    CREATE NONCLUSTERED INDEX [IX_Logs_Level] 
        ON [dbo].[Logs]([Level]);
    
    CREATE NONCLUSTERED INDEX [IX_Logs_Level_TimeStamp] 
        ON [dbo].[Logs]([Level], [TimeStamp] DESC);
    
    PRINT 'Tabla [dbo].[Logs] creada exitosamente';
END
ELSE
BEGIN
    PRINT 'La tabla [dbo].[Logs] ya existe';
END
GO

-- Vista para consultas comunes (SQL Server)
CREATE OR ALTER VIEW [dbo].[vw_RecentLogs]
AS
SELECT 
    Id,
    TimeStamp,
    Level,
    Message,
    Exception,
    TraceId
FROM [dbo].[Logs]
WHERE TimeStamp > DATEADD(DAY, -7, GETUTCDATE())
GO

-- Stored Procedure para limpiar logs antiguos (SQL Server)
CREATE OR ALTER PROCEDURE [dbo].[sp_CleanupOldLogs]
    @DaysToKeep INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DeletedRows INT;
    DECLARE @CutoffDate DATETIME2;
    
    SET @CutoffDate = DATEADD(DAY, -@DaysToKeep, GETUTCDATE());
    
    DELETE FROM [dbo].[Logs]
    WHERE TimeStamp < @CutoffDate;
    
    SET @DeletedRows = @@ROWCOUNT;
    
    PRINT 'Logs eliminados: ' + CAST(@DeletedRows AS VARCHAR(10));
    PRINT 'Fecha de corte: ' + CAST(@CutoffDate AS VARCHAR(30));
END
GO

-- Ejemplo de uso del SP:
-- EXEC [dbo].[sp_CleanupOldLogs] @DaysToKeep = 30;


-- ====================================================================
-- POSTGRESQL
-- ====================================================================

-- Crear tabla de Logs en PostgreSQL
CREATE TABLE IF NOT EXISTS public.logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    level VARCHAR(50) NOT NULL,
    message TEXT,
    message_template TEXT,
    exception TEXT,
    properties JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios para documentación
COMMENT ON TABLE public.logs IS 'Tabla de logs de Serilog';
COMMENT ON COLUMN public.logs.timestamp IS 'Fecha y hora del log con zona horaria';
COMMENT ON COLUMN public.logs.level IS 'Nivel del log (Verbose, Debug, Information, Warning, Error, Fatal)';
COMMENT ON COLUMN public.logs.message IS 'Mensaje del log renderizado';
COMMENT ON COLUMN public.logs.message_template IS 'Template del mensaje con placeholders';
COMMENT ON COLUMN public.logs.exception IS 'Detalles de la excepción si existe';
COMMENT ON COLUMN public.logs.properties IS 'Propiedades adicionales en formato JSON';

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_logs_timestamp 
    ON public.logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_logs_level 
    ON public.logs(level);

CREATE INDEX IF NOT EXISTS idx_logs_level_timestamp 
    ON public.logs(level, timestamp DESC);

-- Índice GIN para búsquedas en JSONB
CREATE INDEX IF NOT EXISTS idx_logs_properties_gin 
    ON public.logs USING GIN (properties);

-- Vista para consultas comunes (PostgreSQL)
CREATE OR REPLACE VIEW public.vw_recent_logs AS
SELECT 
    id,
    timestamp,
    level,
    message,
    exception,
    properties
FROM public.logs
WHERE timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- Función para limpiar logs antiguos (PostgreSQL)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE(deleted_count BIGINT, cutoff_date TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_cutoff_date TIMESTAMPTZ;
    v_deleted_count BIGINT;
BEGIN
    v_cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
    
    DELETE FROM public.logs
    WHERE timestamp < v_cutoff_date;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    deleted_count := v_deleted_count;
    cutoff_date := v_cutoff_date;
    
    RETURN NEXT;
    
    RAISE NOTICE 'Logs eliminados: %, Fecha de corte: %', v_deleted_count, v_cutoff_date;
END;
$$;

-- Ejemplo de uso:
-- SELECT * FROM public.cleanup_old_logs(30);

-- Búsquedas avanzadas en JSONB:
-- SELECT * FROM logs WHERE properties @> '{"UserId": "123"}';
-- SELECT * FROM logs WHERE properties->>'SourceContext' LIKE '%Hospital.Server%';


-- ====================================================================
-- MYSQL / MARIADB
-- ====================================================================

-- Crear tabla de Logs en MySQL
CREATE TABLE IF NOT EXISTS Logs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Timestamp DATETIME NOT NULL,
    Level VARCHAR(15) NOT NULL,
    Message TEXT,
    MessageTemplate TEXT,
    Exception TEXT,
    Properties TEXT,
    LogEvent TEXT,
    TraceId VARCHAR(128),
    SourceContext VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_timestamp (Timestamp DESC),
    INDEX idx_level (Level),
    INDEX idx_level_timestamp (Level, Timestamp DESC),
    INDEX idx_source_context (SourceContext)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para consultas comunes (MySQL)
CREATE OR REPLACE VIEW vw_recent_logs AS
SELECT 
    Id,
    Timestamp,
    Level,
    Message,
    Exception,
    TraceId,
    SourceContext
FROM Logs
WHERE Timestamp > DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY Timestamp DESC;

-- Stored Procedure para limpiar logs antiguos (MySQL)
DELIMITER //

CREATE PROCEDURE sp_cleanup_old_logs(IN days_to_keep INT)
BEGIN
    DECLARE deleted_rows INT;
    DECLARE cutoff_date DATETIME;
    
    SET cutoff_date = DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    
    DELETE FROM Logs WHERE Timestamp < cutoff_date;
    
    SET deleted_rows = ROW_COUNT();
    
    SELECT 
        deleted_rows AS DeletedRows,
        cutoff_date AS CutoffDate;
END //

DELIMITER ;

-- Ejemplo de uso:
-- CALL sp_cleanup_old_logs(30);


-- ====================================================================
-- CONSULTAS ÚTILES PARA TODOS LOS MOTORES
-- ====================================================================

-- SQL SERVER - Top 100 errores recientes
/*
SELECT TOP 100
    TimeStamp,
    Level,
    Message,
    Exception
FROM [dbo].[Logs]
WHERE Level IN ('Error', 'Fatal')
ORDER BY TimeStamp DESC;
*/

-- POSTGRESQL - Top 100 errores recientes
/*
SELECT 
    timestamp,
    level,
    message,
    exception
FROM public.logs
WHERE level IN ('Error', 'Fatal')
ORDER BY timestamp DESC
LIMIT 100;
*/

-- MYSQL - Top 100 errores recientes
/*
SELECT 
    Timestamp,
    Level,
    Message,
    Exception
FROM Logs
WHERE Level IN ('Error', 'Fatal')
ORDER BY Timestamp DESC
LIMIT 100;
*/

-- ====================================================================
-- MANTENIMIENTO Y OPTIMIZACIÓN
-- ====================================================================

-- SQL SERVER - Estadísticas de logs por nivel
/*
SELECT 
    Level,
    COUNT(*) AS Total,
    MIN(TimeStamp) AS OldestLog,
    MAX(TimeStamp) AS NewestLog
FROM [dbo].[Logs]
GROUP BY Level
ORDER BY Total DESC;
*/

-- POSTGRESQL - Estadísticas de logs por nivel
/*
SELECT 
    level,
    COUNT(*) AS total,
    MIN(timestamp) AS oldest_log,
    MAX(timestamp) AS newest_log
FROM public.logs
GROUP BY level
ORDER BY total DESC;
*/

-- MYSQL - Estadísticas de logs por nivel
/*
SELECT 
    Level,
    COUNT(*) AS Total,
    MIN(Timestamp) AS OldestLog,
    MAX(Timestamp) AS NewestLog
FROM Logs
GROUP BY Level
ORDER BY Total DESC;
*/

-- ====================================================================
-- NOTAS IMPORTANTES
-- ====================================================================
/*
1. Serilog creará las tablas automáticamente si no existen
2. Estos scripts son útiles para:
   - Crear las tablas manualmente antes del primer despliegue
   - Entender la estructura de las tablas
   - Agregar índices personalizados
   - Crear vistas y procedimientos para mantenimiento

3. Recomendaciones:
   - Ejecutar sp_cleanup_old_logs/cleanup_old_logs periódicamente (job/cron)
   - Monitorear el tamaño de las tablas
   - Considerar particionado para bases de datos grandes
   - Ajustar los índices según patrones de consulta

4. Seguridad:
   - Restringir acceso de escritura a la tabla de logs
   - Considerar auditoría para DELETE en la tabla de logs
   - No logear información sensible
*/
