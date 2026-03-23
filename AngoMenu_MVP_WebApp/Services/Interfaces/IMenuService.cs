using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs.Menu;

namespace AngoMenu_MVP_WebApp.Services.Interfaces
{
    public interface IMenuService
    {
        Task<Result> CreateMenuItem(MenuItemCreateDto dto);
        Task<Result<List<MenuItemResponseDto>>> GetMenuByRestaurant(int restaurantId);
        Task<Result<List<MenuItemResponseDto>>> GetManagerMenu(int managerUserId);
        Task<Result> UpdateMenuItem(int id, MenuItemCreateDto dto);
        Task<Result> UpdateMenuItem(int id, MenuItemUpdateDto dto);
        Task<Result> UpdateManagerMenuItem(int managerUserId, int id, MenuItemUpdateDto dto);
        Task<Result> DeleteMenuItem(int id);
        Task<Result> DeleteManagerMenuItem(int managerUserId, int id);
        Task<Result> CreateManagerMenuItem(int managerUserId, MenuItemUpdateDto dto);
    }
}
