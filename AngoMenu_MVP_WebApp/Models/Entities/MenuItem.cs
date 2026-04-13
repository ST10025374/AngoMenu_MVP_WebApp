using System.ComponentModel.DataAnnotations;
using AngoMenu_MVP_WebApp.Models.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace AngoMenu_MVP_WebApp.Models
{
    public class MenuItem
    {
        public int Id { get; set; }

        [Required]
        public int RestaurantId { get; set; }

        [ForeignKey(nameof(RestaurantId))]
        public Restaurant Restaurant { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public string? Description { get; set; }

        [Required]
        public MenuCategory Category { get; set; } = MenuCategory.Other;

        [MaxLength(2048)]
        public string? ImageUrl { get; set; }

        [MaxLength(255)]
        public string? PublicId { get; set; }
    }
}
