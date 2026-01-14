using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoTask.Application.DTOs;
using TodoTask.Application.Services;

namespace TodoTask.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class UserPreferencesController : ControllerBase
{
    private readonly IUserPreferencesService _userPreferencesService;
    private readonly ILogger<UserPreferencesController> _logger;

    public UserPreferencesController(IUserPreferencesService userPreferencesService, ILogger<UserPreferencesController> logger)
    {
        _userPreferencesService = userPreferencesService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<UserPreferencesDto>> GetUserPreferences()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var preferences = await _userPreferencesService.GetUserPreferencesAsync(userId);
            return Ok(preferences);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user preferences");
            return StatusCode(500, new { message = "An error occurred getting user preferences" });
        }
    }

    [HttpPut]
    public async Task<ActionResult<UserPreferencesDto>> UpdateUserPreferences([FromBody] UpdateUserPreferencesRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var preferences = await _userPreferencesService.UpdateUserPreferencesAsync(userId, request);
            return Ok(preferences);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user preferences");
            return StatusCode(500, new { message = "An error occurred updating user preferences" });
        }
    }
}

