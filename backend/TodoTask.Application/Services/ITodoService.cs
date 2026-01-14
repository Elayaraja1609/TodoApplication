using TodoTask.Application.DTOs.Todo;

namespace TodoTask.Application.Services;

public interface ITodoService
{
    Task<IEnumerable<TodoDto>> GetUserTodosAsync(int userId);
    Task<TodoDto?> GetTodoByIdAsync(int id, int userId);
    Task<TodoDto> CreateTodoAsync(CreateTodoRequest request, int userId);
    Task<TodoDto> UpdateTodoAsync(int id, UpdateTodoRequest request, int userId);
    Task DeleteTodoAsync(int id, int userId);
    Task<TodoDto> ToggleCompleteAsync(int id, int userId);
}

