using FluentAssertions;
using FluentValidation.Results;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.InventoryInterceptors;
using Hospital.Server.Tests.Infrastructure;
using Xunit;

namespace Hospital.Server.Tests.Unit.Interceptors
{
    public class InventoryMovementInterceptorTests : TestBase
    {
        private readonly InventoryMovementBeforeCreateInterceptor _sut;

        public InventoryMovementInterceptorTests()
        {
            _sut = new InventoryMovementBeforeCreateInterceptor(DbContext);
        }

        #region Entry Movement Types (0, 1, 4)

        [Theory]
        [InlineData(0)] // Compra
        [InlineData(1)] // Devolución_Proveedor
        [InlineData(4)] // Ajuste_Positivo
        public void Execute_EntryMovementType_SetsPreviousStockAndIncrementsNewStock(int movementType)
        {
            // Arrange
            var inventory = new MedicineInventory
            {
                Id = 1,
                MedicineId = 10,
                BranchId = 1,
                CurrentStock = 50,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.MedicineInventories.Add(inventory);
            DbContext.SaveChanges();

            var entity = new InventoryMovement
            {
                MedicineInventoryId = 1,
                MedicineId = 10,
                BranchId = 1,
                MovementType = movementType,
                Quantity = 20,
                UnitCost = 15.50m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<InventoryMovement, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new InventoryMovementRequest
            {
                MedicineInventoryId = 1,
                MedicineId = 10,
                BranchId = 1,
                MovementType = movementType,
                Quantity = 20,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.PreviousStock.Should().Be(50);
            result.Data.NewStock.Should().Be(70); // 50 + 20
            result.Data.TotalCost.Should().Be(15.50m * 20); // UnitCost * Quantity
            inventory.CurrentStock.Should().Be(70);
        }

        [Fact]
        public void Execute_EntryMovementType_CalculatesTotalCostCorrectly()
        {
            // Arrange
            var inventory = new MedicineInventory
            {
                Id = 1,
                MedicineId = 10,
                BranchId = 1,
                CurrentStock = 100,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.MedicineInventories.Add(inventory);
            DbContext.SaveChanges();

            var entity = new InventoryMovement
            {
                MedicineInventoryId = 1,
                MedicineId = 10,
                BranchId = 1,
                MovementType = 0, // Compra
                Quantity = 5,
                UnitCost = 25.75m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<InventoryMovement, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new InventoryMovementRequest
            {
                MedicineInventoryId = 1,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.TotalCost.Should().Be(128.75m); // 25.75 * 5
        }

        #endregion

        #region Exit Movement Types (2, 3, 5, 6) - Insufficient Stock

        [Theory]
        [InlineData(2)] // Venta
        [InlineData(3)] // Reclamo
        [InlineData(5)] // Ajuste_Negativo
        [InlineData(6)] // Despacho
        public void Execute_ExitMovementType_InsufficientStock_ReturnsFailure(int movementType)
        {
            // Arrange
            var inventory = new MedicineInventory
            {
                Id = 1,
                MedicineId = 10,
                BranchId = 1,
                CurrentStock = 5, // Only 5 in stock
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.MedicineInventories.Add(inventory);
            DbContext.SaveChanges();

            var entity = new InventoryMovement
            {
                MedicineInventoryId = 1,
                MedicineId = 10,
                BranchId = 1,
                MovementType = movementType,
                Quantity = 10, // Requesting more than available
                UnitCost = 5.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<InventoryMovement, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new InventoryMovementRequest
            {
                MedicineInventoryId = 1,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("Quantity");
            result.Errors![0].ErrorMessage.Should().Contain("Stock insuficiente");
        }

        #endregion

        #region Exit Movement Types (2, 3, 5, 6) - Sufficient Stock

        [Theory]
        [InlineData(2)] // Venta
        [InlineData(3)] // Reclamo
        [InlineData(5)] // Ajuste_Negativo
        [InlineData(6)] // Despacho
        public void Execute_ExitMovementType_SufficientStock_DecrementsStockCorrectly(int movementType)
        {
            // Arrange
            var inventory = new MedicineInventory
            {
                Id = 1,
                MedicineId = 10,
                BranchId = 1,
                CurrentStock = 30,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };
            DbContext.MedicineInventories.Add(inventory);
            DbContext.SaveChanges();

            var entity = new InventoryMovement
            {
                MedicineInventoryId = 1,
                MedicineId = 10,
                BranchId = 1,
                MovementType = movementType,
                Quantity = 10,
                UnitCost = 8.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<InventoryMovement, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new InventoryMovementRequest
            {
                MedicineInventoryId = 1,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data!.PreviousStock.Should().Be(30);
            result.Data.NewStock.Should().Be(20); // 30 - 10
            result.Data.TotalCost.Should().Be(80.00m); // 8.00 * 10
            inventory.CurrentStock.Should().Be(20);
        }

        #endregion

        #region Edge Cases

        [Fact]
        public void Execute_WhenMedicineInventoryIdIsNull_ReturnsFailure()
        {
            // Arrange
            var entity = new InventoryMovement
            {
                MovementType = 0,
                Quantity = 10,
                UnitCost = 5.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<InventoryMovement, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new InventoryMovementRequest
            {
                MedicineInventoryId = null,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("MedicineInventoryId");
        }

        [Fact]
        public void Execute_WhenMedicineInventoryNotFound_ReturnsFailure()
        {
            // Arrange
            var entity = new InventoryMovement
            {
                MedicineInventoryId = 999,
                MovementType = 0,
                Quantity = 10,
                UnitCost = 5.00m,
                State = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = 1
            };

            var response = new Response<InventoryMovement, List<ValidationFailure>>
            {
                Success = true,
                Data = entity
            };

            var request = new InventoryMovementRequest
            {
                MedicineInventoryId = 999,
                CreatedBy = 1
            };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeFalse();
            result.Errors.Should().ContainSingle()
                .Which.PropertyName.Should().Be("MedicineInventoryId");
            result.Errors![0].ErrorMessage.Should().Contain("no existe");
        }

        [Fact]
        public void Execute_WhenDataIsNull_ReturnsResponseUnchanged()
        {
            // Arrange
            var response = new Response<InventoryMovement, List<ValidationFailure>>
            {
                Success = true,
                Data = null
            };

            var request = new InventoryMovementRequest { MedicineInventoryId = 1, CreatedBy = 1 };

            // Act
            var result = _sut.Execute(response, request);

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().BeNull();
        }

        #endregion
    }
}
