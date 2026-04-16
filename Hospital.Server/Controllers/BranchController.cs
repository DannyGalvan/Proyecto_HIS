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
        DisplayName = "Sucursales",
        Description = "Catálogo de sucursales del hospital",
        Icon = "bi-building",
        Path = "branch",
        Order = 7,
        IsVisible = true
    )]
    public class BranchController : CrudController<Branch, BranchRequest, BranchResponse, long>
    {
        public BranchController(
            IEntityService<Branch, BranchRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Sucursales", Description = "Obtiene la lista de sucursales con paginación y filtros", Icon = "bi-list", Path = "branch", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Sucursal", Description = "Obtiene los detalles de una sucursal específica", Icon = "bi-eye", Path = "branch/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Sucursal", Description = "Crea una nueva sucursal", Icon = "bi-plus-circle", Path = "branch/create", IsVisible = true)]
        public override IActionResult Create([FromBody] BranchRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Sucursal", Description = "Actualiza completamente una sucursal existente", Icon = "bi-pencil-square", Path = "branch/update", IsVisible = false)]
        public override IActionResult Update([FromBody] BranchRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Sucursal", Description = "Actualiza parcialmente una sucursal existente", Icon = "bi-pencil", Path = "branch/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] BranchRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Sucursal", Description = "Elimina (desactiva) una sucursal del sistema", Icon = "bi-trash", Path = "branch/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
