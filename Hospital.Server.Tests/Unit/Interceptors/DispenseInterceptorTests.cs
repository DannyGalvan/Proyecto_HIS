using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.AppointmentInterceptors;
using Hospital.Server.Interceptors.InventoryInterceptors;
using Hospital.Server.Services.Core;
using Hospital.Server.Services.Interfaces;
using Hospital.Server.Tests.Infrastructure;
using Moq;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class DispenseItemBeforeCreateInterceptorTests : TestBase
    {
        private readonly DispenseItemBeforeCreateInterceptor _sut;

        public DispenseItemBeforeCreateInterceptorTests()
        {
            _sut = new DispenseItemBeforeCreateInterceptor(DbContext);
        }

        [Fact]
        public void Execute_WithValidMedicine_SetsUnitPriceFromDefaultPrice()
        {
            // Arrange
            var medicine = new Medicine
            {
                Id = 1,
                Name = "Paracetamol",
                Description = "Analgésico",
                DefaultPrice = 25.50m,
                Unit = "tableta",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.Medicines.Add(medicine);
            DbContext.SaveChanges();

            var entity = new DispenseItem
            {
                DispenseId = 1,
                MedicineId = 1,
                Quantity = 10,
                OriginalMedicineName = "Paracetamol",
                DispensedMedicineName = "Paracetamol",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<DispenseItem, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DispenseItemRequest
            {
                MedicineId = 1,
                DispenseId = 1,
                Quantity = 10,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.UnitPrice.Should().Be(25.50m);
        }

        [Fact]
        public void Execute_WithMedicineDefaultPriceZero_SetsUnitPriceToZero()
        {
            // Arrange
            var medicine = new Medicine
            {
                Id = 1,
                Name = "Suero Oral",
                Description = "Rehidratación",
                DefaultPrice = 0m,
                Unit = "sobre",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.Medicines.Add(medicine);
            DbContext.SaveChanges();

            var entity = new DispenseItem
            {
                DispenseId = 1,
                MedicineId = 1,
                Quantity = 5,
                OriginalMedicineName = "Suero Oral",
                DispensedMedicineName = "Suero Oral",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<DispenseItem, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DispenseItemRequest
            {
                MedicineId = 1,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.UnitPrice.Should().Be(0m);
        }

        [Fact]
        public void Execute_WithNullMedicineId_ReturnsFailure()
        {
            // Arrange
            var entity = new DispenseItem
            {
                DispenseId = 1,
                MedicineId = 0,
                Quantity = 5,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<DispenseItem, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DispenseItemRequest
            {
                MedicineId = null,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("MedicineId");
        }

        [Fact]
        public void Execute_WithNonExistentMedicine_ReturnsFailure()
        {
            // Arrange
            var entity = new DispenseItem
            {
                DispenseId = 1,
                MedicineId = 999,
                Quantity = 5,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<DispenseItem, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new DispenseItemRequest
            {
                MedicineId = 999,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("MedicineId");
            result.Errors![0].ErrorMessage.Should().Contain("no existe");
        }

        [Fact]
        public void Execute_WhenDataIsNull_ReturnsResponseUnchanged()
        {
            // Arrange
            var response = new Response<DispenseItem, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new DispenseItemRequest { MedicineId = 1, CreatedBy = 1 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().BeNull();
        }
    }

    public class DispenseAfterCreateInterceptorTests : TestBase
    {
        private readonly Mock<IAppointmentStateMachine> _stateMachineMock;
        private readonly DispenseAfterCreateInterceptor _sut;

        public DispenseAfterCreateInterceptorTests()
        {
            _stateMachineMock = new Mock<IAppointmentStateMachine>();
            _stateMachineMock
                .Setup(sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((true, (string?)null));
            _sut = new DispenseAfterCreateInterceptor(_stateMachineMock.Object, DbContext);
        }

        [Fact]
        public void Execute_WithValidPrescription_CallsTransitionWithStatusFarmacia()
        {
            // Arrange - set up the chain: Prescription → MedicalConsultation → Appointment
            var appointment = new Appointment
            {
                Id = 1,
                PatientId = 10,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 6, // Evaluado
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.Appointments.Add(appointment);

            var consultation = new MedicalConsultation
            {
                Id = 1,
                AppointmentId = 1,
                DoctorId = 2,
                ConsultationStatus = 1,
                ReasonForVisit = "Control",
                ClinicalFindings = "Normal",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.MedicalConsultations.Add(consultation);

            var prescription = new Prescription
            {
                Id = 1,
                ConsultationId = 1,
                DoctorId = 2,
                PrescriptionDate = DateTime.UtcNow,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.Prescriptions.Add(prescription);
            DbContext.SaveChanges();

            var dispense = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                DispenseStatus = 0,
                TotalAmount = 0,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            DbContext.Dispenses.Add(dispense);
            DbContext.SaveChanges();

            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = true,
                Data = dispense
            };

            var request = new DispenseRequest
            {
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                CreatedBy = 3
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(
                    1, // appointmentId
                    AppointmentStateMachine.STATUS_FARMACIA,
                    3, // CreatedBy
                    It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public void Execute_RecalculatesTotalAmountFromActiveDispenseItems()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 1,
                PatientId = 10,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 6,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.Appointments.Add(appointment);

            var consultation = new MedicalConsultation
            {
                Id = 1,
                AppointmentId = 1,
                DoctorId = 2,
                ConsultationStatus = 1,
                ReasonForVisit = "Control",
                ClinicalFindings = "Normal",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.MedicalConsultations.Add(consultation);

            var prescription = new Prescription
            {
                Id = 1,
                ConsultationId = 1,
                DoctorId = 2,
                PrescriptionDate = DateTime.UtcNow,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.Prescriptions.Add(prescription);

            var dispense = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                DispenseStatus = 0,
                TotalAmount = 0,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            DbContext.Dispenses.Add(dispense);

            // Add DispenseItems
            var item1 = new DispenseItem
            {
                Id = 1,
                DispenseId = 1,
                MedicineId = 1,
                Quantity = 2,
                UnitPrice = 25.00m,
                OriginalMedicineName = "Med A",
                DispensedMedicineName = "Med A",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            var item2 = new DispenseItem
            {
                Id = 2,
                DispenseId = 1,
                MedicineId = 2,
                Quantity = 3,
                UnitPrice = 10.00m,
                OriginalMedicineName = "Med B",
                DispensedMedicineName = "Med B",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            // Inactive item should not be counted
            var item3 = new DispenseItem
            {
                Id = 3,
                DispenseId = 1,
                MedicineId = 3,
                Quantity = 5,
                UnitPrice = 100.00m,
                OriginalMedicineName = "Med C",
                DispensedMedicineName = "Med C",
                State = 0, // Inactive
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            DbContext.DispenseItems.AddRange(item1, item2, item3);
            DbContext.SaveChanges();

            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = true,
                Data = dispense
            };

            var request = new DispenseRequest
            {
                PrescriptionId = 1,
                CreatedBy = 3
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            // TotalAmount = (25*2) + (10*3) = 50 + 30 = 80
            result.Data!.TotalAmount.Should().Be(80.00m);
        }

        [Fact]
        public void Execute_WhenResponseNotSuccess_DoesNotCallTransition()
        {
            // Arrange
            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = false,
                Data = new Dispense { PrescriptionId = 1, CreatedBy = 3 }
            };

            var request = new DispenseRequest();

            // Act
            _sut.Execute(response, request);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public void Execute_WhenDataIsNull_DoesNotCallTransition()
        {
            // Arrange
            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new DispenseRequest();

            // Act
            _sut.Execute(response, request);

            // Assert
            _stateMachineMock.Verify(
                sm => sm.TransitionAsync(It.IsAny<long>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }
    }

    public class DispenseAfterStatusChangeInterceptorTests : TestBase
    {
        private readonly DispenseAfterStatusChangeInterceptor _sut;

        public DispenseAfterStatusChangeInterceptorTests()
        {
            _sut = new DispenseAfterStatusChangeInterceptor(DbContext);
        }

        [Fact]
        public void Execute_WhenStatusTransitionsTo2_CreatesInventoryMovementsForEachItem()
        {
            // Arrange - set up the full chain
            var appointment = new Appointment
            {
                Id = 1,
                PatientId = 10,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 8,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.Appointments.Add(appointment);

            var consultation = new MedicalConsultation
            {
                Id = 1,
                AppointmentId = 1,
                DoctorId = 2,
                ConsultationStatus = 1,
                ReasonForVisit = "Control",
                ClinicalFindings = "Normal",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.MedicalConsultations.Add(consultation);

            var prescription = new Prescription
            {
                Id = 1,
                ConsultationId = 1,
                DoctorId = 2,
                PrescriptionDate = DateTime.UtcNow,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.Prescriptions.Add(prescription);

            // Medicine inventories
            var inventory1 = new MedicineInventory
            {
                Id = 1,
                MedicineId = 1,
                BranchId = 1,
                CurrentStock = 100,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            var inventory2 = new MedicineInventory
            {
                Id = 2,
                MedicineId = 2,
                BranchId = 1,
                CurrentStock = 50,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.MedicineInventories.AddRange(inventory1, inventory2);

            var dispense = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                DispenseStatus = 2, // Transitioning TO Dispensed
                TotalAmount = 80.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3,
                UpdatedBy = 3
            };
            DbContext.Dispenses.Add(dispense);

            var item1 = new DispenseItem
            {
                Id = 1,
                DispenseId = 1,
                MedicineId = 1,
                Quantity = 5,
                UnitPrice = 10.00m,
                OriginalMedicineName = "Med A",
                DispensedMedicineName = "Med A",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            var item2 = new DispenseItem
            {
                Id = 2,
                DispenseId = 1,
                MedicineId = 2,
                Quantity = 3,
                UnitPrice = 20.00m,
                OriginalMedicineName = "Med B",
                DispensedMedicineName = "Med B",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            DbContext.DispenseItems.AddRange(item1, item2);
            DbContext.SaveChanges();

            var prevState = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                DispenseStatus = 1, // Was Paid (not 2)
                TotalAmount = 80.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };

            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = true,
                Data = dispense
            };

            var request = new DispenseRequest
            {
                DispenseStatus = 2,
                UpdatedBy = 3
            };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeTrue();

            var movements = DbContext.InventoryMovements.ToList();
            movements.Should().HaveCount(2);

            // Verify first movement
            var movement1 = movements.First(m => m.MedicineId == 1);
            movement1.MovementType.Should().Be(6); // Despacho
            movement1.Quantity.Should().Be(5);
            movement1.PreviousStock.Should().Be(100);
            movement1.NewStock.Should().Be(95);
            movement1.UnitCost.Should().Be(10.00m);
            movement1.TotalCost.Should().Be(50.00m);

            // Verify second movement
            var movement2 = movements.First(m => m.MedicineId == 2);
            movement2.MovementType.Should().Be(6);
            movement2.Quantity.Should().Be(3);
            movement2.PreviousStock.Should().Be(50);
            movement2.NewStock.Should().Be(47);
            movement2.UnitCost.Should().Be(20.00m);
            movement2.TotalCost.Should().Be(60.00m);

            // Verify inventory was decremented
            inventory1.CurrentStock.Should().Be(95);
            inventory2.CurrentStock.Should().Be(47);
        }

        [Fact]
        public void Execute_WhenStatusWasAlready2_DoesNotCreateMovements()
        {
            // Arrange
            var dispense = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                DispenseStatus = 2, // Current status is 2
                TotalAmount = 50.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            DbContext.Dispenses.Add(dispense);
            DbContext.SaveChanges();

            var prevState = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                DispenseStatus = 2, // Was ALREADY 2 before update
                TotalAmount = 50.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };

            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = true,
                Data = dispense
            };

            var request = new DispenseRequest
            {
                DispenseStatus = 2,
                UpdatedBy = 3
            };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeTrue();
            DbContext.InventoryMovements.Should().BeEmpty();
        }

        [Fact]
        public void Execute_WhenStatusIsNot2_DoesNotCreateMovements()
        {
            // Arrange
            var dispense = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                DispenseStatus = 1, // Status is 1 (Paid), not 2
                TotalAmount = 50.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            DbContext.Dispenses.Add(dispense);
            DbContext.SaveChanges();

            var prevState = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                DispenseStatus = 0, // Was Pending
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };

            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = true,
                Data = dispense
            };

            var request = new DispenseRequest
            {
                DispenseStatus = 1,
                UpdatedBy = 3
            };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeTrue();
            DbContext.InventoryMovements.Should().BeEmpty();
        }

        [Fact]
        public void Execute_WhenResponseNotSuccess_DoesNotCreateMovements()
        {
            // Arrange
            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = false,
                Data = new Dispense { DispenseStatus = 2 }
            };

            var prevState = new Dispense { DispenseStatus = 1 };
            var request = new DispenseRequest();

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeFalse();
            DbContext.InventoryMovements.Should().BeEmpty();
        }

        [Fact]
        public void Execute_WhenInsufficientStock_ReturnsFailure()
        {
            // Arrange
            var appointment = new Appointment
            {
                Id = 1,
                PatientId = 10,
                DoctorId = 2,
                SpecialtyId = 1,
                BranchId = 1,
                AppointmentStatusId = 8,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.Appointments.Add(appointment);

            var consultation = new MedicalConsultation
            {
                Id = 1,
                AppointmentId = 1,
                DoctorId = 2,
                ConsultationStatus = 1,
                ReasonForVisit = "Control",
                ClinicalFindings = "Normal",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.MedicalConsultations.Add(consultation);

            var prescription = new Prescription
            {
                Id = 1,
                ConsultationId = 1,
                DoctorId = 2,
                PrescriptionDate = DateTime.UtcNow,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 2
            };
            DbContext.Prescriptions.Add(prescription);

            var inventory = new MedicineInventory
            {
                Id = 1,
                MedicineId = 1,
                BranchId = 1,
                CurrentStock = 2, // Only 2 in stock
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.MedicineInventories.Add(inventory);

            var dispense = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                PatientId = 10,
                PharmacistId = 3,
                DispenseStatus = 2,
                TotalAmount = 50.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3,
                UpdatedBy = 3
            };
            DbContext.Dispenses.Add(dispense);

            var item = new DispenseItem
            {
                Id = 1,
                DispenseId = 1,
                MedicineId = 1,
                Quantity = 10, // Requesting 10 but only 2 available
                UnitPrice = 5.00m,
                OriginalMedicineName = "Med A",
                DispensedMedicineName = "Med A",
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };
            DbContext.DispenseItems.Add(item);
            DbContext.SaveChanges();

            var prevState = new Dispense
            {
                Id = 1,
                PrescriptionId = 1,
                DispenseStatus = 1, // Was Paid
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 3
            };

            var response = new Response<Dispense, List<ValidationFailure>>
            {
                Success = true,
                Data = dispense
            };

            var request = new DispenseRequest
            {
                DispenseStatus = 2,
                UpdatedBy = 3
            };

            // Act
            var result = _sut.Execute(response, request, prevState);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("Quantity");
            result.Errors![0].ErrorMessage.Should().Contain("Stock insuficiente");
        }
    }
}
