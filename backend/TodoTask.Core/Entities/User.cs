namespace TodoTask.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FirstLoginAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int LoginCount { get; set; } = 0;
    public string? PinHash { get; set; } // Hashed PIN for app security
    public bool AutoTransferOverdueTasks { get; set; } = false; // Auto-transfer overdue tasks to today
    public string? DefaultTaskDate { get; set; } // "none", "today", "tomorrow" - Default date for new tasks
    public string? FirstDayOfWeek { get; set; } // "default", "monday", "sunday", "saturday" - First day of the week preference
    public bool EnableNotificationReminders { get; set; } = true; // Enable/disable push notification reminders
    public string? Theme { get; set; } // "default", "light", "dark" - Theme preference

    // Navigation properties
    public ICollection<Todo> Todos { get; set; } = new List<Todo>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
}
