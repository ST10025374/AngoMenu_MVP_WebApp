namespace AngoMenu_MVP_WebApp.DTOs.RestaurantImage
{
    public class RestaurantImageResponseDto
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? PublicId { get; set; }
        public bool IsMain { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
