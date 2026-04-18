using Hospital.Server.Attributes;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
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
        DisplayName = "Eventos del Doctor",
        Description = "Gestión de eventos personales y bloqueos de disponibilidad del médico",
        Icon = "bi-calendar-event",
        Path = "doctor-event",
        Order = 20,
        IsVisible = false
    )]
    public class DoctorEventController : CrudController<DoctorEvent, DoctorEventRequest, DoctorEventResponse, long>
    {
        public DoctorEventController(
            IEntityService<DoctorEvent, DoctorEventRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }
    }
}
