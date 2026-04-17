using Hospital.Server.Attributes;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Security.Authorization;
using Hospital.Server.Services.Interfaces;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        private readonly DataContext _db;

        public PaymentController(
            IEntityService<Payment, PaymentRequest, long> service,
            IMapper mapper,
            DataContext db) : base(service, mapper)
        {
            _db = db;
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

        /// <summary>
        /// Returns all pending LabOrders and Dispenses for a patient identified by DPI,
        /// optionally filtered by order number.
        /// GET /api/v1/Payment/PendingOrders?dpi={dpi}&orderNumber={orderNumber}
        /// </summary>
        [HttpGet("PendingOrders")]
        [RequireOperation]
        [OperationInfo(
            DisplayName = "Órdenes Pendientes",
            Description = "Consulta órdenes de laboratorio y despachos pendientes de pago por DPI del paciente",
            Icon = "bi-clock-history",
            Path = "payment/pending-orders",
            IsVisible = true)]
        public async Task<IActionResult> GetPendingOrders([FromQuery] string? dpi, [FromQuery] string? orderNumber)
        {
            if (string.IsNullOrWhiteSpace(dpi) && string.IsNullOrWhiteSpace(orderNumber))
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "Debe proporcionar al menos un criterio de búsqueda: DPI del paciente o número de orden."
                });
            }

            var results = new List<PendingOrderResponse>();

            // Find patient(s) by DPI if provided
            List<User>? patients = null;
            if (!string.IsNullOrWhiteSpace(dpi))
            {
                patients = await _db.Users
                    .Where(u => u.IdentificationDocument == dpi && u.State == 1)
                    .ToListAsync();

                if (patients.Count == 0)
                {
                    return Ok(new Response<List<PendingOrderResponse>>
                    {
                        Success = true,
                        Message = "No se encontró ningún paciente con el DPI proporcionado.",
                        Data = results,
                        TotalResults = 0
                    });
                }
            }

            var patientIds = patients?.Select(p => p.Id).ToList();

            // Query pending LabOrders (OrderStatus = 0)
            var labOrdersQuery = _db.LabOrders
                .Include(lo => lo.Items)
                .Include(lo => lo.Patient)
                .Where(lo => lo.OrderStatus == 0 && lo.State == 1);

            if (patientIds != null)
                labOrdersQuery = labOrdersQuery.Where(lo => patientIds.Contains(lo.PatientId));

            if (!string.IsNullOrWhiteSpace(orderNumber))
                labOrdersQuery = labOrdersQuery.Where(lo => lo.OrderNumber == orderNumber);

            var pendingLabOrders = await labOrdersQuery.ToListAsync();

            results.AddRange(pendingLabOrders.Select(lo => new PendingOrderResponse
            {
                OrderType = "LabOrder",
                OrderId = lo.Id,
                OrderNumber = lo.OrderNumber,
                PatientName = lo.Patient?.Name ?? string.Empty,
                PatientDpi = lo.Patient?.IdentificationDocument ?? string.Empty,
                CreatedAt = lo.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                ItemCount = lo.Items.Count(i => i.State == 1),
                TotalAmount = lo.TotalAmount,
                PaymentType = 1
            }));

            // Query pending Dispenses (DispenseStatus = 0)
            var dispensesQuery = _db.Dispenses
                .Include(d => d.Items)
                .Include(d => d.Patient)
                .Where(d => d.DispenseStatus == 0 && d.State == 1);

            if (patientIds != null)
                dispensesQuery = dispensesQuery.Where(d => patientIds.Contains(d.PatientId));

            if (!string.IsNullOrWhiteSpace(orderNumber))
                dispensesQuery = dispensesQuery.Where(d => d.Id.ToString() == orderNumber);

            var pendingDispenses = await dispensesQuery.ToListAsync();

            results.AddRange(pendingDispenses.Select(d => new PendingOrderResponse
            {
                OrderType = "Dispense",
                OrderId = d.Id,
                OrderNumber = d.Id.ToString(),
                PatientName = d.Patient?.Name ?? string.Empty,
                PatientDpi = d.Patient?.IdentificationDocument ?? string.Empty,
                CreatedAt = d.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                ItemCount = d.Items.Count(i => i.State == 1),
                TotalAmount = d.TotalAmount,
                PaymentType = 2
            }));

            // Order by creation date (most recent first)
            results = results.OrderByDescending(r => r.CreatedAt).ToList();

            return Ok(new Response<List<PendingOrderResponse>>
            {
                Success = true,
                Message = "Órdenes pendientes obtenidas correctamente.",
                Data = results,
                TotalResults = results.Count
            });
        }
    }
}
