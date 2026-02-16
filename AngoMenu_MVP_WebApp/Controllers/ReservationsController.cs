using AngoMenu_MVP_WebApp.DTOs.Reservation;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Models.Enums;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AngoMenu_MVP_WebApp.Common;


namespace AngoMenu_MVP_WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationsController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        // CLIENT: Create reservation
        [Authorize(Roles = "Client")]
        [HttpPost]
        public async Task<IActionResult> Create(ReservationCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _reservationService.CreateReservation(userId, dto);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }

        [Authorize(Roles = "Client")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReservations()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _reservationService.GetUserReservations(userId);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Data);
        }

        [Authorize(Roles = "Client")]
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _reservationService.CancelReservation(userId, id);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _reservationService.GetAllReservations();

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Data);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, ReservationUpdateStatusDto dto)
        {
            var result = await _reservationService.UpdateReservationStatus(id, dto.Status);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }
    }
}

