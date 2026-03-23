namespace AngoMenu_MVP_WebApp.DTOs.Menu
{
    public class MenuItemUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
