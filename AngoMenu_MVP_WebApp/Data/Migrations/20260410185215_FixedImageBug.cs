using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AngoMenu_MVP_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class FixedImageBug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "Restaurants");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Restaurants",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                table: "Restaurants",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
