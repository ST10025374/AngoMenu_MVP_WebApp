using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AngoMenu_MVP_WebApp.Models
{
    public class RestaurantImage
    {
        public int Id { get; set; }

        [Required]
        public int RestaurantId { get; set; }

        [Required]
        [MaxLength(2048)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? PublicId { get; set; }

        public bool IsMain { get; set; }

        public int DisplayOrder { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(RestaurantId))]
        public Restaurant Restaurant { get; set; } = null!;
    }
}
