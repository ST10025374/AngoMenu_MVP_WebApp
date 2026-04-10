using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace AngoMenu_MVP_WebApp.DTOs.RestaurantImage
{
    public class RestaurantImageCreateDto
    {
        [Required]
        public IFormFile Image { get; set; } = null!;
        public bool IsMain { get; set; }
    }
}
