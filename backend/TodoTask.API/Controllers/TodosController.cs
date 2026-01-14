using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoTask.Application.DTOs.Todo;
using TodoTask.Application.Services;

namespace TodoTask.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TodosController : ControllerBase
{
    private readonly ITodoService _todoService;
    private readonly ILogger<TodosController> _logger;

    public TodosController(ITodoService todoService, ILogger<TodosController> logger)
    {
        _todoService = todoService;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoDto>>> GetTodos()
    {
        try
        {
            var userId = GetUserId();
            var todos = await _todoService.GetUserTodosAsync(userId);
            return Ok(todos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving todos");
            return StatusCode(500, new { message = "An error occurred while retrieving todos" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TodoDto>> GetTodo(int id)
    {
        try
        {
            var userId = GetUserId();
            var todo = await _todoService.GetTodoByIdAsync(id, userId);
            if (todo == null)
            {
                return NotFound(new { message = "Todo not found" });
            }
            return Ok(todo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving todo");
            return StatusCode(500, new { message = "An error occurred while retrieving todo" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TodoDto>> CreateTodo([FromBody] CreateTodoRequest request)
    {
        try
        {
            var userId = GetUserId();
            var todo = await _todoService.CreateTodoAsync(request, userId);
            return CreatedAtAction(nameof(GetTodo), new { id = todo.Id }, todo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating todo");
            return StatusCode(500, new { message = "An error occurred while creating todo" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TodoDto>> UpdateTodo(int id, [FromBody] UpdateTodoRequest request)
    {
        try
        {
            var userId = GetUserId();
            var todo = await _todoService.UpdateTodoAsync(id, request, userId);
            return Ok(todo);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating todo");
            return StatusCode(500, new { message = "An error occurred while updating todo" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTodo(int id)
    {
        try
        {
            var userId = GetUserId();
            await _todoService.DeleteTodoAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting todo");
            return StatusCode(500, new { message = "An error occurred while deleting todo" });
        }
    }

    [HttpPost("{id}/toggle-complete")]
    public async Task<ActionResult<TodoDto>> ToggleComplete(int id)
    {
        try
        {
            var userId = GetUserId();
            var todo = await _todoService.ToggleCompleteAsync(id, userId);
            return Ok(todo);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling todo completion");
            return StatusCode(500, new { message = "An error occurred while toggling todo completion" });
        }
    }
}

