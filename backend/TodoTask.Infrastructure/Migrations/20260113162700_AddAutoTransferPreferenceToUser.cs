using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoTask.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAutoTransferPreferenceToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutoTransferOverdueTasks",
                table: "Users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoTransferOverdueTasks",
                table: "Users");
        }
    }
}
