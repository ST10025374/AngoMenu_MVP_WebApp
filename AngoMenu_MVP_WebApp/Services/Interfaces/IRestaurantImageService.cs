using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs.RestaurantImage;

namespace AngoMenu_MVP_WebApp.Services.Interfaces
{
    public interface IRestaurantImageService
    {
        Task<Result<List<RestaurantImageResponseDto>>> GetRestaurantImages(int restaurantId);
        Task<Result<List<RestaurantImageResponseDto>>> AddImage(int restaurantId, int requesterUserId, string requesterRole, RestaurantImageCreateDto dto);
        Task<Result<List<RestaurantImageResponseDto>>> DeleteImage(int restaurantId, int imageId, int requesterUserId, string requesterRole);
        Task<Result<List<RestaurantImageResponseDto>>> SetMainImage(int restaurantId, int imageId, int requesterUserId, string requesterRole);
        Task<Result<List<RestaurantImageResponseDto>>> ReorderImages(int restaurantId, int requesterUserId, string requesterRole, RestaurantImageReorderRequestDto dto);
    }
}
