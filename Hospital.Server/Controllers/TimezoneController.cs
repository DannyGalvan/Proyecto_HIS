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
        DisplayName = "Zonas Horarias",
        Description = "Catálogo de zonas horarias IANA del sistema",
        Icon = "bi-globe",
        Path = "timezone",
        Order = 22,
        IsVisible = false
    )]
    public class TimezoneController : CrudController<Timezone, TimezoneRequest, TimezoneResponse, long>
    {
        public TimezoneController(
            IEntityService<Timezone, TimezoneRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }
    }
}
