namespace AngoMenu_MVP_WebApp.DTOs.Restaurant
{
    public class RestaurantResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Location { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public string Neighborhood { get; set; } = string.Empty;
        public string StreetName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public TimeOnly OpeningHour { get; set; }
        public TimeOnly ClosingHour { get; set; }
        public string? ImageUrl { get; set; }
        public int? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public string? ManagerEmail { get; set; }
    }
}
