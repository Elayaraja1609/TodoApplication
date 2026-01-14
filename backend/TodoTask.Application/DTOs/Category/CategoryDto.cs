namespace TodoTask.Application.DTOs.Category;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#6366f1";
    public string Icon { get; set; } = "home";
}

public class UpdateCategoryRequest
{
    public string? Name { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
}

