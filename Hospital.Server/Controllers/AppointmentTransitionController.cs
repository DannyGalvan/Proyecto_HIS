using Hospital.Server.Attributes;
using Hospital.Server.Entities.Response;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Server.Controllers
{
    /// <summary>
    /// Dedicated controller for appointment state machine transitions
    /// performed by hospital staff (nurse, doctor, admin).
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    [ModuleInfo(
        DisplayName = "Transiciones de Cita",
        Description = "Manejo de estados del flujo de atención de citas",
        Icon = "bi-arrow-repeat",
        Path = "appointment-transition",
        Order = 6,
        IsVisible = false
    )]
    public class AppointmentTransitionController : CommonController
    {
        private readonly IAppointmentStateMachine _stateMachine;

        public AppointmentTransitionController(IAppointmentStateMachine stateMachine)
        {
            _stateMachine = stateMachine;
        }

        /// <summary>
        /// Nurse: Confirmada → Signos Vitales
        /// Triggers the TTS announcement on the frontend.
        /// POST /api/v1/AppointmentTransition/{id}/start-vitals
        /// </summary>
        [HttpPost("{id}/start-vitals")]
        [ExcludeFromSync]
        public async Task<IActionResult> StartVitals(long id)
        {
            var (ok, err) = await _stateMachine.TransitionAsync(
                id, AppointmentStateMachine.STATUS_SIGNOS_VITALES, GetUserId());
            return ok ? Ok(new Response<string> { Success = true, Message = "Estado actualizado a Signos Vitales" })
                      : BadRequest(new Response<string> { Success = false, Message = err });
        }

        /// <summary>
        /// Nurse: Signos Vitales → En Espera (after completing vitals)
        /// POST /api/v1/AppointmentTransition/{id}/vitals-done
        /// </summary>
        [HttpPost("{id}/vitals-done")]
        [ExcludeFromSync]
        public async Task<IActionResult> VitalsDone(long id)
        {
            var (ok, err) = await _stateMachine.TransitionAsync(
                id, AppointmentStateMachine.STATUS_EN_ESPERA, GetUserId());
            return ok ? Ok(new Response<string> { Success = true, Message = "Estado actualizado a En Espera" })
                      : BadRequest(new Response<string> { Success = false, Message = err });
        }

        /// <summary>
        /// Doctor: En Espera → Consulta Médica
        /// POST /api/v1/AppointmentTransition/{id}/start-consultation
        /// </summary>
        [HttpPost("{id}/start-consultation")]
        [ExcludeFromSync]
        public async Task<IActionResult> StartConsultation(long id)
        {
            var (ok, err) = await _stateMachine.TransitionAsync(
                id, AppointmentStateMachine.STATUS_CONSULTA_MEDICA, GetUserId());
            return ok ? Ok(new Response<string> { Success = true, Message = "Estado actualizado a Consulta Médica" })
                      : BadRequest(new Response<string> { Success = false, Message = err });
        }

        /// <summary>
        /// Doctor: any active state → Atención Finalizada
        /// POST /api/v1/AppointmentTransition/{id}/finish
        /// </summary>
        [HttpPost("{id}/finish")]
        [ExcludeFromSync]
        public async Task<IActionResult> Finish(long id)
        {
            var (ok, err) = await _stateMachine.TransitionAsync(
                id, AppointmentStateMachine.STATUS_ATENCION_FINAL, GetUserId());
            return ok ? Ok(new Response<string> { Success = true, Message = "Atención finalizada correctamente" })
                      : BadRequest(new Response<string> { Success = false, Message = err });
        }

        /// <summary>
        /// Doctor: marks appointment as No Asistió
        /// POST /api/v1/AppointmentTransition/{id}/no-show
        /// </summary>
        [HttpPost("{id}/no-show")]
        [ExcludeFromSync]
        public async Task<IActionResult> NoShow(long id)
        {
            var (ok, err) = await _stateMachine.TransitionAsync(
                id, AppointmentStateMachine.STATUS_NO_ASISTIO, GetUserId());
            return ok ? Ok(new Response<string> { Success = true, Message = "Cita marcada como No Asistió" })
                      : BadRequest(new Response<string> { Success = false, Message = err });
        }
    }
}
