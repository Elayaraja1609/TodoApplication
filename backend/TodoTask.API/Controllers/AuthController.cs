using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoTask.Application.DTOs.Auth;
using TodoTask.Application.Services;

namespace TodoTask.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, new { message = "An error occurred during registration" });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { message = "An error occurred during login" });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request.Token, request.RefreshToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return Unauthorized(new { message = "Invalid token" });
        }
    }

    [Authorize]
    [HttpPost("pin/setup")]
    public async Task<ActionResult> SetupPin([FromBody] SetupPinRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _authService.SetupPinAsync(userId, request);
            return Ok(new { message = "PIN setup successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during PIN setup");
            return StatusCode(500, new { message = "An error occurred during PIN setup" });
        }
    }

    [Authorize]
    [HttpPost("pin/verify")]
    public async Task<ActionResult<bool>> VerifyPin([FromBody] VerifyPinRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isValid = await _authService.VerifyPinAsync(userId, request);
            return Ok(new { isValid });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during PIN verification");
            return StatusCode(500, new { message = "An error occurred during PIN verification" });
        }
    }

    [Authorize]
    [HttpPost("pin/change")]
    public async Task<ActionResult> ChangePin([FromBody] ChangePinRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _authService.ChangePinAsync(userId, request);
            return Ok(new { message = "PIN changed successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during PIN change");
            return StatusCode(500, new { message = "An error occurred during PIN change" });
        }
    }

    [Authorize]
    [HttpGet("pin/has")]
    public async Task<ActionResult<bool>> HasPin()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var hasPin = await _authService.HasPinAsync(userId);
            return Ok(new { hasPin });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking PIN status");
            return StatusCode(500, new { message = "An error occurred checking PIN status" });
        }
    }
}

public class RefreshTokenRequest
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

