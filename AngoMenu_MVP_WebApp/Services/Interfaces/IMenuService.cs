using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs.Menu;

namespace AngoMenu_MVP_WebApp.Services.Interfaces
{
    public interface IMenuService
    {
        Task<Result> CreateMenuItem(MenuItemCreateDto dto);
        Task<Result<List<MenuItemResponseDto>>> GetMenuByRestaurant(int restaurantId);
        Task<Result> UpdateMenuItem(int id, MenuItemCreateDto dto);
        Task<Result> DeleteMenuItem(int id);
    }
}
