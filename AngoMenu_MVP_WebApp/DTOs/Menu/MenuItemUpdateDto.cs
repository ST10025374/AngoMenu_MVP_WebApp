using AngoMenu_MVP_WebApp.Models.Enums;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace AngoMenu_MVP_WebApp.DTOs.Menu
{
    public class MenuItemUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 99999999)]
        public decimal Price { get; set; }

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public MenuCategory Category { get; set; } = MenuCategory.Other;

        public IFormFile? Image { get; set; }
        public bool RemoveImage { get; set; }
    }
}
