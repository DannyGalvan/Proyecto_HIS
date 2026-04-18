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
        DisplayName = "Bitácora Inventario",
        Description = "Gestión de movimientos de inventario de farmacia",
        Icon = "bi-journal-text",
        Path = "inventory-movement",
        Order = 16,
        IsVisible = true
    )]
    public class InventoryMovementController : CrudController<InventoryMovement, InventoryMovementRequest, InventoryMovementResponse, long>
    {
        public InventoryMovementController(
            IEntityService<InventoryMovement, InventoryMovementRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Movimientos", Description = "Obtiene la lista de movimientos de inventario con paginación y filtros", Icon = "bi-list", Path = "inventory-movement", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Movimiento", Description = "Obtiene los detalles de un movimiento de inventario específico", Icon = "bi-eye", Path = "inventory-movement/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Movimiento", Description = "Registra un nuevo movimiento de inventario", Icon = "bi-plus-circle", Path = "inventory-movement/create", IsVisible = true)]
        public override IActionResult Create([FromBody] InventoryMovementRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Movimiento", Description = "Actualiza completamente un registro de movimiento de inventario", Icon = "bi-pencil-square", Path = "inventory-movement/update", IsVisible = false)]
        public override IActionResult Update([FromBody] InventoryMovementRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Movimiento", Description = "Actualiza parcialmente un registro de movimiento de inventario", Icon = "bi-pencil", Path = "inventory-movement/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] InventoryMovementRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Movimiento", Description = "Elimina (desactiva) un registro de movimiento de inventario del sistema", Icon = "bi-trash", Path = "inventory-movement/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
