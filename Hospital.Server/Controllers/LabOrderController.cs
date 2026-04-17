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
        DisplayName = "Órdenes de Laboratorio",
        Description = "Gestión de órdenes de laboratorio y resultados",
        Icon = "bi-clipboard2-data",
        Path = "lab-order",
        Order = 17,
        IsVisible = true
    )]
    public class LabOrderController : CrudController<LabOrder, LabOrderRequest, LabOrderResponse, long>
    {
        public LabOrderController(
            IEntityService<LabOrder, LabOrderRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Órdenes", Description = "Obtiene la lista de órdenes de laboratorio", Icon = "bi-list", Path = "lab-order", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Orden", Description = "Obtiene los detalles de una orden de laboratorio", Icon = "bi-eye", Path = "lab-order/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Orden", Description = "Genera una nueva orden de laboratorio", Icon = "bi-plus-circle", Path = "lab-order/create", IsVisible = false)]
        public override IActionResult Create([FromBody] LabOrderRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Orden", Description = "Actualiza una orden de laboratorio", Icon = "bi-pencil-square", Path = "lab-order/update", IsVisible = false)]
        public override IActionResult Update([FromBody] LabOrderRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Orden", Description = "Actualiza parcialmente una orden de laboratorio", Icon = "bi-pencil", Path = "lab-order/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] LabOrderRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Orden", Description = "Elimina una orden de laboratorio", Icon = "bi-trash", Path = "lab-order/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
