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
        DisplayName = "Especialidades",
        Description = "Catálogo de especialidades médicas",
        Icon = "bi-heart-pulse",
        Path = "specialty",
        Order = 5,
        IsVisible = true
    )]
    public class SpecialtyController : CrudController<Specialty, SpecialtyRequest, SpecialtyResponse, long>
    {
        public SpecialtyController(
            IEntityService<Specialty, SpecialtyRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Especialidades", Description = "Obtiene la lista de especialidades médicas con paginación y filtros", Icon = "bi-list", Path = "specialty", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Especialidad", Description = "Obtiene los detalles de una especialidad específica", Icon = "bi-eye", Path = "specialty/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Especialidad", Description = "Crea una nueva especialidad médica", Icon = "bi-plus-circle", Path = "specialty/create", IsVisible = true)]
        public override IActionResult Create([FromBody] SpecialtyRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Especialidad", Description = "Actualiza completamente una especialidad existente", Icon = "bi-pencil-square", Path = "specialty/update", IsVisible = false)]
        public override IActionResult Update([FromBody] SpecialtyRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Especialidad", Description = "Actualiza parcialmente una especialidad existente", Icon = "bi-pencil", Path = "specialty/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] SpecialtyRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Especialidad", Description = "Elimina (desactiva) una especialidad del sistema", Icon = "bi-trash", Path = "specialty/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
