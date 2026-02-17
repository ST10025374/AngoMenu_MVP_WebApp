using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs.Menu;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngoMenu_MVP_WebApp.Services.Implementations
{
    public class MenuService : IMenuService
    {
        private readonly ApplicationDbContext _context;

        public MenuService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Create a new menu item for a restaurant
        public async Task<Result> CreateMenuItem(MenuItemCreateDto dto)
        {
            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId);

            if (restaurant == null)
                return Result.Fail("Restaurant does not exist.");

            var menuItem = new MenuItem
            {
                RestaurantId = dto.RestaurantId,
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description
            };

            _context.MenuItems.Add(menuItem);
            await _context.SaveChangesAsync();

            return Result.Ok("Menu item created successfully.");
        }

        public async Task<Result<List<MenuItemResponseDto>>> GetMenuByRestaurant(int restaurantId)
        {
            var exists = await _context.Restaurants
                .AnyAsync(r => r.Id == restaurantId);

            if (!exists)
                return Result<List<MenuItemResponseDto>>.Fail("Restaurant does not exist.");

            var items = await _context.MenuItems
                .Where(m => m.RestaurantId == restaurantId)
                .Select(m => new MenuItemResponseDto
                {
                    Id = m.Id,
                    RestaurantId = m.RestaurantId,
                    Name = m.Name,
                    Price = m.Price,
                    Description = m.Description
                })
                .ToListAsync();

            return Result<List<MenuItemResponseDto>>.Ok(items);
        }

        public async Task<Result> UpdateMenuItem(int id, MenuItemCreateDto dto)
        {
            var menuItem = await _context.MenuItems.FindAsync(id);

            if (menuItem == null)
                return Result.Fail("Menu item not found.");

            menuItem.Name = dto.Name;
            menuItem.Price = dto.Price;
            menuItem.Description = dto.Description;

            await _context.SaveChangesAsync();

            return Result.Ok("Menu item updated successfully.");
        }

        public async Task<Result> DeleteMenuItem(int id)
        {
            var menuItem = await _context.MenuItems.FindAsync(id);

            if (menuItem == null)
                return Result.Fail("Menu item not found.");

            _context.MenuItems.Remove(menuItem);
            await _context.SaveChangesAsync();

            return Result.Ok("Menu item deleted successfully.");
        }
    }
}
