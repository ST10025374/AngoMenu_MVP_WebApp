using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace AngoMenu_MVP_WebApp.DTOs.Restaurant
{
    public class RestaurantCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string Location { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string Province { get; set; } = string.Empty;

        [Required]
        public string Municipality { get; set; } = string.Empty;

        [Required]
        public string Neighborhood { get; set; } = string.Empty;

        [Required]
        public string StreetName { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        public TimeOnly OpeningHour { get; set; }
        public TimeOnly ClosingHour { get; set; }
        public IFormFile? Image { get; set; }
        public string? ImageUrl { get; set; }
        public ManagerCreateDto? Manager { get; set; }
    }
}
