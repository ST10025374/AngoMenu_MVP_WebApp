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
            // Normalize time (remove seconds)
            dto.Time = new TimeOnly(dto.Time.Hour, dto.Time.Minute);

            var reservationDateTime = dto.Date.ToDateTime(dto.Time);
            var now = DateTime.UtcNow;

            if (dto.NumberOfPeople <= 0)
                return Result.Fail("Number of people must be greater than zero.");

            if (dto.NumberOfPeople > 20)
                return Result.Fail("Reservation exceeds maximum allowed group size.");

            if (reservationDateTime <= now)
                return Result.Fail("Reservation date and time must be in the future.");

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId);

            if (restaurant == null)
                return Result.Fail("Restaurant does not exist.");

            if (dto.Time < restaurant.OpeningHour || dto.Time >= restaurant.ClosingHour)
                return Result.Fail("Reservation time is outside restaurant opening hours.");

            // Prevent user double booking
            var userConflict = await _context.Reservations
                .AnyAsync(r =>
                    r.UserId == userId &&
                    r.Date == dto.Date &&
                    r.Time == dto.Time &&
                    r.Status != ReservationStatus.Cancelled);

            if (userConflict)
                return Result.Fail("You already have a reservation at this time.");

            // Capacity validation
            var totalReserved = await _context.Reservations
                .Where(r =>
                    r.RestaurantId == dto.RestaurantId &&
                    r.Date == dto.Date &&
                    r.Time == dto.Time &&
                    r.Status != ReservationStatus.Cancelled)
                .SumAsync(r => (int?)r.NumberOfPeople) ?? 0;

            const int maxCapacity = 50;

            if (totalReserved + dto.NumberOfPeople > maxCapacity)
                return Result.Fail("Restaurant capacity exceeded for this time slot.");

            var reservation = new Reservation
            {
                UserId = userId,
                RestaurantId = dto.RestaurantId,
                Date = dto.Date,
                Time = dto.Time,
                NumberOfPeople = dto.NumberOfPeople,
                Status = ReservationStatus.Pending
            };

            try
            {
                _context.Reservations.Add(reservation);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Result.Fail("You already have a reservation at this time.");
            }

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

            if (reservation.Status == ReservationStatus.Cancelled)
                return Result.Fail("Reservation is already cancelled.");

            // Combine DateOnly + TimeOnly into DateTime (stored as local business time)
            var reservationDateTime = reservation.Date.ToDateTime(reservation.Time);

            // For MVP you used UTC elsewhere. If your business time is Angola (UTC+1),
            // you can use DateTime.UtcNow.AddHours(1) instead.
            var now = DateTime.UtcNow.AddHours(1);

            // Block cancellation if reservation is within 1 hour
            if (reservationDateTime <= now.AddHours(1))
                return Result.Fail("You cannot cancel less than 1 hour before the reservation time.");

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
