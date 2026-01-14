namespace TodoTask.Core.Entities;

public class SubTask
{
    public int Id { get; set; }
    public int TodoId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public int Order { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Todo Todo { get; set; } = null!;
}

