using FluentValidation.Results;
using Hospital.Server.Context;
using Hospital.Server.Entities.Models;
using Hospital.Server.Entities.Request;
using Hospital.Server.Entities.Response;
using Hospital.Server.Interceptors.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Server.Interceptors.AppointmentInterceptors
{
    /// <summary>
    /// Before creating a DispenseItem, looks up the associated Medicine
    /// and copies DefaultPrice → UnitPrice.
    /// If DefaultPrice is 0 or null, assigns UnitPrice = 0.
    /// </summary>
    public class DispenseItemBeforeCreateInterceptor
        : IEntityBeforeCreateInterceptor<DispenseItem, DispenseItemRequest>
    {
        private readonly DataContext _db;

        public DispenseItemBeforeCreateInterceptor(DataContext db)
        {
            _db = db;
        }

        public Response<DispenseItem, List<ValidationFailure>> Execute(
            Response<DispenseItem, List<ValidationFailure>> response,
            DispenseItemRequest request)
        {
            if (response.Data == null) return response;

            if (request.MedicineId == null || request.MedicineId <= 0)
            {
                response.Success = false;
                response.Errors = [new ValidationFailure("MedicineId",
                    "Debe especificar el medicamento.")];
                return response;
            }

            var medicine = _db.Medicines
                .AsNoTracking()
                .FirstOrDefault(m => m.Id == request.MedicineId && m.State == 1);

            if (medicine == null)
            {
                response.Success = false;
                response.Errors = [new ValidationFailure("MedicineId",
                    "El medicamento especificado no existe o no está activo.")];
                return response;
            }

            // Copy Medicine.DefaultPrice → DispenseItem.UnitPrice
            // If DefaultPrice is 0 or effectively null, assign UnitPrice = 0
            response.Data.UnitPrice = medicine.DefaultPrice > 0
                ? medicine.DefaultPrice
                : 0;

            return response;
        }
    }
}
