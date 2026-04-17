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
        DisplayName = "Signos Vitales",
        Description = "Registro y consulta de signos vitales de pacientes",
        Icon = "bi-heart-pulse-fill",
        Path = "vital-sign",
        Order = 12,
        IsVisible = true
    )]
    public class VitalSignController : CrudController<VitalSign, VitalSignRequest, VitalSignResponse, long>
    {
        public VitalSignController(
            IEntityService<VitalSign, VitalSignRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Signos Vitales", Description = "Obtiene la lista de registros de signos vitales", Icon = "bi-list", Path = "vital-sign", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Signos Vitales", Description = "Obtiene los detalles de un registro de signos vitales", Icon = "bi-eye", Path = "vital-sign/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Registrar Signos Vitales", Description = "Registra los signos vitales de un paciente", Icon = "bi-plus-circle", Path = "vital-sign/create", IsVisible = false)]
        public override IActionResult Create([FromBody] VitalSignRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Signos Vitales", Description = "Actualiza un registro de signos vitales", Icon = "bi-pencil-square", Path = "vital-sign/update", IsVisible = false)]
        public override IActionResult Update([FromBody] VitalSignRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Signos Vitales", Description = "Actualiza parcialmente un registro de signos vitales", Icon = "bi-pencil", Path = "vital-sign/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] VitalSignRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Signos Vitales", Description = "Elimina un registro de signos vitales", Icon = "bi-trash", Path = "vital-sign/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
