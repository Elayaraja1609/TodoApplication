using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using TodoTask.Application.DTOs.Auth;
using TodoTask.Core.Entities;
using TodoTask.Core.Interfaces;
using TodoTask.Infrastructure.Services;
using System.Security.Claims;

namespace TodoTask.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly IPasswordService _passwordService;
    private readonly ICategoryService _categoryService;

    public AuthService(IUnitOfWork unitOfWork, IJwtService jwtService, IPasswordService passwordService, ICategoryService categoryService)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _passwordService = passwordService;
        _categoryService = categoryService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email && !u.IsDeleted);
        if (existingUser.Any())
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // Create new user
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordService.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Initialize default categories for new user
        await _categoryService.InitializeDefaultCategoriesAsync(user.Id);

        // Generate tokens
        var token = _jwtService.GenerateToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                HasPin = !string.IsNullOrEmpty(user.PinHash)
            }
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email && !u.IsDeleted);
        var user = users.FirstOrDefault();

        if (user == null || !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Track login information
        var isFirstLogin = user.FirstLoginAt == null;
        var now = DateTime.UtcNow;

        if (isFirstLogin)
        {
            // First time login
            user.FirstLoginAt = now;
            user.LastLoginAt = now;
            user.LoginCount = 1;
            
            // Initialize default categories for first-time login
            await _categoryService.InitializeDefaultCategoriesAsync(user.Id);
        }
        else
        {
            // Subsequent login
            user.LastLoginAt = now;
            user.LoginCount++;
        }

        user.UpdatedAt = now;
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Generate tokens
        var token = _jwtService.GenerateToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                HasPin = !string.IsNullOrEmpty(user.PinHash)
            }
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string token, string refreshToken)
    {
        var principal = _jwtService.GetPrincipalFromExpiredToken(token);
        if (principal == null)
        {
            throw new SecurityTokenException("Invalid token");
        }

        var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            throw new SecurityTokenException("Invalid token claims");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || user.IsDeleted)
        {
            throw new UnauthorizedAccessException("User not found");
        }

        var newToken = _jwtService.GenerateToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        return new AuthResponse
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                HasPin = !string.IsNullOrEmpty(user.PinHash)
            }
        };
    }

    public async Task SetupPinAsync(int userId, SetupPinRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Pin) || request.Pin.Length < 4)
        {
            throw new ArgumentException("PIN must be at least 4 digits");
        }

        if (request.Pin != request.ConfirmPin)
        {
            throw new ArgumentException("PIN and confirmation PIN do not match");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Hash the PIN using the same password hashing service
        user.PinHash = _passwordService.HashPassword(request.Pin);
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<bool> VerifyPinAsync(int userId, VerifyPinRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || user.IsDeleted || string.IsNullOrEmpty(user.PinHash))
        {
            return false;
        }

        return _passwordService.VerifyPassword(request.Pin, user.PinHash);
    }

    public async Task ChangePinAsync(int userId, ChangePinRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPin) || request.NewPin.Length < 4)
        {
            throw new ArgumentException("New PIN must be at least 4 digits");
        }

        if (request.NewPin != request.ConfirmPin)
        {
            throw new ArgumentException("New PIN and confirmation PIN do not match");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Verify current PIN
        if (string.IsNullOrEmpty(user.PinHash) || !_passwordService.VerifyPassword(request.CurrentPin, user.PinHash))
        {
            throw new UnauthorizedAccessException("Current PIN is incorrect");
        }

        // Update to new PIN
        user.PinHash = _passwordService.HashPassword(request.NewPin);
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<bool> HasPinAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        return user != null && !user.IsDeleted && !string.IsNullOrEmpty(user.PinHash);
    }
}

