using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoTask.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddThemeToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EnableNotificationReminders",
                table: "Users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Theme",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnableNotificationReminders",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Theme",
                table: "Users");
        }
    }
}
