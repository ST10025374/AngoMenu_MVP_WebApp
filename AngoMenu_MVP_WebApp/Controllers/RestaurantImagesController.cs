using AngoMenu_MVP_WebApp.DTOs.RestaurantImage;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AngoMenu_MVP_WebApp.Controllers
{
    [ApiController]
    [Route("api/restaurants/{restaurantId:int}/images")]
    public class RestaurantImagesController : ControllerBase
    {
        private readonly IRestaurantImageService _restaurantImageService;

        public RestaurantImagesController(IRestaurantImageService restaurantImageService)
        {
            _restaurantImageService = restaurantImageService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetRestaurantImages(int restaurantId)
        {
            var result = await _restaurantImageService.GetRestaurantImages(restaurantId);
            if (!result.Success)
            {
                return NotFound(result.Message);
            }

            return Ok(result.Data);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> AddImage(int restaurantId, [FromForm] RestaurantImageCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            var result = await _restaurantImageService.AddImage(restaurantId, userId, role, dto);
            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result.Data);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int restaurantId, int imageId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            var result = await _restaurantImageService.DeleteImage(restaurantId, imageId, userId, role);
            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result.Data);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{imageId:int}/set-main")]
        public async Task<IActionResult> SetMainImage(int restaurantId, int imageId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            var result = await _restaurantImageService.SetMainImage(restaurantId, imageId, userId, role);
            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result.Data);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderImages(int restaurantId, [FromBody] RestaurantImageReorderRequestDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            var result = await _restaurantImageService.ReorderImages(restaurantId, userId, role, dto);
            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result.Data);
        }
    }
}
