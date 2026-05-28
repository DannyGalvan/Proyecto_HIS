using Hospital.Server.Attributes;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Security.Authorization;
using Hospital.Server.Services.Interfaces;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Server.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    [ModuleInfo(
        DisplayName = "Despacho Farmacia",
        Description = "Gestión de despacho de medicamentos",
        Icon = "bi-bag-check",
        Path = "dispense",
        Order = 21,
        IsVisible = true
    )]
    public class DispenseController : CrudController<Dispense, DispenseRequest, DispenseResponse, long>
    {
        private readonly DataContext _db;

        public DispenseController(
            IEntityService<Dispense, DispenseRequest, long> service,
            IMapper mapper,
            DataContext db) : base(service, mapper)
        {
            _db = db;
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Despachos", Description = "Obtiene la lista de despachos de medicamentos", Icon = "bi-list", Path = "dispense", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Despacho", Description = "Obtiene los detalles de un despacho de medicamentos", Icon = "bi-eye", Path = "dispense/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Despacho", Description = "Crea un nuevo despacho de medicamentos", Icon = "bi-plus-circle", Path = "dispense/create", IsVisible = false)]
        public override IActionResult Create([FromBody] DispenseRequest request)
        {
            // Guard: prevent duplicate dispense for the same prescription
            if (request.PrescriptionId.HasValue && request.PrescriptionId > 0)
            {
                bool alreadyDispensed = _db.Dispenses
                    .Any(d => d.PrescriptionId == request.PrescriptionId.Value && d.State == 1);

                if (alreadyDispensed)
                    return BadRequest(new
                    {
                        Success = false,
                        Message = $"La receta #{request.PrescriptionId} ya fue despachada anteriormente. No se puede despachar una receta más de una vez."
                    });
            }

            // Set pharmacist from JWT if not provided by client
            if (!request.PharmacistId.HasValue || request.PharmacistId <= 0)
                request.PharmacistId = GetUserId();

            // Default dispense status to 1 (dispensed) if not provided
            if (!request.DispenseStatus.HasValue)
                request.DispenseStatus = 1;

            // Resolve PatientId from Prescription → MedicalConsultation → Appointment chain
            if ((!request.PatientId.HasValue || request.PatientId <= 0) && request.PrescriptionId.HasValue)
            {
                var patientId = _db.Prescriptions
                    .Where(p => p.Id == request.PrescriptionId.Value)
                    .Select(p => p.Consultation != null
                        ? p.Consultation.Appointment != null
                            ? (long?)p.Consultation.Appointment.PatientId
                            : (long?)null
                        : (long?)null)
                    .FirstOrDefault();

                if (patientId.HasValue && patientId > 0)
                    request.PatientId = patientId;
            }

            return base.Create(request);
        }

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Despacho", Description = "Actualiza un despacho de medicamentos existente", Icon = "bi-pencil-square", Path = "dispense/update", IsVisible = false)]
        public override IActionResult Update([FromBody] DispenseRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Despacho", Description = "Actualiza parcialmente un despacho de medicamentos", Icon = "bi-pencil", Path = "dispense/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] DispenseRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Despacho", Description = "Elimina un despacho de medicamentos del sistema", Icon = "bi-trash", Path = "dispense/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);

        /// <summary>
        /// Punto de entrada para la selección de receta antes de despachar.
        /// No devuelve datos propios; la UI consume PrescriptionController.GetAll.
        /// Existe para que OperationSyncService registre la operación "dispense/select"
        /// y el frontend la muestre solo a roles con permiso de despacho.
        /// </summary>
        [HttpGet("select")]
        [RequireOperation]
        [OperationInfo(
            DisplayName = "Seleccionar Receta para Despacho",
            Description = "Pantalla de búsqueda y selección de receta pendiente antes de crear un despacho",
            Icon = "bi-search",
            Path = "dispense/select",
            IsVisible = false)]
        public IActionResult SelectPrescription()
        {
            return Ok(new { message = "Use the frontend to select a prescription for dispensing." });
        }
    }
}
