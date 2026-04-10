using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.Common.Pagination;
using AngoMenu_MVP_WebApp.DTOs.Restaurant;
using AngoMenu_MVP_WebApp.DTOs.RestaurantImage;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Models.Enums;
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
            if (dto.Manager is not null)
            {
                var managerEmail = dto.Manager.Email.Trim().ToLowerInvariant();
                var emailExists = await _context.Users.AnyAsync(u => u.Email == managerEmail);

                if (emailExists)
                {
                    return Result.Fail("Email already exists.");
                }
            }

            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Description = dto.Description,
                Location = dto.Location,
                City = dto.City,
                Province = dto.Province,
                Municipality = dto.Municipality,
                Neighborhood = dto.Neighborhood,
                StreetName = dto.StreetName,
                Phone = dto.Phone,
                OpeningHour = dto.OpeningHour,
                ClosingHour = dto.ClosingHour,
            };

            if (dto.Manager is not null)
            {
                var managerUser = new User
                {
                    FirstName = dto.Manager.FirstName,
                    LastName = dto.Manager.LastName,
                    Email = dto.Manager.Email.Trim().ToLowerInvariant(),
                    PhoneNumber = "000000000",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Manager.Password),
                    Role = UserRole.Manager
                };

                _context.Users.Add(managerUser);
                await _context.SaveChangesAsync();

                restaurant.ManagerId = managerUser.Id;
            }

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            return Result.Ok("Restaurant created successfully.");
        }

        public async Task<Result> UpdateRestaurant(int id, RestaurantUpdateDto dto)
        {
            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Id == id);

            if (restaurant == null)
            {
                return Result.Fail("Restaurant not found.");
            }

            return await ApplyRestaurantUpdate(restaurant, dto);
        }

        public async Task<Result> UpdateManagerRestaurant(int managerUserId, RestaurantUpdateDto dto)
        {
            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.ManagerId == managerUserId);

            if (restaurant == null)
            {
                return Result.Fail("Restaurant not found for manager.");
            }

            return await ApplyRestaurantUpdate(restaurant, dto);
        }

        private async Task<Result> ApplyRestaurantUpdate(Restaurant restaurant, RestaurantUpdateDto dto)
        {
            restaurant.Name = dto.Name;
            restaurant.Description = dto.Description;
            restaurant.Location = dto.Location;
            restaurant.City = dto.City;
            restaurant.Province = dto.Province;
            restaurant.Municipality = dto.Municipality;
            restaurant.Neighborhood = dto.Neighborhood;
            restaurant.StreetName = dto.StreetName;
            restaurant.Phone = dto.Phone;
            restaurant.OpeningHour = dto.OpeningHour;
            restaurant.ClosingHour = dto.ClosingHour;
            
            await _context.SaveChangesAsync();

            return Result.Ok("Restaurant updated successfully.");
        }

        public async Task<Result> DeleteRestaurant(int id)
        {
            var restaurant = await _context.Restaurants
                .Include(r => r.RestaurantImages)
                .FirstOrDefaultAsync(r => r.Id == id);


            if (restaurant == null)
                return Result.Fail("Restaurant not found.");

            foreach (var image in restaurant.RestaurantImages)
            {
                if (!string.IsNullOrWhiteSpace(image.PublicId))
                {
                    await _cloudinaryService.DeleteImage(image.PublicId);
                }
            }

            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();

            return Result.Ok("Restaurant deleted successfully.");
        }

        public async Task<Result<RestaurantResponseDto>> GetRestaurantById(int id)
        {
            var restaurant = await _context.Restaurants
                .Include(r => r.Manager)
                .Include(r => r.RestaurantImages)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (restaurant == null)
                return Result<RestaurantResponseDto>.Fail("Restaurant not found.");

            return Result<RestaurantResponseDto>.Ok(MapRestaurantResponse(restaurant));
        }

        public async Task<Result<RestaurantResponseDto>> GetManagerRestaurant(int managerUserId)
        {
            var restaurant = await _context.Restaurants
                .Include(r => r.Manager)
                .Include(r => r.RestaurantImages)
                .FirstOrDefaultAsync(r => r.ManagerId == managerUserId);

            if (restaurant == null)
            {            
                return Result<RestaurantResponseDto>.Fail("Restaurant not found for manager.");
            }

            return Result<RestaurantResponseDto>.Ok(MapRestaurantResponse(restaurant));
        }

        public async Task<Result<PagedResult<RestaurantResponseDto>>>
            GetRestaurants(PaginationParams paginationParams, string? search)
        {
            var query = _context.Restaurants
                .Include(r => r.Manager)
                .Include(r => r.RestaurantImages)
                .AsQueryable();

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
                .ToListAsync();

            var pagedResult = new PagedResult<RestaurantResponseDto>
            {
                Items = items.Select(MapRestaurantResponse).ToList(),
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize
            };

            return Result<PagedResult<RestaurantResponseDto>>.Ok(pagedResult);
        }

        private static RestaurantResponseDto MapRestaurantResponse(Restaurant restaurant)
        {
            var orderedImages = restaurant.RestaurantImages
                .OrderBy(i => i.DisplayOrder)
                .ThenBy(i => i.Id)
                .ToList();

            var mainImage = orderedImages.FirstOrDefault(i => i.IsMain) ?? orderedImages.FirstOrDefault();
            var mainImageUrl = mainImage?.ImageUrl;

            return new RestaurantResponseDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                Location = restaurant.Location,
                City = restaurant.City,
                Province = restaurant.Province,
                Municipality = restaurant.Municipality,
                Neighborhood = restaurant.Neighborhood,
                StreetName = restaurant.StreetName,
                Phone = restaurant.Phone,
                OpeningHour = restaurant.OpeningHour,
                ClosingHour = restaurant.ClosingHour,
                MainImageUrl = mainImageUrl,
                Images = orderedImages.Select(i => new RestaurantImageResponseDto
                {
                    Id = i.Id,
                    RestaurantId = i.RestaurantId,
                    ImageUrl = i.ImageUrl,
                    PublicId = i.PublicId,
                    IsMain = i.IsMain,
                    DisplayOrder = i.DisplayOrder,
                    CreatedAt = i.CreatedAt,
                }).ToList(),
                ManagerId = restaurant.ManagerId,
                ManagerName = restaurant.Manager is null ? null : $"{restaurant.Manager.FirstName} {restaurant.Manager.LastName}",
                ManagerEmail = restaurant.Manager?.Email,
            };
        }
    }
}
