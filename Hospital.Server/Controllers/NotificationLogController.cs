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
        DisplayName = "Registro de Notificaciones",
        Description = "Trazabilidad de notificaciones enviadas por el sistema",
        Icon = "bi-envelope",
        Path = "notification-log",
        Order = 23,
        IsVisible = true
    )]
    public class NotificationLogController : CrudController<NotificationLog, NotificationLogRequest, NotificationLogResponse, long>
    {
        public NotificationLogController(
            IEntityService<NotificationLog, NotificationLogRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Notificaciones", Description = "Obtiene el listado de notificaciones", Icon = "bi-list", Path = "notification-log", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Notificación", Description = "Ver detalles de una notificación", Icon = "bi-eye", Path = "notification-log/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Notificación", Description = "Registra una nueva notificación", Icon = "bi-plus-circle", Path = "notification-log/create", IsVisible = true)]
        public override IActionResult Create([FromBody] NotificationLogRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Notificación", Description = "Actualiza una notificación", Icon = "bi-pencil-square", Path = "notification-log/update", IsVisible = false)]
        public override IActionResult Update([FromBody] NotificationLogRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Notificación", Description = "Actualiza parcialmente una notificación", Icon = "bi-pencil", Path = "notification-log/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] NotificationLogRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Notificación", Description = "Elimina una notificación", Icon = "bi-trash", Path = "notification-log/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
