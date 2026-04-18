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
        DisplayName = "Tareas del Doctor",
        Description = "Gestión de tareas y recordatorios personales del médico",
        Icon = "bi-check2-square",
        Path = "doctor-task",
        Order = 21,
        IsVisible = false
    )]
    public class DoctorTaskController : CrudController<DoctorTask, DoctorTaskRequest, DoctorTaskResponse, long>
    {
        public DoctorTaskController(
            IEntityService<DoctorTask, DoctorTaskRequest, long> service,
            IMapper mapper) : base(service, mapper)
        {
        }
    }
}
