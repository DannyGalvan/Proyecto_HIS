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
        DisplayName = "Exámenes Lab",
        Description = "Catálogo de exámenes de laboratorio disponibles",
        Icon = "bi-droplet",
        Path = "lab-exam",
        Order = 16,
        IsVisible = true
    )]
    public class LabExamController : CrudController<LabExam, LabExamRequest, LabExamResponse, long>
    {
        public LabExamController(
            IEntityService<LabExam, LabExamRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Exámenes", Description = "Obtiene el catálogo de exámenes de laboratorio", Icon = "bi-list", Path = "lab-exam", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Examen", Description = "Obtiene los detalles de un examen de laboratorio", Icon = "bi-eye", Path = "lab-exam/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Crear Examen", Description = "Agrega un nuevo examen al catálogo", Icon = "bi-plus-circle", Path = "lab-exam/create", IsVisible = true)]
        public override IActionResult Create([FromBody] LabExamRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Examen", Description = "Actualiza un examen del catálogo", Icon = "bi-pencil-square", Path = "lab-exam/update", IsVisible = false)]
        public override IActionResult Update([FromBody] LabExamRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Examen", Description = "Actualiza parcialmente un examen del catálogo", Icon = "bi-pencil", Path = "lab-exam/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] LabExamRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Examen", Description = "Elimina un examen del catálogo", Icon = "bi-trash", Path = "lab-exam/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
