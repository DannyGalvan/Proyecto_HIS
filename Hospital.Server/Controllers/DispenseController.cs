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
        DisplayName = "Despacho de Medicamentos",
        Description = "Gestión de despacho de medicamentos",
        Icon = "bi-bag-check",
        Path = "dispense",
        Order = 21,
        IsVisible = true
    )]
    public class DispenseController : CrudController<Dispense, DispenseRequest, DispenseResponse, long>
    {
        public DispenseController(
            IEntityService<Dispense, DispenseRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Despachos", Description = "Obtiene la lista de despachos de medicamentos", Icon = "bi-list", Path = "dispense", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Despacho", Description = "Obtiene los detalles de un despacho de medicamentos", Icon = "bi-eye", Path = "dispense/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Despacho", Description = "Crea un nuevo despacho de medicamentos", Icon = "bi-plus-circle", Path = "dispense/create", IsVisible = true)]
        public override IActionResult Create([FromBody] DispenseRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Despacho", Description = "Actualiza un despacho de medicamentos existente", Icon = "bi-pencil-square", Path = "dispense/update", IsVisible = false)]
        public override IActionResult Update([FromBody] DispenseRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Despacho", Description = "Actualiza parcialmente un despacho de medicamentos", Icon = "bi-pencil", Path = "dispense/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] DispenseRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Despacho", Description = "Elimina un despacho de medicamentos del sistema", Icon = "bi-trash", Path = "dispense/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
