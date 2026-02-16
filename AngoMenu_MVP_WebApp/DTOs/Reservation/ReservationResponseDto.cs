namespace AngoMenu_MVP_WebApp.DTOs.Reservation
{
    public class ReservationResponseDto
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;

        public DateOnly Date { get; set; }
        public TimeOnly Time { get; set; }

        public int NumberOfPeople { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
