namespace AngoMenu_MVP_WebApp.DTOs.Reservation
{
    public class ReservationCreateDto
    {
        public int RestaurantId { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly Time { get; set; }
        public int NumberOfPeople { get; set; }
    }
}
