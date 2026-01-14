using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoTask.Application.DTOs.Reminder;
using TodoTask.Application.Services;

namespace TodoTask.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class RemindersController : ControllerBase
{
    private readonly IReminderService _reminderService;
    private readonly ILogger<RemindersController> _logger;

    public RemindersController(IReminderService reminderService, ILogger<RemindersController> logger)
    {
        _reminderService = reminderService;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReminderDto>>> GetReminders()
    {
        try
        {
            var userId = GetUserId();
            var reminders = await _reminderService.GetUserRemindersAsync(userId);
            return Ok(reminders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reminders");
            return StatusCode(500, new { message = "An error occurred while retrieving reminders" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReminderDto>> GetReminder(int id)
    {
        try
        {
            var userId = GetUserId();
            var reminder = await _reminderService.GetReminderByIdAsync(id, userId);
            if (reminder == null)
            {
                return NotFound(new { message = "Reminder not found" });
            }
            return Ok(reminder);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reminder");
            return StatusCode(500, new { message = "An error occurred while retrieving reminder" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ReminderDto>> CreateReminder([FromBody] CreateReminderRequest request)
    {
        try
        {
            var userId = GetUserId();
            var reminder = await _reminderService.CreateReminderAsync(request, userId);
            return CreatedAtAction(nameof(GetReminder), new { id = reminder.Id }, reminder);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating reminder");
            return StatusCode(500, new { message = "An error occurred while creating reminder" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ReminderDto>> UpdateReminder(int id, [FromBody] UpdateReminderRequest request)
    {
        try
        {
            var userId = GetUserId();
            var reminder = await _reminderService.UpdateReminderAsync(id, request, userId);
            return Ok(reminder);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating reminder");
            return StatusCode(500, new { message = "An error occurred while updating reminder" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReminder(int id)
    {
        try
        {
            var userId = GetUserId();
            await _reminderService.DeleteReminderAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting reminder");
            return StatusCode(500, new { message = "An error occurred while deleting reminder" });
        }
    }
}

