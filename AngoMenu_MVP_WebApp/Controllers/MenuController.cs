using AngoMenu_MVP_WebApp.DTOs.Menu;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [Authorize(Roles = "Manager")]
        [HttpPost("manager")]
        public async Task<IActionResult> CreateManagerMenuItem(MenuItemUpdateDto dto)
        {
            var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _menuService.CreateManagerMenuItem(managerId, dto);

            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result.Message);
        }

        [AllowAnonymous]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetByRestaurant(int restaurantId)
        {
            var result = await _menuService.GetMenuByRestaurant(restaurantId);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Data);
        }

        [Authorize(Roles = "Manager")]
        [HttpGet("manager")]
        public async Task<IActionResult> GetManagerMenu()
        {
            var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _menuService.GetManagerMenu(managerId);

            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result.Data);
        }

        // ADMIN: Update menu item
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MenuItemUpdateDto dto)
        {
            var result = await _menuService.UpdateMenuItem(id, dto);

            if (!result.Success)
                return NotFound(result.Message);

            return Ok(result.Message);
        }

        [Authorize(Roles = "Manager")]
        [HttpPut("manager/{id}")]
        public async Task<IActionResult> UpdateManagerMenuItem(int id, MenuItemUpdateDto dto)
        {
            var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _menuService.UpdateManagerMenuItem(managerId, id, dto);

            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

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

        [Authorize(Roles = "Manager")]
        [HttpDelete("manager/{id}")]
        public async Task<IActionResult> DeleteManagerMenuItem(int id)
        {
            var managerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _menuService.DeleteManagerMenuItem(managerId, id);

            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result.Message);
        }
    }
}
