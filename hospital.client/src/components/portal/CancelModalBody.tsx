export function CancelModalBody() {
  return (
    <div className="flex items-start gap-4 p-4">
      <i className="bi bi-exclamation-triangle text-red-500 text-3xl shrink-0" />
      <div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          ¿Está seguro que desea cancelar esta cita?
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Recibirá un correo de confirmación y los fondos serán reintegrados
          según los términos del servicio.
        </p>
      </div>
    </div>
  );
}
