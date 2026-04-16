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
        DisplayName = "Detalle de Receta",
        Description = "Medicamentos individuales dentro de una receta médica",
        Icon = "bi-capsule",
        Path = "prescription-item",
        Order = 15,
        IsVisible = false
    )]
    public class PrescriptionItemController : CrudController<PrescriptionItem, PrescriptionItemRequest, PrescriptionItemResponse, long>
    {
        public PrescriptionItemController(
            IEntityService<PrescriptionItem, PrescriptionItemRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Medicamentos", Description = "Obtiene los medicamentos de una receta", Icon = "bi-list", Path = "prescription-item", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Medicamento", Description = "Obtiene el detalle de un medicamento en la receta", Icon = "bi-eye", Path = "prescription-item/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Agregar Medicamento", Description = "Agrega un medicamento a la receta", Icon = "bi-plus-circle", Path = "prescription-item/create", IsVisible = true)]
        public override IActionResult Create([FromBody] PrescriptionItemRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Medicamento", Description = "Actualiza un medicamento en la receta", Icon = "bi-pencil-square", Path = "prescription-item/update", IsVisible = false)]
        public override IActionResult Update([FromBody] PrescriptionItemRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Medicamento", Description = "Actualiza parcialmente un medicamento", Icon = "bi-pencil", Path = "prescription-item/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] PrescriptionItemRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Medicamento", Description = "Elimina un medicamento de la receta", Icon = "bi-trash", Path = "prescription-item/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
