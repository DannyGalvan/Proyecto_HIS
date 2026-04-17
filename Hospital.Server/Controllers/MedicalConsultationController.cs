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
        DisplayName = "Consultas Médicas",
        Description = "Gestión de consultas médicas, diagnósticos y tratamientos",
        Icon = "bi-clipboard2-pulse",
        Path = "medical-consultation",
        Order = 13,
        IsVisible = true
    )]
    public class MedicalConsultationController : CrudController<MedicalConsultation, MedicalConsultationRequest, MedicalConsultationResponse, long>
    {
        public MedicalConsultationController(
            IEntityService<MedicalConsultation, MedicalConsultationRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Consultas", Description = "Obtiene la lista de consultas médicas", Icon = "bi-list", Path = "medical-consultation", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Consulta", Description = "Obtiene los detalles de una consulta médica", Icon = "bi-eye", Path = "medical-consultation/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Iniciar Consulta", Description = "Inicia una nueva consulta médica", Icon = "bi-plus-circle", Path = "medical-consultation/create", IsVisible = false)]
        public override IActionResult Create([FromBody] MedicalConsultationRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Consulta", Description = "Actualiza una consulta médica existente", Icon = "bi-pencil-square", Path = "medical-consultation/update", IsVisible = false)]
        public override IActionResult Update([FromBody] MedicalConsultationRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Consulta", Description = "Actualiza parcialmente una consulta (ej. agregar diagnóstico)", Icon = "bi-pencil", Path = "medical-consultation/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] MedicalConsultationRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Consulta", Description = "Elimina una consulta médica del sistema", Icon = "bi-trash", Path = "medical-consultation/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
