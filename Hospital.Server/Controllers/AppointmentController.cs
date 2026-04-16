using Hospital.Server.Attributes;
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
        DisplayName = "Citas Médicas",
        Description = "Gestión de citas médicas del hospital",
        Icon = "bi-calendar-check",
        Path = "appointment",
        Order = 9,
        IsVisible = true
    )]
    public class AppointmentController : CrudController<Appointment, AppointmentRequest, AppointmentResponse, long>
    {
        public AppointmentController(
            IEntityService<Appointment, AppointmentRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Citas", Description = "Obtiene la lista de citas médicas con paginación y filtros", Icon = "bi-list", Path = "appointment", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Cita", Description = "Obtiene los detalles de una cita específica", Icon = "bi-eye", Path = "appointment/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Cita", Description = "Registra una nueva cita médica en el sistema", Icon = "bi-plus-circle", Path = "appointment/create", IsVisible = true)]
        public override IActionResult Create([FromBody] AppointmentRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Cita", Description = "Actualiza completamente una cita existente", Icon = "bi-pencil-square", Path = "appointment/update", IsVisible = false)]
        public override IActionResult Update([FromBody] AppointmentRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Cita", Description = "Actualiza parcialmente una cita existente (ej. cambio de estado)", Icon = "bi-pencil", Path = "appointment/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] AppointmentRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Cita", Description = "Elimina (desactiva) una cita del sistema", Icon = "bi-trash", Path = "appointment/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
