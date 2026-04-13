using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs.Menu;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using AngoMenu_MVP_WebApp.Models.Enums;

namespace AngoMenu_MVP_WebApp.Services.Implementations
{
    public class MenuService : IMenuService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;

        public MenuService(ApplicationDbContext context, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result> CreateMenuItem(MenuItemCreateDto dto)
        {
            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == dto.RestaurantId);

            if (restaurant == null)
                return Result.Fail("Restaurant does not exist.");

            var menuItem = new MenuItem
            {                
                RestaurantId = dto.RestaurantId
            };

            ApplyMenuItemChanges(menuItem, dto.Name, dto.Price, dto.Description, dto.Category);

            if (dto.Image is not null && dto.Image.Length > 0)
            {
                var uploadResult = await _cloudinaryService.UploadMenuItemImage(dto.Image);
                if (uploadResult.Error is not null)
                {
                    return Result.Fail(uploadResult.Error.Message);
                }

                menuItem.ImageUrl = uploadResult.SecureUrl.ToString();
                menuItem.PublicId = uploadResult.PublicId;
            }

            _context.MenuItems.Add(menuItem);
            await _context.SaveChangesAsync();

            return Result.Ok("Menu item created successfully.");
        }

        public async Task<Result> CreateManagerMenuItem(int managerUserId, MenuItemUpdateDto dto)
        {
            var restaurantId = await _context.Restaurants
                .Where(r => r.ManagerId == managerUserId)
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            if (restaurantId == 0)
            {
                return Result.Fail("Restaurant not found for manager.");
            }

            return await CreateMenuItem(new MenuItemCreateDto
            {
                RestaurantId = restaurantId,
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description,
                Category = dto.Category,
                Image = dto.Image
            });
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
                    Description = m.Description ?? string.Empty,
                    Category = m.Category,
                    ImageUrl = m.ImageUrl
                })
                .ToListAsync();

            return Result<List<MenuItemResponseDto>>.Ok(items);
        }

        public async Task<Result<List<MenuItemResponseDto>>> GetManagerMenu(int managerUserId)
        {
            var restaurantId = await _context.Restaurants
                .Where(r => r.ManagerId == managerUserId)
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            if (restaurantId == 0)
            {
                return Result<List<MenuItemResponseDto>>.Fail("Restaurant not found for manager.");
            }

            return await GetMenuByRestaurant(restaurantId);
        }

        public async Task<Result> UpdateMenuItem(int id, MenuItemUpdateDto dto)
        {
            var menuItem = await _context.MenuItems.FindAsync(id);

            if (menuItem == null)
                return Result.Fail("Menu item not found.");

            ApplyMenuItemChanges(menuItem, dto.Name, dto.Price, dto.Description, dto.Category);

            if (dto.RemoveImage && dto.Image is null)
            {
                await RemoveMenuItemImage(menuItem);
            }

            if (dto.Image is not null && dto.Image.Length > 0)
            {
                await RemoveMenuItemImage(menuItem);

                var uploadResult = await _cloudinaryService.UploadMenuItemImage(dto.Image);
                if (uploadResult.Error is not null)
                {
                    return Result.Fail(uploadResult.Error.Message);
                }

                menuItem.ImageUrl = uploadResult.SecureUrl.ToString();
                menuItem.PublicId = uploadResult.PublicId;
            }

            await _context.SaveChangesAsync();

            return Result.Ok("Menu item updated successfully.");
        }

        public async Task<Result> UpdateManagerMenuItem(int managerUserId, int id, MenuItemUpdateDto dto)
        {
            var menuItem = await _context.MenuItems
                .Include(m => m.Restaurant)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (menuItem == null)
                return Result.Fail("Menu item not found.");

            if (menuItem.Restaurant.ManagerId != managerUserId)
            {
                return Result.Fail("Not authorized to update this menu item.");
            }

            ApplyMenuItemChanges(menuItem, dto.Name, dto.Price, dto.Description, dto.Category);

            if (dto.RemoveImage && dto.Image is null)
            {
                await RemoveMenuItemImage(menuItem);
            }

            if (dto.Image is not null && dto.Image.Length > 0)
            {
                await RemoveMenuItemImage(menuItem);

                var uploadResult = await _cloudinaryService.UploadMenuItemImage(dto.Image);
                if (uploadResult.Error is not null)
                {
                    return Result.Fail(uploadResult.Error.Message);
                }

                menuItem.ImageUrl = uploadResult.SecureUrl.ToString();
                menuItem.PublicId = uploadResult.PublicId;
            }

            await _context.SaveChangesAsync();
            return Result.Ok("Menu item updated successfully.");
        }

        public async Task<Result> DeleteMenuItem(int id)
        {
            var menuItem = await _context.MenuItems.FindAsync(id);

            if (menuItem == null)
                return Result.Fail("Menu item not found.");

            if (!string.IsNullOrWhiteSpace(menuItem.PublicId))
            {
                await _cloudinaryService.DeleteImage(menuItem.PublicId);
            }

            _context.MenuItems.Remove(menuItem);
            await _context.SaveChangesAsync();

            return Result.Ok("Menu item deleted successfully.");
        }

        public async Task<Result> DeleteManagerMenuItem(int managerUserId, int id)
        {
            var menuItem = await _context.MenuItems
                .Include(m => m.Restaurant)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (menuItem == null)
                return Result.Fail("Menu item not found.");

            if (menuItem.Restaurant.ManagerId != managerUserId)
            {
                return Result.Fail("Not authorized to delete this menu item.");
            }

            return await DeleteMenuItem(id);
        }

        private static void ApplyMenuItemChanges(MenuItem menuItem, string name, decimal price, string description, MenuCategory category)
        {
            menuItem.Name = name;
            menuItem.Price = price;
            menuItem.Description = description;
            menuItem.Category = category;
        }

        private async Task RemoveMenuItemImage(MenuItem menuItem)
        {
            if (!string.IsNullOrWhiteSpace(menuItem.PublicId))
            {
                await _cloudinaryService.DeleteImage(menuItem.PublicId);
            }

            menuItem.ImageUrl = null;
            menuItem.PublicId = null;
        }
    }
}
