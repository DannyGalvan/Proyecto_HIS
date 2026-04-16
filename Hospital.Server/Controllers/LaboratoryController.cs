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
        DisplayName = "Laboratorios",
        Description = "Catálogo de laboratorios disponibles",
        Icon = "bi-eyedropper",
        Path = "laboratory",
        Order = 6,
        IsVisible = true
    )]
    public class LaboratoryController : CrudController<Laboratory, LaboratoryRequest, LaboratoryResponse, long>
    {
        public LaboratoryController(
            IEntityService<Laboratory, LaboratoryRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Laboratorios", Description = "Obtiene la lista de laboratorios con paginación y filtros", Icon = "bi-list", Path = "laboratory", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Laboratorio", Description = "Obtiene los detalles de un laboratorio específico", Icon = "bi-eye", Path = "laboratory/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Laboratorio", Description = "Crea un nuevo laboratorio en el sistema", Icon = "bi-plus-circle", Path = "laboratory/create", IsVisible = true)]
        public override IActionResult Create([FromBody] LaboratoryRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Laboratorio", Description = "Actualiza completamente un laboratorio existente", Icon = "bi-pencil-square", Path = "laboratory/update", IsVisible = false)]
        public override IActionResult Update([FromBody] LaboratoryRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Laboratorio", Description = "Actualiza parcialmente un laboratorio existente", Icon = "bi-pencil", Path = "laboratory/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] LaboratoryRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Laboratorio", Description = "Elimina (desactiva) un laboratorio del sistema", Icon = "bi-trash", Path = "laboratory/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
