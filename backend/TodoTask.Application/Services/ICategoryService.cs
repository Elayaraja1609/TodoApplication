using TodoTask.Application.DTOs.Category;

namespace TodoTask.Application.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetUserCategoriesAsync(int userId);
    Task<CategoryDto?> GetCategoryByIdAsync(int id, int userId);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, int userId);
    Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryRequest request, int userId);
    Task DeleteCategoryAsync(int id, int userId);
    Task InitializeDefaultCategoriesAsync(int userId);
}

