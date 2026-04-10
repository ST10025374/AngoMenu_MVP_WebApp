using System.ComponentModel.DataAnnotations;

namespace AngoMenu_MVP_WebApp.DTOs.RestaurantImage
{
    public class RestaurantImageReorderRequestDto
    {
        [Required]
        public List<int> OrderedImageIds { get; set; } = new();
    }
}
