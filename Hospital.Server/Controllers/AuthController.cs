using FluentValidation.Results;
using Hospital.Server.Attributes;
using Hospital.Server.Context;
using Hospital.Server.Controllers;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Services.Interfaces;
using Lombok.NET;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Project.Server.Controllers
{
    /// <summary>
    /// Defines the <see cref="AuthController" />
    /// </summary> 
    [Route("api/v1/[controller]")]
    [ApiController]
    [AllArgsConstructor]
    [ModuleInfo(
        DisplayName = "Auth",
        Description = "Gestión de autenticación en la aplicación",
        Icon = "bi-shield-lock",
        Path = "auth",
        Order = 1,
        IsVisible = false
    )]
    public partial class AuthController : CommonController
    {
        /// <summary>
        /// Defines the _authService
        /// </summary>
        private readonly IAuthService _authService;

        /// <summary>
        /// Defines the _mapper
        /// </summary>
        private readonly IMapper _mapper;

        /// <summary>
        /// Defines the _db
        /// </summary>
        private readonly DataContext _db;


        /// <summary>
        /// The Login
        /// </summary>
        /// <param name="model">The model<see cref="LoginRequest"/></param>
        /// <returns>The <see cref="ActionResult"/></returns>
        [ExcludeFromSync]
        [AllowAnonymous]
        [HttpPost]
        public ActionResult Login(LoginRequest model)
        {
            var response = _authService.Auth(model);

            if (response.Success)
            {
                Response<AuthResponse> authResponse = new()
                {
                    Data = response.Data,
                    Success = response.Success,
                    Message = response.Message
                };

                return Ok(authResponse);
            }

            Response<List<ValidationFailure>> errorResponse = new()
            {
                Data = response.Errors,
                Success = response.Success,
                Message = response.Message
            };

            return BadRequest(errorResponse);
        }

        /// <summary>
        /// The Register Users
        /// </summary>
        /// <param name="model">The model<see cref="RegisterRequest"/></param>
        /// <returns>The <see cref="ActionResult"/></returns>
        [ExcludeFromSync]
        [AllowAnonymous]
        [HttpPost("Register")]
        public ActionResult Register(RegisterRequest model)
        {
            model.CreatedBy = 1;
            var response = _authService.Register(model);

            if (response.Success)
            {
                Response<UserResponse> authResponse = new()
                {
                    Data = _mapper.Map<User,UserResponse>(response.Data!),
                    Success = response.Success,
                    Message = response.Message
                };

                return Ok(authResponse);
            }

            Response<List<ValidationFailure>> errorResponse = new()
            {
                Data = response.Errors,
                Success = response.Success,
                Message = response.Message
            };

            return BadRequest(errorResponse);
        }

        /// <summary>
        /// The GetToken
        /// </summary>
        /// <param name="token">The token<see cref="string"/></param>
        /// <returns>The <see cref="ActionResult"/></returns>
        [ExcludeFromSync]
        [AllowAnonymous]
        [HttpGet("{token}")]
        public ActionResult GetToken(string token)
        {
            Response<string, List<ValidationFailure>> response = _authService.ValidateToken(token);

            if (response.Success)
            {
                Response<string> tokenResponse = new()
                {
                    Data = response.Data,
                    Success = response.Success,
                    Message = response.Message
                };
                return BadRequest(tokenResponse);
            }

            Response<List<ValidationFailure>> errorResponse = new()
            {
                Data = response.Errors,
                Success = response.Success,
                Message = response.Message
            };

            return Ok(errorResponse);
        }

        /// <summary>
        /// The ChangePassword
        /// </summary>
        /// <param name="model">The model<see cref="ChangePasswordRequest"/></param>
        /// <returns>The <see>
        ///         <cref>ActionResult{Response{string}}</cref>
        ///     </see>
        /// </returns>
        [ExcludeFromSync]
        [AllowAnonymous]
        [HttpPut("ChangePassword")]
        public ActionResult<Response<string>> ChangePassword(ChangePasswordRequest model)
        {
            Response<string, List<ValidationFailure>> response = _authService.ChangePassword(model);

            if (response.Success)
            {
                Response<string> changePasswordResponse = new()
                {
                    Data = response.Data,
                    Success = response.Success,
                    Message = response.Message
                };

                return Ok(changePasswordResponse);

            }

            Response<List<ValidationFailure>> errorResponse = new()
            {
                Data = response.Errors,
                Success = response.Success,
                Message = response.Message
            };

            return BadRequest(errorResponse);
        }

        /// <summary>
        /// The PostResetPassword
        /// </summary>
        /// <param name="model">The model<see cref="ResetPasswordRequest"/></param>
        /// <returns>The <see cref="ActionResult"/></returns>
        [Authorize]
        [HttpPost("ResetPassword")]
        public ActionResult PostResetPassword([FromBody] ResetPasswordRequest model)
        {
            model.IdUser = GetUserId();
            Response<string, List<ValidationFailure>> response = _authService.ResetPassword(model);

            if (response.Success)
            {
                Response<string> resetPasswordResponse = new()
                {
                    Data = response.Data,
                    Success = response.Success,
                    Message = response.Message
                };

                return Ok(resetPasswordResponse);

            }

            Response<List<ValidationFailure>> errorResponse = new()
            {
                Data = response.Errors,
                Success = response.Success,
                Message = response.Message
            };

            return BadRequest(errorResponse);
        }

        /// <summary>
        /// The PostRecoveryPassword
        /// </summary>
        /// <param name="model">The model<see cref="RecoveryPasswordRequest"/></param>
        /// <returns>The <see cref="ActionResult"/></returns>
        [ExcludeFromSync]
        [AllowAnonymous]
        [HttpPost("RecoveryPassword")]
        public ActionResult PostRecoveryPassword([FromBody] RecoveryPasswordRequest model)
        {
            // Build the frontend base URL from the current request
            model.BaseUrl = $"{Request.Scheme}://{Request.Host}";

            Response<string, List<ValidationFailure>> response = _authService.RecoveryPassword(model);

            if (response.Success)
            {
                Response<string> recoveryPasswordResponse = new()
                {
                    Data = response.Data,
                    Success = response.Success,
                    Message = response.Message
                };

                return Ok(recoveryPasswordResponse);

            }

            Response<List<ValidationFailure>> errorResponse = new()
            {
                Data = response.Errors,
                Success = response.Success,
                Message = response.Message
            };

            return BadRequest(errorResponse);
        }

        /// <summary>
        /// Manual change password for authenticated users
        /// </summary>
        /// <param name="model">The model<see cref="ManualChangePasswordRequest"/></param>
        /// <returns>The <see cref="ActionResult"/></returns>
        [Authorize]
        [HttpPost("ManualChangePassword")]
        public ActionResult ManualChangePassword([FromBody] ManualChangePasswordRequest model)
        {
            model.UserId = GetUserId();
            Response<string, List<ValidationFailure>> response = _authService.ManualChangePassword(model);

            if (response.Success)
            {
                Response<string> changePasswordResponse = new()
                {
                    Data = response.Data,
                    Success = response.Success,
                    Message = response.Message
                };

                return Ok(changePasswordResponse);
            }

            Response<List<ValidationFailure>> errorResponse = new()
            {
                Data = response.Errors,
                Success = response.Success,
                Message = response.Message
            };

            return BadRequest(errorResponse);
        }

        /// <summary>
        /// Updates the authenticated user's timezone preference.
        /// Any authenticated user can change their own timezone — no operation permission required.
        /// PATCH /api/v1/Auth/Timezone
        /// </summary>
        [Authorize]
        [ExcludeFromSync]
        [HttpPatch("Timezone")]
        public async Task<IActionResult> UpdateMyTimezone([FromBody] UpdateTimezoneRequest model)
        {
            long userId = GetUserId();

            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new Response<string> { Success = false, Message = "Usuario no encontrado." });
            }

            // Validate the timezone exists and is active
            if (model.TimezoneId.HasValue)
            {
                var timezone = await _db.Set<Timezone>().FirstOrDefaultAsync(
                    t => t.Id == model.TimezoneId.Value && t.State == 1);
                if (timezone == null)
                {
                    return BadRequest(new Response<string>
                    {
                        Success = false,
                        Message = "La zona horaria seleccionada no existe o no está activa."
                    });
                }

                user.TimezoneId = model.TimezoneId.Value;
            }

            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = userId;
            await _db.SaveChangesAsync();

            // Return the updated timezone IanaId
            var updatedTz = user.TimezoneId.HasValue
                ? await _db.Set<Timezone>().Where(t => t.Id == user.TimezoneId).Select(t => t.IanaId).FirstOrDefaultAsync()
                : null;

            return Ok(new Response<object>
            {
                Success = true,
                Message = "Zona horaria actualizada correctamente.",
                Data = new { timezoneIanaId = updatedTz ?? "America/Guatemala" }
            });
        }
    }
}

/// <summary>
/// Request body for updating timezone preference.
/// </summary>
public class UpdateTimezoneRequest
{
    public long? TimezoneId { get; set; }
}