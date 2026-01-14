using TodoTask.Application.DTOs.Category;
using TodoTask.Core.Entities;
using TodoTask.Core.Interfaces;

namespace TodoTask.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<CategoryDto>> GetUserCategoriesAsync(int userId)
    {
        var categories = await _unitOfWork.Categories.FindAsync(c => c.UserId == userId && !c.IsDeleted);
        return categories.Select(MapToDto);
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id, int userId)
    {
        var categories = await _unitOfWork.Categories.FindAsync(c => c.Id == id && c.UserId == userId && !c.IsDeleted);
        var category = categories.FirstOrDefault();
        return category != null ? MapToDto(category) : null;
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, int userId)
    {
        var category = new Category
        {
            UserId = userId,
            Name = request.Name,
            Color = request.Color,
            Icon = request.Icon,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        var createdCategory = await _unitOfWork.Categories.GetByIdAsync(category.Id);
        return MapToDto(createdCategory!);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryRequest request, int userId)
    {
        var categories = await _unitOfWork.Categories.FindAsync(c => c.Id == id && c.UserId == userId && !c.IsDeleted);
        var category = categories.FirstOrDefault() ?? throw new KeyNotFoundException("Category not found");

        if (request.Name != null) category.Name = request.Name;
        if (request.Color != null) category.Color = request.Color;
        if (request.Icon != null) category.Icon = request.Icon;

        category.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();

        var updatedCategory = await _unitOfWork.Categories.GetByIdAsync(category.Id);
        return MapToDto(updatedCategory!);
    }

    public async Task DeleteCategoryAsync(int id, int userId)
    {
        var categories = await _unitOfWork.Categories.FindAsync(c => c.Id == id && c.UserId == userId && !c.IsDeleted);
        var category = categories.FirstOrDefault() ?? throw new KeyNotFoundException("Category not found");

        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task InitializeDefaultCategoriesAsync(int userId)
    {
        // Check if user already has categories
        var existingCategories = await _unitOfWork.Categories.FindAsync(c => c.UserId == userId && !c.IsDeleted);
        if (existingCategories.Any())
        {
            return; // User already has categories, skip initialization
        }

        // Create default categories
        var defaultCategories = new List<Category>
        {
            new Category
            {
                UserId = userId,
                Name = "WORK",
                Color = "#ec4899",
                Icon = "briefcase",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                UserId = userId,
                Name = "HOME",
                Color = "#8b5cf6",
                Icon = "home",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                UserId = userId,
                Name = "PURCHASES",
                Color = "#f59e0b",
                Icon = "cart",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                UserId = userId,
                Name = "OTHER",
                Color = "#f97316",
                Icon = "help-circle",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        foreach (var category in defaultCategories)
        {
            await _unitOfWork.Categories.AddAsync(category);
        }
        await _unitOfWork.SaveChangesAsync();
    }

    private CategoryDto MapToDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Color = category.Color,
            Icon = category.Icon,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}

