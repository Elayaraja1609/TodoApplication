namespace TodoTask.Application.DTOs.Reminder;

public class ReminderDto
{
    public int Id { get; set; }
    public int? TodoId { get; set; }
    public string? TodoTitle { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime ReminderTime { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsSnoozed { get; set; }
    public DateTime? SnoozeUntil { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? NextReminderTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateReminderRequest
{
    public int? TodoId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime ReminderTime { get; set; }
    public string? RecurrencePattern { get; set; }
}

public class UpdateReminderRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? ReminderTime { get; set; }
    public bool? IsCompleted { get; set; }
    public bool? IsSnoozed { get; set; }
    public DateTime? SnoozeUntil { get; set; }
    public string? RecurrencePattern { get; set; }
}

