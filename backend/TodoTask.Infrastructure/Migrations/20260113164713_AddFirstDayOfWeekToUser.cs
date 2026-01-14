using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoTask.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFirstDayOfWeekToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DefaultTaskDate",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "FirstDayOfWeek",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultTaskDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FirstDayOfWeek",
                table: "Users");
        }
    }
}
