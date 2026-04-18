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
        DisplayName = "Inventario Farmacia",
        Description = "Gestión de inventario de medicamentos por sucursal",
        Icon = "bi-box-seam",
        Path = "medicine-inventory",
        Order = 20,
        IsVisible = true
    )]
    public class MedicineInventoryController : CrudController<MedicineInventory, MedicineInventoryRequest, MedicineInventoryResponse, long>
    {
        public MedicineInventoryController(
            IEntityService<MedicineInventory, MedicineInventoryRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Inventario", Description = "Obtiene la lista de inventario de medicamentos con paginación y filtros", Icon = "bi-list", Path = "medicine-inventory", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Inventario", Description = "Obtiene los detalles del inventario de un medicamento en una sucursal específica", Icon = "bi-eye", Path = "medicine-inventory/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Inventario", Description = "Crea un nuevo registro de inventario de medicamento en una sucursal", Icon = "bi-plus-circle", Path = "medicine-inventory/create", IsVisible = true)]
        public override IActionResult Create([FromBody] MedicineInventoryRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Inventario", Description = "Actualiza completamente un registro de inventario existente", Icon = "bi-pencil-square", Path = "medicine-inventory/update", IsVisible = false)]
        public override IActionResult Update([FromBody] MedicineInventoryRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Inventario", Description = "Actualiza parcialmente un registro de inventario existente", Icon = "bi-pencil", Path = "medicine-inventory/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] MedicineInventoryRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Inventario", Description = "Elimina (desactiva) un registro de inventario del sistema", Icon = "bi-trash", Path = "medicine-inventory/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
