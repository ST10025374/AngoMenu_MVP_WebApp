namespace AngoMenu_MVP_WebApp.DTOs.Restaurant
{
    public class RestaurantResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public TimeOnly OpeningHour { get; set; }
        public TimeOnly ClosingHour { get; set; }
        public string? ImageUrl { get; set; }
    }
}
