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
        DisplayName = "Recetas Médicas",
        Description = "Gestión de recetas médicas",
        Icon = "bi-prescription2",
        Path = "prescription",
        Order = 14,
        IsVisible = true
    )]
    public class PrescriptionController : CrudController<Prescription, PrescriptionRequest, PrescriptionResponse, long>
    {
        public PrescriptionController(
            IEntityService<Prescription, PrescriptionRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Recetas", Description = "Obtiene la lista de recetas médicas", Icon = "bi-list", Path = "prescription", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Receta", Description = "Obtiene los detalles de una receta médica", Icon = "bi-eye", Path = "prescription/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Receta", Description = "Genera una nueva receta médica", Icon = "bi-plus-circle", Path = "prescription/create", IsVisible = true)]
        public override IActionResult Create([FromBody] PrescriptionRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Receta", Description = "Actualiza una receta médica existente", Icon = "bi-pencil-square", Path = "prescription/update", IsVisible = false)]
        public override IActionResult Update([FromBody] PrescriptionRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Receta", Description = "Actualiza parcialmente una receta médica", Icon = "bi-pencil", Path = "prescription/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] PrescriptionRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Receta", Description = "Elimina una receta médica del sistema", Icon = "bi-trash", Path = "prescription/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
