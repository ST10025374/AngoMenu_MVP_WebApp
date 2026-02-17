namespace AngoMenu_MVP_WebApp.DTOs.Menu
{
    public class MenuItemResponseDto
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
