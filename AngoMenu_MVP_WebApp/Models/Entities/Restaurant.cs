using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AngoMenu_MVP_WebApp.Models
{
    public class Restaurant
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public string Location { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string Province { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string Municipality { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string Neighborhood { get; set; } = string.Empty;

        [Required]
        [MaxLength(180)]
        public string StreetName { get; set; } = string.Empty;

        [MaxLength(2048)]
        public string? GoogleMapsUrl { get; set; }

        [Required]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public TimeOnly OpeningHour { get; set; }

        [Required]
        public TimeOnly ClosingHour { get; set; }

        public int? ManagerId { get; set; }

        [ForeignKey(nameof(ManagerId))]
        public User? Manager { get; set; }

        // Navigation
        public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<RestaurantImage> RestaurantImages { get; set; } = new List<RestaurantImage>();
    }
}
