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
    /// Before creating a LabOrderItem, looks up the associated LabExam
    /// and copies DefaultAmount → Amount and Name → ExamName.
    /// If DefaultAmount is 0 or null, assigns Amount = 0.
    /// </summary>
    public class LabOrderItemBeforeCreateInterceptor
        : IEntityBeforeCreateInterceptor<LabOrderItem, LabOrderItemRequest>
    {
        private readonly DataContext _db;

        public LabOrderItemBeforeCreateInterceptor(DataContext db)
        {
            _db = db;
        }

        public Response<LabOrderItem, List<ValidationFailure>> Execute(
            Response<LabOrderItem, List<ValidationFailure>> response,
            LabOrderItemRequest request)
        {
            if (response.Data == null) return response;

            if (request.LabExamId == null || request.LabExamId <= 0)
            {
                response.Success = false;
                response.Errors = [new ValidationFailure("LabExamId",
                    "Debe especificar el examen de laboratorio.")];
                return response;
            }

            var labExam = _db.LabExams
                .AsNoTracking()
                .FirstOrDefault(e => e.Id == request.LabExamId && e.State == 1);

            if (labExam == null)
            {
                response.Success = false;
                response.Errors = [new ValidationFailure("LabExamId",
                    "El examen de laboratorio especificado no existe o no está activo.")];
                return response;
            }

            // Copy LabExam.Name → LabOrderItem.ExamName
            response.Data.ExamName = labExam.Name;

            // Copy LabExam.DefaultAmount → LabOrderItem.Amount
            // If DefaultAmount is 0 or effectively null, assign Amount = 0
            response.Data.Amount = labExam.DefaultAmount > 0
                ? labExam.DefaultAmount
                : 0;

            return response;
        }
    }
}
