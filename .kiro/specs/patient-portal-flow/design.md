# Documento de Diseño — Flujo del Portal del Paciente (HIS)

## Resumen

Este documento describe el diseño técnico completo para el flujo del Portal del Paciente en el Sistema Informático Hospitalario (HIS). El sistema requiere un nuevo controlador dedicado en el backend (ASP.NET Core 8), un servicio de lógica de negocio, DTOs y validadores específicos, más un conjunto de páginas y componentes en el frontend (React + TypeScript + Vite) que permitan al paciente externo registrarse, autenticarse, agendar citas con calendario dinámico, pagar en línea y recibir confirmación por correo.

