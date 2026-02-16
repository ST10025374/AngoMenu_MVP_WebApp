using AngoMenu_MVP_WebApp.DTOs.Restaurant;
using AngoMenu_MVP_WebApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngoMenu_MVP_WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RestaurantsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/restaurants
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var restaurants = await _context.Restaurants
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

            return Ok(restaurants);
        }

        // GET: api/restaurants/{id}
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var restaurant = await _context.Restaurants
                .Where(r => r.Id == id)
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
                .FirstOrDefaultAsync();

            if (restaurant == null)
                return NotFound();

            return Ok(restaurant);
        }

        // POST: api/restaurants
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(RestaurantCreateDto dto)
        {
            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Description = dto.Description,
                Location = dto.Location,
                Phone = dto.Phone,
                OpeningHour = dto.OpeningHour,
                ClosingHour = dto.ClosingHour,
                ImageUrl = dto.ImageUrl
            };

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = restaurant.Id }, restaurant);
        }

        // PUT: api/restaurants/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, RestaurantUpdateDto dto)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
                return NotFound();

            restaurant.Name = dto.Name;
            restaurant.Description = dto.Description;
            restaurant.Location = dto.Location;
            restaurant.Phone = dto.Phone;
            restaurant.OpeningHour = dto.OpeningHour;
            restaurant.ClosingHour = dto.ClosingHour;
            restaurant.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/restaurants/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
                return NotFound();

            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
