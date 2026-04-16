# Instrucciones de Deployment - Solución para rutas SPA

## Problema Resuelto
Se corrigió el problema donde acceder directamente a rutas como `/auth` en producción retornaba un error JSON en lugar de mostrar la aplicación frontend.

## Cambios Realizados

### 1. Configuración de Nginx Actualizada
El archivo `hospital.nginx.conf` ahora:
- **Sirve archivos estáticos directamente** desde nginx (más rápido)
- **Solo proxea rutas `/api/` al backend** .NET
- **Redirige todas las rutas desconocidas a `index.html`** para que el router del frontend las maneje (SPA fallback)

## Pasos para Aplicar en Producción

### Paso 1: Copiar el archivo de configuración actualizado
```bash
# En tu servidor de producción, copia el nuevo archivo de configuración
sudo cp hospital.nginx.conf /etc/nginx/sites-available/his-salud.duckdns.org
```

### Paso 2: Verificar la ruta de los archivos estáticos
Asegúrate de que en el archivo `/etc/nginx/sites-available/his-salud.duckdns.org` la línea `root` apunte a donde están los archivos del frontend:

```nginx
root /var/www/hospital/wwwroot;
```

**Ajusta esta ruta según tu configuración:**
- Si usas el output de Vite directamente: apunta a `hospital.client/dist`
- Si copias los archivos a `wwwroot`: apunta a donde estén en tu servidor

### Paso 3: Asegurarte de que los archivos del frontend estén en el lugar correcto
```bash
# Ejemplo: Copiar archivos compilados de Vite al directorio que sirve nginx
# (Ajusta las rutas según tu estructura)
sudo mkdir -p /var/www/hospital/wwwroot
sudo cp -r /path/to/hospital.client/dist/* /var/www/hospital/wwwroot/
```

### Paso 4: Verificar la configuración de nginx
```bash
sudo nginx -t
```

Si todo está bien, deberías ver:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Paso 5: Recargar nginx
```bash
sudo systemctl reload nginx
# o
sudo service nginx reload
```

## Estructura Final en Producción

```
/var/www/hospital/wwwroot/
├── index.html           <- Nginx sirve esto para todas las rutas no-API
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ... otros archivos estáticos

Backend .NET corriendo en http://127.0.0.1:5005
└── Solo maneja rutas /api/*
```

## Verificación

Después de aplicar los cambios, verifica que funcione:

1. **Ruta raíz:** https://his-salud.duckdns.org/ ✅ Debe mostrar la app
2. **Rutas del frontend:** https://his-salud.duckdns.org/auth ✅ Debe mostrar la app (no JSON error)
3. **API:** https://his-salud.duckdns.org/api/[endpoint] ✅ Debe responder JSON del backend

## Notas Importantes

### Si usas Docker
Si tu aplicación está dockerizada, asegúrate de:
1. Copiar los archivos del frontend al contenedor o montarlos como volumen
2. La ruta `root` en nginx debe apuntar a donde estén dentro del contenedor

### Si el backend también sirve archivos estáticos
El `Program.cs` de .NET ya tiene:
```csharp
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("/index.html");
```

**Opción alternativa:** En lugar de servir desde nginx, puedes dejar que .NET sirva todo:
- En nginx, usar solo `proxy_pass http://127.0.0.1:5005/` para todo
- Asegurarte de que los archivos del frontend estén en `Hospital.Server/wwwroot`
- El `MapFallbackToFile` se encargará del routing del SPA

### Build del Frontend
Antes de deployment, compila el frontend:
```bash
cd hospital.client
npm run build
```
Esto genera los archivos en `hospital.client/dist/`

### Permisos
Asegúrate de que nginx tenga permisos para leer los archivos:
```bash
sudo chown -R www-data:www-data /var/www/hospital/wwwroot
sudo chmod -R 755 /var/www/hospital/wwwroot
```

## Troubleshooting

### Si sigues viendo el error JSON:
1. Verifica que recargaste nginx: `sudo systemctl status nginx`
2. Verifica los logs: `sudo tail -f /var/log/nginx/error.log`
3. Verifica que el archivo de configuración está activo: `sudo nginx -T | grep his-salud`

### Si las rutas API no funcionan:
- Verifica que el backend esté corriendo: `curl http://127.0.0.1:5005/api/health`
- Revisa los logs del backend

### Si los archivos estáticos no cargan (404):
- Verifica la ruta `root` en nginx
- Verifica que `index.html` existe en esa ruta: `ls -la /var/www/hospital/wwwroot/index.html`
