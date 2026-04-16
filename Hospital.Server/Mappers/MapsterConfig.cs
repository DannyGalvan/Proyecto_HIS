using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Mapster;

namespace Hospital.Server.Mappers
{
    public abstract class MapsterConfig
    {
        public static void RegisterMappings()
        {
            //Mapper User
            TypeAdapterConfig<RegisterRequest, User>.NewConfig()
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.Number, src => src.Number)
                .Map(dest => dest.Password, src => src.Password)
                .Map(dest => dest.IdentificationDocument, src => src.IdentificationDocument)
                .Map(dest => dest.Email, src => src.Email)
                .Map(dest => dest.UserName, src => src.UserName)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            // Mapper UserRequest to User
            TypeAdapterConfig<UserRequest, User>.NewConfig()
                .Map(dest => dest.RolId, src => src.RolId)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Email, src => src.Email)
                .Map(dest => dest.UserName, src => src.UserName)
                .Map(dest => dest.Password, src => src.Password)
                .Map(dest => dest.IdentificationDocument, src => src.IdentificationDocument)
                .Map(dest => dest.Number, src => src.Number)
                .Map(dest => dest.Nit, src => src.Nit)
                .Map(dest => dest.BranchId, src => src.BranchId)
                .Map(dest => dest.InsuranceNumber, src => src.InsuranceNumber)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<User, UserResponse>.NewConfig()
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.Number, src => src.Number)
                .Map(dest => dest.IdentificationDocument, src => src.IdentificationDocument)
                .Map(dest => dest.Email, src => src.Email)
                .Map(dest => dest.UserName, src => src.UserName)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.RolId, src => src.RolId)
                .Map(dest => dest.Rol, src => src.Rol)
                .Map(dest => dest.Nit, src => src.Nit)
                .Map(dest => dest.BranchId, src => src.BranchId)
                .Map(dest => dest.InsuranceNumber, src => src.InsuranceNumber)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy " +
                "HH:mm:ss") : null);

            TypeAdapterConfig<User, AuthResponse>.NewConfig()
                .Map(dest => dest.Email, src => src.Email)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.UserName, src => src.UserName)
                .Map(dest => dest.UserId, src => src.Id)
                .Map(dest => dest.Rol, src => src.RolId)
                .Map(dest => dest.Redirect, src => src.Reset ?? false)
                .Ignore(dest => dest.Token)
                .Ignore(dest => dest.Operations);

            TypeAdapterConfig<User, User>.NewConfig();


            //Mapper Rol
            TypeAdapterConfig<RolRequest, Rol>.NewConfig()
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<Rol, RolResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null)
                .Ignore(dest => dest.Users) // Ignorar navegación circular
                .Ignore(dest => dest.RolOperations); // Ignorar navegación circular

            TypeAdapterConfig<Rol, Rol>.NewConfig();

            //Mapper RolOperation
            TypeAdapterConfig<RolOperationRequest, RolOperation>.NewConfig()
                .Map(dest => dest.OperationId, src => src.OperationId)
                .Map(dest => dest.RolId, src => src.RolId)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<RolOperation, RolOperationResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.OperationId, src => src.OperationId)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.RolId, src => src.RolId)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null)
                .Ignore(dest => dest.Operation) // Ignorar navegación circular
                .Ignore(dest => dest.Rol); // Ignorar navegación circular

            TypeAdapterConfig<RolOperation, Operation>.NewConfig()
                .Map(dest => dest.Id, src => src.OperationId)
                .Map(dest => dest.Name, src => src.Operation!.Name)
                .Map(dest => dest.Guid, src => src.Operation!.Guid)
                .Map(dest => dest.Description, src => src.Operation!.Description)
                .Map(dest => dest.Policy, src => src.Operation!.Policy)
                .Map(dest => dest.Icon, src => src.Operation!.Icon)
                .Map(dest => dest.Path, src => src.Operation!.Path)
                .Map(dest => dest.ModuleId, src => src.Operation!.ModuleId)
                .Map(dest => dest.IsVisible, src => src.Operation!.IsVisible)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.Operation!.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.Operation!.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.Operation!.CreatedAt)
                .Map(dest => dest.UpdatedAt, src => src.Operation!.UpdatedAt)
                .Ignore(dest => dest.RolOperations);

            TypeAdapterConfig<RolOperation, RolOperation>.NewConfig();

            //Mapper Operation
            TypeAdapterConfig<OperationRequest, Operation>.NewConfig()
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Guid, src => src.Guid)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.Policy, src => src.Policy)
                .Map(dest => dest.Icon, src => src.Icon)
                .Map(dest => dest.Path, src => src.Path)
                .Map(dest => dest.ModuleId, src => src.ModuleId)
                .Map(dest => dest.IsVisible, src => src.IsVisible)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<Operation, OperationResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Guid, src => src.Guid)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.Policy, src => src.Policy)
                .Map(dest => dest.Icon, src => src.Icon)
                .Map(dest => dest.Path, src => src.Path)
                .Map(dest => dest.ModuleId, src => src.ModuleId)
                .Map(dest => dest.IsVisible, src => src.IsVisible)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null)
                .Ignore(dest => dest.RolOperations) // Ignorar navegación circular
                .Map(dest => dest.Module, src => src.Module);

            TypeAdapterConfig<Operation, Operation>.NewConfig();    

            //Mapper Specialty
            TypeAdapterConfig<SpecialtyRequest, Specialty>.NewConfig()
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<Specialty, SpecialtyResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null);

            TypeAdapterConfig<Specialty, Specialty>.NewConfig();

            //Mapper Laboratory
            TypeAdapterConfig<LaboratoryRequest, Laboratory>.NewConfig()
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<Laboratory, LaboratoryResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null);

            TypeAdapterConfig<Laboratory, Laboratory>.NewConfig();

            //Mapper Branch
            TypeAdapterConfig<BranchRequest, Branch>.NewConfig()
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Phone, src => src.Phone)
                .Map(dest => dest.Address, src => src.Address)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<Branch, BranchResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Phone, src => src.Phone)
                .Map(dest => dest.Address, src => src.Address)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null);

            TypeAdapterConfig<Branch, Branch>.NewConfig();

            //Mapper AppointmentStatus
            TypeAdapterConfig<AppointmentStatusRequest, AppointmentStatus>.NewConfig()
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<AppointmentStatus, AppointmentStatusResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null);

            TypeAdapterConfig<AppointmentStatus, AppointmentStatus>.NewConfig();

            //Mapper Appointment
            TypeAdapterConfig<AppointmentRequest, Appointment>.NewConfig()
                .Map(dest => dest.PatientId, src => src.PatientId)
                .Map(dest => dest.DoctorId, src => src.DoctorId)
                .Map(dest => dest.SpecialtyId, src => src.SpecialtyId)
                .Map(dest => dest.BranchId, src => src.BranchId)
                .Map(dest => dest.AppointmentStatusId, src => src.AppointmentStatusId)
                .Map(dest => dest.AppointmentDate, src => src.AppointmentDate)
                .Map(dest => dest.Reason, src => src.Reason)
                .Map(dest => dest.Amount, src => src.Amount)
                .Map(dest => dest.Priority, src => src.Priority)
                .Map(dest => dest.ArrivalTime, src => src.ArrivalTime)
                .Map(dest => dest.Notes, src => src.Notes)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<Appointment, AppointmentResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.PatientId, src => src.PatientId)
                .Map(dest => dest.DoctorId, src => src.DoctorId)
                .Map(dest => dest.SpecialtyId, src => src.SpecialtyId)
                .Map(dest => dest.BranchId, src => src.BranchId)
                .Map(dest => dest.AppointmentStatusId, src => src.AppointmentStatusId)
                .Map(dest => dest.AppointmentDate, src => src.AppointmentDate.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.Reason, src => src.Reason)
                .Map(dest => dest.Amount, src => src.Amount)
                .Map(dest => dest.Priority, src => src.Priority)
                .Map(dest => dest.ArrivalTime, src => src.ArrivalTime.HasValue ? src.ArrivalTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : null)
                .Map(dest => dest.Notes, src => src.Notes)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null)
                .Map(dest => dest.Specialty, src => src.Specialty)
                .Map(dest => dest.Branch, src => src.Branch)
                .Map(dest => dest.AppointmentStatus, src => src.AppointmentStatus);

            TypeAdapterConfig<Appointment, Appointment>.NewConfig();

            //Mapper Payment
            TypeAdapterConfig<PaymentRequest, Payment>.NewConfig()
                .Map(dest => dest.AppointmentId, src => src.AppointmentId)
                .Map(dest => dest.TransactionNumber, src => src.TransactionNumber)
                .Map(dest => dest.Amount, src => src.Amount)
                .Map(dest => dest.PaymentMethod, src => src.PaymentMethod)
                .Map(dest => dest.PaymentType, src => src.PaymentType)
                .Map(dest => dest.PaymentStatus, src => src.PaymentStatus)
                .Map(dest => dest.PaymentDate, src => src.PaymentDate)
                .Map(dest => dest.CardLastFourDigits, src => src.CardLastFourDigits)
                .Map(dest => dest.IdempotencyKey, src => src.IdempotencyKey)
                .Map(dest => dest.AmountReceived, src => src.AmountReceived)
                .Map(dest => dest.ChangeAmount, src => src.ChangeAmount)
                .Map(dest => dest.GatewayResponseCode, src => src.GatewayResponseCode)
                .Map(dest => dest.GatewayMessage, src => src.GatewayMessage)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<Payment, PaymentResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.AppointmentId, src => src.AppointmentId)
                .Map(dest => dest.TransactionNumber, src => src.TransactionNumber)
                .Map(dest => dest.Amount, src => src.Amount)
                .Map(dest => dest.PaymentMethod, src => src.PaymentMethod)
                .Map(dest => dest.PaymentType, src => src.PaymentType)
                .Map(dest => dest.PaymentStatus, src => src.PaymentStatus)
                .Map(dest => dest.PaymentDate, src => src.PaymentDate.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.CardLastFourDigits, src => src.CardLastFourDigits)
                .Map(dest => dest.IdempotencyKey, src => src.IdempotencyKey)
                .Map(dest => dest.AmountReceived, src => src.AmountReceived)
                .Map(dest => dest.ChangeAmount, src => src.ChangeAmount)
                .Map(dest => dest.GatewayResponseCode, src => src.GatewayResponseCode)
                .Map(dest => dest.GatewayMessage, src => src.GatewayMessage)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null);

            TypeAdapterConfig<Payment, Payment>.NewConfig();

            //Mapper AppointmentDocument
            TypeAdapterConfig<AppointmentDocumentRequest, AppointmentDocument>.NewConfig()
                .Map(dest => dest.AppointmentId, src => src.AppointmentId)
                .Map(dest => dest.FileName, src => src.FileName)
                .Map(dest => dest.FilePath, src => src.FilePath)
                .Map(dest => dest.ContentType, src => src.ContentType)
                .Map(dest => dest.FileSize, src => src.FileSize)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.UpdatedAt!);

            TypeAdapterConfig<AppointmentDocument, AppointmentDocumentResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.AppointmentId, src => src.AppointmentId)
                .Map(dest => dest.FileName, src => src.FileName)
                .Map(dest => dest.FilePath, src => src.FilePath)
                .Map(dest => dest.ContentType, src => src.ContentType)
                .Map(dest => dest.FileSize, src => src.FileSize)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null);

            TypeAdapterConfig<AppointmentDocument, AppointmentDocument>.NewConfig();

            //Mapper Module
            TypeAdapterConfig<Module, ModuleResponse>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Name, src => src.Name)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.Image, src => src.Image)
                .Map(dest => dest.Path, src => src.Path)
                .Map(dest => dest.State, src => src.State)
                .Map(dest => dest.CreatedBy, src => src.CreatedBy)
                .Map(dest => dest.UpdatedBy, src => src.UpdatedBy)
                .Map(dest => dest.CreatedAt, src => src.CreatedAt.ToString("dd/MM/yyyy HH:mm:ss"))
                .Map(dest => dest.UpdatedAt, src => src.UpdatedAt.HasValue ? src.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm:ss") : null)
                .Ignore(dest => dest.Operations); // Ignorar navegación circular
        }
    }
}