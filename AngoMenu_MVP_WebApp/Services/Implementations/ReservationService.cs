using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs.Reservation;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Models.Enums;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngoMenu_MVP_WebApp.Services.Implementations
{
    public class ReservationService : IReservationService
    {
        private readonly ApplicationDbContext _context;

        public ReservationService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Create a new reservation
        public async Task<Result> CreateReservation(int userId, ReservationCreateDto dto)
        {
            if (dto.Date < DateOnly.FromDateTime(DateTime.UtcNow))
                return Result.Fail("Reservation date cannot be in the past.");

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId);

            if (restaurant == null)
                return Result.Fail("Restaurant does not exist.");

            if (dto.Time < restaurant.OpeningHour || dto.Time > restaurant.ClosingHour)
                return Result.Fail("Reservation time is outside restaurant opening hours.");

            var existingReservation = await _context.Reservations
                .AnyAsync(r =>
                    r.UserId == userId &&
                    r.Date == dto.Date &&
                    r.Time == dto.Time &&
                    r.Status != ReservationStatus.Cancelled);

            if (existingReservation)
                return Result.Fail("You already have a reservation at this time.");

            var reservation = new Reservation
            {
                UserId = userId,
                RestaurantId = dto.RestaurantId,
                Date = dto.Date,
                Time = dto.Time,
                NumberOfPeople = dto.NumberOfPeople,
                Status = ReservationStatus.Pending
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return Result.Ok("Reservation created successfully.");
        }

        //Get all reservations for a user
        public async Task<Result<List<ReservationResponseDto>>> GetUserReservations(int userId)
        {
            var reservations = await _context.Reservations
                .Include(r => r.Restaurant)
                .Where(r => r.UserId == userId)
                .Select(r => new ReservationResponseDto
                {
                    Id = r.Id,
                    RestaurantId = r.RestaurantId,
                    RestaurantName = r.Restaurant.Name,
                    Date = r.Date,
                    Time = r.Time,
                    NumberOfPeople = r.NumberOfPeople,
                    Status = r.Status.ToString()
                })
                .ToListAsync();

            return Result<List<ReservationResponseDto>>.Ok(reservations);
        }

        //Cancel a reservation
        public async Task<Result> CancelReservation(int userId, int reservationId)
        {
            var reservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.Id == reservationId && r.UserId == userId);

            if (reservation == null)
                return Result.Fail("Reservation not found.");

            reservation.Status = ReservationStatus.Cancelled;

            await _context.SaveChangesAsync();

            return Result.Ok("Reservation cancelled.");
        }

        // Admin: Get all reservations
        public async Task<Result<List<AdminReservationResponseDto>>> GetAllReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .Select(r => new AdminReservationResponseDto
                {
                    Id = r.Id,
                    UserEmail = r.User.Email,
                    Restaurant = r.Restaurant.Name,
                    Date = r.Date,
                    Time = r.Time,
                    NumberOfPeople = r.NumberOfPeople,
                    Status = r.Status.ToString()
                })
                .ToListAsync();

            return Result<List<AdminReservationResponseDto>>.Ok(reservations);
        }

        // Admin: Update reservation status
        public async Task<Result> UpdateReservationStatus(int reservationId, ReservationStatus status)
        {
            var reservation = await _context.Reservations.FindAsync(reservationId);

            if (reservation == null)
                return Result.Fail("Reservation not found.");

            reservation.Status = status;

            await _context.SaveChangesAsync();

            return Result.Ok("Reservation status updated.");
        }
    }
}
