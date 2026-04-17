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
        DisplayName = "Estados de Cita",
        Description = "Catálogo de estados posibles para las citas médicas",
        Icon = "bi-calendar-check",
        Path = "appointment-status",
        Order = 8,
        IsVisible = false
    )]
    public class AppointmentStatusController : CrudController<AppointmentStatus, AppointmentStatusRequest, AppointmentStatusResponse, long>
    {
        public AppointmentStatusController(
            IEntityService<AppointmentStatus, AppointmentStatusRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Estados de Cita", Description = "Obtiene la lista de estados de cita con paginación y filtros", Icon = "bi-list", Path = "appointment-status", IsVisible = false)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Estado de Cita", Description = "Obtiene los detalles de un estado de cita específico", Icon = "bi-eye", Path = "appointment-status/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Estado de Cita", Description = "Crea un nuevo estado de cita", Icon = "bi-plus-circle", Path = "appointment-status/create", IsVisible = false)]
        public override IActionResult Create([FromBody] AppointmentStatusRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Estado de Cita", Description = "Actualiza completamente un estado de cita existente", Icon = "bi-pencil-square", Path = "appointment-status/update", IsVisible = false)]
        public override IActionResult Update([FromBody] AppointmentStatusRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Estado de Cita", Description = "Actualiza parcialmente un estado de cita existente", Icon = "bi-pencil", Path = "appointment-status/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] AppointmentStatusRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Estado de Cita", Description = "Elimina (desactiva) un estado de cita del sistema", Icon = "bi-trash", Path = "appointment-status/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
