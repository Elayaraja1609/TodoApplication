using Microsoft.EntityFrameworkCore;
using TodoTask.Application.DTOs.Todo;
using TodoTask.Core.Entities;
using TodoTask.Core.Interfaces;
using TodoTask.Infrastructure.Data;

namespace TodoTask.Application.Services;

public class TodoService : ITodoService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ApplicationDbContext _context;

    public TodoService(IUnitOfWork unitOfWork, ApplicationDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<IEnumerable<TodoDto>> GetUserTodosAsync(int userId)
    {
        var todos = await _context.Todos
            .Include(t => t.Category)
            .Include(t => t.SubTasks.Where(st => !st.IsDeleted))
            .Where(t => t.UserId == userId && !t.IsDeleted)
            .ToListAsync();
        
        var result = new List<TodoDto>();
        foreach (var todo in todos)
        {
            result.Add(await MapToDtoAsync(todo));
        }
        return result;
    }

    public async Task<TodoDto?> GetTodoByIdAsync(int id, int userId)
    {
        var todo = await _context.Todos
            .Include(t => t.Category)
            .Include(t => t.SubTasks.Where(st => !st.IsDeleted))
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId && !t.IsDeleted);
        return todo != null ? await MapToDtoAsync(todo) : null;
    }

    public async Task<TodoDto> CreateTodoAsync(CreateTodoRequest request, int userId)
    {
        var todo = new Todo
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            CategoryId = request.CategoryId,
            IsImportant = request.IsImportant,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            ExecutionTime = request.ExecutionTime,
            RecurrencePattern = request.RecurrencePattern,
            AudioUrl = request.AudioUrl,
            ImageUrl = request.ImageUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Calculate next occurrence if recurrence is set
        if (!string.IsNullOrEmpty(request.RecurrencePattern))
        {
            todo.NextOccurrence = CalculateNextOccurrence(request.RecurrencePattern, request.StartDate ?? DateTime.UtcNow);
        }

        await _unitOfWork.Todos.AddAsync(todo);
        await _unitOfWork.SaveChangesAsync();

        // Add subtasks if provided
        if (request.SubTasks != null && request.SubTasks.Any())
        {
            foreach (var subTaskRequest in request.SubTasks)
            {
                var subTask = new SubTask
                {
                    TodoId = todo.Id,
                    Title = subTaskRequest.Title,
                    Order = subTaskRequest.Order,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.SubTasks.AddAsync(subTask);
            }
            await _unitOfWork.SaveChangesAsync();
        }

        var createdTodo = await _unitOfWork.Todos.GetByIdAsync(todo.Id);
        return await MapToDtoAsync(createdTodo!);
    }

    public async Task<TodoDto> UpdateTodoAsync(int id, UpdateTodoRequest request, int userId)
    {
        var todos = await _unitOfWork.Todos.FindAsync(t => t.Id == id && t.UserId == userId && !t.IsDeleted);
        var todo = todos.FirstOrDefault() ?? throw new KeyNotFoundException("Todo not found");

        if (request.Title != null) todo.Title = request.Title;
        if (request.Description != null) todo.Description = request.Description;
        if (request.CategoryId.HasValue) todo.CategoryId = request.CategoryId;
        if (request.IsCompleted.HasValue) todo.IsCompleted = request.IsCompleted.Value;
        if (request.IsImportant.HasValue) todo.IsImportant = request.IsImportant.Value;
        if (request.StartDate.HasValue) todo.StartDate = request.StartDate;
        if (request.DueDate.HasValue) todo.DueDate = request.DueDate;
        if (request.ExecutionTime.HasValue) todo.ExecutionTime = request.ExecutionTime;
        if (request.RecurrencePattern != null) todo.RecurrencePattern = request.RecurrencePattern;
        if (request.AudioUrl != null) todo.AudioUrl = request.AudioUrl;
        if (request.ImageUrl != null) todo.ImageUrl = request.ImageUrl;

        todo.UpdatedAt = DateTime.UtcNow;

        // Recalculate next occurrence if recurrence changed
        if (request.RecurrencePattern != null && !string.IsNullOrEmpty(todo.RecurrencePattern))
        {
            todo.NextOccurrence = CalculateNextOccurrence(todo.RecurrencePattern, todo.StartDate ?? DateTime.UtcNow);
        }

        // Update subtasks if provided
        if (request.SubTasks != null)
        {
            // Delete existing subtasks
            var existingSubTasks = await _unitOfWork.SubTasks.FindAsync(st => st.TodoId == todo.Id && !st.IsDeleted);
            foreach (var subTask in existingSubTasks)
            {
                subTask.IsDeleted = true;
                subTask.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.SubTasks.UpdateAsync(subTask);
            }

            // Add new subtasks
            foreach (var subTaskRequest in request.SubTasks)
            {
                var subTask = new SubTask
                {
                    TodoId = todo.Id,
                    Title = subTaskRequest.Title,
                    Order = subTaskRequest.Order,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.SubTasks.AddAsync(subTask);
            }
        }

        await _unitOfWork.Todos.UpdateAsync(todo);
        await _unitOfWork.SaveChangesAsync();

        var updatedTodo = await _unitOfWork.Todos.GetByIdAsync(todo.Id);
        return await MapToDtoAsync(updatedTodo!);
    }

    public async Task DeleteTodoAsync(int id, int userId)
    {
        var todos = await _unitOfWork.Todos.FindAsync(t => t.Id == id && t.UserId == userId && !t.IsDeleted);
        var todo = todos.FirstOrDefault() ?? throw new KeyNotFoundException("Todo not found");

        todo.IsDeleted = true;
        todo.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Todos.UpdateAsync(todo);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<TodoDto> ToggleCompleteAsync(int id, int userId)
    {
        var todos = await _unitOfWork.Todos.FindAsync(t => t.Id == id && t.UserId == userId && !t.IsDeleted);
        var todo = todos.FirstOrDefault() ?? throw new KeyNotFoundException("Todo not found");

        todo.IsCompleted = !todo.IsCompleted;
        todo.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Todos.UpdateAsync(todo);
        await _unitOfWork.SaveChangesAsync();

        var updatedTodo = await _unitOfWork.Todos.GetByIdAsync(todo.Id);
        return await MapToDtoAsync(updatedTodo!);
    }

    private async Task<TodoDto> MapToDtoAsync(Todo todo)
    {
        // Load subtasks explicitly
        var subTasks = await _unitOfWork.SubTasks.FindAsync(st => st.TodoId == todo.Id && !st.IsDeleted);
        
        return new TodoDto
        {
            Id = todo.Id,
            Title = todo.Title,
            Description = todo.Description,
            CategoryId = todo.CategoryId,
            CategoryName = todo.Category?.Name,
            IsCompleted = todo.IsCompleted,
            IsImportant = todo.IsImportant,
            StartDate = todo.StartDate,
            DueDate = todo.DueDate,
            ExecutionTime = todo.ExecutionTime,
            RecurrencePattern = todo.RecurrencePattern,
            NextOccurrence = todo.NextOccurrence,
            AudioUrl = todo.AudioUrl,
            ImageUrl = todo.ImageUrl,
            SubTasks = subTasks.Select(st => new SubTaskDto
            {
                Id = st.Id,
                Title = st.Title,
                IsCompleted = st.IsCompleted,
                Order = st.Order
            }).OrderBy(st => st.Order).ToList(),
            CreatedAt = todo.CreatedAt,
            UpdatedAt = todo.UpdatedAt
        };
    }

    private TodoDto MapToDto(Todo todo)
    {
        return new TodoDto
        {
            Id = todo.Id,
            Title = todo.Title,
            Description = todo.Description,
            CategoryId = todo.CategoryId,
            CategoryName = todo.Category?.Name,
            IsCompleted = todo.IsCompleted,
            IsImportant = todo.IsImportant,
            StartDate = todo.StartDate,
            DueDate = todo.DueDate,
            ExecutionTime = todo.ExecutionTime,
            RecurrencePattern = todo.RecurrencePattern,
            NextOccurrence = todo.NextOccurrence,
            AudioUrl = todo.AudioUrl,
            ImageUrl = todo.ImageUrl,
            SubTasks = todo.SubTasks?.Where(st => !st.IsDeleted).Select(st => new SubTaskDto
            {
                Id = st.Id,
                Title = st.Title,
                IsCompleted = st.IsCompleted,
                Order = st.Order
            }).OrderBy(st => st.Order).ToList() ?? new List<SubTaskDto>(),
            CreatedAt = todo.CreatedAt,
            UpdatedAt = todo.UpdatedAt
        };
    }

    private DateTime? CalculateNextOccurrence(string pattern, DateTime startDate)
    {
        return pattern.ToLower() switch
        {
            "daily" => startDate.AddDays(1),
            "weekly" => startDate.AddDays(7),
            "monthly" => startDate.AddMonths(1),
            _ => null
        };
    }
}

