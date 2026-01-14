using Microsoft.EntityFrameworkCore;
using TodoTask.Core.Entities;
using TodoTask.Infrastructure.Services;

namespace TodoTask.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordService passwordService)
    {
        // Check if data already exists
        if (await context.Users.AnyAsync())
        {
            return; // Data already seeded
        }

        // Create sample user
        var passwordHash = passwordService.HashPassword("Sample123!");
        var user = new User
        {
            Email = "sample@example.com",
            PasswordHash = passwordHash,
            FirstName = "John",
            LastName = "Doe",
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Create sample categories
        var categories = new List<Category>
        {
            new Category
            {
                UserId = user.Id,
                Name = "WORK",
                Color = "#ec4899",
                Icon = "briefcase",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                UserId = user.Id,
                Name = "HOME",
                Color = "#8b5cf6",
                Icon = "home",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                UserId = user.Id,
                Name = "PURCHASES",
                Color = "#f59e0b",
                Icon = "cart",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                UserId = user.Id,
                Name = "OTHER",
                Color = "#f97316",
                Icon = "help-circle",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.Categories.AddRange(categories);
        await context.SaveChangesAsync();

        // Sample audio URL (placeholder - in production this would be a real file URL)
        var sampleAudioUrl = "file:///sample-audio-recording.m4a";
        var sampleImageUrl = "file:///sample-image.jpg";

        // Create sample todos with audio and image attachments
        var todos = new List<Todo>
        {
            new Todo
            {
                UserId = user.Id,
                CategoryId = categories[0].Id, // WORK
                Title = "Complete project documentation",
                Description = "Write comprehensive documentation for the Todo Task project",
                IsCompleted = false,
                IsImportant = true,
                StartDate = DateTime.UtcNow.Date,
                DueDate = DateTime.UtcNow.Date.AddDays(3),
                ExecutionTime = DateTime.UtcNow.Date.AddHours(14),
                AudioUrl = sampleAudioUrl,
                ImageUrl = sampleImageUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                SubTasks = new List<SubTask>
                {
                    new SubTask
                    {
                        Title = "Create API documentation",
                        IsCompleted = false,
                        Order = 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SubTask
                    {
                        Title = "Create frontend documentation",
                        IsCompleted = false,
                        Order = 1,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                }
            },
            new Todo
            {
                UserId = user.Id,
                CategoryId = categories[1].Id, // HOME
                Title = "Buy groceries",
                Description = "Weekly grocery shopping list",
                IsCompleted = false,
                IsImportant = false,
                StartDate = DateTime.UtcNow.Date,
                DueDate = DateTime.UtcNow.Date.AddDays(1),
                ExecutionTime = DateTime.UtcNow.Date.AddHours(10),
                ImageUrl = sampleImageUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                SubTasks = new List<SubTask>
                {
                    new SubTask
                    {
                        Title = "Milk",
                        IsCompleted = false,
                        Order = 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SubTask
                    {
                        Title = "Bread",
                        IsCompleted = false,
                        Order = 1,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SubTask
                    {
                        Title = "Eggs",
                        IsCompleted = true,
                        Order = 2,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                }
            },
            new Todo
            {
                UserId = user.Id,
                CategoryId = categories[2].Id, // PURCHASES
                Title = "Review monthly expenses",
                Description = "Analyze spending patterns and create budget report",
                IsCompleted = false,
                IsImportant = true,
                StartDate = DateTime.UtcNow.Date,
                DueDate = DateTime.UtcNow.Date.AddDays(7),
                AudioUrl = sampleAudioUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Todo
            {
                UserId = user.Id,
                CategoryId = categories[0].Id, // WORK
                Title = "Team meeting preparation",
                Description = "Prepare agenda and presentation slides",
                IsCompleted = true,
                IsImportant = false,
                StartDate = DateTime.UtcNow.Date.AddDays(-2),
                DueDate = DateTime.UtcNow.Date.AddDays(-1),
                ExecutionTime = DateTime.UtcNow.Date.AddDays(-1).AddHours(15),
                AudioUrl = sampleAudioUrl,
                ImageUrl = sampleImageUrl,
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        // Save todos first to get IDs
        // Save todos first (without subtasks in navigation property)
        var todosToSave = todos.Select(t => new Todo
        {
            UserId = t.UserId,
            CategoryId = t.CategoryId,
            Title = t.Title,
            Description = t.Description,
            IsCompleted = t.IsCompleted,
            IsImportant = t.IsImportant,
            StartDate = t.StartDate,
            DueDate = t.DueDate,
            ExecutionTime = t.ExecutionTime,
            AudioUrl = t.AudioUrl,
            ImageUrl = t.ImageUrl,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).ToList();

        context.Todos.AddRange(todosToSave);
        await context.SaveChangesAsync();

        // Now add subtasks with proper TodoId references
        var subtasksToAdd = new List<SubTask>();
        for (int i = 0; i < todos.Count; i++)
        {
            var originalTodo = todos[i];
            var savedTodo = todosToSave[i];
            
            if (originalTodo.SubTasks != null && originalTodo.SubTasks.Any())
            {
                foreach (var subTask in originalTodo.SubTasks)
                {
                    subtasksToAdd.Add(new SubTask
                    {
                        TodoId = savedTodo.Id,
                        Title = subTask.Title,
                        IsCompleted = subTask.IsCompleted,
                        Order = subTask.Order,
                        CreatedAt = subTask.CreatedAt,
                        UpdatedAt = subTask.UpdatedAt
                    });
                }
            }
        }

        if (subtasksToAdd.Any())
        {
            context.SubTasks.AddRange(subtasksToAdd);
            await context.SaveChangesAsync();
        }
    }
}

