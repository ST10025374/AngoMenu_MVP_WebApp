using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.Common.Pagination;
using AngoMenu_MVP_WebApp.DTOs.Restaurant;

namespace AngoMenu_MVP_WebApp.Services.Interfaces
{
    public interface IRestaurantService
    {
        Task<Result<PagedResult<RestaurantResponseDto>>>
            GetRestaurants(PaginationParams paginationParams, string? search);

        Task<Result<RestaurantResponseDto>>
            GetRestaurantById(int id);

        Task<Result<RestaurantResponseDto>>
            GetManagerRestaurant(int managerUserId);

        Task<Result>
            CreateRestaurant(RestaurantCreateDto dto);

        Task<Result>
            UpdateRestaurant(int id, RestaurantUpdateDto dto);

        Task<Result>
            UpdateManagerRestaurant(int managerUserId, RestaurantUpdateDto dto);

        Task<Result>
            DeleteRestaurant(int id);
    }
}
