namespace TodoTask.Core.Entities;

public class Reminder
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? TodoId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime ReminderTime { get; set; }
    public bool IsCompleted { get; set; } = false;
    public bool IsSnoozed { get; set; } = false;
    public DateTime? SnoozeUntil { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? NextReminderTime { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Todo? Todo { get; set; }
}

