using AngoMenu_MVP_WebApp.DTOs.Reservation;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AngoMenu_MVP_WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReservationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // CLIENT: Create reservation
        [Authorize(Roles = "Client")]
        [HttpPost]
        public async Task<IActionResult> Create(ReservationCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (dto.Date < DateOnly.FromDateTime(DateTime.UtcNow))
                return BadRequest("Reservation date cannot be in the past.");

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId);

            if (restaurant == null)
                return BadRequest("Restaurant does not exist.");

            if (dto.Time < restaurant.OpeningHour || dto.Time > restaurant.ClosingHour)
                return BadRequest("Reservation time is outside restaurant opening hours.");

            var existingReservation = await _context.Reservations
                .AnyAsync(r =>
                    r.UserId == userId &&
                    r.Date == dto.Date &&
                    r.Time == dto.Time &&
                    r.Status != ReservationStatus.Cancelled);

            if (existingReservation)
                return BadRequest("You already have a reservation at this time.");

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

            return Ok("Reservation created successfully.");
        }

        [Authorize(Roles = "Client")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReservations()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

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

            return Ok(reservations);
        }

        [Authorize(Roles = "Client")]
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var reservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (reservation == null)
                return NotFound();

            reservation.Status = ReservationStatus.Cancelled;

            await _context.SaveChangesAsync();

            return Ok("Reservation cancelled.");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reservations = await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .Select(r => new
                {
                    r.Id,
                    UserEmail = r.User.Email,
                    Restaurant = r.Restaurant.Name,
                    r.Date,
                    r.Time,
                    r.NumberOfPeople,
                    Status = r.Status.ToString()
                })
                .ToListAsync();

            return Ok(reservations);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, ReservationUpdateStatusDto dto)
        {
            var reservation = await _context.Reservations.FindAsync(id);

            if (reservation == null)
                return NotFound();

            reservation.Status = dto.Status;

            await _context.SaveChangesAsync();

            return Ok("Reservation status updated.");
        }
    }
}

