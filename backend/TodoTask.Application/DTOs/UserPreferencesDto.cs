namespace TodoTask.Application.DTOs;

public class UserPreferencesDto
{
    public bool AutoTransferOverdueTasks { get; set; }
    public string? DefaultTaskDate { get; set; } // "none", "today", "tomorrow"
    public string? FirstDayOfWeek { get; set; } // "default", "monday", "sunday", "saturday"
    public bool EnableNotificationReminders { get; set; } // Enable/disable push notification reminders
    public string? Theme { get; set; } // "default", "light", "dark"
}

public class UpdateUserPreferencesRequest
{
    public bool AutoTransferOverdueTasks { get; set; }
    public string? DefaultTaskDate { get; set; } // "none", "today", "tomorrow"
    public string? FirstDayOfWeek { get; set; } // "default", "monday", "sunday", "saturday"
    public bool EnableNotificationReminders { get; set; } // Enable/disable push notification reminders
    public string? Theme { get; set; } // "default", "light", "dark"
}

