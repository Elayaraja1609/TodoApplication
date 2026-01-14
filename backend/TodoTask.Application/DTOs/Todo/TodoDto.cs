namespace TodoTask.Application.DTOs.Todo;

public class TodoDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsImportant { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ExecutionTime { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? NextOccurrence { get; set; }
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public List<SubTaskDto> SubTasks { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SubTaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int Order { get; set; }
}

public class CreateTodoRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public bool IsImportant { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ExecutionTime { get; set; }
    public string? RecurrencePattern { get; set; }
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public List<CreateSubTaskRequest>? SubTasks { get; set; }
}

public class CreateSubTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class UpdateTodoRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsCompleted { get; set; }
    public bool? IsImportant { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ExecutionTime { get; set; }
    public string? RecurrencePattern { get; set; }
    public string? AudioUrl { get; set; }
    public string? ImageUrl { get; set; }
    public List<CreateSubTaskRequest>? SubTasks { get; set; }
}

