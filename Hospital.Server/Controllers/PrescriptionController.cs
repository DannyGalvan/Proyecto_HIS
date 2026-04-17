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
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    [ModuleInfo(
        DisplayName = "Recetas Médicas",
        Description = "Gestión de recetas médicas",
        Icon = "bi-prescription2",
        Path = "prescription",
        Order = 14,
        IsVisible = true
    )]
    public class PrescriptionController : CrudController<Prescription, PrescriptionRequest, PrescriptionResponse, long>
    {
        private readonly DataContext _db;
        private readonly IMapper _mapper;

        public PrescriptionController(
            IEntityService<Prescription, PrescriptionRequest, long> service,
            IMapper mapper,
            DataContext db) : base(service, mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Recetas", Description = "Obtiene la lista de recetas médicas", Icon = "bi-list", Path = "prescription", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Receta", Description = "Obtiene los detalles de una receta médica", Icon = "bi-eye", Path = "prescription/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Receta", Description = "Genera una nueva receta médica", Icon = "bi-plus-circle", Path = "prescription/create", IsVisible = false)]
        public override IActionResult Create([FromBody] PrescriptionRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Receta", Description = "Actualiza una receta médica existente", Icon = "bi-pencil-square", Path = "prescription/update", IsVisible = false)]
        public override IActionResult Update([FromBody] PrescriptionRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Receta", Description = "Actualiza parcialmente una receta médica", Icon = "bi-pencil", Path = "prescription/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] PrescriptionRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Receta", Description = "Elimina una receta médica del sistema", Icon = "bi-trash", Path = "prescription/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);

        /// <summary>
        /// Creates a prescription together with all its items in a single transaction.
        /// Validates that the consultation exists, is completed, and has no existing prescription.
        /// POST /api/v1/Prescription/with-items
        /// </summary>
        [HttpPost("with-items")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Receta con Medicamentos", Description = "Crea una receta médica con todos sus medicamentos en una sola operación", Icon = "bi-prescription2", Path = "prescription/create", IsVisible = false)]
        public async Task<IActionResult> CreateWithItems([FromBody] PrescriptionRequest request)
        {
            if (request.ConsultationId == null || request.ConsultationId <= 0)
                return BadRequest(new Response<string> { Success = false, Message = "ConsultationId es requerido." });

            // Validate consultation exists and is completed
            var consultation = await _db.MedicalConsultations
                .FirstOrDefaultAsync(c => c.Id == request.ConsultationId && c.State == 1);

            if (consultation == null)
                return BadRequest(new Response<string> { Success = false, Message = "La consulta médica no existe o no está activa." });

            if (consultation.ConsultationStatus != 1)
                return BadRequest(new Response<string> { Success = false, Message = "La consulta médica debe estar finalizada antes de crear una receta." });

            // Validate no existing prescription for this consultation
            bool alreadyExists = await _db.Prescriptions
                .AnyAsync(p => p.ConsultationId == request.ConsultationId && p.State == 1);

            if (alreadyExists)
                return Conflict(new Response<string> { Success = false, Message = "Esta consulta ya tiene una receta médica. Solo puede existir una receta por consulta." });

            if (request.Items == null || request.Items.Count == 0)
                return BadRequest(new Response<string> { Success = false, Message = "Debe incluir al menos un medicamento en la receta." });

            long userId = GetUserId();

            var prescription = new Prescription
            {
                ConsultationId = request.ConsultationId.Value,
                DoctorId = request.DoctorId ?? userId,
                PrescriptionDate = request.PrescriptionDate ?? DateTime.UtcNow,
                Notes = request.Notes,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId,
                Items = request.Items.Select(i => new PrescriptionItem
                {
                    MedicineName = i.MedicineName ?? string.Empty,
                    Dosage = i.Dosage ?? string.Empty,
                    Frequency = i.Frequency ?? string.Empty,
                    Duration = i.Duration ?? string.Empty,
                    SpecialInstructions = i.SpecialInstructions,
                    State = 1,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId,
                }).ToList()
            };

            _db.Prescriptions.Add(prescription);
            await _db.SaveChangesAsync();

            // Reload with items for the response
            var saved = await _db.Prescriptions
                .Include(p => p.Items)
                .FirstAsync(p => p.Id == prescription.Id);

            return Ok(new Response<PrescriptionResponse>
            {
                Success = true,
                Message = "Receta creada correctamente con todos sus medicamentos.",
                Data = _mapper.Map<Prescription, PrescriptionResponse>(saved),
                TotalResults = 1
            });
        }

        /// <summary>
        /// Returns the prescription for a given consultation (if any).
        /// GET /api/v1/Prescription/by-consultation/{consultationId}
        /// </summary>
        [HttpGet("by-consultation/{consultationId}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Receta por Consulta", Description = "Obtiene la receta de una consulta médica", Icon = "bi-search", Path = "prescription/view", IsVisible = false)]
        public async Task<IActionResult> GetByConsultation(long consultationId)
        {
            var prescription = await _db.Prescriptions
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.ConsultationId == consultationId && p.State == 1);

            if (prescription == null)
                return Ok(new Response<PrescriptionResponse> { Success = true, Message = "No existe receta para esta consulta.", Data = null });

            return Ok(new Response<PrescriptionResponse>
            {
                Success = true,
                Message = "Receta obtenida correctamente.",
                Data = _mapper.Map<Prescription, PrescriptionResponse>(prescription),
                TotalResults = 1
            });
        }
    }
}
