using AngoMenu_MVP_WebApp.DTOs.Menu;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AngoMenu_MVP_WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        // ADMIN: Create menu item
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(MenuItemCreateDto dto)
        {
            var result = await _menuService.CreateMenuItem(dto);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }

        // PUBLIC: Get menu by restaurant
        [AllowAnonymous]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetByRestaurant(int restaurantId)
        {
            var result = await _menuService.GetMenuByRestaurant(restaurantId);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Data);
        }

        // ADMIN: Update menu item
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MenuItemCreateDto dto)
        {
            var result = await _menuService.UpdateMenuItem(id, dto);

            if (!result.Success)
                return NotFound(result.Message);

            return Ok(result.Message);
        }

        // ADMIN: Delete menu item
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _menuService.DeleteMenuItem(id);

            if (!result.Success)
                return NotFound(result.Message);

            return Ok(result.Message);
        }
    }
}
