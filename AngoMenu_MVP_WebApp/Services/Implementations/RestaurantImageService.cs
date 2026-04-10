using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs.RestaurantImage;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngoMenu_MVP_WebApp.Services.Implementations
{
    public class RestaurantImageService : IRestaurantImageService
    {
        private const int MaxImagesPerRestaurant = 5;

        private readonly ApplicationDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;

        public RestaurantImageService(ApplicationDbContext context, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result<List<RestaurantImageResponseDto>>> GetRestaurantImages(int restaurantId)
        {
            var restaurantExists = await _context.Restaurants.AnyAsync(r => r.Id == restaurantId);
            if (!restaurantExists)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("Restaurant not found.");
            }

            var images = await GetOrderedImages(restaurantId);
            return Result<List<RestaurantImageResponseDto>>.Ok(images.Select(Map).ToList());
        }

        public async Task<Result<List<RestaurantImageResponseDto>>> AddImage(int restaurantId, int requesterUserId, string requesterRole, RestaurantImageCreateDto dto)
        {
            var restaurant = await ValidateManagePermission(restaurantId, requesterUserId, requesterRole);
            if (restaurant is null)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("You are not authorized to manage images for this restaurant.");
            }

            if (dto.Image is null || dto.Image.Length == 0)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("Invalid image file.");
            }

            var images = await _context.RestaurantImages
                .Where(i => i.RestaurantId == restaurantId)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync();

            if (images.Count >= MaxImagesPerRestaurant)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail($"A restaurant can have up to {MaxImagesPerRestaurant} images.");
            }

            var uploadResult = await _cloudinaryService.UploadRestaurantImage(dto.Image);
            if (uploadResult.Error != null)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail(uploadResult.Error.Message);
            }

            var shouldBeMain = dto.IsMain || images.Count == 0;

            if (shouldBeMain)
            {
                foreach (var image in images)
                {
                    image.IsMain = false;
                }
            }

            var entity = new RestaurantImage
            {
                RestaurantId = restaurantId,
                ImageUrl = uploadResult.SecureUrl.ToString(),
                PublicId = uploadResult.PublicId,
                IsMain = shouldBeMain,
                DisplayOrder = images.Count,
                CreatedAt = DateTime.UtcNow
            };

            _context.RestaurantImages.Add(entity);
            await _context.SaveChangesAsync();

            await EnsureMainImageAndLegacyFields(restaurant);
            return await BuildResponse(restaurantId);
        }

        public async Task<Result<List<RestaurantImageResponseDto>>> DeleteImage(int restaurantId, int imageId, int requesterUserId, string requesterRole)
        {
            var restaurant = await ValidateManagePermission(restaurantId, requesterUserId, requesterRole);
            if (restaurant is null)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("You are not authorized to manage images for this restaurant.");
            }

            var image = await _context.RestaurantImages
                .FirstOrDefaultAsync(i => i.RestaurantId == restaurantId && i.Id == imageId);

            if (image is null)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("Image not found.");
            }

            if (!string.IsNullOrWhiteSpace(image.PublicId))
            {
                await _cloudinaryService.DeleteImage(image.PublicId);
            }

            _context.RestaurantImages.Remove(image);
            await _context.SaveChangesAsync();

            await NormalizeDisplayOrder(restaurantId);
            await EnsureMainImageAndLegacyFields(restaurant);

            return await BuildResponse(restaurantId);
        }

        public async Task<Result<List<RestaurantImageResponseDto>>> SetMainImage(int restaurantId, int imageId, int requesterUserId, string requesterRole)
        {
            var restaurant = await ValidateManagePermission(restaurantId, requesterUserId, requesterRole);
            if (restaurant is null)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("You are not authorized to manage images for this restaurant.");
            }

            var images = await _context.RestaurantImages
                .Where(i => i.RestaurantId == restaurantId)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync();

            var selected = images.FirstOrDefault(i => i.Id == imageId);
            if (selected is null)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("Image not found.");
            }

            foreach (var image in images)
            {
                image.IsMain = image.Id == imageId;
            }

            await _context.SaveChangesAsync();
            await EnsureMainImageAndLegacyFields(restaurant);

            return Result<List<RestaurantImageResponseDto>>.Ok(images.OrderBy(i => i.DisplayOrder).Select(Map).ToList());
        }

        public async Task<Result<List<RestaurantImageResponseDto>>> ReorderImages(int restaurantId, int requesterUserId, string requesterRole, RestaurantImageReorderRequestDto dto)
        {
            var restaurant = await ValidateManagePermission(restaurantId, requesterUserId, requesterRole);
            if (restaurant is null)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("You are not authorized to manage images for this restaurant.");
            }

            var images = await _context.RestaurantImages
                .Where(i => i.RestaurantId == restaurantId)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync();

            if (dto.OrderedImageIds.Count != images.Count)
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("Invalid reorder payload.");
            }

            var distinctIds = dto.OrderedImageIds.Distinct().ToList();
            if (distinctIds.Count != images.Count || distinctIds.Except(images.Select(i => i.Id)).Any())
            {
                return Result<List<RestaurantImageResponseDto>>.Fail("Invalid reorder payload.");
            }

            for (var index = 0; index < dto.OrderedImageIds.Count; index++)
            {
                var image = images.First(i => i.Id == dto.OrderedImageIds[index]);
                image.DisplayOrder = index;
            }

            await _context.SaveChangesAsync();
            await EnsureMainImageAndLegacyFields(restaurant);

            var ordered = await GetOrderedImages(restaurantId);
            return Result<List<RestaurantImageResponseDto>>.Ok(ordered.Select(Map).ToList());
        }

        private async Task<Restaurant?> ValidateManagePermission(int restaurantId, int requesterUserId, string requesterRole)
        {
            if (requesterRole == "Admin")
            {
                return await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == restaurantId);
            }

            if (requesterRole == "Manager")
            {
                return await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == restaurantId && r.ManagerId == requesterUserId);
            }

            return null;
        }

        private async Task EnsureMainImageAndLegacyFields(Restaurant restaurant)
        {
            var images = await _context.RestaurantImages
                .Where(i => i.RestaurantId == restaurant.Id)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync();

            if (images.Count > 0)
            {
                if (images.All(i => !i.IsMain))
                {
                    images[0].IsMain = true;
                }

                if (images.Count(i => i.IsMain) > 1)
                {
                    var firstMain = images.First(i => i.IsMain);
                    foreach (var image in images.Where(i => i.Id != firstMain.Id))
                    {
                        image.IsMain = false;
                    }
                }

                var main = images.First(i => i.IsMain);
                restaurant.ImageUrl = main.ImageUrl;
                restaurant.PublicId = main.PublicId ?? string.Empty;
            }
            else
            {
                restaurant.ImageUrl = string.Empty;
                restaurant.PublicId = string.Empty;
            }

            await _context.SaveChangesAsync();
        }

        private async Task NormalizeDisplayOrder(int restaurantId)
        {
            var images = await _context.RestaurantImages
                .Where(i => i.RestaurantId == restaurantId)
                .OrderBy(i => i.DisplayOrder)
                .ThenBy(i => i.Id)
                .ToListAsync();

            for (var index = 0; index < images.Count; index++)
            {
                images[index].DisplayOrder = index;
            }

            await _context.SaveChangesAsync();
        }

        private async Task<List<RestaurantImage>> GetOrderedImages(int restaurantId)
        {
            return await _context.RestaurantImages
                .Where(i => i.RestaurantId == restaurantId)
                .OrderBy(i => i.DisplayOrder)
                .ThenBy(i => i.Id)
                .ToListAsync();
        }

        private async Task<Result<List<RestaurantImageResponseDto>>> BuildResponse(int restaurantId)
        {
            var ordered = await GetOrderedImages(restaurantId);
            return Result<List<RestaurantImageResponseDto>>.Ok(ordered.Select(Map).ToList());
        }

        private static RestaurantImageResponseDto Map(RestaurantImage image)
        {
            return new RestaurantImageResponseDto
            {
                Id = image.Id,
                RestaurantId = image.RestaurantId,
                ImageUrl = image.ImageUrl,
                PublicId = image.PublicId,
                IsMain = image.IsMain,
                DisplayOrder = image.DisplayOrder,
                CreatedAt = image.CreatedAt
            };
        }
    }
}