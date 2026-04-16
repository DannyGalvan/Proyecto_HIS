using FluentValidation;
using FluentValidation.Results;
using Hospital.Server.Attributes;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Services.Interfaces;
using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using BC = BCrypt.Net;

namespace Hospital.Server.Controllers
{
    /// <summary>
    /// Controlador dedicado al flujo del paciente externo en el Portal del Paciente.
    /// Todos los endpoints públicos están marcados con [AllowAnonymous] y [ExcludeFromSync].
    /// </summary>
    [Route("api/v1/[controller]")]
    [ApiController]
    [ModuleInfo(
        DisplayName = "Portal Paciente",
        Description = "Endpoints publicos para el flujo del paciente externo",
        Icon = "bi-person-circle",
        Path = "portal",
        Order = 99,
        IsVisible = false
    )]
    public class PatientPortalController : CommonController
    {
        private readonly DataContext _bd;
        private readonly IEntityService<User, UserRequest, long> _userService;
        private readonly IEntityService<Appointment, AppointmentRequest, long> _appointmentService;
        private readonly IEntityService<Payment, PaymentRequest, long> _paymentService;
        private readonly IEntityService<NotificationLog, NotificationLogRequest, long> _notificationService;
        private readonly IPaymentGateway _paymentGateway;
        private readonly ISendMail _sendMail;
        private readonly IMapper _mapper;
        private readonly IValidator<PatientRegisterRequest> _registerValidator;

        public PatientPortalController(
            DataContext bd,
            IEntityService<User, UserRequest, long> userService,
            IEntityService<Appointment, AppointmentRequest, long> appointmentService,
            IEntityService<Payment, PaymentRequest, long> paymentService,
            IEntityService<NotificationLog, NotificationLogRequest, long> notificationService,
            IPaymentGateway paymentGateway,
            ISendMail sendMail,
            IMapper mapper,
            IValidator<PatientRegisterRequest> registerValidator)
        {
            _bd = bd;
            _userService = userService;
            _appointmentService = appointmentService;
            _paymentService = paymentService;
            _notificationService = notificationService;
            _paymentGateway = paymentGateway;
            _sendMail = sendMail;
            _mapper = mapper;
            _registerValidator = registerValidator;
        }

        /// <summary>
        /// Verifica si un DPI ya está registrado en el sistema.
        /// GET /api/v1/PatientPortal/verify-dpi/{dpi}
        /// </summary>
        [AllowAnonymous]
        [ExcludeFromSync]
        [HttpGet("verify-dpi/{dpi}")]
        public async Task<IActionResult> VerifyDpi(string dpi)
        {
            // Validate DPI format: exactly 13 numeric digits
            if (!Regex.IsMatch(dpi, @"^\d{13}$"))
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "El DPI debe contener exactamente 13 dígitos numéricos"
                });
            }

            // Search for active user with that DPI
            User? user = await _bd.Users
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.IdentificationDocument == dpi && u.State == 1);

            if (user == null)
            {
                return Ok(new Response<DpiVerificationResponse>
                {
                    Success = true,
                    Message = "Verificación completada",
                    Data = new DpiVerificationResponse
                    {
                        Exists = false,
                        HasPatientRole = false,
                        Name = null
                    }
                });
            }

            bool hasPatientRole = user.Rol?.Name == "Paciente";

            return Ok(new Response<DpiVerificationResponse>
            {
                Success = true,
                Message = "Verificación completada",
                Data = new DpiVerificationResponse
                {
                    Exists = true,
                    HasPatientRole = hasPatientRole,
                    Name = user.Name
                }
            });
        }

        /// <summary>
        /// Registra un nuevo paciente externo en el sistema.
        /// POST /api/v1/PatientPortal/register
        /// </summary>
        [AllowAnonymous]
        [ExcludeFromSync]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] PatientRegisterRequest request)
        {
            // 1. Validate with CreatePatientValidator
            ValidationResult validationResult = await _registerValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return BadRequest(new Response<List<ValidationFailure>>
                {
                    Success = false,
                    Message = "Error de validación",
                    Data = validationResult.Errors
                });
            }

            // 2. Check DPI uniqueness among active users
            bool dpiExists = await _bd.Users.AnyAsync(u =>
                u.IdentificationDocument == request.Dpi && u.State == 1);
            if (dpiExists)
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "El DPI ya se encuentra registrado en el sistema"
                });
            }

            // 3. Check email uniqueness
            bool emailExists = await _bd.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists)
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "El correo electrónico ya está en uso"
                });
            }

            // 4. Check username uniqueness
            bool userNameExists = await _bd.Users.AnyAsync(u => u.UserName == request.UserName);
            if (userNameExists)
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "El nombre de usuario ya está en uso"
                });
            }

            // 5. Get RolId of "Paciente" role
            Rol? pacienteRol = await _bd.Roles.FirstOrDefaultAsync(r => r.Name == "Paciente");
            if (pacienteRol == null)
            {
                return StatusCode(500, new Response<string>
                {
                    Success = false,
                    Message = "El rol de Paciente no está configurado en el sistema"
                });
            }

            // 6. Hash password with BCrypt
            string hashedPassword = BC.BCrypt.HashPassword(request.Password);

            // 7. Create user
            User newUser = new()
            {
                Name = request.Name,
                IdentificationDocument = request.Dpi,
                UserName = request.UserName,
                Password = hashedPassword,
                Email = request.Email,
                Number = request.Number,
                Nit = request.Nit,
                InsuranceNumber = request.InsuranceNumber,
                RolId = pacienteRol.Id,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 0 // Public registration — no authenticated user
            };

            _bd.Users.Add(newUser);
            await _bd.SaveChangesAsync();

            // 8. Return created user info (without password)
            UserResponse userResponse = _mapper.Map<User, UserResponse>(newUser);

            return Ok(new Response<UserResponse>
            {
                Success = true,
                Message = "Paciente registrado correctamente",
                Data = userResponse,
                TotalResults = 1
            });
        }

        /// <summary>
        /// Retorna la lista de médicos activos, opcionalmente filtrados por especialidad.
        /// GET /api/v1/PatientPortal/doctors?specialtyId={id}
        /// </summary>
        [AllowAnonymous]
        [ExcludeFromSync]
        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors([FromQuery] long specialtyId)
        {
            IQueryable<User> query = _bd.Users
                .Include(u => u.Rol)
                .Include(u => u.Specialty)
                .Where(u => u.State == 1 && u.Rol != null && u.Rol.Name == "Medico");

            if (specialtyId > 0)
            {
                query = query.Where(u => u.SpecialtyId == specialtyId);
            }

            List<User> doctors = await query.ToListAsync();

            List<DoctorResponse> doctorResponses = doctors.Select(d => new DoctorResponse
            {
                Id = d.Id,
                Name = d.Name,
                SpecialtyId = d.SpecialtyId,
                SpecialtyName = d.Specialty?.Name
            }).ToList();

            return Ok(new Response<List<DoctorResponse>>
            {
                Success = true,
                Message = "Médicos obtenidos correctamente",
                Data = doctorResponses,
                TotalResults = doctorResponses.Count
            });
        }

        /// <summary>
        /// Retorna los slots ocupados de un médico para una fecha dada.
        /// GET /api/v1/PatientPortal/availability?doctorId={id}&amp;date={yyyy-MM-dd}
        /// </summary>
        [AllowAnonymous]
        [ExcludeFromSync]
        [HttpGet("availability")]
        public async Task<IActionResult> GetAvailability(
            [FromQuery] long doctorId,
            [FromQuery] string date)
        {
            // 1. Parse date in yyyy-MM-dd format
            if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", out DateOnly parsedDate))
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "El formato de fecha es inválido. Use yyyy-MM-dd"
                });
            }

            DateTime dayStart = parsedDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            DateTime dayEnd = dayStart.AddDays(1);

            // Only "Pagada" appointments block slots — pending reservations do not
            AppointmentStatus? pagadaStatus = await _bd.AppointmentStatuses
                .FirstOrDefaultAsync(s => s.Name == "Pagada");

            List<Appointment> appointments = new();
            if (pagadaStatus != null)
            {
                appointments = await _bd.Appointments
                    .Where(a =>
                        a.DoctorId == doctorId &&
                        a.State == 1 &&
                        a.AppointmentStatusId == pagadaStatus.Id &&
                        a.AppointmentDate >= dayStart &&
                        a.AppointmentDate < dayEnd)
                    .ToListAsync();
            }

            // Return occupied slots as UTC ISO 8601 strings with Z suffix so the
            // frontend parses them unambiguously as UTC and converts to local time.
            List<string> occupiedSlots = appointments
                .Select(a => a.AppointmentDate.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"))
                .ToList();

            return Ok(new Response<AvailabilityResponse>
            {
                Success = true,
                Message = "Disponibilidad obtenida correctamente",
                Data = new AvailabilityResponse
                {
                    DoctorId = doctorId,
                    Date = date,
                    OccupiedSlots = occupiedSlots
                }
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // AUTHENTICATED ENDPOINTS (require valid JWT)
        // ─────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Crea una cita con estado "Pendiente" y reserva temporal de 5 minutos.
        /// POST /api/v1/PatientPortal/book
        /// </summary>
        [Authorize]
        [HttpPost("book")]
        public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentRequest request)
        {
            // 1. Validate appointmentDate is in the future
            if (request.AppointmentDate <= DateTime.UtcNow)
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "La fecha de la cita debe ser futura"
                });
            }

            // 2. Validate reason length (10–2000 chars)
            if (string.IsNullOrWhiteSpace(request.Reason) ||
                request.Reason.Length < 10 ||
                request.Reason.Length > 2000)
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "El motivo de consulta debe tener entre 10 y 2000 caracteres"
                });
            }

            // 3. Check slot conflict: only "Pagada" appointments block slots
            // (Pendiente reservations that haven't been paid yet are excluded)
            DateTime requestedStart = request.AppointmentDate;
            DateTime requestedEnd = requestedStart.AddMinutes(30);

            // Get the Id of "Pagada" status to filter only paid appointments
            AppointmentStatus? pagadaStatus = await _bd.AppointmentStatuses
                .FirstOrDefaultAsync(s => s.Name == "Pagada");

            bool slotConflict = false;
            if (pagadaStatus != null)
            {
                slotConflict = await _bd.Appointments
                    .AnyAsync(a =>
                        a.DoctorId == request.DoctorId &&
                        a.State == 1 &&
                        a.AppointmentStatusId == pagadaStatus.Id &&
                        a.AppointmentDate < requestedEnd &&
                        a.AppointmentDate.AddMinutes(30) > requestedStart);
            }

            if (slotConflict)
            {
                return Conflict(new Response<string>
                {
                    Success = false,
                    Message = "El horario seleccionado ya no está disponible"
                });
            }

            // 4. Get AppointmentStatusId for "Pendiente"
            AppointmentStatus? pendienteStatus = await _bd.AppointmentStatuses
                .FirstOrDefaultAsync(s => s.Name == "Pendiente");

            if (pendienteStatus == null)
            {
                return StatusCode(500, new Response<string>
                {
                    Success = false,
                    Message = "El estado 'Pendiente' no está configurado en el sistema"
                });
            }

            // 5. Create appointment directly via DbContext
            long userId = GetUserId();

            // Always use the authenticated user's ID as PatientId — never trust
            // the value sent from the client, which could be stale or spoofed.
            Appointment newAppointment = new()
            {
                PatientId = userId,
                DoctorId = request.DoctorId,
                SpecialtyId = request.SpecialtyId,
                BranchId = request.BranchId,
                AppointmentDate = request.AppointmentDate,
                Reason = request.Reason,
                Amount = request.Amount,
                AppointmentStatusId = pendienteStatus.Id,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _bd.Appointments.Add(newAppointment);
            await _bd.SaveChangesAsync();

            // 6. Return created appointment (Id and CreatedAt are needed for the timer)
            return Ok(new Response<object>
            {
                Success = true,
                Message = "Cita creada correctamente",
                Data = new
                {
                    AppointmentId = newAppointment.Id,
                    newAppointment.PatientId,
                    newAppointment.DoctorId,
                    newAppointment.SpecialtyId,
                    newAppointment.BranchId,
                    AppointmentDate = newAppointment.AppointmentDate.ToString("o"),
                    newAppointment.Reason,
                    newAppointment.Amount,
                    newAppointment.AppointmentStatusId,
                    CreatedAt = newAppointment.CreatedAt.ToString("o")
                },
                TotalResults = 1
            });
        }

        /// <summary>
        /// Procesa el pago de una cita pendiente.
        /// POST /api/v1/PatientPortal/pay
        /// </summary>
        [Authorize]
        [HttpPost("pay")]
        public async Task<IActionResult> ProcessPayment([FromBody] PatientPaymentRequest request)
        {
            // 1. Get appointment with related entities
            Appointment? appointment = await _bd.Appointments
                .Include(a => a.Specialty)
                .Include(a => a.Branch)
                .Include(a => a.Doctor)
                .Include(a => a.AppointmentStatus)
                .Include(a => a.Patient)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId && a.State == 1);

            if (appointment == null)
            {
                return NotFound(new Response<string>
                {
                    Success = false,
                    Message = "La cita no fue encontrada"
                });
            }

            // 2. Verify appointment belongs to the authenticated patient
            long userId = GetUserId();
            if (appointment.PatientId != userId)
            {
                return StatusCode(403, new Response<string>
                {
                    Success = false,
                    Message = "No tiene permiso para pagar esta cita"
                });
            }

            // 3. Verify appointment status is "Pendiente"
            if (appointment.AppointmentStatus?.Name != "Pendiente")
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = "La cita no se encuentra en estado Pendiente"
                });
            }

            // 4. Verify reservation has not expired (5-minute window from creation)
            // Use UTC consistently — CreatedAt is stored as UTC
            DateTime createdAtUtc = DateTime.SpecifyKind(appointment.CreatedAt, DateTimeKind.Utc);
            double minutesElapsed = (DateTime.UtcNow - createdAtUtc).TotalMinutes;
            if (minutesElapsed > 6) // 5 min window + 1 min grace for network latency
            {
                return StatusCode(410, new Response<string>
                {
                    Success = false,
                    Message = "La reserva temporal ha expirado. Por favor, inicie el proceso de agendamiento nuevamente."
                });
            }

            // 5. Check idempotency key — prevent duplicate charges
            bool duplicatePayment = await _bd.Payments
                .AnyAsync(p => p.IdempotencyKey == request.IdempotencyKey);

            if (duplicatePayment)
            {
                return Conflict(new Response<string>
                {
                    Success = false,
                    Message = "Esta transacción ya fue procesada"
                });
            }

            // 6. Process payment via gateway
            PaymentGatewayResponse gatewayResponse = await _paymentGateway.ProcessPaymentAsync(
                new PaymentGatewayRequest
                {
                    Amount = request.Amount,
                    CardLastFourDigits = request.CardLastFourDigits,
                    IdempotencyKey = request.IdempotencyKey,
                    Description = $"Consulta médica - {appointment.Specialty?.Name} - {appointment.AppointmentDate:dd/MM/yyyy HH:mm}"
                });

            if (!gatewayResponse.Success)
            {
                return BadRequest(new Response<string>
                {
                    Success = false,
                    Message = gatewayResponse.Message
                });
            }

            // 7a. Create Payment record
            Payment payment = new()
            {
                AppointmentId = appointment.Id,
                TransactionNumber = gatewayResponse.TransactionNumber,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                PaymentType = request.PaymentType,
                PaymentStatus = 1, // Completed
                PaymentDate = request.PaymentDate,
                CardLastFourDigits = request.CardLastFourDigits,
                IdempotencyKey = request.IdempotencyKey,
                GatewayResponseCode = gatewayResponse.ResponseCode,
                GatewayMessage = gatewayResponse.Message,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _bd.Payments.Add(payment);

            // 7b. Update appointment status to "Pagada"
            AppointmentStatus? pagadaStatus = await _bd.AppointmentStatuses
                .FirstOrDefaultAsync(s => s.Name == "Pagada");

            if (pagadaStatus != null)
            {
                appointment.AppointmentStatusId = pagadaStatus.Id;
                appointment.UpdatedAt = DateTime.UtcNow;
                appointment.UpdatedBy = userId;
            }

            await _bd.SaveChangesAsync();

            // 7d. Send confirmation email
            string patientEmail = appointment.Patient?.Email ?? string.Empty;
            string emailSubject = $"Confirmación de cita - {appointment.Specialty?.Name}";
            string emailBody = $@"Estimado/a {appointment.Patient?.Name},

Su cita ha sido confirmada exitosamente.

Detalles de la cita:
- Número de transacción: {gatewayResponse.TransactionNumber}
- Médico: {appointment.Doctor?.Name}
- Especialidad: {appointment.Specialty?.Name}
- Sucursal: {appointment.Branch?.Name}
- Fecha y hora: {appointment.AppointmentDate:dd/MM/yyyy HH:mm}
- Monto pagado: Q{request.Amount:F2}

Gracias por confiar en nuestros servicios.";

            int notificationStatus = 0; // Pending
            string? notificationError = null;

            try
            {
                bool emailSent = _sendMail.Send(patientEmail, emailSubject, emailBody);
                notificationStatus = emailSent ? 1 : 2; // Sent or Failed
                if (!emailSent) notificationError = "El servicio de correo retornó false";
            }
            catch (Exception ex)
            {
                notificationStatus = 2; // Failed
                notificationError = ex.Message;
            }

            // 7e. Create NotificationLog record
            NotificationLog notificationLog = new()
            {
                RecipientEmail = patientEmail,
                Subject = emailSubject,
                NotificationType = 0, // AppointmentConfirmation
                RelatedEntityType = "Appointment",
                RelatedEntityId = appointment.Id,
                SentAt = notificationStatus == 1 ? DateTime.UtcNow : null,
                Status = notificationStatus,
                RetryCount = 0,
                ErrorMessage = notificationError,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _bd.NotificationLogs.Add(notificationLog);
            await _bd.SaveChangesAsync();

            // 7f. Return PaymentConfirmationResponse
            return Ok(new Response<PaymentConfirmationResponse>
            {
                Success = true,
                Message = "Pago procesado correctamente",
                Data = new PaymentConfirmationResponse
                {
                    TransactionNumber = gatewayResponse.TransactionNumber,
                    AppointmentId = appointment.Id,
                    DoctorName = appointment.Doctor?.Name ?? string.Empty,
                    SpecialtyName = appointment.Specialty?.Name ?? string.Empty,
                    BranchName = appointment.Branch?.Name ?? string.Empty,
                    AppointmentDate = appointment.AppointmentDate,
                    Amount = request.Amount,
                    PatientEmail = patientEmail
                },
                TotalResults = 1
            });
        }

        /// <summary>
        /// Retorna el historial de citas del paciente autenticado, paginado.
        /// GET /api/v1/PatientPortal/my-appointments?pageNumber=1&amp;pageSize=10
        /// </summary>
        [Authorize]
        [HttpGet("my-appointments")]
        public async Task<IActionResult> GetMyAppointments(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            // 1. Get authenticated patient ID
            long userId = GetUserId();

            // 2. Build query for patient's appointments with all related entities
            IQueryable<Appointment> query = _bd.Appointments
                .Include(a => a.Specialty)
                .Include(a => a.Branch)
                .Include(a => a.AppointmentStatus)
                .Include(a => a.Doctor)
                .Where(a => a.PatientId == userId);

            // 3. Get total count for pagination metadata
            int totalResults = await query.CountAsync();

            // 4. Order by AppointmentDate descending and apply pagination
            List<Appointment> appointments = await query
                .OrderByDescending(a => a.AppointmentDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // 5. Project to response objects
            var result = appointments.Select(a => new
            {
                a.Id,
                a.PatientId,
                a.DoctorId,
                DoctorName = a.Doctor != null ? a.Doctor.Name : null,
                a.SpecialtyId,
                SpecialtyName = a.Specialty != null ? a.Specialty.Name : null,
                a.BranchId,
                BranchName = a.Branch != null ? a.Branch.Name : null,
                a.AppointmentStatusId,
                AppointmentStatusName = a.AppointmentStatus != null ? a.AppointmentStatus.Name : null,
                a.AppointmentDate,
                a.Reason,
                a.Amount,
                a.Priority,
                a.State,
                a.CreatedAt
            }).ToList();

            return Ok(new Response<object>
            {
                Success = true,
                Message = "Citas obtenidas correctamente",
                Data = result,
                TotalResults = totalResults
            });
        }
    }
}
