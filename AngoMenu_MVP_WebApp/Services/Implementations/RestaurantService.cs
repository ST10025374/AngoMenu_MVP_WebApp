using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.Common.Pagination;
using AngoMenu_MVP_WebApp.DTOs.Restaurant;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Services.Cloudinary;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngoMenu_MVP_WebApp.Services.Implementations
{
    public class RestaurantService : IRestaurantService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;

        public RestaurantService(ApplicationDbContext context, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result> CreateRestaurant(RestaurantCreateDto dto)
        {
            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Description = dto.Description,
                Location = dto.Location,
                Phone = dto.Phone,
                OpeningHour = dto.OpeningHour,
                ClosingHour = dto.ClosingHour,
                ImageUrl = dto.ImageUrl ?? string.Empty,
                PublicId = string.Empty,
            };

            if (dto.Image != null)
            {
                var uploadResult = await _cloudinaryService.UploadRestaurantImage(dto.Image);

                if (uploadResult.Error != null)
                    return Result.Fail(uploadResult.Error.Message);

                restaurant.ImageUrl = uploadResult.SecureUrl.ToString();
                restaurant.PublicId = uploadResult.PublicId;
            }

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            return Result.Ok("Restaurant created successfully.");
        }

        public async Task<Result> UpdateRestaurant(int id, RestaurantUpdateDto dto)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
                return Result.Fail("Restaurant not found.");

            restaurant.Name = dto.Name;
            restaurant.Description = dto.Description;
            restaurant.Location = dto.Location;
            restaurant.Phone = dto.Phone;
            restaurant.OpeningHour = dto.OpeningHour;
            restaurant.ClosingHour = dto.ClosingHour;

            if (dto.Image != null)
            {
                if (!string.IsNullOrWhiteSpace(restaurant.PublicId))
                {
                    await _cloudinaryService.DeleteImage(restaurant.PublicId);
                }

                var uploadResult = await _cloudinaryService.UploadRestaurantImage(dto.Image);

                if (uploadResult.Error != null)
                    return Result.Fail(uploadResult.Error.Message);

                restaurant.ImageUrl = uploadResult.SecureUrl.ToString();
                restaurant.PublicId = uploadResult.PublicId;
            }

            await _context.SaveChangesAsync();

            return Result.Ok("Restaurant updated successfully.");
        }

        public async Task<Result> DeleteRestaurant(int id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
                return Result.Fail("Restaurant not found.");

            if (!string.IsNullOrWhiteSpace(restaurant.PublicId))
            {
                await _cloudinaryService.DeleteImage(restaurant.PublicId);
            }

            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();

            return Result.Ok("Restaurant deleted successfully.");
        }

        public async Task<Result<RestaurantResponseDto>> GetRestaurantById(int id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
                return Result<RestaurantResponseDto>.Fail("Restaurant not found.");

            var dto = new RestaurantResponseDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                Location = restaurant.Location,
                Phone = restaurant.Phone,
                OpeningHour = restaurant.OpeningHour,
                ClosingHour = restaurant.ClosingHour,
                ImageUrl = restaurant.ImageUrl
            };

            return Result<RestaurantResponseDto>.Ok(dto);
        }

        public async Task<Result<PagedResult<RestaurantResponseDto>>>
            GetRestaurants(PaginationParams paginationParams, string? search)
        {
            var query = _context.Restaurants.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(r =>
                    r.Name.Contains(search) ||
                    r.Location.Contains(search));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(r => r.Name)
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .Select(r => new RestaurantResponseDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Location = r.Location,
                    Phone = r.Phone,
                    OpeningHour = r.OpeningHour,
                    ClosingHour = r.ClosingHour,
                    ImageUrl = r.ImageUrl
                })
                .ToListAsync();

            var pagedResult = new PagedResult<RestaurantResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize
            };

            return Result<PagedResult<RestaurantResponseDto>>.Ok(pagedResult);
        }
    }
}
