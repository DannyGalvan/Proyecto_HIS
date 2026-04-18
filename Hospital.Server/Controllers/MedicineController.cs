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
        DisplayName = "Medicamentos",
        Description = "Gestión del catálogo de medicamentos para farmacia",
        Icon = "bi-capsule",
        Path = "medicine",
        Order = 19,
        IsVisible = true
    )]
    public class MedicineController : CrudController<Medicine, MedicineRequest, MedicineResponse, long>
    {
        public MedicineController(
            IEntityService<Medicine, MedicineRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Medicamentos", Description = "Obtiene el catálogo de medicamentos", Icon = "bi-list", Path = "medicine", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Medicamento", Description = "Obtiene los detalles de un medicamento", Icon = "bi-eye", Path = "medicine/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Medicamento", Description = "Agrega un nuevo medicamento al catálogo", Icon = "bi-plus-circle", Path = "medicine/create", IsVisible = true)]
        public override IActionResult Create([FromBody] MedicineRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Medicamento", Description = "Actualiza un medicamento del catálogo", Icon = "bi-pencil-square", Path = "medicine/update", IsVisible = false)]
        public override IActionResult Update([FromBody] MedicineRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Medicamento", Description = "Actualiza parcialmente un medicamento del catálogo", Icon = "bi-pencil", Path = "medicine/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] MedicineRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Medicamento", Description = "Elimina un medicamento del catálogo", Icon = "bi-trash", Path = "medicine/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
