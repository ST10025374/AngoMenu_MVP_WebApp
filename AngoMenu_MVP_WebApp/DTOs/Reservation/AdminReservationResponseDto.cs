namespace AngoMenu_MVP_WebApp.DTOs.Reservation
{
    public class AdminReservationResponseDto
    {
        public int Id { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string Restaurant { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public TimeOnly Time { get; set; }
        public int NumberOfPeople { get; set; }
        public string Status { get; set; } = string.Empty;
    }

}
