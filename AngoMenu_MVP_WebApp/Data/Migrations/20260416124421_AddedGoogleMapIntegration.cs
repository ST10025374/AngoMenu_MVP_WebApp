using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AngoMenu_MVP_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class AddedGoogleMapIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleMapsUrl",
                table: "Restaurants",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleMapsUrl",
                table: "Restaurants");
        }
    }
}
