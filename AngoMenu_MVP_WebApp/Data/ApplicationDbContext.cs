using AngoMenu_MVP_WebApp.Models;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Index for restaurant capacity lookup
        modelBuilder.Entity<Reservation>()
            .HasIndex(r => new { r.RestaurantId, r.Date, r.Time });

        // Unique constraint to prevent user double booking
        modelBuilder.Entity<Reservation>()
            .HasIndex(r => new { r.UserId, r.Date, r.Time })
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

}
