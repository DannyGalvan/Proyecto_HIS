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
        DisplayName = "Pagos",
        Description = "Gestión de pagos y transacciones del hospital",
        Icon = "bi-credit-card",
        Path = "payment",
        Order = 10,
        IsVisible = true
    )]
    public class PaymentController : CrudController<Payment, PaymentRequest, PaymentResponse, long>
    {
        public PaymentController(
            IEntityService<Payment, PaymentRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }

        [HttpGet]
        [RequireOperation]
        [OperationInfo(DisplayName = "Listar Pagos", Description = "Obtiene la lista de pagos con paginación y filtros", Icon = "bi-list", Path = "payment", IsVisible = true)]
        public override IActionResult GetAll([FromQuery] QueryParamsRequest query) => base.GetAll(query);

        [HttpGet("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Ver Pago", Description = "Obtiene los detalles de un pago específico", Icon = "bi-eye", Path = "payment/view", IsVisible = false)]
        public override IActionResult Get(long id, string? include = null) => base.Get(id, include);

        [HttpPost]
        [RequireOperation]
        [OperationInfo(DisplayName = "Registrar Pago", Description = "Registra un nuevo pago en el sistema", Icon = "bi-plus-circle", Path = "payment/create", IsVisible = true)]
        public override IActionResult Create([FromBody] PaymentRequest request) => base.Create(request);

        [HttpPut]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Pago", Description = "Actualiza completamente un registro de pago", Icon = "bi-pencil-square", Path = "payment/update", IsVisible = false)]
        public override IActionResult Update([FromBody] PaymentRequest request) => base.Update(request);

        [HttpPatch]
        [RequireOperation]
        [OperationInfo(DisplayName = "Actualizar Parcial Pago", Description = "Actualiza parcialmente un registro de pago (ej. cambio de estado)", Icon = "bi-pencil", Path = "payment/partial-update", IsVisible = false)]
        public override IActionResult PartialUpdate([FromBody] PaymentRequest request) => base.PartialUpdate(request);

        [HttpDelete("{id}")]
        [RequireOperation]
        [OperationInfo(DisplayName = "Eliminar Pago", Description = "Elimina (desactiva) un registro de pago del sistema", Icon = "bi-trash", Path = "payment/delete", IsVisible = false)]
        public override IActionResult Delete(long id) => base.Delete(id);
    }
}
