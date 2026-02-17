using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.Common.Pagination;
using AngoMenu_MVP_WebApp.DTOs.Reservation;
using AngoMenu_MVP_WebApp.DTOs.Restaurant;
using AngoMenu_MVP_WebApp.Models.Enums;

namespace AngoMenu_MVP_WebApp.Services.Interfaces
{
    public interface IReservationService
    {
        Task<Result> CreateReservation(int userId, ReservationCreateDto dto);
        Task<Result<List<ReservationResponseDto>>> GetUserReservations(int userId);
        Task<Result> CancelReservation(int userId, int reservationId);
        Task<Result<List<AdminReservationResponseDto>>> GetAllReservations();
        Task<Result> UpdateReservationStatus(int reservationId, ReservationStatus status);
    }
}
