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
        DisplayName = "Resultados Lab",
        Description = "Registro de resultados de exámenes de laboratorio",
        Icon = "bi-file-earmark-medical",
        Path = "lab-order-item",
        Order = 18,
        IsVisible = false
    )]
    public class LabOrderItemController : CrudController<LabOrderItem, LabOrderItemRequest, LabOrderItemResponse, long>
    {
        public LabOrderItemController(
            IEntityService<LabOrderItem, LabOrderItemRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Resultados", Description = "Obtiene los resultados de una orden de laboratorio", Icon = "bi-list", Path = "lab-order-item", IsVisible = false)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Resultado", Description = "Obtiene el detalle de un resultado de examen", Icon = "bi-eye", Path = "lab-order-item/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Registrar Resultado", Description = "Registra el resultado de un examen de laboratorio", Icon = "bi-plus-circle", Path = "lab-order-item/create", IsVisible = false)]
        public override IActionResult Create([FromBody] LabOrderItemRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Resultado", Description = "Actualiza un resultado de examen", Icon = "bi-pencil-square", Path = "lab-order-item/update", IsVisible = false)]
        public override IActionResult Update([FromBody] LabOrderItemRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Resultado", Description = "Actualiza parcialmente un resultado de examen", Icon = "bi-pencil", Path = "lab-order-item/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] LabOrderItemRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Resultado", Description = "Elimina un resultado de examen", Icon = "bi-trash", Path = "lab-order-item/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
