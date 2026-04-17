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
        DisplayName = "Detalle de Despacho",
        Description = "Gestión de líneas de detalle en despachos de medicamentos",
        Icon = "bi-list-check",
        Path = "dispense-item",
        Order = 22,
        IsVisible = false
    )]
    public class DispenseItemController : CrudController<DispenseItem, DispenseItemRequest, DispenseItemResponse, long>
    {
        public DispenseItemController(
            IEntityService<DispenseItem, DispenseItemRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Detalle Despacho", Description = "Obtiene la lista de líneas de despacho", Icon = "bi-list", Path = "dispense-item", IsVisible = false)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Detalle Despacho", Description = "Obtiene los detalles de una línea de despacho", Icon = "bi-eye", Path = "dispense-item/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Detalle Despacho", Description = "Crea una nueva línea de despacho", Icon = "bi-plus-circle", Path = "dispense-item/create", IsVisible = false)]
        public override IActionResult Create([FromBody] DispenseItemRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Detalle Despacho", Description = "Actualiza una línea de despacho existente", Icon = "bi-pencil-square", Path = "dispense-item/update", IsVisible = false)]
        public override IActionResult Update([FromBody] DispenseItemRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Detalle Despacho", Description = "Actualiza parcialmente una línea de despacho", Icon = "bi-pencil", Path = "dispense-item/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] DispenseItemRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Detalle Despacho", Description = "Elimina una línea de despacho del sistema", Icon = "bi-trash", Path = "dispense-item/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
