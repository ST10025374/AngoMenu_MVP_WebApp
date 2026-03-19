using AngoMenu_MVP_WebApp.Common.Pagination;
using AngoMenu_MVP_WebApp.DTOs.Restaurant;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngoMenu_MVP_WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantsController : ControllerBase
    {
        private readonly IRestaurantService _restaurantService;

        public RestaurantsController(IRestaurantService restaurantService)
        {
            _restaurantService = restaurantService;
        }

        // 🔹 GET: api/restaurants
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] PaginationParams paginationParams,
            [FromQuery] string? search)
        {
            var result = await _restaurantService
                .GetRestaurants(paginationParams, search);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Data);
        }

        // 🔹 GET: api/restaurants/{id}
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _restaurantService
                .GetRestaurantById(id);

            if (!result.Success)
                return NotFound(result.Message);

            return Ok(result.Data);
        }

        // 🔹 POST: api/restaurants
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] RestaurantCreateDto dto)
        {
            var result = await _restaurantService
                .CreateRestaurant(dto);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }

        // 🔹 PUT: api/restaurants/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] RestaurantUpdateDto dto)
        {
            var result = await _restaurantService
                .UpdateRestaurant(id, dto);

            if (!result.Success)
                return NotFound(result.Message);

            return Ok(result.Message);
        }

        // 🔹 DELETE: api/restaurants/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _restaurantService
                .DeleteRestaurant(id);

            if (!result.Success)
                return NotFound(result.Message);

            return Ok(result.Message);
        }
    }
}
