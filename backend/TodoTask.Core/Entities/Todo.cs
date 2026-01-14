namespace TodoTask.Core.Entities;

public class Todo
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public bool IsCompleted { get; set; } = false;
    public bool IsImportant { get; set; } = false;
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ExecutionTime { get; set; }
    public string? RecurrencePattern { get; set; } // "daily", "weekly", "monthly", "custom"
    public DateTime? NextOccurrence { get; set; }
    public string? AudioUrl { get; set; } // URI or URL to audio file
    public string? ImageUrl { get; set; } // URI or URL to image file
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Category? Category { get; set; }
    public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
    public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
}

