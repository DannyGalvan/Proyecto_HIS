using Hospital.Server.Entities.Models;

namespace Hospital.Server.Tests.Infrastructure
{
    /// <summary>
    /// Factory methods for creating test entities with sensible defaults.
    /// All methods accept optional parameters to override defaults for specific test scenarios.
    /// </summary>
    public static class TestDataFactory
    {
        public static User CreateUser(
            long id = 1,
            string name = "Test User",
            string email = "user@test.com",
            string userName = "testuser",
            string password = "hashedpassword",
            long rolId = 1,
            int state = 1,
            long createdBy = 1)
        {
            return new User
            {
                Id = id,
                Name = name,
                Email = email,
                UserName = userName,
                Password = password,
                RolId = rolId,
                Number = "12345678",
                IdentificationDocument = "1234567890101",
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static Appointment CreateAppointment(
            long id = 1,
            long patientId = 1,
            long? doctorId = 2,
            long specialtyId = 1,
            long branchId = 1,
            long appointmentStatusId = 1,
            decimal amount = 100m,
            int state = 1,
            long createdBy = 1)
        {
            return new Appointment
            {
                Id = id,
                PatientId = patientId,
                DoctorId = doctorId,
                SpecialtyId = specialtyId,
                BranchId = branchId,
                AppointmentStatusId = appointmentStatusId,
                AppointmentDate = DateTime.UtcNow.AddDays(1),
                Reason = "Consulta médica de prueba para test",
                Amount = amount,
                Priority = 0,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static Medicine CreateMedicine(
            long id = 1,
            string name = "Acetaminofén",
            string description = "Analgésico y antipirético",
            decimal defaultPrice = 25.50m,
            string unit = "tableta",
            int state = 1,
            long createdBy = 1)
        {
            return new Medicine
            {
                Id = id,
                Name = name,
                Description = description,
                DefaultPrice = defaultPrice,
                Unit = unit,
                IsControlled = false,
                MinimumStock = 10,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static Payment CreatePayment(
            long id = 1,
            long? appointmentId = 1,
            decimal amount = 100m,
            int paymentMethod = 0,
            int paymentType = 1,
            int paymentStatus = 1,
            int state = 1,
            long createdBy = 1)
        {
            return new Payment
            {
                Id = id,
                AppointmentId = appointmentId,
                TransactionNumber = $"TXN-{id:D6}",
                Amount = amount,
                PaymentMethod = paymentMethod,
                PaymentType = paymentType,
                PaymentStatus = paymentStatus,
                PaymentDate = DateTime.UtcNow,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static DoctorEvent CreateDoctorEvent(
            long id = 1,
            long doctorId = 2,
            string title = "Reunión de equipo",
            int eventType = 0,
            int state = 1,
            long createdBy = 2)
        {
            return new DoctorEvent
            {
                Id = id,
                DoctorId = doctorId,
                Title = title,
                Description = "Evento de prueba",
                StartDate = DateTime.UtcNow.AddHours(1),
                EndDate = DateTime.UtcNow.AddHours(2),
                EventType = eventType,
                IsAllDay = false,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static DoctorTask CreateDoctorTask(
            long id = 1,
            long doctorId = 2,
            string title = "Revisar resultados",
            int priority = 1,
            int state = 1,
            long createdBy = 2)
        {
            return new DoctorTask
            {
                Id = id,
                DoctorId = doctorId,
                Title = title,
                Description = "Tarea de prueba",
                DueDate = DateTime.UtcNow.AddDays(1),
                IsCompleted = false,
                Priority = priority,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static MedicalConsultation CreateMedicalConsultation(
            long id = 1,
            long appointmentId = 1,
            long doctorId = 2,
            int consultationStatus = 0,
            int state = 1,
            long createdBy = 2)
        {
            return new MedicalConsultation
            {
                Id = id,
                AppointmentId = appointmentId,
                DoctorId = doctorId,
                ReasonForVisit = "Dolor de cabeza persistente",
                ClinicalFindings = "Paciente presenta cefalea tensional",
                Diagnosis = consultationStatus == 1 ? "Cefalea tensional" : null,
                ConsultationStatus = consultationStatus,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static LabOrder CreateLabOrder(
            long id = 1,
            long consultationId = 1,
            long doctorId = 2,
            long patientId = 1,
            int orderStatus = 0,
            decimal totalAmount = 150m,
            int state = 1,
            long createdBy = 2)
        {
            return new LabOrder
            {
                Id = id,
                ConsultationId = consultationId,
                DoctorId = doctorId,
                PatientId = patientId,
                OrderNumber = $"LAB-{id:D6}",
                OrderStatus = orderStatus,
                TotalAmount = totalAmount,
                IsExternal = false,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static Prescription CreatePrescription(
            long id = 1,
            long consultationId = 1,
            long doctorId = 2,
            int state = 1,
            long createdBy = 2)
        {
            return new Prescription
            {
                Id = id,
                ConsultationId = consultationId,
                DoctorId = doctorId,
                PrescriptionDate = DateTime.UtcNow,
                Notes = "Tomar con alimentos",
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static Dispense CreateDispense(
            long id = 1,
            long prescriptionId = 1,
            long patientId = 1,
            long pharmacistId = 3,
            int dispenseStatus = 0,
            decimal totalAmount = 75m,
            int state = 1,
            long createdBy = 3)
        {
            return new Dispense
            {
                Id = id,
                PrescriptionId = prescriptionId,
                PatientId = patientId,
                PharmacistId = pharmacistId,
                DispenseStatus = dispenseStatus,
                TotalAmount = totalAmount,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }

        public static InventoryMovement CreateInventoryMovement(
            long id = 1,
            long medicineInventoryId = 1,
            long medicineId = 1,
            long branchId = 1,
            int movementType = 0,
            int quantity = 100,
            int previousStock = 50,
            decimal unitCost = 10m,
            int state = 1,
            long createdBy = 1)
        {
            var isEntry = movementType == 0 || movementType == 1 || movementType == 4;
            var newStock = isEntry ? previousStock + quantity : previousStock - quantity;

            return new InventoryMovement
            {
                Id = id,
                MedicineInventoryId = medicineInventoryId,
                MedicineId = medicineId,
                BranchId = branchId,
                MovementType = movementType,
                Quantity = quantity,
                PreviousStock = previousStock,
                NewStock = newStock,
                UnitCost = unitCost,
                TotalCost = unitCost * quantity,
                ReferenceNumber = $"REF-{id:D6}",
                ReferenceType = "Factura",
                UserId = createdBy,
                State = state,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                UpdatedAt = null,
                UpdatedBy = null
            };
        }
    }
}
