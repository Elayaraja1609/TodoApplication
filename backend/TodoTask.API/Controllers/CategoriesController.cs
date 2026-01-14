using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoTask.Application.DTOs.Category;
using TodoTask.Application.Services;

namespace TodoTask.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        try
        {
            var userId = GetUserId();
            var categories = await _categoryService.GetUserCategoriesAsync(userId);
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, new { message = "An error occurred while retrieving categories" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        try
        {
            var userId = GetUserId();
            var category = await _categoryService.GetCategoryByIdAsync(id, userId);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }
            return Ok(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category");
            return StatusCode(500, new { message = "An error occurred while retrieving category" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        try
        {
            var userId = GetUserId();
            var category = await _categoryService.CreateCategoryAsync(request, userId);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, new { message = "An error occurred while creating category" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        try
        {
            var userId = GetUserId();
            var category = await _categoryService.UpdateCategoryAsync(id, request, userId);
            return Ok(category);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category");
            return StatusCode(500, new { message = "An error occurred while updating category" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            var userId = GetUserId();
            await _categoryService.DeleteCategoryAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category");
            return StatusCode(500, new { message = "An error occurred while deleting category" });
        }
    }
}

