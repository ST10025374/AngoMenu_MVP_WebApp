using System.ComponentModel.DataAnnotations;

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
        public string Phone { get; set; } = string.Empty;

        [Required]
        public TimeOnly OpeningHour { get; set; }

        [Required]
        public TimeOnly ClosingHour { get; set; }

        public string? ImageUrl { get; set; }

        // Navigation
        public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
