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
    /// <summary>
    /// CRUD controller for Branch-Specialty assignments.
    /// Allows administrators to configure which specialties are offered at each branch.
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [ModuleInfo(
        DisplayName = "Especialidades por Sede",
        Description = "Configuración de especialidades disponibles en cada sede",
        Icon = "bi-hospital",
        Path = "branch-specialty",
        Order = 5,
        IsVisible = true
    )]
    [Authorize]
    public class BranchSpecialtyController : CrudController<BranchSpecialty, BranchSpecialtyRequest, BranchSpecialtyResponse, long>
    {
        public BranchSpecialtyController(
            IEntityService<BranchSpecialty, BranchSpecialtyRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(
            DisplayName = "Listar Especialidades por Sede",
            Description = "Obtiene la lista de especialidades asignadas a sedes",
            Icon = "bi-list",
            Path = "branch-specialty",
            IsVisible = true
        )]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query)
        {
            return base.GetAll(query);
        }

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(
            DisplayName = "Ver Especialidad de Sede",
            Description = "Obtiene el detalle de una asignación sede-especialidad",
            Icon = "bi-eye",
            Path = "branch-specialty/view",
            IsVisible = false
        )]
        public override IActionResult Get(long id, string? include = null)
        {
            return base.Get(id, include);
        }

        [HttpPost]
        [RequireOperation]
        [OperationInfo(
            DisplayName = "Asignar Especialidad a Sede",
            Description = "Asigna una especialidad a una sede del hospital",
            Icon = "bi-plus-circle",
            Path = "branch-specialty/create",
            IsVisible = true
        )]
        public override IActionResult Create([FromBody] BranchSpecialtyRequest request)
        {
            return base.Create(request);
        }

        [HttpPut]
        [RequireOperation]
        [OperationInfo(
            DisplayName = "Actualizar Asignación Sede-Especialidad",
            Description = "Actualiza una asignación sede-especialidad existente",
            Icon = "bi-pencil",
            Path = "branch-specialty/update",
            IsVisible = false
        )]
        public override IActionResult Update([FromBody] BranchSpecialtyRequest request)
        {
            return base.Update(request);
        }

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(
            DisplayName = "Actualización Parcial Sede-Especialidad",
            Description = "Actualiza parcialmente una asignación sede-especialidad",
            Icon = "bi-pencil-square",
            Path = "branch-specialty/partial-update",
            IsVisible = false
        )]
        public override IActionResult PartialUpdate([FromBody] BranchSpecialtyRequest request)
        {
            return base.PartialUpdate(request);
        }

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(
            DisplayName = "Eliminar Asignación Sede-Especialidad",
            Description = "Elimina lógicamente una asignación sede-especialidad",
            Icon = "bi-trash",
            Path = "branch-specialty/delete",
            IsVisible = false
        )]
        public override IActionResult Delete(long id)
        {
            return base.Delete(id);
        }
    }
}
