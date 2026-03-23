using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AngoMenu_MVP_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class ThirdroleManagerAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Restaurants",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ManagerId",
                table: "Restaurants",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Municipality",
                table: "Restaurants",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Neighborhood",
                table: "Restaurants",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "Restaurants",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StreetName",
                table: "Restaurants",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_ManagerId",
                table: "Restaurants",
                column: "ManagerId",
                unique: true,
                filter: "[ManagerId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Restaurants_Users_ManagerId",
                table: "Restaurants",
                column: "ManagerId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Restaurants_Users_ManagerId",
                table: "Restaurants");

            migrationBuilder.DropIndex(
                name: "IX_Restaurants_ManagerId",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "ManagerId",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Municipality",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Neighborhood",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "StreetName",
                table: "Restaurants");
        }
    }
}
