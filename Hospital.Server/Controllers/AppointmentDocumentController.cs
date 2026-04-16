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
        DisplayName = "Documentos de Cita",
        Description = "Gestión de documentos adjuntos a citas médicas",
        Icon = "bi-file-earmark-pdf",
        Path = "appointment-document",
        Order = 11,
        IsVisible = false
    )]
    public class AppointmentDocumentController : CrudController<AppointmentDocument, AppointmentDocumentRequest, AppointmentDocumentResponse, long>
    {
        public AppointmentDocumentController(
            IEntityService<AppointmentDocument, AppointmentDocumentRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Documentos", Description = "Obtiene la lista de documentos adjuntos a citas", Icon = "bi-list", Path = "appointment-document", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Documento", Description = "Obtiene los detalles de un documento adjunto", Icon = "bi-eye", Path = "appointment-document/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Adjuntar Documento", Description = "Adjunta un documento a una cita médica", Icon = "bi-upload", Path = "appointment-document/create", IsVisible = true)]
        public override IActionResult Create([FromBody] AppointmentDocumentRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Documento", Description = "Actualiza un documento adjunto existente", Icon = "bi-pencil-square", Path = "appointment-document/update", IsVisible = false)]
        public override IActionResult Update([FromBody] AppointmentDocumentRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Documento", Description = "Actualiza parcialmente un documento adjunto", Icon = "bi-pencil", Path = "appointment-document/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] AppointmentDocumentRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Documento", Description = "Elimina un documento adjunto de una cita", Icon = "bi-trash", Path = "appointment-document/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
